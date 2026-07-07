import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { EASE } from '@/lib/motion/motionPresets';
import { BrandMark } from './Brand';

/**
 * "Power-on" boot overlay. Mounted once at the app root (inside the router but
 * above the routes), so it plays on a real page load — first visit, refresh,
 * hard reload — but NOT on in-app navigation (the router never remounts this).
 * Short + skippable (click / any key). Skipped entirely for reduced-motion.
 */
const DURATION_MS = 1050;

export function BootSequence() {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(() => !reduced);

  useEffect(() => {
    if (!show) return;
    const dismiss = () => setShow(false);
    const id = window.setTimeout(dismiss, DURATION_MS);
    const onKey = () => dismiss();
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('keydown', onKey);
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="boot"
          onClick={() => setShow(false)}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: EASE } }}
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-bg"
          aria-label="Workflow OS startet"
          role="status"
        >
          {/* radial power-on bloom */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.55] }}
            transition={{ duration: 0.9, times: [0, 0.35, 1], ease: EASE }}
            style={{
              background:
                'radial-gradient(620px 420px at 50% 46%, var(--color-primary-soft), transparent 70%)',
            }}
          />

          {/* single scanline sweeping down */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 h-24"
            style={{
              background:
                'linear-gradient(180deg, transparent, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent)',
            }}
            initial={{ top: '-12%', opacity: 0 }}
            animate={{ top: '112%', opacity: [0, 1, 0] }}
            transition={{ delay: 0.18, duration: 0.85, ease: EASE }}
          />

          {/* CRT-style vertical open, then the mark pops in */}
          <motion.div
            className="relative flex flex-col items-center gap-4"
            initial={{ scaleY: 0.04, opacity: 0.4 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.16, type: 'spring', stiffness: 260, damping: 20 }}
              style={{ filter: 'drop-shadow(0 0 18px var(--color-primary-soft))' }}
            >
              <BrandMark size={64} />
            </motion.div>

            <div className="text-center">
              <p className="text-lg font-semibold tracking-tight text-content">Workflow OS</p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.2em] text-content-faint"
              >
                System wird gestartet
              </motion.p>
            </div>

            <motion.span
              aria-hidden="true"
              className="h-[2px] w-44 rounded-full bg-gradient-to-r from-primary via-secondary to-transparent"
              style={{ transformOrigin: 'left' }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.24, duration: 0.65, ease: EASE }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
