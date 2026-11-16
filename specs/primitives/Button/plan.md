# Plan — Button

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/Button/Button.tsx` | `<button>` or `<a>` (union discriminated by `href`), internal `Icon` + glow `::before` (through a class) | RF-1…RF-4, RF-7…RF-9 |
| `src/components/Button/Button.module.css` | background/typography/shadow/glow through tokens; `size`, `fullWidth` classes; focus/disabled pseudo-states | RF-5, RF-6 |
| `src/components/Button/Button.test.tsx` | tests + user-event + a11y closing case | all |
| `src/components/Button/index.ts` | re-export | — |

## Pure functions and algorithm

None with logic: choice of element by the presence of `href` and composition
of classes. The default `rel` is a trivial expression (`rel ?? (target ? "noopener noreferrer" : undefined)`).

## Interface

`ButtonProps` of the spec (discriminated union `href`/no `href`). `className` is
joined to the root's base class (P3). The icon uses `Icon` **without** `label`
(decorative).

## Decisions

- **Union discriminated by `href`** in the type (the spec's API): *discarded:*
  a single interface with everything optional (it would allow `disabled` on an `<a>`, not viable).
- `size="small"` padding with **new fixed tokens** `--button-small-padding-block/inline`
  (resolution T-2=A of the Clarification). *Discarded:* a literal in the module
  (breaks RF-6). **Dependency:** the 2 lines in `tokens/tokens.css` are provided by
  the user (outside the agents' edit permission); T5/T6 do not start
  without them.
- `::before` glow anchored with `bottom: 0` (T-3) and `content: none` in small
  (T-4). *Discarded:* an ad-hoc offset left unpinned (builders would diverge).
- `iconPosition="end"` is resolved with the **order in the DOM** of the svg and the label
  (RF-7 testable), not with CSS `order: -1`. *Discarded:* reordering through CSS
  (unobservable in jsdom and fragile with the accessible name).
- RF-5 (focus-visible/disabled) is not testable in jsdom: inspection + axe (P1).

## Test strategy

RTL + `@testing-library/user-event` (clicks). Roles `button`/`link` with a name;
node order for `iconPosition`; attributes `type`/`rel`/`download`. P2 for the
`size`/`fullWidth` classes; P1 for RF-5/RF-6 and the token padding (the
reviewer also checks that the tokens exist in `tokens.css`). Closing:
`expectNoA11yViolations` on `<button>` and on `<a>`. `npm test`.

Coverage: T1→RF-1 · T2→RF-3 · T3→RF-2,RF-8,RF-9 · T4→RF-4,RF-7 · T5→RF-6 · T6→RF-5,RF-6.
