import * as React from "react";
import { Card, CardContent, Typography, useTheme } from "@mui/material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
} from "recharts";

export type TrendPoint = { ts: string; errors: number };

export function TrendOverTime({ data }: { data: TrendPoint[] }) {
  const theme = useTheme();

  // format as "Oct 21, 08 PM" or similar
  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // set false for 24-hour clock
    });
  };

  // shorter for the X-axis (omit minutes for clarity)
  const formatXAxis = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      hour12: true,
    });
  };

  return (
    <Card variant="outlined" sx={{ height: 320 }}>
      <CardContent sx={{ height: "100%" }}>
        <Typography variant="h6" gutterBottom>
          Error Trend Over Time
        </Typography>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart
            data={data}
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
              dataKey="ts"
              tickFormatter={formatXAxis}
              tick={{ fill: theme.palette.text.secondary }}
            />
            <YAxis tick={{ fill: theme.palette.text.secondary }} />
            <RTooltip
              labelFormatter={(iso) => formatDateTime(iso as string)}
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
              dataKey="errors"
              stroke={theme.palette.primary.main}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
