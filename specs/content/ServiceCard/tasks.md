# Tareas — ServiceCard

- [x] **T1. Article nombrado con icon gradient y SectionTitle h3.** RF-1, RF-2, RF-3 — b39c45d (T2: conectar `.glyph` sin romper el assert de cardinalidad de hijos del article)
  - Hecho cuando: `getByRole("article", { name: service.title })` (nombre vía `aria-labelledby="service-${service.id}-title"`); `heading` nivel 3 con el título (SectionTitle) y `<p>` con la descripción; svg con `stroke="url(#accent-gradient)"` cuyo glyph corresponde a `service.icon` (clase `lucide-*`; armazón `AccentGradientDefs`); sin `<span>` wrapper del ícono (inspección DOM: el `Icon` es hijo directo del article); verde tras `feat(ServiceCard): T1`.

- [ ] **T2. Estilos mobile-first y cierre a11y.** RF-4, RF-5, RF-6
  - Hecho cuando: el módulo declara base `flex-direction: column; align-items: center; text-align: center; gap: var(--space-4); height: 100%;` y el **único** `@media (min-width: 580px)` con `row`/`flex-start`/`start` (sin medidas literales; inspección); `.glyph { --icon-size: var(--size-service-icon); }`; cero pseudo-estados/transiciones/`box-shadow`/`@media print` (RF-6/RF-5); el archivo termina con `expectNoA11yViolations`; `index.ts` re-exporta `ServiceCard` y tipos; lint + typecheck + test verdes tras `feat(ServiceCard): T2`.
