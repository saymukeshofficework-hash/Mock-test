import React from 'react';
import { X, Shield, Database, AlertCircle, ExternalLink, Activity } from 'lucide-react';
import { DataSourceType } from '../types/hydrology';

interface DataSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataSourceType: DataSourceType;
  providerName: string;
}

export const DataSourceModal: React.FC<DataSourceModalProps> = ({
  isOpen,
  onClose,
  dataSourceType,
  providerName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#161c26] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between bg-[#1b212c]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Data Transparency & Standards</h3>
              <p className="text-xs text-gray-400">How Sone River water levels & flood alerts are computed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs sm:text-sm text-gray-300">
          {/* Active Provider Card */}
          <div className="p-3.5 rounded-xl bg-[#1e2634] border border-gray-700/60 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Active Data Connection</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  dataSourceType === 'LIVE'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : dataSourceType === 'DEMO'
                    ? 'bg-purple-500/25 text-purple-200 border border-purple-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {dataSourceType}
              </span>
            </div>
            <p className="text-white font-semibold">{providerName}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Hydrological telemetry calibrated against official Central Water Commission (CWC)
              datums for the Sone River basin.
            </p>
          </div>

          {/* Hydrological Terminology */}
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-sky-400">
              Official Hydrological Benchmarks
            </h4>

            <div className="p-3 rounded-xl bg-[#1a212e] border border-gray-800 flex flex-col gap-1">
              <strong className="text-rose-300">🔴 Danger Level:</strong>
              <p className="text-xs text-gray-300">
                The water level at which floodwaters begin to breach natural riverbanks or embankments
                and inundate low-lying populated areas or farmland.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#1a212e] border border-gray-800 flex flex-col gap-1">
              <strong className="text-amber-300">🟡 Warning Level:</strong>
              <p className="text-xs text-gray-300">
                The stage at which district administration alerts are triggered, patrols along
                embankments intensify, and bathing or sandbar activities are prohibited.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#1a212e] border border-gray-800 flex flex-col gap-1">
              <strong className="text-purple-300">🟣 Highest Flood Level (HFL):</strong>
              <p className="text-xs text-gray-300">
                The highest historical water level ever recorded by CWC at that specific gauge since
                record keeping began.
              </p>
            </div>
          </div>

          {/* Critical Public Safety Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <strong>Public Safety Notice:</strong> This application is a situational awareness and
              decision-support tool. River levels can surge rapidly during heavy catchment rainfall
              and dam releases (e.g. Bansagar Dam or Indrapuri Barrage). Official alerts issued by
              local district administrations, NDRF, and SDMA always take legal precedence.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-800 bg-[#1b212c] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
