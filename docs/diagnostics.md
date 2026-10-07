# Diagnóstico — registro de puertas y auditorías

Log mínimo del proyecto (decisiones **#86** y **#98**): el orchestrator agrega
**una entrada** por cada cierre de puerta F y por cada decisión de reglas, con
los hashes de los commits relevantes. Última actualización: **2026-10-07**
(cierre de F3; poda #98 de §VII/§VIII y de la entrada #102).

Lo vivo no vive aquí: estado → `README.md` ("Estado actual") · memoria →
`docs/memory.md` · decisiones #1–#98 → `docs/README.md` · QA de F5 →
`docs/qa-report.md`.

Dueño: orchestrator (`edit` por ruta). Las puertas de pieza no tocan este
archivo.

## Plantilla de entrada

```text
### §<n> · <AAAA-MM-DD> — <Puerta F o auditoría>
- Qué: <qué se hizo o aprobó>.
- Checks: lint · typecheck · test (n/n) · build (si aplica).
- Decisiones: #NN → `docs/README.md`.
- Commits: `<hash>` … (solo los relevantes).
- Abre: <nuevos>; cierra: <los que resuelve esta entrada> (actualizá la tabla **Abiertos**).
```

Las entradas van **más reciente arriba**. El consolidado vive en la tabla
**Abiertos**.

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
| F8 | `--size-avatar-sidebar: 9rem` (≥ 768) es **provisional** en `tokens/tokens.css`; el valor final se fija con la captura de referencia | QA visual de F5 |
| F5 | QA visual completa (4 viewports × 2 temas × 2 idiomas); informe en `docs/qa-report.md` (#85) | F5 |
| Deudas menores de F1 | `StrictMode` sin mandato (si se quiere, es Cambio), `value` de contexto sin `useMemo` en ambos providers, typos "recalculera", rastro `07eead6`; detalle en `docs/memory.md`. Reevaluadas al cerrar F2 (2026-10-06): **permanecen**, sin impacto en F2 | Sin fecha; decisión del usuario si se reparan |
| Deudas menores de F2 | (a) AGENTS.md "parámetros sin usar: prefijo `_`" es impreciso con el eslint real (`after-used`, sin `argsIgnorePattern`: el `_` no protege el último parámetro) → enmienda a decidir por el usuario; (b) nota #99: con el proxy CSS-Modules de Vitest la rama de fallback puede no ejercitarse nunca — la validez del patrón está en compartir el objeto `styles` entre test e implementación; (c) stderr preexistente `act(...)` en 2 tests de `ThemeProvider.test.tsx` (pasan) → decidir si repara | (a) y (c): decisión del usuario; (b): próxima revisión de la skill sdd |
| Seguimientos F3 (acumulados de piezas, registro fino en los `tasks.md` de cada pieza) | `cursor: pointer` en controles/bullet (no listado; ×2+NavTabs) · `.card`/`.inner` de TestimonialCard dirimido por orden de hoja (hardening `.card.card` opcional) · nativos del `<dialog>` (top layer, foco inicial/retorno, backdrop real) · pseudo-estados/animaciones sin computar en jsdom · no-BFC del `h1` junto a `.float` y orden tras skip-link y banner único → verificación en **AppLayout F4** · superficies RF-4 SkillList / RF-6 Badge / RF-4 Overhead / RF-5 IconBox / RF-4 Separator (gap) → consumidores **F3/F4** ya anotados · redondeo "9 filas"→10 en encabezado de `TestimonialDialog.test.tsx` · nota kit: `contrast.md` regla 6 no enumera ServiceCard (opcional) | QA F5 y revisión de consumidores en F4 |

## Entradas

### §X · 2026-10-07 — Cierre de F3

- Qué: **F3 Compuestos cerrada (12/12)**: ThemeToggle, LanguageSwitcher, ControlsBar, NavTabs, Sidebar, Timeline, ResumeSection, SkillList, ServiceCard, TestimonialCard, TestimonialDialog y TestimonialCarousel con spec `Estado: implementada`. Por pieza: Clarificación→Plan/Tareas de fase (aprobados `bdfa58c` tras la ronda de hallazgos G-A…G-E/1–21), revisión por tarea + revisión completa + `build` ✅. Hitos de proceso: **Foundation T12** (Cambio `formatPeriodEndpoint` + `controls.lightMode`), extensión **#100** a `"getTabId"` (aprobada por el usuario, `0df3855`), ajustes de aserción entre tareas **con aprobación explícita** (Sidebar `4ff4424`; Carousel T5 `b6efae7`), **Cambio de accesibilidad opción A** (Test 12 inviable con `li[role=group]` por `aria-allowed-role`+`list` de axe → modelo div de slides; cerrado en verde **sin** desactivar reglas ni tocar `src/test/`), 2 puertas de pieza RECHAZADAS r1→APROBADAS r2 (NavTabs: Test esperado #11 caído del reparto; TestimonialDialog T1: effect de presencia con dep `[open]`), y regla nueva **#102** (L2: subject EN, cuerpo ES sin acentos). Lecciones fijadas: cross-check 1:1 de "Tests esperados" antes de dictar revisión completa; sin archivos scratch (no hay `rm` en allowlists).
- Checks: lint ✓ · typecheck ✓ · test **395/36** ✓ · build ✓ por pieza y al cerrar (spec final `6b871e1`).
- Decisiones: #99/#100 (ext. "getTabId")/#101 (ext. commit único `test` sin `feat`: ThemeToggle T2)/**#102** → registro. Ninguna regla nueva además de #102.
- Commits: specs `implementada` ×12 `35083ef` `3da32b9` `ddfd1f7` `d63d1b1` `82017f1` `3b457f3` `ef78c22` `bf26962` `0388366` `3ce10df` `37711dc` `6b871e1`; Cambio Carousel `d535895`; T12 `29b063f`.
- Abre: fila "Seguimientos F3" en **Abiertos**; cierra: nada propio (F8 y F5 siguen; deudas F1/F2 permanecen según sus filas).

### 2026-10-06 · Decisión #102 — L2: subject inglés, cuerpo español sin acentos · #102 · `git show 3da32b9:docs/diagnostics.md`

### §IX · 2026-10-06 — Cierre de F2

- Qué: **F2 Primitivas cerrada (11/11)**: Icon, BrandIcon, Box, Button, Badge,
  Overhead, IconBox, SectionTitle, Separator, CornerTab y HexAvatar con spec
  `Estado: implementada`. Por pieza: revisión por tarea + revisión completa +
  `build` ✅. Mecanismos aplicados: #99 (aserción P2), #100 (`BRAND_NAMES`),
  #101 extendido en la práctica (verdes on-arrival declarados en Button T6,
  Badge T3, Overhead T3/T4, SectionTitle T3/T5, Separator T3, CornerTab T4,
  HexAvatar T3/T4; **commit único `feat` sin `test`** cuando no hay nada
  discriminate-testable: IconBox T3). Decisiones de delegación registradas en
  las notas de `tasks.md` (gaps de reparto de `index.ts` en todas y de
  `className` en CornerTab T1, `31adfb5`). El reviewer validó `display: block`
  en HexAvatar T2 como necesidad mecánica fiel (no Cambio) y recálculo propio
  de la geometría de "Forma" en T1. Las restricciones de uso de primitivas
  (Badge RF-6, Overhead RF-4, IconBox RF-5, Separator RF-4 gap, CornerTab
  no-BFC y float ≥992, combo hover+focus Button, Safari/H-8, F8) se verifican
  en F3/F4/F5 según sus specs.
- Checks: lint ✓ · typecheck ✓ · test **236/236 (22 archivos)** ✓ · build ✓
  por pieza y al cerrar (HEAD `1a0ec18`, árbol limpio).
- Decisiones: ninguna nueva de regla en esta puerta; #99/#100/#101 ya
  registrados (entradas podadas abajo; detalle en git). Deudas menores F2 →
  tabla **Abiertos**.
- Commits: specs `implementada` ×11 `ee9ee34` `765834a` `aaab301` `76c348d`
  `1962e3f` `b2783f6` `cc2cb0d` `ac47b8e` `d21b3aa` `3a6da02` `1a0ec18`; feats
  de HexAvatar `09c9e03` `9137a67` `bcfe9ec` `b0b2b2c`; docs de estado por
  pieza (`d0da569` … `c5a7879`).
- Abre: fila "Deudas menores de F2" en **Abiertos**; cierra: nada propio — la
  fila de deudas de F1 se **reevaluó** y permanece; F8 y F5 siguen abiertos.

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
