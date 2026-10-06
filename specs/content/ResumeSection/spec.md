# ResumeSection
Estado: aprobada

## Propósito

Bloque "Education" o "Experience" del panel Resume: título h2 con IconBox +
Timeline.

## Requisitos (EARS)

- RF-1: CUANDO `entries` contiene elementos, ENTONCES EL SISTEMA renderiza una `<section>` nombrada por su título; SI `entries` está vacío, ENTONCES no renderiza nada.
- RF-2: EL SISTEMA renderiza un `SectionTitle` `as="h2"` con `id` derivado e `icon` (que SectionTitle monta en su `IconBox` decorativo, RF-3 de SectionTitle), seguido de un `Timeline` con las entradas, el `locale` y el `presentLabel` recibidos, y el **`idPrefix` explícito recibido por prop** (decisión 14: no hay derivación interna "education"→"edu"; lo fija ResumePage).
- RF-3: EL SISTEMA deriva **solo el id del `h2`** de la sección con la fórmula fija `resume-${id}-title` (`id` de la prop); la unicidad de los ids de los ítems del Timeline la garantiza su `idPrefix` (RF-5 de Timeline), no esta pieza.
- RF-4: EL SISTEMA delega en ResumePage la disposición en columnas y no declara `@media` propios. Verificación: inspección del CSS de la pieza.
- RF-5: EL SISTEMA expone la sección como región nombrada por su `h2` (`aria-labelledby`). El nivel h3 de los títulos del Timeline lo fija Timeline (RF-2 de su spec) y se comprueba en sus tests; aquí la región nombrada queda verificada por test 1.

## Anatomía

```html
<section aria-labelledby="resume-education-title">
  <SectionTitle as="h2" id="resume-education-title" icon="book-open">Education</SectionTitle>
  <Timeline idPrefix={timelineIdPrefix} entries={entries} locale={locale} presentLabel={presentLabel} />
</section>
```

## API

```ts
import type { IconName } from "../Icon";
import type { Locale, TimelineEntry } from "@data/cv.types.generated";

export interface ResumeSectionProps {
  /** Identificador estable de la sección: base del id del h2 (`resume-${id}-title`). */
  id: string;
  /** Prefijo explícito que se reenvía a Timeline para sus ids de ítem (ej. "edu", "exp"); decisión 14. */
  timelineIdPrefix: string;
  title: string;
  icon: IconName;
  entries: readonly TimelineEntry[];
  locale: Locale;
  presentLabel: string;
  /** Se une a la clase base de la `<section>` raíz (G-B). */
  className?: string;
}
```

## Estilos y tokens

- `display: flex; flex-direction: column;`
- El h2 usa `margin-bottom` del SectionTitle; entre título y timeline no se agrega más.
- La disposición en columnas (lado a lado ≥ md) la hace **ResumePage**, no este componente.

## Estados

No es interactivo. Con `entries` vacío no se renderiza.

## Responsive

Sin `@media` propios. La disposición en columnas la decide ResumePage.

## Accesibilidad

- `<section>` nombrada por su h2 (`aria-labelledby`), así aparece como región.
- Los títulos del Timeline son h3 (un nivel debajo).

## Tests esperados

1. `getByRole("region", { name: title })`.
2. Contiene un heading nivel 2 con `title` y un IconBox decorativo.
3. Renderiza el Timeline con las entradas (`listitem` × n).
4. `entries` vacío → no renderiza la sección (`null`).
5. Dos ResumeSection con `id` distintos producen `resume-<id>-title` distintos (solo el id del h2; RF-3).
6. `expectNoA11yViolations` sin violaciones.

## No hacer

- No renderizar la sección con `entries` vacío: devuelve `null`.
- No decidir columnas ni declarar `@media`: la disposición la hace ResumePage.
- No agregar espacio entre el título y el Timeline: alcanza el `margin-bottom` del SectionTitle.
- No usar ids fijos: se derivan de `id` para que dos secciones no los dupliquen.
