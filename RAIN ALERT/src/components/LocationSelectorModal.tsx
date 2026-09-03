import React, { useState } from 'react';
import { X, MapPin, Search, Crosshair, Check } from 'lucide-react';
import { PRESET_LOCATIONS, PresetLocation } from '../services/locationService';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetLocation) => void;
  onSelectCustomCoords: (lat: number, lng: number, label: string) => void;
  activeLocality: string | null;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  onSelectCustomCoords,
  activeLocality,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [customError, setCustomError] = useState('');

  if (!isOpen) return null;

  const filteredPresets = PRESET_LOCATIONS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.division.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError('');

    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);

    if (isNaN(lat) || isNaN(lng)) {
      setCustomError('Please enter valid numeric latitude and longitude.');
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setCustomError('Latitude must be between -90 and 90, longitude between -180 and 180.');
      return;
    }

    onSelectCustomCoords(lat, lng, `Custom (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#161c26] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between bg-[#1b212c]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Select Location</h3>
              <p className="text-xs text-gray-400">Choose a Sone basin locality or test custom coordinates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Sone basin districts (e.g., Rewa, Dehri, Chopan)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1e2634] border border-gray-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Scrollable Presets List */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Basin Communities & Test Points
          </span>

          {filteredPresets.map((preset) => {
            const isCurrent = activeLocality?.includes(preset.division) || activeLocality === preset.name;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                className={`p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-colors ${
                  isCurrent
                    ? 'bg-sky-500/15 border-sky-500/40 text-white'
                    : 'bg-[#1e2634]/60 border-gray-800 hover:bg-[#222b3a] hover:border-gray-700 text-gray-200'
                }`}
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white truncate">{preset.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 font-medium">
                      ~{preset.expectedDistanceKm} km to river
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{preset.description}</p>
                </div>

                {isCurrent && (
                  <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Coordinates Manual Input */}
        <div className="p-4 border-t border-gray-800 bg-[#1b212c]">
          <span className="text-xs font-semibold text-gray-300 flex items-center gap-1 mb-2">
            <Crosshair className="w-3.5 h-3.5 text-sky-400" />
            <span>Or Enter Exact GPS Coordinates</span>
          </span>

          <form onSubmit={handleCustomSubmit} className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Latitude (e.g. 24.502)"
                value={customLat}
                onChange={(e) => setCustomLat(e.target.value)}
                className="px-3 py-1.5 bg-[#1e2634] border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
              />
              <input
                type="text"
                placeholder="Longitude (e.g. 82.102)"
                value={customLng}
                onChange={(e) => setCustomLng(e.target.value)}
                className="px-3 py-1.5 bg-[#1e2634] border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            {customError && <span className="text-[11px] text-rose-400">{customError}</span>}
            <button
              type="submit"
              className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-semibold transition-colors border border-gray-700"
            >
              Apply Coordinates
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
