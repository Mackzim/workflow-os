/**
 * Widget Config State (persisted)
 * Toggle + order widgets. No drag-and-drop yet, but the `order` field and
 * `moveWidget` keep the architecture ready for it.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WidgetConfig, WidgetKind, WidgetSize } from '@/lib/widgets/widgetTypes';
import { DEFAULT_WIDGETS } from '@/lib/widgets/widgetDefaults';
import { zustandStorage } from '@/lib/storage/storage';
import { STORAGE_PREFIX } from '@/config/app';

interface WidgetState {
  widgets: WidgetConfig[];
  toggleWidget: (kind: WidgetKind) => void;
  setWidgetSize: (kind: WidgetKind, size: WidgetSize) => void;
  moveWidget: (kind: WidgetKind, dir: -1 | 1) => void;
  resetWidgets: () => void;
  getOrderedEnabled: () => WidgetConfig[];
}

function normalizeOrder(widgets: WidgetConfig[]): WidgetConfig[] {
  return [...widgets]
    .sort((a, b) => a.order - b.order)
    .map((w, i) => ({ ...w, order: i }));
}

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set, get) => ({
      widgets: DEFAULT_WIDGETS,

      toggleWidget: (kind) =>
        set((s) => ({
          widgets: s.widgets.map((w) =>
            w.kind === kind ? { ...w, enabled: !w.enabled } : w,
          ),
        })),

      setWidgetSize: (kind, size) =>
        set((s) => ({
          widgets: s.widgets.map((w) => (w.kind === kind ? { ...w, size } : w)),
        })),

      moveWidget: (kind, dir) =>
        set((s) => {
          const ordered = normalizeOrder(s.widgets);
          const idx = ordered.findIndex((w) => w.kind === kind);
          const swap = idx + dir;
          if (idx < 0 || swap < 0 || swap >= ordered.length) return { widgets: s.widgets };
          const next = [...ordered];
          [next[idx], next[swap]] = [next[swap], next[idx]];
          return { widgets: normalizeOrder(next) };
        }),

      resetWidgets: () => set({ widgets: DEFAULT_WIDGETS }),

      getOrderedEnabled: () =>
        normalizeOrder(get().widgets).filter((w) => w.enabled),
    }),
    {
      name: `${STORAGE_PREFIX}.widgets`,
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
