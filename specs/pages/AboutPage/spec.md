# AboutPage
Status: implemented

## Purpose

Content of the **About** panel: introduction, services ("What I'm Doing") and
testimonials. It is rendered inside AppLayout's tabpanel.

## Requirements (EARS)

- RF-1: THE SYSTEM always renders the `h1` with `t.about.title`.
- RF-2: WHEN `profile.about` has paragraphs, THEN THE SYSTEM renders `.intro` with one `<p>` per element; IF `services` is empty, THEN it does not render its `<section>`; IF `testimonials` is empty, THEN it renders neither the `h2` nor the carousel (decision 20 of the F3 Clarification: the testimonial no longer lives in a `<section>` of the page — the region is the `TestimonialCarousel`'s own `<section>`, named with `labelledBy`).
- RF-3: THE SYSTEM gets the data with `useCv()` and the texts with `useLocale().t`, and passes the raw templates of `t.testimonials` in the carousel's labels (the one that interpolates with `format` is the carousel).
- RF-4: THE SYSTEM keeps `.page` in normal block flow (no flex or grid or `overflow` other than `visible`) so that the `h1` flows next to the floating tab of NavTabs. Verification: CSS inspection (jsdom does not compute) + QA F5.
- RF-5: THE SYSTEM exposes a single `h1`, names each region with its `h2` (the services one, its `<section aria-labelledby>`; the testimonials one, the carousel's own `<section>` via `labelledBy` — RF-1 of TestimonialCarousel) and renders the services as a `<ul>`.
- RF-6: THE SYSTEM applies layout only: no visual styles, with services in 1 column that become 2 from lg on. Verification: CSS inspection + QA F5.

## Anatomy

```html
<div class="page">
  <SectionTitle as="h1" decorated>About Me</SectionTitle>            <!-- t.about.title -->
  <div class="intro">
    <p>…</p>                                                        <!-- one per profile.about -->
  </div>

  <section aria-labelledby="about-services-title">                   <!-- if there are services -->
    <SectionTitle as="h2" id="about-services-title">What I'm Doing</SectionTitle>
    <ul class="services">                                           <!-- grid -->
      <li><ServiceCard service={…} /></li>
    </ul>
  </section>

  <!-- if there are testimonials: direct siblings in .page; the region is the carousel's <section> (decision 20) -->
  <SectionTitle as="h2" id="about-testimonials-title">Testimonials</SectionTitle>
  <TestimonialCarousel testimonials={cv.testimonials} labels={carouselLabels} labelledBy="about-testimonials-title" className={styles.testimonials} />
</div>
```

## API

```ts
export interface AboutPageProps {
  className?: string;
}
```

`className` is joined to the root's `.page` class (G-B). That AppLayout does not pass it
today does not remove it: it is the common surface of the pieces and it has its join
test (test 8).

Data with `useCv()` (`profile.about`, `services`, `testimonials`) and texts with
`useLocale().t` (`t.about.*`, `t.testimonials.*`). It is a page component:
it **can** use those hooks (exception documented in `specs/README.md`).

The carousel's labels are the raw templates of `t.testimonials`:
`readMore` receives `{author}`, `slide` receives `{current}`/`{total}`, `goToSlide`
receives `{n}` — **the one that interpolates with `format` is the carousel, never the page**
(RF-3). Explicit mapping:

```ts
const carouselLabels: TestimonialCarouselLabels = {
  carousel: t.testimonials.carouselLabel,
  slide: t.testimonials.slideLabel,   // "{current} of {total}"
  goToSlide: t.testimonials.goToSlide, // "Go to slide {n}"
  readMore: t.testimonials.readMore,   // "Read full testimonial from {author}"
  close: t.testimonials.close,
};
```

## Styles and tokens

Layout only (the look belongs to the components):

| Part | Value |
|---|---|
| `.page` | **Normal block flow** (not flex or grid): `.page > * + * { margin-top: var(--stack-gap); }`. The `h1` is the first child. |
| `.intro` | `display: flex; flex-direction: column; gap: var(--space-4);` paragraphs with `margin: 0` |
| `.services` | `display: grid; gap: var(--layout-gap); list-style: none; margin: 0; padding: 0;` → ≥ lg: `grid-template-columns: repeat(2, minmax(0, 1fr));` |
| `.testimonials` (passed as `className` to the carousel's root) | `margin-top: 0`: the `h2` "Testimonials" and the carousel are direct siblings of `.page` (decision 20) and the title→content pair is resolved by the `margin-bottom` of the `h2` (1.25rem, `foundations/layout.md` → "Vertical spacing"), the same value as h2→`ul` in services; without this `0`, `* + *` would inflate it to `--stack-gap` |

**Why block and not flex:** at ≥ lg the navigation tab floats on the
right (`CornerTab placement="float"`) and the `h1` has to flow beside it.
A flex/grid container (or one with `overflow` ≠ `visible`) creates its own
formatting context and would narrow as a whole next to the tab instead of flowing.
The inner blocks that come after the `h1` (lists, grids, sections)
can be flex/grid: by the time they start, the tab has already ended.

## States

- No `profile.about` (empty array) → it does not render `.intro`. (No test
  of its own: coverage is not invented; verification by code inspection.)
- No `services` → it does not render that `<section>`.
- No `testimonials` → it does not render that `<section>`.
- The `h1` is always rendered.

## Responsive

Services in 1 column; 2 columns ≥ lg (992). The carousel resolves its own
responsive behavior (1 / 2 per view).

## Accessibility

- A single `h1` (the panel's).
- Each region named by its `h2`: the services one, a `<section>` of the page; the testimonials one, the carousel's own `<section>` (decision 20) → both show up as a region.
- The list of services is a `<ul>`: the count is announced.
- `.services` carries `list-style: none` with no `role="list"`, the same as SkillList:
  the Safari/VoiceOver quirk is resolved in a unified way in QA F5 (decision
  of the F4 Clarification); the page does not decide it here.

## Expected tests

(Wrapping with `LocaleProvider` and the kit's example content; the
variants with empty collections are obtained by mocking the content module
(`vi.mock` with delegation, precedent `LanguageSwitcher.test.tsx`); the tests
mount scaffold `AccentGradientDefs` and `HexAvatarDefs` because of their children with
`tone="gradient"`.)

The mapping of `carouselLabels` is verified in the carousel's tests and in
AppLayout; the page adds no labels test of its own.

1. Level 1 heading with `t.about.title`, unique: `getAllByRole("heading", { level: 1 })` of length 1.
2. One paragraph per element of `profile.about`.
3. Region with the name `t.about.services` that contains one `article` per service.
4. Region with the name `t.about.testimonials` that contains the carousel (it is the carousel's `<section>`, not a wrapper of the page).
5. With empty `services` (mock of the content module) the services region does not exist; with empty `testimonials` (mock) neither the `h2` "Testimonials" nor the region exist (RF-2). In both scenarios the `h1` is still the only one (length 1).
6. With `locale = "es"` it shows the texts of `ui.es` and the content of `cv.es`.
7. `expectNoA11yViolations` with no violations.
8. It concatenates `className` on the root `.page` (G-B).

## Do not

- Do not add visual styles (colors, backgrounds, borders): layout only.
- Do not import the content directly: always `useCv()`.
