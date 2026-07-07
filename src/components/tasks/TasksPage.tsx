import { useMemo, useState } from 'react';
import type { Task } from '@/lib/tasks/taskTypes';
import { useTasks } from '@/hooks/useTasks';
import { Page, PageHeader } from '@/components/common/Page';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { QuickAddTask } from './QuickAddTask';
import { TaskFilters } from './TaskFilters';
import { TaskList } from './TaskList';
import { TaskForm } from './TaskForm';
import { CompletedSection } from './CompletedSection';

export function TasksPage() {
  const { tasks, visibleTasks, filter } = useTasks();
  const [editing, setEditing] = useState<Task | null>(null);

  const { active, done } = useMemo(
    () => ({
      active: visibleTasks.filter((t) => t.status !== 'done'),
      done: visibleTasks.filter((t) => t.status === 'done'),
    }),
    [visibleTasks],
  );

  const openCount = tasks.filter((t) => t.status !== 'done').length;

  return (
    <Page>
      <PageHeader
        title="Tasks"
        subtitle={`${openCount} offen · ${tasks.length - openCount} erledigt`}
        icon={<Icon name="tasks" size={20} />}
      />

      <div className="mb-4">
        <QuickAddTask autoFocus />
      </div>

      <Card className="p-4">
        <TaskFilters />
        <div className="mt-4">
          <TaskList
            tasks={active}
            onEdit={setEditing}
            emptyTitle={tasks.length === 0 ? 'Noch keine Aufgaben' : done.length > 0 ? 'Alles erledigt 🎉' : 'Keine Treffer'}
            emptyDescription={
              tasks.length === 0
                ? 'Erstelle deine erste Aufgabe über das Feld oben.'
                : done.length > 0
                  ? 'Keine offenen Aufgaben – erledigte findest du unten.'
                  : 'Passe Suche oder Filter an.'
            }
          />

          {done.length > 0 && (
            <CompletedSection
              tasks={done}
              onEdit={setEditing}
              defaultOpen={filter.status.length === 1 && filter.status[0] === 'done'}
            />
          )}
        </div>
      </Card>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Aufgabe bearbeiten">
        {editing && <TaskForm task={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </Page>
  );
}
