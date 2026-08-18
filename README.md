# Onchain SMS

Public wallet notes on Robinhood Chain and Base. Each send is one EVM transaction that:

1. pays a small ETH fee to the treasury; and
2. embeds the recipient and message in calldata.

Firebase authenticates wallets and indexes confirmed txs for inbox and sent views. The chain is the source of truth; Firebase is an index.

Messages are public. Do not post secrets or personal data.

## Architecture

- Wagmi connects MetaMask, Rabby, Robinhood Wallet, and WalletConnect wallets.
- A signed nonce proves ownership and becomes the Firebase Auth UID (lowercase address).
- The browser submits one tx with the `0.00025 ETH` fee and encoded message.
- A Cloud Function checks the receipt, sender, treasury, fee, chain, and payload.
- Firestore stores only verified txs and rejects hash reuse.
- Clients read Firestore; only Admin SDK Cloud Functions write index entries.

## Configuration

Copy `.env.example` to `.env.local` and set Firebase web config, Reown project ID, treasury, and fee:

```dotenv
VITE_REOWN_PROJECT_ID=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_TREASURY_ADDRESS=0x...
VITE_MESSAGE_FEE_ETH=0.00025
```

Copy `functions/.env.example` to `functions/.env.<firebase-project-id>`:

```dotenv
TREASURY_ADDRESS=0x...
MESSAGE_FEE_ETH_WEI=250000000000000
ROBINHOOD_RPC_URL=https://your-production-rpc
BASE_RPC_URL=https://your-production-rpc
```

Deploy:

```bash
npm run build
firebase deploy --only functions,firestore,hosting
```

## Development

```bash
npm install
npm install --prefix functions
npm run dev
```

| Network | Chain ID | Explorer |
| --- | ---: | --- |
| Robinhood Chain | 4663 | https://robinhoodchain.blockscout.com |
| Base | 8453 | https://base.blockscout.com |
