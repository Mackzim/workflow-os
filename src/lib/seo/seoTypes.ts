/**
 * SEO domain model — shapes mirror the Google Search Console Search Analytics
 * API so the Netlify function payload maps 1:1. No demo data lives here anymore;
 * real data comes from `/.netlify/functions/seo` (service-account).
 */

export interface SeoKpis {
  clicks: number;
  impressions: number;
  /** Click-through rate, 0..1. */
  ctr: number;
  /** Average position (lower is better). */
  position: number;
}

export interface SeoSeriesPoint {
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

export interface SeoPageRow {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SeoDeviceRow {
  device: string; // DESKTOP | MOBILE | TABLET
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SeoCountryRow {
  country: string; // ISO-3166-1 alpha-3, lowercase
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

/** Why the report has no data (drives the setup hint). */
export type SeoNotConnectedReason =
  | 'no_credentials'
  | 'no_site'
  | 'forbidden'
  | 'unreachable'
  | 'error';

/** Full report returned by the Netlify function. */
export interface SeoReport {
  connected: boolean;
  reason?: SeoNotConnectedReason;
  status?: number;
  error?: string;
  siteUrl?: string;
  days?: number;
  range?: { start: string; end: string };
  kpis?: SeoKpis;
  deltas?: Partial<Record<keyof SeoKpis, number>>;
  series?: SeoSeriesPoint[];
  topQueries?: SeoQueryRow[];
  topPages?: SeoPageRow[];
  devices?: SeoDeviceRow[];
  countries?: SeoCountryRow[];
}
