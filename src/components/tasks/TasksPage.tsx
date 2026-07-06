import { useState } from 'react';
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

export function TasksPage() {
  const { tasks, visibleTasks } = useTasks();
  const [editing, setEditing] = useState<Task | null>(null);

  return (
    <Page>
      <PageHeader
        title="Tasks"
        subtitle={`${visibleTasks.length} von ${tasks.length} Aufgaben`}
        icon={<Icon name="tasks" size={20} />}
      />

      <div className="mb-4">
        <QuickAddTask autoFocus />
      </div>

      <Card className="p-4">
        <TaskFilters />
        <div className="mt-4">
          <TaskList
            tasks={visibleTasks}
            onEdit={setEditing}
            emptyTitle={tasks.length === 0 ? 'Noch keine Aufgaben' : 'Keine Treffer'}
            emptyDescription={
              tasks.length === 0
                ? 'Erstelle deine erste Aufgabe über das Feld oben.'
                : 'Passe Suche oder Filter an.'
            }
          />
        </div>
      </Card>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Aufgabe bearbeiten">
        {editing && <TaskForm task={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </Page>
  );
}
