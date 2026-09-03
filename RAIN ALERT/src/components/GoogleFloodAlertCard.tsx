import React, { useState } from 'react';
import { Home, Share2, MoreVertical, Check, AlertTriangle, ShieldCheck, Flame, ExternalLink } from 'lucide-react';
import { RiskAssessmentResult } from '../types/alert';
import { StationHydrologyData } from '../types/hydrology';

interface GoogleFloodAlertCardProps {
  risk: RiskAssessmentResult | null;
  stationData: StationHydrologyData | null;
  onOpenDataModal: () => void;
}

export const GoogleFloodAlertCard: React.FC<GoogleFloodAlertCardProps> = ({
  risk,
  stationData,
  onOpenDataModal,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sone River Flood Alert',
          text: `Current flood status for Sone River (${stationData?.station.division}): ${risk?.headline}`,
          url: window.location.href,
        });
      } catch {
        // Share cancelled or failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isDanger = risk?.level === 'DANGER' || risk?.level === 'EXTREME';
  const isWarning = risk?.level === 'WARNING' || risk?.level === 'HIGH_RISK';

  return (
    <section className="w-full bg-[#1b212c] rounded-2xl p-5 sm:p-6 border border-gray-800 shadow-xl relative overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          backgroundColor: isDanger ? '#f43f5e' : isWarning ? '#f59e0b' : '#10b981',
        }}
      />

      {/* Top action row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        {/* Flood alert badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3d2730] text-[#fca5a5] text-xs font-medium border border-[#ef4444]/30">
          <Home className="w-3.5 h-3.5 fill-[#fca5a5]" />
          <span>Flood alert</span>
        </div>

        {/* Share & More Menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#fca5a5] hover:bg-[#f87171] text-[#1b212c] font-semibold text-xs transition-colors shadow-sm"
            title="Share this alert"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
          <button
            onClick={onOpenDataModal}
            className="p-1 rounded-full text-gray-400 hover:text-gray-200 transition-colors"
            title="More information"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <div className="mb-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">
          Flood situation near Sone River
        </h2>
        <p className="text-sm sm:text-base text-gray-300 font-medium">
          {stationData?.station.division || 'Rewa Division'}, Sone River
        </p>
      </div>

      {/* Primary River Level Status Headline */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <h3
            className={`text-xl sm:text-2xl font-bold tracking-tight ${
              isDanger
                ? 'text-white'
                : isWarning
                ? 'text-amber-200'
                : 'text-emerald-300'
            }`}
          >
            {risk?.headline || 'River level is above Danger'}
          </h3>
        </div>
      </div>

      {/* Attribution & Last updated line */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
        <span>From CWC, Open-Meteo and others</span>
        <span>•</span>
        <button
          onClick={onOpenDataModal}
          className="text-gray-300 underline underline-offset-2 hover:text-sky-300 transition-colors"
        >
          Learn more
        </button>
        <span>•</span>
        <span>Last updated {stationData?.lastUpdated || '1 min ago'}</span>
      </div>
    </section>
  );
};
