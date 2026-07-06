/**
 * Central type barrel.
 *
 * v0.1.0 fully implements `Task`. The remaining core objects are declared
 * here as *prepared* interfaces so the architecture (and Capacities-style
 * object linking) is ready without being half-built. They are intentionally
 * NOT wired into any store yet – see the TODOs.
 */

export * from '@/lib/tasks/taskTypes';

/** Every persisted object shares this shape. */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * A typed link between two objects (Capacities-style graph edge).
 * Prepared for the Objects/Notes modules.
 */
export interface EntityLink {
  fromId: string;
  toId: string;
  /** e.g. "relatesTo" | "blocks" | "partOf" | "mentions" */
  relation: string;
}

// TODO(0.3): Projects module
export interface Project extends BaseEntity {
  name: string;
  description?: string;
  color?: string;
  status: 'active' | 'archived' | 'planned';
  taskIds: string[];
}

// TODO(0.4): Notes / Pages – rich, block-based documents
export interface Note extends BaseEntity {
  title: string;
  body: string;
  tags: string[];
  linkedIds: string[];
}

export interface PageBlock {
  id: string;
  type: 'text' | 'heading' | 'todo' | 'divider' | 'embed';
  content: string;
}

export interface Page extends BaseEntity {
  title: string;
  blocks: PageBlock[];
}

// TODO(0.5): Objects – user-defined structured entities (Kunde, Produkt, …)
export interface ObjectEntity extends BaseEntity {
  type: string; // "customer" | "product" | "supplier" | ...
  title: string;
  properties: Record<string, unknown>;
  links: EntityLink[];
}

// TODO(0.2): Widgets are partially built – see lib/widgets/widgetTypes.ts

// TODO(0.6): Automations & integrations
export interface Automation extends BaseEntity {
  name: string;
  trigger: string;
  actions: string[]; // references into the Action Registry
  enabled: boolean;
}

export interface Integration extends BaseEntity {
  provider: 'claude' | 'mcp' | 'rest' | 'webhook' | 'calendar' | 'email';
  label: string;
  connected: boolean;
  config: Record<string, unknown>;
}

// TODO(0.7): Workspaces group everything above
export interface Workspace extends BaseEntity {
  name: string;
  icon?: string;
}
