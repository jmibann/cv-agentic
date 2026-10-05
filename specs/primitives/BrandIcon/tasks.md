# Tareas — BrandIcon

- [x] **T1. `paths.ts` con `{ viewBox, d }` para toda `SOCIAL_NETWORKS`.** RF-1, RF-4 — 9f0cc0b
  - Hecho cuando: hay una entrada por red (`@data/constants`) con imports
    nombrados de `simple-icons`; LinkedIn usa SVG oficial con comentario de
    origen (y el reporte lo registra luego el orchestrator en BACKLOG); el
    módulo typechequea contra `SocialNetwork`; verde tras `feat(BrandIcon): T1`
    (con el test parametrizado de estructura: viewBox string no vacío, `d`
    string o array con al menos un `d` no vacío).

- [x] **T1b. Reparo del hallazgo menor del review de T1 (honestidad del comentario de origen).** RF-4, L1 — f8ddc10
  - Hecho cuando: `fix(BrandIcon): T1b` reescribe el comentario de origen de
    LinkedIn en `paths.ts` para afirmar solo lo verificado: el path es el que
    distribuyó `simple-icons` hasta v14 (geométrica y tipológicamente válido en
    24×24); la equivalencia exacta con el kit de prensa queda pendiente y
    registrada en `docs/BACKLOG.md`. No toca tests ni otras líneas; verde tras
    el fix.

- [x] **T2. Render del `<svg>` por red.** RF-1 — eb0d21c (+fix d654a26)
  - Nota del review de T1b (menor, a ejecutar en esta ronda como `fix`
    aparte): reformar la apertura del comentario de LinkedIn en `paths.ts`
    (líneas 26-28: "Origen (RF-4): SVG oficial del kit de marca…") para que
    exprese intención/pendiente en vez de hecho verificado, coherente con el
    cierre que ya lo marca como pendiente.
  - Hecho cuando: test parametrizado: cada `network` renderiza `<svg>` con el
    `viewBox` de su entrada (default `0 0 24 24`) y al menos un `<path>` con
    `d` no vacío; verde tras `feat(BrandIcon): T2`.

- [ ] **T3. `BRAND_NAMES` y decorativo a11y.** RF-2, RF-3
  - Hecho cuando: `getByRole` no lo encuentra (`aria-hidden="true"`),
    `focusable="false"` presente, `fill="currentColor"` en el svg;
    `BRAND_NAMES` tiene valor no vacío para cada red (test rechaza `""`);
    verde tras `feat(BrandIcon): T3`.

- [ ] **T4. Tamaño/herencia por CSS, `className` y cierre a11y.** RF-5, RF-6
  - Hecho cuando: el módulo fija `width/height: var(--icon-size,
    var(--size-social-icon))` sin `@media` ni color/opacidad propios
    (inspección); `className` se une en el `<svg>` (P2); archivo termina con
    `expectNoA11yViolations`; lint + typecheck + test verdes tras
    `feat(BrandIcon): T4`.
  - Nota para el cierre de pieza: `index.ts` re-exporta `BrandIcon`, `BRAND_NAMES`
    y tipos (el plan lo lista y las tareas no lo cubrían; gap detectado en el
    review de Icon T1).