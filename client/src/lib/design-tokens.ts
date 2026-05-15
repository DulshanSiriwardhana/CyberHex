// =============================================================================
// CyberHex Design Tokens v2.0 — Neon Cyberpunk + Glassmorphism
// =============================================================================

// ---- Color Palette ----------------------------------------------------------

export const colors = {
  // Brand primaries
  cyan: {
    50: "#ecfeff",
    100: "#cffafe",
    200: "#a5f3fc",
    300: "#67e8f9",
    400: "#22d3ee",
    500: "#06b6d4",
    600: "#0891b2",
    700: "#0e7490",
    800: "#155e75",
    900: "#164e63",
    950: "#083344",
  },
  violet: {
    50: "#f5f3ff",
    100: "#ede9fe",
    200: "#ddd6fe",
    300: "#c4b5fd",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
    800: "#5b21b6",
    900: "#4c1d95",
    950: "#2e1065",
  },
  // Neutrals — dark-first palette
  neutral: {
    0: "#ffffff",
    50: "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    300: "#d4d4d8",
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    750: "#2a2a32",
    800: "#27272a",
    850: "#1c1c22",
    900: "#18181b",
    925: "#111115",
    950: "#09090b",
    1000: "#050508",
  },
  // Semantic
  rose: {
    500: "#f43f5e",
    600: "#e11d48",
  },
  emerald: {
    400: "#34d399",
    500: "#10b981",
  },
  amber: {
    400: "#fbbf24",
    500: "#f59e0b",
  },
} as const;

// ---- Semantic tokens (tailwind-compatible) ----------------------------------

export const semanticTokens = {
  background: {
    base: colors.neutral[950],
    elevated: colors.neutral[900],
    surface: colors.neutral[850],
    overlay: colors.neutral[925],
    card: colors.neutral[900],
  },
  foreground: {
    primary: colors.neutral[0],
    secondary: colors.neutral[300],
    muted: colors.neutral[500],
    disabled: colors.neutral[600],
  },
  border: {
    default: `${colors.neutral[750]}`,
    subtle: `${colors.neutral[800]}`,
    strong: `${colors.neutral[600]}`,
    glow: `${colors.cyan[500]}40`,
  },
  brand: {
    primary: colors.cyan[500],
    primaryHover: colors.cyan[400],
    primaryActive: colors.cyan[600],
    secondary: colors.violet[500],
    secondaryHover: colors.violet[400],
    accent: colors.cyan[400],
    accentViolet: colors.violet[400],
  },
  status: {
    success: colors.emerald[500],
    error: colors.rose[500],
    warning: colors.amber[500],
  },
} as const;

// ---- Typography -------------------------------------------------------------

export const typography = {
  fontFamily: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
    spectral: "'Spectral', 'Georgia', serif",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
    "7xl": "4.5rem",
  },
  fontWeight: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
  lineHeight: {
    tight: "1.1",
    snug: "1.3",
    normal: "1.5",
    relaxed: "1.75",
  },
  letterSpacing: {
    tight: "-0.025em",
    normal: "0",
    wide: "0.05em",
    wider: "0.1em",
    widest: "0.2em",
  },
} as const;

// ---- Shadows & Glows --------------------------------------------------------

export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.4)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.4)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -4px rgba(0, 0, 0, 0.5)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.6)",
  glowCyan: `0 0 15px ${colors.cyan[500]}30, 0 0 40px ${colors.cyan[500]}15`,
  glowCyanStrong: `0 0 20px ${colors.cyan[500]}50, 0 0 60px ${colors.cyan[500]}20, 0 0 100px ${colors.cyan[500]}0a`,
  glowViolet: `0 0 15px ${colors.violet[500]}30, 0 0 40px ${colors.violet[500]}15`,
  glowVioletStrong: `0 0 20px ${colors.violet[500]}50, 0 0 60px ${colors.violet[500]}20`,
  glowInnerCyan: `inset 0 0 15px ${colors.cyan[500]}20`,
  glowInnerViolet: `inset 0 0 15px ${colors.violet[500]}20`,
  neonTextCyan: `0 0 7px ${colors.cyan[400]}80, 0 0 20px ${colors.cyan[500]}40, 0 0 40px ${colors.cyan[600]}20`,
  neonTextViolet: `0 0 7px ${colors.violet[400]}80, 0 0 20px ${colors.violet[500]}40, 0 0 40px ${colors.violet[600]}20`,
} as const;

// ---- Glass / Frosted effects ------------------------------------------------

export const glass = {
  subtle: "bg-neutral-900/40 backdrop-blur-sm border border-neutral-800/50",
  medium: "bg-neutral-900/60 backdrop-blur-md border border-neutral-750/50",
  strong: "bg-neutral-900/80 backdrop-blur-xl border border-neutral-700/50",
  card: "bg-neutral-850/50 backdrop-blur-lg border border-neutral-750/30",
  glow: "bg-neutral-900/60 backdrop-blur-lg border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]",
};

// ---- Border Radius ----------------------------------------------------------

export const radii = {
  none: "0",
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  "3xl": "1.5rem",
  full: "9999px",
} as const;

// ---- Spacing ----------------------------------------------------------------

export const spacing = {
  px: "1px",
  0: "0",
  0.5: "0.125rem",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  32: "8rem",
  40: "10rem",
  48: "12rem",
  56: "14rem",
  64: "16rem",
} as const;

// ---- Transitions & Animation ------------------------------------------------

export const transitions = {
  fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  normal: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
  spring: "500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
  easeOut: "300ms cubic-bezier(0.16, 1, 0.3, 1)",
};

export const animations = {
  fadeIn: "animate-in fade-in duration-300",
  fadeInUp: "animate-in fade-in slide-in-from-bottom-4 duration-300",
  fadeInDown: "animate-in fade-in slide-in-from-top-4 duration-300",
  scaleIn: "animate-in fade-in zoom-in-95 duration-200",
  pulseGlow: "animate-pulse-glow",
  float: "animate-float",
  scanLine: "animate-scan-line",
};

// ---- Z-Index ----------------------------------------------------------------

export const zIndex = {
  behind: -1,
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  popover: 500,
  tooltip: 600,
  toast: 700,
  max: 9999,
} as const;

// ---- Tailwind class helpers -------------------------------------------------

export const cx = (...classes: (string | undefined | false | null)[]) =>
  classes.filter(Boolean).join(" ");

// ---- CYBERHEX_BRAND_TOKEN (primary accent) ----------------------------------

export const CYBERHEX_BRAND_TOKEN = "cyan" as const;