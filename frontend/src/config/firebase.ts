import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, updateDoc, setDoc, getDoc, collection, query, where, getDocs, writeBatch, getCountFromServer, serverTimestamp, addDoc, deleteDoc, onSnapshot, orderBy, limit, increment, arrayUnion, arrayRemove } from "firebase/firestore";
import { getDatabase, ref, set, get, update, remove, onValue, query as rtdbQuery, push, orderByChild, equalTo, serverTimestamp as rtdbServerTimestamp, child, off } from "firebase/database";
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
export const db = getFirestore(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "asia-south1");

// Realtime Database helpers (for chat and other RTDB operations)
export const realtimeHelpers = { ref, set, get, update, remove, onValue, query: rtdbQuery, push, orderByChild, equalTo, serverTimestamp: rtdbServerTimestamp, child, off };

// Firestore helpers
const firestoreHelpers = { doc, updateDoc, setDoc, getDoc, collection, query, where, getDocs, writeBatch, getCountFromServer, serverTimestamp, addDoc, deleteDoc, onSnapshot, orderBy, limit, increment, arrayUnion, arrayRemove };

if (typeof window !== "undefined") {
  (window as any).firebaseAuth = auth;
  (window as any).firebaseDb = db;
  (window as any).firestoreHelpers = firestoreHelpers;
}

export { firestoreHelpers };
export default app;
