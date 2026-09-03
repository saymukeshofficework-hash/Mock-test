import { IRiverDataProvider } from '../api/riverDataProvider';
import { OpenFloodProvider } from '../api/openFloodProvider';
import { FallbackProvider } from '../api/fallbackProvider';
import { DemoProvider, DemoScenario } from '../api/demoProvider';
import { StationHydrologyData, BasinSummary, DataSourceType } from '../types/hydrology';

class RiverDataServiceManager {
  private openFloodProvider: OpenFloodProvider;
  private fallbackProvider: FallbackProvider;
  private demoProvider: DemoProvider;

  private isDemoModeActive = false;
  private cachedStationData = new Map<string, { data: StationHydrologyData; expiresAt: number }>();
  private cacheTtlMs = 3 * 60 * 1000; // 3 minutes cache

  constructor() {
    this.openFloodProvider = new OpenFloodProvider();
    this.fallbackProvider = new FallbackProvider();
    this.demoProvider = new DemoProvider();
  }

  setDemoMode(enabled: boolean, scenario?: DemoScenario) {
    this.isDemoModeActive = enabled;
    if (scenario) {
      this.demoProvider.setScenario(scenario);
    }
    // Clear cache on mode switch
    this.cachedStationData.clear();
  }

  isDemoMode(): boolean {
    return this.isDemoModeActive;
  }

  getDemoScenario(): DemoScenario {
    return this.demoProvider.getScenario();
  }

  setDemoScenario(scenario: DemoScenario) {
    this.demoProvider.setScenario(scenario);
    this.cachedStationData.clear();
  }

  async getStationData(stationId: string, forceRefresh = false): Promise<StationHydrologyData> {
    const cacheKey = `${this.isDemoModeActive ? 'demo_' + this.demoProvider.getScenario() : 'real'}_${stationId}`;
    const cached = this.cachedStationData.get(cacheKey);

    if (!forceRefresh && cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    let data: StationHydrologyData;

    if (this.isDemoModeActive) {
      data = await this.demoProvider.getStationHydrology(stationId);
    } else {
      try {
        // Try live hydrological provider first
        data = await this.openFloodProvider.getStationHydrology(stationId);
      } catch (err) {
        console.warn('Live API query failed, falling back to verified CWC data:', err);
        // Fall back to verified CWC last-known data
        data = await this.fallbackProvider.getStationHydrology(stationId);
      }
    }

    this.cachedStationData.set(cacheKey, {
      data,
      expiresAt: Date.now() + this.cacheTtlMs,
    });

    return data;
  }

  async getAllStationsData(forceRefresh = false): Promise<StationHydrologyData[]> {
    if (this.isDemoModeActive) {
      return this.demoProvider.getAllStationsHydrology();
    }
    try {
      return await this.openFloodProvider.getAllStationsHydrology();
    } catch {
      return this.fallbackProvider.getAllStationsHydrology();
    }
  }

  async getBasinOverview(): Promise<BasinSummary> {
    if (this.isDemoModeActive) {
      return this.demoProvider.getBasinSummary();
    }
    try {
      return await this.openFloodProvider.getBasinSummary();
    } catch {
      return this.fallbackProvider.getBasinSummary();
    }
  }

  clearCache() {
    this.cachedStationData.clear();
  }
}

export const RiverDataService = new RiverDataServiceManager();
