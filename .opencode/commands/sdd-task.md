---
description: "SDD · Tasks for a standalone piece or a Change, with its plan already approved (usage: /sdd-task <category>/<Name>)"
agent: orchestrator
---

For pieces of an F phase, the tasks are drafted with `/sdd-plan <phase>` (gate
per phase). This command is for a standalone piece or a Change.

Load the `sdd` skill (Tasks section). From `specs/$1/spec.md` and `specs/$1/plan.md`
(approved), draft `specs/$1/tasks.md`:

- Small tasks (at most 20–30 min each), in dependency order, with a checkbox.
- Each one with the RFs it covers and a verifiable "Done when:" line.
- If there are more than 10, propose splitting the spec.

Show me the tasks and wait for my approval (Tasks gate).
