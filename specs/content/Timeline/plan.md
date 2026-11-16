# Plan — Timeline

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/Timeline/Timeline.tsx` | `<ol role="list">` with `<li><article aria-labelledby>` per entry: h3 (formula id), organization, period with two `<time>`, description | RF-1…RF-5 |
| `src/components/Timeline/Timeline.module.css` | item with line/border, centered `::before` dot, `:last-child` with no line, indent by token, title with `top: calc(var(--timeline-title-shift) * -1)` | RF-6, RF-7 |
| `src/components/Timeline/Timeline.test.tsx` | tests + a11y closing case | all |
| `src/components/Timeline/index.ts` | re-export | — |

## Pure functions and algorithm

No new ones. Timeline does **not** use `formatPeriod` (it returns a composite string): for the markup of two `<time>` it uses the new **`formatPeriodEndpoint`** (Foundation T12) on each endpoint and paints the literal `" — "` separator of the `foundations/i18n.md` contract. It does not reimplement formatting or parse strings.

## Interface

`TimelineProps { entries; locale; presentLabel; idPrefix; className? }` (spec → API; `className` to the root `<ol>`, G-B). Title id: `const titleId = \`${idPrefix}-${entry.id}-title\`` (RF-5 formula).

## Decisions

- **It depends on Foundation T12** (`formatPeriodEndpoint`): a prior task of the phase; without it T2 does not compile. *Discarded:* reimplementing the formatting (forbidden by the spec).
- `end === null` → a single `<time>` + `presentLabel` as plain text inside `.period` (RF-3/4; "Present is text" → Accessibility).
- Explicit `role="list"` on the `<ol>` (decision 13; Safari quirk with `list-style: none`).
- Line of the last item: **positional** cut `:last-child` (RF-6; not by content).
- H3 with h4 style: `--font-size-h4` set by the module on the title's class (the spec's table); SectionTitle is not used (h3 level with h4 style — outside its contract).
- Print: the item's `break-inside` belongs to the shared style (G-D, F4); zero `@media print` of its own.
- `entries=[]` → `null`.

## Test strategy

Isolated render with fixture props of `TimelineEntry` (two entries: one with `end: null`, another with a range; `locale="en"` and with `locale="es"` for case 5). Queries by role: `list` (it verifies `role="list"`), `listitem`, named level 3 heading; `container.querySelectorAll("time")` with `dateTime` per endpoint (test 6); formatted text ("Mar 2019" / "mar 2019" + `" — "` separator — the same one `formatPeriod` produces, but here the markup of two `<time>` is asserted); ids with the formula and no collision between two Timelines (test 7); empty (test 8). `presentLabel` as text (test 4). Closing with `expectNoA11yViolations`. P1: dot/line/`:last-child`/indent/`--timeline-title-shift` by inspection (#101; without reading CSS as text). The pure formatting `behavior` is already tested next to the function (F1 + T12), not here.

Coverage: T1→RF-1,RF-2,RF-5 · T2→RF-3,RF-4 (requires T12) · T3→RF-6,RF-7 + closing.
