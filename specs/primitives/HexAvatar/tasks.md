# Tareas — HexAvatar

- [ ] **T1. `HexAvatarDefs` con los dos `clipPath` de la geometría fija.** RF-3
  - Hecho cuando: el test renderiza `HexAvatarDefs` y encuentra dos `clipPath`
    con ids `hex-avatar-outer` e `hex-avatar-inner`, `clipPathUnits="objectBoundingBox"`;
    los `d` transcriben los vértices/radios de "Forma" (spec) con comentario de
    origen; el `<svg>` es 0×0 `position: absolute`, nunca `display: none`
    (inspección); verde tras `feat(HexAvatar): T1`.

- [ ] **T2. Estructura `wrap > border > img` con `src`.** RF-1
  - Hecho cuando: el `<img>` recibe el `src`; contorno e imagen llevan sus
    clases del módulo (P2); los offsets 4px y tamaños `calc()` respecto de
    `--size-testimonial-avatar-w/h` (inspección); el `url(#hex-avatar-*)` de
    cada clase se verifica leyendo el `.module.css` (jsdom no aplica
    `clip-path`); verde tras `feat(HexAvatar): T2`.

- [ ] **T3. `alt`: decorativo por defecto.** RF-2
  - Hecho cuando: sin `alt` → `alt=""` y no aparece en `getByRole("img")`;
    con `alt="Foto de X"` → `getByRole("img", { name: "Foto de X" })`; verde
    tras `feat(HexAvatar): T3`.

- [ ] **T4. Sombra, tamaño fijo, `className` y cierre a11y.** RF-4, RF-5
  - Hecho cuando: el wrap declara `filter: var(--filter-avatar-drop)` sin
    ningún `box-shadow` (inspección); ningún `@media` ni regla
    `:hover`/`:focus`/transición; `className` unida al `wrap` (P2); archivo
    termina con `expectNoA11yViolations` (con `HexAvatarDefs` montado); lint +
    typecheck + test verdes tras `feat(HexAvatar): T4`.