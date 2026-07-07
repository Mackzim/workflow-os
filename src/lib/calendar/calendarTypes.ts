/**
 * Calendar domain model.
 * The calendar is a first-class citizen of the ecosystem: events live natively
 * (Supabase-ready) and link into the task graph via `taskId`. External calendars
 * (Google/Outlook/CalDAV) are a later sync layer — the `source`/`external*`
 * fields are reserved now so that plugs in without a refactor.
 */

export type EventColor = 'blue' | 'teal' | 'green' | 'amber' | 'red' | 'purple' | 'pink';

export interface EventColorMeta {
  label: string;
  hex: string;
}

export const EVENT_COLORS: Record<EventColor, EventColorMeta> = {
  blue: { label: 'Blau', hex: '#4c8dff' },
  teal: { label: 'Türkis', hex: '#22d3ee' },
  green: { label: 'Grün', hex: '#34d399' },
  amber: { label: 'Amber', hex: '#f5b056' },
  red: { label: 'Rot', hex: '#fb6e6e' },
  purple: { label: 'Violett', hex: '#a78bfa' },
  pink: { label: 'Pink', hex: '#f472b6' },
};

export const EVENT_COLOR_KEYS = Object.keys(EVENT_COLORS) as EventColor[];

/** Where an event originates. Only 'native' is writable in v1. */
export type EventSource = 'native' | 'google' | 'outlook' | 'ics';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  /** ISO datetime. For all-day events the time part is start-of-day. */
  start: string;
  /** ISO datetime (>= start). */
  end: string;
  allDay: boolean;
  /** Time-blocking link into the task graph. */
  taskId?: string;
  projectId?: string;
  color: EventColor;
  /** --- sync-ready fields (external calendars land here later) --- */
  source: EventSource;
  externalId?: string;
  externalCalendarId?: string;
  createdAt: string;
  updatedAt: string;
}

/** Fields a user (or Claude) provides when creating an event. */
export interface EventDraft {
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  taskId?: string;
  projectId?: string;
  color?: EventColor;
  description?: string;
  source?: EventSource;
  externalId?: string;
  externalCalendarId?: string;
}

export type EventPatch = Partial<Omit<CalendarEvent, 'id' | 'createdAt'>>;

/**
 * Unified render model for the calendar surface: either a native event or a
 * derived task deadline (tasks with a dueDate show up automatically — no
 * duplication, they are not stored as events).
 */
export interface CalendarItem {
  key: string;
  kind: 'event' | 'task';
  title: string;
  /** ISO datetime used for sorting + time label. */
  start: string;
  end?: string;
  allDay: boolean;
  /** Resolved color: hex for events, a `var(--prio-N)` for task deadlines. */
  colorHex: string;
  /** Task-only: completed deadlines render struck-through. */
  done?: boolean;
  eventId?: string;
  taskId?: string;
}
