import { RiskLevel, SensorNode } from '../types';

/**
 * Calculates risk level based on environmental LoRa node telemetry.
 * Note: Multi-sensor confirmation reduces false alarms in field deployments.
 */
export function calculateSensorRisk(
  temperature: number,
  humidity: number,
  smokeLevel: number,
  flameDetected: boolean
): { riskLevel: RiskLevel; reason: string } {
  if (flameDetected) {
    return {
      riskLevel: 'Critical',
      reason: 'Flame optical sensor triggered (Direct Fire Sensed)',
    };
  }

  if (temperature >= 48 && smokeLevel >= 75 && humidity <= 25) {
    return {
      riskLevel: 'Critical',
      reason: 'Extreme thermal spike combined with dense smoke & arid air',
    };
  }

  if (temperature >= 42 && smokeLevel >= 50) {
    return {
      riskLevel: 'High',
      reason: 'Elevated ambient temperature with significant particulate smoke',
    };
  }

  if (temperature >= 35 || humidity < 35 || smokeLevel >= 30) {
    return {
      riskLevel: 'Moderate',
      reason: 'High ambient heat or desiccated humidity threshold reached',
    };
  }

  return {
    riskLevel: 'Low',
    reason: 'Normal forest canopy microclimate within safe baselines',
  };
}

export function evaluateZoneRisk(nodes: SensorNode[]): RiskLevel {
  if (!nodes || nodes.length === 0) return 'Low';

  const criticalCount = nodes.filter((n) => n.riskLevel === 'Critical').length;
  const highCount = nodes.filter((n) => n.riskLevel === 'High').length;
  const moderateCount = nodes.filter((n) => n.riskLevel === 'Moderate').length;

  if (criticalCount >= 1) return 'Critical';
  if (highCount >= 2 || (highCount >= 1 && moderateCount >= 1)) return 'High';
  if (highCount === 1 || moderateCount >= 1) return 'Moderate';
  return 'Low';
}
