# Diagnóstico — registro de puertas y auditorías

Log mínimo del proyecto (decisiones **#86** y **#98**): el orchestrator agrega
**una entrada** por cada cierre de puerta F y por cada decisión de reglas, con
los hashes de los commits relevantes. Última actualización: **2026-10-06**
(cierre de F2; poda #98 de las entradas de decisión 2026-10-04/05).

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

## Entradas

### 2026-10-06 · Decisión #102 — L2: subject inglés, cuerpo español sin acentos (en curso F3; no es puerta F)

- Qué: ante la deuda de forma acumulada (ThemeToggle T3, LanguageSwitcher T1–T3: cuerpos en español con subjects en inglés), el usuario fija la lectura de L2: el **subject** Conventional va en inglés; el **cuerpo** en **español sin acentos** (canon de facto desde F1). *Descartado:* exigir cuerpos en inglés. No se enmienda historia. El encargo de delegación transmite la regla; `AGENTS.md`/constitución no se tocan (el usuario no lo pidió).
- Checks: n/a (decisión de proceso; repo verde al registrar: lint ✓ · typecheck ✓ · test 257/24 ✓).
- Decisiones: **#102** → registro (`docs/README.md`) + `docs/memory.md`.
- Commits: cierre LanguageSwitcher (spec `implementada` + docs de estado, el de esta entrada).
- Abre: nada; cierra: las deudas L2 de forma de ThemeToggle T3 y LanguageSwitcher (quedan en historia tal cual).

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

### §VIII · 2026-10-03 — Cierre de F1

- **F1 (pieza `foundation/Foundation`) cerrada**: T6–T11 aprobadas por tarea;
  la revisión completa salió **RECHAZADA** por un `describe` en español (L2) →
  reparo **T8b** → **APROBADO**. QA visual en navegador **APROBADO** (app
  servida por el usuario: anti-flash oscuro, RF-3 en vivo, `theme-color`,
  es/en, Poppins autohosteada, 375/1440 sin overflow).
- Checks de cierre: lint ✓ · typecheck ✓ · test 53/53 ✓ · validate:content ✓ ·
  build ✓ (sin diff post-build).
- Decisiones: **#97** (`ucs2length` de ajv aceptado en el bundle).
- Commits: feats T6–T11 `15a9592` `884bb2f` `14aec22` `59efc8d` `faae4c2`
  `79b7133`; reparo T8b `ae59762`; spec `implementada` `e4bcb9d`; cierre
  `1865d86`.
- Pendientes: deudas menores de F1 (arriba); F8 y F5 siguen abiertos.

### §VII · 2026-10-03 — F1 hasta T5

- T1–T5 (+ reparos T2b, T3b, T5b) aprobadas. Deuda L1 detectada en T4
  (comentarios en inglés en `src/test/`) → **T3b** la reparó; criterio
  unificado en `docs/memory.md` (español también en `src/test/**`; títulos de
  tests e identificadores en inglés).
- Bloqueante en T5 → Cambio aprobado: `react-refresh/only-export-components`
  vs. la API spíada (provider + hook en el mismo `.tsx`).
- Decisiones: **#96** (`allowExportNames: ["useTheme", "useLocale", "useCv"]`
  en `eslint.config.js`; descartado mover los hooks a `.ts`).
- Commits: `c259db2` (T4→L1) `17b0409` (T3b) `48bd323` (T5b) `bcb4605`
  (feat T5) `4adab35` (registro).
- Pendientes: cierra la deuda L1 de T4/T3.

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
