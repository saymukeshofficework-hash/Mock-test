import React from 'react';
import { Navigation, ShieldCheck, X } from 'lucide-react';

interface LocationPromptProps {
  onAllow: () => void;
  onChooseManually: () => void;
  onDismiss: () => void;
  isLocating: boolean;
}

export const LocationPrompt: React.FC<LocationPromptProps> = ({
  onAllow,
  onChooseManually,
  onDismiss,
  isLocating,
}) => {
  return (
    <div className="w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-[#182232] to-[#161c26] border border-sky-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex-shrink-0 mt-0.5">
          <Navigation className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
        </div>
        <div>
          <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span>Detect your exact distance from Sone River</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold uppercase tracking-wider">
              Recommended
            </span>
          </h4>
          <p className="text-xs text-gray-300 mt-1 max-w-xl">
            Allow location access to check if you are within dangerous floodplains or upstream barrage
            discharge corridors. Coordinates are processed locally on your device.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-stretch sm:self-auto flex-shrink-0">
        <button
          onClick={onAllow}
          disabled={isLocating}
          className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition-colors shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>{isLocating ? 'Detecting...' : 'Use My Location'}</span>
        </button>
        <button
          onClick={onChooseManually}
          className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium border border-gray-700 transition-colors"
        >
          Select Manually
        </button>
        <button
          onClick={onDismiss}
          className="p-2 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
