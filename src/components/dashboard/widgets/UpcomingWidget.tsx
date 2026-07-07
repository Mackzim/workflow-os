import type { CalendarItem } from '@/lib/calendar/calendarTypes';
import { useCalendar } from '@/hooks/useCalendar';
import { formatDueDate, formatTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/Icon';
import { WidgetShell } from './WidgetShell';

function whenLabel(item: CalendarItem): string {
  const day = formatDueDate(item.start) ?? '';
  return item.allDay ? day : `${day} · ${formatTime(item.start)}`;
}

export function UpcomingWidget() {
  const { upcoming } = useCalendar();
  const items = upcoming(new Date(), 6);

  return (
    <WidgetShell title="Anstehend" icon="calendar" subtitle={`${items.length} in Kürze`} to="/calendar">
      {items.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-1 py-6 text-center">
          <Icon name="calendar" size={18} className="text-content-faint" />
          <p className="text-[13px] text-content-muted">Nichts Anstehendes.</p>
        </div>
      ) : (
        <ul className="space-y-0.5">
          {items.map((item) => (
            <li
              key={item.key}
              className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-surface-hover"
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.colorHex }} />
              <span className="flex min-w-0 flex-1 items-center gap-1.5">
                {item.kind === 'task' && <Icon name="tasks" size={12} className="shrink-0 text-content-faint" />}
                <span className={cn('truncate text-[13px] text-content')}>{item.title}</span>
              </span>
              <span className="shrink-0 text-[11px] tabular-nums text-content-faint">{whenLabel(item)}</span>
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  );
}
