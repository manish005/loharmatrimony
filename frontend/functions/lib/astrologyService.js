"use strict";
// Backend Astro Service
// This service handles astro calculations for profiles
// Can be called when profiles are saved or when astro fields are modified
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstroService = void 0;
const firebase_1 = require("../config/firebase");
const astrologyShared_1 = require("./astrologyShared");
const geocode_1 = require("./astrology/geocode");
class AstroService {
    // Check if astro fields have changed
    static hasAstroFieldsChanged(profile, updates) {
        const astroFields = ['dob', 'birthTime', 'birthPlace'];
        return astroFields.some(field => updates[field] !== undefined && updates[field] !== profile[field]);
    }
    // Calculate kundali for a profile
    static async calculateKundaliForProfile(uid, profile) {
        try {
            if (!profile.dob || !profile.birthTime || !profile.birthPlace) {
                return { success: false, error: "Missing required astro fields (dob, birthTime, birthPlace)" };
            }
            const coords = (0, geocode_1.getCityCoords)(profile.birthPlace);
            const kundali = (0, astrologyShared_1.calculateKundali)(profile.dob, profile.birthTime, coords.lat, coords.lng, coords.timezone);
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
                doshas: kundali.doshas.map((d) => ({
                    name: d.name,
                    description: d.description,
                    severity: d.severity,
                    remedies: d.remedies,
                })),
                planets: Object.fromEntries(Object.entries(kundali.planets).map(([name, pos]) => [
                    name,
                    {
                        longitude: pos.longitude,
                        rashi: pos.rashi,
                        rashiIndex: pos.rashiIndex,
                        degree: Math.round(pos.degree * 100) / 100,
                        retrograde: pos.retrograde,
                    },
                ])),
                birthPlace: profile.birthPlace,
                birthTime: profile.birthTime,
                dob: profile.dob,
                calculatedAt: new Date().toISOString(),
            };
            // Store in Firestore
            await firebase_1.db.doc(`profiles/${uid}`).update({ kundali: kundaliData });
            return { success: true, kundali: kundaliData };
        }
        catch (error) {
            console.error("Kundali calculation error:", error);
            return { success: false, error: error.message };
        }
    }
    // Calculate compatibility between two profiles
    static async calculateCompatibility(uid1, uid2) {
        try {
            const [snap1, snap2] = await Promise.all([
                firebase_1.db.doc(`profiles/${uid1}`).get(),
                firebase_1.db.doc(`profiles/${uid2}`).get(),
            ]);
            if (!snap1.exists || !snap2.exists) {
                return { success: false, error: "One or both profiles not found" };
            }
            const p1 = snap1.data();
            const p2 = snap2.data();
            if (!p1.kundali || !p2.kundali) {
                return { success: false, error: "One or both profiles don't have Kundali calculated yet" };
            }
            const result = calculateCompatibility(p1.kundali, p2.kundali);
            // Cache result
            const cacheKey = [uid1, uid2].sort().join("__");
            await firebase_1.db.doc(`compatibilityCache/${cacheKey}`).set(Object.assign(Object.assign({ uid1,
                uid2 }, result), { calculatedAt: new Date().toISOString() }));
            return { success: true, kundali: result };
        }
        catch (error) {
            console.error("Compatibility calculation error:", error);
            return { success: false, error: error.message };
        }
    }
    // Auto-calculate kundali when profile is updated with astro fields
    static async autoCalculateKundali(profileUpdate) {
        try {
            const uid = profileUpdate.uid;
            const profileDoc = await firebase_1.db.doc(`profiles/${uid}`).get();
            if (!profileDoc.exists) {
                return { success: false, error: "Profile not found" };
            }
            const currentProfile = profileDoc.data();
            if (!this.hasAstroFieldsChanged(currentProfile, profileUpdate)) {
                return { success: true, error: "No astro fields changed, skipping calculation" };
            }
            return await this.calculateKundaliForProfile(uid, Object.assign(Object.assign({}, currentProfile), profileUpdate));
        }
        catch (error) {
            console.error("Auto-calculate kundali error:", error);
            return { success: false, error: error.message };
        }
    }
    // Get cached compatibility score
    static async getCachedCompatibility(uid1, uid2) {
        try {
            const cacheKey = [uid1, uid2].sort().join("__");
            const cacheDoc = await firebase_1.db.doc(`compatibilityCache/${cacheKey}`).get();
            if (!cacheDoc.exists) {
                return { success: false, error: "No cached compatibility found" };
            }
            return { success: true, kundali: cacheDoc.data() };
        }
        catch (error) {
            console.error("Get cached compatibility error:", error);
            return { success: false, error: error.message };
        }
    }
}
exports.AstroService = AstroService;
//# sourceMappingURL=astrologyService.js.map