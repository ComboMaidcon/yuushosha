(() => {
    const news = document.getElementById('ban-tin');
    const grid = news.querySelector('.news-grid');
    const articles = [...grid.querySelectorAll('[data-notice-id]')];
    const filters = document.getElementById('newsFilters');
    const filterStatus = document.getElementById('newsFilterStatus');
    const bell = document.getElementById('notificationBell');
    const badge = document.getElementById('notificationBadge');
    const panel = document.getElementById('notificationPanel');
    const noticeList = document.getElementById('notificationList');
    const noticeStatus = document.getElementById('notificationStatus');
    const markAll = document.getElementById('markAllRead');
    const storageKey = 'precheck_trade_news_read';

    function storedReadIds() {
        try {
            const list = JSON.parse(localStorage.getItem(storageKey));
            return Array.isArray(list) ? list.filter(id => typeof id === 'string') : [];
        } catch {
            return [];
        }
    }
    let readIds = new Set(storedReadIds());

    function markRead(ids) {
        readIds = new Set([...readIds, ...storedReadIds(), ...ids]);
        try {
            localStorage.setItem(storageKey, JSON.stringify([...readIds]));
        } catch {
            // Notifications remain usable for this page visit.
        }
        refreshIndicators();
    }

    function createNotice(article) {
        const id = article.dataset.noticeId;
        const sourceLink = article.querySelector('.news-title');
        const source = article.querySelector('.news-source').textContent;
        const date = article.querySelector('time');

        const row = document.createElement('li');
        const link = document.createElement('a');
        link.className = 'notice-link';
        link.href = sourceLink.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        const headline = document.createElement('strong');
        headline.textContent = sourceLink.textContent.trim();
        const meta = document.createElement('small');
        meta.append(source, ' · ', date.cloneNode(true));
        const dot = document.createElement('span');
        dot.className = 'notice-dot';
        dot.setAttribute('aria-hidden', 'true');
        const unreadText = document.createElement('span');
        unreadText.className = 'sr-only';
        unreadText.textContent = 'Chưa đọc';
        link.append(headline, meta, dot, unreadText);
        row.append(link);

        for (const anchor of [link, sourceLink]) {
            anchor.addEventListener('click', () => markRead([id]));
            anchor.addEventListener('auxclick', event => {
                if (event.button === 1) markRead([id]);
            });
        }
        noticeList.append(row);
        return { id, dot, unreadText };
    }

    const notices = articles.map(createNotice);
    function refreshIndicators() {
        let unreadCount = 0;
        for (const { id, dot, unreadText } of notices) {
            const read = readIds.has(id);
            dot.hidden = read;
            unreadText.hidden = read;
            if (!read) unreadCount++;
        }
        badge.hidden = unreadCount === 0;
        badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
        const unreadLabel = unreadCount > 0 ? unreadCount + ' tin chưa đọc' : 'Bạn đã đọc hết tin';
        noticeStatus.textContent = unreadLabel;
        bell.setAttribute('aria-label', 'Thông báo · ' + unreadLabel);
        markAll.disabled = unreadCount === 0;
    }

    if (notices.length) {
        const nativePopover = typeof panel.showPopover === 'function';
        if (nativePopover) {
            panel.hidden = false;
            panel.addEventListener('toggle', event => {
                bell.setAttribute('aria-expanded', String(event.newState === 'open'));
            });
        } else {
            panel.removeAttribute('popover');
            function setOpen(open) {
                panel.hidden = !open;
                bell.setAttribute('aria-expanded', String(open));
            }
            bell.addEventListener('click', () => setOpen(panel.hidden));
            document.addEventListener('click', event => {
                if (!panel.contains(event.target) && !bell.contains(event.target)) setOpen(false);
            });
            document.addEventListener('keydown', event => {
                if (event.key === 'Escape' && !panel.hidden) {
                    setOpen(false);
                    bell.focus();
                }
            });
        }

        document.getElementById('viewAllNews').addEventListener('click', () => {
            if (nativePopover) panel.hidePopover();
            else {
                panel.hidden = true;
                bell.setAttribute('aria-expanded', 'false');
            }
            news.focus({ preventScroll: true });
        });
        markAll.addEventListener('click', () => markRead(notices.map(notice => notice.id)));
        window.addEventListener('storage', event => {
            if (event.key === storageKey || event.key === null) {
                readIds = new Set(storedReadIds());
                refreshIndicators();
            }
        });
        refreshIndicators();
        bell.hidden = false;
    }

    if (articles.length) {
        filters.hidden = false;
        const navigation = document.getElementById('newsNavigation');
        const previous = document.getElementById('newsPrevious');
        const next = document.getElementById('newsNext');
        const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
        const scrollLimit = () => Math.max(0, grid.scrollWidth - grid.clientWidth);
        function updateNavigation() {
            const end = scrollLimit();
            navigation.hidden = end < 2;
            previous.disabled = grid.scrollLeft < 2;
            next.disabled = grid.scrollLeft > end - 2;
        }
        function move(direction) {
            const visible = articles.filter(article => !article.hidden);
            const distance = visible.length > 1 ? visible[1].offsetLeft - visible[0].offsetLeft : grid.clientWidth;
            grid.scrollBy({ left: direction * distance, behavior: reduceMotion.matches ? 'instant' : 'smooth' });
        }
        previous.addEventListener('click', () => move(-1));
        next.addEventListener('click', () => move(1));
        grid.addEventListener('scroll', updateNavigation, { passive: true });
        grid.addEventListener('keydown', event => {
            if (event.target !== grid || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            if (event.key === 'Home' || event.key === 'End') grid.scrollLeft = event.key === 'Home' ? 0 : scrollLimit();
            else move(event.key === 'ArrowLeft' ? -1 : 1);
        });
        new ResizeObserver(updateNavigation).observe(grid);
        document.fonts.ready.then(updateNavigation);
        const choices = [...filters.querySelectorAll('button')];
        choices.forEach(choice => choice.addEventListener('click', () => {
            const market = choice.dataset.newsFilter;
            for (const item of choices) item.setAttribute('aria-pressed', String(item === choice));
            let shownCount = 0;
            for (const article of articles) {
                const matches = market === 'all' || article.dataset.market.split(/\s+/).includes(market);
                article.hidden = !matches;
                if (matches) shownCount++;
            }
            filterStatus.textContent = shownCount + ' tin · ' + choice.textContent;
            grid.scrollLeft = 0;
            updateNavigation();
        }));
        updateNavigation();
    }
})();
