import type { WidgetSize } from '@/lib/widgets/widgetTypes';
import { WidgetShell } from './WidgetShell';
import { CommandCenter } from '@/components/command/CommandCenter';

export function CommandWidget({ size }: { size: WidgetSize }) {
  return (
    <WidgetShell title="Command Center" icon="command" size={size} subtitle="Steuere die App per Befehl" to="/command">
      <CommandCenter compact showNotice={false} />
    </WidgetShell>
  );
}
