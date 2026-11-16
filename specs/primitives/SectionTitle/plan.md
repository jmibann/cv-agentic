# Plan — SectionTitle

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/SectionTitle/SectionTitle.tsx` | `h1/h2/h3` heading with `id`, `decorated`, `icon` (IconBox) | RF-1…RF-4 |
| `src/components/SectionTitle/SectionTitle.module.css` | `.h1/.h2/.h3` (font-size), `.decorated` (`::after` bar), `.withIcon` (flex on the heading), RF-5 margins | RF-1, RF-2, RF-5, RF-6 |
| `src/components/SectionTitle/SectionTitle.test.tsx` | tests + a11y closing case | all |
| `src/components/SectionTitle/index.ts` | re-export | — |

## Pure functions and algorithm

None: composition of classes according to props.

## Interface

`SectionTitleProps` of the spec (`as` required). `className` joined to the heading
— the single root element, **no wrapper** (the flex of `icon` goes on the heading
itself) (P3/S-5).

## Decisions

- `font-size` through the module's classes `.h1/.h2/.h3` (S-6): the component is
  self-contained. *Discarded:* depending on the global per-tag typography
  (a wrapper/global could override it and the module's test would not assert it).
- `decorated` + `icon` is a **valid** combination with a fixed rule (S-2): both
  treatments are painted; the `::after` bar is anchored to the edge of the whole
  heading (`position: absolute` takes it out of the flex flow).
- RF-6 bounded: tokens for color/radius/font/bar; the title→content margins
  are the literals of RF-5 (S-3=A). *Discarded:* new tokens for the
  h2/h3 margins (they do not scale by breakpoint).
- h1 **without** `decorated` declares no `margin-bottom`: it takes the global heading
  margin (S-1).
- Depends on: `Icon` → `IconBox` (earlier in the order of F2).

## Test strategy

`heading` roles with `level` and `name`; `id` on the heading; P2 classes
(`decorated`, level); decorated+icon combination (both classes + IconBox
present, accessible name intact); bar with no text content and `aria-hidden`
icon → inspection + axe. P1: margins/`@media`/`::after` by
inspection. Closing `expectNoA11yViolations`. `npm test`.

Coverage: T1→RF-1,RF-4 · T2→RF-1 · T3→RF-2 · T4→RF-3 · T5→RF-5,RF-6.
