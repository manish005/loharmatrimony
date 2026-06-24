"use strict";
// City lookup table for India — lat/lng for common cities
// Used to geocode birthPlace string without API keys
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCityCoords = getCityCoords;
const CITY_DB = {
    // Maharashtra
    "mumbai": { lat: 19.0760, lng: 72.8777, timezone: 5.5 },
    "pune": { lat: 18.5204, lng: 73.8567, timezone: 5.5 },
    "nagpur": { lat: 21.1458, lng: 79.0882, timezone: 5.5 },
    "nashik": { lat: 20.0059, lng: 73.7898, timezone: 5.5 },
    "aurangabad": { lat: 19.8762, lng: 75.3433, timezone: 5.5 },
    "solapur": { lat: 17.6599, lng: 75.9064, timezone: 5.5 },
    "kolhapur": { lat: 16.7050, lng: 74.2433, timezone: 5.5 },
    "thane": { lat: 19.2183, lng: 72.9781, timezone: 5.5 },
    "navi mumbai": { lat: 19.0330, lng: 73.0297, timezone: 5.5 },
    "amravati": { lat: 20.9320, lng: 77.7523, timezone: 5.5 },
    "jalgaon": { lat: 21.0077, lng: 75.5626, timezone: 5.5 },
    "akola": { lat: 20.7096, lng: 77.0067, timezone: 5.5 },
    "latur": { lat: 18.4088, lng: 76.5604, timezone: 5.5 },
    "dhule": { lat: 20.9042, lng: 74.7749, timezone: 5.5 },
    "sangli": { lat: 16.8524, lng: 74.5815, timezone: 5.5 },
    "satara": { lat: 17.6805, lng: 74.0183, timezone: 5.5 },
    "ahmednagar": { lat: 19.0952, lng: 74.7496, timezone: 5.5 },
    "nanded": { lat: 19.1383, lng: 77.3210, timezone: 5.5 },
    "bid": { lat: 18.9891, lng: 75.7601, timezone: 5.5 },
    "osmanabad": { lat: 18.1860, lng: 76.0403, timezone: 5.5 },
    // Gujarat
    "ahmedabad": { lat: 23.0225, lng: 72.5714, timezone: 5.5 },
    "surat": { lat: 21.1702, lng: 72.8311, timezone: 5.5 },
    "vadodara": { lat: 22.3072, lng: 73.1812, timezone: 5.5 },
    "rajkot": { lat: 22.3039, lng: 70.8022, timezone: 5.5 },
    "gandhinagar": { lat: 23.2156, lng: 72.6369, timezone: 5.5 },
    // Rajasthan
    "jaipur": { lat: 26.9124, lng: 75.7873, timezone: 5.5 },
    "jodhpur": { lat: 26.2389, lng: 73.0243, timezone: 5.5 },
    "udaipur": { lat: 24.5854, lng: 73.7125, timezone: 5.5 },
    "kota": { lat: 25.2138, lng: 75.8648, timezone: 5.5 },
    "bikaner": { lat: 28.0229, lng: 73.3119, timezone: 5.5 },
    "ajmer": { lat: 26.4499, lng: 74.6399, timezone: 5.5 },
    // Delhi / NCR
    "delhi": { lat: 28.6139, lng: 77.2090, timezone: 5.5 },
    "new delhi": { lat: 28.6139, lng: 77.2090, timezone: 5.5 },
    "noida": { lat: 28.5355, lng: 77.3910, timezone: 5.5 },
    "gurgaon": { lat: 28.4595, lng: 77.0266, timezone: 5.5 },
    "gurugram": { lat: 28.4595, lng: 77.0266, timezone: 5.5 },
    "faridabad": { lat: 28.4089, lng: 77.3178, timezone: 5.5 },
    // Uttar Pradesh
    "lucknow": { lat: 26.8467, lng: 80.9462, timezone: 5.5 },
    "kanpur": { lat: 26.4499, lng: 80.3319, timezone: 5.5 },
    "varanasi": { lat: 25.3176, lng: 82.9739, timezone: 5.5 },
    "agra": { lat: 27.1767, lng: 78.0081, timezone: 5.5 },
    "allahabad": { lat: 25.4358, lng: 81.8464, timezone: 5.5 },
    "prayagraj": { lat: 25.4358, lng: 81.8464, timezone: 5.5 },
    "mathura": { lat: 27.4924, lng: 77.6737, timezone: 5.5 },
    // Karnataka
    "bangalore": { lat: 12.9716, lng: 77.5946, timezone: 5.5 },
    "bengaluru": { lat: 12.9716, lng: 77.5946, timezone: 5.5 },
    "mysuru": { lat: 12.2958, lng: 76.6394, timezone: 5.5 },
    "mysore": { lat: 12.2958, lng: 76.6394, timezone: 5.5 },
    "hubli": { lat: 15.3647, lng: 75.1240, timezone: 5.5 },
    "mangalore": { lat: 12.9141, lng: 74.8560, timezone: 5.5 },
    // Tamil Nadu
    "chennai": { lat: 13.0827, lng: 80.2707, timezone: 5.5 },
    "madras": { lat: 13.0827, lng: 80.2707, timezone: 5.5 },
    "coimbatore": { lat: 11.0168, lng: 76.9558, timezone: 5.5 },
    "madurai": { lat: 9.9252, lng: 78.1198, timezone: 5.5 },
    "salem": { lat: 11.6643, lng: 78.1460, timezone: 5.5 },
    // Telangana / Andhra Pradesh
    "hyderabad": { lat: 17.3850, lng: 78.4867, timezone: 5.5 },
    "secunderabad": { lat: 17.4399, lng: 78.4983, timezone: 5.5 },
    "warangal": { lat: 17.9784, lng: 79.5941, timezone: 5.5 },
    "visakhapatnam": { lat: 17.6868, lng: 83.2185, timezone: 5.5 },
    "vijayawada": { lat: 16.5062, lng: 80.6480, timezone: 5.5 },
    // Madhya Pradesh
    "bhopal": { lat: 23.2599, lng: 77.4126, timezone: 5.5 },
    "indore": { lat: 22.7196, lng: 75.8577, timezone: 5.5 },
    "jabalpur": { lat: 23.1815, lng: 79.9864, timezone: 5.5 },
    "gwalior": { lat: 26.2183, lng: 78.1828, timezone: 5.5 },
    // West Bengal
    "kolkata": { lat: 22.5726, lng: 88.3639, timezone: 5.5 },
    "calcutta": { lat: 22.5726, lng: 88.3639, timezone: 5.5 },
    "howrah": { lat: 22.5958, lng: 88.2636, timezone: 5.5 },
    "durgapur": { lat: 23.5204, lng: 87.3119, timezone: 5.5 },
    // Punjab / Haryana
    "chandigarh": { lat: 30.7333, lng: 76.7794, timezone: 5.5 },
    "amritsar": { lat: 31.6340, lng: 74.8723, timezone: 5.5 },
    "ludhiana": { lat: 30.9010, lng: 75.8573, timezone: 5.5 },
    // Bihar
    "patna": { lat: 25.5941, lng: 85.1376, timezone: 5.5 },
    // Jharkhand
    "ranchi": { lat: 23.3441, lng: 85.3096, timezone: 5.5 },
    "jamshedpur": { lat: 22.8046, lng: 86.2029, timezone: 5.5 },
    // Odisha
    "bhubaneswar": { lat: 20.2961, lng: 85.8245, timezone: 5.5 },
    // Kerala
    "thiruvananthapuram": { lat: 8.5241, lng: 76.9366, timezone: 5.5 },
    "kochi": { lat: 9.9312, lng: 76.2673, timezone: 5.5 },
    "kozhikode": { lat: 11.2588, lng: 75.7804, timezone: 5.5 },
    // Goa
    "panaji": { lat: 15.4909, lng: 73.8278, timezone: 5.5 },
    "goa": { lat: 15.2993, lng: 74.1240, timezone: 5.5 },
};
function getCityCoords(cityName) {
    const key = cityName.trim().toLowerCase();
    // Exact match
    if (CITY_DB[key])
        return CITY_DB[key];
    // Partial match — find first city that contains the search term
    for (const [city, coords] of Object.entries(CITY_DB)) {
        if (key.includes(city) || city.includes(key))
            return coords;
    }
    // Default to Pune, India if not found
    console.warn(`City not found: "${cityName}", defaulting to Pune`);
    return { lat: 18.5204, lng: 73.8567, timezone: 5.5 };
}
//# sourceMappingURL=geocode.js.map