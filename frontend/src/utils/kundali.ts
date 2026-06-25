// Client-side Vedic Astrology Engine using astronomy-engine (pure JS)
// No backend required — runs in browser and saves to Realtime Database
// Uses Lahiri Ayanamsa for Vedic sidereal conversion

import * as Astronomy from "astronomy-engine";
import { db } from "../config/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { calculateKundali } from "../utils/astrologyShared";

// ===========================
// Lahiri Ayanamsa calculation
// ===========================
function getLahiriAyanamsa(date: Date): number {
  const JD_1900 = 2415020.0;
  const jd = dateToJulianDay(date);
  const julianYears = (jd - JD_1900) / 365.25;
  return 22.4601 + (julianYears * 50.2564) / 3600;
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
  return ((tropicalLon - getLahiriAyanamsa(date)) % 360 + 360) % 360;
}

// ===========================
// Constants
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

const NAKSHATRA_LORDS = [
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
  "Jupiter", "Saturn", "Mercury", "Ketu", "Venus", "Sun",
  "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
  "Jupiter", "Saturn", "Mercury"
];

const GANA_TABLE = [
  "Deva","Manushya","Rakshasa","Deva","Manushya","Rakshasa",
  "Deva","Deva","Rakshasa","Rakshasa","Manushya","Manushya",
  "Deva","Rakshasa","Deva","Rakshasa","Deva","Rakshasa",
  "Rakshasa","Manushya","Manushya","Deva","Rakshasa","Rakshasa",
  "Manushya","Deva","Deva"
];

const NADI_TABLE = [
  "Adi","Madhya","Antya","Antya","Madhya","Adi",
  "Adi","Madhya","Antya","Antya","Madhya","Adi",
  "Adi","Madhya","Antya","Antya","Madhya","Adi",
  "Adi","Madhya","Antya","Antya","Madhya","Adi",
  "Adi","Madhya","Antya"
];

const YONI_TABLE = [
  "Ashwa","Gaja","Mesh","Sarpa","Sarpa","Shwan",
  "Marjar","Mesh","Marjar","Mushak","Gau","Mahish",
  "Mahish","Vyaghra","Mahish","Vyaghra","Mriga","Mriga",
  "Shwan","Vanara","Nakul","Vanara","Simha","Ashwa",
  "Simha","Gau","Gaja"
];

const VARNA_TABLE = [
  "Vaishya","Shudra","Shudra","Brahmin","Kshatriya","Vaishya",
  "Shudra","Brahmin","Kshatriya","Vaishya","Shudra","Brahmin"
];

export interface PlanetPos {
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

export interface KundaliData {
  moonSign: string;
  moonSignIndex: number;
  lagna: string;
  lagnaIndex: number;
  sunSign: string;
  nakshatra: string;
  nakshatraIndex: number;
  nakshatraLord: string;
  pada: number;
  gana: string;
  nadi: string;
  yoni: string;
  varna: string;
  doshas: Dosha[];
  planets: Record<string, PlanetPos>;
  dob: string;
  birthTime: string;
  birthPlace: string;
}

// ===========================
// Planet position helpers
// ===========================
function getEclipticLon(body: Astronomy.Body, date: Date): { lon: number; retrograde: boolean } {
  let tropLon: number;
  let retrograde = false;

  if (body === Astronomy.Body.Sun) {
    tropLon = Astronomy.SunPosition(date).elon;
  } else if (body === Astronomy.Body.Moon) {
    tropLon = Astronomy.Ecliptic(Astronomy.GeoMoon(date)).elon;
  } else {
    const gv = Astronomy.GeoVector(body, date, false);
    tropLon = Astronomy.Ecliptic(gv).elon;
    // retrograde check
    const tomorrow = new Date(date.getTime() + 86400000);
    const gv2 = Astronomy.GeoVector(body, tomorrow, false);
    const lon2 = Astronomy.Ecliptic(gv2).elon;
    retrograde = Math.abs(lon2 - tropLon) < 5 && lon2 < tropLon;
  }

  return { lon: toSidereal(tropLon, date), retrograde };
}

function makePlanet(body: Astronomy.Body, date: Date): PlanetPos {
  const { lon, retrograde } = getEclipticLon(body, date);
  const ri = Math.floor(lon / 30) % 12;
  return { longitude: lon, rashi: RASHIS[ri], rashiIndex: ri, degree: lon % 30, retrograde };
}

function getRahu(date: Date): PlanetPos {
  const J2000 = new Date("2000-01-01T12:00:00Z");
  const days = (date.getTime() - J2000.getTime()) / 86400000;
  const tropLon = ((218.8 - days * 0.0529) % 360 + 360) % 360;
  const lon = toSidereal(tropLon, date);
  const ri = Math.floor(lon / 30) % 12;
  return { longitude: lon, rashi: RASHIS[ri], rashiIndex: ri, degree: lon % 30, retrograde: true };
}

function getLagna(date: Date, lat: number, lng: number): PlanetPos {
  const JD = dateToJulianDay(date);
  const T = (JD - 2451545.0) / 36525;
  const theta0 = 280.46061837 + 360.98564736629 * (JD - 2451545) + 0.000387933 * T * T;
  const RAMC = ((theta0 + lng) % 360 + 360) % 360;
  const eps = 23.439291111 - 0.013004167 * T;
  const epR = (eps * Math.PI) / 180;
  const latR = (lat * Math.PI) / 180;
  const ramcR = (RAMC * Math.PI) / 180;
  const sinAsc = -Math.cos(ramcR) / (Math.sin(epR) * Math.tan(latR) + Math.cos(epR) * Math.sin(ramcR));
  let trop = (Math.atan(sinAsc) * 180) / Math.PI;
  if (Math.cos(ramcR) < 0) trop += 180;
  else if (sinAsc < 0) trop += 360;
  const lon = toSidereal(trop, date);
  const ri = Math.floor(lon / 30) % 12;
  return { longitude: lon, rashi: RASHIS[ri], rashiIndex: ri, degree: lon % 30, retrograde: false };
}

// ===========================
// Dosha detection
// ===========================
function detectDoshas(planets: Record<string, PlanetPos>, lagnaIdx: number, moonIdx: number): Dosha[] {
  const doshas: Dosha[] = [];
  const hL = (lon: number) => ((Math.floor(lon / 30) - lagnaIdx + 12) % 12) + 1;

  // Mangal Dosha
  const mH = hL(planets.Mars.longitude);
  if ([1, 2, 4, 7, 8, 12].includes(mH) && ![0, 7, 9].includes(planets.Mars.rashiIndex)) {
    doshas.push({
      name: "Mangal Dosha",
      description: `Mars is in the ${mH}th house from Lagna, causing marital friction and delay in marriage.`,
      severity: mH === 7 || mH === 8 ? "severe" : "moderate",
      remedies: ["Mangal Shanti puja on Tuesdays","Recite Hanuman Chalisa daily","Partner with Mangal Dosha neutralizes effect","Wear red coral (Moonga) after expert guidance"],
    });
  }

  // Kaal Sarp Dosha
  const rahu = planets.Rahu.longitude;
  const ketu = planets.Ketu.longitude;
  const between = (lon: number) => rahu < ketu ? (lon >= rahu && lon <= ketu) : (lon >= rahu || lon <= ketu);
  if (["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"].every(p => between(planets[p].longitude))) {
    doshas.push({
      name: "Kaal Sarp Dosha",
      description: "All planets hemmed between Rahu and Ketu — causes delays and life obstacles.",
      severity: "severe",
      remedies: ["Kaal Sarp puja at Trimbakeshwar (Nashik)","Worship Lord Shiva every Monday","Donate black sesame on Saturdays","Recite Maha Mrityunjaya Mantra 108 times daily"],
    });
  }

  // Pitra Dosha
  if (hL(planets.Sun.longitude) === 9 && (hL(planets.Rahu.longitude) === 9 || hL(planets.Ketu.longitude) === 9)) {
    doshas.push({
      name: "Pitra Dosha",
      description: "Sun afflicted by Rahu/Ketu in 9th house — ancestral karma affecting progeny.",
      severity: "moderate",
      remedies: ["Pitra Tarpan during Shraddh (Pitru Paksha)","Feed Brahmins on Amavasya days","Plant Peepal tree and water on Saturdays"],
    });
  }

  // Sade Sati
  const satDiff = (planets.Saturn.rashiIndex - moonIdx + 12) % 12;
  if ([0, 1, 11].includes(satDiff)) {
    const phase = satDiff === 11 ? "Rising" : satDiff === 0 ? "Peak" : "Setting";
    doshas.push({
      name: "Shani Sade Sati",
      description: `Saturn in ${phase} phase of Sade Sati over Moon sign — 7.5-year transformation period.`,
      severity: satDiff === 0 ? "severe" : "moderate",
      remedies: ["Worship Lord Shani every Saturday","Light sesame oil lamp at Shani temple","Recite Shani Chalisa","Donate black items on Saturdays"],
    });
  }

  // Grahan Dosha
  if (planets.Moon.rashiIndex === planets.Rahu.rashiIndex || planets.Moon.rashiIndex === planets.Ketu.rashiIndex) {
    doshas.push({
      name: "Chandra Grahan Dosha",
      description: "Moon conjunct with Rahu or Ketu — causes mental restlessness and emotional instability.",
      severity: "mild",
      remedies: ["Recite Chandra mantra: Om Som Somaya Namah","Donate white items on Mondays","Perform Chandra Grahan Shanti Havan"],
    });
  }

  return doshas;
}

// ===========================
// City DB (inline, light version)
// ===========================
const CITIES: Record<string, [number, number]> = {
  mumbai:[19.076,72.877],pune:[18.52,73.856],nagpur:[21.145,79.088],nashik:[20.006,73.79],
  aurangabad:[19.876,75.343],solapur:[17.66,75.906],kolhapur:[16.705,74.243],thane:[19.218,72.978],
  ahmedabad:[23.022,72.571],surat:[21.17,72.831],vadodara:[22.307,73.181],rajkot:[22.303,70.802],
  jaipur:[26.912,75.787],jodhpur:[26.238,73.024],udaipur:[24.585,73.712],
  delhi:[28.613,77.209],"new delhi":[28.613,77.209],noida:[28.535,77.391],
  lucknow:[26.846,80.946],kanpur:[26.449,80.331],varanasi:[25.317,82.973],agra:[27.176,78.008],
  bangalore:[12.971,77.594],bengaluru:[12.971,77.594],mysuru:[12.295,76.639],
  chennai:[13.082,80.27],coimbatore:[11.016,76.955],madurai:[9.925,78.119],
  hyderabad:[17.385,78.486],bhopal:[23.259,77.412],indore:[22.719,75.857],
  kolkata:[22.572,88.363],calcutta:[22.572,88.363],chandigarh:[30.733,76.779],
  patna:[25.594,85.137],bhubaneswar:[20.296,85.824],panaji:[15.490,73.827],
  goa:[15.299,74.124],kochi:[9.931,76.267],thiruvananthapuram:[8.524,76.936],
};

export function getCoords(city: string): { lat: number; lng: number } {
  const key = city.toLowerCase().trim();
  for (const [k, v] of Object.entries(CITIES)) {
    if (key.includes(k) || k.includes(key)) return { lat: v[0], lng: v[1] };
  }
  return { lat: 18.52, lng: 73.856 }; // Default: Pune
}

// ===========================
// Main function — runs in browser
// ===========================
export function computeKundali(
  dob: string,        // "YYYY-MM-DD"
  birthTime: string,  // "HH:MM"
  birthPlace: string,
  timezoneOffset = 5.5
): KundaliData {
  const { lat, lng } = getCoords(birthPlace);

  const kundaliResult = calculateKundali(dob, birthTime, lat, lng, timezoneOffset);

  const planets: Record<string, PlanetPos> = {};
  Object.entries(kundaliResult.planets).forEach(([name, pos]) => {
    planets[name] = {
      longitude: pos.longitude,
      rashi: pos.rashi,
      rashiIndex: pos.rashiIndex,
      degree: pos.degree,
      retrograde: pos.retrograde,
    };
  });

  return {
    moonSign: kundaliResult.moonSign,
    moonSignIndex: kundaliResult.moonSignIndex,
    lagna: kundaliResult.lagna,
    lagnaIndex: kundaliResult.lagnaIndex,
    sunSign: kundaliResult.sunSign,
    nakshatra: kundaliResult.nakshatra,
    nakshatraIndex: kundaliResult.nakshatraIndex,
    nakshatraLord: kundaliResult.nakshatraLord,
    pada: kundaliResult.pada,
    gana: kundaliResult.gana,
    nadi: kundaliResult.nadi,
    yoni: kundaliResult.yoni,
    varna: kundaliResult.varna,
    doshas: kundaliResult.doshas,
    planets,
    dob,
    birthTime,
    birthPlace,
  };
}

// Save Kundali to Realtime Database (called after computation)
export async function saveKundali(uid: string, kundali: KundaliData): Promise<void> {
  const profileRef = doc(db, "profiles", uid);
  await updateDoc(profileRef, { kundali });
}

// ===========================
// Ashtakoot Compatibility
// ===========================
export interface CompatFactor {
  name: string;
  nameHindi: string;
  maxPoints: number;
  scored: number;
  description: string;
  result: "good" | "average" | "bad";
}

export interface CompatResult {
  totalScore: number;
  maxScore: 36;
  percentage: number;
  verdict: string;
  verdictColor: string;
  factors: CompatFactor[];
  nadiDosha: boolean;
  bhakootDosha: boolean;
  dosha: string | null;
  recommendation: string;
}

const VARNA_ORDER: Record<string, number> = { Brahmin:4, Kshatriya:3, Vaishya:2, Shudra:1 };
const VASHYA: Record<string, string[]> = {
  Aries:["Leo","Scorpio"], Taurus:["Cancer","Libra"], Gemini:["Virgo"],
  Cancer:["Scorpio","Sagittarius"], Leo:["Libra"], Virgo:["Pisces","Gemini"],
  Libra:["Capricorn","Virgo"], Scorpio:["Cancer"], Sagittarius:["Pisces"],
  Capricorn:["Aries","Aquarius"], Aquarius:["Aries"], Pisces:["Capricorn"],
};
const YONI_COMPAT: Record<string, Record<string, number>> = {
  Ashwa:{Ashwa:4,Gaja:0,Mesh:3,Sarpa:0,Shwan:2,Marjar:1,Mushak:1,Gau:3,Mahish:2,Vyaghra:1,Mriga:3,Nakul:0,Vanara:2,Simha:0},
  Gaja:{Ashwa:0,Gaja:4,Mesh:2,Sarpa:0,Shwan:0,Marjar:1,Mushak:0,Gau:4,Mahish:3,Vyaghra:0,Mriga:2,Nakul:0,Vanara:1,Simha:0},
  Mesh:{Ashwa:3,Gaja:2,Mesh:4,Sarpa:0,Shwan:0,Marjar:1,Mushak:1,Gau:3,Mahish:2,Vyaghra:0,Mriga:4,Nakul:0,Vanara:2,Simha:0},
  Sarpa:{Ashwa:0,Gaja:0,Mesh:0,Sarpa:4,Shwan:0,Marjar:0,Mushak:0,Gau:0,Mahish:0,Vyaghra:0,Mriga:0,Nakul:2,Vanara:0,Simha:0},
  Shwan:{Ashwa:2,Gaja:0,Mesh:0,Sarpa:0,Shwan:4,Marjar:0,Mushak:3,Gau:2,Mahish:2,Vyaghra:0,Mriga:2,Nakul:3,Vanara:2,Simha:0},
  Marjar:{Ashwa:1,Gaja:1,Mesh:1,Sarpa:0,Shwan:0,Marjar:4,Mushak:0,Gau:1,Mahish:1,Vyaghra:0,Mriga:1,Nakul:0,Vanara:1,Simha:0},
  Mushak:{Ashwa:1,Gaja:0,Mesh:1,Sarpa:0,Shwan:3,Marjar:0,Mushak:4,Gau:1,Mahish:1,Vyaghra:0,Mriga:1,Nakul:3,Vanara:1,Simha:0},
  Gau:{Ashwa:3,Gaja:4,Mesh:3,Sarpa:0,Shwan:2,Marjar:1,Mushak:1,Gau:4,Mahish:3,Vyaghra:0,Mriga:3,Nakul:0,Vanara:2,Simha:0},
  Mahish:{Ashwa:2,Gaja:3,Mesh:2,Sarpa:0,Shwan:2,Marjar:1,Mushak:1,Gau:3,Mahish:4,Vyaghra:0,Mriga:2,Nakul:0,Vanara:2,Simha:0},
  Vyaghra:{Ashwa:1,Gaja:0,Mesh:0,Sarpa:0,Shwan:0,Marjar:0,Mushak:0,Gau:0,Mahish:0,Vyaghra:4,Mriga:0,Nakul:0,Vanara:0,Simha:3},
  Mriga:{Ashwa:3,Gaja:2,Mesh:4,Sarpa:0,Shwan:2,Marjar:1,Mushak:1,Gau:3,Mahish:2,Vyaghra:0,Mriga:4,Nakul:0,Vanara:2,Simha:0},
  Nakul:{Ashwa:0,Gaja:0,Mesh:0,Sarpa:2,Shwan:3,Marjar:0,Mushak:3,Gau:0,Mahish:0,Vyaghra:0,Mriga:0,Nakul:4,Vanara:0,Simha:0},
  Vanara:{Ashwa:2,Gaja:1,Mesh:2,Sarpa:0,Shwan:2,Marjar:1,Mushak:1,Gau:2,Mahish:2,Vyaghra:0,Mriga:2,Nakul:0,Vanara:4,Simha:0},
  Simha:{Ashwa:0,Gaja:0,Mesh:0,Sarpa:0,Shwan:0,Marjar:0,Mushak:0,Gau:0,Mahish:0,Vyaghra:3,Mriga:0,Nakul:0,Vanara:0,Simha:4},
};
const LORDS: Record<string, string> = {
  Aries:"Mars",Taurus:"Venus",Gemini:"Mercury",Cancer:"Moon",Leo:"Sun",Virgo:"Mercury",
  Libra:"Venus",Scorpio:"Mars",Sagittarius:"Jupiter",Capricorn:"Saturn",Aquarius:"Saturn",Pisces:"Jupiter",
};
const FRIENDS: Record<string, string[]> = {
  Sun:["Moon","Mars","Jupiter"], Moon:["Sun","Mercury"], Mars:["Sun","Moon","Jupiter"],
  Mercury:["Sun","Venus"], Jupiter:["Sun","Moon","Mars"], Venus:["Mercury","Saturn"], Saturn:["Mercury","Venus"],
};
const ENEMIES: Record<string, string[]> = {
  Sun:["Venus","Saturn"], Moon:[], Mars:["Mercury"], Mercury:["Moon"],
  Jupiter:["Mercury","Venus"], Venus:["Sun","Moon"], Saturn:["Sun","Moon","Mars"],
};
const GANA_COMPAT: Record<string, Record<string, number>> = {
  Deva:{Deva:6,Manushya:6,Rakshasa:0},
  Manushya:{Deva:5,Manushya:6,Rakshasa:1},
  Rakshasa:{Deva:0,Manushya:1,Rakshasa:6},
};

export function computeCompatibility(boy: KundaliData, girl: KundaliData): CompatResult {
  const factors: CompatFactor[] = [];

  // 1. Varna (1pt)
  const bV = VARNA_ORDER[boy.varna] || 1;
  const gV = VARNA_ORDER[girl.varna] || 1;
  const varna = bV >= gV ? 1 : 0;
  factors.push({ name:"Varna", nameHindi:"वर्ण", maxPoints:1, scored:varna, description:`Boy: ${boy.varna}, Girl: ${girl.varna}`, result: varna===1?"good":"bad" });

  // 2. Vashya (2pt)
  const bCtrl = VASHYA[boy.moonSign] || [];
  const gCtrl = VASHYA[girl.moonSign] || [];
  const vashya = bCtrl.includes(girl.moonSign) && gCtrl.includes(boy.moonSign) ? 2 : (bCtrl.includes(girl.moonSign) || gCtrl.includes(boy.moonSign)) ? 1 : 0;
  factors.push({ name:"Vashya", nameHindi:"वश्य", maxPoints:2, scored:vashya, description:`${boy.moonSign} ↔ ${girl.moonSign}`, result: vashya===2?"good":vashya===1?"average":"bad" });

  // 3. Tara (3pt)
  const t1 = ((girl.nakshatraIndex - boy.nakshatraIndex + 27) % 27) + 1;
  const t2 = ((boy.nakshatraIndex - girl.nakshatraIndex + 27) % 27) + 1;
  const taraAus = (t: number) => [1,3,5,7].includes(Math.ceil(t/3));
  const tara = (taraAus(t1) && taraAus(t2)) ? 3 : (taraAus(t1) || taraAus(t2)) ? 1.5 : 0;
  factors.push({ name:"Tara", nameHindi:"तारा", maxPoints:3, scored:tara, description:`${boy.nakshatra} ↔ ${girl.nakshatra}`, result: tara===3?"good":tara>0?"average":"bad" });

  // 4. Yoni (4pt)
  const yoni = YONI_COMPAT[boy.yoni]?.[girl.yoni] ?? 2;
  factors.push({ name:"Yoni", nameHindi:"योनि", maxPoints:4, scored:yoni, description:`${boy.yoni} ↔ ${girl.yoni}`, result: yoni>=3?"good":yoni>=2?"average":"bad" });

  // 5. Graha Maitri (5pt)
  const bL = LORDS[boy.moonSign], gL = LORDS[girl.moonSign];
  const bFG = bL===gL?"friend":FRIENDS[bL]?.includes(gL)?"friend":ENEMIES[bL]?.includes(gL)?"enemy":"neutral";
  const gFB = bL===gL?"friend":FRIENDS[gL]?.includes(bL)?"friend":ENEMIES[gL]?.includes(bL)?"enemy":"neutral";
  const gm = bFG==="friend"&&gFB==="friend"?5:bFG==="friend"||gFB==="friend"?4:bFG==="neutral"&&gFB==="neutral"?3:bFG==="neutral"||gFB==="neutral"?1:0;
  factors.push({ name:"Graha Maitri", nameHindi:"ग्रह मैत्री", maxPoints:5, scored:gm, description:`${bL} ↔ ${gL}: ${bFG}/${gFB}`, result: gm>=4?"good":gm>=2?"average":"bad" });

  // 6. Gana (6pt)
  const gana = GANA_COMPAT[boy.gana]?.[girl.gana] ?? 0;
  factors.push({ name:"Gana", nameHindi:"गण", maxPoints:6, scored:gana, description:`${boy.gana} ↔ ${girl.gana}`, result: gana>=5?"good":gana>=3?"average":"bad" });

  // 7. Bhakoot (7pt)
  const d1 = ((girl.moonSignIndex - boy.moonSignIndex + 12) % 12) + 1;
  const d2 = ((boy.moonSignIndex - girl.moonSignIndex + 12) % 12) + 1;
  const bhakootDosha = (d1===6&&d2===8)||(d1===8&&d2===6)||(d1===2&&d2===12)||(d1===12&&d2===2);
  const bhakoot = bhakootDosha ? 0 : 7;
  factors.push({ name:"Bhakoot", nameHindi:"भकूट", maxPoints:7, scored:bhakoot, description: bhakootDosha?`Bhakoot Dosha: ${d1}/${d2} moon sign distance`:`No Bhakoot Dosha — auspicious`, result: bhakoot===7?"good":"bad" });

  // 8. Nadi (8pt)
  const nadiDosha = boy.nadi === girl.nadi;
  const nadi = nadiDosha ? 0 : 8;
  factors.push({ name:"Nadi", nameHindi:"नाड़ी", maxPoints:8, scored:nadi, description: nadiDosha?`Nadi Dosha — both ${boy.nadi} Nadi`:`${boy.nadi} ↔ ${girl.nadi}: Different Nadi`, result: nadi===8?"good":"bad" });

  const total = factors.reduce((s, f) => s + f.scored, 0);
  const pct = Math.round((total / 36) * 100);
  const verdict = total>=30?"Excellent Match":total>=24?"Good Match":total>=18?"Average Match":total>=12?"Below Average":"Poor Match";
  const verdictColor = total>=30?"#10b981":total>=24?"#22c55e":total>=18?"#f59e0b":total>=12?"#f97316":"#ef4444";
  const recommendation = total>=30?"Highly recommended — exceptional compatibility across all factors.":total>=24?"Good compatibility. Recommended for marriage.":total>=18?"Acceptable match. Consult a pandit for remedies on weak factors.":total>=12?"Compatibility concerns. Seek expert astrological guidance.":"Significant issues. Consult an experienced astrologer before proceeding.";

  return {
    totalScore: Math.round(total * 10) / 10,
    maxScore: 36,
    percentage: pct,
    verdict, verdictColor,
    factors,
    nadiDosha, bhakootDosha,
    dosha: nadiDosha ? "Nadi Dosha" : bhakootDosha ? "Bhakoot Dosha" : null,
    recommendation,
  };
}
