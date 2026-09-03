import { useState, useEffect, useCallback } from 'react';
import { StationHydrologyData, BasinSummary } from '../types/hydrology';
import { RiverDataService } from '../services/riverDataService';
import { DemoScenario } from '../api/demoProvider';
import { DEFAULT_PRIMARY_STATION_ID } from '../config/stationsConfig';

export function useRiverData(activeStationId: string = DEFAULT_PRIMARY_STATION_ID) {
  const [stationData, setStationData] = useState<StationHydrologyData | null>(null);
  const [allStations, setAllStations] = useState<StationHydrologyData[]>([]);
  const [basinSummary, setBasinSummary] = useState<BasinSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(RiverDataService.isDemoMode());
  const [demoScenario, setDemoScenarioState] = useState<DemoScenario>(RiverDataService.getDemoScenario());
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  const fetchData = useCallback(
    async (stationId: string, force = false) => {
      setIsLoading(true);
      setError(null);
      try {
        const [current, all, basin] = await Promise.all([
          RiverDataService.getStationData(stationId, force),
          RiverDataService.getAllStationsData(force),
          RiverDataService.getBasinOverview(),
        ]);

        setStationData(current);
        setAllStations(all);
        setBasinSummary(basin);
        setLastRefreshedAt(new Date());
      } catch (err: any) {
        console.error('Failed to load river hydrology data:', err);
        setError(err?.message || 'Unable to retrieve water level data.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchData(activeStationId);
  }, [activeStationId, fetchData]);

  // Periodic background auto-refresh every 3 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(activeStationId, true);
    }, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [activeStationId, fetchData]);

  const toggleDemoMode = useCallback(
    (enabled: boolean) => {
      RiverDataService.setDemoMode(enabled);
      setIsDemoMode(enabled);
      fetchData(activeStationId, true);
    },
    [activeStationId, fetchData]
  );

  const changeDemoScenario = useCallback(
    (scenario: DemoScenario) => {
      RiverDataService.setDemoScenario(scenario);
      setDemoScenarioState(scenario);
      fetchData(activeStationId, true);
    },
    [activeStationId, fetchData]
  );

  const refreshData = useCallback(() => {
    fetchData(activeStationId, true);
  }, [activeStationId, fetchData]);

  return {
    stationData,
    allStations,
    basinSummary,
    isLoading,
    error,
    isDemoMode,
    demoScenario,
    lastRefreshedAt,
    refreshData,
    toggleDemoMode,
    changeDemoScenario,
  };
}
