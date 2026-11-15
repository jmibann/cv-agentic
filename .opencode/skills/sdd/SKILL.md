---
name: sdd
description: Use it whenever you work with Spec-Driven Development in this project (docs/constitution.md or any file inside specs/) - drafting, reviewing or changing specs, plans and tasks, or implementing and validating the tasks of a spec.
---

# Spec-Driven Development (SDD)

## Flow

Constitution → Spec → Clarification → Plan → Tasks → Implementation → Validation.

Change: it can happen at any time and always starts again from the Spec.

- Never move to the next phase without the user's explicit approval.
  Two exceptions:
  - Within Implementation the tasks advance one by one with no gate (each one
    validated when it ends); the Implementation + Validation gate opens after
    the full review of the piece against the spec.
  - **Clarification with no findings** on a spec that is already `approved` does
    not open a gate (decision #90; see Clarification).
  - **Plan and Tasks are approved per F phase** (F1–F4): the `plan.md` and
    `tasks.md` of every piece in the phase are drafted and approved together in a
    single gate (see "Running with agents"). A piece outside a phase (a new
    standalone spec) and every Change keep their own Plan and Tasks gates.
- The spec rules: if something is not in the spec, it is not implemented. If a decision is missing, stop and ask.
- Each spec lives in its own folder: `specs/<category>/<Name>/` with `spec.md`
  (mandatory from the start) and `plan.md` / `tasks.md` (drafted at their
  gates). Categories of the kit: `foundation` (the `Foundation` piece of F1,
  decision #84), `primitives`, `controls`, `layout`, `content`, `pages`,
  `hooks`. F5 (QA) has no folder in `specs/` (decision #85).
- **Status documents (decisions #86 and #98):** when closing each **F gate**
  (F1–F5) and when the user approves a decision that changes rules (a new
  entry in the register in `docs/README.md`), update `docs/memory.md`,
  `docs/STATUS.md` ("Current status") and add an entry to
  `docs/diagnostics.md` using the fixed format of its "Entry template",
  updating its **Open items** table (what is closed **leaves** the table). That
  file has no status sections: the status lives in `docs/STATUS.md` and in
  `docs/memory.md`. If it goes over **150 lines**, the orchestrator reduces, at
  that same F gate, to **one line** every entry older than those of the last
  two F gates: `date · title · #n · git show <hash>:docs/diagnostics.md`
  (creation hash); the detail stays in git. Piece gates (spec,
  Clarification, Plan + Tasks, Implementation) only update `spec.md`
  (`Status`) and `tasks.md`.

## Constitution

`docs/constitution.md` must exist and be approved before any spec. Only
the user changes it. If a spec or a plan contradicts it, stop and ask.

## Spec template (spec.md)

For the pieces of this kit the canonical template is the one in
[`specs/README.md`](../../../specs/README.md) → "Spec template":

```text
# <Name>
Status: draft | approved | implemented

## Purpose
## Requirements (EARS)
## Anatomy
## API
## Styles and tokens
## States
## Responsive
## Accessibility
## Expected tests
## Do not
```

- `Status:` goes right below the title and **only changes with the user's approval**.
- `## Requirements (EARS)` goes right after `## Purpose`, before the section that follows it (format below).
- The 10 sections are mandatory and explicit, even if their content is
  "Not interactive" or "Not applicable" (hooks mark "Not applicable" where it fits).
- If any doubt remains, `## Open questions` is added as well, with
  `- [NEEDS CLARIFICATION] <question>`.

The spec of a piece **does** include stack and file names (API, tokens,
HTML structure): it is the contract the implementer and the reviewer verify.
The rule "only the WHAT and the WHY" applies to new domain specs that are
not pieces of the kit.

## Requirements in EARS (in English)

- RF-x: WHEN <event>, THE SYSTEM <response>.
- RF-x: IF <unwanted condition>, THEN THE SYSTEM <response>.
- RF-x: WHILE <state>, THE SYSTEM <response>.
- RF-x: THE SYSTEM <permanent behavior>.

Every RF must be verifiable: no "fast", "intense" or "pretty" without a measurable
criterion.

Drafting rules:

- Numbering `RF-1 … RF-n` **per spec** (it restarts in each piece).
- A single observable verb per RF; checkable with a test.
- **Scope is never invented**: an RF of a piece of the kit is derived only from the
  sections that already exist (`Purpose`, `States`, `Responsive`,
  `Accessibility`, `Expected tests`). If an RF has no counterpart in
  `Expected tests`, **the test is not added**: it is reported to the user.

## Clarification

List every `[NEEDS CLARIFICATION]` and any ambiguity, and ask the
user. The spec is edited only with their answers. When no doubts remain and the
user approves it, it moves to `Status: approved`.

With agents (decision #90) there is **a single path**: the reviewer **detects**
(`/sdd-clarify`, clean context, without proposing solutions) and the orchestrator
**resolves** (it presents the findings to the user and applies their answers in
`spec.md` with `ask` permission). **A gate only if there are findings:** if the reviewer
reports "No findings" on a spec that is already `approved`, the piece continues without
a Clarification gate.

## Plan (plan.md)

Files and responsibilities · Pure functions (if there is logic that depends on the
date, with "today" as a parameter) · Algorithm in pseudocode (only if there is
non-trivial logic) · Interface · Justified decisions with their discarded alternative ·
Test strategy with `npm test` (vitest). State which RFs each part covers.

## Tasks (tasks.md)

```text
- [ ] **Tn. <Description>.** RF-x, RF-y
  - Done when: <verifiable check>.
```

At most 20-30 min per task, in dependency order. If there are more than 10, propose splitting
the spec.

## Implementation

One task at a time: tests first (red), then the code, `npm run lint`,
`npm run typecheck` and `npm test` green, report and stop. **Whoever implements
does not mark the task**: the orchestrator marks it in `tasks.md` after the
reviewer's OK (subagents do not write in `specs/`).

## Validation

- Each task is verified against its "Done when": per task, a green `lint` +
  `typecheck` + `test` is enough; the `build` runs **when closing the piece** and at
  every gate (decision #80).
- When the last task ends, a full review against the spec (every RF, edge
  cases and completion criteria).
- With the review OK and the user's approval, the spec moves to
  `Status: implemented`.

## Change

A requirements change is made first in the spec, then in the plan and the tasks, and
finally in the code. Each step requires the user's approval.

## Running with agents (CV site)

This section does not change the SDD flow: it defines who runs each phase when
working with the orchestrator.

- **Two levels.** The orchestrator's phases F1–F5 organize the project. Within
  each phase, each piece (component, hook, page, and in F1 the piece
  `foundation/Foundation`) goes through the full SDD flow and respects its approval
  gates. F1–F4 follow the Tn model (decision #84).
- **F5 (QA) produces no code and has no Tn (decision #85).** It is a pass by the
  `reviewer` over the whole app, with the "F5 QA" section of
  `reviewer.md` as its contract: no `specs/qa/`, no `plan.md`/`tasks.md` and no
  `test`→`feat` commits (P4 does not apply because there are no tasks or code). The
  orchestrator saves the report in `docs/qa-report.md` and commits it
  (`docs(qa): F5 report`). Each defect goes back to its piece: if the code does not
  meet the spec, as a **new task** in its `tasks.md` (Tasks gate of a
  standalone piece, then `/sdd-implement`); if the spec is wrong, as a
  **Change**. With the defects fixed, the reviewer repeats the pass and the
  user closes the F5 gate.
- **Plan + Tasks gate per phase.** When starting F1, F2, F3 or F4, and with the
  Clarification of all its pieces closed, the orchestrator drafts the `plan.md` and
  `tasks.md` of each piece in the phase (in the order of `specs/README.md`) and
  presents them together: one table per piece (files, RFs covered, number of
  tasks, decisions with their discarded alternative) with links to the files. The
  user approves the whole phase or points out pieces to correct; only those are
  redone and presented again. If implementing a piece changes something that
  affects the plan of another already approved one, that is a Change of that other piece.
- **Roles.** The orchestrator plans, delegates and stops at each gate; it does not write
  code or tests. `foundation`, `component-builder` and `integrator` implement.
  `reviewer` validates with a clean context: it receives the spec, the task (Tn with its
  "Done when") and the path of the code, nothing else.
- **Unit of work: one task of `tasks.md`.** Each assignment to a subagent is
  exactly one task (Tn). The subagent follows the Implementation section:
  tests in red, implements, leaves lint + typecheck + tests green, reports and
  stops. The orchestrator marks the task in `tasks.md` when the reviewer
  approves it.
- **Commits per task.** `test(<Name>): Tn` with the tests in red, then
  `feat(<Name>): Tn` with the implementation, and `fix(<Name>): Tn` if there were
  corrections. Code commits are made by whoever implements; the orchestrator
  commits **documents only** (`docs/*`, `specs/*`), with the repo green and
  with explicit paths, never `git add .`/`-A` (decision #76). If a
  pre-commit hook blocks the red commit, `--no-verify` is not
  used: stop and ask the user.
- **Tests that are not weakened (per task).** `feat(<Name>): Tn` and
  `fix(<Name>): Tn` commits **do not touch** test files; `test(<Name>): Tn`
  commits only **add** tests (they do not delete or change lines of
  tests from earlier tasks). The reviewer verifies it with `git log -p` on
  the piece's test files.
- **One task at a time.** No parallel work. The reviewer is never invoked with the repo
  in red (between the test commit and the implementation one).
- **Validation.** The reviewer verifies each task against its "Done when". When
  the last task of a piece ends, it does a full review against the
  spec. If it is rejected, or if the repo is red after the task, the task goes back
  to the same subagent with the exact output; each return counts as one round, with
  a maximum of 3. After that, stop and report to the user.
- **Change.** If a subagent proposes changing a spec, weakening a test or
  adding a dependency, stop and ask the user (it matches
  "if a decision is missing, stop and ask").
- **Priority.** `docs/constitution.md` > this skill > spec > agent
  definition > any agent's opinion.
