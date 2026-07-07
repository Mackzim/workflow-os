/**
 * Action Registry
 * ---------------
 * The typed, validated catalog of everything the app can *do*.
 * Today it's driven by the Command Center; tomorrow Claude/MCP will emit
 * `ActionInvocation`s that flow through exactly the same `runAction` path.
 *
 * Design rules:
 *  - Actions are pure w.r.t. their `ActionContext` dependency (no store import).
 *  - Every action validates its input before running.
 *  - Stubs are marked `implemented: false` and return `notImplemented`.
 */

import type { Priority, Task, TaskStatus } from '@/lib/tasks/taskTypes';
import { PRIORITIES, STATUSES, STATUS_META, PRIORITY_META } from '@/lib/tasks/taskTypes';
import type { EventColor } from '@/lib/calendar/calendarTypes';
import { EVENT_COLORS } from '@/lib/calendar/calendarTypes';
import { MODULE_ROUTES, MODULE_LABELS, resolveModule } from '@/lib/navigation/navigation';
import type {
  ActionContext,
  ActionDefinition,
  ActionId,
  ActionResult,
  ValidationResult,
} from './commandTypes';

/* ---------- validation helpers ---------- */

function ok<I>(value: I): ValidationResult<I> {
  return { ok: true, value };
}
function fail<I>(...errors: string[]): ValidationResult<I> {
  return { ok: false, errors };
}
function asRecord(input: unknown): Record<string, unknown> {
  return typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {};
}

/* ---------- action definitions ---------- */

const createTaskAction: ActionDefinition<{ title: string; priority?: Priority; dueDate?: string; category?: string; description?: string }> = {
  id: 'createTask',
  title: 'Aufgabe erstellen',
  description: 'Legt eine neue Aufgabe an.',
  category: 'task',
  implemented: true,
  params: [
    { name: 'title', type: 'string', required: true, description: 'Titel der Aufgabe' },
    { name: 'priority', type: 'enum', required: false, description: 'Priorität 1–5', options: PRIORITIES },
    { name: 'dueDate', type: 'string', required: false, description: 'Fälligkeitsdatum (ISO)' },
    { name: 'category', type: 'string', required: false, description: 'Kategorie' },
    { name: 'description', type: 'string', required: false, description: 'Beschreibung' },
  ],
  validate: (input) => {
    const r = asRecord(input);
    const title = typeof r.title === 'string' ? r.title.trim() : '';
    if (!title) return fail('Ein Titel wird benötigt.');
    let priority: Priority | undefined;
    if (r.priority !== undefined) {
      const p = Number(r.priority);
      if (!PRIORITIES.includes(p as Priority)) return fail('Priorität muss zwischen 1 und 5 liegen.');
      priority = p as Priority;
    }
    return ok({
      title,
      priority,
      dueDate: typeof r.dueDate === 'string' ? r.dueDate : undefined,
      category: typeof r.category === 'string' ? r.category : undefined,
      description: typeof r.description === 'string' ? r.description : undefined,
    });
  },
  run: (input, ctx): ActionResult => {
    const task = ctx.createTask(input);
    return {
      ok: true,
      message: `Aufgabe „${task.title}" erstellt (${PRIORITY_META[task.priority].label}).`,
      tasks: [task],
      data: task,
    };
  },
};

const updateTaskStatusAction: ActionDefinition<{ id: string; status: TaskStatus }> = {
  id: 'updateTaskStatus',
  title: 'Status ändern',
  description: 'Setzt den Status einer Aufgabe.',
  category: 'task',
  implemented: true,
  params: [
    { name: 'id', type: 'string', required: true, description: 'Task-ID' },
    { name: 'status', type: 'enum', required: true, description: 'Neuer Status', options: STATUSES },
  ],
  validate: (input) => {
    const r = asRecord(input);
    if (typeof r.id !== 'string' || !r.id) return fail('Task-ID fehlt.');
    if (!STATUSES.includes(r.status as TaskStatus)) return fail('Ungültiger Status.');
    return ok({ id: r.id, status: r.status as TaskStatus });
  },
  run: (input, ctx): ActionResult => {
    const task = ctx.updateTask(input.id, { status: input.status });
    if (!task) return { ok: false, message: 'Aufgabe nicht gefunden.' };
    return { ok: true, message: `Status → ${STATUS_META[task.status].label}.`, tasks: [task] };
  },
};

const updateTaskPriorityAction: ActionDefinition<{ id: string; priority: Priority }> = {
  id: 'updateTaskPriority',
  title: 'Priorität ändern',
  description: 'Setzt die Priorität einer Aufgabe.',
  category: 'task',
  implemented: true,
  params: [
    { name: 'id', type: 'string', required: true, description: 'Task-ID' },
    { name: 'priority', type: 'enum', required: true, description: 'Priorität 1–5', options: PRIORITIES },
  ],
  validate: (input) => {
    const r = asRecord(input);
    if (typeof r.id !== 'string' || !r.id) return fail('Task-ID fehlt.');
    const p = Number(r.priority);
    if (!PRIORITIES.includes(p as Priority)) return fail('Priorität muss 1–5 sein.');
    return ok({ id: r.id, priority: p as Priority });
  },
  run: (input, ctx): ActionResult => {
    const task = ctx.updateTask(input.id, { priority: input.priority });
    if (!task) return { ok: false, message: 'Aufgabe nicht gefunden.' };
    return { ok: true, message: `Priorität → ${PRIORITY_META[task.priority].label}.`, tasks: [task] };
  },
};

const updateTaskAction: ActionDefinition<{ id: string; patch: Record<string, unknown> }> = {
  id: 'updateTask',
  title: 'Aufgabe aktualisieren',
  description: 'Aktualisiert beliebige Felder einer Aufgabe.',
  category: 'task',
  implemented: true,
  params: [
    { name: 'id', type: 'string', required: true, description: 'Task-ID' },
    { name: 'patch', type: 'string', required: true, description: 'Zu ändernde Felder (Objekt)' },
  ],
  validate: (input) => {
    const r = asRecord(input);
    if (typeof r.id !== 'string' || !r.id) return fail('Task-ID fehlt.');
    return ok({ id: r.id, patch: asRecord(r.patch) });
  },
  run: (input, ctx): ActionResult => {
    const task = ctx.updateTask(input.id, input.patch as Partial<Task>);
    if (!task) return { ok: false, message: 'Aufgabe nicht gefunden.' };
    return { ok: true, message: `Aufgabe „${task.title}" aktualisiert.`, tasks: [task] };
  },
};

const deleteTaskAction: ActionDefinition<{ id: string }> = {
  id: 'deleteTask',
  title: 'Aufgabe löschen',
  description: 'Entfernt eine Aufgabe.',
  category: 'task',
  implemented: true,
  params: [{ name: 'id', type: 'string', required: true, description: 'Task-ID' }],
  validate: (input) => {
    const r = asRecord(input);
    if (typeof r.id !== 'string' || !r.id) return fail('Task-ID fehlt.');
    return ok({ id: r.id });
  },
  run: (input, ctx): ActionResult => {
    const removed = ctx.deleteTask(input.id);
    return removed
      ? { ok: true, message: 'Aufgabe gelöscht.' }
      : { ok: false, message: 'Aufgabe nicht gefunden.' };
  },
};

const getOpenTasksAction: ActionDefinition<{ priority?: Priority }> = {
  id: 'getOpenTasks',
  title: 'Offene Aufgaben',
  description: 'Liefert alle offenen Aufgaben, optional nach Priorität gefiltert.',
  category: 'query',
  implemented: true,
  params: [{ name: 'priority', type: 'enum', required: false, description: 'Priorität 1–5', options: PRIORITIES }],
  validate: (input) => {
    const r = asRecord(input);
    if (r.priority === undefined) return ok({});
    const p = Number(r.priority);
    if (!PRIORITIES.includes(p as Priority)) return fail('Priorität muss 1–5 sein.');
    return ok({ priority: p as Priority });
  },
  run: (input, ctx): ActionResult => {
    let tasks = ctx.getOpenTasks();
    if (input.priority !== undefined) tasks = tasks.filter((t) => t.priority === input.priority);
    const label = input.priority !== undefined ? ` mit Priorität ${input.priority}` : '';
    return {
      ok: true,
      message: `${tasks.length} offene Aufgabe(n)${label}.`,
      tasks,
      data: tasks,
    };
  },
};

const getTodayTasksAction: ActionDefinition<Record<string, never>> = {
  id: 'getTodayTasks',
  title: 'Heutige Aufgaben',
  description: 'Aufgaben, die heute fällig oder überfällig sind.',
  category: 'query',
  implemented: true,
  params: [],
  validate: () => ok({}),
  run: (_input, ctx): ActionResult => {
    const tasks = ctx.getTodayTasks();
    return { ok: true, message: `${tasks.length} Aufgabe(n) für heute.`, tasks, data: tasks };
  },
};

const summarizeTodayAction: ActionDefinition<Record<string, never>> = {
  id: 'summarizeToday',
  title: 'Tages-Zusammenfassung',
  description: 'Kompakte Übersicht über den heutigen Stand.',
  category: 'query',
  implemented: true,
  params: [],
  validate: () => ok({}),
  run: (_input, ctx): ActionResult => {
    const m = ctx.getMetrics();
    const msg =
      `Heute: ${m.completedToday}/${m.todayScopeTotal} erledigt (${m.todayProgress}%). ` +
      `${m.active} aktiv · ${m.highPriority} hohe Priorität · ${m.overdue} überfällig.`;
    return { ok: true, message: msg, data: m, tasks: ctx.getTodayTasks() };
  },
};

const createEventAction: ActionDefinition<{
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color?: EventColor;
  description?: string;
}> = {
  id: 'createEvent',
  title: 'Termin erstellen',
  description: 'Legt einen Kalendertermin an (auch für Time-Blocking von Aufgaben).',
  category: 'calendar',
  implemented: true,
  params: [
    { name: 'title', type: 'string', required: true, description: 'Titel des Termins' },
    { name: 'start', type: 'string', required: true, description: 'Start (ISO-Datum/-Zeit)' },
    { name: 'end', type: 'string', required: false, description: 'Ende (ISO-Datum/-Zeit)' },
    { name: 'allDay', type: 'boolean', required: false, description: 'Ganztägig?' },
    { name: 'color', type: 'enum', required: false, description: 'Farbe', options: Object.keys(EVENT_COLORS) },
    { name: 'description', type: 'string', required: false, description: 'Notizen' },
  ],
  validate: (input) => {
    const r = asRecord(input);
    const title = typeof r.title === 'string' ? r.title.trim() : '';
    if (!title) return fail('Ein Titel wird benötigt.');
    const start = typeof r.start === 'string' ? r.start : '';
    if (!start || Number.isNaN(new Date(start).getTime())) return fail('Ein gültiges Startdatum wird benötigt.');
    const color = typeof r.color === 'string' && r.color in EVENT_COLORS ? (r.color as EventColor) : undefined;
    return ok({
      title,
      start,
      end: typeof r.end === 'string' ? r.end : undefined,
      allDay: typeof r.allDay === 'boolean' ? r.allDay : undefined,
      color,
      description: typeof r.description === 'string' ? r.description : undefined,
    });
  },
  run: (input, ctx): ActionResult => {
    const event = ctx.createEvent(input);
    return { ok: true, message: `Termin „${event.title}" erstellt.`, data: event };
  },
};

const openModuleAction: ActionDefinition<{ module: string }> = {
  id: 'openModule',
  title: 'Modul öffnen',
  description: 'Navigiert zu einem Modul.',
  category: 'navigation',
  implemented: true,
  params: [{ name: 'module', type: 'string', required: true, description: 'z. B. tasks, dashboard, command' }],
  validate: (input) => {
    const r = asRecord(input);
    if (typeof r.module !== 'string' || !r.module) return fail('Modulname fehlt.');
    return ok({ module: r.module });
  },
  run: (input, ctx): ActionResult => {
    const key = resolveModule(input.module);
    if (!key) return { ok: false, message: `Unbekanntes Modul „${input.module}".` };
    const path = MODULE_ROUTES[key];
    ctx.navigate?.(path);
    return { ok: true, message: `Öffne ${MODULE_LABELS[key]} …`, navigateTo: path };
  },
};

/* ---------- prepared but not yet functional ---------- */

const configureWidgetAction: ActionDefinition<Record<string, unknown>> = {
  id: 'configureWidget',
  title: 'Widget konfigurieren',
  description: 'Blendet Dashboard-Widgets ein/aus (kommt in 0.2).',
  category: 'widget',
  implemented: false,
  params: [
    { name: 'widget', type: 'string', required: true, description: 'Widget-Kind' },
    { name: 'enabled', type: 'boolean', required: true, description: 'Sichtbar?' },
  ],
  validate: (input) => ok(asRecord(input)),
  run: (): ActionResult => ({
    ok: false,
    notImplemented: true,
    message: 'Widget-Konfiguration per Befehl kommt in Version 0.2. Nutze vorerst die Dashboard-Einstellungen.',
  }),
};

const createAutomationAction: ActionDefinition<Record<string, unknown>> = {
  id: 'createAutomation',
  title: 'Automation erstellen',
  description: 'Erstellt eine Automation (kommt in einer späteren Version).',
  category: 'automation',
  implemented: false,
  params: [
    { name: 'name', type: 'string', required: true, description: 'Name der Automation' },
    { name: 'trigger', type: 'string', required: true, description: 'Auslöser' },
  ],
  validate: (input) => ok(asRecord(input)),
  run: (): ActionResult => ({
    ok: false,
    notImplemented: true,
    message: 'Automationen sind noch nicht verfügbar – der Automations-Layer wird gerade vorbereitet.',
  }),
};

/* ---------- registry ---------- */

const DEFINITIONS: ActionDefinition<any>[] = [
  createTaskAction,
  updateTaskAction,
  updateTaskStatusAction,
  updateTaskPriorityAction,
  deleteTaskAction,
  getOpenTasksAction,
  getTodayTasksAction,
  summarizeTodayAction,
  createEventAction,
  openModuleAction,
  configureWidgetAction,
  createAutomationAction,
];

const REGISTRY = new Map<ActionId, ActionDefinition<any>>(DEFINITIONS.map((d) => [d.id, d]));

export function getAction(id: ActionId): ActionDefinition<any> | undefined {
  return REGISTRY.get(id);
}

export function listActions(): ActionDefinition<any>[] {
  return [...REGISTRY.values()];
}

/**
 * The single entry point for executing an action.
 * Validates input, then runs it. Claude/MCP will call exactly this.
 */
export function runAction(id: ActionId, rawInput: unknown, ctx: ActionContext): ActionResult {
  const action = REGISTRY.get(id);
  if (!action) return { ok: false, message: `Unbekannte Action „${id}".` };

  const validation = action.validate(rawInput);
  if (!validation.ok) {
    return { ok: false, message: validation.errors.join(' ') };
  }
  try {
    return action.run(validation.value, ctx);
  } catch (err) {
    return { ok: false, message: `Fehler beim Ausführen: ${(err as Error).message}` };
  }
}
