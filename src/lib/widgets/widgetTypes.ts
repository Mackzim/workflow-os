/**
 * Widget system types.
 * v0.1.0: widgets can be toggled on/off and reordered in config (no DnD yet).
 * The `order` field + array structure keep the door open for drag-and-drop.
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

/** How much grid space a widget wants. Mapped to Tailwind col-spans. */
export type WidgetSize = 'sm' | 'md' | 'lg';

export interface WidgetConfig {
  kind: WidgetKind;
  enabled: boolean;
  order: number;
  size: WidgetSize;
}

export interface WidgetDefinition {
  kind: WidgetKind;
  title: string;
  description: string;
  /** Placeholder widgets render a "coming soon" shell. */
  placeholder: boolean;
  defaultSize: WidgetSize;
}
