import { useSeoStore } from '@/store/useSeoStore';
import { WidgetShell } from './WidgetShell';

const int = (n: number) => n.toLocaleString('de-DE');
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
  const source = useSeoStore((s) => s.source);
  const kpis = useSeoStore((s) => s.dataset.kpis);
  const demo = source === 'demo';

  return (
    <WidgetShell
      title="SEO"
      icon="chart"
      subtitle="Search-Überblick"
      to="/seo"
      headerRight={
        demo ? (
          <span className="rounded-md border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-warning">
            Demo
          </span>
        ) : undefined
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <Mini label="Klicks" value={int(kpis.clicks)} />
        <Mini label="Impr." value={int(kpis.impressions)} />
        <Mini label="CTR" value={pct(kpis.ctr)} />
        <Mini label="Ø Pos." value={pos(kpis.position)} />
      </div>
    </WidgetShell>
  );
}
