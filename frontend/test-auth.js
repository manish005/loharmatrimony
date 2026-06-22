import fs from "fs";
import path from "path";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const envPath = path.join(process.cwd(), ".env.development");
const content = fs.readFileSync(envPath, "utf8");
const env = {};
for (const line of content.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx > 0) {
    const key = trimmed.substring(0, idx).trim();
    const val = trimmed.substring(idx + 1).trim();
    env[key] = val;
  }
}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const testPassword = "Test@123!!";
const testEmails = [
  "manishgadekar1111@gmail.com",
  "gadekarmanish62@gmail.com",
  "msgadekar284@gmail.com"
];

async function run() {
  for (const email of testEmails) {
    try {
      await signInWithEmailAndPassword(auth, email, testPassword);
      console.log(`Successfully logged in as: ${email}`);
    } catch (err) {
      console.error(`Failed to log in as: ${email}`, err.code, err.message);
    }
  }
}

run().catch(console.error);
