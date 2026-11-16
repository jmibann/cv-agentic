# SkillList
Status: implemented

## Purpose

Skills as **a single list of chips**, with no percentages or bars and without
grouping by category.

## Requirements (EARS)

- RF-1: WHEN `skills` contains elements, THEN THE SYSTEM renders a `<ul>` with one chip per skill in the order of the data; IF `skills` is empty, THEN it renders nothing.
- RF-2: THE SYSTEM requires exactly one of `labelledBy` or `label` for the accessible name: passing both or neither does not compile. Verification: **two** `// @ts-expect-error` cases (decision 15: both and neither).
- RF-3: THE SYSTEM renders each skill as `Badge as="li"` inside a list that wraps, with no percentages, bars or grouping by category. The chip is painted **entirely by Badge**: SkillList passes it no `className` of its own (the `.chip` class of the anatomy is illustrative of the `<li>` Badge renders; decision 15).
- RF-4: THE SYSTEM places the list directly on `--color-surface` (the chip would share a background with `Box variant="inner"` and would disappear). Usage restriction: the reviewer verifies it in the consumer (ResumePage, F4); the piece does not detect surfaces.
- RF-5: THE SYSTEM declares no `@media` of its own: the wrap resolves the responsive behavior according to the available width. A single chip wider than the container **overflows with no special rule** (decision 15: no ellipsis or `maxLength` in the schema; it is checked with the real content in QA F5).
- RF-6: THE SYSTEM tolerates duplicated skills with stable keys (index + value). Verification: test 5 (render with no warning) + inspection of the key formula in the code.

## Anatomy

```html
<ul class="skillList" aria-labelledby="resume-skills-title">
  <li class="chip">React</li>          <!-- Badge as="li" -->
  <li class="chip">TypeScript</li>
  …
</ul>
```

It normally goes below a `SectionTitle as="h2"` "Skills" inside a
`<section aria-labelledby>` (ResumePage composes it). In that case the list does not
need an `aria-label` of its own: `labelledBy` is passed with the h2's id.

## API

```ts
/** Mandatory accessible name: exactly one of the two. */
type SkillListName =
  | { labelledBy: string; label?: never }   // id of the heading that names the list
  | { label: string; labelledBy?: never };  // already translated text

export type SkillListProps = SkillListName & {
  skills: readonly string[];
  /** Joined to the base class of the root `<ul>` (G-B). */
  className?: string;
};
```

The list **always** has an accessible name, and never with text written in the
component: it either references a heading (`labelledBy`) or receives an already
translated `label`. Passing both or neither is a compile error.

## Styles and tokens

| Part | Value |
|---|---|
| List | `display: flex; flex-wrap: wrap; gap: var(--space-2); list-style: none; margin: 0; padding: 0;` |
| Chip | `Badge as="li"` (`surface-muted` background, radius 8, `--font-size-badge`) |

- The list goes **directly on `--color-surface`** (the card), **not** inside
  a `Box variant="inner"`: the chip has the same background as the inner box and
  would disappear. (The theme put the bars in an inner box; with chips it does not apply.)

## States

It is not interactive: no hover or focus.

## Responsive

No `@media` of its own: the list wraps according to the available width.


## Accessibility

- `ul` with a name (by `aria-labelledby` or `aria-label`); screen readers announce
  "list, N items".
- The order is that of the data.

## Expected tests

1. `getByRole("list", { name })` with one `listitem` per skill, in order.
2. With `labelledBy`, the accessible name comes from the referenced heading (`<h2 id>` scaffold in the test, Badge-`ul`/Overhead-`dl` criterion); with `label`, it is that text.
3. (Types) Two `// @ts-expect-error` cases: omitting both does not compile; passing both does not compile.
4. Empty `skills` → it renders nothing (`null`).
5. Duplicated skills do not break the render (stable keys: index + value; no React warning in `console.error`).
6. It concatenates `className` on the root `<ul>` (G-B, criterion #99 of the phase).
7. `expectNoA11yViolations` with no violations.

## Do not

- Do not add levels, percentages, bars or stars.
- Do not group by category (closed decision; see `docs/README.md`, decision #3).
