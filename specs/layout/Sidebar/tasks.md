# Tareas — Sidebar

- [x] **T1. `getContactHref` (pura).** RF-5 — e0cc73a · deuda #102: cuerpo del `feat` con acento ("explícito"); no enmendable, registrado en revisión completa r1
  - Hecho cuando: `src/components/Sidebar/getContactHref.ts` exporta la función sin React; pasan sus tests con la tabla exacta de spec → API (explícito prioriza; `mailto`; `tel:+5411…` con `+` solo inicial y sin otros no-dígitos; tel sin dígitos → `undefined`; `wa.me` solo dígitos sin `+`; location → `undefined`); verde tras `feat(Sidebar): T1`.

- [x] **T2. Estructura base: aside, identidad y redes.** RF-1, RF-6 (redes), RF-8 — 9d0a77d · deuda #102: subject del `feat` en español ("T2 · estructura…"); no enmendable, registrado en revisión completa r1
  - Hecho cuando: `getByRole("complementary", { name: labels.region })`; avatar `<img>` con `alt` de `profile.avatar.alt` **sin** atributos `width`/`height` (RF: decisión 9); nombre `<p>`; `Badge` con headline; `ul` de redes nombrada con un `li` por entrada: `<a aria-label={marca}>` externo con `target="_blank"` + `rel="noopener noreferrer"` y `BrandIcon`; la pieza no importa `useCv`/`useLocale` (inspección); verde tras `feat(Sidebar): T2`.

- [x] **T3. Contactos: IconBox + Overhead + links derivados.** RF-5 (uso), RF-6 (mailto/tel sin target), RF-9 — 872b122 (fix de sobreaserción T2 aprobado por el usuario: `4ff4424`; menores a vigilar en T6: `#sidebar-contacts` vacío sin spacing fantasma, ellipsis/`--color-heading`)
  - Hecho cuando: un `<li>` por contacto con `IconBox` del mapa (mail/phone/message-circle/map-pin), `Overhead` con el label traducido y el valor (`--color-heading`, ellipsis + `title`); email/phone links **sin** `target`/`rel`; whatsapp y `href` explícitos de sitio con target externo (test de atributos); location como texto plano sin link; `contact`/`social` vacíos no renderizan sus listas y sin contactos **y** sin CV no hay `Separator` (RF-9); verde tras `feat(Sidebar): T3`.

- [x] **T4. Disclosure con CornerTab.** RF-3, RF-4 — 87301ec (T6 verificar: `--icon-size` del chevron si el estilo lo pide; `@media` 1200 debe pisar `.additionalCollapsed`; cuerpo de `c0b99c3` con acentos = deuda #102)
  - Hecho cuando: `CornerTab size="sm"` montada con `<button aria-expanded="false" aria-controls="sidebar-contacts">` + texto `showContacts` + chevron `Icon name="chevron-down"` decorativo; click → `aria-expanded="true"`, texto `hideContacts` y `.additional` pasa de la **clase** de colapso a visible (la visibilidad ≥ xl la da el `@media` del módulo, inspección — en jsdom el estado es por clase); segundo click revierte; el colapso no usa `style` inline (inspección: decisión RF-10); verde tras `feat(Sidebar): T4`.

- [x] **T5. Download CV.** RF-2 — d2a9829
  - Hecho cuando: con `profile.downloadCvUrl` existe `getByRole("link", { name: labels.downloadCv })` con ese `href` y atributo `download` (`Button href… download icon="download" fullWidth`); sin URL no existe; verde tras `feat(Sidebar): T5`.

- [x] **T6. Estilos por tokens, responsive CSS-only y cierre a11y.** RF-7, RF-10 — 1a2136e (F5 verificar: edge colapso de márgenes `contact=[]`+CTA; separaciones `--space-2/4` resueltas con tokens; F8 avatar sigue abierto; `ul` flex sin `role="list"` → VoiceOver/Safari en QA F5; transición `color` en `.contacts a` sobre color que no cambia (module.css:342-345, justificada en comentario — verificar efecto perceptible nulo en F5); nota r1: los dos `@media` (768 layout + 1200 xl) son los que manda la spec — "único media" en este renglón se leía "único de comportamiento xl")
  - Hecho cuando: el módulo declara grilla `< md`/`md–lg`, columna xl con avatar sobresaliente (`margin-top: calc(var(--size-avatar-sidebar) * -0.71)`, fórmula compartida con `foundations/layout.md`), `--sidebar-*` tokens, redes/links con hover/foco (`--color-accent-text`, subrayado en contacto, anillo), transiciones por tokens, `@media (min-width: 1200px)` único media (layout: oculta CornerTab, fuerza `.additional`, sin literales), tramo del Separator sin acumular el `gap` de `.additional` (mecanismo documentado en comentario; Separator RF-4), cero `@media print` (RF-10: lo cubren estilos compartidos, inspección); el archivo termina con `expectNoA11yViolations` (colapsado y expandido, con `AccentGradientDefs` de armazón); `index.ts` re-exporta `Sidebar`, tipos y `getContactHref`; lint + typecheck + test verdes tras `feat(Sidebar): T6`.

- [x] **T7. Rediseño del disclosure icon-only (Cambio F5 2026-10-08, decisión del usuario ante D1/B-3).** RF-3, RF-4, RF-10 — fac2fbe (APROBADA + re-verificación enfocada de la pieza post-Cambio APROBADA (RF-1..10 con contrapartida; Tests 1–10 cubiertos; cierre axe intacto; pieza sigue `implementada`). Menores/notas: bodies de commit sin tildes (deuda #102, no enmendable); encabezado histórico T2 menciona "disclosure CornerTab (T4)" (datado, sin acción); **pendiente cross-pieza: AppLayout T7** (compuesto `button[data-print-hide]` en global.css — hoy el botón se oculta vía `aside button`, sin regresión); **pendiente del usuario: token base 6.375rem** (`tokens.css:201` aún 7.5rem — la pieza no lo hardcodea) y docs desactualizados por #104b (`docs/DESIGN.md:20-21`, `foundations/layout.md:46,162` — fuera de mis permisos de edit; los aplicás vos o me ampliás el permiso); criterio (d) cero-solape-375 lo mide la re-pasada F5)
  - Contexto del Cambio (decisión del usuario en la puerta F5, detallado en spec → Anatomía/"Colapsable" y plan → Decisiones): la CornerTab del disclosure se elimina (su fondo solapaba el nombre a 375px); el botón pasa a ser un chevron dorado icon-only, absoluto arriba-derecha del raíz, sin fondo, con `aria-label` alterno y `data-print-hide`; la identidad < md/md–lg se alinea al inicio junto al avatar; las redes se centran en el espacio disponible. El token `--size-avatar-sidebar` base −15% (6.375rem) **lo aplica el usuario en `tokens.css`** — si al empezar falta, frenar esa parte y seguirla sin tocar el token (el layout no depende del valor).
  - Hecho cuando:
    (a) **markup**: `<button class="disclosure" data-print-hide aria-label={expanded ? labels.hideContacts : labels.showContacts} aria-expanded={expanded} aria-controls="sidebar-contacts">` con `<Icon name="chevron-down" aria-hidden="true" className={styles.chevron + rotada si expandida}/>`; **sin** import/uso de `CornerTab` en `Sidebar.tsx`; raíz del `<aside>` con `position: relative` para el absoluto (o el Box — verificar cuál provee el anclaje y documentar); `index.ts` sin cambios.
    (b) **módulo**: `.disclosure` absoluto arriba-derecha, cero fondo/border, `color: var(--color-accent-text)`, área táctil ≥24px por padding de tokens, foco con anillo estándar; `.chevron` con `transform: rotate(180deg)` en clase de expandido + transición `--duration-base`; ≥ xl el `@media (min-width: 1200px)` pasa a ocultar `.disclosure` (antes la CornerTab) y fuerza `.additional` como antes; identidad < md/md–lg alineada al inicio junto al avatar (con `padding-inline-end` en `calc()` de tokens solo si el nombre alcanza la esquina); redes centradas; cero literales; cero `@media print` (RF-10).
    (c) **tests**: actualizar los asserts estructurales de T4 que dependían de la CornerTab (el botón se consulta ahora directo: `getByRole("button", { name: labels.showContacts })` + `toHaveAttribute("data-print-hide")` + glyph `aria-hidden` + cero texto visible — nuevo test 10; **el `test(Sidebar): T7` documenta en su mensaje qué aserciones viejas se reubican y por qué**; ningún otro assert de T2/T3/T5/T6 se debilita; cierre `expectNoA11yViolations` en colapsado/expandido sigue verde).
    (d) **criterios del usuario**: cero solape medible a 375 es/en en la re-pasada F5 (esta tarea fija código/tests; el número lo verifica F5); sin regresiones en md–lg/xl (inspección del `@media`).
    Verde (lint/typecheck/test) tras `feat(Sidebar): T7`. Cierre de pieza: al aprobarse T7, el reviewer hace re-verificación enfocada de la spec completa (cambia Anatomía/RF-3/RF-4/RF-10) antes de dejar `Estado: implementada`.

- [x] **T8. Alt del avatar dinámico (Cambio 2026-11-10).** RF-1, RF-8 — 861fb9a
  - Hecho cuando: `SidebarLabels` expone `avatarAlt: string` y el `<img>` usa `alt={labels.avatarAlt}` (ya no lee `profile.avatar.alt`, campo eliminado de `Image`); el fixture de `Sidebar.test.tsx` no declara `alt` y consulta `getByRole("img", { name: LABELS.avatarAlt })`; se mantienen las ausencias de `width`/`height`/`decoding`; la pieza sigue sin importar `useCv`/`useLocale` (inspección); verde tras `feat(Sidebar): T8`.

## Cambio motion 3 (2026-11-13, #106/#116) — puerta Spec+Plan+Tareas aprobada en 3 rondas

Orden de dependencia: T9 → T10 → T11 → T12 → T13. Dueño: `integrator`. No tocar
providers, AppLayout, `src/test/**`, configs, `allowExportNames`. Transiciones
solo en clases (0,1,0) (#116 aclarada: `transition: none` excluido).

- [x] **T9. Tests de la entrada de contactos + reescritura C9 del Selector.** RF-11 (tests 11–13), C9 — c5617e0 (rojo diseñado: SOLO tests 11/12; verdes-on-arrival #101: test 13 + C9 con los 4 usos intactos) + 2db9975 (T9b: reubicación ordenada por el reviewer — el cierre `expectNoA11yViolations` vuelve al final; bonus: comentario T3 alineado a C9); reviewer APROBADO (lint/typecheck ✓; menores documentados: cita histórica de líneas sin corregir, comentario partido cosmético)
  - Hecho cuando: commit único `test(Sidebar): T9` que solo toca
    `Sidebar.test.tsx`: (a) **rojos**: test 11 (wrapper `.additionalBody` único
    hijo de `#sidebar-contacts` conteniendo Separator/lista/CTA + aserción de
    orden incondicional Separator→`ul.contacts` por
    `compareDocumentPosition & DOCUMENT_POSITION_FOLLOWING`) y test 12
    (`data-contacts-animate` **refleja `expanded`**: ausente al inicio, presente
    al expandir, ausente al colapsar, presente al reexpandir); (b) **verdes de
    llegada declarados en el body (#101)**: test 13 (colapsado: clase del módulo
    canon #99 + `aria-expanded="false"`; la clase existe desde T4; sin
    `toBeVisible()`) y la reescritura C9 de UNA línea de la constante
    `SEPARATOR_IN_ADDITIONAL` a `'#sidebar-contacts div[aria-hidden="true"]'`
    (los 4 usos `:379/:475/:489/:744` quedan intactos con sus `toHaveLength(n)`;
    el body cita C9/#106). Ningún assert previo debilitado ni borrado; rojo
    esperado: solo tests 11 y 12.
- [x] **T10. Wrapper + atributo en `Sidebar.tsx`.** RF-11 (P1', P4') — 5162e2e (feat, único archivo; 119+/90− mostly reindentación); reviewer APROBADO (25/25 Sidebar, suite 466/41, lint/typecheck ✓; condicionales RF-9 y ARIA línea a línea intactos; `data-contacts-animate={expanded ? "" : undefined}` sin casts/estado extra; ventana transitoria `additionalBody` sin clase = esperada hasta T11)
  - Hecho cuando: `feat(Sidebar): T10` solo toca `Sidebar.tsx`: dentro de
    `#sidebar-contacts` un único div `className={styles.additionalBody}` que
    envuelve Separator + `ul.contacts` + CTA; `data-contacts-animate` presente
    SOLO cuando `expanded` (P1'; sin estado extra); sin `style` inline;
    `aria-expanded`/`aria-controls`/`data-print-hide`/labels intactos; tests 11
    y 12 verdes; el resto de la suite sin tocar.
- [x] **T11. CSS de entrada en `Sidebar.module.css`.** RF-11 (P2', P3', P5'), #116 — 4e80fb3 (feat, único archivo, 177+/61−); reviewer APROBADO con auto-check #116 independiente: 5 `transition` en el archivo, todas (0,1,0)/(0,1,1) o `none`; compuesto (0,2,0) viejo desaparecido; pila migrada sin reinventar; `backwards` ✓; delays/cap con derivación `calc(n × --duration-stagger)` ✓; `4px` único literal nuevo; cero reduced-motion/print/`!important` propios; preexistente byte a byte intacto fuera de lo ordenado (466/41). Ventana T11→T12: el print todavía recorta con el bloque colapsado — T12 es bloqueante para cerrar el Cambio.
  - Hecho cuando: `feat(Sidebar): T11` solo toca el módulo: `.additional` grid
    (0fr/1fr + visibility + transiciones según la tabla de spec, (0,1,0),
    colapso después de la base); la pila de decisión 11 migra a
    `.additionalBody` (con `min-height: 0; overflow: hidden`); `@keyframes
    item-enter` + regla de entrada gated por
    `.additional[data-contacts-animate] .additionalBody > *` con `backwards` y
    delays `calc(n × --duration-stagger)` (nth-child 1–4 + cap n+5); override
    ≥1200 `.additionalCollapsed` a secas (0,1,0) al final con `transition:
    none` (P5'); **eliminar la `transition: color` inerte de `.contacts a`**
    (propuesta §3.4, menor de §XXIV); ningún `@media print` en el módulo
    (RF-10); **auto-check #116 sobre el archivo completo: 0 transiciones que
    animen en (0,2,0)+** (lo replica el reviewer); suite verde.
- [x] **T12. Print de contactos en `global.css`.** RF-10/RF-11 (P7') — efbe0e1 (feat, único archivo, 50+/10−, hunk único dentro de `@media print`); reviewer APROBADO con tabla de cascada independiente: colapsado en papel → grid base conserva `1fr` efectivo (se quita el `display: block` heredado de #103, justificado), `visibility` heredada, `(1,0,0)` gana al gated (0,3,0)/(0,4,0) → `animation: none` en todo el subárbol (cero ítems `opacity: 0`), `li` defensivo; resto del print byte a byte intacto; #116 aclarada aplicada a los `transition: none`. Menores: body con "separa" (typo no enmendable), selector duplicado deliberado con comentario. Sin tests nuevos = prescripto (#101; Ctrl+P real en T13).
  - Hecho cuando: `feat(Sidebar): T12` solo toca `src/styles/global.css`: dentro
    del `@media print` existente, el bloque §3.5: `#sidebar-contacts`
    (1,0,0)` { visibility: visible; grid-template-rows: 1fr }` (+ el
    `display: block` vigente se conserva o se quema contra el grid — decidir con
    comentario), `#sidebar-contacts, #sidebar-contacts * { animation: none;
    transition: none }`, `#sidebar-contacts li { opacity: 1; transform: none }`
    (los ítems jamás `opacity: 0` en papel con el bloque colapsado). Sin tests
    nuevos (print = inspección + Ctrl+P del usuario, criterio #101 explícito);
    resto de `global.css` intacto; suite verde.
- [x] **T13. Cierre del Cambio: suite + build + QA + docs.** #80, #91, #86 — lint/typecheck ✓ · suite **466/41** ✓ · build ✓. QA del reviewer APROBADA en vivo + revisión completa de pieza: expansión 310 ms + stagger total ~290 ms con `backwards` verificado mid-flight, repliegue 224 ms con `visibility` diferido y cero animación de ítems en la salida, carga sin animación a 900 y 1400 (P5'), cruce de media 900→1400 sin animar, reinicio al reexpandir, clics rápidos coherentes, colapsado fuera de foco y del árbol (medido — el punto diferido de T9), #116 en los 3 archivos, consola limpia. **Ctrl+P real con el bloque colapsado: aprobado por el usuario** (contactos completos y visibles). Quedan para el usuario: **commitear el C3 de `foundations/motion.md`** (redactado y entregado; anotado en Abiertos) y la confirmación de `prefers-reduced-motion` con flag real (por inspección P6' cerrada). Con la aprobación del usuario (2026-11-13): spec → `Estado: implementada` y documentos de estado (#86, §XXVI).
  - Hecho cuando: `npm run lint && npm run typecheck && npm test` y
    `npm run build` verdes; QA del reviewer con app servida por el usuario
    (#91, checklist del plan → anexo); el **C3 de `foundations/motion.md`**
    (excepción `grid-template-rows: 0fr↔1fr`) lo redacta el orchestrator y lo
    aplica y commitea el usuario (kit); con la aprobación del usuario: spec →
    `Estado: implementada`, T13 marcada y documentos de estado (#86).
