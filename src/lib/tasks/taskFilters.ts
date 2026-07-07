/**
 * Filtering, searching and sorting – pure functions over Task arrays.
 */

import type { Priority, Task, TaskStatus } from './taskTypes';
import { STATUS_META } from './taskTypes';
import { isDueToday, isOverdue } from './taskUtils';

export type SortKey = 'priority' | 'dueDate' | 'createdAt' | 'status';
export type SortDir = 'asc' | 'desc';

export interface TaskFilter {
  search: string;
  /** Selected statuses – empty array means "all". */
  status: TaskStatus[];
  /** Selected priorities – empty array means "all". */
  priority: Priority[];
  /** Quick scope presets for the dashboard / task page. */
  scope: 'all' | 'today' | 'overdue' | 'active';
}

export const DEFAULT_FILTER: TaskFilter = {
  search: '',
  status: [],
  priority: [],
  scope: 'all',
};

export interface SortConfig {
  key: SortKey;
  dir: SortDir;
}

export const DEFAULT_SORT: SortConfig = { key: 'priority', dir: 'desc' };

function matchesSearch(task: Task, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    task.title.toLowerCase().includes(needle) ||
    task.description.toLowerCase().includes(needle) ||
    (task.category?.toLowerCase().includes(needle) ?? false)
  );
}

function matchesScope(task: Task, scope: TaskFilter['scope']): boolean {
  switch (scope) {
    case 'today':
      return isDueToday(task) || isOverdue(task);
    case 'overdue':
      return isOverdue(task);
    case 'active':
      return task.status !== 'done';
    case 'all':
    default:
      return true;
  }
}

export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  return tasks.filter(
    (t) =>
      matchesSearch(t, filter.search) &&
      (filter.status.length === 0 || filter.status.includes(t.status)) &&
      (filter.priority.length === 0 || filter.priority.includes(t.priority)) &&
      matchesScope(t, filter.scope),
  );
}

export function sortTasks(tasks: Task[], sort: SortConfig): Task[] {
  const dir = sort.dir === 'asc' ? 1 : -1;
  const copy = [...tasks];

  copy.sort((a, b) => {
    let cmp = 0;
    switch (sort.key) {
      case 'priority':
        cmp = a.priority - b.priority;
        break;
      case 'status':
        cmp = STATUS_META[a.status].order - STATUS_META[b.status].order;
        break;
      case 'dueDate': {
        const av = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bv = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        cmp = av - bv;
        // For dueDate "asc" (soonest first) undefined should stay last regardless of dir.
        if (av === Infinity && bv === Infinity) cmp = 0;
        else if (av === Infinity) return 1;
        else if (bv === Infinity) return -1;
        break;
      }
      case 'createdAt':
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    // Tie-breaker: newer first for stability.
    if (cmp === 0) cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return cmp * dir;
  });

  return copy;
}

export function filterAndSort(tasks: Task[], filter: TaskFilter, sort: SortConfig): Task[] {
  return sortTasks(filterTasks(tasks, filter), sort);
}
