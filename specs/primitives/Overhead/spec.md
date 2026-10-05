# Overhead
Estado: aprobada

## Propósito

Etiqueta pequeña en mayúsculas que precede a un valor ("EMAIL" sobre
"alex@example.com").

## Requisitos (EARS)

- RF-1: CUANDO el componente recibe texto, ENTONCES EL SISTEMA lo muestra en mayúsculas por CSS (`text-transform: uppercase`) sin transformar el texto del DOM.
- RF-2: CUANDO recibe `as="dt"`, ENTONCES EL SISTEMA renderiza un `<dt>`; la validez del contexto de la `<dl>` es del consumidor (el test usa `<dl>` de armazón).
- RF-3: EL SISTEMA trunca el texto largo con elipsis (`overflow: hidden`, `text-overflow: ellipsis`, `white-space: nowrap`) **cuando el contenedor restringe el ancho**: Overhead no declara `max-width` propio. Verificación: inspección del CSS (jsdom no computa el truncamiento).
- RF-4: SI el Overhead se sitúa sobre `--color-bg` en claro, ENTONCES el contraste queda en 4.32:1 y es insuficiente; por eso su uso se restringe a `surface`, `surface-muted` y `surface-raised`. Restricción de uso: la verifica el reviewer en el consumidor (el componente no conoce el fondo).
- RF-5: EL SISTEMA escala el tamaño con `--font-size-overhead` y no declara `@media` propios (verificación: inspección del CSS).
- RF-6: EL SISTEMA lo renderiza no interactivo y sin roles añadidos (inspección + axe).

## Anatomía

`<span>` en bloque (o `<dt>` según `as`).

## API

```ts
export interface OverheadProps {
  children: React.ReactNode;
  as?: "span" | "dt";  // default "span"; "dt" cuando va en una <dl>
  /** Se une a la clase base del elemento raíz. */
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
- Concatena `className` (criterio de CSS Modules de la fase).
- `expectNoA11yViolations` sin violaciones.

## No hacer

- No escribir el texto en mayúsculas en el DOM: la capitalización la pone `text-transform` (Accesibilidad).
- No usarlo sobre `--color-bg` en tema claro (4.32:1): solo sobre `surface`, `surface-muted` o `surface-raised`.
- No agregar `@media` propios: el tamaño escala por `--font-size-overhead`.
- No hacerlo interactivo ni agregarle roles.
