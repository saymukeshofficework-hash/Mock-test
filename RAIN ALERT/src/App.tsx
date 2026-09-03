import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineBanner } from './components/OfflineBanner';
import { LocationPrompt } from './components/LocationPrompt';
import { GoogleFloodAlertCard } from './components/GoogleFloodAlertCard';
import { WaterLevelChart } from './components/WaterLevelChart';
import { WaterLevelMetricsCard } from './components/WaterLevelMetricsCard';
import { ProximityCard } from './components/ProximityCard';
import { RiverMap } from './components/RiverMap';
import { AffectedAreasList } from './components/AffectedAreasList';
import { EmergencySafetyPanel } from './components/EmergencySafetyPanel';
import { LocationSelectorModal } from './components/LocationSelectorModal';
import { DataSourceModal } from './components/DataSourceModal';
import { DemoControlsBar } from './components/DemoControlsBar';
import { useUserLocation } from './hooks/useUserLocation';
import { useRiverData } from './hooks/useRiverData';
import { useFloodAlert } from './hooks/useFloodAlert';
import { NotificationService } from './alerts/notificationService';
import { DEFAULT_PRIMARY_STATION_ID } from './config/stationsConfig';
import { Shield, Info } from 'lucide-react';

export function App() {
  const [activeStationId, setActiveStationId] = useState<string>(DEFAULT_PRIMARY_STATION_ID);
  const [showLocationPrompt, setShowLocationPrompt] = useState<boolean>(true);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    NotificationService.isEnabled()
  );

  const { locationState, proximity, requestLocation, selectPreset, updateCoordinates } =
    useUserLocation();

  const {
    stationData,
    allStations,
    isLoading: isRiverDataLoading,
    refreshData,
    isDemoMode,
    demoScenario,
    toggleDemoMode,
    changeDemoScenario,
  } = useRiverData(activeStationId);

  const risk = useFloodAlert(stationData, proximity);

  // When user location changes, automatically select the nearest monitoring station
  useEffect(() => {
    if (proximity.nearestStationId && !isDemoMode) {
      setActiveStationId(proximity.nearestStationId);
    }
  }, [proximity.nearestStationId, isDemoMode]);

  const handleToggleNotifications = async () => {
    if (NotificationService.isEnabled()) {
      NotificationService.setEnabled(false);
      setNotificationsEnabled(false);
    } else {
      const granted = await NotificationService.requestPermission();
      setNotificationsEnabled(granted);
      if (granted && risk) {
        NotificationService.dispatchAlert(
          '🔔 Flood Alerts Active',
          `Monitoring Sone River water levels near ${locationState.locality || 'your area'}.`,
          'SAFE',
          true
        );
      }
    }
  };

  const handleLocateMe = async () => {
    setShowLocationPrompt(false);
    await requestLocation();
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 flex flex-col selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top sticky navigation */}
      <Header
        dataSourceType={stationData?.dataSource || 'LIVE'}
        providerName={stationData?.providerName || 'Central Water Commission'}
        isDemoMode={isDemoMode}
        onToggleDemo={() => toggleDemoMode(!isDemoMode)}
        onLocateMe={handleLocateMe}
        isLocating={locationState.isDetecting}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        onRefresh={refreshData}
        isRefreshing={isRiverDataLoading}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={handleToggleNotifications}
      />

      {/* Offline Connectivity Banner */}
      <OfflineBanner />

      {/* Main Page Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-6">
        {/* Geolocation Prompt Banner */}
        {showLocationPrompt && !locationState.permissionGranted && (
          <LocationPrompt
            onAllow={handleLocateMe}
            onChooseManually={() => {
              setShowLocationPrompt(false);
              setIsLocationModalOpen(true);
            }}
            onDismiss={() => setShowLocationPrompt(false)}
            isLocating={locationState.isDetecting}
          />
        )}

        {/* 1. Google Flood Alert Hero Card (recreates screenshot header) */}
        <GoogleFloodAlertCard
          risk={risk}
          stationData={stationData}
          onOpenDataModal={() => setIsDataModalOpen(true)}
        />

        {/* 2. Google-Styled Water Level Chart (recreates screenshot chart with past/forecast lines) */}
        <WaterLevelChart
          stationData={stationData}
          risk={risk}
          onOpenStationDetails={() => setIsDataModalOpen(true)}
        />

        {/* 3. Official Gauge Metrics Card */}
        <WaterLevelMetricsCard stationData={stationData} risk={risk} />

        {/* 4. Location & Proximity Analysis Card */}
        <ProximityCard
          locationState={locationState}
          proximity={proximity}
          risk={risk}
          stationData={stationData}
          onLocateMe={handleLocateMe}
          onChangeLocation={() => setIsLocationModalOpen(true)}
          isLocating={locationState.isDetecting}
        />

        {/* 5. Full Interactive GIS Basin Map */}
        <ErrorBoundary fallbackTitle="Map currently loading">
          <RiverMap
            userLocation={locationState}
            proximity={proximity}
            allStationsData={allStations}
            activeStationId={activeStationId}
            onSelectStation={(id) => setActiveStationId(id)}
            onLocateMe={handleLocateMe}
          />
        </ErrorBoundary>

        {/* 6. Affected Area List (matches screenshot bottom section) */}
        <AffectedAreasList
          stations={allStations}
          activeStationId={activeStationId}
          onSelectStation={(id) => {
            setActiveStationId(id);
            window.scrollTo({ top: 120, behavior: 'smooth' });
          }}
        />

        {/* 7. Emergency Safety Panel & Helplines */}
        <EmergencySafetyPanel risk={risk} />

        {/* Footer info and data disclaimer */}
        <footer className="mt-6 pt-6 border-t border-gray-800 text-center text-xs text-gray-500 flex flex-col items-center gap-2 pb-12">
          <div className="flex items-center gap-1 text-gray-400 font-medium">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>Sone River Flood Alert System • Public Safety Initiative</span>
          </div>
          <p className="max-w-md">
            Data sourced from Central Water Commission (CWC), India-WRIS, and Open-Meteo Global
            Hydrology. River levels change dynamically. In severe weather, heed all local
            administrative evacuation orders.
          </p>
          <button
            onClick={() => setIsDataModalOpen(true)}
            className="text-sky-400 hover:text-sky-300 underline underline-offset-2 flex items-center gap-1 mt-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Data Transparency & Methodology</span>
          </button>
        </footer>
      </main>

      {/* Floating Developer Demo Mode Simulator Bar */}
      <DemoControlsBar
        isDemoMode={isDemoMode}
        currentScenario={demoScenario}
        onSelectScenario={changeDemoScenario}
        onSelectLocationPreset={(preset) => {
          selectPreset(preset);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onExitDemo={() => toggleDemoMode(false)}
      />

      {/* Modals */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectPreset={selectPreset}
        onSelectCustomCoords={updateCoordinates}
        activeLocality={locationState.locality}
      />

      <DataSourceModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        dataSourceType={stationData?.dataSource || 'LIVE'}
        providerName={stationData?.providerName || 'Central Water Commission'}
      />
    </div>
  );
}

export default App;
