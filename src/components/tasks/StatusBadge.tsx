import type { TaskStatus } from '@/lib/tasks/taskTypes';
import { STATUS_META } from '@/lib/tasks/taskTypes';
import { cn } from '@/lib/utils/cn';

export interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[11px] font-medium',
        className,
      )}
      style={{ color: meta.color, borderColor: `${meta.color}30`, backgroundColor: `${meta.color}10` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.label}
    </span>
  );
}
