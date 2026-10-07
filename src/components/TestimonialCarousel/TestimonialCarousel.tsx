// TestimonialCarousel — carrusel de testimonios con scroll-snap nativo,
// bullets por posición alcanzable y un único TestimonialDialog
// (specs/content/TestimonialCarousel/spec.md, decisión 20). T2 hecha: la
// región ÚNICA (RF-1): el carrusel es dueño de la `<section>` raíz con
// `aria-roledescription="carousel"` — AboutPage NO lo envuelve en otra section
// — nombrada por `labelledBy` (si se pasa) o `aria-label={labels.carousel}`
// (una u otra, nunca ambas); un `<li role="group">` por testimonio con
// `aria-roledescription="slide"` y nombre "n of N" vía `format` de i18n con
// `current` 1-based y `total = testimonials.length` (spec → Comportamiento
// "Nombre del slide": NO de stops); `testimonials = []` → no renderiza nada
// (RF-1). Y el dialog ÚNICO cableado (RF-6): estado `selectedId`,
// `onOpen(id)` de la card lo fija, `onClose` del dialog lo limpia a `null` y
// el `testimonial` se DERIVA por `find` (nunca valor→valor sin `null`
// intermedio; spec → Dialog y ciclo de `TestimonialDialog.md`: el padre
// mantiene el dialog montado y alterna null ↔ valor, que es justo lo que su
// effect de apertura por presencia soporta).
// T5 conecta además: estilos por tokens (track/slide/pagination/bullet,
// headroom, print) con las clases del módulo sobre este DOM (la estructura y
// los roles NO cambian: solo se agregan clases, criterio TestimonialCard T3),
// los bullets por stops con `aria-current` (T3, RF-3/RF-5: `getScrollStops`/
// `getActiveStop` de T1 se consumen ahí, con medición de offsets en effect) y
// el `scrollTo` con `behavior` según `prefers-reduced-motion` (T4, RF-4).
// Decisiones 21 documentadas (spec → RF-2/RF-5): SIN flechas prev/next ni de
// teclado (Tab entre los botones de las cards + scroll nativo/swipe), sin
// autoplay, sin loop y sin región `aria-live` (el cambio de slide no se
// anuncia). `labels.goToSlide` no se consume hasta T3.

import { useState } from "react";

import type { Testimonial } from "@data/cv.types.generated";

import { format } from "../../i18n/format";

import { TestimonialCard } from "../TestimonialCard";
import { TestimonialDialog } from "../TestimonialDialog";

import styles from "./TestimonialCarousel.module.css";

// API (spec → API, COMPLETA): textos de interfaz crudos con placeholders que
// la pieza interpola con `format` (C2/C3: llegan de ui.{en,es}.ts por props);
// `labelledBy` es el id del heading visible que nombra la región EN LUGAR de
// `aria-label` (decisión 20); `className` se une a la clase base del `<section>`
// raíz (G-B).
export interface TestimonialCarouselLabels {
  carousel: string; // "Testimonials"
  slide: string; // "{current} of {total}"
  goToSlide: string; // "Go to slide {n}"
  readMore: string; // "Read full testimonial from {author}"
  close: string; // "Close"
}

export interface TestimonialCarouselProps {
  testimonials: readonly Testimonial[];
  labels: TestimonialCarouselLabels;
  labelledBy?: string;
  /** Se une a la clase base de la `<section>` raíz (G-B). */
  className?: string;
}

export function TestimonialCarousel({
  testimonials,
  labels,
  labelledBy,
  className,
}: TestimonialCarouselProps) {
  // RF-6 (plan → Decisiones): estado por id, nunca el objeto — el `testimonial`
  // del dialog se deriva con `find` sobre `testimonials` (fuente única de la
  // versión vigente). hooks antes del return condicional (reglas de hooks).
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // RF-1 (SI vacío): sin testimonios no hay región, ni track ni dialog.
  if (testimonials.length === 0) {
    return null;
  }

  // Unión G-B del raíz (criterio IconBox/SkillList/TestimonialCard): array +
  // filtro de undefined + join, base primero, sin librerías; así no quedan
  // clases vacías cuando `className` no se pasa. Las clases del módulo son
  // `string | undefined` bajo noUncheckedIndexedAccess.
  const rootClassName = [styles.carousel, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  // Derivación del seleccionado (RF-6): `null` (o un id inexistente) → dialog
  // cerrado = nodo ausente del DOM (decisión 18=b de la primitiva).
  const selected =
    testimonials.find((testimonial) => testimonial.id === selectedId) ?? null;

  return (
    // RF-1 / decisión 20: ESTA <section> es la única región del carrusel. El
    // nombre accesible es uno u otro (nunca ambos): `labelledBy` referencia el
    // id del heading visible (Anatomía nota: AboutPage renderiza SectionTitle
    // y carrusel hermanos sin envolver); sin él, `aria-label` con
    // `labels.carousel`. `aria-roledescription="carousel"` solo describe el
    // rol region (patrón WAI-ARIA carousel; spec → Accesibilidad).
    <section
      className={rootClassName}
      aria-roledescription="carousel"
      {...(labelledBy
        ? { "aria-labelledby": labelledBy }
        : { "aria-label": labels.carousel })}
    >
      {/* Track (Anatomía): <ul> con overflow-x + scroll-snap y cada slide
          <li> `scroll-snap-align: start`; las clases `.track`/`.slide` y los
          estilos de columnas/headroom/scrollbar oculta conectan en T5 (RF-2,
          RF-7) — acá el DOM ya tiene la estructura definitiva. Sin flechas
          prev/next ni navegación por teclado (decisión 21; RF-2 → No hacer). */}
      <ul>
        {testimonials.map((testimonial, index) => (
          // Cada slide: role="group" + aria-roledescription="slide" + nombre
          // "n of N" (spec → Comportamiento: `current` = índice 1-based,
          // `total = testimonials.length`, no de stops). La card canaliza el
          // contenido (C2: llega por props desde el padre de la pieza) y su
          // botón estirado emite `onOpen(testimonial.id)` → setSelectedId
          // (RF-6; `openLabel` = `readMore` interpolado con el author de ESTA
          // card, spec → API).
          <li
            key={testimonial.id}
            role="group"
            aria-roledescription="slide"
            aria-label={format(labels.slide, {
              current: index + 1,
              total: testimonials.length,
            })}
          >
            <TestimonialCard
              testimonial={testimonial}
              openLabel={format(labels.readMore, {
                author: testimonial.author,
              })}
              onOpen={setSelectedId}
            />
          </li>
        ))}
      </ul>
      {/* RF-6: UNICO TestimonialDialog de la pieza, montado de forma
          permanente con `testimonial` derivado (null = cerrado; su effect de
          apertura por presencia cubre el ciclo null↔valor del carrusel —
          nunca valor→valor: onClose limpia a null antes de otro onOpen).
          `closeLabel` llega crudo de labels (la primitiva no interpola).
          Sin paginación todavía: los bullets por stops entran en T3 (RF-3/
          RF-5) entre el track y el dialog (Anatomía). */}
      <TestimonialDialog
        testimonial={selected}
        onClose={() => setSelectedId(null)}
        closeLabel={labels.close}
      />
    </section>
  );
}
