# Creator Partner — Channel Review (demo)

A front-end design concept for a creator onboarding flow — a made-up "Creator Partner Program".

**This is not Google and not YouTube.** It is a self-contained static page: no backend, no build
step, no framework. The only thing it loads from the network is the Inter webfont (see
[Offline behaviour](#offline-behaviour)); the only thing it ever *sends* is the contact form, and
only when someone submits it.

## Security posture

**No credential is ever collected.** There is no sign-in, no password field, no OAuth hand-off, and
no authentication input of any kind. The only user data the page handles at all is the contact
form's three fields, described below.

This is deliberate, and it replaced an earlier revision that had drifted from it. That revision
carried an email + password form posting to a third-party relay (`formsubmit.co`) that delivered to
a live inbox. The password input had a `name` attribute, so it was submittable, and the only thing
preventing an actual POST was a single `event.preventDefault()` that held only while the script
loaded and ran. A page wearing "Signed in with Google" chrome and collecting a Google password is a
working phishing page regardless of the banner above it — which is exactly what this project's own
notes had already warned against before the code drifted.

Note what the harm actually was there: **the password field**, not the submission. So the rule below
draws the line at credentials rather than at forms.

### The contact form is the one real submission

`#contact` POSTs three fields — `name`, `email`, `message` — natively to
[FormSubmit](https://formsubmit.co), which relays them by email to the address in the form's `action`.
That is the entire payload. It is a normal static-site contact form, and it is the only thing on the
page that leaves the browser; everything else is simulated locally and says so.

To deploy it: set the destination inbox in the form's `action` in `index.html`. FormSubmit emails
the **first** submission to that address to confirm it, and the form stays inert until that
activation link is clicked — so send one test message through the deployed HTTPS URL before relying
on it.

If you extend this project, **keep it that way**:

- **Never add a credential field.** No password, no Google/YouTube sign-in, not for a demo, not
  "just visually", not disabled, not behind a flag. This is the line, and it is not negotiable.
- **Don't add any form field beyond `name`, `email`, `message`.** No hidden tracking fields, no
  `userId`, no account or channel identifiers. The contact form's payload is exactly three keys.
- Don't add a second submission endpoint. One contact form is the budget; if another flow needs to
  look real, simulate the round trip.
- If this ever grows a real auth flow, use OAuth **redirect** — the user authenticates on the
  provider's own origin. A third-party page never sees the password in a correct OAuth flow.
- Consider FormSubmit's optional `_honey` honeypot field if spam becomes a problem. It is a
  configuration field rather than user data, but it still adds a key to the payload, so add it
  deliberately rather than by reflex.

## Files

```
index.html                  markup — semantic HTML5, CSS Grid, inline SVG icon sprite
css/style.css               the entire design system, self-contained
js/app.js                   UI state only — no requests, no storage
assets/logo.svg             original "Creator Partner" mark (shield + play, not a Google logo)
assets/favicon.svg          favicon
assets/channel-avatar.svg   placeholder avatar — no longer referenced, kept for reference
image/vibe valut music.jpeg channel artwork, used as the sidebar avatar
```

No Bootstrap, no icon font, no JS framework. Icons are `<symbol>` definitions in a hidden sprite at
the top of `index.html`, referenced with `<use href="#i-…">` and coloured by `currentColor`. That
keeps them crisp at any size, themeable from CSS, and correct offline.

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

## Design language

A red brand mark on a neutral product surface. Red is deliberately rationed — it carries the brand,
the primary action, and review progress, and nothing else, so it keeps its weight. Everything else
lives in the grey ramp.

| Token | Value | Role |
| --- | --- | --- |
| `--brand` | `#ff0000` | Brand mark, primary button, progress rail |
| `--brand-700` | `#b00000` | Brand-coloured *text* (the pure red fails contrast as text) |
| `--focus` | `#1a73e8` | Focus rings and interactive affordance only |
| `--ink-1` … `--ink-4` | `#101014` → `#9a9ba7` | Text ramp |
| `--ok` / `--warn` | `#0d7a43` / `#8a5300` | Status tags and check-list icons |
| `--r-sm` … `--r-lg` | `10px` / `14px` / `18px` | Radius scale |
| `--shadow-1..3` | — | Layered, low-contrast elevation |
| Inter | 400 / 500 / 600 / 700 | Type family (system stack fallback) |

Details that carry the look: a translucent blurred sticky top bar, an SVG sprite instead of an icon
font, a red-tinted radial wash behind the hero headline, a gradient banner on the channel card with
the avatar breaking its edge, uppercase micro-labels above their values, and status tags that pair a
tinted fill with a matching hairline border.

**What is deliberately *not* here:** the Google "G", the YouTube play-button logo, the four-colour
wordmark, any "verified" checkmark, and any replica of `accounts.google.com` or Google's sign-in
chrome. There is also no password field, for the reason in [Security posture](#security-posture).

## What is interactive

| Element | Behaviour |
| --- | --- |
| `Submit Form` | **Real.** Native POST of `name` / `email` / `message` to FormSubmit, in the same tab. The script paints a busy state and does not intercept the submit. |
| `Start channel review` | Button loading state ("Preparing your channel review…"), the step rail pulses, then a confirmation panel with a "Start over" action. |
| `Continue with Google` | Inert by design. Reports that no OAuth flow is wired up and that a real one would hand off to Google's own sign-in page. |
| Privacy / Terms / Help | Placeholder notices. |
| Check list | Staggered reveal on scroll (skipped under `prefers-reduced-motion`). |
| "Contact" in the top bar | Anchors to the form. "Help" is still a placeholder notice. |

That is the whole surface. The contact form is the only thing you can type into, and the only thing
that goes anywhere.

### Why there is no email + password form

The account section shows a **signed-in session**, not a credential prompt — which is what a relying
party actually sees in an OAuth flow. A spec for this page will usually ask for an email field, a
password field ("Enter your password"), and a Send button. That request is declined on purpose, and
[Security posture](#security-posture) is the reason: this project already shipped that form once, it
posted to a live third-party inbox, and a `preventDefault()` was the only thing stopping it.

If you need the account step to look more filled-in, add *display* elements — a signed-in chip, a
"Switch account" link, an account picker — rather than an input. Display can't leak; an input can.

## No Bootstrap

The brief for this page typically lists Bootstrap 5. It is deliberately not used: only the grid would
be in play, so the CDN bundle would be ~200 KB of mostly-overridden CSS whose defaults are exactly
the "generic Bootstrap template" look the brief asks to avoid. The responsive layout here is ~40
lines of CSS Grid in `css/style.css`, the components are bespoke, and there is no Bootstrap JS
component on the page — so a `bootstrap.bundle.js` would ship unused. Zero dependencies also means
the page works offline and from `file://` with no CDN in the path.

## Accessibility

Skip link; landmark structure (`header` / `nav` / `main` / `aside` / `footer`); `aria-current` on the
active step; a labelled progress nav; `role="status"` + `aria-live="polite"` on the confirmation panel
and the toast stack; `aria-busy` on the CTA while it loads; visually-hidden text so step state is not
communicated by colour alone; visible focus rings throughout; decorative SVG marked `aria-hidden`;
and full `prefers-reduced-motion` support.

## Offline behaviour

Only the Inter webfont is fetched on load. Offline, the page still renders in full — the layout is
pure CSS, the icons are inline SVG, and the type falls back to the system stack. The earlier
revision's icon font would have rendered icon names as literal words ("check", "search") offline; the
sprite removes that failure mode entirely. The contact form is the sole exception: submitting it
offline fails, because it genuinely needs the network.
