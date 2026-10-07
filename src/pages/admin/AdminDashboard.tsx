import React from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { RiskBadge } from '../../components/common/RiskBadge';
import {
  Trees,
  Radio,
  Bell,
  Users,
  AlertTriangle,
  Activity,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { currentUser } = useAuth();
  const {
    zones,
    sensors,
    alerts,
    incidents,
    officials,
    simulateFireEvent,
  } = useData();

  const totalZones = zones.length;
  const totalSensors = sensors.length;
  const onlineSensors = sensors.filter((s) => s.status === 'Online').length;
  const activeAlerts = alerts.filter((a) => !a.resolved).length;
  const criticalZones = zones.filter((z) => z.riskLevel === 'Critical').length;
  const registeredOfficials = officials.length;

  const recentAlerts = alerts.slice(0, 5);
  const recentIncidents = incidents.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Banner per Requirement #8 */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>IGNIS WATCH SYSTEM ONLINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome, Administrator
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Centralized Forest Command & IT Administration. LoRa mesh topology, official credentials, telemetry calibration, and alert dispatch are active.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => simulateFireEvent()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950/50 transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span>Simulate Fire Incident</span>
            </button>
            <button
              onClick={() => onNavigateTab('reports')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
            >
              Generate Audit Report
            </button>
          </div>
        </div>
      </div>

      {/* Top 6 Stat Cards per Requirement #8 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Forest Zones */}
        <div
          onClick={() => onNavigateTab('zones')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Zones</span>
            <Trees className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{totalZones}</div>
          <span className="text-[11px] text-emerald-400 font-medium">Monitored Sectors</span>
        </div>

        {/* Total Sensor Nodes */}
        <div
          onClick={() => onNavigateTab('sensors')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sensor Nodes</span>
            <Radio className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{totalSensors}</div>
          <span className="text-[11px] text-cyan-400 font-medium">LoRa IoT Endpoints</span>
        </div>

        {/* Online Sensors */}
        <div
          onClick={() => onNavigateTab('sensors')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Online Sensors</span>
            <Activity className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{onlineSensors}</div>
          <span className="text-[11px] text-slate-400 font-medium">
            {Math.round((onlineSensors / (totalSensors || 1)) * 100)}% Availability
          </span>
        </div>

        {/* Active Alerts */}
        <div
          onClick={() => onNavigateTab('alerts')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Alerts</span>
            <Bell className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-amber-400">{activeAlerts}</div>
          <span className="text-[11px] text-slate-400 font-medium">Unresolved Flags</span>
        </div>

        {/* Critical Zones */}
        <div
          onClick={() => onNavigateTab('zones')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical Zones</span>
            <AlertTriangle className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-red-400">{criticalZones}</div>
          <span className="text-[11px] text-red-300 font-medium">High Risk Danger</span>
        </div>

        {/* Registered Officials */}
        <div
          onClick={() => onNavigateTab('officials')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Officials</span>
            <Users className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{registeredOfficials}</div>
          <span className="text-[11px] text-emerald-400 font-medium">Field Personnel</span>
        </div>
      </div>

      {/* Main Grid: Zones Quick Table & Live Alert Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forest Zones Summary (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Monitored Forest Zones</h3>
              <p className="text-xs text-slate-400">Live operational division telemetry status</p>
            </div>
            <button
              onClick={() => onNavigateTab('zones')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>Manage Zones</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Zone Name</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Sensors</th>
                  <th className="py-3 px-3">Risk Level</th>
                  <th className="py-3 px-3">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {zones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">
                      {zone.name}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{zone.location}</td>
                    <td className="py-3 px-3 font-mono">
                      <span className="text-emerald-400 font-bold">{zone.activeSensors}</span> / {zone.totalSensors}
                    </td>
                    <td className="py-3 px-3">
                      <RiskBadge level={zone.riskLevel} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {zone.lastUpdated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Alerts Stream (1 col) */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Recent System Alerts</h3>
                <p className="text-xs text-slate-400">Automatic thermal & smoke triggers</p>
              </div>
              <button
                onClick={() => onNavigateTab('alerts')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border transition-all ${
                    alert.severity === 'Critical'
                      ? 'bg-red-950/20 border-red-500/30'
                      : alert.severity === 'High'
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : 'bg-slate-800/40 border-slate-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      {alert.type}
                    </span>
                    <RiskBadge level={alert.severity} size="sm" showDot={false} />
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2">
                    {alert.message}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono">
                    <span>Node {alert.nodeId}</span>
                    <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-400">
              Gateway Packet Frequency: <strong className="text-white">10s Intervals</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
