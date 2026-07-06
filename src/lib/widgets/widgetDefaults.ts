import type { WidgetConfig, WidgetDefinition, WidgetKind } from './widgetTypes';

/**
 * The catalog of available widgets and their metadata.
 * Order here defines the default dashboard layout.
 */
export const WIDGET_DEFINITIONS: Record<WidgetKind, WidgetDefinition> = {
  today: {
    kind: 'today',
    title: 'Today Focus',
    description: 'Fällige und überfällige Aufgaben für heute.',
    placeholder: false,
    defaultSize: 'md',
  },
  progress: {
    kind: 'progress',
    title: 'Progress Today',
    description: 'Tagesfortschritt auf einen Blick.',
    placeholder: false,
    defaultSize: 'sm',
  },
  highPriority: {
    kind: 'highPriority',
    title: 'High Priority',
    description: 'Wichtige und kritische offene Aufgaben.',
    placeholder: false,
    defaultSize: 'md',
  },
  openTasks: {
    kind: 'openTasks',
    title: 'Open Tasks',
    description: 'Alle noch nicht erledigten Aufgaben.',
    placeholder: false,
    defaultSize: 'md',
  },
  quickAdd: {
    kind: 'quickAdd',
    title: 'Quick Add',
    description: 'Blitzschnell neue Aufgaben erfassen.',
    placeholder: false,
    defaultSize: 'sm',
  },
  command: {
    kind: 'command',
    title: 'Command Center',
    description: 'Steuere die App über Befehle – später via Claude.',
    placeholder: false,
    defaultSize: 'lg',
  },
  upcoming: {
    kind: 'upcoming',
    title: 'Upcoming',
    description: 'Kalender & Termine – kommt in einer späteren Version.',
    placeholder: true,
    defaultSize: 'sm',
  },
  notes: {
    kind: 'notes',
    title: 'Notes',
    description: 'Schnelle Notizen & Pages – in Vorbereitung.',
    placeholder: true,
    defaultSize: 'sm',
  },
  automations: {
    kind: 'automations',
    title: 'Automations',
    description: 'Wiederkehrende Workflows – in Vorbereitung.',
    placeholder: true,
    defaultSize: 'sm',
  },
};

/** Default enabled/ordered layout used on first launch. */
export const DEFAULT_WIDGETS: WidgetConfig[] = [
  { kind: 'today', enabled: true, order: 0, size: 'md' },
  { kind: 'progress', enabled: true, order: 1, size: 'sm' },
  { kind: 'quickAdd', enabled: true, order: 2, size: 'sm' },
  { kind: 'highPriority', enabled: true, order: 3, size: 'md' },
  { kind: 'openTasks', enabled: true, order: 4, size: 'md' },
  { kind: 'command', enabled: true, order: 5, size: 'lg' },
  { kind: 'upcoming', enabled: true, order: 6, size: 'sm' },
  { kind: 'notes', enabled: true, order: 7, size: 'sm' },
  { kind: 'automations', enabled: false, order: 8, size: 'sm' },
];

export const WIDGET_KINDS = Object.keys(WIDGET_DEFINITIONS) as WidgetKind[];
