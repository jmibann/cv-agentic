---
description: "SDD · Reviews a spec as QA: it only detects, it does not resolve (usage: /sdd-clarify <category>/<Name>)"
agent: reviewer
---

Review `specs/$1/spec.md` as a very professional QA, with a clean context. Load the `sdd`
skill and read `docs/constitution.md` and `specs/README.md`.

List:

1. Ambiguities (requirements that cannot be verified).
2. Contradictions between requirements or between sections of the spec.
3. Edge cases that are not covered.
4. RFs with no counterpart in "Expected tests" (and vice versa).
5. Conflicts with `docs/constitution.md` or with the template in `specs/README.md`.

Do not propose solutions or modify files: only detect. Format: numbered list.
If you find nothing, answer exactly **"No findings"**: with the spec already `approved`,
the piece continues without a Clarification gate (decision #90). The answers to the findings
are applied by the orchestrator in `spec.md` (with your approval).
