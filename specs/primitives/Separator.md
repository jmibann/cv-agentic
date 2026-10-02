# Separator

## Propósito

Línea horizontal de 1px que separa bloques dentro de un `Box variant="outer"`,
extendiéndose hasta los bordes de la card (full-bleed). Se usa en el Sidebar
entre la información básica y la lista de contactos.

## Anatomía

`<div>` decorativo.

## API

```ts
export interface SeparatorProps {
  className?: string;
}
```

## Estilos y tokens

| Propiedad | Valor |
|---|---|
| Alto | 1px |
| Color | `background-color: var(--color-track)` |
| Full-bleed | `margin-inline: calc(var(--box-padding) * -1); width: calc(100% + var(--box-padding) * 2);` |
| Margen vertical | `margin-block: var(--separator-gap)` (16px < 580 → 24px) |

Excepción a "sin margen externo": el full-bleed depende del padding del Box
padre, y por eso el separador se posiciona a sí mismo.

## Estados

No es interactivo.

## Responsive

Sin `@media` propios: la separación vertical escala por `--separator-gap` y el
full-bleed sigue a `--box-padding`.

## Accesibilidad

Decorativo: `aria-hidden="true"` (no `<hr>`, que anuncia un cambio de tema del
contenido).

## Tests esperados

- Renderiza un elemento con `aria-hidden="true"`.
- No expone rol `separator`.
- `expectNoA11yViolations` sin violaciones.
