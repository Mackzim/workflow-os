import { useEffect } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { EASE } from '@/lib/motion/motionPresets';

export interface AnimatedNumberProps {
  value: number;
  className?: string;
  /** Appended after the number, e.g. "%". */
  suffix?: string;
  duration?: number;
}

/** Counts up/down to `value` on mount and whenever it changes. */
export function AnimatedNumber({ value, className, suffix = '', duration = 0.7 }: AnimatedNumberProps) {
  const reduced = useReducedMotion();
  const mv = useMotionValue(reduced ? value : 0);
  const text = useTransform(mv, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (reduced) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration, ease: EASE });
    return () => controls.stop();
  }, [value, reduced, duration, mv]);

  return <motion.span className={className}>{text}</motion.span>;
}
