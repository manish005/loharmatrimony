import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase, ref, set, get, update, remove, onValue, query, push, orderByChild, equalTo, serverTimestamp, child, off } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Lohar Matrimony Firebase credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize & Export Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const database = getDatabase(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "asia-south1");

// Realtime Database helpers — re-exported for convenience
export const realtimeHelpers = { ref, set, get, update, remove, onValue, query, push, orderByChild, equalTo, serverTimestamp, child, off };

// Backward-compatible alias so existing imports of `db` still resolve
export const db = database;

if (typeof window !== "undefined") {
  (window as any).firebaseAuth = auth;
  (window as any).firebaseDatabase = database;
  (window as any).realtimeHelpers = realtimeHelpers;
}

export default app;
