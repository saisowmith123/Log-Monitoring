import * as React from "react";
import { Box, Typography, IconButton, Tooltip, useTheme } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { ColorModeContext } from "../../theme";

export default function TitleBar() {
  const theme = useTheme();
  const { mode, toggle } = React.useContext(ColorModeContext);

  return (
    <Box
      sx={{
        mb: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "background.paper",
        borderRadius: 3,
        px: 3,
        py: 2,
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 2px 12px rgba(255, 215, 0, 0.15)"
            : "0 2px 10px rgba(0,0,0,0.06)",
        border:
          theme.palette.mode === "dark"
            ? "1px solid rgba(255, 215, 0, 0.25)"
            : "1px solid rgba(193,154,43,0.25)",
      }}
    >
      {/* Title + Tagline */}
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          gap: 2,
          flexWrap: "wrap",
          minWidth: 0,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            letterSpacing: 1.5,
            color: "primary.main",
            textShadow:
              theme.palette.mode === "dark"
                ? "0 0 8px rgba(255, 215, 0, 0.4)"
                : "none",
            whiteSpace: "nowrap",
          }}
        >
          BlakBox
        </Typography>

        <Typography
          variant="subtitle2"
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            opacity: 0.9,
            minWidth: 0,
          }}
        >
          Real-time logs, alerts, and service health
        </Typography>
      </Box>

      {/* Mode toggle */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 500, mr: 1 }}
        >
          {mode === "dark" ? "Dark Mode" : "Light Mode"}
        </Typography>
        <Tooltip
          title={mode === "dark" ? "Switch to light" : "Switch to dark"}
          arrow
        >
          <IconButton
            onClick={toggle}
            size="small"
            sx={{
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255, 215, 0, 0.16)"
                  : "rgba(193,154,43,0.12)",
              border:
                theme.palette.mode === "dark"
                  ? "1px solid rgba(255, 215, 0, 0.35)"
                  : "1px solid rgba(193,154,43,0.35)",
              "&:hover": {
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(255, 215, 0, 0.26)"
                    : "rgba(193,154,43,0.22)",
              },
            }}
          >
            {mode === "dark" ? (
              <LightModeIcon htmlColor={theme.palette.primary.main} />
            ) : (
              <DarkModeIcon />
            )}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
