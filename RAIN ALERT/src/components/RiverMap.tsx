import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { SONE_RIVER_POLYLINE, SONE_FLOOD_ZONES } from '../config/riverConfig';
import { StationHydrologyData } from '../types/hydrology';
import { UserLocationState, ProximityResult } from '../types/alert';
import { Maximize2, Crosshair, MapPin } from 'lucide-react';

interface RiverMapProps {
  userLocation: UserLocationState;
  proximity: ProximityResult;
  allStationsData: StationHydrologyData[];
  activeStationId: string;
  onSelectStation: (stationId: string) => void;
  onLocateMe: () => void;
}

export const RiverMap: React.FC<RiverMapProps> = ({
  userLocation,
  proximity,
  allStationsData,
  activeStationId,
  onSelectStation,
  onLocateMe,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userAccuracyCircleRef = useRef<L.Circle | null>(null);
  const stationsLayerRef = useRef<L.LayerGroup | null>(null);
  const floodZonesLayerRef = useRef<L.LayerGroup | null>(null);

  const [showFloodZones, setShowFloodZones] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize Map safely with StrictMode resilience
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Reset container if previously initialized by React StrictMode double-mount
    if ((mapContainerRef.current as any)._leaflet_id) {
      try {
        (mapContainerRef.current as any)._leaflet_id = null;
        mapContainerRef.current.innerHTML = '';
      } catch (e) {
        console.warn('Map reset note:', e);
      }
    }

    try {
      // Centered around middle Sone River basin (Chopan / Rewa / Dehri latitude)
      const map = L.map(mapContainerRef.current, {
        center: [24.5, 83.2],
        zoom: 7,
        zoomControl: false,
        scrollWheelZoom: false, // Prevents scroll hijacking and zoom wheel crash
      });

      // Dark Matter tile layer for high contrast emergency aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://carto.com/">CARTO</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // River Polyline: Outer Glow + Inner Core Line
      L.polyline(SONE_RIVER_POLYLINE, {
        color: '#0284c7',
        weight: 8,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      L.polyline(SONE_RIVER_POLYLINE, {
        color: '#38bdf8',
        weight: 3.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Initialize layer groups
      stationsLayerRef.current = L.layerGroup().addTo(map);
      floodZonesLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    } catch (err: any) {
      console.error('Failed to initialize Leaflet map:', err);
      setMapError(err?.message || 'Unable to load interactive map');
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // ignore cleanup errors during fast unmount
        }
        mapInstanceRef.current = null;
      }
      stationsLayerRef.current = null;
      floodZonesLayerRef.current = null;
      userMarkerRef.current = null;
      userAccuracyCircleRef.current = null;
    };
  }, []);

  // Update Flood Zones
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    try {
      if (!floodZonesLayerRef.current) {
        floodZonesLayerRef.current = L.layerGroup().addTo(map);
      }
      const group = floodZonesLayerRef.current;
      group.clearLayers();

      if (showFloodZones) {
        SONE_FLOOD_ZONES.forEach((zone) => {
          const circle = L.circle(zone.center, {
            radius: zone.radiusMeters,
            color: zone.severity === 'DANGER' ? '#f43f5e' : '#f59e0b',
            fillColor: zone.severity === 'DANGER' ? '#f43f5e' : '#f59e0b',
            fillOpacity: 0.15,
            weight: 1.5,
            dashArray: '4 4',
          });

          circle.bindTooltip(`<strong>${zone.name}</strong><br/>${zone.description}`, {
            direction: 'top',
            className: 'leaflet-dark-tooltip',
          });

          group.addLayer(circle);
        });
      }
    } catch (e) {
      console.warn('Error updating flood zones:', e);
    }
  }, [showFloodZones]);

  // Update Stations Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    try {
      if (!stationsLayerRef.current) {
        stationsLayerRef.current = L.layerGroup().addTo(map);
      }
      const group = stationsLayerRef.current;
      group.clearLayers();

      if (!showStations || !allStationsData || allStationsData.length === 0) return;

      allStationsData.forEach((st) => {
        const { station, currentLevel, dangerLevel, warningLevel } = st;
        const isAboveDanger = currentLevel >= dangerLevel;
        const isAboveWarning = currentLevel >= warningLevel;
        const isSelected = station.id === activeStationId;

        const pinColor = isAboveDanger ? '#f43f5e' : isAboveWarning ? '#f59e0b' : '#10b981';

        const customIcon = L.divIcon({
          className: 'custom-station-pin',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
          html: `
            <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
              ${
                isAboveDanger
                  ? `<div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background-color: ${pinColor}; opacity: 0.4; animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>`
                  : ''
              }
              <div style="
                width: ${isSelected ? '28px' : '22px'};
                height: ${isSelected ? '28px' : '22px'};
                border-radius: 50%;
                background-color: ${pinColor};
                border: 2px solid #ffffff;
                box-shadow: 0 4px 10px rgba(0,0,0,0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 11px;
                font-weight: bold;
              ">
                🌊
              </div>
            </div>
          `,
        });

        const marker = L.marker([station.coordinates.lat, station.coordinates.lng], {
          icon: customIcon,
        });

        const popupHtml = `
          <div style="min-width: 180px; padding: 4px;">
            <div style="font-size: 11px; color: ${pinColor}; font-weight: bold; text-transform: uppercase;">
              ${isAboveDanger ? '🔴 Above Danger' : isAboveWarning ? '🟡 Above Warning' : '🟢 Normal'}
            </div>
            <div style="font-size: 14px; font-weight: bold; color: #ffffff; margin-top: 2px;">
              ${station.name}
            </div>
            <div style="font-size: 11px; color: #94a3b8;">
              ${station.division} • ${station.state}
            </div>
            <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #334155; display: flex; justify-content: space-between;">
              <div>
                <div style="font-size: 10px; color: #94a3b8;">Current Level</div>
                <div style="font-size: 13px; font-weight: bold; color: ${pinColor};">
                  ${currentLevel.toFixed(2)} m
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 10px; color: #94a3b8;">Danger Level</div>
                <div style="font-size: 13px; font-weight: bold; color: #f43f5e;">
                  ${dangerLevel.toFixed(2)} m
                </div>
              </div>
            </div>
            <button
              id="btn-select-${station.id}"
              style="
                width: 100%;
                margin-top: 10px;
                padding: 6px 10px;
                background-color: #0284c7;
                color: #ffffff;
                border: none;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
              "
            >
              Select & View Hydrograph
            </button>
          </div>
        `;

        marker.bindPopup(popupHtml);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-select-${station.id}`);
          if (btn) {
            btn.onclick = () => {
              onSelectStation(station.id);
              marker.closePopup();
            };
          }
        });

        group.addLayer(marker);
      });
    } catch (e) {
      console.warn('Error updating stations on map:', e);
    }
  }, [allStationsData, activeStationId, showStations, onSelectStation]);

  // Update User Location Marker & Compass
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation.coords) return;

    try {
      const { latitude, longitude } = userLocation.coords;

      if (userMarkerRef.current) {
        try {
          map.removeLayer(userMarkerRef.current);
        } catch {}
        userMarkerRef.current = null;
      }
      if (userAccuracyCircleRef.current) {
        try {
          map.removeLayer(userAccuracyCircleRef.current);
        } catch {}
        userAccuracyCircleRef.current = null;
      }

      const userIcon = L.divIcon({
        className: 'user-radar-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background-color: #38bdf8; opacity: 0.35;" class="sonar-wave"></div>
            <div style="width: 16px; height: 16px; border-radius: 50%; background-color: #0284c7; border: 3px solid #ffffff; box-shadow: 0 0 12px #38bdf8;"></div>
          </div>
        `,
      });

      const marker = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
      marker.bindTooltip(
        `<strong>You are here</strong><br/>${proximity.distanceKm.toFixed(1)} km from Sone River`,
        { direction: 'top', className: 'leaflet-dark-tooltip' }
      );
      userMarkerRef.current = marker;

      if (userLocation.accuracyMeters && userLocation.accuracyMeters > 20) {
        const circle = L.circle([latitude, longitude], {
          radius: userLocation.accuracyMeters,
          color: '#38bdf8',
          fillColor: '#38bdf8',
          fillOpacity: 0.1,
          weight: 1,
        }).addTo(map);
        userAccuracyCircleRef.current = circle;
      }
    } catch (e) {
      console.warn('Error updating user marker on map:', e);
    }
  }, [userLocation, proximity.distanceKm]);

  const handleFitRiver = () => {
    if (!mapInstanceRef.current) return;
    try {
      mapInstanceRef.current.fitBounds(L.polyline(SONE_RIVER_POLYLINE).getBounds(), {
        padding: [40, 40],
      });
    } catch (e) {
      console.warn('Fit river error:', e);
    }
  };

  const handleCenterUser = () => {
    if (!mapInstanceRef.current || !userLocation.coords) return;
    try {
      mapInstanceRef.current.flyTo(
        [userLocation.coords.latitude, userLocation.coords.longitude],
        11,
        { duration: 1.2 }
      );
    } catch (e) {
      console.warn('Center user error:', e);
    }
  };

  if (mapError) {
    return (
      <div className="w-full bg-[#161c26] rounded-2xl p-6 border border-gray-800 text-center flex flex-col items-center gap-2">
        <MapPin className="w-8 h-8 text-sky-400" />
        <h4 className="text-sm font-bold text-white">Sone River Basin Map</h4>
        <p className="text-xs text-gray-400">{mapError}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#161c26] rounded-2xl border border-gray-800 shadow-xl overflow-hidden flex flex-col">
      {/* Map Header & Controls */}
      <div className="p-4 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 bg-[#1b212c]">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>🗺️ Sone River Basin GIS Map</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Live Interactive
            </span>
          </h3>
          <p className="text-xs text-gray-400">
            Click any monitoring station or flood zone to inspect hydrological status
          </p>
        </div>

        {/* Map Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Toggle Flood Zones */}
          <button
            onClick={() => setShowFloodZones((prev) => !prev)}
            className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors ${
              showFloodZones
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-gray-200'
            }`}
          >
            Flood Zones {showFloodZones ? 'ON' : 'OFF'}
          </button>

          {/* Toggle Stations */}
          <button
            onClick={() => setShowStations((prev) => !prev)}
            className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors ${
              showStations
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-gray-200'
            }`}
          >
            Stations {showStations ? 'ON' : 'OFF'}
          </button>

          {/* Center User */}
          <button
            onClick={handleCenterUser}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sky-400 border border-gray-700 transition-colors"
            title="Center on My Location"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {/* Fit Full Basin */}
          <button
            onClick={handleFitRiver}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
            title="Fit Sone River Course"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="relative w-full h-80 sm:h-96">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-[400] bg-[#0f141d]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-gray-800 text-[11px] text-gray-300 flex flex-col gap-1 shadow-lg pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 bg-[#38bdf8] rounded-full" />
            <span>Sone River Path</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
            <span>Above Danger Station</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
            <span>Above Warning Station</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] ring-2 ring-sky-300" />
            <span>Your Location</span>
          </div>
        </div>
      </div>
    </div>
  );
};
