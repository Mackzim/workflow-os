/**
 * Primary task hook – composes the store with derived (filtered/sorted) views
 * and dashboard metrics. Components should use this rather than the raw store.
 */

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTaskStore } from '@/store/useTaskStore';
import { filterAndSort } from '@/lib/tasks/taskFilters';
import { computeMetrics } from '@/lib/tasks/taskMetrics';

export function useTasks() {
  const tasks = useTaskStore((s) => s.tasks);
  const filter = useTaskStore((s) => s.filter);
  const sort = useTaskStore((s) => s.sort);

  // Actions are stable refs; useShallow prevents needless re-renders.
  const actions = useTaskStore(
    useShallow((s) => ({
      addTask: s.addTask,
      updateTask: s.updateTask,
      deleteTask: s.deleteTask,
      setStatus: s.setStatus,
      setPriority: s.setPriority,
      toggleDone: s.toggleDone,
      setFilter: s.setFilter,
      resetFilter: s.resetFilter,
      setSort: s.setSort,
      clearAll: s.clearAll,
    })),
  );

  const visibleTasks = useMemo(() => filterAndSort(tasks, filter, sort), [tasks, filter, sort]);
  const metrics = useMemo(() => computeMetrics(tasks), [tasks]);

  return { tasks, visibleTasks, metrics, filter, sort, ...actions };
}
