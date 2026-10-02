# Memoria del proyecto — cv-agentic (`docs/memory.md`)

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.
La actualiza **solo el orchestrator** al cerrar cada fase SDD (los subagentes tienen `edit` denegado).

## Estado actual

- Kit completo y auditado: reglas, tokens, fundamentos, 27 specs, esquema de datos.
- **Modelo único de spec migrado y aprobado (2026-10-02)**: `specs/<categoria>/<Name>/spec.md`
  con `Estado: aprobada` y `## Requisitos (EARS)` (5–8 RF por pieza) en las 27.
- Git baseline + 6 commits; **no existen `src/`, `package.json` ni la app** (las crea F1/foundation).
- Próximo hito: kickoff de F1 con el orchestrator (sección "Verificación independiente y plan de kickoff" de `docs/diagnostics.md`).

## Decisiones (y por qué)

- **Modelo de spec**: una carpeta por pieza; `spec.md` es el contrato y lo escribe/ aprueba el usuario,
  `plan.md`/`tasks.md` los redacta el orchestrator en sus puertas (evita specs duplicadas con la skill `sdd`).
- **EARS**: 3–8 `RF-n`, derivados solo de `Propósito`, `Estados`, `Responsive`, `Accesibilidad` y
  `Tests esperados`; si un RF no tiene contrapartida en "Tests esperados" **no se agrega el test** (se reporta).
- **P1 actualizado** (`specs/**/<Name>/spec.md`) con aprobación explícita + decisión #68 en `docs/README.md`
  (la constitución exige ambas cosas para tocarse).
- Commits con `-c user.name="jmiban"`: modificar git config está prohibido por `AGENTS.md`; sin `--amend`.
- `## No hacer` sigue faltando en 9 specs (decisión B2, pendiente).

## Aprendizajes y errores a evitar

- No pasadas globales de rename sobre `docs/diagnostics.md`: son referencias históricas (`components/...`).
- zsh no separa `$var` por espacios: usar `git ls-files -z '*.md' | xargs -0 perl -pi -e '...'`.
- Links entre specs de carpetas distintas necesitan `../../` (un `../` queda roto; verificar con un checker).
- Plantilla: "10 secciones + Estado + EARS" y `Requisitos` **justo después** de `Propósito` (no siempre antes de Anatomía).
- La memoria vive en `docs/memory.md` (no hay `MEMORY.md` ni `memory.md` en la raíz); skill, orchestrator,
  comandos y `AGENTS.md` ya apuntan acá (decisión #70).

## Próximos pasos

- F1 (foundation): scaffold de la app, tooling, tokens, providers.
- **Unidad de trabajo por tarea** (decisión #69): `test(<Name>): Tn` → `feat(<Name>): Tn`; `feat`/`fix` no tocan
  tests y `test` solo agrega; el orchestrator escribe `plan.md`/`tasks.md` y marca cada Tn tras el OK del reviewer.
- Comandos `/sdd-*` integrados (decisión #71): orchestrator o reviewer, argumento `<categoria>/<Name>`;
  MCP `chrome-devtools` solo para el reviewer (`/sdd-validate`); `/constitution` sin cambios.
- Permisos (#72, #73): edición por grupo con `"*": deny` (foundation → app; component-builder →
  `src/components/**`; integrator → rutas de F4); reviewer e integrator corren `validate:content`.
- Después de F1 nadie edita `src/test/**` ni configs: si un plan lo pide, decidir quién (consultar).
- Plan + Tareas se aprueban **por fase** (decisión #74): `/sdd-plan F2` redacta los de todas las piezas, una
  puerta; Clarificación de la fase antes. Pieza suelta y Cambio: puertas propias.
- Pendientes: fricción restante (opciones 1 `ask` doble en `spec.md` y 2 Clarificación sin hallazgos);
  `## No hacer` en 9 specs; QA visual.
