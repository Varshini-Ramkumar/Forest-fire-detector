export type UserRole = 'admin' | 'official';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  phone?: string;
  createdAt: string;
  active: boolean;
  avatar?: string;
}

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';
export type SensorStatus = 'Online' | 'Offline' | 'Warning' | 'Critical';

export interface SensorNode {
  id: string;
  nodeName: string;
  zoneId: string;
  latitude: number;
  longitude: number;
  temperature: number; // Celsius
  humidity: number; // Percentage
  smokeLevel: number; // ppm or index (0-100)
  flameDetected: boolean;
  batteryLevel: number; // Percentage
  solarVoltage?: number; // e.g., 4.2V
  loraRssi?: number; // dBm e.g. -85
  loraSnr?: number; // dB e.g. +7.5
  status: SensorStatus;
  lastUpdated: string;
  riskLevel: RiskLevel;
}

export interface ForestZone {
  id: string;
  name: string;
  location: string;
  area: string; // e.g. "145 km²"
  latitude: number;
  longitude: number;
  riskLevel: RiskLevel;
  activeSensors: number;
  totalSensors: number;
  lastUpdated: string;
  rangerInCharge?: string;
  vegetationType?: string;
}

export type AlertSeverity = 'Critical' | 'High' | 'Warning' | 'Info';

export type AlertType =
  | 'High Temperature'
  | 'Smoke Detected'
  | 'Flame Detected'
  | 'Multiple Sensor Confirmation'
  | 'Low Battery'
  | 'Sensor Offline';

export interface Alert {
  id: string;
  zoneId: string;
  nodeId: string;
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  temperature: number;
  smokeLevel: number;
  humidity: number;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  resolved: boolean;
  resolvedAt?: string;
}

export type IncidentStatus =
  | 'Detected'
  | 'Under Investigation'
  | 'Response Dispatched'
  | 'Contained'
  | 'Resolved'
  | 'False Alarm';

export interface FireIncident {
  id: string;
  zoneId: string;
  detectedAt: string;
  severity: RiskLevel;
  status: IncidentStatus;
  temperature: number;
  smokeLevel: number;
  responseTime?: string;
  resolvedAt?: string;
  description: string;
  dispatchedUnits?: string[];
  containedAt?: string;
}

export interface SensorReading {
  id: string;
  nodeId: string;
  zoneId: string;
  temperature: number;
  humidity: number;
  smokeLevel: number;
  flameDetected: boolean;
  batteryLevel: number;
  timestamp: string;
}

export interface SystemSettings {
  gatewayFrequency: string; // "868 MHz (EU/IN)" | "915 MHz (US)" | "433 MHz"
  packetIntervalSec: number;
  tempCriticalThreshold: number;
  smokeCriticalThreshold: number;
  batteryLowThreshold: number;
  soundAlertsEnabled: boolean;
  autoDispatchSimulations: boolean;
}
