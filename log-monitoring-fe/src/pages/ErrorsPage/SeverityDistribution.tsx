import * as React from "react";
import { Card, CardContent, Typography, useTheme } from "@mui/material";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip as RTooltip,
} from "recharts";

export type SeveritySlice = { name: string; value: number };

export function SeverityDistribution({ data }: { data: SeveritySlice[] }) {
  const theme = useTheme();
  const colors = [
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  return (
    <Card variant="outlined" sx={{ height: 320 }}>
      <CardContent sx={{ height: "100%" }}>
        <Typography variant="h6" gutterBottom>
          Severity Distribution
        </Typography>
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Legend />
            <RTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const { name, value } = payload[0];
                  return (
                    <div
                      style={{
                        background:
                          theme.palette.mode === "dark" ? "#121316" : "#ffffff",
                        border:
                          theme.palette.mode === "dark"
                            ? "1px solid rgba(255,215,0,0.25)"
                            : "1px solid rgba(193,154,43,0.25)",
                        borderRadius: 12,
                        padding: "6px 10px",
                        color: theme.palette.mode === "dark" ? "#fff" : "#000",
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      {`${name} : ${value}`}
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
