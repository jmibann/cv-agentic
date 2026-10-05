# Tareas — Icon

- [x] **T1. Mapa explícito y render de todos los `IconName`.** RF-1, RF-5 — 12ffb92
  - Hecho cuando: `test(Icon): T1` deja en verde un test parametrizado que
    renderiza un `<svg>` por cada uno de los 24 valores de `IconName`;
    `ICON_MAP: Record<IconName, LucideIcon>` typecheckea contra el tipo
    generado (quitar una clave rompe `tsc`: verificar y restaurar, sin commitear
    el negativo); lint + typecheck + test verdes tras `feat(Icon): T1`.

- [x] **T2. Accesibilidad: decorativo, con label y `focusable`.** RF-2, RF-3, RF-7 — 64ab8c3
  - Hecho cuando: sin `label` → `aria-hidden="true"` y ausente de
    `getByRole("img")`; con `label` → `getByRole("img", { name: label })` +
    `role="img"`; el `<svg>` tiene `focusable="false"` en ambos casos; verde
    tras `feat(Icon): T2`.

- [ ] **T3. `tone`: current / accent / gradient.** RF-4, RF-6
  - Hecho cuando: `tone="gradient"` → `stroke="url(#accent-gradient)"` (el test
    monta `AccentGradientDefs` de armazón); `tone="accent"` aplica la clase del
    módulo (P2) y ningún nodo lleva atributo `style`; `current` no agrega clase
    de color; verde tras `feat(Icon): T3`.

- [ ] **T4. `AccentGradientDefs`.** RF-4
  - Hecho cuando: el test encuentra `linearGradient` con id `accent-gradient`,
    `gradientUnits="userSpaceOnUse"` y los `x1/y1/x2/y2` de la spec; dos `stop`
    con `offset` 0.2631/0.9375 sin atributo `style`; el `<svg>` es invisible por
    tamaño (0×0 + `position: absolute`, nunca `display: none` — inspección del
    CSS); verde tras `feat(Icon): T4`.

- [ ] **T5. Tamaño por CSS, `className` y cierre a11y.** RF-6
  - Hecho cuando: `.icon` fija `width/height: var(--icon-size, var(--size-icon))`
    y `flex-shrink: 0` (inspección: sin literales ni `@media`); el `className`
    recibido queda unido a `.icon` sobre el `<svg>` (aserción P2); el archivo de
    tests termina con `expectNoA11yViolations` (con y sin label); `index.ts`
    re-exporta `Icon`, `AccentGradientDefs` y los tipos (archivo del plan; gap
    cubierto en el review de T1); lint + typecheck + test verdes tras
    `feat(Icon): T5`.