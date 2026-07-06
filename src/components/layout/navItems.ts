import type { IconName } from '@/components/ui/Icon';
import type { ModuleKey } from '@/lib/navigation/navigation';
import { MODULE_ROUTES, MODULE_LABELS } from '@/lib/navigation/navigation';
import { FEATURES } from '@/config/app';

export interface NavItem {
  key: ModuleKey;
  label: string;
  path: string;
  icon: IconName;
  /** false = prepared placeholder module. */
  ready: boolean;
}

function item(key: ModuleKey, icon: IconName, ready: boolean): NavItem {
  return { key, icon, ready, label: MODULE_LABELS[key], path: MODULE_ROUTES[key] };
}

/** Built & usable today. */
export const NAV_PRIMARY: NavItem[] = [
  item('dashboard', 'dashboard', FEATURES.dashboard),
  item('tasks', 'tasks', FEATURES.tasks),
  item('command', 'command', FEATURES.commandCenter),
];

/** Prepared modules – routed to placeholders. */
export const NAV_MODULES: NavItem[] = [
  item('projects', 'projects', FEATURES.projects),
  item('notes', 'notes', FEATURES.notes),
  item('objects', 'objects', FEATURES.objects),
  item('calendar', 'calendar', FEATURES.calendar),
  item('automations', 'automations', FEATURES.automations),
  item('integrations', 'integrations', FEATURES.integrations),
];

export const NAV_SETTINGS: NavItem = item('settings', 'settings', true);
