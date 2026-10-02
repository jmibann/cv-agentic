---
description: "SDD · Plan + tareas de una fase completa o el plan de una pieza suelta (uso: /sdd-plan F1…F5 | /sdd-plan <categoria>/<Name>)"
agent: orchestrator
---

Cargá la skill `sdd` (secciones Plan, Tareas y "Ejecución con agentes") y leé
`docs/constitution.md`, `AGENTS.md` y `specs/README.md`. **No escribas código.**

**Si `$1` es una fase (`F1`, `F2`, `F3`, `F4` o `F5`):** puerta de Plan + Tareas por
fase. Para cada pieza de esa fase (tabla de `specs/README.md`, en orden; en
F1 la única pieza es `foundation/Foundation`),
redactá `plan.md` y `tasks.md` (formato de la skill). Si alguna spec no tiene
`Estado: aprobada` o tiene `[NECESITA ACLARACIÓN]` abiertas, frená y avisame
antes de redactar nada. Presentá todo junto con el formato de tu sección "Al
llegar a una puerta" y esperá mi aprobación de la fase.

**Si `$1` es `<categoria>/<Name>`** (pieza fuera de una fase, o un Cambio):
leé `specs/$1/spec.md`; si no tiene `Estado: aprobada` o tiene
`[NECESITA ACLARACIÓN]` abiertas, frená y avisame. Redactá solo
`specs/$1/plan.md` y esperá mi aprobación (puerta de Plan); las tareas van con
`/sdd-task`.

Cada `plan.md` incluye:

- Archivos que se crean o modifican y la responsabilidad de cada uno.
- Funciones puras de lógica (con "hoy" como parámetro solo si dependen de la fecha).
- Algoritmo en pseudocódigo (solo si hay lógica no trivial).
- Cómo se pinta en la interfaz.
- Decisiones técnicas justificadas, con su alternativa descartada.
- Estrategia de tests con `npm test` (Vitest + Testing Library + `expectNoA11yViolations`).

Todo respeta la constitución y cubre todos los RF; marcá qué RF cubre cada parte.
Mostrame lo redactado y esperá mi aprobación.
