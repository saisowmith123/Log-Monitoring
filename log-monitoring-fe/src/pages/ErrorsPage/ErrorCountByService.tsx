import * as React from "react";
import { Card, CardContent, Typography, useTheme } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
} from "recharts";

export type ServiceCount = { service: string; count: number };

export function ErrorCountByService({ data }: { data: ServiceCount[] }) {
  const theme = useTheme();
  return (
    <Card variant="outlined" sx={{ height: 320 }}>
      <CardContent sx={{ height: "100%" }}>
        <Typography variant="h6" gutterBottom>
          Error Count by Service
        </Typography>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: -24, bottom: 8 }}
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
              dataKey="service"
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
            <Bar
              dataKey="count"
              fill={theme.palette.primary.main}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
