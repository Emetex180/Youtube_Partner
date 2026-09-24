/* ==========================================================================
   Creator Partner — Channel Review (fictional demo)

   This script drives UI state only:

   • It makes no network requests of any kind.
   • It never reads, stores, transmits, or logs credentials. The password
     input in the demo form is deliberately never touched by this file — the
     value is not read on submit, not on input, and not anywhere else.
   • Every affordance that looks like authentication ("Send", "Continue with
     Google") is a clearly labelled simulation.
   ========================================================================== */
(() => {
  'use strict';

  /* --- environment ------------------------------------------------------ */
  const root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- helpers ---------------------------------------------------------- */
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const setStatus = (element, message, tone) => {
    if (!element) return;
    element.textContent = message || '';
    element.classList.remove('field-status--error', 'field-status--ok');
    if (tone) element.classList.add(`field-status--${tone}`);
    element.hidden = !message;
  };

  /* --- 1. Footer year --------------------------------------------------- */
  const yearSlot = document.getElementById('year');
  if (yearSlot) yearSlot.textContent = String(new Date().getFullYear());

  /* --- 2. Toasts -------------------------------------------------------- */
  const toastStack = document.getElementById('toastStack');

  const toast = (message) => {
    if (!toastStack) return;

    const note = document.createElement('div');
    note.className = 'toast-note';
    note.setAttribute('role', 'status');

    const icon = document.createElement('i');
    icon.className = 'bi bi-info-circle';
    icon.setAttribute('aria-hidden', 'true');

    const text = document.createElement('span');
    text.textContent = message;

    note.append(icon, text);
    toastStack.append(note);

    window.setTimeout(() => {
      note.classList.add('is-leaving');
      window.setTimeout(() => note.remove(), 400);
    }, 4200);
  };

  /* --- 3. Progressive checklist reveal ---------------------------------- */
  const checklistItems = Array.from(document.querySelectorAll('.checklist__item'));

  if (checklistItems.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      checklistItems.forEach((item) => item.classList.add('is-visible'));
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

      checklistItems.forEach((item) => observer.observe(item));
    }
  }

  /* --- 4. Account form (demo only — nothing is ever submitted) ---------- */
  const accountForm = document.getElementById('accountForm');
  const emailInput = document.getElementById('email');
  const emailError = document.getElementById('emailError');
  const formStatus = document.getElementById('formStatus');

  if (accountForm) {
    accountForm.addEventListener('submit', (event) => {
      // There is no endpoint and no backend: the form never submits. Note that
      // #password is intentionally absent here — no code path reads its value.
      event.preventDefault();

      const value = emailInput ? emailInput.value.trim() : '';

      if (!EMAIL_PATTERN.test(value)) {
        if (emailInput) {
          emailInput.setAttribute('aria-invalid', 'true');
          emailInput.focus();
        }
        setStatus(emailError, 'Enter a valid email address to continue.', 'error');
        setStatus(formStatus, '', null);
        return;
      }

      if (emailInput) emailInput.setAttribute('aria-invalid', 'false');
      setStatus(emailError, '', null);
      setStatus(
        formStatus,
        'Demo only — nothing was sent. This prototype has no backend and collects no credentials.',
        'ok'
      );
    });

    if (emailInput) {
      emailInput.addEventListener('input', () => {
        const value = emailInput.value.trim();
        if (value && EMAIL_PATTERN.test(value)) {
          emailInput.setAttribute('aria-invalid', 'false');
          setStatus(emailError, '', null);
        }
      });
    }
  }

  /* --- 5. Simulated OAuth hand-off -------------------------------------- */
  const googleButton = document.getElementById('googleBtn');

  if (googleButton) {
    googleButton.addEventListener('click', () => {
      toast('Demo only: a real integration would hand off to Google OAuth here. No account is connected.');
    });
  }

  /* --- 6. Placeholder links --------------------------------------------- */
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const link = target.closest('[data-demo-link]');
    if (!link) return;

    event.preventDefault();
    toast(`“${link.textContent.trim()}” is a placeholder link in this prototype.`);
  });

  /* --- 7. Start Channel Review ------------------------------------------ */
  const startButton = document.getElementById('startReview');
  const reviewPanel = document.getElementById('reviewStatus');
  const stepper = document.querySelector('.stepper');

  const renderReviewPanel = () => {
    if (!reviewPanel) return;

    reviewPanel.replaceChildren();

    const iconWrap = document.createElement('span');
    iconWrap.className = 'status-panel__icon';
    const iconGlyph = document.createElement('i');
    iconGlyph.className = 'bi bi-check-lg';
    iconGlyph.setAttribute('aria-hidden', 'true');
    iconWrap.append(iconGlyph);

    const body = document.createElement('div');

    const title = document.createElement('p');
    title.className = 'status-panel__title';
    title.textContent = 'Review request prepared';

    const copy = document.createElement('p');
    copy.className = 'status-panel__body';
    copy.textContent =
      'Your channel information is queued for an eligibility check. This is a demo — ' +
      'no request was created and nothing was sent anywhere.';

    const actions = document.createElement('div');
    actions.className = 'status-panel__actions';

    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'btn btn-quiet';
    reset.textContent = 'Run the demo again';
    reset.addEventListener('click', () => {
      reviewPanel.hidden = true;
      if (startButton) startButton.focus();
    });
    actions.append(reset);

    body.append(title, copy, actions);
    reviewPanel.append(iconWrap, body);
    reviewPanel.hidden = false;
    reviewPanel.focus();
  };

  if (startButton) {
    const label = startButton.querySelector('.btn__label');
    const idleLabel = label ? label.textContent : 'Start Channel Review';
    const loadingLabel = startButton.dataset.loadingText || 'Preparing your channel review…';

    startButton.addEventListener('click', () => {
      if (startButton.classList.contains('is-loading')) return;

      startButton.classList.add('is-loading');
      startButton.setAttribute('aria-busy', 'true');
      startButton.disabled = true;
      if (label) label.textContent = loadingLabel;
      if (stepper) stepper.classList.add('is-working');
      if (reviewPanel) reviewPanel.hidden = true;

      window.setTimeout(() => {
        startButton.classList.remove('is-loading');
        startButton.removeAttribute('aria-busy');
        startButton.disabled = false;
        if (label) label.textContent = idleLabel;
        if (stepper) stepper.classList.remove('is-working');
        renderReviewPanel();
      }, prefersReducedMotion ? 450 : 1800);
    });
  }
})();
