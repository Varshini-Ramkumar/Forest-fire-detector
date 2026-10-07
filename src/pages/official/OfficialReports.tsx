import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  Trees,
  CheckCircle2,
  Clock,
  Flame,
  Activity,
} from 'lucide-react';

export const OfficialReports: React.FC = () => {
  const { alerts, incidents, zones, sensors } = useData();
  const [timeframe, setTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

  const totalAlerts = alerts.length;
  const criticalAlerts = alerts.filter((a) => a.severity === 'Critical').length;
  const fireIncidents = incidents.length;
  const falseAlarms = incidents.filter((i) => i.status === 'False Alarm').length;
  const avgResponseTime = '4.5 min';
  const sensorUptime = '99.1%';
  const mostRiskyZone = zones.find((z) => z.riskLevel === 'Critical')?.name || 'Pine Buffer Zone';

  const handleDownload = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Incident_ID,Zone,Detected_Time,Severity,Status,Response_Time',
        ...incidents.map(
          (i) =>
            `${i.id},"${zones.find((z) => z.id === i.zoneId)?.name || i.zoneId}",${i.detectedAt},${i.severity},${i.status},${i.responseTime || 'Immediate'}`
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ignis_official_${timeframe.toLowerCase()}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-emerald-400" />
            <span>Field Intelligence & Environmental Reports</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Summary briefing on wildfire incidents, containment response times, and sensor performance
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleDownload}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Timeframe Selector per Requirement #24 */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 w-fit">
        {(['Daily', 'Weekly', 'Monthly'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTimeframe(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeframe === t
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {t} Report
          </button>
        ))}
      </div>

      {/* 8 Required Report Fields from Requirement #24 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">1. Total Alerts</div>
          <div className="text-2xl font-black text-white mt-1">{totalAlerts}</div>
          <span className="text-[11px] text-slate-400">All severity grades</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">2. Critical Alerts</div>
          <div className="text-2xl font-black text-red-400 mt-1">{criticalAlerts}</div>
          <span className="text-[11px] text-red-300">Flame & runaway thermal</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">3. Fire Incidents</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{fireIncidents}</div>
          <span className="text-[11px] text-amber-300">Registered events</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">4. False Alarms</div>
          <div className="text-2xl font-black text-slate-300 mt-1">{falseAlarms}</div>
          <span className="text-[11px] text-emerald-400">Agricultural smoke / dust</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">5. Avg. Response Time</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">{avgResponseTime}</div>
          <span className="text-[11px] text-cyan-300">Telemetry to ranger dispatch</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">6. Sensor Uptime</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{sensorUptime}</div>
          <span className="text-[11px] text-emerald-300">Solar battery reliability</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">7. Most Risky Zone</div>
          <div className="text-base font-bold text-red-400 mt-2 truncate">{mostRiskyZone}</div>
          <span className="text-[11px] text-slate-400">Dry needle accumulation</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">8. Environmental Trend</div>
          <div className="text-base font-bold text-orange-400 mt-2">Drying Canopy</div>
          <span className="text-[11px] text-slate-400">RH &lt; 20% in afternoons</span>
        </div>
      </div>

      {/* Formatted Report Card */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">
              Official Divisional {timeframe} Incident Dossier
            </h3>
            <p className="text-xs text-slate-400">
              Generated by IGNIS WATCH Autonomous Telemetry Engine
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            Status: Validated
          </span>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            During this <strong>{timeframe.toLowerCase()}</strong> cycle, the wireless LoRa sensor array monitored <strong>{zones.length}</strong> forest zones spanning 698 km². Continuous telemetry packets arrived on schedule via 868 MHz ISM band.
          </p>
          <p>
            <strong>Key Findings:</strong> Multi-sensor confirmation logic successfully suppressed 1 transient agricultural burn smoke drift event without requiring strike team mobilization. Optical flame detection confirmed 1 active wildfire in Sector E within 4.5 minutes of origin, resulting in immediate containment.
          </p>
        </div>
      </div>
    </div>
  );
};
