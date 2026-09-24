/* ==========================================================================
   Creator Partner — Channel Review (design concept)

   UI state only. This script:

   • makes no network requests of any kind;
   • reads, writes, and stores nothing — no cookies, no localStorage;
   • never touches a credential field, because the page has none. The only
     <input> elements in the project are the contact form's name, email, and
     message — see "Security posture" in README.md.

   The one control that really submits is the contact form, and it does so
   natively: it is a plain <form method="POST"> to FormSubmit and this script
   deliberately does NOT intercept it. The handler in section 7 only paints a
   busy state — it must never call preventDefault().

   Every other affordance ("Start channel review", "Continue with Google",
   Privacy / Terms / Help) is simulated in-page and says so when used.
   ========================================================================== */
(() => {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  const root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- helpers ---------------------------------------------------------- */

  /* Builds an <svg><use href="#i-…"></svg> against the sprite in index.html. */
  const icon = (name, className = 'icon') => {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', className);
    svg.setAttribute('aria-hidden', 'true');

    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', `#i-${name}`);

    svg.append(use);
    return svg;
  };

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  /* --- 1. Footer year --------------------------------------------------- */
  const yearSlot = document.getElementById('year');
  if (yearSlot) yearSlot.textContent = String(new Date().getFullYear());

  /* --- 2. Toasts -------------------------------------------------------- */
  const toastStack = document.getElementById('toastStack');

  const toast = (message) => {
    if (!toastStack) return;

    const note = el('div', 'toast');
    note.setAttribute('role', 'status');
    note.append(icon('info'), el('span', null, message));
    toastStack.append(note);

    window.setTimeout(() => {
      note.classList.add('is-leaving');
      window.setTimeout(() => note.remove(), 360);
    }, 4400);
  };

  /* --- 3. Progressive reveal for the check list ------------------------- */
  const checkItems = Array.from(document.querySelectorAll('.checks__item'));

  if (checkItems.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      checkItems.forEach((item) => item.classList.add('is-visible'));
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

      checkItems.forEach((item) => observer.observe(item));
    }
  }

  /* --- 4. Placeholder links --------------------------------------------- */
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const link = target.closest('[data-demo-link]');
    if (!link) return;

    event.preventDefault();
    const label = link.dataset.demoLabel || link.textContent.trim();
    toast(`“${label}” isn't connected in this demo.`);
  });

  /* --- 5. "Continue with Google" (demo) --------------------------------- */
  /* Deliberately inert. There is no OAuth client, no redirect, and no
     credential field for it to read — so it says that instead of miming a
     sign-in. In a real integration the user would leave this page and
     authenticate on Google's own origin. */
  const googleButton = document.getElementById('googleDemo');

  if (googleButton) {
    googleButton.addEventListener('click', () => {
      toast('No OAuth flow is wired up in this demo. A real one would hand you off to ' +
            'Google’s own sign-in page — this page never sees a password.');
    });
  }

  /* --- 6. Start channel review (simulated) ------------------------------ */
  const startButton = document.getElementById('startReview');
  const statusPanel = document.getElementById('reviewStatus');
  const stepper = document.querySelector('.steps');

  const renderStatus = () => {
    if (!statusPanel) return;

    statusPanel.replaceChildren();

    const iconWrap = el('span', 'status__icon');
    iconWrap.append(icon('check'));

    const body = el('div');

    const actions = el('div', 'status__actions');
    const reset = el('button', 'btn btn--ghost');
    reset.type = 'button';
    reset.append(el('span', 'btn__label', 'Start over'));
    reset.addEventListener('click', () => {
      statusPanel.hidden = true;
      if (startButton) startButton.focus();
    });
    actions.append(reset);

    body.append(
      el('p', 'status__title', 'Review request prepared'),
      el('p', 'status__body',
        'Your channel information is queued for an eligibility check. This page runs entirely ' +
        'in your browser, so nothing was submitted.'),
      actions
    );

    statusPanel.append(iconWrap, body);
    statusPanel.hidden = false;
    statusPanel.focus();
  };

  if (startButton) {
    const label = startButton.querySelector('.btn__label');
    const idleLabel = label ? label.textContent : 'Start channel review';
    const loadingLabel = startButton.dataset.loadingText || 'Preparing your channel review…';

    startButton.addEventListener('click', () => {
      if (startButton.classList.contains('is-loading')) return;

      startButton.classList.add('is-loading');
      startButton.setAttribute('aria-busy', 'true');
      startButton.disabled = true;
      if (label) label.textContent = loadingLabel;
      if (stepper) stepper.classList.add('is-working');
      if (statusPanel) statusPanel.hidden = true;

      window.setTimeout(() => {
        startButton.classList.remove('is-loading');
        startButton.removeAttribute('aria-busy');
        startButton.disabled = false;
        if (label) label.textContent = idleLabel;
        if (stepper) stepper.classList.remove('is-working');
        renderStatus();
      }, prefersReducedMotion ? 450 : 1600);
    });
  }

  /* --- 7. Contact form -------------------------------------------------- */
  /* This is the one real submission on the page: a native POST of name +
     email + message to FormSubmit, which relays them by email.

     There is deliberately NO preventDefault() here. Intercepting the submit
     is what turned an earlier revision of this project into a working
     credential harvester — a single preventDefault() was all that stood
     between a password field and a live inbox. The native submit is the
     whole point of this form, so the handler only paints a busy state and
     gets out of the way.

     Nothing is read, stored, or validated here; the browser's own required /
     type="email" constraints do the validation. */
  const contactForm = document.getElementById('contactForm');
  const contactButton = document.getElementById('contactSubmit');

  if (contactForm && contactButton) {
    contactForm.addEventListener('submit', () => {
      contactButton.classList.add('is-loading');
      contactButton.setAttribute('aria-busy', 'true');

      /* The POST navigates this tab to FormSubmit, so the busy state is only
         visible for the moment before the page unloads. The timer is a
         fallback for the case where the user comes back to this page — via the
         back button, or a restored tab — before it fires. */
      window.setTimeout(() => {
        contactButton.classList.remove('is-loading');
        contactButton.removeAttribute('aria-busy');
      }, 5000);
    });
  }
})();
