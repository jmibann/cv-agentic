---
description: "SDD · Runs ONE task through the agent flow (usage: /sdd-implement <category>/<Name> T3)"
agent: orchestrator
---

Run ONLY task `$2` of `specs/$1/tasks.md`, following the `sdd` skill, `docs/constitution.md`
and your sections "How to delegate a task" and "After each task":

1. Check that `spec.md`, `plan.md` and `tasks.md` are approved and that `$2` is not marked.
2. Delegate `$2` to the matching subagent (`foundation` in F1, `component-builder` in F2–F3,
   `integrator` in F4):
   tests first (commit `test(<Name>): $2`), implementation (commit `feat(<Name>): $2`).
3. Confirm that the repo is green and ask the `reviewer` to review the task against its
   "Done when".
4. If the reviewer approves, mark `$2` in `tasks.md` with the hash of the `feat` commit and
   commit that change (`git add specs/$1/tasks.md` → `docs(sdd): <Name> Tn`).
   If it rejects, apply the rounds rule (at most 3).
5. Show me the result: which RFs it covers, the commits and the reviewer's report.

Then STOP. Do not start the next task.
