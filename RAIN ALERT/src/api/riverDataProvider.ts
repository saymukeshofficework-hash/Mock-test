import { StationHydrologyData, BasinSummary } from '../types/hydrology';

export interface IRiverDataProvider {
  readonly providerId: string;
  readonly providerName: string;
  readonly isDemo: boolean;

  getStationHydrology(stationId: string): Promise<StationHydrologyData>;
  getAllStationsHydrology(): Promise<StationHydrologyData[]>;
  getBasinSummary(): Promise<BasinSummary>;
}
