import type { CalendarItem } from '@/lib/calendar/calendarTypes';
import { dayTitle, isToday } from '@/lib/calendar/calendarUtils';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { CalendarItemChip } from './CalendarItemChip';

export interface DayPanelProps {
  day: Date;
  items: CalendarItem[];
  onCreate: () => void;
  onOpenItem: (item: CalendarItem) => void;
}

export function DayPanel({ day, items, onCreate, onOpenItem }: DayPanelProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-4 shadow-card">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-content-faint">
            {isToday(day) ? 'Heute' : 'Ausgewählt'}
          </p>
          <h3 className="text-sm font-semibold text-content">{dayTitle(day)}</h3>
        </div>
        <Button size="sm" variant="subtle" leftIcon={<Icon name="plus" size={15} />} onClick={onCreate}>
          Termin
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-elevated text-content-faint">
            <Icon name="calendar" size={18} />
          </span>
          <p className="text-[13px] text-content-muted">Keine Termine an diesem Tag.</p>
          <button type="button" onClick={onCreate} className="text-[12px] text-primary hover:underline">
            Termin hinzufügen
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 overflow-y-auto">
          {items.map((item) => (
            <CalendarItemChip key={item.key} item={item} variant="panel" onClick={onOpenItem} />
          ))}
        </div>
      )}
    </div>
  );
}
