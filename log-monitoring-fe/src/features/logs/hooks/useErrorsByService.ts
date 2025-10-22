// useErrorsByService.ts
import * as React from "react";
import {
  getTopServicesOnly,
  ByServicePayload,
  ServiceCount as ApiServiceCount,
} from "../../../service/logs.errors";

export function useErrorsByService(payload: ByServicePayload, top = 5) {
  const [data, setData] = React.useState<ApiServiceCount[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const alive = React.useRef(true);
  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  React.useEffect(() => {
    if (!payload?.from || !payload?.to) return;

    const ac = new AbortController();
    setLoading(true);
    setError(null);

    getTopServicesOnly(payload, top, ac.signal)
      .then((d) => {
        if (!alive.current) return;
        setData(d);
      })
      .catch((e: any) => {
        // ignore benign cancels
        if (
          e?.code === "ERR_CANCELED" ||
          e?.name === "CanceledError" ||
          e?.message === "canceled"
        ) {
          return;
        }
        if (!alive.current) return;
        setError(
          e instanceof Error ? e.message : "Failed to load top services"
        );
      })
      .finally(() => {
        if (!alive.current) return;
        setLoading(false);
      });

    return () => ac.abort();
    // payload.from/to are stable in your memo; include 'top' if you vary it
  }, [payload.from, payload.to, top]);

  return { data, loading, error };
}
