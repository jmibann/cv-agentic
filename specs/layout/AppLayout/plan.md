# Plan — AppLayout

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/AppLayout/AppLayout.tsx` | composición completa (spec → Anatomía, literal): defs ×1, skip link con `data-print-hide`, `div.container` (recibe `className`), ControlsBar, `div.grid`, Sidebar (sticky vía `.aside`), `main`, `Box variant="outer" as="section"`, NavTabs con guard `isTabId`, `div[data-print-stack]` con tabpanel (`data-print-page={active}`) + bloque inactivo (`data-print-only`, `data-print-page={inactiva}`, `hidden`); `TAB_IDS`/`TabId`/`isTabId` de módulo (`isTabId` **no** exportada) | RF-1..RF-8 |
| `src/components/AppLayout/AppLayout.module.css` | layout de página según `foundations/layout.md`: contenedor/gutter, grilla `<lg` 1 col / `≥1200` 3+9, sidebar sticky solo `@media (min-width: 1200px) and (min-height: 900px)` (`--z-sticky`), `.panel` `padding-top: calc(var(--size-nav-tab-height) - var(--box-padding) + var(--space-4))` < lg y `0` en `@media (min-width: 992px)`, `.panel` no flex/grid/`overflow` visible, skip link oculto → con foco (arriba-izquierda, `--color-surface`/`--color-accent-text`/`--radius-8`/`--shadow-control`/`--z-skip`), foco tabpanel `:focus-visible` anillo estándar | RF-1 (no-BFC), estilos spec |
| `src/styles/global.css` | **trabajo del integrator sin spec propia**: bloque `@media print` nuevo con el contrato de la spec → "Impresión": `[data-print-stack] { display: flex; flex-direction: column }`, `order` por `[data-print-page]` (`about: 0`, `resume: 1`), `[data-print-only] { display: block }`, ocultar `header`, `[role="tablist"]`, `[data-print-hide]`, `aside button`; `break-inside: avoid` en `article` y `li`; expansión de contactos del Sidebar con selector sobre su markup real (inspeccionar `Sidebar.tsx`; si no hay hook estable, queda anotado para QA F5) | RF-8, contract foundations |
|  | ⚠️ **Actualizado por el Cambio F5 #104 (T7)**: los selectores nativos de la fila anterior perdieron por especificidad (qa-report B-2/B-3/M-1); T7 los reemplaza por los hooks compuestos `header/div/button[data-print-hide]` + `aside [download]` — ver spec → "Impresión" y tasks T7 | — |
| `src/App.tsx` | reemplazo del provisorio F1 (la spec Foundation lo autoriza): `App` renderiza `<AppLayout />`; `src/App.test.tsx` se **adapta** a ese contrato (ver Decisiones) | integración |
| `src/components/AppLayout/AppLayout.test.tsx` | tests 1–12 de la spec; wrappers con `ThemeProvider` + `LocaleProvider` reales; hash por `window.history.replaceState(null, "", "#resume")` antes de montar; `spy` de `replaceState`; `HashChangeEvent` manual para `hashchange` | todas |
| `src/components/AppLayout/index.ts` | re-export `AppLayout` + `AppLayoutProps` | — |

## Funciones puras y algoritmo

- `isTabId(id): id is TabId` — único algoritmo propio (guard de estrechamiento,
  spec → Anatomía). `focusPanel`: `preventDefault` + `panelRef.current?.focus()`.
- Nada de fecha/lógica dependiente del tiempo → sin "hoy" como parámetro.

## Interfaz

`AppLayoutProps { className?: string }` unida al `div.container` (la raíz es
fragment; decisión A7 de la Clarificación). Conecta `useHashTab(TAB_IDS,
"about")`, `useCv`, `useLocale`, `getTabId` (NavTabs), labels de Sidebar
mapeados de `t.sidebar.*` + `t.contact` (spec → Anatomía).

## Decisiones

- **Guard `isTabId` en el `onChange`** (A1): alternativa descartada — Cambio de
  NavTabs a genérico (pieza ya `implementada`, lo rechaza la puerta). Sin casts.
- **Stack de impresión por atributos, una sola copia de cada página** (A3/A4,
  decisión del usuario): alternativa descartada — `.printOnly` con la inactiva
  (orden impreso dependía del tab) y dos copias fijas About+Resume (duplicaba
  ids y disparaba `duplicate-id-aria` en axe). El contrato habla en `data-*`;
  los selectores nativos (`header`, `[role="tablist"]`, `aside button`) son
  deliberados (salvaguarda aprobada por el usuario).
- **Print transversal en `global.css`** (regla dura 3): alternativa descartada —
  `:global(...)` dentro del módulo de AppLayout (acopla el contrato transversal
  a una pieza). El token de paleta de print ya existe (`tokens.css`).
- **`--z-skip: 30` en `tokens.css`** (A10): token nuevo del kit; **lo agrega el
  usuario a mano** (ni el orchestrator ni el integrator tienen permiso de
  edición ahí). Pendiente antes de T5; la T5 no puede commitear sin él.
- **Reemplazo de `App.tsx` y adaptación de `App.test.tsx`** (T6): la spec de
  Foundation declara el App "provisorio, lo reemplaza el integrator en F4";
  borrar las aserciones del placeholder **no** es debilitar un test vigente —
  es el reemplazo autorizado. Queda documentado acá y en el `test(AppLayout): T6`
  (precedente F3/TestimonialCarousel T5: update dentro de tarea, aprobado en la
  puerta). El test adaptado hace smoke: `render(<App/>)` → `banner` + `h1` +
  tablist existen.
- **Contenido en/es**: no es tarea nueva — el contenido bilingüe existe desde
  F1; F4 lo verifica con los tests 5 (AboutPage) / 7 (ResumePage) y el test 10
  de AppLayout en ambos idiomas.
- **Alt del avatar derivado (Cambio 2026-11-10):** `avatarAlt` se compone en
  AppLayout con `format(t.sidebar.avatarAlt, { name: cv.profile.name })` y viaja
  en `sidebarLabels`; el Sidebar no compone textos (RF-8 de su spec). *Descartado:*
  guardar `alt` en el JSON (se desincroniza al cambiar el nombre) y
  `alt={profile.name}` (pierde "Portrait of"/"Retrato de").

## Estrategia de tests

Render del árbol completo con providers reales (el setup F1 ya mockea
`matchMedia`, dialog, `scrollTo`, `ResizeObserver`). Tests 1–12 literales de la
spec; el 9 (`document.getElementById("about") === null`) protege la
precondición de `useHashTab` RF-5; el 11 asserts del tablist (2 tabs, orden,
`aria-labelledby` activo antes/después); el 12 asserts del stack (inactiva con
`hidden` fuera del tabpanel + `getAllByRole h1` longitud 1, simétrico). Cierre
`expectNoA11yViolations` en About y Resume × en/es (test 10). Todo lo de
`@media print` y del CSS de layout: inspección + QA F5 (jsdom no computa).
`build` y `validate:content` al cerrar la pieza (decisión #80).

Cobertura: T1→RF-1,RF-6 · T2→RF-2,RF-3,RF-5 (+guard A1) · T3→RF-4 ·
T4→RF-7,RF-8 (capa DOM) · T5→RF-8 (print, inspección) + estilos/`--z-skip` +
cierre a11y · T6→integración (`App.tsx`) · T9→alt del avatar derivado (en/es).
