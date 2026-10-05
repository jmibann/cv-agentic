# Tareas — Button

- [ ] **T1. `<button>` con `type` de la prop.** RF-1
  - Hecho cuando: sin `href` renderiza `getByRole("button", { name })` con
    `type="button"` por defecto y `type="submit"` llega al DOM; verde tras
    `feat(Button): T1`.

- [ ] **T2. `onClick` y `disabled`.** RF-3
  - Hecho cuando: user-event invoca el handler; con `disabled` no se invoca y
    el `<button>` queda deshabilitado; verde tras `feat(Button): T2`.

- [ ] **T3. Link: `href`, `rel` y `download`.** RF-2, RF-8, RF-9
  - Hecho cuando: con `href` renderiza `getByRole("link")` con ese `href`;
    `target="_blank"` sin `rel` agrega `noopener noreferrer`; un `rel`
    explícito llega tal cual sin fusionar; `download` se transmite con su
    valor; verde tras `feat(Button): T3`.

- [ ] **T4. Ícono decorativo y `iconPosition`.** RF-4, RF-7
  - Hecho cuando: `icon` renderiza `<svg>` con `aria-hidden` y el nombre
    accesible sigue siendo solo el texto; con `iconPosition="end"` el svg está
    **después** del label en el DOM (default: antes); verde tras `feat(Button): T4`.

- [ ] **T5. `size="small"` y `fullWidth` (clases).** RF-6
  - Hecho cuando: ambas aplican su clase del módulo (P2) sobre el raíz junto a
    la `className` externa; el módulo resuelve small con
    `var(--button-small-padding-block/inline)` (existen en `tokens.css` —
    bloqueado hasta que el usuario las agregue) y `::before { content: none }`;
    `fullWidth` → `width: 100%` por clase; verde tras `feat(Button): T5`.

- [ ] **T6. Estilos base, pseudo-estados y cierre a11y.** RF-5, RF-6
  - Hecho cuando: el módulo resuelve fondo `--gradient-accent`, texto
    `--color-on-accent`, radio, sombra y `::before` (`bottom: 0`,
    `z-index: var(--z-below)`, botón con `position: relative;
    z-index: var(--z-base)`), focus-visible con `--focus-ring-*` +
    `--shadow-accent-focus`, disabled `opacity: 0.5` + `cursor: not-allowed`
    sin hover (todo por inspección: cero literales, cero `@media`); archivo
    termina con `expectNoA11yViolations` (button y link); lint + typecheck +
    test verdes tras `feat(Button): T6` (el `build` de cierre de pieza lo
    corren orchestrator/reviewer, decisión #80).