/**
 * SEO domain model.
 * v1 is a structured DEMO/placeholder — no real data source is connected yet.
 * The shapes match Google Search Console's core metrics so real data (via CSV
 * import or a future GSC/MCP connector) drops in without a refactor.
 */

export interface SeoKpis {
  /** Total clicks in the range. */
  clicks: number;
  /** Total impressions in the range. */
  impressions: number;
  /** Click-through rate, 0..1. */
  ctr: number;
  /** Average position (lower is better). */
  position: number;
}

export interface SeoSeriesPoint {
  /** ISO date (yyyy-mm-dd). */
  date: string;
  clicks: number;
  impressions: number;
}

export interface SeoQueryRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SeoDataset {
  property: string;
  range: string;
  kpis: SeoKpis;
  /** Optional period-over-period deltas (fraction, e.g. 0.12 = +12%). */
  deltas?: Partial<Record<keyof SeoKpis, number>>;
  series: SeoSeriesPoint[];
  topQueries: SeoQueryRow[];
}

/** Where the currently shown data comes from. */
export type SeoSource = 'demo' | 'import' | 'gsc';
