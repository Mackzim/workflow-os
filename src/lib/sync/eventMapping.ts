/** Mapping between the CalendarEvent model (camelCase) and the Postgres row. */

import type { CalendarEvent, EventColor, EventSource } from '@/lib/calendar/calendarTypes';
import { EVENT_COLORS } from '@/lib/calendar/calendarTypes';

export interface EventRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  all_day: boolean;
  task_id: string | null;
  project_id: string | null;
  color: string;
  source: string;
  external_id: string | null;
  external_calendar_id: string | null;
  created_at: string;
  updated_at: string;
}

const isColor = (c: string): c is EventColor => c in EVENT_COLORS;

export function rowToEvent(r: EventRow): CalendarEvent {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? undefined,
    start: r.start_at,
    end: r.end_at,
    allDay: r.all_day,
    taskId: r.task_id ?? undefined,
    projectId: r.project_id ?? undefined,
    color: isColor(r.color) ? r.color : 'blue',
    source: (r.source as EventSource) || 'native',
    externalId: r.external_id ?? undefined,
    externalCalendarId: r.external_calendar_id ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function eventToRow(e: CalendarEvent, userId: string): EventRow {
  return {
    id: e.id,
    user_id: userId,
    title: e.title,
    description: e.description ?? null,
    start_at: e.start,
    end_at: e.end,
    all_day: e.allDay,
    task_id: e.taskId ?? null,
    project_id: e.projectId ?? null,
    color: e.color,
    source: e.source,
    external_id: e.externalId ?? null,
    external_calendar_id: e.externalCalendarId ?? null,
    created_at: e.createdAt,
    updated_at: e.updatedAt,
  };
}
