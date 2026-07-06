import type { Priority } from '@/lib/tasks/taskTypes';
import { PRIORITY_META } from '@/lib/tasks/taskTypes';
import { cn } from '@/lib/utils/cn';

export interface PriorityBadgeProps {
  priority: Priority;
  showLabel?: boolean;
  className?: string;
}

export function PriorityBadge({ priority, showLabel = false, className }: PriorityBadgeProps) {
  const meta = PRIORITY_META[priority];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold',
        className,
      )}
      style={{ color: meta.color, borderColor: `${meta.color}33`, backgroundColor: `${meta.color}12` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {showLabel ? meta.label : meta.short}
    </span>
  );
}
