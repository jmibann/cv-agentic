# Badge

## Propósito

Etiqueta compacta sobre fondo tintado. Un solo componente, **`Badge`**
(carpeta `src/components/Badge/`, export `Badge`), con dos usos:

- **Badge**: el rol/headline bajo el nombre en el Sidebar.
- **Chip**: cada skill en `SkillList`.

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
