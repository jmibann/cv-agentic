# Plan — ResumeSection

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/ResumeSection/ResumeSection.tsx` | `<section aria-labelledby="resume-${id}-title">` with `SectionTitle as="h2" icon` + `Timeline` (passthrough of `entries/locale/presentLabel/timelineIdPrefix`) | RF-1…RF-5 |
| `src/components/ResumeSection/ResumeSection.module.css` | `display: flex; flex-direction: column;` with no extra gaps, zero `@media` | RF-4 |
| `src/components/ResumeSection/ResumeSection.test.tsx` | tests + a11y closing case | all |
| `src/components/ResumeSection/index.ts` | re-export | — |

## Pure functions and algorithm

None.

## Interface

`ResumeSectionProps { id; timelineIdPrefix; title; icon; entries; locale; presentLabel; className? }` (spec → API; G-B: `className` to the root `<section>`).

## Decisions

- Title id: `resume-${id}-title` (fixed formula, RF-3); the section's `aria-labelledby` points there.
- `timelineIdPrefix` arrives **explicitly by prop** (decision 14) and is forwarded as is to `Timeline.idPrefix`; there is no internal "education"→"edu" map.
- Icon: it is passed as `icon` to `SectionTitle` (it is SectionTitle that mounts the decorative `IconBox`, RF-3 of its spec) — the piece does not import it.
- No spacing of its own between title and timeline (spec → Styles/"Do not"): the h2's `margin-bottom` (1.25rem by SectionTitle RF-5) is the only one.
- `entries=[]` → `null` (RF-1).
- Zero knowledge of ResumePage/columns (RF-4).

## Test strategy

Isolated render with a fixture (2 entries); as a child it uses the real `Timeline` (a piece already built in the phase) — no mock is needed. Tests: `getByRole("region", { name: title })` (the name comes from the h2 via labelledBy); level 2 heading with the title; `listitem` × n inside the region; section absent with `entries=[]`; two sections with different ids → different title ids (test 5); the item's h3 stays level 3 inside the region (minimal hierarchy assert: `getAllByRole("heading")` by level, it covers the verifiable part of RF-5 without duplicating Timeline's tests). The decorative `IconBox` with a gradient → `AccentGradientDefs` scaffold in the renders. Closing with `expectNoA11yViolations`. P1: flex column, zero `@media`, zero extra gap → inspection.

Coverage: T1→RF-1,RF-2,RF-3,RF-5 · T2→RF-4 + closing.
