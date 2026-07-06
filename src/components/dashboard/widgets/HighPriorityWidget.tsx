import { useMemo } from 'react';
import type { WidgetSize } from '@/lib/widgets/widgetTypes';
import { useTasks } from '@/hooks/useTasks';
import { WidgetShell } from './WidgetShell';
import { TaskList } from '@/components/tasks/TaskList';

export function HighPriorityWidget({ size }: { size: WidgetSize }) {
  const { tasks } = useTasks();
  const high = useMemo(
    () =>
      tasks
        .filter((t) => t.priority >= 4 && t.status !== 'done')
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 5),
    [tasks],
  );

  return (
    <WidgetShell title="High Priority" icon="alert" size={size} subtitle={`${high.length} offen`} to="/tasks">
      <TaskList
        tasks={high}
        emptyTitle="Alles im grünen Bereich"
        emptyDescription="Keine wichtigen Aufgaben offen."
        compact
      />
    </WidgetShell>
  );
}
