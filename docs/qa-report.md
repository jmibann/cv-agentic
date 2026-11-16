# QA of F5 — report (2026-10-08)

> **FINAL VERDICT: F5 CLOSED (2026-10-08).** Four passes in the browser +
> verification on real paper by the user (6/6); package #104 corrected and
> re-verified; visual decisions #105 applied. Suite 445/40, build and
> validate:content green. Closing entry: §XII in `docs/diagnostics.md`.
> Non-blocking residues → row "Post-F5 pending items".

> **Post-F5 maintenance (2026-11-06):** bug fix ControlsBar T4 (alignment of
> ThemeToggle/LanguageSwitcher with a flex `.group` + gap by token); suite 446/40,
> build ✅. Detail: §XIII in `docs/diagnostics.md`.

## Focused pass after the real content (2026-11-11) — APPROVED

App served by the user at `http://localhost:5173/` (#91), reviewer with
chrome-devtools MCP, **read-only** (the user asked not to correct anything without their OK).
It covers the verification requested by #108/#109 after `63f6665`. There were **two passes**: the
first exhausted the step limit without rendering the Resume in English; the second,
focused on that gap, closed it.

| Check | Evidence | Result |
|---|---|---|
| Grid 375/768/1024/1440 × light/dark × en/es | `scrollWidth === clientWidth` in the 16 states; no overlaps | ✅ |
| **Chevron↔name gap at 375px with "Juan Manuel Ibáñez"** | Range rects of the real text (name on 2 lines: l1 r=260, l2 r=206) vs the left edge of the button: **72.84px in the 4 language×theme combinations** (the SVG: 76.84px). References: 245.78px at 768 and 501.78px at 1024 | ✅ zero overlap and no invasion; **3×** the slack of the 23px of #105c → it closes the note "it fits tightly with the example name" |
| Sidebar: real avatar | `complete: true`, 412×512, `src="/images/avatar.png"`, `alt` "Portrait of Juan Manuel Ibáñez" / "Retrato de …" (it comes from `ui.{en,es}.sidebar.avatarAlt` + `profile.name`) | ✅ |
| PDF CTA | `<a download href="/cv/Juan-Manuel-Ibanez-CV.pdf">` in both languages; HEAD → **200 `application/pdf`** (in dev `BASE_URL`="/"; the GH Pages `base` is not exercised here) | ✅ |
| About/Resume with **no** testimonials (`testimonials: []`) | No `h2`/region/carousel of testimonials in es/en; the only matches of `testimonial` in `innerHTML` are variables of `tokens.css` | ✅ (#108) |
| Resume with real content | Education 4 · Experience 10 · Skills 23, **the same counts in es and en**; periods EN `"Jul 2026 — Present"` / `"Oct 2023 — Jul 2026"` and ES `"jul 2026 — Actualidad"`; correct `lang`; sweep `[áéíóúñ¿¡]` over the UI in English = 0 | ✅ |
| Zero example placeholders | Search for "Alex Rivera" / "Maria" / "John" / "Lena" / `testimonials/` in `innerText` **and** `innerHTML` → `[]` in es and en | ✅ |
| CornerTab vs `h1` (768/1440) | 768: the tab stays above the h1; 1440: text of the h1 (x 458–590) vs tab (x 1130–1349) → no intersection by `Range` and the panel does not narrow (861px with and without the tab). *Note, not a defect:* the block **box** of the `h1` takes up the whole width of the panel, which is why a generic rect does intersect; what the spec prescribes is the flow of the text | ✅ |
| Focus, disclosure and anti-flash | Standard ring by keyboard 2px `rgb(48,76,253)` offset 2px (`--focus-ring-*`); chevron rotates 180° (`matrix(-1,0,0,-1)`); reload in es/dark → `data-theme=dark` + `lang=es` + `theme-color=#151517` from the first frame | ✅ |
| Console | No errors or warnings after each navigation with a full reload | ✅ |

**These are not findings (closed decisions, so that they do not show up again):** the
`headline` and the job titles in English inside `cv.es.json` (**#109**, the user's editorial
decision); the absence of testimonials and of phone/WhatsApp (**#108**); and the
`public/images/testimonials/*.svg` that are still on disk, which **are kept on purpose**
because the fixture `data/cv.example.{en,es}.json` uses them (**#109**) — the reviewer's
suggestion to clean them up **is not applied**. Minor with no action: `public/**/.DS_Store`
(gitignored; Vite copies them to `dist/`).

**Not verified:** print view and sticky 1440×800 (covered in F5 and by the user's
real Ctrl+P; none of that changed since then); axe in the browser (0
violations in F5 and the suite with `expectNoA11yViolations` was still green 447/40 at that date); the
real `base` of GitHub Pages (`DEPLOY_TARGET=gh-pages` + deploy), in the user's hands.

## RESOLUTION (passes 3–4, after package #104)

The #104 corrections were implemented, reviewed and verified live:

| Defect | Fix (task/commit) | Live verification (pass 3/4) |
|---|---|---|
| B-2 controls visible in print | ControlsBar T3 `eaa4d01` + AppLayout T7 `87edfd1` (`header[data-print-hide]`) | PASS 3-A APPROVED: `display:none` in emulation |
| B-3 "Mostrar contactos" button in print | Sidebar T7 `fac2fbe` + T7 AppLayout (`button[data-print-hide]`) | PASS 3-A APPROVED |
| M-1 empty strip of the tab | CornerTab T5 `25e2ee4` + T7 (`div[data-print-hide]`) | PASS 3-A APPROVED: no leftovers |
| D1 overlap 375 | Sidebar T7 (redesign #104b: icon-only chevron, identity on the left, networks centered) | PASS 3-B + 4-4: gap 23px, zero overlap es/en/Resume, light/dark, overflow 0 |
| D2 UA ring on the skip link | AppLayout T8 `74bafe2` | PASS 3-C: outline 2px `#304cfd` offset 2; the panel receives the ring after Enter |
| D3 double UA outline on the card | TestimonialCard T4 `02a2756` | PASS 3-C: outline-style none; a single ring on ::after after the dialog's Esc |
| D4 favicon 404 | Foundation T13/T13b `b93c510` (`/favicon.svg`, blue `#304cfd`) | PASS 3-D: 200 `image/svg+xml`, zero request for the .ico, clean console |
| Pending E items of pass 1/2 | — | PASS 3-E1–E3 (overflow 1024/768; sticky OFF 1440×800 + last contact; keyboard disclosure 1024) and PASS 4 (bullet 2 Enter→aria-current+scrollLeft 445; NavTabs hover = spec RF-5; axe 0 violations in en×light×about and es×dark×resume; contrast of the chevron light 5.87 / dark 12.06 ✓ contrast.md rows 15/19/39) |

Suite after everything: **445/40**, build ✅ validate:content ✅. **Spot-check #105c (after applying the tokens)**: avatar exactly 102px at 375 in both themes, chevron↔name gap 23px with no overlap, md–lg (144px) and 1024 intact, overflow 0 at 375/Resume/768/1024 → APPROVED. ⚠️ Note: the 23px gap fits tightly with the example name ("Alex Rivera"); **reconfirm at 375 when `src/content/cv.*.json` has the final name** (the content is editable by design; it is not a layout defect). → **Reconfirmed and closed on 2026-11-11** with "Juan Manuel Ibáñez": 72.84px with no overlap (section "Focused pass after the real content").

### Left in the user's hands (not verifiable by agents)

1. **Real Ctrl+P** — **APPROVED BY THE USER (2026-10-08, F5 closing)**: on `#resume` in dark, 6/6 criteria OK — pages 1–2 About (About Me/What I'm Doing/Testimonials) and 3–4 Resume (Education/Experience/Skills) = order About→Resume; no controls/tabs/skip/chevron; contacts expanded; the 3 testimonials complete and stacked with no cuts; white background rendered in `@media print` with the dark theme; clean flow with no cuts of cards/timeline.
2. **Favicon visible in the browser tab** — **RESOLVED (decision #105a)**: it is closed as it is (blue `#304cfd`, pointy-top hexagon); no aesthetic change is opened without a reason.
3. **F8 + token < md** — **RESOLVED (decision #105b/c)**: F8 closed, `9rem` (≥768) stays final with no reference capture; the base `< md` `6.375rem` is applied. Edits of `tokens.css` **applied and committed**: base `6.375rem` l.201 + comment l.336 "definitivo" — the user's commit `190c678 feat(tokens): set avatar base 6.375rem and finalize 9rem (F5 #105b/c)`. The QA measured zero overlap with 7.5rem as well: the value is aesthetic, not functional.
4. **Shade of the "gold"** — **RESOLVED (decision #105d)**: the semantic reading per theme of `--color-accent-text` is accepted (gold `#fadd7f` in dark, blue `#304cfd` in light; contrasts 12.06:1 / 5.87:1 ✓); a fixed gold in light is discarded.

## Original pass 1–2 (historical record)

App served by the user at `http://localhost:5173/`; pass of the `reviewer`
with chrome-devtools MCP (decisions #85 and #91). **Two passes**: the 1st exhausted
the agent's steps with 34 checks; the 2nd, focused on print/keyboard/axe,
was also left incomplete. General status: **INCOMPLETE — 2 print
blockers + 1 layout blocker at 375px + 2 medium focus ones + pending items**.

Verified base: F4 closed (`133b1e8`), suite 441/40, `build`/validate ✅.

## Matrix of pass 1 (viewport × theme × language)

| Check | Result |
|---|---|
| 1440 light/dark × en/es, no overflow, sticky ≥900 active | APPROVED (sticky `top: 157.8px` measured; avatar not cut off after scroll) |
| Direct `#resume` opens Resume; a tab click adds no history (`replaceState`, stable `history.length`); initial tab about with no hash | APPROVED |
| Skip link: first focusable, visible (16,16), `z-index: 30` > header 20, `data-print-hide` | APPROVED (the focus ring → defect D2) |
| Theme: toggle → `data-theme=dark` + `cv:theme` + `theme-color` #151517; reload with no light→dark flicker (anti-flash first in `<head>`) | APPROVED |
| Live language: `<html lang="es">`, `cv:locale`, tabs/h1/skip/sidebar translated without reloading | APPROVED |
| Float ≥992 (1024/1440, es): text of the `h1` vs the corner tab with no collision, real width, content not narrowed; <992: `h1` below the tab (768 and 375) | APPROVED in es/dark; in light/en not measured at 1024/768 |
| Print (emulated in pass 2) | see below |
| Landmarks/h1/tab roles in the browser | APPROVED (axe → below) |
| F8 `--size-avatar-sidebar: 9rem` | visual proportion OK at 1024/1440; **final value pending the user's reference capture** *(→ closed later with no capture, decision #105b)* |

## Print (pass 2; method: reinjection of the 32 `@media print` rules
as an overlay + computed + capture — the MCP does not expose print-to-PDF; **it does not
validate pagination or `@page`**; evidence `f5-print-emulation-resume-dark.png`,
375, dark theme, Resume tab active)

| Check | Result |
|---|---|
| Both panels, order **About→Resume** with Resume active (`[data-print-stack]` flex + `order` by `data-print-page`) | **APPROVED** |
| Contacts expanded (`#sidebar-contacts { display: block }` beats the collapse by class) | **APPROVED** |
| Testimonials stacked with the full text, bullets/pagination hidden, excerpt `clamp:none`, the dialog does not mount | **APPROVED** |
| Light palette with the dark theme active (background `#ffffff`, `color-scheme: light`, shadows none) | **APPROVED** |
| `break-inside: avoid` on `article`/`li` (ServiceCard/TimelineItem) | **APPROVED** |
| **Hide ControlsBar** | **DEFECT B-2**: `header` (0,0,1) loses against the hashed class `._controlsBar_*{display:flex}` (0,1,0) → the EN/ES+toggle controls **are printed** |
| **Hide the "Show Contacts" button** | **DEFECT B-3**: `aside button` (0,0,2) loses against `._disclosureButton_*` (0,1,0) → the flap is printed at <1200px |
| `[role="tablist"]` hidden | APPROVED… **but DEFECT M-1**: the visual wrapper CornerTab (60px, background/border) is NOT content of the tablist → it is printed empty |
| Download CV on paper | N/A with the current content (`profile.downloadCvUrl` not defined); the gap `aside button` vs `<a>` stays latent (note in `global.css:100-110`) |

## Axe and keyboard (pass 2)

- **axe-core 4.10.2 in the browser**: `#about`/`#resume` × en/es (light): **0 violations** — APPROVED.
- Skip link in the browser: Tab → Enter, hash intact, focus to the tabpanel with the standard ring (`2px --color-focus-ring`, offset 2) — APPROVED (it closes the PARTIAL of pass 1).
- NavTabs: an arrow moves focus **and** activates (hash + `aria-labelledby` in sync), circular, Home/End — APPROVED.
- Testimonial dialog: Enter opens, Esc closes, **focus returns to the trigger**, scroll-lock goes in and out — APPROVED.
- Contacts disclosure at <1200 and result of Enter on bullet 2 — **NOT VERIFIED** (it exhausted the steps).

## Defects

| # | Sev. | What | Cell | Piece | Type |
|---|---|---|---|---|---|
| D1 | **BLOCKING** | The "Mostrar contactos"/"Show Contacts" corner tab of the Sidebar **overlaps the name** of the profile at 375px (tab 164–359×80–124 over name 167–344×95–122; illegible in es; confirmed light and dark, on About; Resume not measured, the same mechanism). The code follows the spec (Responsive "< md"); the spec does not resolve the clash → **it looks like a Change of the spec of `layout/Sidebar`** | 375 × both themes × both languages | `layout/Sidebar` (+ its spec) | **the user's decision (Change)** |
| B-2 | **BLOCKING** | ControlsBar visible in print: the `header` selector loses on specificity against the module's hashed class | print × everything | contract of `layout/AppLayout` → `src/styles/global.css` + root of `controls/ControlsBar` | unfeasible spec/contract → **the user's decision** |
| B-3 | **BLOCKING** | "Show Contacts" button visible in print: `aside button` loses against `._disclosureButton_*` | print <1200px | like B-2: AppLayout's contract + root of the button of `layout/Sidebar` | **the user's decision** |
| M-1 | MINOR | The CornerTab corner tab (wrapper) is printed empty: `[role="tablist"]` hides the content, not the visual container | print | `layout/NavTabs`/`primitives/CornerTab` (print hooks) | part of the same contract decision |
| D2 | MEDIUM | The focused skip link shows the UA's ring (the browser's blue `outline: auto`), not the kit's standard ring (hard rule 7 of `docs/DESIGN.md`; the AppLayout spec only prescribes the tabpanel's ring) | 1440, focus by Tab | `layout/AppLayout` | code does not comply with DESIGN → new task of the piece |
| D3 | MEDIUM | TestimonialCard: the stretched `<button>` shows an extra UA ring (2px) under the standard one of the `::after` (RF-5 sets the ring on the `::after`; the module does not reset the button's outline) | 1440 after scroll | `content/TestimonialCard` | code does not comply with its spec → new task |
| D4 | LOW | `favicon.ico` 404 in the console (dev server) | everything | `index.html`/`public/` | minor decision of the user |

## Not verified (short third pass and/or the user's hand)

- **REAL print with pagination/`@page`**: ask the user for `Ctrl+P` →
  preview on `#resume` with the dark theme (it confirms B-2/B-3/M-1 in a paper
  render, not an emulated one).
- Light×en/es cells of 375/768/1024 (overflow measured only in dark/es and
  1440); 1440×800 (non-fixed sticky + last contact reachable); D1 on Resume.
- C2 (disclosure <1200 with the keyboard), result of Enter on bullet 2 of the
  carousel, NavTabs hover, clipping of the avatar/shadows of the carousel.
- F8: final value of `--size-avatar-sidebar` against the reference capture.

## Framework decision for B-2/B-3/M-1 (proposal to the user)

Contract #103 chose "deliberate" native selectors (`header`,
`[role="tablist"]`, `aside button`) so as not to touch F2/F3 pieces — the QA proved
that **they lose on specificity against the classes of the CSS Modules**.
Alternative: extend the `data-*` contract to the roots of the affected
pieces (`data-print-hide` on the `<header>` of ControlsBar, on the root of the
Sidebar's button and on the wrapper of NavTabs — small code changes in
`implemented` pieces, each with its new task and attribute tests), and have
`global.css` target only `[data-print-hide]`. It implies a **Change** of the
"Print" section of the AppLayout spec + 3 piece tasks. *Discarded:* `!important`
in global.css (it wins but dirties the contract and is still coupling to
structure) and `:global()` (discarded in #103).
