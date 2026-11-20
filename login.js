document.addEventListener('DOMContentLoaded', () => {
    const $ = id => document.getElementById(id);
    const tabRegister = $('tabRegister'), tabLogin = $('tabLogin'), registerFields = $('registerFields'), loginFields = $('loginFields');
    const termsWrap = $('termsWrap'), forgotWrap = $('forgotWrap'), submitBtn = $('submitBtn');
    const authMainTitle = $('authMainTitle'), authSubTitle = $('authSubTitle'), authMessage = $('authMessage'), authForm = $('authForm');
    let currentMode = 'register';
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
    const showMessage = (text, type) => { authMessage.textContent = text; authMessage.className = 'auth-message ' + type; authMessage.style.display = 'block'; };
    const hideMessage = () => { authMessage.style.display = 'none'; };
    const go = (ms) => setTimeout(() => { window.location.href = 'dashboard.html'; }, ms);

    tabRegister.addEventListener('click', () => {
        currentMode = 'register';
        tabRegister.classList.add('active'); tabLogin.classList.remove('active');
        registerFields.style.display = 'grid'; loginFields.style.display = 'none';
        termsWrap.style.display = 'flex'; forgotWrap.style.display = 'none';
        submitBtn.textContent = 'Bắt đầu kiểm tra';
        authMainTitle.textContent = 'Bắt đầu với PRECHECK';
        authSubTitle.textContent = 'Thiết lập hồ sơ doanh nghiệp trong vài phút';
        hideMessage();
    });
    tabLogin.addEventListener('click', () => {
        currentMode = 'login';
        tabLogin.classList.add('active'); tabRegister.classList.remove('active');
        registerFields.style.display = 'none'; loginFields.style.display = 'flex';
        termsWrap.style.display = 'none'; forgotWrap.style.display = 'block';
        submitBtn.textContent = 'Đăng nhập';
        authMainTitle.textContent = 'Chào mừng trở lại';
        authSubTitle.textContent = 'Đăng nhập vào hệ thống tiền kiểm rủi ro PRECHECK';
        hideMessage();
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessage();
        try {
            const users = await getUsers();
            if (currentMode === 'register') {
                const companyName = $('regCompanyName').value.trim(), taxCode = $('regTaxCode').value.trim();
                const email = $('regEmail').value.trim().toLowerCase(), password = $('regPassword').value;
                const smeType = $('regSmeType').value, industry = $('regIndustry').value;
                if (!companyName || !taxCode || !email || !password || !smeType || !industry) return showMessage('Vui lòng điền đầy đủ tất cả thông tin doanh nghiệp!', 'error');
                if (password.length < 6) return showMessage('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
                if (!$('termsCheck').checked) return showMessage('Bạn cần đồng ý với điều khoản dịch vụ để tiếp tục.', 'error');
                if (users.find(u => u.email === email || u.taxCode === taxCode)) return showMessage('Email hoặc Mã số thuế này đã được đăng ký! Vui lòng chuyển sang tab Đăng nhập.', 'error');
                const newUser = { companyName, taxCode, email, passwordHash: await hashPw(email, password), smeType, industry };
                users.push(newUser);
                localStorage.setItem(USERS_KEY, JSON.stringify(users));
                localStorage.setItem(SESSION_KEY, JSON.stringify(publicUser(newUser)));
                showMessage('Đăng ký thành công! Đang chuyển hướng vào Dashboard...', 'success');
                go(900);
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
                showMessage('Xin chào ' + u.companyName + '! Đang vào Dashboard...', 'success');
                go(800);
            }
        } catch (err) {
            showMessage(err.message === 'nocrypto' ? 'Trình duyệt cần chạy trang qua https hoặc localhost để đăng nhập.' : 'Có lỗi xảy ra, vui lòng thử lại.', 'error');
        }
    });

    $('googleBtn').addEventListener('click', () => {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ companyName: 'Doanh nghiệp Xuất khẩu Việt (Google, demo)', taxCode: '0309998887', email: 'google-user@precheck.vn', smeType: 'Nhỏ (10 - 50 nhân sự)', industry: 'Nông sản & Trái cây sấy' }));
        showMessage('Đăng nhập demo, không xác thực thật. Đang chuyển hướng...', 'success');
        go(800);
    });
    $('forgotPasswordLink').addEventListener('click', (e) => {
        e.preventDefault();
        showMessage('Bản demo chưa có khôi phục mật khẩu. Hãy dùng tài khoản dùng thử demo@precheck.vn / 123456 hoặc đăng ký tài khoản mới.', 'success');
    });
});
