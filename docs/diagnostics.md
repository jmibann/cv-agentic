# Diagnóstico — registro de puertas y auditorías

Log mínimo del proyecto (decisiones **#86** y **#98**): una entrada por cada
cierre de puerta F y por cada decisión de reglas, con los hashes relevantes.
Última actualización: **2026-11-15** (README en inglés y `docs/STATUS.md` §XXXII, #120; Cambio #119, avatar en WebP §XXXI; saneado de docs §XXX; Cambio #118, colección `projects` §XXIX; Cambio #117, metadatos SEO §XXVIII; sistema motion completo §XXVII; cambios 3 §XXVI y 2 §XXV; puerta etapa 1 §XXIII).
El proceso F1–F5 sigue cerrado (§XII); flujo y dueños en "Modo mantenimiento"
de `docs/agent-system.md`.

Lo vivo no vive aquí: estado → `docs/STATUS.md` ("Estado actual") · memoria →
`docs/memory.md` · decisiones #1–#120 → `docs/README.md` · QA de F5 →
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
en `docs/STATUS.md` ("Estado actual") y en `docs/memory.md`. Si supera las **150
líneas**, el orchestrator reduce, **en esa misma puerta F**, a **una línea**
cada entrada anterior a las de las dos últimas puertas F:
`fecha · título · #n · git show <hash>:docs/diagnostics.md` (hash de creación
de la entrada); el detalle queda en git.

## Abiertos

| Ítem | Qué falta | Se cierra en |
|---|---|---|
| Pendientes post-F5 (residuos) | **Deudas de forma**: comentario inglés `useHashTab.test.ts:143`, jerga "asiértan/asiértala" en tests (transversal), `lang="es"` sin restaurar en AppLayout.test (nota), `<script>` anti-flash en columna 0 en `index.html` (preexistente de T4, menor de §XXVIII), comentarios viejos en `ResumePage.tsx`/`ResumePage.test.tsx` (§XXX) — pase único solo si el usuario lo decide · opcionales kit: `cursor: pointer` no listado en controles/bullets, fila `contrast.md` regla 6 para ServiceCard | Decisión del usuario; sin fecha |
| Deudas menores de F1 | `StrictMode` sin mandato (si se quiere, es Cambio), `value` de contexto sin `useMemo` en ambos providers, typos "recalculera", rastro `07eead6`; detalle en `docs/memory.md`. Reevaluadas al cerrar F2 (2026-10-06): **permanecen**, sin impacto en F2 | Sin fecha; decisión del usuario si se reparan |
| Deudas menores de F2 | (a) AGENTS.md "parámetros sin usar: prefijo `_`" es impreciso con el eslint real (`after-used`, sin `argsIgnorePattern`: el `_` no protege el último parámetro) → enmienda a decidir por el usuario; (b) nota #99: con el proxy CSS-Modules de Vitest la rama de fallback puede no ejercitarse nunca — la validez del patrón está en compartir el objeto `styles` entre test e implementación; (c) stderr preexistente `act(...)` en 2 tests de `ThemeProvider.test.tsx` (pasan) → decidir si repara | (a) y (c): decisión del usuario; (b): próxima revisión de la skill sdd |

## Entradas

### §XXXII · 2026-11-15 — README público en inglés y tablero de estado a `docs/STATUS.md`
- Qué: el tablero interno deja la raíz (`git mv README.md docs/STATUS.md`) y los agentes, la skill y AGENTS.md apuntan ahí; README nuevo en inglés con el texto del usuario, diagrama Mermaid del sistema de agentes y captura claro/oscuro (`docs/images/preview.png`). Hecho por Claude Code a pedido del usuario.
- Checks: lint · typecheck · test (482/41) · build; enlaces relativos del README y de STATUS comprobados por script; afirmaciones del README verificadas contra el repo. Falta ver el render en GitHub tras el push.
- Decisiones: #120 → `docs/README.md`.
- Commits: `b21b041` (mudanza) + el del README.
- Abre: —; cierra: —.

### §XXXI · 2026-11-15 — Cambio #119: avatar del sitio en WebP
- Qué: `public/images/avatar.png` (269.794 bytes; PageSpeed estimaba 263 KiB de ahorro) se reemplaza por `avatar.webp` (512×512 con alfa, `cwebp -q 82`, 29.650 bytes, −89 %); `profile.avatar.src` actualizado en el contenido y en los ejemplos del kit. Foundation T21, hecha por Claude Code a pedido del usuario.
- Checks: lint · typecheck · test (482/41) · build · validate:content; imagen decodificada comparada a la vista con el original. Sin verificación en navegador ni PageSpeed post-deploy.
- Decisiones: #119 → `docs/README.md`.
- Commits: `df85c61` (spec) · `23cd835` → `37f6659` (T21).
- Abre: —; cierra: en parte BACKLOG → "Imágenes" (queda `srcset`/AVIF).

### 2026-11-14 · §XXX — Saneado de documentación tras #117 y #118 (auditoría) · — · `git show e0b6104:docs/diagnostics.md`

### 2026-11-14 · §XXIX — Cambio #118: colección `projects` y sección Projects en Resume · #118 · `git show b22655a:docs/diagnostics.md`

### 2026-11-14 · §XXVIII — Cierre del Cambio #117 (Foundation: metadatos SEO y para compartir) · #117 · `git show 3d22bf8:docs/diagnostics.md`

### 2026-11-13 · §XXVII — Cierre del Cambio motion 4 y del sistema motion (4/4) · #116 · `git show 0bab158:docs/diagnostics.md`

### 2026-11-13 · §XXVI — Cierre del Cambio motion 3 (Sidebar, expansión de contactos) · — · `git show 5ac25ff:docs/diagnostics.md`

### 2026-11-13 · §XXV — Cierre del Cambio motion 2 (AppLayout, entrada de panel) · — · `git show de5f32a:docs/diagnostics.md`

### 2026-11-13 · §XXIV — Cierre del Cambio motion etapa 1 (Foundation T18) · #116 · `git show fd3d1d1:docs/diagnostics.md`

### 2026-11-13 · §XXIII — Puerta motion etapa 1 + saneado de documentación · #116 · `git show aca2b59:docs/diagnostics.md`

### 2026-11-12 · §XXII — Saneado de documentación (hallazgo de auditoría cerrado) · — · `git show a783d69:docs/diagnostics.md`

### 2026-11-12 · §XXI — Favicon tipo app y título real · #115 · `git show de87d04:docs/diagnostics.md`

### 2026-11-12 · §XX — ResumePage en una sola columna, Experience primero · #114 · `git show 31d7ee9:docs/diagnostics.md`

### 2026-11-12 · §XIX — TestimonialCard: avatar anclado arriba · #113 · `git show c240dd8:docs/diagnostics.md`

### 2026-11-12 · §XVIII — Testimonios reales + Cambio de TestimonialCard · #112 · `git show 36be49c:docs/diagnostics.md`

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
