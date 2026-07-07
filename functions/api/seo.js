/**
 * Cloudflare Pages Function: Google Search Console explorer (service-account).
 * Route: GET /api/seo
 * Params:
 *   days=28 | start=YYYY-MM-DD&end=YYYY-MM-DD   (date range)
 *   compare=1                                    (compare to previous equal period)
 *   type=web|image|video|news                    (search type)
 *   qf=<text>&qop=contains|equals|notContains|regex   (query filter)
 *   pf=<text>&pop=...                            (page filter)
 * Returns one overview payload (KPIs + deltas + series + top queries/pages/devices/countries),
 * all honouring the selected range, type and filters. Signs the JWT with Web Crypto (no Node).
 *
 * Env: GSC_SERVICE_ACCOUNT_JSON, GSC_SITE_URL. SA email must be a user on the property.
 */

const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const API = 'https://searchconsole.googleapis.com/webmasters/v3/sites';
const TYPES = ['web', 'image', 'video', 'news'];
const OPS = { contains: 'contains', equals: 'equals', notContains: 'notContains', regex: 'includingRegex' };

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

/* ---- auth (Web Crypto) ---- */
function b64urlFromBytes(buf) {
  const arr = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
const b64urlFromStr = (s) => b64urlFromBytes(new TextEncoder().encode(s));
function pemToArrayBuffer(pem) {
  const b64 = pem.replace(/-----BEGIN [^-]+-----/, '').replace(/-----END [^-]+-----/, '').replace(/\s+/g, '');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}
async function getAccessToken(creds) {
  const now = Math.floor(Date.now() / 1000);
  const unsigned =
    `${b64urlFromStr(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.` +
    b64urlFromStr(JSON.stringify({ iss: creds.client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }));
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
    const e = new Error(data.error_description || data.error || 'token_error');
    e.status = res.status;
    throw e;
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
    const e = new Error(data?.error?.message || 'gsc_error');
    e.status = res.status;
    throw e;
  }
  return data.rows || [];
}

/* ---- dates ---- */
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function parseLocal(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return null;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return isNaN(dt.getTime()) ? null : dt;
}
function resolveRange(p) {
  const cs = parseLocal(p.get('start'));
  const ce = parseLocal(p.get('end'));
  if (cs && ce && cs <= ce) return { start: cs, end: ce };
  const days = Math.min(Math.max(Number(p.get('days')) || 28, 1), 480);
  const end = new Date();
  end.setDate(end.getDate() - 2);
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  return { start, end };
}
function prevRange(start, end) {
  const len = Math.round((start.getTime() - 0) / 1); // placeholder; use day diff below
  const dayDiff = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  void len;
  const pe = new Date(start);
  pe.setDate(pe.getDate() - 1);
  const ps = new Date(pe);
  ps.setDate(ps.getDate() - (dayDiff - 1));
  return { start: ps, end: pe };
}

/* ---- shaping ---- */
const kpisOf = (rows) => {
  const r = rows[0];
  return r
    ? { clicks: r.clicks || 0, impressions: r.impressions || 0, ctr: r.ctr || 0, position: r.position || 0 }
    : { clicks: 0, impressions: 0, ctr: 0, position: 0 };
};
const deltasOf = (cur, prev) => {
  const rel = (a, b) => (b ? (a - b) / b : 0);
  return {
    clicks: rel(cur.clicks, prev.clicks),
    impressions: rel(cur.impressions, prev.impressions),
    ctr: rel(cur.ctr, prev.ctr),
    position: prev.position ? (cur.position - prev.position) / prev.position : 0,
  };
};
const metrics = (r) => ({ clicks: r.clicks || 0, impressions: r.impressions || 0, ctr: r.ctr || 0, position: r.position || 0 });
const dimRow = (name) => (r) => ({ [name]: r.keys?.[0] ?? '', ...metrics(r) });
const seriesRow = (r) => ({ date: r.keys?.[0] ?? '', ...metrics(r) });

export async function onRequestGet(context) {
  const { env, request } = context;
  const p = new URL(request.url).searchParams;

  let creds = null;
  try {
    creds = env.GSC_SERVICE_ACCOUNT_JSON ? JSON.parse(env.GSC_SERVICE_ACCOUNT_JSON) : null;
  } catch {
    creds = null;
  }
  if (!creds || !creds.client_email || !creds.private_key) return json(200, { connected: false, reason: 'no_credentials' });
  const siteUrl = p.get('site') || env.GSC_SITE_URL;
  if (!siteUrl) return json(200, { connected: false, reason: 'no_site' });

  const type = TYPES.includes(p.get('type')) ? p.get('type') : 'web';
  const compare = p.get('compare') === '1';
  const { start, end } = resolveRange(p);
  const prev = prevRange(start, end);

  const filters = [];
  if (p.get('qf')) filters.push({ dimension: 'query', operator: OPS[p.get('qop')] || 'contains', expression: p.get('qf') });
  if (p.get('pf')) filters.push({ dimension: 'page', operator: OPS[p.get('pop')] || 'contains', expression: p.get('pf') });
  const dfg = filters.length ? [{ filters }] : undefined;

  const q = (s, e, extra) => ({
    startDate: ymd(s),
    endDate: ymd(e),
    type,
    ...(dfg ? { dimensionFilterGroups: dfg } : {}),
    ...extra,
  });

  try {
    const token = await getAccessToken(creds);
    const tasks = [
      gsc(token, siteUrl, q(start, end, {})),
      gsc(token, siteUrl, q(start, end, { dimensions: ['date'] })),
      gsc(token, siteUrl, q(start, end, { dimensions: ['query'], rowLimit: 100 })),
      gsc(token, siteUrl, q(start, end, { dimensions: ['page'], rowLimit: 100 })),
      gsc(token, siteUrl, q(start, end, { dimensions: ['device'] })),
      gsc(token, siteUrl, q(start, end, { dimensions: ['country'], rowLimit: 30 })),
      compare ? gsc(token, siteUrl, q(prev.start, prev.end, {})) : Promise.resolve([]),
      compare ? gsc(token, siteUrl, q(prev.start, prev.end, { dimensions: ['date'] })) : Promise.resolve([]),
    ];
    const [tot, byDate, byQuery, byPage, byDevice, byCountry, prevTot, prevByDate] = await Promise.all(tasks);

    const kpis = kpisOf(tot);
    return json(200, {
      connected: true,
      siteUrl,
      type,
      compare,
      range: { start: ymd(start), end: ymd(end) },
      prevRange: compare ? { start: ymd(prev.start), end: ymd(prev.end) } : undefined,
      kpis,
      deltas: compare && prevTot.length ? deltasOf(kpis, kpisOf(prevTot)) : undefined,
      series: byDate.map(seriesRow),
      prevSeries: compare ? prevByDate.map(seriesRow) : undefined,
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
