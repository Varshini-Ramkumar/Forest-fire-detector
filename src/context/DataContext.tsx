import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  ForestZone,
  SensorNode,
  Alert,
  FireIncident,
  SensorReading,
  UserProfile,
  SystemSettings,
  RiskLevel,
  IncidentStatus,
} from '../types';
import {
  subscribeToCollection,
  upsertDocument,
  deleteDocument,
  demoStore,
} from '../firebase/firestoreService';
import { useAuth } from './AuthContext';
import { calculateSensorRisk, evaluateZoneRisk } from '../utils/fireLogic';
import confetti from 'canvas-confetti';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'danger' | 'warning' | 'info';
}

interface DataContextType {
  zones: ForestZone[];
  sensors: SensorNode[];
  alerts: Alert[];
  incidents: FireIncident[];
  readings: SensorReading[];
  officials: UserProfile[];
  settings: SystemSettings;
  activeCriticalAlert: Alert | null;
  dismissCriticalModal: () => void;
  // Simulations
  simulateFireEvent: (zoneId?: string) => Promise<void>;
  resolveDemoFire: (zoneId?: string) => Promise<void>;
  // Alerts
  acknowledgeAlert: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  // Zones
  addZone: (zone: Omit<ForestZone, 'id'>) => Promise<void>;
  updateZone: (zone: ForestZone) => Promise<void>;
  deleteZone: (zoneId: string) => Promise<void>;
  // Sensors
  addSensor: (sensor: Omit<SensorNode, 'id'>) => Promise<void>;
  updateSensor: (sensor: SensorNode) => Promise<void>;
  deleteSensor: (sensorId: string) => Promise<void>;
  // Officials
  addOfficial: (official: Omit<UserProfile, 'id' | 'createdAt'>) => Promise<void>;
  updateOfficial: (official: UserProfile) => Promise<void>;
  deleteOfficial: (officialId: string) => Promise<void>;
  // Incidents
  updateIncidentStatus: (incidentId: string, status: IncidentStatus) => Promise<void>;
  // Settings
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  // Toasts
  toasts: ToastItem[];
  addToast: (message: string, type?: 'success' | 'danger' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;
  // Reset demo
  resetDemoData: () => void;
  lastTelemetryTick: Date;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Web Audio API Synthesizer for Forest Alert Beep
function playAlertChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Ignore audio permission restrictions
  }
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [zones, setZones] = useState<ForestZone[]>([]);
  const [sensors, setSensors] = useState<SensorNode[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [incidents, setIncidents] = useState<FireIncident[]>([]);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [officials, setOfficials] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(demoStore.getSettings());
  const [activeCriticalModalAlert, setActiveCriticalModalAlert] = useState<Alert | null>(null);
  const [lastTelemetryTick, setLastTelemetryTick] = useState<Date>(new Date());
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const previousAlertCount = useRef<number>(0);

  const addToast = (message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Real-time Subscriptions
  useEffect(() => {
    const unsubZones = subscribeToCollection<ForestZone>('forestZones', (data) => setZones(data));
    const unsubSensors = subscribeToCollection<SensorNode>('sensorNodes', (data) => {
      setSensors(data);
      setLastTelemetryTick(new Date());
    });
    const unsubAlerts = subscribeToCollection<Alert>('alerts', (data) => {
      setAlerts(data);
      // Check for new unacknowledged critical alert
      const unackCritical = data.find((a) => a.severity === 'Critical' && !a.acknowledged && !a.resolved);
      if (unackCritical) {
        setActiveCriticalModalAlert(unackCritical);
        if (settings.soundAlertsEnabled) {
          playAlertChime();
        }
      }
    });
    const unsubIncidents = subscribeToCollection<FireIncident>('fireIncidents', (data) => setIncidents(data));
    const unsubReadings = subscribeToCollection<SensorReading>('sensorReadings', (data) => setReadings(data));
    const unsubUsers = subscribeToCollection<UserProfile>('users', (data) => setOfficials(data));
    const unsubSettings = demoStore.subscribe('settings', (data) => setSettings(data));

    return () => {
      unsubZones();
      unsubSensors();
      unsubAlerts();
      unsubIncidents();
      unsubReadings();
      unsubUsers();
      unsubSettings();
    };
  }, [settings.soundAlertsEnabled]);

  // Periodic simulated LoRa packet heartbeats (every 10s)
  useEffect(() => {
    const interval = setInterval(() => {
      demoStore.simulateLoRaHeartbeat();
      setLastTelemetryTick(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const dismissCriticalModal = () => {
    setActiveCriticalModalAlert(null);
  };

  // 1. Simulate Fire Event (Demo Scenario)
  const simulateFireEvent = async (targetZoneId?: string) => {
    const zoneToIgnite = targetZoneId
      ? zones.find((z) => z.id === targetZoneId)
      : zones.find((z) => z.id === 'zone-5') || zones[0];

    if (!zoneToIgnite) return;

    // Find sensors in this zone
    const zoneSensors = sensors.filter((s) => s.zoneId === zoneToIgnite.id);
    const primarySensor = zoneSensors[0] || sensors[0];
    const secondarySensor = zoneSensors[1];

    // Spike Primary Sensor
    const updatedPrimary: SensorNode = {
      ...primarySensor,
      temperature: 54.2,
      humidity: 16.0,
      smokeLevel: 98,
      flameDetected: true,
      status: 'Critical',
      riskLevel: 'Critical',
      lastUpdated: 'Just now',
    };
    await upsertDocument('sensorNodes', updatedPrimary);

    // If secondary sensor exists, multi-sensor confirmation
    if (secondarySensor) {
      const updatedSecondary: SensorNode = {
        ...secondarySensor,
        temperature: 51.5,
        humidity: 19.5,
        smokeLevel: 89,
        flameDetected: true,
        status: 'Critical',
        riskLevel: 'Critical',
        lastUpdated: 'Just now',
      };
      await upsertDocument('sensorNodes', updatedSecondary);
    }

    // Update Zone status
    const updatedZone: ForestZone = {
      ...zoneToIgnite,
      riskLevel: 'Critical',
      lastUpdated: 'Just now',
    };
    await upsertDocument('forestZones', updatedZone);

    // Create Critical Fire Alert
    const newAlertId = `ALT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAlert: Alert = {
      id: newAlertId,
      zoneId: zoneToIgnite.id,
      nodeId: primarySensor.id,
      type: 'Flame Detected',
      message: `SIMULATION: Thermal runaway and optical flame detection confirmed in ${zoneToIgnite.name}!`,
      severity: 'Critical',
      temperature: 54.2,
      smokeLevel: 98,
      humidity: 16.0,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      resolved: false,
    };
    await upsertDocument('alerts', newAlert);

    // Create Incident record
    const newIncidentId = `INC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newIncident: FireIncident = {
      id: newIncidentId,
      zoneId: zoneToIgnite.id,
      detectedAt: new Date().toISOString(),
      severity: 'Critical',
      status: 'Detected',
      temperature: 54.2,
      smokeLevel: 98,
      responseTime: 'Immediate (Telemetry Trigger)',
      description: `[DEMO SIMULATION] Spontaneous fire signature generated for demonstration in ${zoneToIgnite.name}. Multi-sensor confirmation verified.`,
      dispatchedUnits: ['Emergency Rapid Strike Team 1', 'Aerial Drone Fleet Recon'],
    };
    await upsertDocument('fireIncidents', newIncident);

    // Add reading record
    await upsertDocument('sensorReadings', {
      id: `read-sim-${Date.now()}`,
      nodeId: primarySensor.id,
      zoneId: zoneToIgnite.id,
      temperature: 54.2,
      humidity: 16.0,
      smokeLevel: 98,
      flameDetected: true,
      batteryLevel: primarySensor.batteryLevel,
      timestamp: new Date().toISOString(),
    });

    setActiveCriticalModalAlert(newAlert);
    if (settings.soundAlertsEnabled) {
      playAlertChime();
    }

    addToast(`🔥 Critical Fire Event Simulated in ${zoneToIgnite.name}!`, 'danger');
  };

  // 2. Resolve Demo Fire
  const resolveDemoFire = async (targetZoneId?: string) => {
    const zoneId = targetZoneId || 'zone-5';
    const targetZone = zones.find((z) => z.id === zoneId) || zones[0];
    if (!targetZone) return;

    // Reset all sensors in that zone back to normal
    const zoneSensors = sensors.filter((s) => s.zoneId === targetZone.id);
    for (const sensor of zoneSensors) {
      const resetSensor: SensorNode = {
        ...sensor,
        temperature: 28.5 + Math.round(Math.random() * 3 * 10) / 10,
        humidity: 65,
        smokeLevel: 12,
        flameDetected: false,
        status: 'Online',
        riskLevel: 'Low',
        lastUpdated: 'Just now',
      };
      await upsertDocument('sensorNodes', resetSensor);
    }

    // Reset zone risk
    const resetZone: ForestZone = {
      ...targetZone,
      riskLevel: 'Low',
      lastUpdated: 'Just now',
    };
    await upsertDocument('forestZones', resetZone);

    // Resolve active alerts for this zone
    const zoneAlerts = alerts.filter((a) => a.zoneId === targetZone.id && !a.resolved);
    for (const al of zoneAlerts) {
      await upsertDocument('alerts', {
        ...al,
        acknowledged: true,
        acknowledgedBy: currentUser?.name || 'Forest Official',
        resolved: true,
        resolvedAt: new Date().toISOString(),
      });
    }

    // Resolve active incidents for this zone
    const activeIncidents = incidents.filter((i) => i.zoneId === targetZone.id && i.status !== 'Resolved');
    for (const inc of activeIncidents) {
      await upsertDocument('fireIncidents', {
        ...inc,
        status: 'Resolved',
        resolvedAt: new Date().toISOString(),
      });
    }

    setActiveCriticalModalAlert(null);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

    addToast(`✅ Fire successfully contained and resolved in ${targetZone.name}. Sensors restored.`, 'success');
  };

  // Alert actions
  const acknowledgeAlert = async (alertId: string) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (!alert) return;
    const updated = {
      ...alert,
      acknowledged: true,
      acknowledgedBy: currentUser?.name || 'Forest Official',
    };
    await upsertDocument('alerts', updated);
    if (activeCriticalModalAlert?.id === alertId) {
      setActiveCriticalModalAlert(null);
    }
    addToast(`Alert ${alertId} acknowledged.`, 'info');
  };

  const resolveAlert = async (alertId: string) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (!alert) return;
    const updated = {
      ...alert,
      acknowledged: true,
      resolved: true,
      resolvedAt: new Date().toISOString(),
    };
    await upsertDocument('alerts', updated);
    if (activeCriticalModalAlert?.id === alertId) {
      setActiveCriticalModalAlert(null);
    }
    addToast(`Alert ${alertId} resolved.`, 'success');
  };

  // Zone CRUD
  const addZone = async (zoneData: Omit<ForestZone, 'id'>) => {
    const newId = `zone-${Date.now()}`;
    const newZone: ForestZone = {
      ...zoneData,
      id: newId,
      lastUpdated: 'Just now',
    };
    await upsertDocument('forestZones', newZone);
    addToast(`Forest Zone "${newZone.name}" created successfully.`, 'success');
  };

  const updateZone = async (zone: ForestZone) => {
    await upsertDocument('forestZones', { ...zone, lastUpdated: 'Just now' });
    addToast(`Zone "${zone.name}" updated.`, 'success');
  };

  const deleteZone = async (zoneId: string) => {
    await deleteDocument('forestZones', zoneId);
    addToast(`Forest zone removed.`, 'info');
  };

  // Sensor CRUD
  const addSensor = async (sensorData: Omit<SensorNode, 'id'>) => {
    const count = sensors.length + 1;
    const newId = `SN-${100 + count}`;
    const newSensor: SensorNode = {
      ...sensorData,
      id: newId,
      lastUpdated: 'Just now',
    };
    await upsertDocument('sensorNodes', newSensor);
    addToast(`LoRa Sensor Node "${newSensor.nodeName}" registered.`, 'success');
  };

  const updateSensor = async (sensor: SensorNode) => {
    await upsertDocument('sensorNodes', { ...sensor, lastUpdated: 'Just now' });
    addToast(`Sensor node "${sensor.id}" updated.`, 'success');
  };

  const deleteSensor = async (sensorId: string) => {
    await deleteDocument('sensorNodes', sensorId);
    addToast(`Sensor node ${sensorId} deleted.`, 'info');
  };

  // Officials CRUD
  const addOfficial = async (officialData: Omit<UserProfile, 'id' | 'createdAt'>) => {
    const newId = `user-official-${Date.now()}`;
    const newOfficial: UserProfile = {
      ...officialData,
      id: newId,
      role: 'official', // Enforced per requirements: Role automatically Forest Official
      createdAt: new Date().toISOString(),
    };
    await upsertDocument('users', newOfficial);
    addToast(`Official "${newOfficial.name}" added to department directory.`, 'success');
  };

  const updateOfficial = async (official: UserProfile) => {
    await upsertDocument('users', official);
    addToast(`Official profile for "${official.name}" updated.`, 'success');
  };

  const deleteOfficial = async (officialId: string) => {
    await deleteDocument('users', officialId);
    addToast(`Official record deleted.`, 'info');
  };

  // Incident status
  const updateIncidentStatus = async (incidentId: string, status: IncidentStatus) => {
    const inc = incidents.find((i) => i.id === incidentId);
    if (!inc) return;
    const updated = {
      ...inc,
      status,
      resolvedAt: status === 'Resolved' ? new Date().toISOString() : inc.resolvedAt,
    };
    await upsertDocument('fireIncidents', updated);
    addToast(`Incident status updated to ${status}.`, 'info');
  };

  // Settings
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    demoStore.updateSettings(newSettings);
    addToast('System settings saved.', 'success');
  };

  const resetDemoData = () => {
    demoStore.resetToDefaults();
    addToast('Demo data reset to factory initial state.', 'info');
  };

  return (
    <DataContext.Provider
      value={{
        zones,
        sensors,
        alerts,
        incidents,
        readings,
        officials,
        settings,
        activeCriticalAlert: activeCriticalModalAlert,
        dismissCriticalModal,
        simulateFireEvent,
        resolveDemoFire,
        acknowledgeAlert,
        resolveAlert,
        addZone,
        updateZone,
        deleteZone,
        addSensor,
        updateSensor,
        deleteSensor,
        addOfficial,
        updateOfficial,
        deleteOfficial,
        updateIncidentStatus,
        updateSettings,
        toasts,
        addToast,
        removeToast,
        resetDemoData,
        lastTelemetryTick,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
