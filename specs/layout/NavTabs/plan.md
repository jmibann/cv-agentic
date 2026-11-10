# Plan — NavTabs

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/NavTabs/NavTabs.tsx` | `CornerTab size="md" placement="float">` con `div role="tablist">` y un `button role="tab">` por item; roving tabindex; teclado; `getTabId` exportado | RF-1…RF-7 |
| `src/components/NavTabs/NavTabs.module.css` | tablist flex/gap-token estirado, tab de altura completa (tipografía/padding/nowrap/cursor), padding exterior de first/last como hit area, inactivo 80%, hover subrayado, activo acento, focus-visible, transiciones | RF-5, RF-6 |
| `src/components/NavTabs/NavTabs.test.tsx` | tests + cierre a11y (con tabpanel de armazón) | todas |
| `src/components/NavTabs/index.ts` | re-export (`NavTabs`, `getTabId`, tipos) | — |

## Funciones puras y algoritmo

- `getTabId(id) = "tab-" + id` (exportada; la usa AppLayout — spec → API).
- Roving: índice activo de foco = posición de `activeId`; flechas conwrap `(i ± 1 + n) % n`; Home/End → 0/n-1. Sin funciones extra.

## Interfaz

`NavTabsProps { items: readonly NavTabItem[]; activeId: string; onChange; panelId: string; label: string; className?: string }` (spec → API; `className` se transmite al `CornerTab` — raíz de la pieza, G-B). **No** expone `aria-orientation`/tamaño: fijos horizontal/`md`/`float`.

## Decisiones

- **Foco propio, activación del padre (decisión 6):** al pulsar flecha, NavTabs enfoca el tab resultante (ref a los botones + `.focus()`) y emite `onChange` del resultante; si el resultante **es el mismo tab** (1 item), no emite (RF-4). Con `activeId` controlado, lo visual (aria-selected) cambia cuando el padre re-renderiza — el foco ya está puesto.
- **Espacio:** `onKeyDown` con `e.code === "Space"` → `preventDefault()` y dejar correr el click nativo… el `<button>` activa con keyup-nativo; para no romper RF-4/"Espacio activa" sin doble emisión: `preventDefault` en `keydown` de Espacio cancela el click del `<button>` (HTML: button se activa en **keyup** si keydown Espacio no se canceló con preventDefault; preventDefault en keydown lo impide) → el handler llama `activate(tab)` explícitamente. Enter: nativo (activa por click). El plan fija: Espacio = preventDefault + activación manual vía el mismo camino del click; Enter = solo click nativo.
- ↑/↓ ignoradas (tablist horizontal, decisión 6).
- `items.length === 0` → `return null` (RF-7). `activeId` fuera de `items` → invariante de AppLayout (decisión 5): la pieza no valida; roving usa `items.findIndex ?? -1` con guard de -1 → toma 0 como foco sin emitir (defensivo mínimo, sin RF).
- Impresión: sin `@media print` propio (G-D); la ocultación de la solapa/tablist es del estilo compartido (F4). La dependencia **no-BFC** del vecino queda documentada en spec → Responsive (verificación en AppLayout F4/F5).
- Transiciones: `opacity` y `text-decoration-color` con `--duration-base var(--ease-standard)` (tabla de la spec; la fila no fijaba easing → G-E estándar; decisionito del plan). Se quita `color`: el cambio de tema debe ser instantáneo y no arrastrar el acento anterior.
- **Hit area (Cambio 2026-11-10):** el tablist y los botones se estiran a la altura de la `CornerTab` (60px ≥992 / 48px <992); el padding exterior de `:first-child`/`:last-child` se mueve al botón con margen negativo, sin mover el texto. El gap sigue sin ser clickeable. *Descartado:* padding en todos los tabs (agrandaría el gap visual) y pseudo-elemento de hit area (superficie extra y solapamiento con el gap).
- **Apilamiento (Cambio 2026-11-10):** `CornerTab .float` usa `z-index: var(--z-raised)` para quedar por encima del `h1` posicionado del panel; con `auto`, la caja del `h1` intercepta la mitad inferior del tab. *Descartado:* `pointer-events: none` en el `h1` (rompe la selección de texto).

## Estrategia de tests

Render de la pieza **sola** (no necesita providers: todo por props; `onChange` = `vi.fn()`). Queries: `getByRole("tablist", { name })`, tabs por rol+name+level orden (spec → Tests 1–12, incluido el 9 de 1-item y el 10 de vacío). Teclado con `user-event.tab`/`keyboard("{ArrowRight}")` etc. Foco asertado con `toHaveFocus`. `getTabId` exportada se testea directo. Cierre `expectNoA11yViolations` renderizando la pieza junto a un `div role="tabpanel"` de armazón con el `panelId` y el `aria-labelledby` del tab activo (patrón armazón de F2) y la otra rama `items=[]`. Sin `AccentGradientDefs` (no hay gradiente en el tab; `CornerTab` no monta íconos).

Cobertura: T1→RF-1,RF-2,RF-7 · T2→RF-3 · T3→RF-4 · T4→RF-5,RF-6 + cierre ·
T5→RF-5,RF-6 (Cambio 2026-11-10: hit area completo y transición de tema).
