import { useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { isDueToday, isOverdue } from '@/lib/tasks/taskUtils';
import { WidgetShell } from './WidgetShell';
import { TaskList } from '@/components/tasks/TaskList';

export function TodayTasksWidget() {
  const { tasks } = useTasks();
  const today = useMemo(
    () =>
      tasks
        .filter((t) => t.status !== 'done' && (isDueToday(t) || isOverdue(t)))
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 5),
    [tasks],
  );

  return (
    <WidgetShell title="Today Focus" icon="flame" subtitle={`${today.length} fällig`} to="/tasks">
      <TaskList
        tasks={today}
        emptyTitle="Nichts für heute"
        emptyDescription="Keine fälligen oder überfälligen Aufgaben."
        compact
      />
    </WidgetShell>
  );
}
