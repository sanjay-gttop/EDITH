export interface PartitionRule {
  target_device_id: string;
  drop_rate_percent: number;
  added_latency_ms: number;
  is_active: boolean;
}

/**
 * Simulation gateway controlling artificial latency, packet drops, and network partitions
 * during automated chaos and offline reconciliation tests.
 */
export class SimulationGateway {
  private rules = new Map<string, PartitionRule>();

  setRule(rule: PartitionRule): void {
    this.rules.set(rule.target_device_id, rule);
  }

  clearRule(deviceId: string): void {
    this.rules.delete(deviceId);
  }

  shouldDrop(deviceId: string): boolean {
    const rule = this.rules.get(deviceId);
    if (!rule || !rule.is_active) return false;
    return Math.random() * 100 < rule.drop_rate_percent;
  }

  getDelay(deviceId: string): number {
    const rule = this.rules.get(deviceId);
    if (!rule || !rule.is_active) return 0;
    return rule.added_latency_ms;
  }
}

export const simulationGateway = new SimulationGateway();
