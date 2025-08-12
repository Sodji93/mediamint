(function () {
    const hero = document.getElementById('hero');
    const track = document.getElementById('heroTrack');
    if (!hero || !track) return;

    const slides = Array.from(track.querySelectorAll('.hero__slide'));
    const bulletsWrap = document.getElementById('bullets');

    //настройки
    const AUTOPLAY_MS = 6000;
    const SWIPE_THRESHOLD = 0.18;
    const DRAG_START_PX = 8;

    let index = 0;
    let autoplayId = null;

    // Базовые стили/оптимизации
    track.style.willChange = 'transform';
    track.style.transform = 'translateX(0px)';
    track.style.touchAction = 'pan-y';
    track.style.cursor = 'grab';
    if (!hero.hasAttribute('tabindex')) hero.setAttribute('tabindex', '0');

    // генерируем буллеты
    if (bulletsWrap) {
        bulletsWrap.innerHTML = '';
        slides.forEach((_, i) => {
            const b = document.createElement('div');
            b.className = 'bullet';
            b.setAttribute('role', 'tab');
            b.setAttribute('aria-label', `Слайд ${i + 1}`);
            b.style.cursor = 'pointer';
            b.addEventListener('click', () => go(i, { user: true }));
            bulletsWrap.appendChild(b);
        });
    }
    const bullets = bulletsWrap ? Array.from(bulletsWrap.children) : [];

    // шаг с учётом gap у flex-контейнера
    function getStep() {
        const w = slides[0]?.getBoundingClientRect().width || 0;
        const cs = getComputedStyle(track);
        const gap = parseFloat(cs.gap || cs.columnGap || '0') || 0;
        return w + gap;
    }

    function clamp(i) {
        return Math.max(0, Math.min(slides.length - 1, i));
    }

    function setTransform(px) {
        track.style.transform = `translateX(${-px}px)`;
    }

    function updateA11y() {
        slides.forEach((s, i) => s.setAttribute('aria-label', `${i + 1} из ${slides.length}`));
        bullets.forEach((b, i) => b.setAttribute('aria-current', i === index ? 'true' : 'false'));
    }

    function go(i, opts = {}) {
        const { user = false, animate = true } = opts;
        index = clamp(i);
        if (!animate) {
            track.style.transition = 'none';
        } else {
            track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
        }
        setTransform(getStep() * index);
        if (!animate) {
            requestAnimationFrame(() => { track.style.transition = ''; });
        }
        updateA11y();
        if (user) restartAutoplay();
    }

    function next() { go(index + 1); }
    function prev() { go(index - 1); }

    //drag / swipe
    let dragging = false;
    let dragStarted = false;
    let didSwipe = false;
    let activePointerId = null;

    let startX = 0;
    let startY = 0;
    let dx = 0;

    function isInteractiveTarget(t) {
        return !!(t && t.closest && t.closest('a, button, input, textarea, select, [role="button"], [role="link"]'));
    }

    function onPointerDown(e) {
        // фильтрация типов указателей — обрабатываем касания и мышь
        if (e.pointerType !== 'touch' && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;

        // если клик по ссылке/кнопке — не перехватываем
        if (isInteractiveTarget(e.target)) {
            dragging = false;
            dragStarted = false;
            didSwipe = false;
            return;
        }

        // если уже кто-то тащит — игнорируем вторые пальцы/указатели
        if (activePointerId !== null && e.pointerId !== activePointerId) return;

        activePointerId = e.pointerId ?? activePointerId;

        dragging = true;
        dragStarted = false;
        didSwipe = false;
        startX = e.clientX ?? 0;
        startY = e.clientY ?? 0;
        dx = 0;

        track.style.transition = 'none';
        track.style.cursor = 'grabbing';

        // захватываем pointer, чтобы продолжать получать события даже если палец ушёл
        if (e.pointerId != null && track.setPointerCapture) {
            try { track.setPointerCapture(e.pointerId); } catch (_) { /* noop */ }
        }
    }

    function onPointerMove(e) {
        if (!dragging) return;
        if (activePointerId !== null && e.pointerId !== activePointerId) return;

        const x = e.clientX ?? 0;
        const y = e.clientY ?? 0;
        dx = x - startX;
        const dy = y - startY;

        // запускаем реальный drag только после горизонтального порога
        if (!dragStarted && Math.abs(dx) > DRAG_START_PX && Math.abs(dx) > Math.abs(dy)) {
            dragStarted = true;
            didSwipe = true;
        }
        if (!dragStarted) return;

        const base = getStep() * index;
        setTransform(base - dx);
    }

    function onPointerUp(e) {
        if (!dragging) return;
        if (activePointerId !== null && e.pointerId !== activePointerId) return;

        track.style.transition = '';
        track.style.cursor = '';

        if (dragStarted) {
            const step = getStep();
            if (Math.abs(dx) > step * SWIPE_THRESHOLD) {
                dx < 0 ? next() : prev();
            } else {
                go(index); // вернуть на место
            }
        }

        dragging = false;
        dragStarted = false;
        dx = 0;
        activePointerId = null;
        restartAutoplay();

        // сбросим флаг свайпа после завершения клика
        setTimeout(() => { didSwipe = false; }, 0);
    }

    // если был свайп — отменяем click, который стреляет после pointerup
    track.addEventListener('click', (e) => {
        if (didSwipe) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);

    //слушатели событий (только pointer)
    track.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('lostpointercapture', onPointerUp);

    //клавиатура
    hero.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
        if (e.key === 'ArrowLeft') { prev(); e.preventDefault(); }
    });

    //автопрокрутка
    function startAutoplay() {
        if (!AUTOPLAY_MS) return;
        stopAutoplay();
        autoplayId = setInterval(() => {
            if (index === slides.length - 1) index = -1;
            next();
        }, AUTOPLAY_MS);
    }
    function stopAutoplay() {
        if (autoplayId) clearInterval(autoplayId);
        autoplayId = null;
    }
    function restartAutoplay() { stopAutoplay(); startAutoplay(); }

    // пауза при наведении/фокусе
    hero.addEventListener('mouseenter', stopAutoplay);
    hero.addEventListener('mouseleave', startAutoplay);
    hero.addEventListener('focusin', stopAutoplay);
    hero.addEventListener('focusout', startAutoplay);

    // на время клика по соц. ссылкам — пауза автопрокрутки (если блок есть)
    hero.querySelectorAll('.social a').forEach(a => {
        a.addEventListener('mousedown', stopAutoplay);
        a.addEventListener('mouseup', startAutoplay);
    });

    // === resize: пересчёт шага, вернуть слайд на место без анимации
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => go(index, { animate: false }), 120);
    });

    go(0, { animate: false });
    startAutoplay();
})();