export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export enum Environment {
  DEV = "DEV",
  STAGE = "STAGE",
  PROD = "PROD",
}

export interface LogEvent {
  id?: string;
  serviceName: string;
  env: Environment;
  tenant: string;
  level: LogLevel;
  message: string;
  traceId?: string;
  latencyMs?: number;
  stack?: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
