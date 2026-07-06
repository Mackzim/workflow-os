import { useState } from 'react';
import type { FormEvent } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { Priority, Task, TaskStatus } from '@/lib/tasks/taskTypes';
import { PRIORITIES, PRIORITY_META, STATUSES, STATUS_META } from '@/lib/tasks/taskTypes';
import { useTaskStore } from '@/store/useTaskStore';
import { formatDateInput } from '@/lib/utils/format';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export interface TaskFormProps {
  task?: Task;
  onDone: () => void;
}

/** Full create/edit form. Rendered inside a Modal for editing. */
export function TaskForm({ task, onDone }: TaskFormProps) {
  const { addTask, updateTask } = useTaskStore(
    useShallow((s) => ({ addTask: s.addTask, updateTask: s.updateTask })),
  );

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 3);
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'open');
  const [dueDate, setDueDate] = useState(formatDateInput(task?.dueDate));
  const [category, setCategory] = useState(task?.category ?? '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    const payload = {
      title: trimmed,
      description: description.trim(),
      priority,
      status,
      dueDate: dueDate || undefined,
      category: category.trim() || undefined,
    };
    if (task) updateTask(task.id, payload);
    else addTask(payload);
    onDone();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-[12px] font-medium text-content-muted">Titel</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Was ist zu tun?" autoFocus />
      </div>

      <div>
        <label className="mb-1.5 block text-[12px] font-medium text-content-muted">Beschreibung</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details (optional)" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-content-muted">Priorität</label>
          <Select
            value={String(priority)}
            onChange={(e) => setPriority(Number(e.target.value) as Priority)}
            options={PRIORITIES.map((p) => ({ value: String(p), label: `${PRIORITY_META[p].short} · ${PRIORITY_META[p].label}` }))}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-content-muted">Status</label>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            options={STATUSES.map((s) => ({ value: s, label: STATUS_META[s].label }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-content-muted">Fällig am</label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-content-muted">Kategorie</label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="z. B. Shop" />
        </div>
      </div>

      <div className="mt-1 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Abbrechen
        </Button>
        <Button type="submit" variant="primary" disabled={!title.trim()}>
          {task ? 'Speichern' : 'Aufgabe erstellen'}
        </Button>
      </div>
    </form>
  );
}
