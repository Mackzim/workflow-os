/**
 * Task State (persisted)
 * ----------------------
 * The authoritative store for tasks + the active filter/sort view state.
 * Only `tasks` and `seeded` are persisted; the filter/sort view resets on
 * reload by design.
 *
 * Persistence flows through `zustandStorage` (localStorage today, swappable).
 * When sync is active, a write-through handler mirrors local mutations to
 * Supabase, and remote changes are applied via `applyRemote*` (no re-push).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Priority, Task, TaskDraft, TaskPatch, TaskStatus } from '@/lib/tasks/taskTypes';
import { applyPatch, createTask } from '@/lib/tasks/taskUtils';
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
import { isSyncConfigured } from '@/lib/sync/supabaseClient';

/** Write-through hooks installed by the sync engine when a user is signed in. */
export interface SyncHandler {
  onCreate: (task: Task) => void;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

interface TaskState {
  tasks: Task[];
  filter: TaskFilter;
  sort: SortConfig;
  seeded: boolean;
  _sync: SyncHandler | null;

  // CRUD (these push to the cloud when sync is active)
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

  // Sync integration (these do NOT trigger write-through)
  setSyncHandler: (handler: SyncHandler | null) => void;
  hydrate: (tasks: Task[]) => void;
  applyRemoteUpsert: (task: Task) => void;
  applyRemoteDelete: (id: string) => void;

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
      _sync: null,

      addTask: (draft) => {
        const task = createTask(draft);
        set((s) => ({ tasks: [task, ...s.tasks] }));
        get()._sync?.onCreate(task);
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
        if (updated) get()._sync?.onUpdate(updated);
        return updated;
      },

      deleteTask: (id) => {
        const exists = get().tasks.some((t) => t.id === id);
        if (exists) {
          set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
          get()._sync?.onDelete(id);
        }
        return exists;
      },

      setStatus: (id, status) => get().updateTask(id, { status }),
      setPriority: (id, priority) => get().updateTask(id, { priority }),

      // Routed through updateTask so the change also syncs.
      toggleDone: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;
        get().updateTask(id, { status: task.status === 'done' ? 'open' : 'done' });
      },

      setFilter: (patch) => set((s) => ({ filter: { ...s.filter, ...patch } })),
      resetFilter: () => set({ filter: DEFAULT_FILTER }),
      setSort: (sort) => set({ sort }),

      replaceAll: (tasks) => set({ tasks }),
      clearAll: () => set({ tasks: [] }),

      ensureSeeded: () => {
        // In sync mode the cloud is the source of truth – never seed locally.
        if (isSyncConfigured) return;
        const { seeded, tasks } = get();
        if (seeded || tasks.length > 0) {
          if (!seeded) set({ seeded: true });
          return;
        }
        const seededTasks = SAMPLE_TASK_DRAFTS.map((d) => createTask(d));
        set({ tasks: seededTasks, seeded: true });
      },

      setSyncHandler: (handler) => set({ _sync: handler }),
      hydrate: (tasks) => set({ tasks }),
      applyRemoteUpsert: (task) =>
        set((s) => {
          const idx = s.tasks.findIndex((t) => t.id === task.id);
          if (idx === -1) return { tasks: [task, ...s.tasks] };
          const next = [...s.tasks];
          next[idx] = task;
          return { tasks: next };
        }),
      applyRemoteDelete: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      getOpenTasks: () => get().tasks.filter((t) => t.status !== 'done'),
      getTodayTasks: () => get().tasks.filter((t) => isDueToday(t) || isOverdue(t)),
    }),
    {
      name: `${STORAGE_PREFIX}.tasks`,
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
      // Persist only durable data – view state + sync handler are ephemeral.
      partialize: (s) => ({ tasks: s.tasks, seeded: s.seeded }),
    },
  ),
);
