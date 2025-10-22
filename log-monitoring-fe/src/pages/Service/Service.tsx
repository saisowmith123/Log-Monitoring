import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from "@mui/material";

type ServiceInfo = {
  name: string;
  env: "DEV" | "STAGE" | "PROD";
  active: boolean;
  lastHeartbeat: string; // ISO
};

const SERVICES: ServiceInfo[] = [
  {
    name: "auth-service",
    env: "PROD",
    active: true,
    lastHeartbeat: "2025-10-13T09:58:00",
  },
  {
    name: "payments",
    env: "PROD",
    active: false,
    lastHeartbeat: "2025-10-13T09:41:00",
  },
  {
    name: "orders",
    env: "STAGE",
    active: true,
    lastHeartbeat: "2025-10-13T09:59:30",
  },
  {
    name: "catalog",
    env: "DEV",
    active: true,
    lastHeartbeat: "2025-10-13T09:56:12",
  },
  {
    name: "search",
    env: "PROD",
    active: true,
    lastHeartbeat: "2025-10-13T09:57:45",
  },
];

function StatusChip({ active }: { active: boolean }) {
  const theme = useTheme();
  return (
    <Chip
      size="small"
      label={active ? "Active" : "Inactive"}
      sx={{
        fontWeight: 800,
        bgcolor: active ? theme.palette.success.main : theme.palette.error.main,
        color: "#111",
        height: 22,
      }}
    />
  );
}

export default function Service() {
  const [serviceName, setServiceName] = React.useState<string>(
    SERVICES[0]?.name ?? ""
  );
  const selected = React.useMemo(
    () => SERVICES.find((s) => s.name === serviceName) ?? SERVICES[0],
    [serviceName]
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
        {/* Bottom: All services list */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              All Services
            </Typography>

            <Stack divider={<Divider flexItem />} spacing={1}>
              {SERVICES.map((s) => (
                <Stack
                  key={s.name}
                  direction={{ xs: "column", md: "row" }}
                  spacing={1}
                  alignItems={{ xs: "flex-start", md: "center" }}
                  sx={{
                    py: 1,
                    px: 0.5,
                    borderRadius: 1,
                    "&:hover": {
                      backgroundColor: (t) =>
                        t.palette.mode === "dark"
                          ? "rgba(255,215,0,0.06)"
                          : "rgba(193,154,43,0.06)",
                    },
                  }}
                >
                  <Typography sx={{ minWidth: 220, fontWeight: 600 }}>
                    {s.name}
                  </Typography>
                  <Typography sx={{ minWidth: 90 }} color="text.secondary">
                    {s.env}
                  </Typography>
                  <StatusChip active={s.active} />
                  <Typography color="text.secondary" sx={{ ml: { md: 2 } }}>
                    Last heartbeat: {s.lastHeartbeat}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
