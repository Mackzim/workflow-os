/**
 * Builds the `ActionContext` that the Action Registry runs against.
 * This is the dependency-injection seam: the registry stays pure, and here we
 * wire it to the live task store + router navigation.
 *
 * When Claude/MCP arrives, it will call `runAction(id, input, ctx)` with the
 * very same context.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '@/store/useTaskStore';
import { useCalendarStore } from '@/store/useCalendarStore';
import { computeMetrics } from '@/lib/tasks/taskMetrics';
import type { ActionContext } from '@/lib/command/commandTypes';

export function useActionContext(): ActionContext {
  const navigate = useNavigate();

  return useMemo<ActionContext>(
    () => ({
      createTask: (draft) => useTaskStore.getState().addTask(draft),
      updateTask: (id, patch) => useTaskStore.getState().updateTask(id, patch),
      deleteTask: (id) => useTaskStore.getState().deleteTask(id),
      getTasks: () => useTaskStore.getState().tasks,
      getOpenTasks: () => useTaskStore.getState().getOpenTasks(),
      getTodayTasks: () => useTaskStore.getState().getTodayTasks(),
      getMetrics: () => computeMetrics(useTaskStore.getState().tasks),
      createEvent: (draft) => useCalendarStore.getState().addEvent(draft),
      getEvents: () => useCalendarStore.getState().events,
      navigate: (path) => navigate(path),
    }),
    [navigate],
  );
}
