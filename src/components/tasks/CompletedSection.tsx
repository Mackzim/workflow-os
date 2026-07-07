import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Task } from '@/lib/tasks/taskTypes';
import { EASE } from '@/lib/motion/motionPresets';
import { Icon } from '@/components/ui/Icon';
import { TaskList } from './TaskList';

export interface CompletedSectionProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  defaultOpen?: boolean;
}

/** Done tasks tucked into a collapsible "Erledigt (N)" section. Collapsed by default. */
export function CompletedSection({ tasks, onEdit, defaultOpen = false }: CompletedSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const reduced = useReducedMotion();

  return (
    <div className="mt-3 border-t border-border pt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-[13px] font-medium text-content-muted transition-colors hover:text-content"
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: reduced ? 0 : 0.2, ease: EASE }}
          className="text-content-faint"
        >
          <Icon name="chevronRight" size={16} />
        </motion.span>
        <span>Erledigt</span>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-elevated px-1.5 text-[11px] text-content-muted">
          {tasks.length}
        </span>
        <span className="ml-auto flex items-center gap-1 text-[11px] text-content-faint">
          <Icon name="check" size={13} className="text-success" />
          {open ? 'ausblenden' : 'anzeigen'}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="done-body"
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pt-2">
              <TaskList tasks={tasks} onEdit={onEdit} compact />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
