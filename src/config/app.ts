/**
 * App-wide identity & feature flags.
 * Rename the product in ONE place here.
 */
export const APP = {
  name: 'Workflow OS',
  shortName: 'WOS',
  version: '0.1.0',
  tagline: 'Personal command center',
} as const;

/**
 * Feature flags let us ship architecture ahead of UI.
 * Everything not yet built is flagged off but still routed as a placeholder.
 */
export const FEATURES = {
  tasks: true,
  dashboard: true,
  commandCenter: true,
  calendar: true,
  seo: true,
  // Prepared but not implemented in 0.1.0:
  projects: false,
  notes: false,
  objects: false,
  automations: false,
  integrations: false,
} as const;

/** localStorage namespace so multiple modules never collide. */
export const STORAGE_PREFIX = 'wos';
