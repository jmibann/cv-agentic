# ResumeSection
Status: implemented

## Purpose

"Experience", "Projects" or "Education" block of the Resume panel: h2 title with IconBox +
Timeline.

## Requirements (EARS)

- RF-1: WHEN `entries` contains elements, THEN THE SYSTEM renders a `<section>` named by its title; IF `entries` is empty, THEN it renders nothing.
- RF-2: THE SYSTEM renders a `SectionTitle` `as="h2"` with a derived `id` and `icon` (which SectionTitle mounts in its decorative `IconBox`, RF-3 of SectionTitle), followed by a `Timeline` with the entries, the `locale` and the `presentLabel` received, and the **explicit `idPrefix` received by prop** (decision 14: there is no internal "education"→"edu" derivation; ResumePage sets it).
- RF-3: THE SYSTEM derives **only the id of the `h2`** of the section with the fixed formula `resume-${id}-title` (`id` from the prop); the uniqueness of the ids of the Timeline items is guaranteed by its `idPrefix` (RF-5 of Timeline), not by this piece.
- RF-4: THE SYSTEM delegates the column arrangement to ResumePage and declares no `@media` of its own. Verification: inspection of the piece's CSS.
- RF-5: THE SYSTEM exposes the section as a region named by its `h2` (`aria-labelledby`). The h3 level of the Timeline titles is set by Timeline (RF-2 of its spec) and checked in its tests; here the named region is verified by test 1.

## Anatomy

```html
<section aria-labelledby="resume-education-title">
  <SectionTitle as="h2" id="resume-education-title" icon="book-open">Education</SectionTitle>
  <Timeline idPrefix={timelineIdPrefix} entries={entries} locale={locale} presentLabel={presentLabel} />
</section>
```

## API

```ts
import type { IconName } from "../Icon";
import type { Locale, TimelineEntry } from "@data/cv.types.generated";

export interface ResumeSectionProps {
  /** Stable identifier of the section: base of the h2's id (`resume-${id}-title`). */
  id: string;
  /** Explicit prefix forwarded to Timeline for its item ids (e.g. "edu", "exp"); decision 14. */
  timelineIdPrefix: string;
  title: string;
  icon: IconName;
  entries: readonly TimelineEntry[];
  locale: Locale;
  presentLabel: string;
  /** Joined to the base class of the root `<section>` (G-B). */
  className?: string;
}
```

## Styles and tokens

- `display: flex; flex-direction: column;`
- The h2 uses SectionTitle's `margin-bottom`; nothing more is added between title and timeline.
- The arrangement of the sections (a single column, stacked; #114) is done by **ResumePage**, not by this component.

## States

It is not interactive. With empty `entries` it is not rendered.

## Responsive

No `@media` of its own. The column arrangement is decided by ResumePage.

## Accessibility

- `<section>` named by its h2 (`aria-labelledby`), so it shows up as a region.
- The Timeline titles are h3 (one level below).

## Expected tests

1. `getByRole("region", { name: title })`.
2. It contains a level 2 heading with `title` and a decorative IconBox.
3. It renders the Timeline with the entries (`listitem` × n).
4. Empty `entries` → it does not render the section (`null`).
5. Two ResumeSection with different `id` produce different `resume-<id>-title` (only the h2's id; RF-3).
6. `expectNoA11yViolations` with no violations.

## Do not

- Do not render the section with empty `entries`: it returns `null`.
- Do not decide columns or declare `@media`: the arrangement is done by ResumePage.
- Do not add space between the title and the Timeline: SectionTitle's `margin-bottom` is enough.
- Do not use fixed ids: they are derived from `id` so that two sections do not duplicate them.
