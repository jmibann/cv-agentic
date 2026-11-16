# Diagnostics — register of gates and audits

Minimal log of the project (decisions **#86** and **#98**): one entry for each
closing of an F gate and for each rules decision, with the relevant hashes.
Last update: **2026-11-16** (closing of #122, documentation in English §XXXVI; closing of #121, code in English §XXXV; rules §XXXIV; general audit and cleanup §XXXIII; README in English and `docs/STATUS.md` §XXXII, #120; Change #119, avatar in WebP §XXXI; docs cleanup §XXX; Change #118, `projects` collection §XXIX; Change #117, SEO metadata §XXVIII; motion system complete §XXVII; changes 3 §XXVI and 2 §XXV; stage 1 gate §XXIII).
The F1–F5 process stays closed (§XII); flow and owners in "Maintenance mode" of `docs/agent-system.md`.

What is live does not live here: status → `docs/STATUS.md` ("Current status") · memory →
`docs/memory.md` · decisions #1–#122 → `docs/README.md` · QA of F5 →
`docs/qa-report.md` · motion → `specs/motion/proposal.md`.

Owner: orchestrator (`edit` by path). The piece gates do not touch this
file. Cap: **150 lines** (pruning #98).

## Entry template

```text
### §<n> · <YYYY-MM-DD> — <F gate or audit>
- What: <what was done or approved>.
- Checks: lint · typecheck · test (n/n) · build (if applicable).
- Decisions: #NN → `docs/README.md`.
- Commits: `<hash>` … (only the relevant ones).
- Opens: <new ones>; closes: <the ones this entry resolves> (update the **Open items** table).
```

Entries: **most recent on top**; the consolidated view lives in the **Open items** table.

## Maintenance (decision #98)

Each **F gate** or **rules decision** adds an entry with the fixed
format of the "Entry template" and updates the **Open items** table (what is closed
**leaves** the table). This file carries no status sections: the status lives
in `docs/STATUS.md` ("Current status") and in `docs/memory.md`. If it goes over **150
lines**, the orchestrator reduces, **at that same F gate**, to **one line**
each entry older than those of the last two F gates:
`date · title · #n · git show <hash>:docs/diagnostics.md` (creation hash
of the entry); the detail stays in git.

## Open items

| Item | What is missing | It closes in |
|---|---|---|
| Post-F5 pending items (residues) | **Debts of form**: `lang="es"` not restored in AppLayout.test (note), anti-flash `<script>` at column 0 in `index.html` (pre-existing from T4, the minor of §XXVIII), test titles with internal references (`T1: RF-1`) and fragments in Spanish (§XXXV; changing them touches ~625 titles, no assertion) — a single pass only if the user decides so (the debts of comments in tests were closed with #121) · optional kit items: `cursor: pointer` not listed in controls/bullets, `contrast.md` row rule 6 for ServiceCard | The user's decision; no date |
| From the user (§XXXIII, §XXXV, §XXXVI) | **OpenCode agents**: run `/sdd-status` and a small task once with the translated prompts (#122); **Downloadable PDF** `public/cv/…pdf`: it says "445 tests" (today 487) and includes the phone, which the site does not show by decision; **"About" of the repo on GitHub**: old description and no link to the site; **PageSpeed**: measure again after #119. **Dependencies**: 7 moderate development advisories because of `minimatch` via `typescript-eslint` (wait for a fixed version; do not force) | User; `minimatch`: next dependency update |
| Minor debts of F1 | `StrictMode` with no mandate (if it is wanted, it is a Change), context `value` with no `useMemo` in both providers, typos "recalculera", trace `07eead6`; detail in `docs/memory.md`. Re-evaluated when closing F2 (2026-10-06): they **remain**, with no impact on F2 | No date; the user's decision whether they are repaired |
| Minor debts of F2 | (a) AGENTS.md "unused parameters: `_` prefix" is imprecise with the real eslint (`after-used`, with no `argsIgnorePattern`: the `_` does not protect the last parameter) → amendment for the user to decide; (b) note #99: with Vitest's CSS-Modules proxy the fallback branch may never be exercised — the validity of the pattern lies in sharing the `styles` object between test and implementation; (c) pre-existing stderr `act(...)` in 2 tests of `ThemeProvider.test.tsx` (they pass) → decide whether to repair | (a) and (c): the user's decision; (b): next review of the sdd skill |

## Entries

### §XXXVI · 2026-11-16 — Closing of #122: all the documentation in English
- What: translation of the 117 kit documents (`AGENTS.md`, `docs/`, `foundations/`, `specs/`, `.opencode/`), faithful and in full, with the structural terms in English (`Status`, `Requirements (EARS)`, `Done when`, gate, `Open items`…); the agents now talk to the user in English; guard test extended to the documents (Foundation T23). Done by Claude Code at the user's request, in six stages with a reviewed pilot.
- Checks: per document, mechanical comparison with its previous version (headings, tables, lists, checkboxes, code blocks, identifiers, hashes, links); no old terms left (`Estado:`, `Hecho cuando`, `CUANDO`…); lint · typecheck · test (**487/42**) · build.
- Decisions: #122 → `docs/README.md` (it amends L1). Quoted Spanish interface strings and historical literals are kept as they were written.
- Commits: `805666f` (pilot) · `2d10d4e` (rules and agents) · `ec50f75` (foundations and design) · `237a2c4`…`ac57747` (specs) · `0d6ffe8` `1bab476` `0c8bff3` (status, QA, proposal, register) · `2866724` (T23).
- Opens: run the OpenCode agents once with the translated prompts (not executable from Claude Code); figures of the root README (485 tests, #1–#121) one step behind; closes: "Internal documentation in English" of `docs/BACKLOG.md`.

### 2026-11-15 · §XXXV — Closing of #121: code 100 % in English, "why-only" comments · #121 · `git show 4b1a48f:docs/diagnostics.md`

### 2026-11-15 · §XXXIV — Decision #121: "why-only" comments in English (rules) · #121 · `git show 6405b72:docs/diagnostics.md`

### 2026-11-15 · §XXXIII — General audit and cleanup (deps in range, docs up to date) · — · `git show f450e4e:docs/diagnostics.md`

### 2026-11-15 · §XXXII — Public README in English and status board to `docs/STATUS.md` · #120 · `git show f836812:docs/diagnostics.md`

### 2026-11-15 · §XXXI — Change #119: the site's avatar in WebP · #119 · `git show 6f06934:docs/diagnostics.md`

### 2026-11-14 · §XXX — Documentation cleanup after #117 and #118 (audit) · — · `git show e0b6104:docs/diagnostics.md`

### 2026-11-14 · §XXIX — Change #118: `projects` collection and Projects section in Resume · #118 · `git show b22655a:docs/diagnostics.md`

### 2026-11-14 · §XXVIII — Closing of Change #117 (Foundation: SEO and sharing metadata) · #117 · `git show 3d22bf8:docs/diagnostics.md`

### 2026-11-13 · §XXVII — Closing of Motion change 4 and of the motion system (4/4) · #116 · `git show 0bab158:docs/diagnostics.md`

### 2026-11-13 · §XXVI — Closing of Motion change 3 (Sidebar, expansion of contacts) · — · `git show 5ac25ff:docs/diagnostics.md`

### 2026-11-13 · §XXV — Closing of Motion change 2 (AppLayout, panel entrance) · — · `git show de5f32a:docs/diagnostics.md`

### 2026-11-13 · §XXIV — Closing of Motion change stage 1 (Foundation T18) · #116 · `git show fd3d1d1:docs/diagnostics.md`

### 2026-11-13 · §XXIII — Motion stage 1 gate + documentation cleanup · #116 · `git show aca2b59:docs/diagnostics.md`

### 2026-11-12 · §XXII — Documentation cleanup (audit finding closed) · — · `git show a783d69:docs/diagnostics.md`

### 2026-11-12 · §XXI — App-style favicon and real title · #115 · `git show de87d04:docs/diagnostics.md`

### 2026-11-12 · §XX — ResumePage in a single column, Experience first · #114 · `git show 31d7ee9:docs/diagnostics.md`

### 2026-11-12 · §XIX — TestimonialCard: avatar anchored at the top · #113 · `git show c240dd8:docs/diagnostics.md`

### 2026-11-12 · §XVIII — Real testimonials + Change of TestimonialCard · #112 · `git show 36be49c:docs/diagnostics.md`

### 2026-11-12 · §XVII — CI: Node 26 LTS and quality gates in the deploy · #110–#111 · `git show a9849b7:docs/diagnostics.md`

### 2026-11-11 · §XVI — Visual QA after the content (focused pass) · — · `git show bbb70b9:docs/diagnostics.md`

### 2026-11-11 · §XV — Real content, tests and download CTA · #107–#109 · `git show 0c5c54b:docs/diagnostics.md`

### 2026-11-11 · §XIV — GitHub Pages deploy + motion proposal · #106–#108 · `git show 3496bb7:docs/diagnostics.md`

### 2026-11-06 · §XIII — Bug fix ControlsBar T4 (alignment) · — · `git show 47cd6da:docs/diagnostics.md`

### 2026-10-08 · §XII — Closing of F5 (end of the F1–F5 process) · #104–#105 · `git show 31d8f27:docs/diagnostics.md`

### 2026-10-08 · §XI — Closing of F4 · #103 · `git show 133b1e8:docs/diagnostics.md`

### 2026-10-07 · Closing of F3 · #99–#102 · `git show 7f52303:docs/diagnostics.md`

### 2026-10-06 · Decision #102 — L2: English subject, Spanish body with no accents · #102 · `git show 3da32b9:docs/diagnostics.md`

### 2026-10-06 · Closing of F2 · #99–#101 · `git show 2c086fb:docs/diagnostics.md`

### 2026-10-05 · Decision #101 — inspection-only tasks: red not required · #101 · `git show 81ef2ff:docs/diagnostics.md`

### 2026-10-05 · Decision #100 — `allowExportNames` extended to `BRAND_NAMES` · #100 · `git show d5f5bff:docs/diagnostics.md`

### 2026-10-05 · Decision #99 — canonical P2 assertion pattern · #99 · `git show e28fe86:docs/diagnostics.md`

### 2026-10-05 — Maintenance rule of the log · #98 · `git show 4730d8d:docs/diagnostics.md`

### 2026-10-03 · §VIII — Closing of F1 · — · `git show 1865d86:docs/diagnostics.md`

### 2026-10-03 · §VII — F1 up to T5 · #96 · `git show dd7b35b:docs/diagnostics.md`

### 2026-10-02 · Post-audit findings 1–3 and decision #95 · #95 · `git show dd7b35b:docs/diagnostics.md` (§VI)

### 2026-10-02 · Audits of the agentic system (sections R–V) · #75–#94 · `git show dd7b35b:docs/diagnostics.md`

### 2026-10-02 · Process decisions #67–#74 (sections K–Q) · #67–#74 · `git show dd7b35b:docs/diagnostics.md`

## Historical index — initial audit (2026-09-29 → 2026-10-01)

Textual detail in git: `git show 1865d86:docs/diagnostics.md` (evolution in
`475534a..1865d86`). Paths of the time: `components/` = `specs/`,
`agents/agent/` = `.opencode/agents/`, `packages/cv-design-kit/` = root.

| Section | What | Result |
|---|---|---|
| A | 6 serious contradictions between specs and docs (headroom of TestimonialCard, formula of the h1 under the CornerTab, tabpanel "is a Box", `headingLevel` of Timeline, gradient vs. solid, 3 specs missing in the phases table) | ✅ A1–A6 decided and applied (2026-09-30) |
| B | 9 weak points: contrast of networks and tabs, focus, literal responsive measures, landmarks, `theme-color`, dependencies, global CSS, 12 ambiguities (B8), template sections (B9) | ✅ B1–B9 applied (2026-09-30); the 4 final deviations stayed in the approved specs |
| C | 9 hygiene notes: unused tokens, strict `YearMonth`, `Badge`, opacities with no contrast row, among others | ✅ C1–C9 applied (2026-09-30) |
| D | Programmatic verification: 0 dangling tokens, en/es parity of the examples, label keys, contrasts, breakpoints, typography | ✅ OK; do not review again |
| F | 13 external pending items: lint regex, serialization of builders, commits and permissions of agents, OpenCode format, axe-core instead of `vitest-axe`, ESLint 10, schema/`alt`, MCP | ✅ F1–F13 applied or resolved (2026-09-30); F8 provisional → F5 |
| Verification and kickoff plan | Second pass over the closed A/B/C/F: 27 specs, 0 dangling tokens, verdict "F1 unblocked" and stages 0–3 (stage 2 corrected in #77) | ✅ Fulfilled: F1 closed on 2026-10-03; section removed in the cleanup |
| Context (root causes, state of the repo, how to use this file) | Starting diagnosis of the kit | ✅ Obsolete after F1; removed in the cleanup |
| Documentation register | Two passes so that no document of the kit contradicts the specs | ✅ 2026-09-30 |
| G | CV content in JSON: draft-07 schema, generated types and validator, `src/content/cv.{en,es}.json` | ✅ Applied (2026-10-01), decision **#44** |
| H | Restructuring to a single project: root, `specs/`, `.opencode/agents/`, `@data` alias | ✅ Applied (2026-10-01), decisions **#39–#42** |
| I | Documentation moved to `docs/` (full README, DESIGN, BACKLOG, tokens) | ✅ Applied (2026-10-01), decision **#43** |
| J | React architecture audit: 24 findings (6 critical, 6 high, 12 medium) + later observation on the sticky | ✅ Corrected (2026-10-01), decisions **#45–#66** |
