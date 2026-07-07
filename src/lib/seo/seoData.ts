/**
 * DEMO SEO dataset + import helper.
 * The numbers here are clearly-labelled placeholders so the module looks like a
 * real tool without pretending to be connected. Nothing here is live data.
 */

import type { SeoDataset, SeoSeriesPoint } from './seoTypes';

function buildSeries(): SeoSeriesPoint[] {
  const out: SeoSeriesPoint[] = [];
  const today = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // Deterministic wave so the demo chart looks alive but stable.
    const wave = Math.sin(i / 3) * 10 + Math.sin(i / 7) * 6;
    const clicks = Math.max(8, Math.round(42 + wave + (i % 5 === 0 ? 9 : 0)));
    const impressions = Math.round(clicks * (26 + (i % 4) * 3));
    out.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      clicks,
      impressions,
    });
  }
  return out;
}

const SERIES = buildSeries();
const totalClicks = SERIES.reduce((s, p) => s + p.clicks, 0);
const totalImpr = SERIES.reduce((s, p) => s + p.impressions, 0);

export const DEMO_SEO: SeoDataset = {
  property: 'demo-shop.de',
  range: 'Letzte 28 Tage',
  kpis: {
    clicks: totalClicks,
    impressions: totalImpr,
    ctr: totalClicks / totalImpr,
    position: 12.4,
  },
  deltas: { clicks: 0.084, impressions: 0.052, ctr: 0.019, position: -0.06 },
  series: SERIES,
  topQueries: [
    { query: 'beispiel produkt kaufen', clicks: 214, impressions: 5120, ctr: 0.0418, position: 6.2 },
    { query: 'marke xy test', clicks: 168, impressions: 4890, ctr: 0.0344, position: 8.1 },
    { query: 'günstig online bestellen', clicks: 121, impressions: 7340, ctr: 0.0165, position: 14.7 },
    { query: 'ersatzteile shop', clicks: 96, impressions: 3010, ctr: 0.0319, position: 9.5 },
    { query: 'anleitung pdf', clicks: 74, impressions: 2280, ctr: 0.0325, position: 11.3 },
    { query: 'vergleich modelle', clicks: 58, impressions: 4400, ctr: 0.0132, position: 18.9 },
  ],
};

/** Very small validator/parser for a manual JSON import (stub for v1). */
export function parseSeoJson(text: string): SeoDataset | null {
  try {
    const raw = JSON.parse(text) as Partial<SeoDataset>;
    if (!raw || typeof raw !== 'object') return null;
    if (!raw.kpis || !Array.isArray(raw.series) || !Array.isArray(raw.topQueries)) return null;
    return {
      property: raw.property ?? 'Import',
      range: raw.range ?? 'Import',
      kpis: raw.kpis,
      deltas: raw.deltas,
      series: raw.series,
      topQueries: raw.topQueries,
    };
  } catch {
    return null;
  }
}
