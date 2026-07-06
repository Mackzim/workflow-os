import { AnimatePresence, motion } from 'framer-motion';
import type { Task } from '@/lib/tasks/taskTypes';
import { staggerContainer } from '@/lib/motion/motionPresets';
import { EmptyState } from '@/components/ui/EmptyState';
import { TaskCard } from './TaskCard';

export interface TaskListProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  compact?: boolean;
}

export function TaskList({ tasks, onEdit, emptyTitle, emptyDescription, compact }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon="check"
        title={emptyTitle ?? 'Keine Aufgaben'}
        description={emptyDescription ?? 'Hier ist gerade alles erledigt.'}
        compact={compact}
      />
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col gap-2">
      <AnimatePresence initial={false} mode="popLayout">
        {tasks.map((task, i) => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} index={i} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
