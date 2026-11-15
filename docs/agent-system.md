# Agents (OpenCode)

The 5 agents were written **from scratch** for this project and the project
starts **with no base of learnings**; the memory between sessions lives in
`docs/memory.md` (only the orchestrator edits it).

They are already in their **final location**: OpenCode reads `AGENTS.md` (root) and the
agents in **`.opencode/agents/`** (plural folder, as in OpenCode's current
documentation). There are no templates and no install step: if an agent is
edited, it is edited here.

> This documentation lives in `docs/agent-system.md` and **not** inside
> `.opencode/agents/` on purpose: OpenCode would treat any `.md` in that
> folder as an agent. It used to be called `docs/agents.md`: it was renamed
> (decision #92) because on case-insensitive file systems
> (macOS) it clashed with `AGENTS.md` and some tools took it as
> instructions for the `docs/` directory.

## Agent format

- YAML header with `description` (in quotes), `mode`
  (`primary` | `subagent`), `permission` and, in subagents, `steps`.
- **`permission` replaces `tools`**, which OpenCode marks as obsolete.
  Keys used: `edit` (covers write and patch), `bash` (pattern rules;
  **the last match wins**, which is why `"*"` goes first), `task` (which
  subagents it may invoke), `skill` (which skills it may load: `"*": deny` +
  a list of allowed ones, or `allow` for all) and `webfetch`.
- **`skill` (decisions #78 and #87)** is declared in the 5 agents, always
  as an explicit list (`"*": deny` + allowed ones): all 5 load **`sdd`** and the
  reviewer also the global `browser-testing-with-devtools` (visual QA). OpenCode
  also sees the global skills in `~/.agents/skills` and `~/.claude/skills`
  (for example `spec-driven-development`, which would create a parallel `SPEC.md`, or
  `git-workflow-and-versioning`): none is enabled. The TDD flow is
  embedded in the prompts.
- **No `model`**: the orchestrator uses the global model and subagents
  inherit that of the agent that invokes them.
- `steps`: cap of iterations per invocation (initial values, adjustable);
  it reinforces the rule of at most 3 correction rounds.

| Agent | edit | bash | task | skill | steps |
|---|---|---|---|---|---|
| orchestrator | `docs/STATUS.md` (status, #120), `docs/diagnostics.md` (log; format, Open items table and pruning #98), `docs/memory.md` (status and memory); `docs/qa-report.md` (F5 report, #85); `docs/README.md` and `docs/agent-system.md` (decision register and agent docs, #95); `specs/**/plan.md` and `specs/**/tasks.md` (it drafts them and marks tasks); `spec.md` only with `ask` | verifications, reading git, and `git add`/`git [-c user.name=…] commit -m` limited to `docs/*` and `specs/*` (decision #76; no `--amend` or `--no-verify`, no `git add .`/`-A`) | only the 4 subagents | `sdd` | — |
| foundation | only the app: `src/**`, `public/**`, `index.html`, `package*.json`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `.nvmrc`, `.gitignore` | `ask` by default; install, scaffold, `git init`, `git add` and `git [-c user.name=…] commit -m` allowed; `push`, `--amend`, `--no-verify`, `reset --hard` and `rm -rf` denied | deny | `sdd` | 150 |
| component-builder | only `src/components/**` | verifications (lint, typecheck, test), reading git, `git add` and `git [-c user.name=…] commit -m` (no `--amend` or `--no-verify`) | deny | `sdd` | 80 |
| integrator | only `src/content/**`, `src/pages/**`, `src/lib/**`, `src/components/AppLayout/**`, `src/styles/**`, `src/i18n/**`, `src/App.tsx`, `src/main.tsx` | verifications, build, `validate:content`, `git add` and `git [-c user.name=…] commit -m` (no `--amend` or `--no-verify`; `npm run dev` denied, #91) | deny | `sdd` | 120 |
| reviewer | deny | only verifications, build, `validate:content`, reading git and `grep`; the only one with the `chrome-devtools_*` MCP | deny | `sdd`, `browser-testing-with-devtools` | 60 |

**Editing per group** (decisions #72 and #73): foundation, component-builder and
integrator have `edit` with `"*": deny` and only allow the paths of their group
(table above). The kit (`README.md`, `AGENTS.md`, `opencode.json`, `docs/**`,
`tokens/**`, `foundations/**`, `specs/**`, `data/**`, `.opencode/**`) is
denied to all three. The limit is per group, not per piece: component-builder
may write in any `src/components/<Name>/`; using only the one of its
task is set by its prompt and checked by the reviewer. Outside those paths (for
example `src/test/`) no subagent writes after F1. The `data/*.generated.*` files are not an `edit` exception: they are
regenerated only with scripts (`gen:types`, `build:validator`). The `edit` permission
does not cover bash (`cp`, `npm run`): that is covered by the prompt rule and the reviewer.

**Commits (decisions F3, #69 and #76):** code commits are made by foundation,
component-builder and integrator, with `git -c user.name="jmiban" commit -m` (identity by flag, decision #83). **For each task (Tn of
`tasks.md`):** `test(<Name>): Tn` with the tests in red → `feat(<Name>): Tn`
with the implementation → `fix(<Name>): Tn` if there are corrections. `feat`/`fix` do not
touch tests; `test` only adds. The orchestrator marks the task in
`tasks.md` when the reviewer approves it and **commits the documents
itself** (`git add` limited to `docs/*` and `specs/*` +
`git commit -m`, only with the repo green, with the message in English (subject and body, #121) and no
`git add .`/`-A`). `--amend`, `--no-verify` (#93), `reset --hard` and `push` are denied. The
reviewer does not commit.

**Known limit of bash patterns (decision #88):** in OpenCode `*`
accepts any text, spaces included, so `"git add specs/*"` also
lets `git add specs/x src/y` through, and `git commit -m *` commits whatever
is staged. The guarantee "the orchestrator only commits documents" comes from
two controls: the orchestrator checks `git diff --cached --name-only` before
each commit, and the reviewer, in each full review of a piece and of a phase,
verifies with `git show --stat` that the `docs(...)` commits since the previous
gate only touch `docs/**` or `specs/**`.

## Agents

| Agent | Mode | Writes code | Responsibility |
|---|---|---|---|
| [orchestrator](../.opencode/agents/orchestrator.md) | primary | No | Goes through F1–F5, delegates, stops at each gate for the user's approval |
| [foundation](../.opencode/agents/foundation.md) | subagent | Yes | F1: one Tn at a time of `specs/foundation/Foundation/` (decision #84): scaffold of the app at the root, tooling, `@data` alias, tokens, font, providers, anti-flash script |
| [component-builder](../.opencode/agents/component-builder.md) | subagent | Yes | F2–F3: one component at a time, strict TDD from its spec |
| [integrator](../.opencode/agents/integrator.md) | subagent | Yes | F4: pages, en/es content, `useHashTab`, AppLayout, print |
| [reviewer](../.opencode/agents/reviewer.md) | subagent | No | F5 and at the end of each phase: independent verification with a clean context |

## Flow

```
User ──► orchestrator
              │
   F1 ────────┼──► spec of foundation/Foundation (/sdd-spec) ──► spec GATE
              │    plan.md + tasks.md of Foundation ──► Plan + Tasks GATE
              │    foundation × Tn (test → feat) ──► reviewer per task and piece
              │                                   ──► F1 GATE
   F2 ────────┼──► Clarification of each piece (reviewer detects; gate only with findings, #90)
              │    plan.md + tasks.md of the 11 primitives ──► Plan + Tasks GATE
              │    component-builder × N (one piece at a time, one Tn at a time)
              │        └─► reviewer per task and per piece ──► GATE per piece
              │                                   ──► F2 GATE
   F3 ────────┼──► same as F2 with the 12 composites (in dependency order)
              │                                   ──► F3 GATE
   F4 ────────┼──► same with integrator           ──► F4 GATE
   F5 ────────┴──► reviewer (full QA: 4 viewports × 2 themes × 2 languages; no Tn, #85)
                   └─► report in docs/qa-report.md ──► defects as tasks of their piece
                                                  ──► FINAL GATE
```

The order and dependencies of the components are in
[specs/README.md](../specs/README.md).

## Maintenance mode (since 2026-10-08)

F1–F5 closed (see §XII in `docs/diagnostics.md` and `docs/qa-report.md`). No
phase gates remain open; the system stays operational for maintenance
with the same 5 agents, the `sdd` skill and the `/sdd-*` commands. Work opened as of
2026-11-15: deploy base (§XIV), **real CV** with its spec Change (§XV, #109),
**visual QA approved** (§XVI) and **CI** (§XVII: Node 26 LTS from `.nvmrc`, #110;
`lint` → `test` → `build` before publishing, #111) and **real testimonials** (§XVIII–§XIX, #112–#113) , **Resume in one column** (§XX, #114) and **favicon + title** (§XXI, #115) closed; **motion COMPLETE 4/4** (§XXIV–§XXVII, #106/#116 — #116 is a permanent rule in `foundations/motion.md` and `AGENTS.md`) and **SEO and Open Graph metadata** (§XXVIII, #117: the first reopening of a closed piece for a new request — spec→plan→T19→QA on `dist/`—) and the **Projects section in Resume** (§XXIX, #118: `projects` collection in the schema and the content) closed as well; plus the **avatar in WebP** (§XXXI, #119) and the **public README in English with the status in `docs/STATUS.md`** (§XXXII, #120); all pushed and published. Only what is
postponed in the BACKLOG remains ("SEO per language", PDF per language, images,
automated contrast…).
The workflow `.github/workflows/deploy.yml` is maintained by the user (no agent
edits it). Future tasks:

| Future task | Flow | Owner |
|---|---|---|
| Update the CV (bilingual content, avatar, `downloadCvUrl`) | no new spec: a simple assignment + `npm run validate:content` + `npm test`; if it touches the contract, it is a Change | `integrator` (`src/content/**`) |
| Modify an existing piece | `/sdd-change <cat>/<Name>` (spec with `ask` → plan → tasks → Tn) | its builder (F2/F3) or `integrator` (F4) |
| New piece/function (BACKLOG) | `/sdd-spec` → `/sdd-plan <cat>/<Name>` → Tn (`/sdd-implement`) → `/sdd-validate` | depends on its folder |
| Verify on the served site | `/sdd-validate` or a short prioritized pass (the reviewer's budget runs out in broad passes — F5 lesson) | `reviewer` (the only one with the Chrome MCP) |

Duties of each loop: marking tasks + committing docs (orchestrator), independent
review (reviewer), and **push always by the user** (#91/#76: no agent
pushes or touches `git config`). The memory (`docs/memory.md`) is updated on
rule decisions or when closing gates of a standalone piece; the log, with its
format (#98).

## `/sdd-*` commands

Shortcuts for the SDD flow in `.opencode/commands/`. Each one runs with a project
agent (never with the native `plan`/`build`), so it respects its
permissions, the constitution and the `sdd` skill. The argument is the folder of the
spec, `<category>/<Name>` (for example `primitives/Badge`).

| Command | Agent | What it does |
|---|---|---|
| `/sdd-status <cat>/<Name>` | orchestrator | Phase, tasks done and next command (it modifies nothing) |
| `/sdd-spec <cat>/<Name> <idea>` | orchestrator | Interviews and drafts a new spec (`spec.md` with `ask`) |
| `/sdd-clarify <cat>/<Name>` | reviewer | QA of the spec: ambiguities, contradictions, RFs with no test; it does not resolve (the orchestrator resolves it with the user). "No findings" on an approved spec → no gate (#90) |
| `/sdd-change <cat>/<Name> <change>` | orchestrator | Proposes the change in the spec (with `ask`); plan and tasks follow |
| `/sdd-plan F1…F4` · `/sdd-plan <cat>/<Name>` | orchestrator | With a phase: `plan.md` + `tasks.md` of all its pieces, a single gate. With a standalone piece or a Change: only `plan.md` (Plan gate) |
| `/sdd-task <cat>/<Name>` | orchestrator | `tasks.md` of a standalone piece or a Change (Tasks gate) |
| `/sdd-implement <cat>/<Name> Tn` | orchestrator | Delegates ONE task (test → feat), requests the review, marks the task and stops |
| `/sdd-validate <cat>/<Name>` | reviewer | Full review RF by RF: `npm test` + `npm run build` + Chrome DevTools MCP (app served by the user, #91) |

- **`/sdd-validate` and the MCP:** `opencode.json` (root) declares the local
  server `chrome-devtools` with a pinned version (`npx -y chrome-devtools-mcp@1.10.1`,
  decision #91; it requires Node ≥ 20.19, the project uses 26 (`.nvmrc`, #110); raising it is a
  user decision). With `enabled: true` the server starts in every
  session even though only the reviewer can use it (OpenCode does not enable an MCP per
  agent; it is an accepted startup cost). Its tools are called `chrome-devtools_*`:
  `opencode.json` denies them for everyone (`"permission": {"chrome-devtools_*": "deny"}`)
  and **only the reviewer** enables them in its header (the agent's rule is
  applied after the global one; verified with `opencode debug agent`). **Development server (#91):** no agent
  runs `npm run dev` (it is a process that never ends and blocks the agent). The
  **user** starts it in their terminal before `/sdd-validate`, before closing a
  piece with visual QA and before F5; the orchestrator requests it before invoking the
  reviewer and passes it the URL (`http://localhost:5173`). If the app does not respond or
  the MCP fails, the reviewer does not stop halfway: it lists those RFs as "not verified
  (visual QA)" and says so in the report.
- **`/constitution` was removed** (decision #79): the original prompt no longer
  applies and `docs/constitution.md` is the living source.
- The commands are optional: the same can be asked of the orchestrator in
  natural language.
