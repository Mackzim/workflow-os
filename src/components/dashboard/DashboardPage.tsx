import { useWidgetConfig } from '@/hooks/useWidgetConfig';
import { formatToday } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { Page, PageHeader } from '@/components/common/Page';
import { Icon } from '@/components/ui/Icon';
import { Popover } from '@/components/ui/Popover';
import { Toggle } from '@/components/ui/Toggle';
import { WidgetGrid } from './WidgetGrid';

function greeting(ref = new Date()): string {
  const h = ref.getHours();
  if (h < 11) return 'Guten Morgen';
  if (h < 18) return 'Guten Tag';
  return 'Guten Abend';
}

function WidgetSettings() {
  const { allOrdered, definitions, orderedEnabled, toggleWidget, resetDashboard } = useWidgetConfig();

  return (
    <Popover
      align="right"
      panelClassName="w-72"
      trigger={(open) => (
        <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border-strong bg-surface-elevated px-3 text-[13px] font-medium text-content transition-colors hover:bg-surface-hover">
          <Icon name="dashboard" size={15} />
          Widgets
          <Icon name={open ? 'chevronUp' : 'chevronDown'} size={14} />
        </span>
      )}
    >
      {() => (
        <div>
          <div className="flex items-center justify-between px-1.5 pb-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-content-faint">Widgets</p>
            <button
              type="button"
              onClick={resetDashboard}
              className="text-[11px] text-content-faint transition-colors hover:text-primary"
            >
              Layout zurücksetzen
            </button>
          </div>
          <div className="max-h-[60vh] space-y-0.5 overflow-y-auto">
            {allOrdered.map((w) => (
              <div key={w.kind} className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-surface-hover">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-content">{definitions[w.kind].title}</p>
                  {definitions[w.kind].placeholder && (
                    <p className="text-[10px] text-content-faint">In Vorbereitung</p>
                  )}
                </div>
                <Toggle checked={w.enabled} onChange={() => toggleWidget(w.kind)} label={definitions[w.kind].title} />
              </div>
            ))}
          </div>
          <p className="px-1.5 pt-2 text-[10px] text-content-faint">
            {orderedEnabled.length} aktiv · Anordnen &amp; Größe über „Anpassen“.
          </p>
        </div>
      )}
    </Popover>
  );
}

function EditToggle() {
  const { editing, setEditing } = useWidgetConfig();
  return (
    <button
      type="button"
      onClick={() => setEditing(!editing)}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition-colors',
        editing
          ? 'border-primary bg-primary text-white hover:bg-primary-strong'
          : 'border-border-strong bg-surface-elevated text-content hover:bg-surface-hover',
      )}
    >
      <Icon name={editing ? 'check' : 'edit'} size={15} />
      {editing ? 'Fertig' : 'Anpassen'}
    </button>
  );
}

export function DashboardPage() {
  const { editing } = useWidgetConfig();

  return (
    <Page>
      <PageHeader
        title={greeting()}
        subtitle={editing ? 'Ziehen zum Anordnen · Ecke ziehen für Größe' : formatToday()}
        actions={
          <>
            <WidgetSettings />
            <EditToggle />
          </>
        }
      />
      <WidgetGrid />
    </Page>
  );
}
