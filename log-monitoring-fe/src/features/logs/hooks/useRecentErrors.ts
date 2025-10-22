// src/features/logs/hooks/useRecentErrors.ts
import * as React from "react";
import { getRecentOnly } from "../../../service/logs.errors";
import {
  RecentErrorsPayload,
  LogEvent,
  Paginated,
} from "../../../service/logs.errors";

type State = {
  items: LogEvent[];
  total: number;
  loading: boolean;
  error: string | null;
};

export function useRecentErrors(
  payload: RecentErrorsPayload,
  page: number,
  size: number
) {
  const [state, setState] = React.useState<State>({
    items: [],
    total: 0,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));

    getRecentOnly(payload, page, size, controller.signal)
      .then((res: Paginated<LogEvent>) => {
        setState({
          items: res.items,
          total: res.total,
          loading: false,
          error: null,
        });
      })
      .catch((e: any) => {
        // Swallow abort/cancel errors quietly
        if (
          e?.code === "ERR_CANCELED" ||
          e?.name === "AbortError" ||
          e?.message === "canceled"
        ) {
          return;
        }
        setState((s) => ({
          ...s,
          loading: false,
          error: e?.message || "Failed to load recent errors",
        }));
      });

    return () => controller.abort();
  }, [
    payload.serviceName,
    payload.from,
    payload.to,
    payload.level,
    payload.env,
    page,
    size,
  ]);

  return state;
}
