// Bộ máy đối chiếu và chấm điểm rà soát (chạy trên trình duyệt, dùng dữ liệu FDA trong data.js)
(function () {
    const D = window.PC_DATA;
    const norm = s => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase();
    const words = s => norm(s).split(/[^a-z0-9]+/).filter(Boolean);
    const mt = (ws, t) => ws.some(w => w === t || (t.length >= 4 && w.startsWith(t)));
    const IDX = D.P.map(p => ({ p, raw: (p[1] + ' ' + p[2]).toLowerCase(), hay: words(p[1] + ' ' + p[2] + ' ' + p[0]), kw: words(p[2] + ' ' + p[1]) }));
    const C = id => D.C[id] || { c: String(id) };
    const fmt = n => Math.round(n).toLocaleString('vi-VN');

    function search(q, limit) {
        const t = words(q), ql = (q || '').trim().toLowerCase();
        if (!t.length) return [];
        const score = x => {
            let s = 0, all = true;
            for (const w of t) { if (mt(x.hay, w)) s += mt(x.kw, w) ? 3 : 1; else all = false; }
            return all ? s + (x.raw.includes(ql) ? 4 : 0) + x.p[5] / 300 : 0;
        };
        return IDX.map(x => [score(x), x.p]).filter(a => a[0] > 0).sort((a, b) => b[0] - a[0]).slice(0, limit || 6).map(a => a[1]);
    }
    const displayName = p => (p[1].startsWith('(') ? p[0] : p[1]);

    const NEED = {
        'Nhãn sản phẩm': ['label', 'Chưa có tên tệp nhãn/artwork trong hồ sơ; chưa xác minh nội dung', 'Tải artwork nhãn, rà soát Nutrition Facts, danh sách thành phần và chất gây dị ứng', 'CAO'],
        'COA': ['coa', 'Chưa có tên tệp COA trong hồ sơ; chưa có kết quả kiểm nghiệm được xác nhận', 'Bổ sung COA đúng hoạt chất và đơn vị từ phòng lab đủ năng lực (ISO/IEC 17025)', 'CAO'],
        'Giấy phép': ['license', 'Chưa có tên tệp đăng ký/chứng nhận; cần kiểm tra điều kiện áp dụng', 'Bổ sung giấy phép, chứng nhận liên quan đến cơ sở và sản phẩm', 'TB'],
        'Nhà máy': ['factory', 'Chưa xác minh số đăng ký cơ sở FDA và điều kiện áp dụng cho cơ sở', 'Đăng ký cơ sở với FDA (FFR) và ghi số đăng ký vào hồ sơ', 'CAO']
    };
    const KEYS = { label: ['nhan', 'label', 'artwork', 'bao bi'], coa: ['coa', 'kiem nghiem', 'test', 'phan tich'], license: ['giay phep', 'license', 'dang ky', 'ffr', 'gpkd'] };

    function evidence(files, factory) {
        const names = files.map(norm), has = ks => names.some(n => ks.some(k => n.includes(k)));
        return { label: has(KEYS.label), coa: has(KEYS.coa), license: has(KEYS.license), factory: false }; // Không thể xác nhận cơ sở hợp lệ chỉ bằng chuỗi chữ số
    }

    function analyze(inp) {
        const g = inp.group ? D.P.find(p => p[0] === inp.group) : null;
        const vn = !!(g && g[8].length), top = g ? (vn ? g[8] : g[7]).slice(0, 5) : [];
        const signals = top.map(([id, pct]) => {
            const c = C(id);
            return { id, code: c.c, title: c.t || c.c, pct, priority: c.p || '', scope: vn ? 'vn' : 'gl', official: c.o || '', legal: c.l || '', actions: c.a || [], explain: c.e || '' };
        });
        const w = s => (s.priority === 'Cao' ? 1 : s.priority ? 0.6 : 0.5);
        const hist = Math.min(70, Math.round(signals.slice(0, 3).reduce((a, s) => a + (s.pct / 100) * w(s), 0) * 40));
        const ev = evidence(inp.files, inp.factory);
        const gaps = inp.checks.filter(k => NEED[k] && !ev[NEED[k][0]]).map(k => ({ key: k, text: NEED[k][1], action: NEED[k][2], pri: NEED[k][3] }));
        const gap = Math.min(30, gaps.length * 8), total = Math.min(100, hist + gap);
        const level = !g ? 'CHƯA ĐỦ DỮ LIỆU' : total >= 60 ? 'CAO' : total >= 35 ? 'TRUNG BÌNH' : 'THẤP';
        const causes = signals.slice(0, 3).map(s => 'Tín hiệu lịch sử cần rà soát: '+s.title + ' (' + s.pct + '% dòng bị từ chối trong nhóm đã xử lý)').concat(gaps.map(x => x.text));
        const actions = [{text:'Thẩm định thông tin và tên file đã tải: app chưa đọc nội dung chứng từ, không thể kết luận đạt/không đạt lô mới',src:'Quy trình QA nội bộ',pri:'CAO'}];
        signals.slice(0, 3).forEach(s => s.actions.slice(0, 3).forEach(a => actions.push({ text: 'Cân nhắc kiểm tra: '+a, src: 'FDA lịch sử · ' + s.code, pri: s.priority === 'Cao' ? 'CAO' : 'TB' })));
        gaps.forEach(x => actions.push({ text: x.action, src: 'Hồ sơ đã nhập', pri: x.pri }));
        return {
            input: inp, group: g ? { key: g[0], name: displayName(g), industry: g[3], nAll: g[4], nVn: g[5], cert: g[6] } : null,
            scope: vn ? 'vn' : 'gl', signals, score: { hist, gap, total, level }, qualityOutcome:'CHƯA ĐỦ CĂN CỨ',evidenceVerified:false, ev, gaps, causes, actions, value: 1.2e9, done: actions.map(() => false)
        };
    }

    function matchRows(r) {
        const rows = [];
        if (r.group) rows.push({ code: 'NHÓM', src: 'Danh mục sản phẩm FDA', freq: 'Việt Nam ' + r.group.nVn + ' · Toàn cầu ' + r.group.nAll + ' dòng', ex: r.group.key, per: D.meta.period, ok: r.group.cert === 'Bản nháp', st: r.group.cert === 'Bản nháp' ? 'NHÓM TẠM KHỚP' : 'CẦN XÁC NHẬN TÊN' });
        else rows.push({ code: 'NHÓM', src: 'Danh mục sản phẩm FDA', freq: '—', ex: 'Không gắn được nhóm sản phẩm nào', per: '—', ok: false, st: 'CHƯA KHỚP' });
        r.signals.forEach(s => rows.push({ code: s.code, src: 'FDA Import Refusals', freq: s.pct + '% số dòng bị từ chối', ex: (s.official || '').slice(0, 110) + ((s.official || '').length > 110 ? '…' : ''), per: D.meta.period, ok: true, st: 'DỮ LIỆU LỊCH SỬ' }));
        return rows;
    }

    const COSTS = []; // Không tính tổn thất giả định dưới dạng phần trăm giá trị lô.
    window.PCE = { norm, search, analyze, matchRows, fmt, COSTS, displayName, meta: D.meta, C };
})();
