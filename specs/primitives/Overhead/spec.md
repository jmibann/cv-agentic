# Overhead
Estado: aprobada

## Propósito

Etiqueta pequeña en mayúsculas que precede a un valor ("EMAIL" sobre
"alex@example.com").

## Requisitos (EARS)

- RF-1: CUANDO el componente recibe texto, ENTONCES EL SISTEMA lo muestra en mayúsculas por CSS (`text-transform: uppercase`) sin transformar el texto del DOM.
- RF-2: CUANDO recibe `as="dt"`, ENTONCES EL SISTEMA renderiza un `<dt>` válido dentro de la `<dl>` que lo contiene.
- RF-3: EL SISTEMA trunca el texto largo con elipsis (`overflow: hidden`, `text-overflow: ellipsis`, `white-space: nowrap`).
- RF-4: SI el Overhead se sitúa sobre `--color-bg` en claro, ENTONCES el contraste queda en 4.32:1 y es insuficiente; por eso su uso se restringe a `surface`, `surface-muted` y `surface-raised`.
- RF-5: EL SISTEMA escala el tamaño con `--font-size-overhead` y no declara `@media` propios.
- RF-6: EL SISTEMA lo renderiza no interactivo y sin roles añadidos.

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
