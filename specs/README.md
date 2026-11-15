# Component specs

Each `spec.md` is the **contract** of a component: the agent that writes the
tests derives them from the *Expected tests* section, and the agent that implements
cannot change the API or weaken tests without going through the user.

## Index and build order

| Phase | Component | Spec | Depends on |
|---|---|---|---|
| F1 | Foundation | `foundation/Foundation/spec.md` (drafted at the F1 kickoff with `/sdd-spec`; decision #84) | — |
| F2 | Icon | [primitives/Icon/spec.md](primitives/Icon/spec.md) | lucide-react |
| F2 | BrandIcon | [primitives/BrandIcon/spec.md](primitives/BrandIcon/spec.md) | — |
| F2 | Box | [primitives/Box/spec.md](primitives/Box/spec.md) | — |
| F2 | Button | [primitives/Button/spec.md](primitives/Button/spec.md) | Icon |
| F2 | Badge | [primitives/Badge/spec.md](primitives/Badge/spec.md) | — |
| F2 | Overhead | [primitives/Overhead/spec.md](primitives/Overhead/spec.md) | — |
| F2 | IconBox | [primitives/IconBox/spec.md](primitives/IconBox/spec.md) | Icon |
| F2 | SectionTitle | [primitives/SectionTitle/spec.md](primitives/SectionTitle/spec.md) | IconBox |
| F2 | Separator | [primitives/Separator/spec.md](primitives/Separator/spec.md) | — |
| F2 | CornerTab | [primitives/CornerTab/spec.md](primitives/CornerTab/spec.md) | — |
| F2 | HexAvatar | [primitives/HexAvatar/spec.md](primitives/HexAvatar/spec.md) | — |
| F3 | ThemeToggle | [controls/ThemeToggle/spec.md](controls/ThemeToggle/spec.md) | Icon, ThemeProvider |
| F3 | LanguageSwitcher | [controls/LanguageSwitcher/spec.md](controls/LanguageSwitcher/spec.md) | LocaleProvider |
| F3 | ControlsBar | [controls/ControlsBar/spec.md](controls/ControlsBar/spec.md) | ThemeToggle, LanguageSwitcher, LocaleProvider |
| F3 | NavTabs | [layout/NavTabs/spec.md](layout/NavTabs/spec.md) | CornerTab |
| F3 | Sidebar | [layout/Sidebar/spec.md](layout/Sidebar/spec.md) | Box, Badge, IconBox, Overhead, Separator, Button, CornerTab, BrandIcon, Icon |
| F3 | Timeline | [content/Timeline/spec.md](content/Timeline/spec.md) | — |
| F3 | ResumeSection | [content/ResumeSection/spec.md](content/ResumeSection/spec.md) | SectionTitle, Timeline |
| F3 | SkillList | [content/SkillList/spec.md](content/SkillList/spec.md) | Badge |
| F3 | ServiceCard | [content/ServiceCard/spec.md](content/ServiceCard/spec.md) | Box, Icon |
| F3 | TestimonialCard | [content/TestimonialCard/spec.md](content/TestimonialCard/spec.md) | Icon, HexAvatar |
| F3 | TestimonialDialog | [content/TestimonialDialog/spec.md](content/TestimonialDialog/spec.md) | Icon, HexAvatar |
| F3 | TestimonialCarousel | [content/TestimonialCarousel/spec.md](content/TestimonialCarousel/spec.md) | TestimonialCard, TestimonialDialog |
| F4 | useHashTab (hook) | [hooks/useHashTab/spec.md](hooks/useHashTab/spec.md) | — |
| F4 | AboutPage | [pages/AboutPage/spec.md](pages/AboutPage/spec.md) | SectionTitle, ServiceCard, TestimonialCarousel, LocaleProvider (`useCv`, `useLocale`) |
| F4 | ResumePage | [pages/ResumePage/spec.md](pages/ResumePage/spec.md) | SectionTitle, ResumeSection, SkillList, LocaleProvider (`useCv`, `useLocale`) |
| F4 | AppLayout | [layout/AppLayout/spec.md](layout/AppLayout/spec.md) | everything above, including useHashTab, AboutPage and ResumePage |

Outside the table: `specs/motion/proposal.md` is an approved **cross-cutting
proposal** for motion (decision #106), not a piece: it has no
`spec.md`/`plan.md`/`tasks.md` yet. When they are approved, its pieces will enter
this table under the `motion` category.

**Who builds each phase:** F1 → `foundation`. F2 and F3 → `component-builder`. F4 →
`integrator`, in the order of the table: `useHashTab` → pages → AppLayout.
**Unit of work: one task (Tn) of the piece's `tasks.md` per assignment**
(`sdd` skill), with its tests written **before** the implementation.
**Always one piece and one task at a time**, in the order of the table (no
parallel work), with two commits per task: `test(<Name>): Tn` in red and
`feat(<Name>): Tn`. The orchestrator marks the task in `tasks.md` when the
reviewer approves it and commits that change.
Completion criterion for each row: all its tasks marked, the "Expected
tests" of its spec green + `lint` + `typecheck` (`npm run build`
runs when closing the piece), the reviewer's full
review and the user's approval (`Status: implemented`).

`ThemeProvider` and `LocaleProvider` are not visual components: their specs are
in [foundations/theming.md](../foundations/theming.md) and
[foundations/i18n.md](../foundations/i18n.md), and they are built in F1 as
tasks of the piece `foundation/Foundation` (with the tooling, i18n, initial
content and anti-flash), with the same Tn model as the rest.

## File structure (in the app)

```
src/components/<Name>/
├─ <Name>.tsx            component (named export + exported props type)
├─ <Name>.module.css     styles (semantic tokens only)
├─ <Name>.test.tsx       tests (RTL + axe-core via `expectNoA11yViolations`)
└─ index.ts              export { <Name> } from "./<Name>"; export type { <Name>Props } …

src/pages/<Name>/        AboutPage, ResumePage: same structure (.tsx, .module.css, .test.tsx, index.ts)
src/lib/useHashTab.ts    hook + useHashTab.test.ts
```

## Rules common to all components

- **Props in, events out.** No component imports content (`useCv`)
  or texts (`useLocale`) on its own, **except** those whose spec says so
  explicitly (ThemeToggle, LanguageSwitcher, ControlsBar, AboutPage,
  ResumePage, AppLayout).
  Interface texts arrive as props (`labels`) from the page.
- **No outer margin.** The parent positions with `gap`. **Documented
  exceptions** (the only ones): `SectionTitle` (its `margin-bottom` is the
  title → content space, see its spec) and `Separator` (full-bleed: it is
  positioned relative to the Box padding). Any other exception is a
  spec change.
- **`className?: string`** on the root element, concatenated to its own class.
- **No `any`**, no `as` to cover up type errors, no `// @ts-ignore`,
  no `eslint-disable`.
- **Colors only with semantic tokens** (`--color-*`, `--gradient-*`, `--shadow-*`).
- **Tests with accessible queries** (`getByRole`, `getByLabelText`, `getByText`);
  `data-testid` only if there is no accessible alternative, justified in a comment.
- **Every test file ends with an accessibility case** using the project's
  helper (`src/test/a11y.ts`, based on `axe-core`; see
  `.opencode/agents/foundation.md`):

  ```ts
  import { expectNoA11yViolations } from "../../test/a11y";

  it("has no accessibility violations", async () => {
    const { container } = render(<Name {...props} />);
    await expectNoA11yViolations(container);
  });
  ```

## Structure of the spec folder

Each piece lives in its own folder with a `spec.md` (the contract, with its
`Status`). `plan.md` and `tasks.md` are drafted by the orchestrator and approved
**per phase**: all of F1's together, then F2, F3 and F4 (F5 has no plan or
tasks, decision #85; see the `sdd` skill).

```
specs/<category>/<Name>/
├─ spec.md      contract of the piece: Status + 10 sections
├─ plan.md      files, decisions and test strategy          (Plan + Tasks gate of the phase)
└─ tasks.md     Tn with "Done when"                         (same)
```

There are no loose `.md` files inside `specs/<category>/`: the only exceptions
are `specs/README.md` (this index) and `specs/motion/proposal.md` (a cross-cutting
proposal, not a piece spec).

## Spec template

```text
# <Name>
Status: draft | approved | implemented

## Purpose             — what it solves, in one or two sentences
## Requirements (EARS) — RF-1 … RF-n, derived from the sections below
## Anatomy             — HTML structure/parts
## API                 — props interface (TS), default values
## Styles and tokens   — measures and tokens per part
## States              — hover, focus, active, disabled, empty ("Not interactive" if there are none)
## Responsive          — changes per breakpoint ("No @media of its own" if everything scales through tokens)
## Accessibility       — roles, names, keyboard
## Expected tests      — list of cases (source of truth for the test author)
## Do not              — known mistakes or temptations to avoid
```

`Status:` goes right below the title and only changes with the user's approval.
`## Requirements (EARS)` goes right after `## Purpose` (before the section
that follows it: Anatomy, API…); the EARS format is in the `sdd` skill.

All sections are **mandatory** and explicit, even if their content
is "Not interactive" or "No `@media` of its own": the reviewer verifies against
them. Only exception: hooks (no UI) mark Anatomy, Styles and tokens,
Responsive and Accessibility as "Not applicable".
