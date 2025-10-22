import * as React from "react";
import { Chip, useTheme } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AlertSeverity } from "../features/alerts/types/AlertType";
import type { LogLevel } from "../service/logs.errors";

type LogSeverity = LogLevel;
type SeverityKind = "alert" | "log";

export interface SeverityChipProps {
  kind?: SeverityKind;
  value: AlertSeverity | "HIGH" | "MEDIUM" | "LOW" | LogSeverity;
  size?: "small" | "medium";
  outlined?: boolean;
  sx?: SxProps<Theme>;
  labelOverride?: string;
}

function toAlertLabel(
  v: AlertSeverity | "HIGH" | "MEDIUM" | "LOW"
): "HIGH" | "MEDIUM" | "LOW" {
  if (typeof v === "number") {
    // @ts-ignore
    const label = (globalThis as any).AlertSeverity?.[v] ?? String(v);
    return (label as "HIGH" | "MEDIUM" | "LOW") ?? "LOW";
  }
  return v;
}

function toLogLabel(v: LogSeverity): LogSeverity {
  return v;
}

export default function SeverityChip({
  kind = "alert",
  value,
  size = "small",
  outlined = false,
  sx,
  labelOverride,
}: SeverityChipProps) {
  const theme = useTheme();

  const label =
    kind === "alert"
      ? toAlertLabel(value as AlertSeverity | "HIGH" | "MEDIUM" | "LOW")
      : toLogLabel(value as LogSeverity);

  const isError = label === "HIGH" || label === "ERROR";
  const isWarn = label === "MEDIUM" || label === "WARN";
  const isDebugOrTrace = label === "DEBUG" || label === "TRACE";

  const bg =
    kind === "alert"
      ? isError
        ? theme.palette.error.main
        : isWarn
        ? theme.palette.warning.main
        : theme.palette.info.main
      : isError
      ? theme.palette.error.main
      : isWarn
      ? theme.palette.warning.main
      : isDebugOrTrace
      ? theme.palette.grey[500]
      : theme.palette.info.main;

  const fg =
    isError || isWarn || isDebugOrTrace
      ? "#111"
      : theme.palette.mode === "dark"
      ? "#0A1220"
      : "#0A1220";

  const outlinedSx: SxProps<Theme> = outlined
    ? { bgcolor: "transparent", color: bg, borderColor: bg }
    : { bgcolor: bg, color: fg, borderColor: "transparent" };

  return (
    <Chip
      size={size}
      label={labelOverride ?? label}
      variant={outlined ? "outlined" : "filled"}
      sx={{
        fontWeight: 800,
        height: size === "small" ? 22 : 28,
        ...outlinedSx,
        ...sx,
      }}
    />
  );
}
