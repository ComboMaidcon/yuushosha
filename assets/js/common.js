// Đóng mọi hộp thoại khi nhấn Esc
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('.modal').forEach(m => { m.style.display = 'none'; });
});
