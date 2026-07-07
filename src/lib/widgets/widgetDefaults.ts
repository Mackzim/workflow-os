import type {
  Breakpoint,
  DashboardLayouts,
  GridConstraint,
  GridItem,
  WidgetConfig,
  WidgetDefinition,
  WidgetKind,
} from './widgetTypes';

/**
 * The catalog of available widgets and their metadata.
 */
export const WIDGET_DEFINITIONS: Record<WidgetKind, WidgetDefinition> = {
  today: {
    kind: 'today',
    title: 'Today Focus',
    description: 'Fällige und überfällige Aufgaben für heute.',
    placeholder: false,
  },
  progress: {
    kind: 'progress',
    title: 'Fortschritt heute',
    description: 'Tagesfortschritt auf einen Blick.',
    placeholder: false,
  },
  highPriority: {
    kind: 'highPriority',
    title: 'High Priority',
    description: 'Wichtige und kritische offene Aufgaben.',
    placeholder: false,
  },
  openTasks: {
    kind: 'openTasks',
    title: 'Open Tasks',
    description: 'Alle noch nicht erledigten Aufgaben.',
    placeholder: false,
  },
  quickAdd: {
    kind: 'quickAdd',
    title: 'Quick Add',
    description: 'Blitzschnell neue Aufgaben erfassen.',
    placeholder: false,
  },
  command: {
    kind: 'command',
    title: 'Command Center',
    description: 'Steuere die App über Befehle – später via Claude.',
    placeholder: false,
  },
  seo: {
    kind: 'seo',
    title: 'SEO',
    description: 'Search-Console-Überblick (Demo).',
    placeholder: false,
  },
  upcoming: {
    kind: 'upcoming',
    title: 'Anstehend',
    description: 'Nächste Termine & fällige Aufgaben.',
    placeholder: false,
  },
  notes: {
    kind: 'notes',
    title: 'Notes',
    description: 'Schnelle Notizen & Pages – in Vorbereitung.',
    placeholder: true,
  },
  automations: {
    kind: 'automations',
    title: 'Automations',
    description: 'Wiederkehrende Workflows – in Vorbereitung.',
    placeholder: true,
  },
};

/** Stable catalog order (settings list + mobile stacking). */
export const WIDGET_ORDER: WidgetKind[] = [
  'today',
  'highPriority',
  'openTasks',
  'progress',
  'seo',
  'quickAdd',
  'upcoming',
  'notes',
  'command',
  'automations',
];

/** Default enabled set on first launch. */
export const DEFAULT_WIDGETS: WidgetConfig[] = WIDGET_ORDER.map((kind, order) => ({
  kind,
  order,
  enabled: kind !== 'automations',
}));

/* ---------- Grid configuration ---------- */

export const GRID_BREAKPOINTS: Record<Breakpoint, number> = { lg: 1024, sm: 640, xs: 0 };
export const GRID_COLS: Record<Breakpoint, number> = { lg: 4, sm: 2, xs: 1 };
export const GRID_ROW_HEIGHT = 116;
export const GRID_MARGIN: [number, number] = [16, 16];

/** Sizing rails per widget (grid units). */
export const WIDGET_CONSTRAINTS: Record<WidgetKind, GridConstraint> = {
  today: { minW: 1, minH: 2 },
  highPriority: { minW: 1, minH: 2 },
  openTasks: { minW: 1, minH: 2 },
  progress: { minW: 2, minH: 2 },
  quickAdd: { minW: 1, minH: 2 },
  command: { minW: 2, minH: 2 },
  seo: { minW: 1, minH: 2 },
  upcoming: { minW: 1, minH: 2 },
  notes: { minW: 1, minH: 2 },
  automations: { minW: 1, minH: 2 },
};

/** Desktop board (4 columns). */
const LG_LAYOUT: GridItem[] = [
  { i: 'today', x: 0, y: 0, w: 2, h: 2 },
  { i: 'highPriority', x: 2, y: 0, w: 2, h: 2 },
  { i: 'seo', x: 0, y: 2, w: 2, h: 2 },
  { i: 'progress', x: 2, y: 2, w: 2, h: 2 },
  { i: 'openTasks', x: 0, y: 4, w: 2, h: 2 },
  { i: 'quickAdd', x: 2, y: 4, w: 2, h: 2 },
  { i: 'upcoming', x: 0, y: 6, w: 1, h: 2 },
  { i: 'notes', x: 1, y: 6, w: 1, h: 2 },
  { i: 'command', x: 0, y: 8, w: 4, h: 2 },
  { i: 'automations', x: 0, y: 10, w: 2, h: 2 },
];

/** Tablet board (2 columns). */
const SM_LAYOUT: GridItem[] = [
  { i: 'today', x: 0, y: 0, w: 2, h: 2 },
  { i: 'highPriority', x: 0, y: 2, w: 2, h: 2 },
  { i: 'seo', x: 0, y: 4, w: 2, h: 2 },
  { i: 'progress', x: 0, y: 6, w: 2, h: 2 },
  { i: 'openTasks', x: 0, y: 8, w: 2, h: 2 },
  { i: 'quickAdd', x: 0, y: 10, w: 2, h: 2 },
  { i: 'upcoming', x: 0, y: 12, w: 1, h: 2 },
  { i: 'notes', x: 1, y: 12, w: 1, h: 2 },
  { i: 'command', x: 0, y: 14, w: 2, h: 2 },
  { i: 'automations', x: 0, y: 16, w: 2, h: 2 },
];

/** Phone board (1 column, everything stacked in catalog order). */
const XS_LAYOUT: GridItem[] = WIDGET_ORDER.map((kind, idx) => ({
  i: kind,
  x: 0,
  y: idx * 2,
  w: 1,
  h: 2,
}));

export const DEFAULT_LAYOUTS: DashboardLayouts = {
  lg: LG_LAYOUT,
  sm: SM_LAYOUT,
  xs: XS_LAYOUT,
};

export const WIDGET_KINDS = Object.keys(WIDGET_DEFINITIONS) as WidgetKind[];

/** Deep clone so persisted state never shares references with the defaults. */
export function cloneDefaultLayouts(): DashboardLayouts {
  return {
    lg: DEFAULT_LAYOUTS.lg.map((it) => ({ ...it })),
    sm: DEFAULT_LAYOUTS.sm.map((it) => ({ ...it })),
    xs: DEFAULT_LAYOUTS.xs.map((it) => ({ ...it })),
  };
}
