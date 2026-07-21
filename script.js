/* =========================================================================
   Име Фамилия — Консултации за инвестиции в имоти
   script.js — Vanilla JS (ES6+), изцяло client-side, без зависимости
   ========================================================================= */
'use strict';

(() => {
  /* =======================================================================
     ДОПУСКАНИЯ (прозрачни константи — лесни за редакция)
     ======================================================================= */
  const ASSUMPTIONS = {
    brrrrAnnualRate: 0.055, // 5.5% годишна лихва (ориентир за паричния поток)
    brrrrTermYears: 25      // 25 години срок на кредита
  };

  const MESSAGES = {
    empty: 'Моля, въведете стойност.',
    positive: 'Стойността трябва да е по-голяма от 0.'
  };

  /* =======================================================================
     ПОМОЩНИЦИ — форматиране (локализация bg-BG)
     ======================================================================= */
  const moneyFmt = new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'BGN', maximumFractionDigits: 0 });
  const percentFmt = new Intl.NumberFormat('bg-BG', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 2 });
  const yearsFmt = new Intl.NumberFormat('bg-BG', { maximumFractionDigits: 1 });

  const utils = {
    num(value) {
      if (value === null || value === undefined) return NaN;
      const cleaned = String(value).trim().replace(/\s/g, '').replace(',', '.');
      if (cleaned === '') return NaN;
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : NaN;
    },
    fieldNum(form, name) {
      const el = form.elements[name];
      if (!el) return 0;
      const n = utils.num(el.value);
      return Number.isFinite(n) ? n : 0;
    },
    money(n) { return Number.isFinite(n) ? moneyFmt.format(Math.round(n)) : '—'; },
    percent(ratio) { return Number.isFinite(ratio) ? percentFmt.format(ratio) : '—'; },
    years(y) { return (Number.isFinite(y) && y > 0) ? `${yearsFmt.format(y)} г.` : '—'; },
    monthlyPayment(loan, annualRate, years) {
      if (!(loan > 0) || !(years > 0)) return 0;
      const c = annualRate / 12;
      const n = years * 12;
      if (c === 0) return loan / n;
      return (loan * c) / (1 - Math.pow(1 + c, -n));
    },
    tone(value) {
      if (!Number.isFinite(value) || value === 0) return 'neutral';
      return value > 0 ? 'positive' : 'negative';
    }
  };

  /* =======================================================================
     КОНФИГУРАЦИЯ НА КАЛКУЛАТОРИТЕ (data-driven)
     Всеки: required[] + compute() -> { outputs:{key:{text,tone}}, summary, warn }
     Ключовете в outputs съответстват на id="<calc>-out-<key>".
     ======================================================================= */
  const CALCULATORS = {

    /* ---------- 1) Купи, задръж и отдавай ---------- */
    rent: {
      required: ['price', 'capital', 'rent'],
      compute(f) {
        const price    = utils.fieldNum(f, 'price');
        const capital  = utils.fieldNum(f, 'capital');
        const rent     = utils.fieldNum(f, 'rent');
        const costs    = utils.fieldNum(f, 'costs');
        const mortgage = utils.fieldNum(f, 'mortgage');

        const monthlyCashflow = rent - costs - mortgage;
        const annualCashflow  = monthlyCashflow * 12;
        const grossYield = (rent * 12) / price;
        const netYield   = ((rent - costs) * 12) / price;
        const roi        = annualCashflow / capital;
        const payback    = annualCashflow > 0 ? capital / annualCashflow : NaN;

        let summary, warn = false;
        if (monthlyCashflow > 0) {
          summary = `При тези числа имотът носи положителен паричен поток от ${utils.money(monthlyCashflow)} на месец и възвръщаемост на вложения капитал около ${utils.percent(roi)} годишно. Вложеният капитал се изплаща за ~${utils.years(payback)}.`;
        } else {
          warn = true;
          summary = `Внимание: при тези числа месечните разходи и вноската изпреварват наема (${utils.money(monthlyCashflow)}/мес.). Имотът може да поскъпва, но не се самоиздържа — обмислете по-голямо самоучастие или по-ниски разходи.`;
        }

        return {
          outputs: {
            cashflow: { text: utils.money(monthlyCashflow), tone: utils.tone(monthlyCashflow) },
            gross:    { text: utils.percent(grossYield),    tone: 'neutral' },
            net:      { text: utils.percent(netYield),      tone: 'neutral' },
            roi:      { text: utils.percent(roi),           tone: utils.tone(roi) },
            payback:  { text: utils.years(payback),         tone: 'neutral' }
          },
          summary, warn
        };
      }
    },

    /* ---------- 2) Купи, ремонтирай, продай (Fix & Flip) ---------- */
    flip: {
      required: ['purchase', 'sale'],
      compute(f) {
        const purchase    = utils.fieldNum(f, 'purchase');
        const renovation  = utils.fieldNum(f, 'renovation');
        const holding     = utils.fieldNum(f, 'holding');
        const transaction = utils.fieldNum(f, 'transaction');
        const sale        = utils.fieldNum(f, 'sale');

        const invested = purchase + renovation + holding + transaction;
        const profit   = sale - invested;
        const roi      = invested > 0 ? profit / invested : NaN;
        const margin   = sale > 0 ? profit / sale : NaN;

        let summary, warn = false;
        if (profit > 0) {
          summary = `Очаквана нетна печалба ${utils.money(profit)} при обща инвестиция ${utils.money(invested)} — възвръщаемост около ${utils.percent(roi)}. Заложете резерв за непредвидени разходи и по-дълъг период до продажба.`;
        } else {
          warn = true;
          summary = `При тези числа сделката е на загуба (${utils.money(profit)}). Продажната цена не покрива покупката, ремонта и разходите — потърсете по-ниска цена на вход или по-реалистична продажна оценка.`;
        }

        return {
          outputs: {
            profit: { text: utils.money(profit),   tone: utils.tone(profit) },
            roi:    { text: utils.percent(roi),    tone: utils.tone(roi) },
            margin: { text: utils.percent(margin), tone: utils.tone(margin) }
          },
          summary, warn
        };
      }
    },

    /* ---------- 3) BRRRR ---------- */
    brrrr: {
      required: ['purchase', 'arv', 'rent'],
      compute(f) {
        const purchase   = utils.fieldNum(f, 'purchase');
        const renovation = utils.fieldNum(f, 'renovation');
        const arv        = utils.fieldNum(f, 'arv');
        let   ltv        = utils.fieldNum(f, 'ltv');
        const rent       = utils.fieldNum(f, 'rent');

        ltv = Math.min(Math.max(ltv, 0), 100);

        const invested    = purchase + renovation;
        const refinance    = arv * (ltv / 100);
        const pulledOut   = Math.min(refinance, invested);
        const capitalLeft = Math.max(invested - refinance, 0);

        const payment  = utils.monthlyPayment(refinance, ASSUMPTIONS.brrrrAnnualRate, ASSUMPTIONS.brrrrTermYears);
        const cashflow = rent - payment;
        const recoveryPct = invested > 0 ? pulledOut / invested : NaN;

        let summary, warn = false;
        if (capitalLeft <= 0) {
          summary = `Отлично: рефинансирането връща целия вложен капитал (${utils.money(pulledOut)}). Оставащ капитал в сделката: 0 лв. — можете да го използвате за следващ имот. Ориентировъчен паричен поток: ${utils.money(cashflow)}/мес. (при ${utils.percent(ASSUMPTIONS.brrrrAnnualRate)} лихва).`;
        } else {
          warn = true;
          summary = `Рефинансирането връща ${utils.money(pulledOut)} (≈${utils.percent(recoveryPct)} от вложеното). В сделката остават ${utils.money(capitalLeft)} капитал. Ориентировъчен паричен поток: ${utils.money(cashflow)}/мес. — за пълно „изваждане“ е нужна по-висока оценка (ARV) или LTV.`;
        }

        return {
          outputs: {
            pulled:   { text: utils.money(pulledOut),   tone: utils.tone(pulledOut) },
            left:     { text: utils.money(capitalLeft), tone: capitalLeft > 0 ? 'negative' : 'positive' },
            cashflow: { text: utils.money(cashflow),    tone: utils.tone(cashflow) }
          },
          summary, warn
        };
      }
    }
  };

  /* =======================================================================
     ДВИГАТЕЛ НА КАЛКУЛАТОРИТЕ
     ======================================================================= */
  function initCalculators() {
    document.querySelectorAll('[data-calc]').forEach((root) => {
      const name = root.dataset.calc;
      const config = CALCULATORS[name];
      const form = root.querySelector('.calc__form');
      if (!config || !form) return;

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validate(form, config.required)) return;
        const { outputs, summary, warn } = config.compute(form);
        renderOutputs(name, outputs);
        renderSummary(root, summary, warn);

        // Носи резултата на екрана (без scrollIntoView) + a11y фокус
        const heading = root.querySelector('.calc__results-title');
        if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: false }); }
      });

      form.addEventListener('reset', () => { clearErrors(form); resetOutputs(root); });
    });
  }

  function validate(form, required) {
    clearErrors(form);
    let firstInvalid = null;
    required.forEach((name) => {
      const el = form.elements[name];
      if (!el) return;
      const v = utils.num(el.value);
      if (!Number.isFinite(v)) { markError(el, MESSAGES.empty); firstInvalid ??= el; }
      else if (v <= 0)         { markError(el, MESSAGES.positive); firstInvalid ??= el; }
    });
    if (firstInvalid) { firstInvalid.focus({ preventScroll: true }); return false; }
    return true;
  }

  function markError(input, msg) {
    input.setAttribute('aria-invalid', 'true');
    const field = input.closest('.field');
    field?.classList.add('is-invalid');
    const err = field?.querySelector('.field__error');
    if (err) err.textContent = msg;
  }

  function clearErrors(form) {
    form.querySelectorAll('.field.is-invalid').forEach((f) => {
      f.classList.remove('is-invalid');
      f.querySelector('input, select')?.setAttribute('aria-invalid', 'false');
      const err = f.querySelector('.field__error');
      if (err) err.textContent = '';
    });
  }

  function renderOutputs(calcName, outputs) {
    Object.entries(outputs).forEach(([key, { text, tone }]) => {
      const out = document.getElementById(`${calcName}-out-${key}`);
      if (!out) return;
      out.textContent = text;
      out.classList.remove('is-positive', 'is-negative');
      if (tone === 'positive') out.classList.add('is-positive');
      else if (tone === 'negative') out.classList.add('is-negative');
    });
  }

  function renderSummary(root, text, warn) {
    const panel = root.querySelector('.calc__results');
    if (!panel || !text) return;
    let el = panel.querySelector('.calc__summary');
    if (!el) {
      el = document.createElement('p');
      el.className = 'calc__summary';
      const cta = panel.querySelector('.btn');
      panel.insertBefore(el, cta || null);
    }
    el.textContent = text;
    el.classList.toggle('calc__summary--warn', !!warn);
  }

  function resetOutputs(root) {
    root.querySelectorAll('.results__value').forEach((out) => {
      out.textContent = '—';
      out.classList.remove('is-positive', 'is-negative');
    });
    root.querySelector('.calc__summary')?.remove();
  }

  /* =======================================================================
     МИНИ-КАЛКУЛАТОР (начална страница) — live
     ======================================================================= */
  function initMiniCalc() {
    const form = document.getElementById('miniCalcForm');
    const output = document.getElementById('miniCalcOutput');
    if (!form || !output) return;

    const update = () => {
      const capital = utils.num(form.elements['capital']?.value);
      const yieldPct = utils.num(form.elements['yield']?.value);
      if (!Number.isFinite(capital) || capital <= 0 || !Number.isFinite(yieldPct)) {
        output.textContent = '—';
        return;
      }
      output.textContent = utils.money(capital * (yieldPct / 100));
    };

    form.addEventListener('input', update);
    form.addEventListener('submit', (e) => { e.preventDefault(); update(); });
    update();
  }

  /* =======================================================================
     НАВИГАЦИЯ — мобилно меню (hamburger)
     ======================================================================= */
  function initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('primary-menu');
    if (!toggle || !menu) return;

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Затвори менюто' : 'Отвори менюто');
      menu.classList.toggle('is-open', open);
    };

    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  /* =======================================================================
     UX: фокус върху първото поле при клик към калкулатор
     ======================================================================= */
  function initCalcLinks() {
    document.querySelectorAll('a[href^="#calc-"]').forEach((link) => {
      link.addEventListener('click', () => {
        const target = document.querySelector(link.getAttribute('href'));
        const input = target?.querySelector('input');
        if (input) setTimeout(() => input.focus({ preventScroll: true }), 450);
      });
    });
  }

  /* =======================================================================
     ФОРМИ — валидация + демо режим за PLACEHOLDER endpoint
     ======================================================================= */
  function initForms() {
    document.querySelectorAll('form[action]').forEach((form) => {
      const status = form.querySelector('.form__status');
      form.addEventListener('submit', (e) => {
        if (!form.checkValidity()) {
          e.preventDefault();
          form.reportValidity();
          return;
        }
        if (form.action.includes('PLACEHOLDER')) {
          e.preventDefault();
          if (status) {
            status.textContent = 'Благодарим! Съобщението е получено (демо режим). Свържете реален адрес за изпращане.';
            status.classList.remove('is-error');
            status.classList.add('is-success');
          }
          form.reset();
        }
        // Иначе: нормално изпращане към Formspree/Netlify Forms
      });
    });
  }

  /* =======================================================================
     COOKIE CONSENT — само необходими бисквитки (localStorage флаг)
     ======================================================================= */
  function initCookies() {
    const box = document.getElementById('cookieConsent');
    if (!box) return;
    const KEY = 'cookie-consent-v1';
    let stored = null;
    try { stored = localStorage.getItem(KEY); } catch (_) {}

    if (!stored) box.hidden = false;

    box.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cookie]');
      if (!btn) return;
      try { localStorage.setItem(KEY, btn.dataset.cookie); } catch (_) {}
      box.hidden = true;
    });
  }

  /* =======================================================================
     ДРЕБНИ ДЕТАЙЛИ
     ======================================================================= */
  function initYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* =======================================================================
     СТАРТ
     ======================================================================= */
  function init() {
    initNav();
    initYear();
    initMiniCalc();
    initCalculators();
    initCalcLinks();
    initForms();
    initCookies();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
