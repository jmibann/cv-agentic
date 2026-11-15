---
description: "SDD · Interviews and drafts a new spec (usage: /sdd-spec <category>/<Name> <initial idea>)"
agent: orchestrator
---

Spec folder: `specs/$1/` (for example `primitives/Badge`).
Initial idea: the text in `$ARGUMENTS` that follows `$1`.

Load the `sdd` skill and read `docs/constitution.md`, `specs/README.md` and `docs/memory.md`.
**Do not write code.**

1. If `specs/$1/spec.md` already exists, stop and tell me (changing it is done with `/sdd-change`).
2. Ask questions ONE at a time to remove ambiguities (edge cases, errors, what is left
   out of this version). At most 5 questions.
3. With my answers, draft `specs/$1/spec.md` using the template in `specs/README.md`
   (the 10 sections, including `## Requirements (EARS)`, plus `Status: draft`). If it is a piece of the kit,
   include API, tokens and HTML structure; if it is a new domain spec, only the WHAT and
   the WHY (see the skill).
4. Show me the content and wait for my approval before saving (your permission on
   `spec.md` is `ask`).
