import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cardEntrance } from '@/lib/motion/motionPresets';
import { cn } from '@/lib/utils/cn';
import { useWidgetStore } from '@/store/useWidgetStore';
import { Icon, type IconName } from '@/components/ui/Icon';

export interface WidgetShellProps {
  title: string;
  icon?: IconName;
  subtitle?: string;
  /** Optional "see all" navigation target. */
  to?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  muted?: boolean;
}

/**
 * Card chrome shared by every dashboard widget. Fills its grid cell (height and
 * width) so react-grid-layout controls the size; content scrolls if it overflows.
 */
export function WidgetShell({ title, icon, subtitle, to, headerRight, children, muted }: WidgetShellProps) {
  const reduced = useReducedMotion();
  const editing = useWidgetStore((s) => s.editing);
  const lift = !reduced && !editing;

  return (
    <motion.section variants={cardEntrance} initial="initial" animate="animate" className="h-full w-full min-w-0">
      <motion.div
        whileHover={lift ? { y: -3 } : undefined}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'flex h-full flex-col overflow-hidden rounded-2xl border border-border shadow-card edge-light',
          muted ? 'bg-surface/60' : 'bg-surface',
          'transition-colors duration-200 hover:border-border-strong',
        )}
      >
        <div className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2.5">
          <div className="flex min-w-0 items-center gap-2">
            {icon && (
              <span className={cn('text-content-faint', muted && 'opacity-70')}>
                <Icon name={icon} size={16} />
              </span>
            )}
            <div className="min-w-0">
              <h3 className="truncate text-[13px] font-semibold tracking-tight text-content">{title}</h3>
              {subtitle && <p className="truncate text-[11px] text-content-faint">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {headerRight}
            {to && !editing && (
              <Link
                to={to}
                className="flex items-center gap-0.5 rounded-md px-1.5 py-1 text-[11px] text-content-faint transition-colors hover:text-primary"
              >
                Alle
                <Icon name="chevronRight" size={14} />
              </Link>
            )}
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{children}</div>
      </motion.div>
    </motion.section>
  );
}
