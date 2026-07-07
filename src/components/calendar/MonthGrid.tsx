import { useMemo } from 'react';
import type { CalendarEvent, CalendarItem } from '@/lib/calendar/calendarTypes';
import { EVENT_COLORS } from '@/lib/calendar/calendarTypes';
import {
  WEEKDAYS_SHORT,
  buildMonthMatrix,
  dayKey,
  isMultiDayEvent,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
} from '@/lib/calendar/calendarUtils';
import { cn } from '@/lib/utils/cn';
import { CalendarItemChip } from './CalendarItemChip';

export interface MonthGridProps {
  cursor: Date;
  selected: Date;
  events: CalendarEvent[];
  /** Single-day items for a day (multi-day events are drawn as bars). */
  dayChips: (day: Date) => CalendarItem[];
  onSelectDay: (day: Date) => void;
  onOpenItem: (item: CalendarItem) => void;
  onOpenEvent: (event: CalendarEvent) => void;
}

const MAX_CHIPS = 3;
const DAY_MS = 86_400_000;
const BAR_TOP = 30; // px from cell top to the first bar lane (below the day number)
const BAR_H = 18;
const BAR_GAP = 3;

interface PlacedBar {
  event: CalendarEvent;
  startCol: number;
  endCol: number;
  lane: number;
  roundLeft: boolean;
  roundRight: boolean;
}

/** Greedy lane packing of multi-day events overlapping one week. */
function packWeekBars(multiDay: CalendarEvent[], weekDays: Date[]): { bars: PlacedBar[]; lanes: number } {
  const weekStart = startOfDay(weekDays[0]).getTime();
  const weekEnd = startOfDay(weekDays[6]).getTime();

  const overlapping = multiDay
    .map((event) => {
      const s = startOfDay(new Date(event.start)).getTime();
      const e = startOfDay(new Date(event.end)).getTime();
      return { event, s, e };
    })
    .filter(({ s, e }) => s <= weekEnd && e >= weekStart)
    .sort((a, b) => a.s - b.s || b.e - a.e);

  const laneEnds: number[] = [];
  const bars: PlacedBar[] = [];

  for (const { event, s, e } of overlapping) {
    const startCol = Math.max(0, Math.round((s - weekStart) / DAY_MS));
    const endCol = Math.min(6, Math.round((e - weekStart) / DAY_MS));
    let lane = 0;
    while (laneEnds[lane] !== undefined && laneEnds[lane] >= startCol) lane++;
    laneEnds[lane] = endCol;
    bars.push({ event, startCol, endCol, lane, roundLeft: s >= weekStart, roundRight: e <= weekEnd });
  }

  return { bars, lanes: laneEnds.length };
}

export function MonthGrid({ cursor, selected, events, dayChips, onSelectDay, onOpenItem, onOpenEvent }: MonthGridProps) {
  const weeks = useMemo(() => {
    const days = buildMonthMatrix(cursor);
    return Array.from({ length: 6 }, (_, i) => days.slice(i * 7, i * 7 + 7));
  }, [cursor]);

  const multiDay = useMemo(() => events.filter(isMultiDayEvent), [events]);

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

      {/* Week rows */}
      {weeks.map((week, wi) => {
        const { bars, lanes } = packWeekBars(multiDay, week);
        const barsHeight = lanes > 0 ? lanes * (BAR_H + BAR_GAP) : 0;

        return (
          <div key={wi} className="relative grid grid-cols-7">
            {week.map((day) => {
              const chips = dayChips(day);
              const inMonth = isSameMonth(day, cursor);
              const today = isToday(day);
              const isSel = isSameDay(day, selected);
              const extra = chips.length - MAX_CHIPS;

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
                    'min-h-[110px] cursor-pointer border-b border-r border-border/70 p-1.5 last:border-r-0',
                    'transition-colors hover:bg-surface-hover/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset',
                    !inMonth && 'bg-bg-soft/40',
                    isSel && 'bg-primary-soft',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-medium',
                      today ? 'bg-primary text-white' : inMonth ? 'text-content' : 'text-content-faint',
                    )}
                  >
                    {day.getDate()}
                  </span>

                  {/* reserve space for the week's bar lanes so chips sit below */}
                  {barsHeight > 0 && <div style={{ height: barsHeight }} aria-hidden="true" />}

                  <div className="mt-1 flex flex-col gap-0.5">
                    {chips.slice(0, MAX_CHIPS).map((item) => (
                      <CalendarItemChip key={item.key} item={item} onClick={onOpenItem} />
                    ))}
                    {extra > 0 && <span className="px-1 text-[10px] font-medium text-content-faint">+{extra} mehr</span>}
                  </div>
                </div>
              );
            })}

            {/* multi-day bars overlaying this week */}
            <div className="pointer-events-none absolute inset-0">
              {bars.map(({ event, startCol, endCol, lane, roundLeft, roundRight }) => (
                <button
                  key={event.id}
                  type="button"
                  title={event.title}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEvent(event);
                  }}
                  className="pointer-events-auto absolute overflow-hidden whitespace-nowrap px-2 text-left text-[11px] font-medium leading-[18px] text-white"
                  style={{
                    top: BAR_TOP + lane * (BAR_H + BAR_GAP),
                    height: BAR_H,
                    left: `calc(${((startCol / 7) * 100).toFixed(4)}% + 4px)`,
                    width: `calc(${(((endCol - startCol + 1) / 7) * 100).toFixed(4)}% - 8px)`,
                    backgroundColor: EVENT_COLORS[event.color].hex,
                    borderTopLeftRadius: roundLeft ? 6 : 0,
                    borderBottomLeftRadius: roundLeft ? 6 : 0,
                    borderTopRightRadius: roundRight ? 6 : 0,
                    borderBottomRightRadius: roundRight ? 6 : 0,
                    textShadow: '0 1px 2px rgba(0,0,0,0.28)',
                  }}
                >
                  {event.title}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
