import React from 'react';
import { MapPin, Navigation, Compass, AlertOctagon, AlertTriangle, ShieldCheck } from 'lucide-react';
import { UserLocationState, ProximityResult, RiskAssessmentResult } from '../types/alert';
import { StationHydrologyData } from '../types/hydrology';

interface ProximityCardProps {
  locationState: UserLocationState;
  proximity: ProximityResult;
  risk: RiskAssessmentResult | null;
  stationData: StationHydrologyData | null;
  onLocateMe: () => void;
  onChangeLocation: () => void;
  isLocating: boolean;
}

export const ProximityCard: React.FC<ProximityCardProps> = ({
  locationState,
  proximity,
  risk,
  stationData,
  onLocateMe,
  onChangeLocation,
  isLocating,
}) => {
  const { coords, locality, district, state, isCustomLocation, error } = locationState;
  const { distanceKm, isInRiverfrontZone, isVeryClose, isNearRiver } = proximity;

  // Formulate dynamic safety message based on proximity
  let proximityAlertHeading = '';
  let proximityAlertMessage = '';
  let icon = <ShieldCheck className="w-5 h-5 text-emerald-400" />;
  let pillClass = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';

  if (isInRiverfrontZone) {
    icon = <AlertOctagon className="w-5 h-5 text-rose-400" />;
    pillClass = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    proximityAlertHeading = '🚨 FLOOD DANGER ZONE';
    proximityAlertMessage =
      'You are in an immediate riverfront area (<2 km) potentially affected by rising river levels and backwaters.';
  } else if (isVeryClose) {
    icon = <AlertTriangle className="w-5 h-5 text-orange-400" />;
    pillClass = 'bg-orange-500/15 text-orange-300 border-orange-500/30';
    proximityAlertHeading = '⚠️ VERY CLOSE TO SONE RIVER';
    proximityAlertMessage = `You are approximately ${distanceKm.toFixed(
      1
    )} km from the riverbank. Stay prepared for sudden discharge releases from upstream barrages.`;
  } else if (isNearRiver) {
    icon = <AlertTriangle className="w-5 h-5 text-amber-400" />;
    pillClass = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    proximityAlertHeading = '⚠️ NEAR SONE RIVER BASIN';
    proximityAlertMessage = `You are currently ${distanceKm.toFixed(
      1
    )} km from the Sone River. Exercise caution if planning riverfront transit.`;
  } else {
    proximityAlertHeading = '🟢 SAFE DISTANCE';
    proximityAlertMessage = `You're currently about ${distanceKm.toFixed(
      1
    )} km from the Sone River. River overflow will not directly affect your immediate area.`;
  }

  return (
    <div className="w-full bg-[#161c26] rounded-2xl p-5 sm:p-6 border border-gray-800/90 shadow-lg flex flex-col gap-4">
      {/* Header with Title and Action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
        <div>
          <span className="text-xs text-sky-400 font-semibold uppercase tracking-wide flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            Location & Proximity Analysis
          </span>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
            📍 Your Current Location
            {isCustomLocation && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Custom Point
              </span>
            )}
          </h3>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onLocateMe}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-xs font-semibold border border-sky-500/30 transition-all shadow-sm"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>📍 Use My Current Location</span>
          </button>
          <button
            onClick={onChangeLocation}
            className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 transition-colors"
          >
            Change Location
          </button>
        </div>
      </div>

      {/* Location Details Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        {/* Locality & District */}
        <div className="p-3 rounded-xl bg-[#1e2634] border border-gray-700/50">
          <span className="text-xs text-gray-400">Detected Locality</span>
          <p className="font-semibold text-white mt-0.5">
            {locality || 'Rewa Division'}
          </p>
          <span className="text-xs text-gray-400">
            {district ? `${district}, ${state}` : 'Sone Basin Region'}
          </span>
        </div>

        {/* Distance from River */}
        <div className="p-3 rounded-xl bg-[#1e2634] border border-gray-700/50">
          <span className="text-xs text-gray-400">Distance to Sone River</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold text-sky-400">{distanceKm.toFixed(1)}</span>
            <span className="text-xs text-gray-400 font-semibold">km</span>
          </div>
          <span className="text-xs text-gray-400">Orthogonal GIS measurement</span>
        </div>

        {/* Nearest Monitoring Station */}
        <div className="p-3 rounded-xl bg-[#1e2634] border border-gray-700/50">
          <span className="text-xs text-gray-400">Nearest River Station</span>
          <p className="font-semibold text-white mt-0.5 truncate">
            {stationData?.station.name || 'Rewa Division Station'}
          </p>
          <span className="text-xs text-gray-400">
            Current: {stationData?.currentLevel.toFixed(2)} m
          </span>
        </div>
      </div>

      {/* Proximity Safety Alert Banner */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 ${pillClass}`}>
        <div className="mt-0.5 flex-shrink-0">{icon}</div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold uppercase tracking-wide">
            {proximityAlertHeading}
          </span>
          <p className="text-xs sm:text-sm font-normal text-gray-200">
            {proximityAlertMessage}
          </p>
        </div>
      </div>

      {/* Privacy note */}
      <p className="text-[11px] text-gray-400">
        🔒 <strong>Privacy Assured</strong>: Your device coordinates are calculated strictly
        on-device and are never stored or transmitted to external advertising networks.
      </p>

      {/* Location error notice if any */}
      {error && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs text-amber-300">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};
