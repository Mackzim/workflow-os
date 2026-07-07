import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

/**
 * Popover rendered in a portal to <body> so it escapes any parent stacking
 * context (e.g. animated/transformed task cards) – no more clipping or
 * click-through. Position is anchored to the trigger and flips up if needed.
 */
export function Popover({ trigger, children, align = 'left', panelClassName }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left?: number; right?: number }>({ top: -9999 });
  const reduced = useReducedMotion();

  const place = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const gap = 6;
    const panelH = panelRef.current?.offsetHeight ?? 240;
    let top = r.bottom + gap;
    if (top + panelH > window.innerHeight - 8) top = Math.max(8, r.top - gap - panelH);
    if (align === 'right') setPos({ top, right: Math.max(8, window.innerWidth - r.right) });
    else setPos({ top, left: Math.min(r.left, window.innerWidth - 8) });
  };

  useLayoutEffect(() => {
    if (open) place();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const reflow = () => place();
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', reflow);
    window.addEventListener('scroll', reflow, true);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', reflow);
      window.removeEventListener('scroll', reflow, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen((v) => !v)} className="inline-flex">
        {trigger(open)}
      </button>
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={panelRef}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: DURATION.fast, ease: EASE }}
              style={{ position: 'fixed', top: pos.top, left: pos.left, right: pos.right, zIndex: 60 }}
              className={cn(
                'max-h-[60vh] min-w-[10rem] overflow-y-auto rounded-xl border border-border-strong bg-surface-elevated p-1.5 shadow-card-hover',
                panelClassName,
              )}
            >
              {children(() => setOpen(false))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
