// Geocoding service for city coordinates
// This module provides city coordinate lookup for astro calculations

interface CityCoords {
  lat: number;
  lng: number;
  timezone: number;
}

const CITY_COORDS: Record<string, CityCoords> = {
  // Major Indian cities with approximate coordinates and timezone
  Pune: { lat: 18.5204, lng: 73.8567, timezone: 5.5 },
  Mumbai: { lat: 19.0760, lng: 72.8777, timezone: 5.5 },
  Delhi: { lat: 28.7041, lng: 77.1025, timezone: 5.5 },
  Bangalore: { lat: 12.9716, lng: 77.5946, timezone: 5.5 },
  Chennai: { lat: 13.0827, lng: 80.2707, timezone: 5.5 },
  Kolkata: { lat: 22.5726, lng: 88.3639, timezone: 5.5 },
  Hyderabad: { lat: 17.3850, lng: 78.4867, timezone: 5.5 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714, timezone: 5.5 },
  Jaipur: { lat: 26.9124, lng: 75.7873, timezone: 5.5 },
  Lucknow: { lat: 26.8467, lng: 80.9462, timezone: 5.5 },
  // Additional cities can be added as needed
};

export function getCityCoords(city: string): CityCoords {
  const normalizedCity = city.trim();
  
  if (CITY_COORDS[normalizedCity]) {
    return CITY_COORDS[normalizedCity];
  }
  
  // Default to Pune if city not found
  console.warn(`City coordinates not found for "${city}". Using default (Pune).`);
  return CITY_COORDS.Pune;
}
