/**
 * Supabase task repository – all DB access for tasks lives here.
 * RLS scopes every query to the authenticated user automatically.
 */

import { supabase } from './supabaseClient';
import { rowToTask, taskToRow, type TaskRow } from './taskMapping';
import type { Task } from '@/lib/tasks/taskTypes';

export async function fetchTasks(): Promise<Task[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as TaskRow[]).map(rowToTask);
}

export async function upsertTask(task: Task, userId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('tasks').upsert(taskToRow(task, userId));
  if (error) throw error;
}

export async function deleteTaskRow(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

/** One-time migration helper: push existing local tasks to the cloud. */
export async function bulkUpsert(tasks: Task[], userId: string): Promise<void> {
  if (!supabase || tasks.length === 0) return;
  const { error } = await supabase.from('tasks').upsert(tasks.map((t) => taskToRow(t, userId)));
  if (error) throw error;
}
