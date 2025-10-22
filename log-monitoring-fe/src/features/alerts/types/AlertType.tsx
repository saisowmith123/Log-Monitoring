export enum AlertSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum AlertStatus {
  OPEN = "OPEN",
  RESOLVED = "RESOLVED",
}

export interface Alert {
  id?: string;
  serviceName: string;
  ruleId: string;
  severity: AlertSeverity;
  status: AlertStatus;
  observed: number;
  threshold: number;
  openedAt: string;
  closedAt?: string;
  note?: string;
}
