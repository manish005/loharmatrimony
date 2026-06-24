"use strict";
// Vedic Astrology Engine using astronomy-engine (pure JS, no native bindings)
// Uses Lahiri Ayanamsa for conversion from Tropical to Sidereal (Vedic)
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
exports.NAKSHATRA_LORDS = exports.NAKSHATRAS = exports.RASHIS = void 0;
exports.calculateKundali = calculateKundali;
const Astronomy = __importStar(require("astronomy-engine"));
// ===========================
// Lahiri Ayanamsa calculation
// ===========================
// Lahiri Ayanamsa formula (Chitra Paksha):
// Ayanamsa = 23.85° at epoch 1900 Jan 0.5 + 50.2564" per Julian year
function getLahiriAyanamsa(date) {
    const JD_1900 = 2415020.0; // Julian Day for 1900 Jan 0.5
    const jd = dateToJulianDay(date);
    const julianYears = (jd - JD_1900) / 365.25;
    const ayanamsa = 22.4601 + (julianYears * 50.2564) / 3600;
    return ayanamsa;
}
function dateToJulianDay(date) {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate() + date.getUTCHours() / 24 + date.getUTCMinutes() / 1440;
    const A = Math.floor((14 - m) / 12);
    const Y = y + 4800 - A;
    const M = m + 12 * A - 3;
    return d + Math.floor((153 * M + 2) / 5) + 365 * Y + Math.floor(Y / 4) - Math.floor(Y / 100) + Math.floor(Y / 400) - 32045;
}
// Convert tropical longitude to sidereal using Lahiri Ayanamsa
function toSidereal(tropicalLon, date) {
    const ayanamsa = getLahiriAyanamsa(date);
    return ((tropicalLon - ayanamsa) % 360 + 360) % 360;
}
// ===========================
// Types & Constants
// ===========================
exports.RASHIS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];
exports.NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];
exports.NAKSHATRA_LORDS = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
    "Jupiter", "Saturn", "Mercury", "Ketu", "Venus", "Sun",
    "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
    "Jupiter", "Saturn", "Mercury"
];
const GANA_TABLE = [
    "Deva", "Manushya", "Rakshasa", "Deva", "Manushya", "Rakshasa",
    "Deva", "Deva", "Rakshasa", "Rakshasa", "Manushya", "Manushya",
    "Deva", "Rakshasa", "Deva", "Rakshasa", "Deva", "Rakshasa",
    "Rakshasa", "Manushya", "Manushya", "Deva", "Rakshasa", "Rakshasa",
    "Manushya", "Deva", "Deva"
];
const NADI_TABLE = [
    "Adi", "Madhya", "Antya", "Antya", "Madhya", "Adi",
    "Adi", "Madhya", "Antya", "Antya", "Madhya", "Adi",
    "Adi", "Madhya", "Antya", "Antya", "Madhya", "Adi",
    "Adi", "Madhya", "Antya", "Antya", "Madhya", "Adi",
    "Adi", "Madhya", "Antya"
];
const YONI_TABLE = [
    "Ashwa", "Gaja", "Mesh", "Sarpa", "Sarpa", "Shwan",
    "Marjar", "Mesh", "Marjar", "Mushak", "Gau", "Mahish",
    "Mahish", "Vyaghra", "Mahish", "Vyaghra", "Mriga", "Mriga",
    "Shwan", "Vanara", "Nakul", "Vanara", "Simha", "Ashwa",
    "Simha", "Gau", "Gaja"
];
const VARNA_TABLE = [
    "Vaishya", "Shudra", "Shudra", "Brahmin", "Kshatriya", "Vaishya",
    "Shudra", "Brahmin", "Kshatriya", "Vaishya", "Shudra", "Brahmin"
];
// ===========================
// Get Planet Sidereal Position
// ===========================
function getPlanetPosition(body, date) {
    // Get ecliptic coordinates
    const ecliptic = Astronomy.EclipticGeoMoon ? null : null; // placeholder
    let tropicalLon;
    let isRetrograde = false;
    if (body === Astronomy.Body.Moon) {
        const moonPos = Astronomy.GeoMoon(date);
        const moonEcl = Astronomy.Ecliptic(moonPos);
        tropicalLon = moonEcl.elon;
    }
    else if (body === Astronomy.Body.Sun) {
        const sunPos = Astronomy.SunPosition(date);
        tropicalLon = sunPos.elon;
    }
    else {
        // For other planets, use HelioVector then convert
        const geoVec = Astronomy.GeoVector(body, date, false);
        const ecl = Astronomy.Ecliptic(geoVec);
        tropicalLon = ecl.elon;
        // Check retrograde via small time step
        const geoVec2 = Astronomy.GeoVector(body, new Date(date.getTime() + 86400000), false);
        const ecl2 = Astronomy.Ecliptic(geoVec2);
        isRetrograde = ecl2.elon < tropicalLon && Math.abs(ecl2.elon - tropicalLon) < 5;
    }
    const siderealLon = toSidereal(tropicalLon, date);
    const rashiIndex = Math.floor(siderealLon / 30);
    return {
        longitude: siderealLon,
        rashi: exports.RASHIS[rashiIndex] || "Aries",
        rashiIndex: rashiIndex % 12,
        degree: siderealLon % 30,
        retrograde: isRetrograde,
    };
}
// Approximate Rahu (North Node) position
function getRahuPosition(date) {
    // Rahu moves retrograde ~1.5°/month from 0° Scorpio at J2000.0
    const J2000 = new Date("2000-01-01T12:00:00Z");
    const daysFromJ2000 = (date.getTime() - J2000.getTime()) / 86400000;
    // Rahu at 11.8° Scorpio (218.8°) at J2000, moves -0.0529°/day retrograde
    const tropicalRahu = ((218.8 - daysFromJ2000 * 0.0529) % 360 + 360) % 360;
    const siderealRahu = toSidereal(tropicalRahu, date);
    const rashiIndex = Math.floor(siderealRahu / 30) % 12;
    return {
        longitude: siderealRahu,
        rashi: exports.RASHIS[rashiIndex],
        rashiIndex,
        degree: siderealRahu % 30,
        retrograde: true, // Rahu is always retrograde
    };
}
// Calculate Ascendant (Lagna) — sidereal
function getAscendant(date, lat, lng) {
    // RAMC: Right Ascension of Midheaven
    const JD = dateToJulianDay(date);
    const T = (JD - 2451545.0) / 36525; // Julian centuries from J2000
    const theta0 = 280.46061837 + 360.98564736629 * (JD - 2451545) + 0.000387933 * T * T;
    const RAMC = ((theta0 + lng) % 360 + 360) % 360; // RAMC in degrees
    // Obliquity of ecliptic
    const epsilon = 23.439291111 - 0.013004167 * T;
    const epsilonRad = (epsilon * Math.PI) / 180;
    const latRad = (lat * Math.PI) / 180;
    const RamcRad = (RAMC * Math.PI) / 180;
    // Ascendant formula
    const sinAsc = -Math.cos(RamcRad) / (Math.sin(epsilonRad) * Math.tan(latRad) + Math.cos(epsilonRad) * Math.sin(RamcRad));
    let tropAsc = (Math.atan(sinAsc) * 180) / Math.PI;
    // Quadrant correction
    if (Math.cos(RamcRad) < 0) {
        tropAsc += 180;
    }
    else if (sinAsc < 0) {
        tropAsc += 360;
    }
    const siderealAsc = toSidereal(tropAsc, date);
    return {
        longitude: siderealAsc,
        rashiIndex: Math.floor(siderealAsc / 30) % 12,
    };
}
// ===========================
// Dosha Detection
// ===========================
function detectDoshas(planets, lagnaIndex, moonSignIndex) {
    const doshas = [];
    const houseFromLagna = (lon) => ((Math.floor(lon / 30) - lagnaIndex + 12) % 12) + 1;
    const houseFromMoon = (lon) => ((Math.floor(lon / 30) - moonSignIndex + 12) % 12) + 1;
    // 1. MANGAL DOSHA
    const marsHL = houseFromLagna(planets.Mars.longitude);
    const marsHM = houseFromMoon(planets.Mars.longitude);
    const mangalHouses = [1, 2, 4, 7, 8, 12];
    if (mangalHouses.includes(marsHL) || mangalHouses.includes(marsHM)) {
        const isCancelled = [0, 7, 9].includes(planets.Mars.rashiIndex);
        if (!isCancelled) {
            doshas.push({
                name: "Mangal Dosha",
                description: `Mars is in the ${marsHL}th house from Lagna. This can cause marital friction and delay in marriage.`,
                severity: marsHL === 7 || marsHL === 8 ? "severe" : "moderate",
                remedies: [
                    "Perform Mangal Shanti puja on Tuesdays",
                    "Recite Hanuman Chalisa daily",
                    "Partner with Mangal Dosha neutralizes the effect",
                    "Wear red coral (Moonga) gemstone after expert guidance",
                ],
            });
        }
    }
    // 2. KAAL SARP DOSHA
    const rahu = planets.Rahu.longitude;
    const ketu = planets.Ketu.longitude;
    const others = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
    const between = (lon) => {
        if (rahu < ketu)
            return lon >= rahu && lon <= ketu;
        return lon >= rahu || lon <= ketu;
    };
    if (others.every((p) => between(planets[p].longitude))) {
        doshas.push({
            name: "Kaal Sarp Dosha",
            description: "All planets are hemmed between Rahu and Ketu causing life obstacles and delays.",
            severity: "severe",
            remedies: [
                "Kaal Sarp puja at Trimbakeshwar, Nashik",
                "Worship Lord Shiva every Monday",
                "Donate black sesame on Saturdays",
                "Recite Maha Mrityunjaya Mantra 108 times daily",
            ],
        });
    }
    // 3. PITRA DOSHA
    const sunHL = houseFromLagna(planets.Sun.longitude);
    const rahuHL = houseFromLagna(planets.Rahu.longitude);
    const ketuHL = houseFromLagna(planets.Ketu.longitude);
    if ((sunHL === 9 && (rahuHL === 9 || ketuHL === 9)) ||
        planets.Sun.rashiIndex === planets.Rahu.rashiIndex) {
        doshas.push({
            name: "Pitra Dosha",
            description: "Sun is afflicted by Rahu/Ketu indicating unresolved ancestral karma.",
            severity: "moderate",
            remedies: [
                "Perform Pitra Tarpan during Shraddh (Pitru Paksha)",
                "Feed Brahmins on Amavasya days",
                "Plant Peepal tree and water it on Saturdays",
            ],
        });
    }
    // 4. SHANI SADE SATI
    const saturnRashiIdx = planets.Saturn.rashiIndex;
    const moonDiff = (saturnRashiIdx - moonSignIndex + 12) % 12;
    if ([0, 1, 11].includes(moonDiff)) {
        const phase = moonDiff === 11 ? "Rising (1st phase)" : moonDiff === 0 ? "Peak (2nd phase)" : "Setting (3rd phase)";
        doshas.push({
            name: "Shani Sade Sati",
            description: `Saturn is transiting ${phase} over your Moon sign — a 7.5-year transformative period.`,
            severity: moonDiff === 0 ? "severe" : "moderate",
            remedies: [
                "Worship Lord Shani every Saturday",
                "Light sesame oil lamp at Shani temple",
                "Recite Shani Chalisa",
                "Donate black items on Saturdays",
            ],
        });
    }
    // 5. GRAHAN DOSHA
    if (planets.Moon.rashiIndex === planets.Rahu.rashiIndex ||
        planets.Moon.rashiIndex === planets.Ketu.rashiIndex) {
        doshas.push({
            name: "Chandra Grahan Dosha",
            description: "Moon is conjunct with Rahu or Ketu causing mental restlessness and emotional instability.",
            severity: "mild",
            remedies: [
                "Recite Chandra (Moon) mantra: Om Som Somaya Namah",
                "Donate white items on Mondays",
                "Perform Chandra Grahan Shanti Havan",
            ],
        });
    }
    return doshas;
}
// ===========================
// Main Export
// ===========================
function calculateKundali(dateStr, // "YYYY-MM-DD"
timeStr, // "HH:MM"
lat, lng, timezoneOffset = 5.5) {
    const [year, month, day] = dateStr.split("-").map(Number);
    const [hour, minute] = timeStr.split(":").map(Number);
    const localDecimalHour = hour + minute / 60;
    const utDecimalHour = localDecimalHour - timezoneOffset;
    const adjustedDate = new Date(Date.UTC(year, month - 1, day, Math.floor(utDecimalHour), Math.round((utDecimalHour % 1) * 60)));
    // Calculate planets
    const planets = {
        Sun: getPlanetPosition(Astronomy.Body.Sun, adjustedDate),
        Moon: getPlanetPosition(Astronomy.Body.Moon, adjustedDate),
        Mars: getPlanetPosition(Astronomy.Body.Mars, adjustedDate),
        Mercury: getPlanetPosition(Astronomy.Body.Mercury, adjustedDate),
        Jupiter: getPlanetPosition(Astronomy.Body.Jupiter, adjustedDate),
        Venus: getPlanetPosition(Astronomy.Body.Venus, adjustedDate),
        Saturn: getPlanetPosition(Astronomy.Body.Saturn, adjustedDate),
        Rahu: getRahuPosition(adjustedDate),
    };
    // Ketu = opposite Rahu
    const ketuLon = (planets.Rahu.longitude + 180) % 360;
    const ketuRashiIdx = Math.floor(ketuLon / 30) % 12;
    planets.Ketu = {
        longitude: ketuLon,
        rashi: exports.RASHIS[ketuRashiIdx],
        rashiIndex: ketuRashiIdx,
        degree: ketuLon % 30,
        retrograde: false,
    };
    // Ascendant
    const asc = getAscendant(adjustedDate, lat, lng);
    const lagnaIndex = asc.rashiIndex;
    // Moon details
    const moonLon = planets.Moon.longitude;
    const moonRashiIdx = Math.floor(moonLon / 30) % 12;
    const nakshatraIndex = Math.min(Math.floor(moonLon / 13.333333), 26);
    const pada = Math.floor((moonLon % 13.333333) / 3.333333) + 1;
    return {
        moonSign: exports.RASHIS[moonRashiIdx],
        moonSignIndex: moonRashiIdx,
        lagna: exports.RASHIS[lagnaIndex],
        lagnaIndex,
        sunSign: planets.Sun.rashi,
        nakshatra: exports.NAKSHATRAS[nakshatraIndex],
        nakshatraIndex,
        nakshatraLord: exports.NAKSHATRA_LORDS[nakshatraIndex],
        pada: Math.min(pada, 4),
        planets,
        doshas: detectDoshas(planets, lagnaIndex, moonRashiIdx),
        gana: GANA_TABLE[nakshatraIndex],
        nadi: NADI_TABLE[nakshatraIndex],
        yoni: YONI_TABLE[nakshatraIndex],
        varna: VARNA_TABLE[moonRashiIdx],
    };
}
//# sourceMappingURL=engine.js.map