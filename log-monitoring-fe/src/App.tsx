import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import { CssBaseline, ThemeProvider, Box, Container } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard/Dashboard";
import LogsPage from "./pages/LogsPage/LogsPage";
import TitleBar from "./components/Title/TitleBar";
import SideNav from "./pages/Dashboard/SideNav";
import ErrorsPage from "./pages/ErrorsPage/ErrorsPage";
import Alert from "./pages/Alerts/Alert";
import Service from "./pages/Service/Service";

import {
  ColorModeContext,
  darkGoldBlackTheme,
  whiteGoldTheme,
  Mode,
} from "./theme";

export default function App() {
  const systemPrefersDark =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const [mode, setMode] = useState<Mode>(systemPrefersDark ? "dark" : "light");

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) =>
      setMode(e.matches ? "dark" : "light");
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  const theme = useMemo(
    () => (mode === "dark" ? darkGoldBlackTheme : whiteGoldTheme),
    [mode]
  );

  const colorMode = useMemo(
    () => ({
      mode,
      toggle: () => setMode((m) => (m === "dark" ? "light" : "dark")),
    }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          {/* Global TitleBar */}
          <Box
            sx={{
              px: { xs: 2, md: 6 },
              pt: 2,
              backgroundColor: "background.default",
            }}
          >
            <TitleBar />
          </Box>

          {/* Global layout: SideNav + Page content */}
          <Box
            sx={{
              backgroundColor: "background.default",
              color: "text.primary",
              px: { xs: 2, md: 6 },
              pb: 4,
            }}
          >
            <Box
              sx={{
                backgroundColor: "background.default",
                color: "text.primary",
                px: { xs: 2, md: 6 },
                pb: 4,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 3,
                  alignItems: "flex-start",
                  minHeight: "calc(100vh - 96px)",
                }}
              >
                <SideNav />
                <Container
                  component="main"
                  maxWidth="lg"
                  disableGutters
                  sx={{ flex: 1, minWidth: 0, py: 2 }}
                >
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/logs" element={<LogsPage />} />
                    <Route path="/errors" element={<ErrorsPage />} />
                    <Route path="/alerts" element={<Alert />} />
                    <Route path="/service" element={<Service />} />
                  </Routes>
                </Container>
              </Box>
            </Box>
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
