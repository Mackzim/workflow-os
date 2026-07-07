/**
 * Widget system types.
 * The dashboard is a modular, draggable + resizable grid (react-grid-layout).
 * Each widget can be toggled on/off; positions & sizes live per breakpoint in
 * `DashboardLayouts` and are persisted.
 */

export type WidgetKind =
  | 'today'
  | 'openTasks'
  | 'highPriority'
  | 'progress'
  | 'quickAdd'
  | 'command'
  | 'upcoming' // placeholder
  | 'notes' // placeholder
  | 'automations'; // placeholder

/** Which widgets are on the board (positioning is handled by the grid layout). */
export interface WidgetConfig {
  kind: WidgetKind;
  enabled: boolean;
  order: number;
}

export interface WidgetDefinition {
  kind: WidgetKind;
  title: string;
  description: string;
  /** Placeholder widgets render a "coming soon" shell. */
  placeholder: boolean;
}

/* ---------- Grid layout ---------- */

/** Responsive breakpoints we ship layouts for. */
export type Breakpoint = 'lg' | 'sm' | 'xs';

/** A single widget's position/size in grid units (react-grid-layout compatible). */
export interface GridItem {
  i: WidgetKind;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Per-breakpoint positions. */
export type DashboardLayouts = Record<Breakpoint, GridItem[]>;

/** Min/max sizing rails for a widget, in grid units. */
export interface GridConstraint {
  minW: number;
  minH: number;
  maxW?: number;
  maxH?: number;
}
