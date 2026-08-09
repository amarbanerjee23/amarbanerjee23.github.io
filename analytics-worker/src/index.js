const DEFAULT_ORIGIN = 'https://amarbanerjee23.github.io';
const EVENT_TYPES = new Set([
  'page_view',
  'section_view',
  'cta_click',
  'download',
  'contact_click',
  'external_evidence_click',
  'diagnosis_choice'
]);

const text = (value, max = 180) => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);

const corsHeaders = origin => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin'
});

const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers }
});

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function pseudonym(rawId, salt) {
  return sha256(`${salt}:${rawId}`);
}

function csvEscape(value) {
  const string = String(value ?? '');
  return /[",\n]/.test(string) ? `"${string.replace(/"/g, '""')}"` : string;
}

async function collect(request, env) {
  const allowedOrigin = env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
  const origin = request.headers.get('Origin') || '';
  if (origin !== allowedOrigin) return json({ ok: false, error: 'origin_not_allowed' }, 403, corsHeaders(allowedOrigin));
  if (!env.ANON_SALT) return json({ ok: false, error: 'collector_not_configured' }, 503, corsHeaders(allowedOrigin));

  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > 8192) return json({ ok: false, error: 'payload_too_large' }, 413, corsHeaders(allowedOrigin));

  let input;
  try { input = await request.json(); }
  catch (_) { return json({ ok: false, error: 'invalid_json' }, 400, corsHeaders(allowedOrigin)); }

  const eventType = text(input.event_type, 48);
  if (!EVENT_TYPES.has(eventType)) return json({ ok: false, error: 'invalid_event' }, 400, corsHeaders(allowedOrigin));

  const visitorId = text(input.visitor_id, 96);
  const sessionId = text(input.session_id, 96);
  if (!visitorId || !sessionId) return json({ ok: false, error: 'missing_pseudonymous_id' }, 400, corsHeaders(allowedOrigin));

  const visitorHash = await pseudonym(visitorId, env.ANON_SALT);
  const sessionHash = await pseudonym(sessionId, env.ANON_SALT);
  const now = new Date().toISOString();
  const existing = await env.DB.prepare('SELECT visit_count FROM visitors WHERE visitor_hash = ?1').bind(visitorHash).first();
  const isReturning = existing ? 1 : 0;

  if (existing) {
    await env.DB.prepare('UPDATE visitors SET last_seen = ?1, visit_count = visit_count + 1 WHERE visitor_hash = ?2')
      .bind(now, visitorHash).run();
  } else {
    await env.DB.prepare('INSERT INTO visitors (visitor_hash, first_seen, last_seen, visit_count) VALUES (?1, ?2, ?2, 1)')
      .bind(visitorHash, now).run();
  }

  const cf = request.cf || {};
  await env.DB.prepare(`
    INSERT INTO events (
      occurred_at, visitor_hash, session_hash, event_type, page, page_title, target, href,
      referrer_domain, country, region, city, timezone, device, browser, os, language, is_returning
    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18)
  `).bind(
    now,
    visitorHash,
    sessionHash,
    eventType,
    text(input.page, 200),
    text(input.title, 180),
    text(input.target, 180),
    text(input.href, 180),
    text(input.referrer_domain, 120),
    text(cf.country, 8),
    text(cf.region, 80),
    text(cf.city, 80),
    text(cf.timezone, 64),
    text(input.device, 24),
    text(input.browser, 32),
    text(input.os, 32),
    text(input.language, 24),
    isReturning
  ).run();

  return json({ ok: true }, 202, corsHeaders(allowedOrigin));
}

function authorized(request, env) {
  if (!env.EXPORT_TOKEN) return false;
  const header = request.headers.get('Authorization') || '';
  return header === `Bearer ${env.EXPORT_TOKEN}`;
}

async function exportRecent(env, days = 30) {
  const boundedDays = Math.max(1, Math.min(Number(days) || 30, 90));
  const result = await env.DB.prepare(`
    SELECT
      occurred_at,
      substr(visitor_hash, 1, 12) AS visitor,
      substr(session_hash, 1, 12) AS session,
      event_type,
      page,
      target,
      referrer_domain,
      country,
      region,
      city,
      device,
      browser,
      os,
      language,
      is_returning
    FROM events
    WHERE occurred_at >= datetime('now', ?1)
    ORDER BY occurred_at DESC
    LIMIT 10000
  `).bind(`-${boundedDays} days`).all();

  const columns = ['occurred_at','visitor','session','event_type','page','target','referrer_domain','country','region','city','device','browser','os','language','is_returning'];
  const rows = [columns.join(',')];
  for (const record of result.results || []) rows.push(columns.map(column => csvEscape(record[column])).join(','));
  return rows.join('\n');
}

async function aggregateSummary(env, days = 30) {
  const boundedDays = Math.max(1, Math.min(Number(days) || 30, 90));
  const since = `-${boundedDays} days`;
  const [headline, pages, countries, cities, referrers, events] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) AS events, COUNT(DISTINCT visitor_hash) AS visitors, COUNT(DISTINCT session_hash) AS sessions FROM events WHERE occurred_at >= datetime('now', ?1)`).bind(since).first(),
    env.DB.prepare(`SELECT page AS label, COUNT(*) AS count FROM events WHERE event_type='page_view' AND occurred_at >= datetime('now', ?1) GROUP BY page ORDER BY count DESC LIMIT 20`).bind(since).all(),
    env.DB.prepare(`SELECT COALESCE(NULLIF(country,''),'Unknown') AS label, COUNT(DISTINCT visitor_hash) AS count FROM events WHERE occurred_at >= datetime('now', ?1) GROUP BY country ORDER BY count DESC LIMIT 20`).bind(since).all(),
    env.DB.prepare(`SELECT CASE WHEN city='' THEN 'Unknown' ELSE city || CASE WHEN region='' THEN '' ELSE ', ' || region END END AS label, COUNT(DISTINCT visitor_hash) AS count FROM events WHERE occurred_at >= datetime('now', ?1) GROUP BY city, region ORDER BY count DESC LIMIT 20`).bind(since).all(),
    env.DB.prepare(`SELECT COALESCE(NULLIF(referrer_domain,''),'Direct / unknown') AS label, COUNT(DISTINCT session_hash) AS count FROM events WHERE event_type='page_view' AND occurred_at >= datetime('now', ?1) GROUP BY referrer_domain ORDER BY count DESC LIMIT 20`).bind(since).all(),
    env.DB.prepare(`SELECT event_type AS label, COUNT(*) AS count FROM events WHERE occurred_at >= datetime('now', ?1) GROUP BY event_type ORDER BY count DESC`).bind(since).all()
  ]);

  return {
    generated_at: new Date().toISOString(),
    window_days: boundedDays,
    headline: {
      visitors: Number(headline?.visitors || 0),
      sessions: Number(headline?.sessions || 0),
      events: Number(headline?.events || 0)
    },
    top_pages: pages.results || [],
    countries: countries.results || [],
    cities: cities.results || [],
    referrers: referrers.results || [],
    events: events.results || []
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const allowedOrigin = env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;

    if (request.method === 'OPTIONS' && url.pathname === '/collect') {
      const origin = request.headers.get('Origin') || '';
      if (origin !== allowedOrigin) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: corsHeaders(allowedOrigin) });
    }

    if (request.method === 'POST' && url.pathname === '/collect') return collect(request, env);

    if (request.method === 'GET' && url.pathname === '/health') {
      return json({ ok: true, service: 'portfolio-analytics', stores_raw_ip: false });
    }

    if (request.method === 'GET' && url.pathname === '/admin/export.csv') {
      if (!authorized(request, env)) return json({ ok: false, error: 'unauthorized' }, 401);
      const csv = await exportRecent(env, url.searchParams.get('days'));
      return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Cache-Control': 'no-store' } });
    }

    if (request.method === 'GET' && url.pathname === '/admin/summary.json') {
      if (!authorized(request, env)) return json({ ok: false, error: 'unauthorized' }, 401);
      return json(await aggregateSummary(env, url.searchParams.get('days')), 200, { 'Cache-Control': 'no-store' });
    }

    return json({ ok: false, error: 'not_found' }, 404);
  }
};
