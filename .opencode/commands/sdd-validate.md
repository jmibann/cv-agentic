---
description: "SDD · Full review of a piece, RF by RF: tests + Chrome DevTools (usage: /sdd-validate <category>/<Name>)"
agent: reviewer
---

Do the **full review of the piece** `specs/$1/spec.md` (your checklist + the `sdd` skill,
Validation section), with a clean context. **Do not fix anything.**

1. Go through the spec requirement by requirement. For each RF state which test covers it and the
   result of `npm test`.
2. Interface RFs that cannot be verified with `npm test` are verified with the Chrome DevTools
   MCP (configured in `opencode.json`), including the 375 px mobile view and
   both themes. Precondition: the app is served by the user (`npm run dev`,
   `http://localhost:5173`; you cannot start it, decision #91). If it does not respond or the MCP
   fails, do not stop halfway: list those RFs as "not verified (visual QA)" and state that
   the app has to be served and `/sdd-validate` repeated.
3. Check the completion criteria of the piece (they include a green `npm run build`,
   which only runs when closing the piece) and that every task in `tasks.md`
   is marked.

Verdict in your report format: **is the spec fulfilled?**
