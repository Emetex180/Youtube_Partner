# Creator Partner — Channel Review (demo)

A fictional, front-end-only onboarding page for a made-up "Creator Partner Program".

**This is not Google and not YouTube.** It has no backend, makes no network requests, and never
collects credentials — the password field exists purely as a visual element and is never read by
any code path. Do not enter real credentials anywhere in this prototype.

## Files

```
/index.html              markup (semantic HTML5, Bootstrap 5 grid + utilities)
/css/style.css           custom design system layered on top of Bootstrap
/js/app.js               UI state only — no requests, no storage
/assets/logo.svg         fictional "Creator Partner" mark (shield + play, not a Google logo)
/assets/favicon.svg      favicon
/assets/channel-avatar.svg  placeholder channel avatar
```

## Run it locally

**Option A — just open it.** Double-click `index.html`, or drag it into a browser. Everything works
from the filesystem (`file://`).

**Option B — a local web server** (closer to a real deployment):

```powershell
# Python 3
cd C:\Users\USER\Desktop\Youtube_Partner
python -m http.server 5500
# then open http://localhost:5500
```

```powershell
# Node
npx serve .
```

**Option C — VS Code:** install the *Live Server* extension, right-click `index.html`, choose
"Open with Live Server".

> Bootstrap, Bootstrap Icons and the Inter font load from a CDN, so the first load needs an internet
> connection. The page still renders usable (with fallback system fonts and unstyled grid) offline.

## What is interactive

| Element | Behaviour |
| --- | --- |
| `Send` | Validates the email field locally, then states that nothing was sent. |
| `Continue with Google` | Shows a "demo only" notice. No OAuth is wired up. |
| `Start Channel Review` | Button loading state ("Preparing your channel review…"), then a confirmation panel. |
| Privacy / Terms / Help | Placeholder notices. |
| Checklist | Staggered reveal on scroll (skipped under `prefers-reduced-motion`). |

## Accessibility

Skip link, landmark structure (`header` / `nav` / `main` / `aside` / `footer`), `aria-current` on the
active step, labelled inputs, `aria-invalid` + `role="alert"` on validation errors, polite live regions
for status changes, visible focus rings, and full `prefers-reduced-motion` support.
