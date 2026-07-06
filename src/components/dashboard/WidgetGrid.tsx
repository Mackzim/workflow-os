import { Fragment } from 'react';
import { motion } from 'framer-motion';
import type { WidgetConfig } from '@/lib/widgets/widgetTypes';
import { useWidgetConfig } from '@/hooks/useWidgetConfig';
import { staggerContainer } from '@/lib/motion/motionPresets';
import { EmptyState } from '@/components/ui/EmptyState';
import { TodayTasksWidget } from './widgets/TodayTasksWidget';
import { OpenTasksWidget } from './widgets/OpenTasksWidget';
import { HighPriorityWidget } from './widgets/HighPriorityWidget';
import { ProgressWidget } from './widgets/ProgressWidget';
import { QuickAddWidget } from './widgets/QuickAddWidget';
import { CommandWidget } from './widgets/CommandWidget';
import { PlaceholderWidget } from './widgets/PlaceholderWidget';

export function WidgetGrid() {
  const { orderedEnabled, definitions } = useWidgetConfig();

  if (orderedEnabled.length === 0) {
    return (
      <EmptyState
        icon="dashboard"
        title="Keine Widgets aktiv"
        description="Aktiviere Widgets über „Widgets anpassen“ oben rechts."
      />
    );
  }

  const render = (w: WidgetConfig) => {
    switch (w.kind) {
      case 'today':
        return <TodayTasksWidget size={w.size} />;
      case 'openTasks':
        return <OpenTasksWidget size={w.size} />;
      case 'highPriority':
        return <HighPriorityWidget size={w.size} />;
      case 'progress':
        return <ProgressWidget size={w.size} />;
      case 'quickAdd':
        return <QuickAddWidget size={w.size} />;
      case 'command':
        return <CommandWidget size={w.size} />;
      default:
        return <PlaceholderWidget def={definitions[w.kind]} size={w.size} />;
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {orderedEnabled.map((w) => (
        <Fragment key={w.kind}>{render(w)}</Fragment>
      ))}
    </motion.div>
  );
}
