# Plan — Sidebar

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/Sidebar/Sidebar.tsx` | `Box variant="outer" as="aside">` con baseInfo (avatar/nombre/Badge/redes), disclosure en `CornerTab size="sm">`, `.additional` (Separator + contactos + CTA) | RF-1…RF-4, RF-6…RF-10 |
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

- **CSS-only ≥ xl (8=a):** el botón/CornerTab se montan siempre; el media 1200 del módulo oculta la `CornerTab` y fuerza `display: block` en `.additional`. El colapso inicial es por **clase** (`data-collapsed` o clase del módulo sobre `.additional`) — nunca `style` inline — para que el print compartido pueda forzar la expansión (RF-10). *Descartado:* `matchMedia` en JS (prohibido sin mandato explícito).
- Estado `expanded` local, default `false` en todo < xl (decisión 11); el chevron rota vía clase (`transform` + `--duration-base`, Icon `chevron-down` decorativo).
- Links: `target="_blank" rel="noopener noreferrer"` solo en redes y `href`/whatsapp externos; `mailto:`/`tel:` sin target (decisión 10). La detección de "externo" es por tipo/campo explícito, no heurística de dominio.
- Avatar `<img>` sin atributos `width/height` (decisión 9): dimensiona el CSS con `--size-avatar-sidebar` (F8 provisional sigue abierto → F5).
- `useCv()` prohibido dentro (RF-8); `BRAND_NAMES`/`BrandIcon` para redes (nombre accesible = marca).
- El CTA usa `Button href={downloadCvUrl} download icon="download" fullWidth` (primitiva F2).
- `.additional`: pila con `gap` de tokens; en el tramo del `Separator` no debe acumularse (Separator RF-4). El mecanismo exacto lo elige el builder dentro de su tarea y lo documenta en el comentario (p. ej. margen negativo compensado del gap en los adyacentes al separador); lo verifica el reviewer por inspección + F5.
- Sticky (≥900px) y print (expansión forzada, ocultar botón/CTA) **no son tareas de esta pieza** (AppLayout/estilos compartidos; F4/F5).

## Estrategia de tests

Render aislado con props fixture (el contenido de `cv.en.json` como base; sin providers: la pieza no consume hooks — RF-8). `getContactHref` con su tabla (7 casos). Sidebar: región `complementary` nombrada; nombre/badge/avatar alt; redes con aria-label de marca + target/rel; contactos: label + link derivado (`mailto`/`tel` **sin** target; whatsapp con target); location sin link; disclosure: `aria-expanded` false→click→true + texto alterna + `aria-controls` apunta existente; CTA presente/ausente según `downloadCvUrl`; vacío combinado (test 8); cierre `expectNoA11yViolations` colapsado y expandido — los `IconBox` de contactos son tone gradient: montar `AccentGradientDefs` de armazón (criterio IconBox). Lo no testeable (breakpoints, media 1200, print, sticky): inspección + QA F5 (#101).

Cobertura: T1→RF-5 · T2→RF-1,RF-6 (redes),RF-8 · T3→RF-6 (contactos),RF-9 · T4→RF-3,RF-4 · T5→RF-2 · T6→RF-7,RF-10 + cierre.
