# Agentes (OpenCode)

Los 5 agentes se escribieron **desde cero** para este proyecto y el proyecto
arranca **sin base de aprendizajes**.

Ya están en su **ubicación final**: OpenCode lee `AGENTS.md` (raíz) y los
agentes de **`.opencode/agents/`** (carpeta en plural, según la documentación
vigente de OpenCode). No hay plantillas ni paso de instalación: si se edita un
agente, se edita acá.

> Esta documentación vive en `docs/agents.md` y **no** dentro de
> `.opencode/agents/` a propósito: OpenCode trataría cualquier `.md` de esa
> carpeta como un agente.

## Formato de los agentes

- Encabezado YAML con `description` (entre comillas), `mode`
  (`primary` | `subagent`), `permission` y, en los subagentes, `steps`.
- **`permission` reemplaza a `tools`**, que OpenCode marca como obsoleto.
  Claves usadas: `edit` (cubre write y patch), `bash` (reglas por patrón;
  **gana la última que coincide**, por eso `"*"` va primero), `task` (qué
  subagentes puede invocar) y `webfetch`.
- **Sin `model`**: el orchestrator usa el modelo global y los subagentes
  heredan el del agente que los invoca.
- `steps`: tope de iteraciones por invocación (valores iniciales, ajustables);
  refuerza la regla de máximo 3 rondas de corrección.

| Agente | edit | bash | task | steps |
|---|---|---|---|---|
| orchestrator | `README.md`, `docs/diagnostics.md`, `docs/memory.md` (estado y memoria); `specs/**/plan.md` y `specs/**/tasks.md` (los redacta y marca tareas); `spec.md` solo con `ask`; skill `sdd` | solo verificaciones y lectura de git | solo los 4 subagentes | — |
| foundation | solo la app: `src/**`, `public/**`, `index.html`, `package*.json`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `.nvmrc`, `.gitignore` | `ask` por defecto; instalación, scaffold, `git init`, `git add` y `git commit -m` permitidos; `push`, `--amend`, `reset --hard` y `rm -rf` denegados | deny | 150 |
| component-builder | solo `src/components/**`; skill `sdd` | verificaciones (lint, typecheck, test), lectura de git, `git add` y `git commit -m` (sin `--amend`) | deny | 80 |
| integrator | solo `src/content/**`, `src/pages/**`, `src/lib/**`, `src/components/AppLayout/**`, `src/styles/**`, `src/i18n/**`, `src/App.tsx`, `src/main.tsx`; skill `sdd` | verificaciones, build, `validate:content`, dev, `git add` y `git commit -m` (sin `--amend`) | deny | 120 |
| reviewer | deny | solo verificaciones, build, `validate:content`, lectura de git y `grep`; único con el MCP `chrome-devtools_*` | deny | 60 |

**Edición por grupo** (decisiones #72 y #73): foundation, component-builder e
integrator tienen `edit` con `"*": deny` y solo permiten las rutas de su grupo
(tabla de arriba). El kit (`README.md`, `AGENTS.md`, `opencode.json`, `docs/**`,
`tokens/**`, `foundations/**`, `specs/**`, `data/**`, `.opencode/**`) queda
denegado para los tres. El límite es por grupo, no por pieza: component-builder
puede escribir en cualquier `src/components/<Name>/`; que use solo el de su
tarea lo fija su prompt y lo controla el reviewer. Fuera de esas rutas (por
ejemplo `src/test/`) ningún subagente escribe después de F1. Los `data/*.generated.*` no son excepción de `edit`: se
regeneran solo con scripts (`gen:types`, `build:validator`). El permiso `edit`
no cubre bash (`cp`, `npm run`): eso lo cubren la regla del prompt y el reviewer.

**Commits (decisiones F3 y #69):** los hacen foundation, component-builder e
integrator, con `git commit -m`. **Por cada tarea (Tn de `tasks.md`):**
`test(<Name>): Tn` con los tests en rojo → `feat(<Name>): Tn` con la
implementación → `fix(<Name>): Tn` si hay correcciones. `feat`/`fix` no tocan
tests; `test` solo agrega. El orchestrator marca la tarea en `tasks.md` cuando el
reviewer la aprueba. `--amend`, `reset --hard` y `push` están denegados. El reviewer
y el orchestrator no commitean.

## Agentes

| Agente | Modo | Escribe código | Responsabilidad |
|---|---|---|---|
| [orchestrator](../.opencode/agents/orchestrator.md) | primary | No | Recorre F1–F5, delega, frena en cada puerta para aprobación del usuario |
| [foundation](../.opencode/agents/foundation.md) | subagent | Sí | F1: scaffold de la app en la raíz, tooling, alias `@data`, tokens, fuente, providers, script anti-flash |
| [component-builder](../.opencode/agents/component-builder.md) | subagent | Sí | F2–F3: un componente por vez, TDD estricto desde su spec |
| [integrator](../.opencode/agents/integrator.md) | subagent | Sí | F4: páginas, contenido en/es, `useHashTab`, AppLayout, print |
| [reviewer](../.opencode/agents/reviewer.md) | subagent | No | F5 y al final de cada fase: verificación independiente con contexto limpio |

## Flujo

```
Usuario ──► orchestrator
              │
   F1 ────────┼──► foundation ──► reviewer ──► PUERTA (usuario aprueba)
   F2 ────────┼──► Clarificación de cada pieza (si hay dudas)
              │    plan.md + tasks.md de las 11 primitivas ──► PUERTA Plan + Tareas
              │    component-builder × N (de a una pieza, de a una Tn)
              │        └─► reviewer por tarea y por pieza ──► PUERTA por pieza
              │                                   ──► PUERTA F2
   F3 ────────┼──► ídem F2 con los 12 compuestos (en orden de dependencias)
              │                                   ──► PUERTA F3
   F4 ────────┼──► ídem con integrator            ──► PUERTA F4
   F5 ────────┴──► plan + tareas de QA ──► reviewer (QA completo: 4 viewports × 2 temas × 2 idiomas)
                                                  ──► PUERTA FINAL
```

El orden y las dependencias de los componentes están en
[specs/README.md](../specs/README.md).

## Comandos `/sdd-*`

Atajos del flujo SDD en `.opencode/commands/`. Cada uno corre con un agente
del proyecto (nunca con los nativos `plan`/`build`), así que respeta sus
permisos, la constitución y la skill `sdd`. El argumento es la carpeta de la
spec, `<categoria>/<Name>` (por ejemplo `primitives/Badge`).

| Comando | Agente | Qué hace |
|---|---|---|
| `/sdd-status <cat>/<Name>` | orchestrator | Fase, tareas hechas y siguiente comando (no modifica nada) |
| `/sdd-spec <cat>/<Name> <idea>` | orchestrator | Entrevista y redacta una spec nueva (`spec.md` con `ask`) |
| `/sdd-clarify <cat>/<Name>` | reviewer | QA de la spec: ambigüedades, contradicciones, RF sin test; no resuelve |
| `/sdd-change <cat>/<Name> <cambio>` | orchestrator | Propone el cambio en la spec (con `ask`); después siguen plan y tareas |
| `/sdd-plan F2` · `/sdd-plan <cat>/<Name>` | orchestrator | Con una fase: `plan.md` + `tasks.md` de todas sus piezas, una sola puerta. Con una pieza suelta o un Cambio: solo `plan.md` (puerta de Plan) |
| `/sdd-task <cat>/<Name>` | orchestrator | `tasks.md` de una pieza suelta o de un Cambio (puerta de Tareas) |
| `/sdd-implement <cat>/<Name> Tn` | orchestrator | Delega UNA tarea (test → feat), pide revisión, marca la tarea y para |
| `/sdd-validate <cat>/<Name>` | reviewer | Revisión completa RF por RF: `npm test` + MCP de Chrome DevTools |

- **`/sdd-validate` y el MCP:** `opencode.json` (raíz) declara el servidor
  local `chrome-devtools` (`npx -y chrome-devtools-mcp`, requiere Node ≥ 20.19;
  el proyecto usa 24). Sus herramientas se llaman `chrome-devtools_*`:
  `opencode.json` las deniega para todos (`"permission": {"chrome-devtools_*": "deny"}`)
  y **solo el reviewer** las habilita en su encabezado (la regla del agente se
  aplica después de la global; verificado con `opencode debug agent`). El reviewer no puede iniciar `npm run dev`: si la app no
  está servida, lo pide; si el MCP no responde, lista esos RF como "sin verificar
  (QA visual)".
- **`/constitution`** es el prompt original con el que se redactó
  `docs/constitution.md`; se conserva tal cual y no forma parte del flujo.
- Los comandos son opcionales: lo mismo se le puede pedir al orchestrator en
  lenguaje natural.
