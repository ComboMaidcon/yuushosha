document.addEventListener('DOMContentLoaded', () => {
    const $ = id => document.getElementById(id), E = window.PCE, PR = window.PC_PRICING;
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
    const sameMonth = d => (d || '').slice(0,7) === new Date().toISOString().slice(0,7);
    const monthSMECount = () => myReports().filter(r => r.billingPlan === 'sme' && sameMonth(r.createdAt)).length;
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
    function setTitle(t, s) { const a=[h('h1',{},t)]; if(s) a.push(h('p',{},s)); $('dashTitleGroup').replaceChildren(...a); }
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
        else { renderExtra(tab); show('placeholder', name, 'Thông tin và chức năng của bản demo', tab); }
    }));

    // ---- Tổng quan (số liệu thật từ các báo cáo đã lưu) ----
    function renderOverview() {
        const rs = myReports();
        $('ovReports').textContent = rs.length;
        $('ovReportsSub').textContent = rs.length || user ? 'Báo cáo demo đã tạo · chưa thanh toán' : 'Báo cáo demo đã tạo · đăng nhập để xem';
        const avg = rs.length ? Math.round(rs.reduce((a, r) => a + r.score.total, 0) / rs.length) : null;
        $('ovScore').textContent = avg === null ? '—' : avg + '/100';
        $('ovScoreSub').textContent = avg === null ? 'Chỉ số ưu tiên rà soát · chưa có báo cáo' : 'Chỉ số ưu tiên rà soát nội bộ · không phải xác suất';
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
            $('chartCap').textContent = 'Chỉ số rà soát của ' + pts.length + ' báo cáo gần nhất · không kết luận chất lượng';
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
    const planRadios = [...document.querySelectorAll('input[name="billingPlan"]')];
    const CHECK_ALL = ['Nhãn sản phẩm','COA','Giấy phép','Nhà máy'];
    let uploaded = [], selGroup = null, cur = null;

    dz.setAttribute('role','button');dz.setAttribute('tabindex','0');
    dz.setAttribute('aria-label','Tải hồ sơ tùy chọn; không được tự động kiểm chứng nội dung');
    const ready = () => !!(f.name.value.trim() && f.market.value.trim() && f.factory.value.trim());
    function unlock(){
      const ok=ready();
      $('selectionStatusNote').textContent=ok?'✓ Đã có thông tin cơ bản. Tất cả 4 nhóm rà soát được bao gồm.':'Nhập sản phẩm, thị trường và cơ sở để chạy báo cáo; hồ sơ có thể tải bổ sung.';
      $('selectionStatusNote').classList.toggle('unlocked',ok);
    }
    function groupSuggest(){
        const box=$('fdaSuggest'),res=E.search(f.name.value,4);box.replaceChildren();
        if(!f.name.value.trim()){selGroup=null;return;}
        if(!res.length){selGroup=null;box.append(h('span',{},'Chưa khớp nhóm FDA (không có nghĩa là an toàn). Bạn vẫn có thể tạo báo cáo sơ bộ.'));return;}
        if(!selGroup||!res.some(p=>p[0]===selGroup))selGroup=res[0][0];
        box.append(h('span',{},'Nhóm sản phẩm FDA được gợi ý:'));
        res.forEach(p=>box.append(h('button',{type:'button',class:'fda-chip'+(p[0]===selGroup?' on':''),onclick:()=>{selGroup=p[0];groupSuggest();}}, E.displayName(p)+' (VN '+p[5]+')')));
    }
    Object.values(f).forEach(el=>{el.addEventListener('input',unlock);el.addEventListener('change',unlock);});
    f.name.addEventListener('input',groupSuggest);
    dz.addEventListener('click',e=>{if(!e.target.classList.contains('remove-file-btn'))fileInput.click();});
    dz.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target===dz){e.preventDefault();fileInput.click();}});
    dz.addEventListener('dragover',e=>{e.preventDefault();dz.classList.add('dragover');});
    dz.addEventListener('dragleave',()=>dz.classList.remove('dragover'));
    dz.addEventListener('drop',e=>{e.preventDefault();dz.classList.remove('dragover');if(e.dataTransfer?.files?.length)addFiles(e.dataTransfer.files);});
    fileInput.addEventListener('change',()=>{if(fileInput.files.length)addFiles(fileInput.files);fileInput.value='';});
    function addFiles(fs){for(const x of fs){if(uploaded.length>=8)break;if(x.size>12*1024*1024){openModal('Tệp quá lớn','Mỗi tệp demo tối đa 12 MB; thông tin tệp không được đưa lên máy chủ.');continue;}uploaded.push(x.name)}renderFiles();unlock();}
    function renderFiles(){
      dz.querySelector('.dz-hint').textContent=uploaded.length?'+ Thêm tệp (tối đa 8)':'Kéo thả hoặc chọn tệp (không bắt buộc)';
      list.replaceChildren(...uploaded.map((n,i)=>h('li',{class:'uploaded-file-item'},h('span',{style:'overflow:hidden;text-overflow:ellipsis;white-space:nowrap'},'📄 '+n),h('span',{class:'remove-file-btn',role:'button',tabindex:'0','aria-label':'Xóa tệp '+n,title:'Xóa tệp',onclick:e=>{e.stopPropagation();uploaded.splice(i,1);renderFiles();},onkeydown:e=>{if(e.key==='Enter'){e.stopPropagation();uploaded.splice(i,1);renderFiles();}}},'✕'))));
    }
    function billingSelected(){return document.querySelector('input[name="billingPlan"]:checked')?.value||'single'}
    function updateBilling(){
      const plan=billingSelected(),sme=plan==='sme';
      document.querySelectorAll('.billing-choice').forEach(c=>c.classList.toggle('selected',c.dataset.plan===plan));
      $('planDescription').textContent=sme?'Thuê bao SME (tháng)':'Mua theo báo cáo (lượt)';
      $('totalPaymentAmount').textContent=PR.format(sme?PR.active.sme:PR.active.single);
      $('quotaStatus').textContent=sme?(user?Math.max(0,PR.active.quota-monthSMECount())+' / '+PR.active.quota+' lượt còn lại (tháng này)':'3 lượt / tháng · cần đăng nhập'):'Mỗi lượt tính theo một báo cáo';
    }
    planRadios.forEach(x=>x.addEventListener('change',updateBilling));
    unlock();updateBilling();
    $('btnAnalyzeRisk').addEventListener('click',()=>{
      if(!ready())return openModal('Thiếu đầu vào tối thiểu','Vui lòng điền tên sản phẩm, thị trường và nhà máy/cơ sở; mã HS, thành phần, tệp hồ sơ có thể bổ sung sau.');
      if(!user)return openModal('Đăng nhập demo',h('div',{},h('p',{},'Để lưu báo cáo trong trình duyệt, hãy đăng nhập bằng tài khoản demo@precheck.vn / 123456. Không dùng dữ liệu doanh nghiệp thật.'),h('a',{href:'login.html',class:'extra-link'},'Vào trang đăng nhập')));
      const plan=billingSelected();
      if(plan==='sme'&&monthSMECount()>=PR.active.quota)return openModal('Đã sử dụng hết quota SME (mô phỏng)','Đã có 3 báo cáo SME trong tháng này trên trình duyệt. Bạn có thể chọn mua theo lượt để thử tiếp; bản demo không thu tiền.');
      const res=E.search(f.name.value,1),grp=selGroup||(res[0]?res[0][0]:null)||(E.search(f.ing.value,1)[0]||[null])[0];
      const gName=grp?E.displayName(E.search(f.name.value,6).concat(E.search(f.ing.value,6)).find(p=>p[0]===grp)||[grp,grp]):'Không gắn nhóm FDA';
      const fee=plan==='sme'?PR.active.sme:PR.active.single;
      openModal('Xác nhận báo cáo thử nghiệm',h('div',{style:'font-size:14px;line-height:1.7;color:#1b2e23'},
        h('p',{},h('strong',{},'Sản phẩm: '),f.name.value),h('p',{},h('strong',{},'Thị trường: '),f.market.value),
        h('p',{},h('strong',{},'Nhóm FDA: '),gName),h('p',{},h('strong',{},'Tệp mang tên: '),uploaded.length+' (chưa đọc nội dung, chưa xác minh)'),
        h('p',{},h('strong',{},'Phạm vi: '),'Nhãn · COA · thủ tục · nhà máy (tự động xem xét cả 4 nhóm)'),
        h('div',{style:'background:#f3f6f0;padding:12px 16px;border-radius:10px;margin:14px 0'},'Giá niêm yết '+(plan==='sme'?'gói tháng':'mỗi báo cáo')+': '+PR.format(fee)+' · chỉ mô phỏng, KHÔNG thu tiền.'),
        h('p',{class:'demo-cap'},'Hệ thống chỉ sàng lọc dựa trên mã FDA lịch sử và tên tệp; không phê duyệt chất lượng hay thông quan.'),
        h('button',{id:'confirmRunBtn',style:'width:100%;background:#0b4628;color:white;border:0;padding:12px;border-radius:999px;font-weight:700;cursor:pointer',onclick:()=>run(CHECK_ALL,grp,plan,fee)},'Tạo báo cáo demo')));
    });
    function run(checks,grp,plan,fee){
      const r=E.analyze({name:f.name.value.trim(),ingredients:f.ing.value.trim(),hs:f.hs.value.trim(),market:f.market.value,factory:f.factory.value.trim(),files:uploaded.slice(),checks,group:grp});
      r.owner=user.email;r.createdAt=new Date().toISOString();r.fee=fee;r.billingPlan=plan;
      r.id='PC-'+new Date().getFullYear()+'-'+Date.now().toString(36).toUpperCase().slice(-7);
      saveReport(r);cur=r;closeModal();updateBilling();renderOverview();showMatching(false);
    }

    // ---- Màn 2: Data Matching ----
    function showMatching(instant) {
        const p = $('tab-matching'), bar = h('i'), lab = h('b', {}, 'Đang đối chiếu 0%'), nextBtn = h('button', { class: 'btn-solid', onclick: () => showReport() }, 'Tiếp tục: Báo cáo rủi ro');
        const rows = E.matchRows(cur);
        p.replaceChildren(stepper(2), lab, h('div', { class: 'prog-bar' }, bar),
            h('div', {}, h('span', { class: 'src-chip' }, 'FDA Import Refusals'), ...['FDA Import Alerts', 'Warning Letters', 'Inspection Classification', 'RASFF Window (EU)', 'EUR-Lex', 'Access2Markets'].map(s => h('span', { class: 'src-chip off', title: 'Chưa tích hợp trong bản demo' }, s + ' · chưa tích hợp'))),
            h('div', { class: 'pane-card' }, h('table', { class: 'dt' }, h('tr', {}, ['MÃ', 'NGUỒN', 'TẦN SUẤT', 'TRÍCH NGUỒN', 'KỲ DỮ LIỆU', 'TRẠNG THÁI'].map(t => h('th', {}, t))),
                ...rows.map(r => h('tr', {}, h('td', {}, h('b', {}, r.code)), h('td', {}, r.src), h('td', {}, r.freq), h('td', { class: 'mut' }, r.ex), h('td', { class: 'mut' }, r.per), h('td', {}, h('span', { class: 'st-tag' + (r.ok ? '' : ' warn') }, r.st)))))),
            cur.group ? null : h('div', { class: 'pane-card' }, 'Chưa ghép được mã nhóm FDA, nên KHÔNG THỂ ĐÁNH GIÁ LÔ HÀNG NÀY. Không tìm được hồ sơ lịch sử không có nghĩa sản phẩm an toàn.'),
            h('p', { class: 'demo-cap' }, 'Nguồn đối chiếu: tập dữ liệu FDA Import Refusals đã được nhóm chuẩn hóa, kỳ ' + E.meta.period + '. Các số đếm là dòng trong tập đã xử lý, chưa đối soát hồ sơ gốc cho từng trường hợp; không phải xác suất từ chối hoặc phép kiểm định chất lượng.'), nextBtn);
        show('matching', 'Đối chiếu dữ liệu', cur.id, 'check-new');
        nextBtn.disabled = !instant; let v = instant ? 100 : 0;
        const draw = () => { bar.style.width = v + '%'; lab.textContent = v >= 100 ? 'Đã đối chiếu 100%' : 'Đang đối chiếu ' + v + '%'; };
        draw();
        if (!instant) { const t = setInterval(() => { v = Math.min(100, v + 10); draw(); if (v >= 100) { clearInterval(t); nextBtn.disabled = false; } }, 90); }
    }

    // ---- Màn 3: Báo cáo rủi ro ----
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
      p.replaceChildren(stepper(3),h('div',{class:'rp-grid'},
        h('div',{},h('div',{class:'pane-card'},h('h3',{},'Chỉ số ƯU TIÊN RÀ SOÁT'),
          h('div',{class:'rp-score '+lvlCls(s.level)},label),h('b',{},'Tín hiệu lịch sử: '+s.level),
          h('p',{class:'demo-cap',style:'margin-top:8px'},'Chỉ số thử nghiệm = tần suất mã từ chối trong nhóm + tình trạng thiếu tên tài liệu. KHÔNG phải tỷ lệ hàng bị từ chối, độ an toàn hay chứng nhận.'),
          h('p',{class:'extra-note'},'Kết luận chất lượng lô hiện tại: CHƯA ĐỦ CĂN CỨ. Muốn đánh giá đạt/không đạt từng chỉ tiêu phải có kết quả kiểm nghiệm, tiêu chí pháp lý đúng sản phẩm/thị trường, xác minh chứng từ và chuyên gia kiểm tra.')),
          h('div',{class:'pane-card'},h('h3',{},'Vấn đề cần ưu tiên đối chiếu (KHÔNG phải lỗi đã xác nhận)'),
            cur.causes.length?h('ol',{class:'rp-list'},cur.causes.map(c=>h('li',{},c))):h('p',{},'Chưa có tín hiệu lịch sử đủ để gợi ý nguyên nhân; không đồng nghĩa an toàn.'))),
        h('div',{},makeCostCalculator(),h('div',{class:'pane-card'},
          h('h3',{},'Gói dịch vụ trong bản demo'),
          h('p',{},cur.billingPlan==='sme'?'SME – tối đa 3 báo cáo/tháng':'Mua theo báo cáo lẻ'),
          h('p',{class:'demo-cap'},'Giá NIÊM YẾT tham khảo '+PR.format(cur.fee||PR.active.single)+'; không phát sinh thu tiền, không tạo giao dịch/hóa đơn.'),
          h('div',{class:'rp-acts'},h('button',{class:'btn-solid',onclick:()=>window.print()},'In / Lưu PDF'),h('button',{class:'btn-ghost',onclick:copySummary},'Sao chép tóm tắt'))))),
        h('div',{class:'rp-acts'},h('button',{class:'btn-yel',onclick:()=>showActions()},'Xem checklist hành động'),h('button',{class:'btn-ghost',onclick:()=>showMatching(true)},'Quay lại đối chiếu')));
      show('report','BÁO CÁO SÀNG LỌC',cur.id,'check-new');
    }
    function copySummary() {
        const t = cur.id + ' · ' + cur.input.name + ' · ' + cur.input.market + '\nƯu tiên rà soát: ' + cur.score.level + (cur.score.level === 'CHƯA ĐỦ DỮ LIỆU' ? '' : ' (' + cur.score.total + '/100)') + '\nNguyên nhân chính:\n' + cur.causes.map((c, i) => (i + 1) + '. ' + c).join('\n') + '\n(Chỉ số ưu tiên rà soát, không phải kết luận chất lượng hay xác suất từ chối)';
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
        p.replaceChildren(h('div', { class: 'pane-card' }, !user ? h('p', {}, 'Hãy đăng nhập để xem các báo cáo đã lưu.') : rs.length ? h('table', { class: 'dt' }, h('tr', {}, ['MÃ HỒ SƠ', 'SẢN PHẨM', 'THỊ TRƯỜNG', 'NGÀY TẠO', 'CHỈ SỐ RÀ SOÁT', 'ƯU TIÊN', 'TIẾN ĐỘ', ''].map(t => h('th', {}, t))),
            ...rs.map(r => h('tr', {}, h('td', {}, r.id), h('td', {}, r.input.name), h('td', {}, r.input.market), h('td', {}, new Date(r.createdAt).toLocaleDateString('vi-VN')), h('td', {}, r.score.level === 'CHƯA ĐỦ DỮ LIỆU' ? '—' : String(r.score.total)), h('td', {}, h('span', { class: 'badge-mini ' + badgeCls(r.score.level) }, r.score.level)), h('td', {}, prog(r) + '%'), h('td', {}, h('button', { class: 'btn-ghost', onclick: () => { cur = r; showReport(); } }, 'Xem'))))) : h('p', {}, 'Chưa có báo cáo nào. Hãy bắt đầu ở mục Kiểm tra mới.')));
    }

    // ---- Risk Alert có bộ lọc thời gian; hiện chỉ là TÌNH HUỐNG minh họa ----
    const fm=$('filterMarket'),fc=$('filterCategory'),fs=$('filterSeverity'),ft=$('filterTime'),cards=[...document.querySelectorAll('.alert-card')];
    function applyFilters(){let count=0;cards.forEach(c=>{const ok=(fm.value==='all'||c.dataset.market===fm.value)&&(fc.value==='all'||c.dataset.category===fc.value)&&(fs.value==='all'||c.dataset.severity===fs.value)&&(ft.value!=='recent')&&(ft.value==='all'||ft.value==='2025-06');c.style.display=ok?'flex':'none';if(ok)count++});$('alertEmpty').style.display=count?'none':'block'}
    [fm,fc,fs,ft].forEach(x=>x.addEventListener('change',applyFilters));
    cards.forEach(c => { c.addEventListener('click', () => { openModal(c.querySelector('h3').textContent, h('div', {}, h('p', {}, c.querySelector('.alert-reason').textContent), h('p', {class:'demo-cap'}, 'Tình huống minh họa (06/2025), không phải bản tin hiện hành. Đối chiếu tại nguồn FDA / EC trước quyết định xuất khẩu.'))); }); });
    $('notifyBtn').addEventListener('click',()=>openModal('Email / Zalo','Bản demo chưa tự gửi thông báo. Không nhập số điện thoại/email thật để thử tính năng này.'));

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
        const plans=[['Miễn phí','0đ','Xem tình huống mẫu, không nhận đánh giá chuyên sâu.','free'],['Mua theo lượt',PR.format(PR.active.single)+'/báo cáo','01 sản phẩm × 01 thị trường, bốn nhóm kiểm tra trong cùng báo cáo.','single'],['SME theo tháng',PR.format(PR.active.sme)+'/tháng','Tối đa 03 báo cáo / tháng, lịch sử và hỗ trợ cơ bản.','sme']];
        plans.forEach(([name,cost,desc,key])=>wrap.append(h('div',{class:'extra-card'+(key==='sme'?' emphasis':'')},h('div',{class:'extra-tag'},name.toUpperCase()),h('div',{class:'extra-price'},cost),h('p',{},desc),h('button',{onclick:()=>{if(key==='free'){navItems[1].click();return}document.querySelector('input[name="billingPlan"][value="'+key+'"]').checked=true;updateBilling();navItems[1].click();}},key==='free'?'Thử bản miễn phí':'Chọn để tạo báo cáo'))));
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
        const topics=[['Dữ liệu nào đã tích hợp?','Bộ dữ liệu FDA Import Refusals chuẩn hóa chứa sẵn trong data.js. EU/RASFF và Import Alerts vẫn đang phát triển.'],['PRECHECK có xác minh COA?','Chưa. App chỉ đọc TÊN file người dùng tải, không đọc nội dung, chưa phân tích kết quả và giới hạn phòng lab.'],['Đã thu tiền chưa?','Chưa. Giá lẻ/tháng là mức đề xuất để kiểm chứng; không có cổng thanh toán, hóa đơn hoặc gia hạn tự động.'],['Có xác nhận lô đủ tiêu chuẩn nhập khẩu?','Không. Phải kiểm nghiệm, rà soát quy định theo SKU/đích và chuyên gia kiểm tra.']];topics.forEach(([a,b])=>wrap.append(h('div',{class:'extra-card'},h('h3',{},a),h('p',{},b))));container.append(wrap);
      }
    }
    if ($('dashLoginBtn')) $('dashLoginBtn').addEventListener('click', () => { window.location.href = 'login.html'; });

    renderOverview();
    setTitle('Dashboard Tổng quan', user ? user.companyName : 'Chưa đăng nhập · số liệu minh họa');
    const initial=(window.location.hash||'').slice(1);if(initial==='services'||initial==='check-new'){const item=document.querySelector('.nav-item[data-tab="'+initial+'"]');if(item)item.click();}
});
