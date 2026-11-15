# AGENTS.md — cv-agentic

Personal CV site. **A single project** (one `package.json`, no
workspaces): the design kit and the app live together at the root. **Node 26 LTS**
(`.nvmrc`, which CI also reads); versions as in `docs/README.md` → "Environment and approved dependencies".

## Structure

```
cv-agentic/
├─ AGENTS.md                  (this file)
├─ README.md                  presentation of the repo (#120; it only changes at the user's request)
├─ docs/                      constitution, STATUS (status), full README, DESIGN, BACKLOG, diagnostics, memory, agent-system.md, qa-report (F5), tokens/ (breakpoints, contrast), images/ (README capture)
├─ tokens/                    tokens.css (the app imports it)
├─ foundations/               typography, layout, motion, theming, i18n
├─ specs/                     one folder per piece: <category>/<Name>/spec.md (foundation, primitives, controls, layout, content, pages, hooks) + motion/proposal.md (cross-cutting proposal, not a piece)
├─ data/                      cv.schema.json (source of truth), constants.ts, example JSON files and *.generated.* (@data alias)
├─ .opencode/agents/          the 5 agents (orchestrator, foundation, component-builder, integrator, reviewer)
├─ .opencode/skills/sdd/      skill of the SDD flow (SKILL.md)
├─ .opencode/commands/        /sdd-* commands (shortcuts for the flow; see docs/agent-system.md)
├─ opencode.json              OpenCode config: Chrome DevTools MCP (denied except for the reviewer)
├─ package.json               scripts: dev, lint, typecheck, test, build, gen:types, build:validator, validate:content
├─ index.html                 includes the anti-flash script (theme, language and theme-color)
├─ public/                    images/ (avatar.webp, testimonial photos and the example silhouettes), cv/ (downloadable PDF), og-image.png, favicon.svg, apple-touch-icon.png
├─ vite.config.ts · tsconfig.json (a single one) · eslint.config.js · .nvmrc
└─ src/
   ├─ main.tsx                imports ../tokens/tokens.css, the font and base styles; mounts the providers
   ├─ styles/global.css       reset + typographic base (tokens only)
   ├─ providers/              ThemeProvider, LocaleProvider (+ hooks)
   ├─ i18n/                   ui.en.ts, ui.es.ts, format.ts, formatPeriod.ts
   ├─ content/                cv.en.json, cv.es.json (editable), index.ts, content.test.ts, schema.test.ts
   ├─ lib/                    useHashTab and other shared pure functions
   ├─ utils/                  assetUrl.ts (prefixes Vite's `base` to the assets in public/, #107)
   ├─ scripts/                build-validator.ts, validate-content.ts (run by the npm scripts)
   ├─ components/<Name>/      <Name>.tsx, <Name>.module.css, <Name>.test.tsx, index.ts
   ├─ pages/                  AboutPage, ResumePage
   └─ test/                   setup.ts (jest-dom, mocks: matchMedia, dialog, ResizeObserver, scrollTo) · a11y.ts (expectNoA11yViolations, axe-core)
```

`specs/` holds the **specifications**; `src/components/` the **code**.
Do not confuse them.

## Source of truth

**`docs/constitution.md` is above everything** (this file included):
non-negotiable rules on stack, spec before code, separation of
concerns, tests, data protection and language (S1–S5, P1–P5,
C1–C4, T1–T5, D1–D6, L1–L3). If something contradicts it, stop and ask.

Below the constitution, **the design kit rules** (`docs/`, `tokens/`,
`foundations/`, `specs/`, `data/`). Before touching code, read:

1. `docs/constitution.md` (non-negotiable rules)
2. `docs/DESIGN.md` (hard design rules)
3. `tokens/tokens.css` + `docs/tokens/` (contrast, breakpoints)
4. The component's spec in `specs/<category>/<Name>/spec.md`

If the spec and the code do not match, **the spec wins**. If the spec looks
wrong or incomplete, **stop and ask the user**; the spec is not
"fixed" on one's own initiative.

## Memory
- The project's memory lives in **`docs/memory.md`** (there is no `MEMORY.md` at the root).
- When you start, read it to learn the state of the project and the decisions made.
- **Only the orchestrator updates it**, when closing each F gate and on a user decision that changes rules (`sdd` skill, decision #86): current status,
  important decisions (with their reason) and mistakes to avoid. Subagents read it; they do not edit it.
- Keep it short (at most ~50 lines): summarize or remove what no longer adds value.
- The project's log lives in **`docs/diagnostics.md`** (decisions #86 and #98):
  one entry with a fixed format per F gate or rule decision, an **Open items**
  table that is always up to date (what is closed **leaves** the table) and no
  status sections (the status is in `docs/STATUS.md` and in `docs/memory.md`);
  if it goes over 150 lines, the orchestrator reduces to **one line** per entry those
  older than the ones of the last two F gates (`date · title · #n ·
  git show <hash>:docs/diagnostics.md`, creation hash).
- If something becomes a permanent rule, propose moving it to `AGENTS.md` instead of leaving it in the memory.
- Never store sensitive data (keys, tokens, personal data).

## Commands (from the root)

| Command | What it does |
|---|---|
| `npm install` | Installs the dependencies |
| `npm run dev` | Vite dev server (the user runs it; no agent does, decision #91) |
| `npm run lint` | ESLint with `--max-warnings 0` |
| `npm run typecheck` | `tsc --noEmit` (a single `tsconfig.json`: `src/`, `data/`, `vite.config.ts`) |
| `npm test` | Vitest in run mode |
| `npm run build` | `prebuild` (generates types and validator, validates the content) + `tsc --noEmit && vite build` |
| `npm run gen:types` | Regenerates `data/cv.types.generated.ts` from `data/cv.schema.json` |
| `npm run validate:content` | Validates `src/content/cv.*.json` against the schema |

**Definition of done** for any task: `lint`, `typecheck` and `test`
green, with no warnings, **after the implementation commit** (between the commit
of the red tests and the implementation one the repo is red on purpose).
`build` **does not run per task**: the orchestrator, the integrator or the
reviewer run it **when closing the piece** and at every gate (decision #80).

## Conventions

- Language (decision #122): all documentation, everything written to the repo and the
  agents' conversation with the user are in English. The only Spanish in the repo is
  user-facing content (`src/content/cv.es.json`, `src/i18n/ui.es.ts`).
- TypeScript `strict`, `noUnusedLocals`, `noUnusedParameters`,
  `noUncheckedIndexedAccess`. No `any`, no `@ts-ignore`, no `eslint-disable`.
  Intentionally unused parameters: `_` prefix.
- Components: a function with a named export + `export interface <Name>Props`.
  No `React.FC`. No default exports (except where the tool requires it).
- Styles: **CSS Modules only** and **semantic tokens only**. Zero color
  literals outside `tokens.css`.
- Mobile-first with 580 / 768 / 992 / 1200. Every measure that changes by
  breakpoint is a token in `tokens.css`; in a component's `@media` there are only
  layout changes (and, if needed, tokens, `calc()` of tokens or `0`).
- Focus: always the standard ring (`--focus-ring-width` / `--focus-ring-offset`).
- `z-index` always with a `--z-*` token.
- Comments (#121): **in English and only the why** — a non-obvious constraint, a
  workaround for a browser or jsdom bug, an accessibility reason, an order
  that cannot be changed, the provenance or license of a resource. Do not comment
  what the code does, do not repeat the spec or narrate the history of tasks, and no
  internal references (RF-n, Tn, decision n, #n, §n): traceability lives in
  `specs/`. Error messages, in English too.
- Motion (#116): no `transition` that animates in selectors of (0,2,0)+;
  `transition: none` is excluded (it is suppression). Contract in `foundations/motion.md`.
- Texts: content from `useCv()` (only in pages/AppLayout), interface
  from `useLocale().t`. Nothing hardcoded in components.
- **Unit of work: one task (Tn) of `specs/<cat>/<Name>/tasks.md`** (`sdd` skill).
  Commits (Conventional Commits, **subject and body in English**, #121) per task, in this order:
  `test(<Name>): Tn` (tests only, red) → `feat(<Name>): Tn` →
  `fix(<Name>): Tn` if there are corrections.
  No `--amend`, no rewriting history, no push (unless the user asks).
  **Do not modify `git config`**: the identity is passed by flag, always in the
  same form: `git -c user.name="jmiban" commit -m "<message>"` (the email comes
  from the global config). It is the form the bash permissions of the
  committing agents accept (decision #83).
  Code commits are made by foundation, component-builder and integrator; the
  orchestrator commits **documents only** (`docs/*`, `specs/*`),
  with the repo green and with explicit paths (never `git add .`/`-A`);
  the reviewer does not commit (decision #76).
- **One task at a time** (no parallel work): tests in red break the
  global `typecheck` and everyone shares the working folder.
- **`specs/` belongs to the user and the orchestrator:** nobody edits `spec.md` without the
  user's explicit approval (the orchestrator does it with `ask`);
  `plan.md`/`tasks.md` are written by the orchestrator, which also marks and
  commits each task when the reviewer approves it. Subagents do not write in `specs/`.

## Tests

- Vitest + React Testing Library + `@testing-library/user-event` + `axe-core`
  (helper `expectNoA11yViolations` in `src/test/a11y.ts`).
- Queries by role and accessible name. `data-testid` only as a last resort,
  justified.
- Every component test file ends with an `expectNoA11yViolations` case.
- **Never weaken a test to make it pass.** Deleting or relaxing an assertion,
  adding `.skip`/`.only`, or changing what a test expects **is a spec
  change** and the user decides it.
- The tests of each task are written **before** its implementation and
  committed in red (`test(<Name>): Tn`). `feat`/`fix` commits **do not touch**
  test files, and `test(<Name>): Tn` commits **only add** tests (they do not delete
  or change those of earlier tasks): the reviewer verifies it with `git log -p`
  on the piece's test files.

## Dependencies

Only the ones listed in `docs/README.md` → "Environment and approved
dependencies". Any other: ask the user.

## Limits

- Do not modify the design kit (`README.md`, `AGENTS.md`, `docs/`, `tokens/`,
  `foundations/`, `specs/`, `data/`, `.opencode/`) unless the user explicitly asks.
  Exceptions: `data/*.generated.*` are regenerated with the scripts, never by hand;
  the orchestrator updates `docs/STATUS.md` ("Current status"), `docs/memory.md` and
  `docs/diagnostics.md` when closing each F gate (decision #86; fixed format,
  Open items table and pruning at 150 lines: #98), writes
  `docs/qa-report.md` in F5 (decision #85), maintains the register in
  `docs/README.md` and `docs/agent-system.md` (decision #95), drafts
  `specs/**/plan.md`/`tasks.md` and edits `spec.md` only with approval (`ask`).
- **The CV content is edited only in `src/content/cv.{en,es}.json`**; its
  format is defined by `data/cv.schema.json`.
- Do not create files outside the folder assigned in the task.
- At most **3 rounds** of "fix and verify again" per task; if it still
  fails, stop and report with the exact output of the commands.
