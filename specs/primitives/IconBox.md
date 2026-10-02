# IconBox

## Propósito

Contenedor cuadrado tintado con un ícono en gradiente. Se usa en la lista
de contactos del Sidebar y junto a los h2 de las ResumeSection.

## Anatomía

`<span>` cuadrado con un `Icon tone="gradient"` centrado.

## API

```ts
import type { IconName } from "../Icon";

export interface IconBoxProps {
  icon: IconName;
  className?: string;
}
```

## Estilos y tokens

| Propiedad | Valor |
|---|---|
| Tamaño | `--size-icon-box` (3rem) cuadrado |
| Fondo | `--color-surface-muted` |
| Radio | `--radius-12` |
| Ícono | `Icon tone="gradient"` (tamaño por defecto de Icon: `--size-icon`) |
| Display | `inline-flex; align-items: center; justify-content: center; flex-shrink: 0;` |

## Estados

No es interactivo.

## Responsive

Tamaño fijo (`--size-icon-box`); sin `@media` propios.

## Accesibilidad

Siempre decorativo (`aria-hidden="true"` en el span). El significado lo da el
texto que lo acompaña (Overhead o título).

## Tests esperados

- Renderiza un svg con `stroke="url(#accent-gradient)"`.
- El contenedor tiene `aria-hidden="true"`.
- `expectNoA11yViolations` sin violaciones.

## No hacer

- No ponerlo dentro de un `Box variant="inner"` (mismo fondo).
- No usarlo como botón.
