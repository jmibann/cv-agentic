# cv-agentic

Sitio CV personal: **React + TypeScript + Vite + ESLint + CSS Modules**,
responsive, con tema **claro/oscuro** e idiomas **en/es**, construido por
agentes de OpenCode con spec-driven development.

Es un **proyecto único** en la raíz: el **kit de diseño** (reglas, tokens,
fundamentos, specs y contrato de datos) convive con el código de la app, que
crea la Fase 1 (`src/`, `index.html`, `package.json`). "El kit" en esta
documentación se refiere a esos documentos de diseño, no a un paquete.

## Estructura

```
cv-agentic/
├─ README.md          índice corto del proyecto
├─ AGENTS.md          convenciones para los agentes (OpenCode lo lee desde la raíz)
├─ docs/              documentación: README completo, DESIGN, BACKLOG, diagnostics,
│                     agents.md (formato y permisos) y tokens/ (breakpoints, contraste)
├─ tokens/            tokens.css (código: lo importa la app)
├─ foundations/       tipografía · layout · movimiento · theming · i18n
├─ specs/             una spec por pieza (primitives, controls, layout, content, pages, hooks)
├─ data/              contrato de datos del CV (alias @data) + contenido de ejemplo
├─ .opencode/agents/  los 5 agentes
└─ src/ · public/ · index.html · package.json · vite.config.ts   ← los crea la Fase 1
```

## Qué contiene

| Ruta | Para qué |
|---|---|
| [docs/constitution.md](constitution.md) | **Reglas no negociables** (stack, spec antes que código, separación, tests, datos, idioma); está por encima de todo |
| [docs/DESIGN.md](DESIGN.md) | Lenguaje visual, **reglas duras**, do/don't, fuera de alcance |
| [tokens/tokens.css](../tokens/tokens.css) | Tokens (primitivas + semánticas, claro + oscuro, foco, capas y medidas internas de componentes que escalan por breakpoint). **Se importa en la app** |
| [docs/tokens/breakpoints.md](tokens/breakpoints.md) | 580 / 768 / 992 / 1200, mobile-first |
| [docs/tokens/contrast.md](tokens/contrast.md) | Contrastes WCAG calculados y reglas derivadas |
| [foundations/](../foundations/) | Tipografía, layout, movimiento, theming, i18n |
| [specs/](../specs/README.md) | Una carpeta por pieza (`specs/<categoria>/<Name>/spec.md`), todas con las mismas 10 secciones más `Estado` y **Requisitos (EARS)** (Propósito, Anatomía, API, tokens, estados, responsive, a11y, **tests esperados**, No hacer…). Carpetas: `primitives/`, `controls/`, `layout/`, `content/`, `pages/` (AboutPage, ResumePage) y `hooks/` (useHashTab) |
| [data/cv.schema.json](../data/cv.schema.json) | **Fuente de verdad** del formato del contenido (JSON Schema). De ahí se generan los tipos (`data/cv.types.generated.ts`) y el validador (`data/validate-cv.generated.js`) en la Fase 1 |
| [data/constants.ts](../data/constants.ts) | Listas cerradas para recorrer en código (`LOCALES`, `SOCIAL_NETWORKS`…), iguales a los `enum` del esquema |
| [data/cv.example.en.json](../data/cv.example.en.json), [.es.json](../data/cv.example.es.json) | Contenido ficticio de ejemplo (base de `src/content/cv.{en,es}.json`) |
| [AGENTS.md](../AGENTS.md) | Convenciones del proyecto para los agentes (lo lee OpenCode) |
| [docs/agents.md](agents.md) | Los 5 agentes de `.opencode/agents/`: formato, permisos y flujo |
| [docs/BACKLOG.md](BACKLOG.md) | Temas postergados deliberadamente |
| [docs/diagnostics.md](diagnostics.md) | Auditoría, decisiones y estado del proyecto |

## Cómo usa la app el kit

```ts
// src/main.tsx — tokens: una sola vez, por ruta relativa
import "../tokens/tokens.css";
```

```ts
// en cualquier archivo de src/ — tipos con el alias @data
import type { CvData, Locale } from "@data/cv.types.generated";
```

- El alias `@data/*` → `data/*` se configura en `tsconfig.json` (`paths`) y en
  `vite.config.ts` (`resolve.alias`); lo hace la Fase 1.
- **Los tokens no se copian a `src/`.** Una sola fuente de verdad.

## Orden de lectura para un agente

1. `docs/constitution.md` (reglas no negociables)
2. `docs/DESIGN.md` (reglas duras de diseño)
3. `tokens/tokens.css` + `docs/tokens/contrast.md` + `docs/tokens/breakpoints.md`
4. El `foundations/*.md` relevante para su tarea
5. La spec del componente asignado en `specs/…`
6. `data/cv.schema.json` si toca datos (y `foundations/i18n.md` → Contenido)

## Alcance

- **Paneles**: About (presentación, servicios, testimonios) y Resume
  (Education, Experience, Skills en chips).
- **Estructura**: Sidebar (identidad, redes, contactos, Download CV), NavTabs
  (tablist en solapa, siempre visible), ControlsBar (tema + idioma).
- **Fuera**: ver `docs/DESIGN.md` → "Fuera de alcance".

## Entorno y dependencias aprobadas

**Node 24 LTS** (`.nvmrc`: `24`; `engines.node`: `"^22.12.0 || >=24"`, el
mínimo que exigen Vitest 5, jsdom 30 y ESLint 10). **Política de versiones:**
rango `^` dentro de la versión mayor de esta tabla (TypeScript con `~`, ver
abajo) y `package-lock.json` commiteado. Subir una versión mayor es una
decisión del usuario. Verificado contra el registro de npm el 2026-10-01.

| Uso | Paquete | Rango |
|---|---|---|
| Runtime | `react`, `react-dom` | `^19` |
| Runtime | `lucide-react` (íconos) | `^1` |
| Runtime | `simple-icons` (logos de marca, CC0) | `^16` |
| Runtime | `@fontsource/poppins` (fuente self-hosted) | `^5` |
| Build | `vite` | `^8` |
| Build | `@vitejs/plugin-react` | `^6` |
| Build | `typescript` | **`~6.0`** — no `^`: TypeScript 7 es incompatible con `typescript-eslint` (que soporta `<6.1`) |
| Tipos | `@types/react`, `@types/react-dom` | `^19` |
| Tipos | `@types/node` (para `vite.config.ts`) | `^24` |
| Lint | `eslint` | `^10` |
| Lint | `typescript-eslint` | `^8` |
| Lint | `eslint-plugin-react-hooks` | `^7` |
| Lint | `eslint-plugin-react-refresh` | `^0.5` |
| Tests | `vitest` | `^5` |
| Tests | `jsdom` | `^30` |
| Tests | `@testing-library/react` | `^16` |
| Tests | `@testing-library/dom` (peer obligatorio de RTL 16) | `^10` |
| Tests | `@testing-library/user-event` | `^14` |
| Tests | `@testing-library/jest-dom` | `^7` |
| Tests | `axe-core` | `^4` |
| Datos | `ajv` (validador precompilado del contenido) | `^8` |
| Datos | `json-schema-to-typescript` (genera los tipos del esquema) | `^16` |

Cualquier otra dependencia requiere aprobación del usuario.

**Descartadas (verificado 2026-09-30):** `eslint-plugin-jsx-a11y` (su última
versión, de 2024, solo declara compatibilidad hasta ESLint 9; la
accesibilidad la cubren axe en los tests y el reviewer) y `vitest-axe` (sin
mantenimiento; reemplazado por `axe-core` directo). Las demás dependencias de
lint declaran compatibilidad con ESLint 10.

## Registro de decisiones

| # | Tema | Decisión |
|---|---|---|
| 1 | Fuente de diseño | Tema "vCard 2" claro/oscuro + capturas de navegación. Se extraen tokens y estructura; **no se copia código ni assets** |
| 2 | Paneles | Solo About y Resume. Fuera: Portfolio, Blog, Contact |
| 3 | Skills | Una sola lista de chips, sin porcentaje ni categorías |
| 4 | Testimonios | Sí (carrusel scroll-snap + `<dialog>`), sin fecha. Clientes: no |
| 5 | Íconos | `lucide-react` para UI; SVG de marca (Simple Icons) para redes |
| 6 | Fuente | Poppins 300/400/500/600, self-hosted |
| 7 | Preloader | No |
| 8 | Tema oscuro | Superficies del CSS oscuro del tema; `surface-raised` `#2a2b2d` |
| 9 | Acento | Claro: azul `#304cfd`. Oscuro: dorado `#fadd7f → #f6c16f`; texto sobre acento oscuro |
| 10 | Navegación | `NavTabs`: tablist en solapa (CornerTab), siempre visible en todos los tamaños, sin hamburguesa. En ≥ 992px la solapa **flota** a la derecha y el `h1` fluye a su lado (ver #22) |
| 11 | URL | Tab sincronizado con `#about` / `#resume` vía `replaceState` |
| 12 | Idiomas | en + es con `LanguageSwitcher`; default `en`; sin librería de i18n |
| 13 | Controles | ControlsBar arriba de las cards, a la derecha, fuera de ellas |
| 14 | Download CV | El botón existe si hay `downloadCvUrl`; PDF se resuelve más adelante |
| 15 | Calidad | Chequeo de accesibilidad con `axe-core` (helper `expectNoA11yViolations`) en todos los componentes; estilos de impresión; sin fondo de triángulos. Se descartó `vitest-axe` por falta de mantenimiento |
| 16 | Contenido | ~~Módulos `.ts` con `as const satisfies CvData`~~ → reemplazada por #44 |
| 17 | Agentes | OpenCode; agentes nuevos escritos desde cero; sin base de aprendizajes inicial |
| 18 | Paquete | ~~`@cv/design-kit` como paquete del workspace~~ → reemplazada por #39 |
| 19 | Foco | Anillo único para todo el sitio: `--focus-ring-width` / `--focus-ring-offset` (2px / 2px), color de acento sólido |
| 20 | Medidas responsive | Toda medida que cambia por breakpoint es un token en `tokens.css`; los componentes solo usan `@media` para layout |
| 21 | Acento | Dos formas con usos fijos: gradiente (barra del h1, Button, íconos de IconBox/ServiceCard, comilla, bullet activo, idioma activo) y sólido (punto del Timeline, tab activo, texto/links, foco) |
| 22 | Header del panel | En ≥ 992px, `CornerTab placement="float"`; las páginas usan flujo de bloque para que el `h1` fluya junto a la solapa. En < 992px la solapa es absoluta y el panel deja espacio arriba |
| 23 | Hover de tabs | Inactivos al 80% de opacidad; hover al 100% con subrayado de 2px |
| 24 | Avatar de testimonios | Primitiva `HexAvatar` única (hexágono con `clipPath` compartido); el espacio para el avatar lo reserva solo el carrusel |
| 25 | Carrusel | Un bullet por posición de scroll alcanzable (`getScrollStops` / `getActiveStop`); sin autoplay ni librerías |
| 26 | Impresión | Ambos paneles; testimonios apilados con el texto completo; sin controles, tabs ni bullets |
| 27 | Specs | Las secciones de la plantilla son obligatorias en toda spec; los hooks marcan "No aplica" donde corresponde (hoy 10 secciones, ver #68) |
| 28 | Páginas y hook | AboutPage, ResumePage y `useHashTab` tienen spec propia y se construyen en F4 (integrator) |
| 29 | Seguimiento | Estado de las decisiones y pendientes en `~/code/cv-agentic/docs/diagnostics.md` |
| 30 | Fechas | `YYYY` (1900–2099) o `YYYY-MM` (mes `01`–`12`). Desde #44 se valida con el `pattern` del esquema (ajv), no con el tipo TS; `content.test.ts` verifica `start` ≤ `end` |
| 31 | Nombre de Badge | Un solo nombre, `Badge` (spec `primitives/Badge/spec.md`, carpeta `src/components/Badge/`), con dos usos: badge del rol y chip de skill |
| 32 | Construcción serial | Una pieza por vez, en el orden de `specs/README.md`; sin paralelismo (los tests en rojo rompen el `typecheck` global y los agentes comparten la carpeta de trabajo) |
| 33 | Commits | Por pieza: `test(<Name>)` con los tests en rojo → `feat(<Name>)` → `fix(<Name>)` si hay correcciones. Los hacen foundation, component-builder e integrator; sin `--amend`, `reset --hard` ni `push`. El reviewer verifica que el test no cambió desde su commit |
| 34 | Accesibilidad en tests | `axe-core` directo con el helper `expectNoA11yViolations` (`src/test/a11y.ts`); reemplaza a `vitest-axe`, sin mantenimiento |
| 35 | Lint | ESLint 10 con `typescript-eslint`, `react-hooks` y `react-refresh`; sin `eslint-plugin-jsx-a11y` (incompatible con ESLint 10) |
| 36 | Avatar de testimonios | Sin `alt` en el esquema (`TestimonialAvatar = Pick<Image, "src">`): en card y dialog es decorativo porque el nombre está al lado |
| 37 | Agentes OpenCode | Instalados en `.opencode/agents/`; `permission` en lugar de `tools`; sin `model` (heredan); `steps` como tope de iteraciones |
| 38 | Avatar del Sidebar (768–1199px) | 9rem **provisional**; el valor final se fija en la QA visual de F5 |
| 39 | Estructura | **Proyecto único en la raíz de `cv-agentic/`**: kit y app juntos, un solo `package.json`, sin workspaces ni paquete `@cv/design-kit`. Reemplaza #18 |
| 40 | Specs | Carpeta `specs/` (antes `components/`) para no confundirla con `src/components/` |
| 41 | Agentes en su lugar final | Los agentes viven en `.opencode/agents/` y `AGENTS.md` en la raíz desde ya; no hay plantillas que copiar en la Fase 1 |
| 42 | Imports del kit | Tipos con el alias `@data/*` → `data/*`; tokens con una única importación relativa en `src/main.tsx` |
| 43 | Documentación | Carpeta `docs/` con los documentos sueltos (README completo, DESIGN, BACKLOG, diagnostics, agents.md) y los documentos de tokens (`docs/tokens/`). Quedan en la raíz: un `README.md` corto, `AGENTS.md` (lo exige OpenCode), `tokens/tokens.css` y `data/` (código), `specs/` y `foundations/` |
| 44 | Contenido en JSON | `src/content/cv.en.json` y `cv.es.json`, editables a mano con autocompletado (`"$schema"`). Fuente de verdad: `data/cv.schema.json`; tipos generados con `json-schema-to-typescript`; validador precompilado con ajv (sin ajv en el bundle); un JSON inválido rompe build y tests. Solo el contenido del CV (textos de interfaz y tokens quedan como están). Listas cerradas |
| 45 | Versiones | Node 24 LTS (`engines` `^22.12.0 \|\| >=24`); `^` dentro de la mayor documentada y `package-lock.json` commiteado; TypeScript `~6.0` (TS 7 incompatible con `typescript-eslint`) |
| 46 | Dependencias agregadas | `@testing-library/dom` (peer obligatorio de RTL 16), `@types/react`, `@types/react-dom`, `@types/node`, `ajv`, `json-schema-to-typescript` |
| 47 | `formatPeriod` | Lo crea foundation en F1 en `src/i18n/formatPeriod.ts` (Timeline lo usa en F3) |
| 48 | Tests | Vitest con `globals: false`: `src/test/setup.ts` importa `@testing-library/jest-dom/vitest` y registra `afterEach(cleanup)` explícito |
| 49 | Sidebar sticky | `top: calc(var(--size-avatar-sidebar) * 0.71 + var(--space-7))` para que el avatar que sobresale no se corte |
| 50 | Orden de fechas | `start` normalizado a `YYYY-01` y `end` a `YYYY-12` al comparar |
| 51 | Gradiente de íconos | `gradientUnits="userSpaceOnUse"` (espacio 0–24 de lucide), extremos y `offset` equivalentes a `--gradient-accent`; los SVG de definiciones nunca con `display: none` |
| 52 | Tamaño de íconos | `--icon-size` registrada con `@property` (`inherits: false`); se fija en la `className` del propio ícono |
| 53 | Impresión | `tokens.css` tiene un bloque `@media print` que reasigna las semánticas a la paleta clara (también en oscuro) y quita sombras; los componentes no usan `--palette-*` |
| 54 | Márgenes | Únicas excepciones a "sin margen externo": `SectionTitle` (`margin-bottom` título → contenido) y `Separator` |
| 55 | Tabs | `TAB_IDS = ["about", "resume"]` fijo en AppLayout (nunca vacío); labels de `t.nav` |
| 56 | Labels del Sidebar | Mapeo explícito `t.sidebar.*` + `t.contact` → `SidebarLabels` en AppLayout |
| 57 | Documentos de estado | El orchestrator puede editar **solo** `README.md` y `docs/diagnostics.md` (permiso `edit` por ruta) y los actualiza al cerrar cada puerta |
| 58 | Placeholders | `public/images/avatar.svg` y `testimonials/*.svg` (los crea foundation); los ejemplos ya no traen `downloadCvUrl` |
| 59 | Skip link | `preventDefault` + foco al tabpanel; la URL conserva `#about`/`#resume` |
| 60 | `theme-color` | El script anti-flash lo fija con los valores de `--palette-light-bg`/`--palette-dark-bg` (excepción a la regla 1, verificada por test) |
| 61 | HexAvatar | Dos `clipPath` (`hex-avatar-outer` 80×88 e `hex-avatar-inner` 72×80); Safari en QA |
| 62 | TestimonialCard | Encabezado en grilla `auto 1fr` (avatar / nombre y rol), sin márgenes negativos |
| 63 | TypeScript | Un solo `tsconfig.json`; `tsc --noEmit` en typecheck y build (sin `tsc -b`) |
| 64 | Campos no traducibles | Lista canónica en `foundations/i18n.md`, igual a los "No traducible" del esquema |
| 65 | Bundle | Ambos idiomas en el bundle (aceptado; `import()` dinámico en BACKLOG) |
| 66 | Sticky por altura | El Sidebar es sticky solo con `(min-width: 1200px) and (min-height: 900px)` (≈ 665px de Sidebar + 158px de `top`, con margen). Única media query de altura permitida |
| 67 | Constitución | `docs/constitution.md` (46 líneas): reglas no negociables y verificables S1–S5, P1–P5, C1–C4, T1–T5, D1–D6, L1–L3, por encima de todo otro documento. Idioma: español para documentación y comentarios, inglés para el código (identificadores, archivos, tests, commits). C1: la lógica pura de un solo componente puede vivir en su carpeta. Enlazada desde `AGENTS.md` y los 5 agentes; el reviewer la verifica en cada entrega |
| 68 | Estructura de specs | Modelo único de spec: `specs/<categoria>/<Name>/{spec,plan,tasks}.md` (27 piezas, solo `spec.md` por ahora; `plan.md` y `tasks.md` los redacta el orquestador en su puerta). Cada `spec.md` lleva `Estado: aprobada` y la sección `## Requisitos (EARS)` (3–8 `RF-n`, derivados solo de las secciones existentes). Plantilla canónica en `specs/README.md`, consumida por `.opencode/skills/sdd/SKILL.md`. P1 verificado contra `specs/**/<Name>/spec.md` (aprobación explícita del usuario) |
