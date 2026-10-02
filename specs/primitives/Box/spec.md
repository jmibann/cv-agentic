# Box
Estado: aprobada

## Propósito

Superficie base del diseño. Dos variantes: la card flotante (`outer`) y el
bloque interno tintado (`inner`).

## Requisitos (EARS)

- RF-1: CUANDO el componente se renderiza sin `variant`, ENTONCES EL SISTEMA aplica la variante `outer` (superficie flotante con borde inferior y sombra).
- RF-2: CUANDO recibe `variant="inner"`, ENTONCES EL SISTEMA aplica la variante `inner` (fondo tintado, sin borde ni sombra).
- RF-3: CUANDO recibe `as`, ENTONCES EL SISTEMA renderiza ese elemento (`div` por defecto) y solo le transmite `children`, `id`, `aria-label`, `aria-labelledby` y `className`.
- RF-4: SI se le pasa un atributo fuera de la API cerrada (p. ej. `role` o `tabIndex`), ENTONCES EL SISTEMA no lo transmite al elemento.
- RF-5: EL SISTEMA resuelve fondo, radio, padding y cambios de breakpoint solo con tokens; Box no declara `@media` propios.
- RF-6: EL SISTEMA mantiene `overflow: visible` en `outer` para que el avatar del Sidebar y la CornerTab no se recorten.

## Anatomía

Un único elemento contenedor (tag configurable) con `children`.

## API

```ts
type BoxElement = "div" | "section" | "article" | "aside" | "header";

export interface BoxProps {
  variant?: "outer" | "inner";   // default "outer"
  as?: BoxElement;               // default "div"
  children: React.ReactNode;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
}
```

API cerrada: solo esos atributos llegan al elemento (sin pass-through
genérico de `role`, `tabIndex` ni `...rest`). `aria-label` y
`aria-labelledby` los usan Sidebar (`as="aside" aria-label`) y ServiceCard
(`as="article" aria-labelledby`).

El tabpanel de NavTabs **no** es un Box: es un `<div role="tabpanel">` dentro
del Box de contenido (ver `specs/layout/AppLayout.md`).

## Estilos y tokens

| | outer | inner |
|---|---|---|
| Fondo | `--color-surface` | `--color-surface-muted` |
| Radio | `--radius-20` | `--radius-box-inner` (14px < 580 → 16px) |
| Padding | `--box-padding` | `--box-inner-padding` |
| Borde | `border-bottom: var(--size-box-edge) solid var(--color-box-edge)` | — |
| Sombra | `--shadow-box` | — |
| Posición | `position: relative` (ancla de CornerTab) | — |

- `outer` usa `overflow: visible` (el avatar del sidebar y la CornerTab
  dependen de eso). La CornerTab resuelve su esquina con su propio radio.

## Estados

Sin estados interactivos.

## Responsive

Resuelto íntegramente por tokens (`--box-padding`, `--box-inner-padding`,
`--radius-box-inner`). El componente no tiene `@media` propios.

## Accesibilidad

Neutral. La semántica sale del elemento elegido con `as` (`section`,
`article`, `aside`) más su nombre (`aria-label` / `aria-labelledby`). Box no
acepta `role`.

## Tests esperados

- Renderiza `children`.
- Default: `div` con la clase de `outer`.
- `variant="inner"` aplica la clase de inner y no la de outer.
- `as="section"` renderiza un `<section>`.
- Pasa `id`, `aria-label` y `aria-labelledby` al elemento (p. ej. `as="aside" aria-label="Profile"` → `getByRole("complementary", { name: "Profile" })`).
- Concatena `className`.
- `expectNoA11yViolations` sin violaciones.

## No hacer

- No agregar margen externo.
- No crear variantes nuevas (p. ej. "outlined") sin actualizar esta spec.
