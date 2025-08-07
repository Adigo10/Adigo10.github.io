// Portfolio Website JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close mobile menu when clicking on nav links
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
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
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
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

    // Scroll-triggered animations
    function observeElements() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe all elements that should fade in
        const elementsToAnimate = document.querySelectorAll(
            '.section-header, .about-content, .timeline-item, .project-card, .contact-content, .skill-category, .publication-card, .award-card'
        );

        elementsToAnimate.forEach(element => {
            element.classList.add('fade-in');
            observer.observe(element);
        });
    }

    // Initialize animations
    observeElements();

    // Contact Form Handling with proper validation
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        // Add real-time validation
        const nameField = contactForm.querySelector('#name');
        const emailField = contactForm.querySelector('#email');
        const messageField = contactForm.querySelector('#message');

        // Clear any existing error states
        function clearErrors() {
            contactForm.querySelectorAll('.form-control').forEach(field => {
                field.style.borderColor = '';
                field.style.backgroundColor = '';
            });
            // Remove any existing error messages
            contactForm.querySelectorAll('.error-message').forEach(msg => msg.remove());
        }

        // Show field error
        function showFieldError(field, message) {
            field.style.borderColor = 'var(--color-error)';
            field.style.backgroundColor = 'rgba(var(--color-error-rgb), 0.05)';
            
            // Create error message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = message;
            errorMsg.style.cssText = `
                color: var(--color-error);
                font-size: 12px;
                margin-top: 4px;
                font-weight: 500;
            `;
            
            // Insert after the field
            field.parentNode.appendChild(errorMsg);
        }

        
    }

    // Enhanced notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        });

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        
        // Set colors based on type
        let backgroundColor, textColor;
        switch(type) {
            case 'success':
                backgroundColor = 'var(--color-success)';
                textColor = 'white';
                break;
            case 'error':
                backgroundColor = 'var(--color-error)';
                textColor = 'white';
                break;
            default:
                backgroundColor = 'var(--color-info)';
                textColor = 'white';
        }
        
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            background-color: ${backgroundColor};
            color: ${textColor};
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
            font-family: var(--font-family-base);
            font-size: 14px;
            word-wrap: break-word;
        `;

        // Add notification animations if not already added
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .notification-content {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 12px;
                }
                .notification-message {
                    flex: 1;
                    line-height: 1.4;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: inherit;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background-color 0.2s;
                    flex-shrink: 0;
                }
                .notification-close:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                }
            `;
            document.head.appendChild(style);
        }

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // External links handling - fix social media links
    function fixExternalLinks() {
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            // Ensure external links open in new tab
            if (link.href.includes('http')) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });

        // Also fix any other external links
        const allExternalLinks = document.querySelectorAll('a[href^="http"]');
        allExternalLinks.forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
    }

    // Initialize external links
    fixExternalLinks();

    // Navbar background on scroll
    const navbar = document.getElementById('navbar');
    
    function updateNavbarBackground() {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches || 
                          document.documentElement.getAttribute('data-color-scheme') === 'dark';
        
        if (window.scrollY > 50) {
            if (isDarkMode) {
                navbar.style.backgroundColor = 'rgba(38, 40, 40, 0.98)';
            } else {
                navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
            }
            navbar.style.backdropFilter = 'blur(15px)';
        } else {
            if (isDarkMode) {
                navbar.style.backgroundColor = 'rgba(38, 40, 40, 0.95)';
            } else {
                navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            }
            navbar.style.backdropFilter = 'blur(10px)';
        }
    }

    window.addEventListener('scroll', updateNavbarBackground);

    // Listen for theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateNavbarBackground);

    // Enhanced hover effects for interactive cards
    const interactiveCards = document.querySelectorAll('.project-card, .award-card, .publication-card, .timeline-content');
    
    interactiveCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Special hover effect for project cards
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Scroll to top functionality
    function createScrollToTopButton() {
        const scrollBtn = document.createElement('button');
        scrollBtn.innerHTML = '↑';
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.setAttribute('aria-label', 'Scroll to top');
        scrollBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background-color: var(--color-primary);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
            opacity: 0;
            visibility: hidden;
            z-index: 1000;
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
            } else {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.visibility = 'hidden';
            }
        });
    }

    // Initialize scroll to top button
    createScrollToTopButton();

    // Enhanced skill tag interactions
    const skillTags = document.querySelectorAll('.skill-tag');
    
    skillTags.forEach(tag => {
        tag.addEventListener('click', function() {
            // Add a subtle pulse effect when clicked
            this.style.animation = 'pulse 0.3s ease-in-out';
            setTimeout(() => {
                this.style.animation = '';
            }, 300);
        });
    });

    // Add pulse animation CSS if not exists
    if (!document.querySelector('#pulse-animation')) {
        const style = document.createElement('style');
        style.id = 'pulse-animation';
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    // Publications section special interactions
    const publicationCard = document.querySelector('.publication-card');
    if (publicationCard) {
        publicationCard.addEventListener('mouseenter', function() {
            const keywordTags = this.querySelectorAll('.keyword-tag');
            keywordTags.forEach((tag, index) => {
                setTimeout(() => {
                    tag.style.transform = 'translateY(-2px)';
                    tag.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }, index * 50);
            });
        });

        publicationCard.addEventListener('mouseleave', function() {
            const keywordTags = this.querySelectorAll('.keyword-tag');
            keywordTags.forEach(tag => {
                tag.style.transform = 'translateY(0)';
                tag.style.boxShadow = 'none';
            });
        });
    }

    // Awards section celebration effect
    const awardCards = document.querySelectorAll('.award-card');
    
    awardCards.forEach(card => {
        card.addEventListener('click', function() {
            const icon = this.querySelector('.award-icon');
            if (icon) {
                icon.style.animation = 'bounce 0.6s ease-in-out';
                setTimeout(() => {
                    icon.style.animation = '';
                }, 600);
            }
        });
    });

    // Add bounce animation CSS
    if (!document.querySelector('#bounce-animation')) {
        const style = document.createElement('style');
        style.id = 'bounce-animation';
        style.textContent = `
            @keyframes bounce {
                0%, 20%, 53%, 80%, 100% {
                    transform: translate3d(0,0,0) scale(1);
                }
                40%, 43% {
                    transform: translate3d(0, -15px, 0) scale(1.1);
                }
                70% {
                    transform: translate3d(0, -7px, 0) scale(1.05);
                }
                90% {
                    transform: translate3d(0, -2px, 0) scale(1.02);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Performance optimization: Throttle scroll events
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // Apply throttling to scroll events
    const throttledScrollHandler = throttle(() => {
        updateActiveNavLink();
        updateNavbarBackground();
    }, 10);

    window.addEventListener('scroll', throttledScrollHandler);

    // Keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // Enable keyboard navigation for cards
        if (e.target.classList.contains('project-card') || 
            e.target.classList.contains('award-card') || 
            e.target.classList.contains('publication-card')) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.target.click();
            }
        }
    });

    // Add tabindex to interactive elements for accessibility
    interactiveCards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
    });

    // Debug: Log successful initialization
    console.log('Portfolio website loaded successfully!');
    console.log('Navigation links found:', navLinks.length);
    console.log('Mobile toggle found:', navToggle ? 'Yes' : 'No');
    console.log('Contact form found:', contactForm ? 'Yes' : 'No');
    console.log('Interactive cards found:', interactiveCards.length);
    
    // Add a subtle fade-in effect to the entire page
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in-out';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);

    // Additional check: Make sure all anchor links are working
    setTimeout(() => {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        console.log('Total anchor links found:', anchorLinks.length);
        
        anchorLinks.forEach((link, index) => {
            const href = link.getAttribute('href');
            const target = document.querySelector(href);
            if (!target) {
                console.warn(`Link ${index + 1} targets "${href}" but element not found`);
            }
        });
    }, 500);

    // Initialize welcome message
    setTimeout(() => {
        showNotification('Welcome to Aditya Kumar Goel\'s Portfolio! Explore my journey in AI/ML innovation.', 'info');
    }, 2000);
});