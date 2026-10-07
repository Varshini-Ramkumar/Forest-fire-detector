import React, { useState } from 'react';
import { ForestZone, SensorNode, RiskLevel } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import {
  Radio,
  Flame,
  Thermometer,
  Droplets,
  Wind,
  Battery,
  Sun,
  Maximize2,
  Compass,
  Layers,
  MapPin,
  Info,
  CheckCircle,
} from 'lucide-react';

interface ForestMapProps {
  zones: ForestZone[];
  sensors: SensorNode[];
  selectedZoneId?: string;
  onSelectZone: (zoneId: string) => void;
  onSelectSensor?: (sensorId: string) => void;
}

export const ForestMap: React.FC<ForestMapProps> = ({
  zones,
  sensors,
  selectedZoneId,
  onSelectZone,
  onSelectSensor,
}) => {
  const [viewMode, setViewMode] = useState<'terrain' | 'coverage' | 'heatmap'>('terrain');
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  // Map coordinates projection for simulated forest canvas (approx 900x550)
  // Coordinates mapped from latitude (11.30 to 11.51) and longitude (76.60 to 76.78)
  const minLat = 11.29;
  const maxLat = 11.52;
  const minLng = 76.59;
  const maxLng = 76.79;

  const projectCoords = (lat: number, lng: number) => {
    // Normalizes lat/lng into percentage (0% to 100%)
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    // Invert lat because higher lat is North (top)
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    return {
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(10, Math.min(88, y)),
    };
  };

  const selectedZone = zones.find((z) => z.id === selectedZoneId) || zones[0];
  const selectedZoneSensors = sensors.filter((s) => s.zoneId === selectedZone?.id);

  const getZoneColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'Critical':
        return {
          fill: '#ef4444',
          stroke: '#b91c1c',
          glow: 'rgba(239, 68, 68, 0.4)',
          text: 'text-red-400',
        };
      case 'High':
        return {
          fill: '#f97316',
          stroke: '#c2410c',
          glow: 'rgba(249, 115, 22, 0.4)',
          text: 'text-orange-400',
        };
      case 'Moderate':
        return {
          fill: '#eab308',
          stroke: '#a16207',
          glow: 'rgba(234, 179, 8, 0.3)',
          text: 'text-yellow-400',
        };
      default:
        return {
          fill: '#10b981',
          stroke: '#047857',
          glow: 'rgba(16, 185, 129, 0.25)',
          text: 'text-emerald-400',
        };
    }
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl flex flex-col select-none">
      {/* Top Map HUD Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left Map Status */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/80 shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wide">
            RESERVE TACTICAL MAP
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Grid WGS-84 • LoRa Mesh Link Active
          </span>
        </div>

        {/* View mode toggle */}
        <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-lg text-xs">
          <button
            onClick={() => setViewMode('terrain')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'terrain'
                ? 'bg-emerald-600 text-white font-semibold shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Terrain Topo
          </button>
          <button
            onClick={() => setViewMode('coverage')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'coverage'
                ? 'bg-emerald-600 text-white font-semibold shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            LoRa Coverage
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'heatmap'
                ? 'bg-emerald-600 text-white font-semibold shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Thermal Heatmap
          </button>
        </div>

        {/* Compass / Weather */}
        <div className="pointer-events-auto hidden md:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg text-xs text-slate-300">
          <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span>Wind: <strong>14 km/h NE</strong></span>
          <span className="text-slate-600">•</span>
          <span>Dry Index: <strong className="text-amber-400">Moderate</strong></span>
        </div>
      </div>

      {/* Interactive Map Visual Stage (SVG & Canvas-like Graphics) */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-[#071714]">
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 1000 600"
        >
          <defs>
            {/* Terrain Background Gradients */}
            <radialGradient id="forestCanopy" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor="#0d2e24" />
              <stop offset="60%" stopColor="#09221b" />
              <stop offset="100%" stopColor="#051410" />
            </radialGradient>

            {/* LoRa Radio Waves Pattern */}
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#134e3f" strokeWidth="0.5" opacity="0.35" />
            </pattern>

            {/* Elevation Contour Lines Pattern */}
            <pattern id="topoPattern" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.08" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.06" />
              <circle cx="50" cy="50" r="15" fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.04" />
            </pattern>

            {/* Thermal Glow Filters */}
            <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Canvas base */}
          <rect width="1000" height="600" fill="url(#forestCanopy)" />
          <rect width="1000" height="600" fill="url(#gridPattern)" />
          <rect width="1000" height="600" fill="url(#topoPattern)" />

          {/* Forest Reserve Topography Curves & Watershed River */}
          <path
            d="M 50,180 Q 250,150 450,220 T 750,260 T 950,210"
            fill="none"
            stroke="#064e3b"
            strokeWidth="35"
            opacity="0.4"
          />
          <path
            d="M 120,400 Q 320,340 520,380 T 820,420"
            fill="none"
            stroke="#064e3b"
            strokeWidth="45"
            opacity="0.3"
          />
          {/* River Stream */}
          <path
            d="M 100,50 Q 280,240 450,290 T 780,480 T 920,580"
            fill="none"
            stroke="#0284c7"
            strokeWidth="4"
            opacity="0.4"
            strokeDasharray="4 2"
          />

          {/* LoRa Gateway Central Station */}
          <g transform="translate(500, 300)">
            <circle r="22" fill="#047857" opacity="0.15" />
            <circle r="44" fill="#047857" opacity="0.08" className="animate-ping" />
            <circle r="6" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
            <text x="12" y="4" fill="#6ee7b7" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
              Gateway Alpha (868 MHz)
            </text>
          </g>

          {/* LoRa RF Coverage Rings if selected */}
          {viewMode === 'coverage' && (
            <g>
              {zones.map((zone) => {
                const pos = projectCoords(zone.latitude, zone.longitude);
                const x = (pos.x / 100) * 1000;
                const y = (pos.y / 100) * 600;
                return (
                  <g key={`cov-${zone.id}`}>
                    <circle cx={x} cy={y} r="85" fill="#10b981" opacity="0.07" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx={x} cy={y} r="130" fill="#10b981" opacity="0.03" stroke="#10b981" strokeWidth="0.5" />
                  </g>
                );
              })}
            </g>
          )}

          {/* Thermal Heatmap overlay if selected */}
          {viewMode === 'heatmap' && (
            <g>
              {sensors.map((sensor) => {
                const pos = projectCoords(sensor.latitude, sensor.longitude);
                const x = (pos.x / 100) * 1000;
                const y = (pos.y / 100) * 600;
                const isCrit = sensor.riskLevel === 'Critical';
                const isHigh = sensor.riskLevel === 'High';
                return (
                  <circle
                    key={`heat-${sensor.id}`}
                    cx={x}
                    cy={y}
                    r={isCrit ? 90 : isHigh ? 65 : 40}
                    fill={isCrit ? '#ef4444' : isHigh ? '#f97316' : '#10b981'}
                    opacity={isCrit ? 0.35 : isHigh ? 0.25 : 0.12}
                    filter="url(#glowFilter)"
                  />
                );
              })}
            </g>
          )}

          {/* Mesh Wireless Links connecting sensors to Zone Centers */}
          {zones.map((zone) => {
            const zPos = projectCoords(zone.latitude, zone.longitude);
            const zX = (zPos.x / 100) * 1000;
            const zY = (zPos.y / 100) * 600;
            const zoneSens = sensors.filter((s) => s.zoneId === zone.id);

            return (
              <g key={`links-${zone.id}`}>
                {zoneSens.map((s) => {
                  const sPos = projectCoords(s.latitude, s.longitude);
                  const sX = (sPos.x / 100) * 1000;
                  const sY = (sPos.y / 100) * 600;
                  return (
                    <line
                      key={`line-${s.id}`}
                      x1={zX}
                      y1={zY}
                      x2={sX}
                      y2={sY}
                      stroke={s.status === 'Critical' ? '#ef4444' : '#059669'}
                      strokeWidth={s.status === 'Critical' ? '2' : '1'}
                      strokeDasharray={s.status === 'Critical' ? 'none' : '4 4'}
                      opacity={s.status === 'Critical' ? 0.8 : 0.4}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* DOM Zone Markers and Nodes rendered on top */}
        {zones.map((zone) => {
          const pos = projectCoords(zone.latitude, zone.longitude);
          const isSelected = zone.id === selectedZone?.id;
          const isHovered = zone.id === hoveredZone;
          const colors = getZoneColor(zone.riskLevel);
          const isCritical = zone.riskLevel === 'Critical';

          return (
            <div
              key={zone.id}
              onClick={() => onSelectZone(zone.id)}
              onMouseEnter={() => setHoveredZone(zone.id)}
              onMouseLeave={() => setHoveredZone(null)}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 transition-transform duration-200 hover:scale-110"
            >
              {/* Outer pulsing ring for Critical or High risk */}
              {isCritical && (
                <div
                  className="absolute -inset-4 rounded-full animate-ping opacity-75"
                  style={{ backgroundColor: colors.fill }}
                />
              )}

              {/* Marker pin */}
              <div
                className={`relative flex items-center justify-center rounded-2xl p-2.5 shadow-2xl border-2 transition-all ${
                  isSelected
                    ? 'ring-4 ring-white/50 scale-110 shadow-emerald-950/80'
                    : 'hover:ring-2 hover:ring-white/30'
                }`}
                style={{
                  backgroundColor: isCritical ? '#7f1d1d' : '#0f172a',
                  borderColor: colors.fill,
                  boxShadow: `0 10px 25px -5px ${colors.glow}`,
                }}
              >
                {isCritical ? (
                  <Flame className="w-5 h-5 text-yellow-300 animate-pulse" />
                ) : (
                  <MapPin className={`w-5 h-5 ${colors.text}`} />
                )}

                {/* Sensor badge count */}
                <span className="absolute -top-1.5 -right-1.5 bg-slate-900 border border-slate-600 text-[10px] font-bold text-white px-1.5 rounded-full shadow">
                  {zone.activeSensors}
                </span>
              </div>

              {/* Zone Tag Label */}
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md border text-center whitespace-nowrap shadow-xl transition-all ${
                  isSelected
                    ? 'bg-slate-900/95 border-emerald-500 text-white font-bold'
                    : 'bg-slate-900/80 border-slate-700/60 text-slate-200 font-medium'
                }`}
              >
                <div className="text-xs leading-none flex items-center gap-1.5 justify-center">
                  <span>{zone.name.split('–')[0]?.trim() || zone.name}</span>
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: colors.fill }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {zone.riskLevel} Risk • {zone.area}
                </div>
              </div>
            </div>
          );
        })}

        {/* Individual Sensor Node Markers */}
        {sensors.map((sensor) => {
          const pos = projectCoords(sensor.latitude, sensor.longitude);
          const isCrit = sensor.riskLevel === 'Critical';
          const isWarn = sensor.status === 'Warning' || sensor.status === 'Critical';

          return (
            <div
              key={sensor.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectZone(sensor.zoneId);
                if (onSelectSensor) onSelectSensor(sensor.id);
              }}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              title={`${sensor.nodeName} (${sensor.temperature}°C, Smoke: ${sensor.smokeLevel})`}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
            >
              <div
                className={`w-3.5 h-3.5 rounded-full border border-white/60 flex items-center justify-center transition-transform hover:scale-150 ${
                  isCrit
                    ? 'bg-red-500 animate-pulse'
                    : isWarn
                    ? 'bg-amber-500'
                    : sensor.status === 'Offline'
                    ? 'bg-slate-500 opacity-60'
                    : 'bg-emerald-400'
                }`}
              >
                <span className="w-1 h-1 rounded-full bg-white" />
              </div>

              {/* Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex flex-col bg-slate-900/95 text-white text-[10px] p-2 rounded-lg border border-slate-700 shadow-xl pointer-events-none whitespace-nowrap z-40">
                <span className="font-bold text-emerald-400">{sensor.id}</span>
                <span>Temp: {sensor.temperature}°C • Hum: {sensor.humidity}%</span>
                <span>Smoke: {sensor.smokeLevel} ppm • Flame: {sensor.flameDetected ? 'YES' : 'No'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Floating Zone Telemetry Strip / Quick Inspector */}
      {selectedZone && (
        <div className="bg-slate-900/95 border-t border-slate-800 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white tracking-wide">
                  {selectedZone.name}
                </h4>
                <RiskBadge level={selectedZone.riskLevel} size="sm" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Location: {selectedZone.location} • Monitored Area: {selectedZone.area}
              </p>
            </div>
          </div>

          {/* Quick Real-Time Zone Telemetry Averages */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Thermometer className="w-4 h-4 text-rose-400" />
              <span className="text-slate-400">Avg Temp:</span>
              <strong className="text-white">
                {selectedZoneSensors.length > 0
                  ? Math.round(
                      (selectedZoneSensors.reduce((a, b) => a + b.temperature, 0) /
                        selectedZoneSensors.length) *
                        10
                    ) / 10
                  : 31.2}
                °C
              </strong>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Wind className="w-4 h-4 text-orange-400" />
              <span className="text-slate-400">Max Smoke:</span>
              <strong className="text-white">
                {selectedZoneSensors.length > 0
                  ? Math.max(...selectedZoneSensors.map((s) => s.smokeLevel))
                  : 12}{' '}
                ppm
              </strong>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400">Sensors:</span>
              <strong className="text-emerald-400">
                {selectedZone.activeSensors} / {selectedZone.totalSensors} Online
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
