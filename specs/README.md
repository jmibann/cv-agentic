# Specs de componentes

Cada archivo es el **contrato** de un componente: el agente que escribe los
tests los deriva de la sección *Tests esperados*, y el agente que implementa
no puede cambiar la API ni debilitar tests sin pasar por el usuario.

## Índice y orden de construcción

| Fase | Componente | Spec | Depende de |
|---|---|---|---|
| F2 | Icon | [primitives/Icon.md](primitives/Icon.md) | lucide-react |
| F2 | BrandIcon | [primitives/BrandIcon.md](primitives/BrandIcon.md) | — |
| F2 | Box | [primitives/Box.md](primitives/Box.md) | — |
| F2 | Button | [primitives/Button.md](primitives/Button.md) | Icon |
| F2 | Badge | [primitives/Badge.md](primitives/Badge.md) | — |
| F2 | Overhead | [primitives/Overhead.md](primitives/Overhead.md) | — |
| F2 | IconBox | [primitives/IconBox.md](primitives/IconBox.md) | Icon |
| F2 | SectionTitle | [primitives/SectionTitle.md](primitives/SectionTitle.md) | IconBox |
| F2 | Separator | [primitives/Separator.md](primitives/Separator.md) | — |
| F2 | CornerTab | [primitives/CornerTab.md](primitives/CornerTab.md) | — |
| F2 | HexAvatar | [primitives/HexAvatar.md](primitives/HexAvatar.md) | — |
| F3 | ThemeToggle | [controls/ThemeToggle.md](controls/ThemeToggle.md) | Icon, ThemeProvider |
| F3 | LanguageSwitcher | [controls/LanguageSwitcher.md](controls/LanguageSwitcher.md) | LocaleProvider |
| F3 | ControlsBar | [controls/ControlsBar.md](controls/ControlsBar.md) | ThemeToggle, LanguageSwitcher, LocaleProvider |
| F3 | NavTabs | [layout/NavTabs.md](layout/NavTabs.md) | CornerTab |
| F3 | Sidebar | [layout/Sidebar.md](layout/Sidebar.md) | Box, Badge, IconBox, Overhead, Separator, Button, CornerTab, BrandIcon, Icon |
| F3 | Timeline | [content/Timeline.md](content/Timeline.md) | — |
| F3 | ResumeSection | [content/ResumeSection.md](content/ResumeSection.md) | SectionTitle, Timeline |
| F3 | SkillList | [content/SkillList.md](content/SkillList.md) | Badge |
| F3 | ServiceCard | [content/ServiceCard.md](content/ServiceCard.md) | Box, Icon |
| F3 | TestimonialCard | [content/TestimonialCard.md](content/TestimonialCard.md) | Icon, HexAvatar |
| F3 | TestimonialDialog | [content/TestimonialDialog.md](content/TestimonialDialog.md) | Icon, HexAvatar |
| F3 | TestimonialCarousel | [content/TestimonialCarousel.md](content/TestimonialCarousel.md) | TestimonialCard, TestimonialDialog |
| F4 | useHashTab (hook) | [hooks/useHashTab.md](hooks/useHashTab.md) | — |
| F4 | AboutPage | [pages/AboutPage.md](pages/AboutPage.md) | SectionTitle, ServiceCard, TestimonialCarousel, LocaleProvider (`useCv`, `useLocale`) |
| F4 | ResumePage | [pages/ResumePage.md](pages/ResumePage.md) | SectionTitle, ResumeSection, SkillList, LocaleProvider (`useCv`, `useLocale`) |
| F4 | AppLayout | [layout/AppLayout.md](layout/AppLayout.md) | todo lo anterior, incluidos useHashTab, AboutPage y ResumePage |

**Quién construye cada fase:** F2 y F3 → `component-builder` (un componente por
encargo). F4 → `integrator`, en el orden de la tabla: `useHashTab` → páginas →
AppLayout, cada uno con sus tests escritos **antes** de la implementación.
**Siempre de a una pieza**, en el orden de la tabla (sin paralelismo), con dos
commits por pieza: `test(<Name>)` en rojo y `feat(<Name>)`.
Criterio de terminado de cada fila: los "Tests esperados" de su spec en verde +
`lint` + `typecheck`, después del commit `feat(<Name>)`.

`ThemeProvider` y `LocaleProvider` no son componentes visuales: sus specs están
en [foundations/theming.md](../foundations/theming.md) y
[foundations/i18n.md](../foundations/i18n.md), y se construyen en F1.

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

## Plantilla de spec

```
# <Name>
Propósito        — qué resuelve, en una o dos frases
Anatomía         — estructura HTML/partes
API              — interface de props (TS), valores por defecto
Estilos y tokens — medidas y tokens por parte
Estados          — hover, foco, activo, deshabilitado, vacío ("No es interactivo" si no hay)
Responsive       — cambios por breakpoint ("Sin @media propios" si todo escala por tokens)
Accesibilidad    — roles, nombres, teclado
Tests esperados  — lista de casos (fuente de verdad para el test author)
No hacer         — errores conocidos o tentaciones a evitar
```

Todas las secciones son **obligatorias** y explícitas, aunque su contenido
sea "No es interactivo" o "Sin `@media` propios": el reviewer verifica contra
ellas. Única excepción: los hooks (sin UI) marcan Anatomía, Estilos y tokens,
Responsive y Accesibilidad como "No aplica".
