---
description: "F1 — arma la app Vite/React/TS en la raíz del proyecto, el tooling (ESLint, Vitest, axe-core), importa tokens y fuente, configura el alias @data, implementa ThemeProvider/LocaleProvider y el script anti-flash."
mode: subagent
# Arma la app en la raíz: instala dependencias, crea carpetas e inicializa git.
permission:
  edit: allow
  webfetch: deny
  task: deny
  bash:
    "*": ask
    "npm install*": allow
    "npm run *": allow
    "npm test*": allow
    "npx vitest *": allow
    "npx tsc*": allow
    "npx eslint*": allow
    "git init*": allow
    "git status*": allow
    "git diff*": allow
    "mkdir *": allow
    "cp *": allow
    "ls *": allow
    "git add *": allow
    "git commit -m *": allow
    "git push*": deny
    "git reset --hard*": deny
    "rm -rf*": deny
    "*--amend*": deny
steps: 150  # valor inicial; ajustable
---

# Foundation (F1)

Dejás el proyecto listo para que otros agentes construyan componentes con
TDD. Leé primero: `docs/constitution.md` (reglas no negociables), `AGENTS.md`, `docs/README.md`,
`docs/DESIGN.md`, `foundations/theming.md`, `foundations/i18n.md`,
`foundations/typography.md`.

## Tareas

1. **Proyecto único en la raíz** de `~/code/cv-agentic` (sin workspaces):
   - **No uses `npm create vite`** ni ningún generador sobre la raíz: la
     carpeta ya contiene el kit (`docs/`, `tokens/`, `specs/`, `data/`,
     `.opencode/`…) y esos generadores ofrecen borrar lo existente. Creá a mano
     `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`,
     `eslint.config.js` y `src/` (podés tomar como referencia la plantilla
     react-ts de Vite, sin ejecutarla sobre la raíz).
   - `package.json` con `"private": true`, `"type": "module"`,
     `"engines": { "node": "^22.12.0 || >=24" }` y **exactamente** las
     dependencias y rangos de `docs/README.md` → "Entorno y dependencias
     aprobadas" (TypeScript con `~6.0`, nunca `^` ni `latest`). `.nvmrc` con
     `24`. `package-lock.json` se commitea.
   - Scripts: `dev`, `lint`, `typecheck`, `test`, `build`, más los de datos:
     `gen:types` (genera `data/cv.types.generated.ts` desde
     `data/cv.schema.json` con `json-schema-to-typescript`),
     `build:validator` (genera `data/validate-cv.generated.js` y su
     `data/validate-cv.generated.d.ts` con ajv en modo *standalone*; el `.d.ts`
     declara `validateCv(data: unknown): data is CvData` y `validateCv.errors`),
     `validate:content` (valida `src/content/cv.*.json` con el validador
     generado) y `prebuild` = `gen:types && build:validator && validate:content`.
     Los `*.generated.*` se commitean y llevan un encabezado "GENERADO — no
     editar".
   - `.gitignore` y `git init` si no existe. Al terminar y con los comandos en
     verde, un commit `chore: scaffold app` (el reviewer revisa ese commit; las
     correcciones van en commits nuevos, sin `--amend`).
   - **Placeholders de imágenes** en `public/images/`: `avatar.svg` y
     `testimonials/{maria,john,lena}.svg` (los que referencian los ejemplos):
     silueta neutra, sin texto ni marcas, `viewBox` cuadrado. Son contenido de
     ejemplo, no estilos (ver regla dura 1 de `docs/DESIGN.md`). No se crea
     PDF: los ejemplos no tienen `downloadCvUrl`, así que el botón no aparece.
2. **No toques el kit**: `README.md`, `AGENTS.md`, `docs/`, `tokens/`,
   `foundations/`, `specs/`, `data/` y `.opencode/` ya existen y no se
   modifican. **Única excepción:** los archivos `data/*.generated.*`, que
   solo se escriben ejecutando `gen:types` y `build:validator` (nunca a mano).
3. **TypeScript `~6.0`**: `strict`, `noUnusedLocals`, `noUnusedParameters`,
   `noUncheckedIndexedAccess`, `moduleResolution: "bundler"`,
   `resolveJsonModule: true`. Declarar explícitamente las opciones cuyo valor
   por defecto cambió en TS 6 (p. ej. `types`) en lugar de depender del
   default; no usar `baseUrl` (deprecado): el alias va solo con `paths`. El
   typecheck cubre `src/` y `data/` (`*.ts` y `*.generated.d.ts`).
   **Un solo `tsconfig.json`** (sin project references ni `tsc -b`) que
   incluye `src/`, `data/` y `vite.config.ts`, con `types` explícito
   (`["vite/client", "node"]`). `typecheck` = `tsc --noEmit`;
   `build` = `prebuild` + `tsc --noEmit && vite build`. **Alias `@data/*` → `data/*`** en
   `tsconfig.json` (`paths`) y en `vite.config.ts` (`resolve.alias`), también
   disponible en Vitest.
4. **ESLint 10** (flat config): `typescript-eslint` (strict), `react-hooks`,
   `react-refresh`. `--max-warnings 0`. **Sin `eslint-plugin-jsx-a11y`**
   (incompatible con ESLint 10; la accesibilidad se verifica con axe en los
   tests y en la revisión).
   Regla adicional: prohibir colores literales en `.tsx` con
   `no-restricted-syntax` sobre literales que matcheen `#[0-9a-fA-F]{3,8}\b`
   o `rgb(` / `hsl(`. El `\b` es obligatorio: sin él, `url(#accent-gradient)`
   da falso positivo ("acce" son dígitos hexadecimales) y bloquearía `Icon`.
   ESLint solo revisa TS/TSX: los colores literales en `.css` los controla el
   grep del reviewer (misma regex).
5. **Vitest**: entorno `jsdom`, `globals: false`, setup `src/test/setup.ts` con:
   `import "@testing-library/jest-dom/vitest"` (la variante para Vitest),
   **`afterEach(cleanup)` explícito** de `@testing-library/react` (con
   `globals: false` la limpieza automática de Testing Library no se registra y
   el DOM se acumularía entre tests),
   mocks de `matchMedia`, `ResizeObserver`, `Element.prototype.scrollTo`
   y `HTMLDialogElement.prototype.showModal/close` (si la versión de jsdom no los trae),
   y `afterEach` que limpia `localStorage`, `data-theme`, `lang` y `location.hash`.
5b. **Helper de accesibilidad** `src/test/a11y.ts` (con su propio test), sobre
   `axe-core` (sin `vitest-axe`, que no tiene mantenimiento):

   ```ts
   import axe from "axe-core";
   import { expect } from "vitest";

   export async function expectNoA11yViolations(container: Element): Promise<void> {
     const results = await axe.run(container, {
       rules: {
         "color-contrast": { enabled: false }, // jsdom no calcula estilos
         region: { enabled: false },           // componentes aislados, fuera de landmarks
       },
     });
     const summary = results.violations.map(
       (v) => `${v.id} (${v.impact ?? "?"}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
     );
     expect(summary, "axe violations").toEqual([]);
   }
   ```

   Test del helper: un `<img>` sin `alt` produce una violación; un botón con
   texto no produce ninguna.
6. **Estilos base**: `src/main.tsx` importa `../tokens/tokens.css` (única
   importación de tokens, por ruta relativa),
   `@fontsource/poppins/{300,400,500,600}.css` y `src/styles/global.css`
   (reset mínimo + base tipográfica de `foundations/typography.md` +
   `html:has(dialog[open]) { overflow: hidden; }`). Solo tokens.
7. **Script anti-flash** inline en `index.html`, tal cual
   `foundations/theming.md` (incluye fijar `<meta name="theme-color">` según el
   tema resuelto). `<html lang="en">` por defecto. Test: los dos valores de
   `theme-color` del script coinciden con `--palette-light-bg` y
   `--palette-dark-bg` de `tokens/tokens.css` (leer ambos archivos).
8. **Providers** en `src/providers/`, con tests primero:
   `ThemeProvider` + `useTheme` (spec en `theming.md`) y
   `LocaleProvider` + `useLocale` + `useCv` (spec en `i18n.md`).
9. **i18n**: `src/i18n/ui.en.ts`, `ui.es.ts` (todas las claves de `i18n.md`),
   `format.ts` y **`formatPeriod.ts`**, cada uno con sus tests (spec en
   `foundations/i18n.md` → "Fechas y períodos"). `formatPeriod` se crea acá
   porque Timeline lo usa en F3 y component-builder no puede escribir fuera
   de su carpeta.
10. **Contenido inicial**: `src/content/cv.en.json` y `cv.es.json` copiando
    `data/cv.example.*.json` (con `"$schema": "../../data/cv.schema.json"`),
    `index.ts` (valida con `validateCv`; ver `foundations/i18n.md` → Contenido),
    `content.test.ts` (paridad en/es, orden `start` ≤ `end`, casos inválidos
    rechazados) y `schema.test.ts` (las listas de `@data/constants` son
    iguales a los `enum` del esquema, y `data/cv.types.generated.ts` está al
    día: regenerarlo en memoria y comparar).
11. `App.tsx` provisorio que renderiza un texto de `t` y el nombre de `useCv()`
    (lo reemplaza el integrator en F4).

## Verificación

`npm run lint && npm run typecheck && npm test && npm run build` en verde.
Además `npm run dev` levanta y la página muestra el texto provisorio con
Poppins, fondo `--color-bg`, y cambia a oscuro si se fija
`localStorage["cv:theme"]="dark"` y se recarga, **sin parpadeo**.

## Límites

- No construyas componentes visuales (son de F2/F3).
- No agregues dependencias fuera de la lista aprobada.
- No modifiques el kit (ver tarea 2) ni `.opencode/`.
- Máximo 3 rondas de corrección; después reportá con la salida exacta.
