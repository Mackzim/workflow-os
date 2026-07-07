import { useMemo } from 'react';
import type { CalendarItem } from '@/lib/calendar/calendarTypes';
import {
  WEEKDAYS_SHORT,
  buildMonthMatrix,
  dayKey,
  isSameDay,
  isSameMonth,
  isToday,
} from '@/lib/calendar/calendarUtils';
import { cn } from '@/lib/utils/cn';
import { CalendarItemChip } from './CalendarItemChip';

export interface MonthGridProps {
  cursor: Date;
  selected: Date;
  itemsForDay: (day: Date) => CalendarItem[];
  onSelectDay: (day: Date) => void;
  onOpenItem: (item: CalendarItem) => void;
}

const MAX_CHIPS = 3;

export function MonthGrid({ cursor, selected, itemsForDay, onSelectDay, onOpenItem }: MonthGridProps) {
  const days = useMemo(() => buildMonthMatrix(cursor), [cursor]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-border bg-surface-elevated/50">
        {WEEKDAYS_SHORT.map((w) => (
          <div key={w} className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-content-faint">
            {w}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const items = itemsForDay(day);
          const inMonth = isSameMonth(day, cursor);
          const today = isToday(day);
          const isSelected = isSameDay(day, selected);
          const extra = items.length - MAX_CHIPS;

          return (
            <div
              key={dayKey(day)}
              role="button"
              tabIndex={0}
              onClick={() => onSelectDay(day)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectDay(day);
                }
              }}
              className={cn(
                'flex min-h-[92px] cursor-pointer flex-col gap-1 border-b border-r border-border/70 p-1.5 text-left align-top last:border-r-0 sm:min-h-[116px]',
                'transition-colors hover:bg-surface-hover/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset',
                !inMonth && 'bg-bg-soft/40',
                isSelected && 'bg-primary-soft',
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center self-start rounded-full text-[12px] font-medium',
                  today ? 'bg-primary text-white' : inMonth ? 'text-content' : 'text-content-faint',
                )}
              >
                {day.getDate()}
              </span>

              <div className="flex min-h-0 flex-1 flex-col gap-0.5">
                {items.slice(0, MAX_CHIPS).map((item) => (
                  <CalendarItemChip key={item.key} item={item} onClick={onOpenItem} />
                ))}
                {extra > 0 && (
                  <span className="px-1 text-[10px] font-medium text-content-faint">+{extra} mehr</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
