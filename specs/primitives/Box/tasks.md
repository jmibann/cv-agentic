# Tareas — Box

- [x] **T1. Render base: `outer` por defecto y `as`.** RF-1, RF-3 — 459d436
  - Hecho cuando: sin `variant` el raíz `div` lleva la clase `outer` (P2) y
    renderiza `children`; `as="section"` renderiza `<section>`; verde tras
    `feat(Box): T1`.

- [x] **T2. Variante `inner` y atributos ARIA/id.** RF-2 — 7f2d3a2
  - Hecho cuando: `variant="inner"` aplica `inner` y **no** `outer` (P2);
    `id`, `aria-label` y `aria-labelledby` llegan al raíz
    (`as="aside" aria-label="Profile"` → `getByRole("complementary", { name: "Profile" })`);
    verde tras `feat(Box): T2`.

- [x] **T3. `className` se une en el único elemento.** RF-3 — 1c00911
  - Hecho cuando: una `className` externa queda junto a la clase de variante en
    el elemento raíz (aserción P2, sin `data-testid`); verde tras `feat(Box): T3`.

- [x] **T4. Estilos por tokens, overflow y cierre a11y.** RF-4, RF-5, RF-6 — a8c515d

- [ ] **T4b. Reparación del hallazgo menor del review de T4 (comentario obsoleto).** L1
  - Hecho cuando: `fix(Box): T4b` actualiza el header de `Box.tsx` (línea ~6:
    "Falta: los estilos por tokens con `overflow` (T4)") al estado real de la
    pieza tras T4: los estilos por tokens con `overflow: visible` en `outer` ya
    existen en `Box.module.css`; único export público inalterado; cero cambios
    de código, tests o CSS. Verde tras el fix.
  - Hecho cuando: el módulo resuelve fondo/radio/padding/borde/sombra **solo**
    con tokens, sin colores literales ni `@media` (inspección del reviewer);
    `outer` con `overflow: visible` explícito e `inner` sin declaración de
    `overflow` (inspección); props sin `role`/`tabIndex` (inspección de la API);
    archivo termina con `expectNoA11yViolations` (outer y inner); lint +
    typecheck + test verdes tras `feat(Box): T4`.
  - Nota para el cierre de pieza: `index.ts` re-exporta `Box` y tipos (el plan lo
    lista y las tareas no lo cubrían; gap detectado en el review de Icon T1).