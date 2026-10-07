import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { SystemSettings } from '../../types';
import {
  Settings,
  Radio,
  Sliders,
  Volume2,
  VolumeX,
  RotateCcw,
  Save,
  CheckCircle2,
  ShieldAlert,
  Cpu,
  Flame,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, resetDemoData } = useData();

  const [form, setForm] = useState<SystemSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: keyof SystemSettings, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          <span>System & LoRa Hardware Settings</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Gateway radio spectrum, automated early warning thresholds, and demonstration controls
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* LoRa Communication Card */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-3">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>LoRa Wireless Gateway Parameters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Radio Spectrum Frequency Band
              </label>
              <select
                value={form.gatewayFrequency}
                onChange={(e) => handleChange('gatewayFrequency', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="868 MHz (EU/IN)">868 MHz (EU / India ISM Band)</option>
                <option value="915 MHz (US)">915 MHz (US / Americas ISM Band)</option>
                <option value="433 MHz">433 MHz (Asian UHF Band)</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Standard long-range modulation with SX1276/SX1262 transceivers.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Telemetry Polling Heartbeat (Seconds)
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={form.packetIntervalSec}
                onChange={(e) => handleChange('packetIntervalSec', parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Interval between simulated packet transmissions.
              </span>
            </div>
          </div>
        </div>

        {/* Alarm Thresholds Card */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-3">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Automated Fire Detection Trigger Thresholds</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Critical Temp Trigger (°C)
              </label>
              <input
                type="number"
                value={form.tempCriticalThreshold}
                onChange={(e) => handleChange('tempCriticalThreshold', parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Current: &ge; 48°C triggers Critical Alert.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Critical Smoke Threshold (ppm)
              </label>
              <input
                type="number"
                value={form.smokeCriticalThreshold}
                onChange={(e) => handleChange('smokeCriticalThreshold', parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Current: &ge; 75 ppm triggers Critical Alert.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Low Battery Alarm (%)
              </label>
              <input
                type="number"
                value={form.batteryLowThreshold}
                onChange={(e) => handleChange('batteryLowThreshold', parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Triggers solar maintenance notification.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="soundAlarmCheck"
              checked={form.soundAlertsEnabled}
              onChange={(e) => handleChange('soundAlertsEnabled', e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="soundAlarmCheck" className="text-xs text-slate-200 font-medium cursor-pointer">
              Enable Audible Synthesizer Sirens on Critical Fire Detections
            </label>
          </div>
        </div>

        {/* Save and Feedback */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
            {savedSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Settings updated!
              </span>
            )}
          </div>

          {/* Reset Demo Data Button */}
          <button
            type="button"
            onClick={resetDemoData}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-300 text-xs font-semibold border border-slate-700/80 transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data to Initial</span>
          </button>
        </div>
      </form>
    </div>
  );
};
