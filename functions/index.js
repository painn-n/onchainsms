import { randomBytes } from "node:crypto";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";
import { defineString } from "firebase-functions/params";
import { createPublicClient, decodeAbiParameters, http, isAddress, verifyMessage } from "viem";
import { base } from "viem/chains";
 
initializeApp();
const db = getFirestore();
const treasuryAddress = defineString("TREASURY_ADDRESS");
const messageFeeEthWei = defineString("MESSAGE_FEE_ETH_WEI", { default: "250000000000000" });
const robinhoodRpcUrl = defineString("ROBINHOOD_RPC_URL", { default: "https://rpc.mainnet.chain.robinhood.com" });
const baseRpcUrl = defineString("BASE_RPC_URL", { default: "https://mainnet.base.org" });
const MESSAGE_SCHEMA = "onchain-sms:v1";
const messageParams = [
  { name: "schema", type: "string" },
  { name: "recipient", type: "address" },
  { name: "message", type: "string" },
];
const robinhood = {
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.mainnet.chain.robinhood.com"] } },
};

function sendJson(response, status, body) {
  response.status(status).json(body);
}

function requirePost(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return false;
  }
  return true;
}

async function authenticatedWallet(request) {
  const authorization = request.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) throw new Error("Authentication required");
  const decoded = await getAuth().verifyIdToken(authorization.slice(7));
  return decoded.uid.toLowerCase();
}

export const authChallenge = onRequest(async (request, response) => {
  if (!requirePost(request, response)) return;
  const address = request.body?.address?.toLowerCase();
  if (!isAddress(address || "")) return sendJson(response, 400, { error: "Invalid wallet address" });
  const nonce = randomBytes(24).toString("hex");
  const message = `Sign in to Onchain SMS\n\nWallet: ${address}\nNonce: ${nonce}\n\nThis signature does not cost gas.`;
  await db.collection("authChallenges").doc(nonce).set({ address, message, expiresAt: Timestamp.fromMillis(Date.now() + 5 * 60_000) });
  sendJson(response, 200, { nonce, message });
});

export const authVerify = onRequest(async (request, response) => {
  if (!requirePost(request, response)) return;
  const address = request.body?.address?.toLowerCase();
  const { nonce, signature } = request.body || {};
  if (!isAddress(address || "") || !nonce || !signature) return sendJson(response, 400, { error: "Invalid verification request" });
  const challengeRef = db.collection("authChallenges").doc(nonce);
  const challenge = await challengeRef.get();
  if (!challenge.exists || challenge.data().address !== address || challenge.data().expiresAt.toMillis() < Date.now()) {
    return sendJson(response, 401, { error: "Challenge is invalid or expired" });
  }
  const valid = await verifyMessage({ address, message: challenge.data().message, signature });
  if (!valid) return sendJson(response, 401, { error: "Invalid wallet signature" });
  await challengeRef.delete();
  const token = await getAuth().createCustomToken(address, { walletAddress: address });
  sendJson(response, 200, { token });
});

export const paymentQuote = onRequest(async (request, response) => {
  if (!requirePost(request, response)) return;
  try {
    const chainId = Number(request.body?.chainId);
    if (request.body?.asset && request.body.asset !== "ETH") {
      throw new Error("Only ETH payments are supported");
    }
    if (![4663, 8453].includes(chainId)) throw new Error("Unsupported chain");
    const amount = BigInt(messageFeeEthWei.value());

    const quoteRef = db.collection("paymentQuotes").doc();
    const expiresAt = Timestamp.fromMillis(Date.now() + 5 * 60_000);
    await quoteRef.set({ chainId, asset: "ETH", amount: amount.toString(), expiresAt, used: false });
    sendJson(response, 200, { quoteId: quoteRef.id, chainId, asset: "ETH", amount: amount.toString(), expiresAt: expiresAt.toMillis() });
  } catch (error) {
    sendJson(response, 400, { error: error.message || "Unable to create payment quote" });
  }
});

export const indexMessage = onRequest(async (request, response) => {
  if (!requirePost(request, response)) return;
  try {
    const wallet = await authenticatedWallet(request);
    const { txHash, chainId, quoteId } = request.body || {};
    const numericChainId = Number(chainId);
    if (!/^0x[0-9a-fA-F]{64}$/.test(txHash || "")) return sendJson(response, 400, { error: "Invalid transaction hash" });
    if (![4663, 8453].includes(numericChainId)) return sendJson(response, 400, { error: "Unsupported chain" });
    if (!isAddress(treasuryAddress.value())) return sendJson(response, 500, { error: "Treasury is not configured" });
    const quoteRef = db.collection("paymentQuotes").doc(quoteId || "missing");
    const quoteSnapshot = await quoteRef.get();
    if (!quoteSnapshot.exists) throw new Error("Payment quote not found");
    const quote = quoteSnapshot.data();
    if (quote.used || quote.expiresAt.toMillis() < Date.now() || quote.chainId !== numericChainId) throw new Error("Payment quote is invalid or expired");

    const chain = numericChainId === 4663 ? robinhood : base;
    const rpcUrl = numericChainId === 4663 ? robinhoodRpcUrl.value() : baseRpcUrl.value();
    const client = createPublicClient({ chain, transport: http(rpcUrl) });
    const [transaction, receipt] = await Promise.all([
      client.getTransaction({ hash: txHash }),
      client.getTransactionReceipt({ hash: txHash }),
    ]);
    if (receipt.status !== "success") throw new Error("Transaction reverted");
    if (transaction.from.toLowerCase() !== wallet) throw new Error("Transaction sender does not match authenticated wallet");
    if (quote.asset !== "ETH") throw new Error("Only ETH payments are supported");
    if (transaction.to?.toLowerCase() !== treasuryAddress.value().toLowerCase()) throw new Error("Payment was not sent to the treasury");
    if (transaction.value < BigInt(quote.amount)) throw new Error("ETH payment is below 0.00025 ETH");

    const [schema, recipient, message] = decodeAbiParameters(messageParams, transaction.input);
    if (schema !== MESSAGE_SCHEMA || !isAddress(recipient) || !message.trim() || new TextEncoder().encode(message).length > 500) {
      throw new Error("Invalid onchain message payload");
    }

    const processedRef = db.collection("processedTransactions").doc(txHash.toLowerCase());
    const messageRef = db.collection("messages").doc(`${numericChainId}-${txHash.toLowerCase()}`);
    await db.runTransaction(async (batch) => {
      if ((await batch.get(processedRef)).exists) throw new Error("Transaction already indexed");
      batch.create(processedRef, { chainId: numericChainId, createdAt: FieldValue.serverTimestamp() });
      batch.update(quoteRef, { used: true, txHash });
      batch.create(messageRef, {
        senderAddress: wallet,
        recipientAddress: recipient.toLowerCase(),
        message,
        chainId: numericChainId,
        txHash,
        amountPaidWei: transaction.value.toString(),
        paymentAmount: quote.amount,
        blockNumber: transaction.blockNumber.toString(),
        timestamp: Math.floor(Date.now() / 1000),
        createdAt: FieldValue.serverTimestamp(),
      });
    });
    sendJson(response, 200, { id: messageRef.id });
  } catch (error) {
    sendJson(response, 400, { error: error.message || "Unable to index transaction" });
  }
});
