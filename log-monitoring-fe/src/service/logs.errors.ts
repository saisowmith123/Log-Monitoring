import axios, { AxiosError, AxiosResponse } from "axios";

export type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG" | "TRACE";
export type Environment = "DEV" | "STAGING" | "PROD" | "QA" | string;

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string; // ISO string
}

export interface TrendPoint {
  bucketStart: string; // ISO date string (UTC)
  count: number;
}
export interface TrendResponse {
  trendPoints: TrendPoint[];
  interval: "minute" | "hour" | "day";
}

export interface SeverityPayload {
  from: string; // ISO
  to: string; // ISO
}
export interface SeverityCounts {
  error: number;
  warn: number;
  info: number;
}

export interface ByServicePayload {
  from: string; // ISO
  to: string; // ISO
}
export interface ServiceCount {
  serviceName: string;
  count: number;
}

export interface RecentErrorsPayload {
  serviceName?: string;
  from?: string; // ISO
  to?: string; // ISO
  level?: LogLevel;
  env?: Environment;
}
export interface LogEvent {
  id: string;
  serviceName: string;
  env: Environment;
  tenant: string;
  level: LogLevel;
  message: string;
  traceId?: string | null;
  latencyMs?: number | null;
  stack?: string | null;
  timestamp: string; // ISO
}
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL ?? "http://localhost:8081/api",
  timeout: 10000,
});

function unwrap<T>(
  p: Promise<AxiosResponse<ApiResponse<T>>>
): Promise<ApiResponse<T>> {
  return p
    .then((r) => r.data)
    .catch((e: AxiosError<ApiResponse<unknown>>) => {
      const msg =
        e.response?.data?.message ||
        e.message ||
        "Request failed for errors API";
      throw new Error(msg);
    });
}

export function fetchErrorTrend(
  interval: TrendResponse["interval"] = "hour",
  signal?: AbortSignal
): Promise<ApiResponse<TrendResponse>> {
  return unwrap<TrendResponse>(
    api.post<ApiResponse<TrendResponse>>("/errors/trend", undefined, {
      params: { interval },
      headers: { "Content-Type": "application/json" },
      signal,
    })
  );
}

export function fetchSeverityCounts(
  payload: SeverityPayload,
  signal?: AbortSignal
): Promise<ApiResponse<SeverityCounts>> {
  return unwrap<SeverityCounts>(
    api.post<ApiResponse<SeverityCounts>>("/errors/severity", payload, {
      signal,
    })
  );
}

export function fetchErrorsByService(
  payload: ByServicePayload,
  top = 5,
  signal?: AbortSignal
): Promise<ApiResponse<ServiceCount[]>> {
  return unwrap<ServiceCount[]>(
    api.post<ApiResponse<ServiceCount[]>>("/errors/byService", payload, {
      params: { top },
      signal,
    })
  );
}

export function fetchRecentErrors(
  payload: RecentErrorsPayload,
  page = 0,
  size = 10,
  signal?: AbortSignal
): Promise<ApiResponse<Paginated<LogEvent>>> {
  return unwrap<Paginated<LogEvent>>(
    api.post<ApiResponse<Paginated<LogEvent>>>("/errors/recent", payload, {
      params: { page, size },
      signal,
    })
  );
}

export async function getTrendDataOnly(
  interval: TrendResponse["interval"] = "hour",
  signal?: AbortSignal
): Promise<TrendResponse> {
  const res = await fetchErrorTrend(interval, signal);
  return res.data;
}

export async function getSeverityOnly(
  payload: SeverityPayload,
  signal?: AbortSignal
): Promise<SeverityCounts> {
  const res = await fetchSeverityCounts(payload, signal);
  return res.data;
}

export async function getTopServicesOnly(
  payload: ByServicePayload,
  top = 5,
  signal?: AbortSignal
): Promise<ServiceCount[]> {
  const res = await fetchErrorsByService(payload, top, signal);
  return res.data;
}

export async function getRecentOnly(
  payload: RecentErrorsPayload,
  page = 0,
  size = 10,
  signal?: AbortSignal
): Promise<Paginated<LogEvent>> {
  const res = await fetchRecentErrors(payload, page, size, signal);
  return res.data;
}
