import { motion, useReducedMotion } from 'framer-motion';
import type { WidgetSize } from '@/lib/widgets/widgetTypes';
import { useTasks } from '@/hooks/useTasks';
import { EASE } from '@/lib/motion/motionPresets';
import { WidgetShell } from './WidgetShell';

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-2.5 py-1.5">
      <p className="text-lg font-semibold leading-none" style={{ color }}>
        {value}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-wide text-content-faint">{label}</p>
    </div>
  );
}

export function ProgressWidget({ size }: { size: WidgetSize }) {
  const { metrics } = useTasks();
  const reduced = useReducedMotion();

  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (metrics.todayProgress / 100) * c;

  return (
    <WidgetShell title="Progress Today" icon="check" size={size}>
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-surface-elevated)" strokeWidth="9" />
            <motion.circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={c}
              initial={reduced ? false : { strokeDashoffset: c }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.8, ease: EASE }}
              style={{ filter: 'drop-shadow(0 0 6px rgba(76,141,255,0.4))' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold text-content">{metrics.todayProgress}%</span>
            <span className="text-[10px] text-content-faint">
              {metrics.completedToday}/{metrics.todayScopeTotal || 0}
            </span>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-2">
          <Stat label="Aktiv" value={metrics.active} color="var(--color-text)" />
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Wichtig" value={metrics.highPriority} color="var(--color-warning)" />
            <Stat label="Überfällig" value={metrics.overdue} color="var(--color-critical)" />
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}
