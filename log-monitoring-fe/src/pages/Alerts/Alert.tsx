// src/pages/Alerts/Alert.tsx
import * as React from "react";
import {
  Box,
  Stack,
  Card,
  CardContent,
  Typography,
  Divider,
  Chip,
  useTheme,
} from "@mui/material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
} from "recharts";
import SeverityChip from "../../components/SeverityChip";
import LogsAlertsService, {
  AlertTrendPoint,
  type Alert,
} from "../../service/logs.alerts";

export default function Alert() {
  const theme = useTheme();

  const [trend, setTrend] = React.useState<AlertTrendPoint[]>([]);
  const [active, setActive] = React.useState<Alert[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);

    Promise.all([
      LogsAlertsService.getTrend(14, ac.signal),
      LogsAlertsService.getActive(ac.signal),
    ])
      .then(([trendData, activeData]) => {
        setTrend(trendData ?? []);
        setActive(activeData ?? []);
      })
      .catch((e) => {
        if (e.name !== "CanceledError" && e.name !== "AbortError") {
          setError("Failed to load alerts");
          console.error(e);
        }
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction="column" spacing={3}>
        {/* Top: Trend Over Time */}
        <Card variant="outlined" sx={{ height: { xs: 320, md: 380 } }}>
          <CardContent sx={{ height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Alerts Trend Over Time
            </Typography>

            <ResponsiveContainer width="100%" height="85%">
              <LineChart
                data={trend}
                margin={{ top: 8, right: 8, left: -12, bottom: 8 }}
              >
                <CartesianGrid
                  stroke={
                    theme.palette.mode === "dark"
                      ? "rgba(255,215,0,0.12)"
                      : "rgba(193,154,43,0.12)"
                  }
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <YAxis tick={{ fill: theme.palette.text.secondary }} />
                <RTooltip
                  contentStyle={{
                    background:
                      theme.palette.mode === "dark" ? "#121316" : "#ffffff",
                    border:
                      theme.palette.mode === "dark"
                        ? "1px solid rgba(255,215,0,0.25)"
                        : "1px solid rgba(193,154,43,0.25)",
                    borderRadius: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>

            {!loading && trend.length === 0 && (
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                No trend data for the selected period.
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Bottom: Active Alerts */}
        <Card
          variant="outlined"
          sx={{
            minHeight: 360,
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              flex: 1,
              overflowY: "auto",
              pr: 1.5,
              "&::-webkit-scrollbar": { width: 8 },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255, 215, 0, 0.3)"
                    : "rgba(193,154,43,0.25)",
                borderRadius: 8,
              },
            }}
          >
            <Typography variant="h6" gutterBottom>
              Active Alerts ({active.length})
            </Typography>

            {error && (
              <Typography color="error" sx={{ mb: 1 }}>
                {error}
              </Typography>
            )}

            {/* Column Headers */}
            {active.length > 0 && (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{
                  px: 0.5,
                  py: 0.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  fontWeight: 700,
                  color: "text.secondary",
                }}
              >
                <Typography sx={{ minWidth: 120 }}>Severity</Typography>
                <Typography sx={{ minWidth: 160 }}>Service Name</Typography>
                <Typography sx={{ flex: 1 }}>Issue</Typography>
                <Typography sx={{ minWidth: 140 }}>
                  Observed/Threshold
                </Typography>
              </Stack>
            )}

            <Stack divider={<Divider flexItem />} spacing={1.5}>
              {active.map((a) => (
                <Stack
                  key={a.id}
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1}
                  sx={{
                    py: 0.75,
                    px: 0.5,
                    borderRadius: 1,
                    "&:hover": {
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(255,215,0,0.06)"
                          : "rgba(193,154,43,0.06)",
                    },
                  }}
                >
                  <Box sx={{ minWidth: 120 }}>
                    <SeverityChip kind="alert" value={a.severity} />
                  </Box>
                  <Typography sx={{ minWidth: 160, fontWeight: 600 }}>
                    {a.serviceName}
                  </Typography>
                  <Typography color="text.secondary" sx={{ flex: 1 }}>
                    {a.ruleId}
                  </Typography>
                  <Chip
                    size="small"
                    label={`${a.observed} / ${a.threshold}`}
                    variant="outlined"
                    sx={{
                      minWidth: 140,
                      borderColor: "warning.main",
                      color: "warning.main",
                      fontWeight: 700,
                    }}
                  />
                </Stack>
              ))}

              {!loading && active.length === 0 && (
                <Typography color="text.secondary" sx={{ py: 1 }}>
                  No active alerts
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
