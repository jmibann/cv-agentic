# Diagnóstico — registro de puertas y auditorías

Log mínimo del proyecto (decisiones **#86** y **#98**): una entrada por cada
cierre de puerta F y por cada decisión de reglas, con los hashes relevantes.
Última actualización: **2026-11-12** (saneado de documentación §XXII; favicon §XXI; Resume en una columna §XX).
El proceso F1–F5 sigue cerrado (§XII); flujo y dueños en "Modo mantenimiento"
de `docs/agent-system.md`.

Lo vivo no vive aquí: estado → `README.md` ("Estado actual") · memoria →
`docs/memory.md` · decisiones #1–#115 → `docs/README.md` · QA de F5 →
`docs/qa-report.md` · motion → `specs/motion/proposal.md`.

Dueño: orchestrator (`edit` por ruta). Las puertas de pieza no tocan este
archivo. Tope: **150 líneas** (poda #98).

## Plantilla de entrada

```text
### §<n> · <AAAA-MM-DD> — <Puerta F o auditoría>
- Qué: <qué se hizo o aprobó>.
- Checks: lint · typecheck · test (n/n) · build (si aplica).
- Decisiones: #NN → `docs/README.md`.
- Commits: `<hash>` … (solo los relevantes).
- Abre: <nuevos>; cierra: <los que resuelve esta entrada> (actualizá la tabla **Abiertos**).
```

Entradas: **más reciente arriba**; el consolidado vive en la tabla **Abiertos**.

## Mantenimiento (decisión #98)

Cada **puerta F** o **decisión de reglas** agrega una entrada con el formato
fijo de la "Plantilla de entrada" y actualiza la tabla **Abiertos** (lo cerrado
**sale** de la tabla). Este archivo no lleva secciones de estado: el estado vive
en `README.md` ("Estado actual") y en `docs/memory.md`. Si supera las **150
líneas**, el orchestrator reduce, **en esa misma puerta F**, a **una línea**
cada entrada anterior a las de las dos últimas puertas F:
`fecha · título · #n · git show <hash>:docs/diagnostics.md` (hash de creación
de la entrada); el detalle queda en git.

## Abiertos

| Ítem | Qué falta | Se cierra en |
|---|---|---|
| Pendientes post-F5 (residuos) | **Deudas de forma**: comentario inglés `useHashTab.test.ts:143`, jerga "asiértan/asiértala" en tests (transversal), `lang="es"` sin restaurar en AppLayout.test (nota) — pase único solo si el usuario lo decide · opcionales kit: `cursor: pointer` no listado en controles/bullets, fila `contrast.md` regla 6 para ServiceCard | Decisión del usuario; sin fecha |
| Motion (post-entrega) | Propuesta aprobada (#106) en `specs/motion/proposal.md`; falta aprobar specs/planes/tareas y luego implementar tokens, tabs B, Sidebar grid, `data-theme-switching`, reduced motion, dialog y Separator. No se toca código antes de esa puerta | Puerta de Plan+Tareas / Cambio |
| Deudas menores de F1 | `StrictMode` sin mandato (si se quiere, es Cambio), `value` de contexto sin `useMemo` en ambos providers, typos "recalculera", rastro `07eead6`; detalle en `docs/memory.md`. Reevaluadas al cerrar F2 (2026-10-06): **permanecen**, sin impacto en F2 | Sin fecha; decisión del usuario si se reparan |
| Deudas menores de F2 | (a) AGENTS.md "parámetros sin usar: prefijo `_`" es impreciso con el eslint real (`after-used`, sin `argsIgnorePattern`: el `_` no protege el último parámetro) → enmienda a decidir por el usuario; (b) nota #99: con el proxy CSS-Modules de Vitest la rama de fallback puede no ejercitarse nunca — la validez del patrón está en compartir el objeto `styles` entre test e implementación; (c) stderr preexistente `act(...)` en 2 tests de `ThemeProvider.test.tsx` (pasan) → decidir si repara | (a) y (c): decisión del usuario; (b): próxima revisión de la skill sdd |

## Entradas

### §XXII · 2026-11-12 — Saneado de documentación (hallazgo de auditoría cerrado)
- Qué: saneado 1–4 aprobado por el usuario: (1) conteos obsoletos 27→**28 specs** (27 de componentes + Foundation) en README y memoria; (2) suite actual **448** en el modo mantenimiento del README; (3) la categoría `motion` registrada en `specs/README.md` (nota bajo el índice + excepción a la regla de `.md` sueltos) y en `AGENTS.md:16` (edición manual del usuario: `AGENTS.md` no está en los permisos de `edit`/`git add` del orchestrator) — sale la fila "Auditoría pendiente: registro de specs" de **Abiertos**; (4) §XI y §XII compactadas a una línea (tope #98; hashes de creación `133b1e8`/`31d8f27`). Sin cambios de código ni specs de pieza.
- Checks: lint ✓ · typecheck ✓ · test **448/40** ✓.
- Decisiones: ninguna nueva (cierra el hallazgo 4 de la auditoría del usuario 2026-11-11).
- Commits: `a783d69` (docs del saneado) · `c04f13d` (AGENTS.md, usuario).
- Abre: nada. Cierra: fila "Auditoría pendiente: registro de specs" (completo).

### §XXI · 2026-11-12 — Favicon tipo app y título real
- Qué: a pedido del usuario (el hexágono liso se veía como un "cubito" genérico y la pestaña decía `cv-agentic`), propuesta de 3 favicons; elegida la **C**: cuadrado redondeado `#304cfd` con hexágono en trazo blanco y monograma JM en paths (sin depender de fuentes). Se agrega `apple-touch-icon.png` 180×180 (mismo diseño a sangre, generado desde el SVG) y el título pasa a `Juan Manuel Ibáñez · Frontend Engineer`. Cambio de spec de Foundation (T14; reabre #105a con motivo concreto). T14b corrige el test rojo (Vite reescribía `new URL("….png", import.meta.url)`), sin tocar aserciones.
- Checks: lint ✓ · typecheck ✓ · test **448/40** ✓ · build ✓ (con base `/cv-agentic/` ambos links salen prefijados) · navegador: título OK, `/favicon.svg` y `/apple-touch-icon.png` 200, consola limpia.
- Decisiones: **#115** → `docs/README.md`.
- Commits: `a0d7b5f` (spec/T14) · `3b4db39` + `516621a` (tests) · `9ebcca4` (feat).
- Abre: nada. Cierra: nada (§XVII compactada a una línea por el tope de 150).

### §XX · 2026-11-12 — ResumePage en una sola columna, Experience primero
- Qué: a pedido del usuario (las dos columnas con timeline desde 768px eran difíciles de leer), Resume pasa a una sola columna en todos los anchos: Experience arriba, Education debajo, Skills al final. Preview previa en navegador con CSS inyectado; Cambio de spec aprobado (RF-3 reescrito, RF-2/RF-6, Anatomía, Estilos, Responsive y test 2). T5: orden invertido en el DOM (no `order` de CSS: lectura y foco = visual) y `.columns` sin `@media` ni `:only-child`. Única aserción cambiada: el orden de las regiones en el test 2, autorizada por el cambio de spec.
- Checks: lint ✓ · typecheck ✓ · test **447/40** ✓ · build ✓ · navegador 375/768/1334: una columna, Experience primero, sin overflow, consola limpia.
- Decisiones: **#114** → `docs/README.md`.
- Commits: `28e6ecf` (spec/T5) · `1c16bf5` (test rojo) · `174bc4e` (feat).
- Abre: nada. Cierra: nada (§XVI compactada a una línea por el tope de 150).

### §XIX · 2026-11-12 — TestimonialCard: avatar anclado arriba
- Qué: auditoría en navegador de la alineación de los hexágonos: con `align-items: end` el avatar bajaba con cada línea de nombre/rol, no sobresalía en ningún ancho y quedaba desalineado entre cards (50px a 768, 25px a 1440). Cambio aprobado (T6): `.header` → `align-items: start` y reserva exacta de la comilla con el token nuevo `--testimonial-quote-reserve` (2.2rem → 2rem ≥580). Sin clamp del rol (decisión del usuario).
- Checks: lint ✓ · typecheck ✓ · test **447/40** ✓ · build ✓ · navegador 375/580/768/1024/1440 × claro/oscuro × en/es: avatar −24/−30px idéntico en las 3 cards, 0 invasión de la comilla, sin overflow, dialog OK, consola limpia.
- Decisiones: **#113** → `docs/README.md`.
- Commits: `390bb06` (spec/T6) · `24faf70` (fix + token).
- Abre: nada. Cierra: nada (§XV compactada a una línea por el tope de 150).

### §XVIII · 2026-11-12 — Testimonios reales + Cambio de TestimonialCard
- Qué: 3 testimonios reales en `cv.{en,es}.json` (revierte el `testimonials: []` de #108; textos literales en su idioma original, errores incluidos por decisión del usuario; siluetas neutras como avatar). La QA en navegador detectó que la comilla pisaba nombres largos (20px a 375, 10px a 768) → Cambio aprobado: `.identity` reserva `calc(2rem + --testimonial-quote-inset-inline)` (T5). Re-QA: 0 invasión en 375/580/768/1024/1440 × claro/oscuro × en/es, sin overflow, dialog OK, consola limpia (el único error fue de HMR al editar el JSON; desaparece al recargar).
- Checks: lint ✓ · typecheck ✓ · test **447/40** ✓ · validate:content ✓ · build ✓.
- Decisiones: **#112** → `docs/README.md`.
- Commits: `b0f19bc` (spec/T5) · `11d5edc` (fix T5) · `7f7cbe3` (contenido).
- Abre: nada. Cierra: nada (§XIII–§XIV compactadas a una línea para respetar el tope de 150).

### 2026-11-12 · §XVII — CI: Node 26 LTS y quality gates en el deploy · #110–#111 · `git show a9849b7:docs/diagnostics.md`

### 2026-11-11 · §XVI — QA visual post-contenido (pasada enfocada) · — · `git show bbb70b9:docs/diagnostics.md`

### 2026-11-11 · §XV — Contenido real, tests y CTA de descarga · #107–#109 · `git show 0c5c54b:docs/diagnostics.md`

### 2026-11-11 · §XIV — Deploy GitHub Pages + propuesta de motion · #106–#108 · `git show 3496bb7:docs/diagnostics.md`

### 2026-11-06 · §XIII — Bug-fix ControlsBar T4 (alineación) · — · `git show 47cd6da:docs/diagnostics.md`

### 2026-10-08 · §XII — Cierre de F5 (fin del proceso F1–F5) · #104–#105 · `git show 31d8f27:docs/diagnostics.md`

### 2026-10-08 · §XI — Cierre de F4 · #103 · `git show 133b1e8:docs/diagnostics.md`

### 2026-10-07 · Cierre de F3 · #99–#102 · `git show 7f52303:docs/diagnostics.md`

### 2026-10-06 · Decisión #102 — L2: subject inglés, cuerpo español sin acentos · #102 · `git show 3da32b9:docs/diagnostics.md`

### 2026-10-06 · Cierre de F2 · #99–#101 · `git show 2c086fb:docs/diagnostics.md`

### 2026-10-05 · Decisión #101 — tareas solo-inspección: rojo no exigible · #101 · `git show 81ef2ff:docs/diagnostics.md`

### 2026-10-05 · Decisión #100 — `allowExportNames` extendido a `BRAND_NAMES` · #100 · `git show d5f5bff:docs/diagnostics.md`

### 2026-10-05 · Decisión #99 — patrón canónico de aserción P2 · #99 · `git show e28fe86:docs/diagnostics.md`

### 2026-10-05 — Regla de mantenimiento del log · #98 · `git show 4730d8d:docs/diagnostics.md`

### 2026-10-03 · §VIII — Cierre de F1 · — · `git show 1865d86:docs/diagnostics.md`

### 2026-10-03 · §VII — F1 hasta T5 · #96 · `git show dd7b35b:docs/diagnostics.md`

### 2026-10-02 · Post-auditoría hallazgos 1–3 y decisión #95 · #95 · `git show dd7b35b:docs/diagnostics.md` (§VI)

### 2026-10-02 · Auditorías del sistema agéntico (secciones R–V) · #75–#94 · `git show dd7b35b:docs/diagnostics.md`

### 2026-10-02 · Decisiones de proceso #67–#74 (secciones K–Q) · #67–#74 · `git show dd7b35b:docs/diagnostics.md`

## Índice histórico — auditoría inicial (2026-09-29 → 2026-10-01)

Detalle textual en git: `git show 1865d86:docs/diagnostics.md` (evolución en
`475534a..1865d86`). Rutas de la época: `components/` = `specs/`,
`agents/agent/` = `.opencode/agents/`, `packages/cv-design-kit/` = raíz.

| Sección | Qué | Resultado |
|---|---|---|
| A | 6 contradicciones graves entre specs y docs (headroom de TestimonialCard, fórmula del h1 bajo la CornerTab, tabpanel "es un Box", `headingLevel` de Timeline, gradiente vs. sólido, 3 specs faltantes en la tabla de fases) | ✅ A1–A6 decididas y aplicadas (2026-09-30) |
| B | 9 puntos débiles: contraste de redes y tabs, foco, medidas responsive literales, landmarks, `theme-color`, dependencias, CSS global, 12 ambigüedades (B8), secciones de plantilla (B9) | ✅ B1–B9 aplicadas (2026-09-30); los 4 desvíos finales quedaron en las specs aprobadas |
| C | 9 notas de hygiene: tokens sin uso, `YearMonth` estricto, `Badge`, opacidades sin fila de contraste, entre otras | ✅ C1–C9 aplicadas (2026-09-30) |
| D | Verificación programática: 0 tokens colgantes, paridad en/es de los ejemplos, claves de labels, contrastes, breakpoints, tipografía | ✅ OK; no revisar de nuevo |
| F | 13 pendientes externos: regex de lint, serialización de builders, commits y permisos de agentes, formato de OpenCode, axe-core en vez de `vitest-axe`, ESLint 10, esquema/`alt`, MCP | ✅ F1–F13 aplicados o resueltos (2026-09-30); F8 provisional → F5 |
| Verificación y plan de kickoff | Segunda pasada sobre A/B/C/F cerradas: 27 specs, 0 tokens colgantes, veredicto "F1 desbloqueado" y etapas 0–3 (etapa 2 corregida en #77) | ✅ Cumplido: F1 cerrada el 2026-10-03; sección eliminada en el saneado |
| Contexto (causas raíz, estado del repo, cómo usar este archivo) | Diagnóstico de partida del kit | ✅ Obsoleto tras F1; eliminado en el saneado |
| Registro de documentación | Dos pases para que ningún documento del kit contradiga a las specs | ✅ 2026-09-30 |
| G | Contenido del CV en JSON: esquema draft-07, tipos y validador generados, `src/content/cv.{en,es}.json` | ✅ Aplicado (2026-10-01), decisión **#44** |
| H | Reestructura a proyecto único: raíz, `specs/`, `.opencode/agents/`, alias `@data` | ✅ Aplicado (2026-10-01), decisiones **#39–#42** |
| I | Documentación movida a `docs/` (README completo, DESIGN, BACKLOG, tokens) | ✅ Aplicado (2026-10-01), decisión **#43** |
| J | Auditoría de arquitectura React: 24 hallazgos (6 críticos, 6 altos, 12 medios) + observación posterior del sticky | ✅ Corregidos (2026-10-01), decisiones **#45–#66** |
