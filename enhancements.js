/* ============================================================
   Aditya Kumar Goel — Portfolio enhancements
   Command palette · live SG clock · copy-email toast · scroll ring
   All client-side; safe for static GitHub Pages hosting.
   ============================================================ */
(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.addEventListener('DOMContentLoaded', function () {
        initClock();
        initCopyEmail();
        initScrollRing();
    });

    /* ---------- Toast helper ---------- */
    let toastTimer = null;
    function toast(msg, icon) {
        const el = document.getElementById('toast');
        if (!el) return;
        el.innerHTML = (icon ? `<i class="${icon}"></i>` : '') + `<span>${msg}</span>`;
        el.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
    }

    /* ---------- Live Singapore clock ---------- */
    function initClock() {
        const el = document.getElementById('sg-clock');
        if (!el) return;
        function tick() {
            try {
                const t = new Date().toLocaleTimeString('en-GB', {
                    timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit'
                });
                el.textContent = 'SGT ' + t;
            } catch (e) {
                el.textContent = '';
            }
        }
        tick();
        setInterval(tick, 1000 * 20);
    }

    /* ---------- Copy email ---------- */
    function initCopyEmail() {
        const btn = document.getElementById('copy-email');
        if (!btn) return;
        btn.addEventListener('click', async () => {
            const email = btn.getAttribute('data-email');
            try {
                await navigator.clipboard.writeText(email);
            } catch (e) {
                const ta = document.createElement('textarea');
                ta.value = email; document.body.appendChild(ta); ta.select();
                try { document.execCommand('copy'); } catch (_) {}
                document.body.removeChild(ta);
            }
            btn.classList.add('copied');
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
            toast(email + ' copied to clipboard', 'fa-solid fa-check');
            setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = original; }, 1800);
        });
    }

    /* ---------- Scroll-progress ring on to-top ---------- */
    function initScrollRing() {
        const bar = document.querySelector('.to-top-ring .bar');
        if (!bar) return;
        const C = 2 * Math.PI * 19;
        bar.style.strokeDasharray = C.toFixed(2);
        bar.style.strokeDashoffset = C.toFixed(2);
        let ticking = false;
        function update() {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            const p = h > 0 ? Math.min(window.scrollY / h, 1) : 0;
            bar.style.strokeDashoffset = (C * (1 - p)).toFixed(2);
            ticking = false;
        }
        window.addEventListener('scroll', () => {
            if (!ticking) { requestAnimationFrame(update); ticking = true; }
        }, { passive: true });
        update();
    }
})();
