---
description: "SDD · Revisa una spec como QA: solo detecta, no resuelve (uso: /sdd-clarify <categoria>/<Name>)"
agent: reviewer
---

Revisá `specs/$1/spec.md` como un QA muy profesional, con contexto limpio. Cargá la skill
`sdd` y leé `docs/constitution.md` y `specs/README.md`.

Listá:

1. Ambigüedades (requisitos que no se pueden verificar).
2. Contradicciones entre requisitos o entre secciones de la spec.
3. Casos límite no cubiertos.
4. RF sin contraparte en "Tests esperados" (y viceversa).
5. Conflictos con `docs/constitution.md` o con la plantilla de `specs/README.md`.

No propongas soluciones ni modifiques archivos: solo detectá. Formato: lista numerada.
Si no encontrás nada, respondé exactamente **"Sin hallazgos"**: con la spec ya `aprobada`,
la pieza sigue sin puerta de Clarificación (decisión #90). Las respuestas a los hallazgos
las aplica el orchestrator en `spec.md` (con tu aprobación).
