// src/pages/Dashboard.tsx
import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import ListAltIcon from "@mui/icons-material/ListAlt";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import AppsIcon from "@mui/icons-material/Apps";
import {
  LogEvent as UILogEvent,
  LogLevel,
  Environment,
} from "../../features/logs/types/LogType";
import {
  type Alert,
  AlertSeverity,
  AlertStatus,
} from "../../features/alerts/types/AlertType";
import { useNavigate } from "react-router-dom";

import {
  fetchDashboardData,
  LogEvent as ApiLogEvent,
} from "../../service/logs.dashboard";
import { Alert as MuiAlert, CircularProgress } from "@mui/material";
import { useErrorTrend } from "../../features/logs/hooks/useErrorTrend";
import { TrendOverTime } from "../../pages/ErrorsPage/TrendOverTime";
import LogsAlertsService, {
  type Alert as AlertDto,
} from "../../service/logs.alerts";
import SeverityChip from "../../components/SeverityChip";

function LevelChip({ level }: { level: LogLevel }) {
  const sx =
    level === LogLevel.ERROR
      ? { bgcolor: "error.main", color: "#111" }
      : level === LogLevel.WARN
      ? { bgcolor: "warning.main", color: "#111" }
      : { bgcolor: "info.main", color: "#0A1220" };
  return <Chip size="small" label={level} sx={{ fontWeight: 800, ...sx }} />;
}

function StatCard({
  title,
  value,
  icon,
  onClick,
  clickable = false,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  onClick?: () => void;
  clickable?: boolean;
}) {
  return (
    <Card
      variant="outlined"
      onClick={onClick}
      sx={{
        flex: 1,
        minWidth: 220,
        transition: "all .15s ease",
        borderColor: "divider",
        cursor: clickable ? "pointer" : "default",
        "&:hover": clickable
          ? {
              transform: "translateY(-4px)",
              boxShadow:
                "0 10px 28px rgba(0,0,0,.45), 0 0 0 1px rgba(255,215,0,.25)",
              borderColor: "primary.main",
            }
          : undefined,
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              color: "#111",
              width: 48,
              height: 48,
              boxShadow: "0 0 0 3px rgba(255,215,0,0.25)",
            }}
            variant="rounded"
          >
            {icon}
          </Avatar>
          <Box>
            <Typography variant="overline" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h5">{value}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function toLogLevel(v: string): LogLevel {
  switch (v) {
    case "ERROR":
      return LogLevel.ERROR;
    case "WARN":
      return LogLevel.WARN;
    case "INFO":
      return LogLevel.INFO;
    default:
      return LogLevel.INFO;
  }
}

function mapApiToUiLog(e: ApiLogEvent): UILogEvent {
  return {
    id: e.id,
    serviceName: e.serviceName,
    env: (Environment as any)[e.env] ?? (e.env as any),
    tenant: e.tenant ?? "default",
    level: toLogLevel(String(e.level)),
    message: e.message,
    traceId: e.traceId,
    timestamp: e.timestamp,
  };
}

type TrendPoint = { ts: string; errors: number };

export default function Dashboard() {
  const navigate = useNavigate();

  const [summary, setSummary] = React.useState({
    totalLogsToday: 0,
    errorsLast5m: 0,
    activeAlerts: 0,
    services: 0,
  });
  const [recentLogs, setRecentLogs] = React.useState<UILogEvent[]>([]);
  const [trend, setTrend] = React.useState<TrendPoint[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  const [activeAlerts, setActiveAlerts] = React.useState<AlertDto[]>([]);
  const [alertsLoading, setAlertsLoading] = React.useState(true);
  const [alertsError, setAlertsError] = React.useState<string | null>(null);
  React.useEffect(() => {
    const ac = new AbortController();
    setAlertsLoading(true);
    setAlertsError(null);

    LogsAlertsService.getActive(ac.signal)
      .then((data) => setActiveAlerts(data ?? []))
      .catch((e) => {
        if (e?.name !== "CanceledError" && e?.name !== "AbortError") {
          console.error(e);
          setAlertsError("Failed to load active alerts");
        }
      })
      .finally(() => setAlertsLoading(false));

    return () => ac.abort();
  }, []);

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const { summary, recent } = await fetchDashboardData();
        if (!mounted) return;

        const uiLogs = recent.map(mapApiToUiLog);
        const services = new Set(uiLogs.map((l) => l.serviceName)).size;

        setRecentLogs(uiLogs);
        setSummary({
          totalLogsToday: summary.totalLogsToday,
          errorsLast5m: summary.errorsLast5m,
          activeAlerts: summary.activeAlerts,
          services,
        });
      } catch (e) {
        console.error("Failed to load dashboard data:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    const id = setInterval(load, 30_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);
  const {
    data: trendData,
    loading: trendLoading,
    error: trendError,
  } = useErrorTrend("hour");

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        useFlexGap
        flexWrap="wrap"
        justifyContent="space-between"
      >
        <StatCard
          title="Total Logs (Today)"
          value={loading ? "…" : summary.totalLogsToday}
          icon={<ListAltIcon />}
          onClick={() => navigate("/logs")}
          clickable
        />
        <StatCard
          title="Errors (Last 5m)"
          value={loading ? "…" : summary.errorsLast5m}
          icon={<ErrorOutlineIcon />}
          onClick={() => navigate("/errors")}
          clickable
        />
        <StatCard
          title="Active Alerts"
          value={loading ? "…" : summary.activeAlerts}
          icon={<NotificationsActiveIcon />}
          onClick={() => navigate("/alerts")}
          clickable
        />
        <StatCard
          title="Services"
          value={loading ? "…" : summary.services}
          icon={<AppsIcon />}
          onClick={() => navigate("/service")}
          clickable
        />
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mt: 3 }}>
        <Box sx={{ flex: 2, minWidth: 0 }}>
          {trendLoading ? (
            <Box sx={{ height: 320, display: "grid", placeItems: "center" }}>
              <CircularProgress size={28} />
            </Box>
          ) : trendError ? (
            <MuiAlert severity="error">{trendError}</MuiAlert>
          ) : (
            <TrendOverTime data={trendData} />
          )}
        </Box>

        <Card
          variant="outlined"
          sx={{
            flex: 1,
            height: 320,
            display: "flex",
            flexDirection: "column",
            borderColor: "divider",
          }}
        >
          <CardContent
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              pr: 1.5,
              "&::-webkit-scrollbar": { width: 8 },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(255, 215, 0, 0.3)",
                borderRadius: 8,
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "rgba(255, 215, 0, 0.5)",
              },
            }}
          >
            <Typography variant="h6" gutterBottom>
              Active Alerts ({alertsLoading ? "…" : activeAlerts.length})
            </Typography>

            {alertsLoading ? (
              <Box sx={{ height: 220, display: "grid", placeItems: "center" }}>
                <CircularProgress size={28} />
              </Box>
            ) : alertsError ? (
              <MuiAlert severity="error">{alertsError}</MuiAlert>
            ) : activeAlerts.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 1 }}>
                No active alerts
              </Typography>
            ) : (
              <>
                {/* Column Headers */}
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
                  <Typography sx={{ minWidth: 80 }}>Severity</Typography>
                  <Typography sx={{ minWidth: 120 }}>Service Name</Typography>
                  {/* <Typography sx={{ flex: 1 }}>Issue</Typography> */}
                  <Typography sx={{ minWidth: 140 }}>
                    Observed/Threshold
                  </Typography>
                </Stack>

                <Stack divider={<Divider flexItem />} spacing={1.5}>
                  {activeAlerts.map((a) => (
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
                          backgroundColor: (theme) =>
                            theme.palette.mode === "dark"
                              ? "rgba(255,215,0,0.06)"
                              : "rgba(193,154,43,0.06)",
                        },
                      }}
                    >
                      <Box sx={{ minWidth: 80 }}>
                        {/* Use the SAME SeverityChip component as Alerts page */}
                        <SeverityChip kind="alert" value={a.severity} />
                      </Box>
                      <Typography sx={{ minWidth: 120, fontWeight: 600 }}>
                        {a.serviceName}
                      </Typography>
                      {/* <Typography color="text.secondary" sx={{ flex: 1 }}>
                        {a.ruleId}
                      </Typography> */}
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
                </Stack>
              </>
            )}
          </CardContent>
        </Card>
      </Stack>

      <Card variant="outlined" sx={{ mt: 3, borderColor: "divider" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Logs
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Trace ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentLogs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {log.timestamp}
                  </TableCell>
                  <TableCell>{log.serviceName}</TableCell>
                  <TableCell>
                    <LevelChip level={log.level} />
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 560,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {log.message}
                  </TableCell>
                  <TableCell>{log.traceId}</TableCell>
                </TableRow>
              ))}
              {!recentLogs.length && !loading && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography color="text.secondary">
                      No logs found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
