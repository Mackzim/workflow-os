import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useSeoStore } from '@/store/useSeoStore';
import type { SeoKpis, SeoReport } from '@/lib/seo/seoTypes';
import { cn } from '@/lib/utils/cn';
import { Page, PageHeader } from '@/components/common/Page';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { SeoTrendChart } from './SeoTrendChart';

const int = (n: number) => Math.round(n).toLocaleString('de-DE');
const pct = (v: number) => `${(v * 100).toFixed(1).replace('.', ',')} %`;
const pos = (v: number) => v.toFixed(1).replace('.', ',');
const delta = (d: number) => `${d >= 0 ? '+' : ''}${(d * 100).toFixed(1).replace('.', ',')} %`;

const DEVICE_LABEL: Record<string, string> = { DESKTOP: 'Desktop', MOBILE: 'Mobil', TABLET: 'Tablet' };
const COUNTRY_LABEL: Record<string, string> = {
  deu: 'Deutschland', aut: 'Österreich', che: 'Schweiz', usa: 'USA', gbr: 'UK', fra: 'Frankreich',
  ita: 'Italien', nld: 'Niederlande', pol: 'Polen', esp: 'Spanien',
};

const RANGES = [7, 28, 90];

export function SeoPage() {
  const { report, loading, days, fetchReport } = useSeoStore(
    useShallow((s) => ({ report: s.report, loading: s.loading, days: s.days, fetchReport: s.fetchReport })),
  );

  useEffect(() => {
    void fetchReport();
  }, [fetchReport]);

  const connected = report?.connected === true;

  return (
    <Page>
      <PageHeader
        title="SEO Überblick"
        subtitle={connected ? `${report?.siteUrl} · letzte ${days} Tage` : 'Google Search Console'}
        icon={<Icon name="chart" size={20} />}
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl border border-border-strong bg-surface-elevated p-0.5">
              {RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => fetchReport(r, true)}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-[12px] font-medium transition-colors',
                    days === r ? 'bg-primary text-white' : 'text-content-muted hover:text-content',
                  )}
                >
                  {r}T
                </button>
              ))}
            </div>
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Icon name="reset" size={15} className={loading ? 'animate-spin' : undefined} />}
              onClick={() => fetchReport(days, true)}
            >
              Aktualisieren
            </Button>
          </div>
        }
      />

      {!report && loading && <Skeleton />}

      {report && !connected && <SetupCard report={report} />}

      {connected && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard label="Klicks" value={int(report!.kpis!.clicks)} d={report!.deltas?.clicks} goodUp />
            <KpiCard label="Impressionen" value={int(report!.kpis!.impressions)} d={report!.deltas?.impressions} goodUp />
            <KpiCard label="CTR" value={pct(report!.kpis!.ctr)} d={report!.deltas?.ctr} goodUp />
            <KpiCard label="Ø Position" value={pos(report!.kpis!.position)} d={report!.deltas?.position} goodUp={false} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Verlauf · Klicks</CardTitle>
              <span className="text-[11px] text-content-faint">{report!.range?.start} – {report!.range?.end}</span>
            </CardHeader>
            <CardBody>
              {report!.series && report!.series.length > 1 ? (
                <div className="h-40 w-full">
                  <SeoTrendChart series={report!.series} metric="clicks" className="h-full w-full" />
                </div>
              ) : (
                <Empty text="Noch keine Verlaufsdaten im Zeitraum." />
              )}
            </CardBody>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TableCard
              title="Top-Suchbegriffe"
              first="Suchbegriff"
              rows={(report!.topQueries ?? []).map((q) => ({ label: q.query, ...q }))}
            />
            <TableCard
              title="Top-Seiten"
              first="Seite"
              rows={(report!.topPages ?? []).map((p) => ({ label: prettyPath(p.page), ...p }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <BreakdownCard
              title="Geräte"
              rows={(report!.devices ?? []).map((d) => ({ label: DEVICE_LABEL[d.device] ?? d.device, clicks: d.clicks, ctr: d.ctr }))}
            />
            <BreakdownCard
              title="Länder"
              rows={(report!.countries ?? []).map((c) => ({ label: COUNTRY_LABEL[c.country] ?? c.country.toUpperCase(), clicks: c.clicks, ctr: c.ctr }))}
            />
          </div>
        </div>
      )}
    </Page>
  );
}

/* ---------- pieces ---------- */

function KpiCard({ label, value, d, goodUp }: { label: string; value: string; d?: number; goodUp: boolean }) {
  const tone = d === undefined ? 'text-content-faint' : (goodUp ? d >= 0 : d <= 0) ? 'text-success' : 'text-critical';
  return (
    <Card className="p-4">
      <p className="text-[11px] uppercase tracking-wide text-content-faint">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold text-content">{value}</p>
      {d !== undefined && (
        <p className={cn('mt-1 text-[12px] font-medium', tone)}>
          {delta(d)} <span className="text-content-faint">vs. Vorperiode</span>
        </p>
      )}
    </Card>
  );
}

interface TableRow extends SeoKpis {
  label: string;
}

function TableCard({ title, first, rows }: { title: string; first: string; rows: TableRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody className="px-0 pb-0">
        {rows.length === 0 ? (
          <div className="px-5 pb-5">
            <Empty text="Keine Daten im Zeitraum." />
          </div>
        ) : (
          <div className="max-h-80 overflow-auto">
            <table className="w-full text-[13px]">
              <thead className="sticky top-0 bg-surface">
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-content-faint">
                  <th className="px-5 py-2 font-medium">{first}</th>
                  <th className="px-2 py-2 text-right font-medium">Klicks</th>
                  <th className="px-2 py-2 text-right font-medium">Impr.</th>
                  <th className="px-2 py-2 text-right font-medium">CTR</th>
                  <th className="px-5 py-2 text-right font-medium">Pos.</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={`${r.label}-${i}`} className="border-b border-border/60 last:border-0 hover:bg-surface-hover/50">
                    <td className="max-w-[16rem] truncate px-5 py-2 text-content" title={r.label}>{r.label}</td>
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
  );
}

function BreakdownCard({ title, rows }: { title: string; rows: { label: string; clicks: number; ctr: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.clicks));
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody className="space-y-2.5">
        {rows.length === 0 ? (
          <Empty text="Keine Daten im Zeitraum." />
        ) : (
          rows.map((r) => (
            <div key={r.label}>
              <div className="mb-1 flex items-baseline justify-between text-[13px]">
                <span className="text-content">{r.label}</span>
                <span className="tabular-nums text-content-muted">
                  {int(r.clicks)} <span className="text-content-faint">· {pct(r.ctr)}</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-elevated">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  style={{ width: `${Math.max(3, (r.clicks / max) * 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardBody>
    </Card>
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
      <div className="h-52 animate-pulse rounded-2xl border border-border bg-surface" />
    </div>
  );
}

const SETUP: Record<string, { title: string; hint: string }> = {
  no_credentials: {
    title: 'Search Console noch nicht verbunden',
    hint: 'Es ist noch kein Google-Dienstkonto hinterlegt. Trag den Service-Account-Key als Netlify-Umgebungsvariable GSC_SERVICE_ACCOUNT_JSON ein.',
  },
  no_site: {
    title: 'Property fehlt',
    hint: 'Setz die Netlify-Umgebungsvariable GSC_SITE_URL auf deine Property, z. B. sc-domain:pichler.de oder https://www.pichler.de/.',
  },
  forbidden: {
    title: 'Zugriff verweigert',
    hint: 'Die Dienstkonto-E-Mail ist in der Search Console noch nicht als Nutzer der Property freigegeben – oder die Property-URL stimmt nicht.',
  },
  unreachable: {
    title: 'Function nicht erreichbar',
    hint: 'Die SEO-Function antwortet nicht. Lokal (npm run dev) gibt es keine Netlify-Functions – das klappt erst auf der deployten Seite.',
  },
  error: { title: 'Fehler beim Abruf', hint: 'Beim Laden der Search-Console-Daten ging etwas schief.' },
};

function SetupCard({ report }: { report: SeoReport }) {
  const info = SETUP[report.reason ?? 'error'] ?? SETUP.error;
  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-warning/30 bg-warning/10 text-warning">
            <Icon name="alert" size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-content">{info.title}</p>
            <p className="mt-1 text-[13px] text-content-muted">{info.hint}</p>
            {report.error && <p className="mt-1 break-words font-mono text-[11px] text-content-faint">{report.error}</p>}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface-elevated/50 p-3 text-[12px] text-content-muted">
          <p className="mb-1 font-medium text-content">So verbindest du (einmalig):</p>
          <ol className="list-decimal space-y-0.5 pl-4">
            <li>Google Cloud → Dienstkonto anlegen + JSON-Key laden, Search Console API aktivieren.</li>
            <li>Search Console → deine Property → Nutzer → die Dienstkonto-E-Mail hinzufügen.</li>
            <li>Netlify → Environment: GSC_SERVICE_ACCOUNT_JSON (Key) + GSC_SITE_URL (Property).</li>
          </ol>
        </div>
      </CardBody>
    </Card>
  );
}

function prettyPath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname + u.search || '/';
  } catch {
    return url;
  }
}
