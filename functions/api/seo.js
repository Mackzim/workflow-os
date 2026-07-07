/**
 * Cloudflare Pages Function: Google Search Console proxy (service-account auth).
 * Route:  GET /api/seo?days=28[&site=<override>]
 * Env:    GSC_SERVICE_ACCOUNT_JSON  (the full service-account key JSON as a string)
 *         GSC_SITE_URL              (e.g. "sc-domain:pichler.de" or "https://www.pichler.de/")
 *
 * Runs on the Workers runtime — signs the JWT with Web Crypto, so NO Node deps.
 * The service-account email must be added as a user on the GSC property.
 */

const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const API = 'https://searchconsole.googleapis.com/webmasters/v3/sites';

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

/* ---- base64url + PEM helpers ---- */
function b64urlFromBytes(buf) {
  const arr = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlFromStr(str) {
  return b64urlFromBytes(new TextEncoder().encode(str));
}
function pemToArrayBuffer(pem) {
  const b64 = pem
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

async function getAccessToken(creds) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = { iss: creds.client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 };
  const unsigned = `${b64urlFromStr(JSON.stringify(header))}.${b64urlFromStr(JSON.stringify(claims))}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(creds.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  const jwt = `${unsigned}.${b64urlFromBytes(sig)}`;

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    const err = new Error(data.error_description || data.error || 'token_error');
    err.status = res.status;
    throw err;
  }
  return data.access_token;
}

async function gsc(token, siteUrl, body) {
  const res = await fetch(`${API}/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.error?.message || 'gsc_error');
    err.status = res.status;
    throw err;
  }
  return data.rows || [];
}

/* ---- date + shaping ---- */
function ymd(d) {
  return d.toISOString().slice(0, 10);
}
function ranges(days) {
  const end = new Date();
  end.setDate(end.getDate() - 2); // GSC lags ~2 days
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - (days - 1));
  return { start: ymd(start), end: ymd(end), prevStart: ymd(prevStart), prevEnd: ymd(prevEnd) };
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

export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);

  let creds = null;
  try {
    creds = env.GSC_SERVICE_ACCOUNT_JSON ? JSON.parse(env.GSC_SERVICE_ACCOUNT_JSON) : null;
  } catch {
    creds = null;
  }
  if (!creds || !creds.client_email || !creds.private_key) return json(200, { connected: false, reason: 'no_credentials' });

  const siteUrl = url.searchParams.get('site') || env.GSC_SITE_URL;
  if (!siteUrl) return json(200, { connected: false, reason: 'no_site' });

  const days = Math.min(Math.max(Number(url.searchParams.get('days')) || 28, 7), 180);
  const { start, end, prevStart, prevEnd } = ranges(days);
  const base = { startDate: start, endDate: end };

  try {
    const token = await getAccessToken(creds);
    const [totals, prevTotals, byDate, byQuery, byPage, byDevice, byCountry] = await Promise.all([
      gsc(token, siteUrl, { ...base }),
      gsc(token, siteUrl, { startDate: prevStart, endDate: prevEnd }),
      gsc(token, siteUrl, { ...base, dimensions: ['date'] }),
      gsc(token, siteUrl, { ...base, dimensions: ['query'], rowLimit: 20 }),
      gsc(token, siteUrl, { ...base, dimensions: ['page'], rowLimit: 20 }),
      gsc(token, siteUrl, { ...base, dimensions: ['device'] }),
      gsc(token, siteUrl, { ...base, dimensions: ['country'], rowLimit: 12 }),
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
    const status = e?.status;
    return json(200, { connected: false, reason: status === 403 ? 'forbidden' : 'error', status, error: String(e?.message || e) });
  }
}
