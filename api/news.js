// Đọc tin xuất nhập khẩu đã đồng bộ từ bảng news_items (Supabase). Công khai, có cache 10 phút.
export const config = { runtime: 'edge' };

export default async function handler(request) {
  const headers = { 'content-type': 'application/json; charset=utf-8', 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=600' };
  if (request.method !== 'GET') return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers });
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return new Response(JSON.stringify({ items: [], note: 'not_configured' }), { headers });
  try {
    const r = await fetch(url.replace(/\/$/, '') + '/rest/v1/news_items?select=title,link,source,published_at&order=published_at.desc&limit=20',
      { headers: { apikey: key, Authorization: 'Bearer ' + key } });
    if (!r.ok) return new Response(JSON.stringify({ items: [], note: 'read_failed' }), { status: 502, headers });
    const items = await r.json();
    return new Response(JSON.stringify({ items }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ items: [], note: 'read_failed' }), { status: 502, headers });
  }
}
