import { useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useSeoStore } from '@/store/useSeoStore';
import type { SeoKpis } from '@/lib/seo/seoTypes';
import { cn } from '@/lib/utils/cn';
import { Page, PageHeader } from '@/components/common/Page';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { SeoTrendChart } from './SeoTrendChart';

const int = (n: number) => n.toLocaleString('de-DE');
const pct = (v: number) => `${(v * 100).toFixed(1).replace('.', ',')} %`;
const pos = (v: number) => v.toFixed(1).replace('.', ',');
const delta = (d: number) => `${d >= 0 ? '+' : ''}${(d * 100).toFixed(1).replace('.', ',')} %`;

interface Kpi {
  key: keyof SeoKpis;
  label: string;
  value: string;
  goodWhenUp: boolean;
}

function KpiCard({ kpi, deltaValue }: { kpi: Kpi; deltaValue?: number }) {
  const tone =
    deltaValue === undefined
      ? 'text-content-faint'
      : (kpi.goodWhenUp ? deltaValue >= 0 : deltaValue <= 0)
        ? 'text-success'
        : 'text-critical';
  return (
    <Card className="p-4">
      <p className="text-[11px] uppercase tracking-wide text-content-faint">{kpi.label}</p>
      <p className="mt-1.5 text-2xl font-semibold text-content">{kpi.value}</p>
      {deltaValue !== undefined && (
        <p className={cn('mt-1 text-[12px] font-medium', tone)}>
          {delta(deltaValue)} <span className="text-content-faint">vs. Vorperiode</span>
        </p>
      )}
    </Card>
  );
}

export function SeoPage() {
  const { source, dataset, importJson, resetToDemo } = useSeoStore(
    useShallow((s) => ({
      source: s.source,
      dataset: s.dataset,
      importJson: s.importJson,
      resetToDemo: s.resetToDemo,
    })),
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState<string | null>(null);

  const isDemo = source === 'demo';

  const kpis: Kpi[] = [
    { key: 'clicks', label: 'Klicks', value: int(dataset.kpis.clicks), goodWhenUp: true },
    { key: 'impressions', label: 'Impressionen', value: int(dataset.kpis.impressions), goodWhenUp: true },
    { key: 'ctr', label: 'CTR', value: pct(dataset.kpis.ctr), goodWhenUp: true },
    { key: 'position', label: 'Ø Position', value: pos(dataset.kpis.position), goodWhenUp: false },
  ];

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const okDone = importJson(String(reader.result));
      setNote(okDone ? 'Daten importiert.' : 'Import fehlgeschlagen – ungültiges Format (erwartet: Search-Console-JSON).');
    };
    reader.readAsText(file);
  };

  return (
    <Page>
      <PageHeader
        title="SEO Überblick"
        subtitle={`${dataset.property} · ${dataset.range}`}
        icon={<Icon name="chart" size={20} />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Icon name="arrowRight" size={15} />}
              onClick={() => fileRef.current?.click()}
            >
              Daten importieren
            </Button>
            <Button size="sm" variant="ghost" disabled title="Google-Search-Console-Anbindung kommt später">
              Search Console · bald
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
                e.target.value = '';
              }}
            />
          </div>
        }
      />

      {isDemo && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
          <Icon name="info" size={18} className="mt-0.5 shrink-0 text-warning" />
          <div className="text-[13px]">
            <p className="font-medium text-content">Demo-Ansicht – keine echten Daten verbunden.</p>
            <p className="mt-0.5 text-content-muted">
              Alle Zahlen unten sind Platzhalter. Importiere einen Search-Console-Export (JSON) oder verbinde später
              Google Search Console. Struktur ist dafür vorbereitet.
            </p>
          </div>
        </div>
      )}

      {note && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-2.5 text-[13px]">
          <span className="text-content">{note}</span>
          {source === 'import' && (
            <button
              type="button"
              onClick={() => {
                resetToDemo();
                setNote(null);
              }}
              className="text-[12px] text-content-faint transition-colors hover:text-primary"
            >
              Zurück zur Demo
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.key} kpi={k} deltaValue={dataset.deltas?.[k.key]} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Verlauf · Klicks (28 Tage)</CardTitle>
            {isDemo && <SourceBadge />}
          </CardHeader>
          <CardBody>
            <div className="h-40 w-full">
              <SeoTrendChart series={dataset.series} metric="clicks" className="h-full w-full" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kurz erklärt</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 text-[12px] text-content-muted">
            <Legend label="Klicks" text="Aufrufe aus der Google-Suche." />
            <Legend label="Impressionen" text="Wie oft du in den Ergebnissen erschienst." />
            <Legend label="CTR" text="Klicks ÷ Impressionen." />
            <Legend label="Ø Position" text="Durchschnittsrang – niedriger ist besser." />
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Top-Suchbegriffe</CardTitle>
          {isDemo && <SourceBadge />}
        </CardHeader>
        <CardBody className="px-0 pb-0">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-content-faint">
                  <th className="px-5 py-2 font-medium">Suchbegriff</th>
                  <th className="px-3 py-2 text-right font-medium">Klicks</th>
                  <th className="px-3 py-2 text-right font-medium">Impr.</th>
                  <th className="px-3 py-2 text-right font-medium">CTR</th>
                  <th className="px-5 py-2 text-right font-medium">Pos.</th>
                </tr>
              </thead>
              <tbody>
                {dataset.topQueries.map((q) => (
                  <tr key={q.query} className="border-b border-border/60 last:border-0 hover:bg-surface-hover/50">
                    <td className="px-5 py-2.5 text-content">{q.query}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-content">{int(q.clicks)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-content-muted">{int(q.impressions)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-content-muted">{pct(q.ctr)}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-content-muted">{pos(q.position)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </Page>
  );
}

function SourceBadge() {
  return (
    <span className="rounded-md border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-warning">
      Demo
    </span>
  );
}

function Legend({ label, text }: { label: string; text: string }) {
  return (
    <p>
      <span className="font-medium text-content">{label}:</span> {text}
    </p>
  );
}
