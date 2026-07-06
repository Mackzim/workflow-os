/** Mapping between the Task domain model (camelCase) and the Postgres row (snake_case). */

import type { Priority, Task, TaskStatus } from '@/lib/tasks/taskTypes';

export interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  priority: number;
  status: string;
  due_date: string | null;
  category: string | null;
  project_id: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export function rowToTask(r: TaskRow): Task {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? '',
    priority: r.priority as Priority,
    status: r.status as TaskStatus,
    dueDate: r.due_date ?? undefined,
    category: r.category ?? undefined,
    projectId: r.project_id ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    completedAt: r.completed_at ?? undefined,
  };
}

/** Row payload for insert/upsert. `user_id` is required by RLS. */
export function taskToRow(t: Task, userId: string): Omit<TaskRow, never> {
  return {
    id: t.id,
    user_id: userId,
    title: t.title,
    description: t.description,
    priority: t.priority,
    status: t.status,
    due_date: t.dueDate ?? null,
    category: t.category ?? null,
    project_id: t.projectId ?? null,
    created_at: t.createdAt,
    updated_at: t.updatedAt,
    completed_at: t.completedAt ?? null,
  };
}
