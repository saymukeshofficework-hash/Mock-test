import { UserLocationState } from '../types/alert';

export interface PresetLocation {
  id: string;
  name: string;
  division: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  description: string;
  expectedDistanceKm: number;
}

export const PRESET_LOCATIONS: PresetLocation[] = [
  {
    id: 'loc-rewa',
    name: 'Rewa Division (Near Sone Ghat)',
    division: 'Rewa Division',
    district: 'Rewa',
    state: 'Madhya Pradesh',
    lat: 24.502,
    lng: 82.102,
    description: 'Near Sone River floodplain in Rewa Division (Screenshot location)',
    expectedDistanceKm: 2.8,
  },
  {
    id: 'loc-dehri',
    name: 'Dehri-on-Sone (Riverfront Road)',
    division: 'Patna Division',
    district: 'Rohtas',
    state: 'Bihar',
    lat: 24.912,
    lng: 84.195,
    description: 'Adjacent to Sone River causeway in Dehri town',
    expectedDistanceKm: 1.2,
  },
  {
    id: 'loc-indrapuri',
    name: 'Indrapuri Barrage Embankment',
    division: 'Patna Division',
    district: 'Rohtas',
    state: 'Bihar',
    lat: 24.848,
    lng: 84.038,
    description: 'Downstream of major flood discharge gates',
    expectedDistanceKm: 0.6,
  },
  {
    id: 'loc-koelwar',
    name: 'Koelwar (Sone Bridge East)',
    division: 'Patna Division',
    district: 'Bhojpur',
    state: 'Bihar',
    lat: 25.572,
    lng: 84.738,
    description: 'Near railway and road bridge crossing Sone',
    expectedDistanceKm: 0.9,
  },
  {
    id: 'loc-chopan',
    name: 'Chopan (Sonbhadra Valley)',
    division: 'Mirzapur Division',
    district: 'Sonbhadra',
    state: 'Uttar Pradesh',
    lat: 24.532,
    lng: 83.032,
    description: 'Near Sonbhadra gorge riverfront',
    expectedDistanceKm: 1.5,
  },
  {
    id: 'loc-patna-city',
    name: 'Patna City (Gandhi Maidan)',
    division: 'Patna Division',
    district: 'Patna',
    state: 'Bihar',
    lat: 25.618,
    lng: 85.141,
    description: 'Safe metropolitan area distant from Sone River',
    expectedDistanceKm: 32.5,
  },
  {
    id: 'loc-delhi',
    name: 'New Delhi (Out of Basin)',
    division: 'National Capital Region',
    district: 'New Delhi',
    state: 'Delhi',
    lat: 28.6139,
    lng: 77.209,
    description: 'Far outside Sone River basin (Safe test)',
    expectedDistanceKm: 780.0,
  },
];

export async function requestDeviceLocation(): Promise<UserLocationState> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return {
      coords: null,
      accuracyMeters: null,
      locality: null,
      district: null,
      state: null,
      isCustomLocation: false,
      isDetecting: false,
      error: 'Geolocation is not supported by your browser.',
      permissionGranted: false,
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const geocode = await reverseGeocodeLocal(latitude, longitude);

        resolve({
          coords: { latitude, longitude },
          accuracyMeters: Math.round(accuracy),
          locality: geocode.locality,
          district: geocode.district,
          state: geocode.state,
          isCustomLocation: false,
          isDetecting: false,
          error: null,
          permissionGranted: true,
        });
      },
      (geoError) => {
        let msg = 'Unable to determine your location.';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access or select a location manually.';
        } else if (geoError.code === geoError.TIMEOUT) {
          msg = 'Location request timed out. Please retry or select a location manually.';
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable.';
        }

        resolve({
          coords: null,
          accuracyMeters: null,
          locality: null,
          district: null,
          state: null,
          isCustomLocation: false,
          isDetecting: false,
          error: msg,
          permissionGranted: false,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Fast offline/local reverse geocoder tailored for Sone basin coordinates,
 * with optional Nominatim online fallback.
 */
export async function reverseGeocodeLocal(
  lat: number,
  lng: number
): Promise<{ locality: string; district: string; state: string }> {
  // Sone basin local heuristics
  if (lat >= 23.0 && lat <= 24.2 && lng >= 81.0 && lng <= 81.7) {
    return { locality: 'Shahdol Division (Upper Sone)', district: 'Shahdol / Umaria', state: 'Madhya Pradesh' };
  }
  if (lat >= 24.2 && lat <= 24.8 && lng >= 81.6 && lng <= 82.8) {
    return { locality: 'Rewa Division', district: 'Rewa / Sidhi', state: 'Madhya Pradesh' };
  }
  if (lat >= 24.3 && lat <= 24.7 && lng >= 82.8 && lng <= 83.6) {
    return { locality: 'Chopan Area', district: 'Sonbhadra', state: 'Uttar Pradesh' };
  }
  if (lat >= 24.7 && lat <= 25.1 && lng >= 83.8 && lng <= 84.4) {
    return { locality: 'Dehri-on-Sone', district: 'Rohtas', state: 'Bihar' };
  }
  if (lat >= 25.0 && lat <= 25.4 && lng >= 84.1 && lng <= 84.6) {
    return { locality: 'Daudnagar / Arwal', district: 'Aurangabad / Arwal', state: 'Bihar' };
  }
  if (lat >= 25.4 && lat <= 25.8 && lng >= 84.5 && lng <= 85.0) {
    return { locality: 'Koelwar / Maner', district: 'Bhojpur / Patna', state: 'Bihar' };
  }

  // Try online reverse geocode with short timeout
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2500);
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { signal: controller.signal }
    );
    clearTimeout(id);
    if (resp.ok) {
      const data = await resp.json();
      const addr = data.address || {};
      const locality = addr.city || addr.town || addr.village || addr.suburb || 'Local Area';
      const district = addr.county || addr.state_district || 'Regional District';
      const state = addr.state || 'India';
      return { locality, district, state };
    }
  } catch {
    // Ignore network error in geocoding
  }

  return {
    locality: `Approx. ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`,
    district: 'Basin Region',
    state: 'India',
  };
}
