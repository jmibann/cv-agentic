# Tasks — ResumeSection

- [x] **T1. Named section with SectionTitle + Timeline.** RF-1, RF-2, RF-3, RF-5 — 7f7b0fd (minor for T2: clarify the "Patrón #99" comment of the extra `className` block — it describes the canonical join, not the assert's `??`)
  - Done when: `getByRole("region", { name: title })` (name via `aria-labelledby="resume-${id}-title"`); it contains a level 2 `heading` with the title and its decorative `IconBox` (`AccentGradientDefs` scaffold) and a `list` with `listitem` × n; item heading at level 3 inside the region; `entries=[]` → empty `container`; two sections with different `id` do not duplicate ids; the `timelineIdPrefix` received reaches the Timeline (item ids with the formula); green after `feat(ResumeSection): T1`.

- [x] **T2. Styles (column with no extra gaps) and a11y closing case.** RF-4 — b54ded4
  - Done when: the module declares only `display: flex; flex-direction: column;` (no gap, no extra margin, zero `@media` — inspection); the file ends with `expectNoA11yViolations`; `index.ts` re-exports `ResumeSection` and types; lint + typecheck + test green after `feat(ResumeSection): T2`.
