# Diagnóstico del kit — punto de partida

Fecha de la auditoría: 2026-09-29 · Revisión **read-only** (no se modificó nada).
Última actualización: 2026-09-30 — **A, B, C y F cerradas**: todas las
decisiones tomadas y aplicadas (F8 queda con valor provisional que se cierra
en la QA visual de F5 del proyecto). El kit está listo para arrancar la fase
F1 (foundation) del proyecto. Ese mismo día se sumó una **verificación
independiente de la factibilidad de F1 y el plan de kickoff** (sección nueva
abajo, tras "Estado actual"); es lo que hay que leer para arrancar mañana.
**2026-10-02 — Unidad de trabajo y memoria (sección M):** trabajo por tarea
(Tn) propagado a constitución, `AGENTS.md`, subagentes y reviewer; memoria
unificada en `docs/memory.md`.

**2026-10-02 — Constitución (sección K):** nuevo `docs/constitution.md` con
reglas no negociables; enlazada desde `AGENTS.md` y los 5 agentes.

**2026-10-01 — Auditoría de arquitectura (sección J):** 24 hallazgos; los
los 24 se corrigieron (incluye aplicar el contenido en JSON, sección G), y
la observación posterior sobre el sticky del Sidebar también se resolvió.

**2026-10-01 — Documentación en `docs/` (sección I):** este archivo y
`README.md` (completo), `DESIGN.md`, `BACKLOG.md`, la documentación de
agentes (`docs/agents.md`) y los documentos de tokens (`docs/tokens/`) pasaron
a `docs/`. En la raíz queda un `README.md` corto.

**2026-10-01 — Reestructura (sección H):** el kit pasó de
`packages/cv-design-kit/` a la **raíz** de `cv-agentic/`, `components/` pasó
a `specs/` y los agentes a `.opencode/agents/`. Las rutas citadas en las
secciones A–F (escritas antes) son relativas a la ubicación **anterior**;
para encontrarlas hoy: quitar `packages/cv-design-kit/` y leer `components/`
como `specs/` y `agents/agent/` como `.opencode/agents/`.

> **Números de línea:** los `archivo:línea` citados en A, B y C corresponden
> a la versión del kit del 2026-09-29. Tras las ediciones del 2026-09-30 se
> corrieron; buscar por el texto citado, no por el número.

---

## Estado actual (2026-09-30)

| Bloque | Estado | Qué falta |
|---|---|---|
| Reestructura a proyecto único (2026-10-01) | ✅ Aplicada (sección H) | — |
| Documentación en `docs/` (2026-10-01) | ✅ Aplicada (sección I) | — |
| Constitución (2026-10-02) | ✅ Vigente (sección K) | — |
| Contenido en JSON (sección G) | ✅ Aplicado en el kit | La generación de tipos y validador ocurre en F1 |
| Auditoría de arquitectura (sección J) | ✅ Críticos, altos y medios (1–24) corregidos, más la observación del sticky | — |
| A1–A6 Contradicciones | ✅ Decididas y aplicadas | — |
| B1–B9 Puntos débiles | ✅ Decididas y aplicadas | Revisar los 4 desvíos anotados al final de la tabla de B |
| C1–C9 Notas menores | ✅ Resueltas y aplicadas (C8 y C9 detectadas en la evaluación de C) | — |
| F1, F4, F5, F11 | ✅ Aplicadas (mecánicas) | — |
| F2, F3, F6, F7, F8, F10 | ✅ Decididas y aplicadas (recomendaciones aceptadas) | F8: el valor final del avatar se fija en la QA visual de F5 |
| F9 | ✅ Verificado, sin acción | Plan B de la spec (LinkedIn) |
| F12–F13 | ✅ Resueltas con B | — |
| Documentación | ✅ Actualizada (ver "Registro de documentación") | — |
| **F1 del proyecto (fase foundation)** | ✅ Desbloqueada | Arrancar cuando el usuario lo indique |

## Verificación independiente y plan de kickoff (2026-09-30)

Segunda pasada de auditoría (read-only) sobre el estado cerrado de A/B/C/F,
enfocada en factibilidad de arrancar F1.

### Lo que se verificó por separado

- 27 specs presentes: 11 `primitives/`, 7 `content/`, 3 `controls/`,
  3 `layout/`, 2 `pages/`, 1 `hooks/`.
- Cero referencias colgantes de tokens (diff programático `var(--…)` usados
  en `components/**` + `foundations/**` vs. definidos en `tokens.css`): el
  único no definido es `--icon-size`, custom property local intencional de
  Icon/BrandIcon con fallback (coincidente con § D).
- Estado del repo: sin `.git`, sin `package.json` raíz, sin `.opencode/`,
  sin `apps/`. **Es el estado esperado**: los crea foundation en F1
  (ver "Estado del repo al momento de la auditoría").
  *Actualización 2026-10-01:* tras la reestructura (H) ya **existe**
  `.opencode/agents/` con los 5 agentes y `AGENTS.md` en la raíz; no habrá
  `apps/`. Siguen sin existir `.git`, `package.json` y `src/` (los crea F1).

### Veredicto

**F1 desbloqueado.** El kit está en condiciones de arrancar. Abiertos no
bloqueantes:

1. Revisar los 4 desvíos de la tabla B (§ B, "Desvíos") — paso 5b.
2. `--size-avatar-sidebar: 9rem` provisional — se cierra en la QA visual de
   F5 (decisión #38 del `README.md` del kit).

Riesgo menor: al setear el flujo, **no crear un `SPEC.md` duplicado** — el
kit ya ES la spec; `AGENTS.md` vigente dice "gana la spec".

### Plan de kickoff

| Etapa | Qué | Skill / agente |
|---|---|---|
| 0. Pre-kickoff | Decidir desvíos de B (revisar o aceptar); confirmar `git init` de F1 | usuario |
| 1. F1 foundation | App en la **raíz** (Vite+React+TS creada a mano, sin generadores), alias `@data`, ESLint 10, Vitest+axe-core + helper a11y, providers, anti-flash, contenido en/es. *(Actualizado 2026-10-01: sin workspaces ni `apps/web`; los agentes ya están instalados)* | `foundation` → reviewer → PUERTA |
| 2. F2–F4 serial | 27 piezas, una por vez, `test(<Name>)` en rojo → `feat(<Name>)` | `component-builder` / `integrator`; skill `sdd` (TDD e incremental van en su prompt; decisión #77) |
| 3. F5 QA | 4 viewports × 2 temas × 2 idiomas; cerrar avatar F8 | `reviewer`; skill browser-testing-with-devtools |

Opcional post-F1: skill constraint-driven-development — las reglas duras de
`DESIGN.md` y el DoD sin `@ts-ignore`/`eslint-disable` ya funcionan como bar
escrito; conviene dejar explícito que nada lo baja sin aprobación del usuario.

## Causas raíz (resumen)

| Causa raíz | Síntomas | Solución | Estado |
|---|---|---|---|
| 1. Specs escritas en una pasada sin revisión cruzada | Contradicciones entre documentos (A1–A5) | Pasada de consistencia: una sola fuente de verdad por regla | ✅ Resuelta (A1–A5; referencias cruzadas entre specs, `layout.md` marcado como resumen) |
| 2. Proceso multiagente con huecos | A6, commits sin dueño, builders en paralelo en el mismo árbol, agentes "read-only" con bash (F1–F4) | Completar tabla de fases, definir estrategia de git y de paralelismo, restringir permisos | ✅ Resuelta (A6, F2 construcción serial, F3 commits test→feat, F4 permisos) |
| 3. Reglas duras más estrictas que la realidad | Violaciones sistemáticas que las propias specs piden (B3, B7), regex de lint con falso positivo (F1) | Tokens nuevos o excepciones explícitas en `DESIGN.md`; corregir la regex | ✅ Resuelta (B3, B7, C8, C9, F1) |
| 4. Supuestos externos no verificados + ambigüedades | B8, B9, F5–F7 | Verificar en docs oficiales; fijar defaults escritos en las specs | ✅ Resuelta (B8, B9, F5–F7, F9–F11 verificados y aplicados; F8 se cierra en QA visual) |

Alcance revisado: `DESIGN.md`, `tokens/` (tokens.css, contrast.md, breakpoints.md),
`foundations/` (5 docs), `data/` (schema + ejemplos en/es), las 23 specs de
`components/**`, `BACKLOG.md`, `agents/` (README, AGENTS.md y las 5 plantillas).

Cómo usar este archivo: para arrancar mañana, empezar por **"Verificación
independiente y plan de kickoff"** (debajo de "Estado actual"). A y B quedan
como registro de lo decidido y aplicado. Lo abierto está en **C** y **F**. **D**
ya está verificado OK: no vuelve a revisarse. **E** es el orden de trabajo.

---

## Estado del repo al momento de la auditoría

- **No existe `package.json` raíz ni `.git`.** Todo el flujo de agentes
  (npm workspaces, `git diff` del reviewer, `git status` del orchestrator)
  depende de que F1 (`foundation`) los cree.
- Consecuencia práctica: la primera tarea del orchestrator debe **verificar**
  el estado del repo en vez de asumirlo (su plantilla ya lo pide; confirmar
  que F1 crea `.git` y root `package.json` antes de cualquier gate con `git diff`).

---

## A. Contradicciones graves (decisión del usuario antes de F1)

> **Estado 2026-09-30:** A1–A6 **decididas y aplicadas** (se aceptaron las
> recomendaciones). Verificación posterior: 0 links rotos, 0 tokens
> indefinidos, 0 referencias residuales (`headingLevel`, "el tabpanel es un
> Box", `margin-top` de la card, `padding-block: 2rem 0.5rem`).

> Regla vigente en `agents/AGENTS.md`: "si la spec y el código no coinciden,
> gana la spec; si la spec parece equivocada, se frena y consulta al usuario".
> Los puntos A1–A6 son exactamente ese caso: dos partes del kit mandan cosas
> distintas y ningún agente puede decidir entre ellas.

### A1. TestimonialCard: margen propio + headroom especificado dos veces

- `components/content/TestimonialCard.md:52` pone `margin-top: 2rem` (< 580:
  `1.5rem`) en la **raíz** de la card, en violación directa de
  "Sin margen externo. El padre posiciona con `gap`"
  (`components/README.md:55`, `DESIGN.md:58`).
- Además, el espacio para el avatar que sobresale está especificado **dos
  veces**: el `margin-top` de la card *y* el `padding-block: 2rem 0.5rem`
  del track del carrusel (`components/content/TestimonialCarousel.md:72`).
  Aplicar ambos deja ~4rem de espacio muerto.
- **Decidir:** el headroom vive en un solo lugar. Opción recomendada: el
  track del carrusel (`padding-block`) y la card sin margen; mover el
  `margin-top` de la card a un `gap`/padding del padre.
- ✅ **Decidido (2026-09-30):** el headroom vive **solo** en el `padding-block`
  del track del carrusel, dimensionado para la protrusión del avatar + su
  sombra (y el hover shadow de la card, que el `overflow-x: auto` del track
  recortaría en vertical). La card queda **sin `margin-top`**.
  ✅ **Aplicado:** `TestimonialCard.md` (card sin `margin-top`; nueva sección
  "Espacio para el avatar" con la protrusión calculada: 1.875rem, < 580:
  1.5rem) y `TestimonialCarousel.md` (track `padding-block: 2.375rem 2rem`,
  < 580 `padding-top: 2rem`; fila "Headroom del track" con el motivo del
  recorte vertical). *Nota:* esos valores son literales responsive → quedan
  alcanzados por la decisión pendiente F12 (tokens vs. excepción).

### A2. Dos fórmulas distintas para despejar el `h1` de la CornerTab (< lg)

- `foundations/layout.md:61-63`: `margin-top: var(--size-nav-tab-height)`
  en el header del panel (48px).
- `components/layout/AppLayout.md:83-85`: `padding-top: calc(var(--size-nav-tab-height) - var(--box-padding) + var(--space-4))`
  en `.panel` (≈ 40–58px según breakpoint).
- Mecanismos y resultados distintos; dos builders entregan layouts diferentes.
- **Decidir:** quedarse con una (probablemente la de AppLayout.md, que ya
  descuenta el padding del Box) y alinear `layout.md` a ella.
- ✅ **Decidido (2026-09-30):** vale la fórmula de `AppLayout.md`
  (`padding-top: calc(var(--size-nav-tab-height) - var(--box-padding) + var(--space-4))`
  en `.panel`). ✅ **Aplicado:** `foundations/layout.md` ahora remite a esa
  fórmula única y explica por qué descuenta `--box-padding`.

### A3. `Box.md` afirma que el tabpanel "es un Box", pero nadie lo usa

- `components/primitives/Box.md:25` dice que el tabpanel de NavTabs es un
  Box, y por eso Box tiene el mecanismo de pass-through de `id`/`role`/`tabIndex`
  (`Box.md:53,61`).
- Pero `components/layout/NavTabs.md:23,27` y `AppLayout.md` renderizan el
  tabpanel como `<div role="tabpanel">` **suelto dentro** del Box de contenido.
- El pass-through de Box queda sin uso y la afirmación es falsa.
- **Decidir:** (a) borrar la afirmación de Box.md y simplificar Box (sin
  pass-through), o (b) hacer que el tabpanel sea realmente el Box.
- ✅ **Decidido (2026-09-30): opción (a).** El tabpanel sigue siendo un
  `<div role="tabpanel">` dentro del Box de contenido. Se borra la afirmación
  de `Box.md` y se simplifica su API. *Nota al aplicar:* Box sigue necesitando
  pasar `aria-label` / `aria-labelledby` y `className` (Sidebar usa
  `Box as="aside" aria-label`, ServiceCard usa `as="article" aria-labelledby`);
  lo que se elimina es la justificación del tabpanel, no esos atributos.
  ✅ **Aplicado:** `components/primitives/Box.md` — API cerrada
  (`variant`, `as`, `children`, `id`, `aria-label`, `aria-labelledby`,
  `className`; sin `role`, `tabIndex` ni `...rest`), afirmación del tabpanel
  reemplazada por la aclaración contraria, sección Accesibilidad y test de
  pass-through actualizados. Verificado que ningún uso de Box en las specs
  necesita `role` o `tabIndex`.

### A4. `Timeline` expone `headingLevel` que rompe la jerarquía fijada por DESIGN

- `components/content/Timeline.md:46`: `headingLevel?: "h3" | "h4"`.
- `DESIGN.md:53` y `foundations/typography.md:74-78` fijan: título de
  TimelineItem = `<h3>` con estilo de h4, y prohíben el `h5` del tema original.
  `ResumeSection.md:44` también dice "los títulos del Timeline son h3".
- La opción `"h4"` habilita saltos h2→h4 que el reviewer no puede rechazar
  (la propia spec lo permite).
- **Decidir:** quitar `headingLevel` de la API (fijar h3), o justificar
  cuándo se usaría cada valor.
- ✅ **Decidido (2026-09-30):** se quita `headingLevel`; el título del
  TimelineItem es siempre `<h3>` con estilo de h4. Verificado: la prop está en
  `Timeline.md:46`. ✅ **Aplicado:** `components/content/Timeline.md` — prop
  eliminada, nota de h3 fijo, test 2 = "heading nivel 3".

### A5. `DESIGN.md` dice "gradiente" donde tokens y specs usan "sólido"

- `DESIGN.md:8-11` lista entre los usos del **gradiente**: "el punto del
  Timeline" y "el tab/idioma activo".
- Pero `tokens.css:86` comenta `--color-accent` como "sólido: punto Timeline,
  foco, íconos", `Timeline.md:61` y `NavTabs.md:95` usan acento sólido; solo
  `LanguageSwitcher.md:42` usa el gradiente.
- Un reviewer que aplique `DESIGN.md` al literal rechaza código correcto.
- **Decidir:** corregir la lista de `DESIGN.md` (el gradiente va en: barra
  bajo h1, Button primario, IconBox/ServiceCard, comilla de testimonio,
  bullet activo? y LanguageSwitcher) y verificar bullet/IconBox caso a caso.
- ✅ **Decidido (2026-09-30):** punto del Timeline y tab activo de NavTabs usan
  **acento sólido** (`--color-accent` / `--color-accent-text`). `DESIGN.md`
  separa dos listas:
  - *Gradiente* (`--gradient-accent`): barra bajo el h1, Button, íconos de
    IconBox y ServiceCard, comilla de testimonio, bullet activo del carrusel,
    idioma activo del LanguageSwitcher.
  - *Sólido*: punto del Timeline, tab activo, texto/links de acento, anillo de foco.
  Verificado: la contradicción está en `DESIGN.md:10-11`.
  ✅ **Aplicado:** `DESIGN.md` → "Acento escaso y con intención" con las dos
  listas (gradiente / sólido). Verificado que Timeline (`--color-accent`),
  NavTabs (`--color-accent-text`), LanguageSwitcher y el bullet del carrusel
  (`--gradient-accent`) ya eran consistentes con la nueva lista.

### A6. AboutPage, ResumePage y `useHashTab` no existen en la tabla de fases

- `integrator.md` (F4) construye y testea las dos páginas y el hook, pero
  `components/README.md:9-33` no tiene filas para ellos y no hay spec
  individual (`useHashTab` solo tiene una sección dentro de `NavTabs.md`).
- Nadie sabe qué agente escribe sus tests primero ni con qué criterio de
  terminado.
- **Decidir:** agregar 3 filas a la tabla (F4, `integrator`, depende de) y
  decidir si `useHashTab` merece spec propia o queda como anexo de NavTabs.
- ✅ **Decidido (2026-09-30):** spec propia para cada uno y 3 filas nuevas
  en la tabla de fases (F4, `integrator`):
  - `components/pages/AboutPage.md` y `components/pages/ResumePage.md`
    (hoy descriptas dentro de `AppLayout.md`; se mueven y se agregan
    "Tests esperados").
  - Spec de `useHashTab` (hoy anexo de `NavTabs.md`); NavTabs queda con una
    referencia. Ubicación elegida por el usuario: `components/hooks/`.
  ✅ **Aplicado:**
  - Nuevas: `components/hooks/useHashTab.md` (API, tabla de comportamiento,
    restricción de ids, 9 tests), `components/pages/AboutPage.md` y
    `components/pages/ResumePage.md` (anatomía, API, layout, estados de
    colecciones vacías, responsive, a11y, tests).
  - `components/README.md`: 3 filas F4 + quién construye cada fase + orden
    `useHashTab` → páginas → AppLayout + criterio de terminado; páginas
    agregadas a la excepción de hooks; estructura `src/pages/` y `src/lib/`.
  - `AppLayout.md` y `NavTabs.md`: secciones movidas → referencias a las specs nuevas.
  - `foundations/layout.md`: "Contenido de los paneles" marcado como resumen;
    las specs de páginas son normativas (evita una segunda fuente de verdad).
  - `agents/agent/integrator.md` y `orchestrator.md`: rutas de las specs nuevas y orden de F4.

---

## B. Puntos débiles (corregir sin gran discusión)

> **Estado 2026-09-30: B1–B9 aplicadas.** Decisiones del usuario: B1b hover =
> subrayado **y** opacidad · B3 = **tokens nuevos** · B6b = **primitiva
> HexAvatar** · B8 = bullets por posición alcanzable, solapa **flotante** en
> ≥ lg (el usuario eligió float sobre grid porque la grid exigía sacar el h1
> de las páginas), testimonios **apilados** al imprimir · B9 = **completar
> secciones**. Verificación: 0 links rotos, 0 tokens indefinidos (salvo
> `--icon-size`, custom property local intencional de Icon/BrandIcon con
> fallback), 0 residuos (`opacity: 0.6`, `outline-offset: 3/4px`,
> `stopColor`, `size="var(`, `16rem`, `z-index: -1`, `headingLevel`,
> `IntersectionObserver`, `0.90625`), todas las specs con las 8 secciones.

### Tabla de causa y solución (B)

| # | Problema | Causa raíz | Solución aplicada | Archivos |
|---|---|---|---|---|
| B1a | Redes con `opacity: 0.6` (3.12:1, fuera de la tabla) | Se copió la opacidad del tema en vez de usar un token | `--color-text-muted` sin opacidad (5.02 / 6.01:1) + fila en `contrast.md` | `Sidebar.md`, `contrast.md` |
| B1b | Hover de tabs invisible en claro | `heading` = `text` en claro | Inactivo al 80% (4.92 / 7.96:1) → hover 100% + subrayado 2px | `NavTabs.md`, `contrast.md`, `motion.md` |
| B2 | `outline-offset` 2/3/4px según spec | Sin token de foco | `--focus-ring-width` y `--focus-ring-offset` + regla en `DESIGN.md` | `tokens.css`, `DESIGN.md`, 9 specs |
| B3 | Medidas responsive literales en componentes | Regla más estricta que los tokens existentes | ~25 tokens de "medidas internas de componentes" con su escala; `breakpoints.md` reescrito (medida que varía = token; `@media` en componentes solo para layout) | `tokens.css`, `breakpoints.md`, Button, SectionTitle, Separator, CornerTab, NavTabs, ControlsBar, Sidebar, Timeline, TestimonialCard/Carousel, Box |
| B4 | Landmarks duplicados en `layout.md` | Esquema escrito antes que las specs | El esquema muestra `<ControlsBar />` / `<Sidebar />`, que ponen su propio landmark | `layout.md` |
| B5 | `theme-color` no sigue al sistema | Atado a `setTheme` | Un único efecto aplica el tema resuelto y el meta; test nuevo | `theming.md` |
| B6a | Dependencias faltantes en la tabla | Tabla armada sin cruzar specs | Sidebar + Icon; ControlsBar + LocaleProvider | `components/README.md` |
| B6b | Hexágono duplicado en Card y Dialog | Forma compartida sin dueño | Primitiva nueva `HexAvatar` (+ `HexAvatarDefs` con `clipPath` único) en F2 | `primitives/HexAvatar.md` (nueva), TestimonialCard, TestimonialDialog, AppLayout, README, orchestrator |
| B7a | Scroll-lock global vs regla dura 3 | Regla sin excepciones legítimas | Regla 3 lista el contenido exacto permitido en `global.css` | `DESIGN.md`, TestimonialDialog |
| B7b | `style={{ stopColor }}` inline | Comodidad | Stops con clases del CSS Module | `Icon.md` |
| B7c | `transparent` y `z-index: -1` literales | Casos no previstos | `transparent`/`currentColor` permitidos en regla 1; token `--z-below` | `DESIGN.md`, `tokens.css`, Button, Timeline |
| B8 | 12 ambigüedades | Decisiones delegadas implícitamente al agente | Cada una fijada en su spec (detalle abajo) | ver detalle |
| B9 | Specs sin todas las secciones | Plantilla posterior a las specs | Secciones obligatorias y explícitas en todas; hooks usan "No aplica" | `components/README.md` + 11 specs |

**Detalle B8 aplicado:** carrusel con `getScrollStops`/`getActiveStop`
(bullets por posición alcanzable, `ResizeObserver` + `scroll`, `scrollTo`);
solapa `CornerTab placement="float"` en ≥ lg y páginas en flujo de bloque;
SkillList con nombre accesible obligatorio (unión de tipos); impresión de
testimonios apilados con texto completo; `--sidebar-cta-gap` cubre 580–767;
`--font-size-contact-value`; tabla exacta de `getContactHref`; NavTabs con
`items` vacío → `null` (**cambio de un test de la spec**, aprobado con esta
decisión); máquina de estados del dialog (solo el evento `close` llama
`onClose`, cierre del padre no lo llama); `Icon`/`BrandIcon` sin prop `size`,
tamaño por `--icon-size` en CSS; offsets del Timeline con `calc()` desde tokens.

**Desvíos respecto de la tabla del plan (a revisar):**
- Icon/BrandIcon: el plan decía "prop `size` numérica opcional" y "`1em` +
  `font-size` del padre". Se aplicó una variante: **sin prop `size`** y
  tamaño por la custom property `--icon-size` que fija el padre. Motivo: con
  el tamaño por CSS, una prop numérica en atributos quedaría siempre pisada;
  `--icon-size` es el mismo mecanismo para ambos componentes.
- ServiceCard < 580: el `gap` pasó de 0.8125rem a `--space-4` (1rem) para no
  crear un token por 3px de diferencia.
- Button: el padding vertical asimétrico del tema (15/14px) quedó simétrico
  (`--button-padding-block`).
- Mocks de test: `IntersectionObserver`/`scrollIntoView` reemplazados por
  `ResizeObserver`/`scrollTo` en `foundation.md` y `AGENTS.md`.

### B1. Riesgos de contraste/accesibilidad

- **Links sociales con `opacity: 0.6`** (`components/layout/Sidebar.md:91-92`)
  sobre `surface`: par ~3.1:1 en claro que **no está en la tabla de
  `contrast.md`**. Opción: usar `--color-text-muted` (5.02:1) en vez de
  opacidad, y documentar el par.
- **Tab activo distinguido solo por color** (`components/layout/NavTabs.md:93-95`)
  — WCAG 1.4.1 usa solo *programático* (`aria-selected`), pero además: en
  claro `--color-heading == --color-text` (`tokens.css:81-82`), así que el
  hover especificado (`color: --color-heading`) es un **no-op visible** en
  claro. Especificar el hover de otro modo (opacidad, peso, subrayado) o
  notar explícitamente que heading/text convergen en claro.
- Agregar una fila "social-link inactivo" a `contrast.md` si se mantiene.
- *Verificado 2026-09-30:* `opacity: 0.6` da **3.12:1** en claro y 6.63:1 en
  oscuro. Como son íconos sin texto aplica WCAG 1.4.11 (3:1): **pasa, pero con
  margen mínimo**. No es un incumplimiento; sí falta en la tabla y es frágil
  ante cualquier cambio de color.

### B2. Foco inconsistente entre specs

El mismo anillo (`--color-focus-ring`, 2px) lleva `outline-offset` distinto
según la spec: `Button.md:57` = 3px; `ThemeToggle.md:35`, `LanguageSwitcher.md:43`,
`TestimonialCard.md:62`, `TestimonialCarousel.md:77` = 2px; `NavTabs.md:96` = 4px.
**Corregir:** un valor común (2px) salvo justificación por componente.

### B3. Literales responsive dentro de componentes (violación sistemática de `breakpoints.md:28-31`)

`breakpoints.md` dice: "un componente solo agrega @media para layout, nunca
para redefinir un tamaño que existe como token" — pero no existen tokens para
esas medidas. Casos: `Button.md:41` (padding), `Timeline.md:59`
(`padding-left: 2.5rem → 1.875rem`), `CornerTab.md:42-43` (`min-height: 2.75rem`,
`padding-inline` 1.25→2rem), `Sidebar.md:89,100`, `TestimonialCard.md:52-59`,
`ServiceCard.md:48`, `SectionTitle.md:41,44`, `NavTabs.md:92`.
**Corregir:** crear los tokens que falten (p. ej. `--button-padding-inline`,
`--corner-tab-height-sm`, `--timeline-indent`) o agregar un carve-out
explícito a `breakpoints.md` para "medidas internas de un solo componente".

### B4. Anidatura de landmarks ambigua (aside/header duplicados)

`foundations/layout.md:9-11` muestra un `<aside>` y un `<header>` **envolviendo**
a Sidebar y ControlsBar, pero `Sidebar.md:12,121` ya renderiza
`Box as="aside" aria-label={labels.region}` y ControlsBar define su propio
header. Seguir ambos produce `<aside>` anidados (dos landmarks `complementary`).
**Corregir:** aclarar en `layout.md` que el wrapper visual NO es el landmark
(div con clase, no `<aside>`/`<header>`).

### B5. `<meta name="theme-color">` desincronizado en cambios live del sistema

`foundations/theming.md:70-71` lo actualiza en `setTheme`, pero **no** en el
listener de `prefers-color-scheme` (cambio sin intervención del usuario).
**Corregir:** especificar que la actualización del meta vive en el efecto que
aplica el tema resuelto, no solo en `setTheme`.

### B6. Tabla de dependencias (`components/README.md`) incompleta

- Fila Sidebar (`:25`): falta `Icon` — el botón "Show Contacts" renderiza
  `chevron-down` (`Sidebar.md:114-116`).
- Fila ControlsBar (`:23`): usa `LocaleProvider` también (`ControlsBar.md:33-34`).
- Fila TestimonialDialog (`:31`): `TestimonialDialog.md:59` dice "mismo
  hexágono que TestimonialCard" sin declararlo como dependencia → dos
  implementaciones del clip-path van a divergir. Extraer a primitiva común o
  declarar la dependencia.

### B7. Reglas globales de CSS y sus dueños

- `TestimonialDialog.md:60` especifica el scroll-lock como regla global
  (`html:has(dialog[open]) { overflow: hidden; }`) y `foundation.md:42` la
  pone en `global.css`. Ambas consistentes entre sí, pero chocan con la regla
  dura 3 de `DESIGN.md:32-35` ("CSS global salvo reset/base"). **Corregir:**
  nombrar la excepción explícitamente en `DESIGN.md` (scroll-lock + base).
- `Icon.md:66` fija los stops del gradiente SVG con `style={{ stopColor }}`
  (estilo estático inline, regla dura 3). `stop-color` se puede设置 en el
  CSS Module: reescribir la spec o exigir el comentario de justificación.
- `Timeline.md:60` usa `border-left-color: transparent` (literal, regla dura 1
  sin token equivalente). Documentar `transparent` como excepción o definir
  `--color-transparent`… más simple: exceptuarlo en `DESIGN.md`.
- `Button.md:44` usa `z-index: -1` literal sin token `--z-*` negativo.
  Agregar `--z-below: -1` o justificarlo.

### B8. Ambigüedades que harían divergir a dos agentes

| Dónde | Qué falta |
|---|---|
| `TestimonialCarousel.md:62-64` | Detección de slide activo con IntersectionObserver ambigua en vistas 2-up (md): ¿qué slide se marca cuando dos pasan el 60%? Con 2 testimonios y 1 visible, últimos bullets pueden apuntar a scroll positions inexistentes. |
| `AppLayout.md:86-87` | "≥ lg: padding-inline-end: 16rem … el agente elige y documenta" → valor mágico sin justificación; dos builders entregan cosas distintas. Fijar un token o medida exacta. |
| `SkillList.md:11,25-31` | `label`/`labelledBy` ambos opcionales sin default: ¿queda `<ul>` sin label? El ejemplo muestra `aria-label="Skills"` que violaría "nada de texto hardcodeado". Especificar: label requerido vía props. |
| `foundations/layout.md:136-137` vs `AppLayout.md:98` | Print del carrusel: "ocultar **o** mostrar apilados" (abierto). `TestimonialCarousel.md` no tiene sección print. Decidir y escribirlo en la spec. |
| `Sidebar.md:100` | Margen de Download CV sin definir para 580–767px (solo <580, md–lg, xl). |
| `Sidebar.md:96-97` | "font-size = body − 1px" es un `calc` mágico de un token → cada agente redondea distinto. Crear `--font-size-contact-value`. |
| `Sidebar.md:73-74` | Sanitización de `getContactHref` para `phone` sin especificar (`+`, `.`); whatsapp necesita solo dígitos pero ¿y el `+`? Definir la regla exacta. |
| `NavTabs.md:133` | Comportamiento con `items` vacío no especificado (tablist sin tabs → problema axe de roving tabindex). |
| `TestimonialDialog.md:44-48` | `close`-event + `close()` controlado + `onClose()` pueden fire doble; especificar la máquina de estados (¿quién es idempotente?). |
| `BrandIcon.md:28-39` | Default `size="1.125rem"` literal en vez de `var(--size-icon)`; y "1rem en <580 lo maneja el padre con font-size" es imposible para width/height fijos de SVG — mecanismo no especificado. |
| `IconBox.md:30` / `ServiceCard.md:21` vs `Icon.md:75,89` | `size="var(--size-icon)"` como string prop vs `width/height` como atributos SVG (no aceptan `var()`). Aclarar si size aterriza en CSS o en atributos. **Verificado 2026-09-30: es un bug real** — lucide pasa `size` a los atributos `width`/`height`; el tamaño debe ir por CSS (clase del módulo) o como número. |
| `Timeline.md:58` | `padding-left: 0.90625rem` y offsets del dot (`top: 0.0625rem`, `left: -0.5px`) son números mágicos sin relación documentada con `--size-timeline-dot`; cada agente re-deriva. |
| `TestimonialDialog.md:58`, 18 specs | Secciones faltantes vs plantilla: ver B9. |

### B9. Coverage de la plantilla de spec

Solo `Box.md` y `CornerTab.md` tienen todas las secciones de la plantilla
(`components/README.md:71-84`). A gran escala faltan **Estados** y/o
**Responsive** en: `Icon`, `BrandIcon`, `Overhead`, `IconBox`, `SectionTitle`,
`Separator`, `ResumeSection`, `ThemeToggle`, `LanguageSwitcher`, `ControlsBar`,
`NavTabs`, `Sidebar`, `TestimonialCard`, `TestimonialCarousel`, `Timeline`,
`SkillList`, `ServiceCard`, `TestimonialDialog`, `AppLayout` (los estados
suelen estar "doblados" en las tablas de estilos; el template dice otra cosa).
**Opción:** completar los `Estados`/`Responsive` que falten, o ajustar la
plantilla para permitir tablas de estilos que los incluyan — pero cerrar la
laguna, porque el reviewer verifica contra esas secciones.

*Nota 2026-09-30 (specs creadas por A6):* `AboutPage.md` y `ResumePage.md`
siguen la plantilla completa. `hooks/useHashTab.md` no tiene Estilos,
Responsive ni Accesibilidad (no aplican a un hook) y usa "Comportamiento" en
lugar de "Estados": entra en la misma decisión de B9 (¿la plantilla admite
secciones "no aplica" para hooks?).

---

## C. Notas menores / hygiene

> **Estado 2026-09-30: C1–C9 resueltas.** Decisiones del usuario: C1 aplicar,
> C2 **tipo estricto y test de orden**, C7 nombre **`Badge`**, C8 y C9
> aplicar. C8 y C9 no estaban en la auditoría original: aparecieron al
> evaluar C y fueron introducidas al aplicar B.

| # | Ítem | Causa | Solución aplicada | Archivos |
|---|---|---|---|---|
| C1 | 7 tokens sin uso (`--radius-18`, `--space-5`, `--space-8` a `--space-11`, `--z-base`) | La escala se definió completa, pero varios tokens semánticos se escribieron con literales que coinciden con ella | `--gutter-top`, `--gutter-bottom`, `--box-inner-padding`, `--corner-tab-padding-inline` y `--timeline-indent` referencian `--space-*`; `--radius-18` eliminado (era de comentarios de blog, fuera de alcance); `--z-base` lo usa el Button (C8). Resultado: 0 tokens sin uso | `tokens.css` |
| C2 | `YearMonth` laxo (`"2019-99"`, `"1-23"`) | `${number}` solo valida la forma | Tipo estricto: `Year` (1900–2099) y `Month` (`01`–`12`); verificado con `tsc` (rechaza mes inválido, año corto, mes sin cero). Test de orden `start` ≤ `end` en `content.test.ts` | `data/cv.schema.ts`, `foundations/i18n.md`, `agents/agent/foundation.md` |
| C3 | `--gradient-accent-end` vía `stopColor` | — | Obsoleto desde B7b (stops por clases del CSS Module) | — |
| C4 | `motion.md`: el bullet animaba `background` | Un gradiente no se anima | Solo se anima `width` (resuelto en B8) | `motion.md` |
| C5 | Sombra de hover y chevron fuera del catálogo | Catálogo incompleto | Agregados (actualización de documentación) | `motion.md` |
| C6 | `border-radius: 0.5rem` literal en SectionTitle | Token equivalente no usado | `var(--radius-8)` (resuelto en B3) | `SectionTitle.md` |
| C7 | Spec `BadgeChip.md` vs componente `Badge` | El archivo tomó el nombre de sus usos y el componente otro | Unificado en **`Badge`**: `primitives/Badge.md`, carpeta `src/components/Badge/`, tabla de dependencias con `Badge` | `components/primitives/Badge.md` (renombrado), `components/README.md` |
| C8 *(nuevo)* | `z-index: 0` literal en Button | Introducido al aplicar B7c | `z-index: var(--z-base)` | `Button.md` |
| C9 *(nuevo)* | `opacity` del Button (hover 0.9, deshabilitado 0.5) sin fila de contraste | La regla nueva exige registrar opacidades sobre texto | Filas en `contrast.md`: hover 4.92 / 5.75:1 claro, 11.19 / 9.20:1 oscuro; deshabilitado **exento** (WCAG 1.4.3, componente inactivo) | `tokens/contrast.md`, `Button.md` |

Verificación posterior: 0 tokens sin uso, 0 links rotos, 0 residuos
(`z-index` numérico, `radius-18`, `BadgeChip`), 27 specs con las 8 secciones,
esquema + ejemplos compilan con el tipo estricto.

---

## F. Pendientes no cubiertos por la auditoría original (agregado 2026-09-30)

> **Evaluación 2026-09-30** con fuentes externas (docs oficiales de OpenCode,
> registro de npm, jsDelivr). Aplicadas primero las mecánicas (F1, F4, F5,
> F11) y luego F2, F3, F6, F7, F8 y F10 con las recomendaciones aceptadas por
> el usuario. F9 sin acción en el kit (plan B ya en la spec; dato confirmado
> en `BACKLOG.md`).

| # | Estado verificado | Causa | Propuesta | Estado |
|---|---|---|---|---|
| F1 | Regex de lint con falso positivo en `url(#accent-gradient)`. Además, ESLint solo revisa TS/TSX: en `.css` controla solo el grep del reviewer | Regex sin `\b`; lint no cubre CSS | `#[0-9a-fA-F]{3,8}\b` + nota de que CSS lo cubre el reviewer | ✅ Aplicado (`agents/agent/foundation.md`) |
| F2 | **Peor de lo previsto:** un test en rojo que importa un componente inexistente rompe `tsc` **global**; acotar comandos no alcanza | TDD en rojo + paralelismo en un solo árbol | Serializar builders (recomendado; 27 piezas) o un `git worktree` por builder | ✅ Aplicado: **de a una pieza** (`orchestrator.md`, `agents/README.md`, `AGENTS.md`) |
| F3 | Nadie commitea; no existe `.git` | Commit sin dueño | Builder: `test(<Name>)` en rojo → `feat(<Name>)`; el reviewer verifica que el test no cambió entre ambos; sin push. Encaja con serializar | ✅ Aplicado: builder/integrator/foundation commitean con `git commit -m`; `--amend`, `reset --hard` y `push` denegados; reviewer usa `git diff <commit test> HEAD -- <test>`; DoD tras el commit de implementación (`component-builder.md`, `integrator.md`, `foundation.md`, `reviewer.md`, `orchestrator.md`, `AGENTS.md`, `agents/README.md`) |
| F4 | Docs: `permission` con `edit`, `bash` (patrones, gana la última regla), `task`, `webfetch` | `tools` no restringe bash | Permisos por agente: reviewer y orchestrator `edit: deny` + bash de solo verificación/lectura; orchestrator `task` limitado a los 4 subagentes | ✅ Aplicado (5 agentes + `agents/README.md`) |
| F5 | Docs: carpeta **`.opencode/agents/`** (plural); `tools` deprecado; `mode` primary/subagent/all. **Hallazgo extra:** 2 `description` tenían `: ` sin comillas → YAML inválido (OpenCode no las habría cargado) | Formato escrito de memoria | Ruta de instalación en plural; `permission` en lugar de `tools`; descripciones entre comillas. Los 5 encabezados validados con `js-yaml` | ✅ Aplicado (`agents/README.md`, `agents/AGENTS.md`, `foundation.md`, 5 agentes) |
| F6 | `vitest-axe` sin mantenimiento: estable 0.1.0 de hace 4 años, pre-release de enero 2025; Vitest actual 5.0 | Supuesto no verificado | `axe-core` directo (4.13) con helper `expectNoA11yViolations` en `src/test/setup.ts` (recomendado) o `jest-axe` 11 | ✅ Aplicado: `axe-core` + helper en `src/test/a11y.ts` (desactiva `color-contrast` y `region` en jsdom) con su propio test; 26 specs, `components/README.md`, `DESIGN.md`, `README.md`, `AGENTS.md`, agentes, `theming.md`, `contrast.md`, `BACKLOG.md` |
| F7 | `@fontsource/poppins` 5.3 (OFL) y `simple-icons` 16.33 (CC0) OK. **`eslint-plugin-jsx-a11y` 6.10.2 (oct-2024) declara peer `eslint` hasta ^9; ESLint actual 10.11 → conflicto de instalación** | Agregadas sin verificar compatibilidad | Confirmar las dos primeras; jsx-a11y: quitarlo (recomendado: axe + reviewer cubren a11y) o fijar ESLint 9 | ✅ Aplicado: Fontsource y Simple Icons confirmadas; jsx-a11y quitada; ESLint 10 (resto del tooling de lint verificado compatible); sección "Descartadas" en `README.md` |
| F8 | No verificable externamente; la captura sugiere ~6.75rem | Estimación | Cerrar en QA visual de F5 (recomendado) o fijar 7.5rem | ✅ Aplicado: token marcado **provisional** en `tokens.css` y `Sidebar.md`; chequeo nuevo en la QA F5 de `reviewer.md` |
| F9 | **Confirmado:** LinkedIn no está en simple-icons 16.33.0 (retirado en v14); GitHub, X, Instagram, Facebook, Dribbble y Behance sí | Retiro por marca | Plan B de la spec: SVG oficial en `BrandIcon/paths.ts`. Revisar guías de marca de LinkedIn (no verificado) | ✅ Sin acción en specs; dato confirmado en `BACKLOG.md` |
| F10 | Esquema exige `alt` en avatar de testimonio; `HexAvatar` usa `alt=""` | Esquema y specs desalineados | Quitar `alt` (`avatar: { src }`) (recomendado) u opcional | ✅ Aplicado: `TestimonialAvatar = Pick<Image, "src">` en el esquema; `alt` quitado de los 6 testimonios de ejemplo; verificado con `tsc` (un `alt` en testimonio ahora no compila) |
| F11 | Docs: sin `model`, los subagentes heredan el del agente que los invoca; existe `steps` | No especificado | Sin `model`; `steps` como tope (60 / 80 / 120 / 150, ajustables) | ✅ Aplicado (4 subagentes) |
| F12 | — | — | Tokens nuevos (ver B3) | ✅ Decidido y aplicado |
| F13 | — | — | Decisiones por pregunta + defaults (ver B) | ✅ Resuelto |

Fuentes: [OpenCode — Agents](https://opencode.ai/docs/agents/),
[OpenCode — Permissions](https://opencode.ai/docs/permissions/),
[vitest-axe (npm)](https://www.npmjs.com/package/vitest-axe),
[simple-icons #11372](https://github.com/simple-icons/simple-icons/issues/11372),
registro de npm (versiones, licencias, peers) y jsDelivr (íconos de simple-icons 16.33.0).

---

## D. Verificado OK (no revisar de nuevo)

- **Cero referencias colgantes de tokens**: todo `--*` concreto citado en
  `components/**`, `foundations/**` y docs raíz existe en `tokens.css`
  (diff programático tokens definidos vs. mencionados).
- **Paridad en/es de los ejemplos**: `cv.example.en.ts` y `cv.example.es.ts`
  tienen ids, orden y counts idénticos (contact 4, social 3, services 4,
  education 2, experience 2, testimonials 3, skills 8) y los campos no
  traducibles (src, urls, fechas, network, icon, type, value) coinciden.
  "Accessibility → Accesibilidad" en skills es contenido traducible legítimo.
- **Todas las claves de labels que las specs consumen existen en el objeto
  `uiEn` de `i18n.md:64-90`** (skipToContent, nav.*, controls.*, sidebar.*,
  contact.* alineado con CONTACT_TYPES, about.*, resume.*, timeline.present,
  testimonials.*).
- Contrastes de `contrast.md` recalculados en el rango: los pares declarados
  en las tablas son coherentes con `tokens.css` (incluido el flag ⚠️ de
  `text-muted` sobre `bg` con su regla 1 y el uso correcto de `on-accent`
  oscuro sobre dorado).
- Breakpoints usados en `tokens.css` (580/768/992/1200) coinciden con
  `breakpoints.md` y con la regla dura 4.
- Las escalas de tipografía entre `typography.md`, `tokens.css` (incluidos
  los @media de escalado) y las specs están alineadas (h1–h6, name, badge,
  nav, small).

- *Agregado 2026-09-30 (tras A y B):*
  - Todas las specs (27, incluidas páginas, hook y HexAvatar) tienen las 8
    secciones de la plantilla (chequeo programático).
  - 0 links rotos entre documentos del kit.
  - Único `var(--…)` no definido en `tokens.css`: `--icon-size`, custom
    property local intencional de Icon/BrandIcon (con fallback).
  - Contrastes nuevos calculados y registrados: tabs inactivos al 80% (4.92 /
    7.96:1), íconos de redes con `text-muted` (5.02 / 6.01:1), foco con acento
    sólido (5.87 / 12.06:1).
  - `tokens.css` con llaves balanceadas y ningún token definido solo en un
    `@media` (todo token tiene valor base en `:root`).
  - Sin residuos de lo reemplazado (`opacity: 0.6`, `outline-offset: 3/4px`,
    `stopColor`, `size="var(`, `16rem`, `z-index: -1`, `headingLevel`,
    `IntersectionObserver`, `0.90625`, `-8rem`).
  - *Tras C:* 0 tokens sin uso en `tokens.css`; ningún `z-index` numérico en
    specs; `YearMonth` estricto verificado con casos negativos
    (`@ts-expect-error`).

---

## Registro de documentación (2026-09-30)

Actualización pedida por el usuario tras aplicar A y B, para que ningún
documento contradiga a las specs:

| Archivo | Cambio |
|---|---|
| `README.md` (kit) | "Qué contiene" menciona `pages/`, `hooks/` y los tokens nuevos; registro de decisiones: #10 corregida (solapa flotante) y nuevas #19–#29 |
| `foundations/typography.md` | Margen del h1 con token (`--title-decorated-gap`); el nombre del Sidebar es `<p>` (se quitó la alternativa `<h2>`) |
| `foundations/motion.md` | Catálogo: sombra de hover de TestimonialCard y rotación del chevron |
| `foundations/layout.md` | Resumen de ResumePage con `--layout-gap` |
| `tokens/contrast.md` | Regla 5 de foco con los tokens y sus contrastes |
| `tokens/breakpoints.md` | Aclaración: en un `@media` de componente solo valen tokens, `calc()` de tokens o `0` (nunca literales) |
| `components/pages/ResumePage.md` | `column-gap` pasa de `2rem` literal en `@media` a `var(--layout-gap)` fuera del `@media` |
| `components/layout/Sidebar.md` | Avatar en xl: `calc(var(--size-avatar-sidebar) * -0.71)` en vez de `-8rem` |
| `agents/AGENTS.md` | Reglas de medidas por breakpoint, foco y `z-index` |
| `agents/agent/reviewer.md` | Chequeos nuevos (z-index/outline literales, medidas en `@media`, opacidad sin fila de contraste, `size` en íconos, CSS global, 8 secciones) y QA F5 (solapa flotante en ambos idiomas, hover de tabs, bullets por viewport, foco, impresión) |
| `agents/agent/component-builder.md` | Montar `AccentGradientDefs`/`HexAvatarDefs` en tests; tokens faltantes se piden al orchestrator; autorrevisión con las reglas nuevas |

Los últimos dos cambios de specs (ResumePage y Sidebar) surgieron al
revisar la documentación: la regla aclarada de `breakpoints.md` los habría
hecho rechazar por el reviewer. Diferencia visual en ResumePage: separación
entre columnas de 32px a 30px.

### Segundo pase (2026-09-30, tras cerrar C y F)

| Archivo | Cambio |
|---|---|
| `README.md` (kit) | Registro de decisiones #30–#38 (fechas, Badge, construcción serial, commits, axe-core, ESLint 10, avatar de testimonios sin `alt`, formato de agentes OpenCode, avatar provisional); dependencias: `axe-core` en lugar de `vitest-axe`, sin jsx-a11y, sección "Descartadas" |
| `components/README.md` | Construcción de a una pieza, dos commits por pieza, criterio de terminado tras `feat(<Name>)`; ejemplo del caso de accesibilidad con `expectNoA11yViolations` |
| `components/content/TestimonialDialog.md` | Ruta de setup corregida (`src/test/setup.ts`) |
| `agents/agent/orchestrator.md` | El encargo incluye los dos commits como parte del criterio de terminado |
| `agents/agent/component-builder.md` | La entrega reporta los hashes de los commits |
| `agents/agent/reviewer.md` | El informe incluye una línea de commits y si el test cambió desde su commit |

Barrido final por términos obsoletos (`vitest-axe`, `setupTests`,
`IntersectionObserver`, `scrollIntoView`, "en paralelo", `tools:`,
`.opencode/agent/`, `BadgeChip`, `headingLevel`, `jsx-a11y`): solo quedan las
menciones que explican por qué se descartaron.

---

## H. Reestructura a proyecto único (2026-10-01)

**Pedido del usuario:** la ruta `cv-agentic/packages/cv-design-kit` era
redundante y larga; dejar todo en `/cv-agentic`.

**Decisiones (consultadas antes de modificar):**

| Tema | Decisión |
|---|---|
| Estructura | Proyecto único en la raíz: kit y app juntos, un solo `package.json`, sin workspaces ni paquete `@cv/design-kit` (reemplaza la decisión #18) |
| Specs | `components/` → **`specs/`** (no confundir con `src/components/`) |
| Agentes | Directo a **`.opencode/agents/`** y `AGENTS.md` en la raíz; sin plantillas ni paso de instalación en F1 |
| Imports | Tipos con alias **`@data/*` → `data/*`**; tokens con una importación relativa en `src/main.tsx` (`../tokens/tokens.css`) |
| `package.json` del kit | **Eliminado**; el único `package.json` lo crea foundation en F1 |

**Movimientos:** `DESIGN.md`, `README.md`, `BACKLOG.md`, `tokens/`,
`foundations/`, `data/` → raíz; `components/` → `specs/`;
`agents/AGENTS.md` → `AGENTS.md`; `agents/agent/*.md` → `.opencode/agents/`;
`agents/README.md` → `.opencode/README.md` (fuera de `agents/`, porque OpenCode
trataría cualquier `.md` de esa carpeta como un agente). Eliminados:
`package.json` del kit, `.DS_Store` y la carpeta `packages/`.

**Referencias actualizadas:** 84 reemplazos mecánicos de rutas en 27 archivos,
más reescrituras manuales en `README.md` (título, estructura, cómo usa la app
el kit, decisiones #18 reemplazada y nuevas #39–#42), `AGENTS.md` (estructura,
fuente de verdad, comandos, límites), `.opencode/README.md` (sin
instalación), `foundation.md` (app en la raíz, alias `@data`, sin instalación
de agentes), `orchestrator.md`, `reviewer.md` (rutas de los grep),
`tokens/tokens.css` y `data/cv.schema.ts` (encabezados).

**Riesgo nuevo cubierto:** con el kit en la raíz, `npm create vite` sobre la
carpeta ofrecería borrar lo existente. `foundation.md` lo prohíbe y su permiso
automático se quitó (si lo intenta, cae en `ask`).

**Pendiente que afecta:** el plan aprobado de pasar el contenido a JSON
(se registrará como sección G al aplicarlo) se aplica con las rutas nuevas: esquema y ejemplos en `data/`,
contenido real en `src/content/`, validador importable vía `@data`.

---

## I. Documentación en `docs/` (2026-10-01)

**Pedido del usuario:** actualizar con el estado actual y mover la
documentación a una carpeta `docs/`.

**Decisiones (consultadas antes de modificar):** solo los documentos sueltos
y los documentos de tokens pasan a `docs/`; `specs/` y `foundations/` quedan
en la raíz; README corto en la raíz + README completo en `docs/`; la
documentación de agentes a `docs/agents.md`; `tokens/tokens.css` queda en la
raíz y sus documentos van a `docs/tokens/`.

| Antes | Ahora |
|---|---|
| `README.md` | `docs/README.md` (completo) + `README.md` nuevo y corto en la raíz, con el estado actual |
| `DESIGN.md`, `BACKLOG.md`, `diagnostics.md` | `docs/` |
| `.opencode/README.md` | `docs/agents.md` |
| `tokens/breakpoints.md`, `tokens/contrast.md` | `docs/tokens/` |

Se quedan en la raíz: `AGENTS.md` (OpenCode lo lee desde ahí),
`tokens/tokens.css` y `data/` (código que importa la app), `specs/`,
`foundations/`, `.opencode/agents/`.

**Referencias actualizadas:** 13 links Markdown recalculados según la nueva
ubicación de cada archivo; 52 menciones de rutas en texto (agentes, specs,
foundations, `AGENTS.md`, `tokens.css`, esquema); reescritura manual de las
estructuras de carpetas en `docs/README.md` y `AGENTS.md`, de las menciones
al README del kit (ahora `docs/README.md`) y de los límites de "no modificar
el kit". Decisión #43 agregada al registro. El historial de este archivo
(secciones A–H) conserva las rutas de su momento.

---

## G. Contenido del CV en JSON (aplicado 2026-10-01)

Plan aprobado en la auditoría de SDD/skills/JSON; aplicado como parte del
crítico 4 de la sección J.

| Decisión | Aplicación |
|---|---|
| El usuario edita JSON en su editor | `src/content/cv.{en,es}.json` con `"$schema"` → autocompletado, ayuda por campo y errores en vivo |
| Solo el contenido del CV | Textos de interfaz (`ui.*.ts`), tokens y config del sitio no cambian |
| Un archivo por idioma | Paridad en/es en `content.test.ts` |
| Fuente de verdad `data/cv.schema.json` | Nuevo (draft-07, `additionalProperties: false`, enums, `pattern` de fechas/URLs/ids, `description` en cada campo). Reemplaza `data/cv.schema.ts` (eliminado) |
| Tipos generados | `data/cv.types.generated.ts` (script `gen:types`, F1). Specs importan `@data/cv.types.generated` |
| Listas cerradas | `enum` en el esquema + `data/constants.ts` para recorrer en código; `src/content/schema.test.ts` verifica que coincidan |
| Validador precompilado | `data/validate-cv.generated.js` + `.d.ts` (ajv standalone, F1); `prebuild` y tests fallan con JSON inválido |
| Contenido inicial | `data/cv.example.{en,es}.json` (generados desde los `.ts` anteriores, que se eliminaron) |

**Verificado (ajv sobre los archivos reales):** los dos ejemplos son
válidos; 10/10 casos inválidos rechazados (mes 99, año corto, mes sin cero,
red desconocida, campo extra, `alt` en avatar de testimonio, `locale` "fr",
URL sin https, id con mayúsculas, falta `skills`); paridad de ids en/es OK;
`data/constants.ts` coincide con los 4 `enum`.

Reemplaza la decisión #16 y ajusta la #30 (registro: `docs/README.md`
#44). La validación estricta de fechas pasa del tipo TS al `pattern` del
esquema.

---

## J. Auditoría de arquitectura React (2026-10-01)

Revisión completa del proyecto con mirada de arquitecto React (solo
lectura). 24 hallazgos: 6 críticos, 6 altos, 12 medios.

### Críticos — ✅ corregidos (2026-10-01)

| # | Hallazgo | Corrección | Decisión del usuario |
|---|---|---|---|
| 1 | TypeScript sin versión; `latest` (7.0.2) incompatible con `typescript-eslint` (<6.1) | TypeScript **`~6.0`** en la tabla de dependencias y en foundation | ~6.0 |
| 2 | Faltaba `@testing-library/dom` (peer obligatorio de RTL 16) | Agregado. Al armar la tabla aparecieron también `@types/react`, `@types/react-dom` y `@types/node`, que TypeScript necesita y nunca estuvieron aprobados | — |
| 3 | Sin política de versiones ni de Node | Node **24 LTS** (`.nvmrc`, `engines` `^22.12.0 \|\| >=24`); `^` dentro de la mayor + lockfile commiteado; tabla con rango por paquete en `docs/README.md` | Node 24, mayor fija + lockfile |
| 4 | Contenido `.ts` (decisión #16) vs. plan JSON aprobado sin aplicar | Plan aplicado (sección G) | Aplicar ahora |
| 5 | `formatPeriod` sin dueño viable | Lo crea foundation en F1 en `src/i18n/formatPeriod.ts`; Timeline y integrator actualizados | Foundation |
| 6 | Limpieza de RTL con `globals: false` | `setup.ts` importa `@testing-library/jest-dom/vitest` y registra `afterEach(cleanup)` | — |

Archivos tocados: `data/` (esquema, ejemplos, constantes; eliminados
`cv.schema.ts` y `cv.example.*.ts`), `docs/README.md` (tabla de entorno y
dependencias, contenido, decisiones #16/#30 y nuevas #44–#48),
`docs/DESIGN.md` (regla 6), `foundations/i18n.md` (sección de contenido,
ubicación de `formatPeriod`, tests), `AGENTS.md` (Node, estructura, scripts,
excepción de `data/*.generated.*`, regla "contenido solo en JSON"),
`foundation.md` (package.json, scripts de datos, TS 6, Vitest, i18n,
contenido), `integrator.md`, 9 specs (imports de tipos), `Icon.md`,
`LanguageSwitcher.md`, `BrandIcon.md`, `Timeline.md`, `docs/BACKLOG.md`,
`README.md` (estado).

### Altos — ✅ corregidos (2026-10-01)

| # | Hallazgo | Corrección | Decisión del usuario |
|---|---|---|---|
| 7 | Sidebar sticky (`top: 30px`) cortaba el avatar que sobresale ~128px | `top: calc(var(--size-avatar-sidebar) * 0.71 + var(--space-7))` (≈ 158px) en `foundations/layout.md` | Ajustar el `top` |
| 8 | Orden de fechas: `start "2017-06"` / `end "2017"` fallaba | `start` → `YYYY-01`, `end` → `YYYY-12`, con 3 casos de test en `foundations/i18n.md` | — |
| 9 | Gradiente de íconos en `objectBoundingBox` | `gradientUnits="userSpaceOnUse"` con `x1=0.62 y1=-0.56 x2=23.38 y2=24.56` (137.84°) y `offset` 0.2631 / 0.9375 (`Icon.md`); SVG de definiciones nunca con `display: none` (`Icon.md`, `HexAvatar.md`) | — |
| 10 | `--icon-size` se heredaba | `@property --icon-size { syntax: "*"; inherits: false; }` en `tokens.css`; el padre fija la variable en la `className` del propio ícono (`Icon.md`, `BrandIcon.md`, `ServiceCard.md`, `TestimonialCard.md`, `reviewer.md`) | Clase en el ícono + sin herencia |
| 11 | Impresión en oscuro sin mecanismo | Bloque `@media print` al final de `tokens.css` (paleta clara, sin sombras, 25 declaraciones); `layout.md`, regla 1 de `DESIGN.md` y `reviewer.md` actualizados (los componentes ya no usan `--palette-*` ni en print) | — |
| 12 | SectionTitle con margen propio | Excepción documentada en `specs/README.md` (junto a Separator) y en `SectionTitle.md` | Excepción documentada |

Verificado: `tokens.css` parsea con postcss (`@property`, 4 breakpoints,
movimiento reducido, `@media print`); 0 links rotos; sin residuos de los
valores reemplazados. Decisiones #49–#54 en `docs/README.md`.

**Observación posterior — ✅ resuelta (2026-10-01):** con el `top` del alto 7,
un Sidebar fijo más alto que el viewport dejaba el botón Download CV fuera de
vista en pantallas bajas. **Decisión del usuario:** activar el sticky solo
con suficiente alto. Estimación con las medidas del kit: Sidebar ≈ 665px +
`top` ≈ 158px ≈ 823px → umbral **`(min-height: 900px)`** (margen para
contenido variable; cada contacto extra ≈ 72px). Aplicado en
`foundations/layout.md` (CSS y explicación), `docs/tokens/breakpoints.md`
(excepción única de altura), `AppLayout.md`, `Sidebar.md`, chequeo en la QA
de `reviewer.md` (1440×1000 fijo; 1440×800 no fijo) y decisión #66.

### Medios — ✅ corregidos (2026-10-01)

| # | Hallazgo | Corrección | Decisión del usuario |
|---|---|---|---|
| 13 | `tabs` de AppLayout sin definir | `TAB_IDS = ["about", "resume"]` + `tabs` con labels de `t.nav` en `AppLayout.md` | — |
| 14 | Labels del Sidebar sin mapeo | `sidebarLabels` explícito (`t.sidebar.*`, `t.contact`) en `AppLayout.md`; las 29 claves de UI quedan usadas | — |
| 15 | Nadie mantenía los documentos de estado | Orchestrator con `edit` solo para `README.md` y `docs/diagnostics.md` (OpenCode admite permisos `edit` por ruta, verificado en su documentación) y sección "Documentos de estado" en su prompt; `AGENTS.md` y `docs/agents.md` actualizados | Orchestrator, solo esos 2 |
| 16 | Assets inexistentes | Ejemplos apuntan a `/images/avatar.svg` y `/images/testimonials/*.svg`; foundation crea esos placeholders en `public/images/`; `downloadCvUrl` quitado de los ejemplos (no hay PDF); `public/` en las estructuras; excepción en la regla 1 | Placeholders en `public/` |
| 17 | Skip link cambiaba el hash | `onClick` con `preventDefault` + foco al tabpanel (`AppLayout.md`, test 8) | Foco por JS |
| 18 | `theme-color` inicial desincronizado | El script anti-flash fija el meta (`theming.md`); excepción a la regla 1 con test que compara con `tokens.css` | — |
| 19 | NavTabs vacío vs. tabpanel | Invariante documentada: AppLayout siempre pasa los 2 tabs | — |
| 20 | Nombre de TestimonialCard con márgenes negativos | Encabezado en grilla `auto 1fr` | — |
| 21 | HexAvatar con borde no uniforme | Dos `clipPath` (`hex-avatar-outer`, `hex-avatar-inner`); Safari en QA; tests de AppLayout y HexAvatar actualizados | Dos clipPaths |
| 22 | Topología de tsconfig | Un solo `tsconfig.json`, `tsc --noEmit` (sin `-b`), `types` explícito (`foundation.md`, `AGENTS.md`) | Un tsconfig |
| 23 | Campos no traducibles inconsistentes | Lista canónica en `foundations/i18n.md`; `ContactType` marcado "No traducible" en el esquema | — |
| 24 | Ambos idiomas en el bundle | Documentado como aceptado; `import()` dinámico en `docs/BACKLOG.md` | — |

Decisiones #55–#65 en `docs/README.md`. Los ejemplos JSON siguen validando
contra el esquema tras los cambios (ajv).

---

## K. Constitución del proyecto (2026-10-02)

**Pedido del usuario:** redactar `docs/constitution.md` (máx. 50 líneas) con
principios no negociables y verificables sobre: simplicidad del stack, spec
vs. código, separación de responsabilidades, tests, protección de datos e
idioma. Público: alguien que recién empieza con agentes y SDD.

**Proceso:** lectura de los 52 archivos del proyecto (sin código de app
todavía) → borrador presentado → aprobación del usuario → guardado.

**Decisiones del usuario:**

| Tema | Decisión |
|---|---|
| Idioma | Español. Interpretado según lo que el proyecto ya hace: documentación y comentarios en español (L1); código en inglés: identificadores, archivos, nombres de tests y commits (L2); contenido visible en en/es (L3) |
| Lógica pura (C1) | Opción b: compartida en `src/lib/`, `src/i18n/` o `src/content/`; si la usa un solo componente, puede vivir en su carpeta, exportada y con test. `getContactHref` (Sidebar) y `getScrollStops`/`getActiveStop` (carrusel) cumplen sin cambiar specs |
| Precedencia | La constitución está por encima de todo otro documento, incluido `AGENTS.md` |

**Resultado:** `docs/constitution.md`, 46 líneas, 28 reglas con ID y forma de
verificación: S1–S5 (stack), P1–P5 (spec antes que código), C1–C4
(separación), T1–T5 (tests), D1–D6 (protección de datos), L1–L3 (idioma).
Todas salen de decisiones ya tomadas; no se agregaron reglas nuevas sin
decisión (p. ej. no hay umbral de cobertura).

**Integración:** `AGENTS.md` (la constitución encabeza la fuente de verdad y
el orden de lectura); los 5 agentes la leen primero; el orchestrator no
delega encargos que la rompan; el reviewer tiene un punto **0. Constitución**
con chequeos concretos por regla (bloqueantes) y una línea S/P/C/T/D/L en su
informe; `docs/README.md` (contenido, orden de lectura, decisión #67);
`README.md` (por dónde empezar, estado, estructura).

---

## L. Modelo único de spec (2026-10-02)

**Pedido del usuario:** cerrar el hallazgo **B1** de la auditoría (plantilla
de la skill `sdd` desalineada con el kit) pasando a un modelo único de spec:
`specs/<categoria>/<Name>/{spec,plan,tasks}.md`.

**Decisiones del usuario** (todas opcion "Recomendada"):

| Tema | Decisión |
|---|---|
| Plantilla | Híbrida: las 10 secciones del kit + `Estado:` + `## Requisitos (EARS)` entre `Propósito` y la sección siguiente |
| `Estado` | `aprobada` en las 27 specs |
| Alcance | Solo `spec.md` ahora; `plan.md`/`tasks.md` los redacta el orchestrator en su puerta |
| Comandos `/sdd-*` | Solo ruta y `node --test` → `npm test`; `agent: plan\|build`, Chrome DevTools y `constitution.md` quedan para un pase aparte |
| Sin `## No hacer` | 9 specs (ResumeSection, ServiceCard, TestimonialDialog, ControlsBar, LanguageSwitcher, ThemeToggle, AppLayout, Overhead, Separator): **fuera de este pase** (decisión B2) |
| P1 (gate) | Aprobación explícita: verificación de `specs/**/<Name>.md` → `specs/**/<Name>/spec.md` + decisión #68 |

**Proceso:** baseline git (`475534a`) → plantilla de la skill y de
`specs/README.md` (`3820e93`) → migración de las 27 specs con `git mv`,
`Estado`, headings y los `RF-n` (`8f81d9d`) → checkpoint de aprobación de los
27 listados → gate de la constitución (`d247c5a`) → referencias rotas en todo
el kit (`d5fab8d`) → comandos (`9dad7f4`). Commits con `-c user.name="jmiban"`
(porque git config está prohibido por `AGENTS.md`); el primero quedó con el
email de autor vacío y no se corrigió por la regla de no usar `--amend`.

**Reglas de redacción EARS:** 3–8 `RF-n` por pieza, derivados solo de
`Propósito`, `Estados`, `Responsive`, `Accesibilidad` y `Tests esperados`;
nunca se inventó alcance y **no se agregó ningún test** (los RF de
Responsive/Impresión no tienen contrapartida en "Tests esperados": ~12 casos
listados en el checkpoint, aprobados tal cual).

**Verificación (9 checks, todos OK):** 27 specs en carpeta · 0 archivos
planos · `Estado: aprobada` ×27 · `Requisitos (EARS)` justo tras `Propósito`
con 5–8 RF · sin `node --test` · sin referencias viejas `<cat>/<Name>.md` · 0
links relativos rotos · P1 + decisión #68 · plantilla (`specs/README.md`,
`SKILL.md`, `docs/README.md`, reviewer, component-builder) con "10 secciones"
y la ruta nueva.

**Pendientes tras este pase:** sección `## No hacer` en 9 specs (B2); hallazgos
2–4 de la auditoría (`agent: plan\|build` y `/constitution` en inglés,
`npm run`/permisos en reviewer e integrator, `docs/agents.md:30`); memoria del
proyecto rota (en la raíz no existe `memory.md` y `docs/memory.md` contiene
material de otro proyecto).


1. ~~Decidir y aplicar **A1–A6**~~ ✅ decididas y aplicadas el 2026-09-30.
1b. ~~Sección F~~ ✅ 2026-09-30: todas decididas y aplicadas (F8 se cierra
   en la QA visual de F5).
2. ~~Aplicar **B1–B9**~~ ✅ aplicadas el 2026-09-30 (ver tabla de B).
   Texto original del paso: aplicar **B1–B7** como pasadas mecánicas de edición de specs +
   `contrast.md` + `components/README.md` + `DESIGN.md` (excepciones a reglas
   duras: transparent, scroll-lock global, z-below, stopColor SVG).
3. ~~Resolver **B8**~~ ✅ aplicado el 2026-09-30.
4. ~~**B9**~~ ✅ aplicado el 2026-09-30 (secciones completas y obligatorias).
5. ~~**C**~~ ✅ C1–C9 aplicadas el 2026-09-30.
5b. Revisar los **desvíos** listados al final de la tabla de B (tamaño de
   íconos, gap de ServiceCard, padding del Button, mocks de test) y el cambio
   de separación de columnas de ResumePage (32px → 30px). Aceptarlos
   tácitamente al kickoff también es opción (etapa 0 del plan de kickoff).
5c. ~~Actualizar documentación~~ ✅ 2026-09-30 (ver "Registro de documentación").
6. **Siguiente paso:** kickoff de F1 (foundation) con el orchestrator,
   siguiendo la sección "Verificación independiente y plan de kickoff"
   (etapas 0→3). `.git` y el `package.json` raíz todavía no existen: los
   crea foundation (tiene `git init` permitido).

---

## M. Unidad de trabajo por tarea y memoria única (2026-10-02)

**Origen:** auditoría de salud del sistema agéntico (2026-10-02). La migración
al modelo "por tarea" (skill `sdd`, orchestrator, specs con `plan.md`/`tasks.md`)
no se había propagado: la constitución (P2, P4), `AGENTS.md`, component-builder,
integrator y el control del reviewer seguían en "dos commits por pieza", y la
memoria tenía tres nombres (`MEMORY.md`, `memory.md`, `docs/memory.md`) con el
orchestrator sin permiso sobre la real.

**Decisiones del usuario:** (1) unidad de trabajo **por tarea**; el
**orchestrator marca** las tareas en `tasks.md`; (2) memoria en
**`docs/memory.md`**.

| Archivo | Cambio |
|---|---|
| `docs/constitution.md` | P2: ningún agente edita `spec.md`; solo el orchestrator escribe `plan.md`/`tasks.md` y marca tareas. P4: commits por tarea. T2: control nuevo (`feat`/`fix` no tocan tests; `test` solo agrega). Sigue en 46 líneas |
| `.opencode/skills/sdd/SKILL.md` | Memoria en `docs/memory.md`; quien implementa no marca la tarea; regla de tests que no se debilitan por tarea |
| `orchestrator.md` | Permiso y referencias a `docs/memory.md`; el encargo no incluye `tasks.md`; da los mensajes de commit exactos; paso 3b: marca la tarea tras el OK del reviewer |
| `component-builder.md`, `integrator.md` | Una tarea Tn por encargo; commits `test(<Name>): Tn` → `feat(<Name>): Tn`; no tocan tests de tareas anteriores; no marcan tareas; `edit` denegado en `specs/**` y `docs/memory.md`; skill `sdd` permitida |
| `reviewer.md` | Dos tipos de revisión (tarea / pieza completa); control de tests por `git log -p`; informe con Tn y "Hecho cuando" |
| `AGENTS.md` | Memoria en `docs/memory.md`, solo la actualiza el orchestrator; unidad por tarea; `specs/` es del usuario y del orchestrator; control de tests |
| `specs/README.md`, `docs/agents.md` | Unidad por tarea, commits por tarea, tabla de permisos actualizada |
| Comandos | `sdd-spec`/`sdd-status` leen `docs/memory.md`; `sdd-implement` ya no marca la tarea |
| `docs/memory.md` | Título y dueño únicos; decisión #69 y pendientes actualizados |
| `docs/README.md` | Decisiones #69 y #70; #33 marcada como reemplazada |

**Siguen pendientes** (decisiones 3–6 de la auditoría): comandos `/sdd-*`
(agentes `plan`/`build`, `/constitution`, MCP), `npm run validate:content` en
reviewer/integrator, `edit` por ruta en foundation, fricción de puertas,
`## No hacer` en 9 specs, `opencode.json` y QA visual.

---

## N. Comandos `/sdd-*` integrados (2026-10-02)

**Origen:** decisión 3 de la auditoría de salud. Los 8 comandos usaban los
agentes nativos `plan`/`build` (sin los permisos ni los controles del
proyecto), argumentos `NNN-nombre` y textos de otro dominio.

| Archivo | Cambio |
|---|---|
| `sdd-status`, `sdd-spec`, `sdd-change`, `sdd-plan`, `sdd-task`, `sdd-implement` | `agent: orchestrator`. Argumento `<categoria>/<Name>`; `$ARGUMENTS` descripto como "lo que sigue a `$1`"; "nada de stack" solo para specs de dominio nuevas; "hoy" solo si la lógica depende de la fecha; `sdd-implement` delega una Tn (test → feat), pide revisión, marca la tarea y para |
| `sdd-clarify`, `sdd-validate` | `agent: reviewer` (solo lectura, contexto limpio). `sdd-validate`: revisión completa de la pieza con `npm test` + MCP Chrome DevTools; sin servidor o sin MCP, lo reporta |
| `opencode.json` | Verificado: MCP local `chrome-devtools` con el formato de la documentación de OpenCode; `chrome-devtools-mcp` 1.10.1 es compatible con Node 24. Agregado `"permission": {"chrome-devtools_*": "deny"}` |
| `reviewer.md` | `"chrome-devtools_*": allow`: único agente con el MCP. Verificado con `opencode debug agent` (reviewer → allow; orchestrator, subagentes y `build` → deny) y `opencode debug config` (8 comandos con su agente) |
| `docs/agents.md` | Nueva sección "Comandos `/sdd-*`" (tabla comando → agente, MCP, `/constitution`) |
| `AGENTS.md`, `README.md` | Estructura con `skills/`, `commands/` y `opencode.json` |
| `docs/README.md`, `docs/memory.md` | Decisión #71; pendientes actualizados |

`commands/constitution.md` queda sin cambios (decisión del usuario).

**Siguen pendientes:** `npm run validate:content` en reviewer/integrator,
`edit` por ruta en foundation, fricción de puertas, `## No hacer` en 9 specs y
QA visual.

---

## O. Permisos: `validate:content` y kit protegido (2026-10-02)

**Origen:** decisión 4 de la auditoría de salud. El reviewer y el integrator
tenían que correr `npm run validate:content` pero su bash lo denegaba; la
regla "no tocar el kit" dependía solo del prompt (foundation tenía `edit: allow`).

| Archivo | Cambio |
|---|---|
| `reviewer.md`, `integrator.md` | `"npm run validate:content*": allow` |
| `foundation.md`, `component-builder.md`, `integrator.md` | `edit`: `"*": allow` y `deny` en `README.md`, `AGENTS.md`, `opencode.json`, `docs/**`, `tokens/**`, `foundations/**`, `specs/**`, `data/**`, `.opencode/**` |
| `docs/agents.md` | Tabla de permisos y párrafo "El kit" |
| `docs/README.md`, `docs/memory.md` | Decisión #72; pendientes actualizados |

**Verificación:** `opencode debug agent` (última regla que coincide): `src/**`,
`package.json` y `.gitignore` → allow; kit, `docs/memory.md`,
`data/*.generated.*` y `specs/**/tasks.md` → deny en los tres agentes;
`validate:content` → allow en reviewer e integrator, deny en component-builder.

**Límite conocido:** `edit` no cubre bash (`cp *`, `npm run *` en foundation);
lo cubren la regla del prompt y la revisión. El `npm run build` del reviewer
regenera `data/*.generated.*` y `dist/` (deberían quedar idénticos; `git status`
lo muestra).

**Siguen pendientes:** fricción de puertas (decisión 5), `## No hacer` en 9
specs y QA visual (decisión 6).

---

## P. Edición por grupo en los subagentes (2026-10-02)

**Origen:** análisis de la decisión 5 (fricción de puertas). Limitar `edit`
por ruta **no reduce** las ~110 puertas SDD (4 por pieza × 27 + 5 de fase),
que son reglas de la skill y del orchestrator; sí convierte en permiso la
regla de cada agente sobre dónde escribe. El usuario eligió aplicarlo por
grupo (decisión #73).

| Agente | `edit` permitido (resto: deny) |
|---|---|
| foundation | `src/**`, `public/**`, `index.html`, `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `.nvmrc`, `.gitignore` |
| component-builder | `src/components/**` |
| integrator | `src/content/**`, `src/pages/**`, `src/lib/**`, `src/components/AppLayout/**`, `src/styles/**`, `src/i18n/**`, `src/App.tsx`, `src/main.tsx` |

**Verificación:** `opencode debug agent` sobre 22 rutas: cada agente permite
solo las de su grupo; kit, `data/*.generated.*`, `specs/**`, `opencode.json` y
`.vscode/` → deny en los tres; `src/test/**` → solo foundation.

**Límites:** por grupo, no por pieza (component-builder puede escribir en
cualquier componente, incluido `AppLayout`); `edit` no cubre bash. Si un plan
pide un archivo fuera del grupo (mock en `src/test/`, config), hay que decidir
quién lo escribe. Opción futura: plugin `tool.execute.before` (disponible en
`@opencode-ai/plugin`) para limitar a la carpeta de la tarea activa.

**Sigue abierta la decisión 5** (reducir puertas): opciones 1–4 en
`docs/memory.md`.

---

## Q. Puerta de Plan + Tareas por fase (2026-10-02)

**Origen:** decisión 5 (fricción de puertas). El usuario descartó juntar Plan
y Tareas por pieza y eligió aprobarlos **por fase** (decisión #74).

**Flujo por fase (F2–F5):** Clarificación de cada pieza → `plan.md` +
`tasks.md` de todas las piezas → **una puerta** → implementación pieza por
pieza (puerta de Implementación + Validación por pieza) → puerta F.

| Puertas | Antes | Ahora |
|---|---|---|
| Clarificación | 27 | 27 |
| Plan | 27 | — |
| Tareas | 27 | — |
| Plan + Tareas por fase | — | 4 (F2, F3, F4, F5) |
| Implementación + Validación | 27 | 27 |
| Fases F1–F5 | 5 | 5 |
| **Total** | **~113** | **~63** |

| Archivo | Cambio |
|---|---|
| `.opencode/skills/sdd/SKILL.md` | Segunda excepción en Flujo; bullet "Puerta de Plan + Tareas por fase" en "Ejecución con agentes" |
| `orchestrator.md` | "Dos niveles" con la excepción; fila única "Plan + Tareas" (una puerta por fase); formato de esa puerta en "Al llegar a una puerta" |
| `sdd-plan.md` | Acepta una fase (`F2`) → plan + tareas de todas sus piezas; o una pieza suelta → solo plan |
| `sdd-task.md` | Solo para pieza suelta o Cambio |
| `specs/README.md`, `docs/agents.md` | Estructura de carpeta, tabla de comandos y diagrama de flujo |
| `docs/README.md`, `docs/memory.md`, `README.md` | Decisión #74, pendientes y estado |

**Riesgos:** revisar 11–12 planes juntos es más material por puerta (se
mitiga con la tabla por pieza y devolviendo solo las piezas a corregir); un
plan redactado antes de implementar sus dependencias puede quedar desfasado:
se corrige como Cambio de esa pieza. La constitución no cambia (P2:
`plan.md`/`tasks.md` aprobados por el usuario).

**Siguen abiertas** (decisión 5): opción 1 (`ask` doble al editar `spec.md`)
y opción 2 (Clarificación sin puerta si no hay hallazgos).


## R. Auditoría de arquitectura de agentes, skills y comandos (2026-10-02)

**Pedido:** revisar (solo lectura) agentes, skills, comandos y documentación
del flujo SDD, y cerrar los 6 hallazgos medios que eligiera el usuario.

**Verificado (todo OK):** `opencode debug agent` × 5 (permisos resueltos =
tabla de `docs/agents.md`), `opencode debug config` (9 comandos con su agente
durante la auditoría y **8** tras eliminar `/constitution`, 5 agentes,
`chrome-devtools_*` denegado en global), skill `sdd` registrada, 0 links rotos
en los 59 `.md` trackeados (58 tras eliminar `/constitution`), 27 specs con
`Estado: aprobada` y EARS tras `Propósito`, RF 5–8 correlativos, decisiones
#1–#74 correlativas y 14 commits `docs`/`chore` (13 al auditar). `lint/typecheck/test/build`
no aplican todavía (F1 pendiente).

**Corregido en la sesión (decisiones #75–#80, detalle en `docs/README.md`):**

| # | Punto | Dónde quedó |
|---|---|---|
| 75 | P2: `spec.md` solo con aprobación explícita (`ask` del orchestrator) | `docs/constitution.md` P2 |
| 76 | Dueño del commit de documentos: el orchestrator, con `git add` acotado y en verde | `.opencode/agents/orchestrator.md`, `docs/agents.md`, `AGENTS.md` |
| 77 | Plan de kickoff sin skills TDD/incremental/frontend citadas (van en los prompts) | `docs/diagnostics.md` etapa 2 |
| 78 | Clave `skill` en los 5 agentes y documentada | `foundation.md`, `reviewer.md`, `docs/agents.md` |
| 79 | `/constitution` eliminado con sus referencias | `.opencode/commands/`, `AGENTS.md`, `docs/agents.md`, `docs/memory.md` |
| 80 | DoD: `build` por pieza, no por tarea | `AGENTS.md`, `reviewer.md`, `integrator.md` |

**Quedaron sin decisión** (menores, para más adelante): 9 specs sin
`## No hacer` (B2), fila F1 del `orchestrator.md` con texto de monorepo
superado, `docs/AGENTS.md` resuelto case-insensitively como instrucciones de
directorio, y la fricción abierta de la decisión 5 (opciones 1 y 2).


## S. Re-auditoría y corrección de hallazgos medios (2026-10-02)

Segunda pasada read-only (misma fecha que R): sin bloqueantes; 4 hallazgos
medios elegidos por el usuario, corregidos con decisiones #81 y #82.

| # | Hallazgo | Corrección |
|---|---|---|
| 1 | Fila F1 de `orchestrator.md` decía "Monorepo" y "agentes instalados" (contradice S2/#39 y #41; conocido desde R) | F1 = app en la raíz, proyecto único; agentes ya en `.opencode/agents/` |
| 2 | T5 de la constitución exigía `build` en "Terminado", lectura literal en conflicto con #80 (DoD por tarea) | T5 reescrita: `lint`/`typecheck`/`test` por tarea; `build` por pieza/puerta (#81) |
| 3 | `docs/memory.md` y la sección L citaban una prohibición de modificar `git config` "por `AGENTS.md`" que ya no estaba en `AGENTS.md` | Regla restablecida en `AGENTS.md` → "Convenciones" (los textos históricos quedan intactos) (#82c) |
| 4 | Fila F4 de `orchestrator.md` listaba 6 "piezas" pero `specs/README.md` tiene 4 specs; "contenido" e "impresión" no tienen carpeta ni `tasks.md` | F4 aclarado: 4 piezas con spec; contenido en/es e impresión son trabajos del integrator con contrato en `foundations/` (P1), verificados dentro de las tareas de las piezas (#82b) |

**Pendientes menores sin decisión (de esta pasada):** typo "tuncan" en
`docs/agents.md:57`; doble conteo de secciones en `docs/README.md:38`;
decisión #57 no anotada como reemplazada por #70; categorías de specs sin `qa`
en `AGENTS.md`/`docs/README.md`; `/sdd-implement` no define ruta para tareas de
F5; F1 no usa el modelo Tn/`tasks.md` (excepción implícita); y los pendientes
heredados de R (B2, case-insensitive de `docs/agents.md`, decisión 5).
