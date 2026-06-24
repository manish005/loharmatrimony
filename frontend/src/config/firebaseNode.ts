// firebaseNode.ts - Node-compatible Firebase configuration for scripts
// Load environment variables from .env (if present)

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase, ref, set, get, update, remove, onValue, query, push, orderByChild, equalTo, serverTimestamp, child, off } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Firebase credentials – use process.env for Node environment
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const database = getDatabase(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "asia-south1");

// Realtime Database helpers
export const realtimeHelpers = { ref, set, get, update, remove, onValue, query, push, orderByChild, equalTo, serverTimestamp, child, off };

// Backward-compatible alias
export const db = database;

export default app;
