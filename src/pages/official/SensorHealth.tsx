import React from 'react';
import { useData } from '../../context/DataContext';
import { RiskBadge } from '../../components/common/RiskBadge';
import {
  HeartPulse,
  Radio,
  Battery,
  AlertTriangle,
  Sun,
  Activity,
  CheckCircle2,
  XCircle,
  Power,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

export const SensorHealth: React.FC = () => {
  const { sensors, zones, readings } = useData();

  // Metrics per Requirement #21
  const onlineCount = sensors.filter((s) => s.status === 'Online').length;
  const offlineCount = sensors.filter((s) => s.status === 'Offline').length;
  const warningCount = sensors.filter((s) => s.status === 'Warning' || s.status === 'Critical').length;
  const lowBatteryCount = sensors.filter((s) => s.batteryLevel < 25).length;

  // Chart data: Battery levels per sensor
  const batteryData = sensors.map((s) => ({
    name: s.id,
    battery: s.batteryLevel,
    solar: s.solarVoltage || 4.1,
  }));

  // Chart data: Availability breakdown
  const availabilityData = [
    { name: 'Online', value: onlineCount, color: '#10b981' },
    { name: 'Warning / Active', value: warningCount, color: '#f59e0b' },
    { name: 'Offline / Flat', value: offlineCount, color: '#64748b' },
  ];

  // Recent 12 telemetry readings for temp & smoke trends
  const trendData = readings.slice(-12).map((r, i) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: r.temperature,
    smoke: r.smokeLevel,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <HeartPulse className="w-6 h-6 text-emerald-400" />
          <span>LoRa Sensor Mesh Health & Hardware Telemetry</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Diagnostics for solar harvesting, lithium storage, RF propagation, and node availability
        </p>
      </div>

      {/* Top 4 Metrics per Requirement #21 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Online */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Online Nodes</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{onlineCount}</div>
          <span className="text-[11px] text-slate-400">Normal RF broadcast</span>
        </div>

        {/* Warning */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Warning State</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{warningCount}</div>
          <span className="text-[11px] text-amber-300">Environmental flag</span>
        </div>

        {/* Low Battery */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Low Battery (&lt;25%)</span>
            <Battery className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400">{lowBatteryCount}</div>
          <span className="text-[11px] text-red-300">Requires solar check</span>
        </div>

        {/* Offline */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Offline Nodes</span>
            <XCircle className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-black text-slate-400">{offlineCount}</div>
          <span className="text-[11px] text-slate-500">Unreachable packet</span>
        </div>
      </div>

      {/* Visual Charts per Requirement #21 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Battery Levels Bar Chart (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Sensor Battery Health (%)</h3>
              <p className="text-xs text-slate-400">Current solar battery reserve per LoRa unit</p>
            </div>
            <span className="text-xs text-emerald-400 font-mono">18650 Li-Ion Cells</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batteryData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="battery" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sensor Availability Doughnut Chart (1 col) */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Sensor Node Availability</h3>
            <p className="text-xs text-slate-400 mb-4">Mesh operational breakdown</p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={availabilityData}
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {availabilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-800 text-xs">
            {availabilityData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-300">{d.name}:</span>
                </div>
                <strong className="text-white font-mono">{d.value} Nodes</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Temperature & Smoke Real-Time Trends Chart */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Canopy Temperature & Smoke Trends</h3>
            <p className="text-xs text-slate-400">Telemetry historical time-series</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Temperature (°C)
            </span>
            <span className="flex items-center gap-1.5 text-orange-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              Smoke (ppm)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Temperature (°C)"
              />
              <Line
                type="monotone"
                dataKey="smoke"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Smoke (ppm)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
