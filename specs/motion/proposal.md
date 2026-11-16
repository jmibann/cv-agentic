# Motion system — IMPLEMENTED (4/4)

**Status:** motion system **complete and implemented 4/4** (2026-11-13), after
its original approval (#106, 2026-11-11) and four Change gates: **1
Foundation** — token scale, `data-theme-switching` suppression, contract by
test and kit docs (gate with adjustments → **#116**; closing §XXIV); **2 AppLayout**
— panel entrance with direction (`src/lib/tabDirection.ts`), `backwards`, print
in the module (§XXV); **3 Sidebar** — expansion of contacts with grid
`0fr↔1fr`, `data-contacts-animate`, stagger `calc(n × --duration-stagger)`,
P5' ≥1200 (§XXVI); **4 TestimonialDialog** — entrance with `--ease-enter`
keeping `@starting-style` and instant closing (§XXVII). **#116 governs as a
permanent rule** (with its clarification: `transition: none` is excluded — it is the
suppression; kit texts applied in `11b475b`: `foundations/motion.md` +
`AGENTS.md` → Conventions).
**Date:** 2026-11-11 (original proposal; the design of Phases 0–2 stays
 below as a record — the implementation may have refined details of form, never
 the contract).
**Scope:** Phases 0–2 (diagnosis, inventory and design), drafts of
specs/plans/tasks of the Changes and the prior content Change — all
consumed by the four stages.

> **Gates of this stage (historical, all passed):**
> 1. No code or tests are modified until the user approves the
>    specs/plans/tasks of each Change. *(Four gates: 2026-11-12 and 2026-11-13.)*
> 2. Nothing starts until the user confirms that they resolved the dirty working
>    tree (`src/utils/assetUrl.ts`, `HexAvatar.tsx`, `Sidebar.tsx`,
>    `vite.config.ts`). *(Resolved in `c2d4232`/`5f6c0a6`.)*
> 3. The **content Change** goes before the motion Changes. *(Done:
>    #108/#109, `63f6665`/`befb0db`; §XIV–§XVI.)*

*Maintenance note (T5): the line citations of the matrix §2.4 reflect the
file when the proposal was drafted; after `1d2aba8` of TestimonialDialog,
`:83-85`/`:194` are `:84-86`/`:195`. Historical citation, not a defect.*

Base: static inspection by the reviewer with a clean context on `654f26e`,
verified by the orchestrator in the cited files.

---

## 0. Executive summary

- **There is no motion library or `@keyframes`.** All the current animation is
  12 `transition` declarations (16 properties) in 8 CSS files.
- **The tab change does not animate the content**: the tabpanel stays, but the
  active page is replaced by conditional render (`AppLayout.tsx:200-207`).
- **The contacts block does not animate**: it is hidden with `display: none`
  (`Sidebar.module.css:78-80`). The only motion of the disclosure is the rotation
  of the chevron.
- **There is no suppression of transitions during the theme change.** The links
  of the Sidebar with `transition: color` (`Sidebar.module.css:247,386`) animate their
  color when toggling the theme, in conflict with `foundations/motion.md:29,39`.
- **`prefers-reduced-motion` works by token collapse**
  (`tokens.css:416-422`), but it does not cover stagger delays or future
  animations outside tokens.
- **Approved decisions:** new tokens (`base 0.2s`, `slow 0.3s`,
  `exit 0.22s`, `stagger 0.03s`, `ease-enter`, `ease-exit`), alternative B for
  tabs, grid `0fr→1fr` for contacts, `data-theme-switching`, instant reduced
  motion and `--ease-enter` in the dialog. No animated underline in contacts.
- **Prior content Change:** real CV in `src/content/cv.{en,es}.json`, with
  `contact[]` with no phone or WhatsApp and `testimonials: []`. The user
  provides it in a file. The testimonials section is already hidden with no data
  (`AboutPage.tsx:133`; `TestimonialCarousel.tsx:263`), but its tests assume
  non-empty content and have to be adjusted (see §5.4).

---

## 1. Phase 0 — Ruling out causes

### 1.1 Mechanisms and dependencies

| Check | Result | Evidence |
|---|---|---|
| Animation library | **There is no** framer, gsap, react-spring, motion or similar | `package.json:20-26` |
| `@keyframes` / `animation:` | **0 matches** in `src/`, `tokens/`, `foundations/` | global search |
| `transition` | 12 declarations, 16 properties, 8 CSS files | inventory §2.1 |
| `transition: all` | **0** | all of them name concrete properties |
| `view-transition` | **0** | — |
| `@starting-style` | 1, only in the dialog | `TestimonialDialog.module.css:96-106` |
| JS smooth scroll | 1, carousel | `TestimonialCarousel.tsx:255` |
| Motion in `global.css` | **None** | `src/styles/global.css` |

### 1.2 `prefers-reduced-motion`

| Rule | File:line | What it does |
|---|---|---|
| Override of durations | `tokens.css:416-422` | `--duration-fast/base/slow` → `0.01ms` |
| Scroll of the carousel | `TestimonialCarousel.tsx:255` | `behavior: "smooth"` only with `no-preference` |

- It is the **only** CSS rule for reduced motion. There are no rules per component.
- It cancels all the current transitions because all of them use the tokens.
- It **does not cover** `display: none`, stagger delays or future animations that do
  not use the duration tokens.
- If the user sees “zero animation” on the chevron as well, it is likely that
  they have Reduce Motion active in the OS. Verification: macOS → System
  Settings → Accessibility → Display → “Reduce motion”, or DevTools →
  Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`.

### 1.3 Theme change

| Check | Result | Evidence |
|---|---|---|
| Suppression attribute/class | **There is no** `data-theme-switching`, `no-transition` or similar | global search |
| Only theme change | `ThemeProvider` assigns `root.dataset.theme` and updates `theme-color` | `ThemeProvider.tsx:77-87` |
| Initial anti-flash theme | Inline script before the first paint | `index.html:11-36` |
| Transitions that do run when changing theme | Links of the Sidebar with `transition: color` | `Sidebar.module.css:247,386` |
| NavTabs | It excludes `color` from the transition on purpose | `NavTabs.module.css:72-77`; spec `NavTabs/spec.md:104` |

**Conclusion:** there is no “mode with no transitions” to review, and the theme
change is not fully instant: the links of the Sidebar animate their color. This
contradicts `foundations/motion.md:29,39`.

### 1.4 Render architecture of the two interactions

**Tabs panel (`AppLayout.tsx:190-207`):**

- The `<div id="main-panel" role="tabpanel">` is persistent; `aria-labelledby`
  changes.
- The active page is rendered conditionally:
  `{active === "about" ? <AboutPage /> : <ResumePage />}` (`:200`).
- The inactive one lives in a sibling with `data-print-only` + `hidden` (`:205-207`).
- **There is no `key`**: the remount is implicit when the component type changes.
- Each tab change unmounts/mounts both branches; the panel and the `<NavTabs>` are not
  unmounted.
- There is no crossfade, shared element or height transition; the document can
  change height abruptly.

**Sidebar (`Sidebar.tsx`, `Sidebar.module.css`):**

- Local state `expanded`, default `false` (`Sidebar.tsx:163`).
- Its own icon-only button, `aria-expanded` + `aria-controls`
  (`Sidebar.tsx:223-235`); it is **not** CornerTab.
- Chevron with `transform: rotate(180deg)` and a `transform` transition
  (`Sidebar.tsx:171-176,234`; `Sidebar.module.css:91-105`).
- Block `#sidebar-contacts`: classes `.additional` +
  `.additionalCollapsed`; the latter uses `display: none`
  (`Sidebar.tsx:185-190,300`; `Sidebar.module.css:78-80`).
- `<1200px`: the button is visible and the block is toggled with `expanded`.
- `≥1200px`: the button is hidden by CSS and the block is forced visible with
  `.additional.additionalCollapsed { display: block }`
  (`Sidebar.module.css:493-499`).
- **There is no height animation**; the spec forbids it explicitly
  (`Sidebar/spec.md:199`).

---

## 2. Phase 1 — Inventory and verification with the approved tokens

### 2.1 Full inventory

| # | Component / selector | File:line | Property(ies) | Trigger | Duration / easing | Purpose |
|---|---|---|---|---|---|---|
| 1 | NavTabs `.tab` | `NavTabs.module.css:91-93` | `opacity`, `text-decoration-color` | hover / active | `--duration-base` / `--ease-standard` | feedback + orientation |
| 2 | ThemeToggle | `ThemeToggle.module.css:65` | `transform` | press | `--duration-fast` / `--ease-standard` | feedback |
| 3 | LanguageSwitcher | `LanguageSwitcher.module.css:97` | `transform` | press | `--duration-fast` / `--ease-standard` | feedback |
| 4 | Sidebar social links | `Sidebar.module.css:247` | `color` | hover | `--duration-base` / `--ease-standard` | feedback |
| 5 | Sidebar contact links | `Sidebar.module.css:386` | `color` | hover | `--duration-base` / `--ease-standard` | **inert**: the color does not change |
| 6 | Sidebar chevron | `Sidebar.module.css:92` | `transform` | expand/collapse | `--duration-base` / `--ease-standard` | orientation |
| 7 | Button | `Button.module.css:49-52,71` | `opacity`, `box-shadow`, `transform` | hover / press | base + fast / base | feedback |
| 8 | TestimonialCard | `TestimonialCard.module.css:43` | `box-shadow` | hover | `--duration-base` / `--ease-standard` | feedback / hierarchy |
| 9 | TestimonialDialog entrance | `TestimonialDialog.module.css:83-85,101-106` | `opacity`, `transform` | open | `--duration-base` / `--ease-standard` | orientation / continuity (**entrance only**) |
| 10 | TestimonialDialog close | `TestimonialDialog.module.css:194` | `color` | hover | `--duration-base` / `--ease-standard` | feedback |
| 11 | TestimonialCarousel bullet | `TestimonialCarousel.module.css:128` | `width` | active slide | `--duration-base` / `--ease-emphasized` | hierarchy / orientation |
| 12 | TestimonialCarousel track | `TestimonialCarousel.module.css:46-47`; `.tsx:255` | `scroll-snap` + `scrollTo` | pagination | JS smooth/no-preference | orientation |
| 13 | CornerTab | `CornerTab.module.css:18-19` | — | — | — | no motion |
| 14 | ControlsBar, Badge, Overhead, Timeline, ResumeSection, SkillList, ServiceCard, Icon, BrandIcon, IconBox, Box, Separator, SectionTitle, skip link, panel, avatar, pages, `global.css` | respective modules | — | — | — | **no motion** |

### 2.2 Approved tokens and usage

| Token | Current | Approved | Real uses | Evidence |
|---|---|---|---|---|
| `--duration-fast` | `0.15s` | **`0.15s`** | 3: Button `transform`, ThemeToggle, LanguageSwitcher | `tokens.css:220` |
| `--duration-base` | `0.3s` | **`0.2s`** | 13 properties: hover/color, tabs, chevron, dialog, bullet, card, Button | `tokens.css:221` |
| `--duration-slow` | `0.6s` | **`0.3s`** | **0 current uses**; it becomes the entrance of content/layout | `tokens.css:222` |
| `--duration-exit` | — | **`0.22s`** | new: exit of content/layout (~73 % of `slow`) | new |
| `--duration-stagger` | — | **`0.03s`** | new: stagger step of the contact items | new |
| `--ease-standard` | `ease-in-out` | **`ease-in-out`** | 15 properties; reversible hover/focus | `tokens.css:223` |
| `--ease-enter` | — | **`cubic-bezier(0.22, 1, 0.36, 1)`** | entrances (panel, contacts, dialog) | new |
| `--ease-exit` | — | **`cubic-bezier(0.4, 0, 1, 1)`** | exits (contacts) | new |
| `--ease-emphasized` | `cubic-bezier(0.455, 0.03, 0.515, 0.955)` | **no change** | width of the bullet | `tokens.css:224` |

- Literal durations, easings and delays in component CSS: **0**.
- `--duration-slow` has no current uses: changing it from `0.6s` to `0.3s` does
  not alter any existing transition.
- `--duration-base` is the only existing value that changes visibly
  (0.3 → 0.2, 33 % faster). It affects only hover/focus and the dialog/chevron/
  bullet; it does not change properties or easings.
- `--duration-exit` and `--duration-stagger` are new: there is no impact on the
  12 current transitions.
- The five duration tokens (`fast`, `base`, `slow`, `exit`, `stagger`) are
  forced to `0.01ms` in `tokens.css:416-422` with `prefers-reduced-motion:
  reduce`. The stagger delays are also cancelled with a component rule
  (the collapse of durations is not enough for the delays).

### 2.3 Verification of the 12 existing transitions with the new values

| # | Transition | New value | Does it need an adjustment besides the token? | Verdict |
|---|---|---|---|---|
| 1 | NavTabs `opacity` + `text-decoration-color` | 0.2s, `ease-standard` | No. The underline and the hover feel more agile; the active color stays instant by spec. | **It is kept.** Visual QA of the underline at 0.2s. |
| 2 | ThemeToggle `transform` | 0.15s, `ease-standard` | No. `fast` does not change. | **It is kept.** |
| 3 | LanguageSwitcher `transform` | 0.15s, `ease-standard` | No. `fast` does not change. | **It is kept.** |
| 4 | Sidebar social links `color` | 0.2s, `ease-standard` | No. It is suppressed during the theme change (new `data-theme-switching`). | **It is kept.** |
| 5 | Sidebar contact links `color` | 0.2s, `ease-standard` | **Yes:** the transition is inert (the color does not change). The declaration is removed; it is not replaced by an animated underline (decision 6: out of scope). | **The transition is removed.** No visual change. |
| 6 | Sidebar chevron `transform` | 0.2s, `ease-standard` | No. It rotates in 0.2s while the block expands in 0.3s: the chevron “leads” by ~100ms, acceptable for feedback. | **It is kept.** QA of choreography. |
| 7 | Button `opacity`/`box-shadow`/`transform` | 0.2s / 0.15s, `ease-standard` | No. Hover 33 % faster; press stays at `fast`. | **It is kept.** Visual QA of hover/press. |
| 8 | TestimonialCard `box-shadow` | 0.2s, `ease-standard` | No. | **It is kept.** |
| 9 | TestimonialDialog entrance `opacity`/`transform` | 0.2s, **`ease-enter`** | **Yes:** change the easing to `--ease-enter` (decision 6). `--duration-base` 0.2s is kept: the dialog is an overlay, not page content. | **Only the easing changes.** |
| 10 | TestimonialDialog close `color` | 0.2s, `ease-standard` | No. | **It is kept.** |
| 11 | Carousel bullet `width` | 0.2s, `ease-emphasized` | No. It is a small element; 0.2s should not produce jank. If in QA it feels abrupt, `--duration-slow` is evaluated as a follow-up (it is not changed now). | **It is kept.** QA of layout. |
| 12 | Carousel track `scroll-snap` + `scrollTo` | No change | No. The `scrollTo({ behavior: "smooth" })` is timed by the browser; it uses no tokens. Reduced motion already turns it off. | **It is kept.** |

**Global impact:** only the transitions with `--duration-base` speed up
(0.3 → 0.2); `--duration-fast` does not change; `--duration-slow` had no uses. There
are no changes of properties or of easing in the existing transitions except the
dialog (#9). The general feel becomes more agile; it is confirmed in QA.

### 2.4 Evaluation

**Consistency.** The approved scale covers feedback (`fast`), microinteractions
(`base`), entrance of content (`slow`), exit (`exit`) and stagger. The easings
separate reversible hover/focus (`standard`) from entrances (`enter`) and exits
(`exit`). There is no longer a reserved token with no use.

**Purpose.**

| Motion | Purpose | Observation |
|---|---|---|
| Button hover/press | feedback | correct |
| ThemeToggle / LanguageSwitcher press | feedback | correct |
| NavTabs opacity/underline | feedback + orientation | the active color is instant by spec |
| Sidebar social links | feedback | correct |
| Sidebar contact links | feedback | **inert**; it is removed |
| Sidebar chevron | orientation | the only motion of the disclosure |
| TestimonialCard shadow | feedback / hierarchy | correct |
| TestimonialDialog entrance | orientation / continuity | entrance only; it moves to `ease-enter` |
| Bullet of the carousel | hierarchy / orientation | the only layout transition |
| Tabs → panel | — | **it does not exist**; it is added (alternative B) |
| Contacts → block | — | **it does not exist**; it is added (grid + stagger) |

There is no purely decorative motion or stagger.

**Choreography.** Stagger is added only on the entrance of contacts; the panel
enters with a direction; the dialog keeps entrance only. The theme change will be
instant. The only existing animated layout (bullet) is kept; the
height of the contacts block is added, justified by continuity.

**Reduced motion.** Full coverage for the current CSS by token
collapse. It is extended to delays and to the new animations.

### 2.5 Conflicts with the kit (Changes)

| # | Conflict | Evidence | Approved disposition |
|---|---|---|---|
| C1 | `Sidebar` forbids animating the height of the contacts block | `specs/layout/Sidebar/spec.md:199` | **Change of Sidebar**: replace the prohibition with the `grid-template-rows` pattern + accessibility/print conditions |
| C2 | `motion.md` says that the contacts have no height animation | `foundations/motion.md:28` | **Change of foundation**: update the catalog |
| C3 | `motion.md` forbids animating layout `height`/`width` | `foundations/motion.md:34` | **Change of foundation**: explicitly except `grid-template-rows: 0fr → 1fr` |
| C4 | `motion.md` says that the theme change does not animate, but the Sidebar animates `color` | `foundations/motion.md:29,39`; `Sidebar.module.css:247,386` | **Change of Foundation**: `data-theme-switching` + global rule; remove the inert transition of contacts |
| C5 | `motion.md` assigns `--duration-base` to the “tab change”, but there is no panel animation | `foundations/motion.md:12`; `AppLayout.tsx:200-207` | **Change of AppLayout**: new RF for the panel entrance |
| C6 | `--duration-slow` is reserved and with no use | `tokens.css:222`; `motion.md:13` | **Change of Foundation**: repurpose it as the entrance of content (0.3s) |
| C7 | `ease-standard` (`ease-in-out`) is used in the dialog's entrance | `TestimonialDialog.module.css:83-85`; spec `TestimonialDialog/spec.md:79` | **Change of TestimonialDialog**: `--ease-enter` |
| C8 | Outdated comment in NavTabs about `color` | `NavTabs.tsx:51-52` vs `NavTabs.module.css:72-77,91-93` | **Minor change**: correct the comment when touching the piece (no change of behavior) |
| C9 | The Sidebar test assumes that the `Separator` is a direct child of `#sidebar-contacts` | `Sidebar.test.tsx:287-289,317,379,744` | **Rewrite with `within()`/role**, with no depth selector; see §4.3 |
| C10 | There are no motion hooks in the print contract | `global.css:80-173` | **Change of AppLayout/Sidebar**: motion hooks + `@media print` with no animations |

---

## 3. Phase 2 — Proposed system

### 3.1 Tokens

See §2.2. The approved retuning is `base 0.2s`, `slow 0.3s`, plus `exit`,
`stagger`, `ease-enter` and `ease-exit`. `fast`, `ease-standard` and
`ease-emphasized` are kept.

**Reduced motion:** `fast/base/slow/exit/stagger` → `0.01ms` in
`tokens.css:416-422`; stagger delays cancelled with
`@media (prefers-reduced-motion: reduce)` in the component. Approved
behavior: **instant, with no fade**.

### 3.2 Tab change — alternative B (approved)

- The new page enters with `opacity 0 → 1` and `translateX(±10px) → 0`; the
  previous one is unmounted.
- Direction from the index of the tab: About (0) → Resume (1) enters from the
  right; Resume → About enters from the left. It is implemented with
  `data-motion-direction="forward|backward"` and CSS, with no inline `style`.
- Properties: `opacity` + `transform` (compositor-friendly).
- Duration: `--duration-slow` (0.3s), `--ease-enter`; `10px` is the midpoint
  of the 8–16 px range.
- **`key={active}` remounts the page.** This **resets the internal state** of
  the page: the index of the `TestimonialCarousel` goes back to 0 and any
  open `TestimonialDialog` is unmounted/closed. It is the expected
  behavior and **must be documented in the AppLayout spec** (and in that of
  the pages if applicable). No state is kept between tabs.
- Focus and ARIA: the wrapper receives no focus or role; the tabpanel keeps
  `aria-labelledby`, `tabIndex=0` and its id. The animation is only visual; the
  state changes immediately.
- Quick clicks: the wrapper with `key={active}` restarts the animation; the final
  state matches the last click.
- Print: `[data-motion-panel] { animation: none; transition: none; }` in
  `@media print`; the inactive panel (`data-print-only`) is not animated.

**Discarded alternatives:** A (crossfade only; less orientation) and C (View
Transitions API; variable support, coordination with React and a necessary
fallback). C stays as a future progressive enhancement with a fallback to B.

### 3.3 Expanding/collapsing contacts (approved)

**Mechanism:** `grid-template-rows: 0fr → 1fr` on `#sidebar-contacts` with an
inner wrapper (`min-height: 0; overflow: hidden`). It animates height with no
`height: auto` or JS measurement. It is a **justified** layout animation and it is
excepted in `foundations/motion.md` (C3).

**Structure:**

```text
<div id="sidebar-contacts" class="additional [additionalCollapsed]">
  <div class="additionalBody">          ← min-height: 0; overflow: hidden
    <Separator />
    <ul class="contacts">…</ul>
    <Button … />
  </div>
</div>
```

**Conceptual CSS:**

```css
.additional {
  display: grid;
  grid-template-rows: 1fr;
  visibility: visible;
  transition:
    grid-template-rows var(--duration-slow) var(--ease-enter),
    visibility 0s;
}
.additionalCollapsed {
  grid-template-rows: 0fr;
  visibility: hidden;
  transition:
    grid-template-rows var(--duration-exit) var(--ease-exit),
    visibility 0s var(--duration-exit);
}
.additionalBody {
  min-height: 0;
  overflow: hidden;
}
```

- **Accessibility:** `visibility: hidden` takes the block out of the accessibility
  tree and of focus when collapsing; the `visibility` is delayed until the
  end of the closing. `aria-hidden` is not used on focusable content.
- **≥1200px:** `.additional.additionalCollapsed { grid-template-rows: 1fr;
  visibility: visible; transition: none; }` (compound selector (0,2,0), as
  today) + the button stays hidden by CSS.
- **Chevron:** `transform: rotate(180deg)` with `--duration-base` 0.2s
  (`ease-standard`); it starts together with the expansion, with no delay.
- **Stagger:** only on the entrance. Contact items with `opacity 0 → 1` and
  `translateY(4px) → 0`, `--duration-base` 0.2s/`--ease-enter`, delays
  `0/30/60/90ms` (`--duration-stagger`) for a maximum of 4 items. Total:
  90 + 200 = **290ms**. On the exit there is no stagger: the container closes and
  clips.
- **Quick clicks:** transitions driven by a state class, with no JS timers;
  on toggling quickly the transition reverses and the final state matches
  `expanded`/`aria-expanded`.
- **Print:** `#sidebar-contacts { display: block; visibility: visible; }`
  (`display: block` already exists in `global.css:162-164`) + force
  `#sidebar-contacts li { opacity: 1; transform: none; transition: none; }` and
  `grid-template-rows: 1fr; animation: none`. Without this, printing with the block
  collapsed would leave items with `opacity: 0`.
- **Existing test:** the structural selector is not relocated. It is rewritten with
  `within()`/role; see §4.3.

### 3.4 Theme change (approved)

- In `ThemeProvider`, before applying `data-theme`, add
  `data-theme-switching` to `<html>`; apply the theme; remove it after two
  `requestAnimationFrame`, with an unconditional cleanup in the effect's return and
  cancellation if it is toggled again. Use `useLayoutEffect` so that the
  suppression exists before the paint of the new theme.
- Global rule in `src/styles/global.css`:
  `html[data-theme-switching] * { transition: none; }` (specificity (0,1,1),
  it beats the hashed classes with no `!important`). Include `*::before`/`*::after`
  if transitions are detected on pseudo-elements (Button `::before`).
- Result: the colors change in the same frame; there is no flicker or
  accent transition. The press of the ThemeToggle also stays instant
  during that frame (acceptable).
- **Approved test:** verify that the attribute is applied and removed, including
  the cleanup (with fake timers/rAF). The absence of a visual transition is
  inspection + QA in the browser.
- In addition the inert transition `transition: color` of `.contacts a` is removed
  (`Sidebar.module.css:386`); it is not replaced by an animated underline (out of
  scope).

### 3.5 Print

Rules in `src/styles/global.css` inside `@media print`:

```css
[data-motion-panel],
#sidebar-contacts,
#sidebar-contacts * {
  animation: none;
  transition: none;
}
#sidebar-contacts {
  display: block;          /* already exists */
  visibility: visible;
  grid-template-rows: 1fr;
}
#sidebar-contacts li {
  opacity: 1;
  transform: none;
}
```

- The active panel does not animate; the inactive one (`data-print-only`) has no animation.
- The contacts stay always expanded, as today (`global.css:152-164`).
- The collapsed state cannot leave items with `opacity: 0` on paper.
- The theme change does not happen in print (controls hidden; fixed palette).

### 3.6 Specification table per animation

| Interaction | Purpose | Properties | Duration | Easing | Delay | Reduced motion |
|---|---|---|---|---|---|---|
| Panel entrance on changing tab | orientation / continuity | `opacity`, `transform: translateX(±10px)` | `--duration-slow` (0.3s) | `--ease-enter` | 0 | no transform; instant swap |
| Panel exit | — | it is not animated (it unmounts) | — | — | — | — |
| Expansion of contacts | continuity / hierarchy | `grid-template-rows` 0fr→1fr | `--duration-slow` (0.3s) | `--ease-enter` | 0 | no height animation; instant |
| Closing of contacts | continuity | `grid-template-rows` 1fr→0fr, `visibility` | `--duration-exit` (0.22s) | `--ease-exit` | 0 | instant |
| Contact items (entrance) | hierarchy / stagger | `opacity`, `translateY(4px)` | `--duration-base` (0.2s) | `--ease-enter` | 0/30/60/90ms | no transform or delays |
| Contact items (exit) | — | the container clips them | — | — | 0 | — |
| Chevron | orientation | `transform: rotate(180deg)` | `--duration-base` (0.2s) | `--ease-standard` | 0 | instant |
| Theme change | avoid flicker | temporary global `transition: none` | 0 | — | — | the same |
| Existing hover/focus | feedback | no change of properties | `--duration-base` (0.2s) | `--ease-standard` | 0 | tokens at 0.01ms |
| Dialog entrance | orientation | `opacity`, `scale(0.96)` | `--duration-base` (0.2s) | `--ease-enter` | 0 | tokens at 0.01ms |
| Print | — | `animation/transition: none` | 0 | — | — | not applicable |

### 3.7 Testability

| Behavior | jsdom (test) | Inspection | Browser QA |
|---|---|---|---|
| Values of tokens and reduced motion | — | CSS of `tokens.css` | DevTools → Rendering / Animations |
| `data-theme-switching` is added/removed and there is a cleanup | yes (fake timers/rAF) | — | toggle the theme and observe the absence of a transition |
| Panel: wrapper/direction attribute and classes on changing tab | yes | CSS | real animation and 60fps |
| Panel: focus and `aria-labelledby` are kept | yes | — | real keyboard |
| Panel: quick clicks, final state | yes (user-event) | — | quick clicks |
| Panel: `key={active}` resets carousel/dialog | yes (internal state) | — | observation |
| Panel: height with no jump | — | — | DevTools / observation |
| Contacts: `aria-expanded`, collapse class, wrapper | yes | CSS | — |
| Contacts: height, stagger, chevron, `visibility` | — | CSS | DevTools / observation |
| Contacts: `Separator` present with no depth selector | yes (new test) | — | — |
| Reduced motion with no displacements | — | CSS | DevTools emulation |
| Print with no animations and contacts expanded | — | `global.css` | real Ctrl+P (user) |
| Theme change with no animation | partial (attribute) | `global.css` | toggle the theme |

---

## 4. Changes: specs, plans and tasks (draft on hold)

None of this is implemented until the approval. Order: **Foundation →
AppLayout → Sidebar → TestimonialDialog**. Each Change goes through spec → plan →
tasks → implementation → review. The `global.css` tasks are coordinated in
that order because the file is shared.

### 4.1 Foundation — tokens, theme and docs

**Spec:** `specs/foundation/Foundation/spec.md` (`Status: approved`, reopened
by this Change; it goes back to `implemented` when T18 closes).

**New RF (EARS):**

- **RF-9:** WHEN the user changes the theme (`toggleTheme` or a change of the
  system), THE SYSTEM applies `data-theme` with no color transitions: it adds
  `data-theme-switching` to `<html>` before applying the theme and removes it after
  two frames; IF the component unmounts or the theme changes again,
  THEN the attribute is cleaned up/cancelled.
- **RF-10:** THE SYSTEM exposes the approved motion tokens
  (`--duration-fast/base/slow/exit/stagger`, `--ease-standard/enter/exit/
  emphasized`) and with `prefers-reduced-motion: reduce` the five durations
  are worth `0.01ms`.

**Files:**

- `tokens/tokens.css`: values of §2.2; reduced motion override.
- `src/providers/ThemeProvider.tsx`: `data-theme-switching` + cleanup.
- `src/providers/ThemeProvider.test.tsx`: applies/removes, cleanup, quick
  change, fake timers/rAF.
- `src/styles/global.css`: `html[data-theme-switching] * { transition: none }`
  (+ pseudos if applicable).
- `foundations/motion.md`: tokens table, catalog (panel and contacts),
  `grid-template-rows`, reduced motion with delays, theme with no transitions.
- `docs/README.md`: record the new decision (#106) on approval.

**Plan (decisions):**

1. `useLayoutEffect` so that the suppression beats the paint; double rAF to
   remove; cleanup with `cancelAnimationFrame`.
2. The global rule uses `html[data-theme-switching] *` (0,1,1) with no
   `!important`; pseudo-elements are verified.
3. The anti-flash of `index.html` is not touched: the suppression is only for
   interactive changes.
4. `--duration-slow` is repurposed; no new alias is added.
5. The token tests are inspection ones; the ThemeProvider one is jsdom.

**Tasks (Tn):**

- **T1:** tokens + reduced motion (CSS). Done: exact values, override,
  lint/typecheck/test green; inspection.
- **T2:** red test of `data-theme-switching` (applies, removes, cleanup).
- **T3:** implementation in `ThemeProvider` + global rule. Done: test green,
  theme change with no transition (inspection/QA), no regressions.
- **T4:** docs (`motion.md`, `docs/README.md`) and update of the spec.
  (The spec is updated before T1, at the gate of this Change.)

### 4.2 AppLayout — panel entrance

**Spec:** `specs/layout/AppLayout/spec.md`.

**New RF (EARS):**

- **RF-9:** WHEN the user changes tab, THEN THE SYSTEM brings in the
  tabpanel's content with `opacity 0→1` and `translateX(±10px)→0` according to the
  direction (About→Resume from the right; Resume→About from the left),
  with `--duration-slow`/`--ease-enter`; the wrapper is remounted with
  `key={active}` and **resets the internal state of the page** (carousel at 0,
  dialog closed); the focus and `aria-labelledby` do not change; with reduced motion
  the change is instant; in print there is no animation.

**Files:**

- `AppLayout.tsx`: wrapper `data-motion-panel` with `key={active}` and
  `data-motion-direction`; direction calculated from the previous index (ref or
  state). Prefer a testable pure function `getTabDirection(prev, next)`.
- `AppLayout.module.css`: entrance `@keyframes`/transition, reduced motion,
  print.
- `AppLayout.test.tsx`: wrapper/attribute, focus, ARIA, quick clicks, state
  reset (carousel/dialog), reduced motion not testable in jsdom.
- `global.css`: `[data-motion-panel]` print (if it is centralized).
- `plan.md` / `tasks.md`: add the Change.

**Plan (decisions):**

1. `key={active}` on the wrapper (not on the tabpanel or on the pages): it remounts
   only the content, not the panel or NavTabs.
2. Direction with a `ref` of the previous index; the pure function is tested
   separately.
3. `10px` of displacement; the height is not animated.
4. Neither `flushSync` nor View Transitions is used.
5. The wrapper has no role or `tabIndex`; the tabpanel is still the focus.
6. State reset documented: it is an accepted consequence of `key`.

**Tasks (Tn):**

- **T1:** red test of direction/wrapper/quick clicks.
- **T2:** implementation of the wrapper + entrance CSS. Done: test green,
  focus/ARIA intact, no jank (QA).
- **T3:** test of the state reset (carousel at 0 / dialog closed) and of
  reduced motion/print by inspection. Done: documented in the spec.
- **T4:** update of `plan.md`/`tasks.md` and visual QA with the app served.

### 4.3 Sidebar — expansion of contacts

**Spec:** `specs/layout/Sidebar/spec.md`.

**Changes:**

- Remove “Do not animate the height of the contacts block” (`:199`).
- Adjust RF-3/RF-4 and Responsive: `.additional` uses grid `0fr/1fr` + wrapper;
  deferred `visibility`; ≥1200 forced open; print expanded.
- Add RF-11 (EARS): WHEN the user expands/collapses the contacts, THE
  SYSTEM animates `grid-template-rows` (0.3s entrance / 0.22s exit) and the items
  enter with a stagger of 30ms (max. 4); the chevron rotates in 0.2s; with reduced
  motion everything is instant; in print there is no animation and the items stay
  visible.
- Update Expected tests: wrapper/classes, `aria-expanded`, Separator with no
  depth selector, a11y collapsed/expanded.
- Update “Do not”: remove the height prohibition; keep “no
  animated underline” (decision 6).

**Test of `Sidebar.test.tsx:317` (approved):** the structural selector is not
relocated and the Separator's contract is not changed. It is rewritten with
`within()`/role and **the same assertion** (there is a Separator between the info and the
list). As the `Separator` is a `<div aria-hidden>` **with no role**, the approved
query is:

```ts
const region = screen.getByRole("complementary", { name: LABELS.region });
const email = within(region).getByRole("link", { name: "alex@example.com" });
const contactsList = email.closest("ul");
expect(contactsList?.previousElementSibling).toHaveAttribute("aria-hidden", "true");
```

It does not depend on the depth of the wrapper and uses a query by role + text.
`getByRole("separator")` is not used (the Separator has no role by contract).

**Files:**

- `Sidebar.tsx`: wrapper `additionalBody`; keep `#sidebar-contacts`,
  classes and `aria-expanded`; no inline `style`.
- `Sidebar.module.css`: grid + visibility, stagger, chevron, `@media
  (min-width: 1200px)`, reduced motion; remove the inert `transition: color`.
- `Sidebar.test.tsx`: query with `within()`/role; the same assertion.
- `global.css`: print of `#sidebar-contacts` (forced expansion, no
  animation, visible items).
- `plan.md` / `tasks.md`: add the Change.

**Tasks (Tn):**

- **T1:** red test of the wrapper/classes and of the Separator with `within()`.
- **T2:** implementation of the grid + visibility + wrapper. Done: test green,
  `aria-expanded` intact, no `display:none` at ≥1200.
- **T3:** stagger + chevron + reduced motion. Done: CSS inspected, no
  delays with reduced motion.
- **T4:** print + a11y collapsed/expanded. Done: items visible in print,
  axe green.
- **T5:** docs/spec/plan/tasks and visual QA (expansion, quick clicks, height).

### 4.4 TestimonialDialog — entrance easing

**Spec:** `specs/content/TestimonialDialog/spec.md` (Entrance row, `:79`).

- Change `--ease-standard` → `--ease-enter`; keep `--duration-base`
  0.2s and `@starting-style`; no exit.
- `TestimonialDialog.module.css`: update the transition and the comment.
- It needs no new test (CSS); it is verified by inspection/QA.
- Update the piece's `plan.md`/`tasks.md` (minor Change).

### 4.5 Documents and specs to update

| Document / spec | What changes |
|---|---|
| `tokens/tokens.css` | values + `exit`/`stagger`, `ease-enter`/`ease-exit`, reduced motion |
| `foundations/motion.md` | tokens, catalog, grid/height, theme with no transitions, reduced motion with delays |
| `src/styles/global.css` | theme suppression; print of panel and contacts |
| `specs/foundation/Foundation/spec.md` (+ plan/tasks) | RF-9/RF-10; real content; tokens |
| `specs/layout/AppLayout/spec.md` (+ plan/tasks) | RF-9 panel entrance and state reset |
| `specs/layout/Sidebar/spec.md` (+ plan/tasks) | RF-11 expansion; removal of “Do not animate the height” |
| `specs/content/TestimonialDialog/spec.md` (+ plan/tasks) | `--ease-enter` |
| `docs/README.md` | new decision (#106) on approval |
| `docs/memory.md`, `README.md`, `docs/diagnostics.md` | when closing the implementation/gate (#86) |

### 4.6 Verification of the implementation

- `npm run lint`, `npm run typecheck`, `npm test` green per task and when closing
  each piece; `npm run build` when closing each piece/gate (#80).
- DevTools → Performance/Animations: real durations = tokens; no jank;
  60 fps.
- No abrupt layout shift when expanding/collapsing contacts; the content below
  moves smoothly.
- Quick clicks on tabs and on the toggle: correct final state; the carousel is
  reset when changing tab (documented behavior).
- `prefers-reduced-motion`: no displacements or stagger; instant
  opening/closing.
- Keyboard: focus and `aria-selected`/`aria-expanded` correct during and after.
- Print: no animations; contacts expanded; both panels.
- Theme change: no color transitions or flickers.
- axe with no violations in collapsed/expanded and on both tabs.

---

## 5. Prior content Change (approved; data received and applied on 2026-11-11)

**Goal:** replace the example content of `src/content/cv.{en,es}.json`
with the real CV, in both languages, without touching the schema.

> **Execution status (§XV in `docs/diagnostics.md`).** Done: steps 1–4, 6 and 7
> of §5.5 — real content en/es, `testimonials: []`, contact with no phone/WhatsApp,
> PDF and avatar in `public/`, tests adapted (`3855eb0` `befb0db` `63f6665`) and CTA
> with `assetUrl` (`5f6c0a6`); suite **447/40**, `validate:content` and `build` ✅.
> Also done, **step 5**: the spec/plan/tasks of Foundation were aligned with the
> real content, approved by the user as **decision #109** (`docs/README.md`).
> Also done, **step 8**: visual QA **APPROVED** with the app served by the
> user (§XVI in `docs/diagnostics.md`, report in `docs/qa-report.md`) — grid
> 375–1440 × themes × languages with no overflow or overlaps and chevron↔name gap at 375px with
> the real name = **72.84px**.
> Missing: **step 9** (the motion Changes, after approving specs/plans/tasks).

### 5.1 Data and assets

The user passes the real content in a file. It must bring, per language:

| Field | Format / restriction |
|---|---|
| `profile.name` | text |
| `profile.headline` | text (Badge of the Sidebar) |
| `profile.avatar.src` | public path `/images/...` or URL `https://...` |
| `profile.about` | array of paragraphs (≥1) |
| `profile.downloadCvUrl` | optional; public path or `https://...`; if it is missing, the CTA is not shown |
| `contact[]` | kebab-case `id`, `type` ∈ `email/location` (decision: **no phone or WhatsApp**), `value`; optional `href` |
| `social[]` | `id`, `network` ∈ list of the schema, https `url` |
| `services[]` | `id`, `title`, `description`, `icon` ∈ list of the schema |
| `education[]` / `experience[]` | `id`, `title`, `organization`, `start`/`end` (`YYYY` or `YYYY-MM`; `end: null` = present), `description` |
| `skills[]` | strings |
| `testimonials[]` | **empty array** (approved decision) |

**Assets:**

- `public/images/avatar.*` (real photo; the current content uses
  `/images/avatar.png`).
- If there is a `downloadCvUrl`: PDF in `public/cv/...` (or an https URL). The link must
  work with the deploy `base`. The `href` of the CTA was covered by
  `assetUrl` in `5f6c0a6` (previously only `HexAvatar`/avatar); the PDF is in
  `public/cv/Juan-Manuel-Ibanez-CV.pdf`. **Pending:** check it at the real URL
  of GitHub Pages after the push/deploy (outside the agents' scope).
- With no real testimonials there are no testimonial avatars to add.

### 5.2 Verification of the empty testimonials section

**The section is already hidden correctly:**

- `AboutPage.tsx:133`: `cv.testimonials.length > 0` → it mounts neither the `h2` nor the
  carousel with `[]`.
- `TestimonialCarousel.tsx:263`: with `testimonials.length === 0` it returns
  `null`.
- `AboutPage/spec.md` RF-2 requires it; `TestimonialCarousel/spec.md` RF-1
  requires it.
- No production code has to be touched because of `testimonials: []`.

**But the tests of `AboutPage.test.tsx` assumed non-empty content (adjusted in
`befb0db`, with a non-empty local fixture taken from `data/cv.example.{en,es}.json`):**

| Test | Problem with `testimonials: []` | Proposed adjustment |
|---|---|---|
| Test 4 (testimonials region, `:409-483`) | It throws if `TESTIMONIALS.length === 0` | Use a non-empty local fixture (`TESTIMONIALS_FIXTURE`, 1–2 items) injected by the `useCv` harness; keep the asserts of region/siblinghood/templates |
| Test 5b (empty, `:486-529`) | It throws if the real content brings no testimonials | Remove the throw; with the real content empty, verify the absence of `h2`/region and a single `h1`. Add a complementary case with the non-empty fixture if discriminating both sides is wanted |
| Test 6 (locale es, `:531-603`) | It throws if `cv.es.testimonials` is empty | Remove testimonials from the scenario or use the fixture; keep about/services and the texts of `uiEs` |
| Test 7 (a11y) | It does not depend on testimonials | No change |
| Test 8 (className) | It does not depend on testimonials | No change |

The fixture must be fictitious data (D4), not the real CV, and live in the test
file (or in a test helper) without touching `src/content`.

### 5.3 Change to the content test (Foundation)

Approved and **applied in `befb0db`**:

- **Remove only** the “faithful copy” case of `src/content/content.test.ts:101-106`
  (`keeps every other field identical to data/cv.example.{en,es}.json`).
- **Keep** the test of the `$schema` (`:96-99`).
- **Add/keep** a test that validates **both** example files against
  the schema:

```ts
it("validates both example files against the schema", () => {
  expect(validateCv(exampleEn)).toBe(true);
  expect(validateCv(exampleEs)).toBe(true);
});
```

- `exampleEn`/`exampleEs` are still used (the second one stops being an unused
  import).
- `exampleBase` (in-memory mutations) is kept for the rejections.
- The title of the `describe` “cv.{en,es}.json (copies of the data/ examples)”
  becomes something like “cv.{en,es}.json (content files)”; the test of the `$schema`
  stays the same.

### 5.4 Impact on the Foundation spec

**Approved by the user and applied (decision #109).** The text of the
proposal stays as a record; what was executed is exactly this, with two corrections that
the user asked for: the `testimonials/*.svg` **are kept** (the fixture
`data/cv.example.{en,es}.json` uses them) and the Change was recorded as **#109**, referenced
in §XV and in the note of T9.

- Purpose (line 14): “validated initial example content” → “validated real
  content (the examples of `data/` stay as a schema/tests fixture)”.
- Anatomy (line 89): “the two JSON files are created by COPYING data/cv.example…” →
  “validated real content en/es; `data/cv.example.{en,es}.json` stays in `data/`
  as a tests fixture”.
- Styles (lines 181-182): the placeholders `avatar.svg`/`testimonials/*.svg` are no
  longer those of the site: `public/images/avatar.png` (real photo) and
  `public/cv/Juan-Manuel-Ibanez-CV.pdf`.
- Expected tests: the current list **did not ask for the faithful copy** (it asks for parity, order
  of dates, rejections and an up-to-date schema, all in force); the validation of
  both examples of the kit against the schema is added.
- RF-7 does not change (only validated data).
- “Do not”: do not edit the examples so that they match the real CV.
- In `plan.md` (row T9) and `tasks.md` (T9 “Done when”) “copy of
  `data/cv.example…`” has to be changed to “validated real content”, leaving a record of the Change.

### 5.5 Plan of the content Change

1. ✅ Receive from the user the file with the real CV en/es and the assets.
2. ✅ Update `cv.en.json` and `cv.es.json` keeping `$schema`, `locale`,
   ids/order and non-translatable fields (`63f6665`).
3. ✅ Adjust `content.test.ts` (remove only the copy test; add validation
   of both examples) (`befb0db`).
4. ✅ Adjust `AboutPage.test.tsx` for the `testimonials: []` scenario (§5.2)
   (`befb0db`).
5. ✅ Update the spec/plan/tasks of Foundation (§5.4) with the user's
   approval → **decision #109**.
6. ✅ Copy assets to `public/…`; paths with `assetUrl`/base, including the CTA
   (`63f6665` + `5f6c0a6`).
7. ✅ `npm run validate:content`, `npm test` (447/40), `npm run build`.
8. ✅ Visual QA: Sidebar (avatar/contacts/CTA), About (services; no testimonials
   section), Resume (education/experience/skills), both languages and themes, with the
   app served by the user (#91). Chevron↔name gap at 375px with "Juan Manuel
   Ibáñez" = **72.84px**, no overlaps → APPROVED (§XVI, `docs/qa-report.md`).
9. ⏳ Only afterwards, start the motion Changes.

**Tasks (Tn):** steps 1–4 and 6–7 were executed as **post-delivery
maintenance authorized by the user** (§XV), not as Tn of a spec; that is why there
are no new tasks to mark. What remains (step 5) is a **Change** of the Foundation
spec and is handled with its own approval.

---

## 6. Approvals and gates

### Approved

1. **Location:** this proposal lives in `specs/motion/proposal.md`.
2. **Tokens:** `base 0.2s`, `slow 0.3s`, `exit 0.22s`, `stagger 0.03s`,
   `ease-enter`, `ease-exit`; `fast`/`standard`/`emphasized` with no change.
3. **Tabs:** alternative B; document that `key={active}` remounts the page and
   resets its internal state (carousel/dialog).
4. **Sidebar:** grid `0fr→1fr`; remove the height prohibition; test with
   `within(region) → closest("ul") → previousElementSibling`, without changing the
   Separator's contract.
5. **Theme:** `data-theme-switching` with a test of application/removal/cleanup.
6. **Reduced motion:** instant (0.01ms), with no fade.
7. **Dialog:** `--ease-enter`; no animated underline in contacts.
8. **Content:** `testimonials: []`; `contact[]` with no phone or WhatsApp;
   remove only the “faithful copy” case and validate both examples against the schema.
9. **Dirty tree:** do not start until the user's confirmation.

### Pending to move forward

1. **Real CV:** the user passes it in a file, with assets.
2. **Confirmation of the clean tree:** the user gives notice when they have resolved
   `src/utils/assetUrl.ts`, `HexAvatar.tsx`, `Sidebar.tsx` and
   `vite.config.ts`.
3. **Approval of the specs/plans/tasks** of §4 (Foundation, AppLayout,
   Sidebar, TestimonialDialog) before writing code.
4. **Approval of the adjustment of the AboutPage tests** because of `testimonials: []`
   (§5.2); it is a necessary consequence of the empty real content.
5. **Specs in `specs/`:** this proposal is in `specs/motion/proposal.md`;
   the Changes are transferred to the existing specs only with the approval of
   each gate.
