"use strict";
// Ashtakoot (8-factor) Kundali Milan compatibility scoring
// Maximum total: 36 points
// >= 18: Acceptable, >= 24: Good, >= 30: Excellent
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCompatibility = calculateCompatibility;
// =============================================
// Lookup tables for Ashtakoot
// =============================================
// Varna (1 point) — spiritual/caste compatibility
// Brahmin > Kshatriya > Vaishya > Shudra
const VARNA_ORDER = {
    Brahmin: 4, Kshatriya: 3, Vaishya: 2, Shudra: 1
};
// Vashya (2 points) — dominance compatibility
const VASHYA_TABLE = {
    Aries: ["Leo", "Scorpio"],
    Taurus: ["Cancer", "Libra"],
    Gemini: ["Virgo"],
    Cancer: ["Scorpio", "Sagittarius"],
    Leo: ["Libra"],
    Virgo: ["Pisces", "Gemini"],
    Libra: ["Capricorn", "Virgo"],
    Scorpio: ["Cancer"],
    Sagittarius: ["Pisces"],
    Capricorn: ["Aries", "Aquarius"],
    Aquarius: ["Aries"],
    Pisces: ["Capricorn"],
};
// Tara (3 points) — birth star compatibility
// Based on counting from boy's nakshatra to girl's
function calcTara(boyNak, girlNak) {
    const tara = ((girlNak - boyNak + 27) % 27) + 1;
    const group = Math.ceil(tara / 3);
    // Auspicious groups: 1, 3, 5, 7 → full points
    // Groups 2, 4, 6 → zero
    // Group 8, 9 are special
    const auspicious = [1, 3, 5, 7];
    if (auspicious.includes(group))
        return 3;
    if (group === 2 || group === 4 || group === 6)
        return 0;
    return 1.5; // partial
}
// Yoni (4 points) — biological/nature compatibility
const YONI_COMPATIBILITY = {
    Ashwa: { Ashwa: 4, Gaja: 0, Mesh: 3, Sarpa: 0, Shwan: 2, Marjar: 1, Mushak: 1, Gau: 3, Mahish: 2, Vyaghra: 1, Mriga: 3, Nakul: 0, Vanara: 2, Simha: 0 },
    Gaja: { Ashwa: 0, Gaja: 4, Mesh: 2, Sarpa: 0, Shwan: 0, Marjar: 1, Mushak: 0, Gau: 4, Mahish: 3, Vyaghra: 0, Mriga: 2, Nakul: 0, Vanara: 1, Simha: 0 },
    Mesh: { Ashwa: 3, Gaja: 2, Mesh: 4, Sarpa: 0, Shwan: 0, Marjar: 1, Mushak: 1, Gau: 3, Mahish: 2, Vyaghra: 0, Mriga: 4, Nakul: 0, Vanara: 2, Simha: 0 },
    Sarpa: { Ashwa: 0, Gaja: 0, Mesh: 0, Sarpa: 4, Shwan: 0, Marjar: 0, Mushak: 0, Gau: 0, Mahish: 0, Vyaghra: 0, Mriga: 0, Nakul: 2, Vanara: 0, Simha: 0 },
    Shwan: { Ashwa: 2, Gaja: 0, Mesh: 0, Sarpa: 0, Shwan: 4, Marjar: 0, Mushak: 3, Gau: 2, Mahish: 2, Vyaghra: 0, Mriga: 2, Nakul: 3, Vanara: 2, Simha: 0 },
    Marjar: { Ashwa: 1, Gaja: 1, Mesh: 1, Sarpa: 0, Shwan: 0, Marjar: 4, Mushak: 0, Gau: 1, Mahish: 1, Vyaghra: 0, Mriga: 1, Nakul: 0, Vanara: 1, Simha: 0 },
    Mushak: { Ashwa: 1, Gaja: 0, Mesh: 1, Sarpa: 0, Shwan: 3, Marjar: 0, Mushak: 4, Gau: 1, Mahish: 1, Vyaghra: 0, Mriga: 1, Nakul: 3, Vanara: 1, Simha: 0 },
    Gau: { Ashwa: 3, Gaja: 4, Mesh: 3, Sarpa: 0, Shwan: 2, Marjar: 1, Mushak: 1, Gau: 4, Mahish: 3, Vyaghra: 0, Mriga: 3, Nakul: 0, Vanara: 2, Simha: 0 },
    Mahish: { Ashwa: 2, Gaja: 3, Mesh: 2, Sarpa: 0, Shwan: 2, Marjar: 1, Mushak: 1, Gau: 3, Mahish: 4, Vyaghra: 0, Mriga: 2, Nakul: 0, Vanara: 2, Simha: 0 },
    Vyaghra: { Ashwa: 1, Gaja: 0, Mesh: 0, Sarpa: 0, Shwan: 0, Marjar: 0, Mushak: 0, Gau: 0, Mahish: 0, Vyaghra: 4, Mriga: 0, Nakul: 0, Vanara: 0, Simha: 3 },
    Mriga: { Ashwa: 3, Gaja: 2, Mesh: 4, Sarpa: 0, Shwan: 2, Marjar: 1, Mushak: 1, Gau: 3, Mahish: 2, Vyaghra: 0, Mriga: 4, Nakul: 0, Vanara: 2, Simha: 0 },
    Nakul: { Ashwa: 0, Gaja: 0, Mesh: 0, Sarpa: 2, Shwan: 3, Marjar: 0, Mushak: 3, Gau: 0, Mahish: 0, Vyaghra: 0, Mriga: 0, Nakul: 4, Vanara: 0, Simha: 0 },
    Vanara: { Ashwa: 2, Gaja: 1, Mesh: 2, Sarpa: 0, Shwan: 2, Marjar: 1, Mushak: 1, Gau: 2, Mahish: 2, Vyaghra: 0, Mriga: 2, Nakul: 0, Vanara: 4, Simha: 0 },
    Simha: { Ashwa: 0, Gaja: 0, Mesh: 0, Sarpa: 0, Shwan: 0, Marjar: 0, Mushak: 0, Gau: 0, Mahish: 0, Vyaghra: 3, Mriga: 0, Nakul: 0, Vanara: 0, Simha: 4 },
};
// Graha Maitri (5 points) — planetary friendship between Moon sign lords
const PLANET_LORDS = {
    Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
    Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars",
    Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter"
};
const PLANET_FRIENDSHIPS = {
    Sun: { friends: ["Moon", "Mars", "Jupiter"], enemies: ["Venus", "Saturn"], neutral: ["Mercury"] },
    Moon: { friends: ["Sun", "Mercury"], enemies: [], neutral: ["Mars", "Jupiter", "Venus", "Saturn"] },
    Mars: { friends: ["Sun", "Moon", "Jupiter"], enemies: ["Mercury"], neutral: ["Venus", "Saturn"] },
    Mercury: { friends: ["Sun", "Venus"], enemies: ["Moon"], neutral: ["Mars", "Jupiter", "Saturn"] },
    Jupiter: { friends: ["Sun", "Moon", "Mars"], enemies: ["Mercury", "Venus"], neutral: ["Saturn"] },
    Venus: { friends: ["Mercury", "Saturn"], enemies: ["Sun", "Moon"], neutral: ["Mars", "Jupiter"] },
    Saturn: { friends: ["Mercury", "Venus"], enemies: ["Sun", "Moon", "Mars"], neutral: ["Jupiter"] },
};
function getPlanetRelation(p1, p2) {
    if (p1 === p2)
        return "friend";
    const f = PLANET_FRIENDSHIPS[p1];
    if (!f)
        return "neutral";
    if (f.friends.includes(p2))
        return "friend";
    if (f.enemies.includes(p2))
        return "enemy";
    return "neutral";
}
// Gana (6 points) — temperament compatibility
const GANA_COMPATIBILITY = {
    Deva: { Deva: 6, Manushya: 6, Rakshasa: 0 },
    Manushya: { Deva: 5, Manushya: 6, Rakshasa: 1 },
    Rakshasa: { Deva: 0, Manushya: 1, Rakshasa: 6 },
};
// Bhakoot (7 points) — love/health compatibility based on Moon sign distance
function calcBhakoot(boyMoon, girlMoon) {
    const diff1 = ((girlMoon - boyMoon + 12) % 12) + 1; // Girl from Boy
    const diff2 = ((boyMoon - girlMoon + 12) % 12) + 1; // Boy from Girl
    // Inauspicious patterns: 6/8, 12/2 (Shatashtak, Dwirdwadash)
    const inauspicious6_8 = (diff1 === 6 && diff2 === 8) || (diff1 === 8 && diff2 === 6);
    const inauspicious2_12 = (diff1 === 2 && diff2 === 12) || (diff1 === 12 && diff2 === 2);
    if (inauspicious6_8 || inauspicious2_12) {
        return { score: 0, dosha: true };
    }
    return { score: 7, dosha: false };
}
// Nadi (8 points) — health/progeny compatibility
function calcNadi(boyNadi, girlNadi) {
    if (boyNadi === girlNadi) {
        return { score: 0, dosha: true }; // Nadi Dosha — same nadi = 0 points
    }
    return { score: 8, dosha: false };
}
// =============================================
// Main Compatibility Calculator
// =============================================
function calculateCompatibility(boy, girl) {
    var _a, _b, _c, _d;
    const factors = [];
    // 1. VARNA (1 point)
    const boyVarnaRank = VARNA_ORDER[boy.varna] || 1;
    const girlVarnaRank = VARNA_ORDER[girl.varna] || 1;
    const varnaScore = boyVarnaRank >= girlVarnaRank ? 1 : 0;
    factors.push({
        name: "Varna",
        nameHindi: "वर्ण",
        maxPoints: 1,
        scored: varnaScore,
        description: `Boy: ${boy.varna}, Girl: ${girl.varna}. ${varnaScore === 1 ? "Compatible" : "Boy's spiritual class should be ≥ Girl's"}`,
        result: varnaScore === 1 ? "good" : "bad",
    });
    // 2. VASHYA (2 points)
    const boyControls = VASHYA_TABLE[boy.moonSign] || [];
    const girlControls = VASHYA_TABLE[girl.moonSign] || [];
    let vashyaScore = 0;
    if (boyControls.includes(girl.moonSign) && girlControls.includes(boy.moonSign)) {
        vashyaScore = 2; // Mutual
    }
    else if (boyControls.includes(girl.moonSign) || girlControls.includes(boy.moonSign)) {
        vashyaScore = 1; // One-way
    }
    factors.push({
        name: "Vashya",
        nameHindi: "वश्य",
        maxPoints: 2,
        scored: vashyaScore,
        description: `Boy: ${boy.moonSign}, Girl: ${girl.moonSign}. ${vashyaScore === 2 ? "Mutual dominance balance" : vashyaScore === 1 ? "Partial compatibility" : "No Vashya compatibility"}`,
        result: vashyaScore === 2 ? "good" : vashyaScore === 1 ? "average" : "bad",
    });
    // 3. TARA (3 points)
    const taraBoyToGirl = calcTara(boy.nakshatraIndex, girl.nakshatraIndex);
    const taraGirlToBoy = calcTara(girl.nakshatraIndex, boy.nakshatraIndex);
    const taraScore = Math.min(taraBoyToGirl, taraGirlToBoy);
    factors.push({
        name: "Tara",
        nameHindi: "तारा",
        maxPoints: 3,
        scored: taraScore,
        description: `Boy Nakshatra: ${boy.nakshatra}, Girl Nakshatra: ${girl.nakshatra}. Birth star distance ${taraScore === 3 ? "is auspicious" : taraScore > 0 ? "is partially compatible" : "is inauspicious"}`,
        result: taraScore === 3 ? "good" : taraScore > 0 ? "average" : "bad",
    });
    // 4. YONI (4 points)
    const yoniScore = (_b = ((_a = YONI_COMPATIBILITY[boy.yoni]) === null || _a === void 0 ? void 0 : _a[girl.yoni])) !== null && _b !== void 0 ? _b : 2;
    factors.push({
        name: "Yoni",
        nameHindi: "योनि",
        maxPoints: 4,
        scored: yoniScore,
        description: `Boy Yoni: ${boy.yoni}, Girl Yoni: ${girl.yoni}. ${yoniScore >= 3 ? "Excellent biological harmony" : yoniScore >= 2 ? "Average physical compatibility" : "Poor biological compatibility"}`,
        result: yoniScore >= 3 ? "good" : yoniScore >= 2 ? "average" : "bad",
    });
    // 5. GRAHA MAITRI (5 points)
    const boyLord = PLANET_LORDS[boy.moonSign];
    const girlLord = PLANET_LORDS[girl.moonSign];
    const boyToGirlRel = getPlanetRelation(boyLord, girlLord);
    const girlToBoyRel = getPlanetRelation(girlLord, boyLord);
    let grahaScore = 0;
    if (boyToGirlRel === "friend" && girlToBoyRel === "friend")
        grahaScore = 5;
    else if (boyToGirlRel === "friend" || girlToBoyRel === "friend")
        grahaScore = 4;
    else if (boyToGirlRel === "neutral" && girlToBoyRel === "neutral")
        grahaScore = 3;
    else if (boyToGirlRel === "neutral" || girlToBoyRel === "neutral")
        grahaScore = 1;
    else
        grahaScore = 0;
    factors.push({
        name: "Graha Maitri",
        nameHindi: "ग्रह मैत्री",
        maxPoints: 5,
        scored: grahaScore,
        description: `Boy's lord ${boyLord}, Girl's lord ${girlLord}. ${boyToGirlRel === "friend" && girlToBoyRel === "friend" ? "Both planets are friends — excellent mental harmony" : "Partial planetary friendship"}`,
        result: grahaScore >= 4 ? "good" : grahaScore >= 2 ? "average" : "bad",
    });
    // 6. GANA (6 points)
    const ganaScore = (_d = (_c = GANA_COMPATIBILITY[boy.gana]) === null || _c === void 0 ? void 0 : _c[girl.gana]) !== null && _d !== void 0 ? _d : 0;
    factors.push({
        name: "Gana",
        nameHindi: "गण",
        maxPoints: 6,
        scored: ganaScore,
        description: `Boy: ${boy.gana} Gana, Girl: ${girl.gana} Gana. ${ganaScore === 6 ? "Perfect temperament match" : ganaScore >= 4 ? "Good temperament balance" : "Temperament conflict may cause disagreements"}`,
        result: ganaScore >= 5 ? "good" : ganaScore >= 3 ? "average" : "bad",
    });
    // 7. BHAKOOT (7 points)
    const bhakoot = calcBhakoot(boy.moonSignIndex, girl.moonSignIndex);
    factors.push({
        name: "Bhakoot",
        nameHindi: "भकूट",
        maxPoints: 7,
        scored: bhakoot.score,
        description: bhakoot.dosha
            ? `Bhakoot Dosha detected! Moon sign distance ${((girl.moonSignIndex - boy.moonSignIndex + 12) % 12) + 1}/${((boy.moonSignIndex - girl.moonSignIndex + 12) % 12) + 1} is inauspicious.`
            : `No Bhakoot Dosha. Moon sign distance is auspicious.`,
        result: bhakoot.score === 7 ? "good" : "bad",
    });
    // 8. NADI (8 points)
    const nadi = calcNadi(boy.nadi, girl.nadi);
    factors.push({
        name: "Nadi",
        nameHindi: "नाड़ी",
        maxPoints: 8,
        scored: nadi.score,
        description: nadi.dosha
            ? `Nadi Dosha! Both have ${boy.nadi} Nadi. This indicates health issues and difficult progeny.`
            : `Boy: ${boy.nadi} Nadi, Girl: ${girl.nadi} Nadi. Different Nadi — good for health & progeny.`,
        result: nadi.score === 8 ? "good" : "bad",
    });
    // Calculate total
    const totalScore = factors.reduce((sum, f) => sum + f.scored, 0);
    const percentage = Math.round((totalScore / 36) * 100);
    // Determine verdict
    let verdict;
    let verdictColor;
    let recommendation;
    if (totalScore >= 30) {
        verdict = "Excellent Match";
        verdictColor = "#10b981"; // green
        recommendation = "Highly recommended for marriage. Exceptional compatibility across all factors.";
    }
    else if (totalScore >= 24) {
        verdict = "Good Match";
        verdictColor = "#22c55e";
        recommendation = "Good compatibility. Recommended for marriage with standard rituals.";
    }
    else if (totalScore >= 18) {
        verdict = "Average Match";
        verdictColor = "#f59e0b";
        recommendation = "Acceptable match. Consider consulting a pandit for remedies on weak factors.";
    }
    else if (totalScore >= 12) {
        verdict = "Below Average";
        verdictColor = "#f97316";
        recommendation = "Compatibility concerns exist. Seek expert astrological guidance and remedies.";
    }
    else {
        verdict = "Poor Match";
        verdictColor = "#ef4444";
        recommendation = "Significant compatibility issues. Strongly recommend consulting an experienced astrologer before proceeding.";
    }
    const activeDosha = nadi.dosha ? "Nadi Dosha" : bhakoot.dosha ? "Bhakoot Dosha" : null;
    return {
        totalScore,
        maxScore: 36,
        percentage,
        verdict,
        verdictColor,
        factors,
        nadiDosha: nadi.dosha,
        bhakootDosha: bhakoot.dosha,
        dosha: activeDosha,
        recommendation,
    };
}
//# sourceMappingURL=compatibility.js.map