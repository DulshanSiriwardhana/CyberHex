import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        cyber: {
          50: '#e6f0ff',
          100: '#b3d4ff',
          200: '#80b8ff',
          300: '#4d9cff',
          400: '#1a80ff',
          500: '#0066e6',
          600: '#0050b3',
          700: '#003a80',
          800: '#00244d',
          900: '#000e1a',
          950: '#000711',
        },
        neon: {
          cyan: '#00f0ff',
          magenta: '#ff00ff',
          green: '#00ff88',
          yellow: '#ffff00',
          purple: '#7b2ff7',
          blue: '#0066ff',
          pink: '#ff0066',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.05)',
          medium: 'rgba(255, 255, 255, 0.08)',
          heavy: 'rgba(255, 255, 255, 0.12)',
          border: 'rgba(255, 255, 255, 0.1)',
          glow: 'rgba(0, 240, 255, 0.15)',
        },
        surface: {
          DEFAULT: '#0a0a1a',
          elevated: '#0f0f25',
          panel: '#131330',
          hover: '#1a1a3e',
          active: '#222255',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
        'neural-gradient': 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2e 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 240, 255, 0.15)',
        'glow-lg': '0 0 40px rgba(0, 240, 255, 0.2)',
        'glow-magenta': '0 0 20px rgba(255, 0, 255, 0.15)',
        'panel-md': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'panel-lg': '0 8px 32px rgba(0, 0, 0, 0.6)',
        hud: '0 0 0 1px rgba(0, 240, 255, 0.2), 0 0 20px rgba(0, 240, 255, 0.1)',
        'hud-magenta': '0 0 0 1px rgba(255, 0, 255, 0.2), 0 0 20px rgba(255, 0, 255, 0.1)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s linear infinite',
        'scan-line': 'scanLine 4s linear infinite',
        'particle-drift': 'particleDrift 12s ease-in-out infinite',
        'equalizer': 'equalizer 1.2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 240, 255, 0.3)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        particleDrift: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '25%': { transform: 'translateY(-20px) translateX(10px)' },
          '50%': { transform: 'translateY(-10px) translateX(-10px)' },
          '75%': { transform: 'translateY(-30px) translateX(5px)' },
        },
        equalizer: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '40%': { transform: 'scaleY(1)' },
          '60%': { transform: 'scaleY(0.6)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;