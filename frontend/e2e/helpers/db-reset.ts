import * as fs from "fs";
import * as path from "path";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, deleteDoc, setDoc } from "firebase/firestore";

function loadEnv(): Record<string, string> {
  const envPath = path.join(process.cwd(), ".env.development");
  if (!fs.existsSync(envPath)) {
    throw new Error(`.env.development not found at ${envPath}`);
  }
  const content = fs.readFileSync(envPath, "utf8");
  const env: Record<string, string> = {};
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
  return env;
}

async function deleteCloudinaryAssets(env: Record<string, string>) {
  const cloudName = env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = env.VITE_CLOUDINARY_API_KEY;
  const apiSecret = env.VITE_CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("Cloudinary credentials missing from env; skipping Cloudinary purge.");
    return;
  }

  const authHeader = "Basic " + Buffer.from(apiKey + ":" + apiSecret).toString("base64");
  const prefix = "loharmatrimony/assets/profilesandKyc/";
  
  let nextCursor: string | null = null;
  console.log(`Starting Cloudinary purge under prefix: ${prefix}`);
  try {
    do {
      let listUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?prefix=${encodeURIComponent(prefix)}&max_results=100`;
      if (nextCursor) {
        listUrl += `&next_cursor=${nextCursor}`;
      }
      
      const listRes = await fetch(listUrl, { headers: { Authorization: authHeader } });
      if (!listRes.ok) {
        const text = await listRes.text();
        throw new Error(`Failed to list Cloudinary resources: ${listRes.statusText} - ${text}`);
      }
      
      const data: any = await listRes.json();
      const publicIds: string[] = (data.resources || []).map((r: any) => r.public_id);
      
      if (publicIds.length > 0) {
        console.log(`Deleting ${publicIds.length} Cloudinary images...`);
        const deleteUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?` +
          publicIds.map(id => `public_ids[]=${encodeURIComponent(id)}`).join("&");
          
        const delRes = await fetch(deleteUrl, { method: "DELETE", headers: { Authorization: authHeader } });
        if (!delRes.ok) {
          console.error(`Failed to delete some Cloudinary resources: ${delRes.statusText}`);
        } else {
          const delResult = await delRes.json();
          console.log("Cloudinary deletion result:", delResult);
        }
      }
      
      nextCursor = data.next_cursor || null;
    } while (nextCursor);
    console.log("Cloudinary purge finished successfully.");
  } catch (err) {
    console.error("Cloudinary purge failed:", err);
  }
}

async function purgeFirestore(db: any) {
  const collections = [
    "profiles",
    "interests",
    "marriageRequests",
    "notifications",
    "successStories",
    "supportTickets",
    "subscriptions"
  ];

  for (const colName of collections) {
    const colRef = collection(db, colName);
    const snap = await getDocs(colRef);
    console.log(`Purging collection: ${colName} (${snap.size} documents)`);
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
  }

  // Handle conversations and nested messages
  const convRef = collection(db, "conversations");
  const convSnap = await getDocs(convRef);
  console.log(`Purging conversations collection (${convSnap.size} documents)`);
  for (const convDoc of convSnap.docs) {
    const msgRef = collection(db, "conversations", convDoc.id, "messages");
    const msgSnap = await getDocs(msgRef);
    for (const msgDoc of msgSnap.docs) {
      await deleteDoc(msgDoc.ref);
    }
    await deleteDoc(convDoc.ref);
  }
}

export async function resetDatabaseAndSeed() {
  const env = loadEnv();
  
  const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  // Authenticate as administrator to have write/delete permissions in firestore rules
  const adminEmail = env.VITE_ADMIN_EMAIL || "admin@loharmatrimony.com";
  const adminPassword = env.VITE_ADMIN_PASSWORD || "admin123";
  console.log(`Authenticating as admin user: ${adminEmail}`);
  await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

  // 1. Purge Cloudinary images
  await deleteCloudinaryAssets(env);

  // 2. Purge Firestore data
  await purgeFirestore(db);

  // 3. Create Firebase Auth users if they don't exist
  const testPassword = "Test@123!!";
  const testEmails = [
    "manishgadekar1111@gmail.com",
    "gadekarmanish62@gmail.com",
    "msgadekar284@gmail.com"
  ];

  for (const email of testEmails) {
    try {
      await createUserWithEmailAndPassword(auth, email, testPassword);
      console.log(`Created Firebase Auth user: ${email}`);
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        console.log(`Firebase Auth user already exists: ${email}`);
      } else {
        console.error(`Error creating Auth user ${email}:`, err);
      }
    }
  }

  // 4. Seed the 3 Firestore profiles
  const profiles = [
    {
      id: "manish_gadekar_male",
      firstName: "Manish",
      lastName: "Gadekar",
      name: "Manish Gadekar",
      email: "manishgadekar1111@gmail.com",
      gender: "Male",
      subCaste: "Panchal",
      dob: "1994-08-15",
      age: 31,
      mobile: "9876543210",
      role: "user",
      address: "Andheri West",
      city: "Mumbai",
      state: "Maharashtra",
      district: "Mumbai Suburban",
      isOnline: true,
      isVerified: true,
      isPremium: true,
      photos: [
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"
      ],
      photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
      onboardingCompleted: true,
      registeredAt: new Date().toISOString(),
      isMarried: false,
      maritalStatus: "Never Married",
      partnerId: "",
      partnerName: "",
      weddingDate: "",
      occupation: "Software Engineer",
      education: "M.Tech in Computer Science",
      income: "₹15 Lakh - ₹20 Lakh",
      height: "5'11\"",
      weight: "75 kg",
      lifestyle: "Moderate",
      foodPreference: "Vegetarian",
      smoking: "No",
      drinking: "No",
      hobbies: "Reading, Traveling",
      familyDetails: "Nuclear family with traditional values.",
      fatherOccupation: "Businessman",
      motherOccupation: "Homemaker",
      siblings: "1 Brother"
    },
    {
      id: "manisha_gadekar_female_a",
      firstName: "Manisha",
      lastName: "Gadekar",
      name: "Manisha Gadekar",
      email: "gadekarmanish62@gmail.com",
      gender: "Female",
      subCaste: "Gadi Lohar",
      dob: "1996-03-10",
      age: 30,
      mobile: "9876543211",
      role: "user",
      address: "Bandra East",
      city: "Mumbai",
      state: "Maharashtra",
      district: "Mumbai Suburban",
      isOnline: true,
      isVerified: true,
      isPremium: true,
      photos: [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop"
      ],
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      onboardingCompleted: true,
      registeredAt: new Date().toISOString(),
      isMarried: false,
      maritalStatus: "Never Married",
      partnerId: "",
      partnerName: "",
      weddingDate: "",
      occupation: "Financial Analyst",
      education: "MBA in Finance",
      income: "₹10 Lakh - ₹12 Lakh",
      height: "5'4\"",
      weight: "58 kg",
      lifestyle: "Modern",
      foodPreference: "Vegetarian",
      smoking: "No",
      drinking: "Occasionally",
      hobbies: "Dancing, Cooking",
      familyDetails: "Joint family.",
      fatherOccupation: "Government Employee",
      motherOccupation: "Homemaker",
      siblings: "1 Sister"
    },
    {
      id: "priya_gadekar_female_b",
      firstName: "Priya",
      lastName: "Gadekar",
      name: "Priya Gadekar",
      email: "msgadekar284@gmail.com",
      gender: "Female",
      subCaste: "Gadi Lohar",
      dob: "1995-10-20",
      age: 30,
      mobile: "9123456781",
      role: "user",
      address: "Bandra East",
      city: "Mumbai",
      state: "Maharashtra",
      district: "Mumbai Suburban",
      isOnline: true,
      isVerified: true,
      isPremium: true,
      photos: [
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop"
      ],
      photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      onboardingCompleted: true,
      registeredAt: new Date().toISOString(),
      isMarried: false,
      maritalStatus: "Never Married",
      partnerId: "",
      partnerName: "",
      weddingDate: "",
      occupation: "Designer",
      education: "Bachelor of Fine Arts",
      income: "₹8 Lakh - ₹10 Lakh",
      height: "5'5\"",
      weight: "55 kg",
      lifestyle: "Modern",
      foodPreference: "Vegetarian",
      smoking: "No",
      drinking: "No",
      hobbies: "Painting, Music",
      familyDetails: "Joint family.",
      fatherOccupation: "Retired Officer",
      motherOccupation: "Teacher",
      siblings: "None"
    }
  ];

  for (const profile of profiles) {
    const profileRef = doc(db, "profiles", profile.id);
    await setDoc(profileRef, profile);
    console.log(`Seeded Firestore profile for: ${profile.email} (ID: ${profile.id})`);
  }

  console.log("Database and Cloudinary reset completed successfully.");
}
