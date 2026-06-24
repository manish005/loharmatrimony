// Shared Astro Library for Cloud Functions
// This module contains all the astro calculation logic
// Used by cloud functions to calculate kundali and compatibility

import * as Astronomy from "astronomy-engine";

// ===========================
// Lahiri Ayanamsa calculation
// ===========================
function getLahiriAyanamsa(date: Date): number {
  const JD_1900 = 2415020.0;
  const jd = dateToJulianDay(date);
  const julianYears = (jd - JD_1900) / 365.25;
  const ayanamsa = 22.4601 + (julianYears * 50.2564) / 3600;
  return ayanamsa;
}

function dateToJulianDay(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + date.getUTCHours() / 24 + date.getUTCMinutes() / 1440;
  const A = Math.floor((14 - m) / 12);
  const Y = y + 4800 - A;
  const M = m + 12 * A - 3;
  return d + Math.floor((153 * M + 2) / 5) + 365 * Y + Math.floor(Y / 4) - Math.floor(Y / 100) + Math.floor(Y / 400) - 32045;
}

function toSidereal(tropicalLon: number, date: Date): number {
  const ayanamsa = getLahiriAyanamsa(date);
  return ((tropicalLon - ayanamsa) % 360 + 360) % 360;
}

// ===========================
// Types & Constants
// ===========================
export const RASHIS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha",
  "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

export const NAKSHATRA_LORDS = [
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

export interface PlanetPosition {
  longitude: number;
  rashi: string;
  rashiIndex: number;
  degree: number;
  retrograde: boolean;
}

export interface Dosha {
  name: string;
  description: string;
  severity: "mild" | "moderate" | "severe";
  remedies: string[];
}

export interface KundaliResult {
  moonSign: string;
  moonSignIndex: number;
  lagna: string;
  lagnaIndex: number;
  sunSign: string;
  nakshatra: string;
  nakshatraIndex: number;
  nakshatraLord: string;
  pada: number;
  planets: Record<string, PlanetPosition>;
  doshas: Dosha[];
  gana: string;
  nadi: string;
  yoni: string;
  varna: string;
}

// ===========================
// Get Planet Sidereal Position
// ===========================
function getPlanetPosition(body: Astronomy.Body, date: Date): PlanetPosition {
  let tropicalLon: number;
  let isRetrograde = false;

  if (body === Astronomy.Body.Moon) {
    const moonPos = Astronomy.GeoMoon(date);
    const moonEcl = Astronomy.Ecliptic(moonPos);
    tropicalLon = moonEcl.elon;
  } else if (body === Astronomy.Body.Sun) {
    const sunPos = Astronomy.SunPosition(date);
    tropicalLon = sunPos.elon;
  } else {
    const geoVec = Astronomy.GeoVector(body, date, false);
    const ecl = Astronomy.Ecliptic(geoVec);
    tropicalLon = ecl.elon;

    const geoVec2 = Astronomy.GeoVector(body, new Date(date.getTime() + 86400000), false);
    const ecl2 = Astronomy.Ecliptic(geoVec2);
    isRetrograde = ecl2.elon < tropicalLon && Math.abs(ecl2.elon - tropicalLon) < 5;
  }

  const siderealLon = toSidereal(tropicalLon, date);
  const rashiIndex = Math.floor(siderealLon / 30);

  return {
    longitude: siderealLon,
    rashi: RASHIS[rashiIndex] || "Aries",
    rashiIndex: rashiIndex % 12,
    degree: siderealLon % 30,
    retrograde: isRetrograde,
  };
}

function getRahuPosition(date: Date): PlanetPosition {
  const J2000 = new Date("2000-01-01T12:00:00Z");
  const daysFromJ2000 = (date.getTime() - J2000.getTime()) / 86400000;
  const tropicalRahu = ((218.8 - daysFromJ2000 * 0.0529) % 360 + 360) % 360;
  const siderealRahu = toSidereal(tropicalRahu, date);
  const rashiIndex = Math.floor(siderealRahu / 30) % 12;

  return {
    longitude: siderealRahu,
    rashi: RASHIS[rashiIndex],
    rashiIndex,
    degree: siderealRahu % 30,
    retrograde: true,
  };
}

function getAscendant(date: Date, lat: number, lng: number): { longitude: number; rashiIndex: number } {
  const JD = dateToJulianDay(date);
  const T = (JD - 2451545.0) / 36525;
  const theta0 = 280.46061837 + 360.98564736629 * (JD - 2451545) + 0.000387933 * T * T;
  const RAMC = ((theta0 + lng) % 360 + 360) % 360;

  const epsilon = 23.439291111 - 0.013004167 * T;
  const epsilonRad = (epsilon * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  const RamcRad = (RAMC * Math.PI) / 180;

  const sinAsc = -Math.cos(RamcRad) / (Math.sin(epsilonRad) * Math.tan(latRad) + Math.cos(epsilonRad) * Math.sin(RamcRad));
  let tropAsc = (Math.atan(sinAsc) * 180) / Math.PI;

  if (Math.cos(RamcRad) < 0) {
    tropAsc += 180;
  } else if (sinAsc < 0) {
    tropAsc += 360;
  }

  const siderealAsc = toSidereal(tropAsc, date);
  return {
    longitude: siderealAsc,
    rashiIndex: Math.floor(siderealAsc / 30) % 12,
  };
}

function detectDoshas(
  planets: Record<string, PlanetPosition>,
  lagnaIndex: number,
  moonSignIndex: number
): Dosha[] {
  const doshas: Dosha[] = [];

  const houseFromLagna = (lon: number) => ((Math.floor(lon / 30) - lagnaIndex + 12) % 12) + 1;
  const houseFromMoon = (lon: number) => ((Math.floor(lon / 30) - moonSignIndex + 12) % 12) + 1;

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

  const rahu = planets.Rahu.longitude;
  const ketu = planets.Ketu.longitude;
  const others = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  const between = (lon: number) => {
    if (rahu < ketu) return lon >= rahu && lon <= ketu;
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

  const sunHL = houseFromLagna(planets.Sun.longitude);
  const rahuHL = houseFromLagna(planets.Rahu.longitude);
  const ketuHL = houseFromLagna(planets.Ketu.longitude);
  if ((sunHL === 9 && (rahuHL === 9 || ketuHL === 9)) ||
    planets.Sun.rashiIndex === planets.Rahu.rashiIndex) {
    doshas.push({
      name: "Pitra Dosha",
      description: "Sun is afflicted by Rahu/Ketu in 9th house indicating unresolved ancestral karma.",
      severity: "moderate",
      remedies: [
        "Perform Pitra Tarpan during Shraddh (Pitru Paksha)",
        "Feed Brahmins on Amavasya days",
        "Plant Peepal tree and water it on Saturdays",
      ],
    });
  }

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

export function calculateKundali(
  dateStr: string,
  timeStr: string,
  lat: number,
  lng: number,
  timezoneOffset: number = 5.5
): KundaliResult {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  const localDecimalHour = hour + minute / 60;
  const utDecimalHour = localDecimalHour - timezoneOffset;
  const adjustedDate = new Date(Date.UTC(year, month - 1, day, Math.floor(utDecimalHour), Math.round((utDecimalHour % 1) * 60)));

  const planets: Record<string, PlanetPosition> = {
    Sun: getPlanetPosition(Astronomy.Body.Sun, adjustedDate),
    Moon: getPlanetPosition(Astronomy.Body.Moon, adjustedDate),
    Mars: getPlanetPosition(Astronomy.Body.Mars, adjustedDate),
    Mercury: getPlanetPosition(Astronomy.Body.Mercury, adjustedDate),
    Jupiter: getPlanetPosition(Astronomy.Body.Jupiter, adjustedDate),
    Venus: getPlanetPosition(Astronomy.Body.Venus, adjustedDate),
    Saturn: getPlanetPosition(Astronomy.Body.Saturn, adjustedDate),
    Rahu: getRahuPosition(adjustedDate),
  };

  const ketuLon = (planets.Rahu.longitude + 180) % 360;
  const ketuRashiIdx = Math.floor(ketuLon / 30) % 12;
  planets.Ketu = {
    longitude: ketuLon,
    rashi: RASHIS[ketuRashiIdx],
    rashiIndex: ketuRashiIdx,
    degree: ketuLon % 30,
    retrograde: false,
  };

  const asc = getAscendant(adjustedDate, lat, lng);
  const lagnaIndex = asc.rashiIndex;

  const moonLon = planets.Moon.longitude;
  const moonRashiIdx = Math.floor(moonLon / 30) % 12;
  const nakshatraIndex = Math.min(Math.floor(moonLon / 13.333333), 26);
  const pada = Math.floor((moonLon % 13.333333) / 3.333333) + 1;

  return {
    moonSign: RASHIS[moonRashiIdx],
    moonSignIndex: moonRashiIdx,
    lagna: RASHIS[lagnaIndex],
    lagnaIndex,
    sunSign: planets.Sun.rashi,
    nakshatra: NAKSHATRAS[nakshatraIndex],
    nakshatraIndex,
    nakshatraLord: NAKSHATRA_LORDS[nakshatraIndex],
    pada: Math.min(pada, 4),
    planets,
    doshas: detectDoshas(planets, lagnaIndex, moonRashiIdx),
    gana: GANA_TABLE[nakshatraIndex],
    nadi: NADI_TABLE[nakshatraIndex],
    yoni: YONI_TABLE[nakshatraIndex],
    varna: VARNA_TABLE[moonRashiIdx],
  };
}
