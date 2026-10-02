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
| foundation | allow | `ask` por defecto; instalación, scaffold, `git init`, `git add` y `git commit -m` permitidos; `push`, `--amend`, `reset --hard` y `rm -rf` denegados | deny | 150 |
| component-builder | allow, salvo `specs/**` y `docs/memory.md` (deny); skill `sdd` | verificaciones (lint, typecheck, test), lectura de git, `git add` y `git commit -m` (sin `--amend`) | deny | 80 |
| integrator | allow, salvo `specs/**` y `docs/memory.md` (deny); skill `sdd` | verificaciones, build, dev, `git add` y `git commit -m` (sin `--amend`) | deny | 120 |
| reviewer | deny | solo verificaciones, build, lectura de git y `grep` | deny | 60 |

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
   F2 ────────┼──► component-builder × N (primitivas, de a una)
              │        └─► reviewer por componente
              │                                   ──► PUERTA
   F3 ────────┼──► component-builder × N (compuestos, de a uno, en orden de dependencias)
              │        └─► reviewer por componente
              │                                   ──► PUERTA
   F4 ────────┼──► integrator ──► reviewer        ──► PUERTA
   F5 ────────┴──► reviewer (QA completo: 4 viewports × 2 temas × 2 idiomas)
                                                  ──► PUERTA FINAL
```

El orden y las dependencias de los componentes están en
[specs/README.md](../specs/README.md).
