# Tareas — ResumePage

- [x] **T1. Página con `h1` único y `.columns` con las dos secciones.** RF-1, RF-2, RF-5 — 6b498ee (APROBADA. Test 2 discrimina RF-5 (orden h3 = orden de datos). Menores informativas: `.columns` se renderiza siempre — rama "ambos vacíos" es T2; `ResumePageProps` sin consumidor hasta T4)
  - Hecho cuando: `ResumePage.test.tsx` cubre tests 1, 2 y 7 de la spec: `getAllByRole("heading", { level: 1 })` longitud 1 con `t.resume.title`; regiones con nombre `t.resume.education` y `t.resume.experience`, cada una con un `listitem` por entrada del kit; con locale `es` muestra textos de `ui.es` y contenido de `cv.es`; `ResumePage.tsx` pasa a cada `ResumeSection` `id`, `title`, `icon` (`"book-open"`/`"briefcase"`), `entries`, `locale={locale}` de `useLocale()`, `timelineIdPrefix="edu"`/`"exp"` y `presentLabel={t.timeline.present}`; armazón `AccentGradientDefs` en el wrapper; verde tras `feat(ResumePage): T1`.

- [ ] **T2. `presentLabel` reenviado y columnas vacías.** RF-7, RF-2 (vacíos)
  - Hecho cuando: test 4 de la spec: con `vi.mock` del módulo de providers (entrada `"end": null` propia del test, sin depender del fixture) el panel muestra `t.timeline.present`; test 5: con `education: []` (mock) no existe esa región y Experience sigue presente; con `education` y `experience` ambas vacías (mock) no existe ninguna de las dos regiones y el `h1` sigue presente (la ausencia del div `.columns` por inspección del markup del test); verde tras `feat(ResumePage): T2`.

- [ ] **T3. Sección de skills con región y estado vacío.** RF-4
  - Hecho cuando: test 3: `region` con nombre `t.resume.skills` (`<section aria-labelledby="resume-skills-title">` + `SectionTitle as="h2" id` + `SkillList labelledBy`) con una lista con un `listitem` por skill; test 6: con `skills: []` (mock) la región no existe; verde tras `feat(ResumePage): T3`.

- [ ] **T4. Estilos de layout, unión `className` y cierre a11y.** RF-3, RF-6
  - Hecho cuando:
    (a) **módulo CSS**: `.page` flujo de bloque normal con `* + * { margin-top: var(--stack-gap) }` (cero flex/grid/`overflow` — RF-6, inspección); `.columns { display: grid; row-gap: var(--stack-gap); column-gap: var(--layout-gap) }` + **único `@media (min-width: 768px)`** (solo layout) con `grid-template-columns: repeat(2, minmax(0, 1fr))` y cláusula `grid-column: 1 / -1` para el hijo único (RF-3, inspección; skills siempre ancho completo debajo);
    (b) **tests**: test 9 de la spec (unión `className` en `.page`, G-B) + test 8 (`expectNoA11yViolations` en escenario completo); cero colores literales; verde tras `feat(ResumePage): T4`.
