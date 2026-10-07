import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { UserProfile } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Shield,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Building,
  X,
} from 'lucide-react';

export const ManageOfficials: React.FC = () => {
  const { officials, addOfficial, updateOfficial, deleteOfficial } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Disabled'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfficial, setEditingOfficial] = useState<UserProfile | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Northern Wildlife Division');
  const [active, setActive] = useState(true);

  const openAddModal = () => {
    setEditingOfficial(null);
    setName('');
    setEmail('');
    setPhone('+91 94');
    setDepartment('Northern Wildlife Division');
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (official: UserProfile) => {
    setEditingOfficial(official);
    setName(official.name);
    setEmail(official.email);
    setPhone(official.phone || '');
    setDepartment(official.department);
    setActive(official.active);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    if (editingOfficial) {
      await updateOfficial({
        ...editingOfficial,
        name,
        email,
        phone,
        department,
        active,
      });
    } else {
      await addOfficial({
        name,
        email,
        phone,
        department,
        role: 'official', // Enforced automatically per Requirement #9
        active,
      });
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = async (official: UserProfile) => {
    await updateOfficial({
      ...official,
      active: !official.active,
    });
  };

  const filteredOfficials = officials.filter((off) => {
    const matchesSearch =
      off.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      off.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      off.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Active'
        ? off.active
        : !off.active;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Manage Forest Officials</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Forest department roster, divisional postings, and authentication directory
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Official</span>
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
            placeholder="Search by name, email, department..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Status:</span>
          {(['All', 'Active', 'Disabled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Officials Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Officer Name</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Department & Division</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredOfficials.map((official) => (
                <tr key={official.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold uppercase text-xs">
                        {official.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{official.name}</div>
                        <div className="text-[10px] text-slate-500">ID: {official.id}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1 text-slate-400">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        {official.email}
                      </span>
                      {official.phone && (
                        <span className="flex items-center gap-1.5 text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          {official.phone}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      <span>{official.department}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                      <Shield className="w-3 h-3" />
                      {official.role === 'admin' ? 'Administrator' : 'Forest Official'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleStatus(official)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                        official.active
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                          : 'bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25'
                      }`}
                    >
                      {official.active ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-red-400" />
                          <span>Disabled</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(official)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Edit Official"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {official.id !== 'user-admin-1' && (
                        <button
                          onClick={() => deleteOfficial(official.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                          title="Delete Official"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Official Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>{editingOfficial ? 'Edit Forest Official' : 'Add New Forest Official'}</span>
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
                  Full Name & Title
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Range Officer Rajesh Sharma"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rajesh.sharma@igniswatch.demo"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Official Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 94432 98765"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Department / Range Assignment
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="Northern Wildlife Division">Northern Wildlife Division</option>
                  <option value="Pine Buffer & Ridge Range">Pine Buffer & Ridge Range</option>
                  <option value="Dry Forest Patrol Unit">Dry Forest Patrol Unit</option>
                  <option value="Western Watershed Basin">Western Watershed Basin</option>
                  <option value="Rapid Fire Response Crew">Rapid Fire Response Crew</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  System Role
                </label>
                <input
                  type="text"
                  value="Forest Official (Automatically Assigned)"
                  disabled
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-emerald-400 font-semibold text-xs cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Enforces strict RBAC per administrative security rules.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="activeCheck" className="text-xs text-slate-300 cursor-pointer">
                  Account Enabled & Granted Monitoring Authorization
                </label>
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
                  {editingOfficial ? 'Save Changes' : 'Create Official Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
