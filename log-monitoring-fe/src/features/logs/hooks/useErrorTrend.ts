import * as React from "react";
import axios from "axios";
import { fetchErrorTrend } from "../../../service/logs.errors";

export type TrendPoint = { ts: string; errors: number };

export function useErrorTrend(interval: "minute" | "hour" | "day" = "hour") {
  const [data, setData] = React.useState<TrendPoint[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const ac = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchErrorTrend(interval, ac.signal);
        const mapped =
          res.data.trendPoints?.map((tp) => ({
            ts: tp.bucketStart,
            errors: tp.count,
          })) ?? [];
        if (!cancelled) setData(mapped);
      } catch (e: any) {
        if (
          axios.isCancel?.(e) ||
          e?.code === "ERR_CANCELED" ||
          e?.name === "CanceledError"
        ) {
          return;
        }
        if (!cancelled) setError(e?.message ?? "Failed to load trend");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [interval]);

  return { data, loading, error };
}
