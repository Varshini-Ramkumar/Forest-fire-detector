import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { ForestZone } from '../../types';
import { RiskBadge } from '../../components/common/RiskBadge';
import {
  Trees,
  Thermometer,
  Droplets,
  Wind,
  Battery,
  Radio,
  Clock,
  ArrowRight,
  Eye,
  X,
  Compass,
} from 'lucide-react';

interface OfficialZonesProps {
  onSelectZoneForMonitoring?: (zoneId: string) => void;
}

export const OfficialZones: React.FC<OfficialZonesProps> = ({
  onSelectZoneForMonitoring,
}) => {
  const { zones, sensors } = useData();
  const [selectedModalZone, setSelectedModalZone] = useState<ForestZone | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Trees className="w-6 h-6 text-emerald-400" />
          <span>Forest Zones Overview</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Detailed sector microclimates, vegetation fuel characteristics, and deployed node health
        </p>
      </div>

      {/* Grid of Zone Cards per Requirement #20 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {zones.map((zone) => {
          const zoneSensors = sensors.filter((s) => s.zoneId === zone.id);
          const avgTemp =
            zoneSensors.length > 0
              ? Math.round(
                  (zoneSensors.reduce((acc, s) => acc + s.temperature, 0) /
                    zoneSensors.length) *
                    10
                ) / 10
              : 30.5;

          const avgHum =
            zoneSensors.length > 0
              ? Math.round(
                  zoneSensors.reduce((acc, s) => acc + s.humidity, 0) /
                    zoneSensors.length
                )
              : 64;

          const maxSmoke =
            zoneSensors.length > 0
              ? Math.max(...zoneSensors.map((s) => s.smokeLevel))
              : 12;

          const avgBattery =
            zoneSensors.length > 0
              ? Math.round(
                  zoneSensors.reduce((acc, s) => acc + s.batteryLevel, 0) /
                    zoneSensors.length
                )
              : 90;

          return (
            <div
              key={zone.id}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-xl ${
                zone.riskLevel === 'Critical'
                  ? 'bg-gradient-to-b from-red-950/30 to-slate-900 border-red-500/50 shadow-red-950/20'
                  : zone.riskLevel === 'High'
                  ? 'bg-gradient-to-b from-amber-950/20 to-slate-900 border-amber-500/40 shadow-amber-950/20'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Zone Name & Risk Level */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {zone.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{zone.location}</p>
                  </div>
                  <RiskBadge level={zone.riskLevel} size="sm" />
                </div>

                {/* Microclimate Grid (Temp, Humidity, Smoke) */}
                <div className="grid grid-cols-3 gap-2 my-4 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <Thermometer className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block">Temperature</span>
                    <strong className="text-xs text-white">{avgTemp}°C</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <Droplets className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block">Humidity</span>
                    <strong className="text-xs text-white">{avgHum}%</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <Wind className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block">Max Smoke</span>
                    <strong className="text-xs text-white">{maxSmoke} ppm</strong>
                  </div>
                </div>

                {/* Sensor Count & Battery Health */}
                <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Radio className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Active Sensors:</span>
                    </div>
                    <strong className="text-emerald-400 font-mono">
                      {zone.activeSensors} / {zone.totalSensors} Online
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Battery className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Battery Health:</span>
                    </div>
                    <strong className="text-slate-200 font-mono">
                      {avgBattery}% Avg
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Updated: {zone.lastUpdated}</span>
                    </div>
                    <span>Area: {zone.area}</span>
                  </div>
                </div>
              </div>

              {/* View Details Button per Requirement #20 */}
              <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  onClick={() => setSelectedModalZone(zone)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>View Details</span>
                </button>

                {onSelectZoneForMonitoring && (
                  <button
                    onClick={() => onSelectZoneForMonitoring(zone.id)}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                    title="Open on live map"
                  >
                    <span>Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Zone Modal */}
      {selectedModalZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Trees className="w-5 h-5 text-emerald-400" />
                  <span>{selectedModalZone.name}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedModalZone.location}</p>
              </div>
              <button
                onClick={() => setSelectedModalZone(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Reserve Area:</span>
                  <span className="font-bold text-white">{selectedModalZone.area}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Coordinates:</span>
                  <span className="font-mono text-emerald-400">
                    {selectedModalZone.latitude.toFixed(3)}°N, {selectedModalZone.longitude.toFixed(3)}°E
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vegetation Classification:</span>
                  <span className="text-slate-200">{selectedModalZone.vegetationType || 'Deciduous Foliage'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Officer In-Charge:</span>
                  <span className="text-slate-200">{selectedModalZone.rangerInCharge || 'Field Duty Beat'}</span>
                </div>
              </div>

              {/* LoRa Nodes in this zone */}
              <div>
                <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-2">
                  Deployed LoRa Nodes ({sensors.filter((s) => s.zoneId === selectedModalZone.id).length})
                </h4>
                <div className="space-y-2">
                  {sensors
                    .filter((s) => s.zoneId === selectedModalZone.id)
                    .map((s) => (
                      <div
                        key={s.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-white">{s.id} — {s.nodeName}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Temp: {s.temperature}°C • Hum: {s.humidity}% • Smoke: {s.smokeLevel} ppm
                          </div>
                        </div>
                        <RiskBadge level={s.status} size="sm" />
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 text-right">
              <button
                onClick={() => setSelectedModalZone(null)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
