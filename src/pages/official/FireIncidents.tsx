import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { FireIncident, IncidentStatus, RiskLevel } from '../../types';
import { RiskBadge } from '../../components/common/RiskBadge';
import {
  AlertTriangle,
  Flame,
  Clock,
  Shield,
  Truck,
  CheckCircle2,
  Eye,
  X,
  Filter,
  Plus,
  Radio,
} from 'lucide-react';

export const FireIncidents: React.FC = () => {
  const { incidents, zones, updateIncidentStatus, simulateFireEvent } = useData();

  const [statusFilter, setStatusFilter] = useState<'All' | IncidentStatus>('All');
  const [selectedIncident, setSelectedIncident] = useState<FireIncident | null>(null);

  const filtered = incidents.filter((inc) => {
    if (statusFilter === 'All') return true;
    return inc.status === statusFilter;
  });

  const getStatusColor = (st: IncidentStatus) => {
    switch (st) {
      case 'Detected':
        return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
      case 'Under Investigation':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Response Dispatched':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'Contained':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Resolved':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'False Alarm':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <span>Fire Incidents & Response Dispatch</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tracking lifecycle from IoT automated detection to ranger strike team dispatch and containment
          </p>
        </div>

        <button
          onClick={() => simulateFireEvent()}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950/50 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Flame className="w-4 h-4 text-yellow-300 animate-pulse" />
          <span>Simulate Emergency Dispatch</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-1.5 overflow-x-auto">
        <Filter className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
        {(
          [
            'All',
            'Detected',
            'Under Investigation',
            'Response Dispatched',
            'Contained',
            'Resolved',
            'False Alarm',
          ] as const
        ).map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === st
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Incidents Table per Requirement #23 */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Incident ID</th>
                <th className="py-3.5 px-4">Forest Zone</th>
                <th className="py-3.5 px-4">Detection Time</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Response Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Resolution Time</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filtered.map((incident) => {
                const zone = zones.find((z) => z.id === incident.zoneId);

                return (
                  <tr key={incident.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      <div className="flex items-center gap-2">
                        {incident.severity === 'Critical' && (
                          <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                        )}
                        <span>{incident.id}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-emerald-400">
                      {zone?.name || incident.zoneId}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(incident.detectedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                      {new Date(incident.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3.5 px-4">
                      <RiskBadge level={incident.severity} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 font-mono text-cyan-300">
                      {incident.responseTime || 'Immediate'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusColor(
                          incident.status
                        )}`}
                      >
                        {incident.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {incident.resolvedAt
                        ? new Date(incident.resolvedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '— Active'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedIncident(incident)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Incident Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span>Incident Dossier: {selectedIncident.id}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Zone: {zones.find((z) => z.id === selectedIncident.zoneId)?.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Current Lifecycle Status:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold border ${getStatusColor(
                      selectedIncident.status
                    )}`}
                  >
                    {selectedIncident.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recorded Thermal Peak:</span>
                  <span className="font-bold text-white">{selectedIncident.temperature}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Peak Smoke Intensity:</span>
                  <span className="font-bold text-white">{selectedIncident.smokeLevel} ppm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Strike Response Time:</span>
                  <span className="font-mono text-cyan-400">{selectedIncident.responseTime || 'Immediate'}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
                  Official Incident Briefing
                </h4>
                <p className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed">
                  {selectedIncident.description}
                </p>
              </div>

              {selectedIncident.dispatchedUnits && (
                <div>
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
                    Dispatched Ground & Aerial Units
                  </h4>
                  <div className="space-y-1.5">
                    {selectedIncident.dispatchedUnits.map((u, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-300"
                      >
                        <Truck className="w-4 h-4 text-emerald-400" />
                        <span>{u}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update Dropdown */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Update Operational Status
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedIncident.status}
                    onChange={(e) => {
                      const newSt = e.target.value as IncidentStatus;
                      updateIncidentStatus(selectedIncident.id, newSt);
                      setSelectedIncident({ ...selectedIncident, status: newSt });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Detected">Detected</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Response Dispatched">Response Dispatched</option>
                    <option value="Contained">Contained</option>
                    <option value="Resolved">Resolved</option>
                    <option value="False Alarm">False Alarm</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 text-right">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
