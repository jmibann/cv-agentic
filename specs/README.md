# Specs de componentes

Cada `spec.md` es el **contrato** de un componente: el agente que escribe los
tests los deriva de la sección *Tests esperados*, y el agente que implementa
no puede cambiar la API ni debilitar tests sin pasar por el usuario.

## Índice y orden de construcción

| Fase | Componente | Spec | Depende de |
|---|---|---|---|
| F1 | Foundation | `foundation/Foundation/spec.md` (se redacta en el kickoff de F1 con `/sdd-spec`; decisión #84) | — |
| F2 | Icon | [primitives/Icon/spec.md](primitives/Icon/spec.md) | lucide-react |
| F2 | BrandIcon | [primitives/BrandIcon/spec.md](primitives/BrandIcon/spec.md) | — |
| F2 | Box | [primitives/Box/spec.md](primitives/Box/spec.md) | — |
| F2 | Button | [primitives/Button/spec.md](primitives/Button/spec.md) | Icon |
| F2 | Badge | [primitives/Badge/spec.md](primitives/Badge/spec.md) | — |
| F2 | Overhead | [primitives/Overhead/spec.md](primitives/Overhead/spec.md) | — |
| F2 | IconBox | [primitives/IconBox/spec.md](primitives/IconBox/spec.md) | Icon |
| F2 | SectionTitle | [primitives/SectionTitle/spec.md](primitives/SectionTitle/spec.md) | IconBox |
| F2 | Separator | [primitives/Separator/spec.md](primitives/Separator/spec.md) | — |
| F2 | CornerTab | [primitives/CornerTab/spec.md](primitives/CornerTab/spec.md) | — |
| F2 | HexAvatar | [primitives/HexAvatar/spec.md](primitives/HexAvatar/spec.md) | — |
| F3 | ThemeToggle | [controls/ThemeToggle/spec.md](controls/ThemeToggle/spec.md) | Icon, ThemeProvider |
| F3 | LanguageSwitcher | [controls/LanguageSwitcher/spec.md](controls/LanguageSwitcher/spec.md) | LocaleProvider |
| F3 | ControlsBar | [controls/ControlsBar/spec.md](controls/ControlsBar/spec.md) | ThemeToggle, LanguageSwitcher, LocaleProvider |
| F3 | NavTabs | [layout/NavTabs/spec.md](layout/NavTabs/spec.md) | CornerTab |
| F3 | Sidebar | [layout/Sidebar/spec.md](layout/Sidebar/spec.md) | Box, Badge, IconBox, Overhead, Separator, Button, CornerTab, BrandIcon, Icon |
| F3 | Timeline | [content/Timeline/spec.md](content/Timeline/spec.md) | — |
| F3 | ResumeSection | [content/ResumeSection/spec.md](content/ResumeSection/spec.md) | SectionTitle, Timeline |
| F3 | SkillList | [content/SkillList/spec.md](content/SkillList/spec.md) | Badge |
| F3 | ServiceCard | [content/ServiceCard/spec.md](content/ServiceCard/spec.md) | Box, Icon |
| F3 | TestimonialCard | [content/TestimonialCard/spec.md](content/TestimonialCard/spec.md) | Icon, HexAvatar |
| F3 | TestimonialDialog | [content/TestimonialDialog/spec.md](content/TestimonialDialog/spec.md) | Icon, HexAvatar |
| F3 | TestimonialCarousel | [content/TestimonialCarousel/spec.md](content/TestimonialCarousel/spec.md) | TestimonialCard, TestimonialDialog |
| F4 | useHashTab (hook) | [hooks/useHashTab/spec.md](hooks/useHashTab/spec.md) | — |
| F4 | AboutPage | [pages/AboutPage/spec.md](pages/AboutPage/spec.md) | SectionTitle, ServiceCard, TestimonialCarousel, LocaleProvider (`useCv`, `useLocale`) |
| F4 | ResumePage | [pages/ResumePage/spec.md](pages/ResumePage/spec.md) | SectionTitle, ResumeSection, SkillList, LocaleProvider (`useCv`, `useLocale`) |
| F4 | AppLayout | [layout/AppLayout/spec.md](layout/AppLayout/spec.md) | todo lo anterior, incluidos useHashTab, AboutPage y ResumePage |

**Quién construye cada fase:** F1 → `foundation`. F2 y F3 → `component-builder`. F4 →
`integrator`, en el orden de la tabla: `useHashTab` → páginas → AppLayout.
**Unidad de trabajo: una tarea (Tn) del `tasks.md` de la pieza por encargo**
(skill `sdd`), con sus tests escritos **antes** de la implementación.
**Siempre de a una pieza y de a una tarea**, en el orden de la tabla (sin
paralelismo), con dos commits por tarea: `test(<Name>): Tn` en rojo y
`feat(<Name>): Tn`. El orchestrator marca la tarea en `tasks.md` cuando el
reviewer la aprueba y commitea ese cambio.
Criterio de terminado de cada fila: todas sus tareas marcadas, los "Tests
esperados" de su spec en verde + `lint` + `typecheck` (el `npm run build`
corre al cerrar la pieza), la revisión completa del
reviewer y la aprobación del usuario (`Estado: implementada`).

`ThemeProvider` y `LocaleProvider` no son componentes visuales: sus specs están
en [foundations/theming.md](../foundations/theming.md) y
[foundations/i18n.md](../foundations/i18n.md), y se construyen en F1 como
tareas de la pieza `foundation/Foundation` (con el tooling, i18n, contenido
inicial y anti-flash), con el mismo modelo Tn que el resto.

## Estructura de archivos (en la app)

```
src/components/<Name>/
├─ <Name>.tsx            componente (named export + tipo de props exportado)
├─ <Name>.module.css     estilos (solo tokens semánticos)
├─ <Name>.test.tsx       tests (RTL + axe-core vía `expectNoA11yViolations`)
└─ index.ts              export { <Name> } from "./<Name>"; export type { <Name>Props } …

src/pages/<Name>/        AboutPage, ResumePage: misma estructura (.tsx, .module.css, .test.tsx, index.ts)
src/lib/useHashTab.ts    hook + useHashTab.test.ts
```

## Reglas comunes a todos los componentes

- **Props en, eventos fuera.** Ningún componente importa contenido (`useCv`)
  ni textos (`useLocale`) por su cuenta, **salvo** los que la spec lo indique
  explícitamente (ThemeToggle, LanguageSwitcher, ControlsBar, AboutPage,
  ResumePage, AppLayout).
  Los textos de interfaz llegan como props (`labels`) desde la página.
- **Sin margen externo.** El padre posiciona con `gap`. **Excepciones
  documentadas** (las únicas): `SectionTitle` (su `margin-bottom` es el
  espacio título → contenido, ver su spec) y `Separator` (full-bleed: se
  posiciona respecto del padding del Box). Cualquier otra excepción es un
  cambio de spec.
- **`className?: string`** en el elemento raíz, concatenada a la clase propia.
- **Sin `any`**, sin `as` para tapar errores de tipos, sin `// @ts-ignore`,
  sin `eslint-disable`.
- **Colores solo con tokens semánticos** (`--color-*`, `--gradient-*`, `--shadow-*`).
- **Tests con queries accesibles** (`getByRole`, `getByLabelText`, `getByText`);
  `data-testid` solo si no hay alternativa accesible, y justificarlo en un comentario.
- **Cada archivo de test termina con un caso de accesibilidad** con el helper
  del proyecto (`src/test/a11y.ts`, basado en `axe-core`; ver
  `.opencode/agents/foundation.md`):

  ```ts
  import { expectNoA11yViolations } from "../../test/a11y";

  it("has no accessibility violations", async () => {
    const { container } = render(<Name {...props} />);
    await expectNoA11yViolations(container);
  });
  ```

## Estructura de la carpeta de spec

Cada pieza vive en su propia carpeta con un `spec.md` (el contrato, con su
`Estado`). `plan.md` y `tasks.md` los redacta el orchestrator y se aprueban
**por fase**: todos los de F2 juntos, luego F3, etc. (ver skill `sdd`).

```
specs/<categoria>/<Name>/
├─ spec.md      contrato de la pieza: Estado + 10 secciones
├─ plan.md      archivos, decisiones y estrategia de tests  (puerta de Plan + Tareas de la fase)
└─ tasks.md     Tn con "Hecho cuando"                       (ídem)
```

No hay archivos `.md` sueltos dentro de `specs/<categoria>/`: la única excepción
es `specs/README.md` (este índice).

## Plantilla de spec

```text
# <Name>
Estado: borrador | aprobada | implementada

## Propósito          — qué resuelve, en una o dos frases
## Requisitos (EARS)  — RF-1 … RF-n, derivados de las secciones de abajo
## Anatomía           — estructura HTML/partes
## API                — interface de props (TS), valores por defecto
## Estilos y tokens   — medidas y tokens por parte
## Estados            — hover, foco, activo, deshabilitado, vacío ("No es interactivo" si no hay)
## Responsive         — cambios por breakpoint ("Sin @media propios" si todo escala por tokens)
## Accesibilidad      — roles, nombres, teclado
## Tests esperados    — lista de casos (fuente de verdad para el test author)
## No hacer           — errores conocidos o tentaciones a evitar
```

`Estado:` va justo debajo del título y solo cambia con aprobación del usuario.
`## Requisitos (EARS)` va justo después de `## Propósito` (antes de la sección
que le sigue: Anatomía, API…); el formato EARS está en la skill `sdd`.

Todas las secciones son **obligatorias** y explícitas, aunque su contenido
sea "No es interactivo" o "Sin `@media` propios": el reviewer verifica contra
ellas. Única excepción: los hooks (sin UI) marcan Anatomía, Estilos y tokens,
Responsive y Accesibilidad como "No aplica".

