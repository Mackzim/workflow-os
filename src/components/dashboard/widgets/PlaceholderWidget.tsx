import type { WidgetSize } from '@/lib/widgets/widgetTypes';
import type { WidgetDefinition } from '@/lib/widgets/widgetTypes';
import { WidgetShell } from './WidgetShell';
import { Icon, type IconName } from '@/components/ui/Icon';

const ICON_BY_KIND: Record<string, IconName> = {
  upcoming: 'calendar',
  notes: 'notes',
  automations: 'automations',
};

export function PlaceholderWidget({ def, size }: { def: WidgetDefinition; size: WidgetSize }) {
  const icon = ICON_BY_KIND[def.kind] ?? 'sparkle';
  return (
    <WidgetShell title={def.title} icon={icon} size={size} muted>
      <div className="flex h-full flex-col items-start justify-center gap-2 py-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-elevated px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-content-faint">
          <Icon name="clock" size={12} />
          In Vorbereitung
        </span>
        <p className="text-[12px] text-content-muted">{def.description}</p>
      </div>
    </WidgetShell>
  );
}
