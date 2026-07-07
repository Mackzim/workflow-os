import { forwardRef, memo, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import type { Priority, Task, TaskStatus } from '@/lib/tasks/taskTypes';
import { PRIORITIES, PRIORITY_META, STATUSES, STATUS_META } from '@/lib/tasks/taskTypes';
import { isOverdue } from '@/lib/tasks/taskUtils';
import { useTaskStore } from '@/store/useTaskStore';
import { cn } from '@/lib/utils/cn';
import { formatDueDate } from '@/lib/utils/format';
import { EASE, taskCreate } from '@/lib/motion/motionPresets';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Popover } from '@/components/ui/Popover';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';

export interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  index?: number;
}

const TaskCardBase = forwardRef<HTMLDivElement, TaskCardProps>(function TaskCardBase({ task, onEdit }, ref) {
  const reduced = useReducedMotion();
  const { toggleDone, setStatus, setPriority, deleteTask } = useTaskStore(
    useShallow((s) => ({
      toggleDone: s.toggleDone,
      setStatus: s.setStatus,
      setPriority: s.setPriority,
      deleteTask: s.deleteTask,
    })),
  );

  const done = task.status === 'done';
  const overdue = isOverdue(task);
  const dueLabel = formatDueDate(task.dueDate);

  // Completion sequence: glow + strike, then let the card leave (fade out).
  const [completing, setCompleting] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  useEffect(() => () => { if (timeoutRef.current) window.clearTimeout(timeoutRef.current); }, []);

  const showChecked = done || completing;
  const handleToggle = () => {
    if (done || reduced) {
      toggleDone(task.id);
      return;
    }
    if (completing) return;
    setCompleting(true);
    timeoutRef.current = window.setTimeout(() => toggleDone(task.id), 460);
  };

  return (
    <motion.div
      ref={ref}
      layout={!reduced}
      variants={taskCreate}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        'group relative flex gap-3 rounded-xl border border-border bg-surface px-3.5 py-3',
        'transition-colors duration-200 hover:border-border-strong hover:bg-surface-hover',
        done && 'opacity-60',
      )}
    >
      {/* Completion flourish: a turquoise outline draws around the card once, then fades out. */}
      {completing && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          <motion.rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            rx="12"
            fill="none"
            stroke="var(--color-secondary)"
            strokeWidth="2"
            pathLength={1}
            strokeDasharray="1"
            style={{ filter: 'drop-shadow(0 0 5px rgba(34,211,238,0.55))' }}
            initial={{ strokeDashoffset: 1, opacity: 0 }}
            animate={{ strokeDashoffset: 0, opacity: [0, 1, 1, 0] }}
            transition={{
              strokeDashoffset: { duration: 0.55, ease: EASE },
              opacity: { duration: 1, times: [0, 0.18, 0.62, 1], ease: 'easeOut' },
            }}
          />
        </svg>
      )}

      {/* Completion checkbox */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={done ? 'Als offen markieren' : 'Als erledigt markieren'}
        className={cn(
          'relative z-10 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-colors',
          done
            ? 'border-success bg-success/25 text-success'
            : completing
              ? 'border-secondary text-secondary'
              : 'border-border-strong text-transparent hover:border-primary hover:text-primary/40',
        )}
        style={completing && !done ? { backgroundColor: 'rgba(34, 211, 238, 0.22)' } : undefined}
      >
        <motion.span
          initial={false}
          animate={showChecked && !reduced ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.32 }}
        >
          <Icon name="check" size={14} strokeWidth={2.6} />
        </motion.span>
      </button>

      {/* Body */}
      <div className="relative z-10 min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="relative min-w-0 flex-1">
            <p
              className={cn(
                'text-sm font-medium leading-snug text-content transition-colors',
                (done || completing) && 'text-content-muted',
                done && 'line-through',
              )}
            >
              {task.title}
            </p>
          </div>

          {/* Hover actions */}
          <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
            {onEdit && <IconButton icon="edit" label="Bearbeiten" size={15} onClick={() => onEdit(task)} />}
            <IconButton icon="trash" label="Löschen" size={15} tone="danger" onClick={() => deleteTask(task.id)} />
          </div>
        </div>

        {task.description && (
          <p className="mt-1 line-clamp-2 whitespace-pre-line break-words text-[13px] leading-relaxed text-content-muted group-hover:line-clamp-none">
            {task.description}
          </p>
        )}

        {/* Meta row */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {/* Priority quick-change */}
          <Popover
            trigger={() => (
              <span className="cursor-pointer">
                <PriorityBadge priority={task.priority} />
              </span>
            )}
          >
            {(close) => (
              <QuickList
                title="Priorität"
                items={PRIORITIES.map((p) => ({
                  key: String(p),
                  label: PRIORITY_META[p].label,
                  color: PRIORITY_META[p].color,
                  active: p === task.priority,
                  onSelect: () => {
                    setPriority(task.id, p as Priority);
                    close();
                  },
                }))}
              />
            )}
          </Popover>

          {/* Status quick-change */}
          <Popover
            trigger={() => (
              <span className="cursor-pointer">
                <StatusBadge status={task.status} />
              </span>
            )}
          >
            {(close) => (
              <QuickList
                title="Status"
                items={STATUSES.map((st) => ({
                  key: st,
                  label: STATUS_META[st].label,
                  color: STATUS_META[st].color,
                  active: st === task.status,
                  onSelect: () => {
                    setStatus(task.id, st as TaskStatus);
                    close();
                  },
                }))}
              />
            )}
          </Popover>

          {task.category && (
            <span className="rounded-md border border-border bg-surface-elevated/60 px-1.5 py-0.5 text-[11px] text-content-muted">
              {task.category}
            </span>
          )}

          {dueLabel && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px]',
                overdue
                  ? 'border-critical/30 bg-critical/10 text-critical'
                  : 'border-border bg-surface-elevated/60 text-content-muted',
              )}
            >
              <Icon name="clock" size={12} />
              {dueLabel}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
});

interface QuickItem {
  key: string;
  label: string;
  color: string;
  active: boolean;
  onSelect: () => void;
}

function QuickList({ title, items }: { title: string; items: QuickItem[] }) {
  return (
    <div>
      <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-content-faint">
        {title}
      </p>
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          onClick={it.onSelect}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-colors',
            it.active ? 'bg-surface-hover text-content' : 'text-content-muted hover:bg-surface-hover hover:text-content',
          )}
        >
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: it.color }} />
          {it.label}
          {it.active && <Icon name="check" size={13} className="ml-auto text-primary" />}
        </button>
      ))}
    </div>
  );
}

export const TaskCard = memo(TaskCardBase);
