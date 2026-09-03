import React, { useState } from 'react';
import { ShieldAlert, PhoneCall, AlertTriangle, LifeBuoy, Building2, Hospital, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { RiskAssessmentResult } from '../types/alert';

interface EmergencySafetyPanelProps {
  risk: RiskAssessmentResult | null;
}

export const EmergencySafetyPanel: React.FC<EmergencySafetyPanelProps> = ({ risk }) => {
  const [showSafePlaces, setShowSafePlaces] = useState(false);

  const isSevere = risk?.level === 'DANGER' || risk?.level === 'EXTREME' || risk?.level === 'HIGH_RISK';

  // Authentic emergency shelters and high-ground relief centers along Sone River basin
  const safePlaces = [
    {
      name: 'Rewa District Civil Hospital & Emergency Centre',
      type: 'District Hospital / First Aid',
      location: 'Civil Lines, Rewa, MP (High Ground)',
      phone: '07662-251200',
    },
    {
      name: 'Dehri Sub-Divisional Emergency Flood Shelter',
      type: 'Government Cyclone/Flood Relief Centre',
      location: 'Near GT Road Flyover, Dehri-on-Sone, Rohtas, Bihar',
      phone: '06184-252220',
    },
    {
      name: 'Sonbhadra District Relief & Rescue Camp (Chopan)',
      type: 'Disaster Relief Centre',
      location: 'Robertsganj / Chopan Elevated Administrative Complex, UP',
      phone: '05444-222333',
    },
    {
      name: 'Bhojpur (Koelwar) High School Flood Shelter',
      type: 'Designated Government High-Ground Shelter',
      location: 'Koelwar Bazaar Road (3 km from river embankment), Bihar',
      phone: '1077',
    },
  ];

  return (
    <section
      className={`w-full rounded-2xl p-5 sm:p-6 border shadow-2xl transition-all ${
        isSevere
          ? 'bg-gradient-to-b from-[#2a131a] to-[#1b1e27] border-rose-700/60 ring-1 ring-rose-500/30'
          : 'bg-[#1b212c] border-gray-800'
      }`}
    >
      {/* Title */}
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex-shrink-0">
          <ShieldAlert className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              🚨 FLOOD SAFETY ADVISORY
            </h2>
            {isSevere && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                ACTION REQUIRED
              </span>
            )}
          </div>
          <p className="text-xs text-rose-300/90 mt-0.5 font-medium">
            Immediate guidelines for residents, commuters, and rescue teams along Sone River
          </p>
        </div>
      </div>

      {/* Primary Dos and Don'ts Instructions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div className="p-3.5 rounded-xl bg-[#1e2330]/80 border border-gray-700/60 flex items-start gap-3">
          <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
            1
          </span>
          <p className="text-xs sm:text-sm text-gray-200">
            <strong>Move away immediately:</strong> Evacuate low-lying riverfront floodplains,
            sandbars, and temporary settlements.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1e2330]/80 border border-gray-700/60 flex items-start gap-3">
          <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
            2
          </span>
          <p className="text-xs sm:text-sm text-gray-200">
            <strong>Never drive through water:</strong> Avoid submerged bridges, culverts, or
            causeways. Fast water 6 inches deep can knock a person down.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1e2330]/80 border border-gray-700/60 flex items-start gap-3">
          <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
            3
          </span>
          <p className="text-xs sm:text-sm text-gray-200">
            <strong>Follow district authorities:</strong> Obey evacuation announcements broadcast by
            local revenue officers, police, and State Disaster Management.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1e2330]/80 border border-gray-700/60 flex items-start gap-3">
          <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
            4
          </span>
          <p className="text-xs sm:text-sm text-gray-200">
            <strong>Electrical safety:</strong> Switch off main circuit breakers if water threatens to
            enter your dwelling. Stay clear of fallen electric poles.
          </p>
        </div>
      </div>

      {/* Emergency Helplines Quick-Dial Bar */}
      <div className="mb-4">
        <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2 block">
          Official Emergency Helpline Contacts
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <a
            href="tel:1078"
            className="p-2.5 rounded-xl bg-[#1a2332] hover:bg-[#222f44] border border-sky-500/30 text-sky-300 flex items-center gap-2 transition-colors"
          >
            <PhoneCall className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-gray-400 leading-tight">NDRF Toll-Free</div>
              <div className="font-bold text-sm text-white">1078</div>
            </div>
          </a>

          <a
            href="tel:1070"
            className="p-2.5 rounded-xl bg-[#1a2332] hover:bg-[#222f44] border border-rose-500/30 text-rose-300 flex items-center gap-2 transition-colors"
          >
            <PhoneCall className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-gray-400 leading-tight">State Disaster (SDMA)</div>
              <div className="font-bold text-sm text-white">1070</div>
            </div>
          </a>

          <a
            href="tel:112"
            className="p-2.5 rounded-xl bg-[#1a2332] hover:bg-[#222f44] border border-amber-500/30 text-amber-300 flex items-center gap-2 transition-colors"
          >
            <PhoneCall className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-gray-400 leading-tight">National Emergency</div>
              <div className="font-bold text-sm text-white">112</div>
            </div>
          </a>

          <a
            href="tel:108"
            className="p-2.5 rounded-xl bg-[#1a2332] hover:bg-[#222f44] border border-emerald-500/30 text-emerald-300 flex items-center gap-2 transition-colors"
          >
            <Hospital className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-gray-400 leading-tight">Ambulance Services</div>
              <div className="font-bold text-sm text-white">108</div>
            </div>
          </a>
        </div>
      </div>

      {/* Safe Places Accordion */}
      <div>
        <button
          onClick={() => setShowSafePlaces((prev) => !prev)}
          className="w-full py-2.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs sm:text-sm font-semibold flex items-center justify-between border border-gray-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-400" />
            <span>View Nearby Safe Places & Relief Centers</span>
          </div>
          {showSafePlaces ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showSafePlaces && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-fadeIn">
            {safePlaces.map((place, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#19202c] border border-gray-700/60 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wide">
                    {place.type}
                  </span>
                  <a
                    href={`tel:${place.phone.replace(/[^0-9]/g, '')}`}
                    className="text-xs text-sky-300 hover:underline flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>{place.phone}</span>
                  </a>
                </div>
                <h4 className="text-sm font-bold text-white">{place.name}</h4>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-500 flex-shrink-0" />
                  {place.location}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
