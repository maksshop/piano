/* =============================================
   ARVIA CAPITAL - SCRIPT.JS
   Vanilla JavaScript ES6+
   ============================================= */

'use strict';

// ---- DOM Ready ----
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initSmoothScroll();
  initActiveNavLinks();
  initStatsCounter();
  initFloatingCTA();
  initContactForm();
  initScrollAnimations();
});

/* =============================================
   HEADER - Scroll Shadow
   ============================================= */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* =============================================
   MOBILE NAVIGATION
   ============================================= */
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const mobileNavClose = document.getElementById('mobileNavClose');
  const mobileLinks = document.querySelectorAll('.mobile-nav__link, .mobile-nav__cta');

  if (!hamburger || !mobileNav) return;

  const openNav = () => {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeNav = () => {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    if (mobileNav.classList.contains('open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', closeNav);
  }

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeNav);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
      closeNav();
    }
  });
}

/* =============================================
   SMOOTH SCROLL
   ============================================= */
function initSmoothScroll() {
  const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 80;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });
}

/* =============================================
   ACTIVE NAV LINKS (Intersection Observer)
   ============================================= */
function initActiveNavLinks() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0
  });

  sections.forEach(section => observer.observe(section));
}

/* =============================================
   STATS COUNTER ANIMATION
   ============================================= */
function initStatsCounter() {
  const statsNumbers = document.querySelectorAll('.stats__number[data-target]');
  if (!statsNumbers.length) return;

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2000;
    const start = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    };

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statsNumbers.forEach(el => observer.observe(el));
}

/* =============================================
   FLOATING CTA VISIBILITY
   ============================================= */
function initFloatingCTA() {
  const floatingCta = document.getElementById('floatingCta');
  if (!floatingCta) return;

  const heroSection = document.getElementById('hero');

  const onScroll = () => {
    if (!heroSection) {
      floatingCta.classList.add('visible');
      return;
    }

    const heroBottom = heroSection.getBoundingClientRect().bottom;
    if (heroBottom < 0) {
      floatingCta.classList.add('visible');
    } else {
      floatingCta.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* =============================================
   CONTACT FORM VALIDATION & SUBMISSION
   ============================================= */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  const emailInput = document.getElementById('email');
  const gdprCheckbox = document.getElementById('gdpr');
  const submitBtn = document.getElementById('submitBtn');
  const formSuccess = document.getElementById('formSuccess');

  const showError = (inputId, message) => {
    const errorEl = document.getElementById(`${inputId}Error`);
    const inputEl = document.getElementById(inputId);
    if (errorEl) errorEl.textContent = message;
    if (inputEl) inputEl.classList.add('error');
  };

  const clearError = (inputId) => {
    const errorEl = document.getElementById(`${inputId}Error`);
    const inputEl = document.getElementById(inputId);
    if (errorEl) errorEl.textContent = '';
    if (inputEl) inputEl.classList.remove('error');
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^[\+\d\s\-\(\)]{7,}$/.test(phone.trim());
  };

  // Real-time validation
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      if (nameInput.value.trim().length >= 2) clearError('name');
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      if (validatePhone(phoneInput.value)) clearError('phone');
    });
  }

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      if (validateEmail(emailInput.value)) clearError('email');
    });
  }

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;

    // Validate name
    if (!nameInput || nameInput.value.trim().length < 2) {
      showError('name', 'Моля, въведете Вашето пълно име.');
      isValid = false;
    } else {
      clearError('name');
    }

    // Validate phone
    if (!phoneInput || !validatePhone(phoneInput.value)) {
      showError('phone', 'Моля, въведете валиден телефонен номер.');
      isValid = false;
    } else {
      clearError('phone');
    }

    // Validate email
    if (!emailInput || !validateEmail(emailInput.value)) {
      showError('email', 'Моля, въведете валиден имейл адрес.');
      isValid = false;
    } else {
      clearError('email');
    }

    // Validate GDPR
    if (!gdprCheckbox || !gdprCheckbox.checked) {
      const gdprError = document.getElementById('gdprError');
      if (gdprError) gdprError.textContent = 'Моля, приемете политиката за поверителност.';
      isValid = false;
    } else {
      const gdprError = document.getElementById('gdprError');
      if (gdprError) gdprError.textContent = '';
    }

    if (!isValid) return;

    // Submit form
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Изпращане...';

    const formAction = form.getAttribute('action');

    // Check if Formspree is configured (not placeholder)
    if (formAction && !formAction.includes('YOUR_FORM_ID')) {
      try {
        const formData = new FormData(form);
        const response = await fetch(formAction, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          form.reset();
          if (formSuccess) formSuccess.classList.add('visible');
          submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Изпратено!';
        } else {
          throw new Error('Server error');
        }
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Изпрати запитване';
        alert('Възникна грешка. Моля, опитайте отново или се свържете с нас по телефон.');
      }
    } else {
      // Fallback: mailto link
      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const email = emailInput.value.trim();
      const service = document.getElementById('service')?.value || '';
      const message = document.getElementById('message')?.value.trim() || '';

      const mailtoBody = encodeURIComponent(
        `Запитване от: ${name}\nТелефон: ${phone}\nИмейл: ${email}\nУслуга: ${service}\n\nСъобщение:\n${message}`
      );

      window.location.href = `mailto:info@arviacapital.bg?subject=Запитване за ${service || 'консултация'}&body=${mailtoBody}`;

      form.reset();
      if (formSuccess) formSuccess.classList.add('visible');
      submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Изпратено!';
    }
  });
}

/* =============================================
   SCROLL ANIMATIONS (Fade In)
   ============================================= */
function initScrollAnimations() {
  const animatables = document.querySelectorAll(
    '.service-card, .about__feature, .process__step, .testimonial-card, .stats__item'
  );

  if (!animatables.length) return;

  // Add initial styles
  animatables.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.6s ease ${(index % 4) * 0.1}s, transform 0.6s ease ${(index % 4) * 0.1}s`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  animatables.forEach(el => observer.observe(el));
}
