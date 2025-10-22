// src/pages/Errors/ErrorsPage.tsx
import * as React from "react";
import { Box, Stack, CircularProgress, Alert } from "@mui/material";
import { TrendOverTime } from "./TrendOverTime";
import { ErrorCountByService } from "./ErrorCountByService";
import { SeverityDistribution } from "./SeverityDistribution";
import { RecentErrorsPaginated } from "./RecentErrorsPaginated";
import { useErrorTrend } from "../../features/logs/hooks/useErrorTrend";
import { useSeverityDistribution } from "../../features/logs/hooks/useSeverityDistribution";
import { useErrorsByService } from "../../features/logs/hooks/useErrorsByService";

export default function ErrorsPage() {
  // Trend
  const {
    data: trendData,
    loading: trendLoading,
    error: trendError,
  } = useErrorTrend("hour");

  // Fixed range (you can later lift this into filters/controls)
  const range = React.useMemo(
    () => ({
      from: "2025-10-18T00:00:00Z",
      to: "2025-10-22T12:00:00Z",
    }),
    []
  );

  // Severity distribution
  const {
    data: severityData,
    loading: sevLoading,
    error: sevError,
  } = useSeverityDistribution(range);

  // Errors by service
  const {
    data: topServices,
    loading: topLoading,
    error: topError,
  } = useErrorsByService(range, 5);

  const barData = React.useMemo(
    () =>
      (topServices ?? []).map((s) => ({
        service: s.serviceName,
        count: s.count,
      })),
    [topServices]
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
        <Box sx={{ flex: 2, minWidth: 0 }}>
          {trendLoading ? (
            <Box sx={{ height: 320, display: "grid", placeItems: "center" }}>
              <CircularProgress size={28} />
            </Box>
          ) : trendError ? (
            <Alert severity="error">{trendError}</Alert>
          ) : (
            <TrendOverTime data={trendData} />
          )}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {sevLoading ? (
            <Box sx={{ height: 320, display: "grid", placeItems: "center" }}>
              <CircularProgress size={28} />
            </Box>
          ) : sevError ? (
            <Alert severity="error">{sevError}</Alert>
          ) : (
            <SeverityDistribution data={severityData} />
          )}
        </Box>
      </Stack>

      <Box sx={{ mt: 3 }}>
        {topLoading ? (
          <Box sx={{ height: 320, display: "grid", placeItems: "center" }}>
            <CircularProgress size={28} />
          </Box>
        ) : topError ? (
          <Alert severity="error">{topError}</Alert>
        ) : (
          <ErrorCountByService data={barData} />
        )}
      </Box>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={3} sx={{ mt: 3 }}>
        <Box sx={{ flex: 1.5 }}>
          {/* Pass the same range to the recent errors API payload */}
          <RecentErrorsPaginated payload={{ ...range }} />
        </Box>
      </Stack>
    </Box>
  );
}
