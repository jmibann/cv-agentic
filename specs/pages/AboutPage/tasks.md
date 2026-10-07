# Tareas — AboutPage

- [ ] **T1. Página con `h1` único e `.intro`.** RF-1, RF-2 (intro)
  - Hecho cuando: `AboutPage.test.tsx` cubre tests 1 y 2 de la spec: `getAllByRole("heading", { level: 1 })` de longitud 1 con `t.about.title` (`SectionTitle as="h1" decorated`) y un `<p>` por cada elemento de `profile.about` dentro de `.intro`; `AboutPage.tsx` existe con raíz `div.page` (markup, sin módulo todavía); verde tras `feat(AboutPage): T1`.

- [ ] **T2. Sección de servicios con región y `<ul>`.** RF-2 (servicios), RF-5
  - Hecho cuando: test 3 de la spec: `region` con nombre `t.about.services` (via `<section aria-labelledby="about-services-title">` y su `SectionTitle as="h2" id`) que contiene un `article` por servicio (`ServiceCard`); test 5a: con `services: []` (mock del módulo de providers con `importOriginal`, precedente `LanguageSwitcher.test.tsx`) la región no existe y el `h1` sigue siendo el único; markup de `.services` como `<ul>` con `<li>` por card; verde tras `feat(AboutPage): T2`.

- [ ] **T3. Testimonios: h2 + carrusel como región, y locale es.** RF-2 (testimonios), RF-3
  - Hecho cuando: test 4: `region` con nombre `t.about.testimonials` es la `<section>` propia del `TestimonialCarousel` (hermano directo del `h2` en `.page`, sin wrapper de la página; se le pasa `labelledBy="about-testimonials-title"`); el objeto `carouselLabels` pasa las 5 plantillas crudas de `t.testimonials` (la página **no** llama `format`); test 5b: con `testimonials: []` (mock) no existen el `h2` "Testimonials" ni la región y el `h1` sigue único; test 6: con locale `es` se ven textos de `ui.es` y contenido de `cv.es`; armazones `AccentGradientDefs` + `HexAvatarDefs` en los renders; verde tras `feat(AboutPage): T3`.

- [ ] **T4. Estilos de layout, unión `className` y cierre a11y.** RF-4, RF-6
  - Hecho cuando:
    (a) **módulo CSS**: `.page` flujo de bloque normal con `.page > * + * { margin-top: var(--stack-gap) }` (cero flex/grid/`overflow` — RF-4, por inspección); `.intro { display: flex; flex-direction: column; gap: var(--space-4) }` + `p { margin: 0 }`; `.services { display: grid; gap: var(--layout-gap); list-style: none; margin: 0; padding: 0 }` + **único `@media (min-width: 992px)`** con `grid-template-columns: repeat(2, minmax(0, 1fr))`; `.testimonials { margin-top: 0 }` aplicado al carrusel vía `className`; cero colores literales, cero estilos visuales (RF-6, inspección + grep del reviewer).
    (b) **tests**: extra-test test 8 (unión `className` en el raíz `.page`, canon #99) + `expectNoA11yViolations` de cierre en escenario completo (test 7); T1–T3 intactos; `index.ts` con re-export; verde tras `feat(AboutPage): T4`.
