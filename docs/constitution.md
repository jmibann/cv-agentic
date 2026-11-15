# Constitution — cv-agentic

Non-negotiable rules. They sit above every other document. If a spec, a task or an agent
contradicts them: stop and ask the user. Changing this file requires the user's explicit
approval and an entry in the decision register (`docs/README.md`).
Each rule states how to verify it.

## 1. Simple stack
- **S1** Only the dependencies listed in `docs/README.md` are installed; a new one requires the user's approval. *Verify:* compare `package.json` with the list.
- **S2** A single project: one `package.json`, one `tsconfig.json`, no workspaces and no extra build tools. *Verify:* repo root.
- **S3** Styles = CSS Modules + `tokens/tokens.css`. No CSS-in-JS, Tailwind or UI kits. *Verify:* grep `styled-components|@emotion|tailwind`.
- **S4** No router, global state library or backend. State = React state + the theme and language contexts. *Verify:* dependency list.
- **S5** Node 26 LTS (`.nvmrc`, also for CI), TypeScript `~6.0`, `^` within the documented major version, `package-lock.json` committed. *Verify:* `package.json`.

## 2. Spec before code
- **P1** There is no code without a spec in `specs/` or `foundations/`. *Verify:* every `src/components/<Name>/` has its `specs/**/<Name>/spec.md`.
- **P2** The spec wins. Code that contradicts it is a bug; if the spec looks wrong, stop and ask. No agent edits `spec.md` without the user's explicit approval (the orchestrator does it with `ask` permission); only the orchestrator writes `plan.md`/`tasks.md` (approved by the user) and marks each task after the reviewer's OK.
- **P3** Tests come from the spec's list of tests; nothing is added silently (extras carry `// extra: <reason>`).
- **P4** Per task (Tn in `tasks.md`): commit `test(<Name>): Tn` (red) → `feat(<Name>): Tn` (green); `fix(<Name>): Tn` if there are corrections. *Verify:* `git log`.
- **P5** A spec change goes first, in its own commit, approved by the user.

## 3. Separation of concerns
- **C1** Logic (formatting, validation, data transformation) lives in pure `*.ts` files, with no React or DOM imports (except `use*.ts` hooks): in `src/lib/`, `src/i18n/` or `src/content/` if shared; inside `src/components/<Name>/` if a single component uses it, exported and with its own test. *Verify:* grep the imports.
- **C2** Components only render props and emit events: no content imports, no `fetch`, no business rules. The hook exceptions are in `specs/README.md`.
- **C3** The CV content lives only in `src/content/cv.{en,es}.json` and validates against `data/cv.schema.json`; interface texts, only in `src/i18n/ui.{en,es}.ts`. *Verify:* `npm run validate:content`.
- **C4** Visual values come only from tokens (hard rules in `docs/DESIGN.md`). *Verify:* the reviewer's greps.

## 4. Tests
- **T1** Every component, hook and pure function has its `*.test.ts(x)` next to it. *Verify:* file pairs.
- **T2** Tests are written before the code and are never weakened: no deleted or relaxed assertions, no `.skip`/`.only`. *Verify:* `feat`/`fix` commits do not touch test files and `test(<Name>): Tn` commits do not delete test lines (`git log -p`).
- **T3** Queries by role and accessible name; `data-testid` only with a comment that justifies it.
- **T4** Every component test file ends with `expectNoA11yViolations`.
- **T5** Done **per task** = `lint` (0 warnings), `typecheck` and `test` green after the implementation commit; a green `build` is required when closing the **piece** and at every gate (decision #80). *Verify:* command output.

## 5. Data protection
- **D1** No analytics, trackers, cookies or third-party requests at runtime (fonts and icons ship in the bundle). *Verify:* the network tab only shows the site's origin.
- **D2** The site collects no visitor data: no forms, no backend, no `fetch` to external services. *Verify:* grep `fetch|XMLHttpRequest|sendBeacon`.
- **D3** `localStorage` stores only `cv:theme` and `cv:locale`, always inside `try/catch`. *Verify:* grep `localStorage`.
- **D4** Real personal data appears only in `src/content/*.json`; examples, fixtures and tests use fictional people.
- **D5** No secrets, API keys or `.env` values in the repo or in the bundle. *Verify:* grep + `.gitignore`.
- **D6** External links open with `rel="noopener noreferrer"`. *Verify:* component tests.

## 6. Language
- **L1** English for all documentation (`docs/`, `specs/`, `foundations/`, `AGENTS.md`, `.opencode/`) (#122). **Code comments are written in English** and only explain **why** (#121): they do not describe what the code does, do not repeat the spec and carry no internal references (RF-n, Tn, decision n, #n, §n); traceability lives in `specs/`. *Verify:* `src/test/comments.test.ts`.
- **L2** English for the code: identifiers, file names, test names, error messages and commit messages (subject and body, #121).
- **L3** User-facing content exists in English and Spanish only in `src/content/cv.{en,es}.json` and `src/i18n/ui.{en,es}.ts`.
