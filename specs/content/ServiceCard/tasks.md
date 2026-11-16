# Tasks — ServiceCard

- [x] **T1. Named article with a gradient icon and SectionTitle h3.** RF-1, RF-2, RF-3 — b39c45d (T2: connect `.glyph` without breaking the assert on the cardinality of the article's children)
  - Done when: `getByRole("article", { name: service.title })` (name via `aria-labelledby="service-${service.id}-title"`); level 3 `heading` with the title (SectionTitle) and a `<p>` with the description; svg with `stroke="url(#accent-gradient)"` whose glyph matches `service.icon` (`lucide-*` class; `AccentGradientDefs` scaffold); no `<span>` wrapper for the icon (DOM inspection: the `Icon` is a direct child of the article); green after `feat(ServiceCard): T1`.

- [x] **T2. Mobile-first styles and a11y closing case.** RF-4, RF-5, RF-6 — 71eb687
  - Done when: the module declares the base `flex-direction: column; align-items: center; text-align: center; gap: var(--space-4); height: 100%;` and the **only** `@media (min-width: 580px)` with `row`/`flex-start`/`start` (no literal measures; inspection); `.glyph { --icon-size: var(--size-service-icon); }`; zero pseudo-states/transitions/`box-shadow`/`@media print` (RF-6/RF-5); the file ends with `expectNoA11yViolations`; `index.ts` re-exports `ServiceCard` and types; lint + typecheck + test green after `feat(ServiceCard): T2`.
