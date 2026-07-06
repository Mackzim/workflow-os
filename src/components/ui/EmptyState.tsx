import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { cn } from '@/lib/utils/cn';

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ icon = 'sparkle', title, description, action, className, compact }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-8 px-4' : 'py-14 px-6',
        className,
      )}
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-elevated text-content-faint">
        <Icon name={icon} size={20} />
      </div>
      <p className="text-sm font-medium text-content">{title}</p>
      {description && <p className="mt-1 max-w-xs text-[13px] text-content-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
