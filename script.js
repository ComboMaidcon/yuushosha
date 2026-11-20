document.addEventListener('DOMContentLoaded', () => {

    // Đồng bộ trạng thái đăng nhập trên trang chủ
    const currentUserRaw = localStorage.getItem('precheck_current_user');
    const navLoginLink = document.getElementById('navLoginLink');
    const trialBtn = document.getElementById('trialBtn');
    if (currentUserRaw && navLoginLink) {
        const user = JSON.parse(currentUserRaw);
        navLoginLink.textContent = user.companyName;
        navLoginLink.href = 'dashboard.html';
        if (trialBtn) {
            trialBtn.textContent = 'Vào Dashboard';
            trialBtn.onclick = () => { window.location.href = 'dashboard.html'; };
        }
    }

    // Step items data
    const stepData = {
        1: {
            title: "Bước 1: Input (Nhập liệu hồ sơ sản phẩm)",
            desc: "Tải lên thành phần nguyên liệu, nhãn mác, quy trình chế biến và thông tin nhà cung cấp để hệ thống kiểm tra."
        },
        2: {
            title: "Bước 2: Data Matching (Đối chiếu dữ liệu & quy định)",
            desc: "Hệ thống đối chiếu sản phẩm với dữ liệu lô hàng bị FDA từ chối (Import Refusal, thực phẩm, 10/2021 đến 10/2026). RASFF và EU sẽ bổ sung sau."
        },
        3: {
            title: "Bước 3: Risk Score & Cost (Đánh giá Rủi ro & Chi phí)",
            desc: "Hệ thống tổng hợp tín hiệu lịch sử và độ đầy đủ hồ sơ thành điểm rà soát, kèm mô phỏng thiệt hại theo kịch bản giả định nếu lô bị giữ hoặc từ chối."
        },
        4: {
            title: "Bước 4: Corrective Action (Hành động Ngăn ngừa & Khắc phục)",
            desc: "Cung cấp danh sách các khuyến nghị chi tiết để chỉnh sửa công thức, nhãn mác hoặc hồ sơ trước khi xuất khẩu chính thức."
        }
    };

    const stepItems = document.querySelectorAll('.step-item');
    const stepContentBox = document.getElementById('stepContentBox');

    stepItems.forEach(item => {
        item.addEventListener('click', () => {
            stepItems.forEach(el => el.classList.remove('active'));
            item.classList.add('active');

            const stepNum = item.getAttribute('data-step');
            if (stepData[stepNum]) {
                stepContentBox.innerHTML = `
                    <h3>${stepData[stepNum].title}</h3>
                    <p>${stepData[stepNum].desc}</p>
                `;
            }
        });
    });

    // Pill tabs interaction
    const pillTabs = document.querySelectorAll('.pill-tab');
    pillTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            pillTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // Modal elements
    const modal = document.getElementById('appModal');
    const closeModal = document.getElementById('closeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    function openModal(title, content) {
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modal.style.display = 'flex';
    }

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Button triggers
    const info = (id, title, text) => document.getElementById(id).addEventListener('click', (e) => { e.preventDefault(); openModal(title, text); });
    info('trialBtn', 'Dùng thử PRECHECK', 'Hãy đăng ký tài khoản ở trang Đăng nhập, hoặc dùng tài khoản dùng thử demo@precheck.vn / 123456. Bản demo chạy trên trình duyệt của bạn, không thu phí thật.');
    info('demoBtn', 'Xem Demo', 'Video demo sẽ được bổ sung. Bạn có thể dùng thử trực tiếp bằng cách vào Dashboard, chọn Kiểm tra mới.');
    document.getElementById('chatBtn').addEventListener('click', (e) => { e.preventDefault(); if (window.PCChat) window.PCChat.open(); });
    info('faq1', 'FAQ: Dữ liệu nào được dùng?', 'Phiên bản hiện tại dùng FDA Import Refusal Report (lô hàng thực phẩm bị FDA từ chối, từ 10/2021 đến 23/10/2026) và bảng mã lý do của FDA. Các nguồn khác như Import Alerts, RASFF, EUR-Lex sẽ được bổ sung sau.');
    info('faq2', 'FAQ: Báo cáo có thay tư vấn pháp lý?', 'Không. PRECHECK là công cụ hỗ trợ rà soát và ra quyết định. Kết quả dựa trên dữ liệu lịch sử và thông tin doanh nghiệp nhập, chưa được xác minh độc lập, và không thay thế quyết định của FDA, kết quả kiểm nghiệm hay tư vấn pháp lý.');
    info('faq3', 'FAQ: Có hỗ trợ EU không?', 'Chưa. Phiên bản hiện tại chỉ hỗ trợ thị trường Hoa Kỳ (FDA). EU nằm trong kế hoạch phát triển.');
    info('consultBtn', 'Tư vấn', 'Tính năng đặt lịch tư vấn sẽ có ở phiên bản sau.');
});
