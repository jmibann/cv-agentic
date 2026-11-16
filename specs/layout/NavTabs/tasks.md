# Tasks — NavTabs

- [x] **T1. Tablist with tabs, roving and empty.** RF-1, RF-2, RF-7 — 1dcab72 (config `0df3855`: `getTabId` in `allowExportNames`, extension #100 approved by the user 2026-10-06)
  - Done when: `getByRole("tablist", { name: label })` with `aria-orientation="horizontal"` and one `tab` per item in order (`getByRole("tab", { name })`), `id=getTabId(item.id)`, `aria-controls=panelId` on all of them, `aria-selected`/`tabIndex` (active 0, rest -1); `items=[]` → empty `container`; `getTabId("about") === "tab-about"`; green after `feat(NavTabs): T1`.

- [x] **T2. Click: controlled activation and guard for the active one.** RF-3 — df17ff0
  - Done when: click on an inactive one → `onChange(id)` once; click on the active one → zero calls; after the click there is no focus re-management of its own (the native one is enough; inspection); green after `feat(NavTabs): T2`.

- [x] **T3. Keyboard: circular ←/→, Home/End, Space, single-item.** RF-4 — f9cdb20
  - Done when: with focus on the last one, ArrowRight focuses the first and emits its `onChange` (and vice versa with ArrowLeft from the first → last); Home/End focus and emit first/last; with 1 item the arrows focus the tab itself and do **not** emit; Space does `preventDefault()` and emits the `onChange` of the focused tab (a single call, no double activation); ↑/↓ with no effect; green after `feat(NavTabs): T3`.

- [x] **T4. Token-based styles and a11y closing case.** RF-5, RF-6 — 3701aa9 (note: the task said `inline-flex` for the tablist; the spec sets `display: flex` — the spec wins, recorded in the review)
  - Done when: the module sets the tablist (`inline-flex`, `gap: var(--nav-tab-gap)`), the tab (typography `--font-size-nav`/`--font-weight-medium`, `--color-text`, `padding-block: var(--space-2)`, `white-space: nowrap`, `cursor: pointer`, no background/border), inactive `opacity: 0.8` + `text-decoration: underline 2px transparent; text-underline-offset: 0.375rem`, hover 100% + `text-decoration-color: currentColor`, active `--color-accent-text` with no underline, `focus-visible` standard ring + `--radius-8`, transitions `color/opacity/text-decoration-color` `--duration-base var(--ease-standard)`, zero `@media` (the visual states: inspection; `aria-selected` by test); the file ends with `expectNoA11yViolations` (with a scaffold tabpanel, and with `items=[]` no render applies); `index.ts` re-exports `NavTabs`, `getTabId` and types; lint + typecheck + test green after `feat(NavTabs): T4`.

- [x] **T5. Full hit area and theme transition (Change 2026-11-10).** RF-5, RF-6 — c1c4793
  - Done when: `.tablist` uses `align-items: stretch; align-self: stretch;`;
    `.tab` uses `display: flex; align-items: center;` and takes up the full height
    (60px ≥992 / 48px <992); `:first-child`/`:last-child` carry
    `padding-inline` + a negative margin of `--corner-tab-padding-inline` so that
    the outer padding is clickable without moving the text; the gap is still not
    clickable; the tab's transition is `opacity` + `text-decoration-color`
    (no `color`), so that the theme change does not drag the previous accent;
    the visual verification in the browser confirms clicks on the lower half and on
    the outer padding; previous tests intact; green after `fix(NavTabs): T5`.
