# Separator
Estado: implementada

## Propósito

Línea horizontal de 1px que separa bloques dentro de un `Box variant="outer"`,
extendiéndose hasta los bordes de la card (full-bleed). Se usa en el Sidebar
entre la información básica y la lista de contactos.

## Requisitos (EARS)

- RF-1: CUANDO el componente se renderiza, ENTONCES EL SISTEMA dibuja una línea decorativa de 1px con `aria-hidden="true"`.
- RF-2: EL SISTEMA no expone rol `separator` ni usa `<hr>` (anunciaría un cambio de tema del contenido).
- RF-3: EL SISTEMA extiende la línea hasta los bordes de la card (`full-bleed` calculado desde `--box-padding`).
- RF-4: EL SISTEMA separa verticalmente con `--separator-gap` **en cada lado de la línea** (`margin-block`); el contenedor que lo hospeda **no** suma su `gap` en ese tramo (el espacio bloques-línea-bloques no se acumula). `--separator-gap` escala por breakpoint sin `@media` propios.
- RF-5: EL SISTEMA aplica `margin-block` como excepción documentada a "sin margen externo" (la única junto a `SectionTitle`).

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
- RF-1 (grosor 1px), RF-3 (full-bleed), RF-4/RF-5 (margen): verificación por **inspección del CSS** (jsdom no lo computa).

## No hacer

- No usar `<hr>` ni `role="separator"`: es decorativo (`aria-hidden="true"`).
- No usarlo fuera de un `Box variant="outer"`: el full-bleed depende de `--box-padding`.
- No tomar su `margin-block` como precedente: es una de las dos únicas excepciones a "sin margen externo" (junto con `SectionTitle`).
- No convivir con `gap` del padre en su tramo: el separador aporta todo el espacio vertical (RF-4).
- No agregar `@media` propios: la separación escala por `--separator-gap`.
