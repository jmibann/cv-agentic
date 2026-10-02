# Memoria del proyecto — cv-agentic (`docs/memory.md`)

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.
La actualiza **solo el orchestrator** al cerrar cada fase SDD (los subagentes tienen `edit` denegado).

## Estado actual

- Kit completo y auditado: reglas, tokens, fundamentos, 27 specs, esquema de datos.
- **Modelo único de spec aprobado**: `specs/<categoria>/<Name>/spec.md` con `Estado: aprobada` y `Requisitos (EARS)` en las 27.
- Git baseline + commits solo docs/chore; **no existen `src/`, `package.json` ni la app** (las crea F1/foundation).
- **Auditoría de arquitectura 2026-10-02**: 6 puntos corregidos (#75–#80); re-auditoría: 4 medios (#81–#82); tercera: 2 altos (#83 `git -c` en permisos, #84 F1 con Tn).
- Próximo hito: kickoff de F1: `/sdd-spec foundation/Foundation` → `/sdd-plan F1` → foundation por Tn (#84).

## Decisiones (y por qué)

- **Modelo de spec**: una carpeta por pieza; `spec.md` es el contrato y lo escribe/ aprueba el usuario,
  `plan.md`/`tasks.md` los redacta el orchestrator en sus puertas (evita specs duplicadas con la skill `sdd`).
- **#75 P2 aclarado**: nadie edita `spec.md` sin aprobación explícita (orchestrator con `ask`).
- **#76 Commits de documentos**: el orchestrator commitea solo `README.md`, `docs/*`, `specs/*` en
  verde y con rutas explícitas (nunca `git add .`/`-A`); reviewer no commitea.
- **#77/#78 Skills**: kickoff ya no cita skills TDD/frontend (van en los prompts, skill `sdd`);
  `skill` declarada en los 5 agentes (foundation y reviewer = todas, el resto = solo `sdd`).
- **#79 `/constitution` eliminado** (referencias limpiadas). **#80 DoD**: `build` por pieza,
  `lint`/`typecheck`/`test` por tarea.
- **EARS**: 3–8 `RF-n`, derivados solo de `Propósito`, `Estados`, `Responsive`, `Accesibilidad` y
  `Tests esperados`; si un RF no tiene contrapartida en "Tests esperados" **no se agrega el test** (se reporta).
- **P1 actualizado** con aprobación explícita + decisión #68 (la constitución exige ambas).
- Commits con `git -c user.name="jmiban" commit -m` (permitido en bash por #83); no tocar git config; sin `--amend`.
- `## No hacer` sigue faltando en 9 specs (decisión B2, pendiente).

## Aprendizajes y errores a evitar

- No pasadas globales de rename sobre `docs/diagnostics.md`: son referencias históricas (`components/...`).
- zsh no separa `$var` por espacios: usar `git ls-files -z '*.md' | xargs -0 perl -pi -e '...'`.
- Links entre specs de carpetas distintas necesitan `../../` (un `../` queda roto; verificar con un checker).
- Plantilla: "10 secciones + Estado + EARS" y `Requisitos` **justo después** de `Propósito` (no siempre antes de Anatomía).
- La memoria vive en `docs/memory.md`, no en la raíz (decisión #70); skill, orchestrator y `AGENTS.md` apuntan acá.

## Próximos pasos

- F1 (foundation): pieza `foundation/Foundation`, Tn con test → feat también en tooling; sin `chore: scaffold app`.
- **Unidad de trabajo por tarea** (decisión #69): `test(<Name>): Tn` → `feat(<Name>): Tn`; `feat`/`fix` no tocan
  tests y `test` solo agrega; el orchestrator escribe `plan.md`/`tasks.md` y marca cada Tn tras el OK del reviewer.
- Comandos `/sdd-*` (decisión #71): orchestrator o reviewer, argumento `<categoria>/<Name>`; MCP `chrome-devtools` solo para el reviewer.
- Permisos (#72, #73): edición por grupo con `"*": deny` (foundation → app; component-builder → `src/components/**`; integrator → F4); reviewer e integrator corren `validate:content`.
- Después de F1 nadie edita `src/test/**` ni configs: si un plan lo pide, decidir quién (consultar).
- Plan + Tareas se aprueban **por fase** (decisión #74): `/sdd-plan F2` redacta los de todas las piezas, una
  puerta; Clarificación de la fase antes. Pieza suelta y Cambio: puertas propias.
- Pendientes: fricción restante (opciones 1 `ask` doble en `spec.md` y 2 Clarificación sin hallazgos);
  `## No hacer` en 9 specs; QA visual.
