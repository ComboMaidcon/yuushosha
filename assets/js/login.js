document.addEventListener('DOMContentLoaded', () => {
    const $ = id => document.getElementById(id);
    const tabRegister = $('tabRegister'), tabLogin = $('tabLogin'), registerFields = $('registerFields'), loginFields = $('loginFields');
    const termsWrap = $('termsWrap'), forgotWrap = $('forgotWrap'), submitBtn = $('submitBtn');
    const authMainTitle = $('authMainTitle'), authSubTitle = $('authSubTitle'), authMessage = $('authMessage'), authForm = $('authForm');
    const demoButton = $('googleBtn');
    const next = new URLSearchParams(location.search).get('next');
    const destination = ['check-new', 'my-reports'].includes(next) ? 'dashboard.html#' + next : 'dashboard.html';
    let currentMode = 'login';
    const USERS_KEY = 'precheck_users', SESSION_KEY = 'precheck_current_user';

    // Mật khẩu được băm SHA-256 (demo phía trình duyệt). Hệ thống thật phải băm ở máy chủ.
    const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    async function hashPw(email, pw) {
        if (!(window.crypto && crypto.subtle)) throw new Error('nocrypto');
        return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email.toLowerCase() + '|' + pw + '|precheck-demo')));
    }
    async function getUsers() {
        const raw = localStorage.getItem(USERS_KEY);
        if (!raw) {
            const users = [{ companyName: 'Công ty TNHH Thủy Sản Minh Phú Demo', taxCode: '0301234567', email: 'demo@precheck.vn',
                passwordHash: await hashPw('demo@precheck.vn', '123456'), smeType: 'Vừa (50 - 200 nhân sự)', industry: 'Thủy sản đông lạnh' }];
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            return users;
        }
        try { return JSON.parse(raw) || []; } catch (e) { return []; }
    }
    const publicUser = u => ({ companyName: u.companyName, taxCode: u.taxCode, email: u.email, smeType: u.smeType, industry: u.industry });
    const showMessage = (text, type) => { authMessage.textContent = text; authMessage.className = 'auth-message ' + type; authMessage.hidden = false; };
    const hideMessage = () => { authMessage.hidden = true; };
    const go = () => { window.location.replace(destination); };

    function showMode(mode) {
        currentMode = mode;
        const register = mode === 'register';
        tabRegister.classList.toggle('active', register);
        tabLogin.classList.toggle('active', !register);
        tabRegister.setAttribute('aria-pressed', String(register));
        tabLogin.setAttribute('aria-pressed', String(!register));
        registerFields.hidden = termsWrap.hidden = !register;
        loginFields.hidden = forgotWrap.hidden = register;
        registerFields.querySelectorAll('input, select').forEach(field => { field.disabled = !register; });
        loginFields.querySelectorAll('input').forEach(field => { field.disabled = register; });
        submitBtn.textContent = register ? 'Tạo tài khoản demo' : 'Đăng nhập';
        authMainTitle.textContent = register ? 'Đăng ký demo' : 'Đăng nhập';
        authSubTitle.textContent = register ? 'Nhập thông tin mẫu để thử luồng doanh nghiệp.' :
            next === 'check-new' ? 'Đăng nhập để tiếp tục tạo báo cáo.' : 'Mở báo cáo và checklist của bạn.';
        document.title = authMainTitle.textContent + ' | PRECHECK';
        hideMessage();
        syncConsent();
    }
    const TERMS_VERSION = 'MVP-2026', CONSENT_KEY = 'precheck_consent_log';
    // Đăng ký: phải tích ô đồng ý thì nút mới sáng. Đăng nhập không cần tích (đã đồng ý khi đăng ký).
    function syncConsent() { submitBtn.disabled = currentMode === 'register' && !$('termsCheck').checked; }
    async function recordConsent(userId, source) {
        const entry = { version: TERMS_VERSION, at: new Date().toISOString(), source };
        try { const log = JSON.parse(localStorage.getItem(CONSENT_KEY) || '[]'); log.push(entry); localStorage.setItem(CONSENT_KEY, JSON.stringify(log.slice(-50))); } catch (e) { /* bộ nhớ bị chặn */ }
        try { await fetch('/api/consent', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId, version: TERMS_VERSION, source }) }); } catch (e) { /* mất mạng: đã lưu tạm */ }
    }
    // Popup điều khoản
    const termsModal = $('termsModal');
    const closeTerms = () => { termsModal.hidden = true; $('termsCheck').focus(); };
    $('openTerms').addEventListener('click', e => { e.preventDefault(); termsModal.hidden = false; $('termsOk').focus(); });
    $('termsClose').addEventListener('click', closeTerms);
    $('termsOk').addEventListener('click', closeTerms);
    termsModal.addEventListener('click', e => { if (e.target === termsModal) closeTerms(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !termsModal.hidden) closeTerms(); });
    $('termsCheck').addEventListener('change', syncConsent);

    tabRegister.addEventListener('click', () => showMode('register'));
    tabLogin.addEventListener('click', () => showMode('login'));
    showMode(currentMode);

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (submitBtn.disabled) return;
        hideMessage();
        [submitBtn, demoButton, tabLogin, tabRegister].forEach(button => { button.disabled = true; });
        try {
            const users = await getUsers();
            if (currentMode === 'register') {
                const companyName = $('regCompanyName').value.trim(), taxCode = $('regTaxCode').value.trim();
                const email = $('regEmail').value.trim().toLowerCase(), password = $('regPassword').value;
                const smeType = $('regSmeType').value, industry = $('regIndustry').value;
                if (!companyName || !taxCode || !email || !password || !smeType || !industry) return showMessage('Vui lòng điền đầy đủ tất cả thông tin doanh nghiệp!', 'error');
                if (password.length < 6) return showMessage('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
                if (!$('termsCheck').checked) return showMessage('Bạn cần tích chọn đồng ý điều khoản để tiếp tục.', 'error');
                if (users.find(u => u.email === email || u.taxCode === taxCode)) return showMessage('Email hoặc Mã số thuế này đã được đăng ký! Vui lòng chuyển sang tab Đăng nhập.', 'error');
                const newUser = { companyName, taxCode, email, passwordHash: await hashPw(email, password), smeType, industry };
                users.push(newUser);
                localStorage.setItem(USERS_KEY, JSON.stringify(users));
                await recordConsent(newUser.email, 'register');
                localStorage.setItem(SESSION_KEY, JSON.stringify(publicUser(newUser)));
                go();
            } else {
                const id = $('loginIdentifier').value.trim().toLowerCase(), password = $('loginPassword').value;
                if (!id || !password) return showMessage('Vui lòng nhập Email/Mã số thuế và Mật khẩu!', 'error');
                const u = users.find(x => x.email.toLowerCase() === id || (x.taxCode || '').toLowerCase() === id);
                let ok = false;
                if (u) {
                    if (u.passwordHash) ok = u.passwordHash === await hashPw(u.email, password);
                    else if (u.password !== undefined && u.password === password) { // dữ liệu cũ lưu chữ thường: nâng cấp sang băm
                        u.passwordHash = await hashPw(u.email, password); delete u.password; ok = true;
                        localStorage.setItem(USERS_KEY, JSON.stringify(users));
                    }
                }
                if (!ok) return showMessage('Thông tin đăng nhập hoặc mật khẩu không chính xác!', 'error');
                localStorage.setItem(SESSION_KEY, JSON.stringify(publicUser(u)));
                go();
            }
        } catch (err) {
            showMessage(err.message === 'nocrypto' ? 'Trình duyệt cần chạy trang qua https hoặc localhost để đăng nhập.' : 'Có lỗi xảy ra, vui lòng thử lại.', 'error');
        } finally {
            [submitBtn, demoButton, tabLogin, tabRegister].forEach(button => { button.disabled = false; });
            syncConsent();
        }
    });

    demoButton.addEventListener('click', () => {
        try {
            localStorage.setItem(SESSION_KEY, JSON.stringify({ companyName: 'Doanh nghiệp Yuushousha (tài khoản demo)', taxCode: '0309998887', email: 'demo-offline@precheck.local', smeType: 'Nhỏ (10 - 50 nhân sự)', industry: 'Nông sản & Trái cây sấy' }));
            go();
        } catch {
            showMessage('Trình duyệt không lưu được phiên demo. Kiểm tra quyền lưu trữ và thử lại.', 'error');
        }
    });
    $('forgotPasswordLink').addEventListener('click', (e) => {
        e.preventDefault();
        showMessage('Bản demo chưa có khôi phục mật khẩu. Hãy dùng tài khoản dùng thử demo@precheck.vn / 123456 hoặc đăng ký tài khoản mới.', 'success');
    });
});
