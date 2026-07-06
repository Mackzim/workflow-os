/**
 * Task domain model – the only fully-built entity in v0.1.0.
 * Kept framework-agnostic on purpose: no React, no store imports here,
 * so it can later be reused by an MCP server or a backend validator.
 */

/** 1 = low … 5 = critical */
export type Priority = 1 | 2 | 3 | 4 | 5;

export type TaskStatus = 'open' | 'in_progress' | 'paused' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  /** ISO date string (yyyy-mm-dd) or ISO datetime; optional. */
  dueDate?: string;
  category?: string;
  /** Prepared for the future Projects module – unused in the UI for now. */
  projectId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

/** Fields a user (or Claude) provides when creating a task. */
export interface TaskDraft {
  title: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: string;
  category?: string;
  projectId?: string;
}

/** Partial patch for updates – id is required, everything else optional. */
export type TaskPatch = Partial<Omit<Task, 'id' | 'createdAt'>>;

/* ---------- Presentation metadata (single source of truth) ---------- */

export interface PriorityMeta {
  value: Priority;
  label: string;
  short: string;
  /** CSS variable reference so colors live in globals.css. */
  color: string;
}

export const PRIORITY_META: Record<Priority, PriorityMeta> = {
  1: { value: 1, label: 'Niedrig', short: 'P1', color: 'var(--prio-1)' },
  2: { value: 2, label: 'Leicht wichtig', short: 'P2', color: 'var(--prio-2)' },
  3: { value: 3, label: 'Mittel', short: 'P3', color: 'var(--prio-3)' },
  4: { value: 4, label: 'Wichtig', short: 'P4', color: 'var(--prio-4)' },
  5: { value: 5, label: 'Kritisch', short: 'P5', color: 'var(--prio-5)' },
};

export const PRIORITIES: Priority[] = [1, 2, 3, 4, 5];

export interface StatusMeta {
  value: TaskStatus;
  label: string;
  color: string;
  /** Order used when sorting a board/list by workflow stage. */
  order: number;
}

export const STATUS_META: Record<TaskStatus, StatusMeta> = {
  open: { value: 'open', label: 'Offen', color: 'var(--color-text-muted)', order: 0 },
  in_progress: { value: 'in_progress', label: 'In Arbeit', color: 'var(--color-primary)', order: 1 },
  paused: { value: 'paused', label: 'Pausiert', color: 'var(--color-warning)', order: 2 },
  done: { value: 'done', label: 'Erledigt', color: 'var(--color-success)', order: 3 },
};

export const STATUSES: TaskStatus[] = ['open', 'in_progress', 'paused', 'done'];

/** Statuses that count as "not yet finished". */
export const ACTIVE_STATUSES: TaskStatus[] = ['open', 'in_progress', 'paused'];
