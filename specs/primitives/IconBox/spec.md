# IconBox
Estado: implementada

## Propósito

Contenedor cuadrado tintado con un ícono en gradiente. Se usa en la lista
de contactos del Sidebar y junto a los h2 de las ResumeSection.

## Requisitos (EARS)

- RF-1: CUANDO el componente recibe `icon`, ENTONCES EL SISTEMA renderiza un `Icon tone="gradient"` centrado en un contenedor cuadrado tintado. IconBox **no monta** las defs del gradiente: la unicidad del montaje la garantiza AppLayout (RF-6 de su spec).
- RF-2: EL SISTEMA marca el contenedor decorativo (`aria-hidden="true"`): el significado lo da el texto que lo acompaña.
- RF-3: EL SISTEMA mantiene el tamaño con `--size-icon-box` y no declara `@media` propios (verificación: inspección del CSS).
- RF-4: EL SISTEMA renderiza IconBox sin roles interactivos ni reglas `:hover`/`:focus`/transiciones propias (verificación: inspección + axe).
- RF-5: SI IconBox se coloca dentro de un `Box variant="inner"`, ENTONCES comparte fondo con el contenedor y pierde visibilidad, por lo que ese uso queda prohibido. Restricción de uso: la verifica el reviewer en F3/F4 (el primitivo no detecta superficies).

## Anatomía

`<span>` cuadrado con un `Icon tone="gradient"` centrado.

## API

```ts
import type { IconName } from "../Icon";

export interface IconBoxProps {
  icon: IconName;
  /** Se une a la clase base del `<span>` raíz. Nota: `--icon-size` fijada aquí NO llega al ícono (no hereda). */
  className?: string;
}
```

## Estilos y tokens

| Propiedad | Valor |
|---|---|
| Tamaño | `--size-icon-box` (3rem) cuadrado |
| Fondo | `--color-surface-muted` |
| Radio | `--radius-12` |
| Ícono | `Icon tone="gradient"`: IconBox **no** pasa `--icon-size`, aplica el fallback default de Icon (`--size-icon`) |
| Display | `inline-flex; align-items: center; justify-content: center; flex-shrink: 0;` |

## Estados

No es interactivo.

## Responsive

Tamaño fijo (`--size-icon-box`); sin `@media` propios.

## Accesibilidad

Siempre decorativo (`aria-hidden="true"` en el span). El significado lo da el
texto que lo acompaña (Overhead o título).

## Tests esperados

- Renderiza un svg con `stroke="url(#accent-gradient)"` (el test monta `AccentGradientDefs` como armazón, según Icon).
- El contenedor tiene `aria-hidden="true"`.
- `expectNoA11yViolations` sin violaciones.

## No hacer

- No ponerlo dentro de un `Box variant="inner"` (mismo fondo).
- No usarlo como botón.
- No declarar margen propio: el espaciado con el texto acompañante lo pone el consumidor (gap de Sidebar/ResumeSection).
