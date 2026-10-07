import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Flame,
  Volume2,
  VolumeX,
  Bell,
  User,
  LogOut,
  Settings,
  Shield,
  Activity,
  Menu,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { SimulateFireModal } from './SimulateFireModal';

interface HeaderProps {
  onToggleSidebar?: () => void;
  pageTitle?: string;
  onNavigateToSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  pageTitle = 'Dashboard',
  onNavigateToSettings,
}) => {
  const { currentUser, logout, isDemoMode } = useAuth();
  const {
    settings,
    updateSettings,
    alerts,
    lastTelemetryTick,
    activeCriticalAlert,
    resolveDemoFire,
  } = useData();

  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const unackAlerts = alerts.filter((a) => !a.acknowledged && !a.resolved);

  const handleToggleSound = () => {
    updateSettings({ soundAlertsEnabled: !settings.soundAlertsEnabled });
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>{pageTitle}</span>
            {isDemoMode && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full">
                Demo Mode
              </span>
            )}
          </h1>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-emerald-400">
              Live • Updated just now
            </span>
            <span className="text-slate-600">|</span>
            <span className="font-mono text-slate-400">LoRa Gateway 868MHz</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Simulate Fire Event Button (#27) */}
        <button
          onClick={() => setIsSimulateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-red-950/50 border border-red-500/30 transition-all transform active:scale-95 select-none"
        >
          <Flame className="w-4 h-4 text-yellow-300 animate-pulse" />
          <span className="hidden sm:inline">Simulate Fire Event</span>
          <span className="sm:hidden">Simulate</span>
          <span className="text-[9px] bg-black/40 text-amber-200 px-1.5 py-0.5 rounded font-extrabold uppercase">
            DEMO
          </span>
        </button>

        {/* Quick Resolve Button if Active Critical Fire exists */}
        {activeCriticalAlert && (
          <button
            onClick={() => resolveDemoFire(activeCriticalAlert.zoneId)}
            className="hidden md:flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all"
            title="Extinguish and reset demo fire"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resolve Fire</span>
          </button>
        )}

        {/* Audio Alert Toggle */}
        <button
          onClick={handleToggleSound}
          className={`p-2 rounded-xl border transition-all ${
            settings.soundAlertsEnabled
              ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700'
              : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:text-slate-400'
          }`}
          title={settings.soundAlertsEnabled ? 'Sound alarms enabled' : 'Sound alarms muted'}
        >
          {settings.soundAlertsEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        {/* Alerts Badge */}
        <div className="relative">
          <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
            <Bell className="w-4 h-4" />
          </div>
          {unackAlerts.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow">
              {unackAlerts.length}
            </span>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-800 border border-emerald-500/40 flex items-center justify-center text-emerald-200 text-xs font-bold uppercase">
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-bold text-white leading-tight truncate max-w-[130px]">
                {currentUser?.name || 'Forest User'}
              </div>
              <div className="text-[10px] text-emerald-400 font-medium capitalize">
                {currentUser?.role === 'admin' ? 'Administrator' : 'Forest Official'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in">
              <div className="px-4 py-3 border-b border-slate-800">
                <p className="text-xs font-bold text-white">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{currentUser?.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-[10px] font-semibold text-emerald-400">
                  <Shield className="w-3 h-3" />
                  <span>{currentUser?.department || 'Forest Department'}</span>
                </div>
              </div>

              <div className="p-1">
                {onNavigateToSettings && (
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavigateToSettings();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>System Settings</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <SimulateFireModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
      />
    </header>
  );
};
