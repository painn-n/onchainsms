import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, getFirestore, onSnapshot, orderBy, query, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);
export const firebaseApp = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const firestore = firebaseApp ? getFirestore(firebaseApp) : null;

export function subscribeToMessages(field, walletAddress, onMessages, onError) {
  if (!firestore || !walletAddress) return () => {};
  const messagesQuery = query(
    collection(firestore, "messages"),
    where(field, "==", walletAddress.toLowerCase()),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    messagesQuery,
    (snapshot) => onMessages(snapshot.docs.map((document) => {
      const data = document.data();
      return {
        id: document.id,
        ...data,
        sender: data.senderAddress,
        recipient: data.recipientAddress,
      };
    })),
    onError
  );
}

export async function callApi(path, body = {}) {
  const token = firebaseAuth?.currentUser
    ? await firebaseAuth.currentUser.getIdToken()
    : null;
  const response = await fetch(`/api/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Request failed");
  return payload;
}
