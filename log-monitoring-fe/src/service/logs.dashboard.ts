import axios, { AxiosInstance } from "axios";

export interface DashboardSummary {
  totalLogsToday: number;
  errorsLast5m: number;
  activeAlerts: number;
}

export interface LogEvent {
  id: string;
  serviceName: string;
  env: string;
  tenant: string;
  level: string;
  message: string;
  traceId: string;
  latencyMs?: number | null;
  stack?: string | null;
  timestamp: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

const http: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL ?? "http://localhost:8081",
  timeout: 15000,
});

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await http.get<DashboardSummary>("/api/dashboard/summary");
  return data;
}

export async function fetchRecentLogs(): Promise<LogEvent[]> {
  const { data } = await http.get<ApiEnvelope<LogEvent[]>>("/api/logs/recent");
  return data.data;
}

export async function fetchDashboardData(): Promise<{
  summary: DashboardSummary;
  recent: LogEvent[];
}> {
  const [summary, recent] = await Promise.all([
    fetchDashboardSummary(),
    fetchRecentLogs(),
  ]);
  return { summary, recent };
}
