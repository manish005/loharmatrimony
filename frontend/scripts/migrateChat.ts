// File: scripts/migrateChat.ts
// ---------------------------------------------------------------
// Description: Migrate Firestore chat data (conversations & messages) to Realtime Database.
//   - Reads Firestore collection "conversations" and its sub‑collection "messages".
//   - Writes a flat structure to RTDB:
//       /conversations/{conversationId}
//       /messages/{conversationId}/{messageId}
// ---------------------------------------------------------------
import { initializeApp as initClientApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import { initializeApp as initAdminApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------
// Load environment variables from .env (if present)
// ---------------------------------------------------------------
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, { encoding: "utf8" });
  envContent.split(/\r?\n/).forEach(line => {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) {
      process.env[m[1]] = m[2];
    }
  });
}

// ---------------------------------------------------------------
// Initialise Firebase client (Firestore) – uses same config as the web app.
// ---------------------------------------------------------------
const clientEnv = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : process.env;
const clientConfig = {
  apiKey: clientEnv.VITE_FIREBASE_API_KEY,
  authDomain: clientEnv.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: clientEnv.VITE_FIREBASE_DATABASE_URL,
  projectId: clientEnv.VITE_FIREBASE_PROJECT_ID,
  storageBucket: clientEnv.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: clientEnv.VITE_FIREBASE_SENDER_ID,
  appId: clientEnv.VITE_FIREBASE_APP_ID,
  measurementId: clientEnv.VITE_FIREBASE_MEASUREMENT_ID,
};
const clientApp = initClientApp(clientConfig);
const firestore = getFirestore(clientApp);

// ---------------------------------------------------------------
// Initialise Firebase Admin SDK for Realtime Database writes.
// ---------------------------------------------------------------
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error("⚠️ Set GOOGLE_APPLICATION_CREDENTIALS to a service‑account JSON file.");
  process.exit(1);
}
const adminApp = initAdminApp({ credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS as string) });
const rtdb = getDatabase(adminApp);

// ---------------------------------------------------------------
// Helper to migrate a single conversation and its messages.
// ---------------------------------------------------------------
async function migrateConversation(convDoc: any) {
  const convId = convDoc.id;
  const convData = convDoc.data();
  const updates: Record<string, any> = {};

  // Write conversation (shallow copy)
  updates[`/conversations/${convId}`] = { ...convData, migratedAt: Date.now() };

  // Fetch messages sub‑collection
  const messagesCol = collection(convDoc.ref, "messages");
  const msgsSnap = await getDocs(query(messagesCol, orderBy("createdAt")));
  msgsSnap.forEach(msgDoc => {
    const msgId = msgDoc.id;
    const msgData = msgDoc.data();
    // Store under /messages/{conversationId}/{msgId}
    updates[`/messages/${convId}/${msgId}`] = msgData;
  });

  // Perform a multi‑path update – atomic in RTDB
  await rtdb.ref().update(updates);
  console.log(`✅ Migrated ${convId} – ${msgsSnap.size} messages`);
}

// ---------------------------------------------------------------
// Main migration runner
// ---------------------------------------------------------------
async function run() {
  const convCol = collection(firestore, "conversations");
  const convSnap = await getDocs(convCol);
  console.log(`📦 Found ${convSnap.size} conversations`);
  for (const convDoc of convSnap.docs) {
    await migrateConversation(convDoc);
  }
  console.log("🎉 Migration complete");
}

run().catch(e => {
  console.error("❌ Migration failed", e);
  process.exit(1);
});
