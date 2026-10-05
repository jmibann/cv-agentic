# Icon
Estado: aprobada

## Propósito

Único punto de entrada a `lucide-react`. Centraliza tamaño, color, el
tratamiento con gradiente y la accesibilidad de los íconos de interfaz.

## Requisitos (EARS)

- RF-1: CUANDO el componente recibe un `name` válido de `IconName`, ENTONCES EL SISTEMA renderiza el `<svg>` de lucide correspondiente al mapa explícito nombre → componente.
- RF-2: MIENTRAS un `Icon` no reciba `label`, EL SISTEMA lo marca decorativo (`aria-hidden="true"`).
- RF-3: CUANDO el componente recibe `label`, ENTONCES EL SISTEMA expone `role="img"` con `aria-label` igual al label recibido.
- RF-4: CUANDO `tone` es `gradient`, ENTONCES EL SISTEMA aplica `stroke="url(#accent-gradient)"` resolviendo las definiciones compartidas de `AccentGradientDefs`; el montaje único en la app lo garantiza AppLayout (RF-6 de su spec).
- RF-5: SI un nombre del `enum` `ServiceIcon` de `data/cv.schema.json` no tiene entrada en el mapa del componente, ENTONCES la compilación falla (el eslabón es `data/cv.types.generated.ts`: requiere `gen:types`, que corre en `prebuild`; sin regenerar, nada falla en runtime). Verificación: build/prebuild (no testeable en unit test).
- RF-6: EL SISTEMA dimensiona el ícono solo por CSS (`--icon-size`, con `--size-icon` por defecto): sin prop `size` y sin `@media` propios.
- RF-7: EL SISTEMA fija `focusable="false"` en el `<svg>` en todos los casos (con y sin `label`).

## Anatomía

`<svg>` de lucide con `stroke` configurado. Opcionalmente, el trazo usa el
gradiente de acento compartido (`<AccentGradientDefs />`).

## API

```ts
import type { ServiceIcon } from "@data/cv.types.generated";

export type UiIconName =
  | "mail" | "phone" | "message-circle" | "map-pin" | "download"
  | "chevron-down" | "sun" | "moon" | "book-open" | "briefcase"
  | "quote" | "x";

export type IconName = UiIconName | ServiceIcon;

export interface IconProps {
  name: IconName;
  /** current = hereda color; accent = --color-accent; gradient = trazo con gradiente. Default: "current". */
  tone?: "current" | "accent" | "gradient";
  /** Si se pasa, el ícono es informativo: role="img" + aria-label. Si no, aria-hidden. */
  label?: string;
  /** Se UNE a la clase base `.icon` sobre el `<svg>` raíz (no la reemplaza); el padre fija `--icon-size` exactamente aquí. */
  className?: string;
}
```

Mapa explícito nombre → componente (sin `import * as`, para tree-shaking):

| name | lucide | Uso |
|---|---|---|
| mail | `Mail` | contacto email |
| phone | `Phone` | contacto teléfono |
| message-circle | `MessageCircle` | contacto WhatsApp (lucide no tiene logo) |
| map-pin | `MapPin` | contacto ubicación |
| download | `Download` | botón Download CV |
| chevron-down | `ChevronDown` | botón Show Contacts |
| sun / moon | `Sun` / `Moon` | ThemeToggle |
| book-open | `BookOpen` | ResumeSection Education |
| briefcase | `Briefcase` | ResumeSection Experience |
| quote | `Quote` | TestimonialCard / Dialog |
| x | `X` | cerrar TestimonialDialog |
| code, layout, palette, smartphone, server, database, cloud, pen-tool, camera, megaphone, gauge, shield | `Code`, `LayoutTemplate`, `Palette`, `Smartphone`, `Server`, `Database`, `Cloud`, `PenTool`, `Camera`, `Megaphone`, `Gauge`, `Shield` | ServiceCard |

El mapa se tipa como `Record<IconName, LucideIcon>`: si se agrega un nombre al
`enum` `ServiceIcon` de `data/cv.schema.json` (y a `SERVICE_ICONS` de `@data/constants`)
sin agregarlo acá, **falla la compilación** (el tipo generado es una unión de literales).

## Gradiente

Lucide dibuja con `stroke`; `background-clip: text` (lo que usaba el tema)
no aplica a SVG. En su lugar:

- `AccentGradientDefs` (exportado desde el mismo módulo) renderiza **una vez**,
  en `AppLayout`, un `<svg width="0" height="0" aria-hidden="true" focusable="false">`
  con `<linearGradient id="accent-gradient" gradientUnits="userSpaceOnUse" x1="0.62" y1="-0.56" x2="23.38" y2="24.56">`
  y dos `<stop>` cuyo color sale de tokens **por CSS Module** (sin estilos inline):
  `<stop offset="0.2631" className={styles.stopStart} />` / `<stop offset="0.9375" className={styles.stopEnd} />`
  con `.stopStart { stop-color: var(--gradient-accent-start); }` y
  `.stopEnd { stop-color: var(--gradient-accent-end); }`.
- `tone="gradient"` → `stroke="url(#accent-gradient)"`.
- **`gradientUnits="userSpaceOnUse"` es obligatorio.** Con el valor por
  defecto (`objectBoundingBox`) cada trazo del ícono toma su propia caja: el
  gradiente cambia de un trazo a otro y las líneas rectas (caja de ancho o
  alto 0) **no se dibujan**. Con `userSpaceOnUse` el gradiente se mapea al
  espacio 0–24 del `viewBox` de lucide, igual para todo el ícono. Los
  extremos `x1/y1/x2/y2` reproducen el ángulo de 137.84° y los `offset` las
  posiciones 26.31 % / 93.75 % de `--gradient-accent`.
- El `<svg>` de `AccentGradientDefs` es invisible por tamaño
  (`width="0" height="0"`, `position: absolute`), **nunca con
  `display: none`**: algunos navegadores no resuelven referencias `url(#…)` a
  definiciones dentro de un SVG no renderizado.
- Como los stops usan custom properties, el gradiente **cambia solo con el tema**.
- Si `AccentGradientDefs` no está montado, el trazo no se ve: por eso los tests
  de componentes que usan `tone="gradient"` montan también `AccentGradientDefs`,
  y AppLayout tiene un test que verifica que existe una sola vez.

## Estilos y tokens

**Tamaño: solo por CSS.** Los atributos `width`/`height` de un SVG no aceptan
`var()`, así que el tamaño **no** es una prop:

```css
.icon {
  width: var(--icon-size, var(--size-icon));
  height: var(--icon-size, var(--size-icon));
  flex-shrink: 0;
}
```

- Por defecto mide `--size-icon` (1.125rem).
- Para otro tamaño, **el padre le pasa una `className` al `Icon`** y en esa
  clase fija `--icon-size` (se aplica sobre el propio `<svg>`). Ej. en
  ServiceCard: `<Icon name="code" tone="gradient" className={styles.glyph} />`
  con `.glyph { --icon-size: var(--size-service-icon); }`.
- `--icon-size` está registrada con `@property … { inherits: false }` en
  `tokens/tokens.css`: fijarla en un contenedor **no tiene efecto** sobre los
  íconos de adentro (así no se filtra a íconos anidados).
  El CSS gana sobre los atributos `width`/`height` que lucide pone por defecto.
- `stroke-width` 2 (default de lucide).
- `tone` se aplica por **clases del CSS Module** (p. ej. `.toneAccent { color: var(--color-accent); }`; `current` no agrega clase), sin estilos inline. `gradient` no es un color: usa el atributo `stroke` con la url del gradiente.

## Estados

Sin estados propios (no es interactivo). El color en hover/foco lo hereda del
control que lo contiene (`tone="current"`).

## Responsive

Sin `@media` propios. Si un tamaño debe cambiar por breakpoint, el token que
se asigna a `--icon-size` es el que escala (sus `@media` viven en
`tokens/tokens.css`, según la regla general de `docs/tokens/breakpoints.md`).

## Accesibilidad

- Sin `label`: `aria-hidden="true"`; con `label`: `role="img"` y `aria-label={label}`.
- `focusable="false"` siempre (RF-7).
- `tone="gradient"` con `label` es una combinación válida: el gradiente decora
  el trazo (exento de par de contraste, ver `docs/tokens/contrast.md`) y el
  nombre accesible lo da `aria-label`.

## Tests esperados

- Renderiza un svg para cada `IconName` (test parametrizado sobre la lista completa).
- El `<svg>` lleva `focusable="false"` (con y sin `label`; RF-7).
- Sin `label`: `aria-hidden="true"`; no aparece en `getByRole("img")`.
- Con `label`: `getByRole("img", { name: label })`.
- `tone="gradient"` → atributo `stroke="url(#accent-gradient)"`.
- El `className` recibido queda unido a la clase base `.icon` sobre el propio `<svg>` (aserción de clases con el criterio de CSS Modules de la fase). El tamaño visual lo controla `--icon-size`: jsdom no calcula estilos, se verifica en QA visual.
- `AccentGradientDefs` renderiza un `linearGradient` con id `accent-gradient`, `gradientUnits="userSpaceOnUse"` y 2 stops (`offset` 0.2631 y 0.9375) **sin atributo `style`** (el color va por clase).
- `expectNoA11yViolations` sin violaciones (con y sin label).

## No hacer

- No importar lucide en otros componentes: siempre a través de `Icon`.
- No usar íconos de marca de lucide (fueron retirados); para redes, `BrandIcon`.
- No hardcodear colores en los `<stop>`.
