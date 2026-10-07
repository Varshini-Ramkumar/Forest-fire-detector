import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Flame, CheckCircle, ShieldAlert, Sparkles, X, MapPin } from 'lucide-react';

interface SimulateFireModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulateFireModal: React.FC<SimulateFireModalProps> = ({ isOpen, onClose }) => {
  const { zones, simulateFireEvent, resolveDemoFire } = useData();
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || 'zone-5');
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const handleSimulate = async () => {
    setIsSimulating(true);
    await simulateFireEvent(selectedZoneId);
    setIsSimulating(false);
    onClose();
  };

  const handleResolve = async () => {
    setIsSimulating(true);
    await resolveDemoFire(selectedZoneId);
    setIsSimulating(false);
    onClose();
  };

  const currentZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border-b border-red-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Flame className="w-5 h-5 text-red-500" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/20 border border-red-500/30 text-red-400 px-2 py-0.5 rounded">
                  DEMO SIMULATION
                </span>
                <span className="text-xs text-slate-400 font-medium">Field Test Sandbox</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Simulate Forest Fire Event
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-200">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
            <div className="font-semibold flex items-center gap-1.5 mb-1 text-amber-200">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              Presentation Demonstration Protocol
            </div>
            This module triggers a realistic multi-sensor telemetry spike (54°C, 98 ppm smoke, optical flame sensor trigger, and LoRa packet dispatch) to demonstrate early warning alarms and automated incident response in real time.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Target Forest Zone
            </label>
            <div className="grid grid-cols-1 gap-2">
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    selectedZoneId === zone.id
                      ? 'bg-red-500/10 border-red-500/50 text-white shadow-md shadow-red-950/40 ring-1 ring-red-500/40'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className={`w-4 h-4 ${selectedZoneId === zone.id ? 'text-red-400' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-sm font-semibold">{zone.name}</div>
                      <div className="text-xs text-slate-400">{zone.location} • {zone.totalSensors} LoRa Nodes</div>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      zone.riskLevel === 'Critical'
                        ? 'bg-red-500/20 text-red-300'
                        : zone.riskLevel === 'High'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {zone.riskLevel}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Simulated Values Preview */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Telemetry Injected to LoRa Node
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-red-950/40 border border-red-500/20">
                <span className="text-slate-400 block">Temperature</span>
                <span className="text-red-400 font-bold text-sm">54.2°C</span>
              </div>
              <div className="p-2 rounded-lg bg-orange-950/40 border border-orange-500/20">
                <span className="text-slate-400 block">Smoke</span>
                <span className="text-orange-400 font-bold text-sm">98 ppm</span>
              </div>
              <div className="p-2 rounded-lg bg-yellow-950/40 border border-yellow-500/20">
                <span className="text-slate-400 block">Optical Flame</span>
                <span className="text-yellow-400 font-bold text-sm">DETECTED</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 transition-all disabled:opacity-50"
            >
              <Flame className="w-4 h-4 text-yellow-300 animate-pulse" />
              Simulate Fire Event
            </button>

            <button
              onClick={handleResolve}
              disabled={isSimulating}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Resolve Fire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
