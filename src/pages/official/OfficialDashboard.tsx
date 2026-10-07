import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { RiskBadge } from '../../components/common/RiskBadge';
import { ForestMap } from '../../components/map/ForestMap';
import { SensorDataPanel } from '../../components/common/SensorDataPanel';
import {
  Trees,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Radio,
  Activity,
  ArrowRight,
  Droplets,
  Wind,
  Thermometer,
  Clock,
  MapPin,
} from 'lucide-react';

interface OfficialDashboardProps {
  onNavigateTab: (tab: string, extra?: any) => void;
}

export const OfficialDashboard: React.FC<OfficialDashboardProps> = ({ onNavigateTab }) => {
  const { currentUser } = useAuth();
  const { zones, sensors, alerts, incidents, simulateFireEvent } = useData();

  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || 'zone-1');
  const [selectedSensorId, setSelectedSensorId] = useState<string | undefined>(undefined);

  // Statistics per Requirement #14
  const totalZones = zones.length;
  const safeZones = zones.filter((z) => z.riskLevel === 'Low').length;
  const warningZones = zones.filter((z) => z.riskLevel === 'Moderate').length;
  const highRiskZones = zones.filter((z) => z.riskLevel === 'High' || z.riskLevel === 'Critical').length;
  const activeFireAlerts = alerts.filter((a) => !a.resolved).length;
  const sensorsOnline = sensors.filter((s) => s.status === 'Online' || s.status === 'Warning' || s.status === 'Critical').length;

  const currentZone = zones.find((z) => z.id === selectedZoneId) || zones[0];
  const currentZoneSensors = sensors.filter((s) => s.zoneId === currentZone?.id);

  const criticalOrHighAlerts = alerts.filter(
    (a) => (a.severity === 'Critical' || a.severity === 'High') && !a.resolved
  );

  return (
    <div className="space-y-6">
      {/* Top Banner per Requirement #14 */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Forest Field Operations Desk</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome, Forest Official
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Real-time forest fire monitoring and early warning system. Solar LoRa telemetry is continuously streaming canopy status.
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
              onClick={() => onNavigateTab('live-monitoring')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <span>Live Map View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Top 6 Statistic Cards per Requirement #14 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Zones */}
        <div
          onClick={() => onNavigateTab('zones')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Zones</span>
            <Trees className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{totalZones}</div>
          <span className="text-[11px] text-slate-400 font-medium">Reserve Sectors</span>
        </div>

        {/* Safe Zones */}
        <div
          onClick={() => onNavigateTab('zones')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Safe Zones</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{safeZones}</div>
          <span className="text-[11px] text-emerald-400 font-medium">Baseline Normal</span>
        </div>

        {/* Warning Zones */}
        <div
          onClick={() => onNavigateTab('zones')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Warning Zones</span>
            <AlertTriangle className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-yellow-400">{warningZones}</div>
          <span className="text-[11px] text-yellow-300 font-medium">Elevated Aridity</span>
        </div>

        {/* High-Risk Zones */}
        <div
          onClick={() => onNavigateTab('zones')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">High-Risk Zones</span>
            <Flame className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-orange-400">{highRiskZones}</div>
          <span className="text-[11px] text-orange-300 font-medium">Intense Monitoring</span>
        </div>

        {/* Active Fire Alerts */}
        <div
          onClick={() => onNavigateTab('alerts')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Fire Alerts</span>
            <Flame className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-red-400">{activeFireAlerts}</div>
          <span className="text-[11px] text-red-300 font-medium">Action Required</span>
        </div>

        {/* Sensors Online */}
        <div
          onClick={() => onNavigateTab('sensors')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sensors Online</span>
            <Radio className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-cyan-400">{sensorsOnline}</div>
          <span className="text-[11px] text-cyan-300 font-medium">Of {sensors.length} Endpoints</span>
        </div>
      </div>

      {/* Critical Active Alert Warning Banner if present */}
      {criticalOrHighAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/80 to-slate-900 border-2 border-red-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-red-600/30 text-red-400 animate-pulse border border-red-500/30">
              <Flame className="w-5 h-5 text-red-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-red-400">
                  {criticalOrHighAlerts.length} High-Priority Fire Alert(s) Active
                </span>
                <span className="text-[11px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-mono">
                  Immediate Attention
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {criticalOrHighAlerts[0]?.message}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('alerts')}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-950/50 transition-all shrink-0 self-start sm:self-auto"
          >
            Manage Fire Alerts
          </button>
        </div>
      )}

      {/* Main Tactical Split: Tactical Forest Map + Selected Zone Sensor Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Simulated Forest Map */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Tactical Forest Map & Zone Radar</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Click any zone pin to inspect microclimate
            </span>
          </div>

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
        </div>

        {/* Right 1 Col: Sensor Data Panel for Selected Zone */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Canopy Sensor Telemetry</span>
            </h3>
            <span className="text-xs text-emerald-400 font-semibold">
              Live Feed
            </span>
          </div>

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
