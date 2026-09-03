import React from 'react';
import { Waves, Bell, BellOff, Navigation, Sparkles, Info, RefreshCw } from 'lucide-react';
import { DataSourceType } from '../types/hydrology';

interface HeaderProps {
  dataSourceType: DataSourceType;
  providerName: string;
  isDemoMode: boolean;
  onToggleDemo: () => void;
  onLocateMe: () => void;
  isLocating: boolean;
  onOpenDataModal: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  dataSourceType,
  providerName,
  isDemoMode,
  onToggleDemo,
  onLocateMe,
  isLocating,
  onOpenDataModal,
  onRefresh,
  isRefreshing,
  notificationsEnabled,
  onToggleNotifications,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0d1117]/90 backdrop-blur-md border-b border-gray-800/80 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white flex-shrink-0">
            <Waves className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                SONE RIVER
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20">
                  सोन
                </span>
              </h1>
            </div>
            <p className="text-xs text-gray-400">Flood & Water Level Alert</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Data Source Status Badge */}
          <button
            onClick={onOpenDataModal}
            className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
              dataSourceType === 'LIVE'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                : dataSourceType === 'DEMO'
                ? 'bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/25'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            }`}
            title="Click to view data sources & safety disclaimer"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                dataSourceType === 'LIVE'
                  ? 'bg-emerald-400 animate-ping'
                  : dataSourceType === 'DEMO'
                  ? 'bg-purple-400'
                  : 'bg-amber-400'
              }`}
            />
            <span className="font-medium">
              {dataSourceType === 'LIVE'
                ? 'Live Hydro'
                : dataSourceType === 'DEMO'
                ? 'Demo Mode'
                : 'Last Known Data'}
            </span>
            <Info className="w-3.5 h-3.5 opacity-70" />
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors border border-gray-700/60"
            title="Refresh Water Level Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          {/* Quick Locate Me */}
          <button
            onClick={onLocateMe}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 transition-all"
            title="Detect My Location"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Locate</span>
          </button>

          {/* Notification Alert Toggle */}
          <button
            onClick={onToggleNotifications}
            className={`p-2 rounded-lg transition-colors border ${
              notificationsEnabled
                ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 hover:bg-sky-500/30'
                : 'bg-gray-800/80 text-gray-400 border-gray-700/60 hover:text-gray-200'
            }`}
            title={notificationsEnabled ? 'Flood alerts enabled' : 'Enable flood notifications'}
          >
            {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>

          {/* Demo Mode Toggle */}
          <button
            onClick={onToggleDemo}
            className={`flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg border font-medium transition-all ${
              isDemoMode
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                : 'bg-gray-800/80 text-purple-300 border-purple-500/30 hover:bg-purple-950/40'
            }`}
            title="Toggle Developer Demo Simulator"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[11px]">Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
