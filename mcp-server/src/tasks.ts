import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

export type TaskStatus = 'open' | 'in_progress' | 'paused' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: number;
  status: string;
  dueDate: string | null;
  category: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export const PRIORITY_LABEL: Record<number, string> = {
  1: 'niedrig',
  2: 'leicht wichtig',
  3: 'mittel',
  4: 'wichtig',
  5: 'kritisch',
};
export const STATUS_LABEL: Record<string, string> = {
  open: 'offen',
  in_progress: 'in Arbeit',
  paused: 'pausiert',
  done: 'erledigt',
};

const TABLE = 'tasks';

type Row = Record<string, unknown>;

function rowToTask(r: Row): Task {
  return {
    id: String(r.id),
    title: String(r.title ?? ''),
    description: String(r.description ?? ''),
    priority: Number(r.priority ?? 3),
    status: String(r.status ?? 'open'),
    dueDate: (r.due_date as string | null) ?? null,
    category: (r.category as string | null) ?? null,
    createdAt: String(r.created_at ?? ''),
    updatedAt: String(r.updated_at ?? ''),
    completedAt: (r.completed_at as string | null) ?? null,
  };
}

/* ---------- date helpers (due_date is YYYY-MM-DD) ---------- */
function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}
export function isDueToday(t: Task, ref = new Date()): boolean {
  if (!t.dueDate) return false;
  const d = new Date(t.dueDate);
  if (Number.isNaN(d.getTime())) return false;
  return startOfDay(d) === startOfDay(ref);
}
export function isOverdue(t: Task, ref = new Date()): boolean {
  if (!t.dueDate || t.status === 'done') return false;
  const d = new Date(t.dueDate);
  if (Number.isNaN(d.getTime())) return false;
  return startOfDay(d) < startOfDay(ref);
}

/* ---------- CRUD (all scoped to userId) ---------- */

export interface CreateInput {
  title: string;
  priority?: number;
  status?: TaskStatus;
  due_date?: string;
  category?: string;
  description?: string;
}

export async function createTask(sb: SupabaseClient, userId: string, input: CreateInput): Promise<Task> {
  const now = new Date().toISOString();
  const status: TaskStatus = input.status ?? 'open';
  const row = {
    id: randomUUID(),
    user_id: userId,
    title: input.title.trim(),
    description: input.description?.trim() ?? '',
    priority: input.priority ?? 3,
    status,
    due_date: input.due_date || null,
    category: input.category?.trim() || null,
    created_at: now,
    updated_at: now,
    completed_at: status === 'done' ? now : null,
  };
  const { data, error } = await sb.from(TABLE).insert(row).select().single();
  if (error) throw error;
  return rowToTask(data as Row);
}

export interface ListFilter {
  status?: TaskStatus;
  priority?: number;
  search?: string;
  limit?: number;
}

export async function listTasks(sb: SupabaseClient, userId: string, f: ListFilter = {}): Promise<Task[]> {
  let q = sb
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(f.limit ?? 100);
  if (f.status) q = q.eq('status', f.status);
  if (f.priority) q = q.eq('priority', f.priority);
  const { data, error } = await q;
  if (error) throw error;
  let rows = (data as Row[]).map(rowToTask);
  if (f.search) {
    const s = f.search.toLowerCase();
    rows = rows.filter((t) => `${t.title} ${t.description} ${t.category ?? ''}`.toLowerCase().includes(s));
  }
  return rows;
}

export async function getTask(sb: SupabaseClient, userId: string, id: string): Promise<Task | null> {
  const { data, error } = await sb.from(TABLE).select('*').eq('user_id', userId).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? rowToTask(data as Row) : null;
}

export interface UpdateInput {
  title?: string;
  description?: string;
  priority?: number;
  status?: TaskStatus;
  due_date?: string | null;
  category?: string | null;
}

export async function updateTask(
  sb: SupabaseClient,
  userId: string,
  id: string,
  patch: UpdateInput,
): Promise<Task | null> {
  const existing = await getTask(sb, userId, id);
  if (!existing) return null;

  const upd: Row = { updated_at: new Date().toISOString() };
  if (patch.title !== undefined) upd.title = patch.title.trim();
  if (patch.description !== undefined) upd.description = patch.description;
  if (patch.priority !== undefined) upd.priority = patch.priority;
  if (patch.category !== undefined) upd.category = patch.category;
  if (patch.due_date !== undefined) upd.due_date = patch.due_date;
  if (patch.status !== undefined) {
    upd.status = patch.status;
    upd.completed_at =
      patch.status === 'done'
        ? existing.status === 'done'
          ? existing.completedAt
          : new Date().toISOString()
        : null;
  }

  const { data, error } = await sb.from(TABLE).update(upd).eq('user_id', userId).eq('id', id).select().single();
  if (error) throw error;
  return rowToTask(data as Row);
}

export async function deleteTask(sb: SupabaseClient, userId: string, id: string): Promise<boolean> {
  const { error, count } = await sb.from(TABLE).delete({ count: 'exact' }).eq('user_id', userId).eq('id', id);
  if (error) throw error;
  return (count ?? 0) > 0;
}

export interface Summary {
  total: number;
  open: number;
  in_progress: number;
  paused: number;
  done: number;
  active: number;
  highPriority: number;
  dueToday: number;
  overdue: number;
}

export async function summarize(
  sb: SupabaseClient,
  userId: string,
): Promise<{ summary: Summary; today: Task[] }> {
  const all = await listTasks(sb, userId, { limit: 1000 });
  const summary: Summary = {
    total: all.length,
    open: all.filter((t) => t.status === 'open').length,
    in_progress: all.filter((t) => t.status === 'in_progress').length,
    paused: all.filter((t) => t.status === 'paused').length,
    done: all.filter((t) => t.status === 'done').length,
    active: all.filter((t) => t.status !== 'done').length,
    highPriority: all.filter((t) => t.priority >= 4 && t.status !== 'done').length,
    dueToday: all.filter((t) => isDueToday(t)).length,
    overdue: all.filter((t) => isOverdue(t)).length,
  };
  const today = all
    .filter((t) => t.status !== 'done' && (isDueToday(t) || isOverdue(t)))
    .sort((a, b) => b.priority - a.priority);
  return { summary, today };
}
