(() => {
    const accountLink = document.getElementById('navLoginLink');
    try {
        const account = JSON.parse(localStorage.getItem('precheck_current_user'));
        if (account && typeof account.companyName === 'string') {
            accountLink.textContent = account.companyName;
            accountLink.title = account.companyName;
            accountLink.href = 'dashboard.html';
        }
    } catch {
        // Keep the signed-out links when the browser cannot read session data.
    }

    const stepContent = document.getElementById('stepContentBox');
    const title = stepContent.querySelector('h3');
    const description = stepContent.querySelector('p');
    const buttons = [...document.querySelectorAll('[data-step]')];
    const steps = [
        [title.textContent, description.textContent],
        ['Tra tín hiệu từ dữ liệu FDA', 'Đối chiếu nhóm sản phẩm với dữ liệu thực phẩm từng bị FDA từ chối. Mở nguồn để kiểm tra kỳ dữ liệu và mã lý do.'],
        ['Xem điểm rà soát và kịch bản chi phí', 'Xem tín hiệu lịch sử, mức độ đầy đủ của hồ sơ và dự tính chi phí logistics theo từng kịch bản giả định.'],
        ['Xác định việc cần làm trước khi gửi hàng', 'Mở checklist để xem các hạng mục cần rà soát, căn cứ đi kèm và đánh dấu tiến độ.']
    ];
    buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
            buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
            [title.textContent, description.textContent] = steps[index];
        });
    });

})();
