/* ============================================================
   Aditya Kumar Goel — Portfolio interactions
   ============================================================ */
(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.addEventListener('DOMContentLoaded', function () {
        initTheme();
        initNav();
        initScroll();
        initReveals();
        initMarquee();
        initOrbs();
        initMagnetic();
        initSpotlight();
        initTilt();
        initCounters();
        initScramble();
        initToTop();
        loadLatestMediumPost();
        // page fade-in
        requestAnimationFrame(() => document.body.classList.add('loaded'));
    });

    /* ---------- Theme ---------- */
    function initTheme() {
        const toggle = document.getElementById('theme-toggle');
        const key = 'portfolio-theme';
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

        function apply(theme) {
            const alt = theme === 'alt';
            document.body.classList.toggle('theme-alt', alt);
            if (toggle) {
                toggle.setAttribute('aria-checked', String(alt));
                toggle.setAttribute('aria-label', alt ? 'Switch to light theme' : 'Switch to dark theme');
            }
        }
        function stored() {
            const s = localStorage.getItem(key);
            return (s === 'alt' || s === 'default') ? s : null;
        }
        // Light is the primary experience; only follow a stored user choice.
        const initial = stored() ?? 'default';
        apply(initial);

        if (toggle) {
            toggle.addEventListener('click', function () {
                const next = document.body.classList.contains('theme-alt') ? 'default' : 'alt';
                apply(next);
                localStorage.setItem(key, next);
            });
        }
        // System preference intentionally ignored — light is primary, dark is opt-in.
    }

    /* ---------- Nav ---------- */
    function initNav() {
        const burger = document.getElementById('nav-burger');
        const menu = document.getElementById('nav-menu');
        const links = document.querySelectorAll('.nav-link');

        if (burger && menu) {
            burger.addEventListener('click', () => menu.classList.toggle('open'));
        }

        links.forEach(link => {
            link.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        const top = target.getBoundingClientRect().top + window.scrollY - 70;
                        window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
                        if (menu) menu.classList.remove('open');
                    }
                }
            });
        });

        // also smooth-scroll hero buttons / any in-page anchor
        document.querySelectorAll('a[href^="#"]:not(.nav-link)').forEach(a => {
            a.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href.length > 1) {
                    const t = document.querySelector(href);
                    if (t) {
                        e.preventDefault();
                        const top = t.getBoundingClientRect().top + window.scrollY - 70;
                        window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
                    }
                }
            });
        });
    }

    /* ---------- Scroll: progress, nav state, active link ---------- */
    function initScroll() {
        const nav = document.getElementById('nav');
        const progress = document.getElementById('scroll-progress');
        const sections = Array.from(document.querySelectorAll('section[id]'));
        const navLinks = Array.from(document.querySelectorAll('.nav-link'));
        let ticking = false;

        function update() {
            const y = window.scrollY;
            const h = document.documentElement.scrollHeight - window.innerHeight;
            if (progress) progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
            if (nav) nav.classList.toggle('scrolled', y > 24);

            const pos = y + 120;
            let current = sections[0] ? sections[0].id : null;
            for (const sec of sections) {
                if (pos >= sec.offsetTop) current = sec.id;
            }
            navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
            ticking = false;
        }
        window.addEventListener('scroll', () => {
            if (!ticking) { requestAnimationFrame(update); ticking = true; }
        }, { passive: true });
        update();
    }

    /* ---------- Reveal on scroll (with stagger) ---------- */
    function initReveals() {
        const items = document.querySelectorAll('.reveal');
        if (reduceMotion || !('IntersectionObserver' in window)) {
            items.forEach(i => i.classList.add('in'));
            return;
        }
        // Arm: hide reveals only now that JS is running (graceful if JS fails).
        document.body.classList.add('reveals-armed');
        // stagger siblings within a shared parent group
        const groups = new Map();
        items.forEach(item => {
            const parent = item.parentElement;
            if (!groups.has(parent)) groups.set(parent, 0);
        });

        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'));
                    const idx = siblings.indexOf(el);
                    el.style.transitionDelay = Math.min(idx, 6) * 0.08 + 's';
                    el.classList.add('in');
                    obs.unobserve(el);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        items.forEach(i => obs.observe(i));
    }

    /* ---------- Marquee: duplicate-safe, speed from data ---------- */
    function initMarquee() {
        // Track already duplicated in markup; nothing needed unless paused state desired.
    }

    /* ---------- Orb parallax ---------- */
    function initOrbs() {
        if (reduceMotion) return;
        const orbs = document.querySelectorAll('.orb');
        let ticking = false;
        function move() {
            const y = window.scrollY;
            orbs.forEach((orb, i) => {
                const speed = (i + 1) * 0.04;
                orb.style.transform = `translate3d(0, ${y * speed}px, 0)`;
            });
            ticking = false;
        }
        window.addEventListener('scroll', () => {
            if (!ticking) { requestAnimationFrame(move); ticking = true; }
        }, { passive: true });
    }

    /* ---------- Magnetic buttons ---------- */
    function initMagnetic() {
        if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;
        document.querySelectorAll('.btn--primary, .btn--ghost').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const r = btn.getBoundingClientRect();
                const mx = e.clientX - r.left - r.width / 2;
                const my = e.clientY - r.top - r.height / 2;
                btn.style.transform = `translate(${mx * 0.18}px, ${my * 0.28}px)`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
        });
    }

    /* ---------- Cursor spotlight on cards ---------- */
    function initSpotlight() {
        const cards = document.querySelectorAll('.impact-card, .proj-card, .edu-card, .award-card, .pub-card, .ac, .blog-card');
        cards.forEach(card => {
            card.classList.add('spotlight');
            card.addEventListener('pointermove', (e) => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
                card.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
            });
        });
    }

    /* ---------- Subtle 3D tilt on hover ---------- */
    function initTilt() {
        if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;
        const MAX = 6; // degrees
        document.querySelectorAll('.proj-card, .impact-card').forEach(card => {
            card.classList.add('tilt');
            let raf = null;
            card.addEventListener('pointermove', (e) => {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => {
                    card.classList.add('tilting');
                    card.style.setProperty('--ry', (px * MAX) + 'deg');
                    card.style.setProperty('--rx', (-py * MAX) + 'deg');
                });
            });
            card.addEventListener('pointerleave', () => {
                card.classList.remove('tilting');
                card.style.setProperty('--rx', '0deg');
                card.style.setProperty('--ry', '0deg');
            });
        });
    }

    /* ---------- Animated count-up for hero stats ---------- */
    function initCounters() {
        const nodes = document.querySelectorAll('.hstat .n .grad-text');
        const targets = [];
        nodes.forEach(node => {
            const m = /^(\d+)(.*)$/.exec(node.textContent.trim());
            if (m) {
                targets.push({ node: node, value: parseInt(m[1], 10), suffix: m[2] || '' });
                node.setAttribute('data-count', m[1]);
            }
        });
        if (!targets.length) return;
        if (reduceMotion || !('IntersectionObserver' in window) || document.body.classList.contains('motion-off')) {
            return; // leave final values in place
        }
        function run(t) {
            const dur = 1100;
            const start = performance.now();
            function step(now) {
                const p = Math.min((now - start) / dur, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                t.node.textContent = Math.round(eased * t.value) + t.suffix;
                if (p < 1) requestAnimationFrame(step);
                else t.node.textContent = t.value + t.suffix;
            }
            requestAnimationFrame(step);
        }
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const t = targets.find(x => x.node === entry.target);
                    if (t) { run(t); obs.unobserve(entry.target); }
                }
            });
        }, { threshold: 0.6 });
        targets.forEach(t => obs.observe(t.node));
    }

    /* ---------- Scramble decode (hero sub) ---------- */
    function initScramble() {
        const el = document.querySelector('.hero-sub');
        if (!el || reduceMotion || document.body.classList.contains('motion-off')) return;
        const target = el.textContent;
        const chars = '!<>-_\\/[]{}=+*^?#________';
        el.classList.add('scramble');
        let frame = 0;
        const queue = [];
        for (let i = 0; i < target.length; i++) {
            const startFrame = Math.floor(Math.random() * 18);
            const endFrame = startFrame + Math.floor(Math.random() * 18) + 8;
            queue.push({ to: target[i], start: startFrame, end: endFrame, ch: '' });
        }
        function tick() {
            let out = '';
            let done = 0;
            for (const q of queue) {
                if (frame >= q.end) { out += q.to; done++; }
                else if (frame >= q.start) {
                    if (!q.ch || Math.random() < 0.28) q.ch = chars[Math.floor(Math.random() * chars.length)];
                    out += '<span style="color:var(--accent)">' + q.ch + '</span>';
                } else { out += '<span style="opacity:0">' + q.to + '</span>'; }
            }
            el.innerHTML = out;
            if (done < queue.length) { frame++; requestAnimationFrame(tick); }
            else { el.textContent = target; }
        }
        // brief hold so the entrance reads, then decode
        setTimeout(() => requestAnimationFrame(tick), 360);
    }

    /* ---------- Scroll to top ---------- */
    function initToTop() {
        const btn = document.getElementById('to-top');
        if (!btn) return;
        window.addEventListener('scroll', () => {
            btn.classList.toggle('show', window.scrollY > 600);
        }, { passive: true });
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
    }

    /* ---------- Latest Medium post ---------- */
    function stripHtml(html) {
        const t = document.createElement('div');
        t.innerHTML = html;
        return (t.textContent || t.innerText || '').trim();
    }
    function loadLatestMediumPost() {
        const container = document.getElementById('latest-blog');
        if (!container) return;
        const rss = 'https://medium.com/feed/@adityagoel1999';
        const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}`;

        fetch(url)
            .then(r => r.json())
            .then(data => {
                if (!data || !data.items || !data.items.length) throw new Error('No posts');
                const post = data.items[0];
                const title = post.title || 'Latest post';
                const link = post.link || 'https://medium.com/@adityagoel1999';
                const d = post.pubDate ? new Date(post.pubDate) : null;
                const dateText = d ? d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent';
                const raw = stripHtml(post.description || '').slice(0, 180).trim();
                const excerpt = raw.length ? `${raw}${raw.length >= 180 ? '…' : ''}` : 'Read the latest article on Medium.';
                container.innerHTML = `
                    <div class="publication-header">
                        <span class="publication-type">Medium</span>
                        <span class="publication-venue">@adityagoel1999</span>
                    </div>
                    <h3 class="publication-title">${title}</h3>
                    <p class="publication-meta">${dateText}</p>
                    <p class="publication-summary">${excerpt}</p>
                    <a href="${link}" target="_blank" rel="noopener" class="btn btn--primary" style="align-self:flex-start;">Read on Medium <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
            })
            .catch(() => {
                container.innerHTML = `
                    <div class="publication-header">
                        <span class="publication-type">Medium</span>
                        <span class="publication-venue">@adityagoel1999</span>
                    </div>
                    <h3 class="publication-title">Stories on Medium</h3>
                    <p class="publication-meta">Medium</p>
                    <p class="publication-summary">I write about Responsible AI, LLMs, and lessons from shipping GenAI systems. Read the latest on Medium.</p>
                    <a href="https://medium.com/@adityagoel1999" target="_blank" rel="noopener" class="btn btn--primary" style="align-self:flex-start;">Visit Medium <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
            });
    }
})();
