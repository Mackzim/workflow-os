import { useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import type { SeoMetric, SeoReport } from '@/lib/seo/seoTypes';
import { cn } from '@/lib/utils/cn';
import { Page, PageHeader } from '@/components/common/Page';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Icon } from '@/components/ui/Icon';
import { SeoTrendChart } from './SeoTrendChart';

/* ---- formatting ---- */
const int = (n: number) => Math.round(n).toLocaleString('de-DE');
const pct = (v: number) => `${(v * 100).toFixed(1).replace('.', ',')} %`;
const pos = (v: number) => v.toFixed(1).replace('.', ',');
const delta = (d: number) => `${d >= 0 ? '+' : ''}${(d * 100).toFixed(1).replace('.', ',')} %`;

const METRICS: { key: SeoMetric; label: string; fmt: (n: number) => string; goodUp: boolean }[] = [
  { key: 'clicks', label: 'Klicks', fmt: int, goodUp: true },
  { key: 'impressions', label: 'Impressionen', fmt: int, goodUp: true },
  { key: 'ctr', label: 'CTR', fmt: pct, goodUp: true },
  { key: 'position', label: 'Ø Position', fmt: pos, goodUp: false },
];

const RANGES = [
  { k: '7', label: '7 Tage', days: 7 },
  { k: '28', label: '28 Tage', days: 28 },
  { k: '90', label: '90 Tage', days: 90 },
  { k: '180', label: '6 Monate', days: 180 },
  { k: '365', label: '12 Monate', days: 365 },
  { k: '480', label: '16 Monate', days: 480 },
  { k: 'custom', label: 'Eigener Zeitraum', days: 0 },
];
const TYPES = [
  { value: 'web', label: 'Web' },
  { value: 'image', label: 'Bild' },
  { value: 'video', label: 'Video' },
  { value: 'news', label: 'News' },
];
const QOPS = [
  { value: 'contains', label: 'enthält' },
  { value: 'equals', label: 'ist genau' },
  { value: 'notContains', label: 'enthält nicht' },
  { value: 'regex', label: 'Regex' },
];

const DEVICE_LABEL: Record<string, string> = { DESKTOP: 'Desktop', MOBILE: 'Mobil', TABLET: 'Tablet' };
const COUNTRY_LABEL: Record<string, string> = {
  deu: 'Deutschland', aut: 'Österreich', che: 'Schweiz', usa: 'USA', gbr: 'UK', fra: 'Frankreich',
  ita: 'Italien', nld: 'Niederlande', pol: 'Polen', esp: 'Spanien', bel: 'Belgien', cze: 'Tschechien',
};

type Tab = 'query' | 'page' | 'country' | 'device' | 'date';
interface Row {
  label: string;
  title?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

function prettyPath(url: string): string {
  try {
    const u = new URL(url);
    return (u.pathname + u.search) || '/';
  } catch {
    return url;
  }
}

export function SeoPage() {
  // filters / view state
  const [rangeKey, setRangeKey] = useState('28');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [compare, setCompare] = useState(false);
  const [type, setType] = useState('web');
  const [qf, setQf] = useState('');
  const [qop, setQop] = useState('contains');
  const [pf, setPf] = useState('');
  const [qfInput, setQfInput] = useState('');
  const [pfInput, setPfInput] = useState('');

  const [metric, setMetric] = useState<SeoMetric>('clicks');
  const [tab, setTab] = useState<Tab>('query');
  const [sort, setSort] = useState<{ key: keyof Row; dir: 'asc' | 'desc' }>({ key: 'clicks', dir: 'desc' });

  const [report, setReport] = useState<SeoReport | null>(null);
  const [loading, setLoading] = useState(true);

  const days = RANGES.find((r) => r.k === rangeKey)?.days ?? 28;
  const isCustom = rangeKey === 'custom';
  const customReady = isCustom ? Boolean(customStart && customEnd && customStart <= customEnd) : true;

  useEffect(() => {
    if (!customReady) return;
    const p = new URLSearchParams();
    if (isCustom) {
      p.set('start', customStart);
      p.set('end', customEnd);
    } else {
      p.set('days', String(days));
    }
    if (compare) p.set('compare', '1');
    if (type !== 'web') p.set('type', type);
    if (qf) {
      p.set('qf', qf);
      if (qop !== 'contains') p.set('qop', qop);
    }
    if (pf) p.set('pf', pf);

    let alive = true;
    setLoading(true);
    fetch(`/api/seo?${p.toString()}`, { headers: { accept: 'application/json' } })
      .then((r) => r.json())
      .then((r: SeoReport) => alive && setReport(r))
      .catch((e) => alive && setReport({ connected: false, reason: 'unreachable', error: String(e?.message ?? e) }))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [isCustom, customStart, customEnd, customReady, days, compare, type, qf, qop, pf]);

  const connected = report?.connected === true;

  const rows: Row[] = useMemo(() => {
    if (!report) return [];
    if (tab === 'query') return (report.topQueries ?? []).map((r) => ({ label: r.query, ...r }));
    if (tab === 'page') return (report.topPages ?? []).map((r) => ({ label: prettyPath(r.page), title: r.page, ...r }));
    if (tab === 'country')
      return (report.countries ?? []).map((r) => ({ label: COUNTRY_LABEL[r.country] ?? r.country.toUpperCase(), ...r }));
    if (tab === 'device') return (report.devices ?? []).map((r) => ({ label: DEVICE_LABEL[r.device] ?? r.device, ...r }));
    return (report.series ?? []).map((r) => ({ label: r.date, ...r }));
  }, [report, tab]);

  const sortedRows = useMemo(() => {
    const arr = [...rows];
    const { key, dir } = sort;
    arr.sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return dir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [rows, sort]);

  const applyFilters = () => {
    setQf(qfInput.trim());
    setPf(pfInput.trim());
  };

  return (
    <Page>
      <PageHeader
        title="SEO Überblick"
        subtitle={connected ? `${report?.siteUrl} · ${report?.range?.start} – ${report?.range?.end}` : 'Google Search Console'}
        icon={<Icon name="chart" size={20} />}
        actions={
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Icon name="reset" size={15} className={loading ? 'animate-spin' : undefined} />}
            onClick={() => setReport((r) => (r ? { ...r } : r))}
          >
            {loading ? 'Lädt …' : 'Aktuell'}
          </Button>
        }
      />

      {/* Toolbar */}
      <Card className="mb-4">
        <CardBody className="flex flex-wrap items-end gap-3">
          <Field label="Zeitraum">
            <Select sizing="sm" value={rangeKey} onChange={(e) => setRangeKey(e.target.value)} options={RANGES.map((r) => ({ value: r.k, label: r.label }))} />
          </Field>
          {isCustom && (
            <>
              <Field label="Von">
                <Input sizing="sm" type="date" value={customStart} max={customEnd || undefined} onChange={(e) => setCustomStart(e.target.value)} />
              </Field>
              <Field label="Bis">
                <Input sizing="sm" type="date" value={customEnd} min={customStart || undefined} onChange={(e) => setCustomEnd(e.target.value)} />
              </Field>
            </>
          )}
          <Field label="Suchtyp">
            <Select sizing="sm" value={type} onChange={(e) => setType(e.target.value)} options={TYPES} />
          </Field>
          <Field label="Suchbegriff-Filter">
            <div className="flex gap-1.5">
              <Select sizing="sm" className="w-28" value={qop} onChange={(e) => setQop(e.target.value)} options={QOPS} />
              <Input
                sizing="sm"
                className="w-40"
                placeholder="z. B. modellbau"
                value={qfInput}
                onChange={(e) => setQfInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                onBlur={applyFilters}
              />
            </div>
          </Field>
          <Field label="Seiten-Filter (URL enthält)">
            <Input
              sizing="sm"
              className="w-44"
              placeholder="z. B. /produkt/"
              value={pfInput}
              onChange={(e) => setPfInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              onBlur={applyFilters}
            />
          </Field>
          <label className="flex cursor-pointer select-none items-center gap-2 pb-1.5 text-[13px] text-content-muted">
            <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} className="h-3.5 w-3.5 accent-primary" />
            Vorperiode vergleichen
          </label>
        </CardBody>
      </Card>

      {!report && loading && <Skeleton />}
      {report && !connected && <SetupCard report={report} />}

      {connected && (
        <div className="space-y-4">
          {/* KPI cards (click to plot that metric) */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {METRICS.map((m) => {
              const val = report!.kpis![m.key];
              const d = report!.deltas?.[m.key];
              const tone = d === undefined ? 'text-content-faint' : (m.goodUp ? d >= 0 : d <= 0) ? 'text-success' : 'text-critical';
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMetric(m.key)}
                  className={cn(
                    'rounded-2xl border bg-surface p-4 text-left shadow-card transition-colors',
                    metric === m.key ? 'border-primary/60 ring-1 ring-primary/30' : 'border-border hover:border-border-strong',
                  )}
                >
                  <p className="text-[11px] uppercase tracking-wide text-content-faint">{m.label}</p>
                  <p className="mt-1.5 text-2xl font-semibold text-content">{m.fmt(val)}</p>
                  {d !== undefined && <p className={cn('mt-1 text-[12px] font-medium', tone)}>{delta(d)}</p>}
                </button>
              );
            })}
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Verlauf · {METRICS.find((m) => m.key === metric)?.label}</CardTitle>
              <div className="flex items-center gap-1">
                {METRICS.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMetric(m.key)}
                    className={cn(
                      'rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
                      metric === m.key ? 'bg-primary text-white' : 'text-content-muted hover:text-content',
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardBody>
              {report!.series && report!.series.length > 1 ? (
                <>
                  <div className="h-44 w-full">
                    <SeoTrendChart series={report!.series} prevSeries={compare ? report!.prevSeries : undefined} metric={metric} className="h-full w-full" />
                  </div>
                  {compare && report!.prevRange && (
                    <p className="mt-2 text-[11px] text-content-faint">
                      Gestrichelt = Vorperiode ({report!.prevRange.start} – {report!.prevRange.end}).
                    </p>
                  )}
                </>
              ) : (
                <Empty text="Keine Verlaufsdaten im Zeitraum." />
              )}
            </CardBody>
          </Card>

          {/* Dimension tabs + sortable table */}
          <Card>
            <CardHeader className="flex-wrap gap-2">
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    ['query', 'Suchbegriffe'],
                    ['page', 'Seiten'],
                    ['country', 'Länder'],
                    ['device', 'Geräte'],
                    ['date', 'Datum'],
                  ] as [Tab, string][]
                ).map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setTab(k);
                      setSort({ key: k === 'date' ? 'label' : 'clicks', dir: k === 'date' ? 'asc' : 'desc' });
                    }}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors',
                      tab === k ? 'bg-primary-soft text-primary' : 'text-content-muted hover:bg-surface-hover hover:text-content',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-content-faint">{sortedRows.length} Zeilen</span>
            </CardHeader>
            <CardBody className="px-0 pb-0">
              {sortedRows.length === 0 ? (
                <div className="px-5 pb-5">
                  <Empty text="Keine Daten im Zeitraum." />
                </div>
              ) : (
                <div className="max-h-[28rem] overflow-auto">
                  <table className="w-full text-[13px]">
                    <thead className="sticky top-0 z-10 bg-surface">
                      <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-content-faint">
                        <Th onClick={() => toggleSort(setSort, 'label')} sort={sort} k="label" className="px-5">
                          {tab === 'query' ? 'Suchbegriff' : tab === 'page' ? 'Seite' : tab === 'country' ? 'Land' : tab === 'device' ? 'Gerät' : 'Datum'}
                        </Th>
                        <Th onClick={() => toggleSort(setSort, 'clicks')} sort={sort} k="clicks" align="right">Klicks</Th>
                        <Th onClick={() => toggleSort(setSort, 'impressions')} sort={sort} k="impressions" align="right">Impr.</Th>
                        <Th onClick={() => toggleSort(setSort, 'ctr')} sort={sort} k="ctr" align="right">CTR</Th>
                        <Th onClick={() => toggleSort(setSort, 'position')} sort={sort} k="position" align="right" className="px-5">Pos.</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRows.map((r, i) => (
                        <tr key={`${r.label}-${i}`} className="border-b border-border/60 last:border-0 hover:bg-surface-hover/50">
                          <td className="max-w-[22rem] truncate px-5 py-2 text-content" title={r.title ?? r.label}>{r.label}</td>
                          <td className="px-2 py-2 text-right tabular-nums text-content">{int(r.clicks)}</td>
                          <td className="px-2 py-2 text-right tabular-nums text-content-muted">{int(r.impressions)}</td>
                          <td className="px-2 py-2 text-right tabular-nums text-content-muted">{pct(r.ctr)}</td>
                          <td className="px-5 py-2 text-right tabular-nums text-content-muted">{pos(r.position)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </Page>
  );
}

function toggleSort(setSort: Dispatch<SetStateAction<{ key: keyof Row; dir: 'asc' | 'desc' }>>, key: keyof Row) {
  setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'label' ? 'asc' : 'desc' }));
}

function Th({
  children,
  onClick,
  sort,
  k,
  align,
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  sort: { key: keyof Row; dir: 'asc' | 'desc' };
  k: keyof Row;
  align?: 'right';
  className?: string;
}) {
  const active = sort.key === k;
  return (
    <th className={cn('px-2 py-2 font-medium', align === 'right' && 'text-right', className)}>
      <button type="button" onClick={onClick} className={cn('inline-flex items-center gap-1 hover:text-content', active && 'text-content')}>
        {children}
        {active && <Icon name={sort.dir === 'asc' ? 'chevronUp' : 'chevronDown'} size={12} />}
      </button>
    </th>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-content-faint">{label}</p>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-6 text-center text-[13px] text-content-muted">{text}</p>;
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-surface" />
        ))}
      </div>
      <div className="h-56 animate-pulse rounded-2xl border border-border bg-surface" />
    </div>
  );
}

const SETUP: Record<string, { title: string; hint: string }> = {
  no_credentials: { title: 'Search Console nicht verbunden', hint: 'Kein Google-Dienstkonto hinterlegt (Env GSC_SERVICE_ACCOUNT_JSON).' },
  no_site: { title: 'Property fehlt', hint: 'Setze GSC_SITE_URL, z. B. sc-domain:pichler.de.' },
  forbidden: { title: 'Zugriff verweigert', hint: 'Dienstkonto-E-Mail ist noch nicht als Nutzer der Property freigegeben – oder die Property-URL stimmt nicht.' },
  unreachable: { title: 'Function nicht erreichbar', hint: 'Lokal (npm run dev) laufen die Functions nicht – das klappt erst auf der deployten Seite.' },
  error: { title: 'Fehler beim Abruf', hint: 'Beim Laden der Search-Console-Daten ging etwas schief.' },
};

function SetupCard({ report }: { report: SeoReport }) {
  const info = SETUP[report.reason ?? 'error'] ?? SETUP.error;
  return (
    <Card>
      <CardBody className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-warning/30 bg-warning/10 text-warning">
          <Icon name="alert" size={18} />
        </span>
        <div>
          <p className="text-sm font-semibold text-content">{info.title}</p>
          <p className="mt-1 text-[13px] text-content-muted">{info.hint}</p>
          {report.error && <p className="mt-1 break-words font-mono text-[11px] text-content-faint">{report.error}</p>}
        </div>
      </CardBody>
    </Card>
  );
}
