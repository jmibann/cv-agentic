# Plan — SkillList

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/SkillList/SkillList.tsx` | named `<ul>` with one `Badge as="li"` per skill (data order), index+value keys, wrap, `className` join | RF-1…RF-6 |
| `src/components/SkillList/SkillList.module.css` | flex wrap list `gap: var(--space-2)`, `list-style: none`, margin/padding 0, zero `@media` | RF-5 |
| `src/components/SkillList/SkillList.test.tsx` | tests (incl. 2 `@ts-expect-error` cases) + a11y closing case | all |
| `src/components/SkillList/index.ts` | re-export | — |

## Pure functions and algorithm

None. Discriminated type `SkillListName` (exactly one of `labelledBy`/`label`) straight from spec → API; the two invalid cases are tested with `// @ts-expect-error` (decision 15: **both** cases).

## Interface

`SkillListProps = SkillListName & { skills: readonly string[]; className?: string }`; `className` to the root `<ul>` (G-B).

## Decisions

- The chip is painted entirely by Badge: SkillList does **not** pass it `className` (`.chip` of the anatomy is illustrative; decision 15).
- `skills=[]` → `null` (RF-1).
- Keys: `` `skill-${index}-${value}` `` (stable for the same array; formula documented in the code — RF-6 inspection; test 5 covers "duplicated with no warning" by spying on `console.error`).
- Empty accessible name: if `label` arrives empty at runtime it is not considered (the type and the consumer prevent it; "Do not invent scope").
- Expected surface `--color-surface` (outer card): usage restriction, verifiable in ResumePage (F4) — RF-4.
- Long chip: it overflows with no rule (decision 15) — it is checked in QA F5 with real content.

## Test strategy

Render with a skills fixture; `<h2 id="…">Skills</h2>` scaffold in the test's DOM for the `labelledBy` case (Badge-`ul`/Overhead-`dl` criterion, decision 15/note). Tests: `getByRole("list", { name })` with `listitem` × n in order; name by `label`; empty → null; duplicated → no warning (`console.error` spy) and 3 items; `className` join (#99); the two `// @ts-expect-error` cases are written as an `it` that builds the invalid typed expression (no render), the same criterion as the phase's "type tests". Closing with `expectNoA11yViolations`. P1: wrap/gap/zero media → inspection.

Coverage: T1→RF-1,RF-2,RF-3 · T2→RF-6,RF-4/5 (inspection) + closing. (RF-2 type cases go in T1 with the file.)
