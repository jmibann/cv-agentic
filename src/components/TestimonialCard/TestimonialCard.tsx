// TestimonialCard — tarjeta de testimonio del carrusel
// (specs/content/TestimonialCard/spec.md, decisión 17). T1: estructura de
// spec → Anatomía (RF-4, RF-7): raíz `Box variant="inner" as="article"`
// nombrada por su h3 vía `aria-labelledby` con la fórmula fija
// `testimonial-${testimonial.id}-name` (RF-7), header con `HexAvatar` directo
// (columna 1; `alt=""` por default de la primitiva: decorativa, RF-4) +
// identity `<div>` con `<h3>` (author) y `<p>` (role), extracto con
// `testimonial.text` en `<p>` (RF-4) y comilla `Icon name="quote"
// tone="gradient"` decorativa, hija directa del article (sin `label` →
// `aria-hidden`, RF-4).
// T2 (RF-1): el botón estirado — `<button type="button" aria-label={openLabel}>`
// como ÚLTIMO hijo del article (orden Anatomía), sin hijos textuales, con
// `onClick={() => onOpen(testimonial.id)}` y SIN handlers de teclado propios
// (Enter y Espacio: activación NATIVA del <button>, plan → Decisiones "Enter/
// Espacio nativos"; criterio NavTabs T2 de no duplicar el guard). El <article>
// sigue sin `onClick` ni `tabIndex` (spec → No hacer / RF-1: la operabilidad
// es solo del botón, único enfocable de la tarjeta).
// T3 (RF-2, RF-5, RF-6): se CONECTAN las clases del módulo según Anatomía —
// `.header`/`.identity`/`.avatar` (via la prop `className` de HexAvatar, unida
// a su `wrap`: la API de la primitiva)/`.name`/`.role`/`.excerpt`/`.quote`
// (via la prop `className` de Icon, RF-6 suya: `--icon-size` en la clase del
// propio glifo)/`.stretched` en el botón — y `.card` se completa en el módulo
// (clamp 4 líneas, grid, offset del avatar, comilla absolute, `::after` de
// cobrimiento, hover con --shadow-control, anillo focus-visible en el `::after`
// y @media print propio; todo por tokens, cero @media de breakpoint). La
// estructura DOM y el comportamiento NO cambian en T3: solo se agregan clases
// sobre los nodos ya presentes (cardinalidad de hijos del article intacta).
// Composición del raíz (G-B, criterio ServiceCard): la clase contenedora del
// módulo se UNE con la `className` externa ANTES de llegar al Box (su firma
// acepta una sola string; Box une el resultado a su variante `inner` en el
// único <article>): orden final `inner …card… consumer`. A diferencia de
// ServiceCard, acá `.inner` y `.card` NO tienen propiedades disjuntas: la
// tabla de la spec fija en `.card` radio y padding propios (`--radius-16`,
// `--testimonial-padding`) sobre los defaults del Box; el empate de
// especificidad lo dirime el orden de la hoja (este archivo importa Box —y su
// módulo CSS— antes del propio: `.card` se emite después y gana; criterio
// Box.tsx: "rige la hoja de estilos", spec → API).

import type { Testimonial } from "@data/cv.types.generated";

import { Box } from "../Box";
import { HexAvatar } from "../HexAvatar";
import { Icon } from "../Icon";

import styles from "./TestimonialCard.module.css";

// API (spec → API, COMPLETA desde T1): `testimonial` llega por props (C2: la
// pieza no importa contenido; el carrusel lo canaliza desde useCv());
// `className` se transmite al Box raíz vía la unión de abajo (G-B);
// `openLabel` nombra al botón estirado (`aria-label`) y `onOpen` es su evento
// (RF-1, conectados en T2: el botón es el único consumidor de ambos).
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
  openLabel,
  onOpen,
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
    // por su h3 (RF-7; Tests esperados 1). Sin `margin-top` propio en `.card`:
    // el headroom del avatar lo reserva el contenedor (RF-3, carrusel).
    <Box
      variant="inner"
      as="article"
      aria-labelledby={nameId}
      className={rootClassName}
    >
      {/* Header (Anatomía; `.header` T3): grilla auto | 1fr con el HexAvatar en
          la columna 1 y la identity en la 2; sin márgenes negativos de layout
          (tabla → Encabezado). El HexAvatar va DIRECTO como hijo (RF-4: la
          primitiva es la dueña única del hexágono; `alt` default "" → imagen
          decorativa) y recibe `.avatar` vía su prop `className`, unida al
          `wrap` raíz de la primitiva (spec → API de HexAvatar): la subida por
          `--testimonial-avatar-offset` (T3). */}
      <div className={styles.header}>
        <HexAvatar src={testimonial.avatar.src} className={styles.avatar} />
        {/* Identity (Anatomía; `.identity` T3, sin propiedades en la tabla):
            h3 con el id de la fórmula (RF-7) y `.name` (`--font-size-h3`,
            `margin: 0`) + <p> con el role y `.role` (muted, `margin: 0`). */}
        <div className={styles.identity}>
          <h3 id={nameId} className={styles.name}>
            {testimonial.author}
          </h3>
          <p className={styles.role}>{testimonial.role}</p>
        </div>
      </div>
      {/* Extracto (RF-4): el `text` completo del testimonio con `.excerpt`
          (T3/RF-2): recorte a 4 líneas en pantalla por clamp -webkit- (jsdom
          no computa: inspección + QA F5) y texto completo en el @media print
          propio del módulo. */}
      <p className={styles.excerpt}>{testimonial.text}</p>
      {/* RF-4: comilla decorativa — `tone="gradient"` resuelve
          `url(#accent-gradient)` (defs de AppLayout/armazón de test); sin
          `label` → `aria-hidden`, sin nombre accesible. `.quote` (T3) fija
          `--icon-size: 2rem` en la clase del propio glifo (Icon RF-6,
          variable sin herencia; criterio ServiceCard `.glyph`) y la posición
          absolute arriba-derecha con los insets `--testimonial-quote-inset-*`. */}
      <Icon name="quote" tone="gradient" className={styles.quote} />
      {/* T2 · RF-1: botón estirado (Anatomía: ÚLTIMO hijo del article, sin
          hijos textuales). `aria-label={openLabel}` lo nombra (único nombre
          accesible del botón; la string ya llega interpolada, spec → API) y
          `onClick` emite `onOpen(testimonial.id)` — un solo disparo: Enter y
          Espacio activan este mismo click por vía NATIVA del <button> (sin
          handlers de teclado: plan → Decisiones). `.stretched` conecta en T3
          (tabla → Botón estirado): reset `position: static; background: none;
          border: 0` + `cursor: pointer` y el `::after { inset: 0 }` que cubre
          la card (anclada por el `position: relative` de `.card`), con el
          anillo focus-visible estándar en ese `::after` (RF-5). La
          operabilidad y el nombre ya eran completos desde T2; el article no
          lleva `onClick` ni `tabIndex` (No hacer / RF-1). */}
      <button
        type="button"
        aria-label={openLabel}
        className={styles.stretched}
        onClick={() => onOpen(testimonial.id)}
      />
    </Box>
  );
}
