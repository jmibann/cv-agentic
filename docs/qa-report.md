# QA de F5 — informe (2026-10-08)

> **VEREDICTO FINAL: F5 CERRADA (2026-10-08).** Cuatro pasadas en navegador +
> verificación de papel real por el usuario (6/6); paquete #104 corregido y
> re-verificado; decisiones visuales #105 aplicadas. Suite 445/40, build y
> validate:content verdes. Entrada de cierre: §XII en `docs/diagnostics.md`.
> Residuos no bloqueantes → fila "Pendientes post-F5".

## RESOLUCIÓN (pasadas 3–4, tras el paquete #104)

Las correcciones #104 se implementaron, revisaron y verificaron en vivo:

| Defecto | Fix (tarea/commit) | Verificación en vivo (pasada 3/4) |
|---|---|---|
| B-2 controles visibles en print | ControlsBar T3 `eaa4d01` + AppLayout T7 `87edfd1` (`header[data-print-hide]`) | PASADA 3-A APROBADO: `display:none` en emulación |
| B-3 botón "Mostrar contactos" en print | Sidebar T7 `fac2fbe` + T7 AppLayout (`button[data-print-hide]`) | PASADA 3-A APROBADO |
| M-1 franja vacía de la tab | CornerTab T5 `25e2ee4` + T7 (`div[data-print-hide]`) | PASADA 3-A APROBADO: sin leftovers |
| D1 solape 375 | Sidebar T7 (rediseño #104b: chevron icon-only, identidad a la izquierda, redes centradas) | PASADA 3-B + 4-4: gap 23px, cero solape es/en/Resume, claro/oscuro, overflow 0 |
| D2 anillo UA en skip link | AppLayout T8 `74bafe2` | PASADA 3-C: outline 2px `#304cfd` offset 2; el panel recibe el anillo tras Enter |
| D3 outline UA doble en card | TestimonialCard T4 `02a2756` | PASADA 3-C: outline-style none; único anillo en ::after tras Esc del dialog |
| D4 favicon 404 | Foundation T13/T13b `b93c510` (`/favicon.svg`, azul `#304cfd`) | PASADA 3-D: 200 `image/svg+xml`, cero petición al .ico, consola limpia |
| Pendientes E de pasada 1/2 | — | PASADA 3-E1–E3 (overflow 1024/768; sticky OFF 1440×800 + último contacto; disclosure teclado 1024) y PASADA 4 (bullet 2 Enter→aria-current+scrollLeft 445; hover NavTabs = spec RF-5; axe 0 violaciones en×claro×about y es×oscuro×resume; contraste del chevron claro 5.87 / oscuro 12.06 ✓ contrast.md filas 15/19/39) |

Suite tras todo: **445/40**, build ✅ validate:content ✅. **Spot-check #105c (tras aplicar los tokens)**: avatar 102px exactos a 375 en ambos temas, gap chevron↔nombre 23px sin solape, md–lg (144px) y 1024 intactos, overflow 0 en 375/Resume/768/1024 → APROBADO. ⚠️ Nota: el gap de 23px queda justo con el nombre de ejemplo ("Alex Rivera"); **reconfirmar en 375 cuando `src/content/cv.*.json` tenga el nombre definitivo** (el contenido es editable por diseño; no es defecto de layout).

### Quedan en manos del usuario (no verificables por agentes)

1. **Ctrl+P real** — **APROBADO POR EL USUARIO (2026-10-08, cierre F5)**: sobre `#resume` en oscuro, 6/6 criterios OK — páginas 1–2 About (About Me/What I'm Doing/Testimonials) y 3–4 Resume (Education/Experience/Skills) = orden About→Resume; sin controles/tabs/skip/chevron; contactos expandidos; los 3 testimonios completos apilados sin cortes; fondo blanco renderizado en `@media print` con tema oscuro; flujo limpio sin cortes de cards/timeline.
2. **Favicon visible en la solapa** — **RESUELTO (decisión #105a)**: se cierra como está (azul `#304cfd`, hexágono pointy-top); no se abre cambio estético sin motivo.
3. **F8 + token < md** — **RESUELTOS (decisión #105b/c)**: F8 cerrado, `9rem` (≥768) queda definitivo sin captura de referencia; se aplica la base `< md` `6.375rem`. Ediciones de `tokens.css` **aplicadas y commiteadas**: base `6.375rem` l.201 + comentario l.336 "definitivo" — commit del usuario `190c678 feat(tokens): set avatar base 6.375rem and finalize 9rem (F5 #105b/c)`. La QA midió cero solape también con 7.5rem: el valor es estético, no funcional.
4. **Matiz del "dorado"** — **RESUELTO (decisión #105d)**: se acepta la lectura semántica por tema de `--color-accent-text` (dorado `#fadd7f` en oscuro, azul `#304cfd` en claro; contrastes 12.06:1 / 5.87:1 ✓); descartado un dorado fijo en claro.

## Pass 1–2 original (registro histórico)

App servida por el usuario en `http://localhost:5173/`; pasada del `reviewer`
con chrome-devtools MCP (decisiones #85 y #91). **Dos pasadas**: la 1ª agotó
pasos del agente con 34 checks; la 2ª, enfocada en impresión/teclado/axe,
también quedó incompleta. Estado general: **INCOMPLETO — 2 bloqueantes de
impresión + 1 bloqueante de layout 375px + 2 medios de foco + pendientes**.

Base verificada: F4 cerrada (`133b1e8`), suite 441/40, `build`/validate ✅.

## Matriz de la pasada 1 (viewport × tema × idioma)

| Check | Resultado |
|---|---|
| 1440 claro/oscuro × en/es, sin overflow, sticky ≥900 activo | APROBADO (sticky `top: 157.8px` medido; avatar no cortado post-scroll) |
| `#resume` directo abre Resume; click de tab no agrega historial (`replaceState`, `history.length` estable); tab inicial about sin hash | APROBADO |
| Skip link: primer enfocable, visible (16,16), `z-index: 30` > header 20, `data-print-hide` | APROBADO (el anillo de foco → defecto D2) |
| Tema: toggle → `data-theme=dark` + `cv:theme` + `theme-color` #151517; recarga sin parpadeo claro→oscuro (anti-flash primero en `<head>`) | APROBADO |
| Idioma en vivo: `<html lang="es">`, `cv:locale`, tabs/h1/skip/sidebar traducidos sin recargar | APROBADO |
| Float ≥992 (1024/1440, es): texto del `h1` vs solapa sin colisión, ancho real, contenido no angostado; <992: `h1` debajo de la tab (768 y 375) | APROBADO en es/oscuro; en claro/en no medido en 1024/768 |
| Impresión (emulada en pasada 2) | ver abajo |
| Landmarks/h1/roles tabs en navegador | APROBADO (axe → abajo) |
| F8 `--size-avatar-sidebar: 9rem` | proporción visual OK en 1024/1440; **valor final pendiente de la captura de referencia del usuario** *(→ cerrado luego sin captura, decisión #105b)* |

## Impresión (pasada 2; método: reinyección de las 32 reglas `@media print`
como overlay + computed + captura — el MCP no expone print-to-PDF; **no
valida paginación ni `@page`**; evidencia `f5-print-emulation-resume-dark.png`,
375, tema oscuro, tab Resume activo)

| Check | Resultado |
|---|---|
| Ambos paneles, orden **About→Resume** con Resume activo (`[data-print-stack]` flex + `order` por `data-print-page`) | **APROBADO** |
| Contactos expandidos (`#sidebar-contacts { display: block }` gana al colapso por clase) | **APROBADO** |
| Testimonios apilados con texto completo, bullets/pagination ocultos, excerpt `clamp:none`, dialog no monta | **APROBADO** |
| Paleta clara con tema oscuro activo (fondo `#ffffff`, `color-scheme: light`, sombras none) | **APROBADO** |
| `break-inside: avoid` en `article`/`li` (ServiceCard/TimelineItem) | **APROBADO** |
| **Ocultar ControlsBar** | **DEFECTO B-2**: `header` (0,0,1) pierde contra la clase hasheada `._controlsBar_*{display:flex}` (0,1,0) → los controles EN/ES+toggle **se imprimen** |
| **Ocultar botón "Show Contacts"** | **DEFECTO B-3**: `aside button` (0,0,2) pierde contra `._disclosureButton_*` (0,1,0) → el flap se imprime a <1200px |
| `[role="tablist"]` oculto | APROBADO… **pero DEFECTO M-1**: el envoltorio visual CornerTab (60px, fondo/borde) NO es contenido del tablist → se imprime vacío |
| Download CV en papel | N/A con el contenido actual (`profile.downloadCvUrl` no definido); el gap `aside button` vs `<a>` queda latente (nota en `global.css:100-110`) |

## Axe y teclado (pasada 2)

- **axe-core 4.10.2 en navegador**: `#about`/`#resume` × en/es (claro): **0 violaciones** — APROBADO.
- Skip link en navegador: Tab → Enter, hash intacto, foco al tabpanel con anillo estándar (`2px --color-focus-ring`, offset 2) — APROBADO (cierra el PARCIAL de la pasada 1).
- NavTabs: flecha mueve foco **y** activa (hash + `aria-labelledby` sincronizados), circular, Home/End — APROBADO.
- Dialog testimonio: Enter abre, Esc cierra, **foco vuelve al trigger**, scroll-lock entra y sale — APROBADO.
- Disclosure contactos a <1200 y resultado del Enter en bullet 2 — **SIN VERIFICAR** (agotó pasos).

## Defectos

| # | Sev. | Qué | Celda | Pieza | Tipo |
|---|---|---|---|---|---|
| D1 | **BLOQUEANTE** | La solapa "Mostrar contactos"/"Show Contacts" del Sidebar **solapa el nombre** del perfil a 375px (tab 164–359×80–124 sobre nombre 167–344×95–122; ilegible en es; confirmado claro y oscuro, en About; Resume sin medir, mismo mecanismo). El código sigue la spec (Responsive "< md"); la spec no resuelve el choque → **parece Cambio de la spec de `layout/Sidebar`** | 375 × ambos temas × ambos idiomas | `layout/Sidebar` (+ su spec) | **decisión del usuario (Cambio)** |
| B-2 | **BLOQUEANTE** | ControlsBar visible en impresión: selector `header` pierde por especificidad contra la clase hasheada del módulo | print × todo | contrato de `layout/AppLayout` → `src/styles/global.css` + raíz de `controls/ControlsBar` | spec/contrato inviable → **decisión del usuario** |
| B-3 | **BLOQUEANTE** | Botón "Show Contacts" visible en impresión: `aside button` pierde contra `._disclosureButton_*` | print <1200px | como B-2: contrato de AppLayout + raíz del botón de `layout/Sidebar` | **decisión del usuario** |
| M-1 | MENOR | La solapa CornerTab (envoltorio) se imprime vacía: `[role="tablist"]` oculta el contenido, no el contenedor visual | print | `layout/NavTabs`/`primitives/CornerTab` (hooks de impresión) | parte de la misma decisión de contrato |
| D2 | MEDIO | El skip link enfocado muestra el anillo de la UA (`outline: auto` azul del navegador), no el anillo estándar del kit (regla dura 7 de `docs/DESIGN.md`; la spec de AppLayout solo prescribe el anillo del tabpanel) | 1440, foco por Tab | `layout/AppLayout` | código no cumple DESIGN → tarea nueva de la pieza |
| D3 | MEDIO | TestimonialCard: el `<button>` estirado muestra un anillo UA de más (2px) bajo el estándar del `::after` (RF-5 fija el anillo en el `::after`; el módulo no resetea el outline del botón) | 1440 post-scroll | `content/TestimonialCard` | código no cumple su spec → tarea nueva |
| D4 | BAJO | `favicon.ico` 404 en consola (dev server) | todo | `index.html`/`public/` | decisión menor del usuario |

## Sin verificar (tercera pasada corta y/o mano del usuario)

- **Impresión REAL con paginación/`@page`**: pedir al usuario `Ctrl+P` →
  preview sobre `#resume` con tema oscuro (confirma B-2/B-3/M-1 en render de
  papel, no emulado).
- Celdas claro×en/es de 375/768/1024 (overflow medido solo en oscuro/es y
  1440); 1440×800 (sticky no-fijo + último contacto alcanzable); D1 en Resume.
- C2 (disclosure <1200 con teclado), resultado de Enter en bullet 2 del
  carrusel, hover de NavTabs, recorte de avatar/sombras del carrusel.
- F8: valor final de `--size-avatar-sidebar` contra la captura de referencia.

## Decisión marco para B-2/B-3/M-1 (propuesta al usuario)

El contrato #103 eligió selectores nativos "deliberados" (`header`,
`[role="tablist"]`, `aside button`) para no tocar piezas F2/F3 — la QA probó
que **pierden por especificidad contra las clases de los CSS Modules**.
Alternativa: extender el contrato `data-*` a las raíces de las piezas
afectadas (`data-print-hide` en el `<header>` de ControlsBar, en la raíz del
botón de Sidebar y en el envoltorio de NavTabs — cambios chicos de código en
piezas `implementada`, cada una con su tarea nueva y tests de atributo), y que
`global.css` apunte solo a `[data-print-hide]`. Implica **Cambio** de la sección
"Impresión" de la spec de AppLayout + 3 tareas de piezas. *Descartado:* `!important`
en global.css (gana pero ensucia el contrato y sigue siendo coupling a
estructura) y `:global()` (descartado en #103).
