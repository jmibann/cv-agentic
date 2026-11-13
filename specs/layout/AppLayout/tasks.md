# Tareas — AppLayout

- [x] **T1. Esqueleto de composición y landmarks.** RF-1, RF-6 — fd46fd6 (APROBADA. Test 7 por conteo de etiquetas = a prueba de duplicados con otro id (legítimo RF-6). Menor para T5: los literales de clase se reemplazan por `styles.*` sin cambiar estructura + assert de unión `className` en `div.container`)
  - Hecho cuando: `AppLayout.test.tsx` cubre tests 1, 7 y 9 de la spec: landmarks `banner`/`complementary`/`main` con `getAllByRole("banner")` longitud 1; exactamente un `linearGradient#accent-gradient`, un `clipPath#hex-avatar-outer` y un `clipPath#hex-avatar-inner`; ningún elemento con `id="about"` ni `id="resume"`; `AppLayout.tsx` monta la Anatomía completa (defs ×1, skip link con `data-print-hide`, container+className, ControlsBar, grid, Sidebar con labels de `t.sidebar.*`+`t.contact`, main>Box>NavTabs>stack con tabpanel `#main-panel` y bloque `data-print-only` `hidden`, páginas About/Resume según estado con `useHashTab(TAB_IDS, "about")`); verde tras `feat(AppLayout): T1`.

- [x] **T2. Navegación por hash con guard y tablist invariante.** RF-2, RF-3, RF-5 — 3d63ea7 (APROBADA. Tarea de verificación pura: solo commit `test` on-arrival con discrimen por test #101, sin `feat` (el cableado existía desde T1). Menores: el "quitar el guard por cast" no es discrimenable en jsdom (type-level, lo sostiene typecheck); cuerpo del commit en español = precedente consolidado de la fase (L2))
  - Hecho cuando: tests 2, 3, 4 y 11 de la spec: sin hash arranca en About (h1 de About en el panel); con `history.replaceState(..., "#resume")` antes de montar arranca en Resume; click en tab Resume → h1 de Resume, `aria-labelledby` del panel = `tab-resume`, spy de `history.replaceState` llamado con URL terminada en `#resume` (sin `pushState`); el tablist tiene siempre 2 tabs en orden About→Resume y `aria-labelledby` coincide con el tab activo antes y después del cambio; `TAB_IDS`/`TabId`/`isTabId` de módulo con `onChange={(id) => { if (isTabId(id)) setActive(id); }}` (sin casts, NavTabs intacta); verde tras `feat(AppLayout): T2`.

- [x] **T3. Skip link: foco al tabpanel sin tocar el hash.** RF-4 — 3434184 (APROBADA. Verificación pura on-arrival (#101, sin feat; `.tsx` inalterado). Discrimen del "hash no cambió" fundamentado en jsdom (navegación de fragmento encola; el assert final la atrapa). Menores: typo "aterrizi" en cuerpo `3434184` (no enmendable); assert de `data-print-hide` excede levemente el test 8 pero es markup de Anatomía, no CSS)
  - Hecho cuando: test 8 de la spec: con `renderWithProviders` + `user-event`, `tab` desde el body lleva el foco al skip link (es el primer enfocable del documento); `click`/Enter → `document.activeElement` es el tabpanel `#main-panel` y `location.hash` **no** cambió (ni aparece `#main-panel`); el `href="#main-panel"` queda en el markup como respaldo sin JS; verde tras `feat(AppLayout): T3`.

- [x] **T4. Panel inactivo, stack de impresión y providers integrados.** RF-7, RF-8 — fa9a7ac (APROBADA. Verificación pura #101 (3ª de la pieza); test 5 por click real al switcher (discrimina reenvío de contenido cv.es vía useCv de la página); helper anti-duplicate-id O(N) cubre defs y bloque oculto. Menores: el test 5 no cubre un congelamiento del `cv` de AppLayout propio (Sidebar estático) — reforzar con `headline` es/en si se quiere cerrar en T5/cierre; comentario del orden del print fundamenta de más (el orden contractual es por `order` en global.css, no DOM); cuerpo proclama `.hidden` y el test solo aserta atributo (equivalente); comentario matchMedia→light impreciso (es ausencia de `data-theme`); tipado `HTMLElement` sobre nodos SVG (fiction menor))
  - Hecho cuando: tests 5, 6 y 12 de la spec: cambiar idioma a `es` re-renderiza tabs/títulos/contenido (un texto de `ui.es` y uno de `cv.es`) sin recargar; cambiar tema deja `data-theme="dark"` en `<html>` (verificación integrada — AppLayout no implementa nada del tema); con tab `about`: ResumePage montada con `hidden` fuera del tabpanel (bloque `data-print-only` + `data-print-page="resume"`) y `getAllByRole("heading", { level: 1 })` longitud 1; simétrico con `resume` (tab `data-print-page="about"`); cada página montada una sola vez (sin ids duplicados en el documento); verde tras `feat(AppLayout): T4`.

- [x] **T5. CSS de layout, print transversal y cierre a11y.** RF-8 (print), estilos — 0fe9c9c (APROBADA: módulo textual de foundations/layout.md; tokens verificados (--color-focus-ring es el real, el del brief no existe); global.css = contrato EXACTO; hook `#sidebar-contacts` estable existe (id 1,0,0 pisa el colapso por clase); 4 axe × combinación + unión #99 on-arrival declarada. Menores/para F5: `aside button` NO alcanza Download CV (`<a>` polimórfico con href) — nota en global.css, corrección de selector la decide el usuario si F5 lo confirma; `lang="es"` sin restaurar (sin riesgo: describe de cierre; nota para reordenamientos))
  - Hecho cuando:
    (a) **módulo**: `AppLayout.module.css` con lo de `foundations/layout.md` — contenedor/gutter; grilla 1 col < 1200 y `grid-template-columns` 3/9 con tokens ≥ 1200; sticky `.aside` solo en `@media (min-width: 1200px) and (min-height: 900px)` con `--z-sticky`; `.panel` `padding-top: calc(var(--size-nav-tab-height) - var(--box-padding) + var(--space-4))` y `0` en `@media (min-width: 992px)` (único `@media` de layout de la solapa); `.panel` sin flex/grid/`overflow`≠visible; skip link visualmente oculto → visible con `:focus` arriba-izquierda con `--color-surface`/`--color-accent-text`/`--radius-8`/`--shadow-control` y `z-index: var(--z-skip)`; anillo `--focus-ring-*` en tabpanel solo `:focus-visible`. Cero medidas literales (todo tokens/`calc()`/`0`).
    (b) **`src/styles/global.css`**: bloque `@media print` nuevo según el contrato "Impresión" de la spec: `[data-print-stack] { display: flex; flex-direction: column }`; `[data-print-page="about"] { order: 0 }`, `[data-print-page="resume"] { order: 1 }`; `[data-print-only] { display: block }`; `display: none` para `header`, `[role="tablist"]`, `[data-print-hide]`, `aside button`; `break-inside: avoid` en `article` y `li`; contactos Sidebar expandidos con selector sobre su markup real (inspeccionar `Sidebar.tsx`; si no hay hook estable, anotar para QA F5). Cero colores literales (la paleta la reasigna `tokens.css`). **Requiere `--z-skip` en `tokens.css` ya agregado por el usuario**; si falta, frenar.
    (c) **tests**: test 10 de la spec (`expectNoA11yViolations` en About y Resume, en `en` y `es`) como `describe` de cierre; nada de print se testeá en jsdom (inspección del reviewer sobre ambos CSS + QA F5); `index.ts` con re-export; verde tras `feat(AppLayout): T5`.

- [x] **T6. Reemplazo de `App.tsx` y smoke de integración.** integración — 127cff7 (APROBADA + revisión completa de pieza APROBADA. Smoke con envoltorio exacto de main.tsx; reemplazo del placeholder doble-documentado y autorizado (Foundation spec + plan T6). El `test(T6)` quedó rojo real contra el provisorio (diff sostenido). Reparo asociado `7e07fcc` fix(SectionTitle) comment-only (glob `*/` prematuro que rompía vite build — bug latente de F2 destapado por el primer build con grafo completo; aprobado opción 1 en gate). Menores: cuerpo de `127cff7` sin body; `3d63ea7` tocó línea de imports (aditivo, sin asserts); **hallazgo para F5: `aside button` no alcanza Download CV (`<a>` polimórfico con href) — si F5 lo ve en papel, la corrección del selector la decide el usuario**; spec de Foundation describe App "provisorio" (líneas ~74/209/262): actualizar con aprobación del usuario al cerrar F4)
  - Hecho cuando: `src/App.tsx` renderiza `<AppLayout />` sin contenido propio (el provisorio de F1 desaparece — autorizado por la spec de Foundation); `src/App.test.tsx` adaptado (update documentado en el `test(AppLayout): T6`, no se "debilita": el contrato anterior era explícitamente provisorio): `render(<App/>)` con providers → `banner` + `h1` + tablist presentes y cierre `expectNoA11yViolations`; lint/typecheck/test verdes y `npm run build` + `npm run validate:content` al cerrar la pieza (decisión #80); verde tras `feat(AppLayout): T6`.

- [x] **T7. Print `global.css` con selectores compuestos por hook (Cambio F5, decisión #104a).** RF-8 (print) — 87edfd1 (APROBADA. Lista final: `header/div/button[data-print-hide]` + simple del skip (su módulo no declara `display`) + `[role="tablist"]` redundante defensivo (ahora consignado en la spec); `aside [download]` ocupa el lugar de `aside button`. Menores: comentario sobre foundations impreciso (borrar el tablist NO obligaría a tocar foundations; decisión igualmente autorizada); efectividad real = re-pasada F5/Ctrl+P; los comentarios anticipados de ControlsBar/CornerTab ahora sí son literales)
  - Hecho cuando: en el bloque `@media print` de `src/styles/global.css`, los selectores simples que perdían por especificidad contra las clases hasheadas de los módulos se reemplazan por variantes compuestas que ganan siempre (especificidad (0,1,1)): `header[data-print-hide]` (ControlsBar, B-2), `div[data-print-hide]` (CornerTab — la tab completa, M-1), `button[data-print-hide]` (disclosure del Sidebar, B-3) — cada uno con `display: none`; el skip link mantiene su selector (su módulo no declara `display`, el simple funciona; documentarlo en el comentario); `aside button { display: none }` sale del bloque (lo reemplaza el hook del botón — T7 de Sidebar lo renderiza); `aside [download]` se agrega como hook natural del CTA (B-4/D4 pendiente de Download CV: `a` con atributo `download`, deliberado y estable); `[role="tablist"]` puede quedar como redundante defensivo o salir (decisión del builder, documentada); el orden del bloque y el resto de reglas (`[data-print-stack]`, `order`, `[data-print-only]`, `#sidebar-contacts`, `break-inside`) intactos; comentarios actualizados citando #104/B-2/B-3/M-1 y que la efectividad se confirma en la re-pasada F5 (y en Ctrl+P manual del usuario). Sin tests (jsdom no computa `@media print` — criterio #101 de la pieza en T5). Verde tras `feat(AppLayout): T7` + `npm run build`.
  - Nota: esta tarea hace verdaderos los comentarios de ControlsBar/CornerTab que ya anticipaban el selector compuesto.

- [x] **T8. Anillo estándar en el skip link enfocado (Cambio F5, D2, #104c).** estilos — 74bafe2 (APROBADA. Reveal `:focus` + anillo estándar en `:focus-visible` con los 3 tokens exactos; igual patrón `.panel:focus-visible`. Nota para la re-pasada F5: verificar que tras Enter sobre el skip (foco programático al panel disparado por tecla) el panel muestre el anillo — Chrome/Firefox aplican `:focus-visible`; en click puro no debe verse ninguno)
  - Hecho cuando: `.skipLink:focus-visible` del módulo de AppLayout aplica el anillo estándar (`outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset)`) junto a su reveal actual — la QA midió el anillo UA; ningún otro estado/cambio visual; inspección + confirmación en la re-pasada F5 (no hay test jsdom de computed styles — #101). Verde tras `feat(AppLayout): T8` (commit único si no hay discriminante test).

- [x] **T9. Alt del avatar derivado de `profile.name` (Cambio 2026-11-10).** RF-1 (Sidebar), integración — 861fb9a
  - Hecho cuando: `ui.en.ts`/`ui.es.ts` agregan `sidebar.avatarAlt` (`"Portrait of {name}"` / `"Retrato de {name}"`); `AppLayout` importa `format` y arma `avatarAlt: format(t.sidebar.avatarAlt, { name: cv.profile.name })` en `sidebarLabels`; `AppLayout.test.tsx` aserta el nombre accesible del avatar en inglés (`Portrait of Alex Rivera`) y, tras cambiar a Español, en español (`Retrato de Alex Rivera`); el resto de los labels no cambia; verde tras `feat(AppLayout): T9`.

## Cambio motion 2 (2026-11-13, #106/#116) — puerta de Plan+Tareas aprobada con ajuste en T12

Orden de dependencia: T10 → T11 → T12 → T13. Commits `test(AppLayout): Tn` →
`feat(AppLayout): Tn` (T12 en dos commits, uno por tipo — decisión de la
puerta). Dueño: `integrator`; no toca `global.css`, NavTabs, `src/test/**` ni
`allowExportNames`.

- [x] **T10. `src/lib/tabDirection.ts`: función pura + tipo.** RF-9 (test 15 de la spec) — 84bb91b (test, rojo real) + 28ec533 (feat); reviewer APROBADO (460/41; nota para T11: la comparación es numérica, la frontera de índices la asegura el llamador)
  - Hecho cuando: `test(AppLayout): T10` (rojo: el módulo no existe) agrega
    `src/lib/tabDirection.test.ts` con el test 15 literal: `(0, 1)` →
    `"from-right"`; `(1, 0)` → `"from-left"`; `(null, 0)` → `null`; `(0, 0)` →
    `null`. `feat(AppLayout): T10`: `getTabDirection(prev: number | null,
    next: number): MotionDirection | null` y `export type MotionDirection =
    "from-left" | "from-right"` en `src/lib/tabDirection.ts` (pura, sin
    React/DOM, sin `any`); lint/typecheck/test verdes.
- [x] **T11. Wrapper de entrada en `AppLayout.tsx` (P1, P4).** RF-9 (tests 13 y 16) — 67b912b (test, rojo real 2/20) + 88bb4a9 (feat); reviewer APROBADO (462/41; P1 resuelto: lint acepta el setState condicionado sin disables; `styles.motionPanel` referida antes de T12 = no-op tolerado; menores informativos: assert de identidad extra en test 16, línea larga `:838` cosmético)
  - Hecho cuando: `test(AppLayout): T11` (rojo) agrega a `AppLayout.test.tsx`
    los tests 13 y 16 literales (atributos `data-motion-panel` /
    `data-motion-direction` según dirección, clicks rápidos con remount —el
    nodo wrapper anterior ya no está—, ausencia del atributo en el render
    inicial y conservación tras cambio de idioma). `feat(AppLayout): T11`: el
    div wrapper dentro del tabpanel con `key={active}` y el atributo de
    dirección SOLO cuando no es `null`; dirección con el patrón de ajuste de
    estado en render (spec → Anatomía; sin refs leídas/escritas en render, sin
    `flushSync`); foco/ARIA intactos (tests 4/8/11/12 verdes); **`npm run lint`
    verde con `react-hooks/set-state-in-render` y `react-hooks/refs` sin
    `eslint-disable` — si lint rechaza el patrón, ESCALAR al usuario antes del
    `feat` (alternativa P1 descartada: estado en `useHashTab` = Cambio de spec
    del hook)**; el `feat` no toca archivos de test.
- [ ] **T12. CSS de entrada en `AppLayout.module.css` + test de no regresión (P2/P3/P5/P6/P8).** RF-9 (inspección) — dos commits, uno por tipo
  - Hecho cuando: `test(AppLayout): T12` agrega a `AppLayout.test.tsx` el test
    14 (avanzar carrusel en About → ir a Resume → volver → índice 0),
    **verde de llegada declarado en el mensaje del commit (#101: verifica
    comportamiento preexistente; no prueba el `key`)**, y no toca nada más.
    `feat(AppLayout): T12` agrega SOLO al módulo: `--panel-enter-x: -10px/10px`
    en `.motionPanel[data-motion-direction="from-left"|"from-right"]` (0,2,0,
    acotadas por clase), un único `@keyframes panel-enter` con
    `translateX(var(--panel-enter-x))`, `animation: panel-enter
    var(--duration-slow) var(--ease-enter) backwards` solo en
    `.motionPanel[data-motion-direction]`, y `@media print { … animation: none
    }` ubicada DESPUÉS de la regla de `animation` (gana por orden); cero
    `transition` nuevas (regla (0,2,0)+ de #116 — la verifica el reviewer);
    `global.css` y el resto del módulo intactos; suite completa verde tras el
    `feat`.
- [ ] **T13. Cierre del Cambio: build + QA del reviewer + docs.** #80, #91, #86
  - Hecho cuando: `npm run build` verde; QA del reviewer con la app servida por
    el usuario (#91): animación en ambos sentidos, **sin animación en la carga
    inicial**, reduced motion instantáneo, impresión sin animación y flujo del
    `h1` junto a la solapa flotante ≥ 992px (wrapper div de bloque, sin
    flex/grid/overflow); con la aprobación del usuario, `spec.md` →
    `Estado: implementada`, T13 marcada y documentos de estado actualizados
    (#86).
