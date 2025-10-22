import * as React from "react";
import { Box, Stack, Tooltip, IconButton, useTheme } from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ListAltIcon from "@mui/icons-material/ListAlt";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import AppsIcon from "@mui/icons-material/Apps";
import { useLocation, useNavigate } from "react-router-dom";

type Item = { key: string; label: string; icon: React.ReactNode; to: string };

const ITEMS: Item[] = [
  { key: "home", label: "Home", icon: <HomeRoundedIcon />, to: "/" },
  { key: "logs", label: "Logs", icon: <ListAltIcon />, to: "/logs" },
  {
    key: "alerts",
    label: "Alerts",
    icon: <NotificationsActiveIcon />,
    to: "/alerts",
  },
  { key: "errors", label: "Errors", icon: <ErrorOutlineIcon />, to: "/errors" },
  { key: "services", label: "Services", icon: <AppsIcon />, to: "/service" },
];

export default function SideNav() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const activeBg =
    theme.palette.mode === "dark"
      ? "rgba(255,215,0,0.18)"
      : "rgba(193,154,43,0.18)";
  const hoverBg =
    theme.palette.mode === "dark"
      ? "rgba(255,215,0,0.12)"
      : "rgba(193,154,43,0.10)";

  return (
    <Box
      component="nav"
      sx={{
        position: { md: "fixed" },
        left: 0,
        top: 100,
        zIndex: 1100,
        width: 72,
        height: "calc(100vh - 100px)",
        borderRadius: "0 24px 24px 0",
        p: 1,
        backgroundColor: "background.paper",
        borderRight: (t) =>
          `1px solid ${
            t.palette.mode === "dark"
              ? "rgba(255,215,0,0.25)"
              : "rgba(193,154,43,0.25)"
          }`,
        boxShadow: (t) =>
          t.palette.mode === "dark"
            ? "4px 0 20px rgba(0,0,0,0.4)"
            : "2px 0 10px rgba(0,0,0,0.1)",
        display: { xs: "none", md: "flex" },
        alignItems: "center",
      }}
    >
      <Stack spacing={0.5} sx={{ width: "100%", alignItems: "center" }}>
        {ITEMS.map((it) => {
          const isActive = pathname === it.to && it.to !== "/";
          return (
            <Tooltip key={it.key} title={it.label} placement="right" arrow>
              <IconButton
                size="large"
                onClick={() => navigate(it.to)}
                sx={{
                  my: 0.25,
                  width: 52,
                  height: 52,
                  borderRadius: 2,
                  color: isActive ? "primary.main" : "text.primary",
                  backgroundColor: isActive ? activeBg : "transparent",
                  "&:hover": {
                    backgroundColor: hoverBg,
                  },
                  boxShadow: isActive
                    ? "inset 0 0 0 1px rgba(255,215,0,0.35)"
                    : undefined,
                }}
              >
                {it.icon}
              </IconButton>
            </Tooltip>
          );
        })}
      </Stack>
    </Box>
  );
}
