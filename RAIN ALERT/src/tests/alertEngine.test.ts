import { describe, it, expect } from 'vitest';
import { calculateRisk } from '../alerts/alertEngine';

describe('Alert Engine (calculateRisk)', () => {
  it('identifies DANGER when water level is above official danger level (Screenshot scenario)', () => {
    const result = calculateRisk({
      distanceFromRiverKm: 2.8,
      currentWaterLevel: 325.42,
      warningLevel: 323.50,
      dangerLevel: 325.00,
      highestFloodLevel: 327.40,
      stationName: 'Rewa Division (Sone River)',
      divisionName: 'Rewa Division',
    });

    expect(result.level).toBe('DANGER');
    expect(result.headline).toContain('above Danger');
    expect(result.shouldTriggerBrowserNotification).toBe(true);
    expect(result.badgeLabel).toBe('DANGER');
  });

  it('identifies EXTREME when water level reaches or exceeds High Flood Level (HFL)', () => {
    const result = calculateRisk({
      distanceFromRiverKm: 1.5,
      currentWaterLevel: 327.60,
      warningLevel: 323.50,
      dangerLevel: 325.00,
      highestFloodLevel: 327.40,
      stationName: 'Rewa Division',
      divisionName: 'Rewa Division',
    });

    expect(result.level).toBe('EXTREME');
    expect(result.headline).toContain('High Flood Level');
    expect(result.shouldTriggerBrowserNotification).toBe(true);
  });

  it('identifies HIGH RISK when very close and above warning level', () => {
    const result = calculateRisk({
      distanceFromRiverKm: 3.5,
      currentWaterLevel: 324.10,
      warningLevel: 323.50,
      dangerLevel: 325.00,
      highestFloodLevel: 327.40,
      rateOfRisePerHour: 0.18,
      stationName: 'Rewa Division',
      divisionName: 'Rewa Division',
    });

    expect(result.level).toBe('HIGH_RISK');
    expect(result.shouldTriggerBrowserNotification).toBe(true);
  });

  it('identifies WARNING when approaching warning level', () => {
    const result = calculateRisk({
      distanceFromRiverKm: 8.0,
      currentWaterLevel: 323.20, // within 50cm of warning
      warningLevel: 323.50,
      dangerLevel: 325.00,
      stationName: 'Rewa Division',
      divisionName: 'Rewa Division',
    });

    expect(result.level).toBe('WARNING');
  });

  it('identifies SAFE when user is far away and water is normal', () => {
    const result = calculateRisk({
      distanceFromRiverKm: 35.0,
      currentWaterLevel: 320.50,
      warningLevel: 323.50,
      dangerLevel: 325.00,
      stationName: 'Rewa Division',
      divisionName: 'Rewa Division',
    });

    expect(result.level).toBe('SAFE');
    expect(result.headline).toContain('normal');
    expect(result.shouldTriggerBrowserNotification).toBe(false);
  });
});
