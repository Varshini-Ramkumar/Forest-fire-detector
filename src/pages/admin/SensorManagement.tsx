import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { SensorNode, SensorStatus, RiskLevel } from '../../types';
import { RiskBadge } from '../../components/common/RiskBadge';
import { calculateSensorRisk } from '../../utils/fireLogic';
import {
  Radio,
  Plus,
  Edit2,
  Trash2,
  Power,
  Battery,
  Thermometer,
  Wind,
  Droplets,
  Flame,
  Sun,
  X,
  Search,
  Filter,
} from 'lucide-react';

export const SensorManagement: React.FC = () => {
  const { sensors, zones, addSensor, updateSensor, deleteSensor } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Online' | 'Offline' | 'Warning' | 'Critical'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState<SensorNode | null>(null);

  // Form State
  const [nodeName, setNodeName] = useState('');
  const [zoneId, setZoneId] = useState(zones[0]?.id || 'zone-1');
  const [latitude, setLatitude] = useState(11.41);
  const [longitude, setLongitude] = useState(76.68);
  const [temperature, setTemperature] = useState(30);
  const [humidity, setHumidity] = useState(65);
  const [smokeLevel, setSmokeLevel] = useState(15);
  const [flameDetected, setFlameDetected] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(90);
  const [status, setStatus] = useState<SensorStatus>('Online');

  const openAddModal = () => {
    setEditingSensor(null);
    setNodeName(`LoRa Node ${100 + sensors.length + 1} (Canopy Sector)`);
    setZoneId(zones[0]?.id || 'zone-1');
    setLatitude(11.41);
    setLongitude(76.68);
    setTemperature(29.5);
    setHumidity(68);
    setSmokeLevel(12);
    setFlameDetected(false);
    setBatteryLevel(95);
    setStatus('Online');
    setIsModalOpen(true);
  };

  const openEditModal = (sensor: SensorNode) => {
    setEditingSensor(sensor);
    setNodeName(sensor.nodeName);
    setZoneId(sensor.zoneId);
    setLatitude(sensor.latitude);
    setLongitude(sensor.longitude);
    setTemperature(sensor.temperature);
    setHumidity(sensor.humidity);
    setSmokeLevel(sensor.smokeLevel);
    setFlameDetected(sensor.flameDetected);
    setBatteryLevel(sensor.batteryLevel);
    setStatus(sensor.status);
    setIsModalOpen(true);
  };

  const handleToggleOnline = async (sensor: SensorNode) => {
    const newStatus = sensor.status === 'Offline' ? 'Online' : 'Offline';
    await updateSensor({
      ...sensor,
      status: newStatus,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const evaluated = calculateSensorRisk(
      Number(temperature),
      Number(humidity),
      Number(smokeLevel),
      flameDetected
    );

    if (editingSensor) {
      await updateSensor({
        ...editingSensor,
        nodeName,
        zoneId,
        latitude: Number(latitude),
        longitude: Number(longitude),
        temperature: Number(temperature),
        humidity: Number(humidity),
        smokeLevel: Number(smokeLevel),
        flameDetected,
        batteryLevel: Number(batteryLevel),
        status,
        riskLevel: evaluated.riskLevel,
      });
    } else {
      await addSensor({
        nodeName,
        zoneId,
        latitude: Number(latitude),
        longitude: Number(longitude),
        temperature: Number(temperature),
        humidity: Number(humidity),
        smokeLevel: Number(smokeLevel),
        flameDetected,
        batteryLevel: Number(batteryLevel),
        solarVoltage: 4.2,
        loraRssi: -84,
        loraSnr: 8.0,
        status,
        lastUpdated: 'Just now',
        riskLevel: evaluated.riskLevel,
      });
    }
    setIsModalOpen(false);
  };

  const filteredSensors = sensors.filter((s) => {
    const matchesSearch =
      s.nodeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.zoneId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ? true : s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Radio className="w-6 h-6 text-cyan-400" />
            <span>LoRa Sensor Node Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Solar-powered wireless IoT edge devices, payload registers, and threshold controls
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/50 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register Sensor Node</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Node ID, Name, Zone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {(['All', 'Online', 'Offline', 'Warning', 'Critical'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                statusFilter === st
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Sensor Nodes Table per Requirement #11 */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Node ID & Name</th>
                <th className="py-3.5 px-4">Forest Zone</th>
                <th className="py-3.5 px-4">Temperature</th>
                <th className="py-3.5 px-4">Humidity</th>
                <th className="py-3.5 px-4">Smoke Level</th>
                <th className="py-3.5 px-4">Flame Sensor</th>
                <th className="py-3.5 px-4">Battery & Solar</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Updated</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredSensors.map((sensor) => {
                const zone = zones.find((z) => z.id === sensor.zoneId);

                return (
                  <tr key={sensor.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-bold font-mono">
                          {sensor.id}
                        </div>
                        <div>
                          <div className="font-bold text-white">{sensor.nodeName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            RSSI: {sensor.loraRssi || -85} dBm • SNR: +{sensor.loraSnr || 7.5} dB
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">
                        {zone?.name || sensor.zoneId}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className={`font-bold ${sensor.temperature >= 45 ? 'text-red-400 font-black' : sensor.temperature >= 38 ? 'text-amber-400' : 'text-slate-200'}`}>
                        {sensor.temperature}°C
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-cyan-300">
                      {sensor.humidity}%
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className={`font-semibold ${sensor.smokeLevel >= 70 ? 'text-orange-400' : 'text-slate-300'}`}>
                        {sensor.smokeLevel} ppm
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {sensor.flameDetected ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                          <Flame className="w-3 h-3 text-red-400" />
                          DETECTED
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">No</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 font-mono text-slate-300">
                          <Battery className={`w-3.5 h-3.5 ${sensor.batteryLevel < 20 ? 'text-red-400' : 'text-emerald-400'}`} />
                          <span>{sensor.batteryLevel}%</span>
                        </div>
                        <span className="text-[10px] text-amber-400 font-mono">
                          {sensor.solarVoltage || 4.2}V
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <RiskBadge level={sensor.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {sensor.lastUpdated}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleOnline(sensor)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            sensor.status === 'Offline'
                              ? 'text-emerald-400 hover:bg-emerald-950/40'
                              : 'text-amber-400 hover:bg-amber-950/40'
                          }`}
                          title={sensor.status === 'Offline' ? 'Enable Sensor' : 'Disable Sensor'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(sensor)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Edit Sensor"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteSensor(sensor.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                          title="Delete Sensor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Sensor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400" />
                <span>{editingSensor ? `Edit ${editingSensor.id}` : 'Register New LoRa Node'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Node Identifier & Name
                </label>
                <input
                  type="text"
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  placeholder="e.g. LoRa Node 114 (Canopy Sector)"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Assign to Forest Zone
                </label>
                <select
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Environmental Calibration Fields */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                  Simulated Telemetry Registers
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Humidity (%)</label>
                    <input
                      type="number"
                      value={humidity}
                      onChange={(e) => setHumidity(parseInt(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Smoke (ppm)</label>
                    <input
                      type="number"
                      value={smokeLevel}
                      onChange={(e) => setSmokeLevel(parseInt(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Battery (%)</label>
                    <input
                      type="number"
                      value={batteryLevel}
                      onChange={(e) => setBatteryLevel(parseInt(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as SensorStatus)}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    >
                      <option value="Online">Online</option>
                      <option value="Warning">Warning</option>
                      <option value="Critical">Critical</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="flameCheck"
                    checked={flameDetected}
                    onChange={(e) => setFlameDetected(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="flameCheck" className="text-xs text-red-300 font-semibold cursor-pointer">
                    Optical Flame IR Sensor Triggered (Fire Detection)
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-950/50"
                >
                  {editingSensor ? 'Save Node' : 'Register Sensor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
