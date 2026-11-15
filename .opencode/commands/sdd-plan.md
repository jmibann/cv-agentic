---
description: "SDD · Plan + tasks for a whole phase, or the plan for a standalone piece (usage: /sdd-plan F1…F4 | /sdd-plan <category>/<Name>)"
agent: orchestrator
---

Load the `sdd` skill (sections Plan, Tasks and "Running with agents") and read
`docs/constitution.md`, `AGENTS.md` and `specs/README.md`. **Do not write code.**

**If `$1` is a phase (`F1`, `F2`, `F3` or `F4`; F5 has no plan or tasks, decision #85):** Plan + Tasks gate per
phase. For each piece of that phase (table in `specs/README.md`, in order; in
F1 the only piece is `foundation/Foundation`),
draft `plan.md` and `tasks.md` (the skill's format). If any spec does not have
`Status: approved` or has open `[NEEDS CLARIFICATION]` marks, stop and tell me
before drafting anything. If the Clarification of a piece was not done, request it
from the `reviewer` (as `/sdd-clarify`) and present to me only the ones with findings
(decision #90). Present everything together using the format of your section "When
reaching a gate" and wait for my approval of the phase.

**If `$1` is `<category>/<Name>`** (a piece outside a phase, or a Change):
read `specs/$1/spec.md`; if it does not have `Status: approved` or has open
`[NEEDS CLARIFICATION]` marks, stop and tell me. Draft only
`specs/$1/plan.md` and wait for my approval (Plan gate); the tasks go through
`/sdd-task`.

Every `plan.md` includes:

- Files created or modified and the responsibility of each one.
- Pure logic functions (with "today" as a parameter only if they depend on the date).
- Algorithm in pseudocode (only if there is non-trivial logic).
- How it is rendered in the interface.
- Justified technical decisions, each with its discarded alternative.
- Test strategy with `npm test` (Vitest + Testing Library + `expectNoA11yViolations`).

Everything respects the constitution and covers every RF; mark which RFs each part covers.
Show me what you drafted and wait for my approval.
