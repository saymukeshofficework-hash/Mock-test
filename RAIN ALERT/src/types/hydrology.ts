export type DataSourceType = 'LIVE' | 'DELAYED' | 'LAST_KNOWN' | 'DEMO';

export interface HydrologyReading {
  timestamp: string; // ISO format or formatted time
  waterLevel: number; // in meters (MSL or gauge datum)
  dischargeRate?: number; // m3/s or cusecs if available
  isForecast?: boolean;
}

export interface MonitoringStation {
  id: string;
  name: string;
  hindiName?: string;
  river: string;
  division: string;
  district: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  warningLevel: number; // in meters
  dangerLevel: number; // in meters
  highestFloodLevel?: number; // HFL in meters
  highestFloodDate?: string;
  gaugeDatum?: number; // meters above MSL
  cwcStationCode?: string;
}

export interface StationHydrologyData {
  station: MonitoringStation;
  currentLevel: number;
  warningLevel: number;
  dangerLevel: number;
  highestFloodLevel: number;
  unit: string;
  trend: 'RISING' | 'FALLING' | 'STEADY';
  rateOfRisePerHour: number; // meters per hour
  lastUpdated: string;
  history: HydrologyReading[]; // Past 48-72 hours
  forecast: HydrologyReading[]; // Next 24-48 hours
  peakLevelRecently: {
    level: number;
    timestamp: string;
  };
  dataSource: DataSourceType;
  providerName: string;
  statusNote?: string;
}

export interface BasinSummary {
  basinName: string;
  overallStatus: 'NORMAL' | 'ALERT' | 'CRITICAL';
  totalStationsMonitored: number;
  stationsAboveDanger: number;
  stationsAboveWarning: number;
  lastUpdated: string;
}
