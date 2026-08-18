# Onchain SMS deployment

No custom contract. Each message is one EVM transaction to the treasury. Firebase handles wallet auth and a verified search index.

## 1. Firebase

Create a project with:

- Authentication (custom tokens from Cloud Functions)
- Cloud Firestore
- Cloud Functions
- Firebase Hosting

```bash
npm install --global firebase-tools
firebase login
firebase use --add
```

## 2. Frontend env

Copy `.env.example` to `.env.local`. Add Firebase web config and the treasury address. Fee is `0.00025 ETH`.

## 3. Functions env

Copy `functions/.env.example` to `functions/.env.<firebase-project-id>`. Match treasury and fee with the frontend. Do not put a private key in either file.

Use provider RPCs in production instead of public endpoints.

## 4. Deploy

```bash
npm run build
firebase deploy --only functions,firestore,hosting
```

First deploy may ask you to enable Blaze billing for Cloud Functions.

## Security checks

- Backend reads the sender from the confirmed transaction.
- Firebase UID must match that sender.
- Tx must pay the treasury at or above the minimum fee.
- Message must be valid `onchain-sms:v1` calldata.
- Each tx hash indexes once.
- Browser clients cannot write Firestore message docs.
