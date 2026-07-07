/**
 * Pure calendar logic – event creation/patching, month-grid math, and the
 * merge of native events with derived task deadlines. No React, no storage.
 */

import type { Task } from '@/lib/tasks/taskTypes';
import { newId } from '@/lib/tasks/taskUtils';
import type { CalendarEvent, CalendarItem, EventDraft, EventPatch } from './calendarTypes';
import { EVENT_COLORS } from './calendarTypes';

function nowISO(): string {
  return new Date().toISOString();
}

function defaultEnd(startISO: string, allDay: boolean): string {
  const d = new Date(startISO);
  if (allDay) {
    const e = new Date(d);
    e.setHours(23, 59, 0, 0);
    return e.toISOString();
  }
  return new Date(d.getTime() + 60 * 60 * 1000).toISOString();
}

/** Build a fully-formed event from a (possibly partial) draft. */
export function createEvent(draft: EventDraft): CalendarEvent {
  const ts = nowISO();
  const allDay = draft.allDay ?? false;
  const start = draft.start;
  const end = draft.end && new Date(draft.end) >= new Date(start) ? draft.end : defaultEnd(start, allDay);
  return {
    id: newId(),
    title: draft.title.trim(),
    description: draft.description?.trim() || undefined,
    start,
    end,
    allDay,
    taskId: draft.taskId || undefined,
    projectId: draft.projectId || undefined,
    color: draft.color ?? 'blue',
    source: draft.source ?? 'native',
    externalId: draft.externalId,
    externalCalendarId: draft.externalCalendarId,
    createdAt: ts,
    updatedAt: ts,
  };
}

export function applyEventPatch(event: CalendarEvent, patch: EventPatch): CalendarEvent {
  return { ...event, ...patch, updatedAt: nowISO() };
}

/* ---------- Date helpers ---------- */

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
/** First day of the month `n` months from `d`. */
export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
export function isToday(d: Date, ref: Date = new Date()): boolean {
  return isSameDay(d, ref);
}
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const WEEKDAYS_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export function monthTitle(d: Date): string {
  return d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
}

export function dayTitle(d: Date): string {
  return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
}

/** 42 days (6 weeks) covering the month of `cursor`, starting on Monday. */
export function buildMonthMatrix(cursor: Date): Date[] {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const weekdayMon0 = (first.getDay() + 6) % 7; // Mon=0 … Sun=6
  const start = addDays(first, -weekdayMon0);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

/* ---------- Event ⇄ item merge with task deadlines ---------- */

function eventToItem(ev: CalendarEvent): CalendarItem {
  return {
    key: `e_${ev.id}`,
    kind: 'event',
    title: ev.title,
    start: ev.start,
    end: ev.end,
    allDay: ev.allDay,
    colorHex: EVENT_COLORS[ev.color].hex,
    eventId: ev.id,
    taskId: ev.taskId,
  };
}

function taskToItem(t: Task): CalendarItem {
  return {
    key: `t_${t.id}`,
    kind: 'task',
    title: t.title,
    start: t.dueDate as string,
    allDay: true,
    colorHex: `var(--prio-${t.priority})`,
    done: t.status === 'done',
    taskId: t.id,
  };
}

/** True if `ev` spans the given day (multi-day events show on each day). */
export function eventOnDay(ev: CalendarEvent, day: Date): boolean {
  const s = startOfDay(new Date(ev.start)).getTime();
  const e = startOfDay(new Date(ev.end)).getTime();
  const d = startOfDay(day).getTime();
  return d >= s && d <= e;
}

/** True if the event covers more than one calendar day (rendered as a bar). */
export function isMultiDayEvent(ev: CalendarEvent): boolean {
  return startOfDay(new Date(ev.end)).getTime() > startOfDay(new Date(ev.start)).getTime();
}

/**
 * Day view: all-day/tasks first, then timed events by start.
 * `excludeMultiDay` skips events that span multiple days — the month grid draws
 * those as continuous bars instead of a chip per day.
 */
export function collectDayItems(
  events: CalendarEvent[],
  tasks: Task[],
  day: Date,
  includeDoneTasks = false,
  excludeMultiDay = false,
): CalendarItem[] {
  const items: CalendarItem[] = [];
  for (const ev of events) {
    if (!eventOnDay(ev, day)) continue;
    if (excludeMultiDay && isMultiDayEvent(ev)) continue;
    items.push(eventToItem(ev));
  }
  for (const t of tasks) {
    if (!t.dueDate || !isSameDay(new Date(t.dueDate), day)) continue;
    if (t.status === 'done' && !includeDoneTasks) continue;
    items.push(taskToItem(t));
  }
  return items.sort((a, b) => {
    if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
}

/** Chronological upcoming feed from `from` onward (open task deadlines only). */
export function collectUpcoming(
  events: CalendarEvent[],
  tasks: Task[],
  from: Date,
  limit = 8,
): CalendarItem[] {
  const fromT = startOfDay(from).getTime();
  const items: CalendarItem[] = [];
  for (const ev of events) {
    if (startOfDay(new Date(ev.end)).getTime() >= fromT) items.push(eventToItem(ev));
  }
  for (const t of tasks) {
    if (t.dueDate && t.status !== 'done' && startOfDay(new Date(t.dueDate)).getTime() >= fromT) {
      items.push(taskToItem(t));
    }
  }
  return items.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()).slice(0, limit);
}
