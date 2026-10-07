# cv-agentic

Sitio CV personal (**React + TypeScript + Vite + CSS Modules**, responsive,
claro/oscuro, en/es) construido por agentes de OpenCode con
**spec-driven development**.

## Estado actual (2026-10-06)

| Qué | Estado |
|---|---|
| Kit de diseño (reglas, tokens, fundamentos, 27 specs, contrato de datos) | ✅ Completo y auditado; `## No hacer` en las 27 (#89) |
| Modelo único de spec (`specs/<categoria>/<Name>/{spec,plan,tasks}.md`, plantilla de la skill `sdd`, `Estado` + `Requisitos (EARS)` en las 27) | ✅ Migrado y aprobado (2026-10-02); `plan.md`/`tasks.md` los redacta el orchestrator en sus puertas |
| Agentes OpenCode (5) | ✅ En `.opencode/agents/`; el orchestrator también edita el registro de decisiones y `docs/agent-system.md` (#95) |
| Diagnóstico A, B, C, F, reestructuras H/I, auditoría J y constitución (K) | ✅ Cerrados |
| Repositorio git (baseline) | ✅ Inicializado; primeros commits del modelo de spec |
| Sticky del Sidebar en pantallas bajas | ✅ Resuelto: sticky solo con alto ≥ 900px |
| Constitución (`docs/constitution.md`) | ✅ Vigente; P1 verificado contra `specs/**/<Name>/spec.md` (decisión #68); P2/P4/T2 por tarea (decisión #69); P2 aclarado (decisión #75) |
| Comandos `/sdd-*` | ✅ Integrados: corren con el orchestrator o el reviewer, con argumento `<categoria>/<Name>` (decisión #71) |
| Puertas | ✅ Plan + Tareas por fase F1–F4 (#74, #84, #85); Clarificación solo con hallazgos (#90): entre ~37 y ~65 puertas en lugar de ~113 |
| Auditoría de arquitectura (agentes, skills, comandos) | ✅ Cerrada (2026-10-02): sin bloqueantes; 6 puntos corregidos (#75–#80); re-auditoría: 4 hallazgos medios corregidos (#81–#82); tercera auditoría: 2 altos (#83 identidad de git en permisos, #84 F1 como pieza `foundation/Foundation` con Tn) 7 medios (#85–#91) y bajos (#92–#94) corregidos; sin pendientes |
| Unidad de trabajo y memoria | ✅ Por tarea (Tn) en todo el sistema; memoria única en `docs/memory.md` (decisiones #69 y #70) |
| Contenido del CV en JSON (esquema + validación) | ✅ Operativo desde F1: esquema + generados (`gen:types`, `build:validator`) + `validate:content` en verde; contenido inicial en `src/content/cv.{en,es}.json` |
| `spec.md` de `foundation/Foundation` + `plan.md` / `tasks.md` | ✅ Aprobados; Tareas de las demás piezas: al inicio de su fase F |
| **F1 Foundation** (pieza `foundation/Foundation`, Tn por encargo) | ✅ **Cerrada (2026-10-03)**: spec `Estado: implementada`; T1–T11 + T2b/T3b/T5b/T8b aprobadas; revisión completa APROBADA; QA visual en navegador APROBADO. Cambios: `skipLibCheck`, #96 (`react-refresh` hooks), #97 (`ucs2length` aceptado). Deudas menores en `docs/memory.md` |
| **F2 Primitivas** (Icon, BrandIcon, Box, Button, Badge, Overhead, IconBox, SectionTitle, Separator, CornerTab, HexAvatar — 11 piezas) | ✅ **CERRADA (2026-10-06)**: las 11 specs `Estado: implementada`; por pieza: revisión por tarea + revisión completa APROBADA + `build` ✅. Suite: 236 tests, 0 warnings. Decisiones aplicadas: #99, #100, #101 (verdes on-arrival declarados; commit único `feat` en IconBox T3; gaps de reparto cubiertos con notas en `tasks.md`: `index.ts` en todas, `className` en CornerTab T1). Entrada de cierre: §IX en `docs/diagnostics.md` (poda #98 aplicada). Deudas menores F2 y restricciones de uso diferidas → tabla **Abiertos** de diagnostics y líneas de abajo |
| **F3 Compuestos** (ThemeToggle, LanguageSwitcher, ControlsBar, NavTabs, Sidebar, Timeline, ResumeSection, SkillList, ServiceCard, TestimonialCard, TestimonialDialog, TestimonialCarousel — 12 piezas) | ⏳ **EN CURSO (11/12 cerradas, 2026-10-07)**: T12 + 10 previas + **TestimonialDialog** `implementada` (372 tests; la pieza más exigida: r1→r2 en T1 por el effect de presencia, ciclo de cierre con mock de DOMRect, Cambio fila Rol aprobado `4f206ef`→`83632c5`, print propio, `@starting-style` solo entrada — build lo parseó). **Siguiente y última: TestimonialCarousel** (5 tareas: puras stops → región única+dialog → bullets/stops → scrollTo+behavior → estilos/print/cierre/index). Acumulados F5/F4: cursor ×2, `.card`/`.inner` orden de hoja, nativo dialog (top layer/foco/backdrop), pseudo-estados, sticky/print/≥xl, `role="list"`, geometría Timeline, márgenes `.additional`, F8, RF-4 SkillList→ResumePage, redondeo "9 filas"→10 en test TD (próxima pasada legítima) |
| F2 → seguimientos abiertos | Combo hover+focus del Button (el `outline` gana siempre; la spec no fija el combo) → **F5** · Badge RF-6 ("no dentro de `Box inner`") se verifica en los consumidores → **F3/F4** (SkillList/Sidebar) · Overhead RF-4 (nunca sobre `--color-bg` en claro) se verifica en los consumidores → **F3/F4** (Sidebar) · IconBox RF-5 (no dentro de `Box variant="inner"`) se verifica en los consumidores → **F3/F4** (Sidebar/ResumeSection) · `--button-small-padding-*` literales: promover a token si se repite en otro componente |

Detalle y decisiones: [docs/diagnostics.md](docs/diagnostics.md).

## Estructura

```
cv-agentic/
├─ README.md          este índice
├─ AGENTS.md          convenciones para los agentes (OpenCode lo lee desde la raíz)
├─ docs/              documentación (constitution, README completo, DESIGN, BACKLOG, diagnostics, agent-system.md, tokens/)
├─ tokens/            tokens.css (lo importa la app)
├─ foundations/       tipografía · layout · movimiento · theming · i18n
├─ specs/             una carpeta por pieza (<categoria>/<Name>/spec.md)
├─ data/              esquema JSON del CV (fuente de verdad) + ejemplos
├─ .opencode/         agents/ (los 5 agentes), skills/sdd/, commands/ (/sdd-*)
├─ opencode.json      config de OpenCode (MCP de Chrome DevTools, solo para el reviewer)
└─ src/ · public/ · index.html · package.json   ← los crea la Fase 1
```

## Por dónde empezar

1. [docs/constitution.md](docs/constitution.md): las reglas no negociables
   del proyecto (están por encima de todo).
2. [docs/README.md](docs/README.md): qué es el kit, cómo lo usa la app,
   dependencias aprobadas y registro de decisiones.
3. [docs/DESIGN.md](docs/DESIGN.md): lenguaje visual y reglas duras.
4. [specs/README.md](specs/README.md): índice de specs y orden de construcción.
5. [AGENTS.md](AGENTS.md) y [docs/agent-system.md](docs/agent-system.md): cómo trabajan los agentes.
6. [docs/memory.md](docs/memory.md): memoria del proyecto (estado y decisiones recientes).
