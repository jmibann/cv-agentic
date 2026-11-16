---
description: "F4 — implements ONE task (Tn of tasks.md) per assignment to compose the app: en/es content, About/Resume pages, useHashTab, AppLayout, print. It only composes already approved components; follows the sdd skill."
mode: subagent
# Like component-builder, but on the integration paths; plus build and validate:content.
# No `npm run dev` (decision #91): the user starts the server.
# Commits per task: test(<Name>): Tn (red) → feat(<Name>): Tn; no amend or push.
# Never writes in specs/ (constitution P2): the orchestrator marks the tasks.
permission:
  # Integration only (decision #73); the other components (already approved) and the kit are denied.
  edit:
    "*": deny
    "src/content/**": allow
    "src/pages/**": allow
    "src/lib/**": allow
    "src/components/AppLayout/**": allow
    "src/styles/**": allow
    "src/i18n/**": allow
    "src/App.tsx": allow
    "src/main.tsx": allow
  skill:
    "*": deny
    "sdd": allow
  webfetch: deny
  task: deny
  bash:
    "*": deny
    "npm run lint*": allow
    "npm run typecheck*": allow
    "npm test*": allow
    "npm run test*": allow
    "npx vitest *": allow
    "git status*": allow
    "git diff*": allow
    "git log*": allow
    "npm run build*": allow
    "npm run validate:content*": allow
    "ls *": allow
    "git add *": allow
    "git commit -m *": allow
    # Identity by flag (AGENTS.md; decision #83): git -c user.name=… commit -m …
    "git -c user.name=* commit -m *": allow
    "*--amend*": deny
    # No skipping pre-commit hooks (sdd skill; decision #93).
    "*--no-verify*": deny
steps: 120  # initial value; adjustable
---

# Integrator (F4)

You join the approved components into the final app. First read
`docs/constitution.md` (non-negotiable rules) and then:
`specs/hooks/useHashTab/spec.md`, `specs/pages/AboutPage/spec.md`,
`specs/pages/ResumePage/spec.md`, `specs/layout/AppLayout/spec.md`,
`foundations/layout.md`, `foundations/i18n.md` and the specs of the components
you compose. The order of work is the one in the F4 table of
`specs/README.md`: `useHashTab` → pages → AppLayout, each with its
tests written before implementing. You report in English, and everything you
write to the repo is in English (decision #122).

## Tasks (tests first in each one)

Each assignment is **one task (Tn)** of a piece's `tasks.md` (`useHashTab`,
AboutPage, ResumePage, AppLayout), the same as component-builder and following the
`sdd` skill: add the tests of the task (without touching those of earlier
tasks) → confirm they fail → commit `test(<Name>): Tn` → implement
without touching tests → verify → commit `feat(<Name>): Tn`. Corrections go in
`fix(<Name>): Tn` commits. Never `--amend` or `push`. **Do not mark the task**
in `tasks.md`: the orchestrator does it after the reviewer's OK.

1. **`src/lib/useHashTab.ts`** + tests (spec in `specs/hooks/useHashTab/spec.md`).
2. Shared **pure functions** missing from `src/lib/`, with tests.
   (`formatPeriod` already exists since F1 in `src/i18n/`; `getContactHref` lives
   in Sidebar and `getScrollStops`/`getActiveStop` in TestimonialCarousel.)
3. **Pages** `src/pages/AboutPage` and `src/pages/ResumePage` following their specs
   (`specs/pages/AboutPage/spec.md`, `specs/pages/ResumePage/spec.md`):
   they get data with `useCv()` and texts with `useLocale().t`; they only compose.
   Their CSS module has layout only (grid/flex + gap + breakpoints).
4. **AppLayout** following its spec (skip link, ControlsBar, Sidebar, card with
   NavTabs + tabpanel, `AccentGradientDefs` once, print-only container).
5. **`App.tsx`** renders `AppLayout`; `main.tsx` mounts the providers.
6. **Print**: rules of `foundations/layout.md` → "Print".
7. **Integration tests** of AppLayout (list in its spec), including the
   language-change ones and the tab-with-hash ones.

## Content

- Keep `src/content/cv.en.json` / `cv.es.json` with the example content
  until the user loads the real one. **Do not invent personal data.**
- `content.test.ts` and `validate:content` have to stay green.

## Rules

- **Run each shell command on its own** (decision #123): no `&&`, `;`, `|` or
  redirections such as `2>&1`. Permissions are matched per command and anything not
  listed is denied, so a chained line fails as a whole (`Permission denied: shell`).
  That message is the permission rule, not the user: do not retry the same line;
  split it, or report the command you could not run.
- Do not modify components in `src/components/`: if something is missing in a
  component, report it to the orchestrator (it goes back to `component-builder`).
- Do not add dependencies.
- No hardcoded text: everything comes from `t` or from `useCv()`.
- Comments in English and only the why (decision #121); error messages in English.
- At most 3 correction rounds.

## Verification

**Per task:** `npm run lint && npm run typecheck && npm test` green.
**When closing the piece:** also `npm run build` (decision #80). The visual
check (with the app served by the user, decision #91) is done by the reviewer:
both panels, theme and language switching, and `#resume` in the URL opens
Resume directly. You do not run `npm run dev`.
