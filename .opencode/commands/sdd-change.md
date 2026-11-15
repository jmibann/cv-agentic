---
description: "SDD · Requirements change: the spec first, then the code (usage: /sdd-change <category>/<Name> <change>)"
agent: orchestrator
---

Change for `specs/$1/spec.md`: the text in `$ARGUMENTS` that follows `$1`.

Load the `sdd` skill (Change section) and read `docs/constitution.md`. **Do not touch code.**

1. Propose the change in `specs/$1/spec.md`: new or modified RFs in EARS, edge cases,
   what is left out of scope and the "Expected tests" that change.
2. State which parts of `plan.md` and `tasks.md` would have to change afterwards (do not change them yet).
3. Show me the diff of the spec and wait for my approval (your permission on `spec.md` is `ask`).
   Once the spec is approved, the change continues through `/sdd-plan` and `/sdd-task`.
