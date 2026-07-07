import { useRef } from 'react';
import { Responsive, WidthProvider, type Layout, type Layouts } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import type { Breakpoint, WidgetConfig, WidgetDefinition, WidgetKind } from '@/lib/widgets/widgetTypes';
import { useWidgetConfig } from '@/hooks/useWidgetConfig';
import {
  DEFAULT_LAYOUTS,
  GRID_BREAKPOINTS,
  GRID_COLS,
  GRID_MARGIN,
  GRID_ROW_HEIGHT,
  WIDGET_CONSTRAINTS,
} from '@/lib/widgets/widgetDefaults';
import { cn } from '@/lib/utils/cn';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Icon } from '@/components/ui/Icon';
import { TodayTasksWidget } from './widgets/TodayTasksWidget';
import { OpenTasksWidget } from './widgets/OpenTasksWidget';
import { HighPriorityWidget } from './widgets/HighPriorityWidget';
import { ProgressWidget } from './widgets/ProgressWidget';
import { QuickAddWidget } from './widgets/QuickAddWidget';
import { CommandWidget } from './widgets/CommandWidget';
import { UpcomingWidget } from './widgets/UpcomingWidget';
import { SeoWidget } from './widgets/SeoWidget';
import { PlaceholderWidget } from './widgets/PlaceholderWidget';

const ResponsiveGridLayout = WidthProvider(Responsive);
const BREAKPOINTS: Breakpoint[] = ['lg', 'sm', 'xs'];

function renderWidget(kind: WidgetKind, def: WidgetDefinition) {
  switch (kind) {
    case 'today':
      return <TodayTasksWidget />;
    case 'openTasks':
      return <OpenTasksWidget />;
    case 'highPriority':
      return <HighPriorityWidget />;
    case 'progress':
      return <ProgressWidget />;
    case 'quickAdd':
      return <QuickAddWidget />;
    case 'command':
      return <CommandWidget />;
    case 'upcoming':
      return <UpcomingWidget />;
    case 'seo':
      return <SeoWidget />;
    default:
      return <PlaceholderWidget def={def} />;
  }
}

export function WidgetGrid() {
  const { orderedEnabled, definitions, layouts, editing, setBreakpointLayout, removeWidget } = useWidgetConfig();
  const currentBp = useRef<Breakpoint>('lg');

  if (orderedEnabled.length === 0) {
    return (
      <EmptyState
        icon="dashboard"
        title="Keine Widgets aktiv"
        description="Aktiviere Widgets oben rechts über den Widgets-Schalter."
      />
    );
  }

  const enabledKinds = new Set(orderedEnabled.map((w) => w.kind));

  // Build react-grid-layout's per-breakpoint layouts: only enabled widgets,
  // with sizing rails attached from the widget constraints.
  const rglLayouts: Layouts = {};
  for (const bp of BREAKPOINTS) {
    const list = layouts[bp]
      .filter((it) => enabledKinds.has(it.i))
      .map((it) => {
        const c = WIDGET_CONSTRAINTS[it.i];
        return { ...it, minW: c.minW, minH: c.minH, maxW: c.maxW, maxH: c.maxH };
      });
    // Fallback: an enabled widget with no stored slot (e.g. added after the
    // layout was last saved) gets placed from the defaults / at the bottom.
    const present = new Set(list.map((it) => it.i));
    for (const w of orderedEnabled) {
      if (present.has(w.kind)) continue;
      const preset = DEFAULT_LAYOUTS[bp].find((d) => d.i === w.kind);
      const c = WIDGET_CONSTRAINTS[w.kind];
      const base = preset ?? { i: w.kind, x: 0, y: 9999, w: bp === 'xs' ? 1 : 2, h: 2 };
      list.push({ ...base, minW: c.minW, minH: c.minH, maxW: c.maxW, maxH: c.maxH });
    }
    rglLayouts[bp] = list;
  }

  const handleLayoutChange = (current: Layout[]) => {
    // Layout only changes through drag/resize, which is edit-mode only. Skipping
    // otherwise avoids the mount echo overwriting a breakpoint we aren't on.
    if (!editing) return;
    setBreakpointLayout(currentBp.current, current);
  };

  return (
    <ResponsiveGridLayout
      className={cn('-mx-1', editing && 'rgl-editing')}
      layouts={rglLayouts}
      breakpoints={GRID_BREAKPOINTS}
      cols={GRID_COLS}
      rowHeight={GRID_ROW_HEIGHT}
      margin={GRID_MARGIN}
      containerPadding={[4, 4]}
      isDraggable={editing}
      isResizable={editing}
      draggableCancel=".no-drag"
      resizeHandles={['se']}
      compactType="vertical"
      useCSSTransforms
      measureBeforeMount={false}
      onBreakpointChange={(bp) => {
        if ((BREAKPOINTS as string[]).includes(bp)) currentBp.current = bp as Breakpoint;
      }}
      onLayoutChange={handleLayoutChange}
    >
      {orderedEnabled.map((w: WidgetConfig) => (
        <div key={w.kind}>
          <div className="wos-item relative">
            {editing && (
              <>
                <span
                  className="pointer-events-none absolute left-2 top-2 z-20 text-content-faint/70"
                  aria-hidden="true"
                >
                  <Icon name="grip" size={15} />
                </span>
                <div className="no-drag absolute right-2 top-2 z-20">
                  <IconButton
                    icon="close"
                    label={`${definitions[w.kind].title} entfernen`}
                    size={14}
                    tone="danger"
                    className="border border-border-strong bg-surface-elevated/90 backdrop-blur"
                    onClick={() => removeWidget(w.kind)}
                  />
                </div>
              </>
            )}
            {renderWidget(w.kind, definitions[w.kind])}
          </div>
        </div>
      ))}
    </ResponsiveGridLayout>
  );
}
