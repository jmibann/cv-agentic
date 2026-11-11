# Agentes (OpenCode)

Los 5 agentes se escribieron **desde cero** para este proyecto y el proyecto
arranca **sin base de aprendizajes**; la memoria entre sesiones vive en
`docs/memory.md` (solo la edita el orchestrator).

Ya están en su **ubicación final**: OpenCode lee `AGENTS.md` (raíz) y los
agentes de **`.opencode/agents/`** (carpeta en plural, según la documentación
vigente de OpenCode). No hay plantillas ni paso de instalación: si se edita un
agente, se edita acá.

> Esta documentación vive en `docs/agent-system.md` y **no** dentro de
> `.opencode/agents/` a propósito: OpenCode trataría cualquier `.md` de esa
> carpeta como un agente. Se llamaba `docs/agents.md`: se renombró
> (decisión #92) porque en sistemas de archivos que no distinguen mayúsculas
> (macOS) chocaba con `AGENTS.md` y algunas herramientas lo tomaban como
> instrucciones del directorio `docs/`.

## Formato de los agentes

- Encabezado YAML con `description` (entre comillas), `mode`
  (`primary` | `subagent`), `permission` y, en los subagentes, `steps`.
- **`permission` reemplaza a `tools`**, que OpenCode marca como obsoleto.
  Claves usadas: `edit` (cubre write y patch), `bash` (reglas por patrón;
  **gana la última que coincide**, por eso `"*"` va primero), `task` (qué
  subagentes puede invocar), `skill` (qué skills puede cargar: `"*": deny` +
  lista de permitidas, o `allow` para todas) y `webfetch`.
- **`skill` (decisiones #78 y #87)** está declarada en los 5 agentes, siempre
  como lista explícita (`"*": deny` + permitidas): los 5 cargan **`sdd`** y el
  reviewer además la global `browser-testing-with-devtools` (QA visual). OpenCode
  también ve las skills globales de `~/.agents/skills` y `~/.claude/skills`
  (por ejemplo `spec-driven-development`, que crearía un `SPEC.md` paralelo, o
  `git-workflow-and-versioning`): ninguna queda habilitada. El flujo TDD va
  embebido en los prompts.
- **Sin `model`**: el orchestrator usa el modelo global y los subagentes
  heredan el del agente que los invoca.
- `steps`: tope de iteraciones por invocación (valores iniciales, ajustables);
  refuerza la regla de máximo 3 rondas de corrección.

| Agente | edit | bash | task | skill | steps |
|---|---|---|---|---|---|
| orchestrator | `README.md`, `docs/diagnostics.md` (log; formato, tabla Abiertos y poda #98), `docs/memory.md` (estado y memoria); `docs/qa-report.md` (informe de F5, #85); `docs/README.md` y `docs/agent-system.md` (registro de decisiones y doc de agentes, #95); `specs/**/plan.md` y `specs/**/tasks.md` (los redacta y marca tareas); `spec.md` solo con `ask` | verificaciones, lectura de git, y `git add`/`git [-c user.name=…] commit -m` acotados a `README.md`, `docs/*` y `specs/*` (decisión #76; sin `--amend` ni `--no-verify`, sin `git add .`/`-A`) | solo los 4 subagentes | `sdd` | — |
| foundation | solo la app: `src/**`, `public/**`, `index.html`, `package*.json`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `.nvmrc`, `.gitignore` | `ask` por defecto; instalación, scaffold, `git init`, `git add` y `git [-c user.name=…] commit -m` permitidos; `push`, `--amend`, `--no-verify`, `reset --hard` y `rm -rf` denegados | deny | `sdd` | 150 |
| component-builder | solo `src/components/**` | verificaciones (lint, typecheck, test), lectura de git, `git add` y `git [-c user.name=…] commit -m` (sin `--amend` ni `--no-verify`) | deny | `sdd` | 80 |
| integrator | solo `src/content/**`, `src/pages/**`, `src/lib/**`, `src/components/AppLayout/**`, `src/styles/**`, `src/i18n/**`, `src/App.tsx`, `src/main.tsx` | verificaciones, build, `validate:content`, `git add` y `git [-c user.name=…] commit -m` (sin `--amend` ni `--no-verify`; `npm run dev` denegado, #91) | deny | `sdd` | 120 |
| reviewer | deny | solo verificaciones, build, `validate:content`, lectura de git y `grep`; único con el MCP `chrome-devtools_*` | deny | `sdd`, `browser-testing-with-devtools` | 60 |

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

**Commits (decisiones F3, #69 y #76):** los de código los hacen foundation,
component-builder e integrator, con `git -c user.name="jmiban" commit -m` (identidad por flag, decisión #83). **Por cada tarea (Tn de
`tasks.md`):** `test(<Name>): Tn` con los tests en rojo → `feat(<Name>): Tn`
con la implementación → `fix(<Name>): Tn` si hay correcciones. `feat`/`fix` no
tocan tests; `test` solo agrega. El orchestrator marca la tarea en
`tasks.md` cuando el reviewer la aprueba y **commitea él mismo los
documentos** (`git add` acotado a `README.md`, `docs/*` y `specs/*` +
`git commit -m`, solo con el repo en verde, con mensaje en inglés y sin
`git add .`/`-A`). `--amend`, `--no-verify` (#93), `reset --hard` y `push` están denegados. El
reviewer no commitea.

**Límite conocido de los patrones bash (decisión #88):** en OpenCode `*`
acepta cualquier texto, espacios incluidos, así que `"git add specs/*"` también
deja pasar `git add specs/x src/y`, y `git commit -m *` commitea todo lo que
esté en staging. La garantía "el orchestrator solo commitea documentos" la dan
dos controles: el orchestrator revisa `git diff --cached --name-only` antes de
cada commit, y el reviewer, en cada revisión completa de pieza y de fase,
verifica con `git show --stat` que los commits `docs(...)` desde la puerta
anterior solo tocan `README.md`, `docs/**` o `specs/**`.

## Agentes

| Agente | Modo | Escribe código | Responsabilidad |
|---|---|---|---|
| [orchestrator](../.opencode/agents/orchestrator.md) | primary | No | Recorre F1–F5, delega, frena en cada puerta para aprobación del usuario |
| [foundation](../.opencode/agents/foundation.md) | subagent | Sí | F1: una Tn por vez de `specs/foundation/Foundation/` (decisión #84): scaffold de la app en la raíz, tooling, alias `@data`, tokens, fuente, providers, script anti-flash |
| [component-builder](../.opencode/agents/component-builder.md) | subagent | Sí | F2–F3: un componente por vez, TDD estricto desde su spec |
| [integrator](../.opencode/agents/integrator.md) | subagent | Sí | F4: páginas, contenido en/es, `useHashTab`, AppLayout, print |
| [reviewer](../.opencode/agents/reviewer.md) | subagent | No | F5 y al final de cada fase: verificación independiente con contexto limpio |

## Flujo

```
Usuario ──► orchestrator
              │
   F1 ────────┼──► spec de foundation/Foundation (/sdd-spec) ──► PUERTA spec
              │    plan.md + tasks.md de Foundation ──► PUERTA Plan + Tareas
              │    foundation × Tn (test → feat) ──► reviewer por tarea y pieza
              │                                   ──► PUERTA F1
   F2 ────────┼──► Clarificación de cada pieza (reviewer detecta; puerta solo con hallazgos, #90)
              │    plan.md + tasks.md de las 11 primitivas ──► PUERTA Plan + Tareas
              │    component-builder × N (de a una pieza, de a una Tn)
              │        └─► reviewer por tarea y por pieza ──► PUERTA por pieza
              │                                   ──► PUERTA F2
   F3 ────────┼──► ídem F2 con los 12 compuestos (en orden de dependencias)
              │                                   ──► PUERTA F3
   F4 ────────┼──► ídem con integrator            ──► PUERTA F4
   F5 ────────┴──► reviewer (QA completo: 4 viewports × 2 temas × 2 idiomas; sin Tn, #85)
                   └─► informe en docs/qa-report.md ──► defectos como tareas de su pieza
                                                  ──► PUERTA FINAL
```

El orden y las dependencias de los componentes están en
[specs/README.md](../specs/README.md).

## Modo mantenimiento (desde 2026-10-08)

F1–F5 cerradas (ver §XII en `docs/diagnostics.md` y `docs/qa-report.md`). No
quedan puertas de fase abiertas; el sistema sigue operativo para mantenimiento
con los mismos 5 agentes, la skill `sdd` y los `/sdd-*`. Trabajo abierto al
2026-11-11: base de deploy para GitHub Pages cerrada (§XIV); **motion** aprobado
pero sin implementar (`specs/motion/proposal.md`) y **Cambio de contenido**
bloqueado por el CV real y el OK a los tests de AboutPage (#106–#108; tabla
**Abiertos** de diagnostics):

| Tarea futura | Flujo | Dueño |
|---|---|---|
| Actualizar el CV (contenido bilingüe, avatar, `downloadCvUrl`) | sin spec nueva: encargo simple + `npm run validate:content` + `npm test`; si toca contrato, es Cambio | `integrator` (`src/content/**`) |
| Modificar una pieza existente | `/sdd-change <cat>/<Name>` (spec con `ask` → plan → tareas → Tn) | su builder (F2/F3) o `integrator` (F4) |
| Pieza/función nueva (BACKLOG) | `/sdd-spec` → `/sdd-plan <cat>/<Name>` → Tn (`/sdd-implement`) → `/sdd-validate` | según su carpeta |
| Verificar en el sitio servido | `/sdd-validate` o una pasada corta priorizada (el presupuesto del reviewer se agota en pasadas amplias — lección F5) | `reviewer` (único con MCP de Chrome) |

Cuentas de cada loop: marcar tareas + commitear docs (orchestrator), revisión
independiente (reviewer), y **push siempre del usuario** (#91/#76: ningún agente
sube ni toca `git config`). La memoria (`docs/memory.md`) se actualiza ante
decisiones de reglas o al cerrar puertas de pieza suelta; el log, con su
formato (#98).

## Comandos `/sdd-*`

Atajos del flujo SDD en `.opencode/commands/`. Cada uno corre con un agente
del proyecto (nunca con los nativos `plan`/`build`), así que respeta sus
permisos, la constitución y la skill `sdd`. El argumento es la carpeta de la
spec, `<categoria>/<Name>` (por ejemplo `primitives/Badge`).

| Comando | Agente | Qué hace |
|---|---|---|
| `/sdd-status <cat>/<Name>` | orchestrator | Fase, tareas hechas y siguiente comando (no modifica nada) |
| `/sdd-spec <cat>/<Name> <idea>` | orchestrator | Entrevista y redacta una spec nueva (`spec.md` con `ask`) |
| `/sdd-clarify <cat>/<Name>` | reviewer | QA de la spec: ambigüedades, contradicciones, RF sin test; no resuelve (lo resuelve el orchestrator con el usuario). "Sin hallazgos" en una spec aprobada → sin puerta (#90) |
| `/sdd-change <cat>/<Name> <cambio>` | orchestrator | Propone el cambio en la spec (con `ask`); después siguen plan y tareas |
| `/sdd-plan F1…F4` · `/sdd-plan <cat>/<Name>` | orchestrator | Con una fase: `plan.md` + `tasks.md` de todas sus piezas, una sola puerta. Con una pieza suelta o un Cambio: solo `plan.md` (puerta de Plan) |
| `/sdd-task <cat>/<Name>` | orchestrator | `tasks.md` de una pieza suelta o de un Cambio (puerta de Tareas) |
| `/sdd-implement <cat>/<Name> Tn` | orchestrator | Delega UNA tarea (test → feat), pide revisión, marca la tarea y para |
| `/sdd-validate <cat>/<Name>` | reviewer | Revisión completa RF por RF: `npm test` + `npm run build` + MCP de Chrome DevTools (app servida por el usuario, #91) |

- **`/sdd-validate` y el MCP:** `opencode.json` (raíz) declara el servidor
  local `chrome-devtools` con versión fija (`npx -y chrome-devtools-mcp@1.10.1`,
  decisión #91; requiere Node ≥ 20.19, el proyecto usa 24; subirla es una
  decisión del usuario). Con `enabled: true` el servidor arranca en todas las
  sesiones aunque solo el reviewer pueda usarlo (OpenCode no habilita un MCP por
  agente; es un costo de arranque aceptado). Sus herramientas se llaman `chrome-devtools_*`:
  `opencode.json` las deniega para todos (`"permission": {"chrome-devtools_*": "deny"}`)
  y **solo el reviewer** las habilita en su encabezado (la regla del agente se
  aplica después de la global; verificado con `opencode debug agent`). **Servidor de desarrollo (#91):** ningún agente
  corre `npm run dev` (es un proceso que no termina y bloquea al agente). Lo
  levanta **el usuario** en su terminal antes de `/sdd-validate`, del cierre de
  pieza con QA visual y de F5; el orchestrator lo pide antes de invocar al
  reviewer y le pasa la URL (`http://localhost:5173`). Si la app no responde o
  el MCP falla, el reviewer no frena a mitad: lista esos RF como "sin verificar
  (QA visual)" y lo dice en el informe.
- **`/constitution` fue eliminado** (decisión #79): el prompt original ya no
  aplica y `docs/constitution.md` es la fuente viva.
- Los comandos son opcionales: lo mismo se le puede pedir al orchestrator en
  lenguaje natural.
