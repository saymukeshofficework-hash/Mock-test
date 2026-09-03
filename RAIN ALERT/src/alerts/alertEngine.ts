import { RiskLevel, RiskAssessmentResult } from '../types/alert';

export interface AlertEngineParams {
  distanceFromRiverKm: number;
  currentWaterLevel: number;
  warningLevel: number;
  dangerLevel: number;
  highestFloodLevel?: number;
  rateOfRisePerHour?: number;
  hasOfficialEmergencyNotice?: boolean;
  stationName: string;
  divisionName: string;
}

export function calculateRisk(params: AlertEngineParams): RiskAssessmentResult {
  const {
    distanceFromRiverKm,
    currentWaterLevel,
    warningLevel,
    dangerLevel,
    highestFloodLevel,
    rateOfRisePerHour = 0,
    hasOfficialEmergencyNotice = false,
    stationName,
    divisionName,
  } = params;

  const isAboveDanger = currentWaterLevel >= dangerLevel;
  const isAboveWarning = currentWaterLevel >= warningLevel;
  const isNearWarning = currentWaterLevel >= warningLevel - 0.5; // Within 50cm of warning
  const isApproachingHFL = highestFloodLevel && currentWaterLevel >= highestFloodLevel;
  const isRapidlyRising = rateOfRisePerHour >= 0.15; // >15 cm/hour rise

  const isRiverfront = distanceFromRiverKm <= 2.0;
  const isVeryClose = distanceFromRiverKm <= 5.0;
  const isNearRiver = distanceFromRiverKm <= 10.0;

  let level: RiskLevel = 'SAFE';
  let badgeLabel = 'SAFE';
  let headline = 'River level is normal';
  let advisoryText = 'No active flood threat detected in your vicinity.';
  let shouldTriggerBrowserNotification = false;

  // 1. EXTREME / CRITICAL
  if (
    hasOfficialEmergencyNotice ||
    isApproachingHFL ||
    (isAboveDanger && isRiverfront && isRapidlyRising)
  ) {
    level = 'EXTREME';
    badgeLabel = 'CRITICAL / EXTREME';
    headline = isApproachingHFL
      ? 'River has breached Record High Flood Level (HFL)!'
      : 'Severe Emergency Flood Alert in Effect';
    advisoryText =
      'Immediate danger to life and property. Evacuate low-lying riverfront zones immediately following district administration orders.';
    shouldTriggerBrowserNotification = true;
  }
  // 2. DANGER
  else if (isAboveDanger || (isAboveWarning && isRiverfront)) {
    level = 'DANGER';
    badgeLabel = 'DANGER';
    headline = isAboveDanger
      ? 'River level is above Danger'
      : 'Critical Inundation Risk Near Riverfront';
    advisoryText = isRiverfront
      ? 'You are within 2 km of the overflowing Sone River. Move to elevated ground immediately.'
      : 'Continue to use caution and avoid riverfront embankments and low bridges.';
    shouldTriggerBrowserNotification = true;
  }
  // 3. HIGH RISK
  else if (
    (isAboveWarning && isVeryClose) ||
    (isNearWarning && isRiverfront) ||
    (isAboveWarning && isRapidlyRising)
  ) {
    level = 'HIGH_RISK';
    badgeLabel = 'HIGH RISK';
    headline = 'River level is near or above Warning threshold';
    advisoryText =
      'Water levels are significantly elevated and threatening low-lying crossings. Stay alert and avoid water channels.';
    shouldTriggerBrowserNotification = true;
  }
  // 4. WARNING
  else if (isAboveWarning || isNearWarning || (isNearRiver && isRapidlyRising)) {
    level = 'WARNING';
    badgeLabel = 'WARNING';
    headline = isAboveWarning
      ? 'River level is above Warning'
      : 'River level is approaching Warning mark';
    advisoryText =
      'Water level is rising. Local villagers, bathers, and cattle grazers must stay clear of the banks.';
    shouldTriggerBrowserNotification = isVeryClose;
  }
  // 5. SAFE (default)
  else {
    level = 'SAFE';
    badgeLabel = 'SAFE';
    headline = 'River level is within normal range';
    advisoryText = isNearRiver
      ? `You are currently ${distanceFromRiverKm.toFixed(1)} km from Sone River. Water level is safe.`
      : `You are safely distant (${distanceFromRiverKm.toFixed(1)} km) from the Sone River basin.`;
    shouldTriggerBrowserNotification = false;
  }

  // Visual Theme Colors matching Google Flood Alert & Dark UX
  const colorMap: Record<RiskLevel, RiskAssessmentResult['colorClass']> = {
    SAFE: {
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-400',
      border: 'border-emerald-800/40',
      badgeBg: 'bg-emerald-500/20',
      badgeText: 'text-emerald-300',
      pulseColor: 'bg-emerald-500',
      glowHex: '#10b981',
    },
    WARNING: {
      bg: 'bg-amber-950/40',
      text: 'text-amber-400',
      border: 'border-amber-700/50',
      badgeBg: 'bg-amber-500/20',
      badgeText: 'text-amber-300',
      pulseColor: 'bg-amber-500',
      glowHex: '#f59e0b',
    },
    HIGH_RISK: {
      bg: 'bg-orange-950/40',
      text: 'text-orange-400',
      border: 'border-orange-700/50',
      badgeBg: 'bg-orange-500/20',
      badgeText: 'text-orange-300',
      pulseColor: 'bg-orange-500',
      glowHex: '#f97316',
    },
    DANGER: {
      bg: 'bg-rose-950/40',
      text: 'text-rose-400',
      border: 'border-rose-700/50',
      badgeBg: 'bg-rose-500/20',
      badgeText: 'text-rose-300',
      pulseColor: 'bg-rose-500',
      glowHex: '#f43f5e',
    },
    EXTREME: {
      bg: 'bg-purple-950/50',
      text: 'text-purple-300',
      border: 'border-purple-600/60',
      badgeBg: 'bg-purple-500/25',
      badgeText: 'text-purple-200',
      pulseColor: 'bg-purple-500',
      glowHex: '#a855f7',
    },
  };

  const notificationTitle =
    level === 'EXTREME'
      ? '🚨 CRITICAL: Sone River Flood Evacuation Alert'
      : level === 'DANGER'
      ? '🔴 DANGER: Sone River Above Danger Level'
      : level === 'HIGH_RISK'
      ? '🟠 HIGH RISK: Sone River Rapidly Rising'
      : '⚠️ Sone River Water Level Warning';

  const notificationBody = `${headline} at ${stationName} (${divisionName}). Distance: ${distanceFromRiverKm.toFixed(
    1
  )} km. Exercise extreme caution.`;

  const emergencyActions: string[] = [];
  if (level === 'EXTREME' || level === 'DANGER') {
    emergencyActions.push('Move immediately to higher ground away from riverfronts and low-lying terraces.');
    emergencyActions.push('Do NOT attempt to cross submerged causeways, culverts, or bridges.');
    emergencyActions.push('Keep emergency contact numbers handy (NDRF 1078, State Disaster 1070).');
    emergencyActions.push('Secure livestock and switch off main electric circuit if water enters premises.');
  } else if (level === 'HIGH_RISK' || level === 'WARNING') {
    emergencyActions.push('Avoid going to river ghats, bathing points, and sandbars.');
    emergencyActions.push('Monitor official Central Water Commission (CWC) updates closely.');
    emergencyActions.push('Prepare a go-bag with essential documents, dry rations, and flashlights.');
  } else {
    emergencyActions.push('Conditions are currently normal. Check back periodically during monsoon season.');
  }

  return {
    level,
    badgeLabel,
    headline,
    subheadline: `${divisionName}, Sone River`,
    advisoryText,
    colorClass: colorMap[level],
    distanceKm: distanceFromRiverKm,
    isWithinDangerZone: isRiverfront || (isVeryClose && isAboveWarning),
    shouldTriggerBrowserNotification,
    notificationTitle,
    notificationBody,
    emergencyActions,
  };
}
