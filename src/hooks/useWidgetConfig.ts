/**
 * Widget configuration hook – wraps the widget store and resolves each
 * config against its definition for rendering.
 */

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useWidgetStore } from '@/store/useWidgetStore';
import { WIDGET_DEFINITIONS } from '@/lib/widgets/widgetDefaults';

export function useWidgetConfig() {
  const widgets = useWidgetStore((s) => s.widgets);
  const actions = useWidgetStore(
    useShallow((s) => ({
      toggleWidget: s.toggleWidget,
      setWidgetSize: s.setWidgetSize,
      moveWidget: s.moveWidget,
      resetWidgets: s.resetWidgets,
    })),
  );

  const orderedEnabled = useMemo(
    () => [...widgets].sort((a, b) => a.order - b.order).filter((w) => w.enabled),
    [widgets],
  );

  const allOrdered = useMemo(
    () => [...widgets].sort((a, b) => a.order - b.order),
    [widgets],
  );

  return { widgets, orderedEnabled, allOrdered, definitions: WIDGET_DEFINITIONS, ...actions };
}
