import type { CalendarItem } from '@/lib/calendar/calendarTypes';
import { formatTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/Icon';

export interface CalendarItemChipProps {
  item: CalendarItem;
  variant?: 'cell' | 'panel';
  onClick?: (item: CalendarItem) => void;
}

export function CalendarItemChip({ item, variant = 'cell', onClick }: CalendarItemChipProps) {
  const time = item.allDay ? null : formatTime(item.start);
  const isTask = item.kind === 'task';

  if (variant === 'panel') {
    return (
      <button
        type="button"
        onClick={() => onClick?.(item)}
        className={cn(
          'group flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2 text-left',
          'transition-colors hover:border-border-strong hover:bg-surface-hover',
        )}
      >
        <span className="w-16 shrink-0 text-[12px] tabular-nums text-content-muted">
          {item.allDay ? 'Ganztägig' : time}
        </span>
        <span className="h-8 w-1 shrink-0 rounded-full" style={{ backgroundColor: item.colorHex }} />
        <span className="flex min-w-0 flex-1 items-center gap-1.5">
          {isTask && <Icon name="tasks" size={13} className="shrink-0 text-content-faint" />}
          <span
            className={cn(
              'truncate text-[13px] text-content',
              item.done && 'text-content-faint line-through',
            )}
          >
            {item.title}
          </span>
        </span>
        <Icon
          name={isTask ? 'arrowRight' : 'chevronRight'}
          size={14}
          className="shrink-0 text-content-faint opacity-0 transition-opacity group-hover:opacity-100"
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(item);
      }}
      title={item.title}
      className={cn(
        'flex w-full items-center gap-1.5 rounded-md bg-surface-elevated px-1.5 py-0.5 text-left',
        'transition-colors hover:bg-surface-hover',
      )}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: item.colorHex }} />
      {time && <span className="shrink-0 text-[10px] tabular-nums text-content-faint">{time}</span>}
      <span
        className={cn('truncate text-[11px] text-content', item.done && 'text-content-faint line-through')}
      >
        {item.title}
      </span>
    </button>
  );
}
