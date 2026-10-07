import React, { useState } from 'react';
import { ForestZone, SensorNode } from '../../types';
import { RiskBadge } from './RiskBadge';
import {
  Thermometer,
  Droplets,
  Wind,
  Flame,
  Battery,
  Radio,
  Clock,
  Sun,
  ShieldCheck,
  AlertCircle,
  Activity,
  Cpu,
} from 'lucide-react';

interface SensorDataPanelProps {
  zone: ForestZone;
  sensors: SensorNode[];
  selectedSensorId?: string;
  onSelectSensor: (sensorId: string) => void;
}

export const SensorDataPanel: React.FC<SensorDataPanelProps> = ({
  zone,
  sensors,
  selectedSensorId,
  onSelectSensor,
}) => {
  const activeSensor =
    sensors.find((s) => s.id === selectedSensorId) || sensors[0];

  const getSmokeDescriptor = (val: number) => {
    if (val >= 80) return { label: 'Dangerous / Dense', color: 'text-red-400' };
    if (val >= 50) return { label: 'High', color: 'text-orange-400' };
    if (val >= 30) return { label: 'Moderate', color: 'text-yellow-400' };
    return { label: 'Low', color: 'text-emerald-400' };
  };

  const smokeInfo = activeSensor
    ? getSmokeDescriptor(activeSensor.smokeLevel)
    : { label: 'Low', color: 'text-emerald-400' };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl flex flex-col gap-5">
      {/* Panel Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Live IoT LoRa Node Telemetry
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">{zone.name}</h3>
          <p className="text-xs text-slate-400">{zone.location}</p>
        </div>
        <RiskBadge level={zone.riskLevel} />
      </div>

      {/* Sensor Node Switcher Tabs if multiple in this zone */}
      {sensors.length > 1 && (
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Select Deployed Sensor Node
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {sensors.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectSensor(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                  (activeSensor?.id === s.id)
                    ? 'bg-emerald-600/20 border-emerald-500/50 text-white shadow-sm'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{s.id}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    s.status === 'Critical'
                      ? 'bg-red-400 animate-pulse'
                      : s.status === 'Warning'
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {activeSensor ? (
        <div className="space-y-4">
          {/* Main Environmental Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Temperature */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">
                  Temperature
                </span>
                <span className="text-xl font-black text-white">
                  {activeSensor.temperature}°C
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Thermal ambient
                </span>
              </div>
            </div>

            {/* Humidity */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">
                  Humidity
                </span>
                <span className="text-xl font-black text-white">
                  {activeSensor.humidity}%
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Canopy RH level
                </span>
              </div>
            </div>

            {/* Smoke */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">
                  Smoke Level
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-base font-black ${smokeInfo.color}`}>
                    {smokeInfo.label}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({activeSensor.smokeLevel} ppm)
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Optical particulate
                </span>
              </div>
            </div>

            {/* Flame */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl border ${
                  activeSensor.flameDetected
                    ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}
              >
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">
                  Flame Optical
                </span>
                <span
                  className={`text-base font-black ${
                    activeSensor.flameDetected
                      ? 'text-red-400 animate-pulse'
                      : 'text-emerald-400'
                  }`}
                >
                  {activeSensor.flameDetected ? 'DETECTED' : 'Not Detected'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  IR Flame Sensor
                </span>
              </div>
            </div>
          </div>

          {/* Hardware & LoRa Packet Status */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Node Hardware & RF Health</span>
              <RiskBadge level={activeSensor.status} size="sm" />
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Battery className="w-4 h-4 text-emerald-400" />
                <span>Battery: <strong>{activeSensor.batteryLevel}%</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Solar: <strong>{activeSensor.solarVoltage || 4.18}V</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>RSSI: <strong>{activeSensor.loraRssi || -85} dBm</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Last Updated: <strong className="text-slate-300">{activeSensor.lastUpdated}</strong></span>
              </div>
              <div className="text-emerald-400 font-mono">
                Payload ID: #{activeSensor.id}
              </div>
            </div>
          </div>

          {/* Multi-Sensor Confirmation Logic Explanation Card (#17) */}
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Multi-Sensor Confirmation System</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Multi-sensor confirmation reduces false alarms by cross-referencing adjacent LoRa nodes before declaring Level 1 dispatch. Note: Designed for academic demonstration & early detection prototyping.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500 text-xs">
          No sensor nodes assigned to this zone yet.
        </div>
      )}
    </div>
  );
};
