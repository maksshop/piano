// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.getElementById('site-nav');
if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// Smooth scroll for on-page anchors
document.addEventListener('click', (e) => {
  const target = e.target;
  if (!(target instanceof Element)) return;
  if (target.matches('a[href^="#"]')) {
    const id = target.getAttribute('href');
    const el = id ? document.querySelector(id) : null;
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // close mobile nav after click
      if (siteNav && siteNav.classList.contains('open') && navToggle) {
        siteNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    }
  }
});

// Accordion
const accordionTriggers = document.querySelectorAll('.accordion-trigger');
accordionTriggers.forEach((btn) => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    const panel = btn.nextElementSibling;
    if (panel instanceof HTMLElement) {
      panel.hidden = expanded;
    }
  });
});

// Contact form removed per request

// Manual hover activation for hero highlight chips
const highlights = document.querySelectorAll('.hero-highlights li');
highlights.forEach((li) => {
  li.addEventListener('mouseenter', () => {
    highlights.forEach((item) => item.classList.remove('active'));
    li.classList.add('active');
  });
  li.addEventListener('mouseleave', () => {
    li.classList.remove('active');
  });
});

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}


