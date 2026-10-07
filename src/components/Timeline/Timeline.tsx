// Timeline — lista cronológica vertical para Education y Experience
// (specs/content/Timeline/spec.md). T1 hecha: estructura (RF-1, RF-2, RF-5):
// un `<ol role="list">` (el `role` explícito protege la semántica ante el
// quirk de `list-style: none` en Safari/VoiceOver) con un `<li><article
// aria-labelledby>` por entrada, en el ORDEN de los datos (spec → "No hacer":
// nunca se ordena acá); el título como `<h3>` de nivel fijo (sin prop;
// DESIGN.md: h2 sección → h3 ítem) con id por la fórmula fija
// `${idPrefix}-${entry.id}-title` (RF-5); `organization` y `description` solo
// si la entrada los tiene (RF-2); `entries=[]` → `null` (RF-1, plan →
// Decisiones). La `className` externa se UNE a la clase base del `<ol>` raíz
// (spec → API, G-B/#99) ya en T1: ningún "Hecho cuando" de T2/T3 la reclama
// (criterio NavTabs/ControlsBar/ThemeToggle/LanguageSwitcher T1); el módulo
// nace acá con la clase base vacía (criterio IconBox/LanguageSwitcher).
// T2 hecha (RF-3, RF-4): el `<p class="period">` con `<time dateTime>` por
// extremo; el texto de cada extremo lo produce `formatPeriodEndpoint`
// (Foundation T12) según `locale` — Timeline no reimplementa formateos ni
// parsea strings compuestas (RF-4, plan → Funciones puras); `end === null`
// termina el período en `presentLabel` como texto (RF-3, no `<time>`).
// Diferido T3 (RF-6/RF-7): los estilos por tokens de la tabla "Estilos y
// tokens" (el módulo ya declara SOLO la fila Período, que nace con el `<p>`
// de esta tarea), las clases internas `.item/.title/.organization/.description`
// y el `index.ts`.

import type { Locale, TimelineEntry } from "@data/cv.types.generated";

import { formatPeriodEndpoint } from "../../i18n/formatPeriod";

import styles from "./Timeline.module.css";

// API (spec → API) completa desde T1. `locale` y `presentLabel` se conectan
// en T2: formateo por extremo del período y texto "Present" (RF-3/RF-4).
export interface TimelineProps {
  entries: readonly TimelineEntry[];
  locale: Locale;
  /** "Present" / "Actualidad". */
  presentLabel: string;
  /** Prefijo para ids únicos de títulos (ej. "edu", "exp"); fórmula: `${idPrefix}-${entry.id}-title`. */
  idPrefix: string;
  /** Se une a la clase base del `<ol>` raíz (G-B). */
  className?: string;
}

export function Timeline({
  entries,
  locale,
  presentLabel,
  idPrefix,
  className,
}: TimelineProps) {
  // RF-1 (SI-clause): sin entradas no se renderiza nada — ni el `<ol>`: una
  // lista vacía no aporta semántica (plan → Decisiones).
  if (entries.length === 0) {
    return null;
  }

  // RF-1 / spec → "No hacer": el orden de render es el de los datos (map sin
  // sort). Unión #99 (G-B) en el único raíz: array + filtro de undefined +
  // join, base primero (mismo mecanismo aprobado en Box/Icon/Badge/IconBox/
  // LanguageSwitcher/NavTabs); así no quedan clases vacías cuando `className`
  // no se pasa. Bajo `noUncheckedIndexedAccess` la clase del módulo es
  // `string | undefined`.
  const rootClassName = [styles.timeline, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return (
    // RF-1: `role="list"` EXPLÍCITO en el <ol> (decisión 13 del plan: el rol
    // implícito se pierde con `list-style: none` en Safari/VoiceOver).
    <ol className={rootClassName} role="list">
      {entries.map((entry) => {
        // RF-5: id del título por la fórmula fija; el `entry.id` del esquema
        // (Id: minúsculas con guiones, estable) entra en la fórmula, así dos
        // Timelines con distinto `idPrefix` no colisionan (Tests 7).
        const titleId = `${idPrefix}-${entry.id}-title`;
        return (
          // key: `entry.id` es identificador estable garantizado por el
          // esquema (required); lista estática, sin reordenamiento propio.
          <li key={entry.id}>
            {/* spec → Accesibilidad: cada ítem es un <article> nombrado por
                su título (aria-labelledby → id del h3). */}
            <article aria-labelledby={titleId}>
              {/* RF-2: nivel fijo <h3> (sin prop que lo cambie; "No hacer":
                  nunca h5). T1 pinta el texto; el estilo de h4
                  (--font-size-h4) y la clase `.title` del módulo llegan en
                  T3 junto con los estilos por tokens. */}
              <h3 id={titleId}>{entry.title}</h3>
              {/* RF-2 "si existen" — adaptación al tipo generado:
                  organization/description son REQUIRED en
                  data/cv.schema.json (string minLength 1), así que la
                  existencia observable es el valor no vacío; con valor vacío
                  no se pinta el párrafo (cero <p> huecos). La clase
                  `.organization` del módulo se conecta en T3. */}
              {entry.organization ? <p>{entry.organization}</p> : null}
              {/* T2 (RF-3/RF-4): período con <time dateTime> por extremo
                  (spec → Anatomía y Accesibilidad). Cada extremo se formatea
                  SOLO con formatPeriodEndpoint (Foundation T12): nada de
                  strings compuestas parseadas ni de reimplementar Intl
                  (RF-4). dateTime conserva el valor CRUDO del dato
                  ("YYYY"/"YYYY-MM"); el separador fijo " — " del contrato de
                  foundations/i18n.md va ENTRE los dos <time> y, con
                  end === null, ANTES del presentLabel — que es TEXTO, no
                  <time> (RF-3). La clase .period nace acá con la fila
                  Período de la tabla "Estilos y tokens" (T2 es el dueño del
                  <p>; el resto del módulo y las otras clases internas, T3). */}
              <p className={styles.period}>
                <time dateTime={entry.start}>
                  {formatPeriodEndpoint(entry.start, locale)}
                </time>
                {" — "}
                {entry.end === null ? (
                  presentLabel
                ) : (
                  <time dateTime={entry.end}>
                    {formatPeriodEndpoint(entry.end, locale)}
                  </time>
                )}
              </p>
              {entry.description ? <p>{entry.description}</p> : null}
            </article>
          </li>
        );
      })}
    </ol>
  );
}
