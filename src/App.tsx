/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Login } from './pages/Login';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { CriticalAlertModal } from './components/common/CriticalAlertModal';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageOfficials } from './pages/admin/ManageOfficials';
import { ForestZones as AdminForestZones } from './pages/admin/ForestZones';
import { SensorManagement } from './pages/admin/SensorManagement';
import { AlertManagement } from './pages/admin/AlertManagement';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminSettings } from './pages/admin/AdminSettings';

// Forest Official Pages
import { OfficialDashboard } from './pages/official/OfficialDashboard';
import { LiveMonitoring } from './pages/official/LiveMonitoring';
import { OfficialAlerts } from './pages/official/OfficialAlerts';
import { OfficialZones } from './pages/official/OfficialZones';
import { SensorHealth } from './pages/official/SensorHealth';
import { Analytics } from './pages/official/Analytics';
import { FireIncidents } from './pages/official/FireIncidents';
import { OfficialReports } from './pages/official/OfficialReports';

function AppContent() {
  const { currentUser, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Synchronize tab based on role when user logs in or changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        setCurrentTab('dashboard');
      } else {
        setCurrentTab('home');
      }
    }
  }, [currentUser?.role]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <div className="absolute w-8 h-8 rounded-full bg-emerald-500/20 animate-pulse" />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-emerald-400">
          IGNIS WATCH • Initializing Sensor Mesh Telemetry...
        </p>
      </div>
    );
  }

  // Not logged in -> Show Login Page per Requirement #5 & #31
  if (!currentUser) {
    return (
      <>
        <Login
          onLoginSuccess={(role) => {
            setCurrentTab(role === 'admin' ? 'dashboard' : 'home');
          }}
        />
        <ToastContainer />
      </>
    );
  }

  const role = currentUser.role;

  // Title for top header
  const getPageTitle = () => {
    switch (currentTab) {
      // Admin
      case 'dashboard':
        return 'Administrator Command Center';
      case 'officials':
        return 'Manage Forest Officials';
      case 'zones':
        return role === 'admin' ? 'Forest Zone Administration' : 'Forest Zones Overview';
      case 'sensors':
        return role === 'admin' ? 'Sensor Node Management' : 'Sensor Health & Diagnostics';
      case 'alerts':
        return role === 'admin' ? 'System Alert Queue' : 'Fire Alert Center';
      case 'reports':
        return 'Forest Intelligence Reports';
      case 'settings':
        return 'System & LoRa Settings';

      // Official
      case 'home':
        return 'Forest Operations Dashboard';
      case 'live-monitoring':
        return 'Live Spatial Canopy Monitoring';
      case 'analytics':
        return 'Wildfire Risk Analytics';
      case 'incidents':
        return 'Fire Incident Dispatch & Response';
      default:
        return 'Command Dashboard';
    }
  };

  const handleNavigateToZone = (zoneId: string) => {
    if (role === 'admin') {
      setCurrentTab('zones');
    } else {
      setCurrentTab('live-monitoring');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <Header
          pageTitle={getPageTitle()}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNavigateToSettings={() => setCurrentTab('settings')}
        />

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {/* Admin Routes */}
          {role === 'admin' && (
            <>
              {currentTab === 'dashboard' && (
                <AdminDashboard onNavigateTab={(t) => setCurrentTab(t)} />
              )}
              {currentTab === 'officials' && <ManageOfficials />}
              {currentTab === 'zones' && <AdminForestZones />}
              {currentTab === 'sensors' && <SensorManagement />}
              {currentTab === 'alerts' && <AlertManagement />}
              {currentTab === 'reports' && <AdminReports />}
              {currentTab === 'settings' && <AdminSettings />}
            </>
          )}

          {/* Forest Official Routes */}
          {role === 'official' && (
            <>
              {currentTab === 'home' && (
                <OfficialDashboard onNavigateTab={(t) => setCurrentTab(t)} />
              )}
              {currentTab === 'live-monitoring' && <LiveMonitoring />}
              {currentTab === 'alerts' && <OfficialAlerts />}
              {currentTab === 'zones' && (
                <OfficialZones
                  onSelectZoneForMonitoring={(zId) => setCurrentTab('live-monitoring')}
                />
              )}
              {currentTab === 'sensors' && <SensorHealth />}
              {currentTab === 'analytics' && <Analytics />}
              {currentTab === 'incidents' && <FireIncidents />}
              {currentTab === 'reports' && <OfficialReports />}
            </>
          )}
        </main>
      </div>

      {/* Emergency Critical Fire Modal Popup (#18) */}
      <CriticalAlertModal onNavigateToZone={handleNavigateToZone} />

      {/* Toast Notifications (#35) */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
