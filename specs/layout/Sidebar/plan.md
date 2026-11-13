# Plan — Sidebar

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/Sidebar/Sidebar.tsx` | `Box variant="outer" as="aside">` con baseInfo (avatar/nombre/Badge/redes), botón de disclosure icon-only (Cambio F5: sin CornerTab) con `data-print-hide` en su raíz, `.additional` (Separator + contactos + CTA) | RF-1…RF-4, RF-6…RF-10 |
| `src/components/Sidebar/getContactHref.ts` | función pura `getContactHref(item)` (decisión 11: carpeta de la pieza, sin React, C1) | RF-5 |
| `src/components/Sidebar/Sidebar.module.css` | grilla por breakpoint, avatar sobresaliente (offset negativo), redes/links/estados, colapso por clase + `@media (min-width: 1200px)` (CSS-only 8=a), `.additional` gap con tramo Separator | RF-3, RF-7, RF-9 |
| `src/components/Sidebar/getContactHref.test.ts` | tabla de casos (test 7) | RF-5 |
| `src/components/Sidebar/Sidebar.test.tsx` | tests + cierre a11y | todas |
| `src/components/Sidebar/index.ts` | re-export (`Sidebar`, tipos, `getContactHref`) | — |

## Funciones puras y algoritmo

- `getContactHref(item)`: `item.href ?? derivado` — derivación exacta en spec → API (tabla: mailto / tel con `+` inicial conservado / wa.me solo dígitos / location `undefined`); sin dígitos tras limpiar → `undefined`. Pura, testeada aparte (C1).
- Mapa tipo→ícono para `IconBox`: `email→mail`, `phone→phone`, `whatsapp→message-circle`, `location→map-pin` (constante local sin exportar).

## Interfaz

`SidebarProps { profile; contact; social; labels; className? }` (spec → API; `className` al `Box as="aside">` — la unión la aplica Box). Datos **solo por props** (RF-8, C2 sin excepción acá). El id de la región del disclosure: constante local `"sidebar-contacts"` (coincidente con `foundations/layout.md` → print).

## Decisiones

- **CSS-only ≥ xl (8=a):** el botón de disclosure se monta siempre; el media 1200 del módulo lo oculta (`display: none`) y fuerza `display: block` en `.additional`. El colapso inicial es por **clase** (`data-collapsed` o clase del módulo sobre `.additional`) — nunca `style` inline — para que el print compartido pueda forzar la expansión (RF-10). *Descartado:* `matchMedia` en JS (prohibido sin mandato explícito).
- **Cambio F5 2026-10-08 (rediseño del disclosure, decisión del usuario ante D1/B-3 de `docs/qa-report.md`):** se elimina la CornerTab del disclosure (su fondo `surface-raised` solapaba el nombre a 375px) por un botón icon-only: chevron dorado (`Icon chevron-down` + `aria-hidden`), sin fondo/border, absoluto arriba-derecha del raíz, `aria-label` alterno `showContacts`/`hideContacts` (el nombre accesible reemplaza el texto visible), `data-print-hide` en su raíz. Identidad < md/md–lg desplazada a la izquierda junto al avatar (reserva `padding-inline-end` solo si el nombre alcanza la esquina); redes centradas en el espacio disponible; avatar −15% en el tramo < md (token base `--size-avatar-sidebar: 6.375rem` — **lo aplica el usuario en `tokens.css`**; md–lg 9rem y xl 11.25rem NO se tocan: F8 sigue abierto solo para md–lg). Los tests de T4 que asertaban la CornerTab (estructura + `toHaveClass(cornerTabBaseClass)`) se actualizan al botón directo dentro de este Cambio (preparado y aprobado en la puerta F5 — precedente F3/T5 modelo div): el `test(Sidebar): T7` declara qué aserciones viejas se reubican y por qué; ningún otro contrato de T2/T3/T5/T6 se toca.
- Estado `expanded` local, default `false` en todo < xl (decisión 11); el chevron rota vía clase (`transform` + `--duration-base`, Icon `chevron-down` decorativo).
- Links: `target="_blank" rel="noopener noreferrer"` solo en redes y `href`/whatsapp externos; `mailto:`/`tel:` sin target (decisión 10). La detección de "externo" es por tipo/campo explícito, no heurística de dominio.
- Avatar `<img>` sin atributos `width/height` (decisión 9): dimensiona el CSS con `--size-avatar-sidebar` (F8 **cerrado** por #105b: base 6.375rem <md aplicada, 9rem ≥768 definitivo — tokens en verde tras la edición del usuario 2026-10-08).
- **Cambio 2026-11-10 (alt dinámico):** el alt del avatar deja de leerse de `profile.avatar.alt` (campo eliminado del esquema) y llega por `labels.avatarAlt`; AppLayout lo deriva de `profile.name` con `format(t.sidebar.avatarAlt, { name })`. La pieza no compone textos (RF-8) y el alt sigue al nombre al editarlo en `cv.{en,es}.json`. *Descartado:* mantener `alt` en el contenido (se desincroniza al cambiar el nombre) y `alt={profile.name}` (pierde el texto descriptivo "Portrait of"/"Retrato de").
- `useCv()` prohibido dentro (RF-8); `BRAND_NAMES`/`BrandIcon` para redes (nombre accesible = marca).
- El CTA usa `Button href={downloadCvUrl} download icon="download" fullWidth` (primitiva F2).
- `.additional`: pila con `gap` de tokens; en el tramo del `Separator` no debe acumularse (Separator RF-4). El mecanismo exacto lo elige el builder dentro de su tarea y lo documenta en el comentario (p. ej. margen negativo compensado del gap en los adyacentes al separador); lo verifica el reviewer por inspección + F5.
- Sticky (≥900px) y print (expansión forzada, ocultar botón/CTA) **no son tareas de esta pieza** (AppLayout/estilos compartidos; F4/F5).

## Estrategia de tests

Render aislado con props fixture (el contenido de `cv.en.json` como base; sin providers: la pieza no consume hooks — RF-8). `getContactHref` con su tabla (7 casos). Sidebar: región `complementary` nombrada; nombre/badge/avatar alt; redes con aria-label de marca + target/rel; contactos: label + link derivado (`mailto`/`tel` **sin** target; whatsapp con target); location sin link; disclosure: `aria-expanded` false→click→true + texto alterna + `aria-controls` apunta existente; CTA presente/ausente según `downloadCvUrl`; vacío combinado (test 8); cierre `expectNoA11yViolations` colapsado y expandido — los `IconBox` de contactos son tone gradient: montar `AccentGradientDefs` de armazón (criterio IconBox). Lo no testeable (breakpoints, media 1200, print, sticky): inspección + QA F5 (#101).

Cobertura: T1→RF-5 · T2→RF-1,RF-6 (redes),RF-8 · T3→RF-6 (contactos),RF-9 · T4→RF-3,RF-4 (redelegado en parte a T7 por el Cambio F5) · T5→RF-2 · T6→RF-7,RF-10 + cierre · **T7 (Cambio F5)→RF-3,RF-4 (nuevo modelo),RF-10 (hook) + re-acote de los tests de T4 + cierre a11y renovado** · **T8 (Cambio 2026-11-10)→RF-1 (alt derivado),RF-8**.

## Anexo — Cambio motion 3 (2026-11-13, #106/#116; puerta Spec+Plan+Tareas aprobada en 3 rondas con ajustes del usuario)

**Archivos:** `src/components/Sidebar/Sidebar.tsx`, `Sidebar.module.css`,
`Sidebar.test.tsx`, `src/styles/global.css` (solo print; dueño integrator).
**No se tocan:** providers, AppLayout, `src/test/**`, configs,
`allowExportNames`.

**Decisiones:**

- **P1' — `data-contacts-animate` refleja `expanded`** (atributo en
  `#sidebar-contacts` solo cuando `expanded`). El bloque arranca siempre
  colapsado (decisión 11) y en ≥1200 no hay botón operable: nada anima en el
  render inicial ni en la carga xl. *Descartado:* estado extra `hasToggled`
  (redundante, ajuste 2 del usuario en ronda 2).
- **P2' — Stagger con `@keyframes item-enter` + `animation-delay:
  calc(n × --duration-stagger)`** por `:nth-child(1–4)`, cap
  `:nth-child(n+5)` al 4.º paso, **`animation-fill-mode: backwards`** (los ítems
  no se ven antes de su paso). *Descartado:* `transition-delay` en selectores
  nth-* ((0,2,0)+, prohibido por #116).
- **P3' — Las transiciones (rows/visibility) solo en las clases base**
  `.additional` y `.additionalCollapsed` (0,1,0), ordenadas en el archivo
  (la de colapso después). *Descartado:* depender del orden compuesto/simple.
- **P4' — Wrapper único `.additionalBody`** recibe la pila de `.additional`
  (gap + tramo del Separator + márgenes migran; decisión 11 sigue vigente en el
  wrapper). `#sidebar-contacts` queda como grid de una fila con único hijo.
- **P5' — Override ≥1200 con clase simple `.additionalCollapsed`** (0,1,0, al
  final del módulo): `grid-template-rows: 1fr; visibility: visible;
  transition: none;` — el `transition: none` evita que agrandar la ventana con
  el bloque colapsado dispare la animación de altura; legal bajo #116 aclarada
  (enmienda en `docs/README.md`). *Descartado:* el compuesto (0,2,0) que
  mostraba la propuesta §3.3 (innecesario con el orden de P3'; ajuste del
  usuario en ronda 1: mantener clases simples).
- **P6' — Reduced motion sin regla propia:** todos los delays derivan de
  `calc(n × --duration-stagger)` y el delay del `visibility` de
  `--duration-exit`; bajo `prefers-reduced-motion: reduce` los cinco tokens
  colapsan a 0.01 ms en `tokens.css:423-429` → duraciones y delays son
  imperceptibles sin regla adicional. *Queda superada* la mención de la
  propuesta (§2, l.176/260) a una regla de componente extra.
- **P7' — Print en `global.css`** (propuesta §3.5): `#sidebar-contacts`
  (1,0,0) `visibility: visible; grid-template-rows: 1fr` +
  `#sidebar-contacts, #sidebar-contacts * { animation: none; transition: none }`
  + `#sidebar-contacts li { opacity: 1; transform: none }` (el estado colapsado
  no puede dejar ítems invisibles en papel). *Descartado:* resolverlo solo en
  el módulo (no alcanza a los resets del subárbol con el id de contrato).
- **C9 (aprobada en #106) — Reescritura del selector del Separator:**
  `SEPARATOR_IN_ADDITIONAL` pasa a descendiente
  (`'#sidebar-contacts div[aria-hidden="true"]'`); los 4 usos quedan intactos
  con sus `toHaveLength(n)`; el orden Separator→lista se agrega como aserción
  incondicional del test 11. *Descartado:* la forma de la propuesta
  (`closest("ul") + previousElementSibling`), que no sirve en el caso
  `contact: []` con CTA (:475/:489).

**Commits de la tarea de print:** T12 es `feat(Sidebar): T12` solo (global.css;
print = inspección + Ctrl+P del usuario); ningún test nuevo le corresponde.

**QA del reviewer al cerrar (T13, app servida #91):** expansión/repliegue en
ambos sentidos (~0.3 s), stagger total ~290 ms con `backwards`, sin animación
en carga inicial (también ≥1200), clics rápidos sin estado inconsistente,
colapsado fuera del foco y del árbol de accesibilidad (en navegador; jsdom no
aplica CSS), print expandido sin ítems `opacity: 0`, reduced motion con flag
real, reinicio observable de la animación al reexpandir.
