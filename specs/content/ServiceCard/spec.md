# ServiceCard
Estado: aprobada

## Propósito

Tarjeta de "What I'm Doing" en el panel About: ícono, título y descripción
de un servicio o área de trabajo.

## Requisitos (EARS)

- RF-1: CUANDO el componente recibe un `service`, ENTONCES EL SISTEMA renderiza un `<article>` nombrado por su `h3`, con el título (como `SectionTitle as="h3"`, decisión 16: tamaño y margen 0.5rem los aporta SectionTitle, la pieza no los duplica) y la descripción del servicio. El nivel es fijo h3, sin prop que lo cambie.
- RF-2: EL SISTEMA renderiza el ícono con `name = service.icon` (campo `icon` del esquema) y `tone="gradient"`, decorativo; el tamaño se fija con `--icon-size` en la clase del propio ícono (`.glyph`). No hay wrapper `.icon`: el `Icon` ya trae `flex-shrink: 0` (la "caja" es el glifo mismo de 2.5rem, sin inset — decisión 16). **No usa `IconBox`** por contrato: IconBox RF-5 prohíbe ponerlo dentro de `Box variant="inner"` (la card es un Box inner) y su API no re-escala el glifo.
- RF-3: EL SISTEMA genera el id del título con la fórmula fija `service-${service.id}-title` y el `<article>` se nombra con ese id (sin duplicados por `service.id` del esquema).
- RF-4: EL SISTEMA organiza el layout **mobile-first**: la base (sin media) apila el ícono arriba y centra el texto; CUANDO el ancho es 580px o más (`@media (min-width: 580px)`), ENTONCES el ícono queda a la izquierda del texto. Verificación: inspección del CSS + QA F5 (jsdom no computa).
- RF-5: EL SISTEMA deja la cantidad de columnas a AboutPage, iguala alturas con `height: 100%` y no declara `@media` con medidas literales. En impresión, el `break-inside: avoid` lo pone el estilo compartido (G-D; `foundations/layout.md` → Impresión): la pieza no declara `@media print`.
- RF-6: EL SISTEMA renderiza ServiceCard sin estados interactivos propios (sin hover ni foco). Verificación: inspección del CSS + axe.

## Anatomía

```
≥ 580px                                  < 580px
┌───────────────────────────────┐        ┌─────────────────┐
│ ⟨⟩   Web Applications         │        │       ⟨⟩        │
│      Single-page apps with…   │        │ Web Applications│
└───────────────────────────────┘        │ Single-page…    │
                                         └─────────────────┘
```

```html
<Box variant="inner" as="article" aria-labelledby="service-web-apps-title">
  <Icon name={service.icon} tone="gradient" className={styles.glyph} />
  <div>
    <SectionTitle as="h3" id="service-web-apps-title">Web Applications</SectionTitle>
    <p>Single-page apps with…</p>
  </div>
</Box>
```

## API

```ts
import type { Service } from "@data/cv.types.generated";

export interface ServiceCardProps {
  service: Service;
  /** Se une al raíz: se transmite al Box `as="article"` (Box aplica la unión en su raíz, G-B). */
  className?: string;
}
```

## Estilos y tokens

| Parte | Valor |
|---|---|
| Contenedor (base) | `Box variant="inner"`; `display: flex; flex-direction: column; align-items: center; text-align: center; gap: var(--space-4); height: 100%;` |
| ≥ 580px (solo layout) | `flex-direction: row; align-items: flex-start; text-align: start;` (el `gap` sigue siendo `--space-4`; sin medidas literales en el media) |
| Ícono | `.glyph { --icon-size: var(--size-service-icon); }` sobre el propio `Icon` (2.5rem; la variable no se hereda, Icon RF-6; `flex-shrink: 0` ya lo trae Icon) |
| Título | `SectionTitle as="h3"` (font-size `--font-size-h3` y `margin-bottom: 0.5rem` por RF-1/RF-5 de SectionTitle; la pieza no los declara) |
| Descripción | cuerpo; `margin: 0` |

La grilla (1 columna; 2 columnas ≥ lg con `gap: var(--layout-gap)`) la arma
AboutPage. `height: 100%` iguala alturas en la misma fila.

## Estados

No es interactivo: sin hover ni foco.

## Responsive

- Base (mobile-first): ícono arriba y texto centrado.
- ≥ 580px: ícono a la izquierda (cambio de dirección, sin cambiar medidas).
- La cantidad de columnas la decide AboutPage.

## Accesibilidad

- `<article>` nombrado por su h3 (SectionTitle con `id`).
- Ícono decorativo; los tests con `tone="gradient"` montan `AccentGradientDefs` de armazón (contrato de Icon, criterio IconBox).

## Tests esperados

1. `getByRole("article", { name: service.title })`.
2. Heading nivel 3 con el título y párrafo con la descripción.
3. Renderiza un svg decorativo con `stroke="url(#accent-gradient)"` y el glyph corresponde a `service.icon` (clase `lucide-*` propagada por Icon; armazón `AccentGradientDefs`).
4. El id del título es `service-${service.id}-title` y el `<article>` lo referencia en `aria-labelledby`.
5. `expectNoA11yViolations` sin violaciones.

## No hacer

- No agregar hover ni foco: no es interactiva.
- No pasar `size` al `Icon` ni fijar `--icon-size` en un contenedor: va en la clase del propio ícono (`.glyph`).
- No envolver el ícono en un `<span class="icon">`: la caja es el glifo (decisión 16).
- No usar `IconBox` dentro de esta card (Box inner): prohibido por IconBox RF-5.
- No declarar el título con h3 crudo + estilos propios: usa `SectionTitle as="h3"`.
- No invertir el orden responsive: base = columna centrada; el `@media (min-width: 580px)` pasa a fila (mobile-first, `docs/tokens/breakpoints.md`).
- No decidir la cantidad de columnas: la grilla la arma AboutPage.
- No cambiar medidas en el `@media`: solo dirección, alineación y centrado.
