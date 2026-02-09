// Portfolio Website JavaScript functionality

document.addEventListener('DOMContentLoaded', function () {
    // Mobile Navigation Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const themeToggles = document.querySelectorAll('.theme-toggle');
    const themeKey = 'portfolio-theme';

    function applyTheme(theme) {
        const isAlt = theme === 'alt';
        document.body.classList.toggle('theme-alt', isAlt);
        themeToggles.forEach(toggle => {
            toggle.setAttribute('aria-pressed', String(isAlt));
            toggle.setAttribute('aria-label', isAlt ? 'Switch to light theme' : 'Switch to dark theme');
        });
    }

    if (themeToggles.length > 0) {
        const savedTheme = localStorage.getItem(themeKey);
        if (savedTheme) {
            applyTheme(savedTheme);
        } else {
            applyTheme('default');
        }

        themeToggles.forEach(toggle => {
            toggle.addEventListener('click', function () {
                const isAlt = document.body.classList.toggle('theme-alt');
                applyTheme(isAlt ? 'alt' : 'default');
                localStorage.setItem(themeKey, isAlt ? 'alt' : 'default');
            });
        });
    }

    // Toggle mobile menu
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close mobile menu when clicking on nav links
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }

    // Smooth Scrolling for ALL links (including buttons)
    function addSmoothScrolling() {
        // Get all links that start with #
        const allScrollLinks = document.querySelectorAll('a[href^="#"]');

        allScrollLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 60; // Account for fixed navbar
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open
                    if (navMenu && navToggle) {
                        navMenu.classList.remove('active');
                        navToggle.classList.remove('active');
                    }
                }
            });
        });
    }

    // Initialize smooth scrolling
    addSmoothScrolling();

    // Active Navigation Link Updates
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollPos >= sectionTop && scrollPos <= sectionTop + sectionHeight) {
                // Remove active class from all nav links
                navLinks.forEach(link => link.classList.remove('active'));
                // Add active class to current nav link
                if (navLink) {
                    navLink.classList.add('active');
                }
            }
        });
    }

    // Update active nav link on scroll
    window.addEventListener('scroll', updateActiveNavLink);

    // Update active nav link on page load
    updateActiveNavLink();

    // Scroll-triggered animations (Intersection Observer)
    function observeElements() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all elements that should fade in
        const elementsToAnimate = document.querySelectorAll('.animate-fade-up, .glass-card, .project-card, .timeline-item, .award-card');

        elementsToAnimate.forEach(element => {
            // Set initial styles for animation
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';

            observer.observe(element);
        });
    }

    // Initialize external links
    observeElements();

    // Navbar background on scroll
    const navbar = document.getElementById('navbar');

    function updateNavbarBackground() {
        // In the new CSS, navbar already has glass effect.
        // We can just add a shadow on scroll.
        if (window.scrollY > 20) {
            navbar.style.boxShadow = '0 1px 0 rgba(0,0,0,0.05)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    }

    window.addEventListener('scroll', updateNavbarBackground);

    // Scroll to top functionality
    function createScrollToTopButton() {
        const scrollBtn = document.createElement('button');
        scrollBtn.innerHTML = '↑';
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.setAttribute('aria-label', 'Scroll to top');
        scrollBtn.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 44px;
            height: 44px;
            background-color: var(--system-blue);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
            opacity: 0;
            visibility: hidden;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        document.body.appendChild(scrollBtn);

        // Show/hide scroll button
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                scrollBtn.style.opacity = '1';
                scrollBtn.style.visibility = 'visible';
                scrollBtn.style.transform = 'translateY(0)';
            } else {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.visibility = 'hidden';
                scrollBtn.style.transform = 'translateY(10px)';
            }
        });
    }

    // Initialize scroll to top button
    createScrollToTopButton();

    // Latest Medium post
    function stripHtml(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return (temp.textContent || temp.innerText || '').trim();
    }

    function loadLatestMediumPost() {
        const container = document.getElementById('latest-blog');
        if (!container) {
            return;
        }

        const mediumRssUrl = 'https://medium.com/feed/@adityagoel1999';
        const rssToJsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(mediumRssUrl)}`;

        fetch(rssToJsonUrl)
            .then(response => response.json())
            .then(data => {
                if (!data || !data.items || data.items.length === 0) {
                    throw new Error('No posts found');
                }

                const post = data.items[0];
                const title = post.title || 'Latest post';
                const link = post.link || 'https://medium.com/@adityagoel1999';
                const pubDate = post.pubDate ? new Date(post.pubDate) : null;
                const dateText = pubDate ? pubDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent';
                const rawExcerpt = post.description || '';
                const excerpt = stripHtml(rawExcerpt).slice(0, 180).trim();
                const safeExcerpt = excerpt.length === 0 ? 'Read the latest article on Medium.' : `${excerpt}${excerpt.length >= 180 ? '...' : ''}`;

                container.innerHTML = `
                    <div class="publication-header">
                        <span class="publication-type">Medium</span>
                        <span class="publication-venue">@adityagoel1999</span>
                    </div>
                    <h3 class="publication-title">${title}</h3>
                    <p class="publication-meta">${dateText}</p>
                    <p class="publication-summary">${safeExcerpt}</p>
                    <div>
                        <a href="${link}" target="_blank" class="btn btn--primary">Read on Medium</a>
                    </div>
                `;
            })
            .catch(() => {
                container.innerHTML = `
                    <div class="publication-header">
                        <span class="publication-type">Medium</span>
                        <span class="publication-venue">@adityagoel1999</span>
                    </div>
                    <h3 class="publication-title">Latest post</h3>
                    <p class="publication-meta">Medium</p>
                    <p class="publication-summary">Read the latest article on Medium.</p>
                    <div>
                        <a href="https://medium.com/@adityagoel1999" target="_blank" class="btn btn--primary">Visit Medium</a>
                    </div>
                `;
            });
    }

    loadLatestMediumPost();

    // Debug: Log successful initialization
    console.log('Portfolio website loaded successfully (Apple Design Version)!');

    // Add a subtle fade-in effect to the entire page
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in-out';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});
