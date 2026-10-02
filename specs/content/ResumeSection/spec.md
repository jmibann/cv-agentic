# ResumeSection
Estado: aprobada

## Propósito

Bloque "Education" o "Experience" del panel Resume: título h2 con IconBox +
Timeline.

## Requisitos (EARS)

- RF-1: CUANDO `entries` contiene elementos, ENTONCES EL SISTEMA renderiza una `<section>` nombrada por su título; SI `entries` está vacío, ENTONCES no renderiza nada.
- RF-2: EL SISTEMA renderiza el título como `h2` con su `icon` en un `IconBox` decorativo, seguido de un `Timeline` con las entradas recibidas.
- RF-3: EL SISTEMA deriva los ids del título a partir de `id`, de modo que dos secciones con `id` distintos no generen ids duplicados.
- RF-4: EL SISTEMA delega en ResumePage la disposición en columnas y no declara `@media` propios.
- RF-5: EL SISTEMA expone la sección como región nombrada por su `h2` (`aria-labelledby`), con los títulos del Timeline un nivel por debajo.

## Anatomía

```html
<section aria-labelledby="resume-education-title">
  <SectionTitle as="h2" id="resume-education-title" icon="book-open">Education</SectionTitle>
  <Timeline … />
</section>
```

## API

```ts
import type { IconName } from "../Icon";
import type { Locale, TimelineEntry } from "@data/cv.types.generated";

export interface ResumeSectionProps {
  /** Identificador estable: base de ids ("education" → "resume-education-title"). */
  id: string;
  title: string;
  icon: IconName;
  entries: readonly TimelineEntry[];
  locale: Locale;
  presentLabel: string;
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
5. Dos ResumeSection con `id` distintos no generan ids duplicados.
6. `expectNoA11yViolations` sin violaciones.
