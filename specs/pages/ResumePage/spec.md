# ResumePage
Status: implemented

## Purpose

Content of the **Resume** panel: Experience, Projects and Education (timelines) and
Skills (chips). It is rendered inside AppLayout's tabpanel.

## Requirements (EARS)

- RF-1: THE SYSTEM always renders a single `h1` with `t.resume.title`, with the hierarchy h1 → h2 (section) → h3 (Timeline item).
- RF-2: WHEN `experience`, `projects` or `education` have entries, THEN THE SYSTEM renders that `<section>` named by its `h2`; IF a set is empty, THEN its section does not appear, and IF the three are empty, it does not render `.columns` (#118: `projects` is added to the two original collections).
- RF-3: THE SYSTEM stacks the sections in a single column at all widths, in the order Experience → Projects → Education (DOM order, not CSS `order`: the reading and focus order matches the visual one). Verification: test 2 (order of the regions) + CSS inspection + QA (#114; Projects between the two: #118).
- RF-4: WHEN `skills` is not empty, THEN THE SYSTEM renders the skills `<section>` with its list; IF it is empty, THEN it does not render it.
- RF-5: THE SYSTEM gets the data with `useCv()` and the texts with `useLocale().t`, without sorting the entries (the order is that of the data). Verification of "without sorting": code inspection (the reviewer).
- RF-6: THE SYSTEM keeps `.page` in normal block flow (so that the `h1` flows next to the floating tab), stacks the sections with a one-column grid and applies layout only, with no visual styles. Verification: CSS inspection + QA F5.
- RF-7: THE SYSTEM forwards `t.timeline.present` as `presentLabel` to each `ResumeSection`. Verification: test 4 with mocked content (it does not depend on the kit's fixture).

## Anatomy

```html
<div class="page">
  <SectionTitle as="h1" decorated>Resume</SectionTitle>              <!-- t.resume.title -->

  <div class="columns">
    <ResumeSection id="experience" title={t.resume.experience} icon="briefcase"
                   entries={cv.experience} locale={locale} timelineIdPrefix="exp"
                   presentLabel={t.timeline.present} />
    <ResumeSection id="projects"   title={t.resume.projects}   icon="code"
                   entries={cv.projects}   locale={locale} timelineIdPrefix="proj"
                   presentLabel={t.timeline.present} />                <!-- #118 -->
    <ResumeSection id="education"  title={t.resume.education}  icon="book-open"
                   entries={cv.education}  locale={locale} timelineIdPrefix="edu"
                   presentLabel={t.timeline.present} />
  </div>

  <section aria-labelledby="resume-skills-title">                    <!-- if there are skills -->
    <SectionTitle as="h2" id="resume-skills-title">Skills</SectionTitle>
    <SkillList skills={cv.skills} labelledBy="resume-skills-title" />
  </section>
</div>
```

`ResumeSection` generates its own ids (`resume-experience-title`,
`resume-projects-title`, `resume-education-title`) and is not rendered if its collection is empty. The
page **sets the Timeline id prefixes** (decision 14 of ResumeSection,
mandatory prop `timelineIdPrefix`): `"exp"`, `"proj"` and `"edu"`; there is no internal
derivation.

## API

```ts
export interface ResumePageProps {
  className?: string;
}
```

`className` is joined to the root's `.page` class (G-B); it has its join test
(test 9) even though AppLayout does not pass it today.

Data with `useCv()` (`experience`, `projects`, `education`, `skills`) and texts and language with
`useLocale()` (`const { t, locale } = useLocale()`: `t.resume.*`,
`t.timeline.present`; `locale` is the provider's **active language**, not
`cv.locale`, which is the language of the file). A page component: it **can**
use those hooks.

## Styles and tokens

Layout only:

| Part | Value |
|---|---|
| `.page` | **Normal block flow** (not flex or grid): `.page > * + * { margin-top: var(--stack-gap); }`. The `h1` is the first child. |
| `.columns` | `display: grid; row-gap: var(--stack-gap);` — a single column at all widths, with no `@media` (RF-3, #114; the class keeps its name) |

**Why block and not flex:** at ≥ lg the navigation tab floats on the
right (`CornerTab placement="float"`) and the `h1` has to flow beside it.
A flex/grid container (or one with `overflow` ≠ `visible`) creates its own
formatting context and would narrow as a whole next to the tab instead of flowing.
The inner blocks that come after the `h1` (lists, grids, sections)
can be flex/grid: by the time they start, the tab has already ended.

## States

- No `experience`, no `projects` or no `education` → that section does not appear;
  the others stay at full width (the grid has one column).
- None of the three → it does not render `.columns`.
- No `skills` → it does not render the skills `<section>`.
- The `h1` is always rendered.

## Responsive

Experience, Projects and Education stacked in a single column at all
widths, in that order (#114, #118). Skills always at full width, below.

## Accessibility

- A single `h1`.
- Experience, Projects, Education and Skills are regions named by their `h2`.
- Hierarchy: h1 → h2 (section) → h3 (Timeline item).

## Expected tests

(Wrapping with `LocaleProvider` and the kit's example content; the
variants with empty collections or with `end: null` are obtained by mocking the
content module (`vi.mock` with delegation, precedent
`LanguageSwitcher.test.tsx`); the tests mount a scaffold `AccentGradientDefs`
(SectionTitle→IconBox→Icon `tone="gradient"`); they need neither `HexAvatarDefs` nor
ThemeProvider.)

1. Level 1 heading with `t.resume.title`, unique: `getAllByRole("heading", { level: 1 })` of length 1.
2. Regions with the names `t.resume.experience`, `t.resume.projects` and `t.resume.education`, in that order inside `.columns` (RF-3), each with one `listitem` per entry.
3. Region with the name `t.resume.skills` with a list that has one `listitem` per skill.
4. With the content mocked with an entry `"end": null` (without depending on the kit's fixture), the panel shows `t.timeline.present` (RF-7).
5. With empty `education` (mock) that region does not exist and Experience is still present; with `experience`, `projects` and `education` empty (mock) none of the three regions exists and the `h1` is still present (RF-2; the absence of `.columns` is verified by inspection of the markup).
6. With empty `skills` (mock) the skills region does not exist.
7. With `locale = "es"` it shows texts of `ui.es` and content of `cv.es`.
8. `expectNoA11yViolations` with no violations.
9. It concatenates `className` on the root `.page` (G-B).
10. Region with the name `t.resume.projects` (`resume-projects-title`) with one `listitem` per entry of `cv.projects`, in the order of the data (#118).
11. With empty `projects` (mock) that region does not exist and Experience and Education are still present (RF-2, #118).

## Do not

- Do not add visual styles: layout only.
- Do not sort the entries (the order is that of the data).
