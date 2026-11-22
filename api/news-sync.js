// Đồng bộ tin từ các nguồn RSS vào bảng news_items. Gọi định kỳ bằng dịch vụ cron miễn phí (ví dụ cron-job.org)
// kèm header x-sync-token. Biến môi trường: SUPABASE_URL, SUPABASE_SERVICE_KEY, SYNC_TOKEN, NEWS_FEEDS.
// NEWS_FEEDS: các cặp "Tên nguồn|URL RSS", ngăn cách bằng dấu phẩy.
export const config = { runtime: 'edge' };

const KEYWORDS = ['xuất khẩu', 'nhập khẩu', 'fda', 'rasff', 'thực phẩm', 'hạt điều', 'thủy sản', 'thuỷ sản', 'hoa kỳ', 'châu âu', 'an toàn thực phẩm', 'export', 'import', 'food safety'];

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
}
function decode(s) {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}
export function parseRss(xml, source) {
  const items = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  const get = (block, tag) => {
    const m = block.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)<\\/' + tag + '>', 'i'));
    return m ? decode(m[1]) : '';
  };
  return items.map(it => {
    const t = Date.parse(get(it, 'pubDate') || get(it, 'dc:date'));
    return { title: get(it, 'title'), link: get(it, 'link'), source, published_at: isNaN(t) ? new Date().toISOString() : new Date(t).toISOString() };
  }).filter(x => x.title && /^https?:\/\//.test(x.link));
}
async function sha256(text) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(d)].map(x => x.toString(16).padStart(2, '0')).join('');
}
async function fetchText(url) {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'user-agent': 'PRECHECK-news/1.0', accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8' } });
    const text = r.ok ? await r.text() : '';
    return { status: r.status, text, error: r.ok ? null : 'http_' + r.status };
  } catch (e) { return { status: 0, text: '', error: String(e && e.name || 'fetch_error') }; }
  finally { clearTimeout(t); }
}

export default async function handler(request) {
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_KEY, token = process.env.SYNC_TOKEN;
  if (!url || !key || !token) return json({ error: 'not_configured' }, 503);
  if (request.headers.get('x-sync-token') !== token) return json({ error: 'unauthorized' }, 401);

  const feeds = (process.env.NEWS_FEEDS || '').split(',').map(s => s.split('|')).filter(p => p.length === 2).map(([name, u]) => ({ name: name.trim(), url: u.trim() }));
  if (!feeds.length) return json({ error: 'no_feeds' }, 400);

  const now = new Date().toISOString();
  const rows = [];
  const report = [];
  for (const f of feeds) {
    const res = await fetchText(f.url);
    const parsed = parseRss(res.text, f.name);
    let matched = 0;
    for (const item of parsed) {
      const hay = item.title.toLowerCase();
      if (!KEYWORDS.some(k => hay.includes(k))) continue;
      matched++;
      rows.push({ id: await sha256(item.link), ...item, fetched_at: now });
    }
    report.push({ name: f.name, http: res.status, error: res.error, bytes: res.text.length, items: parsed.length, matched });
  }
  if (!rows.length) return json({ ok: true, saved: 0, feeds: report });

  const r = await fetch(url.replace(/\/$/, '') + '/rest/v1/news_items?on_conflict=id', {
    method: 'POST',
    headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
  if (!r.ok) return json({ error: 'store_failed', status: r.status }, 502);
  return json({ ok: true, saved: rows.length, feeds: report });
}
