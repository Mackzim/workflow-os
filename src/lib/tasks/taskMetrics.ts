/**
 * Dashboard metrics derived from the task list. Pure & memo-friendly.
 */

import type { Task } from './taskTypes';
import { ACTIVE_STATUSES } from './taskTypes';
import { isDueToday, isOverdue } from './taskUtils';

export interface DashboardMetrics {
  total: number;
  open: number;
  inProgress: number;
  paused: number;
  done: number;
  active: number;
  highPriority: number; // priority >= 4 and not done
  dueToday: number;
  overdue: number;
  /** 0..100 – share of today's relevant tasks already done. */
  todayProgress: number;
  completedToday: number;
  todayScopeTotal: number;
}

function completedToday(task: Task, ref: Date): boolean {
  if (task.status !== 'done' || !task.completedAt) return false;
  const c = new Date(task.completedAt);
  return (
    c.getFullYear() === ref.getFullYear() &&
    c.getMonth() === ref.getMonth() &&
    c.getDate() === ref.getDate()
  );
}

export function computeMetrics(tasks: Task[], ref: Date = new Date()): DashboardMetrics {
  let open = 0;
  let inProgress = 0;
  let paused = 0;
  let done = 0;
  let highPriority = 0;
  let dueToday = 0;
  let overdue = 0;
  let completedTodayCount = 0;

  for (const t of tasks) {
    switch (t.status) {
      case 'open':
        open++;
        break;
      case 'in_progress':
        inProgress++;
        break;
      case 'paused':
        paused++;
        break;
      case 'done':
        done++;
        break;
    }
    if (t.priority >= 4 && t.status !== 'done') highPriority++;
    if (isDueToday(t, ref)) dueToday++;
    if (isOverdue(t, ref)) overdue++;
    if (completedToday(t, ref)) completedTodayCount++;
  }

  const active = open + inProgress + paused;

  // "Today's scope" = tasks due today/overdue + those completed today.
  const dueScope = tasks.filter(
    (t) => isDueToday(t, ref) || isOverdue(t, ref) || completedToday(t, ref),
  );
  const todayScopeTotal = dueScope.length;
  const todayDone = dueScope.filter((t) => t.status === 'done').length;
  const todayProgress = todayScopeTotal === 0 ? 0 : Math.round((todayDone / todayScopeTotal) * 100);

  return {
    total: tasks.length,
    open,
    inProgress,
    paused,
    done,
    active,
    highPriority,
    dueToday,
    overdue,
    todayProgress,
    completedToday: completedTodayCount,
    todayScopeTotal,
  };
}

export const ACTIVE_STATUS_SET = new Set(ACTIVE_STATUSES);
