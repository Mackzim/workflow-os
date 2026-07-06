import { listActions } from '@/lib/command/actionRegistry';
import { Page, PageHeader } from '@/components/common/Page';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { CommandCenter } from './CommandCenter';

export function CommandCenterPage() {
  const actions = listActions();

  return (
    <Page>
      <PageHeader
        title="Command Center"
        subtitle="Zentrale Steuerung – heute lokal, morgen über Claude."
        icon={<Icon name="command" size={20} />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-4">
            <CommandCenter autoFocus />
          </Card>
        </div>

        {/* Action Registry preview – shows the typed capability surface */}
        <Card>
          <CardHeader>
            <CardTitle>Action Registry</CardTitle>
            <span className="text-[11px] text-content-faint">{actions.length} Actions</span>
          </CardHeader>
          <CardBody className="space-y-1.5">
            {actions.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-[12px] text-content">{a.id}</p>
                  <p className="truncate text-[11px] text-content-faint">{a.title}</p>
                </div>
                <span
                  className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                  style={
                    a.implemented
                      ? { color: 'var(--color-success)', backgroundColor: 'rgba(52,211,153,0.1)' }
                      : { color: 'var(--color-text-faint)', backgroundColor: 'var(--color-surface-elevated)' }
                  }
                >
                  {a.implemented ? 'aktiv' : 'geplant'}
                </span>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </Page>
  );
}
