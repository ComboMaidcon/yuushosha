document.addEventListener('DOMContentLoaded', () => {
    const $ = id => document.getElementById(id), E = window.PCE, PR = window.PC_PRICING;
    const SESSION_KEY = 'precheck_current_user', RKEY = 'precheck_reports', DRAFT_KEY = 'precheck_check_draft';
    function h(t, a, ...k) {
        const e = document.createElement(t);
        for (const x in a || {}) { if (x === 'class') e.className = a[x]; else if (x.startsWith('on')) e[x] = a[x]; else e.setAttribute(x, a[x]); }
        for (const c of k.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
        return e;
    }
    let user = null;
    try { user = JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { user = null; }
    function readReports() {
        const reports = JSON.parse(localStorage.getItem(RKEY)) ?? [];
        if (!Array.isArray(reports)) throw new Error('Invalid report storage');
        return reports;
    }
    const allReports = () => { try { return readReports(); } catch { return []; } };
    const myReports = () => (user ? allReports().filter(r => r.owner === user.email) : []);
    function saveReport(report) {
        if (report.sample) return true;
        try {
            const reports = readReports();
            const index = reports.findIndex(item => item.id === report.id && item.owner === report.owner);
            if (index >= 0) reports[index] = report;
            else reports.push(report);
            localStorage.setItem(RKEY, JSON.stringify(reports));
            return true;
        } catch {
            return false;
        }
    }
    function removeDraft() {
        try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* Storage may be unavailable. */ }
    }
    const prog = r => (r.actions.length ? Math.round(100 * r.done.filter(Boolean).length / r.actions.length) : 0);
    const sameMonth = d => (d || '').slice(0,7) === new Date().toISOString().slice(0,7);
    const monthSMECount = () => myReports().filter(r => r.billingPlan === 'sme' && sameMonth(r.createdAt)).length;
    const lvlCls = l => (l === 'CAO' ? 'rp-high' : l === 'TRUNG BÌNH' ? 'rp-med' : l === 'THẤP' ? 'rp-low' : 'rp-grey');
    const badgeCls = l => (l === 'CAO' ? 'badge-high' : l === 'TRUNG BÌNH' ? 'badge-med' : 'badge-low');

    // ---- Tài khoản ----
    if (user && $('userAuthArea')) {
        $('userAuthArea').replaceChildren(
            h('div', { class: 'user-pill', title: user.companyName },
                h('span', {}, user.email === 'demo-offline@precheck.local' ? 'Tài khoản demo' : user.companyName)),
            h('button', { class: 'btn-logout', id: 'logoutBtn', onclick: () => { localStorage.removeItem(SESSION_KEY); removeDraft(); window.location.reload(); } }, 'Đăng xuất'));
    }

    // ---- Hộp thoại ----
    const modal = $('dashModal');
    function openModal(title, body) {
        $('dashModalTitle').textContent = title;
        const b = $('dashModalBody'); b.replaceChildren();
        b.append(typeof body === 'string' ? h('p', { style: 'color:#5e7266;font-size:14.5px;line-height:1.5' }, body) : body);
        if (!modal.open) modal.showModal();
    }
    const closeModal = () => modal.close();
    $('closeDashModal').addEventListener('click', closeModal);

    // Điều hướng chính
    const panes = ['overview', 'check-new', 'matching', 'report', 'actions', 'my-reports', 'risk-alert', 'placeholder'];
    const navItems = [...document.querySelectorAll('.nav-item')];
    const menu = $('dashMenu');
    const nav = $('dashNav');

    function setMenu(open) {
        nav.classList.toggle('is-open', open);
        menu.setAttribute('aria-expanded', String(open));
    }
    menu.hidden = false;
    menu.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
    nav.addEventListener('keydown', event => {
        if (event.key === 'Escape' && nav.classList.contains('is-open')) {
            setMenu(false);
            menu.focus();
        }
    });
    document.querySelector('.dash-skip').addEventListener('click', event => {
        event.preventDefault();
        $('dashboard-content').focus();
    });

    function setTitle(title, subtitle) {
        const heading = h('h1', { tabindex: '-1' }, title);
        $('dashTitleGroup').replaceChildren(...(subtitle ? [heading, h('p', {}, subtitle)] : [heading]));
        document.title = title + ' | PRECHECK';
        return heading;
    }

    function show(pane, title, subtitle, activeTab, focus = true) {
        panes.forEach(name => { $('tab-' + name).style.display = name === pane ? 'block' : 'none'; });
        const heading = setTitle(title, subtitle);
        navItems.forEach(item => {
            const selected = item.dataset.tab === activeTab;
            item.classList.toggle('active', selected);
            if (selected) item.setAttribute('aria-current', 'page');
            else item.removeAttribute('aria-current');
        });
        const visiblePane = $('tab-' + pane);
        for (const table of visiblePane.querySelectorAll('table.dt')) {
            if (table.parentElement.classList.contains('dash-table-scroll')) continue;
            const wrapper = h('div', { class: 'dash-table-scroll', role: 'region', 'aria-label': 'Bảng ' + title, tabindex: '0' });
            table.before(wrapper);
            wrapper.append(table);
        }
        setMenu(false);
        if (focus) {
            heading.focus({ preventScroll: true });
            window.scrollTo(0, 0);
        }
    }

    function activateTab(item, focus = true) {
        const { tab, menu: name } = item.dataset;
        if (tab === 'overview') {
            renderOverview();
            show('overview', 'Tổng quan', user ? user.companyName : 'Hồ sơ và báo cáo được lưu trên trình duyệt.', tab, focus);
        } else if (tab === 'check-new') {
            show('check-new', 'Kiểm tra hồ sơ mới', 'Phạm vi sàng lọc hiện tại là thực phẩm sang Hoa Kỳ.', tab, focus);
        } else if (tab === 'my-reports') {
            renderMyReports();
            show('my-reports', name, 'Các lần kiểm tra đã lưu trên trình duyệt này.', tab, focus);
        } else if (tab === 'risk-alert') {
            show('risk-alert', name, 'Tình huống minh họa. Xem cập nhật chính thức qua bản tin.', tab, focus);
        } else {
            renderExtra(tab);
            show('placeholder', name, '', tab, focus);
        }
    }

    navItems.forEach(item => item.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (location.hash !== item.hash) history.pushState(null, '', item.hash);
        activateTab(item);
    }));

    function openTab(tab) {
        navItems.find(item => item.dataset.tab === tab)?.click();
    }

    function route(focus = true) {
        activateTab(navItems.find(item => item.hash === location.hash) || navItems[0], focus);
    }
    window.addEventListener('hashchange', () => route());

    function renderOverview() {
        const reports = myReports();
        const scored = reports.filter(report => report.score.level !== 'CHƯA ĐỦ DỮ LIỆU');
        const average = scored.length ? Math.round(scored.reduce((sum, report) => sum + report.score.total, 0) / scored.length) : null;
        const tasks = reports.reduce((sum, report) => sum + report.actions.length, 0);
        const completed = reports.reduce((sum, report) => sum + report.done.filter(Boolean).length, 0);
        $('ovReports').textContent = reports.length;
        $('ovScore').textContent = average === null ? '—' : average + '/100';
        $('ovCheck').textContent = tasks ? Math.round(100 * completed / tasks) + '%' : '—';
        $('overviewPeriod').textContent = 'Kỳ dữ liệu ' + E.meta.period + ' · cập nhật ' + E.meta.updated;
        $('prodRows').replaceChildren(...(reports.length
            ? reports.slice(-3).reverse().map(report =>
                h('button', { class: 'dash-recent-row', type: 'button', onclick: () => { cur = report; showReport(); } },
                    h('span', {}, h('strong', {}, report.input.name), h('small', {}, report.id + ' · ' + prog(report) + '% checklist')),
                    h('span', { class: 'dash-recent-score' }, report.score.level === 'CHƯA ĐỦ DỮ LIỆU' ? 'Chưa đủ dữ liệu' : report.score.total + '/100')))
            : [h('p', {}, user ? 'Chưa có báo cáo. Tạo kiểm tra mới để lưu kết quả.' : 'Đăng nhập để xem báo cáo đã lưu. Bạn có thể mở hồ sơ mẫu ngay.')]));

        $('riskTrend').hidden = scored.length < 2;
        if (scored.length < 2) return;
        $('chartCap').textContent = 'Các báo cáo đã lưu có đủ dữ liệu để tính chỉ số.';
        $('riskChart').replaceChildren(...scored.slice(-6).map(report =>
            h('div', { class: 'dash-trend-row' }, h('span', {}, report.id),
                h('meter', { min: '0', max: '100', value: String(report.score.total), 'aria-label': 'Điểm ' + report.input.name }),
                h('strong', {}, report.score.total + '/100'))));
    }

    $('previewSample').addEventListener('click', () => {
        const product = E.search('tôm', 1)[0];
        cur = {
            ...E.analyze({
                name: 'Tôm đông lạnh', ingredients: 'Tôm', market: 'Hoa Kỳ (FDA)',
                hs: '', factory: 'Cơ sở mẫu', files: ['nhan-mau.pdf'],
                checks: CHECK_ALL, group: product?.[0]
            }),
            id: 'Hồ sơ mẫu', sample: true, billingPlan: 'single', fee: PR.active.single
        };
        showMatching();
    });

    // ---- Stepper ----
    function stepper(active) {
        const labels = ['Nhập hồ sơ', 'Đối chiếu dữ liệu', 'Xem điểm và chi phí', 'Lập checklist'], w = h('div', { class: 'stepper-wrapper' });
        labels.forEach((l, i) => {
            if (i) w.append(h('div', { class: 'step-line' }));
            w.append(h('button', { type: 'button', class: 'step-pill' + (i + 1 === active ? ' active' : ''), ...(i + 1 === active ? { 'aria-current': 'step' } : {}), onclick: () => goStep(i + 1) }, (i + 1) + '  ' + l));
        });
        return w;
    }
    function goStep(n) {
        if (n === 1) return openTab('check-new');
        if (!cur) return openModal('Chưa có báo cáo', 'Hãy chạy một lần kiểm tra ở bước INPUT trước.');
        ({ 2: showMatching, 3: showReport, 4: showActions })[n](true);
    }

    // ---- Màn INPUT ----
    const f = {
        name: $('cnProductName'), keyword: $('cnFDAKeyword'), ing: $('cnIngredients'),
        hs: $('cnHsCode'), market: $('cnMarket'), factory: $('cnFactory')
    };
    const dz = $('uploadDropzone'), fileInput = $('fileInput'), list = $('uploadedFileList');
    const planRadios = [...document.querySelectorAll('input[name="billingPlan"]')];
    const CHECK_ALL = ['Nhãn sản phẩm','COA','Giấy phép','Nhà máy'];
    let uploaded = [], selGroup = null, cur = null;

    const requiredFields = [f.name, f.market, f.factory];
    const ready = () => requiredFields.every(field => field.value.trim());
    function fieldError(field, invalid) {
        $(field.id + 'Error').hidden = !invalid;
        if (invalid) field.setAttribute('aria-invalid', 'true');
        else field.removeAttribute('aria-invalid');
    }
    function unlock(){
      const ok=ready();
      $('selectionStatusNote').textContent=ok?'✓ Đã có thông tin cơ bản. Tất cả 4 nhóm rà soát được bao gồm.':'Nhập sản phẩm, thị trường và cơ sở để chạy báo cáo; hồ sơ có thể tải bổ sung.';
      $('selectionStatusNote').classList.toggle('unlocked',ok);
    }
    function groupSuggest() {
        const box = $('fdaSuggest'), lookup = $('fdaLookup');
        const hasName = Boolean(f.name.value.trim());
        const query = f.keyword.value.trim();
        box.replaceChildren();
        lookup.hidden = !hasName;
        if (!hasName) { selGroup = null; return; }
        const res = E.search(query || f.name.value, 4);
        if (!res.some(item => item[0] === selGroup)) selGroup = query ? null : res[0]?.[0] ?? null;
        if (!res.length) {
            box.append(h('span', {}, 'Chưa tìm thấy nhóm FDA. Thử một từ khóa ngắn hoặc tiếp tục với báo cáo sơ bộ.'));
            return;
        }
        box.append(h('span', {}, query ? 'Chọn nhóm FDA phù hợp với sản phẩm:' : 'Nhóm FDA gợi ý (cần xác nhận):'));
        res.forEach(p => box.append(h('button', {
            type: 'button', class: 'fda-chip' + (p[0] === selGroup ? ' on' : ''),
            'aria-pressed': String(p[0] === selGroup),
            onclick: event => {
                selGroup = p[0];
                for (const button of box.querySelectorAll('button')) {
                    const selected = button === event.currentTarget;
                    button.classList.toggle('on', selected);
                    button.setAttribute('aria-pressed', String(selected));
                }
                saveDraft();
            }
        }, E.displayName(p) + ' (VN ' + p[5] + ')')));
    }
    Object.values(f).forEach(field => field.addEventListener('input', () => {
        if (field.hasAttribute('aria-invalid')) fieldError(field, !field.value.trim());
        if (field === f.name) {
            f.keyword.value = '';
            $('fdaLookup').open = false;
        }
        if (field === f.name || field === f.keyword) groupSuggest();
        unlock();
        saveDraft();
    }));
    $('pickFiles').addEventListener('click', () => fileInput.click());
    dz.addEventListener('dragover',e=>{e.preventDefault();dz.classList.add('dragover');});
    dz.addEventListener('dragleave',()=>dz.classList.remove('dragover'));
    dz.addEventListener('drop',e=>{e.preventDefault();dz.classList.remove('dragover');if(e.dataTransfer?.files?.length)addFiles(e.dataTransfer.files);});
    fileInput.addEventListener('change',()=>{if(fileInput.files.length)addFiles(fileInput.files);fileInput.value='';});
    function addFiles(files) {
        const errors = [];
        for (const file of files) {
            if (uploaded.length >= 8) { errors.push('Đã đủ 8 tệp.'); break; }
            if (!/\.(pdf|png|jpe?g|docx?|xlsx?)$/i.test(file.name)) errors.push(file.name + ' có định dạng không được hỗ trợ.');
            else if (file.size > 12 * 1024 * 1024) errors.push(file.name + ' vượt quá 12 MB.');
            else if (uploaded.includes(file.name)) errors.push(file.name + ' đã có trong danh sách.');
            else uploaded.push(file.name);
        }
        $('fileFeedback').textContent = errors.slice(0, 2).join(' ') + (errors.length > 2 ? ' Có thêm tệp không được nhận.' : '');
        renderFiles();
        saveDraft();
    }
    function renderFiles() {
        $('pickFiles').textContent = uploaded.length ? 'Thêm tệp (' + uploaded.length + '/8)' : 'Chọn tệp';
        list.replaceChildren(...uploaded.map((name, index) =>
            h('li', { class: 'uploaded-file-item' }, h('span', { title: name }, name),
                h('button', {
                    type: 'button', class: 'remove-file-btn', 'aria-label': 'Xóa tệp ' + name,
                    onclick: () => {
                        uploaded.splice(index, 1);
                        $('fileFeedback').textContent = '';
                        renderFiles();
                        (list.querySelectorAll('button')[index] || $('pickFiles')).focus();
                        saveDraft();
                    }
                }, '×'))));
    }
    function billingSelected(){return document.querySelector('input[name="billingPlan"]:checked')?.value||'single'}
    function updateBilling(){
      const plan=billingSelected(),sme=plan==='sme';
      document.querySelectorAll('.billing-choice').forEach(c=>c.classList.toggle('selected',c.dataset.plan===plan));
      $('planDescription').textContent=sme?'Thuê bao SME (tháng)':'Mua theo báo cáo (lượt)';
      $('totalPaymentAmount').textContent=PR.format(sme?PR.active.sme:PR.active.single);
      $('quotaStatus').textContent=sme?(user?Math.max(0,PR.active.quota-monthSMECount())+' / '+PR.active.quota+' lượt còn lại (tháng này)':'3 lượt / tháng · cần đăng nhập'):'Mỗi lượt tính theo một báo cáo';
    }
    function draftStatus(message = '', visible = false) {
        $('draftTools').hidden = !visible;
        $('draftNote').textContent = message;
    }
    function saveDraft() {
        const fields = Object.fromEntries(Object.entries(f).map(([key, field]) => [key, field.value]));
        const plan = billingSelected();
        if (!Object.values(fields).some(value => value.trim()) && !uploaded.length && plan === 'single') {
            removeDraft();
            return draftStatus();
        }
        try {
            sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ fields, plan, files: uploaded, group: selGroup }));
            draftStatus('Bản nháp đã lưu trong tab này.', true);
        } catch {
            draftStatus('Trình duyệt không lưu được bản nháp. Dữ liệu vẫn còn trên trang này.', true);
        }
    }
    function restoreDraft() {
        try {
            const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY));
            if (!draft?.fields) return;
            for (const [key, field] of Object.entries(f)) {
                const value = draft.fields[key];
                if (typeof value === 'string' && (key !== 'market' || value === 'Hoa Kỳ (FDA)')) field.value = value;
            }
            uploaded = Array.isArray(draft.files) ? draft.files.filter(name => typeof name === 'string').slice(0, 8) : [];
            selGroup = draft.group;
            $('fdaLookup').open = Boolean(f.keyword.value);
            planRadios.find(radio => radio.value === (draft.plan === 'sme' ? 'sme' : 'single')).checked = true;
            draftStatus('Đã khôi phục bản nháp.', true);
        } catch { /* Continue with an empty form. */ }
    }
    function clearDraft() {
        removeDraft();
        Object.values(f).forEach(field => { field.value = ''; });
        requiredFields.forEach(field => fieldError(field, false));
        uploaded = [];
        selGroup = null;
        $('fdaLookup').open = false;
        planRadios[0].checked = true;
        $('fileFeedback').textContent = '';
        groupSuggest();
        renderFiles();
        unlock();
        updateBilling();
        draftStatus();
    }
    $('clearDraft').addEventListener('click', () => openModal('Xóa bản nháp?', h('div', {},
        h('p', {}, 'Các thông tin đã nhập cho lần kiểm tra này sẽ bị xóa.'),
        h('button', { type: 'button', class: 'btn-solid dash-confirm', onclick: () => { closeModal(); clearDraft(); f.name.focus(); } }, 'Xóa bản nháp'))));
    planRadios.forEach(radio => radio.addEventListener('change', () => { updateBilling(); saveDraft(); }));
    restoreDraft();
    groupSuggest();
    renderFiles();
    unlock();
    updateBilling();
    $('btnAnalyzeRisk').addEventListener('click',()=>{
      if (!ready()) {
          requiredFields.forEach(field => fieldError(field, !field.value.trim()));
          requiredFields.find(field => !field.value.trim()).focus();
          return;
      }
      if (!user) {
          saveDraft();
          return openModal('Đăng nhập để lưu báo cáo', h('div', {},
              h('p', {}, 'Bạn có thể dùng tài khoản demo để tiếp tục kiểm tra trong tab này.'),
              h('a', { href: 'login.html?next=check-new', class: 'dash-primary dash-confirm' }, 'Đăng nhập và tiếp tục')));
      }
      const plan=billingSelected();
      if(plan==='sme'&&monthSMECount()>=PR.active.quota)return openModal('Đã sử dụng hết quota SME (mô phỏng)','Đã có 3 báo cáo SME trong tháng này trên trình duyệt. Bạn có thể chọn mua theo lượt để thử tiếp; bản demo không thu tiền.');
      const fallback = !f.keyword.value.trim() ? E.search(f.ing.value, 1)[0] : null;
      const matched = selGroup ? E.search(f.keyword.value.trim() || f.name.value, 4).find(item => item[0] === selGroup) : fallback;
      const grp = matched?.[0] ?? null;
      const gName = matched ? E.displayName(matched) : 'Không gắn nhóm FDA';
      const fee=plan==='sme'?PR.active.sme:PR.active.single;
      openModal('Xác nhận báo cáo',h('div',{style:'font-size:14px;line-height:1.7;color:#1b2e23'},
        h('p',{},h('strong',{},'Sản phẩm: '),f.name.value),h('p',{},h('strong',{},'Thị trường: '),f.market.value),
        h('p',{},h('strong',{},'Nhóm FDA: '),gName),h('p',{},h('strong',{},'Tệp mang tên: '),uploaded.length+' (chưa đọc nội dung, chưa xác minh)'),
        h('p',{},h('strong',{},'Phạm vi: '),'Nhãn · COA · thủ tục · nhà máy (tự động xem xét cả 4 nhóm)'),
        h('div',{style:'background:#f3f6f0;padding:12px 16px;border-radius:10px;margin:14px 0'},'Giá niêm yết '+(plan==='sme'?'gói tháng':'mỗi báo cáo')+': '+PR.format(fee)+''),
        h('p',{class:'demo-cap'},'Hệ thống chỉ sàng lọc dựa trên mã FDA lịch sử và tên tệp; không phê duyệt chất lượng hay thông quan.'),
        h('p', { id: 'confirmRunError', class: 'cn-error', role: 'alert' }),
        h('button',{type:'button',id:'confirmRunBtn',class:'btn-solid dash-confirm',onclick:()=>showPayment(plan,fee,()=>run(CHECK_ALL,grp,plan,fee))},'Tiếp tục thanh toán')));
    });
    // Luồng thanh toán mô phỏng: không nhận thông tin thẻ, không có giao dịch thật.
    function showPayment(plan, fee, onPaid) {
        const area = h('div', { id: 'payArea', style: 'min-height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center' });
        const start = h('button', { type: 'button', class: 'btn-solid dash-confirm', id: 'payStart' }, 'Thanh toán');
        const radios = name => [...document.querySelectorAll('input[name="payMethod"]')].find(x => x.value === name);
        const method = () => ([...document.querySelectorAll('input[name="payMethod"]')].find(x => x.checked) || {}).value || 'transfer';
        const body = h('div', {},
            h('p', { style: 'margin:0 0 12px' }, h('strong', {}, 'Số tiền: '), PR.format(fee)),
            h('div', { style: 'display:flex;gap:16px;margin-bottom:12px' },
                h('label', { style: 'display:flex;gap:6px;align-items:center;cursor:pointer' }, h('input', { type: 'radio', name: 'payMethod', value: 'transfer', checked: 'checked' }), 'Chuyển khoản QR'),
                h('label', { style: 'display:flex;gap:6px;align-items:center;cursor:pointer' }, h('input', { type: 'radio', name: 'payMethod', value: 'card' }), 'Thẻ ngân hàng')),
            area, h('div', { style: 'margin-top:12px' }, start),
            h('p', { class: 'demo-cap' }, 'Bản trình diễn: không có giao dịch thật và không thu tiền.'));
        openModal('Thanh toán gói báo cáo', body);
        const wait = (ms, fn) => setTimeout(() => { if (modal.open) fn(); }, ms);
        const finish = () => { modal.close(); onPaid(); };
        const render = () => {
            area.replaceChildren();
            if (method() === 'card') {
                area.append(h('p', { style: 'margin:0;color:#5e7266' }, 'Thẻ sẽ được xác nhận qua cổng thanh toán.'));
                return;
            }
            const img = h('img', { src: 'assets/img/qr-demo.svg', alt: 'Mã QR chuyển khoản', width: 180, height: 180, style: 'border-radius:8px;background:#fff;padding:8px' });
            area.append(img, h('p', { style: 'margin:0;color:#5e7266;font-size:14px' }, 'Quét mã bằng ứng dụng ngân hàng để chuyển khoản.'));
        };
        radios('transfer').addEventListener('change', () => { if (!start.disabled) render(); });
        radios('card').addEventListener('change', () => { if (!start.disabled) render(); });
        render();
        start.addEventListener('click', () => {
            start.disabled = true; start.textContent = 'Đang xử lý...';
            document.querySelectorAll('input[name="payMethod"]').forEach(x => x.disabled = true);
            const isCard = method() === 'card';
            area.replaceChildren(h('p', { style: 'margin:0;color:#5e7266' }, isCard ? 'Đang xác nhận thẻ...' : 'Đang chờ xác nhận chuyển khoản...'));
            wait(isCard ? 1800 : 3200, () => {
                area.replaceChildren(h('p', { style: 'margin:0;font-weight:600;color:#0b3d25' }, 'Đã nhận thanh toán'));
                wait(900, finish);
            });
        });
    }
    function run(checks,grp,plan,fee){
      const r=E.analyze({name:f.name.value.trim(),ingredients:f.ing.value.trim(),hs:f.hs.value.trim(),market:f.market.value,factory:f.factory.value.trim(),files:uploaded.slice(),checks,group:grp});
      r.owner=user.email;r.createdAt=new Date().toISOString();r.fee=fee;r.billingPlan=plan;
      r.id='PC-'+new Date().getFullYear()+'-'+Date.now().toString(36).toUpperCase().slice(-7);
      if (!saveReport(r)) {
          openModal('Không lưu được báo cáo', 'Trình duyệt không lưu được báo cáo. Kiểm tra quyền lưu trữ hoặc dung lượng, rồi thử lại.');
          return;
      }
      cur = r;
      closeModal();
      clearDraft();
      renderOverview();
      showMatching();
    }

    const refusalSource = 'https://www.fda.gov/industry/fda-import-process/import-refusals';

    function showMatching() {
        const rows = E.matchRows(cur);
        const table = h('table', { class: 'dt' },
            h('thead', {}, h('tr', {}, ['Mã', 'Nguồn', 'Tần suất', 'Căn cứ', 'Kỳ dữ liệu', 'Trạng thái'].map(title => h('th', { scope: 'col' }, title)))),
            h('tbody', {}, rows.map((row, index) => {
                const signal = cur.signals[index - 1];
                const evidence = signal?.official
                    ? h('details', { class: 'dash-disclosure' }, h('summary', {}, signal.title), h('p', {}, signal.official))
                    : row.ex;
                return h('tr', {}, h('td', { class: 'dash-code' }, h('b', {}, row.code)), h('td', {}, row.src), h('td', {}, row.freq),
                    h('td', {}, evidence), h('td', {}, row.per), h('td', {}, h('span', { class: 'st-tag' + (row.ok ? '' : ' warn') }, row.st)));
            }))
        );
        $('tab-matching').replaceChildren(stepper(2),
            ...(cur.sample ? [h('p', { class: 'dash-sample-note' }, 'Hồ sơ mẫu · dữ liệu nhập minh họa, kết quả tính từ tập FDA lịch sử.')] : []),
            h('div', { class: 'pane-card' },
                h('div', { class: 'dash-panel-heading' }, h('h2', {}, 'Căn cứ đối chiếu'), h('a', { class: 'extra-link', href: refusalSource, target: '_blank', rel: 'noopener noreferrer' }, 'Mở nguồn FDA')),
                h('p', { class: 'dash-source-note' }, 'FDA Import Refusals · kỳ ' + E.meta.period + ' · cập nhật tập dữ liệu ' + E.meta.updated),
                table,
                h('p', { class: 'dash-source-note' }, 'Tần suất là tỷ lệ mã lý do trong các dòng đã bị từ chối của nhóm. Tập dữ liệu đã chuẩn hóa và cần đối chiếu hồ sơ gốc khi ra quyết định.'),
                cur.group ? null : h('p', { class: 'dash-source-note' }, 'Chưa ghép được nhóm sản phẩm FDA. Kiểm tra lại tên sản phẩm hoặc mở nguồn FDA.')),
            h('button', { class: 'btn-solid', onclick: showReport }, 'Tiếp tục: Báo cáo sàng lọc')
        );
        show('matching', 'Đối chiếu dữ liệu', cur.id + ' · ' + cur.input.name, 'check-new');
    }

    function scoreExplanation(report) {
        const { hist, gap } = report.score;
        return h('details', { class: 'dash-disclosure score-method' },
            h('summary', {}, 'Cách tính chỉ số'),
            h('dl', {},
                h('div', {}, h('dt', {}, 'Tín hiệu lịch sử'), h('dd', {}, hist + '/70')),
                h('div', {}, h('dt', {}, 'Hồ sơ thiếu dấu hiệu nhận diện'), h('dd', {}, gap + '/30'))),
            h('p', {}, 'Điểm lịch sử dùng tối đa ba mã nổi bật. Mỗi tần suất được nhân trọng số ưu tiên (1, 0,6 hoặc 0,5). Tổng được nhân 40, làm tròn và giới hạn ở 70.'),
            h('p', {}, 'Mỗi hạng mục thiếu dấu hiệu nhận diện cộng 8 điểm, tối đa 30. Tổng từ 60 là ưu tiên cao, từ 35 đến 59 là trung bình, dưới 35 là thấp. Nếu chưa ghép được nhóm FDA, báo cáo không xếp mức.'),
            h('p', {}, 'Chỉ số xếp thứ tự rà soát. Kiểm tra căn cứ, chứng từ và kết quả kiểm nghiệm với người có chuyên môn trước khi quyết định gửi hàng.'));
    }

    function makeCostCalculator(){
      const outer=h('div',{class:'pane-card'},h('h3',{},'Mô phỏng khoản phí có căn cứ'),
        h('p',{class:'demo-cap'},'Ví dụ: Maersk US Import Demurrage, container 40ft dry, trừ Newark/Miami/Port Everglades/Philadelphia, hiệu lực 20/06/2026. 4 ngày miễn phí; ngày bị tính phí thứ 1–4: 300 USD/ngày; ngày 5–9: 345 USD; sau đó: 395 USD. Cần kiểm tra hợp đồng, cảng và biểu phí thực tế.'),
        h('div',{class:'cost-fields'},...[
          ['days','Số ngày PHÁT SINH PHÍ (sau free time)','4'],
          ['test','Chi phí kiểm nghiệm phát sinh (USD)','0'],
          ['handling','Chi phí xử lý / vận chuyển khác (USD)','0'],
          ['fx','Tỷ giá giả định (VND/USD)','26000']].map(([id,label,value])=>h('label',{},label,h('input',{type:'number',min:'0',step:'1',value,id:'reportCost_'+id})))),
        h('div',{class:'extra-sum',id:'reportCostTotal'},'—'),
        h('p',{class:'demo-cap',id:'reportCostBreakdown'},''),
        h('p',{class:'extra-note'},'Đây là kịch bản chi phí có thể phát sinh, KHÔNG phải “tổn thất trung bình”, xác suất từ chối hoặc số tiền PRECHECK chắc chắn tiết kiệm. Chưa tính tái xuất/tiêu hủy nếu không có báo giá.'),
        h('a',{class:'extra-link',href:'https://www.maersk.com/~/media_sc9/maersk/local-information/files/north-america/united-states-of-america/import/us-import-demurrage-tariff-effective-01-jan-2026-v2.pdf',target:'_blank',rel:'noopener noreferrer'},'Xem biểu phí Maersk chính thức (PDF)'));
      const fields={days:outer.querySelector('#reportCost_days'),test:outer.querySelector('#reportCost_test'),handling:outer.querySelector('#reportCost_handling'),fx:outer.querySelector('#reportCost_fx')};
      const update=()=>{const days=Math.max(0,Math.min(60,Math.floor(+fields.days.value||0))),num=k=>Math.max(0,+fields[k].value||0);
        const storage=Math.min(days,4)*300+Math.max(0,Math.min(days-4,5))*345+Math.max(0,days-9)*395;
        const usd=storage+num('test')+num('handling');
        outer.querySelector('#reportCostTotal').textContent=PR.format(Math.round(usd*num('fx'))) + ' (≈ '+usd.toLocaleString('en-US')+' USD)';
        outer.querySelector('#reportCostBreakdown').textContent=days+' ngày phát sinh phí → demurrage '+storage.toLocaleString('en-US')+' USD + khoản khác '+(usd-storage).toLocaleString('en-US')+' USD; tỷ giá do bạn nhập.';
      };Object.values(fields).forEach(el=>el.addEventListener('input',update));update();return outer;
    }
    function showReport(){
      const p=$('tab-report'),s=cur.score;
      const label=s.level==='CHƯA ĐỦ DỮ LIỆU'?'—':s.total+'/100';
      p.replaceChildren(stepper(3), ...(cur.sample ? [h('p', { class: 'dash-sample-note' }, 'Hồ sơ mẫu · thay đổi trong ví dụ chỉ dùng trong lần xem này.')] : []), h('div',{class:'rp-grid'},
        h('div',{},h('div',{class:'pane-card'},h('h3',{},'Chỉ số ưu tiên rà soát'),
          h('div',{class:'rp-score '+lvlCls(s.level)},label),h('b',{},'Mức ưu tiên: '+s.level),
          scoreExplanation(cur),
          h('p',{class:'extra-note'},'Kết luận chất lượng lô hiện tại: CHƯA ĐỦ CĂN CỨ. Muốn đánh giá đạt/không đạt từng chỉ tiêu phải có kết quả kiểm nghiệm, tiêu chí pháp lý đúng sản phẩm/thị trường, xác minh chứng từ và chuyên gia kiểm tra.')),
          h('div',{class:'pane-card'},h('h3',{},'Vấn đề cần ưu tiên đối chiếu (KHÔNG phải lỗi đã xác nhận)'),
            cur.causes.length?h('ol',{class:'rp-list'},cur.causes.map(c=>h('li',{},c))):h('p',{},'Chưa có tín hiệu lịch sử đủ để gợi ý nguyên nhân; không đồng nghĩa an toàn.'))),
        h('div',{},makeCostCalculator(),h('div',{class:'pane-card'},
          h('h3',{},'Gói dịch vụ trong bản demo'),
          h('p',{},cur.billingPlan==='sme'?'SME – tối đa 3 báo cáo/tháng':'Mua theo báo cáo lẻ'),
          h('p',{class:'demo-cap'},'Giá NIÊM YẾT tham khảo '+PR.format(cur.fee||PR.active.single)+'; không phát sinh thu tiền, không tạo giao dịch/hóa đơn.'),
          h('div',{class:'rp-acts'},h('button',{class:'btn-solid',onclick:()=>{ window.ensurePrintDisclaimer(); window.print(); }},'In / Lưu PDF'),h('button',{class:'btn-ghost',onclick:copySummary},'Sao chép tóm tắt'))))),
        h('div',{class:'rp-acts'},h('button',{class:'btn-yel',onclick:()=>showActions()},'Xem checklist hành động'),h('button',{class:'btn-ghost',onclick:()=>showMatching()},'Quay lại đối chiếu')));
      show('report', 'Báo cáo sàng lọc', cur.id + ' · ' + cur.input.name, 'check-new');
    }
    function copySummary() {
        const t = cur.id + ' · ' + cur.input.name + ' · ' + cur.input.market + '\nƯu tiên rà soát: ' + cur.score.level + (cur.score.level === 'CHƯA ĐỦ DỮ LIỆU' ? '' : ' (' + cur.score.total + '/100)') + '\nNguyên nhân chính:\n' + cur.causes.map((c, i) => (i + 1) + '. ' + c).join('\n') + '\n(Chỉ số ưu tiên rà soát, không phải kết luận chất lượng hay xác suất từ chối)';
        const done = () => openModal('Tóm tắt báo cáo', h('pre', { style: 'white-space:pre-wrap;font-size:13.5px;line-height:1.5' }, t));
        try { navigator.clipboard.writeText(t).then(done, done); } catch (e) { done(); }
    }

    // ---- Màn 4: Action Guide ----
    function showActions() {
        const report = cur, p = $('tab-actions');
        const bar = h('progress', { class: 'dash-progress', max: '100', 'aria-label': 'Tiến độ checklist' });
        const lab = h('strong', { role: 'status' });
        const feedback = h('p', { class: 'cn-error', role: 'alert' });
        function updateProgress() {
            bar.value = prog(report);
            lab.textContent = report.done.filter(Boolean).length + ' / ' + report.actions.length + ' việc đã hoàn thành';
        }
        const tasks = report.actions.map((action, index) => {
            const checkbox = h('input', { type: 'checkbox' });
            checkbox.checked = Boolean(report.done[index]);
            checkbox.addEventListener('change', () => {
                report.done[index] = checkbox.checked;
                if (!saveReport(report)) {
                    checkbox.checked = report.done[index] = !checkbox.checked;
                    feedback.textContent = 'Trình duyệt không lưu được thay đổi. Vui lòng thử lại.';
                    return;
                }
                feedback.textContent = '';
                updateProgress();
            });
            return h('li', {}, h('label', { class: 'dash-task' }, checkbox,
                h('span', { class: 'dash-task-copy' }, h('strong', {}, action.text), h('small', {}, action.src)),
                h('span', { class: 'badge-mini ' + badgeCls(action.pri === 'TB' ? 'TRUNG BÌNH' : action.pri) },
                    action.pri === 'CAO' ? 'Cao' : 'Trung bình')));
        });
        p.replaceChildren(stepper(4), h('div', { class: 'pane-card' },
            h('div', { class: 'dash-task-progress' }, lab, bar), feedback,
            tasks.length ? h('ul', { class: 'dash-task-list' }, tasks) : h('p', {}, 'Chưa có hành động nào được đề xuất.')),
            h('p', { class: 'demo-cap' }, 'Hành động lấy từ thư viện mã lỗi FDA (bản nháp, chưa được chuyên gia duyệt) và các thiếu sót trong hồ sơ bạn nhập. Chỉ là gợi ý rà soát, không thay thế tư vấn tuân thủ.'),
            h('div', { class: 'rp-acts' }, h('button', { class: 'btn-ghost', onclick: () => showReport() }, 'Xem lại báo cáo'), h('button', { class: 'btn-solid', onclick: () => openTab('my-reports') }, 'Về Báo cáo của tôi')));
        updateProgress();
        show('actions', 'Checklist hành động', report.id + ' · ' + report.input.name, 'check-new');
    }

    // ---- Báo cáo của tôi ----
    const reportLevels = [
        ['all', 'Tất cả mức ưu tiên'], ['CAO', 'Cao'], ['TRUNG BÌNH', 'Trung bình'],
        ['THẤP', 'Thấp'], ['CHƯA ĐỦ DỮ LIỆU', 'Chưa đủ dữ liệu']
    ];
    let reportQuery = '', reportLevel = 'all';
    function renderMyReports() {
        const reports = myReports().reverse(), pane = $('tab-my-reports');
        if (!reports.length) {
            pane.replaceChildren(h('div', { class: 'pane-card dash-history-empty' },
                h('h2', {}, user ? 'Chưa có báo cáo' : 'Đăng nhập để xem báo cáo'),
                h('p', {}, user ? 'Tạo lần kiểm tra đầu tiên để lưu kết quả và theo dõi checklist.' : 'Báo cáo được lưu theo tài khoản trên trình duyệt này.'),
                h('a', { class: 'dash-primary', href: user ? '#check-new' : 'login.html?next=my-reports' }, user ? 'Tạo kiểm tra mới' : 'Đăng nhập')));
            return;
        }
        const search = h('input', { type: 'search', id: 'report-search', placeholder: 'Ví dụ: tôm đông lạnh' });
        const level = h('select', { id: 'report-level' }, reportLevels.map(([value, label]) => h('option', { value }, label)));
        const count = h('p', { class: 'dash-history-count', role: 'status' });
        const rows = h('ul', { class: 'dash-history-list' });
        const empty = h('div', { class: 'pane-card dash-history-empty', hidden: '' },
            h('p', {}, 'Không tìm thấy báo cáo phù hợp.'),
            h('button', { class: 'btn-ghost', type: 'button', onclick: () => { search.value = ''; level.value = 'all'; update(); search.focus(); } }, 'Xóa bộ lọc'));
        function update() {
            reportQuery = search.value;
            reportLevel = level.value;
            const query = E.norm(reportQuery.trim());
            const filtered = reports.filter(report =>
                (reportLevel === 'all' || report.score.level === reportLevel) &&
                E.norm(report.input.name + ' ' + report.id).includes(query));
            count.textContent = filtered.length + ' / ' + reports.length + ' báo cáo';
            empty.hidden = filtered.length > 0;
            rows.replaceChildren(...filtered.map(report => {
                const date = new Date(report.createdAt).toLocaleDateString('vi-VN');
                const priority = reportLevels.find(([value]) => value === report.score.level)?.[1] || report.score.level;
                const score = report.score.level === 'CHƯA ĐỦ DỮ LIỆU' ? priority : priority + ' · ' + report.score.total + '/100';
                return h('li', { class: 'dash-history-row' },
                    h('div', { class: 'dash-history-main' }, h('h2', {}, report.input.name),
                        h('p', {}, report.id + ' · ' + report.input.market + ' · ' + date)),
                    h('div', { class: 'dash-history-status' },
                        h('span', { class: 'badge-mini ' + badgeCls(report.score.level) }, score),
                        h('small', {}, 'Checklist ' + prog(report) + '%')),
                    h('div', { class: 'dash-history-actions' },
                        h('button', { type: 'button', class: 'btn-solid', 'aria-label': 'Xem báo cáo ' + report.input.name, onclick: () => { cur = report; showReport(); } }, 'Xem báo cáo'),
                        h('button', { type: 'button', class: 'btn-ghost', 'aria-label': 'Mở checklist ' + report.input.name, onclick: () => { cur = report; showActions(); } }, 'Checklist')));
            }));
        }
        search.value = reportQuery;
        level.value = reportLevel;
        search.addEventListener('input', update);
        level.addEventListener('change', update);
        pane.replaceChildren(h('div', { class: 'dash-history-filters' },
            h('label', { for: 'report-search' }, 'Tên sản phẩm hoặc mã hồ sơ', search),
            h('label', { for: 'report-level' }, 'Mức ưu tiên', level)), count, rows, empty);
        update();
    }

    // ---- Risk Alert có bộ lọc thời gian; hiện chỉ là TÌNH HUỐNG minh họa ----
    const alertFilters = [['filterMarket', 'market'], ['filterCategory', 'category'], ['filterSeverity', 'severity']];
    const filterTime = $('filterTime'), alertCards = [...document.querySelectorAll('.alert-card')];
    const filterControls = [...alertFilters.map(([id]) => $(id)), filterTime];
    function applyAlertFilters() {
        const time = filterTime.value, now = Date.now();
        for (const card of alertCards) {
            const age = now - Date.parse(card.dataset.date);
            const dateMatches = time === 'all' || card.dataset.date.startsWith(time) ||
                (time === 'recent' && age >= 0 && age < 7 * 24 * 60 * 60 * 1000);
            card.hidden = !dateMatches || !alertFilters.every(([id, key]) => $(id).value === 'all' || card.dataset[key] === $(id).value);
        }
        $('alertEmpty').hidden = alertCards.some(card => !card.hidden);
    }
    filterControls.forEach(field => field.addEventListener('change', applyAlertFilters));
    $('resetAlerts').addEventListener('click', () => {
        filterControls.forEach(field => { field.value = 'all'; });
        applyAlertFilters();
        filterControls[0].focus();
    });
    alertCards.forEach(card => {
        const heading = card.querySelector('h3');
        const title = heading.textContent;
        const detail = h('button', { class: 'alert-detail', type: 'button', onclick: () =>
            openModal(title, h('div', {}, h('p', {}, card.querySelector('.alert-reason').textContent),
                h('p', { class: 'demo-cap' }, card.querySelector('.alert-meta').textContent),
                h('a', { class: 'extra-link', href: 'index.html#ban-tin' }, 'Xem bản tin Hoa Kỳ và Việt Nam'))) }, title);
        heading.replaceChildren(detail);
    });

    // ---- Các mục bổ sung hoạt động (không còn là trang placeholder chung) ----
    const sourceLinks=[
      ['FDA Import Refusals','https://www.fda.gov/industry/fda-import-process/import-refusals','Hồ sơ từ chối trong lịch sử; không tính xác suất'],
      ['FDA Importing Human Foods','https://www.fda.gov/industry/importing-fda-regulated-products/importing-human-foods','Yêu cầu liên quan nhập khẩu thực phẩm Hoa Kỳ'],
      ['FDA FSVP Importers','https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-foreign-supplier-verification-programs-fsvp-importers-food-humans-and-animals','Nghĩa vụ importer, có ngoại lệ theo nhóm hàng'],
      ['EC RASFF','https://food.ec.europa.eu/food-safety/rasff_en','Cảnh báo EU; chưa nhập trực tiếp vào ứng dụng'],
      ['EU Pesticides Database','https://food.ec.europa.eu/plants/pesticides/eu-pesticides-database_en','Tra cứu MRL EU; cần kiểm tra văn bản có hiệu lực'],
      ['Maersk US Imports','https://www.maersk.com/local-information/north-america/united-states-of-america/import','Nguồn phí tham khảo, phụ thuộc cảng và hợp đồng']
    ];
    function renderExtra(tab){
      const container=$('tab-placeholder');container.replaceChildren();
      const wrap=h('div',{class:'extra-grid'});
      if(tab==='services'){
        const plans = [
          ['Mua theo lượt', PR.format(PR.active.single) + '/báo cáo', '01 sản phẩm × 01 thị trường, bốn nhóm kiểm tra trong cùng báo cáo.', 'single'],
          ['SME theo tháng', PR.format(PR.active.sme) + '/tháng', 'Tối đa 03 báo cáo / tháng, lịch sử và hỗ trợ cơ bản.', 'sme']
        ];
        plans.forEach(([name, cost, description, plan]) => {
          const choosePlan = () => {
            document.querySelector('input[name="billingPlan"][value="' + plan + '"]').checked = true;
            updateBilling();
            saveDraft();
            openTab('check-new');
          };
          wrap.append(h('div', { class: 'extra-card' + (plan === 'sme' ? ' emphasis' : '') },
            h('h2', { class: 'extra-tag' }, name), h('div', { class: 'extra-price' }, cost),
            h('p', {}, description), h('button', { type: 'button', onclick: choosePlan }, 'Chọn để tạo báo cáo')));
        });
        container.append(wrap,h('p',{class:'extra-note'},'Đây là giá dự kiến giai đoạn đầu, chưa thanh toán/hóa đơn thật. Lộ trình giảm giá có điều kiện: theo lượt 169.000đ → 149.000đ; SME 449.000đ → 399.000đ/tháng; chưa áp dụng. Việc kiểm nghiệm hoặc chuyên gia ký duyệt tính riêng.'));
      }else if(tab==='smart-checklist'){
        const rs=myReports(),last=rs[rs.length-1];
        if(!last){container.append(h('div',{class:'extra-card'},h('h3',{},'Chưa có checklist'),h('p',{},'Hãy chạy sàng lọc một sản phẩm trước để có các mục cần kiểm tra.')));return}
        container.append(h('div',{class:'extra-card'},h('h3',{},'Checklist · '+last.input.name),h('p',{},'Tiến độ '+prog(last)+'%. Việc đánh dấu hoàn thành chỉ xác nhận thao tác của người dùng, chưa có QA duyệt.'),h('button',{onclick:()=>{cur=last;showActions()}},'Mở checklist tương tác')));
      }else if(tab==='compliance'){
        const steps=[['1. Chốt phạm vi','SKU, dạng hàng, cơ sở, thị trường, thời điểm'],['2. Đối chiếu nguồn','FDA Refusals là lịch sử; FDA/EU luật và giới hạn phải tra nguồn hiện hành'],['3. Chuẩn bị bằng chứng','COA, nhãn, quy trình và hồ sơ nhà nhập khẩu'],['4. QA xác minh','Chuyên gia duyệt tiêu chí áp dụng, bằng chứng và kết luận từng mục'],['5. Theo dõi thay đổi','Ghi ngày hiệu lực, lịch rà soát và người chịu trách nhiệm']];
        steps.forEach(([a,b])=>wrap.append(h('div',{class:'extra-card'},h('h3',{},a),h('p',{},b))));container.append(wrap,h('p',{class:'extra-note'},'Bản demo hiển thị quy trình thủ công: CHƯA có cập nhật tự động theo luật hoặc gửi cảnh báo live.'));
      }else if(tab==='cost'){
        container.append(makeCostCalculator(),h('p',{class:'demo-cap'},'Công cụ này có thể sử dụng độc lập. Nếu muốn lưu hồ sơ sản phẩm, hãy tạo một báo cáo sàng lọc ở mục Kiểm tra mới.'));
      }else if(tab==='regulations'){
        sourceLinks.forEach(([name,url,note])=>wrap.append(h('div',{class:'extra-card'},h('h3',{},name),h('p',{},note),h('a',{href:url,target:'_blank',rel:'noopener noreferrer',class:'extra-link'},'Mở nguồn chính thức'))));container.append(wrap,h('p',{class:'extra-note'},'Các liên kết là nguồn tra cứu; chưa có bộ đồng bộ luật trực tiếp, PRECHECK không bảo đảm tình trạng pháp luật tại thời điểm bạn truy cập.'));
      }else if(tab==='support'){
        const topics=[['Chỉ số được tính thế nào?','Chỉ số cộng điểm tín hiệu lịch sử (tối đa 70) và điểm hồ sơ thiếu (tối đa 30). Xem Cách tính chỉ số trong báo cáo để đọc từng phần và các ngưỡng ưu tiên.'],['Dữ liệu nào đã tích hợp?','Bộ dữ liệu FDA Import Refusals chuẩn hóa chứa sẵn trong data.js. EU/RASFF và Import Alerts vẫn đang phát triển.'],['PRECHECK có xác minh COA?','Chưa. App chỉ đọc TÊN file người dùng tải, không đọc nội dung, chưa phân tích kết quả và giới hạn phòng lab.'],['Đã thu tiền chưa?','Chưa. Giá lẻ/tháng là mức đề xuất để kiểm chứng; không có cổng thanh toán, hóa đơn hoặc gia hạn tự động.'],['Có xác nhận lô đủ tiêu chuẩn nhập khẩu?','Không. Phải kiểm nghiệm, rà soát quy định theo SKU/đích và chuyên gia kiểm tra.']];const faq = h('section', { class: 'pane-card dash-help' }, h('h2', {}, 'Các câu hỏi thường gặp'),
          topics.map(([title, answer]) => h('details', { class: 'dash-disclosure' }, h('summary', {}, title), h('p', {}, answer))));
        container.append(faq);
      }
    }
    if ($('dashLoginBtn')) $('dashLoginBtn').addEventListener('click', () => {
        const next = location.hash.slice(1);
        window.location.href = ['check-new', 'my-reports'].includes(next) ? 'login.html?next=' + next : 'login.html';
    });

    route(false);
});

// Dòng miễn trừ trách nhiệm chỉ hiện khi in / lưu PDF.
window.ensurePrintDisclaimer = function () {
    if (document.getElementById('print-disclaimer')) return;
    const wrap = document.createElement('div'); wrap.id = 'print-disclaimer'; wrap.className = 'print-only';
    wrap.textContent = 'Báo cáo sàng lọc sơ bộ từ PRECHECK, không phải chứng thư kiểm định hay kết quả kiểm nghiệm và không có giá trị thay thế quyết định thông quan. Căn cứ dữ liệu công khai FDA/EU tại thời điểm xuất báo cáo.';
    document.body.append(wrap);
};
