/**
 * Sync Engine
 * -----------
 * Bridges the auth session <-> task store <-> Supabase.
 *
 * Flow when a user signs in:
 *  1. Register a write-through handler so local mutations push to the cloud.
 *  2. Initial load: pull cloud tasks. First-run migration: if the cloud is
 *     empty but there are local tasks, push them up (no data loss).
 *  3. Subscribe to realtime changes from other devices and apply them locally
 *     WITHOUT re-pushing (guards against feedback loops).
 */

import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { fetchTasks, upsertTask, deleteTaskRow, bulkUpsert } from './taskRepository';
import { rowToTask, type TaskRow } from './taskMapping';
import { useTaskStore } from '@/store/useTaskStore';

let channel: RealtimeChannel | null = null;
let activeUserId: string | null = null;

function logErr(scope: string, e: unknown) {
  if (import.meta.env.DEV) console.warn(`[sync:${scope}]`, e);
}

export async function startSync(userId: string): Promise<void> {
  if (!supabase || activeUserId === userId) return;
  activeUserId = userId;

  const store = useTaskStore.getState();

  // 1. Write-through: store mutations mirror to Supabase (fire-and-forget).
  store.setSyncHandler({
    onCreate: (t) => void upsertTask(t, userId).catch((e) => logErr('create', e)),
    onUpdate: (t) => void upsertTask(t, userId).catch((e) => logErr('update', e)),
    onDelete: (id) => void deleteTaskRow(id).catch((e) => logErr('delete', e)),
  });

  // 2. Initial load + first-run migration.
  try {
    const cloud = await fetchTasks();
    if (cloud.length > 0) {
      store.hydrate(cloud);
    } else {
      const local = useTaskStore.getState().tasks;
      if (local.length > 0) await bulkUpsert(local, userId);
    }
  } catch (e) {
    logErr('load', e);
  }

  // 3. Realtime from other devices -> apply locally without re-pushing.
  channel = supabase
    .channel('tasks-sync')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
      (payload) => {
        const s = useTaskStore.getState();
        if (payload.eventType === 'DELETE') {
          s.applyRemoteDelete((payload.old as { id: string }).id);
        } else {
          s.applyRemoteUpsert(rowToTask(payload.new as TaskRow));
        }
      },
    )
    .subscribe();
}

export function stopSync(): void {
  if (channel && supabase) supabase.removeChannel(channel);
  channel = null;
  activeUserId = null;
  const store = useTaskStore.getState();
  store.setSyncHandler(null);
  store.clearAll();
}
