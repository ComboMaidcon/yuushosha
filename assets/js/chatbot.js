(() => {
    const library = import('./expert-knowledge.js');
    const prompts = [
        'Tôm đông lạnh có cần FSVP không?',
        'Hạt điều rang cần ghi nhãn gì?',
        'Prior Notice và ISF khác nhau thế nào?'
    ];
    const make = (tag, attributes = {}, ...children) => {
        const node = document.createElement(tag);
        for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
        node.append(...children);
        return node;
    };

    const title = make('h2', { id: 'pcChatTitle' }, 'Hỏi PRECHECK');
    const subtitle = make('p', { class: 'pc-chat-subtitle' }, 'Trợ lý AI về xuất khẩu thực phẩm sang Hoa Kỳ');
    const closeButton = make('button', { type: 'button', class: 'pc-chat-close', 'aria-label': 'Đóng hộp chat' }, '×');
    const header = make('header', { class: 'pc-chat-header' }, make('div', {}, title, subtitle), closeButton);
    const transcript = make('div', { class: 'pc-chat-transcript', role: 'log', 'aria-label': 'Tin nhắn' });
    const suggestions = make('div', { class: 'pc-chat-suggestions', role: 'group', 'aria-label': 'Câu hỏi gợi ý' });
    const busy = make('p', { class: 'pc-chat-pending', role: 'status' });
    const input = make('textarea', { rows: '1', maxlength: '900', 'aria-label': 'Nội dung tin nhắn', placeholder: 'Nhập tin nhắn…' });
    const send = make('button', { type: 'submit' }, 'Gửi');
    const form = make('form', { class: 'pc-chat-form' }, input, send);
    const hint = make('p', { class: 'pc-chat-hint' },
        'Câu hỏi nghiệp vụ có thể được gửi tới dịch vụ AI. Chỉ nhập mô tả cần thiết, tránh gửi tài liệu mật.');
    const dialog = make('dialog', { class: 'pc-chat-dialog', id: 'pcChatDialog', 'aria-labelledby': 'pcChatTitle' },
        header, transcript, suggestions, busy, form, hint);
    document.body.append(dialog);

    const launchers = [...document.querySelectorAll('[data-precheck-chat]')];
    let returnFocus;
    let questions = [];
    let pending = false;

    transcript.append(showMessage({
        answer: 'Bạn đang chuẩn bị xuất mặt hàng gì? Cho tôi biết dạng chế biến, bao bì và tuyến vận chuyển để xác định giấy tờ và nguồn cần kiểm tra.'
    }));
    suggestions.append(...prompts.map(question => {
        const button = make('button', { type: 'button' }, question);
        button.addEventListener('click', () => {
            input.focus({ preventScroll: true });
            void ask(question);
        });
        return button;
    }));

    function showMessage({ answer, question, sources, actions, mode: responseMode, checkedOn }) {
        if (question) return make('p', { class: 'pc-chat-message visitor' }, question);
        const bubble = make('article', { class: 'pc-chat-message assistant' }, make('p', {}, answer));
        if (sources?.length) {
            const refs = make('details', { class: 'pc-chat-sources' }, make('summary', {}, 'Nguồn tham chiếu (' + sources.length + ')'));
            const list = make('ul');
            for (const source of sources) {
                if (typeof source.url !== 'string' || !source.url.startsWith('https://') || !source.title) continue;
                const link = make('a', { href: source.url, target: '_blank', rel: 'noopener noreferrer' }, source.title);
                list.append(make('li', {}, link));
            }
            refs.append(list);
            bubble.append(refs);
        }
        if (responseMode || checkedOn) {
            const badge = responseMode === 'model' ? 'AI tổng hợp' : 'Tra cứu thư viện';
            bubble.append(make('small', { class: 'pc-chat-provenance' }, badge + (checkedOn ? ' · Đối chiếu nguồn ' + checkedOn : '')));
        }
        if (actions?.length) {
            const links = make('div', { class: 'pc-chat-actions' });
            for (const action of actions) links.append(make('a', { href: action.href }, action.label));
            bubble.append(links);
        }
        return bubble;
    }

    function updateControls() {
        send.disabled = pending;
        for (const button of suggestions.children) button.disabled = pending;
        busy.textContent = pending ? 'Đang đối chiếu câu hỏi…' : '';
    }

    function scrollToLatest() {
        transcript.scrollTop = transcript.scrollHeight;
    }

    function pushMessage(message) {
        const bubble = showMessage(message);
        transcript.append(bubble);
        if (message.answer && bubble.offsetHeight > transcript.clientHeight * .73) {
            transcript.scrollTop = bubble.offsetTop - 10;
        } else {
            scrollToLatest();
        }
    }

    function open(trigger = document.activeElement) {
        if (!dialog.open) {
            returnFocus = trigger;
            dialog.show();
            for (const launcher of launchers) launcher.setAttribute('aria-expanded', 'true');
            scrollToLatest();
        }
        input.focus({ preventScroll: true });
    }

    function close() {
        if (!dialog.open) return;
        dialog.close();
        for (const launcher of launchers) launcher.setAttribute('aria-expanded', 'false');
        returnFocus?.focus({ preventScroll: true });
    }

    launchers.forEach(launcher => {
        launcher.hidden = false;
        launcher.setAttribute('aria-controls', dialog.id);
        launcher.setAttribute('aria-expanded', 'false');
        launcher.setAttribute('aria-haspopup', 'dialog');
        launcher.addEventListener('click', () => open(launcher));
    });
    closeButton.addEventListener('click', close);
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && dialog.open && dialog.contains(document.activeElement)) {
            event.preventDefault();
            close();
        }
    });

    const plain = value => String(value).normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase().replace(/đ/g, 'd');
    function historicalAnswer(question, resources) {
        const engine = window.PCE;
        const data = window.PC_DATA;
        if (!engine || !data) return null;
        const normalized = plain(question);
        const code = normalized.match(/\b(?:ma|code)\s+(?:loi\s+)?(\d{1,5})\b/)?.[1];
        if (code && Object.hasOwn(data.C, code)) {
            const charge = engine.C(code);
            return {
                answer: 'Mã FDA ' + code + ' · ' + (charge.t || charge.c) + '\n' + (charge.e || charge.o || '') +
                    '\n\nMã này mô tả lý do trong dữ liệu lịch sử. Hãy so với thông báo FDA của lô thực tế để xác định phạm vi áp dụng.',
                sources: resources.getSources(['refusals']),
                checkedOn: engine.meta.updated, mode: 'library'
            };
        }
        const product = normalized.match(/^(.+?)\s+(?:hay|thuong|da)\s+bi\s+(?:loi|tu choi)/)?.[1];
        const match = product && engine.search(product, 1)[0];
        if (!match) return null;
        const signals = match[8].length ? match[8] : match[7];
        const observed = signals.slice(0, 3).map(([id, percent]) => '• ' + (engine.C(id).t || engine.C(id).c) + ' · ' + percent + '%');
        if (!observed.length) return null;
        return {
            answer: 'Nhóm tham khảo: ' + engine.displayName(match) + '\n' + observed.join('\n') +
                '\n\nTỷ lệ tính trong tập dòng đã bị FDA từ chối của nhóm ' + (match[8].length ? 'Việt Nam' : 'toàn cầu') + '.',
            sources: resources.getSources(['refusals']),
            checkedOn: engine.meta.updated, mode: 'library'
        };
    }

    async function expertAnswer(question, history) {
        const resources = await library;
        const historical = historicalAnswer(question, resources);
        if (historical) return historical;

        if (location.protocol === 'http:' || location.protocol === 'https:') {
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question, history }),
                    signal: AbortSignal.timeout(11000)
                });
                const result = response.ok && await response.json();
                if (['model', 'library'].includes(result?.mode) && typeof result.answer === 'string' && result.answer.trim()) {
                    return result;
                }
            } catch {
                // Offline and static previews use the same verified notes.
            }
        }

        const hits = resources.matchTopics(question, history);
        return { mode: 'library', checkedOn: resources.checkedOn, ...resources.localAnswer(question, hits) };
    }

    async function ask(text) {
        const question = String(text).trim().slice(0, 900);
        if (!question || pending) return;
        pushMessage({ question });

        const history = questions;
        questions = [...questions, question].slice(-3);
        pending = true;
        updateControls();
        try {
            pushMessage(await expertAnswer(question, history));
        } catch {
            pushMessage({
                answer: 'Chưa tải được thư viện hướng dẫn. Bạn có thể mở nguồn trong thư viện quy định và thử lại câu hỏi.',
                actions: [{ label: 'Mở thư viện quy định', href: 'dashboard.html#regulations' }]
            });
        } finally {
            pending = false;
            updateControls();
        }
    }

    form.addEventListener('submit', event => {
        event.preventDefault();
        if (pending || !input.value.trim()) return;
        const question = input.value;
        input.value = '';
        void ask(question);
        input.focus();
    });
    input.addEventListener('keydown', event => {
        if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
            event.preventDefault();
            form.requestSubmit();
        }
    });
    window.PCChat = { open, close, ask };
})();
