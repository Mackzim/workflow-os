import { useWidgetConfig } from '@/hooks/useWidgetConfig';
import { formatToday } from '@/lib/utils/format';
import { Page, PageHeader } from '@/components/common/Page';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
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
  const { allOrdered, definitions, toggleWidget, moveWidget, resetWidgets } = useWidgetConfig();

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
            <p className="text-[11px] font-semibold uppercase tracking-wide text-content-faint">Widgets anpassen</p>
            <button
              type="button"
              onClick={resetWidgets}
              className="text-[11px] text-content-faint transition-colors hover:text-primary"
            >
              Zurücksetzen
            </button>
          </div>
          <div className="max-h-[60vh] space-y-0.5 overflow-y-auto">
            {allOrdered.map((w, i) => (
              <div key={w.kind} className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-surface-hover">
                <div className="flex flex-col">
                  <IconButton
                    icon="chevronUp"
                    label="Nach oben"
                    size={13}
                    className="h-4"
                    disabled={i === 0}
                    onClick={() => moveWidget(w.kind, -1)}
                  />
                  <IconButton
                    icon="chevronDown"
                    label="Nach unten"
                    size={13}
                    className="h-4"
                    disabled={i === allOrdered.length - 1}
                    onClick={() => moveWidget(w.kind, 1)}
                  />
                </div>
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
        </div>
      )}
    </Popover>
  );
}

export function DashboardPage() {
  return (
    <Page>
      <PageHeader
        title={greeting()}
        subtitle={formatToday()}
        actions={<WidgetSettings />}
      />
      <WidgetGrid />
    </Page>
  );
}
