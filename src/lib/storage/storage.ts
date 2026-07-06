/**
 * Persistence Layer
 * -----------------
 * The ONLY place that talks to the browser storage API.
 * Everything above depends on the `KeyValueStore` interface, never on
 * localStorage directly – so we can swap in IndexedDB, Supabase or a REST
 * backend later without touching state or UI code.
 */

import { STORAGE_PREFIX } from '@/config/app';

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Namespaced localStorage implementation used in v0.1.0. */
class LocalStorageAdapter implements KeyValueStore {
  private readonly prefix: string;

  constructor(prefix: string) {
    this.prefix = `${prefix}:`;
  }

  private full(key: string): string {
    return this.prefix + key;
  }

  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(this.full(key));
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      window.localStorage.setItem(this.full(key), value);
    } catch (err) {
      // Quota exceeded / private mode – fail loud in dev, silent in prod.
      if (import.meta.env.DEV) console.warn('[storage] setItem failed', err);
    }
  }

  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(this.full(key));
    } catch {
      /* noop */
    }
  }
}

/**
 * Swap this single line to change the whole persistence backend.
 * e.g. `export const storage = new IndexedDbAdapter(...)`
 */
export const storage: KeyValueStore = new LocalStorageAdapter(STORAGE_PREFIX);

/** Typed JSON helpers on top of the raw store. */
export function readJSON<T>(key: string, fallback: T): T {
  const raw = storage.getItem(key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  storage.setItem(key, JSON.stringify(value));
}

/**
 * Adapter shaped for Zustand's `persist` middleware.
 * Keeps the middleware decoupled from the concrete backend.
 */
export const zustandStorage = {
  getItem: (name: string): string | null => storage.getItem(name),
  setItem: (name: string, value: string): void => storage.setItem(name, value),
  removeItem: (name: string): void => storage.removeItem(name),
};
