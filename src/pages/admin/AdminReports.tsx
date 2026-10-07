import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  FileBarChart,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
  Trees,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { alerts, incidents, zones, sensors } = useData();
  const [reportType, setReportType] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

  const totalAlerts = alerts.length;
  const criticalAlerts = alerts.filter((a) => a.severity === 'Critical').length;
  const fireIncidents = incidents.length;
  const falseAlarms = incidents.filter((i) => i.status === 'False Alarm').length;
  const avgResponseTime = '4.8 minutes';
  const sensorUptime = '98.6%';
  const mostRiskyZone = zones.find((z) => z.riskLevel === 'Critical')?.name || 'Pine Buffer Zone';

  const handleDownloadCSV = () => {
    const headers = ['Incident_ID', 'Zone', 'Detected_At', 'Severity', 'Status', 'Temperature_C', 'Smoke_ppm', 'Response_Time'];
    const rows = incidents.map((inc) => [
      inc.id,
      zones.find((z) => z.id === inc.zoneId)?.name || inc.zoneId,
      inc.detectedAt,
      inc.severity,
      inc.status,
      inc.temperature,
      inc.smokeLevel,
      inc.responseTime || 'N/A',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ignis_watch_${reportType.toLowerCase()}_report.csv`);
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
            <span>Audit & Operational Reports</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Official forest division fire incident records, sensor telemetry uptime, and dispatch logs
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleDownloadCSV}
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

      {/* Report Timeframe Selector per Requirement #24 */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 w-fit">
        {(['Daily', 'Weekly', 'Monthly'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setReportType(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              reportType === t
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {t} Report
          </button>
        ))}
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Total Alerts</div>
          <div className="text-2xl font-black text-white mt-1">{totalAlerts}</div>
          <span className="text-[11px] text-emerald-400 font-medium">Logged this period</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Critical Fire Alerts</div>
          <div className="text-2xl font-black text-red-400 mt-1">{criticalAlerts}</div>
          <span className="text-[11px] text-red-300 font-medium">Flame / extreme heat</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Avg. Response Time</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">{avgResponseTime}</div>
          <span className="text-[11px] text-cyan-300 font-medium">From telemetry trigger</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">LoRa Node Uptime</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{sensorUptime}</div>
          <span className="text-[11px] text-emerald-300 font-medium">Solar power reliability</span>
        </div>
      </div>

      {/* Printable Report Summary Document Card */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Department of Forest & Wildlife • Incident Analysis Division
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              IGNIS WATCH — {reportType} Fire & Telemetry Assessment
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Generated: {new Date().toLocaleDateString('en-US', { dateStyle: 'full' })} • Automated LoRa Sensor Archive
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-800 text-xs font-mono text-emerald-300 border border-slate-700">
            Doc Ref: IW-{Date.now().toString().slice(-6)}
          </span>
        </div>

        {/* Breakdown Summary Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Operational Statistics
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Confirmed Fire Incidents:</span>
                <strong className="text-white">{fireIncidents}</strong>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Recorded False Alarms:</span>
                <strong className="text-amber-400">{falseAlarms}</strong>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Highest Vulnerability Sector:</span>
                <strong className="text-red-400">{mostRiskyZone}</strong>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Active Sensor Mesh Nodes:</span>
                <strong className="text-emerald-400">{sensors.length} Nodes</strong>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Environmental Canopy Findings
            </h4>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                • <strong>Thermal Profile:</strong> Solar nodes recorded peak midday canopy temperatures up to 54.2°C in Sector E (Pine Buffer Zone), driven by desiccating humidity (&lt; 20% RH).
              </p>
              <p>
                • <strong>Early Warning Speed:</strong> Optical flame detection paired with smoke particulate rate-of-rise enabled alert dispatches in under 5 minutes, significantly ahead of conventional satellite flyovers.
              </p>
              <p>
                • <strong>Solar & Battery:</strong> LoRa sleep-cycles preserved 88%+ battery charge across 10 deployed units despite tree canopy shading.
              </p>
            </div>
          </div>
        </div>

        {/* Incident Log Table */}
        <div className="pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
            Fire Incidents Master Registry
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Incident ID</th>
                  <th className="py-2.5 px-3">Forest Zone</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Response Time</th>
                  <th className="py-2.5 px-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-mono font-bold text-white">{inc.id}</td>
                    <td className="py-2.5 px-3 text-emerald-400">{zones.find((z) => z.id === inc.zoneId)?.name || inc.zoneId}</td>
                    <td className="py-2.5 px-3 font-semibold">{inc.severity}</td>
                    <td className="py-2.5 px-3">{inc.status}</td>
                    <td className="py-2.5 px-3 font-mono">{inc.responseTime || 'Immediate'}</td>
                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs">{inc.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
