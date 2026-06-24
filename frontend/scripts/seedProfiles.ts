// File: d:/Asp.net Projects/Matrimony/frontend/scripts/seedProfiles.ts
// ---------------------------------------------------------------
// Description: Seeds two full user profiles (male & female) into
// the Firebase Realtime Database. Run with `npx ts-node scripts/seedProfiles.ts`.
// ---------------------------------------------------------------


import * as fs from 'fs';
import * as path from 'path';
const envFile = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, { encoding: 'utf8' });
  envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) {
      const key = match[1];
      const value = match[2];
      process.env[key] = value;
    }
  });
}

import { database, realtimeHelpers, auth } from '../src/config/firebase';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

interface Profile {
  uid: string;
  email: string;
  gender: 'male' | 'female';
  firstName: string;
  lastName: string;
  birthDate: string; // ISO format
  age: number;
  maritalStatus: string;
  education: string;
  occupation: string;
  familyValues: string;
  caste: string;
  subCaste?: string;
  motherTongue: string;
  height: string;
  religion: string;
  location: string;
  bio: string;
  [key: string]: any;
}

// ------------------------------------------------------------------
// Data for the two seed profiles
// ------------------------------------------------------------------
const maleProfile: Profile = {
  uid: '',
  email: 'manishgadekar1111@gmail.com',
  gender: 'male',
  firstName: 'Manish',
  lastName: 'Gadekar',
  birthDate: '1990-05-15',
  age: 36,
  maritalStatus: 'Single',
  education: 'B.Tech Computer Engineering',
  occupation: 'Software Engineer',
  familyValues: 'Traditional',
  caste: 'Maratha',
  motherTongue: 'Marathi',
  height: "5'9\"",
  religion: 'Hindu',
  location: 'Mumbai, Maharashtra, India',
  bio: `Enthusiastic software engineer with a passion for building scalable web\napplications. I love traveling, trying new cuisines, and spending weekends\nwith family. Looking for a life partner who values honesty, culture, and\nshared adventures.`,
};

const femaleProfile: Profile = {
  uid: '',
  email: 'gadekarmanish62@gmail.com',
  gender: 'female',
  firstName: 'Misha',
  lastName: 'Gadekar',
  birthDate: '1992-08-22',
  age: 34,
  maritalStatus: 'Single',
  education: 'M.Sc. Computer Science',
  occupation: 'Data Analyst',
  familyValues: 'Traditional',
  caste: 'Maratha',
  motherTongue: 'Marathi',
  height: "5'5\"",
  religion: 'Hindu',
  location: 'Pune, Maharashtra, India',
  bio: `Analytical mind with a love for numbers and storytelling through data.\nI enjoy reading, yoga, and exploring nature trails. I am looking for a\ncaring partner who appreciates family, tradition, and a balanced life.`,
};

// ------------------------------------------------------------------
// Main seeding logic
// ------------------------------------------------------------------
async function seed() {
  // Optional authentication – replace with a service account that has write access
  try {
    const serviceAuth = getAuth();
    await signInWithEmailAndPassword(
      serviceAuth,
      'YOUR_SERVICE_ACCOUNT_EMAIL@example.com', // <-- replace
      'YOUR_SERVICE_ACCOUNT_PASSWORD' // <-- replace
    );
    console.log('✅ Authenticated');
  } catch (e) {
    console.warn('⚠️ Auth not required or failed – proceeding without auth');
  }

  const writeProfile = async (profile: Profile) => {
    const uid = profile.uid || realtimeHelpers.push(realtimeHelpers.ref(database, 'profiles')).key;
    const path = `profiles/${uid}`;
    const data = { ...profile, uid };
    await realtimeHelpers.update(realtimeHelpers.ref(database, path), data);
    console.log(`✅ Seeded ${profile.gender} profile (${profile.email}) at ${path}`);
  };

  await writeProfile(maleProfile);
  await writeProfile(femaleProfile);
}

seed()
  .then(() => console.log('🎉 Seeding complete'))
  .catch((err) => console.error('❌ Seeding error:', err));
