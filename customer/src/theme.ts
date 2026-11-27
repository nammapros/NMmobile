import { Platform, StatusBar } from "react-native";

export const isAndroid = Platform.OS === "android";
export const statusBarHeight = Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0;

export const colors = {
  primary: "#800020",        // NammaPros Burgundy
  primaryPressed: "#5e0017", // Pressed Burgundy
  primaryDark: "#5e0017",    // Deep Burgundy
  primarySoft: "#FDF2F4",    // Blush rose tint
  primaryLight: "#FBF3F2",   // Very subtle tint

  heading: "#1C1917",        // Main heading text
  body: "#57534E",           // Body text
  ink: "#1C1917",            // Deep Charcoal
  inkSecondary: "#44403C",   // Secondary text
  muted: "#78716C",          // Warm muted gray
  subtle: "#A8A29E",         // Placeholder / light gray

  canvas: "#FBF8F5",         // Background canvas
  canvasWarm: "#F4EFE9",     // Section backgrounds
  surface: "#FFFFFF",        // Card & modal background
  surfaceElevated: "#FFFFFF",
  background: "#FFFFFF",
  border: "#E8E1DB",         // Lines & borders
  borderLight: "#F0EAE4",
  tile: "#F5EFEB",           // Light gray/cream tile
  tileWarm: "#F0ECE7",

  gold: "#C8A35B",           // Rating stars & highlights
  goldBg: "#FEF9EE",
  accent: "#C8A35B",
  accentSoft: "#FFF8EB",

  success: "#166534",        // Green
  successSoft: "#E7F3EC",
  successBg: "#E7F3EC",
  warning: "#854D0E",        // Amber
  warningSoft: "#FFF4E5",
  warningBg: "#FFF4E5",
  error: "#9F1239",          // Rose error
  errorSoft: "#FDECEA",
  errorBg: "#FDECEA",
  danger: "#9F1239",
  dangerSoft: "#FDECEA",

  white: "#FFFFFF",
  black: "#000000",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radii = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 9999,
};

export const radius = {
  small: 8,
  button: 10,
  card: 12,
  sheet: 24,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 24, fontWeight: "700" as const, color: colors.ink, lineHeight: 30 },
  h2: { fontSize: 20, fontWeight: "700" as const, color: colors.ink, lineHeight: 26 },
  h3: { fontSize: 16, fontWeight: "700" as const, color: colors.ink, lineHeight: 22 },
  h4: { fontSize: 14, fontWeight: "600" as const, color: colors.ink, lineHeight: 20 },
  body: { fontSize: 14, fontWeight: "400" as const, color: colors.ink, lineHeight: 20 },
  bodySm: { fontSize: 12, fontWeight: "400" as const, color: colors.muted, lineHeight: 16 },
  caption: { fontSize: 11, fontWeight: "500" as const, color: colors.muted, lineHeight: 14 },
  button: { fontSize: 14, fontWeight: "700" as const, lineHeight: 18 },
};
