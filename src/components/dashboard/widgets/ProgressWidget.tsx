import { motion, useReducedMotion } from 'framer-motion';
import { useTasks } from '@/hooks/useTasks';
import { EASE } from '@/lib/motion/motionPresets';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { WidgetShell } from './WidgetShell';

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-2.5 py-1.5">
      <span className="block text-lg font-semibold leading-none" style={{ color }}>
        <AnimatedNumber value={value} />
      </span>
      <p className="mt-1 text-[10px] uppercase tracking-wide text-content-faint">{label}</p>
    </div>
  );
}

export function ProgressWidget() {
  const { metrics } = useTasks();
  const reduced = useReducedMotion();

  const done = metrics.completedToday;
  const total = metrics.todayScopeTotal;
  const pct = metrics.todayProgress;

  const caption =
    total === 0
      ? 'Nichts für heute geplant.'
      : pct >= 100
        ? 'Alles erledigt – stark.'
        : `Noch ${total - done} offen.`;

  return (
    <WidgetShell title="Fortschritt heute" icon="check">
      <div className="flex h-full flex-col justify-center gap-3.5">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-content">
              <AnimatedNumber value={done} />
            </span>
            <span className="text-[13px] text-content-muted">von {total} erledigt</span>
            <span className="ml-auto text-[13px] font-semibold text-primary">
              <AnimatedNumber value={pct} suffix="%" />
            </span>
          </div>

          <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-surface-elevated">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
              style={{ boxShadow: '0 0 12px -2px var(--color-primary)' }}
              initial={reduced ? false : { width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: EASE }}
            />
          </div>

          <p className="mt-2 text-[11px] text-content-faint">{caption}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat label="Aktiv" value={metrics.active} color="var(--color-text)" />
          <Stat label="Wichtig" value={metrics.highPriority} color="var(--color-warning)" />
          <Stat label="Überfällig" value={metrics.overdue} color="var(--color-critical)" />
        </div>
      </div>
    </WidgetShell>
  );
}
