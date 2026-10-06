# CornerTab
Estado: implementada

## Propósito

Forma de "solapa de carpeta" pegada a la esquina superior derecha de un
`Box variant="outer"`. Es la base visual de **NavTabs** (card de contenido) y
del botón **Show Contacts** (card del Sidebar, < xl). Solo aporta forma y
posición; el contenido y el comportamiento los pone quien la usa.

## Requisitos (EARS)

- RF-1: CUANDO `placement` es `"overlay"` (default), ENTONCES EL SISTEMA lo posiciona en absoluto en la esquina superior derecha del Box contenedor, con `z-index: var(--z-raised)`. Verificación: inspección + QA al usarla en F3/F4 (jsdom no computa posición).
- RF-2: CUANDO recibe `size`, ENTONCES EL SISTEMA aplica la variante `sm` o `md` (default `md`).
- RF-3: CUANDO recibe `placement="float"` y el viewport es ≥ 992px, ENTONCES EL SISTEMA la saca del posicionamiento absoluto (y del apilamiento: `z-index: auto`) y la flota a la derecha para que el contenido siguiente fluya a su lado; SI el viewport es < 992px, ENTONCES permanece absoluta.
- RF-4: EL SISTEMA mantiene la tab visible en todos los breakpoints de **pantalla**; en impresión se oculta con los estilos compartidos (`foundations/layout.md`): CornerTab **no** declara `@media print` propio.
- RF-5: EL SISTEMA pinta siempre el borde `1px solid var(--color-border)`: en oscuro separa `surface-raised` de `surface` (sin borde quedaría en 1.14:1; regla 4 de `docs/tokens/contrast.md`). Verificación: inspección del CSS (axe no mide contraste en jsdom).
- RF-6: EL SISTEMA no agrega roles ni atributos `aria-*` a la tab; los estados de hover y foco pertenecen a su contenido.

## Anatomía

```
┌──────────────────────────────╭────────────────────────┐   ← borde superior y derecho
│                              │   contenido (children) │     coinciden con los del Box
│                              ╰────────────────────────┤
│                                                       │
```

Un `<div>` posicionado en absoluto dentro del Box (que es `position: relative`).

## API

```ts
export interface CornerTabProps {
  children: React.ReactNode;
  /** "md": altura de nav (--size-nav-tab-height). "sm": compacta (Show Contacts). Default "md". */
  size?: "sm" | "md";
  /**
   * "overlay" (default): siempre posicionada en absoluto sobre la esquina.
   * "float": absoluta en < lg; en ≥ lg flota a la derecha (en el flujo) para
   * que el contenido que sigue (el h1 del panel) fluya a su lado usando el
   * ancho real de la tab. Solo lo usa NavTabs.
   */
  placement?: "overlay" | "float";
  /** Se une a la clase base del `<div>` raíz. */
  className?: string;
}
```

## Estilos y tokens

| Propiedad | Valor |
|---|---|
| Posición | `position: absolute; top: 0; right: 0; z-index: var(--z-raised);` (base; rige en `overlay`, RF-1) |
| Fondo | `--color-surface-raised` |
| Borde | `border-left: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border);` |
| Radio | `border-radius: 0 var(--radius-20) 0 var(--radius-32);` (arriba-der = radio del Box) |
| Sombra | ninguna |
| Layout interno | `display: flex; align-items: center;` |
| `size="md"` | `min-height: var(--size-nav-tab-height); padding-inline: var(--corner-tab-padding-inline)` (20px < 992 → 32px) |
| `size="sm"` | `min-height: 2.75rem; padding-inline: 1.25rem;` |

- En oscuro, `surface-raised` contra `surface` es 1.14:1: **el borde es
  obligatorio** (regla 4 de `docs/tokens/contrast.md`).
- El Box tiene `border-bottom` de 5px; no afecta a la tab (va arriba).

## Estados

Ninguno propio. Los estados de hover/foco son del contenido (tabs, botón).

## Responsive

- El padding de `size="md"` escala por token (`--corner-tab-padding-inline`).
- La tab **siempre está visible** en todos los breakpoints de pantalla; en impresión la oculta el estilo compartido de `foundations/layout.md` (RF-4).
- `placement="float"`, en `@media (min-width: 992px)` (solo cambio de posicionamiento):

  ```css
  .float {
    position: relative;          /* sale del absoluto; sigue anclada a la esquina */
    z-index: auto;               /* en el flujo no apila (RF-3) */
    float: right;
    margin-top: calc(var(--box-padding) * -1);
    margin-right: calc(var(--box-padding) * -1);
    margin-left: var(--space-6); /* aire entre el h1 y la tab */
  }
  ```

  Los márgenes negativos compensan el padding del Box para que la tab siga
  pegada a la esquina. Requisito para el contenido que sigue: **no** puede
  crear un contexto de formato propio (flex, grid, `overflow` ≠ visible,
  `display: flow-root`) en el tramo que convive con la tab; si no, se
  angosta entero en vez de fluir (ver `specs/pages/*.md`).

## Accesibilidad

Sin rol propio (es un contenedor visual). No debe tener `aria-*`.

## Tests esperados

- Renderiza `children`.
- `size="sm"` / `"md"` aplican clases distintas; default `md` (aserción con el criterio de CSS Modules de la fase).
- `placement="float"` aplica su clase; default `overlay` no la aplica.
- El raíz no tiene atributo `role` **ni ningún `aria-*`**.
- `expectNoA11yViolations` sin violaciones.

## No hacer

- No agregarle sombra "para separarla": el diseño la separa por color + borde.
- No usar gradiente de acento en el fondo (el tema original tenía una píldora
  con gradiente; este diseño la reemplaza).
