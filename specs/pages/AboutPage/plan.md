# Plan — AboutPage

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/pages/AboutPage/AboutPage.tsx` | page: `.page` with the `h1` always, `.intro`, services `<section aria-labelledby>` with a `<ul>`, h2 "Testimonials" + `TestimonialCarousel` (direct siblings, decision 20); `carouselLabels` = raw templates of `t.testimonials`; data `useCv()`, texts `useLocale().t` | RF-1..RF-3, RF-5 |
| `src/pages/AboutPage/AboutPage.module.css` | layout only: `.page` block flow with `* + * { margin-top: var(--stack-gap) }`, `.intro` flex col gap `--space-4` + `p { margin: 0 }`, `.services` grid `--layout-gap` + `list-style: none` 1 col → ≥ lg (992) 2 cols, `.testimonials { margin-top: 0 }` (passed as className to the carousel's root) | RF-4, RF-6 |
| `src/pages/AboutPage/AboutPage.test.tsx` | tests 1–8 of the spec; empty variant with `vi.mock` of the provider (precedent `LanguageSwitcher.test.tsx`: `vi.mock` + `importOriginal` overriding `useCv` with the kit's cv with `services: []` / `testimonials: []`); real `LocaleProvider` wrapper + `AccentGradientDefs` and `HexAvatarDefs` scaffolds | all |
| `src/pages/AboutPage/index.ts` | re-export `AboutPage` + `AboutPageProps` | — |

## Pure functions and algorithm

None: the page is pure presentation; the only "mapping" is the object literal
`carouselLabels` (5 keys, spec → API). No sorting or derivation of data.

## Interface

`AboutPageProps { className?: string }` → joined to `.page` (G-B, canon #99:
`const rootClassName = [styles.page, className].filter(Boolean).join(" ")`,
the style of the F2/F3 pieces, with no `clsx`).

## Decisions

- **`vi.mock` of the providers module to empty collections** (P1 of the
  Clarification): discarded alternative — an override prop in `LocaleProvider`
  (it would touch `src/providers/`, a file closed since F1). The precedent of
  mocking with `importOriginal` already exists in `LanguageSwitcher.test.tsx`.
- **The page does not call `format`** (P8): it passes raw templates; the carousel
  interpolates. If a test of the page asked for "1 of 3", it is misplaced: the
  carousel's names are verified in its piece and in AppLayout.
- **`className` to the carousel's root for the spacing** (`.testimonials` =
  `margin-top: 0`): discarded alternative — wrapping the carousel in a layout
  div (it would break decision 20: the carousel is a direct sibling of the `h2`).
- **`.services` with no `role="list"`** (P4): the quirk is unified in QA F5; the
  page does not decide it.
- **Empty `profile.about` has no test** (States → inspection): coverage is not
  invented (sdd rule).

## Test strategy

Render with the real `LocaleProvider` (kit content, locale `en`) + defs
scaffolds. Queries by role: `heading level 1` with `getAllByRole` length 1 (RF-1/RF-5),
`region` by name `t.about.services`/`t.about.testimonials` (the carousel's
resolves to its `<section>` via `labelledBy`), `article` per service, paragraphs
per `profile.about`. Empty variants with the mock. Test 6 (`es`): mount with
locale `es` (pattern of `LanguageSwitcher.test.tsx` / F1 providers) and ask for one
text from `ui.es` and one from `cv.es`. Closing `expectNoA11yViolations` in each
full scenario. Tasks in markup→styles order: red `test` → `feat`.

Coverage: T1→RF-1,RF-2(intro) · T2→RF-2(services),RF-5 · T3→RF-2(testimonials),RF-3
(incl. test 6 es) · T4→RF-4,RF-6 (inspection) + `className` join + a11y closing case.
