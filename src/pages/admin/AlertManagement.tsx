import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { RiskBadge } from '../../components/common/RiskBadge';
import {
  Bell,
  Flame,
  CheckCircle2,
  Clock,
  Filter,
  Radio,
  Trees,
  Check,
  ShieldAlert,
} from 'lucide-react';

export const AlertManagement: React.FC = () => {
  const { alerts, zones, sensors, acknowledgeAlert, resolveAlert } = useData();
  const [filter, setFilter] = useState<'All' | 'Critical' | 'High' | 'Warning' | 'Resolved'>('All');

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'All') return true;
    if (filter === 'Resolved') return alert.resolved;
    return alert.severity === filter && !alert.resolved;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-400" />
            <span>System Alert Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-sensor threshold triggers, fire alarms, and resolution lifecycle
          </p>
        </div>

        {/* Filter Pills per Requirement #12 */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto overflow-x-auto">
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

      {/* Alerts Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Alert ID & Type</th>
                <th className="py-3.5 px-4">Forest Zone</th>
                <th className="py-3.5 px-4">Sensor Node</th>
                <th className="py-3.5 px-4">Telemetry Trigger</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Time Detected</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No alerts found for selected filter "{filter}".
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => {
                  const zone = zones.find((z) => z.id === alert.zoneId);

                  return (
                    <tr
                      key={alert.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        alert.severity === 'Critical' && !alert.resolved
                          ? 'bg-red-950/15'
                          : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {alert.severity === 'Critical' && (
                              <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                            )}
                            <span>{alert.type}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {alert.id}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">
                          {zone?.name || alert.zoneId}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-cyan-300">
                        {alert.nodeId}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <span>{alert.temperature}°C</span>
                        <span className="text-slate-600 mx-1">|</span>
                        <span>{alert.smokeLevel} ppm smoke</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <RiskBadge level={alert.severity} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(alert.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>

                      <td className="py-3.5 px-4">
                        {alert.resolved ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Resolved</span>
                          </span>
                        ) : alert.acknowledged ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-xs">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Acknowledged</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 font-bold text-xs animate-pulse">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>New Unacknowledged</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!alert.acknowledged && !alert.resolved && (
                            <button
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-all"
                            >
                              Acknowledge
                            </button>
                          )}
                          {!alert.resolved && (
                            <button
                              onClick={() => resolveAlert(alert.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-[11px] border border-slate-700 transition-all"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
