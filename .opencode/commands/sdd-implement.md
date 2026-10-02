---
description: "SDD · Ejecuta UNA tarea con el flujo de agentes (uso: /sdd-implement <categoria>/<Name> T3)"
agent: orchestrator
---

Ejecutá SOLO la tarea `$2` de `specs/$1/tasks.md`, siguiendo la skill `sdd`, `docs/constitution.md`
y tus secciones "Cómo delegar una tarea" y "Después de cada tarea":

1. Verificá que `spec.md`, `plan.md` y `tasks.md` estén aprobados y que `$2` no esté marcada.
2. Delegá `$2` al subagente que corresponde (`component-builder` en F2–F3, `integrator` en F4):
   tests primero (commit `test(<Name>): $2`), implementación (commit `feat(<Name>): $2`).
3. Confirmá que el repo quede en verde y pedí al `reviewer` la revisión de la tarea contra su
   "Hecho cuando".
4. Si el reviewer aprueba, marcá `$2` en `tasks.md` con el hash del commit `feat`. Si rechaza,
   aplicá la regla de rondas (máximo 3).
5. Mostrame el resultado: qué RF cubre, commits e informe del reviewer.

Después PARÁ. No empieces la siguiente tarea.
