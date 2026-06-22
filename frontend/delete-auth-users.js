import { execSync } from "child_process";
import fs from "fs";
import path from "path";

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
const projectId = env.VITE_FIREBASE_PROJECT_ID || "loharmatrimonyy";

console.log("Getting gcloud access token...");
const accessToken = execSync("gcloud auth print-access-token").toString().trim();

const emails = [
  "manishgadekar1111@gmail.com",
  "gadekarmanish62@gmail.com",
  "msgadekar284@gmail.com"
];

async function run() {
  console.log("Looking up users...");
  const lookupUrl = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:lookup`;
  const res = await fetch(lookupUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
      "x-goog-user-project": projectId
    },
    body: JSON.stringify({ email: emails })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Lookup failed: ${res.statusText} - ${text}`);
  }

  const data = await res.json();
  const uids = (data.users || []).map(u => u.localId);

  if (uids.length > 0) {
    console.log(`Deleting ${uids.length} auth users:`, uids);
    for (const uid of uids) {
      const deleteUrl = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:delete`;
      const delRes = await fetch(deleteUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "x-goog-user-project": projectId
        },
        body: JSON.stringify({ localId: uid })
      });

      if (!delRes.ok) {
        const text = await delRes.text();
        console.error(`Deletion failed for user ${uid}: ${delRes.statusText} - ${text}`);
      } else {
        console.log(`Successfully deleted user: ${uid}`);
      }
    }
  } else {
    console.log("No users found to delete.");
  }
}

run().catch(console.error);
