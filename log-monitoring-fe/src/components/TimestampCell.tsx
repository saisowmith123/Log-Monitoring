import * as React from "react";
import { Box, Typography, useTheme } from "@mui/material";

function formatAbsolute(iso: string, tz?: string) {
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: tz, // leave undefined to use browser tz
    timeZoneName: "short",
  });
  return fmt.format(d);
}

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

function relativeFromNow(iso: string) {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = then - now;
  const abs = Math.abs(diffMs);

  const sec = Math.round(diffMs / 1000);
  const min = Math.round(diffMs / (1000 * 60));
  const hr = Math.round(diffMs / (1000 * 60 * 60));
  const day = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (abs < 60 * 1000) return rtf.format(sec, "second");
  if (abs < 60 * 60 * 1000) return rtf.format(min, "minute");
  if (abs < 24 * 60 * 60 * 1000) return rtf.format(hr, "hour");
  return rtf.format(day, "day");
}

function useTick(everyMs: number) {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), everyMs);
    return () => clearInterval(id);
  }, [everyMs]);
}

function RecentDot({ iso }: { iso: string }) {
  const ageMs = Date.now() - new Date(iso).getTime();
  const recent = ageMs <= 5 * 60 * 1000; // last 5 minutes
  if (!recent) return null;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        width: 6,
        height: 6,
        borderRadius: "50%",
        bgcolor: "success.main",
        mr: 0.75,
      }}
    />
  );
}

export function TimestampCell({
  iso,
  tz, // optional: force a timezone, e.g. "America/Indiana/Indianapolis"
  sx,
}: {
  iso: string;
  tz?: string;
  sx?: any;
}) {
  const theme = useTheme();
  useTick(60 * 1000); // refresh relative time every minute

  const absolute = formatAbsolute(iso, tz);
  const relative = relativeFromNow(iso);

  return (
    <Box
      title={absolute} // native tooltip fallback
      sx={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas",
        color: "text.secondary",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        ...sx,
      }}
    >
      <RecentDot iso={iso} />
      <Typography component="span" sx={{ mr: 0.75 }}>
        {relative}
      </Typography>
      <Typography
        component="span"
        sx={{
          opacity: 0.7,
          fontSize: "0.85em",
        }}
      >
        • {absolute}
      </Typography>
    </Box>
  );
}

export default TimestampCell;
