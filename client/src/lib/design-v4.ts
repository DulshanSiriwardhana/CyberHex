export const V4_RELEASE = {
  version: '4.0',
  serial: '01',
  codename: 'The Word',
  label: '7.0Local.mini',
  fullLabel: '7.0Local.mini — Omega Engine',
} as const;

export const V4_COLORS = {
  signal: {
    green: '#00e5ff',
    greenDim: '#06b6d4',
    violet: '#8b5cf6',
    gold: '#d4a017',
    goldSoft: 'rgba(212, 160, 23, 0.35)',
  },
  word: {
    cyber: '#f1f5f9',
    hex: '#00e5ff',
    serial: '#71717a',
    underline: 'linear-gradient(90deg, #00e5ff 0%, #d4a017 50%, #8b5cf6 100%)',
  },
} as const;

export const V4_WORDMARK = {
  fontFamily: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
  tracking: {
    cyber: '0.14em',
    tight: '-0.02em',
  },
  weight: {
    cyber: 800,
    hex: 800,
    serial: 600,
  },
  sizes: {
    sm: { cyber: '0.875rem', hex: '0.875rem', serial: '0.625rem' },
    md: { cyber: '1.125rem', hex: '1.125rem', serial: '0.6875rem' },
    lg: { cyber: '1.5rem', hex: '1.5rem', serial: '0.75rem' },
    hero: { cyber: 'clamp(2.5rem, 8vw, 5rem)', hex: 'clamp(2.5rem, 8vw, 5rem)', serial: '0.875rem' },
  },
} as const;

export type WordmarkSize = keyof typeof V4_WORDMARK.sizes;

export const V4_BADGE_COPY = {
  live: 'Neural Studio + C++ Inference Engine',
  hero: `${V4_RELEASE.fullLabel}`,
  short: V4_RELEASE.label,
} as const;
