import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  TextField,
  CircularProgress,
  Button,
} from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";
import TimelineIcon from "@mui/icons-material/Timeline";
import TroubleshootIcon from "@mui/icons-material/Troubleshoot";
import LogsService, { LogSearchRequest } from "../../service/logs.service";
import {
  LogEvent,
  LogLevel,
  Environment,
} from "../../features/logs/types/LogType";
import TimestampCell from "../../components/TimestampCell";

function LevelChip({ level }: { level: LogLevel }) {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const map =
    level === LogLevel.ERROR
      ? { bg: theme.palette.error.main, fg: mode === "dark" ? "#111" : "#fff" }
      : level === LogLevel.WARN
      ? { bg: theme.palette.warning.main, fg: "#111" }
      : { bg: theme.palette.info.main, fg: "#0A1220" };

  return (
    <Chip
      size="small"
      label={level}
      sx={{ bgcolor: map.bg, color: map.fg, fontWeight: 800, height: 22 }}
    />
  );
}

function EnvChip({ env }: { env: Environment }) {
  const theme = useTheme();
  const tone =
    env === Environment.PROD
      ? theme.palette.error.main
      : env === Environment.STAGE
      ? theme.palette.warning.main
      : theme.palette.info.main;

  return (
    <Chip
      size="small"
      variant="outlined"
      label={env}
      sx={{ borderColor: tone, color: tone, fontWeight: 700, height: 22 }}
    />
  );
}

/* ---------- Page ---------- */
export default function LogsPage() {
  const theme = useTheme();
  const [logs, setLogs] = React.useState<LogEvent[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);

  // Filters
  const [service, setService] = React.useState<string>("all");
  const [search, setSearch] = React.useState<string>("");
  const [traceId, setTraceId] = React.useState<string>("");
  const [traceError, setTraceError] = React.useState<string | null>(null);
  const [level, setLevel] = React.useState<string>("all");
  const [env, setEnv] = React.useState<string>("DEV");

  // Static dropdown data
  const levelOptions = ["all", ...Object.values(LogLevel)];
  const envOptions = Object.values(Environment);

  // Persisted services list (only fetched once when "all" logs loaded)
  const [services, setServices] = React.useState<string[]>(["all"]);

  // Shared cell sizing to guarantee alignment (header + rows use the same)
  const cell = React.useMemo(
    () => ({
      ts: { minWidth: 170 },
      svc: { minWidth: 170 },
      lvl: { minWidth: 90 },
      msg: {
        flex: 1,
        minWidth: 200,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
      trace: { minWidth: 100 },
    }),
    []
  );

  /* ---------- Fetch logs ---------- */
  const fetchLogs = React.useCallback(async () => {
    // Guard: if traceId is partially filled (1–5), DO NOT call API
    if (traceId.length > 0 && traceId.length !== 6) return;

    try {
      setLoading(true);
      setError(null);

      const req: LogSearchRequest = {
        env: env === "all" ? undefined : env,
        page,
        size: 10,
        ...(service !== "all" ? { serviceName: service } : {}),
        ...(traceId.length === 6 ? { traceId } : {}),
        ...(level !== "all" ? { level } : {}),
        ...(search.trim()
          ? { message: search.trim(), messageMode: "contains" }
          : {}),
      };

      const res = await LogsService.searchLogs(req);
      setLogs(res.content);
      setTotalPages(res.totalPages);

      // Prime services list once from "all" logs (first page)
      if (
        service === "all" &&
        page === 0 &&
        res.content.length > 0 &&
        services.length <= 1
      ) {
        const unique = Array.from(
          new Set(res.content.map((l) => l.serviceName))
        );
        setServices(["all", ...unique]);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch logs from server.");
    } finally {
      setLoading(false);
    }
  }, [service, search, traceId, level, env, page, services.length]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  /* ---------- Handlers ---------- */
  const handleTraceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value || "";
    const v = raw.slice(0, 6);
    setPage(0);
    setTraceId(v);

    if (v.length === 0) setTraceError(null);
    else if (v.length !== 6)
      setTraceError("Trace ID must be exactly 6 characters");
    else setTraceError(null);
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage((p) => p + 1);
  };
  const handlePrevPage = () => {
    if (page > 0) setPage((p) => p - 1);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header / Controls */}
      <Card
        variant="outlined"
        sx={{
          mb: 3,
          borderColor:
            theme.palette.mode === "dark"
              ? "rgba(255, 215, 0, 0.25)"
              : "rgba(193,154,43,0.25)",
        }}
      >
        <CardContent>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
          >
            {/* Title */}
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar
                variant="rounded"
                sx={{
                  bgcolor: "primary.main",
                  color: "#111",
                  width: 40,
                  height: 40,
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "0 0 0 3px rgba(255,215,0,0.25)"
                      : "0 0 0 3px rgba(193,154,43,0.20)",
                }}
              >
                <StorageIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Logs
              </Typography>
            </Stack>

            {/* Filters */}
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {/* Service */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="service-label">Service</InputLabel>
                <Select
                  labelId="service-label"
                  label="Service"
                  value={service}
                  onChange={(e) => {
                    setPage(0);
                    setService(e.target.value);
                  }}
                >
                  {services.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s === "all" ? "All services" : s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Level */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="level-label">Level</InputLabel>
                <Select
                  labelId="level-label"
                  label="Level"
                  value={level}
                  onChange={(e) => {
                    setPage(0);
                    setLevel(e.target.value);
                  }}
                >
                  {levelOptions.map((lvl) => (
                    <MenuItem key={lvl} value={lvl}>
                      {lvl === "all" ? "All levels" : lvl}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Env */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="env-label">Env</InputLabel>
                <Select
                  labelId="env-label"
                  label="Env"
                  value={env}
                  onChange={(e) => {
                    setPage(0);
                    setEnv(e.target.value);
                  }}
                >
                  {envOptions.map((eVal) => (
                    <MenuItem key={eVal} value={eVal}>
                      {eVal}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Trace ID (exactly 6 chars) */}
              <TextField
                size="small"
                label="Trace ID"
                value={traceId}
                onChange={handleTraceChange}
                error={!!traceError}
                helperText={traceError ?? " "}
                inputProps={{ maxLength: 6 }}
                sx={{ minWidth: 200 }}
              />

              {/* Message Search (message only) */}
              <TextField
                size="small"
                label="Search message"
                value={search}
                onChange={(e) => {
                  setPage(0);
                  setSearch(e.target.value);
                }}
                InputProps={{
                  startAdornment: (
                    <TimelineIcon
                      fontSize="small"
                      sx={{ mr: 1, opacity: 0.7 }}
                    />
                  ),
                }}
                sx={{ minWidth: 220 }}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card
        variant="outlined"
        sx={{
          borderColor:
            theme.palette.mode === "dark"
              ? "rgba(255, 215, 0, 0.25)"
              : "rgba(193,154,43,0.25)",
        }}
      >
        <CardContent
          sx={{
            pt: 1,
            pb: 0,
            display: "flex",
            flexDirection: "column",
            height: { xs: 420, md: 560 },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.2}
            sx={{ px: 0.5, pb: 1 }}
          >
            <TroubleshootIcon sx={{ opacity: 0.8 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {service === "all" ? "All services" : service} — {logs.length}{" "}
              logs
            </Typography>
          </Stack>

          <Divider />

          <Box
            sx={{
              mt: 1,
              flex: 1,
              overflowY: "auto",
              pr: 1.25,
              "&::-webkit-scrollbar": { width: 8 },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255, 215, 0, 0.3)"
                    : "rgba(193,154,43,0.25)",
                borderRadius: 8,
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255, 215, 0, 0.5)"
                    : "rgba(193,154,43,0.45)",
              },
            }}
          >
            {/* Sticky Column Headers INSIDE the scroller to avoid scrollbar misalignment */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 1,
                px: 0.5,
                py: 1,
                borderBottom: `1px solid ${
                  theme.palette.mode === "dark"
                    ? "rgba(255, 215, 0, 0.15)"
                    : "rgba(193,154,43,0.15)"
                }`,
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(26,26,26,0.9)"
                    : "rgba(255,255,255,0.9)",
                backdropFilter: "blur(4px)",
                fontWeight: 700,
                color: "text.secondary",
                fontSize: 13,
              }}
            >
              <Typography sx={{ ...cell.ts, pl: 15 }}>Timestamp</Typography>
              <Typography sx={{ ...cell.svc, pl: 20 }}>Service Env</Typography>
              <Typography sx={{ ...cell.lvl, textAlign: "center", pl: 8 }}>
                Level
              </Typography>
              <Typography sx={{ ...cell.msg, pl: 16 }}>Message</Typography>
              <Typography sx={{ ...cell.trace, pr: 5, textAlign: "right" }}>
                Trace ID
              </Typography>
            </Stack>

            {loading ? (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{ height: "100%" }}
              >
                <CircularProgress size={28} />
              </Stack>
            ) : error ? (
              <Typography sx={{ color: "error.main", px: 0.5, py: 2 }}>
                {error}
              </Typography>
            ) : logs.length === 0 ? (
              <Typography sx={{ color: "text.secondary", px: 0.5, py: 2 }}>
                No logs found for this filter.
              </Typography>
            ) : (
              <Stack divider={<Divider flexItem />} spacing={1} sx={{ pb: 1 }}>
                {logs.map((log) => (
                  <Stack
                    key={log.id}
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                      py: 1,
                      px: 0.5,
                      "&:hover": {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(255, 215, 0, 0.06)"
                            : "rgba(193,154,43,0.06)",
                      },
                      borderRadius: 1,
                    }}
                  >
                    {/* Timestamp */}
                    <TimestampCell iso={log.timestamp} sx={cell.ts} />

                    {/* Service + Env */}
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={cell.svc}
                    >
                      <Typography sx={{ fontWeight: 700, pl: 3 }}>
                        {log.serviceName}
                      </Typography>
                      <EnvChip env={log.env} />
                    </Stack>

                    {/* Level */}
                    <Box sx={cell.lvl}>
                      <LevelChip level={log.level} />
                    </Box>

                    {/* Message */}
                    <Typography sx={cell.msg} title={log.message}>
                      {log.message}
                    </Typography>

                    {/* Trace ID */}
                    <Typography
                      sx={{
                        ...cell.trace,
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas",
                        color: "text.secondary",
                      }}
                      title={log.traceId}
                    >
                      {log.traceId}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>

          {/* Pagination */}
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2}
            sx={{ py: 1.5 }}
          >
            <Button
              variant="outlined"
              size="small"
              disabled={page === 0}
              onClick={handlePrevPage}
            >
              Previous
            </Button>
            <Typography variant="body2">
              Page {page + 1} of {totalPages}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              disabled={page >= totalPages - 1}
              onClick={handleNextPage}
            >
              Next
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
