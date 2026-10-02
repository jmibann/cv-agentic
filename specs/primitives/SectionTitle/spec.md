# SectionTitle
Estado: aprobada

## Propósito

Títulos de página y de sección con dos tratamientos:

- **decorated**: h1 de página con barra de gradiente debajo ("About Me", "Resume").
- **Excepción a "sin margen externo"** (documentada en `specs/README.md`): el
`margin-bottom` del título es parte del componente, porque el espacio
título → contenido es siempre el mismo y no depende de quién lo use. Valores:
h1 decorado `var(--title-decorated-gap)`; h2 `1.25rem`; h3 `0.5rem` (ver
`foundations/typography.md` → "Márgenes de títulos"). Ningún otro margen.

**with icon**: h2 de sección con `IconBox` a la izquierda ("Education", "Experience").

## Requisitos (EARS)

- RF-1: CUANDO el componente recibe `as`, ENTONCES EL SISTEMA renderiza ese nivel de heading (`h1`, `h2` o `h3`) con el tamaño de `--font-size-h1/2/3` correspondiente.
- RF-2: CUANDO recibe `decorated`, ENTONCES EL SISTEMA dibuja la barra de gradiente con un `::after` sin contenido textual.
- RF-3: CUANDO recibe `icon`, ENTONCES EL SISTEMA renderiza un `IconBox` a la izquierda sin alterar el nombre accesible del heading.
- RF-4: CUANDO recibe `id`, ENTONCES EL SISTEMA lo transmite al heading para que la sección pueda usar `aria-labelledby`.
- RF-5: EL SISTEMA aplica como única excepción a "sin margen externo" el `margin-bottom` propio según el nivel (h1 `--title-decorated-gap`, h2 `1.25rem`, h3 `0.5rem`).
- RF-6: EL SISTEMA resuelve tamaño, separación y barra con tokens y no declara `@media` propios.

## Anatomía

```
decorated:            with icon:
About Me              [▣] Education
▬▬▬
```

## API

```ts
import type { IconName } from "../Icon";

export interface SectionTitleProps {
  as: "h1" | "h2" | "h3";
  children: React.ReactNode;
  /** Barra de gradiente debajo. */
  decorated?: boolean;
  /** IconBox a la izquierda. */
  icon?: IconName;
  id?: string;             // para aria-labelledby de la sección
  className?: string;
}
```

`as` es obligatorio: el nivel lo decide el contexto (ver `foundations/typography.md`).
El **tamaño** sigue al nivel (`--font-size-h1/2/3`).

## Estilos y tokens

**decorated**
- `position: relative; margin-bottom: var(--title-decorated-gap)` (24px < 580 → 37px).
- `::after` (decorativo): `width: var(--size-title-bar-w); height: var(--size-title-bar-h);`
  `background: var(--gradient-accent); border-radius: var(--radius-8);`
  `position: absolute; left: 0; bottom: calc(var(--title-bar-offset) * -1)` (10px < 580 → 17px).

**with icon**
- `display: flex; align-items: center; gap: var(--space-4);`
- IconBox a la izquierda; texto a continuación.

## Estados

No es interactivo.

## Responsive

Sin `@media` propios: tamaño (`--font-size-h1/2/3`), separación
(`--title-decorated-gap`) y barra (`--size-title-bar-*`, `--title-bar-offset`)
escalan por tokens.

## Accesibilidad

- La barra es `::after` (sin contenido textual): no se lee.
- El IconBox es `aria-hidden`: el nombre accesible del heading es solo el texto.

## Tests esperados

- `as="h1"` → `getByRole("heading", { level: 1, name })`; ídem h2/h3.
- `decorated` aplica su clase.
- `icon` renderiza un IconBox y el nombre accesible del heading **no** cambia.
- `id` llega al heading.
- `expectNoA11yViolations` sin violaciones.

## No hacer

- No inferir el nivel a partir del tamaño ni viceversa.
- No usar `<hr>` ni un `<span>` real para la barra.
