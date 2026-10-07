# Tareas — NavTabs

- [x] **T1. Tablist con tabs, roving y vacío.** RF-1, RF-2, RF-7 — 1dcab72 (config `0df3855`: `getTabId` en `allowExportNames`, extensión #100 aprobada por el usuario 2026-10-06)
  - Hecho cuando: `getByRole("tablist", { name: label })` con `aria-orientation="horizontal"` y un `tab` por item en orden (`getByRole("tab", { name })`), `id=getTabId(item.id)`, `aria-controls=panelId` en todos, `aria-selected`/`tabIndex` (activo 0, resto -1); `items=[]` → `container` vacío; `getTabId("about") === "tab-about"`; verde tras `feat(NavTabs): T1`.

- [ ] **T2. Click: activación controlada y guard del activo.** RF-3
  - Hecho cuando: click en inactivo → `onChange(id)` una vez; click en el activo → cero llamadas; tras click no hay re-gestión de foco propia (el nativo basta; inspección); verde tras `feat(NavTabs): T2`.

- [ ] **T3. Teclado: ←/→ circular, Home/End, Espacio, single-item.** RF-4
  - Hecho cuando: con foco en el último, ArrowRight enfoca el primero y emite su `onChange` (y viceversa con ArrowLeft desde el primero → último); Home/End enfocan y emiten primero/último; con 1 item las flechas enfocan el propio tab y **no** emiten; Espacio hace `preventDefault()` y emite el `onChange` del tab enfocado (una sola llamada, sin doble activación); ↑/↓ sin efecto; verde tras `feat(NavTabs): T3`.

- [ ] **T4. Estilos por tokens y cierre a11y.** RF-5, RF-6
  - Hecho cuando: el módulo fija tablist (`inline-flex`, `gap: var(--nav-tab-gap)`), tab (tipografía `--font-size-nav`/`--font-weight-medium`, `--color-text`, `padding-block: var(--space-2)`, `white-space: nowrap`, `cursor: pointer`, sin fondo/borde), inactivo `opacity: 0.8` + `text-decoration: underline 2px transparent; text-underline-offset: 0.375rem`, hover 100% + `text-decoration-color: currentColor`, activo `--color-accent-text` sin subrayado, `focus-visible` anillo estándar + `--radius-8`, transiciones `color/opacity/text-decoration-color` `--duration-base var(--ease-standard)`, cero `@media` (los estados visuales: inspección; `aria-selected` por test); el archivo termina con `expectNoA11yViolations` (con tabpanel de armazón y con `items=[]` no aplica render); `index.ts` re-exporta `NavTabs`, `getTabId` y tipos; lint + typecheck + test verdes tras `feat(NavTabs): T4`.
