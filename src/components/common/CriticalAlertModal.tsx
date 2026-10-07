import React from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Flame,
  AlertTriangle,
  Clock,
  Thermometer,
  Wind,
  Eye,
  CheckCircle,
  XCircle,
  Radio,
} from 'lucide-react';

interface CriticalAlertModalProps {
  onNavigateToZone?: (zoneId: string) => void;
}

export const CriticalAlertModal: React.FC<CriticalAlertModalProps> = ({
  onNavigateToZone,
}) => {
  const {
    activeCriticalAlert,
    dismissCriticalModal,
    acknowledgeAlert,
    zones,
    sensors,
    updateIncidentStatus,
    incidents,
    resolveDemoFire,
  } = useData();
  const { currentUser } = useAuth();

  if (!activeCriticalAlert) return null;

  const zone = zones.find((z) => z.id === activeCriticalAlert.zoneId);
  const sensor = sensors.find((s) => s.id === activeCriticalAlert.nodeId);
  const relatedIncident = incidents.find(
    (i) => i.zoneId === activeCriticalAlert.zoneId && i.status !== 'Resolved'
  );

  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Just now';
    }
  };

  const handleAcknowledge = async () => {
    await acknowledgeAlert(activeCriticalAlert.id);
  };

  const handleInvestigate = async () => {
    await acknowledgeAlert(activeCriticalAlert.id);
    if (relatedIncident) {
      await updateIncidentStatus(relatedIncident.id, 'Under Investigation');
    }
    dismissCriticalModal();
  };

  const handleViewZone = () => {
    if (onNavigateToZone) {
      onNavigateToZone(activeCriticalAlert.zoneId);
    }
    dismissCriticalModal();
  };

  const handleQuickResolve = async () => {
    await resolveDemoFire(activeCriticalAlert.zoneId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-red-500 shadow-2xl shadow-red-950/60 overflow-hidden">
        {/* Flashing Top Alert Banner */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-orange-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-black/30 backdrop-blur-sm animate-pulse">
              <Flame className="w-6 h-6 text-yellow-300" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded text-amber-200">
                  Automated LoRa Trigger
                </span>
                <span className="text-xs bg-red-950/80 px-2 py-0.5 rounded text-red-200 font-semibold border border-red-400/30">
                  Priority 1
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2 mt-0.5">
                🔥 CRITICAL FIRE ALERT
              </h2>
            </div>
          </div>
          <button
            onClick={dismissCriticalModal}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-black/20"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-slate-100">
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/20">
            <p className="text-xs text-red-300 uppercase tracking-wider font-semibold">
              Telemetry Incident Detection
            </p>
            <p className="text-sm font-semibold text-white mt-1">
              {activeCriticalAlert.message}
            </p>
          </div>

          {/* Key Metric Rows */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-xs text-slate-400">Target Forest Zone</div>
              <div className="text-base font-bold text-emerald-300 truncate">
                {zone?.name || 'Eastern Reserve'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                {zone?.location || 'Sector Coordinates 11.34°N, 76.76°E'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-xs text-slate-400">Reporting Sensor</div>
              <div className="text-base font-bold text-cyan-300 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-cyan-400" />
                {sensor?.id || activeCriticalAlert.nodeId}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                LoRa SNR: +6.4 dB • RSSI -93 dBm
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30">
              <Thermometer className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <div className="text-[11px] text-slate-300 font-medium">Temperature</div>
              <div className="text-lg font-black text-red-400">
                {activeCriticalAlert.temperature}°C
              </div>
            </div>

            <div className="p-3 rounded-xl bg-orange-950/40 border border-orange-500/30">
              <Wind className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <div className="text-[11px] text-slate-300 font-medium">Smoke Level</div>
              <div className="text-lg font-black text-orange-400">
                {activeCriticalAlert.smokeLevel > 80 ? 'High' : 'Moderate'} ({activeCriticalAlert.smokeLevel} ppm)
              </div>
            </div>

            <div className="p-3 rounded-xl bg-yellow-950/40 border border-yellow-500/30">
              <Flame className="w-5 h-5 text-yellow-400 mx-auto mb-1 animate-pulse" />
              <div className="text-[11px] text-slate-300 font-medium">Flame Sensor</div>
              <div className="text-lg font-black text-yellow-300">
                Detected
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 px-1 border-t border-slate-800 pt-3">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Timestamp: <strong className="text-slate-200">{formatTime(activeCriticalAlert.timestamp)}</strong></span>
            </div>
            <div className="text-amber-400/90 font-medium text-[11px]">
              Multi-sensor confirmation active
            </div>
          </div>

          {/* Actions Per Requirement #18 */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={handleAcknowledge}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-950/50"
            >
              <CheckCircle className="w-4 h-4" />
              Acknowledge
            </button>

            <button
              onClick={handleViewZone}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700"
            >
              <Eye className="w-4 h-4" />
              View Zone
            </button>

            <button
              onClick={handleInvestigate}
              className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-amber-950/50"
            >
              <AlertTriangle className="w-4 h-4" />
              Investigate
            </button>
          </div>

          {/* Quick Demo Containment Button */}
          <div className="pt-2 text-center border-t border-slate-800/80">
            <button
              onClick={handleQuickResolve}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium"
            >
              [DEMO SIMULATION] Resolve Demo Fire & Extinguish Immediately
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
