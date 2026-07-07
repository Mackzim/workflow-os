import { useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { WidgetShell } from './WidgetShell';
import { TaskList } from '@/components/tasks/TaskList';

export function OpenTasksWidget() {
  const { tasks } = useTasks();
  const open = useMemo(
    () =>
      tasks
        .filter((t) => t.status !== 'done')
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 6),
    [tasks],
  );
  const total = tasks.filter((t) => t.status !== 'done').length;

  return (
    <WidgetShell title="Open Tasks" icon="tasks" subtitle={`${total} gesamt`} to="/tasks">
      <TaskList tasks={open} emptyTitle="Keine offenen Aufgaben" emptyDescription="Starke Arbeit!" compact />
    </WidgetShell>
  );
}
