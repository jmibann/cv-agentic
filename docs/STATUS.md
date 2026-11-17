# Project status — cv-agentic

Internal status board (it used to be the root `README.md`; it moved here with
decision #120). The presentation of the repo is in [README.md](../README.md).

Personal CV site (**React + TypeScript + Vite + CSS Modules**, responsive,
light/dark, en/es) built by OpenCode agents with
**spec-driven development**.

## Current status (2026-11-17)

| What | Status |
|---|---|
| Design kit (rules, tokens, foundations, 28 specs, data contract) | ✅ Complete and audited; `## Do not` in the 27 component specs + Foundation (#89) |
| Single spec model (`specs/<category>/<Name>/{spec,plan,tasks}.md`, template of the `sdd` skill, `Status` + `Requirements (EARS)` in the 27) | ✅ Migrated and approved (2026-10-02); `plan.md`/`tasks.md` are drafted by the orchestrator at its gates |
| OpenCode agents (5) | ✅ In `.opencode/agents/`; the orchestrator also edits the decisions register and `docs/agent-system.md` (#95) |
| Diagnosis A, B, C, F, restructurings H/I, audit J and constitution (K) | ✅ Closed |
| Git repository (baseline) | ✅ Initialized; first commits of the spec model |
| Sticky of the Sidebar on short screens | ✅ Resolved: sticky only with a height ≥ 900px |
| Constitution (`docs/constitution.md`) | ✅ In force; P1 verified against `specs/**/<Name>/spec.md` (decision #68); P2/P4/T2 per task (decision #69); P2 clarified (decision #75) |
| `/sdd-*` commands | ✅ Integrated: they run with the orchestrator or the reviewer, with the argument `<category>/<Name>` (decision #71) |
| Gates | ✅ Plan + Tasks per phase F1–F4 (#74, #84, #85); Clarification only with findings (#90): between ~37 and ~65 gates instead of ~113 |
| Architecture audit (agents, skills, commands) | ✅ Closed (2026-10-02): no blockers; 6 points corrected (#75–#80); re-audit: 4 medium findings corrected (#81–#82); third audit: 2 high (#83 git identity in permissions, #84 F1 as the piece `foundation/Foundation` with Tn) 7 medium (#85–#91) and low (#92–#94) corrected; nothing pending |
| Unit of work and memory | ✅ Per task (Tn) across the whole system; single memory in `docs/memory.md` (decisions #69 and #70) |
| CV content in JSON (schema + validation) | ✅ Operational since F1: schema + generated files (`gen:types`, `build:validator`) + `validate:content` green; initial content in `src/content/cv.{en,es}.json` |
| `spec.md` of `foundation/Foundation` + `plan.md` / `tasks.md` | ✅ Approved; Tasks of the other pieces: at the start of their F phase |
| **F1 Foundation** (piece `foundation/Foundation`, Tn per assignment) | ✅ **Closed (2026-10-03)**: spec `Status: implemented`; T1–T11 + T2b/T3b/T5b/T8b approved; full review APPROVED; visual QA in the browser APPROVED. Changes: `skipLibCheck`, #96 (`react-refresh` hooks), #97 (`ucs2length` accepted). Minor debts in `docs/memory.md` |
| **F2 Primitives** (Icon, BrandIcon, Box, Button, Badge, Overhead, IconBox, SectionTitle, Separator, CornerTab, HexAvatar — 11 pieces) | ✅ **CLOSED (2026-10-06)**: the 11 specs `Status: implemented`; per piece: review per task + full review APPROVED + `build` ✅. Suite: 236 tests, 0 warnings. Decisions applied: #99, #100, #101 (green on-arrival declared; single `feat` commit in IconBox T3; distribution gaps covered with notes in `tasks.md`: `index.ts` in all of them, `className` in CornerTab T1). Closing entry: §IX in `docs/diagnostics.md` (pruning #98 applied). Minor F2 debts and deferred usage restrictions → **Open items** table of diagnostics and the lines below |
| **F3 Composites** (12 pieces) | ✅ **CLOSED (2026-10-07)**: the 12 specs `Status: implemented` (ThemeToggle, LanguageSwitcher, ControlsBar, NavTabs, Sidebar, Timeline, ResumeSection, SkillList, ServiceCard, TestimonialCard, TestimonialDialog, TestimonialCarousel). Per piece: review per task + full review APPROVED + `build` ✅. Suite: **395 tests**, 0 warnings. Milestones: Foundation T12, extension #100 `"getTabId"`, assertion adjustments between tasks with explicit approval (`4ff4424`, `b6efae7`), **Accessibility change option A** (`div` slides, axe closing case green with no filters), 2 gates r1→r2 (NavTabs, TestimonialDialog T1), decision **#102**. Closing entry: §X in `docs/diagnostics.md` (pruning #98 applied). Accumulated follow-ups → row "F3 follow-ups" in **Open items** of diagnostics |
| **F4 Integration** (hooks/useHashTab, pages/AboutPage, pages/ResumePage, layout/AppLayout + content es/en + print) | ✅ **CLOSED (2026-10-08)**: the 4 specs `Status: implemented` (17 tasks; `build` ✅ after the repair `7e07fcc`). Final `App.tsx` on top of AppLayout; print set by the `data-*` contract + `global.css` with a stable About→Resume order (**decision #103**; new token `--z-skip` in `tokens.css`). The items inherited from F3 were verified: skip-link→ControlsBar ✓ test 8, single banner ✓ test 1, defs ×1 ✓ test 7, single tabpanel and ids not duplicated ✓ tests 9/12 + anti-`duplicate-id` scan, no-BFC ✓ inspection, RF-4 surfaces of primitives in consumers ✓. Milestones: `isTabId` guard without touching NavTabs, adjustments T2b/T3b with explicit approval, 3 pure verifications with no `feat` (#101), comment-only repair of F2 (`*/` in a comment). Closing entry: §XI in `docs/diagnostics.md`. **F4 follow-ups** (real print, sticky/float/contrasts…) → new row in **Open items** → F5 |
| **F5 QA** | ✅ **CLOSED (2026-10-08) — end of the F1–F5 process**: 4 passes of the reviewer with chrome-devtools MCP on the served app + **real Ctrl+P approved by the user** (6/6 paper criteria). The first pass detected the package **#104** (print B-2/B-3/M-1, D1 overlap 375, D2/D3 rings, D4 favicon) → 8 new tasks in their pieces, all approved and re-verified live; visual decisions **#105** (favicon closed, **F8 closed** `9rem` final, base `< md` `6.375rem`, chevron with semantic accent). Report with evidence: `docs/qa-report.md`; closing: §XII in diagnostics. **28/28 specs `implemented`, suite 445/40, build ✅.** Non-blocking residues → row "Post-F5 pending items" (real content + optional debts of form) |
| **Maintenance (2026-11-06)** | ✅ **Bug fix ControlsBar T4**: ThemeToggle and LanguageSwitcher aligned in a flex row with `.group` (`display: flex; align-items: center; gap: var(--controls-gap)`); the inert `gap` of the `<header>` was removed. No change of API/ARIA/spec. Suite **446/40**, lint/typecheck/build ✅; visual QA 375/768/1024/1440 × light/dark × en/es ✅. Commits `d65ac7a`/`9f9de59`; T4 in `specs/controls/ControlsBar/tasks.md`. |
| **GitHub Pages deploy (2026-11-11)** | ✅ `vite.config.ts` uses the base `/cv-agentic/` only with `DEPLOY_TARGET=gh-pages` (local/Vercel stay at `/`); `src/utils/assetUrl.ts` prefixes `BASE_URL` to public assets and leaves external URLs intact. `HexAvatar` and the download CTA of the `Sidebar` use it. Commits `c2d4232` and `5f6c0a6`; suite **447/40**, lint/typecheck/build ✅. |
| **Real CV (2026-11-11)** | ✅ **Loaded and validated**: `src/content/cv.{en,es}.json` with the real CV, 3 real testimonials (since 2026-11-12, #112), contact with no phone/WhatsApp and `downloadCvUrl` to the PDF; avatar updated and `avatar.svg` removed; tests adapted with fixtures and expectations derived from the content. Commits `3855eb0` `befb0db` `63f6665`; `validate:content`/build ✅. Spec/plan/tasks of Foundation aligned with the real content and `headline`/job titles of `cv.es.json` in English by editorial decision (decision **#109**). **Visual QA APPROVED (§XVI)**: grid 375–1440 × themes × languages with no overflow or overlaps and chevron↔name gap at 375px with the real name = **72.84px** (→ `docs/qa-report.md`). |
| **CI and Node 26 (2026-11-12)** | ✅ **Node 26 LTS** (`.nvmrc` `26`, `@types/node` `^26`; constitution S5 and approved environment updated, **#110**) and `deploy.yml` reads `node-version-file: .nvmrc`. **Quality gates** in the deploy: `lint` → `test` → `build`; if something fails nothing is published (**#111**); without the `VITE_API_URL` line. Commits `cf28268` and `35dbf2d`; suite **447/40**, lint/typecheck/build ✅. Detail: §XVII. |
| **Testimonials (2026-11-12)** | ✅ 3 real testimonials (María Angélica Grael, Pablo Tigani, Diego Rafael Harari) with their real photos; literal texts in their original language and translated into the other one (**#112**). Changes of `TestimonialCard`: T5, the quote no longer covers long names; T6 (**#113**), the avatar stays anchored at the top and aligned between cards with any number of lines. QA in the browser 375–1440 × light/dark × en/es ✅. Commits `b0f19bc` `11d5edc` `7f7cbe3` `390bb06` `24faf70` `8bac5b7`; detail §XVIII–§XIX. |
| **Resume in one column (2026-11-12)** | ✅ Experience at the top and Education below, each with its timeline at full width, at all widths (**#114**, ResumePage T5; previously they went side by side from 768px). Order inverted in the DOM so that reading and focus follow the visual one. Commits `28e6ecf` `1c16bf5` `174bc4e`; detail §XX. |
| **Favicon and title (2026-11-12)** | ✅ App-style favicon (blue square, white hexagon and JM monogram), `apple-touch-icon.png` 180×180 and tab title `Juan Manuel Ibáñez · Frontend Engineer` (**#115**, Foundation T14). Commits `a0d7b5f` `3b4db39` `516621a` `9ebcca4`; detail §XXI. |
| **Motion (2026-11-13)** | ✅ **COMPLETE SYSTEM 4/4** (#106/#116, §XXIV–§XXVII; proposal marked "IMPLEMENTED"): 1 Foundation — token scale, `data-theme-switching`, contract and docs (`motion.md` C3 `5edfcb0`); 2 AppLayout — panel entrance with direction (pure `getTabDirection`, `key`, `backwards`, print in the module); 3 Sidebar — grid expansion `0fr↔1fr` (`data-contacts-animate`, `calc` stagger, P5' ≥1200, print id in `global.css`; Ctrl+P collapsed ✓ user); 4 TestimonialDialog — entrance `--ease-enter` with `@starting-style`, **instant closing measured on the 3 paths**, close hover keeps standard (Ctrl+P dialog open ✓ user). Suite **466/41**, **28/28 `implemented`**, build ✓. **#116 is a permanent rule** (`foundations/motion.md` + `AGENTS.md` → Conventions, `11b475b`; clarification `transition: none` excluded in `docs/README.md`). |
| **SEO and Open Graph metadata (2026-11-14)** | ✅ **Change #117 CLOSED** in Foundation (single task T19): `meta description`, canonical, Open Graph (5), `twitter:card`, JSON-LD `Person` cross-checked with `cv.en.json` and identity canonical≡`og:url`≡`url`, `public/og-image.png` 1200×630 intact; placement respecting the T4 contract of the anti-flash. Contract tests +6 in `anti-flash.test.ts`; the reviewer's QA on `dist/` ✓. Commits `472bc1d` `a75e7fa` `0025a21` `f17cd78` `00a8268`; suite **472/41**, build ✓; detail §XXVIII. It resolves `docs/BACKLOG.md` → "Metadata and Open Graph"; **"SEO per language" stays open** (metadata only in English, with no `hreflang` or `og:locale`). |
| **Projects in Resume (2026-11-14)** | ✅ **Change #118**: `projects` collection in the schema and the content (the `cv-agentic` project left `experience`) and a Projects section in Resume, between Experience and Education, with the `code` icon (Foundation T20 + ResumePage T6; 479/41, build green). |
| **Avatar in WebP (2026-11-15)** | ✅ **Change #119**: `public/images/avatar.webp` (512×512 with alpha, 30 KB) replaces the 270 KB PNG that PageSpeed flagged with 263 KiB of savings; content and examples point to `/images/avatar.webp` (Foundation T21). Suite **482/41**. Pushed and published (WebP served, PNG at 404); measuring again in PageSpeed is still missing. |
| **README in English (2026-11-15)** | ✅ **#120**: the root `README.md` presents the repo in English (the user's text, diagram of the agent system, light/dark capture); this board moved to `docs/STATUS.md` and the agents point here. |
| **Code in English (2026-11-15)** | ✅ **#121**: "why-only" comments in English in all the code (`.ts`/`.tsx` 54 % → 12 % of comment, CSS 66 % → 15 %, tests 44 % → 3 %), error messages in English and guard test `src/test/comments.test.ts` (Foundation T22). Code identical byte for byte without comments; suite **485/42**. The internal documentation was translated afterwards (#122). Pushed and published. |
| **Documentation in English (2026-11-16)** | ✅ **#122**: the 117 kit documents (`AGENTS.md`, `docs/`, `foundations/`, `specs/`, `.opencode/`) translated in full, with the structural terms in English (`Status`, `Requirements (EARS)`, `Done when`, gate, `Open items`); the agents talk to the user in English; L1 amended; the guard test also covers the documents (Foundation T23). Suite **487/42**. Pending: run the OpenCode agents once with the translated prompts. |
| **Surname without the accent (2026-11-17)** | ✅ **Change CLOSED** in Foundation (single task T24): `Ibáñez` → `Ibañez` in the `<title>`, `og:title` and JSON-LD `name` of `index.html`, in `profile.name` of `cv.{en,es}.json`, in the testimonial quote of `cv.en.json` and in `public/og-image.png` (the user provided the regenerated variant: the accent is the only difference, 1200×630, committed untouched in the `feat`). `comments.test.ts` untouched (its whitelist keeps the accented form for the historical records); in documents the new spelling goes only inside backticks, quotes or code blocks. Commits `73d6c59` `86bac00` `ed2949f` `29ad713` `bad7180` `ec85c1a`; suite **487/42**, validate:content and build ✓; detail §XXXIX. |
| Post-delivery / next work (2026-11-15) | Published on GitHub Pages (metadata #117, Projects section #118 and WebP avatar #119 verified on the served site; README #120 verified on GitHub). General audit §XXXIII: dependencies up to date within the ranges. No blocking items pending; the optional ones of the **Open items** table of `docs/diagnostics.md` remain (debts of form, StrictMode/F1-F2, three points of the user: PDF, GitHub "About", PageSpeed) and what is postponed in `docs/BACKLOG.md`. |

Detail and decisions: [docs/diagnostics.md](diagnostics.md).

## Structure

```
cv-agentic/
├─ README.md          presentation of the repo, in English
├─ AGENTS.md          conventions for the agents (OpenCode reads it from the root)
├─ docs/              documentation (constitution, STATUS —this file—, full README, DESIGN, BACKLOG, diagnostics, agent-system.md, tokens/)
├─ tokens/            tokens.css (the app imports it)
├─ foundations/       typography · layout · motion · theming · i18n
├─ specs/             one folder per piece (<category>/<Name>/spec.md) + motion/proposal.md
├─ data/              JSON schema of the CV (source of truth) + examples
├─ .opencode/         agents/ (the 5 agents), skills/sdd/, commands/ (/sdd-*)
├─ opencode.json      OpenCode config (Chrome DevTools MCP, only for the reviewer)
└─ src/ · public/ · index.html · package.json   ← the app
```

## Maintenance (current mode — since 2026-10-08)

The F1–F5 process closed; the site was **delivered and green** (487 tests,
build, validate:content, QA in the browser and on paper; latest work:
Node 26 LTS and quality gates in the deploy, 2026-11-12; motion 4/4, 2026-11-13;
SEO and Open Graph metadata #117 and Projects section #118, 2026-11-14;
avatar in WebP #119, code #121 and documentation #122 in English, 2026-11-15/16;
surname without the accent (Foundation T24), 2026-11-17).
To reopen work, the flow lives in the `sdd` skill and the agents in
`.opencode/agents/`:

| I want to… | How |
|---|---|
| Update the CV (texts, avatar, testimonials, `downloadCvUrl`) | Edit `src/content/cv.{en,es}.json` (format fixed by `data/cv.schema.json`) → `npm run validate:content` + `npm test`. With the final real name: re-observe at 375px es/en the chevron↔name gap (row "Post-F5 pending items" of diagnostics). Assignment to the `integrator` (owner of `src/content/**`) |
| Change the behavior/look of a piece | sdd **Change**: spec → plan → tasks → code (gates); defect found → new task in its `tasks.md` |
| New piece/feature (e.g. those of `docs/BACKLOG.md`) | `/sdd-spec <category>/<Name>` → spec gate → `/sdd-plan <cat>/<Name>` → Plan+Tasks gate → delegation per Tn → reviewer |
| Verify something on the served site | `npm run dev` (you run it, #91) + a focused pass of the `reviewer` with chrome-devtools |
| Know where everything is | Memory: `docs/memory.md` · Log/pending: `docs/diagnostics.md` (**Open items**) · Decisions #1–#122: `docs/README.md` · Final QA: `docs/qa-report.md` · Motion: `specs/motion/proposal.md` |

Rules that stay in force with no exception: specs untouchable without your approval
(P2/#94); `src/test/**` and configs, nobody edits them; `src/test/a11y.ts`, never;
TDD commits per task with no `--amend` or push (push: only you); DoD = lint +
typecheck + test per task, `build` when closing a piece/gate.

## Where to start

1. [docs/constitution.md](constitution.md): the non-negotiable rules
   of the project (they are above everything).
2. [docs/README.md](README.md): what the kit is, how the app uses it,
   approved dependencies and decisions register.
3. [docs/DESIGN.md](DESIGN.md): visual language and hard rules.
4. [specs/README.md](../specs/README.md): index of specs and build order.
5. [AGENTS.md](../AGENTS.md) and [docs/agent-system.md](agent-system.md): how the agents work.
6. [docs/memory.md](memory.md): project memory (status and recent decisions).
