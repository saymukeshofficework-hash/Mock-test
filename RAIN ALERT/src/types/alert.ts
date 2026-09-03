export type RiskLevel = 'SAFE' | 'WARNING' | 'HIGH_RISK' | 'DANGER' | 'EXTREME';

export interface RiskAssessmentResult {
  level: RiskLevel;
  badgeLabel: string;
  headline: string; // e.g. "River level is above Danger"
  subheadline: string;
  advisoryText: string; // e.g. "Continue to use caution if going near the riverfront."
  colorClass: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    pulseColor: string;
    glowHex: string;
  };
  distanceKm: number;
  isWithinDangerZone: boolean;
  shouldTriggerBrowserNotification: boolean;
  notificationTitle: string;
  notificationBody: string;
  emergencyActions: string[];
}

export interface UserLocationState {
  coords: {
    latitude: number;
    longitude: number;
  } | null;
  accuracyMeters: number | null;
  locality: string | null;
  district: string | null;
  state: string | null;
  isCustomLocation: boolean;
  isDetecting: boolean;
  error: string | null;
  permissionGranted: boolean | null;
}

export interface ProximityResult {
  distanceKm: number;
  nearestRiverPoint: {
    lat: number;
    lng: number;
  };
  nearestStationId: string;
  isNearRiver: boolean; // <= 10km
  isVeryClose: boolean; // <= 5km
  isInRiverfrontZone: boolean; // <= 2km
}

export interface AffectedAreaLocation {
  id: string;
  name: string;
  division: string;
  district: string;
  riskLevel: RiskLevel;
  currentLevel: number;
  dangerLevel: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}
