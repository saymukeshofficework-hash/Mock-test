import React, { useState, useMemo } from 'react';
import { Info, ChevronRight } from 'lucide-react';
import { StationHydrologyData, HydrologyReading } from '../types/hydrology';
import { RiskAssessmentResult } from '../types/alert';

interface WaterLevelChartProps {
  stationData: StationHydrologyData | null;
  risk: RiskAssessmentResult | null;
  onOpenStationDetails?: () => void;
}

export const WaterLevelChart: React.FC<WaterLevelChartProps> = ({
  stationData,
  risk,
  onOpenStationDetails,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    reading: HydrologyReading;
    label: string;
  } | null>(null);

  const history = stationData?.history || [];
  const forecast = stationData?.forecast || [];
  const warningLevel = stationData?.warningLevel || 323.5;
  const dangerLevel = stationData?.dangerLevel || 325.0;
  const peakLevelRecently = stationData?.peakLevelRecently || { level: 325.0, timestamp: 'Recent' };
  const unit = stationData?.unit || 'm';

  // Combine points for graph domain calculation
  const allPoints = useMemo(() => {
    return [
      ...history.map((p) => ({ ...p, isForecast: false })),
      ...forecast.map((p) => ({ ...p, isForecast: true })),
    ];
  }, [history, forecast]);

  // Compute graph bounds
  const { minVal, maxVal, width, height, padding } = useMemo(() => {
    const values = allPoints.map((p) => p.waterLevel);
    values.push(warningLevel, dangerLevel);

    const min = Math.min(...values) - 0.8;
    const max = Math.max(...values) + 0.8;

    return {
      minVal: min,
      maxVal: max,
      width: 600,
      height: 240,
      padding: { top: 35, right: 25, bottom: 40, left: 20 },
    };
  }, [allPoints, warningLevel, dangerLevel]);

  // Map data to SVG coordinates
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const getX = (index: number, total: number) => {
    return padding.left + (index / (total - 1)) * graphWidth;
  };

  const getY = (val: number) => {
    const range = Math.max(0.1, maxVal - minVal);
    const fraction = (val - minVal) / range;
    return padding.top + (1 - fraction) * graphHeight;
  };

  const dangerY = getY(dangerLevel);
  const warningY = getY(warningLevel);

  // Split coords into past and forecast
  const historyCoords = useMemo(() => {
    return history.map((pt, idx) => ({
      x: getX(idx, allPoints.length),
      y: getY(pt.waterLevel),
      reading: pt,
    }));
  }, [history, allPoints.length, minVal, maxVal]);

  const forecastCoords = useMemo(() => {
    if (forecast.length === 0) return [];
    // Start from the last history point for seamless line connection
    const lastHist = historyCoords[historyCoords.length - 1];
    const pts = [lastHist];
    forecast.forEach((pt, idx) => {
      pts.push({
        x: getX(history.length + idx, allPoints.length),
        y: getY(pt.waterLevel),
        reading: pt,
      });
    });
    return pts;
  }, [forecast, historyCoords, history.length, allPoints.length, minVal, maxVal]);

  // Generate smooth SVG Bézier path
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? i : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const pastPathD = useMemo(() => createSmoothPath(historyCoords), [historyCoords]);
  const forecastPathD = useMemo(() => createSmoothPath(forecastCoords), [forecastCoords]);

  // Filled area under past curve
  const pastAreaD = useMemo(() => {
    if (historyCoords.length < 2) return '';
    const firstX = historyCoords[0].x;
    const lastX = historyCoords[historyCoords.length - 1].x;
    const bottomY = height - padding.bottom;
    return `${pastPathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [pastPathD, historyCoords, height, padding.bottom]);

  // Current point marker (now)
  const currentCoord = historyCoords[historyCoords.length - 1];

  // Selected date labels along X axis (e.g. 29/08, 31/08, 02/09)
  const xDateLabels = useMemo(() => {
    const labels = [
      { text: '29/08', xPercent: 20 },
      { text: '31/08', xPercent: 48 },
      { text: '02/09', xPercent: 78 },
    ];
    return labels;
  }, []);

  if (!stationData) {
    return (
      <div className="w-full h-72 bg-[#1b212c] rounded-2xl animate-pulse flex items-center justify-center text-gray-500">
        Loading hydrological graph...
      </div>
    );
  }

  const isCurrentAboveDanger = stationData.currentLevel >= dangerLevel;

  return (
    <div className="w-full bg-[#1b212c] rounded-2xl p-4 sm:p-6 border border-gray-800 shadow-xl flex flex-col gap-4">
      {/* Chart container */}
      <div className="relative w-full overflow-hidden">
        {/* Floating "Now Above danger level" badge on top-right (matches screenshot) */}
        <div className="absolute top-2 right-2 sm:right-4 z-10">
          <div className="px-3 py-1.5 rounded-lg bg-[#28313e]/90 backdrop-blur-sm border border-gray-700/60 shadow-md flex items-center gap-1.5 text-xs text-gray-200">
            <span className="font-semibold text-white">Now</span>
            <span className="text-gray-300">
              {isCurrentAboveDanger ? 'Above danger level' : 'Normal level'}
            </span>
          </div>
        </div>

        {/* SVG Graphic */}
        <div className="w-full aspect-[2.4/1] min-h-[220px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Soft blue gradient for past river water area */}
              <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#2563eb" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.02" />
              </linearGradient>

              {/* Danger line horizontal glow */}
              <linearGradient id="dangerLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f87171" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f87171" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Danger Level Line & Label */}
            <g>
              <line
                x1={padding.left + 50}
                y1={dangerY}
                x2={width - padding.right}
                y2={dangerY}
                stroke="#f87171"
                strokeWidth="1.2"
                strokeDasharray="4 3"
                opacity="0.65"
              />
              <circle cx={padding.left + 8} cy={dangerY} r="3.5" fill="#fca5a5" />
              <text
                x={padding.left + 16}
                y={dangerY + 4}
                fill="#fca5a5"
                fontSize="11"
                fontWeight="500"
                className="select-none"
              >
                Danger
              </text>
            </g>

            {/* Warning Level Line & Label */}
            <g>
              <line
                x1={padding.left + 55}
                y1={warningY}
                x2={width - padding.right}
                y2={warningY}
                stroke="#fbbf24"
                strokeWidth="1.2"
                strokeDasharray="4 3"
                opacity="0.65"
              />
              <circle cx={padding.left + 8} cy={warningY} r="3.5" fill="#fcd34d" />
              <text
                x={padding.left + 16}
                y={warningY + 4}
                fill="#fcd34d"
                fontSize="11"
                fontWeight="500"
                className="select-none"
              >
                Warning
              </text>
            </g>

            {/* Area Fill for Past Readings */}
            <path d={pastAreaD} fill="url(#waterGradient)" />

            {/* Solid Past Line */}
            <path
              d={pastPathD}
              fill="none"
              stroke="#60a5fa"
              strokeWidth="2.6"
              strokeLinecap="round"
            />

            {/* Dashed Forecast Line */}
            {forecastCoords.length > 0 && (
              <path
                d={forecastPathD}
                fill="none"
                stroke="#93c5fd"
                strokeWidth="2.2"
                strokeDasharray="5 4"
                strokeLinecap="round"
                opacity="0.8"
              />
            )}

            {/* Current Point Dot (Now) */}
            {currentCoord && (
              <g>
                <circle
                  cx={currentCoord.x}
                  cy={currentCoord.y}
                  r="7"
                  fill="#60a5fa"
                  opacity="0.4"
                  className="animate-ping"
                />
                <circle
                  cx={currentCoord.x}
                  cy={currentCoord.y}
                  r="5"
                  fill="#93c5fd"
                  stroke="#1b212c"
                  strokeWidth="2"
                />
              </g>
            )}

            {/* Hover Points / Interactive targets */}
            {allPoints.map((pt, idx) => {
              const x = getX(idx, allPoints.length);
              const y = getY(pt.waterLevel);
              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r="12"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setHoveredPoint({
                      x,
                      y,
                      reading: pt,
                      label: `${pt.waterLevel} ${unit} (${pt.isForecast ? 'Forecast' : 'Observed'})`,
                    })
                  }
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              );
            })}

            {/* Interactive Tooltip */}
            {hoveredPoint && (
              <g>
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.y}
                  r="4.5"
                  fill="#ffffff"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                <rect
                  x={Math.max(10, Math.min(width - 120, hoveredPoint.x - 55))}
                  y={Math.max(5, hoveredPoint.y - 38)}
                  width="110"
                  height="26"
                  rx="6"
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth="1"
                />
                <text
                  x={Math.max(10, Math.min(width - 120, hoveredPoint.x - 55)) + 55}
                  y={Math.max(5, hoveredPoint.y - 38) + 17}
                  textAnchor="middle"
                  fill="#f1f5f9"
                  fontSize="11"
                  fontWeight="600"
                >
                  {hoveredPoint.label}
                </text>
              </g>
            )}

            {/* X-Axis bottom boundary line */}
            <line
              x1={padding.left}
              y1={height - padding.bottom}
              x2={width - padding.right}
              y2={height - padding.bottom}
              stroke="#334155"
              strokeWidth="1"
            />

            {/* X-Axis Dates matching screenshot */}
            {xDateLabels.map((lbl, idx) => {
              const labelX = padding.left + (lbl.xPercent / 100) * graphWidth;
              return (
                <text
                  key={idx}
                  x={labelX}
                  y={height - padding.bottom + 18}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="11"
                  className="select-none"
                >
                  {lbl.text}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Legend: Past and Forecast */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-300 font-medium pt-1">
        <div className="flex items-center gap-2">
          <span className="w-6 h-0.5 bg-[#60a5fa] rounded-full inline-block" />
          <span>Past</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-0.5 border-b-2 border-dashed border-[#93c5fd] inline-block" />
          <span>Forecast</span>
        </div>
      </div>

      {/* "Highest river level recently" info chip (matches screenshot) */}
      <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#28313e]/80 border border-gray-700/60 text-xs text-gray-200">
        <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span>
          Highest river level recently:{' '}
          <strong className="text-white font-semibold">
            {peakLevelRecently.level} {unit}
          </strong>{' '}
          ({peakLevelRecently.timestamp})
        </span>
      </div>

      {/* Safety caution guidance (matches screenshot) */}
      <p className="text-sm text-gray-300 font-normal">
        Continue to use caution if going near the riverfront.
      </p>

      {/* "See more in Flood Hub >" rounded button (matches screenshot) */}
      <button
        onClick={onOpenStationDetails}
        className="w-full py-3 px-4 rounded-xl bg-[#28313e] hover:bg-[#343e4f] text-gray-100 font-medium text-sm flex items-center justify-center gap-1.5 transition-colors border border-gray-700/50 shadow-sm"
      >
        <span>See more in Flood Hub</span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
};
