import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { EASE } from '@/lib/motion/motionPresets';

export interface ProgressBarProps {
  /** 0..100 */
  value: number;
  className?: string;
  color?: string;
  height?: number;
}

export function ProgressBar({ value, className, color = 'var(--color-primary)', height = 8 }: ProgressBarProps) {
  const reduced = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn('w-full overflow-hidden rounded-full bg-surface-elevated border border-border', className)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full rounded-full"
        style={{
          background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 70%, white 12%))`,
          boxShadow: `0 0 16px -4px ${color}`,
        }}
        initial={reduced ? false : { width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.6, ease: EASE }}
      />
    </div>
  );
}
