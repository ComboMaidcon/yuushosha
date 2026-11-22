// Nhật ký xác nhận điều khoản. Ghi vào bảng consent_log trên Supabase (xem consent_table.sql).
// Biến môi trường: SUPABASE_URL, SUPABASE_SERVICE_KEY (bí mật), CONSENT_SALT (chuỗi ngẫu nhiên).
export const config = { runtime: 'edge' };
const ALLOWED_VERSIONS = ['MVP-2026'];

async function sha256(text) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(d)].map(x => x.toString(16).padStart(2, '0')).join('');
}
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
}

export default async function handler(request) {
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return json({ error: 'not_configured' }, 503);
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'bad_json' }, 400); }
  const userId = String(body.userId || '').trim().slice(0, 200);
  const version = String(body.version || '');
  const source = String(body.source || '').slice(0, 30);
  if (!userId || !ALLOWED_VERSIONS.includes(version)) return json({ error: 'bad_input' }, 400);

  const salt = process.env.CONSENT_SALT || 'precheck-demo';
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  const row = {
    user_ref: await sha256(userId.toLowerCase() + '|' + salt),
    terms_version: version,
    source,
    ip_hash: await sha256(ip + '|' + salt),
    user_agent: (request.headers.get('user-agent') || '').slice(0, 200),
  };
  const r = await fetch(url.replace(/\/$/, '') + '/rest/v1/consent_log', {
    method: 'POST',
    headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(row),
  });
  if (!r.ok) return json({ error: 'store_failed', status: r.status }, 502);
  return json({ ok: true }, 201);
}
