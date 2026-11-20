document.addEventListener('DOMContentLoaded', () => {
    const $ = id => document.getElementById(id), E = window.PCE;
    const SESSION_KEY = 'precheck_current_user', RKEY = 'precheck_reports';
    function h(t, a, ...k) {
        const e = document.createElement(t);
        for (const x in a || {}) { if (x === 'class') e.className = a[x]; else if (x.startsWith('on')) e[x] = a[x]; else e.setAttribute(x, a[x]); }
        for (const c of k.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
        return e;
    }
    let user = null;
    try { user = JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { user = null; }
    const allReports = () => { try { return JSON.parse(localStorage.getItem(RKEY)) || []; } catch (e) { return []; } };
    const myReports = () => (user ? allReports().filter(r => r.owner === user.email) : []);
    function saveReport(r) { const a = allReports(), i = a.findIndex(x => x.id === r.id && x.owner === r.owner); if (i >= 0) a[i] = r; else a.push(r); localStorage.setItem(RKEY, JSON.stringify(a)); }
    const prog = r => (r.actions.length ? Math.round(100 * r.done.filter(Boolean).length / r.actions.length) : 0);
    const lvlCls = l => (l === 'CAO' ? 'rp-high' : l === 'TRUNG BÌNH' ? 'rp-med' : l === 'THẤP' ? 'rp-low' : 'rp-grey');
    const badgeCls = l => (l === 'CAO' ? 'badge-high' : l === 'TRUNG BÌNH' ? 'badge-med' : 'badge-low');

    // ---- Tài khoản ----
    if (user && $('userAuthArea')) {
        $('userAuthArea').replaceChildren(
            h('div', { class: 'user-pill', title: 'MST: ' + (user.taxCode || 'N/A') + ' | Ngành: ' + (user.industry || 'N/A') }, h('span', {}, '🏢 ' + user.companyName)),
            h('button', { class: 'btn-logout', id: 'logoutBtn', onclick: () => { localStorage.removeItem(SESSION_KEY); window.location.reload(); } }, 'Đăng xuất'));
    }

    // ---- Hộp thoại ----
    const modal = $('dashModal');
    function openModal(title, body) {
        $('dashModalTitle').textContent = title;
        const b = $('dashModalBody'); b.replaceChildren();
        b.append(typeof body === 'string' ? h('p', { style: 'color:#5e7266;font-size:14.5px;line-height:1.5' }, body) : body);
        modal.style.display = 'flex';
    }
    const closeModal = () => { modal.style.display = 'none'; };
    $('closeDashModal').addEventListener('click', closeModal);
    window.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    // ---- Điều hướng ----
    const PANES = ['overview', 'check-new', 'matching', 'report', 'actions', 'my-reports', 'risk-alert', 'placeholder'];
    const navItems = document.querySelectorAll('.nav-item');
    function setTitle(t, s) { $('dashTitleGroup').replaceChildren(h('h1', {}, t), s ? h('p', {}, s) : null); }
    function show(pane, title, sub, nav) {
        PANES.forEach(p => { $('tab-' + p).style.display = p === pane ? 'block' : 'none'; });
        setTitle(title, sub);
        navItems.forEach(n => n.classList.toggle('active', n.getAttribute('data-tab') === nav));
        window.scrollTo(0, 0);
    }
    navItems.forEach(item => item.addEventListener('click', e => {
        e.preventDefault();
        const tab = item.getAttribute('data-tab'), name = item.getAttribute('data-menu');
        if (tab === 'overview') { renderOverview(); show('overview', 'Dashboard Tổng quan', user ? user.companyName : 'Chưa đăng nhập · số liệu minh họa', tab); }
        else if (tab === 'check-new') show('check-new', 'Kiểm Tra Mới – INPUT', '', tab);
        else if (tab === 'my-reports') { renderMyReports(); show('my-reports', 'Báo cáo của tôi', 'Các lần kiểm tra đã lưu trên trình duyệt này', tab); }
        else if (tab === 'risk-alert') show('risk-alert', 'RISK ALERT', 'Dữ liệu minh họa, chưa kết nối nguồn cảnh báo thật', tab);
        else { $('placeholderTitle').textContent = name; show('placeholder', name, 'Quản lý hệ thống tiền kiểm rủi ro', tab); }
    }));

    // ---- Tổng quan (số liệu thật từ các báo cáo đã lưu) ----
    function renderOverview() {
        const rs = myReports();
        $('ovReports').textContent = rs.length;
        $('ovReportsSub').textContent = rs.length || user ? 'Báo cáo đã tạo' : 'Báo cáo đã tạo · đăng nhập để xem';
        const avg = rs.length ? Math.round(rs.reduce((a, r) => a + r.score.total, 0) / rs.length) : null;
        $('ovScore').textContent = avg === null ? '—' : avg + '/100';
        $('ovScoreSub').textContent = avg === null ? 'Điểm rà soát trung bình · chưa có báo cáo' : 'Điểm rà soát trung bình';
        const pg = rs.length ? Math.round(rs.reduce((a, r) => a + prog(r), 0) / rs.length) : null;
        $('ovCheck').textContent = pg === null ? '—' : pg + '%';
        $('ovCheckSub').textContent = pg === null ? 'Checklist hoàn thành · chưa có báo cáo' : 'Checklist hoàn thành';
        const pr = $('prodRows'), dl = $('deadlineRows');
        if (rs.length) {
            pr.replaceChildren(...rs.slice(-3).reverse().map(r => h('div', { class: 'prod-item' }, h('span', { class: 'prod-name' }, r.input.name + ' · ' + r.input.market.replace(/ \(.*/, '')), h('span', { class: 'badge-mini ' + badgeCls(r.score.level) }, r.score.level))));
            const last = rs[rs.length - 1], pend = last.done.filter(x => !x).length;
            dl.replaceChildren(h('div', { class: 'deadline-item' }, h('span', { class: 'deadline-date' }, last.id), h('span', { class: 'deadline-text' }, 'Còn ' + pend + ' hành động chưa xong')));
        }
        const chart = $('riskChart');
        if (rs.length >= 2) {
            const pts = rs.slice(-6).map((r, i, a) => [a.length === 1 ? 300 : 70 + i * (500 / (a.length - 1)), 210 - r.score.total * 1.8]);
            const g = [100, 75, 50, 25, 0].map(v => '<line x1="40" y1="' + (210 - v * 1.8) + '" x2="580" y2="' + (210 - v * 1.8) + '" stroke="#e4ede2"/><text x="14" y="' + (214 - v * 1.8) + '" font-size="12" fill="#7a9082">' + v + '</text>').join('');
            chart.innerHTML = '<svg viewBox="0 0 600 240" class="risk-svg-chart">' + g + '<polyline fill="none" stroke="#0b3d25" stroke-width="3" points="' + pts.map(p => p.join(',')).join(' ') + '"/>' + pts.map((p, i) => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4.5" fill="#0b3d25"/><text x="' + p[0] + '" y="232" font-size="12" fill="#7a9082" text-anchor="middle">' + (i + 1) + '</text>').join('') + '</svg>';
            $('chartCap').textContent = 'Điểm rà soát của ' + pts.length + ' báo cáo gần nhất';
        }
    }

    // ---- Stepper ----
    function stepper(active) {
        const labels = ['INPUT', 'DATA MATCHING', 'RISK SCORE', 'ACTION GUIDE'], w = h('div', { class: 'stepper-wrapper' });
        labels.forEach((l, i) => {
            if (i) w.append(h('div', { class: 'step-line' }));
            w.append(h('div', { class: 'step-pill' + (i + 1 === active ? ' active' : ''), role: 'button', tabindex: '0', onclick: () => goStep(i + 1), onkeydown: e => { if (e.key === 'Enter') goStep(i + 1); } }, (i + 1) + '  ' + l));
        });
        return w;
    }
    function goStep(n) {
        if (n === 1) return show('check-new', 'Kiểm Tra Mới – INPUT', '', 'check-new');
        if (!cur) return openModal('Chưa có báo cáo', 'Hãy chạy một lần kiểm tra ở bước INPUT trước.');
        ({ 2: showMatching, 3: showReport, 4: showActions })[n](true);
    }

    // ---- Màn INPUT ----
    const f = { name: $('cnProductName'), ing: $('cnIngredients'), hs: $('cnHsCode'), market: $('cnMarket'), factory: $('cnFactory') };
    const dz = $('uploadDropzone'), fileInput = $('fileInput'), list = $('uploadedFileList');
    const boxes = [...document.querySelectorAll('.audit-checkbox')], items = [...document.querySelectorAll('.check-option-item')];
    let uploaded = [], selGroup = null, cur = null;

    dz.setAttribute('role', 'button'); dz.setAttribute('tabindex', '0'); dz.setAttribute('aria-label', 'Tải hồ sơ: kéo thả hoặc chọn tệp');
    const ready = () => Object.values(f).every(el => el.value.trim() !== '') && uploaded.length > 0;
    function unlock() {
        const ok = ready();
        $('selectionStatusNote').textContent = ok ? '✓ Hồ sơ hợp lệ! Hãy tích chọn các mục cần kiểm tra bên dưới:' : 'Nhập đủ thông tin bên trái & tải ít nhất 1 tệp hồ sơ để chọn mục kiểm tra';
        $('selectionStatusNote').classList.toggle('unlocked', ok);
        items.forEach(i => i.classList.toggle('disabled-item', !ok));
        boxes.forEach(b => { b.disabled = !ok; });
    }
    function groupSuggest() {
        const box = $('fdaSuggest'), res = E.search(f.name.value, 4);
        box.replaceChildren();
        if (!f.name.value.trim()) { selGroup = null; return; }
        if (!res.length) { selGroup = null; box.append(h('span', {}, 'Chưa khớp nhóm sản phẩm FDA nào (không có nghĩa là an toàn). Báo cáo sẽ chỉ dựa trên hồ sơ bạn nhập.')); return; }
        if (!selGroup || !res.some(p => p[0] === selGroup)) selGroup = res[0][0];
        box.append(h('span', {}, 'Nhóm sản phẩm FDA:'));
        res.forEach(p => box.append(h('button', { type: 'button', class: 'fda-chip' + (p[0] === selGroup ? ' on' : ''), onclick: () => { selGroup = p[0]; groupSuggest(); } }, E.displayName(p) + ' (VN ' + p[5] + ')')));
    }
    Object.values(f).forEach(el => { el.addEventListener('input', unlock); el.addEventListener('change', unlock); });
    f.name.addEventListener('input', groupSuggest);
    unlock();

    dz.addEventListener('click', e => { if (!e.target.classList.contains('remove-file-btn')) fileInput.click(); });
    dz.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === dz) { e.preventDefault(); fileInput.click(); } });
    dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('dragover'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
    dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('dragover'); if (e.dataTransfer && e.dataTransfer.files.length) addFiles(e.dataTransfer.files); });
    fileInput.addEventListener('change', () => { if (fileInput.files.length) addFiles(fileInput.files); });
    function addFiles(fs) { for (const x of fs) uploaded.push(x.name); renderFiles(); unlock(); }
    function renderFiles() {
        dz.querySelector('.dz-hint').textContent = uploaded.length ? '+ Thêm tệp khác' : 'Kéo thả hoặc chọn tệp';
        list.replaceChildren(...uploaded.map((n, i) => h('li', { class: 'uploaded-file-item' },
            h('span', { style: 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap' }, '📄 ' + n),
            h('span', { class: 'remove-file-btn', role: 'button', tabindex: '0', 'aria-label': 'Xóa tệp ' + n, title: 'Xóa tệp',
                onclick: e => { e.stopPropagation(); uploaded.splice(i, 1); renderFiles(); unlock(); },
                onkeydown: e => { if (e.key === 'Enter') { e.stopPropagation(); uploaded.splice(i, 1); renderFiles(); unlock(); } } }, '✕'))));
    }
    const money = v => v.toLocaleString('vi-VN') + ' đ';
    function total() { return boxes.reduce((a, b) => a + (b.checked ? parseInt(b.getAttribute('data-price'), 10) || 0 : 0), 0); }
    function countChecks() {
        let n = 0; boxes.forEach((b, i) => { items[i].classList.toggle('checked', b.checked); if (b.checked) n++; });
        $('selectedCountText').textContent = n + ' mục'; $('totalPaymentAmount').textContent = money(total()); return n;
    }
    boxes.forEach(b => b.addEventListener('change', countChecks));
    items.forEach(i => i.addEventListener('click', e => { if (!ready()) { e.preventDefault(); openModal('Chưa đủ thông tin hồ sơ', 'Vui lòng điền đủ 5 trường thông tin sản phẩm và tải lên ít nhất 1 tệp hồ sơ trước khi chọn hạng mục kiểm tra.'); } }));

    $('btnAnalyzeRisk').addEventListener('click', () => {
        if (!ready()) return openModal('Thiếu dữ liệu đầu vào', 'Bạn cần nhập đầy đủ thông tin sản phẩm và tải tệp hồ sơ đính kèm trước khi phân tích rủi ro.');
        if (countChecks() === 0) return openModal('Chưa chọn mục kiểm tra', 'Vui lòng tích chọn ít nhất 1 mục kiểm tra (Nhãn sản phẩm, COA, Giấy phép hoặc Nhà máy).');
        if (!user) return openModal('Cần đăng nhập', h('div', {}, h('p', { style: 'color:#5e7266;font-size:14.5px;margin-bottom:12px' }, 'Hãy đăng nhập để lưu và xem báo cáo.'), h('a', { href: 'login.html', style: 'font-weight:700;color:#094426' }, 'Đi tới trang đăng nhập')));
        const checks = boxes.filter(b => b.checked).map(b => b.value), res = E.search(f.name.value, 1), grp = selGroup || (res[0] ? res[0][0] : null) || (E.search(f.ing.value, 1)[0] || [null])[0];
        const gName = grp ? E.displayName(E.search(f.name.value, 6).concat(E.search(f.ing.value, 6)).find(p => p[0] === grp) || [grp, grp]) : 'Không gắn nhóm FDA';
        openModal('Xác nhận hồ sơ', h('div', { style: 'font-size:14px;line-height:1.7;color:#1b2e23' },
            h('p', {}, h('strong', {}, 'Sản phẩm: '), f.name.value), h('p', {}, h('strong', {}, 'Thị trường: '), f.market.value),
            h('p', {}, h('strong', {}, 'Nhóm sản phẩm FDA: '), gName), h('p', {}, h('strong', {}, 'Tệp đính kèm: '), uploaded.length + ' tệp (' + uploaded.join(', ') + ')'),
            h('p', {}, h('strong', {}, 'Hạng mục kiểm tra: '), checks.join(', ')),
            h('div', { style: 'background:#f3f6f0;padding:12px 16px;border-radius:10px;margin:14px 0' }, 'Tổng tiền thanh toán: ' + money(total()) + ' (demo, không thu phí thật)'),
            h('button', { id: 'confirmRunBtn', style: 'width:100%;background:#0b4628;color:#fff;border:0;padding:12px;border-radius:999px;font-weight:700;cursor:pointer', onclick: () => run(checks, grp) }, 'Chạy đối chiếu dữ liệu')));
    });
    function run(checks, grp) {
        const r = E.analyze({ name: f.name.value.trim(), ingredients: f.ing.value.trim(), hs: f.hs.value.trim(), market: f.market.value, factory: f.factory.value.trim(), files: uploaded.slice(), checks, group: grp });
        r.owner = user.email; r.createdAt = new Date().toISOString(); r.fee = total();
        r.id = 'PC-' + new Date().getFullYear() + '-' + String(myReports().length + 1).padStart(4, '0');
        saveReport(r); cur = r; closeModal(); showMatching(false);
    }

    // ---- Màn 2: Data Matching ----
    function showMatching(instant) {
        const p = $('tab-matching'), bar = h('i'), lab = h('b', {}, 'Đang đối chiếu 0%'), nextBtn = h('button', { class: 'btn-solid', onclick: () => showReport() }, 'Tiếp tục: Báo cáo rủi ro');
        const rows = E.matchRows(cur);
        p.replaceChildren(stepper(2), lab, h('div', { class: 'prog-bar' }, bar),
            h('div', {}, h('span', { class: 'src-chip' }, 'FDA Import Refusals'), ...['FDA Import Alerts', 'Warning Letters', 'Inspection Classification', 'RASFF Window (EU)', 'EUR-Lex', 'Access2Markets'].map(s => h('span', { class: 'src-chip off', title: 'Chưa tích hợp trong bản demo' }, s + ' · chưa tích hợp'))),
            h('div', { class: 'pane-card' }, h('table', { class: 'dt' }, h('tr', {}, ['MÃ', 'NGUỒN', 'TẦN SUẤT', 'TRÍCH NGUỒN', 'KỲ DỮ LIỆU', 'TRẠNG THÁI'].map(t => h('th', {}, t))),
                ...rows.map(r => h('tr', {}, h('td', {}, h('b', {}, r.code)), h('td', {}, r.src), h('td', {}, r.freq), h('td', { class: 'mut' }, r.ex), h('td', { class: 'mut' }, r.per), h('td', {}, h('span', { class: 'st-tag' + (r.ok ? '' : ' warn') }, r.st)))))),
            cur.group ? null : h('div', { class: 'pane-card' }, 'Không gắn được nhóm sản phẩm FDA, nên chưa có tín hiệu lịch sử. Điều này không có nghĩa là sản phẩm an toàn; bạn có thể quay lại và đổi tên sản phẩm.'),
            h('p', { class: 'demo-cap' }, 'Dữ liệu: FDA Import Refusal Report, thực phẩm, ' + E.meta.period + '. Tần suất là phần các dòng bị từ chối của nhóm sản phẩm có mã lỗi đó, không phải xác suất.'), nextBtn);
        show('matching', 'Đối chiếu dữ liệu', cur.id, 'check-new');
        nextBtn.disabled = !instant; let v = instant ? 100 : 0;
        const draw = () => { bar.style.width = v + '%'; lab.textContent = v >= 100 ? 'Đã đối chiếu 100%' : 'Đang đối chiếu ' + v + '%'; };
        draw();
        if (!instant) { const t = setInterval(() => { v = Math.min(100, v + 10); draw(); if (v >= 100) { clearInterval(t); nextBtn.disabled = false; } }, 90); }
    }

    // ---- Màn 3: Báo cáo rủi ro ----
    function bars(value) {
        const vals = E.COSTS.map(c => value * c[1] / 1e6), max = Math.max(...vals) || 1;
        return '<svg viewBox="0 0 520 240" role="img" aria-label="Mô phỏng thiệt hại theo kịch bản giả định" style="width:100%"><path d="M30 200H500" stroke="#cfdad2"/>' +
            vals.map((v, i) => { const hh = Math.round(v / max * 150), x = 50 + i * 100; return '<rect x="' + x + '" y="' + (200 - hh) + '" width="85" height="' + hh + '" fill="#c26a12"/><text x="' + (x + 42) + '" y="' + (192 - hh) + '" font-size="12" text-anchor="middle" fill="#0b3d25">' + E.fmt(v) + '</text><text x="' + (x + 42) + '" y="220" font-size="12" text-anchor="middle" fill="#0b3d25">' + E.COSTS[i][0] + '</text>'; }).join('') + '</svg>';
    }
    function showReport() {
        const p = $('tab-report'), s = cur.score, chart = h('div'), val = h('b'), sl = h('input', { type: 'range', min: '100000000', max: '5000000000', step: '50000000', value: String(cur.value), 'aria-label': 'Giá trị lô hàng' });
        const upd = () => { cur.value = +sl.value; chart.innerHTML = bars(cur.value); val.textContent = (cur.value >= 1e9 ? (cur.value / 1e9).toLocaleString('vi-VN') + ' tỷ đồng' : E.fmt(cur.value / 1e6) + ' triệu đồng'); };
        sl.addEventListener('input', upd); sl.addEventListener('change', () => saveReport(cur));
        p.replaceChildren(stepper(3), h('div', { class: 'rp-grid' },
            h('div', {}, h('div', { class: 'pane-card' }, h('div', { class: 'rp-score ' + lvlCls(s.level) }, s.level === 'CHƯA ĐỦ DỮ LIỆU' ? '—' : s.total + '/100'), h('b', {}, 'Mức: ' + s.level),
                h('p', { class: 'demo-cap', style: 'margin-top:8px' }, 'Điểm rà soát = tín hiệu lịch sử ' + s.hist + '/70 + thiếu hồ sơ ' + s.gap + '/30. Đây không phải xác suất bị từ chối.'),
                s.level === 'CHƯA ĐỦ DỮ LIỆU' ? h('p', {}, 'Không có tín hiệu lịch sử cho sản phẩm này, nên chưa thể đánh giá. Không có tín hiệu không có nghĩa là an toàn.') : null),
                h('div', { class: 'pane-card' }, h('h3', {}, 'Nguyên nhân chính'), cur.causes.length ? h('ol', { class: 'rp-list' }, cur.causes.map(c => h('li', {}, c))) : h('p', {}, 'Chưa có nguyên nhân nào được xác định.'))),
            h('div', { class: 'pane-card' }, h('h3', {}, 'Mô phỏng thiệt hại (triệu đồng, kịch bản giả định)'), chart, h('div', { class: 'slide-row' }, h('label', {}, 'Giá trị lô hàng'), sl, val),
                h('p', { class: 'demo-cap' }, 'Giả định demo: nếu lô bị giữ hoặc từ chối, lưu kho 4%, trả về 8%, tiêu hủy 6%, mất cơ hội 15% giá trị lô. Đây không phải dự báo thiệt hại.'),
                h('div', { class: 'rp-acts' }, h('button', { class: 'btn-solid', onclick: () => window.print() }, 'Xuất PDF (in trang)'), h('button', { class: 'btn-ghost', onclick: copySummary }, 'Sao chép tóm tắt'), h('span', { class: 'demo-cap' }, cur.id + (cur.fee ? ' · Phí demo ' + money(cur.fee) : ''))))),
            h('div', { class: 'rp-acts' }, h('button', { class: 'btn-yel', onclick: () => showActions() }, 'Xem hướng dẫn hành động'), h('button', { class: 'btn-ghost', onclick: () => showMatching(true) }, 'Quay lại đối chiếu')));
        upd(); show('report', 'BÁO CÁO RỦI RO', cur.id, 'check-new');
    }
    function copySummary() {
        const t = cur.id + ' · ' + cur.input.name + ' · ' + cur.input.market + '\nMức: ' + cur.score.level + (cur.score.level === 'CHƯA ĐỦ DỮ LIỆU' ? '' : ' (' + cur.score.total + '/100)') + '\nNguyên nhân chính:\n' + cur.causes.map((c, i) => (i + 1) + '. ' + c).join('\n') + '\n(Điểm rà soát, không phải xác suất bị từ chối)';
        const done = () => openModal('Tóm tắt báo cáo', h('pre', { style: 'white-space:pre-wrap;font-size:13.5px;line-height:1.5' }, t));
        try { navigator.clipboard.writeText(t).then(done, done); } catch (e) { done(); }
    }

    // ---- Màn 4: Action Guide ----
    function showActions() {
        const p = $('tab-actions'), bar = h('i'), lab = h('b'), upd = () => { const v = prog(cur); bar.style.width = v + '%'; lab.textContent = 'Tiến độ tổng thể ' + v + '%'; };
        p.replaceChildren(stepper(4), lab, h('div', { class: 'prog-bar' }, bar), h('div', { class: 'pane-card' }, cur.actions.length ? h('table', { class: 'dt' },
            h('tr', {}, ['', 'HÀNH ĐỘNG', 'CĂN CỨ / NGUỒN', 'ƯU TIÊN', 'TRẠNG THÁI'].map(t => h('th', {}, t))),
            ...cur.actions.map((a, i) => { const st = h('td', {}, cur.done[i] ? 'Đã xong' : 'Chưa bắt đầu'); return h('tr', {}, h('td', {}, h('input', { type: 'checkbox', 'aria-label': a.text, ...(cur.done[i] ? { checked: '' } : {}), onchange: e => { cur.done[i] = e.target.checked; st.textContent = cur.done[i] ? 'Đã xong' : 'Chưa bắt đầu'; saveReport(cur); upd(); } })), h('td', {}, a.text), h('td', {}, a.src), h('td', {}, h('span', { class: 'badge-mini ' + (a.pri === 'CAO' ? 'badge-high' : 'badge-med') }, a.pri)), st); })) : h('p', {}, 'Chưa có hành động nào được đề xuất.')),
            h('p', { class: 'demo-cap' }, 'Hành động lấy từ thư viện mã lỗi FDA (bản nháp, chưa được chuyên gia duyệt) và các thiếu sót trong hồ sơ bạn nhập. Chỉ là gợi ý rà soát, không thay thế tư vấn tuân thủ.'),
            h('div', { class: 'rp-acts' }, h('button', { class: 'btn-ghost', onclick: () => showReport() }, 'Xem lại báo cáo'), h('button', { class: 'btn-solid', onclick: () => navItems[2].click() }, 'Về Báo cáo của tôi')));
        upd(); show('actions', 'Corrective Action Guide', cur.id, 'check-new');
    }

    // ---- Báo cáo của tôi ----
    function renderMyReports() {
        const rs = myReports().slice().reverse(), p = $('tab-my-reports');
        p.replaceChildren(h('div', { class: 'pane-card' }, !user ? h('p', {}, 'Hãy đăng nhập để xem các báo cáo đã lưu.') : rs.length ? h('table', { class: 'dt' }, h('tr', {}, ['MÃ HỒ SƠ', 'SẢN PHẨM', 'THỊ TRƯỜNG', 'NGÀY TẠO', 'ĐIỂM', 'MỨC', 'TIẾN ĐỘ', ''].map(t => h('th', {}, t))),
            ...rs.map(r => h('tr', {}, h('td', {}, r.id), h('td', {}, r.input.name), h('td', {}, r.input.market), h('td', {}, new Date(r.createdAt).toLocaleDateString('vi-VN')), h('td', {}, r.score.level === 'CHƯA ĐỦ DỮ LIỆU' ? '—' : String(r.score.total)), h('td', {}, h('span', { class: 'badge-mini ' + badgeCls(r.score.level) }, r.score.level)), h('td', {}, prog(r) + '%'), h('td', {}, h('button', { class: 'btn-ghost', onclick: () => { cur = r; showReport(); } }, 'Xem'))))) : h('p', {}, 'Chưa có báo cáo nào. Hãy bắt đầu ở mục Kiểm tra mới.')));
    }

    // ---- Risk Alert (minh họa) ----
    const fm = $('filterMarket'), fc = $('filterCategory'), fs = $('filterSeverity'), cards = document.querySelectorAll('.alert-card');
    function applyFilters() { cards.forEach(c => { c.style.display = (fm.value === 'all' || c.dataset.market === fm.value) && (fc.value === 'all' || c.dataset.category === fc.value) && (fs.value === 'all' || c.dataset.severity === fs.value) ? 'flex' : 'none'; }); }
    [fm, fc, fs].forEach(x => x && x.addEventListener('change', applyFilters));
    cards.forEach(c => c.addEventListener('click', () => openModal(c.querySelector('h3').textContent, h('div', { style: 'font-size:14px;line-height:1.5;color:#1b2e23' },
        h('p', { style: 'margin-bottom:8px' }, h('strong', {}, 'Tình trạng: '), c.querySelector('.alert-reason').textContent), h('p', { style: 'color:#5e7266;margin-bottom:10px' }, c.querySelector('.alert-meta').textContent),
        h('p', {}, 'Cảnh báo minh họa. Khi có nguồn thật, hãy rà soát lại chứng nhận kiểm nghiệm, dư lượng và nhãn trước khi thông quan.')))));
    $('notifyBtn').addEventListener('click', () => openModal('Đặt thông báo Email / Zalo', 'Tính năng gửi thông báo sẽ có ở phiên bản sau. Bản demo chưa gửi email hoặc tin nhắn thật.'));
    if ($('dashLoginBtn')) $('dashLoginBtn').addEventListener('click', () => { window.location.href = 'login.html'; });

    renderOverview();
    setTitle('Dashboard Tổng quan', user ? user.companyName : 'Chưa đăng nhập · số liệu minh họa');
});
