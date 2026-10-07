import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { ForestMap } from '../../components/map/ForestMap';
import { SensorDataPanel } from '../../components/common/SensorDataPanel';
import {
  MapPin,
  Trees,
  Activity,
  Flame,
  Shield,
  Radio,
  Compass,
  Wind,
} from 'lucide-react';

export const LiveMonitoring: React.FC = () => {
  const { zones, sensors, simulateFireEvent } = useData();
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || 'zone-1');
  const [selectedSensorId, setSelectedSensorId] = useState<string | undefined>(undefined);

  const currentZone = zones.find((z) => z.id === selectedZoneId) || zones[0];
  const currentZoneSensors = sensors.filter((s) => s.zoneId === currentZone?.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-emerald-400" />
            <span>Live Forest Spatial Monitoring</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geospatial forest canopy monitoring, LoRa mesh topology, and early danger signatures
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => simulateFireEvent(selectedZoneId)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950/50 transition-all cursor-pointer"
          >
            <Flame className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span>Trigger Fire in Selected Zone</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Large Tactical Map + Sensor Data Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <ForestMap
            zones={zones}
            sensors={sensors}
            selectedZoneId={selectedZoneId}
            onSelectZone={(id) => {
              setSelectedZoneId(id);
              setSelectedSensorId(undefined);
            }}
            onSelectSensor={(sensorId) => setSelectedSensorId(sensorId)}
          />

          {/* Quick Zone Navigation Strip */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
              Quick Zone Switcher
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {zones.map((zone) => {
                const isSelected = zone.id === selectedZoneId;
                return (
                  <button
                    key={zone.id}
                    onClick={() => {
                      setSelectedZoneId(zone.id);
                      setSelectedSensorId(undefined);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{zone.name.split('–')[0]?.trim()}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>{zone.activeSensors} Nodes</span>
                      <span
                        className={`font-semibold ${
                          zone.riskLevel === 'Critical'
                            ? 'text-red-400'
                            : zone.riskLevel === 'High'
                            ? 'text-orange-400'
                            : zone.riskLevel === 'Moderate'
                            ? 'text-yellow-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {zone.riskLevel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Detailed Telemetry Panel */}
        <div>
          {currentZone && (
            <SensorDataPanel
              zone={currentZone}
              sensors={currentZoneSensors}
              selectedSensorId={selectedSensorId}
              onSelectSensor={(id) => setSelectedSensorId(id)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
