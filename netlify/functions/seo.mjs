/**
 * Netlify Function: Google Search Console proxy (service-account auth).
 *
 * Reads real GSC data server-side so no credentials ever touch the browser.
 * Config via environment variables (Netlify → Site settings → Environment):
 *   GSC_SERVICE_ACCOUNT_JSON  – the full service-account key JSON (as a string)
 *   GSC_SITE_URL              – the property, e.g. "sc-domain:pichler.de"
 *                               or "https://www.pichler.de/"
 * The service-account email must be added as a user on that GSC property.
 *
 * GET /.netlify/functions/seo?days=28[&site=<override>]
 *   -> { connected: true, kpis, deltas, series, topQueries, topPages, devices, countries, ... }
 *   -> { connected: false, reason, error? }   (not yet set up / no data / error)
 */

import { JWT } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];
const API = 'https://searchconsole.googleapis.com/webmasters/v3/sites';

function json(statusCode, body) {
  return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}

function ymd(d) {
  return d.toISOString().slice(0, 10);
}

function ranges(days) {
  const end = new Date();
  end.setDate(end.getDate() - 2); // GSC data lags ~2 days
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - (days - 1));
  return { start: ymd(start), end: ymd(end), prevStart: ymd(prevStart), prevEnd: ymd(prevEnd) };
}

function getCreds() {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const c = JSON.parse(raw);
    return c && c.client_email && c.private_key ? c : null;
  } catch {
    return null;
  }
}

async function query(client, siteUrl, body) {
  const url = `${API}/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const res = await client.request({ url, method: 'POST', data: body });
  return (res.data && res.data.rows) || [];
}

function kpisFromRows(rows) {
  const r = rows[0];
  return r
    ? { clicks: r.clicks || 0, impressions: r.impressions || 0, ctr: r.ctr || 0, position: r.position || 0 }
    : { clicks: 0, impressions: 0, ctr: 0, position: 0 };
}

function computeDeltas(cur, prev) {
  const rel = (a, b) => (b ? (a - b) / b : 0);
  return {
    clicks: rel(cur.clicks, prev.clicks),
    impressions: rel(cur.impressions, prev.impressions),
    ctr: rel(cur.ctr, prev.ctr),
    // lower position is better – keep the raw relative change (negative = improved)
    position: prev.position ? (cur.position - prev.position) / prev.position : 0,
  };
}

const dimRow = (name) => (r) => ({
  [name]: r.keys?.[0] ?? '',
  clicks: r.clicks || 0,
  impressions: r.impressions || 0,
  ctr: r.ctr || 0,
  position: r.position || 0,
});

export const handler = async (event) => {
  const creds = getCreds();
  if (!creds) return json(200, { connected: false, reason: 'no_credentials' });

  const siteUrl = event.queryStringParameters?.site || process.env.GSC_SITE_URL;
  if (!siteUrl) return json(200, { connected: false, reason: 'no_site' });

  const days = Math.min(Math.max(Number(event.queryStringParameters?.days) || 28, 7), 180);
  const { start, end, prevStart, prevEnd } = ranges(days);
  const base = { startDate: start, endDate: end };

  try {
    const client = new JWT({ email: creds.client_email, key: creds.private_key, scopes: SCOPES });

    const [totals, prevTotals, byDate, byQuery, byPage, byDevice, byCountry] = await Promise.all([
      query(client, siteUrl, { ...base }),
      query(client, siteUrl, { startDate: prevStart, endDate: prevEnd }),
      query(client, siteUrl, { ...base, dimensions: ['date'] }),
      query(client, siteUrl, { ...base, dimensions: ['query'], rowLimit: 20 }),
      query(client, siteUrl, { ...base, dimensions: ['page'], rowLimit: 20 }),
      query(client, siteUrl, { ...base, dimensions: ['device'] }),
      query(client, siteUrl, { ...base, dimensions: ['country'], rowLimit: 12 }),
    ]);

    const kpis = kpisFromRows(totals);
    const prev = kpisFromRows(prevTotals);

    return json(200, {
      connected: true,
      siteUrl,
      days,
      range: { start, end },
      kpis,
      deltas: computeDeltas(kpis, prev),
      series: byDate.map((r) => ({ date: r.keys?.[0] ?? '', clicks: r.clicks || 0, impressions: r.impressions || 0 })),
      topQueries: byQuery.map(dimRow('query')),
      topPages: byPage.map(dimRow('page')),
      devices: byDevice.map(dimRow('device')),
      countries: byCountry.map(dimRow('country')),
    });
  } catch (e) {
    const status = e?.response?.status;
    const message = e?.response?.data?.error?.message || e?.message || String(e);
    return json(200, { connected: false, reason: status === 403 ? 'forbidden' : 'error', status, error: message });
  }
};
