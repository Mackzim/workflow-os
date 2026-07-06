/**
 * Pure task business logic – creation, updates, status/priority transitions.
 * No side effects, no storage, no React. Fully unit-testable.
 */

import type { Priority, Task, TaskDraft, TaskPatch, TaskStatus } from './taskTypes';

/** Stable unique id. crypto.randomUUID is available in all modern browsers. */
export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

function clampPriority(value: number | undefined): Priority {
  const n = Math.round(value ?? 3);
  return Math.min(5, Math.max(1, n)) as Priority;
}

/** Build a fully-formed Task from a (possibly partial) draft. */
export function createTask(draft: TaskDraft): Task {
  const ts = nowISO();
  const status: TaskStatus = draft.status ?? 'open';
  return {
    id: newId(),
    title: draft.title.trim(),
    description: draft.description?.trim() ?? '',
    priority: clampPriority(draft.priority),
    status,
    dueDate: draft.dueDate || undefined,
    category: draft.category?.trim() || undefined,
    projectId: draft.projectId || undefined,
    createdAt: ts,
    updatedAt: ts,
    completedAt: status === 'done' ? ts : undefined,
  };
}

/** Apply a patch immutably, keeping `updatedAt`/`completedAt` consistent. */
export function applyPatch(task: Task, patch: TaskPatch): Task {
  const next: Task = { ...task, ...patch, updatedAt: nowISO() };

  if (patch.priority !== undefined) next.priority = clampPriority(patch.priority);

  // Keep completedAt in sync with status transitions.
  if (patch.status !== undefined) {
    if (patch.status === 'done' && task.status !== 'done') {
      next.completedAt = nowISO();
    } else if (patch.status !== 'done') {
      next.completedAt = undefined;
    }
  }
  return next;
}

/** Toggle between done and open (used by the checkbox interaction). */
export function toggleDone(task: Task): Task {
  return applyPatch(task, { status: task.status === 'done' ? 'open' : 'done' });
}

export function isOverdue(task: Task, ref: Date = new Date()): boolean {
  if (!task.dueDate || task.status === 'done') return false;
  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) return false;
  // Compare on day granularity.
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const refDay = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  return dueDay.getTime() < refDay.getTime();
}

export function isDueToday(task: Task, ref: Date = new Date()): boolean {
  if (!task.dueDate) return false;
  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) return false;
  return (
    due.getFullYear() === ref.getFullYear() &&
    due.getMonth() === ref.getMonth() &&
    due.getDate() === ref.getDate()
  );
}
