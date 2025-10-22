import axios from "axios";
import { AlertSeverity } from "../features/alerts/types/AlertType";

const api = axios.create({
  baseURL:
    (import.meta as any).env?.VITE_API_BASE ??
    process.env.REACT_APP_API_BASE ??
    "http://localhost:8081",
  timeout: 15000,
});

export interface AlertTrendPoint {
  day: string;
  count: number;
}

export interface Alert {
  id: string;
  ruleId: string;
  serviceName: string;
  env: string | null;
  tenant: string | null;
  severity: AlertSeverity;
  status: "OPEN" | "CLOSED" | string;
  observed: number;
  threshold: number;
  openedAt: string; // ISO
  closedAt: string | null; // ISO or null
  note?: string | null;
}

export const LogsAlertsService = {
  getTrend(days = 14, signal?: AbortSignal) {
    return api
      .get<AlertTrendPoint[]>("/api/alerts/trend", {
        params: { days },
        signal,
      })
      .then((r) => r.data);
  },

  getActive(signal?: AbortSignal) {
    return api
      .get<Alert[]>("/api/alerts/active", { signal })
      .then((r) => r.data);
  },
};

export default LogsAlertsService;
