import React from 'react';
import { StationHydrologyData } from '../types/hydrology';
import { RiskAssessmentResult } from '../types/alert';
import { TrendingUp, TrendingDown, Minus, Activity, Gauge, MapPin } from 'lucide-react';

interface WaterLevelMetricsCardProps {
  stationData: StationHydrologyData | null;
  risk: RiskAssessmentResult | null;
}

export const WaterLevelMetricsCard: React.FC<WaterLevelMetricsCardProps> = ({
  stationData,
  risk,
}) => {
  if (!stationData) return null;

  const {
    station,
    currentLevel,
    warningLevel,
    dangerLevel,
    highestFloodLevel,
    unit,
    trend,
    rateOfRisePerHour,
  } = stationData;

  const diffToDanger = Math.round((currentLevel - dangerLevel) * 100) / 100;
  const isAboveDanger = diffToDanger >= 0;

  return (
    <div className="w-full bg-[#161c26] rounded-2xl p-5 sm:p-6 border border-gray-800/90 shadow-lg flex flex-col gap-4">
      {/* Station Title Header */}
      <div className="flex items-start justify-between gap-2 border-b border-gray-800 pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold tracking-wide uppercase">
            <Gauge className="w-3.5 h-3.5" />
            <span>Official Monitoring Gauge</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 mt-0.5">
            {station.name}
            {station.hindiName && (
              <span className="text-xs font-normal text-gray-400">({station.hindiName})</span>
            )}
          </h3>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-gray-500" />
            {station.district}, {station.state} • CWC Code: {station.cwcStationCode || 'CWC-SON'}
          </p>
        </div>

        {/* Trend Pill */}
        <div className="flex flex-col items-end">
          <div
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${
              trend === 'RISING'
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : trend === 'FALLING'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-gray-800 text-gray-300 border-gray-700'
            }`}
          >
            {trend === 'RISING' ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : trend === 'FALLING' ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            <span>{trend}</span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1">
            {rateOfRisePerHour > 0 ? `+${rateOfRisePerHour} m/hr` : '0.00 m/hr'}
          </span>
        </div>
      </div>

      {/* Main Numbers Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Current Level */}
        <div className="p-3.5 rounded-xl bg-[#1e2634] border border-gray-700/60 flex flex-col">
          <span className="text-xs text-gray-400 font-medium">Current Level</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-2xl sm:text-3xl font-extrabold ${
                isAboveDanger ? 'text-rose-400' : 'text-white'
              }`}
            >
              {currentLevel.toFixed(2)}
            </span>
            <span className="text-xs text-gray-400 font-semibold">{unit}</span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1">
            {isAboveDanger
              ? `+${diffToDanger.toFixed(2)}m above Danger`
              : `${Math.abs(diffToDanger).toFixed(2)}m below Danger`}
          </span>
        </div>

        {/* Danger Level */}
        <div className="p-3.5 rounded-xl bg-[#1e2634] border border-gray-700/60 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-300 font-medium">Danger Level</span>
            <span className="w-2 h-2 rounded-full bg-rose-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-200">
              {dangerLevel.toFixed(2)}
            </span>
            <span className="text-xs text-rose-400 font-semibold">{unit}</span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1">Official CWC Flood Mark</span>
        </div>

        {/* Warning Level */}
        <div className="p-3.5 rounded-xl bg-[#1e2634] border border-gray-700/60 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-300 font-medium">Warning Level</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-200">
              {warningLevel.toFixed(2)}
            </span>
            <span className="text-xs text-amber-400 font-semibold">{unit}</span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1">Alert Stage Threshold</span>
        </div>

        {/* Highest Flood Level (HFL) */}
        <div className="p-3.5 rounded-xl bg-[#1e2634] border border-gray-700/60 flex flex-col">
          <span className="text-xs text-purple-300 font-medium">Record HFL</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-200">
              {highestFloodLevel.toFixed(2)}
            </span>
            <span className="text-xs text-purple-400 font-semibold">{unit}</span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1">
            {station.highestFloodDate ? `Recorded ${station.highestFloodDate}` : 'All-time Peak'}
          </span>
        </div>
      </div>
    </div>
  );
};
