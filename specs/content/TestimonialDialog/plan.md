# Plan — TestimonialDialog

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/TestimonialDialog/TestimonialDialog.tsx` | conditional mounting of the `<dialog>` + refs (`showModal`/`close`), `close`→`onClose` cycle with a ref guard, backdrop/padding detection, content (author h2, role, text, HexAvatar, quote) and Close button | RF-1…RF-4 |
| `src/components/TestimonialDialog/TestimonialDialog.module.css` | dialog/backdrop/layout (grid, `overflow-y: auto`)/close/quote/2 columns ≥580/`@starting-style` entrance/its own `@media print` | RF-5, RF-6 |
| `src/components/TestimonialDialog/TestimonialDialog.test.tsx` | tests + a11y closing case | all |
| `src/components/TestimonialDialog/index.ts` | re-export | — |

## Pure functions and algorithm

- Detection of the real backdrop (decision 19): `handleClick(e)`: it closes if `e.target === dialogEl` **and** the point falls outside `dialogEl.getBoundingClientRect()` (click on ::backdrop); the dialog's padding strip does NOT close. Small logic inside the handler (an event with DOM: it is not extracted to a pure function; it is covered with event tests on the mock).

## Interface

`TestimonialDialogProps { testimonial: Testimonial | null; onClose: () => void; closeLabel: string }` (spec → API; no `className`). `useRef<HTMLDialogElement>`.

## Decisions

- **Conditional mounting (18=b):** `testimonial === null` → `return null`; on mounting with a value, an effect calls `showModal()`; the effect's cleanup calls `dialog.close()` if `dialog.open` (a closing started by the parent) — the guard of the `close` handler (a ref with the last value) avoids `onClose` on that path (full cycle in spec → table).
- **No double call:** `onClose` only from the `close` event; the `idempotencia` asked of the parent (Carousel) is kept.
- Entrance only, `@starting-style` (19): `transition: opacity, transform` when open with a closed→open `@starting-style`; no exit state. `prefers-reduced-motion` already collapses the duration through tokens (no media of its own; the plan declares it as a criterion — `@starting-style` is the only technique fixed).
- Initial focus/return: native (`showModal`/`close`); no autofocus, F5 verification (RF-4).
- Inner scroll: the dialog's `max-height` + `.layout { overflow-y: auto }` (19).
- Quote of the aside: `Icon quote tone="gradient" --icon-size: 2rem` (decision 19: the same contract as the card, below the avatar in the aside); Close `Icon name="x"` with no `--icon-size` (default).
- Print: `@media print { display: none }` in the piece's module (G-D-1).
- `closeLabel` as the button's `aria-label` (the button's name); the `<h2 id>` sets the dialog's name (`aria-labelledby`).
- It does not touch `src/test/setup.ts`: the tests **use** the existing mock (`showModal`→`open`; `close`→ removes `open` + fires the `close` event) and verify that it is enough (19).

## Annex — Motion change 4 (2026-11-13, #106/#116; Spec+Plan+Tasks gate approved with a wording adjustment by the user)

- **History of the change (it does not go in the spec → "Entrance" row, by the
  user's decision):** proposal §4.4 and item 9 of the matrix §2.4 (#106): change **only
  the easing** of the entrance (`--ease-standard`→`--ease-enter`); `--duration-base`
  0.2 s and `@starting-style` as the only mechanism are kept; no exit.
  The hover of the close button keeps `--ease-standard` (item 10: "it is kept").
  C7 of the findings matrix. Minor inherited from §XXIV: the comment
  "0.3s ease-in-out" (module, Entrance block) is doubly stale (the
  duration is 0.2 s since T15 and the easing becomes `enter`) — it is rewritten here.
- **Scope:** `TestimonialDialog.module.css` only (2 values +
  comment). Zero tsx, zero tests (regime #101: jsdom does not compute
  transitions; verification = inspection + QA in the browser), zero changes in
  `@starting-style`, backdrop, print, close or layout.
- **T4:** `feat(TestimonialDialog): T4` — a single commit, **green-only declared
  #101** (there is no possible red without inventing scope; the artificial red reading
  CSS as text is discarded — precedent T3/T5 of this piece and decision
  #101). Done: `.dialog` is still (0,1,0); entrance `--ease-enter`; close intact;
  suite with no regressions.
- **T5:** closing — suite + `build` + the reviewer's QA with the app served (#91):
  opening ~200 ms with a marked deceleration (`cubic-bezier(0.22,1,0.36,1)`, no
  bounce), **closing is still instant (key regression)**, close hover with no
  changes, backdrop/print with no regression; spec → `implemented`; docs #86
  (§XXVII) and **proposal `specs/motion/proposal.md` marked 4/4 implemented**
  (header + any remaining "on hold"); rule #116 raised to permanent
  (a bullet in `foundations/motion.md` + a short rule in a place to be decided:
  `docs/DESIGN.md` or `AGENTS.md` → Conventions — both in the user's hands).

Coverage of the annex: T4→RF-5/RF-6 (Entrance row; inspection) · T5→closing + QA.

Harness with `HexAvatarDefs` + `AccentGradientDefs` (scaffold). `renderWithDialog`: mount with `testimonial` or `null`; rerender for transitions. Tests 1–8 of the spec; test 5 is split into three asserts: real backdrop (click on target=dialog with coords outside the rect — `Object.defineProperty(el,"getBoundingClientRect")` or a rect mock), padding (coords inside the rect → it does not close), content (it does not close). Synthetic `close` event (simulates Esc) → `onClose` once; `null` from the parent while open → the cleanup closes and does **not** call `onClose` (18=b). Closing with `expectNoA11yViolations` with the dialog open. P1 (backdrop color, overflow, print, animation): inspection.

Coverage: T1→RF-1,RF-4 (content/name),RF-2 (Close→close→onClose) · T2→RF-2,RF-3 (full cycle) · T3→RF-5,RF-6 + closing.
