const THEME_STORAGE_KEY = 'bestcycling-theme-preference';
const THEME_COLORS = {
    dark: '#101216',
    light: '#f6efe5'
};
const THEME_LABELS = {
    auto: 'Autom\u00e1tico',
    light: 'Claro',
    dark: 'Oscuro'
};

function getStoredThemePreference() {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'auto') {
            return stored;
        }
    } catch (e) {
    }
    return 'auto';
}

function getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(preference) {
    const resolved = preference === 'auto' ? getSystemTheme() : preference;
    const root = document.documentElement;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const themeTrigger = document.querySelector('[data-theme-trigger]');
    const themeWordmark = document.querySelector('[data-theme-wordmark]');

    root.dataset.themePreference = preference;
    root.dataset.theme = resolved;

    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', THEME_COLORS[resolved]);
    }

    if (themeWordmark) {
        const nextSrc = resolved === 'light'
            ? themeWordmark.dataset.logoLight
            : themeWordmark.dataset.logoDark;
        if (nextSrc && themeWordmark.getAttribute('src') !== nextSrc) {
            themeWordmark.setAttribute('src', nextSrc);
        }
    }

    document.querySelectorAll('[data-theme-option]').forEach((button) => {
        const isActive = button.dataset.themeOption === preference;
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    if (themeTrigger) {
        const label = preference === 'auto'
            ? `Tema autom\u00e1tico (${THEME_LABELS[resolved].toLowerCase()} seg\u00fan el sistema)`
            : `Tema ${THEME_LABELS[preference].toLowerCase()}`;
        themeTrigger.setAttribute('aria-label', label);
        themeTrigger.setAttribute('title', label);
    }
}

(function setupThemeSwitcher() {
    let preference = getStoredThemePreference();
    applyTheme(preference);

    document.querySelectorAll('[data-theme-option]').forEach((button) => {
        button.addEventListener('click', function () {
            preference = this.dataset.themeOption;
            try {
                localStorage.setItem(THEME_STORAGE_KEY, preference);
            } catch (e) {
            }
            applyTheme(preference);
        });
    });

    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const syncWithSystem = function () {
        if (preference === 'auto') {
            applyTheme('auto');
        }
    };

    if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', syncWithSystem);
    } else if (typeof mediaQuery.addListener === 'function') {
        mediaQuery.addListener(syncWithSystem);
    }
})();

(function setupThemeMenu() {
    const menu = document.querySelector('[data-theme-menu]');
    const trigger = document.querySelector('[data-theme-trigger]');
    const panel = document.querySelector('[data-theme-panel]');
    if (!menu || !trigger || !panel) return;

    function setOpen(open) {
        menu.dataset.open = open ? 'true' : 'false';
        trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
        panel.hidden = !open;
    }

    trigger.addEventListener('click', function (event) {
        event.stopPropagation();
        setOpen(panel.hidden);
    });

    document.addEventListener('click', function (event) {
        if (!menu.contains(event.target)) {
            setOpen(false);
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            setOpen(false);
            trigger.blur();
        }
    });

    document.querySelectorAll('[data-theme-option]').forEach((button) => {
        button.addEventListener('click', function () {
            setOpen(false);
        });
    });

    setOpen(false);
})();

function copyCode() {
    const el = document.getElementById('code');
    const btn = document.getElementById('copy-button');
    if (!el || !btn) return;
    el.select();
    el.setSelectionRange(0, 99999);
    try {
        document.execCommand('copy');
    } catch (e) {
    }
    btn.textContent = 'Copiado';
    setTimeout(() => btn.textContent = 'Copiar c\u00f3digo', 1200);
}

(function () {
    const codeSection = document.getElementById('code-section');
    const fab = document.getElementById('fab-goto-code');
    const emojiEl = fab.querySelector('.emoji');
    if (!codeSection || !fab || !emojiEl) return;

    const supportsIO = 'IntersectionObserver' in window;

    function setFabVisible(show) {
        if (show) {
            fab.classList.add('show');
        } else {
            fab.classList.remove('show');
        }
    }

    let ticking = false;

    function updateFabDirection() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const rect = codeSection.getBoundingClientRect();
            const margin = 24;
            let dir = 'down';
            if (rect.bottom + margin < 0) {
                dir = 'up';
            } else if (rect.top - margin > window.innerHeight) {
                dir = 'down';
            } else {
                dir = rect.top < 0 ? 'up' : 'down';
            }
            emojiEl.textContent = dir === 'up' ? '👆' : '👇';
            fab.setAttribute('aria-label', dir === 'up' ? 'Ir arriba a instrucciones' : 'Ir abajo a instrucciones');
            ticking = false;
        });
    }

    if (supportsIO) {
        const visObs = new IntersectionObserver((entries) => {
            const entry = entries[0];
            const visible = entry.isIntersecting && entry.intersectionRatio > 0.35;
            setFabVisible(!visible);
            if (!visible) updateFabDirection();
        }, {threshold: [0, 0.35, 0.6]});
        visObs.observe(codeSection);
    } else {
        setFabVisible(true);
        updateFabDirection();
    }

    window.addEventListener('scroll', updateFabDirection, {passive: true});
    window.addEventListener('resize', updateFabDirection);

    fab.addEventListener('click', function (e) {
        e.preventDefault();

        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        try {
            codeSection.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'start', inline: 'nearest'});
        } catch (err) {
            location.hash = '#code-section';
        }
    });
})();

(function () {
    const lites = document.querySelectorAll('.yt-lite');
    lites.forEach((el) => {
        const id = el.dataset.ytid;
        if (!id) return;

        const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
        const img = new Image();
        img.src = thumb;
        img.addEventListener('load', () => {
            el.style.backgroundImage = `url(${thumb})`;
            el.classList.add('lazyloaded');
        });

        const activate = () => {
            if (el.classList.contains('activated')) return;
            el.classList.add('activated');
            const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=${reduce ? 0 : 1}&rel=0&modestbranding=1&playsinline=1`;
            const iframe = document.createElement('iframe');
            iframe.setAttribute('title', 'YouTube video player');
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
            iframe.setAttribute('allowfullscreen', '');
            iframe.src = src;
            el.innerHTML = '';
            el.appendChild(iframe);
            iframe.focus();
        };

        el.addEventListener('click', activate);
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                activate();
            }
        });
    });
})();
