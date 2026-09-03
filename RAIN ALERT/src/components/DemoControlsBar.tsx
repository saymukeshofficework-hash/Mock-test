import React from 'react';
import { Sparkles, X, AlertTriangle, Play, MapPin } from 'lucide-react';
import { DemoScenario } from '../api/demoProvider';
import { PRESET_LOCATIONS, PresetLocation } from '../services/locationService';

interface DemoControlsBarProps {
  isDemoMode: boolean;
  currentScenario: DemoScenario;
  onSelectScenario: (scenario: DemoScenario) => void;
  onSelectLocationPreset: (preset: PresetLocation) => void;
  onExitDemo: () => void;
}

export const DemoControlsBar: React.FC<DemoControlsBarProps> = ({
  isDemoMode,
  currentScenario,
  onSelectScenario,
  onSelectLocationPreset,
  onExitDemo,
}) => {
  if (!isDemoMode) return null;

  const scenarios: { id: DemoScenario; label: string; color: string }[] = [
    { id: 'SAFE', label: '🟢 Safe', color: 'hover:bg-emerald-500/20' },
    { id: 'WARNING', label: '🟡 Warning', color: 'hover:bg-amber-500/20' },
    { id: 'HIGH_RISK', label: '🟠 High Risk', color: 'hover:bg-orange-500/20' },
    { id: 'DANGER', label: '🔴 Danger (Screenshot)', color: 'hover:bg-rose-500/20' },
    { id: 'EXTREME', label: '🟣 Extreme / HFL', color: 'hover:bg-purple-500/20' },
  ];

  return (
    <div className="sticky bottom-3 z-40 max-w-4xl mx-auto px-4 w-full animate-slideUp">
      <div className="p-3.5 rounded-2xl bg-[#1e132b]/95 backdrop-blur-md border border-purple-500/50 shadow-2xl flex flex-col gap-2.5">
        {/* Top bar header */}
        <div className="flex items-center justify-between gap-2 border-b border-purple-900/60 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-purple-500/30 text-purple-300">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold text-purple-200 tracking-wide uppercase">
              Developer Demo Simulator (Never Mixed with Live Data)
            </span>
          </div>

          <button
            onClick={onExitDemo}
            className="flex items-center gap-1 text-[11px] font-semibold text-purple-300 hover:text-white px-2 py-0.5 rounded-lg bg-purple-900/50 hover:bg-purple-800 transition-colors"
          >
            <span>Exit Demo</span>
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Controls row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          {/* Risk Scenarios */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-purple-300 font-medium mr-1">Risk Tier:</span>
            {scenarios.map((sc) => {
              const isActive = currentScenario === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => onSelectScenario(sc.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/40'
                      : `bg-[#2a1b3d] text-purple-300 border-purple-800/80 ${sc.color}`
                  }`}
                >
                  {sc.label}
                </button>
              );
            })}
          </div>

          {/* Location simulation shortcuts */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[11px] text-purple-300 font-medium mr-1">User:</span>
            <button
              onClick={() => onSelectLocationPreset(PRESET_LOCATIONS[0])}
              className="px-2 py-0.5 text-[11px] rounded-md bg-purple-950/80 text-purple-200 border border-purple-800/80 hover:bg-purple-900 transition-colors"
              title="Near Rewa (2.8 km)"
            >
              Rewa (2.8km)
            </button>
            <button
              onClick={() => onSelectLocationPreset(PRESET_LOCATIONS[1])}
              className="px-2 py-0.5 text-[11px] rounded-md bg-purple-950/80 text-purple-200 border border-purple-800/80 hover:bg-purple-900 transition-colors"
              title="Dehri (1.2 km)"
            >
              Dehri (1.2km)
            </button>
            <button
              onClick={() => onSelectLocationPreset(PRESET_LOCATIONS[5])}
              className="px-2 py-0.5 text-[11px] rounded-md bg-purple-950/80 text-purple-200 border border-purple-800/80 hover:bg-purple-900 transition-colors"
              title="Far Away (32 km)"
            >
              Patna (32km)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
