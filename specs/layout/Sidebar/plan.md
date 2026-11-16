# Plan — Sidebar

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/Sidebar/Sidebar.tsx` | `Box variant="outer" as="aside">` with baseInfo (avatar/name/Badge/networks), icon-only disclosure button (F5 Change: no CornerTab) with `data-print-hide` on its root, `.additional` (Separator + contacts + CTA) | RF-1…RF-4, RF-6…RF-10 |
| `src/components/Sidebar/getContactHref.ts` | pure function `getContactHref(item)` (decision 11: the piece's folder, no React, C1) | RF-5 |
| `src/components/Sidebar/Sidebar.module.css` | grid by breakpoint, protruding avatar (negative offset), networks/links/states, collapse by class + `@media (min-width: 1200px)` (CSS-only 8=a), `.additional` gap with the Separator stretch | RF-3, RF-7, RF-9 |
| `src/components/Sidebar/getContactHref.test.ts` | table of cases (test 7) | RF-5 |
| `src/components/Sidebar/Sidebar.test.tsx` | tests + a11y closing case | all |
| `src/components/Sidebar/index.ts` | re-export (`Sidebar`, types, `getContactHref`) | — |

## Pure functions and algorithm

- `getContactHref(item)`: `item.href ?? derived` — exact derivation in spec → API (table: mailto / tel with the initial `+` kept / wa.me digits only / location `undefined`); no digits after cleaning → `undefined`. Pure, tested separately (C1).
- Type→icon map for `IconBox`: `email→mail`, `phone→phone`, `whatsapp→message-circle`, `location→map-pin` (local constant, not exported).

## Interface

`SidebarProps { profile; contact; social; labels; className? }` (spec → API; `className` to the `Box as="aside">` — Box applies the join). Data **only by props** (RF-8, C2 with no exception here). The id of the disclosure's region: local constant `"sidebar-contacts"` (matching `foundations/layout.md` → print).

## Decisions

- **CSS-only ≥ xl (8=a):** the disclosure button is always mounted; the module's 1200 media hides it (`display: none`) and forces `display: block` on `.additional`. The initial collapse is by **class** (`data-collapsed` or a module class on `.additional`) — never inline `style` — so that the shared print can force the expansion (RF-10). *Discarded:* `matchMedia` in JS (forbidden without an explicit mandate).
- **F5 Change 2026-10-08 (redesign of the disclosure, the user's decision in view of D1/B-3 of `docs/qa-report.md`):** the CornerTab of the disclosure is removed (its `surface-raised` background overlapped the name at 375px) in favor of an icon-only button: gold chevron (`Icon chevron-down` + `aria-hidden`), no background/border, absolute at the top right of the root, alternating `aria-label` `showContacts`/`hideContacts` (the accessible name replaces the visible text), `data-print-hide` on its root. Identity at < md/md–lg shifted to the left next to the avatar (`padding-inline-end` reserve only if the name reaches the corner); networks centered in the available space; avatar −15% in the < md range (base token `--size-avatar-sidebar: 6.375rem` — **the user applies it in `tokens.css`**; md–lg 9rem and xl 11.25rem are NOT touched: F8 stays open only for md–lg). The tests of T4 that asserted the CornerTab (structure + `toHaveClass(cornerTabBaseClass)`) are updated to the direct button within this Change (prepared and approved at the F5 gate — precedent F3/T5 div model): the `test(Sidebar): T7` declares which old assertions are relocated and why; no other contract of T2/T3/T5/T6 is touched.
- Local `expanded` state, default `false` at all < xl (decision 11); the chevron rotates via a class (`transform` + `--duration-base`, decorative Icon `chevron-down`).
- Links: `target="_blank" rel="noopener noreferrer"` only on networks and external `href`/whatsapp; `mailto:`/`tel:` with no target (decision 10). The detection of "external" is by type/explicit field, not a domain heuristic.
- Avatar `<img>` with no `width/height` attributes (decision 9): the CSS sizes it with `--size-avatar-sidebar` (F8 **closed** by #105b: base 6.375rem <md applied, 9rem ≥768 final — tokens green after the user's edit 2026-10-08).
- **Change 2026-11-10 (dynamic alt):** the alt of the avatar stops being read from `profile.avatar.alt` (a field removed from the schema) and arrives through `labels.avatarAlt`; AppLayout derives it from `profile.name` with `format(t.sidebar.avatarAlt, { name })`. The piece composes no texts (RF-8) and the alt follows the name when it is edited in `cv.{en,es}.json`. *Discarded:* keeping `alt` in the content (it goes out of sync when the name changes) and `alt={profile.name}` (it loses the descriptive text "Portrait of"/"Retrato de").
- `useCv()` forbidden inside (RF-8); `BRAND_NAMES`/`BrandIcon` for networks (accessible name = brand).
- The CTA uses `Button href={downloadCvUrl} download icon="download" fullWidth` (F2 primitive).
- `.additional`: stack with a token `gap`; in the stretch of the `Separator` it must not accumulate (Separator RF-4). The exact mechanism is chosen by the builder within its task and documented in the comment (e.g. a negative margin compensating the gap on the ones adjacent to the separator); the reviewer verifies it by inspection + F5.
- Sticky (≥900px) and print (forced expansion, hiding button/CTA) **are not tasks of this piece** (AppLayout/shared styles; F4/F5).

## Test strategy

Isolated render with fixture props (the content of `cv.en.json` as a base; no providers: the piece consumes no hooks — RF-8). `getContactHref` with its table (7 cases). Sidebar: named `complementary` region; name/badge/avatar alt; networks with the brand's aria-label + target/rel; contacts: label + derived link (`mailto`/`tel` **without** target; whatsapp with target); location with no link; disclosure: `aria-expanded` false→click→true + the text toggles + `aria-controls` points to an existing one; CTA present/absent according to `downloadCvUrl`; combined empty (test 8); closing `expectNoA11yViolations` collapsed and expanded — the contacts' `IconBox` are tone gradient: mount a scaffold `AccentGradientDefs` (IconBox criterion). What is not testable (breakpoints, 1200 media, print, sticky): inspection + QA F5 (#101).

Coverage: T1→RF-5 · T2→RF-1,RF-6 (networks),RF-8 · T3→RF-6 (contacts),RF-9 · T4→RF-3,RF-4 (re-delegated in part to T7 by the F5 Change) · T5→RF-2 · T6→RF-7,RF-10 + closing · **T7 (F5 Change)→RF-3,RF-4 (new model),RF-10 (hook) + re-scoping of the tests of T4 + renewed a11y closing case** · **T8 (Change 2026-11-10)→RF-1 (derived alt),RF-8**.

## Annex — Motion change 3 (2026-11-13, #106/#116; Spec+Plan+Tasks gate approved in 3 rounds with adjustments by the user)

**Files:** `src/components/Sidebar/Sidebar.tsx`, `Sidebar.module.css`,
`Sidebar.test.tsx`, `src/styles/global.css` (print only; owner integrator).
**Not touched:** providers, AppLayout, `src/test/**`, configs,
`allowExportNames`.

**Decisions:**

- **P1' — `data-contacts-animate` reflects `expanded`** (attribute on
  `#sidebar-contacts` only when `expanded`). The block always starts
  collapsed (decision 11) and at ≥1200 there is no operable button: nothing animates on the
  initial render or on the xl load. *Discarded:* an extra `hasToggled` state
  (redundant, adjustment 2 of the user in round 2).
- **P2' — Stagger with `@keyframes item-enter` + `animation-delay:
  calc(n × --duration-stagger)`** per `:nth-child(1–4)`, cap
  `:nth-child(n+5)` at the 4th step, **`animation-fill-mode: backwards`** (the items
  are not seen before their step). *Discarded:* `transition-delay` in nth-*
  selectors ((0,2,0)+, forbidden by #116).
- **P3' — The transitions (rows/visibility) only in the base classes**
  `.additional` and `.additionalCollapsed` (0,1,0), ordered in the file
  (the collapse one afterwards). *Discarded:* depending on the compound/simple order.
- **P4' — Single wrapper `.additionalBody`** receives the stack of `.additional`
  (gap + Separator stretch + margins migrate; decision 11 is still in force on the
  wrapper). `#sidebar-contacts` stays as a one-row grid with a single child.
- **P5' — ≥1200 override with the simple class `.additionalCollapsed`** (0,1,0, at the
  end of the module): `grid-template-rows: 1fr; visibility: visible;
  transition: none;` — the `transition: none` prevents enlarging the window with
  the block collapsed from triggering the height animation; legal under #116 clarified
  (amendment in `docs/README.md`). *Discarded:* the compound (0,2,0) that
  proposal §3.3 showed (unnecessary with the order of P3'; adjustment of the
  user in round 1: keep simple classes).
- **P6' — Reduced motion with no rule of its own:** all the delays derive from
  `calc(n × --duration-stagger)` and the delay of the `visibility` from
  `--duration-exit`; under `prefers-reduced-motion: reduce` the five tokens
  collapse to 0.01 ms in `tokens.css:423-429` → durations and delays are
  imperceptible with no additional rule. *Superseded:* the mention in the
  proposal (§2, l.176/260) of an extra component rule.
- **P7' — Print in `global.css`** (proposal §3.5): `#sidebar-contacts`
  (1,0,0) `visibility: visible; grid-template-rows: 1fr` +
  `#sidebar-contacts, #sidebar-contacts * { animation: none; transition: none }`
  + `#sidebar-contacts li { opacity: 1; transform: none }` (the collapsed state
  cannot leave invisible items on paper). *Discarded:* resolving it only in
  the module (it does not reach the resets of the subtree with the contract id).
- **C9 (approved in #106) — Rewrite of the Separator's selector:**
  `SEPARATOR_IN_ADDITIONAL` becomes a descendant selector
  (`'#sidebar-contacts div[aria-hidden="true"]'`); the 4 uses stay intact
  with their `toHaveLength(n)`; the Separator→list order is added as an unconditional
  assertion of test 11. *Discarded:* the proposal's form
  (`closest("ul") + previousElementSibling`), which does not work in the
  `contact: []` with CTA case (:475/:489).

**Commits of the print task:** T12 is `feat(Sidebar): T12` alone (global.css;
print = inspection + the user's Ctrl+P); no new test corresponds to it.

**The reviewer's QA when closing (T13, app served #91):** expansion/collapse in
both directions (~0.3 s), total stagger ~290 ms with `backwards`, no animation
on the initial load (also ≥1200), quick clicks with no inconsistent state,
collapsed out of focus and of the accessibility tree (in the browser; jsdom does not
apply CSS), print expanded with no `opacity: 0` items, reduced motion with the real
flag, observable restart of the animation on re-expanding.
