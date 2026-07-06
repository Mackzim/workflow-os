import { motion } from 'framer-motion';
import type { CommandOutcome, OutcomeStatus } from '@/lib/command/commandTypes';
import { COMMAND_HELP } from '@/lib/command/commandParser';
import { cardEntrance } from '@/lib/motion/motionPresets';
import { cn } from '@/lib/utils/cn';
import { formatTime } from '@/lib/utils/format';
import { Icon, type IconName } from '@/components/ui/Icon';
import { PriorityBadge } from '@/components/tasks/PriorityBadge';

const STATUS_STYLE: Record<OutcomeStatus, { icon: IconName; color: string }> = {
  success: { icon: 'check', color: 'var(--color-success)' },
  error: { icon: 'alert', color: 'var(--color-critical)' },
  info: { icon: 'info', color: 'var(--color-primary)' },
  help: { icon: 'sparkle', color: 'var(--color-secondary)' },
};

export function CommandResult({ outcome }: { outcome: CommandOutcome }) {
  const style = STATUS_STYLE[outcome.status];

  return (
    <motion.div variants={cardEntrance} initial="initial" animate="animate" className="rounded-xl border border-border bg-surface px-3.5 py-2.5">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5" style={{ color: style.color }}>
          <Icon name={style.icon} size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-mono text-[12px] text-content-faint">
              <span className="text-content-muted">{'> '}</span>
              {outcome.input || '—'}
            </p>
            <span className="shrink-0 text-[10px] text-content-faint">{formatTime(outcome.timestamp)}</span>
          </div>
          <p className={cn('mt-1 text-[13px]', outcome.status === 'error' ? 'text-critical' : 'text-content')}>
            {outcome.message}
          </p>

          {outcome.notImplemented && (
            <p className="mt-1 text-[11px] italic text-content-faint">
              Diese Action ist vorbereitet, aber noch nicht aktiv.
            </p>
          )}

          {outcome.status === 'help' && (
            <ul className="mt-2 space-y-1.5">
              {COMMAND_HELP.map((h) => (
                <li key={h.command} className="text-[12px]">
                  <code className="rounded bg-bg-soft px-1.5 py-0.5 font-mono text-primary">{h.command}</code>
                  <span className="ml-2 text-content-muted">{h.description}</span>
                </li>
              ))}
            </ul>
          )}

          {outcome.tasks && outcome.tasks.length > 0 && (
            <ul className="mt-2 space-y-1">
              {outcome.tasks.slice(0, 6).map((t) => (
                <li key={t.id} className="flex items-center gap-2 text-[12px] text-content-muted">
                  <PriorityBadge priority={t.priority} />
                  <span className="truncate">{t.title}</span>
                </li>
              ))}
              {outcome.tasks.length > 6 && (
                <li className="text-[11px] text-content-faint">+{outcome.tasks.length - 6} weitere</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}
