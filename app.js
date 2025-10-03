// Bulgarian Piano Teacher Landing Page JavaScript - Mobile Optimized
(function() {
    'use strict';

    // DOM Elements
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navOverlay = document.getElementById('navOverlay');
    const navLinks = document.querySelectorAll('.nav__link');
    const contactForm = document.getElementById('contactForm');
    const header = document.querySelector('.header');
    const body = document.body;

    // Mobile detection and iOS-specific fixes
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // Viewport height fix for mobile browsers
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    // Initialize the application
    function init() {
        setupViewportFix();
        setupNavigation();
        setupFormValidation();
        setupScrollAnimations();
        setupSmoothScrolling();
        setupHeaderScroll();
        setupMobileOptimizations();
        setupAccessibility();
    }

    // Viewport height fix for mobile browsers (especially iOS Safari)
    function setupViewportFix() {
        function setVH() {
            vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }

        // Initial set
        setVH();

        // Update on resize and orientation change
        window.addEventListener('resize', debounce(setVH, 100));
        window.addEventListener('orientationchange', () => {
            setTimeout(setVH, 100); // Delay for iOS
        });

        // iOS Safari specific fixes
        if (isIOS) {
            // Prevent bounce scrolling at top
            document.addEventListener('touchmove', function(e) {
                if (e.target === document.body || e.target === document.documentElement) {
                    e.preventDefault();
                }
            }, { passive: false });

            // Fix for iOS viewport units
            const updateViewportHeight = () => {
                const vh = document.documentElement.clientHeight;
                document.documentElement.style.setProperty('--viewport-height', vh + 'px');
            };
            
            updateViewportHeight();
            window.addEventListener('resize', updateViewportHeight);
        }
    }

    // Mobile-optimized navigation functionality
    function setupNavigation() {
        if (navToggle && navMenu && navOverlay) {
            navToggle.addEventListener('click', toggleMobileMenu);
            navOverlay.addEventListener('click', closeMobileMenu);
        }

        // Enhanced touch handling for nav links
        navLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
            
            // Add touch feedback for mobile
            if (isMobile) {
                link.addEventListener('touchstart', function() {
                    this.style.transform = 'scale(0.98)';
                }, { passive: true });
                
                link.addEventListener('touchend', function() {
                    this.style.transform = 'scale(1)';
                }, { passive: true });
            }
        });

        // Prevent scrolling when menu is open (iOS fix)
        const preventScroll = (e) => {
            if (navMenu.classList.contains('active')) {
                e.preventDefault();
            }
        };

        if (isIOS) {
            document.addEventListener('touchmove', preventScroll, { passive: false });
        }

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }

    function toggleMobileMenu() {
        const isActive = navMenu.classList.contains('active');
        
        if (isActive) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    function openMobileMenu() {
        // Add active classes
        navToggle.classList.add('active');
        navMenu.classList.add('active');
        navOverlay.classList.add('active');
        
        // Update aria-expanded for accessibility
        navToggle.setAttribute('aria-expanded', 'true');
        
        // Prevent body scrolling
        body.style.overflow = 'hidden';
        
        // iOS specific fixes
        if (isIOS) {
            body.style.position = 'fixed';
            body.style.width = '100%';
            body.style.top = `-${window.scrollY}px`;
        }
        
        // Focus trap for accessibility
        const firstFocusable = navMenu.querySelector('.nav__link');
        if (firstFocusable) {
            setTimeout(() => firstFocusable.focus(), 100);
        }
    }

    function closeMobileMenu() {
        // Remove active classes
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        navOverlay.classList.remove('active');
        
        // Update aria-expanded for accessibility
        navToggle.setAttribute('aria-expanded', 'false');
        
        // Restore body scrolling
        if (isIOS && body.style.position === 'fixed') {
            const scrollY = body.style.top;
            body.style.position = '';
            body.style.width = '';
            body.style.top = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
        
        body.style.overflow = '';
        
        // Return focus to toggle button
        navToggle.focus();
    }

    // Enhanced smooth scrolling with mobile optimizations
    function setupSmoothScrolling() {
        const allHashLinks = document.querySelectorAll('a[href^="#"]');
        
        allHashLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const headerHeight = header.offsetHeight;
                    let targetPosition;
                    
                    // Special handling for home section
                    if (targetId === '#home') {
                        targetPosition = 0;
                    } else {
                        targetPosition = targetSection.offsetTop - headerHeight - 20;
                    }
                    
                    // Close mobile menu first
                    if (this.classList.contains('nav__link')) {
                        closeMobileMenu();
                    }
                    
                    // Enhanced scrolling for mobile browsers
                    if (isMobile) {
                        // Use a timeout to ensure menu is closed before scrolling
                        setTimeout(() => {
                            window.scrollTo({
                                top: targetPosition,
                                behavior: 'smooth'
                            });
                        }, 100);
                    } else {
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    // Enhanced header scroll effect with mobile optimizations
    function setupHeaderScroll() {
        let lastScrollY = window.scrollY;
        let ticking = false;
        
        const updateHeader = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                if (!isIOS || isSafari) {
                    header.style.backdropFilter = 'blur(10px)';
                    header.style.webkitBackdropFilter = 'blur(10px)';
                }
            } else {
                header.style.backgroundColor = '#FFFFFF';
                header.style.backdropFilter = 'none';
                header.style.webkitBackdropFilter = 'none';
            }
            
            lastScrollY = currentScrollY;
            ticking = false;
        };
        
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Form validation with Bulgarian error messages
    function setupFormValidation() {
        if (!contactForm) return;

        const nameField = document.getElementById('name');
        const emailField = document.getElementById('email');
        const phoneField = document.getElementById('phone');
        const messageField = document.getElementById('message');

        // Real-time validation
        nameField.addEventListener('blur', () => validateField(nameField, 'nameError'));
        nameField.addEventListener('input', () => clearErrorIfValid(nameField, 'nameError'));
        
        emailField.addEventListener('blur', () => validateField(emailField, 'emailError'));
        emailField.addEventListener('input', () => clearErrorIfValid(emailField, 'emailError'));
        
        messageField.addEventListener('blur', () => validateField(messageField, 'messageError'));
        messageField.addEventListener('input', () => clearErrorIfValid(messageField, 'messageError'));

        // Form submission
        contactForm.addEventListener('submit', handleFormSubmission);
    }

    function clearErrorIfValid(field, errorId) {
        if (field.classList.contains('error')) {
            const value = field.value.trim();
            let isValid = true;

            switch (field.type) {
                case 'text':
                    isValid = !field.required || (value && value.length >= 2);
                    break;
                case 'email':
                    isValid = !field.required || (value && isValidEmail(value));
                    break;
                default:
                    if (field.tagName === 'TEXTAREA') {
                        isValid = !field.required || (value && value.length >= 10);
                    }
                    break;
            }

            if (isValid) {
                const errorElement = document.getElementById(errorId);
                field.classList.remove('error');
                errorElement.classList.remove('visible');
            }
        }
    }

    function validateField(field, errorId) {
        const errorElement = document.getElementById(errorId);
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove previous error state
        field.classList.remove('error');
        errorElement.classList.remove('visible');

        switch (field.type) {
            case 'text':
                if (field.required && !value) {
                    errorMessage = 'Името е задължително';
                    isValid = false;
                } else if (value && value.length < 2) {
                    errorMessage = 'Името трябва да бъде поне 2 символа';
                    isValid = false;
                }
                break;

            case 'email':
                if (field.required && !value) {
                    errorMessage = 'Имейлът е задължителен';
                    isValid = false;
                } else if (value && !isValidEmail(value)) {
                    errorMessage = 'Моля, въведете валиден имейл адрес';
                    isValid = false;
                }
                break;

            case 'tel':
                if (value && !isValidPhone(value)) {
                    errorMessage = 'Моля, въведете валиден телефонен номер';
                    isValid = false;
                }
                break;

            default:
                if (field.tagName === 'TEXTAREA') {
                    if (field.required && !value) {
                        errorMessage = 'Съобщението е задължително';
                        isValid = false;
                    } else if (value && value.length < 10) {
                        errorMessage = 'Съобщението трябва да бъде поне 10 символа';
                        isValid = false;
                    }
                }
                break;
        }

        if (!isValid) {
            field.classList.add('error');
            errorElement.textContent = errorMessage;
            errorElement.classList.add('visible');
        }

        return isValid;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    function handleFormSubmission(e) {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const fields = [
            { element: document.getElementById('name'), errorId: 'nameError' },
            { element: document.getElementById('email'), errorId: 'emailError' },
            { element: document.getElementById('message'), errorId: 'messageError' }
        ];

        let isFormValid = true;

        // Validate all required fields
        fields.forEach(field => {
            if (!validateField(field.element, field.errorId)) {
                isFormValid = false;
            }
        });

        // Validate optional phone field if filled
        const phoneField = document.getElementById('phone');
        if (phoneField.value.trim()) {
            validateField(phoneField, 'phoneError');
        }

        if (isFormValid) {
            submitForm(formData);
        } else {
            // Focus on first error field with mobile considerations
            const firstErrorField = document.querySelector('.form-control.error');
            if (firstErrorField) {
                // Delay focus on mobile to prevent keyboard issues
                if (isMobile) {
                    setTimeout(() => firstErrorField.focus(), 100);
                } else {
                    firstErrorField.focus();
                }
            }
        }
    }

    function submitForm(formData) {
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.textContent = 'Изпращане...';
        submitBtn.disabled = true;

        // Simulate form submission
        setTimeout(() => {
            showFormSuccess();
            contactForm.reset();
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }

    function showFormSuccess() {
        const successMessage = document.createElement('div');
        successMessage.className = 'status status--success';
        successMessage.style.marginTop = '1rem';
        successMessage.innerHTML = '✓ Благодаря! Вашето съобщение беше изпратено успешно. Ще се свържа с вас скоро!';
        
        contactForm.parentNode.insertBefore(successMessage, contactForm.nextSibling);
        
        // Remove success message after 5 seconds
        setTimeout(() => {
            if (successMessage.parentNode) {
                successMessage.parentNode.removeChild(successMessage);
            }
        }, 5000);

        // Scroll to success message with mobile optimization
        const scrollOptions = { behavior: 'smooth', block: 'center' };
        if (isMobile) {
            setTimeout(() => successMessage.scrollIntoView(scrollOptions), 100);
        } else {
            successMessage.scrollIntoView(scrollOptions);
        }
    }

    // Enhanced scroll animations with performance optimizations
    function setupScrollAnimations() {
        const animatedElements = document.querySelectorAll('.about__content, .hero__content, .contact__info');
        
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
            // Set initial state with hardware acceleration
            element.style.opacity = '0';
            element.style.transform = 'translate3d(0, 30px, 0)';
            element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            element.style.willChange = 'transform, opacity';
            
            observer.observe(element);
        });
    }

    // Mobile-specific optimizations
    function setupMobileOptimizations() {
        if (!isMobile) return;

        // Enhanced touch handling
        const touchElements = document.querySelectorAll('.btn, .nav__link');
        touchElements.forEach(element => {
            element.style.webkitTapHighlightColor = 'transparent';
            element.style.touchAction = 'manipulation';
        });

        // Prevent iOS bounce scrolling at page boundaries
        if (isIOS) {
            let startY = 0;
            
            document.addEventListener('touchstart', function(e) {
                startY = e.touches[0].pageY;
            }, { passive: true });
            
            document.addEventListener('touchmove', function(e) {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const scrollHeight = document.documentElement.scrollHeight;
                const clientHeight = document.documentElement.clientHeight;
                
                const currentY = e.touches[0].pageY;
                const isScrollingUp = currentY > startY;
                const isScrollingDown = currentY < startY;
                
                // Prevent overscroll at top
                if (scrollTop <= 0 && isScrollingUp) {
                    e.preventDefault();
                }
                
                // Prevent overscroll at bottom
                if (scrollTop + clientHeight >= scrollHeight && isScrollingDown) {
                    e.preventDefault();
                }
            }, { passive: false });
        }

        // Optimize form inputs for mobile
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            // Prevent zoom on focus in iOS Safari
            input.style.fontSize = '16px';
            
            // Add mobile-specific attributes
            if (input.type === 'email') {
                input.setAttribute('autocomplete', 'email');
                input.setAttribute('inputmode', 'email');
            }
            
            if (input.type === 'tel') {
                input.setAttribute('autocomplete', 'tel');
                input.setAttribute('inputmode', 'tel');
            }
        });
    }

    // Enhanced accessibility
    function setupAccessibility() {
        // Add skip link
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Focus management for mobile menu
        const trapFocus = (element) => {
            const focusableElements = element.querySelectorAll(
                'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
            );
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];

            element.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstFocusable) {
                            lastFocusable.focus();
                            e.preventDefault();
                        }
                    } else {
                        if (document.activeElement === lastFocusable) {
                            firstFocusable.focus();
                            e.preventDefault();
                        }
                    }
                }
            });
        };

        if (navMenu) {
            trapFocus(navMenu);
        }

        // Add aria-labels for better screen reader support
        const phoneLink = document.querySelector('a[href^="tel:"]');
        const emailLink = document.querySelector('a[href^="mailto:"]');
        
        if (phoneLink) phoneLink.setAttribute('aria-label', 'Обадете се на телефон');
        if (emailLink) emailLink.setAttribute('aria-label', 'Изпратете имейл');
    }

    // Handle resize events with mobile optimizations
    function handleResize() {
        // Close mobile menu on resize to larger screen
        if (window.innerWidth > 767 && navMenu.classList.contains('active')) {
            closeMobileMenu();
        }

        // Update viewport height for mobile browsers
        if (isMobile) {
            vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }
    }

    // Enhanced debounce utility
    function debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    // Add optimized resize listener
    window.addEventListener('resize', debounce(handleResize, 250));
    
    // Handle orientation change for mobile
    window.addEventListener('orientationchange', debounce(() => {
        handleResize();
        // Force viewport recalculation after orientation change
        setTimeout(() => {
            if (isMobile) {
                vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            }
        }, 500);
    }, 100));

    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Add CSS for fade-in animation
    document.addEventListener('DOMContentLoaded', function() {
        const style = document.createElement('style');
        style.textContent = `
            .fade-in {
                opacity: 1 !important;
                transform: translate3d(0, 0, 0) !important;
                -webkit-transform: translate3d(0, 0, 0) !important;
            }
        `;
        document.head.appendChild(style);
    });

    // Performance optimization: cleanup on page unload
    window.addEventListener('beforeunload', () => {
        // Remove event listeners to prevent memory leaks
        if (navToggle) navToggle.removeEventListener('click', toggleMobileMenu);
        if (navOverlay) navOverlay.removeEventListener('click', closeMobileMenu);
    });

})();