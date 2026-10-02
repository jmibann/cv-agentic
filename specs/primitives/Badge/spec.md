# Badge
Estado: aprobada

## Propósito

Etiqueta compacta sobre fondo tintado. Un solo componente, **`Badge`**
(carpeta `src/components/Badge/`, export `Badge`), con dos usos:

- **Badge**: el rol/headline bajo el nombre en el Sidebar.
- **Chip**: cada skill en `SkillList`.

## Requisitos (EARS)

- RF-1: CUANDO el componente recibe `children` con texto, ENTONCES EL SISTEMA renderiza ese texto en un `<span>`.
- RF-2: CUANDO recibe `as="li"`, ENTONCES EL SISTEMA renderiza un `<li>` válido dentro de la lista que lo contiene.
- RF-3: CUANDO recibe `className`, ENTONCES EL SISTEMA la concatena con su propia clase.
- RF-4: EL SISTEMA renderiza Badge sin estados interactivos y sin roles añadidos: texto plano.
- RF-5: EL SISTEMA escala el tamaño de texto con `--font-size-badge` y no declara `@media` propios; el texto no se parte (`white-space: nowrap`).
- RF-6: SI un Badge se coloca dentro de un `Box variant="inner"`, ENTONCES desaparece visualmente (mismo color de fondo), por lo que su uso queda restringido a superficies `surface`.

## Anatomía

Un `<span>` (o `<li>` cuando es ítem de lista) con texto.

## API

```ts
export interface BadgeProps {
  children: React.ReactNode;
  as?: "span" | "li";   // default "span"
  className?: string;
}
```

Se exporta como `Badge`. `SkillList` lo usa con `as="li"`.

## Estilos y tokens

| Propiedad | Valor |
|---|---|
| Fondo | `--color-surface-muted` |
| Texto | `--color-text`, `--font-size-badge`, `--font-weight-regular`, `line-height: var(--line-height-tight)` |
| Padding | `0.5rem 1rem` |
| Radio | `--radius-8` |
| Display | `inline-flex; align-items: center;` |
| Ajuste | `white-space: nowrap` (los chips no se parten; la lista hace wrap) |

**Importante:** el fondo es `surface-muted`, así que un Badge **no** puede ir
dentro de un `Box variant="inner"` (mismo color: desaparece). Siempre sobre `surface`.

## Estados

No es interactivo. Si en el futuro un chip fuera clickeable, eso es otro
componente.

## Responsive

Sin `@media` propios: el tamaño de texto escala por `--font-size-badge`
(11px < 768 → 13px).

## Accesibilidad

Texto plano, sin roles extra.

## Tests esperados

- Renderiza el texto.
- Default `<span>`; `as="li"` renderiza `<li>` (dentro de un `<ul>` en el test).
- Concatena `className`.
- `expectNoA11yViolations` sin violaciones (como `li` dentro de `ul`).

## No hacer

- No agregar variantes de color (success/warning…): no hay estados en este diseño.
