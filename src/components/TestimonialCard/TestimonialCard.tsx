// TestimonialCard — tarjeta de testimonio del carrusel
// (specs/content/TestimonialCard/spec.md, decisión 17). T1: estructura de
// spec → Anatomía (RF-4, RF-7): raíz `Box variant="inner" as="article"`
// nombrada por su h3 vía `aria-labelledby` con la fórmula fija
// `testimonial-${testimonial.id}-name` (RF-7), header con `HexAvatar` directo
// (columna 1; `alt=""` por default de la primitiva: decorativa, RF-4) +
// identity `<div>` con `<h3>` (author) y `<p>` (role), extracto con
// `testimonial.text` en `<p>` (RF-4; el clamp a 4 líneas es CSS, T3/RF-2) y
// comilla `Icon name="quote" tone="gradient"` decorativa, hija directa del
// article (sin `label` → `aria-hidden`, RF-4).
// T2 difiere: `openLabel` y `onOpen` están en la API (spec → API, declarada
// COMPLETA acá — precedente HexAvatar/Overhead/SectionTitle T1 con el diferido
// marcado) pero NO se destructuran todavía: el botón estirado (único
// enfocable, RF-1) llega en T2 con su `aria-label={openLabel}` y su
// `onClick={() => onOpen(testimonial.id)}`. En T1 no hay botón ni `onClick` en
// ningún nodo (spec → No hacer: el article no es clickeable).
// T3 difiere (elección declarada): las clases internas del módulo
// (`.header`/`.identity`/`.avatar`/`.excerpt`/`.quote`) y del Icon/HexAvatar
// conectan en T3 (tabla "Estilos y tokens"); en T1 los `<div>` del
// Anatomía van SIN className y el Icon/HexAvatar sin `className` propia — el
// módulo nace solo con `.card` para la unión del raíz (G-B). La estructura DOM
// no cambia en T3: solo se le agregan clases.
// Composición del raíz (G-B, criterio ServiceCard): la clase contenedora del
// módulo se UNE con la `className` externa ANTES de llegar al Box (su firma
// acepta una sola string; Box une el resultado a su variante `inner` en el
// único <article>): orden final `inner …card… consumer`; propiedades
// disjuntas entre `.inner` (fondo/radio/padding del Box) y `.card` (ajustes de
// layout, T3), el orden no dirime conflictos (criterio Box.tsx).

import type { Testimonial } from "@data/cv.types.generated";

import { Box } from "../Box";
import { HexAvatar } from "../HexAvatar";
import { Icon } from "../Icon";

import styles from "./TestimonialCard.module.css";

// API (spec → API, COMPLETA desde T1): `testimonial` llega por props (C2: la
// pieza no importa contenido; el carrusel lo canaliza desde useCv());
// `className` se transmite al Box raíz vía la unión de abajo (G-B);
// `openLabel`/`onOpen` los consume el botón estirado de T2 (diferido declarado
// en el encabezado: no se destructuran aún).
export interface TestimonialCardProps {
  testimonial: Testimonial;
  /** "Read full testimonial from {author}", ya interpolado. */
  openLabel: string;
  onOpen: (id: string) => void;
  /** Se une al raíz: se transmite al Box `as="article"` (G-B). */
  className?: string;
}

export function TestimonialCard({
  testimonial,
  className,
}: TestimonialCardProps) {
  // RF-7: única derivación de la pieza — el id del nombre, fórmula fija sobre
  // `testimonial.id` (id garantizado único por el esquema); el
  // `aria-labelledby` del article apunta exactamente ahí (Anatomía literal).
  const nameId = `testimonial-${testimonial.id}-name`;

  // T1 (G-B, criterio ServiceCard/Icon/SkillList): unión canónica base-first
  // (array + filtro de undefined + join, sin librerías; así no quedan clases
  // vacías cuando `className` no se pasa). Bajo `noUncheckedIndexedAccess`
  // la clase del módulo es `string | undefined`.
  const rootClassName = [styles.card, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return (
    // Anatomía literal (spec → Anatomía): Box inner como <article> nombrada
    // por su h3 (RF-7; Tests esperados 1). Sin `margin-top` propio: el
    // headroom del avatar lo reserva el contenedor (RF-3, carrusel).
    <Box
      variant="inner"
      as="article"
      aria-labelledby={nameId}
      className={rootClassName}
    >
      {/* Header (Anatomía): grilla auto | 1fr con el HexAvatar en la columna 1
          y la identity en la 2 (estilos y clase `.header` en T3). El HexAvatar
          va DIRECTO como hijo (RF-4: la primitiva es la dueña única del
          hexágono; `alt` default "" → imagen decorativa; `className` de
          offset en T3). */}
      <div>
        <HexAvatar src={testimonial.avatar.src} />
        {/* Identity (Anatomía; sin clase hasta T3): h3 con el id de la fórmula
            (RF-7) y <p> con el role. */}
        <div>
          <h3 id={nameId}>{testimonial.author}</h3>
          <p>{testimonial.role}</p>
        </div>
      </div>
      {/* Extracto (RF-4): el `text` completo del testimonio; el recorte a 4
          líneas y la clase `.excerpt` son de T3 (RF-2, jsdom no computa). */}
      <p>{testimonial.text}</p>
      {/* RF-4: comilla decorativa — `tone="gradient"` resuelve
          `url(#accent-gradient)` (defs de AppLayout/armazón de test); sin
          `label` → `aria-hidden`, sin nombre accesible. La clase `.quote`
          (tamaño/posición absoluta) conecta en T3. */}
      <Icon name="quote" tone="gradient" />
    </Box>
  );
}
