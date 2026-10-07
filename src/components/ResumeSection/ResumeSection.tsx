// ResumeSection — bloque Education/Experience del panel Resume
// (specs/content/ResumeSection/spec.md). T1 hecha: `<section>` nombrada por su
// h2 vía `aria-labelledby` con el id derivado por la fórmula fija
// `resume-${id}-title` (RF-1, RF-3, RF-5); dentro, un `SectionTitle as="h2"`
// con el `icon` recibido (es SectionTitle quien monta el `IconBox` decorativo,
// RF-3 de su spec; esta pieza no lo importa) seguido de un `Timeline` con el
// passthrough completo de `entries`/`locale`/`presentLabel` y el
// `timelineIdPrefix` **explícito recibido por prop** reenviado a su `idPrefix`
// (RF-2; decisión 14: no hay derivación interna "education"→"edu"). Con
// `entries=[]` no renderiza nada (RF-1 SI-clause, spec → "No hacer").
// La `className` externa se UNE a la clase base del `<section>` raíz ya en T1
// (spec → API, G-B): ningún "Hecho cuando" de T2 la reclama (criterio
// Timeline/NavTabs/ControlsBar/ThemeToggle/LanguageSwitcher T1); el módulo
// nace acá con la clase base vacía (criterio IconBox/LanguageSwitcher/Timeline)
// y T2 le conecta la columna flex de spec → "Estilos y tokens" (RF-4).

import type { Locale, TimelineEntry } from "@data/cv.types.generated";

import type { IconName } from "../Icon";
import { SectionTitle } from "../SectionTitle";
import { Timeline } from "../Timeline";

import styles from "./ResumeSection.module.css";

// API (spec → API) completa desde T1: todas las props se conectan menos
// `className`, que también se conecta en T1 (ver encabezado). `id` es la base
// de la fórmula del id del h2 (RF-3); `timelineIdPrefix` se reenvía tal cual
// a Timeline (RF-2; la unicidad de los ids de ítem la garantiza el prefijo,
// no esta pieza — RF-3).
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

export function ResumeSection({
  id,
  timelineIdPrefix,
  title,
  icon,
  entries,
  locale,
  presentLabel,
  className,
}: ResumeSectionProps) {
  // RF-1 (SI-clause) / spec → "No hacer": con `entries` vacío no se renderiza
  // la sección (ni el <section> ni el título: un bloque "Education" sin
  // entradas no aporta contenido; plan → Decisiones, mismo criterio Timeline).
  if (entries.length === 0) {
    return null;
  }

  // RF-3: única derivación de la pieza — el id del h2, fórmula fija sobre la
  // prop `id`. El `aria-labelledby` de la región apunta exactamente ahí
  // (Anatomía literal de la spec).
  const titleId = `resume-${id}-title`;

  // Unión #99 (G-B, spec → API) en el único raíz: array + filtro de undefined
  // + join, base primero (mismo mecanismo aprobado en Box/Icon/Badge/IconBox/
  // Timeline); así no quedan clases vacías cuando `className` no se pasa.
  // Bajo `noUncheckedIndexedAccess` la clase del módulo es
  // `string | undefined`.
  const rootClassName = [styles.resumeSection, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return (
    // RF-5 / spec → Accesibilidad: la <section> con `aria-labelledby` hacia
    // el h2 se expone como región nombrada. Anatomía literal (spec →
    // Anatomía): SectionTitle + Timeline, sin wrappers ni nodos extra; cero
    // espaciado propio entre título y Timeline (spec → "No hacer": alcanza el
    // `margin-bottom` del SectionTitle).
    <section aria-labelledby={titleId} className={rootClassName}>
      {/* RF-2: `as="h2"` fijo (el nivel de la sección de página), `id` para
          el labelledby de la región (RF-3) e `icon` (SectionTitle monta el
          IconBox decorativo, RF-3 de su spec; no se pasa `decorated`: la
          Anatomía de esta spec no lo incluye). */}
      <SectionTitle as="h2" id={titleId} icon={icon}>
        {title}
      </SectionTitle>
      {/* RF-2: passthrough completo al Timeline real; `timelineIdPrefix`
          llega explícito por prop y se reenvía tal cual a `idPrefix`
          (decisión 14: ningún mapa interno acá). */}
      <Timeline
        idPrefix={timelineIdPrefix}
        entries={entries}
        locale={locale}
        presentLabel={presentLabel}
      />
    </section>
  );
}
