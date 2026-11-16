# NavTabs
Status: implemented

## Purpose

Main navigation between the **About** and **Resume** panels, with **tablist**
semantics. It replaces the theme's hamburger menu: always visible, with no
drawer, at all breakpoints. Visually it is a corner tab (`CornerTab`) in the
top right corner of the content card.

Visual reference: tab with a `surface-raised` background, thin border, active item in
the accent color, inactive ones in the text color.

## Requirements (EARS)

- RF-1: WHEN the component receives `items`, THEN THE SYSTEM renders a named `role="tablist"` with one `role="tab"` per item in that order, applying roving tabindex (only the active tab with `tabIndex=0`).
- RF-2: THE SYSTEM makes **all the tabs point with `aria-controls` to the same `panelId`** (a single tabpanel); the existence and the content of that panel are AppLayout's responsibility, not verifiable in this piece.
- RF-3: WHEN the user clicks an inactive tab, THEN THE SYSTEM invokes `onChange(id)` once; IF they click the active tab, THEN it does not invoke it.
- RF-4: WHEN focus is on a tab and a `keydown` of Arrow ←/→, Home or End is pressed, THEN THE SYSTEM moves focus to the resulting tab (wrapping around at the ends) **and emits `onChange` of that tab** (automatic activation: the visual part depends on the re-render of the parent, which is controlled); IF the resulting tab is the same one (a single item), THEN it does not emit `onChange`; IF Space is pressed, THEN THE SYSTEM does `preventDefault` (it does not scroll the page) and activates by native click; Enter and the other keys are left to the native behavior with no additional effect. ↑/↓ do not move focus (horizontal tablist).
- RF-5: THE SYSTEM distinguishes the active tab with `--color-accent-text` and `aria-selected="true"`; the inactive ones go at 80% opacity and at 100% with a 2px underline on hover. Verification: `aria-selected` by test; the rest by CSS inspection + QA F5.
- RF-6: THE SYSTEM keeps the navigation visible at all breakpoints, with no hamburger, drawer or overlay. In print the shared styles hide it (G-D: no `@media print` of its own).
- RF-7: IF `items` comes empty, THEN THE SYSTEM renders nothing (a tablist with no tabs is invalid for axe).

**Invariants of the consumer (AppLayout):** `activeId` must always match an `item.id` (useHashTab guarantees a valid id or the default); NavTabs does **not** validate or fall back. The `item.id` values are used as is in `getTabId`: no spaces or problematic characters (invariant of AppLayout/`useHashTab`).

## Anatomy

```html
<Box variant="outer" as="section">                 ← content card (AppLayout)
  <CornerTab size="md" placement="float">
    <div role="tablist" aria-label="Sections" aria-orientation="horizontal">
      <button role="tab" id="tab-about"  aria-selected="true"  aria-controls="main-panel" tabindex="0">About</button>
      <button role="tab" id="tab-resume" aria-selected="false" aria-controls="main-panel" tabindex="-1">Resume</button>
    </div>
  </CornerTab>
  <div role="tabpanel" id="main-panel" aria-labelledby="tab-about" tabindex="0"> … </div>
</Box>
```

NavTabs renders **only** the CornerTab with the tablist. The tabpanel is
rendered by AppLayout, using `panelId` and the id of the active tab (`getTabId`).

There is **a single tabpanel** whose content changes; all the tabs control it
(`aria-controls` points to the same id). It is valid for the pattern and avoids mounting
hidden panels.

## API

```ts
export interface NavTabItem {
  id: string;      // "about" | "resume"
  label: string;   // already translated
}

export interface NavTabsProps {
  items: readonly NavTabItem[];
  activeId: string;                 // controlled
  onChange: (id: string) => void;
  panelId: string;                  // id of the tabpanel
  label: string;                    // aria-label of the tablist, translated
  /** Joined to the root of the piece — it is passed on to the base class of `CornerTab` (G-B). */
  className?: string;
}

/** Id of the tab element for an item. AppLayout uses it for aria-labelledby. */
export const getTabId = (id: string) => `tab-${id}`;
```

## Behavior

| Interaction | Result |
|---|---|
| Click on a tab | `onChange(id)`; focus stays on the pressed tab (native to the `<button>`, NavTabs does not re-manage focus after a click) |
| Arrow → / ← (focus on a tab) | It moves focus to the next/previous one **and emits `onChange`** (automatic activation; the visual part depends on the parent), wrapping around |
| Home / End | Focus and `onChange` of the first / last |
| Tab | It leaves the tablist toward the tabpanel (only the active tab is tabbable) |
| Enter | It activates the focused tab (native click of the `<button>`) |
| Space | `preventDefault` (it does not scroll the page) + activates by native click |
| Click on the already active tab | It does not call `onChange` |

**Roving tabindex:** the active tab has `tabIndex=0`; the rest, `-1`.

## Sync with the URL

It is done by the `useHashTab` hook in AppLayout, not by NavTabs (NavTabs is controlled).
Spec, behavior and tests: [specs/hooks/useHashTab/spec.md](../../hooks/useHashTab/spec.md).

Restriction that affects this component: **no DOM element may
have `id="about"` or `id="resume"`**. The tabs use `getTabId` (`tab-about`,
`tab-resume`) and the panel is `main-panel`.

## Styles and tokens

| Part | Value |
|---|---|
| Container | `CornerTab size="md" placement="float"` (absolute < lg, floating ≥ lg) |
| tablist | `display: flex; align-items: stretch; align-self: stretch; gap: var(--nav-tab-gap);` (24px < 992 → 40px) |
| tab | No background or border; `display: flex; align-items: center; font-size: var(--font-size-nav); font-weight: var(--font-weight-medium); color: var(--color-text); padding-block: var(--space-2); white-space: nowrap; cursor: pointer;` |
| first/last tab | `padding-inline` of `--corner-tab-padding-inline` on the outer edge + an equivalent negative margin: the outer padding stays inside the `<button>` without moving the text |
| inactive tab | `opacity: 0.8` (4.92:1 light / 7.96:1 dark on `surface-raised`, recorded in `docs/tokens/contrast.md`); `text-decoration: underline 2px transparent; text-underline-offset: 0.375rem;` |
| inactive tab hover | `opacity: 1;` `text-decoration-color: currentColor` (the underline appears) |
| active tab (`[aria-selected="true"]`) | `opacity: 1; color: var(--color-accent-text);` no underline, no change on hover |
| Focus-visible | `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset); border-radius: var(--radius-8);` |
| Transition | `opacity` and `text-decoration-color` in `var(--duration-base) var(--ease-standard)`; the `color` changes instantly (without dragging the accent of the previous theme) |

The hover does not use `--color-heading`: in light it is equal to `--color-text` and the
change would not be seen. It uses opacity + underline, which work the same in both themes.

The `<button>` takes up the whole visual area of the corner tab, including the outer
padding: the tablist and the buttons stretch to the height of the `CornerTab`
(60px ≥ 992 / 48px < 992) and the padding of `:first-child`/`:last-child` is
compensated with a negative margin so as not to move the text. The gap between tabs
(40px/24px) is not clickable. The hover underline is `text-decoration` (not
a pseudo-element), so it does not intercept clicks.

Reference measures (full size, ≥ lg): height 60px, horizontal padding
32px, separation between items 40px, text 16px/500. At < lg: height 48px, padding
20px, separation 24px, text 14px/500. All resolved through tokens. The outer horizontal
padding is part of the button's hit area; the gap stays outside.

The active one is distinguished **by color** (accent vs text) with contrasts
≥ 5.47:1 in both themes; in addition `aria-selected` exposes it to assistive technologies.

## States

| State | Effect |
|---|---|
| Inactive | text `--color-text` at 80% |
| Inactive hover | 100% + 2px underline |
| Active | `--color-accent-text`, 100%, no underline |
| Focus-visible | standard ring (`--focus-ring-*`) |

## Responsive

| Viewport | Behavior |
|---|---|
| ≥ lg (992) | Full-size and **floating** tab (`placement="float"`): the panel's `h1` flows to its left using the real width of the tab, with no fixed reserves. **Contract dependency (CornerTab → float):** the content that follows the tab in the stretch that coexists with it **cannot** create its own formatting context (flex/grid/`overflow`≠visible/`flow-root`); AppLayout guarantees it and the reviewer verifies it in F4/F5. The floating corner tab must stay above the positioned `h1`: `CornerTab .float` uses `z-index: var(--z-raised)`; with `auto`, the `h1` intercepts the clicks of the lower half. |
| < lg | Compact tab, **always visible**, anchored on the right. The panel's `h1` goes below (AppLayout adds the space). |

There is no hamburger, drawer or overlay at any size. "With 2 items it fits in 320px" is a **QA F5** verification (not a test or inspection one).

## Accessibility

- `role="tablist"` with `aria-label` and `aria-orientation="horizontal"`.
- `role="tab"` on `<button type="button">`, with `id`, `aria-selected`, `aria-controls`.
- The `<button role="tab">` takes up the whole visual area of the corner tab (including the
  outer padding); the gap between tabs is not clickable.
- Tabpanel with `aria-labelledby` = id of the active tab and `tabIndex=0`
  (the panel starts with text, not with a control).

## Expected tests

1. It renders a `tablist` with the name received and one `tab` per item, in order.
2. Only the active tab has `aria-selected="true"` and `tabIndex=0`; the rest `false` / `-1`.
3. Each tab has `id = getTabId(item.id)` and `aria-controls = panelId`.
4. A click on an inactive tab calls `onChange(id)` once.
5. A click on the active tab does not call `onChange`.
6. Right arrow from the last one goes back to the first: focus + `onChange`.
7. Left arrow from the first one goes to the last.
8. Home / End focus and activate the first / last.
9. With `items` of a single element, the arrows do not fail or call `onChange`.
10. With empty `items` it **renders nothing** (empty `container`): a tablist with no tabs is invalid for axe.
11. There is **no** menu button (`queryByRole("button", { name: /menu|menú/i })` is null).
12. `expectNoA11yViolations` with no violations (rendered together with a tabpanel with the correct id).

The full clickable surface and the stacking over the `h1` are verified
by CSS inspection + visual QA (jsdom does not compute layout or hit-testing,
#101).

## Do not

- Do not use `<a href="#about">` for the tabs (the chosen semantics is tablist).
- Do not render both panels hidden with `hidden` except in `@media print`
  (AppLayout resolves it).
- Do not reintroduce the hamburger button or the open/closed state.
- Do not resolve the overlap with the `h1` using `pointer-events: none` on the
  `h1` (it breaks text selection); it is resolved with `z-index` on
  `CornerTab .float`.
