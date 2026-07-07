import type { EventDraft } from './calendarTypes';

/** ISO datetime `offset` days from today at HH:mm local. */
function at(offsetDays: number, hh: number, mm = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}

/** All-day marker at start-of-day, `offset` days from today. */
function allDayAt(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Onboarding events seeded once on first launch (non-sync mode). Real, editable
 * events – not throwaway mocks.
 */
export const SAMPLE_EVENT_DRAFTS: EventDraft[] = [
  {
    title: 'Team-Sync',
    start: at(0, 10, 0),
    end: at(0, 10, 30),
    color: 'blue',
    description: 'Kurzes Daily mit dem Team.',
  },
  {
    title: 'Fokuszeit: Shop-Bug',
    start: at(0, 14, 0),
    end: at(0, 16, 0),
    color: 'purple',
    description: 'Ungestört am Checkout-Problem arbeiten.',
  },
  {
    title: 'Lieferanten-Call',
    start: at(1, 11, 0),
    end: at(1, 11, 45),
    color: 'green',
  },
  {
    title: 'Messe Nürnberg',
    start: allDayAt(3),
    end: allDayAt(4),
    allDay: true,
    color: 'amber',
    description: 'Spielwaren-Fachmesse, ganztägig.',
  },
  {
    title: 'Zahnarzt',
    start: at(5, 9, 0),
    end: at(5, 9, 30),
    color: 'teal',
  },
];
