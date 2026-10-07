import React from 'react';
import { Logo } from './Logo';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  LayoutDashboard,
  Users,
  Trees,
  Radio,
  Bell,
  FileBarChart,
  Settings,
  Flame,
  Activity,
  HeartPulse,
  TrendingUp,
  AlertTriangle,
  Shield,
  LogOut,
  MapPin,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen = false,
  onClose,
}) => {
  const { currentUser, logout, isDemoMode } = useAuth();
  const { alerts, sensors } = useData();

  const role = currentUser?.role || 'official';
  const unackAlertsCount = alerts.filter((a) => !a.acknowledged && !a.resolved).length;
  const onlineSensorsCount = sensors.filter((s) => s.status === 'Online').length;

  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'officials', label: 'Manage Officials', icon: Users },
    { id: 'zones', label: 'Forest Zones', icon: Trees },
    { id: 'sensors', label: 'Sensor Nodes', icon: Radio },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: unackAlertsCount },
    { id: 'reports', label: 'Reports', icon: FileBarChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const officialNav = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'live-monitoring', label: 'Live Monitoring', icon: MapPin },
    { id: 'alerts', label: 'Fire Alerts', icon: Flame, badge: unackAlertsCount },
    { id: 'zones', label: 'Forest Zones', icon: Trees },
    { id: 'sensors', label: 'Sensor Health', icon: HeartPulse },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'incidents', label: 'Fire Incidents', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: FileBarChart },
  ];

  const items = role === 'admin' ? adminNav : officialNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Logo & System Online Status */}
        <div className="p-5 border-b border-slate-800/80">
          <Logo size="sm" light />

          {/* System Status Indicator per Requirement #8 */}
          <div className="mt-4 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                IGNIS WATCH ONLINE
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {onlineSensorsCount}/{sensors.length} Nodes
            </span>
          </div>
        </div>

        {/* Middle: Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {role === 'admin' ? 'Administration Portal' : 'Forest Operational Center'}
          </div>

          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && item.badge > 0 ? (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-red-500 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Bottom User & Role Banner */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <div className="text-xs font-bold text-white capitalize">
                {role === 'admin' ? 'Administrator' : 'Forest Official'}
              </div>
            </div>
            {isDemoMode && (
              <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-400 px-1.5 py-0.2 rounded">
                Demo
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-400 truncate">
            {currentUser?.department || 'Forest Department'}
          </div>

          <button
            onClick={logout}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800/60 hover:bg-red-950/40 text-slate-400 hover:text-red-300 text-xs font-semibold border border-slate-700/60 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
