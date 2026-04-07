/* =============================================
   ARVIA CAPITAL - SCRIPT.JS
   Cross-browser compatible: Chrome, Firefox, Edge, Safari (iOS/Android)
   ============================================= */

'use strict';

// ---- DOM Ready ----
document.addEventListener('DOMContentLoaded', function() {
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
  var header = document.getElementById('header');
  if (!header) return;

  var onScroll = function() {
    if (window.pageYOffset > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, supportsPassive() ? { passive: true } : false);
  onScroll();
}

/* =============================================
   MOBILE NAVIGATION — iOS-safe scroll lock
   ============================================= */
function initMobileNav() {
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobileNav');
  var mobileNavClose = document.getElementById('mobileNavClose');
  var mobileLinks = document.querySelectorAll('.mobile-nav__link, .mobile-nav__cta');

  if (!hamburger || !mobileNav) return;

  var scrollY = 0;

  var openNav = function() {
    // iOS-safe scroll lock: record position, fix body
    scrollY = window.pageYOffset;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + scrollY + 'px';
    document.body.style.width = '100%';
    document.body.style.overflowY = 'scroll';

    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden', 'false');
  };

  var closeNav = function() {
    // Restore scroll position
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflowY = '';
    window.scrollTo(0, scrollY);

    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
  };

  hamburger.addEventListener('click', function() {
    if (mobileNav.classList.contains('open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', closeNav);
  }

  // Close on link click
  for (var i = 0; i < mobileLinks.length; i++) {
    mobileLinks[i].addEventListener('click', closeNav);
  }

  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    var key = e.key || e.keyCode;
    if ((key === 'Escape' || key === 'Esc' || key === 27) && mobileNav.classList.contains('open')) {
      closeNav();
    }
  });

  // Close on overlay click (outside nav content)
  mobileNav.addEventListener('click', function(e) {
    if (e.target === mobileNav) {
      closeNav();
    }
  });
}

/* =============================================
   SMOOTH SCROLL — cross-browser safe
   ============================================= */
function initSmoothScroll() {
  var headerHeight = getHeaderHeight();

  var anchors = document.querySelectorAll('a[href^="#"]');

  for (var i = 0; i < anchors.length; i++) {
    anchors[i].addEventListener('click', function(e) {
      var targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      var targetPosition = getOffsetTop(target) - headerHeight;

      // Use native smooth scroll if supported, otherwise polyfill
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      } else {
        smoothScrollTo(targetPosition, 600);
      }
    });
  }
}

// Polyfill for smooth scroll
function smoothScrollTo(targetY, duration) {
  var startY = window.pageYOffset;
  var diff = targetY - startY;
  var startTime = null;

  function step(currentTime) {
    if (!startTime) startTime = currentTime;
    var elapsed = currentTime - startTime;
    var progress = Math.min(elapsed / duration, 1);
    // Ease in-out quad
    var eased = progress < 0.5
      ? 2 * progress * progress
      : -1 + (4 - 2 * progress) * progress;

    window.scrollTo(0, startY + diff * eased);

    if (elapsed < duration) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// Get element offset from top of document (cross-browser)
function getOffsetTop(el) {
  var top = 0;
  while (el) {
    top += el.offsetTop || 0;
    el = el.offsetParent;
  }
  return top;
}

function getHeaderHeight() {
  var header = document.getElementById('header');
  return header ? header.offsetHeight : 72;
}

/* =============================================
   ACTIVE NAV LINKS
   ============================================= */
function initActiveNavLinks() {
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav__link');

  if (!sections.length || !navLinks.length) return;

  // Use IntersectionObserver if available, else scroll fallback
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function(link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0
    });

    sections.forEach(function(section) {
      observer.observe(section);
    });
  } else {
    // Fallback: scroll-based active link
    window.addEventListener('scroll', function() {
      var scrollPos = window.pageYOffset + getHeaderHeight() + 50;
      sections.forEach(function(section) {
        var top = getOffsetTop(section);
        var bottom = top + section.offsetHeight;
        if (scrollPos >= top && scrollPos < bottom) {
          var id = section.getAttribute('id');
          navLinks.forEach(function(link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('active');
            }
          });
        }
      });
    }, supportsPassive() ? { passive: true } : false);
  }
}

/* =============================================
   STATS COUNTER ANIMATION
   ============================================= */
function initStatsCounter() {
  var statsNumbers = document.querySelectorAll('.stats__number[data-target]');
  if (!statsNumbers.length) return;

  var animateCounter = function(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var duration = 2000;
    var startTime = null;

    var update = function(currentTime) {
      if (!startTime) startTime = currentTime;
      var elapsed = currentTime - startTime;
      var progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    };

    requestAnimationFrame(update);
  };

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statsNumbers.forEach(function(el) {
      observer.observe(el);
    });
  } else {
    // Fallback: animate all immediately
    statsNumbers.forEach(function(el) {
      animateCounter(el);
    });
  }
}

/* =============================================
   FLOATING CTA VISIBILITY
   ============================================= */
function initFloatingCTA() {
  var floatingCta = document.getElementById('floatingCta');
  if (!floatingCta) return;

  var heroSection = document.getElementById('hero');

  var onScroll = function() {
    if (!heroSection) {
      floatingCta.classList.add('visible');
      return;
    }

    var heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
    var scrollPos = window.pageYOffset;

    if (scrollPos > heroBottom - 100) {
      floatingCta.classList.add('visible');
    } else {
      floatingCta.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', onScroll, supportsPassive() ? { passive: true } : false);
  onScroll();
}

/* =============================================
   CONTACT FORM VALIDATION & SUBMISSION
   ============================================= */
function initContactForm() {
  var form = document.getElementById('contactForm');
  if (!form) return;

  var nameInput = document.getElementById('name');
  var phoneInput = document.getElementById('phone');
  var emailInput = document.getElementById('email');
  var gdprCheckbox = document.getElementById('gdpr');
  var submitBtn = document.getElementById('submitBtn');
  var formSuccess = document.getElementById('formSuccess');

  var showError = function(inputId, message) {
    var errorEl = document.getElementById(inputId + 'Error');
    var inputEl = document.getElementById(inputId);
    if (errorEl) errorEl.textContent = message;
    if (inputEl) inputEl.classList.add('error');
  };

  var clearError = function(inputId) {
    var errorEl = document.getElementById(inputId + 'Error');
    var inputEl = document.getElementById(inputId);
    if (errorEl) errorEl.textContent = '';
    if (inputEl) inputEl.classList.remove('error');
  };

  var validateEmail = function(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  var validatePhone = function(phone) {
    return /^[\+\d\s\-\(\)]{7,}$/.test(phone.trim());
  };

  // Real-time validation
  if (nameInput) {
    nameInput.addEventListener('input', function() {
      if (nameInput.value.trim().length >= 2) clearError('name');
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', function() {
      if (validatePhone(phoneInput.value)) clearError('phone');
    });
  }

  if (emailInput) {
    emailInput.addEventListener('input', function() {
      if (validateEmail(emailInput.value)) clearError('email');
    });
  }

  // Form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var isValid = true;

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
      var gdprError = document.getElementById('gdprError');
      if (gdprError) gdprError.textContent = 'Моля, приемете политиката за поверителност.';
      isValid = false;
    } else {
      var gdprErr = document.getElementById('gdprError');
      if (gdprErr) gdprErr.textContent = '';
    }

    if (!isValid) return;

    // Submit
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Изпращане...';

    var formAction = form.getAttribute('action');

    // Check if Formspree is configured
    if (formAction && formAction.indexOf('YOUR_FORM_ID') === -1 && formAction.indexOf('formspree') !== -1) {
      // Use fetch if available, else XMLHttpRequest
      if (typeof fetch !== 'undefined') {
        var formData = new FormData(form);
        fetch(formAction, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        })
        .then(function(response) {
          if (response.ok) {
            onFormSuccess();
          } else {
            onFormError();
          }
        })
        .catch(function() {
          onFormError();
        });
      } else {
        // XMLHttpRequest fallback for older browsers
        var xhr = new XMLHttpRequest();
        xhr.open('POST', formAction, true);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              onFormSuccess();
            } else {
              onFormError();
            }
          }
        };
        xhr.send(new FormData(form));
      }
    } else {
      // Mailto fallback
      var name = nameInput ? nameInput.value.trim() : '';
      var phone = phoneInput ? phoneInput.value.trim() : '';
      var email = emailInput ? emailInput.value.trim() : '';
      var serviceEl = document.getElementById('service');
      var service = serviceEl ? serviceEl.value : '';
      var messageEl = document.getElementById('message');
      var message = messageEl ? messageEl.value.trim() : '';

      var mailtoBody = encodeURIComponent(
        'Запитване от: ' + name +
        '\nТелефон: ' + phone +
        '\nИмейл: ' + email +
        '\nУслуга: ' + service +
        '\n\nСъобщение:\n' + message
      );

      window.location.href = 'mailto:info@arviacapital.bg?subject=' +
        encodeURIComponent('Запитване за ' + (service || 'консултация')) +
        '&body=' + mailtoBody;

      onFormSuccess();
    }

    function onFormSuccess() {
      form.reset();
      if (formSuccess) formSuccess.classList.add('visible');
      submitBtn.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> Изпратено!';
      // Scroll to success message
      if (formSuccess) {
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    function onFormError() {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Изпрати запитване';
      alert('Възникна грешка. Моля, опитайте отново или се свържете с нас по телефон.');
    }
  });
}

/* =============================================
   SCROLL ANIMATIONS (Fade In)
   Cross-browser: IntersectionObserver + fallback
   ============================================= */
function initScrollAnimations() {
  var animatables = document.querySelectorAll(
    '.service-card, .about__feature, .process__step, .testimonial-card, .stats__item'
  );

  if (!animatables.length) return;

  // Apply initial hidden state
  var items = Array.prototype.slice.call(animatables);
  items.forEach(function(el, index) {
    el.style.opacity = '0';
    el.style.webkitTransform = 'translateY(24px)';
    el.style.transform = 'translateY(24px)';
    var delay = (index % 4) * 0.1;
    el.style.webkitTransition = 'opacity 0.6s ease ' + delay + 's, -webkit-transform 0.6s ease ' + delay + 's';
    el.style.transition = 'opacity 0.6s ease ' + delay + 's, transform 0.6s ease ' + delay + 's';
  });

  var reveal = function(el) {
    el.style.opacity = '1';
    el.style.webkitTransform = 'translateY(0)';
    el.style.transform = 'translateY(0)';
  };

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    items.forEach(function(el) {
      observer.observe(el);
    });
  } else {
    // Fallback: reveal all on scroll
    var revealed = [];

    var checkVisibility = function() {
      var windowHeight = window.innerHeight || document.documentElement.clientHeight;
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      items.forEach(function(el, i) {
        if (revealed[i]) return;
        var top = getOffsetTop(el);
        if (scrollTop + windowHeight > top + 40) {
          reveal(el);
          revealed[i] = true;
        }
      });
    };

    window.addEventListener('scroll', checkVisibility, supportsPassive() ? { passive: true } : false);
    checkVisibility();
  }
}

/* =============================================
   UTILITY: Passive event listener detection
   ============================================= */
function supportsPassive() {
  var supported = false;
  try {
    var opts = Object.defineProperty({}, 'passive', {
      get: function() { supported = true; return true; }
    });
    window.addEventListener('testPassive', null, opts);
    window.removeEventListener('testPassive', null, opts);
  } catch (e) {}
  return supported;
}
