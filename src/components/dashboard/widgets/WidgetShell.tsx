import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { WidgetSize } from '@/lib/widgets/widgetTypes';
import { cardEntrance } from '@/lib/motion/motionPresets';
import { cn } from '@/lib/utils/cn';
import { Icon, type IconName } from '@/components/ui/Icon';

const SPAN: Record<WidgetSize, string> = {
  sm: 'sm:col-span-1 lg:col-span-1',
  md: 'sm:col-span-2 lg:col-span-2',
  lg: 'sm:col-span-2 lg:col-span-4',
};

export interface WidgetShellProps {
  title: string;
  icon?: IconName;
  size: WidgetSize;
  subtitle?: string;
  /** Optional "see all" navigation target. */
  to?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  muted?: boolean;
}

export function WidgetShell({ title, icon, size, subtitle, to, headerRight, children, muted }: WidgetShellProps) {
  const reduced = useReducedMotion();

  return (
    <motion.section variants={cardEntrance} className={cn('min-w-0', SPAN[size])}>
      <motion.div
        whileHover={reduced ? undefined : { y: -3 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'flex h-full flex-col rounded-2xl border border-border shadow-card edge-light',
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
            {to && (
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
        <div className="flex-1 px-4 pb-4">{children}</div>
      </motion.div>
    </motion.section>
  );
}
