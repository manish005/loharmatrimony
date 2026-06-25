// Backend Astro Service
// This service handles astro calculations for profiles
// Can be called when profiles are saved or when astro fields are modified

import { db } from "../config/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { calculateKundali, calculateCompatibility } from "../utils/astrologyShared";
import { getCityCoords } from "./astrology/geocode";

export interface AstroCalculationResult {
  success: boolean;
  kundali?: any;
  error?: string;
}

export interface ProfileUpdate {
  uid: string;
  dob?: string;
  birthTime?: string;
  birthPlace?: string;
  [key: string]: any;
}

export class AstroService {
  // Check if astro fields have changed
  static hasAstroFieldsChanged(profile: any, updates: ProfileUpdate): boolean {
    const astroFields = ['dob', 'birthTime', 'birthPlace'];
    return astroFields.some(field => updates[field] !== undefined && updates[field] !== profile[field]);
  }

  // Calculate kundali for a profile
  static async calculateKundaliForProfile(uid: string, profile: any): Promise<AstroCalculationResult> {
    try {
      if (!profile.dob || !profile.birthTime || !profile.birthPlace) {
        return { success: false, error: "Missing required astro fields (dob, birthTime, birthPlace)" };
      }

      const coords = getCityCoords(profile.birthPlace);
      const kundali = calculateKundali(
        profile.dob,
        profile.birthTime,
        coords.lat,
        coords.lng,
        coords.timezone
      );

      // Prepare storable data
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
        doshas: kundali.doshas.map((d: any) => ({
          name: d.name,
          description: d.description,
          severity: d.severity,
          remedies: d.remedies,
        })),
        planets: Object.fromEntries(
          Object.entries(kundali.planets).map(([name, pos]: [string, any]) => [
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
        birthPlace: profile.birthPlace,
        birthTime: profile.birthTime,
        dob: profile.dob,
        calculatedAt: new Date().toISOString(),
      };

      // Store in Firestore
      const profileRef = doc(db, "profiles", uid);
      await updateDoc(profileRef, { kundali: kundaliData });

      return { success: true, kundali: kundaliData };
    } catch (error: any) {
      console.error("Kundali calculation error:", error);
      return { success: false, error: error.message };
    }
  }

  // Calculate compatibility between two profiles
  static async calculateCompatibility(uid1: string, uid2: string): Promise<AstroCalculationResult> {
    try {
      // Fetch both profiles from Firestore
      const [snap1, snap2] = await Promise.all([
        getDoc(doc(db, "profiles", uid1)),
        getDoc(doc(db, "profiles", uid2)),
      ]);

      if (!snap1.exists() || !snap2.exists()) {
        return { success: false, error: "One or both profiles not found" };
      }

      const p1 = snap1.data();
      const p2 = snap2.data();

      // Both must have kundali calculated
      if (!p1.kundali || !p2.kundali) {
        return { success: false, error: "One or both profiles don't have Kundali calculated yet" };
      }

      const result = calculateCompatibility(p1.kundali, p2.kundali);

      // Cache result
      const cacheKey = [uid1, uid2].sort().join("__");
      const cacheRef = doc(db, "compatibilityCache", cacheKey);
      await setDoc(cacheRef, {
        uid1,
        uid2,
        ...result,
        calculatedAt: new Date().toISOString(),
      });

      return { success: true, kundali: result };
    } catch (error: any) {
      console.error("Compatibility calculation error:", error);
      return { success: false, error: error.message };
    }
  }

  // Auto-calculate kundali when profile is updated with astro fields
  static async autoCalculateKundali(profileUpdate: ProfileUpdate): Promise<AstroCalculationResult> {
    try {
      const uid = profileUpdate.uid;
      const profileSnap = await getDoc(doc(db, "profiles", uid));

      if (!profileSnap.exists()) {
        return { success: false, error: "Profile not found" };
      }

      const currentProfile = profileSnap.data();

      if (!this.hasAstroFieldsChanged(currentProfile, profileUpdate)) {
        return { success: true, error: "No astro fields changed, skipping calculation" };
      }

      return await this.calculateKundaliForProfile(uid, { ...currentProfile, ...profileUpdate });
    } catch (error: any) {
      console.error("Auto-calculate kundali error:", error);
      return { success: false, error: error.message };
    }
  }

  // Get cached compatibility score
  static async getCachedCompatibility(uid1: string, uid2: string): Promise<AstroCalculationResult> {
    try {
      const cacheKey = [uid1, uid2].sort().join("__");
      const cacheSnap = await getDoc(doc(db, "compatibilityCache", cacheKey));

      if (!cacheSnap.exists()) {
        return { success: false, error: "No cached compatibility found" };
      }

      return { success: true, kundali: cacheSnap.data() };
    } catch (error: any) {
      console.error("Get cached compatibility error:", error);
      return { success: false, error: error.message };
    }
  }
}
