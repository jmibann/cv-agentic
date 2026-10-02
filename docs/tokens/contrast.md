# Contraste (WCAG 2.2)

Umbrales: **AA texto normal ≥ 4.5:1**, AA texto grande (≥ 24px, o ≥ 18.66px en negrita) ≥ 3:1,
componentes de UI y gráficos que transmiten información ≥ 3:1.

Valores calculados con la fórmula de luminancia relativa de WCAG sobre los
tokens de `tokens.css`.

## Texto sobre superficies

| Texto → / Fondo ↓ | `bg` | `surface` | `surface-muted` | `surface-raised` |
|---|---|---|---|---|
| **Claro** `heading` / `text` `#3b4b5e` | 7.69 ✅ | 8.92 ✅ | 8.31 ✅ | 8.31 ✅ |
| **Claro** `text-muted` `#637085` | **4.32 ⚠️** | 5.02 ✅ | 4.67 ✅ | 4.67 ✅ |
| **Claro** `accent-text` `#304cfd` | 5.06 ✅ | 5.87 ✅ | 5.47 ✅ | 5.47 ✅ |
| **Oscuro** `heading` `#ffffff` | 18.24 ✅ | 16.11 ✅ | 17.38 ✅ | 14.17 ✅ |
| **Oscuro** `text` `#e8e8e8` | 14.88 ✅ | 13.15 ✅ | 14.18 ✅ | 11.57 ✅ |
| **Oscuro** `text-muted` `#9e9e9e` | 6.81 ✅ | 6.01 ✅ | 6.49 ✅ | 5.29 ✅ |
| **Oscuro** `accent-text` `#fadd7f` | 13.65 ✅ | 12.06 ✅ | 13.00 ✅ | 10.60 ✅ |

### Pares derivados (opacidad)

| Uso | Par | Contraste |
|---|---|---|
| Tab inactivo de NavTabs (`--color-text` al 80% de opacidad) | claro sobre `surface-raised` | 4.92 ✅ |
| Tab inactivo de NavTabs (`--color-text` al 80% de opacidad) | oscuro sobre `surface-raised` | 7.96 ✅ |
| Button en hover (elemento completo al 90%, sobre `surface`) | claro: `on-accent` sobre inicio / fin del gradiente | 4.92 ✅ / 5.75 ✅ |
| Button en hover (elemento completo al 90%, sobre `surface`) | oscuro: `on-accent` sobre inicio / fin del gradiente | 11.19 ✅ / 9.20 ✅ |
| Button deshabilitado (50%) | ambos temas | **Exento**: WCAG 1.4.3 no exige contraste a componentes inactivos. El estado deshabilitado debe comunicarse también por `disabled` (nativo) y `cursor: not-allowed` |

Cualquier otro uso de `opacity` sobre texto o íconos informativos debe
agregar su fila acá con el valor calculado.

### Íconos informativos (WCAG 1.4.11, mínimo 3:1)

| Uso | Claro | Oscuro |
|---|---|---|
| Íconos de redes sociales del Sidebar (`--color-text-muted` sobre `surface`) | 5.02 ✅ | 6.01 ✅ |
| Íconos de redes en hover/foco (`--color-accent-text` sobre `surface`) | 5.87 ✅ | 12.06 ✅ |

## Texto sobre acento

| Par | Contraste |
|---|---|
| Claro: `on-accent` `#fff` sobre `#304cfd` (inicio del gradiente) | 5.87 ✅ |
| Claro: `on-accent` `#fff` sobre `#2640eb` (fin del gradiente) | 6.96 ✅ |
| Oscuro: `on-accent` `#151517` sobre `#fadd7f` | 13.65 ✅ |
| Oscuro: `on-accent` `#151517` sobre `#f6c16f` | 11.09 ✅ |
| Oscuro: **blanco** sobre `#fadd7f` (prohibido) | 1.34 ❌ |

## Líneas y decoración

| Par | Contraste | Uso permitido |
|---|---|---|
| Claro: `track`/`border` `#e3e5e8` sobre `surface` | 1.26 | Solo decorativo |
| Oscuro: `track`/`border` `#2f2f30` sobre `surface` | 1.20 | Solo decorativo |
| Oscuro: `surface-raised` sobre `surface` | 1.14 | Solo con borde de 1px `--color-border` |
| Punto del Timeline (`accent`) sobre `surface` | 5.87 claro / 12.06 oscuro | ✅ |

## Reglas que se derivan

1. **`--color-text-muted` nunca va directo sobre `--color-bg`** en claro (4.32:1).
   Todo lo que está sobre el fondo de página (ControlsBar) usa `--color-text`.
2. **Texto sobre `--gradient-accent` o `--color-accent` siempre usa `--color-on-accent`**,
   nunca blanco fijo: en oscuro el acento es dorado y el blanco no se lee.
3. **`--color-track` y `--color-border` son decorativos.** Ningún estado
   (activo, seleccionado, error) puede comunicarse solo con ellos. Los bullets
   del carrusel indican el activo por **tamaño** (10px → 20px) además del color.
4. **`--color-surface-raised` siempre lleva borde de 1px** (`--color-border`);
   sin él la CornerTab no se distingue de la card en oscuro.
5. Anillo de foco: siempre
   `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset);`
   (2px / 2px). El color es el acento sólido: contra `surface` da 5.87:1 en claro y
   12.06:1 en oscuro (mínimo exigido para indicadores de foco: 3:1).
6. Íconos con gradiente (`IconBox`, comilla de testimonio) son decorativos y
   siempre van acompañados de texto; si un ícono es el único contenido de un
   control, el control lleva `aria-label`.

## Verificación

axe (`expectNoA11yViolations`) corre en jsdom y **no mide contraste** (jsdom no calcula
estilos). El contraste se garantiza por diseño: los componentes solo usan
los pares de esta tabla. En QA visual el reviewer revisa esos pares en ambos
temas (y corre axe en un navegador real si lo tiene disponible). Si se agrega un
token de color nuevo, **se agrega su fila acá** con el valor calculado.
