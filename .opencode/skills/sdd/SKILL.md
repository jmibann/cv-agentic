---
name: sdd
description: Úsala siempre que trabajes con Spec-Driven Development en este proyecto (docs/constitution.md o cualquier archivo dentro de specs/) - redactar, revisar o cambiar specs, planes y tareas, o implementar y validar tareas de una spec.
---

# Spec-Driven Development (SDD)

## Flujo

Constitución → Spec → Clarificación → Plan → Tareas → Implementación → Validación.

Cambio: puede ocurrir en cualquier momento y siempre vuelve a empezar por la Spec.

- Nunca pases a la siguiente fase sin la aprobación explícita del usuario.
  Dos excepciones:
  - Dentro de Implementación las tareas avanzan una a una sin puerta (cada una
    validada al terminar); la puerta de Implementación + Validación se abre tras
    la revisión completa de la pieza contra la spec.
  - **Clarificación sin hallazgos** sobre una spec ya `aprobada` no abre
    puerta (decisión #90; ver Clarificación).
  - **Plan y Tareas se aprueban por fase F** (F1–F4): se redactan `plan.md` y
    `tasks.md` de todas las piezas de la fase y se aprueban juntos en una sola
    puerta (ver "Ejecución con agentes"). Una pieza fuera de una fase (spec
    nueva suelta) y todo Cambio mantienen las puertas de Plan y de Tareas propias.
- La spec manda: si algo no está en la spec, no se implementa. Si falta una decisión, para y pregunta.
- Cada spec vive en su carpeta: `specs/<categoria>/<Name>/` con `spec.md`
  (obligatorio desde el inicio) y `plan.md` / `tasks.md` (se redactan en sus
  puertas). Categorías del kit: `foundation` (la pieza `Foundation` de F1,
  decisión #84), `primitives`, `controls`, `layout`, `content`, `pages`,
  `hooks`. F5 (QA) no tiene carpeta en `specs/` (decisión #85).
- **Documentos de estado (decisión #86):** al cerrar cada **puerta F** (F1–F5)
  y cuando el usuario aprueba una decisión que cambia reglas (nueva entrada en el
  registro de `docs/README.md`), actualiza `docs/memory.md`, el `README.md` de la
  raíz ("Estado actual") y agrega una entrada en `docs/diagnostics.md`. Las
  puertas de pieza (spec, Clarificación, Plan + Tareas, Implementación) solo
  actualizan `spec.md` (`Estado`) y `tasks.md`.

## Constitución

`docs/constitution.md` debe existir y estar aprobada antes de cualquier spec. Solo
la cambia el usuario. Si una spec o un plan la contradice, para y pregunta.

## Plantilla de spec (spec.md)

Para las piezas de este kit la plantilla canónica es la de
[`specs/README.md`](../../../specs/README.md) → "Plantilla de spec":

```text
# <Name>
Estado: borrador | aprobada | implementada

## Propósito
## Requisitos (EARS)
## Anatomía
## API
## Estilos y tokens
## Estados
## Responsive
## Accesibilidad
## Tests esperados
## No hacer
```

- `Estado:` va justo debajo del título y **solo cambia con aprobación del usuario**.
- `## Requisitos (EARS)` va justo después de `## Propósito`, antes de la sección que le sigue (formato más abajo).
- Las 10 secciones son obligatorias y explícitas, aunque su contenido sea
  "No es interactivo" o "No aplica" (los hooks marcan "No aplica" donde corresponde).
- Si queda alguna duda, se agrega además `## Dudas abiertas` con
  `- [NECESITA ACLARACIÓN] <duda>`.

La spec de una pieza **sí** incluye stack y nombres de archivos (API, tokens,
estructura HTML): es el contrato que verifican el implementador y el reviewer.
La regla "solo el QUÉ y el POR QUÉ" aplica a specs de dominio nuevas que no
sean piezas del kit.

## Requisitos en EARS (en español)

- RF-x: CUANDO <evento>, EL SISTEMA <respuesta>.
- RF-x: SI <condición no deseada>, ENTONCES EL SISTEMA <respuesta>.
- RF-x: MIENTRAS <estado>, EL SISTEMA <respuesta>.
- RF-x: EL SISTEMA <comportamiento permanente>.

Cada RF debe ser verificable: nada de "rápido", "intenso" o "bonito" sin un criterio
medible.

Reglas de redacción:

- Numeración `RF-1 … RF-n` **por spec** (se reinicia en cada pieza).
- Un solo verbo observable por RF; comprobable con un test.
- **Nunca se inventa alcance**: un RF de una pieza del kit solo se deriva de las
  secciones ya existentes (`Propósito`, `Estados`, `Responsive`,
  `Accesibilidad`, `Tests esperados`). Si un RF no tiene contraparte en
  `Tests esperados`, **no se agrega el test**: se reporta al usuario.

## Clarificación

Lista todas las `[NECESITA ACLARACIÓN]` y cualquier ambigüedad, y pregunta al
usuario. La spec solo se edita con sus respuestas. Cuando no quedan dudas y el
usuario la aprueba, pasa a `Estado: aprobada`.

Con agentes (decisión #90) hay **un solo camino**: el reviewer **detecta**
(`/sdd-clarify`, contexto limpio, sin proponer soluciones) y el orchestrator
**resuelve** (presenta los hallazgos al usuario y aplica sus respuestas en
`spec.md` con permiso `ask`). **Puerta solo si hay hallazgos:** si el reviewer
informa "Sin hallazgos" sobre una spec ya `aprobada`, la pieza sigue sin
puerta de Clarificación.

## Plan (plan.md)

Archivos y responsabilidades · Funciones puras (si hay lógica que depende de la
fecha, con "hoy" como parámetro) · Algoritmo en pseudocódigo (solo si hay lógica
no trivial) · Interfaz · Decisiones justificadas con su alternativa descartada ·
Estrategia de tests con `npm test` (vitest). Indica qué RF cubre cada parte.

## Tareas (tasks.md)

```text
- [ ] **Tn. <Descripción>.** RF-x, RF-y
  - Hecho cuando: <comprobación verificable>.
```

Máximo 20-30 min por tarea, en orden de dependencia. Si salen más de 10, propón dividir
la spec.

## Implementación

Una sola tarea cada vez: tests primero (en rojo), después el código, `npm run lint`,
`npm run typecheck` y `npm test` en verde, reportar y parar. **Quien implementa
no marca la tarea**: la marca el orchestrator en `tasks.md` después del OK del
reviewer (los subagentes no escriben en `specs/`).

## Validación

- Cada tarea se verifica contra su "Hecho cuando": por tarea alcanza `lint` +
  `typecheck` + `test` en verde; el `build` corre **al cerrar la pieza** y en
  cada puerta (decisión #80).
- Al terminar la última tarea, revisión completa contra la spec (cada RF, casos
  límite y criterios de finalización).
- Con la revisión OK y la aprobación del usuario, la spec pasa a
  `Estado: implementada`.

## Cambio

Un cambio de requisitos se hace primero en la spec, luego en el plan y las tareas, y
por último en el código. Cada paso requiere la aprobación del usuario.

## Ejecución con agentes (sitio CV)

Esta sección no cambia el flujo SDD: define quién ejecuta cada fase cuando se
trabaja con el orquestador.

- **Dos niveles.** Las fases F1–F5 del orquestador organizan el proyecto. Dentro
  de cada fase, cada pieza (componente, hook, página, y en F1 la pieza
  `foundation/Foundation`) recorre el flujo SDD completo y respeta sus puertas
  de aprobación. F1–F4 siguen el modelo Tn (decisión #84).
- **F5 (QA) no produce código ni tiene Tn (decisión #85).** Es una pasada del
  `reviewer` sobre la app completa, con la sección "QA de F5" de
  `reviewer.md` como contrato: sin `specs/qa/`, sin `plan.md`/`tasks.md` y sin
  commits `test`→`feat` (P4 no aplica porque no hay tareas ni código). El
  orchestrator guarda el informe en `docs/qa-report.md` y lo commitea
  (`docs(qa): F5 report`). Cada defecto vuelve a su pieza: si el código no
  cumple la spec, como **tarea nueva** en su `tasks.md` (puerta de Tareas de
  pieza suelta, después `/sdd-implement`); si la spec está mal, como
  **Cambio**. Con los defectos corregidos, el reviewer repite la pasada y el
  usuario cierra la puerta F5.
- **Puerta de Plan + Tareas por fase.** Al empezar F1, F2, F3 o F4, y con la
  Clarificación de todas sus piezas cerrada, el orquestador redacta `plan.md` y
  `tasks.md` de cada pieza de la fase (en el orden de `specs/README.md`) y los
  presenta juntos: una tabla por pieza (archivos, RF cubiertos, cantidad de
  tareas, decisiones con alternativa descartada) con links a los archivos. El
  usuario aprueba la fase completa o señala piezas a corregir; solo esas se
  rehacen y se vuelven a presentar. Si al implementar una pieza cambia algo que
  afecta el plan de otra ya aprobada, eso es un Cambio de esa otra pieza.
- **Roles.** El orquestador planifica, delega y frena en cada puerta; no escribe
  código ni tests. `foundation`, `component-builder` e `integrator` implementan.
  `reviewer` valida con contexto limpio: recibe la spec, la tarea (Tn con su
  "Hecho cuando") y la ruta del código, nada más.
- **Unidad de trabajo: una tarea de `tasks.md`.** Cada encargo a un subagente es
  exactamente una tarea (Tn). El subagente sigue la sección Implementación:
  tests en rojo, implementa, deja lint + typecheck + tests en verde, reporta y
  para. El orchestrator marca la tarea en `tasks.md` cuando el reviewer la
  aprueba.
- **Commits por tarea.** `test(<Name>): Tn` con los tests en rojo, después
  `feat(<Name>): Tn` con la implementación, y `fix(<Name>): Tn` si hubo
  correcciones. Los de código los hace quien implementa; el orchestrator
  commitea **solo documentos** (`README.md`, `docs/*`, `specs/*`), en verde y
  con rutas explícitas, nunca `git add .`/`-A` (decisión #76). Si un hook de
  pre-commit bloquea el commit en rojo, no se usa
  `--no-verify`: se frena y se consulta al usuario.
- **Tests que no se debilitan (por tarea).** Los commits `feat(<Name>): Tn` y
  `fix(<Name>): Tn` **no tocan** archivos de test; los commits
  `test(<Name>): Tn` solo **agregan** tests (no borran ni cambian líneas de
  tests de tareas anteriores). El reviewer lo verifica con `git log -p` sobre
  los archivos de test de la pieza.
- **Una tarea por vez.** No se paraleliza. Nunca se invoca al reviewer con el repo
  en rojo (entre el commit de test y el de implementación).
- **Validación.** El reviewer verifica cada tarea contra su "Hecho cuando". Al
  terminar la última tarea de una pieza, hace una revisión completa contra la
  spec. Si se rechaza, o si el repo queda en rojo tras la tarea, la tarea vuelve
  al mismo subagente con la salida exacta; cada vuelta cuenta como una ronda, con
  un máximo de 3. Después de eso, se frena y se reporta al usuario.
- **Cambio.** Si un subagente propone cambiar una spec, debilitar un test o
  agregar una dependencia, se frena y se consulta al usuario (coincide con
  "si falta una decisión, para y pregunta").
- **Prioridad.** `docs/constitution.md` > esta skill > spec > definición del
  agente > cualquier opinión de un agente.
