/**
 * CyberHex v3.0 — Theme Store
 *
 * Manages dark/light mode AND multi-theme variant selection
 * with localStorage persistence and system preference detection.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeVariant } from '@/lib/design-tokens';

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
        set({ variant: VARIANT_CYCLE[nextIdx] });
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
      const resolved = resolveTheme(mode);
      applyThemeClass(resolved);
    } else {
      applyThemeClass('dark');
    }
  } catch {
    applyThemeClass('dark');
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