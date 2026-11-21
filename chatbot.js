// Trợ lý PRECHECK (demo): trả lời theo dữ liệu FDA và thư viện mã lỗi có sẵn, không phải mô hình AI sinh văn bản.
(function () {
    const E = window.PCE, D = window.PC_DATA;
    if (!E || !D) return;
    const nz = E.norm, C = E.C;
    const SYN = [['di ung', '3300'], ['allergen', '3300'], ['nutrition', '482'], ['dinh duong', '482'], ['tieng anh', '324'], ['khoi luong tinh', '321'], ['thuoc bao ve', '241'], ['du luong thuoc', '241'],
        ['thuoc thu y', '2860'], ['nitrofuran', '3220'], ['histamine', '2360'], ['salmonella', '9'], ['listeria', '295'], ['fsvp', '3886'], ['tap chat', '249'], ['filthy', '249'], ['pham mau', '11'], ['phu gia', '238']];
    const STOP = new Set('va hay bi la gi cho cua co khong nao nhung cac toi minh can vi loi tu choi san pham hang xuat khau my hoa ky khi voi the nao thuong gap hoi ve cho'.split(' '));
    const TXT = {
        label: 'Rà soát nhãn theo bảng mã lỗi:\n• Thông tin bắt buộc có tiếng Anh, chữ nổi bật, đủ lớn\n• Khối lượng tịnh ghi đơn vị Mỹ (oz, lb, fl oz) và đơn vị mét\n• Bảng Nutrition Facts đúng chuẩn FDA, hoặc đã xác nhận được miễn trừ\n• Khai báo phẩm màu, chất bảo quản và chức năng\n• Khai báo đủ chất gây dị ứng chính\nMuốn biết chi tiết từng mục, hãy hỏi "giải thích mã 482" hoặc "mã 324".',
        allergen: 'Mỹ có 9 nhóm chất gây dị ứng chính: sữa, trứng, cá, giáp xác, hạt cây, đậu phộng, lúa mì, đậu nành và mè (mè bắt buộc từ 01/01/2023). Nhãn phải khai báo rõ, và cần đánh giá nguy cơ nhiễm chéo nếu dùng chung dây chuyền. EU có danh sách 14 nhóm riêng, nhưng bản demo chưa hỗ trợ EU.',
        facility: 'Cơ sở nước ngoài sản xuất, đóng gói hoặc lưu giữ thực phẩm xuất sang Mỹ cần đăng ký với FDA (FFR) và chỉ định đại diện tại Mỹ (US Agent). Đăng ký gia hạn hai năm một lần vào năm chẵn. Ngoài ra cần khai báo trước (Prior Notice) khi hàng đến cảng Mỹ. Hãy xác nhận thời hạn cụ thể với chuyên gia.',
        fsvp: 'FSVP là chương trình xác minh nhà cung cấp nước ngoài, nghĩa vụ chính thuộc nhà nhập khẩu Mỹ. Bạn nên chuẩn bị sẵn hồ sơ: kế hoạch an toàn thực phẩm, kết quả kiểm nghiệm, chứng nhận cơ sở. Thủy sản theo HACCP có quy định riêng, hãy xác nhận với nhà nhập khẩu.',
        fce: 'Với thực phẩm đóng kín, nếu pH > 4,6 và aw > 0,85 thì thường thuộc nhóm đồ hộp axit thấp, cần đăng ký cơ sở (FCE) và nộp quy trình xử lý nhiệt (SID) cho từng sản phẩm trước khi xuất. Hãy xác nhận với chuyên gia.',
        source: 'Dữ liệu là FDA Import Refusal Report (lô hàng thực phẩm bị FDA từ chối, ' + E.meta.period + ') cùng bảng mã lý do của FDA. Import Alerts, RASFF và EU chưa được tích hợp.',
        update: 'FDA công bố báo cáo từ chối nhập khẩu theo kỳ và cập nhật hàng tháng. Bản demo dùng bộ dữ liệu nhóm lưu đến ' + E.meta.updated + ' và chưa tự cập nhật.',
        eu: 'Chưa hỗ trợ. Bản demo chỉ có thị trường Hoa Kỳ (FDA). EU nằm trong kế hoạch phát triển.',
        price: 'Giá dự kiến: 199.000đ/báo cáo theo 1 sản phẩm × 1 thị trường, hoặc 499.000đ/tháng cho tối đa 3 báo cáo (166.333đ/báo cáo nếu dùng đủ). Một báo cáo bao gồm nhãn, COA, giấy phép và nhà máy nếu phù hợp, không cộng phí theo mục. Các giai đoạn giảm giá chưa áp dụng. Demo không thanh toán thật.',
        score: 'Điểm rà soát = tín hiệu lịch sử (tối đa 70) + mức thiếu hồ sơ (tối đa 30). Đây không phải xác suất bị từ chối, vì dữ liệu chỉ có các lô đã bị từ chối, không có các lô nhập thành công.',
        expert: 'Bản demo chưa kết nối chuyên gia. Hãy gửi báo cáo và các mục chưa đạt cho người phụ trách QA hoặc tư vấn pháp lý của bạn.',
        help: 'Mình có thể giúp:\n• Tra lỗi hay gặp của một sản phẩm (ví dụ "tôm", "hạt điều")\n• Giải thích mã lỗi FDA (ví dụ "mã 3300", "salmonella")\n• Rà soát nhãn, dị ứng, đăng ký cơ sở, FSVP, FCE/SID\n• Nguồn dữ liệu và cách tính điểm'
    };
    function explain(id) {
        const c = C(id);
        if (!c.t) return { text: 'Mã ' + c.c + ' chưa có diễn giải tiếng Việt trong thư viện.' };
        return { text: c.c + ': ' + c.t + '.\n' + c.e + '\n\nNên làm:\n' + c.a.slice(0, 3).map(a => '• ' + a).join('\n') + '\n\nCăn cứ: ' + c.l + '\n(Nội dung bản nháp, chưa được chuyên gia duyệt.)' };
    }
    function findCharge(q) {
        const n = nz(q), m = n.match(/\b\d{1,4}\b/g) || [];
        for (const x of m) if (D.C[x] && D.C[x].t) return x;
        for (const [k, id] of SYN) if (n.includes(k)) return id;
        for (const id in D.C) { const t = D.C[id].c.split('-')[0].toLowerCase().replace(/\s+/g, ''); if (t.length >= 5 && D.C[id].t && n.replace(/\s+/g, '').includes(t)) return id; }
        return null;
    }
    function findProduct(q) {
        const ws = q.replace(/[?!.,;:()"]/g, ' ').split(/\s+/).filter(w => w && !STOP.has(nz(w)));
        for (let k = 3; k >= 1; k--) for (let i = 0; i + k <= ws.length; i++) {
            const phrase = ws.slice(i, i + k).join(' ');
            if (nz(phrase).length < 3) continue;
            const r = E.search(phrase, 1); if (r.length) return r[0];
        }
        return null;
    }
    function productAnswer(p) {
        const vn = p[8].length > 0, top = (vn ? p[8] : p[7]).slice(0, 3);
        const lines = top.map(([id, pc], i) => (i + 1) + '. ' + (C(id).t || C(id).c) + ' (' + pc + '%)').join('\n');
        return { text: 'Nhóm sản phẩm FDA gần nhất: ' + E.displayName(p) + (p[6] === 'Bản nháp' ? '' : ' (tên cần xác nhận)') + '.\nTrong ' + E.meta.period + ': hàng Việt Nam ' + p[5] + ' dòng, toàn cầu ' + p[4] + ' dòng bị từ chối.\nLỗi thường gặp nhất ở ' + (vn ? 'hàng Việt Nam' : 'toàn cầu (hàng Việt Nam quá ít dữ liệu)') + ':\n' + lines + '\n\nTỷ lệ % là phần các dòng bị từ chối của nhóm này có mã lỗi đó, không phải xác suất bị từ chối. Không thấy lỗi nào cũng không có nghĩa là an toàn.', chips: top.map(([id]) => 'Giải thích mã ' + id) };
    }
    function answer(q) {
        const n = nz(q);
        const id = findCharge(q); if (id) return explain(id);
        if (/\b(xin chao|chao|hello|hi)\b/.test(n) || n.trim() === '') return { text: 'Xin chào! ' + TXT.help };
        if (/\bnhan\b|label|artwork/.test(n)) return { text: TXT.label };
        if (/di ung|allergen/.test(n)) return { text: TXT.allergen };
        if (/\bffr\b|us agent|dai dien|prior notice|dang ky co so|facility/.test(n)) return { text: TXT.facility };
        if (/\bph\b|\baw\b|\bfce\b|\bsid\b|do hop/.test(n)) return { text: TXT.fce };
        if (/\beu\b|chau au|rasff/.test(n)) return { text: TXT.eu };
        if (/nguon|du lieu nao|dung du lieu/.test(n)) return { text: TXT.source };
        if (/cap nhat|bao lau/.test(n)) return { text: TXT.update };
        if (/gia|bao nhieu|chi phi|thanh toan/.test(n)) return { text: TXT.price };
        if (/diem|score|xac suat|tinh diem/.test(n)) return { text: TXT.score };
        if (/chuyen gia|tu van|dat lich/.test(n)) return { text: TXT.expert };
        const p = findProduct(q); if (p) return productAnswer(p);
        return { text: 'Mình chưa hiểu câu hỏi này. ' + TXT.help };
    }

    // ---- Giao diện ----
    const el = (t, c, txt) => { const e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e; };
    const panel = el('div', 'pcc-panel'), msgs = el('div', 'pcc-msgs'), chips = el('div', 'pcc-chips'), form = el('form', 'pcc-form'), input = el('input');
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Trợ lý PRECHECK');
    input.placeholder = 'Nhập câu hỏi…'; input.setAttribute('aria-label', 'Nhập câu hỏi');
    const head = el('div', 'pcc-head'), close = el('button', 'pcc-x', '×');
    close.type = 'button'; close.setAttribute('aria-label', 'Đóng'); close.onclick = () => api.close();
    head.append(el('b', '', 'PRECHECK • Trợ lý quy tắc'), el('small', '', '● Demo offline'), close);
    const send = el('button', '', 'Gửi'); send.type = 'submit'; form.append(input, send);
    panel.append(head, msgs, chips, form, el('div', 'pcc-note', 'Trợ lýtrả lời theo dữ liệu FDA và thư viện mã lỗi có sẵn. PRECHECK là công cụ hỗ trợ ra quyết định, không thay thế kết luận pháp lý hoặc kết quả kiểm nghiệm.'));
    document.body.append(panel);
    function add(who, text) { const m = el('div', 'pcc-m ' + (who === 'me' ? 'pcc-me' : 'pcc-bot'), text); msgs.append(m); msgs.scrollTop = msgs.scrollHeight; }
    function setChips(list) { chips.replaceChildren(...list.map(t => { const b = el('button', 'pcc-chip', t); b.type = 'button'; b.onclick = () => ask(t); return b; })); }
    const DEFAULT = ['Báo cáo dùng nguồn nào?', 'Dữ liệu cập nhật bao lâu?', 'Có hỗ trợ hồ sơ EU?', 'Tôm hay bị lỗi gì?', 'Rà soát nhãn cần gì?', 'Giải thích mã 3300'];
    function ask(q) { q = q.trim(); if (!q) return; add('me', q); const r = answer(q); add('bot', r.text); setChips((r.chips || []).concat(DEFAULT).slice(0, 6)); }
    form.addEventListener('submit', e => { e.preventDefault(); ask(input.value); input.value = ''; });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') api.close(); });
    add('bot', 'Xin chào! Mình là trợ lý PRECHECK. ' + TXT.help); setChips(DEFAULT);
    const api = { open() { panel.classList.add('open'); input.focus(); }, close() { panel.classList.remove('open'); }, ask };
    window.PCChat = api;
    const existing = document.getElementById('chatBtn');
    if (!existing) { const f = el('button', 'pcc-fab', 'Hỏi PRECHECK'); f.type = 'button'; f.onclick = () => (panel.classList.contains('open') ? api.close() : api.open()); document.body.append(f); }
})();
