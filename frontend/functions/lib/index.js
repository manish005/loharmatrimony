"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAuthUser = exports.getCompatibilityScore = exports.calculateKundaliFn = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const engine_1 = require("./astrology/engine");
const compatibility_1 = require("./astrology/compatibility");
const geocode_1 = require("./astrology/geocode");
admin.initializeApp();
const db = admin.firestore();
// ============================================================
// FUNCTION 1: calculateKundali
// Called when a user wants their birth chart calculated
// ============================================================
exports.calculateKundaliFn = (0, https_1.onCall)({ region: "asia-south1", timeoutSeconds: 30, memory: "256MiB" }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "You must be logged in.");
    }
    const { uid, dob, birthTime, birthPlace } = request.data;
    if (!dob || !birthTime || !birthPlace) {
        throw new https_1.HttpsError("invalid-argument", "Please provide dob (YYYY-MM-DD), birthTime (HH:MM), and birthPlace.");
    }
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
        throw new https_1.HttpsError("invalid-argument", "dob must be in YYYY-MM-DD format");
    }
    // Validate time format
    if (!/^\d{2}:\d{2}$/.test(birthTime)) {
        throw new https_1.HttpsError("invalid-argument", "birthTime must be in HH:MM format");
    }
    try {
        const coords = (0, geocode_1.getCityCoords)(birthPlace);
        const kundali = (0, engine_1.calculateKundali)(dob, birthTime, coords.lat, coords.lng, coords.timezone);
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
            birthPlace,
            birthTime,
            dob,
            calculatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        // Store in Firestore under profiles/{uid}.kundali
        await db.doc(`profiles/${uid}`).update({ kundali: kundaliData });
        return { success: true, kundali: kundaliData };
    }
    catch (err) {
        console.error("Kundali calculation error:", err);
        throw new https_1.HttpsError("internal", `Calculation failed: ${err.message}`);
    }
});
// ============================================================
// FUNCTION 2: getCompatibilityScore
// Called when viewing a match profile to get Ashtakoot score
// ============================================================
exports.getCompatibilityScore = (0, https_1.onCall)({ region: "asia-south1", timeoutSeconds: 30, memory: "256MiB" }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "You must be logged in.");
    }
    const { uid1, uid2 } = request.data;
    if (!uid1 || !uid2) {
        throw new https_1.HttpsError("invalid-argument", "Both uid1 and uid2 are required.");
    }
    try {
        // Fetch both profiles from Firestore
        const [snap1, snap2] = await Promise.all([
            db.doc(`profiles/${uid1}`).get(),
            db.doc(`profiles/${uid2}`).get(),
        ]);
        if (!snap1.exists || !snap2.exists) {
            throw new https_1.HttpsError("not-found", "One or both profiles not found.");
        }
        const p1 = snap1.data();
        const p2 = snap2.data();
        // Both must have kundali calculated
        if (!p1.kundali || !p2.kundali) {
            throw new https_1.HttpsError("failed-precondition", "One or both profiles don't have Kundali calculated yet. Please calculate Kundali first.");
        }
        const k1 = p1.kundali;
        const k2 = p2.kundali;
        // Run Ashtakoot compatibility
        const result = (0, compatibility_1.calculateCompatibility)(k1, k2);
        // Cache result in Firestore for quick retrieval
        const cacheKey = [uid1, uid2].sort().join("_");
        await db.doc(`compatibilityCache/${cacheKey}`).set(Object.assign(Object.assign({ uid1,
            uid2 }, result), { calculatedAt: admin.firestore.FieldValue.serverTimestamp() }));
        return { success: true, compatibility: result };
    }
    catch (err) {
        if (err instanceof https_1.HttpsError)
            throw err;
        console.error("Compatibility calculation error:", err);
        throw new https_1.HttpsError("internal", `Calculation failed: ${err.message}`);
    }
});
// ============================================================
// FUNCTION 3: deleteAuthUser (existing function you may have)
// ============================================================
exports.deleteAuthUser = (0, https_1.onCall)({ region: "asia-south1" }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Must be authenticated.");
    }
    const { uid } = request.data;
    if (!uid)
        throw new https_1.HttpsError("invalid-argument", "uid is required");
    try {
        await admin.auth().deleteUser(uid);
        return { success: true };
    }
    catch (err) {
        throw new https_1.HttpsError("internal", err.message);
    }
});
//# sourceMappingURL=index.js.map