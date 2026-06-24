import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { calculateKundali } from "./astrology/engine";
import { calculateCompatibility } from "./astrology/compatibility";
import { getCityCoords } from "./astrology/geocode";

admin.initializeApp();
const db = admin.firestore();

// ============================================================
// FUNCTION 1: calculateKundali
// Called when a user wants their birth chart calculated
// ============================================================
export const calculateKundaliFn = onCall(
  { region: "asia-south1", timeoutSeconds: 30, memory: "256MiB" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be logged in.");
    }

    const { uid, dob, birthTime, birthPlace } = request.data as {
      uid: string;
      dob: string;       // "YYYY-MM-DD"
      birthTime: string; // "HH:MM"
      birthPlace: string; // city name e.g., "Pune"
    };

    if (!dob || !birthTime || !birthPlace) {
      throw new HttpsError(
        "invalid-argument",
        "Please provide dob (YYYY-MM-DD), birthTime (HH:MM), and birthPlace."
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      throw new HttpsError("invalid-argument", "dob must be in YYYY-MM-DD format");
    }

    // Validate time format
    if (!/^\d{2}:\d{2}$/.test(birthTime)) {
      throw new HttpsError("invalid-argument", "birthTime must be in HH:MM format");
    }

    try {
      const coords = getCityCoords(birthPlace);
      const kundali = calculateKundali(dob, birthTime, coords.lat, coords.lng, coords.timezone);

      // Prepare storable data (no class instances, plain objects only)
      const kundaliData = {
        moonSign: kundali.moonSign,
        moonSignIndex: kundali.moonSignIndex,
        lagna: kundali.lagna,
        lagnaIndex: kundali.lagnaIndex,
        sunSign: kundali.sunSign,
        nakshatra: kundali.nakshatra,
        nakshatraIndex: kundali.nakshatraIndex,
        nakshatraLord: kundali.nakshatraLord,
        pada: kundali.pada,
        gana: kundali.gana,
        nadi: kundali.nadi,
        yoni: kundali.yoni,
        varna: kundali.varna,
        doshas: kundali.doshas.map((d) => ({
          name: d.name,
          description: d.description,
          severity: d.severity,
          remedies: d.remedies,
        })),
        planets: Object.fromEntries(
          Object.entries(kundali.planets).map(([name, pos]) => [
            name,
            {
              longitude: pos.longitude,
              rashi: pos.rashi,
              rashiIndex: pos.rashiIndex,
              degree: Math.round(pos.degree * 100) / 100,
              retrograde: pos.retrograde,
            },
          ])
        ),
        birthPlace,
        birthTime,
        dob,
        calculatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Store in Firestore under profiles/{uid}.kundali
      await db.doc(`profiles/${uid}`).update({ kundali: kundaliData });

      return { success: true, kundali: kundaliData };
    } catch (err: any) {
      console.error("Kundali calculation error:", err);
      throw new HttpsError("internal", `Calculation failed: ${err.message}`);
    }
  }
);

// ============================================================
// FUNCTION 2: getCompatibilityScore
// Called when viewing a match profile to get Ashtakoot score
// ============================================================
export const getCompatibilityScore = onCall(
  { region: "asia-south1", timeoutSeconds: 30, memory: "256MiB" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be logged in.");
    }

    const { uid1, uid2 } = request.data as { uid1: string; uid2: string };

    if (!uid1 || !uid2) {
      throw new HttpsError("invalid-argument", "Both uid1 and uid2 are required.");
    }

    try {
      // Fetch both profiles from Firestore
      const [snap1, snap2] = await Promise.all([
        db.doc(`profiles/${uid1}`).get(),
        db.doc(`profiles/${uid2}`).get(),
      ]);

      if (!snap1.exists || !snap2.exists) {
        throw new HttpsError("not-found", "One or both profiles not found.");
      }

      const p1 = snap1.data()!;
      const p2 = snap2.data()!;

      // Both must have kundali calculated
      if (!p1.kundali || !p2.kundali) {
        throw new HttpsError(
          "failed-precondition",
          "One or both profiles don't have Kundali calculated yet. Please calculate Kundali first."
        );
      }

      const k1 = p1.kundali;
      const k2 = p2.kundali;

      // Run Ashtakoot compatibility
      const result = calculateCompatibility(k1, k2);

      // Cache result in Firestore for quick retrieval
      const cacheKey = [uid1, uid2].sort().join("_");
      await db.doc(`compatibilityCache/${cacheKey}`).set({
        uid1,
        uid2,
        ...result,
        calculatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, compatibility: result };
    } catch (err: any) {
      if (err instanceof HttpsError) throw err;
      console.error("Compatibility calculation error:", err);
      throw new HttpsError("internal", `Calculation failed: ${err.message}`);
    }
  }
);

// ============================================================
// FUNCTION 3: deleteAuthUser (existing function you may have)
// ============================================================
export const deleteAuthUser = onCall(
  { region: "asia-south1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be authenticated.");
    }
    const { uid } = request.data as { uid: string };
    if (!uid) throw new HttpsError("invalid-argument", "uid is required");
    try {
      await admin.auth().deleteUser(uid);
      return { success: true };
    } catch (err: any) {
      throw new HttpsError("internal", err.message);
    }
  }
);
