// TestimonialCarousel — carrusel de testimonios con scroll-snap nativo,
// bullets por posición alcanzable y un único TestimonialDialog
// (specs/content/TestimonialCarousel/spec.md, decisión 20). T2: la región
// ÚNICA (RF-1): el carrusel es dueño de la `<section>` raíz con
// `aria-roledescription="carousel"` — AboutPage NO lo envuelve en otra section
// — nombrada por `labelledBy` (si se pasa) o `aria-label={labels.carousel}`
// (una u otra, nunca ambas); un `<li role="group">` por testimonio con
// `aria-roledescription="slide"` y nombre "n of N" vía `format` de i18n con
// `current` 1-based y `total = testimonials.length` (spec → Comportamiento
// "Nombre del slide": NO de stops); `testimonials = []` → no renderiza nada
// (RF-1). Y el dialog ÚNICO cableado (RF-6): estado `selectedId`,
// `onOpen(id)` de la card lo fija, `onClose` del dialog lo limpia a `null` y
// el `testimonial` se DERIVA por `find` (nunca valor→valor sin `null`
// intermedio; spec → Dialog y ciclo en `TestimonialDialog.md`: el padre
// mantiene el dialog montado y alterna null ↔ valor, que es justo lo que su
// effect de apertura por presencia soporta).
// T3 (RF-3/RF-5): bullets por stops con `aria-current`. Los stops se miden
// post-render (`measure`, effect de mount): `offsetLeft` de cada `<li>` hijo
// directo del track y `maxScroll = scrollWidth − clientWidth`, pasada a
// `getScrollStops`/`getActiveStop` (T1). El layout medido vive en UN solo
// state `{ slideOffsets, stops }`: la regla stop→n del nombre del bullet
// necesita los offsets del MISMO render que sus stops (dos states alternarían
// un commit con medición vieja mezclada con nueva). Con ≤1 stop la paginación
// NO se renderiza (RF-3). Bullet activo inicial, una vez medidos los stops
// (mount, scrollLeft 0): `getActiveStop` → el primero (decisión 21). El
// `scroll` del track recalcula el activo con UN cálculo por frame (RF-5):
// flag pending + `requestAnimationFrame`; en el callback el `scrollLeft` se
// lee del NODO (el valor del frame, no el del último render) y los stops
// vigentes de `layoutRef` (un re-measure entre el scroll y el frame no puede
// usar un closure viejo). El cleanup cancela el frame pendiente. El
// ResizeObserver del recálculo por resize (RF-3, sin test unitario: decisión
// 21 → QA F5) se conecta en T5 junto con los estilos; la dep `testimonials`
// del effect de medición ya re-mide si el set de slides cambia sin desmontar
// (p. ej. al cambiar de idioma).
// T4 conecta el `scrollTo` con `behavior` según `prefers-reduced-motion` en
// el click del bullet (RF-4; los bullets aún no tienen onClick). T5 conecta
// además: estilos por tokens (track/slide/pagination/bullet, headroom,
// print) sobre ESTE DOM con clases (la estructura y los roles NO cambian:
// criterio TestimonialCard T3), el cierre `expectNoA11yViolations` y
// `index.ts`.
// Decisiones 21 documentadas (spec → RF-2/RF-5): SIN flechas prev/next ni de
// teclado (Tab entre los botones de las cards + scroll nativo/swipe), sin
// autoplay, sin loop y sin región `aria-live` (el cambio de slide no se
// anuncia).

import { useCallback, useEffect, useRef, useState } from "react";

import type { Testimonial } from "@data/cv.types.generated";

import { format } from "../../i18n/format";

import { TestimonialCard } from "../TestimonialCard";
import { TestimonialDialog } from "../TestimonialDialog";

import { getActiveStop, getScrollStops } from "./getScrollStops";

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

// Tolerancia de la regla stop→n (decisión 21): "primer testimonio cuyo
// `offsetLeft ≥ stop − 1px`". Es el MISMO 1px que el dedup de
// `getScrollStops` (T1): son dos lecturas de la misma realidad medida, no dos
// umbrales independientes.
const STOP_MATCH_TOLERANCE_PX = 1;

/**
 * Nombre del bullet (spec → Comportamiento, "Nombre del bullet"): n = número
 * (1-based) del PRIMER testimonio cuyo `offsetLeft ≥ stop − 1px`. Cada stop
 * es `Math.min(offset, maxScroll)` de algún offset medido (invariante de
 * `getScrollStops`) y ese offset siempre cumple la condición: `findIndex`
 * nunca devuelve −1 y n ≥ 1 por construcción. En stops recortados a
 * `maxScroll` la regla mapea al primer slide que aún no pasó el borde
 * izquierdo (ej. offsets [0,300,600], stops [0,300] → 1 y 2).
 */
function bulletNumber(stop: number, slideOffsets: readonly number[]): number {
  return (
    slideOffsets.findIndex(
      (offset) => offset >= stop - STOP_MATCH_TOLERANCE_PX,
    ) + 1
  );
}

/**
 * Layout medido post-render (T3). `slideOffsets` y `stops` viven JUNTOS en un
 * solo state porque el nombre de cada bullet (regla stop→n) se calcula con
 * los offsets del MISMO render que sus stops (plan → Decisiones: la medición
 * no es pura por el DOM; se hace y documenta acá).
 */
interface CarouselLayout {
  slideOffsets: readonly number[];
  stops: readonly number[];
}

// Sin medición aún (primer commit): no hay stops → no hay paginación (RF-3).
const EMPTY_LAYOUT: CarouselLayout = { slideOffsets: [], stops: [] };

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

  // RF-3/RF-5 (T3): layout medido y stop activo.
  const [layout, setLayout] = useState<CarouselLayout>(EMPTY_LAYOUT);
  const [activeStop, setActiveStop] = useState(0);

  const trackRef = useRef<HTMLUListElement>(null);
  // Ref sincronizado con el state de layout: el callback rAF lee los stops
  // VIGENTES en el frame; si una re-medición cae entre el scroll y el frame,
  // el closure del render que agendó quedaría obsoleto.
  const layoutRef = useRef<CarouselLayout>(EMPTY_LAYOUT);
  // Gate "un cálculo por frame" (RF-5): flag + id del frame pendiente.
  const framePendingRef = useRef(false);
  const frameIdRef = useRef<number | null>(null);

  // RF-3: medir offsets y calcular stops. Sin `window` global: todo desde
  // `trackRef` (los tests fijan el layout mockeando los accessores de
  // prototipo/instancia, spec → Tests esperados).
  const measure = useCallback((): void => {
    const track = trackRef.current;
    if (track === null) {
      return;
    }
    // `slideOffsets` = `offsetLeft` de cada slide relativo al track (spec →
    // Comportamiento): los hijos directos `<li>` (Anatomía; dentro de la
    // card no hay `<li>` anidados).
    const slideOffsets = Array.from(
      track.querySelectorAll<HTMLElement>(":scope > li"),
    ).map((slide) => slide.offsetLeft);
    // `maxScroll` = scrollWidth − clientWidth del track (spec → Comportamiento).
    const maxScroll = track.scrollWidth - track.clientWidth;
    const stops = getScrollStops(slideOffsets, maxScroll);
    const measured: CarouselLayout = { slideOffsets, stops };
    layoutRef.current = measured;
    setLayout(measured);
    // Decisión 21: bullet activo inicial = `getActiveStop` con el scrollLeft
    // vigente al medir (0 al montar) → el primero.
    setActiveStop(getActiveStop(stops, track.scrollLeft));
  }, []);

  // RF-3: recalcular los stops al montar. La dep `testimonials` re-mide si
  // cambia el set de slides sin desmontar la región (otro idioma): sin ella
  // los offsets quedarían obsoletos. El ResizeObserver del recálculo por
  // resize (RF-3, sin test unitario → QA F5, decisión 21) se conecta en T5.
  // El cleanup cancela el frame de scroll pendiente (RF-5).
  useEffect(() => {
    if (testimonials.length === 0) {
      return;
    }
    measure();
    return () => {
      const frameId = frameIdRef.current;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameIdRef.current = null;
        framePendingRef.current = false;
      }
    };
  }, [testimonials, measure]);

  // RF-5: el `scroll` del track recalcula el bullet activo con UN cálculo por
  // frame: si ya hay un frame pendiente, el evento se ignora (los valores
  // intermedios no se procesan; el callback lee el `scrollLeft` real del
  // NODO en el frame, no el del último render).
  const handleScroll = (): void => {
    if (framePendingRef.current) {
      return;
    }
    framePendingRef.current = true;
    const frameId = requestAnimationFrame(() => {
      framePendingRef.current = false;
      frameIdRef.current = null;
      const track = trackRef.current;
      if (track === null) {
        return;
      }
      setActiveStop(getActiveStop(layoutRef.current.stops, track.scrollLeft));
    });
    // Con callback síncrono (mocks de test) el flag ya volvió a false: no
    // queda ningún frame pendiente que cancelar (el id devuelto ya se ejecutó).
    frameIdRef.current = framePendingRef.current ? frameId : null;
  };

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

  // RF-3: con 1 stop o menos no se renderizan bullets (1 testimonio, y 2
  // testimonios con 2 por vista — spec → Comportamiento).
  const showBullets = layout.stops.length > 1;

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
          RF-7) — acá el DOM ya tiene la estructura definitiva. `onScroll` =
          RF-5 con un cálculo por frame. Sin flechas prev/next ni navegación
          por teclado (decisión 21; RF-2 → No hacer). */}
      <ul ref={trackRef} onScroll={handleScroll}>
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
      {showBullets && (
        // RF-3/RF-5 (Anatomía): div de paginación con un <button type="button">
        // por stop, en orden ascendente. Nombre: `goToSlide` interpolado con
        // la regla stop→n (`bulletNumber`, decisión 21); `aria-current="true"`
        // SOLO en el activo según `getActiveStop` (los demás, SIN atributo:
        // `undefined`, no "false"). Las clases `.pagination`/`.bullet` y el
        // área táctil `::after` conectan en T5 (criterio T2: DOM con roles y
        // nombres, sin clases). El click con `scrollTo`/`behavior` es T4
        // (RF-4): los bullets aún no tienen onClick.
        <div>
          {layout.stops.map((stop, index) => (
            <button
              // stops sin duplicados (tolerancia 1px garantizada por
              // `getScrollStops`, T1): el número del stop es clave única.
              key={stop}
              type="button"
              aria-label={format(labels.goToSlide, {
                n: bulletNumber(stop, layout.slideOffsets),
              })}
              aria-current={index === activeStop ? "true" : undefined}
            />
          ))}
        </div>
      )}
      {/* RF-6: UNICO TestimonialDialog de la pieza, montado de forma
          permanente con `testimonial` derivado (null = cerrado; su effect de
          apertura por presencia cubre el ciclo null↔valor del carrusel —
          nunca valor→valor: onClose limpia a null antes de otro onOpen).
          `closeLabel` llega crudo de labels (la primitiva no interpola). */}
      <TestimonialDialog
        testimonial={selected}
        onClose={() => setSelectedId(null)}
        closeLabel={labels.close}
      />
    </section>
  );
}
