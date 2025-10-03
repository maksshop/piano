// Piano Teacher Landing Page JavaScript
(function() {
    'use strict';

    // DOM Elements
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav__link');
    const header = document.querySelector('.header');

    // Initialize the application
    function init() {
        setupNavigation();
        setupScrollAnimations();
        setupSmoothScrolling();
        setupHeaderScroll();
    }

    // Navigation functionality
    function setupNavigation() {
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', toggleMobileMenu);
        }

        // Close mobile menu when clicking on nav links
        navLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                closeMobileMenu();
            }
        });
    }

    function toggleMobileMenu() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Update aria-expanded for accessibility
        const isExpanded = navMenu.classList.contains('active');
        navToggle.setAttribute('aria-expanded', isExpanded);
    }

    function closeMobileMenu() {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
    }

    // Smooth scrolling for navigation links
    function setupSmoothScrolling() {
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const headerHeight = header.offsetHeight;
                    let targetPosition;
                    
                    // Special handling for home section - scroll to top
                    if (targetId === '#home') {
                        targetPosition = 0;
                    } else {
                        targetPosition = targetSection.offsetTop - headerHeight - 20;
                    }
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Header scroll effect
    function setupHeaderScroll() {
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', function() {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.backgroundColor = '#FFFFFF';
                header.style.backdropFilter = 'none';
            }
            
            lastScrollY = currentScrollY;
        });
    }

    // Scroll animations
    function setupScrollAnimations() {
        const animatedElements = document.querySelectorAll('.card, .about__content, .hero__content, .lessons__header, .testimonials__title, .contact__content');
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(element => {
            // Set initial state
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            
            observer.observe(element);
        });
    }

    // Utility function to handle CSS animation completion
    function onAnimationComplete(element, callback) {
        element.addEventListener('animationend', callback, { once: true });
    }

    // Handle resize events
    function handleResize() {
        // Close mobile menu on resize to larger screen
        if (window.innerWidth > 767) {
            closeMobileMenu();
        }
    }

    // Debounce utility
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Add resize listener with debouncing
    window.addEventListener('resize', debounce(handleResize, 250));

    // Accessibility improvements
    function setupAccessibility() {
        // Add skip link functionality
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.className = 'sr-only';
        skipLink.textContent = 'Преминаване към основното съдържание';
        skipLink.style.position = 'absolute';
        skipLink.style.top = '-40px';
        skipLink.style.left = '6px';
        skipLink.style.transition = 'top 0.3s';
        skipLink.style.zIndex = '1001';
        skipLink.style.background = '#fff';
        skipLink.style.padding = '8px';
        skipLink.style.textDecoration = 'none';
        skipLink.style.borderRadius = '4px';

        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });

        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add main id for skip link
        const main = document.querySelector('main');
        if (main) {
            main.id = 'main';
            main.setAttribute('tabindex', '-1');
        }
    }

    // Enhanced contact information interaction
    function setupContactInteractions() {
        const contactDetails = document.querySelectorAll('.contact__detail');
        
        contactDetails.forEach(detail => {
            // Add hover effect enhancement
            detail.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-4px) scale(1.02)';
            });
            
            detail.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
            
            // Add click feedback for mobile
            detail.addEventListener('touchstart', function() {
                this.style.transform = 'translateY(-2px) scale(1.01)';
            });
            
            detail.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.style.transform = 'translateY(0) scale(1)';
                }, 150);
            });
        });

        // Add copy to clipboard functionality for email and phone
        const emailLink = document.querySelector('a[href^="mailto:"]');
        const phoneLink = document.querySelector('a[href^="tel:"]');
        
        if (emailLink) {
            addCopyFunctionality(emailLink, 'Имейлът е копиран в клипборда!');
        }
        
        if (phoneLink) {
            addCopyFunctionality(phoneLink, 'Телефонният номер е копиран в клипборда!');
        }
    }

    function addCopyFunctionality(element, message) {
        element.addEventListener('click', function(e) {
            // Only prevent default if we can copy to clipboard
            if (navigator.clipboard) {
                e.preventDefault();
                
                let textToCopy;
                if (this.href.startsWith('mailto:')) {
                    textToCopy = this.href.replace('mailto:', '');
                } else if (this.href.startsWith('tel:')) {
                    textToCopy = this.textContent;
                }
                
                navigator.clipboard.writeText(textToCopy).then(() => {
                    showCopyNotification(message, this);
                }).catch(() => {
                    // Fallback: open the link normally
                    window.location.href = this.href;
                });
            }
        });
    }

    function showCopyNotification(message, element) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'copy-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: var(--piano-red);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
        });
        
        // Remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }

    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            setupAccessibility();
            setupContactInteractions();
        });
    } else {
        init();
        setupAccessibility();
        setupContactInteractions();
    }

    // Handle CSS animation class
    document.addEventListener('DOMContentLoaded', function() {
        const style = document.createElement('style');
        style.textContent = `
            .fade-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
            
            .copy-notification {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
        `;
        document.head.appendChild(style);
    });

})();