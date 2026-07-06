/**
 * Task State (persisted)
 * ----------------------
 * The authoritative store for tasks + the active filter/sort view state.
 * Only `tasks` and `seeded` are persisted; the filter/sort view resets on
 * reload by design.
 *
 * Persistence flows through `zustandStorage`, our storage abstraction, so the
 * backend is swappable (localStorage today, IndexedDB/Supabase later).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Priority, Task, TaskDraft, TaskPatch, TaskStatus } from '@/lib/tasks/taskTypes';
import { applyPatch, createTask, toggleDone as toggleDoneUtil } from '@/lib/tasks/taskUtils';
import { isDueToday, isOverdue } from '@/lib/tasks/taskUtils';
import {
  DEFAULT_FILTER,
  DEFAULT_SORT,
  type SortConfig,
  type TaskFilter,
} from '@/lib/tasks/taskFilters';
import { zustandStorage } from '@/lib/storage/storage';
import { STORAGE_PREFIX } from '@/config/app';
import { SAMPLE_TASK_DRAFTS } from '@/lib/tasks/sampleTasks';

interface TaskState {
  tasks: Task[];
  filter: TaskFilter;
  sort: SortConfig;
  seeded: boolean;

  // CRUD
  addTask: (draft: TaskDraft) => Task;
  updateTask: (id: string, patch: TaskPatch) => Task | undefined;
  deleteTask: (id: string) => boolean;
  setStatus: (id: string, status: TaskStatus) => Task | undefined;
  setPriority: (id: string, priority: Priority) => Task | undefined;
  toggleDone: (id: string) => void;

  // View state
  setFilter: (patch: Partial<TaskFilter>) => void;
  resetFilter: () => void;
  setSort: (sort: SortConfig) => void;

  // Bulk / maintenance
  replaceAll: (tasks: Task[]) => void;
  clearAll: () => void;
  ensureSeeded: () => void;

  // Query helpers (used to build the ActionContext)
  getOpenTasks: () => Task[];
  getTodayTasks: () => Task[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      filter: DEFAULT_FILTER,
      sort: DEFAULT_SORT,
      seeded: false,

      addTask: (draft) => {
        const task = createTask(draft);
        set((s) => ({ tasks: [task, ...s.tasks] }));
        return task;
      },

      updateTask: (id, patch) => {
        let updated: Task | undefined;
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== id) return t;
            updated = applyPatch(t, patch);
            return updated;
          }),
        }));
        return updated;
      },

      deleteTask: (id) => {
        const exists = get().tasks.some((t) => t.id === id);
        if (exists) set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
        return exists;
      },

      setStatus: (id, status) => get().updateTask(id, { status }),
      setPriority: (id, priority) => get().updateTask(id, { priority }),

      toggleDone: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? toggleDoneUtil(t) : t)),
        })),

      setFilter: (patch) => set((s) => ({ filter: { ...s.filter, ...patch } })),
      resetFilter: () => set({ filter: DEFAULT_FILTER }),
      setSort: (sort) => set({ sort }),

      replaceAll: (tasks) => set({ tasks }),
      clearAll: () => set({ tasks: [] }),

      ensureSeeded: () => {
        const { seeded, tasks } = get();
        if (seeded || tasks.length > 0) {
          if (!seeded) set({ seeded: true });
          return;
        }
        const seededTasks = SAMPLE_TASK_DRAFTS.map((d) => createTask(d));
        set({ tasks: seededTasks, seeded: true });
      },

      getOpenTasks: () => get().tasks.filter((t) => t.status !== 'done'),
      getTodayTasks: () =>
        get().tasks.filter((t) => isDueToday(t) || isOverdue(t)),
    }),
    {
      name: `${STORAGE_PREFIX}.tasks`,
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
      // Persist only durable data – view state is intentionally ephemeral.
      partialize: (s) => ({ tasks: s.tasks, seeded: s.seeded }),
    },
  ),
);
