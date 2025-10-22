import * as React from "react";
import axios from "axios";
import {
  fetchSeverityCounts,
  SeverityCounts,
} from "../../../service/logs.errors";

export type SeveritySlice = { name: "Error" | "Warn" | "Info"; value: number };

type UseSeverityReturn = {
  data: SeveritySlice[];
  loading: boolean;
  error: string | null;
};

function makeDefaultRange(daysBack = 4) {
  const to = new Date();
  to.setMinutes(0, 0, 0);
  const from = new Date(to);
  from.setDate(from.getDate() - daysBack);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function useSeverityDistribution(range?: {
  from: string;
  to: string;
}): UseSeverityReturn {
  // ← explicit return type
  const initialRangeRef = React.useRef<{ from: string; to: string } | null>(
    null
  );
  if (!initialRangeRef.current) initialRangeRef.current = makeDefaultRange();
  const effective = range ?? initialRangeRef.current;

  const [data, setData] = React.useState<SeveritySlice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const ac = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetchSeverityCounts(
          { from: effective.from, to: effective.to },
          ac.signal
        ); // ApiResponse<SeverityCounts>

        const counts: SeverityCounts = res.data ?? {
          error: 0,
          warn: 0,
          info: 0,
        };
        const slices: SeveritySlice[] = [
          { name: "Error", value: counts.error ?? 0 },
          { name: "Warn", value: counts.warn ?? 0 },
          { name: "Info", value: counts.info ?? 0 },
        ];

        if (!cancelled) setData(slices);
      } catch (e: any) {
        if (
          axios.isCancel?.(e) ||
          e?.code === "ERR_CANCELED" ||
          e?.name === "CanceledError"
        )
          return;
        if (!cancelled)
          setError(e?.message ?? "Failed to load severity distribution");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [effective.from, effective.to]);

  return { data, loading, error }; // ← make sure this is present
}
