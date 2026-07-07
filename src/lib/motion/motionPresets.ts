/**
 * Central Motion Presets
 * ----------------------
 * All animation lives here so timing/easing stay consistent and can be tuned
 * in one place. Uses only transform/opacity (GPU-friendly, no layout jank).
 *
 * Reduced motion: components should read `useReducedMotion()` from framer and
 * fall back to `instant`. The CSS media query in globals.css is the safety net.
 */

import type { Transition, Variants } from 'framer-motion';

/* ---------- Shared easing & durations ---------- */
export const EASE = [0.22, 1, 0.36, 1] as const; // "smooth" – expo-out feel
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const DURATION = {
  fast: 0.16,
  base: 0.24,
  slow: 0.4,
} as const;

const spring: Transition = { type: 'spring', stiffness: 420, damping: 34, mass: 0.9 };

/* ---------- Page transitions ---------- */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
  exit: { opacity: 0, y: -6, transition: { duration: DURATION.fast, ease: EASE } },
};

/* ---------- Staggered container for widget/list grids ---------- */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

export const cardEntrance: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.985 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION.base, ease: EASE },
  },
  exit: { opacity: 0, y: -8, scale: 0.985, transition: { duration: DURATION.fast, ease: EASE } },
};

/* ---------- Hover / interactive ---------- */
export const widgetHover = {
  rest: { y: 0 },
  hover: { y: -3, transition: { duration: DURATION.fast, ease: EASE } },
  tap: { scale: 0.99 },
} as const;

/* ---------- Task lifecycle ---------- */
export const taskCreate: Variants = {
  initial: { opacity: 0, x: -12, height: 0 },
  animate: {
    opacity: 1,
    x: 0,
    height: 'auto',
    transition: { duration: DURATION.base, ease: EASE },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    height: 0,
    marginTop: 0,
    transition: { duration: DURATION.slow, ease: EASE },
  },
};

export const taskComplete = {
  checked: { scale: [1, 1.18, 1], transition: { duration: 0.32, ease: EASE } },
} as const;

export const statusChange: Transition = spring;

/* ---------- Sidebar active indicator (layoutId powered) ---------- */
export const sidebarIndicator: Transition = { type: 'spring', stiffness: 500, damping: 40 };

export const sidebarItem: Variants = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0, transition: { duration: DURATION.base, ease: EASE } },
};

/* ---------- Mobile drawer ---------- */
export const drawerTransition = {
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: DURATION.base } },
    exit: { opacity: 0, transition: { duration: DURATION.fast } },
  },
  panel: {
    initial: { x: '-100%' },
    animate: { x: 0, transition: { type: 'spring', stiffness: 380, damping: 40 } },
    exit: { x: '-100%', transition: { duration: DURATION.base, ease: EASE } },
  },
} as const;

/* ---------- Command center activity ---------- */
export const commandPulse: Variants = {
  idle: { boxShadow: '0 0 0 1px var(--color-border)' },
  active: {
    boxShadow: '0 0 0 1px rgba(76,141,255,0.5), 0 0 24px -4px rgba(76,141,255,0.35)',
    transition: { duration: DURATION.base, ease: EASE },
  },
};

export const focusGlow: Variants = {
  rest: { opacity: 0.0 },
  focus: { opacity: 1, transition: { duration: DURATION.base, ease: EASE } },
};

/** Instant fallback used when prefers-reduced-motion is on. */
export const instant: Variants = {
  initial: {},
  animate: {},
  exit: {},
};
