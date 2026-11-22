// Tin tự động từ /api/news, chèn vào đầu bản tin trước khi trade-news.js chạy,
// để chuông thông báo cũng nhận được các tin này.
(function () {
    const rail = document.getElementById('newsRail');
    const safe = u => /^https?:\/\//.test(u || '');
    const isVn = s => /việt|vasep|moit|bộ công thương|thương vụ/i.test(s || '');
    function build(it) {
        const art = document.createElement('article');
        art.className = 'news-article';
        art.dataset.market = isVn(it.source) ? 'vn' : 'us';
        art.dataset.noticeId = 'auto-' + it.link;
        const meta = document.createElement('div'); meta.className = 'news-meta';
        const topic = document.createElement('span'); topic.className = 'news-topic'; topic.textContent = 'Tin tự động';
        const time = document.createElement('time'); const d = new Date(it.published_at);
        time.dateTime = isNaN(d) ? '' : d.toISOString().slice(0, 10);
        time.textContent = isNaN(d) ? '' : d.toLocaleDateString('vi-VN');
        meta.append(topic, time);
        const h = document.createElement('h3'); const a = document.createElement('a');
        a.className = 'news-title'; a.href = it.link; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = it.title;
        h.append(a);
        const src = document.createElement('span'); src.className = 'news-source'; src.textContent = it.source || 'Nguồn tin';
        art.append(meta, h, src);
        return art;
    }
    function loadTradeNews() {
        const s = document.createElement('script'); s.src = 'trade-news.js'; document.body.appendChild(s);
    }
    const timeout = new Promise(r => setTimeout(r, 6000));
    const load = fetch('/api/news').then(r => (r.ok ? r.json() : { items: [] })).then(d => {
        const items = (Array.isArray(d.items) ? d.items : []).filter(i => safe(i.link)).slice(0, 6);
        if (rail && items.length) rail.prepend(...items.map(build));
    }).catch(() => {});
    Promise.race([load, timeout]).then(loadTradeNews);
})();
