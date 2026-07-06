/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Design tokens are declared as CSS variables in src/styles/globals.css.
        // Mapping them here lets us use semantic classes like `bg-surface`.
        bg: 'var(--color-bg)',
        'bg-soft': 'var(--color-bg-soft)',
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        'surface-hover': 'var(--color-surface-hover)',
        border: 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          strong: 'var(--color-primary-strong)',
          soft: 'var(--color-primary-soft)',
        },
        secondary: 'var(--color-secondary)',
        content: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          faint: 'var(--color-text-faint)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        critical: 'var(--color-critical)',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.02) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
        'card-hover': '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 16px 40px -16px rgba(0,0,0,0.7)',
        glow: '0 0 0 1px rgba(76,141,255,0.35), 0 0 24px -4px rgba(76,141,255,0.35)',
        'glow-soft': '0 0 32px -8px rgba(76,141,255,0.35)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(76,141,255,0.35)' },
          '70%': { boxShadow: '0 0 0 10px rgba(76,141,255,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(76,141,255,0)' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite',
      },
    },
  },
  plugins: [],
};
