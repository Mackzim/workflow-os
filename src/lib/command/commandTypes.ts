/**
 * Types for the Command / Action layer.
 *
 * This is the seam where Claude / MCP will later plug in:
 *  - Claude interprets intent  ->  produces an ActionInvocation
 *  - the app validates + runs it through the ActionRegistry
 *  - UI reflects the ActionResult
 *
 * The UI never calls the store directly for command-driven work; it goes
 * through the registry so every path is typed, validated and auditable.
 */

import type { Task } from '@/lib/tasks/taskTypes';
import type { DashboardMetrics } from '@/lib/tasks/taskMetrics';
import type { ModuleKey } from '@/lib/navigation/navigation';

export type ActionId =
  | 'createTask'
  | 'updateTask'
  | 'deleteTask'
  | 'updateTaskStatus'
  | 'updateTaskPriority'
  | 'getOpenTasks'
  | 'getTodayTasks'
  | 'summarizeToday'
  | 'configureWidget'
  | 'openModule'
  | 'createAutomation';

export type ActionCategory = 'task' | 'query' | 'navigation' | 'automation' | 'widget';

/** Lightweight param descriptor – later convertible to a Claude tool schema. */
export interface ActionParam {
  name: string;
  type: 'string' | 'number' | 'enum' | 'boolean';
  required: boolean;
  description: string;
  options?: readonly (string | number)[];
}

export type ValidationResult<I> =
  | { ok: true; value: I }
  | { ok: false; errors: string[] };

export interface ActionResult {
  ok: boolean;
  message: string;
  /** Optional list of tasks to render as a result. */
  tasks?: Task[];
  /** Arbitrary structured payload (for programmatic callers / Claude). */
  data?: unknown;
  /** If set, the caller should navigate to this route. */
  navigateTo?: string;
  /** True for actions whose backend isn't wired up yet. */
  notImplemented?: boolean;
}

/**
 * Everything an action is allowed to touch. Backed by the task store at call
 * time, injected as a dependency so the registry stays free of React/state.
 */
export interface ActionContext {
  createTask: (draft: import('@/lib/tasks/taskTypes').TaskDraft) => Task;
  updateTask: (id: string, patch: import('@/lib/tasks/taskTypes').TaskPatch) => Task | undefined;
  deleteTask: (id: string) => boolean;
  getTasks: () => Task[];
  getOpenTasks: () => Task[];
  getTodayTasks: () => Task[];
  getMetrics: () => DashboardMetrics;
  /** Optional navigation hook (provided by the Command Center UI). */
  navigate?: (path: string) => void;
}

export interface ActionDefinition<I = unknown> {
  id: ActionId;
  title: string;
  description: string;
  category: ActionCategory;
  params: ActionParam[];
  /** True once the action is fully functional (vs. prepared stub). */
  implemented: boolean;
  validate: (input: unknown) => ValidationResult<I>;
  run: (input: I, ctx: ActionContext) => ActionResult;
}

/** A concrete request to run an action – what Claude will emit. */
export interface ActionInvocation {
  actionId: ActionId;
  input: unknown;
}

/* ---------- Command Center presentation ---------- */

export type OutcomeStatus = 'success' | 'error' | 'info' | 'help';

export interface CommandOutcome {
  id: string;
  input: string;
  status: OutcomeStatus;
  message: string;
  tasks?: Task[];
  actionId?: ActionId;
  notImplemented?: boolean;
  timestamp: string;
}

/* ---------- Parser output ---------- */

export type ParseResult =
  | { kind: 'action'; actionId: ActionId; input: unknown; raw: string }
  | { kind: 'navigate'; module: ModuleKey; raw: string }
  | { kind: 'help'; raw: string }
  | { kind: 'empty' }
  | { kind: 'unknown'; raw: string };
