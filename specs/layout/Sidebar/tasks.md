# Tasks — Sidebar

- [x] **T1. `getContactHref` (pure).** RF-5 — e0cc73a · debt #102: body of the `feat` with an accent ("explícito"); cannot be amended, recorded in the full review r1
  - Done when: `src/components/Sidebar/getContactHref.ts` exports the function with no React; its tests pass with the exact table of spec → API (the explicit one has priority; `mailto`; `tel:+5411…` with only the initial `+` and no other non-digits; tel with no digits → `undefined`; `wa.me` digits only with no `+`; location → `undefined`); green after `feat(Sidebar): T1`.

- [x] **T2. Base structure: aside, identity and networks.** RF-1, RF-6 (networks), RF-8 — 9d0a77d · debt #102: subject of the `feat` in Spanish ("T2 · estructura…"); cannot be amended, recorded in the full review r1
  - Done when: `getByRole("complementary", { name: labels.region })`; avatar `<img>` with the `alt` of `profile.avatar.alt` with **no** `width`/`height` attributes (RF: decision 9); name `<p>`; `Badge` with the headline; a named networks `ul` with one `li` per entry: an external `<a aria-label={marca}>` with `target="_blank"` + `rel="noopener noreferrer"` and `BrandIcon`; the piece does not import `useCv`/`useLocale` (inspection); green after `feat(Sidebar): T2`.

- [x] **T3. Contacts: IconBox + Overhead + derived links.** RF-5 (use), RF-6 (mailto/tel with no target), RF-9 — 872b122 (fix of a T2 over-assertion approved by the user: `4ff4424`; minor items to watch in T6: empty `#sidebar-contacts` with no phantom spacing, ellipsis/`--color-heading`)
  - Done when: one `<li>` per contact with the `IconBox` of the map (mail/phone/message-circle/map-pin), `Overhead` with the translated label and the value (`--color-heading`, ellipsis + `title`); email/phone links with **no** `target`/`rel`; whatsapp and explicit site `href` values with the external target (attributes test); location as plain text with no link; empty `contact`/`social` do not render their lists and with no contacts **and** no CV there is no `Separator` (RF-9); green after `feat(Sidebar): T3`.

- [x] **T4. Disclosure with CornerTab.** RF-3, RF-4 — 87301ec (T6 to verify: `--icon-size` of the chevron if the style asks for it; the 1200 `@media` must override `.additionalCollapsed`; body of `c0b99c3` with accents = debt #102)
  - Done when: `CornerTab size="sm"` mounted with `<button aria-expanded="false" aria-controls="sidebar-contacts">` + the text `showContacts` + a decorative chevron `Icon name="chevron-down"`; click → `aria-expanded="true"`, text `hideContacts` and `.additional` goes from the collapse **class** to visible (the visibility at ≥ xl is given by the module's `@media`, inspection — in jsdom the state is by class); a second click reverts; the collapse does not use inline `style` (inspection: RF-10 decision); green after `feat(Sidebar): T4`.

- [x] **T5. Download CV.** RF-2 — d2a9829
  - Done when: with `profile.downloadCvUrl` there is a `getByRole("link", { name: labels.downloadCv })` with that `href` and the `download` attribute (`Button href… download icon="download" fullWidth`); with no URL it does not exist; green after `feat(Sidebar): T5`.

- [x] **T6. Token-based styles, CSS-only responsive and a11y closing case.** RF-7, RF-10 — 1a2136e (F5 to verify: margin-collapse edge case `contact=[]`+CTA; separations `--space-2/4` resolved with tokens; F8 avatar stays open; flex `ul` with no `role="list"` → VoiceOver/Safari in QA F5; `color` transition on `.contacts a` over a color that does not change (module.css:342-345, justified in a comment — verify a null perceptible effect in F5); note r1: the two `@media` (768 layout + 1200 xl) are the ones the spec mandates — "single media" in this line was read as "the single one of xl behavior")
  - Done when: the module declares the grid `< md`/`md–lg`, the xl column with the protruding avatar (`margin-top: calc(var(--size-avatar-sidebar) * -0.71)`, formula shared with `foundations/layout.md`), `--sidebar-*` tokens, networks/links with hover/focus (`--color-accent-text`, underline on contact, ring), transitions through tokens, `@media (min-width: 1200px)` as the single media (layout: it hides CornerTab, forces `.additional`, no literals), the Separator stretch without accumulating the `gap` of `.additional` (mechanism documented in a comment; Separator RF-4), zero `@media print` (RF-10: shared styles cover it, inspection); the file ends with `expectNoA11yViolations` (collapsed and expanded, with a scaffold `AccentGradientDefs`); `index.ts` re-exports `Sidebar`, types and `getContactHref`; lint + typecheck + test green after `feat(Sidebar): T6`.

- [x] **T7. Redesign of the icon-only disclosure (F5 Change 2026-10-08, the user's decision in view of D1/B-3).** RF-3, RF-4, RF-10 — fac2fbe (APPROVED + focused re-verification of the piece after the Change APPROVED (RF-1..10 with a counterpart; Tests 1–10 covered; axe closing case intact; the piece is still `implemented`). Minor items/notes: commit bodies with no accents (debt #102, cannot be amended); the historical header of T2 mentions "disclosure CornerTab (T4)" (dated, no action); **pending cross-piece: AppLayout T7** (compound `button[data-print-hide]` in global.css — today the button is hidden via `aside button`, no regression); **pending from the user: base token 6.375rem** (`tokens.css:201` still 7.5rem — the piece does not hardcode it) and docs outdated by #104b (`docs/DESIGN.md:20-21`, `foundations/layout.md:46,162` — outside my edit permissions; you apply them or you extend my permission); criterion (d) zero-overlap-375 is measured by the F5 re-pass)
  - Context of the Change (the user's decision at the F5 gate, detailed in spec → Anatomy/"Collapsible" and plan → Decisions): the CornerTab of the disclosure is removed (its background overlapped the name at 375px); the button becomes an icon-only gold chevron, absolute at the top right of the root, with no background, with an alternating `aria-label` and `data-print-hide`; the identity at < md/md–lg is aligned to the start next to the avatar; the networks are centered in the available space. The base token `--size-avatar-sidebar` −15% (6.375rem) **is applied by the user in `tokens.css`** — if it is missing at the start, hold that part and continue without touching the token (the layout does not depend on the value).
  - Done when:
    (a) **markup**: `<button class="disclosure" data-print-hide aria-label={expanded ? labels.hideContacts : labels.showContacts} aria-expanded={expanded} aria-controls="sidebar-contacts">` with `<Icon name="chevron-down" aria-hidden="true" className={styles.chevron + rotada si expandida}/>`; **no** import/use of `CornerTab` in `Sidebar.tsx`; root of the `<aside>` with `position: relative` for the absolute one (or the Box — verify which one provides the anchor and document it); `index.ts` with no changes.
    (b) **module**: `.disclosure` absolute at the top right, zero background/border, `color: var(--color-accent-text)`, touch area ≥24px through token padding, focus with the standard ring; `.chevron` with `transform: rotate(180deg)` in the expanded class + `--duration-base` transition; at ≥ xl the `@media (min-width: 1200px)` now hides `.disclosure` (previously the CornerTab) and forces `.additional` as before; identity at < md/md–lg aligned to the start next to the avatar (with `padding-inline-end` in a `calc()` of tokens only if the name reaches the corner); networks centered; zero literals; zero `@media print` (RF-10).
    (c) **tests**: update the structural asserts of T4 that depended on the CornerTab (the button is now queried directly: `getByRole("button", { name: labels.showContacts })` + `toHaveAttribute("data-print-hide")` + `aria-hidden` glyph + zero visible text — new test 10; **the `test(Sidebar): T7` documents in its message which old assertions are relocated and why**; no other assert of T2/T3/T5/T6 is weakened; closing `expectNoA11yViolations` in collapsed/expanded stays green).
    (d) **the user's criteria**: zero measurable overlap at 375 es/en in the F5 re-pass (this task sets code/tests; F5 verifies the number); no regressions at md–lg/xl (inspection of the `@media`).
    Green (lint/typecheck/test) after `feat(Sidebar): T7`. Closing of the piece: when T7 is approved, the reviewer does a focused re-verification of the whole spec (Anatomy/RF-3/RF-4/RF-10 change) before leaving `Status: implemented`.

- [x] **T8. Dynamic avatar alt (Change 2026-11-10).** RF-1, RF-8 — 861fb9a
  - Done when: `SidebarLabels` exposes `avatarAlt: string` and the `<img>` uses `alt={labels.avatarAlt}` (it no longer reads `profile.avatar.alt`, a field removed from `Image`); the fixture of `Sidebar.test.tsx` declares no `alt` and queries `getByRole("img", { name: LABELS.avatarAlt })`; the absences of `width`/`height`/`decoding` are kept; the piece still does not import `useCv`/`useLocale` (inspection); green after `feat(Sidebar): T8`.

## Motion change 3 (2026-11-13, #106/#116) — Spec+Plan+Tasks gate approved in 3 rounds

Dependency order: T9 → T10 → T11 → T12 → T13. Owner: `integrator`. Do not touch
providers, AppLayout, `src/test/**`, configs, `allowExportNames`. Transitions
only in (0,1,0) classes (#116 clarified: `transition: none` excluded).

- [x] **T9. Tests of the contacts entrance + C9 rewrite of the Selector.** RF-11 (tests 11–13), C9 — c5617e0 (designed red: ONLY tests 11/12; green-on-arrival #101: test 13 + C9 with the 4 uses intact) + 2db9975 (T9b: relocation ordered by the reviewer — the closing `expectNoA11yViolations` goes back to the end; bonus: T3 comment aligned to C9); reviewer APPROVED (lint/typecheck ✓; documented minor items: historical citation of lines not corrected, cosmetic split comment)
  - Done when: a single commit `test(Sidebar): T9` that only touches
    `Sidebar.test.tsx`: (a) **red ones**: test 11 (wrapper `.additionalBody`, the only
    child of `#sidebar-contacts`, containing Separator/list/CTA + an unconditional
    order assertion Separator→`ul.contacts` by
    `compareDocumentPosition & DOCUMENT_POSITION_FOLLOWING`) and test 12
    (`data-contacts-animate` **reflects `expanded`**: absent at the start, present
    on expanding, absent on collapsing, present on re-expanding); (b) **green on
    arrival declared in the body (#101)**: test 13 (collapsed: module class
    canon #99 + `aria-expanded="false"`; the class exists since T4; no
    `toBeVisible()`) and the ONE-line C9 rewrite of the constant
    `SEPARATOR_IN_ADDITIONAL` to `'#sidebar-contacts div[aria-hidden="true"]'`
    (the 4 uses `:379/:475/:489/:744` stay intact with their `toHaveLength(n)`;
    the body cites C9/#106). No previous assert weakened or deleted; expected
    red: only tests 11 and 12.
- [x] **T10. Wrapper + attribute in `Sidebar.tsx`.** RF-11 (P1', P4') — 5162e2e (feat, single file; 119+/90− mostly reindentation); reviewer APPROVED (25/25 Sidebar, suite 466/41, lint/typecheck ✓; RF-9 conditionals and ARIA intact line by line; `data-contacts-animate={expanded ? "" : undefined}` with no casts/extra state; transitory window of `additionalBody` with no class = expected until T11)
  - Done when: `feat(Sidebar): T10` only touches `Sidebar.tsx`: inside
    `#sidebar-contacts` a single div `className={styles.additionalBody}` that
    wraps Separator + `ul.contacts` + CTA; `data-contacts-animate` present
    ONLY when `expanded` (P1'; no extra state); no inline `style`;
    `aria-expanded`/`aria-controls`/`data-print-hide`/labels intact; tests 11
    and 12 green; the rest of the suite untouched.
- [x] **T11. Entrance CSS in `Sidebar.module.css`.** RF-11 (P2', P3', P5'), #116 — 4e80fb3 (feat, single file, 177+/61−); reviewer APPROVED with an independent #116 self-check: 5 `transition` in the file, all (0,1,0)/(0,1,1) or `none`; old compound (0,2,0) gone; stack migrated without reinventing; `backwards` ✓; delays/cap with the derivation `calc(n × --duration-stagger)` ✓; `4px` the only new literal; zero reduced-motion/print/`!important` of its own; pre-existing content intact byte for byte outside what was ordered (466/41). T11→T12 window: print still clips with the block collapsed — T12 is blocking for closing the Change.
  - Done when: `feat(Sidebar): T11` only touches the module: `.additional` grid
    (0fr/1fr + visibility + transitions according to the spec's table, (0,1,0),
    collapse after the base); the stack of decision 11 migrates to
    `.additionalBody` (with `min-height: 0; overflow: hidden`); `@keyframes
    item-enter` + entrance rule gated by
    `.additional[data-contacts-animate] .additionalBody > *` with `backwards` and
    delays `calc(n × --duration-stagger)` (nth-child 1–4 + cap n+5); ≥1200
    override on a bare `.additionalCollapsed` (0,1,0) at the end with `transition:
    none` (P5'); **remove the inert `transition: color` of `.contacts a`**
    (proposal §3.4, the minor of §XXIV); no `@media print` in the module
    (RF-10); **#116 self-check on the whole file: 0 transitions that
    animate in (0,2,0)+** (the reviewer replicates it); suite green.
- [x] **T12. Print of contacts in `global.css`.** RF-10/RF-11 (P7') — efbe0e1 (feat, single file, 50+/10−, a single hunk inside `@media print`); reviewer APPROVED with an independent cascade table: collapsed on paper → the base grid keeps an effective `1fr` (the `display: block` inherited from #103 is removed, justified), inherited `visibility`, `(1,0,0)` beats the gated (0,3,0)/(0,4,0) → `animation: none` in the whole subtree (zero `opacity: 0` items), defensive `li`; the rest of print intact byte for byte; #116 clarified applied to the `transition: none`. Minor items: body with "separa" (typo that cannot be amended), deliberate duplicated selector with a comment. No new tests = prescribed (#101; real Ctrl+P in T13).
  - Done when: `feat(Sidebar): T12` only touches `src/styles/global.css`: inside
    the existing `@media print`, the block of §3.5: `#sidebar-contacts`
    (1,0,0)` { visibility: visible; grid-template-rows: 1fr }` (+ the
    current `display: block` is kept or dropped against the grid — decide with
    a comment), `#sidebar-contacts, #sidebar-contacts * { animation: none;
    transition: none }`, `#sidebar-contacts li { opacity: 1; transform: none }`
    (the items never `opacity: 0` on paper with the block collapsed). No new
    tests (print = inspection + the user's Ctrl+P, explicit #101 criterion);
    the rest of `global.css` intact; suite green.
- [x] **T13. Closing of the Change: suite + build + QA + docs.** #80, #91, #86 — lint/typecheck ✓ · suite **466/41** ✓ · build ✓. The reviewer's QA APPROVED live + full review of the piece: expansion 310 ms + total stagger ~290 ms with `backwards` verified mid-flight, collapse 224 ms with deferred `visibility` and zero animation of items on the exit, load with no animation at 900 and 1400 (P5'), media crossing 900→1400 without animating, restart on re-expanding, consistent quick clicks, collapsed out of focus and of the tree (measured — the deferred point of T9), #116 in the 3 files, clean console. **Real Ctrl+P with the block collapsed: approved by the user** (contacts complete and visible). Left for the user: **commit the C3 of `foundations/motion.md`** (drafted and delivered; noted in Open items) and the confirmation of `prefers-reduced-motion` with the real flag (closed by inspection P6'). With the user's approval (2026-11-13): spec → `Status: implemented` and status documents (#86, §XXVI).
  - Done when: `npm run lint && npm run typecheck && npm test` and
    `npm run build` green; the reviewer's QA with the app served by the user
    (#91, checklist of the plan → annex); the **C3 of `foundations/motion.md`**
    (exception `grid-template-rows: 0fr↔1fr`) is drafted by the orchestrator and
    applied and committed by the user (kit); with the user's approval: spec →
    `Status: implemented`, T13 marked and status documents (#86).
