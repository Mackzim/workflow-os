import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useSeoStore } from '@/store/useSeoStore';
import { Icon } from '@/components/ui/Icon';
import { WidgetShell } from './WidgetShell';

const int = (n: number) => Math.round(n).toLocaleString('de-DE');
const pct = (v: number) => `${(v * 100).toFixed(1).replace('.', ',')} %`;
const pos = (v: number) => v.toFixed(1).replace('.', ',');

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-2.5 py-2">
      <span className="block text-base font-semibold leading-none text-content">{value}</span>
      <p className="mt-1 text-[10px] uppercase tracking-wide text-content-faint">{label}</p>
    </div>
  );
}

export function SeoWidget() {
  const { report, fetchReport } = useSeoStore(
    useShallow((s) => ({ report: s.report, fetchReport: s.fetchReport })),
  );

  useEffect(() => {
    void fetchReport();
  }, [fetchReport]);

  const connected = report?.connected === true;
  const k = report?.kpis;

  return (
    <WidgetShell
      title="SEO"
      icon="chart"
      subtitle="Search Console"
      to="/seo"
      headerRight={
        connected ? undefined : (
          <span className="rounded-md border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-warning">
            offen
          </span>
        )
      }
    >
      {connected && k ? (
        <div className="grid grid-cols-2 gap-2">
          <Mini label="Klicks" value={int(k.clicks)} />
          <Mini label="Impr." value={int(k.impressions)} />
          <Mini label="CTR" value={pct(k.ctr)} />
          <Mini label="Ø Pos." value={pos(k.position)} />
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1.5 py-3 text-center">
          <Icon name="chart" size={18} className="text-content-faint" />
          <p className="text-[12px] text-content-muted">Search Console verbinden</p>
          <span className="text-[11px] text-primary">Einrichten →</span>
        </div>
      )}
    </WidgetShell>
  );
}
