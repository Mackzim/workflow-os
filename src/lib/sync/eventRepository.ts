/**
 * Supabase calendar-event repository – all DB access for events lives here.
 * RLS scopes every query to the authenticated user automatically.
 */

import { supabase } from './supabaseClient';
import { rowToEvent, eventToRow, type EventRow } from './eventMapping';
import type { CalendarEvent } from '@/lib/calendar/calendarTypes';

export async function fetchEvents(): Promise<CalendarEvent[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('events').select('*').order('start_at', { ascending: true });
  if (error) throw error;
  return (data as EventRow[]).map(rowToEvent);
}

export async function upsertEvent(event: CalendarEvent, userId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('events').upsert(eventToRow(event, userId));
  if (error) throw error;
}

export async function deleteEventRow(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}

/** One-time migration helper: push existing local events to the cloud. */
export async function bulkUpsertEvents(events: CalendarEvent[], userId: string): Promise<void> {
  if (!supabase || events.length === 0) return;
  const { error } = await supabase.from('events').upsert(events.map((e) => eventToRow(e, userId)));
  if (error) throw error;
}
