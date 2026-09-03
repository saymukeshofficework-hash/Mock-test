import { describe, it, expect } from 'vitest';
import {
  calculateHaversineDistanceKm,
  distanceToSegmentKm,
  calculateDistanceToSoneRiver,
  findNearestStation,
  evaluateRiverProximity,
} from '../services/geoUtils';
import { CWC_SONE_STATIONS } from '../config/stationsConfig';

describe('Geospatial Utilities (geoUtils)', () => {
  it('calculates accurate Haversine distance between two coordinates', () => {
    // Distance between Patna (25.5941, 85.1376) and Dehri (24.908, 84.184) is approx 122 km
    const dist = calculateHaversineDistanceKm(25.5941, 85.1376, 24.908, 84.184);
    expect(dist).toBeGreaterThan(115);
    expect(dist).toBeLessThan(130);
  });

  it('calculates identical distance for zero separation', () => {
    const dist = calculateHaversineDistanceKm(24.5, 82.0, 24.5, 82.0);
    expect(dist).toBeCloseTo(0, 4);
  });

  it('calculates point-to-segment perpendicular distance accurately', () => {
    // Segment along latitude line from (24.0, 80.0) to (24.0, 82.0)
    // Point at (24.1, 81.0) -> approx 0.1 degree north (~11.1 km)
    const result = distanceToSegmentKm(24.1, 81.0, 24.0, 80.0, 24.0, 82.0);
    expect(result.distanceKm).toBeGreaterThan(10);
    expect(result.distanceKm).toBeLessThan(12);
  });

  it('detects point close to Sone River at Dehri-on-Sone', () => {
    // Point in Dehri town: 24.912, 84.195
    const { minDistanceKm } = calculateDistanceToSoneRiver(24.912, 84.195);
    expect(minDistanceKm).toBeLessThan(3.0);
  });

  it('accurately identifies user location (23.72, 81.19) as 1.5 - 3.5 km from Sone River', () => {
    const { minDistanceKm, nearestPoint } = calculateDistanceToSoneRiver(23.72, 81.19);
    expect(minDistanceKm).toBeGreaterThanOrEqual(1.5);
    expect(minDistanceKm).toBeLessThanOrEqual(3.5);
    expect(nearestPoint.lat).toBeCloseTo(23.72, 1);
    expect(nearestPoint.lng).toBeCloseTo(81.21, 1);
  });

  it('accurately identifies location (23.67, 81.39) as immediate riverfront (< 1.0 km)', () => {
    const { minDistanceKm } = calculateDistanceToSoneRiver(23.67, 81.39);
    expect(minDistanceKm).toBeLessThan(1.0);
    const nearestSt = findNearestStation(23.67, 81.39);
    expect(nearestSt.station.id).toBe('station-shahdol');
    expect(nearestSt.distanceKm).toBeLessThan(1.0);
  });

  it('detects point far from Sone River at New Delhi', () => {
    // Delhi: 28.6139, 77.209
    const { minDistanceKm } = calculateDistanceToSoneRiver(28.6139, 77.209);
    expect(minDistanceKm).toBeGreaterThan(500);
  });

  it('finds the nearest CWC monitoring station accurately', () => {
    // Test point near Rewa (24.502, 82.102)
    const { station } = findNearestStation(24.502, 82.102, CWC_SONE_STATIONS);
    expect(station.id).toBe('station-rewa');
  });

  it('evaluates proximity flags correctly', () => {
    // Immediate riverfront point (< 2km)
    const prox = evaluateRiverProximity(24.908, 84.184);
    expect(prox.isNearRiver).toBe(true);
    expect(prox.isVeryClose).toBe(true);
    expect(prox.isInRiverfrontZone).toBe(true);
  });
});
