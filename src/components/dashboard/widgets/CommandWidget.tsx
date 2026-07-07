import { WidgetShell } from './WidgetShell';
import { CommandCenter } from '@/components/command/CommandCenter';

export function CommandWidget() {
  return (
    <WidgetShell title="Command Center" icon="command" subtitle="Steuere die App per Befehl" to="/command">
      <CommandCenter compact showNotice={false} />
    </WidgetShell>
  );
}
