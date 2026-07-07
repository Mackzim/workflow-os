/**
 * Dashboard State (persisted)
 * ---------------------------
 * Which widgets are on the board (`widgets`) + their per-breakpoint positions
 * and sizes (`layouts`, react-grid-layout compatible). `editing` is ephemeral
 * (not persisted) and gates drag/resize.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Breakpoint, DashboardLayouts, GridItem, WidgetKind } from '@/lib/widgets/widgetTypes';
import {
  DEFAULT_LAYOUTS,
  DEFAULT_WIDGETS,
  WIDGET_KINDS,
  cloneDefaultLayouts,
} from '@/lib/widgets/widgetDefaults';
import type { WidgetConfig } from '@/lib/widgets/widgetTypes';
import { zustandStorage } from '@/lib/storage/storage';
import { STORAGE_PREFIX } from '@/config/app';

interface WidgetState {
  widgets: WidgetConfig[];
  layouts: DashboardLayouts;
  editing: boolean;

  toggleWidget: (kind: WidgetKind) => void;
  removeWidget: (kind: WidgetKind) => void;
  setEditing: (editing: boolean) => void;
  setBreakpointLayout: (bp: Breakpoint, items: { i: string; x: number; y: number; w: number; h: number }[]) => void;
  resetDashboard: () => void;
  getOrderedEnabled: () => WidgetConfig[];
}

const BREAKPOINTS: Breakpoint[] = ['lg', 'sm', 'xs'];

function defaultItemFor(kind: WidgetKind, bp: Breakpoint): GridItem {
  const preset = DEFAULT_LAYOUTS[bp].find((it) => it.i === kind);
  if (preset) return { ...preset };
  return { i: kind, x: 0, y: 9999, w: bp === 'xs' ? 1 : 2, h: 2 };
}

/** Guarantee every breakpoint has a slot for `kind` (used when re-enabling). */
function ensureEntry(layouts: DashboardLayouts, kind: WidgetKind): DashboardLayouts {
  const next = { ...layouts };
  for (const bp of BREAKPOINTS) {
    const list = layouts[bp] ?? [];
    next[bp] = list.some((it) => it.i === kind) ? list : [...list, defaultItemFor(kind, bp)];
  }
  return next;
}

const isKnownKind = (i: string): i is WidgetKind => (WIDGET_KINDS as string[]).includes(i);

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set, get) => ({
      widgets: DEFAULT_WIDGETS,
      layouts: cloneDefaultLayouts(),
      editing: false,

      toggleWidget: (kind) =>
        set((s) => {
          const widgets = s.widgets.map((w) => (w.kind === kind ? { ...w, enabled: !w.enabled } : w));
          const nowEnabled = widgets.find((w) => w.kind === kind)?.enabled;
          return { widgets, layouts: nowEnabled ? ensureEntry(s.layouts, kind) : s.layouts };
        }),

      removeWidget: (kind) =>
        set((s) => ({
          widgets: s.widgets.map((w) => (w.kind === kind ? { ...w, enabled: false } : w)),
        })),

      setEditing: (editing) => set({ editing }),

      setBreakpointLayout: (bp, items) =>
        set((s) => {
          const incoming = items
            .filter((it) => isKnownKind(it.i))
            .map((it) => ({ i: it.i as WidgetKind, x: it.x, y: it.y, w: it.w, h: it.h }));
          if (incoming.length === 0) return s;

          const incomingMap = new Map(incoming.map((it) => [it.i, it]));
          const existing = s.layouts[bp] ?? [];
          const merged: GridItem[] = existing.map((it) => incomingMap.get(it.i) ?? it);
          for (const it of incoming) {
            if (!existing.some((e) => e.i === it.i)) merged.push(it);
          }
          return { layouts: { ...s.layouts, [bp]: merged } };
        }),

      resetDashboard: () => set({ widgets: DEFAULT_WIDGETS, layouts: cloneDefaultLayouts(), editing: false }),

      getOrderedEnabled: () =>
        [...get().widgets].sort((a, b) => a.order - b.order).filter((w) => w.enabled),
    }),
    {
      name: `${STORAGE_PREFIX}.dashboard`,
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
      // `editing` is transient – never persist it.
      partialize: (s) => ({ widgets: s.widgets, layouts: s.layouts }),
    },
  ),
);
