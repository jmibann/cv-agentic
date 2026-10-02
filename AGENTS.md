# AGENTS.md — cv-agentic

Sitio CV personal. **Proyecto único** (un solo `package.json`, sin
workspaces): el kit de diseño y la app conviven en la raíz. **Node 24 LTS**
(`.nvmrc`); versiones según `docs/README.md` → "Entorno y dependencias aprobadas".

## Estructura

```
cv-agentic/
├─ AGENTS.md                  (este archivo)
├─ README.md                  índice corto
├─ docs/                      README completo, DESIGN, BACKLOG, diagnostics, agents.md, tokens/ (breakpoints, contraste)
├─ tokens/                    tokens.css (lo importa la app)
├─ foundations/               tipografía, layout, movimiento, theming, i18n
├─ specs/                     una carpeta por pieza: <categoria>/<Name>/spec.md (primitives, controls, layout, content, pages, hooks)
├─ data/                      cv.schema.json (fuente de verdad), constants.ts, ejemplos JSON y *.generated.* (alias @data)
├─ .opencode/agents/          los 5 agentes (orchestrator, foundation, component-builder, integrator, reviewer)
├─ package.json               scripts: dev, lint, typecheck, test, build (los crea la Fase 1)
├─ index.html                 incluye el script anti-flash (tema, idioma y theme-color)
├─ public/                    images/ (placeholders del contenido de ejemplo)
├─ vite.config.ts · tsconfig.json (uno solo) · eslint.config.js · .nvmrc
└─ src/
   ├─ main.tsx                importa ../tokens/tokens.css, fuente y estilos base; monta providers
   ├─ styles/global.css       reset + base tipográfica (solo tokens)
   ├─ providers/              ThemeProvider, LocaleProvider (+ hooks)
   ├─ i18n/                   ui.en.ts, ui.es.ts, format.ts, formatPeriod.ts
   ├─ content/                cv.en.json, cv.es.json (editables), index.ts, content.test.ts, schema.test.ts
   ├─ lib/                    useHashTab y otras funciones puras compartidas
   ├─ components/<Name>/      <Name>.tsx, <Name>.module.css, <Name>.test.tsx, index.ts
   ├─ pages/                  AboutPage, ResumePage
   └─ test/                   setup.ts (jest-dom, mocks: matchMedia, dialog, ResizeObserver, scrollTo) · a11y.ts (expectNoA11yViolations, axe-core)
```

`specs/` contiene las **especificaciones**; `src/components/` el **código**.
No confundirlas.

## Fuente de verdad

**`docs/constitution.md` está por encima de todo** (incluido este archivo):
reglas no negociables de stack, spec antes que código, separación de
responsabilidades, tests, protección de datos e idioma (S1–S5, P1–P5,
C1–C4, T1–T5, D1–D6, L1–L3). Si algo la contradice, se frena y se consulta.

Debajo de la constitución, **el kit de diseño manda** (`docs/`, `tokens/`,
`foundations/`, `specs/`, `data/`). Antes de tocar código, leer:

1. `docs/constitution.md` (reglas no negociables)
2. `docs/DESIGN.md` (reglas duras de diseño)
3. `tokens/tokens.css` + `docs/tokens/` (contraste, breakpoints)
4. La spec del componente en `specs/<categoria>/<Name>/spec.md`

Si la spec y el código no coinciden, **gana la spec**. Si la spec parece
equivocada o incompleta, **se frena y se consulta al usuario**; no se
"corrige" la spec por cuenta propia.

## Memoria
- Al empezar, lee `memory.md` para conocer el estado del proyecto y las decisiones tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales).

## Comandos (desde la raíz)

| Comando | Qué hace |
|---|---|
| `npm install` | Instala las dependencias |
| `npm run dev` | Vite dev server |
| `npm run lint` | ESLint con `--max-warnings 0` |
| `npm run typecheck` | `tsc --noEmit` (un solo `tsconfig.json`: `src/`, `data/`, `vite.config.ts`) |
| `npm test` | Vitest en modo run |
| `npm run build` | `prebuild` (genera tipos y validador, valida el contenido) + `tsc --noEmit && vite build` |
| `npm run gen:types` | Regenera `data/cv.types.generated.ts` desde `data/cv.schema.json` |
| `npm run validate:content` | Valida `src/content/cv.*.json` contra el esquema |

**Definition of done** de cualquier tarea: `lint`, `typecheck`, `test` y
`build` en verde, sin warnings, **después del commit de implementación**
(entre el commit de tests en rojo y el de implementación el repo está en
rojo a propósito).

## Convenciones

- TypeScript `strict`, `noUnusedLocals`, `noUnusedParameters`,
  `noUncheckedIndexedAccess`. Sin `any`, sin `@ts-ignore`, sin `eslint-disable`.
  Parámetros sin usar a propósito: prefijo `_`.
- Componentes: función con named export + `export interface <Name>Props`.
  Sin `React.FC`. Sin default exports (salvo donde la herramienta lo exija).
- Estilos: **solo CSS Modules** y **solo tokens semánticos**. Cero colores
  literales fuera de `tokens.css`.
- Mobile-first con 580 / 768 / 992 / 1200. Toda medida que cambia por
  breakpoint es un token de `tokens.css`; en el `@media` de un componente solo
  hay cambios de layout (y, si hace falta, tokens, `calc()` de tokens o `0`).
- Foco: siempre el anillo estándar (`--focus-ring-width` / `--focus-ring-offset`).
- `z-index` siempre con un token `--z-*`.
- Textos: contenido desde `useCv()` (solo en páginas/AppLayout), interfaz
  desde `useLocale().t`. Nada hardcodeado en componentes.
- Commits: Conventional Commits. Por cada componente/pieza, en este orden:
  `test(<Name>): add failing tests from spec` (solo el test, en rojo) →
  `feat(<Name>): implement to spec` → `fix(<Name>): …` si hay correcciones.
  Sin `--amend`, sin reescribir historia, sin push (salvo pedido del usuario).
- **Construcción de a una pieza por vez** (sin paralelismo): los tests en rojo
  rompen el `typecheck` global y todos comparten la carpeta de trabajo.

## Tests

- Vitest + React Testing Library + `@testing-library/user-event` + `axe-core`
  (helper `expectNoA11yViolations` de `src/test/a11y.ts`).
- Queries por rol y nombre accesible. `data-testid` solo como último recurso,
  justificado.
- Cada archivo de test de componente termina con un caso `expectNoA11yViolations`.
- **Nunca debilitar un test para que pase.** Borrar o relajar una aserción,
  agregar `.skip`/`.only`, o cambiar lo que un test espera **es un cambio de
  spec** y lo decide el usuario.
- Los tests de un componente se escriben **antes** que su implementación y
  se commitean en rojo (`test(<Name>)`) antes de implementar. Después de ese
  commit el archivo de test **no cambia**: el reviewer lo verifica con
  `git diff <commit de test> HEAD -- <archivo de test>`.

## Dependencias

Solo las listadas en `docs/README.md` → "Dependencias
aprobadas". Cualquier otra: consultar al usuario.

## Límites

- No modificar el kit de diseño (`README.md`, `AGENTS.md`, `docs/`, `tokens/`,
  `foundations/`, `specs/`, `data/`, `.opencode/`) salvo pedido explícito del usuario.
  Excepciones: `data/*.generated.*` se regeneran con los scripts, nunca a mano;
  el orchestrator actualiza `README.md` ("Estado actual") y `docs/diagnostics.md`
  al cerrar cada puerta.
- **El contenido del CV se edita solo en `src/content/cv.{en,es}.json`**; su
  formato lo define `data/cv.schema.json`.
- No crear archivos fuera de la carpeta asignada en la tarea.
- Máximo **3 rondas** de "corregir y volver a verificar" por tarea; si sigue
  fallando, frenar y reportar con la salida exacta de los comandos.
