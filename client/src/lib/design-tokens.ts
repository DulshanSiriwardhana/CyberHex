/**
 * CyberHex Design Tokens — Multi-Theme Foundation (v3+) + v4 Word System
 *
 * Theme registry and scales for the platform. For v4.0 Release No. 01
 * wordmark typography and serial badges, see `@/lib/design-v4`.
 */

// ──── Theme Variants ─────────────────────────────────────────────
export type ThemeVariant = 'cyber' | 'nebula' | 'aurora' | 'midnight' | 'plasma' | 'emerald';

export interface ThemeConfig {
  id: ThemeVariant;
  name: string;
  description: string;
  preview: string; // CSS gradient for preview swatch
  colors: ThemeColors;
}

// ──── Color Palette Architecture ──────────────────────────────────
export interface ThemeColors {
  // Core backgrounds
  bg: {
    root: string;
    surface: string;
    elevated: string;
    overlay: string;
    field: string;
  };
  // Semantic accents
  accent: {
    primary: string;
    secondary: string;
    tertiary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
  };
  // Text hierarchy
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    link: string;
  };
  // Borders & dividers
  border: {
    subtle: string;
    default: string;
    strong: string;
    accent: string;
  };
  // Gradient presets
  gradient: {
    hero: string;
    card: string;
    glow: string;
    accent: string;
    surface: string;
  };
  // Glow / shadow
  glow: {
    primary: string;
    secondary: string;
    accent: string;
    card: string;
  };
  // Chart palette
  chart: string[];
}

// ──── Cyber Theme (Default Dark) ──────────────────────────────────
const cyberColors: ThemeColors = {
  bg: {
    root: '#0a0a0f',
    surface: '#111118',
    elevated: '#181825',
    overlay: 'rgba(10, 10, 15, 0.85)',
    field: '#1a1a2e',
  },
  accent: {
    primary: '#00f0ff',
    secondary: '#7c3aed',
    tertiary: '#f472b6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    tertiary: '#64748b',
    inverse: '#0a0a0f',
    link: '#38bdf8',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.04)',
    default: 'rgba(255, 255, 255, 0.08)',
    strong: 'rgba(255, 255, 255, 0.14)',
    accent: 'rgba(0, 240, 255, 0.25)',
  },
  gradient: {
    hero: 'linear-gradient(135deg, #0a0a0f 0%, #111827 40%, #1e1b4b 70%, #0a0a0f 100%)',
    card: 'linear-gradient(135deg, rgba(24, 24, 37, 0.9), rgba(17, 17, 24, 0.95))',
    glow: 'radial-gradient(ellipse at center, rgba(0, 240, 255, 0.08) 0%, transparent 70%)',
    accent: 'linear-gradient(135deg, #00f0ff, #7c3aed)',
    surface: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
  },
  glow: {
    primary: '0 0 20px rgba(0, 240, 255, 0.15), 0 0 60px rgba(0, 240, 255, 0.05)',
    secondary: '0 0 20px rgba(124, 58, 237, 0.15), 0 0 60px rgba(124, 58, 237, 0.05)',
    accent: '0 0 15px rgba(0, 240, 255, 0.2)',
    card: '0 0 30px rgba(0, 240, 255, 0.04)',
  },
  chart: ['#00f0ff', '#7c3aed', '#f472b6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#06b6d4'],
};

// ──── Nebula Theme ────────────────────────────────────────────────
const nebulaColors: ThemeColors = {
  bg: {
    root: '#0d0221',
    surface: '#150a30',
    elevated: '#1f1245',
    overlay: 'rgba(13, 2, 33, 0.85)',
    field: '#1a0f3c',
  },
  accent: {
    primary: '#c084fc',
    secondary: '#818cf8',
    tertiary: '#f9a8d4',
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#f87171',
    info: '#60a5fa',
  },
  text: {
    primary: '#f5f3ff',
    secondary: '#c4b5fd',
    tertiary: '#8b7fd4',
    inverse: '#0d0221',
    link: '#a78bfa',
  },
  border: {
    subtle: 'rgba(192, 132, 252, 0.06)',
    default: 'rgba(192, 132, 252, 0.10)',
    strong: 'rgba(192, 132, 252, 0.18)',
    accent: 'rgba(192, 132, 252, 0.30)',
  },
  gradient: {
    hero: 'linear-gradient(135deg, #0d0221 0%, #1a0533 40%, #2d1b69 70%, #0d0221 100%)',
    card: 'linear-gradient(135deg, rgba(31, 18, 69, 0.9), rgba(21, 10, 48, 0.95))',
    glow: 'radial-gradient(ellipse at center, rgba(192, 132, 252, 0.08) 0%, transparent 70%)',
    accent: 'linear-gradient(135deg, #c084fc, #818cf8)',
    surface: 'linear-gradient(180deg, rgba(192,132,252,0.03) 0%, transparent 100%)',
  },
  glow: {
    primary: '0 0 20px rgba(192, 132, 252, 0.15), 0 0 60px rgba(192, 132, 252, 0.05)',
    secondary: '0 0 20px rgba(129, 140, 248, 0.15), 0 0 60px rgba(129, 140, 248, 0.05)',
    accent: '0 0 15px rgba(192, 132, 252, 0.2)',
    card: '0 0 30px rgba(192, 132, 252, 0.04)',
  },
  chart: ['#c084fc', '#818cf8', '#f9a8d4', '#34d399', '#fbbf24', '#60a5fa', '#f87171', '#a78bfa'],
};

// ──── Aurora Theme (Light) ───────────────────────────────────────
const auroraColors: ThemeColors = {
  bg: {
    root: '#f8fafc',
    surface: '#ffffff',
    elevated: '#f1f5f9',
    overlay: 'rgba(248, 250, 252, 0.85)',
    field: '#f1f5f9',
  },
  accent: {
    primary: '#0ea5e9',
    secondary: '#8b5cf6',
    tertiary: '#ec4899',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
    info: '#2563eb',
  },
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    tertiary: '#94a3b8',
    inverse: '#f8fafc',
    link: '#0284c7',
  },
  border: {
    subtle: 'rgba(15, 23, 42, 0.04)',
    default: 'rgba(15, 23, 42, 0.08)',
    strong: 'rgba(15, 23, 42, 0.14)',
    accent: 'rgba(14, 165, 233, 0.25)',
  },
  gradient: {
    hero: 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 40%, #fff1f2 70%, #f0f9ff 100%)',
    card: 'linear-gradient(135deg, #ffffff, #f8fafc)',
    glow: 'radial-gradient(ellipse at center, rgba(14, 165, 233, 0.06) 0%, transparent 70%)',
    accent: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
    surface: 'linear-gradient(180deg, rgba(14,165,233,0.02) 0%, transparent 100%)',
  },
  glow: {
    primary: '0 4px 20px rgba(14, 165, 233, 0.1), 0 1px 3px rgba(0,0,0,0.08)',
    secondary: '0 4px 20px rgba(139, 92, 246, 0.1), 0 1px 3px rgba(0,0,0,0.08)',
    accent: '0 2px 10px rgba(14, 165, 233, 0.15)',
    card: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
  },
  chart: ['#0ea5e9', '#8b5cf6', '#ec4899', '#059669', '#d97706', '#2563eb', '#dc2626', '#06b6d4'],
};

// ──── Midnight Theme ──────────────────────────────────────────────
const midnightColors: ThemeColors = {
  bg: {
    root: '#020617',
    surface: '#0f172a',
    elevated: '#1e293b',
    overlay: 'rgba(2, 6, 23, 0.9)',
    field: '#1e293b',
  },
  accent: {
    primary: '#38bdf8',
    secondary: '#6366f1',
    tertiary: '#a78bfa',
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#f87171',
    info: '#60a5fa',
  },
  text: {
    primary: '#e2e8f0',
    secondary: '#94a3b8',
    tertiary: '#64748b',
    inverse: '#020617',
    link: '#7dd3fc',
  },
  border: {
    subtle: 'rgba(148, 163, 184, 0.06)',
    default: 'rgba(148, 163, 184, 0.10)',
    strong: 'rgba(148, 163, 184, 0.16)',
    accent: 'rgba(56, 189, 248, 0.25)',
  },
  gradient: {
    hero: 'linear-gradient(135deg, #020617 0%, #0c1929 40%, #1e1b4b 70%, #020617 100%)',
    card: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
    glow: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.06) 0%, transparent 70%)',
    accent: 'linear-gradient(135deg, #38bdf8, #6366f1)',
    surface: 'linear-gradient(180deg, rgba(255,255,255,0.01) 0%, transparent 100%)',
  },
  glow: {
    primary: '0 0 20px rgba(56, 189, 248, 0.12), 0 0 60px rgba(56, 189, 248, 0.04)',
    secondary: '0 0 20px rgba(99, 102, 241, 0.12), 0 0 60px rgba(99, 102, 241, 0.04)',
    accent: '0 0 15px rgba(56, 189, 248, 0.18)',
    card: '0 0 30px rgba(56, 189, 248, 0.03)',
  },
  chart: ['#38bdf8', '#6366f1', '#a78bfa', '#34d399', '#fbbf24', '#60a5fa', '#f87171', '#06b6d4'],
};

// ──── Emerald Theme (Green) ───────────────────────────────────────
const emeraldColors: ThemeColors = {
  bg: {
    root: '#060e09',
    surface: '#0d1912',
    elevated: '#132418',
    overlay: 'rgba(6, 14, 9, 0.88)',
    field: '#172e1f',
  },
  accent: {
    primary: '#00e676',
    secondary: '#00bfa5',
    tertiary: '#a0f0a0',
    success: '#00c853',
    warning: '#ffb300',
    danger: '#ff5252',
    info: '#448aff',
  },
  text: {
    primary: '#e8f5e9',
    secondary: '#a5d6a7',
    tertiary: '#6b9b70',
    inverse: '#060e09',
    link: '#69f0ae',
  },
  border: {
    subtle: 'rgba(0, 230, 118, 0.06)',
    default: 'rgba(0, 230, 118, 0.10)',
    strong: 'rgba(0, 230, 118, 0.18)',
    accent: 'rgba(0, 230, 118, 0.30)',
  },
  gradient: {
    hero: 'linear-gradient(135deg, #060e09 0%, #0b1a10 40%, #0d3020 70%, #060e09 100%)',
    card: 'linear-gradient(135deg, rgba(19, 36, 24, 0.9), rgba(13, 25, 18, 0.95))',
    glow: 'radial-gradient(ellipse at center, rgba(0, 230, 118, 0.08) 0%, transparent 70%)',
    accent: 'linear-gradient(135deg, #00e676, #00bfa5)',
    surface: 'linear-gradient(180deg, rgba(0,230,118,0.03) 0%, transparent 100%)',
  },
  glow: {
    primary: '0 0 20px rgba(0, 230, 118, 0.15), 0 0 60px rgba(0, 230, 118, 0.05)',
    secondary: '0 0 20px rgba(0, 191, 165, 0.15), 0 0 60px rgba(0, 191, 165, 0.05)',
    accent: '0 0 15px rgba(0, 230, 118, 0.2)',
    card: '0 0 30px rgba(0, 230, 118, 0.04)',
  },
  chart: ['#00e676', '#00bfa5', '#a0f0a0', '#00c853', '#ffb300', '#448aff', '#ff5252', '#69f0ae'],
};

// ──── Plasma Theme ───────────────────────────────────────────────
const plasmaColors: ThemeColors = {
  bg: {
    root: '#0f0f1a',
    surface: '#16162b',
    elevated: '#1f1f3d',
    overlay: 'rgba(15, 15, 26, 0.88)',
    field: '#1c1c36',
  },
  accent: {
    primary: '#ff6b6b',
    secondary: '#ffd93d',
    tertiary: '#6bcb77',
    success: '#4d96ff',
    warning: '#ffd93d',
    danger: '#ff6b6b',
    info: '#4d96ff',
  },
  text: {
    primary: '#f0f0ff',
    secondary: '#b8b8d0',
    tertiary: '#6e6e8a',
    inverse: '#0f0f1a',
    link: '#ff8a8a',
  },
  border: {
    subtle: 'rgba(255, 107, 107, 0.06)',
    default: 'rgba(255, 107, 107, 0.10)',
    strong: 'rgba(255, 107, 107, 0.18)',
    accent: 'rgba(255, 107, 107, 0.30)',
  },
  gradient: {
    hero: 'linear-gradient(135deg, #0f0f1a 0%, #1a1025 40%, #2a1535 70%, #0f0f1a 100%)',
    card: 'linear-gradient(135deg, rgba(31, 31, 61, 0.9), rgba(22, 22, 43, 0.95))',
    glow: 'radial-gradient(ellipse at center, rgba(255, 107, 107, 0.08) 0%, transparent 70%)',
    accent: 'linear-gradient(135deg, #ff6b6b, #ffd93d)',
    surface: 'linear-gradient(180deg, rgba(255,107,107,0.03) 0%, transparent 100%)',
  },
  glow: {
    primary: '0 0 20px rgba(255, 107, 107, 0.15), 0 0 60px rgba(255, 107, 107, 0.05)',
    secondary: '0 0 20px rgba(255, 217, 61, 0.15), 0 0 60px rgba(255, 217, 61, 0.05)',
    accent: '0 0 15px rgba(255, 107, 107, 0.2)',
    card: '0 0 30px rgba(255, 107, 107, 0.04)',
  },
  chart: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff8a8a', '#ff922b', '#845ef7', '#20c997'],
};

// ──── Theme Registry ──────────────────────────────────────────────
export const THEME_REGISTRY: Record<ThemeVariant, ThemeConfig> = {
  cyber: {
    id: 'cyber',
    name: 'Cyber',
    description: 'Neon green on deep space — the original CyberHex aesthetic',
    preview: 'linear-gradient(135deg, #0a0a0f, #00f0ff, #7c3aed)',
    colors: cyberColors,
  },
  nebula: {
    id: 'nebula',
    name: 'Nebula',
    description: 'Violet cosmic gradients with ethereal purple glow',
    preview: 'linear-gradient(135deg, #0d0221, #c084fc, #818cf8)',
    colors: nebulaColors,
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora',
    description: 'Crisp light theme with sky blue and violet accents',
    preview: 'linear-gradient(135deg, #f8fafc, #0ea5e9, #8b5cf6)',
    colors: auroraColors,
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep navy with icy blue highlights — focused and professional',
    preview: 'linear-gradient(135deg, #020617, #38bdf8, #6366f1)',
    colors: midnightColors,
  },
  plasma: {
    id: 'plasma',
    name: 'Plasma',
    description: 'Vibrant warm tones — coral, gold, and electric energy',
    preview: 'linear-gradient(135deg, #0f0f1a, #ff6b6b, #ffd93d)',
    colors: plasmaColors,
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    description: 'Lush green accents on deep forest backgrounds — fresh and focused',
    preview: 'linear-gradient(135deg, #060e09, #00e676, #00bfa5)',
    colors: emeraldColors,
  },
};

// ──── Typography Scale ───────────────────────────────────────────
export const TYPOGRAPHY = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    display: ['Spectral', 'Georgia', 'serif'],
    ui: ['Inter', 'system-ui', 'sans-serif'],
  },
  fontSize: {
    // Using Tailwind-compatible scale
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
    mono: '0.05em', // Code-specific
  },
} as const;

// ──── Spacing & Layout Scale ─────────────────────────────────────
export const SPACING = {
  panel: {
    sidebarWidth: 280,
    sidebarCollapsed: 64,
    topbarHeight: 56,
    bottomBarHeight: 36,
    rightPanelWidth: 360,
    minContentWidth: 400,
  },
  radius: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.3)',
    md: '0 4px 6px rgba(0,0,0,0.4)',
    lg: '0 10px 15px rgba(0,0,0,0.5)',
    xl: '0 20px 25px rgba(0,0,0,0.6)',
  },
} as const;

// ──── Animation Tokens ───────────────────────────────────────────
export const ANIMATION = {
  duration: {
    instant: 75,
    fast: 150,
    normal: 250,
    slow: 400,
    slower: 600,
    slowest: 1000,
  },
  easing: {
    // Custom cubic-bezier curves for premium feel
    spring: [0.34, 1.56, 0.64, 1] as const,       // Bouncy spring
    smooth: [0.4, 0, 0.2, 1] as const,             // Material-style smooth
    decelerate: [0.0, 0, 0.2, 1] as const,         // Entering screen
    accelerate: [0.4, 0, 1, 1] as const,           // Exiting screen
    sharp: [0.4, 0, 0.6, 1] as const,              // Standard in-out
    bounce: [0.68, -0.55, 0.265, 1.55] as const,   // Strong bounce
  },
  spring: {
    gentle: { type: 'spring' as const, stiffness: 200, damping: 25 },
    snappy: { type: 'spring' as const, stiffness: 400, damping: 35 },
    bouncy: { type: 'spring' as const, stiffness: 300, damping: 15 },
    stiff: { type: 'spring' as const, stiffness: 500, damping: 40 },
  },
} as const;

// ──── Z-Index Scale ──────────────────────────────────────────────
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
  commandPalette: 1800,
} as const;

// ──── Breakpoint Definitions ─────────────────────────────────────
export const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
} as const;

// ──── Glass Effect Presets ───────────────────────────────────────
export const GLASS_EFFECTS = {
  subtle: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  medium: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  heavy: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  accent: {
    background: 'rgba(0, 240, 255, 0.04)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(0, 240, 255, 0.12)',
  },
} as const;

// ──── Utility: Get Current Theme Colors ─────────────────────────
export function getThemeColors(variant: ThemeVariant): ThemeColors {
  return THEME_REGISTRY[variant]?.colors ?? cyberColors;
}

// ──── Default export for convenience ─────────────────────────────
export default THEME_REGISTRY;