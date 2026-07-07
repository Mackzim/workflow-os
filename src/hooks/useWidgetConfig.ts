/**
 * Widget configuration hook – wraps the dashboard store and resolves each
 * config against its definition for rendering.
 */

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useWidgetStore } from '@/store/useWidgetStore';
import { WIDGET_DEFINITIONS, WIDGET_ORDER } from '@/lib/widgets/widgetDefaults';
import type { WidgetKind } from '@/lib/widgets/widgetTypes';

export function useWidgetConfig() {
  const widgets = useWidgetStore((s) => s.widgets);
  const layouts = useWidgetStore((s) => s.layouts);
  const editing = useWidgetStore((s) => s.editing);
  const actions = useWidgetStore(
    useShallow((s) => ({
      toggleWidget: s.toggleWidget,
      removeWidget: s.removeWidget,
      setEditing: s.setEditing,
      setBreakpointLayout: s.setBreakpointLayout,
      resetDashboard: s.resetDashboard,
    })),
  );

  const orderedEnabled = useMemo(
    () => [...widgets].sort((a, b) => a.order - b.order).filter((w) => w.enabled),
    [widgets],
  );

  const allOrdered = useMemo(() => {
    const rank = new Map<WidgetKind, number>(WIDGET_ORDER.map((k, i) => [k, i]));
    return [...widgets].sort((a, b) => (rank.get(a.kind) ?? 0) - (rank.get(b.kind) ?? 0));
  }, [widgets]);

  return {
    widgets,
    layouts,
    editing,
    orderedEnabled,
    allOrdered,
    definitions: WIDGET_DEFINITIONS,
    ...actions,
  };
}
