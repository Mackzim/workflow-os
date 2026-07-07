/**
 * Calendar Sync Engine
 * --------------------
 * Same bridge pattern as the task sync engine, for the calendar store:
 * write-through on local mutations, initial load + first-run migration, and
 * realtime from other devices applied without re-pushing.
 */

import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { fetchEvents, upsertEvent, deleteEventRow, bulkUpsertEvents } from './eventRepository';
import { rowToEvent, type EventRow } from './eventMapping';
import { useCalendarStore } from '@/store/useCalendarStore';

let channel: RealtimeChannel | null = null;
let activeUserId: string | null = null;

function logErr(scope: string, e: unknown) {
  if (import.meta.env.DEV) console.warn(`[calendar-sync:${scope}]`, e);
}

export async function startCalendarSync(userId: string): Promise<void> {
  if (!supabase || activeUserId === userId) return;
  activeUserId = userId;

  const store = useCalendarStore.getState();

  // 1. Write-through: store mutations mirror to Supabase (fire-and-forget).
  store.setSyncHandler({
    onCreate: (e) => void upsertEvent(e, userId).catch((err) => logErr('create', err)),
    onUpdate: (e) => void upsertEvent(e, userId).catch((err) => logErr('update', err)),
    onDelete: (id) => void deleteEventRow(id).catch((err) => logErr('delete', err)),
  });

  // 2. Initial load + first-run migration.
  try {
    const cloud = await fetchEvents();
    if (cloud.length > 0) {
      store.hydrate(cloud);
    } else {
      const local = useCalendarStore.getState().events;
      if (local.length > 0) await bulkUpsertEvents(local, userId);
    }
  } catch (e) {
    logErr('load', e);
  }

  // 3. Realtime from other devices -> apply locally without re-pushing.
  channel = supabase
    .channel('events-sync')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'events', filter: `user_id=eq.${userId}` },
      (payload) => {
        const s = useCalendarStore.getState();
        if (payload.eventType === 'DELETE') {
          s.applyRemoteDelete((payload.old as { id: string }).id);
        } else {
          s.applyRemoteUpsert(rowToEvent(payload.new as EventRow));
        }
      },
    )
    .subscribe();
}

export function stopCalendarSync(): void {
  if (channel && supabase) supabase.removeChannel(channel);
  channel = null;
  activeUserId = null;
  const store = useCalendarStore.getState();
  store.setSyncHandler(null);
  store.clearAll();
}
