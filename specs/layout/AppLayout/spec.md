# AppLayout
Status: implemented

## Purpose

It composes the whole page: skip link, ControlsBar, Sidebar, content card
with NavTabs and the active panel (AboutPage / ResumePage). It is the only
place that connects **content** (`useCv`), **texts** (`useLocale`) and
**navigation** (`useHashTab`).

## Requirements (EARS)

- RF-1: THE SYSTEM renders the landmarks `banner`, `complementary` and `main` (roles of the elements `<header>`/`<aside>`/`<main>`). The document contains two `h1` (that of the active panel and that of the inactive panel under `hidden`); the "visible one at a time" uniqueness is verified with `getAllByRole("heading", { level: 1 })` of length 1: RTL and axe exclude the hidden subtree.
- RF-2: ON MOUNT, if the hash does not correspond to a tab, THE SYSTEM activates `about`; if `location.hash` is `#resume` before mounting, it starts on Resume. A later invalid hash keeps the active tab (`useHashTab` RF-3 governs it).
- RF-3: WHEN the user changes tab, THEN THE SYSTEM renders the corresponding page in the tabpanel, updates `aria-labelledby` and syncs the URL with `history.replaceState` without adding history.
- RF-4: WHEN the user activates the skip link, THEN THE SYSTEM moves focus to the tabpanel without modifying the URL's hash.
- RF-5: THE SYSTEM keeps the list of tabs always with the two ids of `TAB_IDS`, in that order, so that the tabpanel's `aria-labelledby` never points to a nonexistent tab.
- RF-6: THE SYSTEM mounts `AccentGradientDefs` and `HexAvatarDefs` exactly once in the document.
- RF-7: THE SYSTEM re-renders when the language changes (tabs, titles and content, without reloading) and presents `data-theme` on `<html>` when the theme changes: both behaviors are set by the providers, which live above AppLayout; this piece implements nothing of the theme. The RF verifies the integrated path (tests 5 and 6).
- RF-8: THE SYSTEM mounts each page exactly once: the active one in the tabpanel (`data-print-page={active}`) and the inactive one in a sibling block with `hidden`, outside the tabpanel (`data-print-only` + `data-print-page={inactiva}`). Both blocks hang from a common root `data-print-stack`. In `@media print` they are stacked **always in the order About → Resume, regardless of the active tab** (rules in `src/styles/global.css`, see "Print"). Verification: structure and uniqueness of `h1` in jsdom (test 12); print rules by CSS inspection and QA F5.
- RF-9: WHEN the user changes tab, THEN THE SYSTEM brings in the tabpanel's content with `opacity 0→1` and `translateX(±10px)→0` according to the direction (About→Resume from the right; Resume→About from the left), with `--duration-slow` and `--ease-enter` and `animation-fill-mode: backwards`. The entrance wrapper is remounted with `key={active}` — that restarts **the animation** of the entrance; the reset of the page's internal state between tabs (carousel at 0, dialog closed) is **pre-existing** behavior of the swap of the types `AboutPage`↔`ResumePage` that the `key` does not alter. On the initial render there is NO animation (the direction attribute is not rendered without a tab change). The focus, the `role="tabpanel"` and `aria-labelledby` do not change. With `prefers-reduced-motion: reduce` the change is instant (collapse of `--duration-slow` to 0.01ms); in print there is no animation. Verification: tests 13–17; reduced motion, print and flow of the `h1` next to the floating corner tab ≥ 992px, by the reviewer's QA with the app served (#91) when closing the Change.

## Anatomy

See `foundations/layout.md` (structure of the document and grid by breakpoint).

```tsx
// Module constant: fixed order and ids of the tabs (never empty)
const TAB_IDS = ["about", "resume"] as const;
type TabId = (typeof TAB_IDS)[number];

// Narrowing guard (not exported): type boundary with NavTabs,
// which sets onChange: (id: string) => void. No casts (rule of specs/README.md).
const isTabId = (id: string): id is TabId =>
  (TAB_IDS as readonly string[]).includes(id);

// Inside the component
const { t } = useLocale();
const cv = useCv();
const [active, setActive] = useHashTab(TAB_IDS, "about");

// Entrance direction (RF-9): React's official pattern "adjusting state when
// a prop/state changes" (conditional setState during the render of the component
// ITSELF; it is not an effect). Reading/writing refs during render is forbidden
// (react-hooks/refs with recommended-latest, eslint.config.js:25). The direction
// is ONLY recalculated when `active` changes: an unrelated re-render (language, theme)
// keeps the value and does not cut the animation in progress.
const [prevActive, setPrevActive] = useState(active);
const [direction, setDirection] = useState<MotionDirection | null>(null);
if (active !== prevActive) {
  setPrevActive(active);
  setDirection(getTabDirection(TAB_IDS.indexOf(prevActive), TAB_IDS.indexOf(active)));
}

const tabs = [
  { id: "about", label: t.nav.about },
  { id: "resume", label: t.nav.resume },
] as const;
const sidebarLabels: SidebarLabels = {
  region: t.sidebar.region,
  social: t.sidebar.social,
  showContacts: t.sidebar.showContacts,
  hideContacts: t.sidebar.hideContacts,
  downloadCv: t.sidebar.downloadCv,
  avatarAlt: format(t.sidebar.avatarAlt, { name: cv.profile.name }),
  contact: t.contact,             // { email, phone, whatsapp, location }
};

return (
<>
  <AccentGradientDefs />
  <HexAvatarDefs />
  <a className={styles.skipLink} data-print-hide href="#main-panel" onClick={focusPanel}>{t.skipToContent}</a>
  <div className={styles.container}>
    <ControlsBar />
    <div className={styles.grid}>
      <Sidebar className={styles.aside} profile={cv.profile} contact={cv.contact} social={cv.social} labels={sidebarLabels} />
      <main className={styles.main}>
        <Box variant="outer" as="section" className={styles.contentCard}>
          <NavTabs items={tabs} activeId={active} onChange={(id) => { if (isTabId(id)) setActive(id); }} panelId="main-panel" label={t.nav.label} />
          <div data-print-stack>                                 {/* root of the print stack; no class of its own (module names are hashed and global.css cannot target them) */}
            <div ref={panelRef} role="tabpanel" id="main-panel" aria-labelledby={getTabId(active)} tabIndex={0} data-print-page={active} className={styles.panel}>
              <div data-motion-panel key={active} {...(direction ? { "data-motion-direction": direction } : {})} className={styles.motionPanel}>
                {active === "about" ? <AboutPage /> : <ResumePage />}
              </div>
            </div>
            <div data-print-only data-print-page={active === "about" ? "resume" : "about"} hidden>   {/* inactive panel prepared for print; see "Print" */}
              {active === "about" ? <ResumePage /> : <AboutPage />}
            </div>
          </div>
        </Box>
      </main>
    </div>
  </div>
</>
);
```

- **Tabs (invariant):** the list always has the 2 tabs of `TAB_IDS`, in
  that order; the labels come from `t.nav`. As it is never empty, the
  tabpanel's `aria-labelledby` always points to an existing tab (the case
  "NavTabs with empty `items` → `null`" only applies to NavTabs in isolation).
- **Labels of the Sidebar:** explicit mapping of `t.sidebar.*` and `t.contact`
  (above). All the UI keys of `foundations/i18n.md` end up used.
  `avatarAlt` is composed here with `format(t.sidebar.avatarAlt, { name: cv.profile.name })`:
  the alt of the avatar follows the `profile.name` of each language and the Sidebar
  composes no texts (RF-8 of its spec).
- **Skip link without touching the URL:** `focusPanel` does `event.preventDefault()`
  and `panelRef.current?.focus()`. The `href="#main-panel"` stays as a fallback
  with no JS. This way the hash keeps `#about` / `#resume` and the shareable link is
  not lost.
- **Type boundary with NavTabs:** the implemented NavTabs sets
  `onChange: (id: string) => void`; `setActive` requires `TabId`. The narrowing
  belongs to AppLayout with the module guard `isTabId` (not exported): NavTabs is
  not touched and there are no casts.
- **Inactive panel mounted only once:** there are no additional copies of the
  pages; the ids they generate (`about-services-title`,
  `resume-education-title`, Timeline items, etc.) are never duplicated in the
  document (RF-8).
- **`getTabDirection` (new, pure):** it lives in **`src/lib/tabDirection.ts`**
  (`.ts`: it does not touch react-refresh's `allowExportNames`, #96/#100; owner:
  integrator). Signature `getTabDirection(prev: number | null, next: number):
  "from-left" | "from-right" | null` — `null` if there is no previous index (first
  render) or if the indexes match. `MotionDirection` is the type of the union of
  the two strings, exported from the same file.
- **`key` on the wrapper, not on the tabpanel or on NavTabs or on the pages:**
  it remounts only the wrapper's node; the tabpanel keeps the focus and the attributes.
- **The state reset between tabs is NOT produced by the `key`:** today the active
  page and the inactive one already swap component types in each position
  (`AppLayout.tsx:200/:205`), and React already unmounts/remounts both; the carousel
  goes back to 0 and the dialog closes since F4. The `key` only restarts the
  animation on the wrapper node.
- The wrapper **has no `role`, `tabIndex` or text of its own**: the accessibility
  tree is identical before, during and after the animation.

## API

```ts
export interface AppLayoutProps {
  className?: string;
}
```

`className` is applied to the `div.container` of the Anatomy (the root of the component
is a fragment; the place of the join is deliberate, not an accident).

It requires `ThemeProvider` and `LocaleProvider` above (`main.tsx` mounts them).

## Pages

`AboutPage` and `ResumePage` (in `src/pages/`) have their own spec:

- [specs/pages/AboutPage/spec.md](../../pages/AboutPage/spec.md)
- [specs/pages/ResumePage/spec.md](../../pages/ResumePage/spec.md)

AppLayout only decides which one to render in the tabpanel according to the active tab
(`useHashTab`, spec in [specs/hooks/useHashTab/spec.md](../../hooks/useHashTab/spec.md)).

## Styles and tokens

- Container, gutter, grid, sticky: according to `foundations/layout.md`.
- **Header of the panel and CornerTab:**
  - **< lg**: the tab is absolute over the corner and `.panel` has
    `padding-top: calc(var(--size-nav-tab-height) - var(--box-padding) + var(--space-4))`
    so that the `h1` stays below the tab (single formula; A2 of diagnostics).
  - **≥ lg**: NavTabs uses `CornerTab placement="float"`: the tab floats on the
    right and the `h1` flows to its left with the **real** width of the tab
    (no fixed reserves or magic numbers). `.panel` goes back to
    `padding-top: 0` in `@media (min-width: 992px)` (layout change).
  - For the flow to work, `.panel` and the root container of each page
    **cannot** be flex/grid or have `overflow` other than `visible`
    (see `specs/pages/*.md` → "Styles and tokens").
- **Skip link:** visually hidden until it receives focus; with focus it appears
  at the top left with background `--color-surface`, text `--color-accent-text`,
  radius `--radius-8`, `--shadow-control`, `z-index: var(--z-skip)` (30: above
  `--z-controls` —the token is new in `tokens.css`, decision of the
  F4 Clarification—; the focused skip link must always win the stacking,
  and `--z-controls` specifically documents the layer of ControlsBar) and **with the
  kit's standard ring** (`--focus-ring-*` on `:focus`; F5 Change, finding
  D2: the button was focusable via programmatic `:focus`/click and `:focus-visible`
  does not always guarantee it — hard rule 7 of `docs/DESIGN.md`: a single ring.
  Verification: CSS inspection + QA F5).
- Focus of the tabpanel: standard ring (`--focus-ring-*`) only with `:focus-visible`.
- **Panel entrance (RF-9), all in `AppLayout.module.css`:**
  - `.motionPanel[data-motion-direction="from-left"]` **(0,2,0)**:
    `--panel-enter-x: -10px`; `.motionPanel[data-motion-direction="from-right"]`
    **(0,2,0)**: `--panel-enter-x: 10px`. The attribute **only defines the
    variable**; it does not declare `animation`. The selectors are scoped by the
    class: a bare attribute selector in a CSS Module is global
    (precedent `.contacts p`). A variable is not a `transition`: #116 is
    fulfilled.
  - A single `@keyframes panel-enter`: `from { opacity: 0;
    transform: translateX(var(--panel-enter-x)) }` → `to { opacity: 1;
    transform: translateX(0) }`.
  - `.motionPanel[data-motion-direction]` **(0,2,0)**:
    `animation: panel-enter var(--duration-slow) var(--ease-enter) backwards`.
    The animation **only runs with the attribute present** (nothing animates on the
    first render). `backwards` —not `both`—: it leaves no permanent `transform` or
    extra stacking context.
  - **No `transition`** in any rule of the wrapper: #116 governs transitions and
    here there is none (the existing (0,2,0) rules are for `animation` and for the
    definition of a variable).
  - `10px` is a literal set by the spec (like the measures of
    `docs/tokens/breakpoints.md`); it does not change by breakpoint.
  - **Print:** `@media print { .motionPanel[data-motion-direction] {
    animation: none } }` **(0,2,0), placed after the `animation` rule
    inside the module**: it wins by order. It does NOT go in `global.css`: that is imported in
    `main.tsx` before the modules and would tie in specificity with the
    module's, which would win (the same pattern as `.social a` in stage 1).

## States

| State | Effect |
|---|---|
| Active tab `about` / `resume` | the tabpanel renders AboutPage / ResumePage; the other one stays mounted in the `hidden` sibling block (`data-print-only`) |
| Tab change | the wrapper `data-motion-panel` is remounted (`key={active}`) and animates the entrance according to `data-motion-direction` (`from-right` About→Resume, `from-left` Resume→About) |
| Initial render | the wrapper exists and does **not** carry `data-motion-direction`: no animation |
| Skip link without focus | visually hidden |
| Skip link with focus | visible at the top left |
| Tabpanel with focus (keyboard) | standard ring |

## Responsive

| Viewport | Layout |
|---|---|
| < lg | One column: ControlsBar, Sidebar, content card. Absolute tab; `h1` below (padding-top of `.panel`). |
| lg (992–1199) | One column; floating tab with the `h1` beside it. |
| ≥ xl (1200) | Grid sidebar 3/12 + content 9/12. Sidebar **sticky only if the screen height is ≥ 900px** (otherwise, it scrolls with the page). See `foundations/layout.md`. |

## Print

The print contract speaks in `data-*`, not in CSS Modules classes (module
names are hashed and `global.css` cannot target them):

- Each page is mounted **only once** in the document: the active one in the
  tabpanel (`data-print-page={active}`) and the inactive one in the sibling block
  (`data-print-only` + `data-print-page={inactiva}`, with `hidden`: out of the
  accessibility tree and not visible on screen). No duplicated ids.
- Printed order **always About → Resume, regardless of the active tab**:
  in `@media print`, `[data-print-stack]` is `flex` in a column and the `order`
  comes from `data-print-page` (`about: 0`, `resume: 1`).
- The inactive block is shown in print: `[data-print-only] { display: block }`
  (author rule: it beats the `display: none` of the `hidden` attribute).
- All the cross-cutting `@media print` live in `src/styles/global.css`
  (hard rule 3 of `docs/DESIGN.md`); the print palette is already reassigned by
  `tokens/tokens.css`. No F2/F3 piece is edited. **Exception of RF-9:** the
  cancellation of the entrance animation lives in `AppLayout.module.css` because its
  carrier is a hashed class of the module itself (see "Styles and tokens").
- The selectors for hiding pieces of other pieces are **deliberate and are part of the contract**. **Update of the F5 Change 2026-10-08** (findings B-2/B-3/M-1 of `docs/qa-report.md`): the native `header`, `[role="tablist"]` and `aside button` **lost on specificity** against the hashed classes of the CSS Modules (the controls and the button were printed; the corner tab stayed as an empty strip). The contract moves to **`data-print-hide` hooks** on the roots of the pieces (attribute (0,1,0) + element (0,1,1) always beats the class): `global.css` hides `header[data-print-hide]` (ControlsBar), `div[data-print-hide]` (CornerTab — the whole tab, content and background) and `button[data-print-hide]` (the Sidebar's disclosure), in addition to `[data-print-hide]` of the skip link (this one already worked: the module sets no `display` for it) and `aside [download]` (the Download CV CTA, a polymorphic `<a>` of `Button`: the `download` attribute is the native hook, stable and unique to the CTA — deliberate). The affected pieces render the attribute according to their specs (Changes in ControlsBar RF-6, CornerTab RF-7, Sidebar RF-4/RF-10). `[role="tablist"]` is kept in the block as a **defensive redundancy** (its carrier hangs today from `div[data-print-hide]`; a builder decision authorized by T7). `TestimonialDialog` and `TestimonialCarousel` already resolve their printing in their own modules (documented exception G-D-1).
- The forced expansion of the Sidebar's contacts and the rest of the list of
  `foundations/layout.md` → "Print" are implemented by the integrator in the
  print task of F4 and verified by **QA F5** with the app served
  (decision #91): F4 sets the contract, F5 verifies the real result.

## Accessibility

- Landmarks: `header` (ControlsBar), `aside` (Sidebar), `main`.
- Only one `h1` visible at a time: the document has two (active + inactive under
  `hidden`); it is verified with `getAllByRole("heading", { level: 1 })` of
  length 1 (RTL and axe exclude the hidden subtree).
- The skip link points to `#main-panel`, is the first focusable element and moves focus to the tabpanel without changing the hash.
- `AccentGradientDefs` and `HexAvatarDefs` mounted **only once**.
- When the language changes, `<html lang>` changes (the provider does it) and all the
  content is re-rendered in the new language without reloading.
- The entrance wrapper is a neutral block `div` (no `role` or focus): the
  tabpanel is still the only focusable surface of the panel.

## Expected tests

1. It renders the landmarks `banner`, `complementary` and `main`, with `getAllByRole("banner")` of length 1 (uniqueness delegated by ControlsBar RF-2; the `<header>` of ControlsBar is the only one in the document).
2. The initial tab is `about` (no hash) and the panel shows the `h1` of About.
3. With `location.hash = "#resume"` before mounting, it starts on Resume.
4. Click on the Resume tab → the panel shows the `h1` of Resume, the panel's `aria-labelledby` = `tab-resume`, and `history.replaceState` was called with `#resume`.
5. Changing the language to `es` → the tabs, titles and content switch to Spanish (verify one text from `ui.es` and one from `cv.es`).
6. Changing the theme → `data-theme="dark"` on `<html>`.
7. There is exactly one `linearGradient#accent-gradient`, one `clipPath#hex-avatar-outer` and one `clipPath#hex-avatar-inner` in the document.
8. The first focusable element is the skip link with `href="#main-panel"`; on activating it, focus moves to the tabpanel and `location.hash` does **not** change.
9. There is no element with `id="about"` or `id="resume"`.
10. `expectNoA11yViolations` with no violations on About and on Resume, in both languages.
11. The tablist contains exactly two tabs in the order About→Resume and the tabpanel's `aria-labelledby` matches the `id` of the active tab, before and after changing tab (RF-5).
12. With the active tab `about`: the Resume page is mounted with `hidden` outside the tabpanel (block `data-print-only`, `data-print-page="resume"`) and `getAllByRole("heading", { level: 1 })` is of length 1; symmetric with `resume` (RF-1 criterion, RF-8 DOM layer; the `@media print` rules are verified by CSS inspection and in QA F5).
13. Click About→Resume: the wrapper carries `data-motion-panel` and `data-motion-direction="from-right"`; Resume→About: `"from-left"`. Two quick clicks: the final attribute is consistent with the tab reached and the previous wrapper node **is no longer in the document** (proof of the `key`).
14. **NO REGRESSION (green on-arrival, regime #101):** I advance the carousel of About, go to Resume and come back → the carousel is at index 0. It verifies the pre-existing behavior of the page swap; it does **not** prove the `key` (that is the second part of test 13).
15. Pure `getTabDirection` (`src/lib/tabDirection.ts`): `(0, 1)` → `"from-right"`; `(1, 0)` → `"from-left"`; `(null, 0)` → `null` (first render); `(0, 0)` → `null` (same index).
16. Initial render: the wrapper exists and does **not** have `data-motion-direction`. After a tab change, a re-render by a **language change** keeps the value of `data-motion-direction` (the direction is not recalculated outside the tab change and does not cut the animation).
17. The closing `expectNoA11yViolations` (test 10) is still present and covers the new markup.

## Do not

- Do not leave the list of tabs empty or change its order: always the two of `TAB_IDS`.
- Do not change the hash when activating the skip link: `preventDefault` and focus to the tabpanel.
- Do not mount `AccentGradientDefs` or `HexAvatarDefs` more than once.
- Do not give `id="about"` or `id="resume"` to any element.
- Do not make `.panel` (or the root of the pages) flex/grid or with `overflow` other than `visible`: it breaks the flow of the `h1` next to the floating tab.
- Do not reserve the tab's space with magic numbers: single formula with tokens (< lg) and real width of the tab (≥ lg).
- Do not put the `key` or the animation on the tabpanel, NavTabs or the pages: they would break focus/ARIA or duplicate animations.
- Do not animate on the initial render: the `animation` is only declared with `data-motion-direction` present.
- Do not use `fill-mode: both` (it would leave a permanent `transform` and create a stacking context): use `backwards`.
- Do not use `flushSync` or the View Transitions API.
- Do not give the wrapper a `role`, `tabIndex` or text of its own.
- Do not put any `transition` in selectors of specificity (0,2,0) or higher (#116); in this Change there is no transition at all.
