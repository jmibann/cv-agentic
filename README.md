# cv-agentic

Sitio CV personal (**React + TypeScript + Vite + CSS Modules**, responsive,
claro/oscuro, en/es) construido por agentes de OpenCode con
**spec-driven development**.

## Estado actual (2026-10-02)

| Qué | Estado |
|---|---|
| Kit de diseño (reglas, tokens, fundamentos, 27 specs, contrato de datos) | ✅ Completo y auditado; `## No hacer` en las 27 (#89) |
| Modelo único de spec (`specs/<categoria>/<Name>/{spec,plan,tasks}.md`, plantilla de la skill `sdd`, `Estado` + `Requisitos (EARS)` en las 27) | ✅ Migrado y aprobado (2026-10-02); `plan.md`/`tasks.md` los redacta el orchestrator en sus puertas |
| Agentes OpenCode (5) | ✅ En `.opencode/agents/` |
| Diagnóstico A, B, C, F, reestructuras H/I, auditoría J y constitución (K) | ✅ Cerrados |
| Repositorio git (baseline) | ✅ Inicializado; primeros commits del modelo de spec |
| Sticky del Sidebar en pantallas bajas | ✅ Resuelto: sticky solo con alto ≥ 900px |
| Constitución (`docs/constitution.md`) | ✅ Vigente; P1 verificado contra `specs/**/<Name>/spec.md` (decisión #68); P2/P4/T2 por tarea (decisión #69); P2 aclarado (decisión #75) |
| Comandos `/sdd-*` | ✅ Integrados: corren con el orchestrator o el reviewer, con argumento `<categoria>/<Name>` (decisión #71) |
| Puertas | ✅ Plan + Tareas por fase F1–F4 (#74, #84, #85); Clarificación solo con hallazgos (#90): entre ~37 y ~65 puertas en lugar de ~113 |
| Auditoría de arquitectura (agentes, skills, comandos) | ✅ Cerrada (2026-10-02): sin bloqueantes; 6 puntos corregidos (#75–#80); re-auditoría: 4 hallazgos medios corregidos (#81–#82); tercera auditoría: 2 altos (#83 identidad de git en permisos, #84 F1 como pieza `foundation/Foundation` con Tn) 7 medios (#85–#91) y bajos (#92–#94) corregidos; sin pendientes |
| Unidad de trabajo y memoria | ✅ Por tarea (Tn) en todo el sistema; memoria única en `docs/memory.md` (decisiones #69 y #70) |
| Contenido del CV en JSON (esquema + validación) | ✅ Especificado: `data/cv.schema.json` + ejemplos JSON; se genera en F1 |
| `spec.md` de `foundation/Foundation`, `plan.md` / `tasks.md` de las 28 piezas, `src/`, `package.json` | ⏳ Próxima fase (kickoff de F1: `/sdd-spec foundation/Foundation` → `/sdd-plan F1` → foundation por Tn) |

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
