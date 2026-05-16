/**
 * CyberHex v3.0 — Theme Store
 *
 * Manages dark/light mode AND multi-theme variant selection
 * with localStorage persistence and system preference detection.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeVariant } from '@/lib/design-tokens';
import { getThemeColors } from '@/lib/design-tokens';

// ──── Types ──────────────────────────────────────────────────────
export type ThemeMode = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

interface ThemeState {
  /** User-chosen mode: dark, light, or follow system */
  mode: ThemeMode;
  /** Selected theme variant (color palette family) */
  variant: ThemeVariant;
  /** Resolved actual dark/light value */
  resolved: ResolvedTheme;

  // Actions
  setMode: (mode: ThemeMode) => void;
  setVariant: (variant: ThemeVariant) => void;
  toggle: () => void;
  cycleVariant: () => void;
}

// ──── Helpers ────────────────────────────────────────────────────
const VARIANT_CYCLE: ThemeVariant[] = [
  'cyber',
  'nebula',
  'midnight',
  'plasma',
  'aurora',
  'emerald',
];

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') return getSystemTheme();
  return mode;
}

function applyThemeClass(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (resolved === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
  }
  // Force repaint to prevent flash
  root.style.colorScheme = resolved;
}

/** Lighten a hex color by a factor (0 = no change, 1 = white) */
function lightenHex(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * factor);
  return `#${mix(r).toString(16).padStart(2, '0')}${mix(g).toString(16).padStart(2, '0')}${mix(b).toString(16).padStart(2, '0')}`;
}

/** Darken a hex color by a factor (0 = no change, 1 = black) */
function darkenHex(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number) => Math.round(c * (1 - factor));
  return `#${mix(r).toString(16).padStart(2, '0')}${mix(g).toString(16).padStart(2, '0')}${mix(b).toString(16).padStart(2, '0')}`;
}

/**
 * Applies the selected theme variant by overriding Tailwind's --color-* CSS
 * custom properties on :root. This causes all text-cyan-*, bg-cyan-*, etc
 * classes to dynamically resolve to the variant's palette at runtime.
 */
function applyVariantCSS(variant: ThemeVariant): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const c = getThemeColors(variant);
  const p = c.accent.primary;
  const s = c.accent.secondary;

  // Override Tailwind cyan scale (primary accent) with variant accent.primary
  root.style.setProperty('--color-cyan-300', lightenHex(p, 0.25));
  root.style.setProperty('--color-cyan-400', p);
  root.style.setProperty('--color-cyan-500', darkenHex(p, 0.15));
  root.style.setProperty('--color-cyan-600', darkenHex(p, 0.35));
  root.style.setProperty('--color-cyan-700', darkenHex(p, 0.55));
  root.style.setProperty('--color-cyan-800', darkenHex(p, 0.7));

  // Override Tailwind violet scale (secondary accent) with variant accent.secondary
  root.style.setProperty('--color-violet-300', lightenHex(s, 0.25));
  root.style.setProperty('--color-violet-400', s);
  root.style.setProperty('--color-violet-500', darkenHex(s, 0.15));
  root.style.setProperty('--color-violet-600', darkenHex(s, 0.35));
  root.style.setProperty('--color-violet-700', darkenHex(s, 0.55));

  // Override Tailwind pink scale (tertiary accent) with variant accent.tertiary
  const t = c.accent.tertiary;
  root.style.setProperty('--color-pink-400', t);
  root.style.setProperty('--color-pink-500', darkenHex(t, 0.15));

  // Override semantic accent colors for success/warning/danger/info
  root.style.setProperty('--color-green-500', c.accent.success);
  root.style.setProperty('--color-amber-500', c.accent.warning);
  root.style.setProperty('--color-rose-500', c.accent.danger);
  root.style.setProperty('--color-sky-500', c.accent.info);

  // Override deep background neutrals with variant bg colors
  root.style.setProperty('--color-neutral-900', c.bg.elevated);
  root.style.setProperty('--color-neutral-950', c.bg.root);
  root.style.setProperty('--color-neutral-800', darkenHex(c.bg.elevated, 0.08));

  // Keep custom --cyber-* properties for components that use them
  root.style.setProperty('--cyber-glow-primary', c.glow.primary);
  root.style.setProperty('--cyber-glow-card', c.glow.card);
}

// ──── Store ──────────────────────────────────────────────────────
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark',
      variant: 'cyber',
      resolved: 'dark',

      setMode: (mode: ThemeMode) => {
        const resolved = resolveTheme(mode);
        applyThemeClass(resolved);
        set({ mode, resolved });
      },

      setVariant: (variant: ThemeVariant) => {
        applyVariantCSS(variant);
        set({ variant });
      },

      toggle: () => {
        const { mode, resolved } = get();
        // Toggle between dark and light
        if (mode === 'dark') {
          const newResolved: ResolvedTheme = 'light';
          applyThemeClass(newResolved);
          set({ mode: 'light', resolved: newResolved });
        } else if (mode === 'light') {
          const newResolved: ResolvedTheme = 'dark';
          applyThemeClass(newResolved);
          set({ mode: 'dark', resolved: newResolved });
        } else {
          // When in system mode, switch to explicit opposite
          const newMode: ThemeMode = resolved === 'dark' ? 'light' : 'dark';
          applyThemeClass(newMode);
          set({ mode: newMode, resolved: newMode });
        }
      },

      cycleVariant: () => {
        const { variant } = get();
        const idx = VARIANT_CYCLE.indexOf(variant);
        const nextIdx = (idx + 1) % VARIANT_CYCLE.length;
        const nextVariant = VARIANT_CYCLE[nextIdx];
        applyVariantCSS(nextVariant);
        set({ variant: nextVariant });
      },
    }),
    {
      name: 'cyberhex-theme-v3',
      partialize: (state) => ({
        mode: state.mode,
        variant: state.variant,
      }),
      merge: (persisted: unknown, current: ThemeState): ThemeState => {
        const p = persisted as Partial<ThemeState>;
        const mode = p.mode || 'dark';
        const variant = p.variant || 'cyber';
        const resolved = resolveTheme(mode);
        return { ...current, mode, variant, resolved };
      },
    }
  )
);

// ──── Initialize theme on module load (prevents FOUC) ────────────
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem('cyberhex-theme-v3');
    if (raw) {
      const parsed = JSON.parse(raw);
      const mode: ThemeMode = parsed?.state?.mode || 'dark';
      const variant: ThemeVariant = parsed?.state?.variant || 'cyber';
      const resolved = resolveTheme(mode);
      applyThemeClass(resolved);
      applyVariantCSS(variant);
    } else {
      applyThemeClass('dark');
      applyVariantCSS('cyber');
    }
  } catch {
    applyThemeClass('dark');
    applyVariantCSS('cyber');
  }

  // Listen for system preference changes when in 'system' mode
  window
    .matchMedia('(prefers-color-scheme: light)')
    .addEventListener('change', (e) => {
      const store = useThemeStore.getState();
      if (store.mode === 'system') {
        const resolved: ResolvedTheme = e.matches ? 'light' : 'dark';
        applyThemeClass(resolved);
        useThemeStore.setState({ resolved });
      }
    });
}

export default useThemeStore;