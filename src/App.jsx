import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithCustomToken, signOut } from "firebase/auth";
import { encodeAbiParameters, isAddress } from "viem";
import { useAccount, useChainId, useConnect, useDisconnect, usePublicClient, useSendTransaction, useSignMessage, useSwitchChain } from "wagmi";

import { Background } from "./components/Background";
import { Header } from "./components/Header";
import { InboxTab } from "./components/InboxTab";
import { NetworkSwitchModal } from "./components/NetworkSwitchModal";
import { SendMessageTab } from "./components/SendMessageTab";
import { SentTab } from "./components/SentTab";
import { SettingsModal } from "./components/SettingsModal";
import { TabNavigation } from "./components/TabNavigation";
import { Toast } from "./components/ToastNew";
import { TransactionPendingModal } from "./components/TransactionPendingModal";
import { callApi, firebaseAuth, isFirebaseConfigured, subscribeToMessages } from "./firebase";
import { MESSAGE_SCHEMA, ONCHAIN_MESSAGE_PARAMS, SUPPORTED_CHAINS } from "./onchainSms";

function App() {
  const { address = "", isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();
  const { signMessageAsync } = useSignMessage();
  const chain = SUPPORTED_CHAINS[chainId];

  const [message, setMessage] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [lookupAddress, setLookupAddress] = useState("");
  const [activeTab, setActiveTab] = useState("send");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showTxPending, setShowTxPending] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [inboxMessages, setInboxMessages] = useState([]);
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);
  useEffect(() => {
    if (!firebaseAuth) return undefined;
    return onAuthStateChanged(firebaseAuth, setAuthUser);
  }, []);
  useEffect(() => {
    if (address) setLookupAddress(address);
  }, [address]);

  const addToast = useCallback((type, title, toastMessage) => {
    if (!notifications) return;
    setToasts((current) => [...current, { id: `${Date.now()}-${Math.random()}`, type, title, message: toastMessage }]);
  }, [notifications]);

  const authenticateWallet = useCallback(async () => {
    if (!address) throw new Error("Connect a wallet first.");
    if (!isFirebaseConfigured || !firebaseAuth) throw new Error("Firebase is not configured.");
    if (firebaseAuth.currentUser?.uid === address.toLowerCase()) return;
    const { nonce, message: challenge } = await callApi("authChallenge", { address });
    const signature = await signMessageAsync({ message: challenge });
    const { token } = await callApi("authVerify", { address, nonce, signature });
    await signInWithCustomToken(firebaseAuth, token);
  }, [address, signMessageAsync]);

  useEffect(() => {
    if (!address || !isFirebaseConfigured) return;
    authenticateWallet().catch((error) => addToast("error", "Auth failed", error.message));
  }, [address, addToast, authenticateWallet]);

  useEffect(() => {
    if (!authUser || !lookupAddress || !isAddress(lookupAddress)) {
      setInboxMessages([]);
      return;
    }
    return subscribeToMessages("recipientAddress", lookupAddress, setInboxMessages, (error) => {
      addToast("error", "Inbox sync failed", error.message);
    });
  }, [authUser, lookupAddress, addToast]);

  useEffect(() => {
    if (!authUser || !address) {
      setSentMessages([]);
      return;
    }
    return subscribeToMessages("senderAddress", address, setSentMessages, (error) => {
      addToast("error", "Sent sync failed", error.message);
    });
  }, [authUser, address, addToast]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await authenticateWallet();
      addToast("success", "Synced", "Inbox and sent lists updated.");
    } catch (error) {
      addToast("error", "Sync failed", error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSendMessage = async (recipient, messageText) => {
    const treasuryAddress = import.meta.env.VITE_TREASURY_ADDRESS;
    if (!isConnected || !address) return addToast("warning", "Not connected", "Connect a wallet first.");
    if (!chain) return addToast("warning", "Unsupported network", "Switch to Robinhood Chain or Base.");
    if (!isAddress(treasuryAddress || "")) return addToast("error", "Treasury missing", "Set VITE_TREASURY_ADDRESS.");
    if (!isAddress(recipient)) return addToast("error", "Invalid address", "Enter a valid recipient.");
    if (!messageText.trim()) return addToast("warning", "Empty message", "Add message text first.");

    setIsSending(true);
    setShowTxPending(true);
    try {
      await authenticateWallet();
      const quote = await callApi("paymentQuote", { chainId });
      const messageData = encodeAbiParameters(ONCHAIN_MESSAGE_PARAMS, [MESSAGE_SCHEMA, recipient, messageText.trim()]);
      const hash = await sendTransactionAsync({ to: treasuryAddress, value: BigInt(quote.amount), data: messageData });
      await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
      await callApi("indexMessage", { txHash: hash, chainId, quoteId: quote.quoteId });
      addToast("success", "Message sent", `Stored on ${chain.name}.`);
      setMessage("");
      setRecipientAddress("");
      setActiveTab("sent");
    } catch (error) {
      addToast("error", "Transaction failed", error.shortMessage || error.message || "Wallet rejected or dropped the transaction.");
    } finally {
      setShowTxPending(false);
      setIsSending(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    if (firebaseAuth) signOut(firebaseAuth);
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <Background />
      <div className="relative z-10">
        <Header walletAddress={address} isConnected={isConnected} networkName={chain?.name || "Unsupported network"} walletConnectors={connectors} onConnect={(connector) => connect({ connector })} onDisconnect={handleDisconnect} darkMode={darkMode} onToggleDarkMode={() => setDarkMode((value) => !value)} onOpenSettings={() => setShowSettings(true)} />
        <div className="pt-16"><TabNavigation activeTab={activeTab} onTabChange={setActiveTab} unreadCount={0} sentCount={sentMessages.length} isMobile={isMobile} /></div>
        <main className={`${isMobile ? "pb-20" : "pb-8"} min-h-[calc(100vh-8rem)]`}>
          {activeTab === "send" && <SendMessageTab isConnected={isConnected} walletAddress={address} networkName={chain?.name} onConnect={() => connectors[0] && connect({ connector: connectors[0] })} onSendMessage={handleSendMessage} recipient={recipientAddress} setRecipient={setRecipientAddress} message={message} setMessage={setMessage} isSending={isSending} />}
          {activeTab === "inbox" && <InboxTab messages={inboxMessages} lookupAddress={lookupAddress} onLookupAddressChange={setLookupAddress} onRefresh={handleRefresh} onMarkAsRead={() => {}} isRefreshing={isRefreshing} />}
          {activeTab === "sent" && <SentTab messages={sentMessages} onRefresh={handleRefresh} isRefreshing={isRefreshing} explorerUrl={chain?.explorerUrl} />}
        </main>
      </div>
      <NetworkSwitchModal isOpen={isConnected && !chain} onSwitchNetwork={() => switchChainAsync({ chainId: 4663 })} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} darkMode={darkMode} onToggleDarkMode={() => setDarkMode((value) => !value)} notifications={notifications} onToggleNotifications={() => setNotifications((value) => !value)} networkName={chain?.name || "Robinhood Chain or Base"} />
      <TransactionPendingModal isOpen={showTxPending} />
      <Toast toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
    </div>
  );
}

export default App;
