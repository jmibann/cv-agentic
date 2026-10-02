---
description: "SDD · Redacta el plan técnico de una spec aprobada (uso: /sdd-plan <categoria>/<Name>)"
agent: orchestrator
---

Cargá la skill `sdd` (sección Plan) y leé `docs/constitution.md`, `AGENTS.md` y
`specs/$1/spec.md`. **No escribas código.**

Si la spec no tiene `Estado: aprobada` o tiene `[NECESITA ACLARACIÓN]` abiertas, frená y avisame.

Redactá `specs/$1/plan.md` con:

- Archivos que se crean o modifican y la responsabilidad de cada uno.
- Funciones puras de lógica (con "hoy" como parámetro solo si dependen de la fecha).
- Algoritmo en pseudocódigo (solo si hay lógica no trivial).
- Cómo se pinta en la interfaz.
- Decisiones técnicas justificadas, con su alternativa descartada.
- Estrategia de tests con `npm test` (Vitest + Testing Library + `expectNoA11yViolations`).

Todo respeta la constitución y cubre todos los RF; marcá qué RF cubre cada parte.
Mostrame el plan y esperá mi aprobación (puerta de Plan).
