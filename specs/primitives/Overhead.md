# Overhead

## Propósito

Etiqueta pequeña en mayúsculas que precede a un valor ("EMAIL" sobre
"alex@example.com").

## Anatomía

`<span>` en bloque.

## API

```ts
export interface OverheadProps {
  children: React.ReactNode;
  as?: "span" | "dt" | "p";  // default "span"; "dt" cuando va en una <dl>
  className?: string;
}
```

## Estilos y tokens

| Propiedad | Valor |
|---|---|
| Color | `--color-text-muted` |
| Tamaño | `--font-size-overhead` |
| Peso | `--font-weight-regular` |
| Transformación | `text-transform: uppercase` |
| Display | `block`; `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;` |

## Estados

No es interactivo.

## Responsive

Sin `@media` propios: el tamaño escala por `--font-size-overhead` (11px < 580 → 12px).

## Accesibilidad

`text-transform` no altera lo que leen los lectores de pantalla: el texto en el
DOM va en capitalización normal ("Email"), no en mayúsculas.

## Reglas de contraste

Nunca sobre `--color-bg` en claro (4.32:1). Sí sobre `surface`,
`surface-muted` y `surface-raised` (ver `docs/tokens/contrast.md`).

## Tests esperados

- Renderiza el texto tal cual (sin transformar en el DOM).
- `as="dt"` renderiza `<dt>` (dentro de `<dl>` en el test).
- Concatena `className`.
- `expectNoA11yViolations` sin violaciones.
