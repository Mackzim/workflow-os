import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { Priority } from '@/lib/tasks/taskTypes';
import { PRIORITIES, PRIORITY_META } from '@/lib/tasks/taskTypes';
import { useTaskStore } from '@/store/useTaskStore';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Popover } from '@/components/ui/Popover';

export interface QuickAddTaskProps {
  compact?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
}

/**
 * Fast task entry. Enter creates the task. A priority chip lets the user set
 * importance without leaving the keyboard flow.
 */
export function QuickAddTask({ compact, autoFocus, placeholder }: QuickAddTaskProps) {
  const addTask = useTaskStore(useShallow((s) => s.addTask));
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>(3);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    addTask({ title: trimmed, priority });
    setTitle('');
    inputRef.current?.focus();
  };

  const meta = PRIORITY_META[priority];

  return (
    <form
      onSubmit={submit}
      className={cn(
        'flex items-center gap-2 rounded-xl border border-border bg-surface px-2 py-1.5',
        'focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15 transition-colors',
      )}
    >
      <span className="pl-1 text-content-faint">
        <Icon name="plus" size={18} />
      </span>
      <input
        ref={inputRef}
        value={title}
        autoFocus={autoFocus}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder ?? 'Neue Aufgabe … (Enter)'}
        className="min-w-0 flex-1 bg-transparent text-sm text-content placeholder:text-content-faint focus:outline-none"
      />

      <Popover
        align="right"
        trigger={() => (
          <span
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold"
            style={{ color: meta.color, borderColor: `${meta.color}33`, backgroundColor: `${meta.color}12` }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
            {meta.short}
          </span>
        )}
      >
        {(close) => (
          <div>
            <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-content-faint">
              Priorität
            </p>
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPriority(p);
                  close();
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-colors',
                  p === priority ? 'bg-surface-hover text-content' : 'text-content-muted hover:bg-surface-hover',
                )}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PRIORITY_META[p].color }} />
                {PRIORITY_META[p].label}
              </button>
            ))}
          </div>
        )}
      </Popover>

      {!compact && (
        <Button type="submit" size="sm" variant="primary" disabled={!title.trim()}>
          Add
        </Button>
      )}
    </form>
  );
}
