import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth, isFirebaseConfigured } from './config';
import {
  UserProfile,
  SensorNode,
  ForestZone,
  Alert,
  FireIncident,
  SensorReading,
  SystemSettings,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_ZONES,
  INITIAL_SENSORS,
  INITIAL_ALERTS,
  INITIAL_INCIDENTS,
  GENERATE_INITIAL_READINGS,
  DEFAULT_SETTINGS,
} from '../utils/mockData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentAuth = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.uid,
      email: currentAuth?.email,
      emailVerified: currentAuth?.emailVerified,
      isAnonymous: currentAuth?.isAnonymous,
      tenantId: currentAuth?.tenantId,
      providerInfo:
        currentAuth?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Local Storage In-Memory Reactive Store for Demo Mode Fallback
class DemoStore {
  private users: UserProfile[] = [];
  private zones: ForestZone[] = [];
  private sensors: SensorNode[] = [];
  private alerts: Alert[] = [];
  private incidents: FireIncident[] = [];
  private readings: SensorReading[] = [];
  private settings: SystemSettings = DEFAULT_SETTINGS;

  private listeners: { [key: string]: Set<(data: any) => void> } = {
    users: new Set(),
    forestZones: new Set(),
    sensorNodes: new Set(),
    alerts: new Set(),
    fireIncidents: new Set(),
    sensorReadings: new Set(),
    settings: new Set(),
  };

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedUsers = localStorage.getItem('ignis_users');
      const storedZones = localStorage.getItem('ignis_zones');
      const storedSensors = localStorage.getItem('ignis_sensors');
      const storedAlerts = localStorage.getItem('ignis_alerts');
      const storedIncidents = localStorage.getItem('ignis_incidents');
      const storedReadings = localStorage.getItem('ignis_readings');
      const storedSettings = localStorage.getItem('ignis_settings');

      this.users = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;
      this.zones = storedZones ? JSON.parse(storedZones) : INITIAL_ZONES;
      this.sensors = storedSensors ? JSON.parse(storedSensors) : INITIAL_SENSORS;
      this.alerts = storedAlerts ? JSON.parse(storedAlerts) : INITIAL_ALERTS;
      this.incidents = storedIncidents ? JSON.parse(storedIncidents) : INITIAL_INCIDENTS;
      this.readings = storedReadings ? JSON.parse(storedReadings) : GENERATE_INITIAL_READINGS();
      this.settings = storedSettings ? JSON.parse(storedSettings) : DEFAULT_SETTINGS;
    } catch {
      this.resetToDefaults();
    }
  }

  public resetToDefaults() {
    this.users = [...INITIAL_USERS];
    this.zones = [...INITIAL_ZONES];
    this.sensors = [...INITIAL_SENSORS];
    this.alerts = [...INITIAL_ALERTS];
    this.incidents = [...INITIAL_INCIDENTS];
    this.readings = GENERATE_INITIAL_READINGS();
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveToStorage();
    this.notifyAll();
  }

  private saveToStorage() {
    try {
      localStorage.setItem('ignis_users', JSON.stringify(this.users));
      localStorage.setItem('ignis_zones', JSON.stringify(this.zones));
      localStorage.setItem('ignis_sensors', JSON.stringify(this.sensors));
      localStorage.setItem('ignis_alerts', JSON.stringify(this.alerts));
      localStorage.setItem('ignis_incidents', JSON.stringify(this.incidents));
      localStorage.setItem('ignis_readings', JSON.stringify(this.readings));
      localStorage.setItem('ignis_settings', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  private notify(collectionName: string) {
    const list = this.listeners[collectionName];
    if (list) {
      let data: any = [];
      if (collectionName === 'users') data = this.users;
      else if (collectionName === 'forestZones') data = this.zones;
      else if (collectionName === 'sensorNodes') data = this.sensors;
      else if (collectionName === 'alerts') data = this.alerts;
      else if (collectionName === 'fireIncidents') data = this.incidents;
      else if (collectionName === 'sensorReadings') data = this.readings;
      else if (collectionName === 'settings') data = this.settings;

      list.forEach((cb) => {
        try {
          cb(JSON.parse(JSON.stringify(data)));
        } catch (err) {
          console.error(err);
        }
      });
    }
  }

  private notifyAll() {
    Object.keys(this.listeners).forEach((k) => this.notify(k));
  }

  public subscribe(collectionName: string, callback: (data: any) => void): () => void {
    if (!this.listeners[collectionName]) {
      this.listeners[collectionName] = new Set();
    }
    this.listeners[collectionName].add(callback);
    this.notify(collectionName);

    return () => {
      this.listeners[collectionName].delete(callback);
    };
  }

  // Users
  public getUsers(): UserProfile[] {
    return this.users;
  }
  public saveUser(user: UserProfile) {
    const idx = this.users.findIndex((u) => u.id === user.id || u.email === user.email);
    if (idx >= 0) {
      this.users[idx] = { ...this.users[idx], ...user };
    } else {
      this.users.push(user);
    }
    this.saveToStorage();
    this.notify('users');
  }
  public deleteUser(userId: string) {
    this.users = this.users.filter((u) => u.id !== userId);
    this.saveToStorage();
    this.notify('users');
  }

  // Zones
  public getZones(): ForestZone[] {
    return this.zones;
  }
  public saveZone(zone: ForestZone) {
    const idx = this.zones.findIndex((z) => z.id === zone.id);
    if (idx >= 0) {
      this.zones[idx] = { ...this.zones[idx], ...zone };
    } else {
      this.zones.push(zone);
    }
    this.saveToStorage();
    this.notify('forestZones');
  }
  public deleteZone(zoneId: string) {
    this.zones = this.zones.filter((z) => z.id !== zoneId);
    this.saveToStorage();
    this.notify('forestZones');
  }

  // Sensors
  public getSensors(): SensorNode[] {
    return this.sensors;
  }
  public saveSensor(sensor: SensorNode) {
    const idx = this.sensors.findIndex((s) => s.id === sensor.id);
    if (idx >= 0) {
      this.sensors[idx] = { ...this.sensors[idx], ...sensor };
    } else {
      this.sensors.push(sensor);
    }
    // Update activeSensors in zones
    this.recalcZoneStats();
    this.saveToStorage();
    this.notify('sensorNodes');
  }
  public deleteSensor(sensorId: string) {
    this.sensors = this.sensors.filter((s) => s.id !== sensorId);
    this.recalcZoneStats();
    this.saveToStorage();
    this.notify('sensorNodes');
  }

  private recalcZoneStats() {
    this.zones = this.zones.map((zone) => {
      const zoneSensors = this.sensors.filter((s) => s.zoneId === zone.id);
      const active = zoneSensors.filter((s) => s.status === 'Online' || s.status === 'Warning' || s.status === 'Critical').length;
      return {
        ...zone,
        totalSensors: zoneSensors.length,
        activeSensors: active,
      };
    });
    this.notify('forestZones');
  }

  // Alerts
  public getAlerts(): Alert[] {
    return this.alerts;
  }
  public saveAlert(alert: Alert) {
    const idx = this.alerts.findIndex((a) => a.id === alert.id);
    if (idx >= 0) {
      this.alerts[idx] = { ...this.alerts[idx], ...alert };
    } else {
      this.alerts.unshift(alert);
    }
    this.saveToStorage();
    this.notify('alerts');
  }
  public acknowledgeAlert(alertId: string, acknowledgedBy: string) {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      this.saveToStorage();
      this.notify('alerts');
    }
  }
  public resolveAlert(alertId: string) {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      this.saveToStorage();
      this.notify('alerts');
    }
  }

  // Incidents
  public getIncidents(): FireIncident[] {
    return this.incidents;
  }
  public saveIncident(incident: FireIncident) {
    const idx = this.incidents.findIndex((i) => i.id === incident.id);
    if (idx >= 0) {
      this.incidents[idx] = { ...this.incidents[idx], ...incident };
    } else {
      this.incidents.unshift(incident);
    }
    this.saveToStorage();
    this.notify('fireIncidents');
  }

  // Readings
  public getReadings(): SensorReading[] {
    return this.readings;
  }
  public addReading(reading: SensorReading) {
    this.readings.push(reading);
    if (this.readings.length > 200) {
      this.readings.shift();
    }
    this.saveToStorage();
    this.notify('sensorReadings');
  }

  // Settings
  public getSettings(): SystemSettings {
    return this.settings;
  }
  public updateSettings(settings: Partial<SystemSettings>) {
    this.settings = { ...this.settings, ...settings };
    this.saveToStorage();
    this.notify('settings');
  }

  // Live LoRa packet stream simulation tick
  public simulateLoRaHeartbeat() {
    this.sensors = this.sensors.map((sensor) => {
      if (sensor.status === 'Offline') return sensor;

      // Small natural micro-fluctuations in sensor readings
      const tempDelta = (Math.random() - 0.5) * 0.4;
      const humDelta = (Math.random() - 0.5) * 0.6;
      const smokeDelta = (Math.random() - 0.5) * 1.0;

      let newTemp = Math.round((sensor.temperature + tempDelta) * 10) / 10;
      let newHum = Math.round(sensor.humidity + humDelta);
      let newSmoke = Math.round(sensor.smokeLevel + smokeDelta);

      if (sensor.riskLevel === 'Critical') {
        newTemp = Math.max(48, newTemp);
        newSmoke = Math.max(80, newSmoke);
      } else if (sensor.riskLevel === 'Low') {
        newTemp = Math.min(34, Math.max(25, newTemp));
        newSmoke = Math.min(22, Math.max(5, newSmoke));
      }

      return {
        ...sensor,
        temperature: newTemp,
        humidity: Math.max(10, Math.min(95, newHum)),
        smokeLevel: Math.max(0, newSmoke),
        lastUpdated: 'Just now',
      };
    });
    this.saveToStorage();
    this.notify('sensorNodes');
  }
}

export const demoStore = new DemoStore();

// Unified Subscriptions and Data APIs
export function subscribeToCollection<T>(
  collectionName: 'users' | 'forestZones' | 'sensorNodes' | 'alerts' | 'fireIncidents' | 'sensorReadings',
  onUpdate: (data: T[]) => void,
  onError?: (err: any) => void
): () => void {
  if (isFirebaseConfigured && db) {
    try {
      const q = collection(db, collectionName);
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items: any[] = [];
          snapshot.forEach((d) => items.push({ id: d.id, ...d.data() }));
          onUpdate(items as T[]);
        },
        (error) => {
          if (onError) onError(error);
          handleFirestoreError(error, OperationType.GET, collectionName);
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn(`Firestore subscription failed on ${collectionName}, falling back to Demo Store:`, e);
      return demoStore.subscribe(collectionName, onUpdate);
    }
  }

  return demoStore.subscribe(collectionName, onUpdate);
}

export async function fetchUserById(userId: string): Promise<UserProfile | null> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as UserProfile;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    }
  }

  const found = demoStore.getUsers().find((u) => u.id === userId || u.email === userId);
  return found || null;
}

export async function upsertDocument<T extends { id: string }>(
  collectionName: 'users' | 'forestZones' | 'sensorNodes' | 'alerts' | 'fireIncidents' | 'sensorReadings',
  documentData: T
): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, collectionName, documentData.id);
      await setDoc(docRef, documentData, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${documentData.id}`);
    }
  }

  // Update in demo store as well to maintain synchronous availability
  if (collectionName === 'users') demoStore.saveUser(documentData as any);
  else if (collectionName === 'forestZones') demoStore.saveZone(documentData as any);
  else if (collectionName === 'sensorNodes') demoStore.saveSensor(documentData as any);
  else if (collectionName === 'alerts') demoStore.saveAlert(documentData as any);
  else if (collectionName === 'fireIncidents') demoStore.saveIncident(documentData as any);
  else if (collectionName === 'sensorReadings') demoStore.addReading(documentData as any);
}

export async function deleteDocument(
  collectionName: 'users' | 'forestZones' | 'sensorNodes' | 'alerts' | 'fireIncidents',
  documentId: string
): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${documentId}`);
    }
  }

  if (collectionName === 'users') demoStore.deleteUser(documentId);
  else if (collectionName === 'forestZones') demoStore.deleteZone(documentId);
  else if (collectionName === 'sensorNodes') demoStore.deleteSensor(documentId);
}
