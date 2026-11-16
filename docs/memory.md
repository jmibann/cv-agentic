# Project memory — cv-agentic (`docs/memory.md`)

Memory between sessions. At most ~50 lines: summarize or remove what no longer adds value.
Only the orchestrator edits it when closing an F gate or on a rules decision (#86).
The historical detail lives in `docs/diagnostics.md` (§I–§XXXV) and `docs/README.md` (#1–#121, with the amendment of #116: `transition: none` excluded).

## Current status (2026-11-15)

- **Delivered — F1–F5 closed**; **28/28 `implemented`**; suite **485/42**. Recent: **#121 CLOSED** (§XXXV: code 100 % in English; comments only on the why and with no internal references, `src/test/comments.test.ts` watches over it; errors and commits in English; the internal documentation is still in Spanish, its translation is in BACKLOG); **#120** (§XXXII: the root `README.md` is the presentation of the repo **in English** and only changes at the user's request; the status lives in `docs/STATUS.md`); **Change #119 CLOSED** (§XXXI: the site's avatar in WebP, `public/images/avatar.webp` 30 KB instead of the 270 KB PNG; Foundation T21); **Change #118 CLOSED** (§XXIX: `projects` collection mandatory in the schema; `cv-agentic` left `experience`; Resume = Experience → Projects → Education → Skills, `code` icon; Foundation T20 + ResumePage T6); **Change #117 CLOSED** (§XXVIII: SEO/OG metadata + JSON-LD + `og-image.png` in `index.html` — Foundation reopened and back to `implemented`; first reopening by a new request, the Change flow worked end to end); **motion system COMPLETE 4/4** (#106/#116, §XXIV–§XXVII).
- **Maintenance 2026-11-11/12 (§XIV–§XIX)**: real CV + 3 real testimonials (#112/#113) with `assetUrl()`/base (#107); tests adapted without weakening; visual QA approved (chevron↔name gap 72.84px at 375; `qa-report.md`). `headline`/job titles in English in `cv.es.json`: editorial decision #109, **do not re-report it**.
- **Motion: CLOSED 4/4** (§XXIV–§XXVII; proposal marked "IMPLEMENTED"). #116 governs as a **permanent rule** (`foundations/motion.md` + `AGENTS.md` → Conventions, `11b475b`; clarification: `transition: none` excluded). Nothing pending in the system; live QA closed the dialog: 200 ms `ease-enter`, closing 0 events ×3 paths.
- **CI (§XVII)**: Node **26 LTS** (`.nvmrc`, which the deploy reads, #110); the deploy runs `lint` → `test` → `build` and does not publish if something fails (#111). Pages published and inspected live (§XXI).
- **Pending**: nothing blocking (general audit §XXXIII, 2026-11-15: deps up to date in range; 7 moderate dev advisories remain because of `minimatch`) · from the user: downloadable PDF ("445 tests", it includes the phone), GitHub "About", PageSpeed · optional: debts of form —including the **new one**: anti-flash `<script>` at column 0 in `index.html`, pre-existing from T4—, StrictMode/F1-F2 (their own rows in **Open items**). The motion and its manual confirmations (Ctrl+P, reduced-motion) were **closed**.

## Non-negotiable rules for any future task

- Source of truth: `docs/constitution.md` > `sdd` skill > spec. **Nobody edits `spec.md`
  without the user's explicit approval** (`ask`, P2/#75/#94); a change in what a test
  expects **is** a spec Change. `src/test/**`, configs and `src/test/a11y.ts`: untouchable.
- Motion (#116, **permanent rule since 2026-11-13**): **no `transition` that produces
  animation in a selector of specificity (0,2,0) or higher**; `transition: none` is
  excluded (it is the suppression). It governs ALWAYS, not only Changes 2–4.
- Future flow: content → `integrator` (owner of `src/content/**`, with
  `validate:content`); change in an existing piece → **Change** (spec→plan→tasks→code);
  new piece → `/sdd-spec` + `/sdd-plan <cat>/<Name>` (gates of a standalone piece);
  visual verification → `reviewer` with the app served by the user (#91; the Chrome MCP
  belongs only to the reviewer).
- Commits: unit = 1 task; `test(<Name>): Tn` (bare subject; #121: subject **and body in
  English**; code comments in English and only the why; `feat`/`fix` do not touch tests; `test` only adds) → `feat(<Name>): Tn`;
  identity `git -c user.name="jmiban" commit`; no `--amend`/`--no-verify`/push; `git add`
  with explicit paths + `git diff --cached --name-only` before (a subagent can leave
  someone else's files staged). Docs are committed by the orchestrator; the code, by its builders.
- Closing of any task: lint + typecheck + test green (build when closing a piece/gate,
  #80). Max. 3 rounds fix↔verify and stop with the exact output.
- `allowExportNames` of `react-refresh` (#96/#100): `useTheme`/`useLocale`/`useCv`,
  `BRAND_NAMES`, `getTabId` — a new name = the user's approval; never move the hook
  or `eslint-disable`. `skipLibCheck: true` accepted (jest-dom 7 vs Vitest 5).
- EARS (3–8 RF derived only from the sections of the spec; RF with no test → report, do not
  invent a test). Class assertion: canon #99 (`const c = styles.name ?? "name"`).
- Fixed stack: React+TS+Vite, CSS Modules, only semantic tokens, no `any`/casts/
  `@ts-ignore`; mobile-first 580/768/992/1200; texts from `useLocale()`/`useCv()`
  (pages/AppLayout); out of scope: what is in `docs/DESIGN.md` and `docs/BACKLOG.md`.
- Public assets: use `assetUrl()`; `vite.config.ts` applies the base `/cv-agentic/` only with
  `DEPLOY_TARGET=gh-pages` (local/Vercel at `/`).
- Verify the real state before asserting (fresh `git status`/`git log`; outputs can
  arrive late in long sessions).
