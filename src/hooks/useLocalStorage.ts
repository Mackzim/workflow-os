/**
 * Small generic localStorage-backed state hook for one-off UI prefs.
 * Goes through the storage abstraction, so it inherits namespacing + swap-ability.
 * (Domain data uses the Zustand stores, not this.)
 */

import { useCallback, useState } from 'react';
import { readJSON, writeJSON } from '@/lib/storage/storage';

export function useLocalStorage<T>(key: string, initial: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => readJSON<T>(key, initial));

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        writeJSON(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, set];
}
