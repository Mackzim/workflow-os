import { useEffect, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '@/lib/motion/motionPresets';
import { cn } from '@/lib/utils/cn';
import { useProfile } from '@/hooks/useProfile';

function greeting(ref = new Date()): string {
  const h = ref.getHours();
  if (h < 5) return 'Gute Nacht';
  if (h < 11) return 'Guten Morgen';
  if (h < 18) return 'Guten Tag';
  return 'Guten Abend';
}

function useClock(): { date: string; time: string } {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return {
    date: now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }),
    time: now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

export interface DashboardHeaderProps {
  actions?: ReactNode;
  editing?: boolean;
}

/**
 * Glass-cyber greeting panel for the dashboard: translucent surface, a thin
 * brand accent line that draws in on mount, live clock. Kept tasteful — no neon.
 */
export function DashboardHeader({ actions, editing }: DashboardHeaderProps) {
  const reduced = useReducedMotion();
  const { date, time } = useClock();
  const { displayName } = useProfile();

  return (
    <motion.header
      initial={reduced ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={cn(
        'relative mb-6 overflow-hidden rounded-2xl border border-border-strong/70 bg-surface/60 px-5 py-4',
        'shadow-card backdrop-blur-md edge-light sm:px-6 sm:py-5',
      )}
    >
      {/* brand accent line, draws left→right on mount */}
      <motion.span
        aria-hidden="true"
        initial={reduced ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
        style={{ transformOrigin: 'left' }}
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary via-secondary to-transparent"
      />
      {/* soft top glow */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.07] via-transparent to-transparent"
      />

      <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.12 }}
            className="text-xl font-semibold tracking-tight text-content sm:text-2xl"
          >
            {greeting()}
            {displayName ? `, ${displayName}` : ''}
          </motion.h1>
          <motion.p
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.22 }}
            className="mt-1 text-[13px] text-content-muted"
          >
            {editing ? (
              <span className="text-primary">Ziehen zum Anordnen · Ecke ziehen für Größe</span>
            ) : (
              <>
                <span className="capitalize">{date}</span>
                <span className="mx-1.5 text-content-faint">·</span>
                <span className="font-mono tabular-nums text-content">{time}</span>
              </>
            )}
          </motion.p>
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </motion.header>
  );
}
