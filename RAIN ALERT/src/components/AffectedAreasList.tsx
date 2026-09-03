import React from 'react';
import { StationHydrologyData } from '../types/hydrology';
import { ChevronRight, MapPin, AlertCircle, ArrowUpRight } from 'lucide-react';

interface AffectedAreasListProps {
  stations: StationHydrologyData[];
  activeStationId: string;
  onSelectStation: (stationId: string) => void;
}

export const AffectedAreasList: React.FC<AffectedAreasListProps> = ({
  stations,
  activeStationId,
  onSelectStation,
}) => {
  return (
    <section className="w-full bg-[#1b212c] rounded-2xl p-5 sm:p-6 border border-gray-800 shadow-xl flex flex-col gap-4">
      {/* Section Header (matches screenshot) */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Affected area
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Key monitoring points along the Sone River basin and their current flood status
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
          {stations.length} Locations
        </span>
      </div>

      {/* Locations List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {stations.map((item) => {
          const { station, currentLevel, dangerLevel, warningLevel, unit } = item;
          const isDanger = currentLevel >= dangerLevel;
          const isWarning = currentLevel >= warningLevel;
          const isSelected = station.id === activeStationId;

          let riskBadge = '🟡 Watch';
          let badgeStyle = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
          let levelTag = 'Normal';

          if (isDanger) {
            riskBadge = '🔴 High Risk';
            badgeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
            levelTag = 'Above Danger Level';
          } else if (isWarning) {
            riskBadge = '🟠 Moderate Risk';
            badgeStyle = 'bg-orange-500/20 text-orange-300 border-orange-500/30';
            levelTag = 'Above Warning Level';
          }

          return (
            <button
              key={station.id}
              onClick={() => onSelectStation(station.id)}
              className={`text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-[#222b39] border-sky-500/60 shadow-md shadow-sky-500/10 ring-1 ring-sky-500/40'
                  : 'bg-[#1e2634]/70 border-gray-800 hover:bg-[#232c3c] hover:border-gray-700'
              }`}
            >
              <div className="flex flex-col gap-1 min-w-0">
                {/* Risk Pill */}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${badgeStyle}`}
                  >
                    {riskBadge}
                  </span>
                  <span className="text-[11px] text-gray-400">{levelTag}</span>
                </div>

                {/* Station & Division Name */}
                <h4 className="font-bold text-white text-base truncate mt-0.5">
                  {station.name}
                </h4>
                <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-gray-500 flex-shrink-0" />
                  {station.division}, {station.state}
                </p>

                {/* Level info */}
                <div className="text-xs text-gray-300 mt-1 flex items-center gap-2">
                  <span>
                    Level:{' '}
                    <strong
                      className={isDanger ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-white'}
                    >
                      {currentLevel.toFixed(2)} {unit}
                    </strong>
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">
                    Danger: {dangerLevel.toFixed(2)} {unit}
                  </span>
                </div>
              </div>

              {/* Action Chevron */}
              <div className="flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-sky-500 text-white' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
