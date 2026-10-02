# Constitución — cv-agentic

Reglas no negociables. Están por encima de cualquier otro documento. Si una spec, una tarea
o un agente las contradice: frenar y consultar al usuario. Cambiar este archivo requiere
aprobación explícita del usuario y una entrada en el registro de decisiones (`docs/README.md`).
Cada regla indica cómo verificarla.

## 1. Stack simple
- **S1** Solo se instalan las dependencias listadas en `docs/README.md`; una nueva requiere aprobación del usuario. *Verificar:* comparar `package.json` con la lista.
- **S2** Un solo proyecto: un `package.json`, un `tsconfig.json`, sin workspaces ni herramientas de build extra. *Verificar:* raíz del repo.
- **S3** Estilos = CSS Modules + `tokens/tokens.css`. Sin CSS-in-JS, Tailwind ni kits de UI. *Verificar:* grep `styled-components|@emotion|tailwind`.
- **S4** Sin router, librería de estado global ni backend. Estado = estado de React + contextos de tema e idioma. *Verificar:* lista de dependencias.
- **S5** Node 24 LTS (`.nvmrc`), TypeScript `~6.0`, `^` dentro de la versión mayor documentada, `package-lock.json` commiteado. *Verificar:* `package.json`.

## 2. Spec antes que código
- **P1** No hay código sin spec en `specs/` o `foundations/`. *Verificar:* cada `src/components/<Name>/` tiene su `specs/**/<Name>/spec.md`.
- **P2** Gana la spec. Código que la contradice es un error; si la spec parece equivocada, se frena y se consulta. Los agentes nunca editan specs.
- **P3** Los tests salen de la lista de tests de la spec; nada se agrega en silencio (los extras llevan `// extra: <motivo>`).
- **P4** Por pieza: commit `test(<Name>)` (en rojo) → commit `feat(<Name>)` (en verde). *Verificar:* `git log`.
- **P5** Un cambio de spec va primero, en su propio commit, aprobado por el usuario.

## 3. Separación de responsabilidades
- **C1** La lógica (formato, validación, transformación de datos) va en archivos `*.ts` puros, sin imports de React ni del DOM (salvo hooks `use*.ts`): en `src/lib/`, `src/i18n/` o `src/content/` si es compartida; dentro de `src/components/<Name>/` si la usa un solo componente, exportada y con su propio test. *Verificar:* grep de imports.
- **C2** Los componentes solo renderizan props y emiten eventos: sin importar contenido, sin `fetch`, sin reglas de negocio. Las excepciones de hooks están en `specs/README.md`.
- **C3** El contenido del CV vive solo en `src/content/cv.{en,es}.json` y valida contra `data/cv.schema.json`; los textos de interfaz, solo en `src/i18n/ui.{en,es}.ts`. *Verificar:* `npm run validate:content`.
- **C4** Los valores visuales salen solo de tokens (reglas duras de `docs/DESIGN.md`). *Verificar:* greps del reviewer.

## 4. Tests
- **T1** Cada componente, hook y función pura tiene su `*.test.ts(x)` al lado. *Verificar:* pares de archivos.
- **T2** Los tests se escriben antes que el código y nunca se debilitan: sin borrar ni relajar aserciones, sin `.skip`/`.only`. *Verificar:* `git diff <commit de test> HEAD -- <archivo de test>` vacío.
- **T3** Búsquedas por rol y nombre accesible; `data-testid` solo con un comentario que lo justifique.
- **T4** Cada archivo de test de componente termina con `expectNoA11yViolations`.
- **T5** Terminado = `lint` (0 warnings), `typecheck`, `test` y `build` en verde. *Verificar:* salida de los comandos.

## 5. Protección de datos
- **D1** Sin analytics, trackers, cookies ni pedidos a terceros en runtime (fuentes e íconos van en el bundle). *Verificar:* la pestaña de red solo muestra el origen del sitio.
- **D2** El sitio no recolecta datos de visitantes: sin formularios, sin backend, sin `fetch` a servicios externos. *Verificar:* grep `fetch|XMLHttpRequest|sendBeacon`.
- **D3** `localStorage` guarda solo `cv:theme` y `cv:locale`, siempre en `try/catch`. *Verificar:* grep `localStorage`.
- **D4** Los datos personales reales aparecen solo en `src/content/*.json`; ejemplos, fixtures y tests usan personas ficticias.
- **D5** Sin secretos, claves de API ni valores de `.env` en el repo ni en el bundle. *Verificar:* grep + `.gitignore`.
- **D6** Los links externos abren con `rel="noopener noreferrer"`. *Verificar:* tests de los componentes.

## 6. Idioma
- **L1** Español para toda la documentación (`docs/`, `specs/`, `foundations/`, `AGENTS.md`, `.opencode/`) y los comentarios del código.
- **L2** Inglés para el código: identificadores, nombres de archivos, nombres de tests y mensajes de commit.
- **L3** El contenido visible para el usuario existe en inglés y español solo en `src/content/cv.{en,es}.json` y `src/i18n/ui.{en,es}.ts`.
