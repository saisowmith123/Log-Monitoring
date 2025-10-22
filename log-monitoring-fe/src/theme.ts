import * as React from "react";
import { createTheme } from "@mui/material/styles";

export type Mode = "dark" | "light";

export const ColorModeContext = React.createContext<{
  mode: Mode;
  toggle: () => void;
}>({ mode: "dark", toggle: () => {} });

export const darkGoldBlackTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#FFD700" },
    secondary: { main: "#1E1F24" },
    background: { default: "#0D0E10", paper: "#121316" },
    text: { primary: "#F5F6F8", secondary: "#B9BDC7" },
    divider: "rgba(255, 215, 0, 0.22)",
    error: { main: "#FF5A5F" },
    warning: { main: "#FFD700" },
    info: { main: "#4DA3FF" },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial',
    h4: { fontWeight: 800, letterSpacing: 1 },
    h6: { fontWeight: 600, letterSpacing: 0.2 },
    overline: { letterSpacing: 1.2, fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundImage: "none" },
        "*::selection": { background: "#FFD700", color: "#111" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.12))",
          border: "1px solid rgba(255,215,0,0.25)",
          boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
        },
      },
    },
  },
});

/* ---- LIGHT THEME (BlakBox Light) ---- */
export const whiteGoldTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#C19A2B" },
    secondary: { main: "#ECECEC" },
    background: { default: "#FAFAFA", paper: "#FFFFFF" },
    text: { primary: "#1A1A1A", secondary: "#555555" },
    divider: "#E0E0E0",
    error: { main: "#C62828" },
    warning: { main: "#F9A825" },
    info: { main: "#1565C0" },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial',
    h4: { fontWeight: 800, letterSpacing: 1 },
    h6: { fontWeight: 600, letterSpacing: 0.2 },
    overline: { letterSpacing: 1.2, fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundImage: "none" },
        "*::selection": { background: "#C19A2B", color: "#FFF" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(250,250,250,0.5))",
          border: "1px solid rgba(193,154,43,0.25)",
          boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
        },
      },
    },
  },
});
