import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { RiskBadge } from '../../components/common/RiskBadge';
import {
  Flame,
  AlertTriangle,
  Clock,
  Radio,
  Trees,
  CheckCircle2,
  Thermometer,
  Wind,
  Droplets,
  Check,
  RotateCcw,
} from 'lucide-react';

export const OfficialAlerts: React.FC = () => {
  const { alerts, zones, sensors, acknowledgeAlert, resolveAlert, resolveDemoFire } = useData();
  const [filter, setFilter] = useState<'All' | 'Critical' | 'High' | 'Warning' | 'Resolved'>('All');

  // Sort: Critical first, then High, then Warning, then Resolved
  const sortedAlerts = [...alerts].sort((a, b) => {
    const priority = { Critical: 4, High: 3, Warning: 2, Info: 1 };
    if (a.resolved !== b.resolved) return a.resolved ? 1 : -1;
    return (priority[b.severity] || 0) - (priority[a.severity] || 0);
  });

  const filtered = sortedAlerts.filter((a) => {
    if (filter === 'All') return true;
    if (filter === 'Resolved') return a.resolved;
    return a.severity === filter && !a.resolved;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-red-500 animate-pulse" />
            <span>Fire & Hazard Alert Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time IoT alarm queue, multi-sensor confirmation logs, and field dispatch tracking
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto self-start sm:self-auto">
          {(['All', 'Critical', 'High', 'Warning', 'Resolved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                filter === f
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Cards Stream per Requirement #19 */}
      <div className="space-y-3.5">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-slate-300">No alerts matching filter "{filter}"</p>
            <p className="text-xs text-slate-500 mt-1">Canopy environmental conditions are within stable thresholds.</p>
          </div>
        ) : (
          filtered.map((alert) => {
            const zone = zones.find((z) => z.id === alert.zoneId);
            const sensor = sensors.find((s) => s.id === alert.nodeId);
            const isCritical = alert.severity === 'Critical';

            return (
              <div
                key={alert.id}
                className={`rounded-2xl p-5 border transition-all ${
                  isCritical && !alert.resolved
                    ? 'bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border-red-500/50 shadow-xl shadow-red-950/30'
                    : alert.severity === 'High' && !alert.resolved
                    ? 'bg-slate-900 border-amber-500/40 shadow-lg'
                    : 'bg-slate-900 border-slate-800 opacity-90'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Alert Information */}
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <RiskBadge level={alert.severity} size="sm" />
                      <span className="text-sm font-black text-white flex items-center gap-1.5">
                        {isCritical && <Flame className="w-4 h-4 text-red-500 animate-pulse" />}
                        {alert.type}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        #{alert.id}
                      </span>
                      {alert.resolved && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          RESOLVED
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-200 font-medium">
                      {alert.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Trees className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Zone: <strong>{zone?.name || alert.zoneId}</strong></span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-300">
                        <Radio className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Node: <strong>{alert.nodeId}</strong></span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Detected: {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Environmental Readings Pill */}
                  <div className="flex items-center gap-2 self-start lg:self-center">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center min-w-[70px]">
                      <span className="text-[10px] text-slate-500 block">Temp</span>
                      <span className={`text-xs font-bold ${alert.temperature >= 45 ? 'text-red-400' : 'text-slate-200'}`}>
                        {alert.temperature}°C
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center min-w-[70px]">
                      <span className="text-[10px] text-slate-500 block">Smoke</span>
                      <span className="text-xs font-bold text-orange-400">
                        {alert.smokeLevel} ppm
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center min-w-[70px]">
                      <span className="text-[10px] text-slate-500 block">Humidity</span>
                      <span className="text-xs font-bold text-cyan-400">
                        {alert.humidity}%
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    {!alert.acknowledged && !alert.resolved && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Acknowledge</span>
                      </button>
                    )}

                    {!alert.resolved && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Resolve Alert</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
