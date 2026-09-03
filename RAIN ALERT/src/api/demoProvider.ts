import { IRiverDataProvider } from './riverDataProvider';
import { StationHydrologyData, BasinSummary, HydrologyReading } from '../types/hydrology';
import { CWC_SONE_STATIONS } from '../config/stationsConfig';
import { RiskLevel } from '../types/alert';

export type DemoScenario = 'SAFE' | 'WARNING' | 'HIGH_RISK' | 'DANGER' | 'EXTREME';

export class DemoProvider implements IRiverDataProvider {
  readonly providerId = 'demo-simulator';
  readonly providerName = 'Developer Scenario Simulator (DEMO ONLY)';
  readonly isDemo = true;

  private currentScenario: DemoScenario = 'DANGER';

  setScenario(scenario: DemoScenario) {
    this.currentScenario = scenario;
  }

  getScenario(): DemoScenario {
    return this.currentScenario;
  }

  async getStationHydrology(stationId: string): Promise<StationHydrologyData> {
    const station =
      CWC_SONE_STATIONS.find((s) => s.id === stationId) || CWC_SONE_STATIONS[0];

    const warning = station.warningLevel;
    const danger = station.dangerLevel;
    const hfl = station.highestFloodLevel || danger + 2.4;

    let currentLevel = danger + 0.35;
    let trend: 'RISING' | 'FALLING' | 'STEADY' = 'RISING';
    let rateOfRise = 0.08;
    let peakLevel = danger + 0.8;

    switch (this.currentScenario) {
      case 'SAFE':
        currentLevel = warning - 3.2;
        trend = 'STEADY';
        rateOfRise = 0.01;
        peakLevel = warning - 1.5;
        break;
      case 'WARNING':
        currentLevel = warning + 0.15;
        trend = 'RISING';
        rateOfRise = 0.09;
        peakLevel = warning + 0.4;
        break;
      case 'HIGH_RISK':
        currentLevel = danger - 0.25;
        trend = 'RISING';
        rateOfRise = 0.22; // rapid rise
        peakLevel = danger + 0.1;
        break;
      case 'DANGER':
        // Exactly matches user screenshot (above danger level)
        currentLevel = danger + 0.42;
        trend = 'RISING';
        rateOfRise = 0.12;
        peakLevel = danger + 0.85;
        break;
      case 'EXTREME':
        currentLevel = hfl + 0.25;
        trend = 'RISING';
        rateOfRise = 0.35;
        peakLevel = hfl + 0.45;
        break;
    }

    currentLevel = Math.round(currentLevel * 100) / 100;

    // Build matching timeseries
    const history: HydrologyReading[] = [];
    const forecast: HydrologyReading[] = [];

    const curvePoints = [
      currentLevel - 2.8,
      currentLevel - 2.4,
      currentLevel - 2.0,
      currentLevel - 1.4,
      currentLevel - 0.8,
      peakLevel,
      currentLevel - 0.4,
      currentLevel - 0.6,
      currentLevel - 0.2,
      currentLevel,
    ];

    curvePoints.forEach((val, idx) => {
      history.push({
        timestamp: new Date(Date.now() - (curvePoints.length - 1 - idx) * 4 * 3600000).toISOString(),
        waterLevel: Math.round(val * 100) / 100,
        isForecast: false,
      });
    });

    const forecastPoints = [
      currentLevel + (trend === 'RISING' ? 0.2 : -0.2),
      currentLevel + (trend === 'RISING' ? 0.35 : -0.5),
      currentLevel + (trend === 'RISING' ? 0.15 : -0.8),
      currentLevel - 0.3,
    ];

    forecastPoints.forEach((val, idx) => {
      forecast.push({
        timestamp: new Date(Date.now() + (idx + 1) * 6 * 3600000).toISOString(),
        waterLevel: Math.round(val * 100) / 100,
        isForecast: true,
      });
    });

    return {
      station,
      currentLevel,
      warningLevel: warning,
      dangerLevel: danger,
      highestFloodLevel: hfl,
      unit: 'm',
      trend,
      rateOfRisePerHour: rateOfRise,
      lastUpdated: 'Just now (Simulated)',
      history,
      forecast,
      peakLevelRecently: {
        level: peakLevel,
        timestamp: '31/08 04:00 AM',
      },
      dataSource: 'DEMO',
      providerName: `Scenario Simulator [${this.currentScenario}]`,
      statusNote: 'SIMULATION ONLY: Values are generated to test alert UI and safety warnings.',
    };
  }

  async getAllStationsHydrology(): Promise<StationHydrologyData[]> {
    const results = await Promise.all(
      CWC_SONE_STATIONS.map((s) => this.getStationHydrology(s.id))
    );
    return results;
  }

  async getBasinSummary(): Promise<BasinSummary> {
    return {
      basinName: 'Sone River Basin (Simulated Run)',
      overallStatus: this.currentScenario === 'SAFE' ? 'NORMAL' : 'ALERT',
      totalStationsMonitored: CWC_SONE_STATIONS.length,
      stationsAboveDanger: this.currentScenario === 'DANGER' || this.currentScenario === 'EXTREME' ? 3 : 0,
      stationsAboveWarning: this.currentScenario !== 'SAFE' ? 5 : 0,
      lastUpdated: 'Simulated',
    };
  }
}
