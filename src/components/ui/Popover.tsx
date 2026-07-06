import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { DURATION, EASE } from '@/lib/motion/motionPresets';

export interface PopoverProps {
  trigger: (open: boolean) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: 'left' | 'right';
  panelClassName?: string;
}

/** Minimal click-outside + Escape popover. No portal (fine for our scale). */
export function Popover({ trigger, children, align = 'left', panelClassName }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="inline-flex">
        {trigger(open)}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: DURATION.fast, ease: EASE }}
            className={cn(
              'absolute z-40 mt-2 min-w-[10rem] rounded-xl border border-border-strong bg-surface-elevated p-1.5 shadow-card-hover',
              align === 'right' ? 'right-0' : 'left-0',
              panelClassName,
            )}
          >
            {children(() => setOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
