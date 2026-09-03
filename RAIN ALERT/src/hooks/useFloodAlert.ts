import { useMemo, useEffect } from 'react';
import { StationHydrologyData } from '../types/hydrology';
import { ProximityResult, RiskAssessmentResult } from '../types/alert';
import { calculateRisk } from '../alerts/alertEngine';
import { NotificationService } from '../alerts/notificationService';

export function useFloodAlert(
  stationData: StationHydrologyData | null,
  proximity: ProximityResult
): RiskAssessmentResult | null {
  const riskResult = useMemo(() => {
    if (!stationData) return null;

    return calculateRisk({
      distanceFromRiverKm: proximity.distanceKm,
      currentWaterLevel: stationData.currentLevel,
      warningLevel: stationData.warningLevel,
      dangerLevel: stationData.dangerLevel,
      highestFloodLevel: stationData.highestFloodLevel,
      rateOfRisePerHour: stationData.rateOfRisePerHour,
      hasOfficialEmergencyNotice: stationData.currentLevel >= stationData.highestFloodLevel,
      stationName: stationData.station.name,
      divisionName: stationData.station.division,
    });
  }, [stationData, proximity.distanceKm]);

  // Attempt to notify user if risk assessment warrants notification
  useEffect(() => {
    if (riskResult && riskResult.shouldTriggerBrowserNotification) {
      NotificationService.dispatchAlert(
        riskResult.notificationTitle,
        riskResult.notificationBody,
        riskResult.level
      );
    }
  }, [riskResult]);

  return riskResult;
}
