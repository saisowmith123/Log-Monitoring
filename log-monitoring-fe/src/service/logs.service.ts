import axios from "axios";
import { LogEvent } from "../features/logs/types/LogType";

const API_BASE_URL = "http://localhost:8081/api/logs";

export interface LogSearchRequest {
  serviceName?: string;
  traceId?: string;
  level?: string;
  env?: string;
  from?: string;
  to?: string;
  message?: string;
  messageMode?: "contains" | "exact" | "prefix";
  sortBy?: string;
  sortDir?: "ASC" | "DESC";
  page?: number;
  size?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

class LogsService {
  async searchLogs(params: LogSearchRequest): Promise<PageResponse<LogEvent>> {
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
      );

      const response = await axios.post(`${API_BASE_URL}/search`, cleanParams);

      if (response.data?.success) {
        return response.data.data;
      } else {
        throw new Error(response.data?.message || "Failed to fetch logs");
      }
    } catch (error: any) {
      console.error("Error fetching logs:", error.message || error);
      throw error;
    }
  }
}

export default new LogsService();
