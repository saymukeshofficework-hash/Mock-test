import { SONE_RIVER_POLYLINE, SONE_RIVER_CONFIG } from '../config/riverConfig';
import { CWC_SONE_STATIONS } from '../config/stationsConfig';
import { MonitoringStation } from '../types/hydrology';
import { ProximityResult } from '../types/alert';

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates Haversine distance between two coordinates in kilometers.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculates the shortest distance from a point P to a line segment AB in kilometers.
 * Uses flat-earth approximation projected onto meters, suitable for small to medium segments.
 */
export function distanceToSegmentKm(
  pLat: number,
  pLng: number,
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): { distanceKm: number; nearestPoint: { lat: number; lng: number } } {
  // Convert lat/lng differences to km using local cosine scaling
  const midLat = toRadians((aLat + bLat) / 2);
  const cosLat = Math.cos(midLat);

  // Approximate km offsets relative to point A
  const bx = (bLng - aLng) * (Math.PI / 180) * EARTH_RADIUS_KM * cosLat;
  const by = (bLat - aLat) * (Math.PI / 180) * EARTH_RADIUS_KM;

  const px = (pLng - aLng) * (Math.PI / 180) * EARTH_RADIUS_KM * cosLat;
  const py = (pLat - aLat) * (Math.PI / 180) * EARTH_RADIUS_KM;

  const segmentLengthSq = bx * bx + by * by;

  let t = 0;
  if (segmentLengthSq > 0) {
    t = (px * bx + py * by) / segmentLengthSq;
    t = Math.max(0, Math.min(1, t));
  }

  // Projected nearest point coordinates
  const nearestLat = aLat + t * (bLat - aLat);
  const nearestLng = aLng + t * (bLng - aLng);

  // Exact haversine from P to nearest point
  const distanceKm = calculateHaversineDistanceKm(pLat, pLng, nearestLat, nearestLng);

  return {
    distanceKm,
    nearestPoint: { lat: nearestLat, lng: nearestLng },
  };
}

/**
 * Calculates the minimum distance from a coordinate to the complete Sone River polyline.
 */
export function calculateDistanceToSoneRiver(
  userLat: number,
  userLng: number
): { minDistanceKm: number; nearestPoint: { lat: number; lng: number } } {
  let minDistanceKm = Infinity;
  let nearestPoint = { lat: SONE_RIVER_POLYLINE[0][0], lng: SONE_RIVER_POLYLINE[0][1] };

  for (let i = 0; i < SONE_RIVER_POLYLINE.length - 1; i++) {
    const a = SONE_RIVER_POLYLINE[i];
    const b = SONE_RIVER_POLYLINE[i + 1];

    const { distanceKm, nearestPoint: pt } = distanceToSegmentKm(
      userLat,
      userLng,
      a[0],
      a[1],
      b[0],
      b[1]
    );

    if (distanceKm < minDistanceKm) {
      minDistanceKm = distanceKm;
      nearestPoint = pt;
    }
  }

  return {
    minDistanceKm: Math.round(minDistanceKm * 10) / 10,
    nearestPoint,
  };
}

/**
 * Finds the nearest CWC monitoring station along the Sone River.
 */
export function findNearestStation(
  userLat: number,
  userLng: number,
  stations: MonitoringStation[] = CWC_SONE_STATIONS
): { station: MonitoringStation; distanceKm: number } {
  let nearestStation = stations[0];
  let minDistanceKm = Infinity;

  for (const station of stations) {
    const dist = calculateHaversineDistanceKm(
      userLat,
      userLng,
      station.coordinates.lat,
      station.coordinates.lng
    );

    if (dist < minDistanceKm) {
      minDistanceKm = dist;
      nearestStation = station;
    }
  }

  return {
    station: nearestStation,
    distanceKm: Math.round(minDistanceKm * 10) / 10,
  };
}

/**
 * Full proximity evaluation relative to Sone River.
 */
export function evaluateRiverProximity(userLat: number, userLng: number): ProximityResult {
  const { minDistanceKm, nearestPoint } = calculateDistanceToSoneRiver(userLat, userLng);
  const { station } = findNearestStation(userLat, userLng);

  const { riverfrontCriticalKm, veryCloseKm, nearRiverKm } =
    SONE_RIVER_CONFIG.proximityThresholds;

  return {
    distanceKm: minDistanceKm,
    nearestRiverPoint: nearestPoint,
    nearestStationId: station.id,
    isInRiverfrontZone: minDistanceKm <= riverfrontCriticalKm,
    isVeryClose: minDistanceKm <= veryCloseKm,
    isNearRiver: minDistanceKm <= nearRiverKm,
  };
}
