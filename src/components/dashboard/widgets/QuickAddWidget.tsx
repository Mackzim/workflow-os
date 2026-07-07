import { WidgetShell } from './WidgetShell';
import { QuickAddTask } from '@/components/tasks/QuickAddTask';

export function QuickAddWidget() {
  return (
    <WidgetShell title="Quick Add" icon="plus">
      <div className="flex h-full flex-col justify-center">
        <QuickAddTask />
        <p className="mt-2 text-[11px] text-content-faint">
          Enter erstellt die Aufgabe. Priorität über den Chip rechts.
        </p>
      </div>
    </WidgetShell>
  );
}
