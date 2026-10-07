import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { ForestZone, RiskLevel } from '../../types';
import { RiskBadge } from '../../components/common/RiskBadge';
import {
  Trees,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Radio,
  Clock,
  Layers,
  X,
  Compass,
} from 'lucide-react';

export const ForestZones: React.FC = () => {
  const { zones, addZone, updateZone, deleteZone, sensors } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ForestZone | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [area, setArea] = useState('');
  const [latitude, setLatitude] = useState(11.4);
  const [longitude, setLongitude] = useState(76.7);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('Low');
  const [rangerInCharge, setRangerInCharge] = useState('');
  const [vegetationType, setVegetationType] = useState('Mixed Deciduous');

  const openAddModal = () => {
    setEditingZone(null);
    setName('');
    setLocation('');
    setArea('100 km²');
    setLatitude(11.42);
    setLongitude(76.68);
    setRiskLevel('Low');
    setRangerInCharge('Range Officer');
    setVegetationType('Moist Deciduous Canopy');
    setIsModalOpen(true);
  };

  const openEditModal = (zone: ForestZone) => {
    setEditingZone(zone);
    setName(zone.name);
    setLocation(zone.location);
    setArea(zone.area);
    setLatitude(zone.latitude);
    setLongitude(zone.longitude);
    setRiskLevel(zone.riskLevel);
    setRangerInCharge(zone.rangerInCharge || '');
    setVegetationType(zone.vegetationType || 'Deciduous');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) return;

    if (editingZone) {
      await updateZone({
        ...editingZone,
        name,
        location,
        area,
        latitude: Number(latitude),
        longitude: Number(longitude),
        riskLevel,
        rangerInCharge,
        vegetationType,
      });
    } else {
      await addZone({
        name,
        location,
        area,
        latitude: Number(latitude),
        longitude: Number(longitude),
        riskLevel,
        activeSensors: 0,
        totalSensors: 0,
        lastUpdated: 'Just now',
        rangerInCharge,
        vegetationType,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Trees className="w-6 h-6 text-emerald-400" />
            <span>Monitored Forest Zones</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Topographic zones, reserve sector divisions, and sensor allocations
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Forest Zone</span>
        </button>
      </div>

      {/* Forest Zones Table per Requirement #10 */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Zone Name</th>
                <th className="py-3.5 px-4">Location & Coordinates</th>
                <th className="py-3.5 px-4">Area (km²)</th>
                <th className="py-3.5 px-4">LoRa Sensors</th>
                <th className="py-3.5 px-4">Risk Level</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4">Last Updated</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {zones.map((zone) => {
                const zoneSensors = sensors.filter((s) => s.zoneId === zone.id);

                return (
                  <tr key={zone.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div>
                        <div className="text-white font-bold">{zone.name}</div>
                        <div className="text-[10px] text-emerald-400 font-normal">
                          {zone.vegetationType || 'Deciduous Canopy'}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-300">{zone.location}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {zone.latitude.toFixed(3)}°N, {zone.longitude.toFixed(3)}°E
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                      {zone.area}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Radio className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-emerald-400 font-bold">{zoneSensors.length}</span>
                        <span className="text-slate-500">nodes</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <RiskBadge level={zone.riskLevel} size="sm" />
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
                        <span className={`w-2 h-2 rounded-full ${zone.riskLevel === 'Critical' ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`} />
                        <span>{zone.riskLevel === 'Critical' ? 'Under Fire Threat' : 'Active Patrol'}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {zone.lastUpdated}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(zone)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Edit Zone"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteZone(zone.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                          title="Delete Zone"
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

      {/* Add / Edit Zone Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trees className="w-5 h-5 text-emerald-400" />
                <span>{editingZone ? 'Edit Forest Zone' : 'Add New Forest Zone'}</span>
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
                  Zone Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Zone G – North Ridge Sanctuary"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Location / Sector
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Western Ghats Sector 5, Escarpment"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Area Size
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="120 km²"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Initial Risk State
                  </label>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Low">Low (Safe 🟢)</option>
                    <option value="Moderate">Moderate (Warning 🟡)</option>
                    <option value="High">High (Elevated 🟠)</option>
                    <option value="Critical">Critical (Fire Danger 🔴)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Vegetation Type
                  </label>
                  <input
                    type="text"
                    value={vegetationType}
                    onChange={(e) => setVegetationType(e.target.value)}
                    placeholder="Dry Teak / Pine / Evergreen"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
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
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/50"
                >
                  {editingZone ? 'Save Zone' : 'Create Forest Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
