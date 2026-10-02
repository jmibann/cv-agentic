# ServiceCard
Estado: aprobada

## Propósito

Tarjeta de "What I'm Doing" en el panel About: ícono, título y descripción
de un servicio o área de trabajo.

## Requisitos (EARS)

- RF-1: CUANDO el componente recibe un `service`, ENTONCES EL SISTEMA renderiza un `<article>` nombrado por su `h3`, con el título y la descripción del servicio.
- RF-2: EL SISTEMA renderiza el ícono con `tone="gradient"` y lo trata como decorativo; el tamaño se fija con `--icon-size` en la clase del propio ícono.
- RF-3: EL SISTEMA genera los ids a partir de `service.id`, de modo que no haya ids duplicados.
- RF-4: SI el ancho es menor que 580px, ENTONCES EL SISTEMA pone el ícono arriba y centra el texto; SI es 580px o más, ENTONCES el ícono queda a la izquierda del texto.
- RF-5: EL SISTEMA deja la cantidad de columnas a AboutPage, iguala alturas con `height: 100%` y no declara `@media` con medidas literales.
- RF-6: EL SISTEMA renderiza ServiceCard sin estados interactivos propios (sin hover ni foco).

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
  <span class="icon"><Icon name="code" tone="gradient" className={styles.glyph} /></span>
  <div>
    <h3 id="service-web-apps-title">Web Applications</h3>
    <p>Single-page apps with…</p>
  </div>
</Box>
```

## API

```ts
import type { Service } from "@data/cv.types.generated";

export interface ServiceCardProps {
  service: Service;
  className?: string;
}
```

## Estilos y tokens

| Parte | Valor |
|---|---|
| Contenedor | `Box variant="inner"`; `display: flex; align-items: flex-start; gap: var(--space-4); height: 100%;` |
| Ícono | caja `.icon` de `--size-service-icon` (2.5rem), `flex-shrink: 0`, centra el glifo; el `Icon` (`tone="gradient"`) recibe `className={styles.glyph}` con `.glyph { --icon-size: var(--size-service-icon); }` (la variable se fija en el propio ícono: no se hereda) |
| Título | h3: `--font-size-h3`, `--font-weight-semibold`, `margin-bottom: 0.5rem` |
| Descripción | cuerpo; `margin: 0` |
| < 580px (solo layout) | `flex-direction: column; align-items: center; text-align: center;` (el `gap` sigue siendo `--space-4`) |

La grilla (1 columna; 2 columnas ≥ lg con `gap: var(--layout-gap)`) la arma
AboutPage. `height: 100%` iguala alturas en la misma fila.

## Estados

No es interactivo: sin hover ni foco.

## Responsive

- < 580px: ícono arriba y texto centrado (cambio de dirección, sin cambiar medidas).
- ≥ 580px: ícono a la izquierda.
- La cantidad de columnas la decide AboutPage.

## Accesibilidad

- `<article>` nombrado por su h3.
- Ícono decorativo.

## Tests esperados

1. `getByRole("article", { name: service.title })`.
2. Heading nivel 3 con el título y párrafo con la descripción.
3. Renderiza un svg decorativo con `stroke="url(#accent-gradient)"`.
4. Ids únicos por `service.id`.
5. `expectNoA11yViolations` sin violaciones.
