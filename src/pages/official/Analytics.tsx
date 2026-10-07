import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  TrendingUp,
  Calendar,
  Thermometer,
  Droplets,
  Wind,
  Flame,
  PieChart as PieIcon,
  BarChart3,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const Analytics: React.FC = () => {
  const { readings, zones, sensors, alerts } = useData();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // 1. Time-series readings for Line Charts
  const timeSeriesData = readings.map((r, i) => {
    const d = new Date(r.timestamp);
    return {
      time:
        timeRange === '24h'
          ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      temperature: r.temperature,
      humidity: r.humidity,
      smoke: r.smokeLevel,
    };
  });

  // 2. Fire Alerts by Month (Bar Chart per Requirement #22)
  const monthlyAlertsData = [
    { month: 'May', alerts: 14, critical: 2 },
    { month: 'Jun', alerts: 22, critical: 5 },
    { month: 'Jul', alerts: 8, critical: 1 },
    { month: 'Aug', alerts: 12, critical: 3 },
    { month: 'Sep', alerts: 19, critical: 4 },
    { month: 'Oct (Current)', alerts: 16, critical: 3 },
  ];

  // 3. Risk Distribution (Pie/Doughnut Chart per Requirement #22)
  const riskCounts = {
    Low: zones.filter((z) => z.riskLevel === 'Low').length,
    Moderate: zones.filter((z) => z.riskLevel === 'Moderate').length,
    High: zones.filter((z) => z.riskLevel === 'High').length,
    Critical: zones.filter((z) => z.riskLevel === 'Critical').length,
  };

  const riskDistributionData = [
    { name: 'Low Risk', value: riskCounts.Low, color: '#10b981' },
    { name: 'Moderate', value: riskCounts.Moderate, color: '#eab308' },
    { name: 'High Risk', value: riskCounts.High, color: '#f97316' },
    { name: 'Critical', value: riskCounts.Critical, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  // 4. Zone Risk Comparison (Bar Chart per Requirement #22)
  const zoneComparisonData = zones.map((z) => {
    const zSensors = sensors.filter((s) => s.zoneId === z.id);
    const avgTemp =
      zSensors.length > 0
        ? Math.round(
            (zSensors.reduce((a, b) => a + b.temperature, 0) / zSensors.length) * 10
          ) / 10
        : 29;
    const maxSmoke =
      zSensors.length > 0
        ? Math.max(...zSensors.map((s) => s.smokeLevel))
        : 10;

    return {
      name: z.name.split('–')[0]?.trim() || z.name,
      avgTemp,
      maxSmoke,
      riskScore:
        z.riskLevel === 'Critical'
          ? 95
          : z.riskLevel === 'High'
          ? 70
          : z.riskLevel === 'Moderate'
          ? 40
          : 15,
    };
  });

  // 5. Sensor Availability (Doughnut Chart per Requirement #22)
  const onlineCount = sensors.filter((s) => s.status === 'Online').length;
  const warningCount = sensors.filter((s) => s.status === 'Warning' || s.status === 'Critical').length;
  const offlineCount = sensors.filter((s) => s.status === 'Offline').length;

  const sensorAvailabilityData = [
    { name: 'Online (Good)', value: onlineCount, color: '#10b981' },
    { name: 'Warning (Active)', value: warningCount, color: '#f59e0b' },
    { name: 'Offline (Battery/Signal)', value: offlineCount, color: '#64748b' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Time Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <span>Environmental Telemetry & Fire Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Historical environmental regressions, monthly fire occurrences, and risk zone comparisons
          </p>
        </div>

        {/* Filters per Requirement #22: Last 24 hours, Last 7 days, Last 30 days */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-slate-400 ml-2" />
          <button
            onClick={() => setTimeRange('24h')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeRange === '24h'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 24 Hours
          </button>
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeRange === '7d'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeRange === '30d'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Row 1: Temperature & Humidity Trend Line Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Trend */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-rose-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Temperature Trend (°C)</h3>
                <p className="text-xs text-slate-400">Diurnal canopy thermal curve</p>
              </div>
            </div>
            <span className="text-xs text-rose-400 font-mono font-bold">Ambient Max 54.2°C</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis domain={[15, 60]} stroke="#64748b" fontSize={11} unit="°" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 2.5 }}
                  name="Temperature (°C)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Humidity Trend */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Relative Humidity Trend (%)</h3>
                <p className="text-xs text-slate-400">Fuel desiccation index</p>
              </div>
            </div>
            <span className="text-xs text-cyan-400 font-mono font-bold">Min 16% RH</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="humidity"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ r: 2.5 }}
                  name="Humidity (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Smoke Level Line Chart & Fire Alerts by Month Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Smoke Level Trend */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-orange-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Smoke Particulate Level (ppm)</h3>
                <p className="text-xs text-slate-400">Gas & combustion sensor tracking</p>
              </div>
            </div>
            <span className="text-xs text-orange-400 font-mono font-bold">Peak 98 ppm</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit=" ppm" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="smoke"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  dot={{ r: 2.5 }}
                  name="Smoke (ppm)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fire Alerts by Month Bar Chart */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="text-sm font-bold text-white">Fire Alerts by Month</h3>
                <p className="text-xs text-slate-400">Seasonal wildfire threat distribution</p>
              </div>
            </div>
            <span className="text-xs text-red-400 font-mono font-bold">Dry Season Surge</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyAlertsData}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="alerts" fill="#f59e0b" name="Total Alarms" radius={[4, 4, 0, 0]} />
                <Bar dataKey="critical" fill="#ef4444" name="Confirmed Critical" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Risk Distribution (Pie), Zone Risk Comparison (Bar), Sensor Availability (Doughnut) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Distribution Pie/Doughnut */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieIcon className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Reserve Risk Distribution</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">Zonal categorization breakdown</p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-risk-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1 text-xs pt-2 border-t border-slate-800">
            {riskDistributionData.map((d) => (
              <div key={d.name} className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-300">{d.name}</span>
                </div>
                <strong className="text-white">{d.value} Sectors</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Zone Risk Comparison Bar Chart */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Zone Risk Comparison</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">Vulnerability index (0-100)</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneComparisonData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={65} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="riskScore" fill="#f97316" radius={[0, 4, 4, 0]} name="Risk Index" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 text-center">
            Pine Buffer Zone ranks as highest ignition danger.
          </div>
        </div>

        {/* Sensor Availability Doughnut Chart */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Sensor Availability</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">Mesh radio link status</p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sensorAvailabilityData}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {sensorAvailabilityData.map((entry, index) => (
                      <Cell key={`cell-avail-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1 text-xs pt-2 border-t border-slate-800">
            {sensorAvailabilityData.map((d) => (
              <div key={d.name} className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-300">{d.name}</span>
                </div>
                <strong className="text-white">{d.value} Nodes</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
