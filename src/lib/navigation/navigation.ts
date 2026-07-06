/**
 * Canonical module <-> route mapping.
 * Lives in lib (pure, no React) so both the parser/action-registry and the
 * layout nav can share one source of truth.
 */

export type ModuleKey =
  | 'dashboard'
  | 'tasks'
  | 'command'
  | 'projects'
  | 'notes'
  | 'objects'
  | 'calendar'
  | 'automations'
  | 'integrations'
  | 'settings';

export const MODULE_ROUTES: Record<ModuleKey, string> = {
  dashboard: '/',
  tasks: '/tasks',
  command: '/command',
  projects: '/projects',
  notes: '/notes',
  objects: '/objects',
  calendar: '/calendar',
  automations: '/automations',
  integrations: '/integrations',
  settings: '/settings',
};

export const MODULE_LABELS: Record<ModuleKey, string> = {
  dashboard: 'Dashboard',
  tasks: 'Tasks',
  command: 'Command Center',
  projects: 'Projects',
  notes: 'Notes',
  objects: 'Objects',
  calendar: 'Calendar',
  automations: 'Automations',
  integrations: 'Integrations',
  settings: 'Settings',
};

/** German + English aliases the command parser understands. */
const MODULE_ALIASES: Record<string, ModuleKey> = {
  dashboard: 'dashboard',
  home: 'dashboard',
  start: 'dashboard',
  tasks: 'tasks',
  task: 'tasks',
  aufgaben: 'tasks',
  todo: 'tasks',
  todos: 'tasks',
  command: 'command',
  commandcenter: 'command',
  befehl: 'command',
  steuerung: 'command',
  projects: 'projects',
  projekte: 'projects',
  notes: 'notes',
  notizen: 'notes',
  objects: 'objects',
  objekte: 'objects',
  calendar: 'calendar',
  kalender: 'calendar',
  automations: 'automations',
  automationen: 'automations',
  integrations: 'integrations',
  integrationen: 'integrations',
  settings: 'settings',
  einstellungen: 'settings',
};

export function resolveModule(input: string): ModuleKey | undefined {
  return MODULE_ALIASES[input.trim().toLowerCase().replace(/\s+/g, '')];
}
