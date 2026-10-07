// ServiceCard — tarjeta de "What I'm Doing" en el panel About
// (specs/content/ServiceCard/spec.md). T1 hecha: `<article>` nombrada por su h3
// vía `aria-labelledby` con el id derivado por la fórmula fija
// `service-${service.id}-title` (RF-1, RF-3): `Box variant="inner" as="article"`,
// un `Icon name={service.icon} tone="gradient"` decorativo como HIJO DIRECTO del
// article (RF-2, decisión 16: sin wrapper `.icon`; no se usa IconBox: su RF-5
// prohíbe Box inner, constancia en la spec) y un `<div>` con `SectionTitle
// as="h3" id={titleId}` más el `<p>` de la descripción (RF-1: nivel fijo h3, sin
// prop que lo cambie; tamaño y margen del título los aporta SectionTitle, la
// pieza no los duplica — decisión 16).
// T2 hecha: `ServiceCard.module.css` declara la tabla "Estilos y tokens" —
// base columna centrada con gap --space-4 y `height: 100%`, el ÚNICO
// `@media (min-width: 580px)` a fila `flex-start`/`start` (solo layout, sin
// medidas; RF-4/RF-5, inspección), `.glyph { --icon-size:
// var(--size-service-icon); }` y `margin: 0` de la descripción vía `.card p`
// (la Anatomía no nombra el <p>; cero pseudo-estados/transiciones/box-shadow
// RF-6, cero `@media print` RF-5/G-D); el Icon conecta su clase de tamaño
// (`className={styles.glyph}`: la variable no hereda, Icon RF-6 — el test de
// T2 fija la coexistencia DOM de `.glyph` con la base `.icon`); y `index.ts`
// re-exporta la superficie pública (ServiceCard y ServiceCardProps).
// Composición del raíz (G-B, criterio IconBox/CornerTab aplicado donde
// aplica): Box recibe UNA `className` string, así que ServiceCard UNE primero
// su clase contenedora con la externa (`[styles.card, className]`, unión
// base-first canónica de Box/Icon/SkillList) y se la transmite al Box, que la
// une a su variante en el único <article>: orden final
// `inner …card… consumer`; las propiedades son disjuntas entre `.inner`
// (fondo/radio/padding) y `.card` (layout/altura), así que el orden no
// dirime ningún conflicto (criterio Box.tsx). El `<div>` de título+descripción
// sigue sin clase propia (Anatomía); el margen del <p> se goberna desde el
// módulo con el descendiente `.card p`.

import type { Service } from "@data/cv.types.generated";

import { Box } from "../Box";
import { Icon } from "../Icon";
import { SectionTitle } from "../SectionTitle";

import styles from "./ServiceCard.module.css";

// API (spec → API): `service` completo llega por props (C2: la pieza no importa
// contenido; AboutPage lo canaliza desde useCv()); `className` se transmite al
// Box `as="article"` (Box aplica la unión en su raíz, G-B).
export interface ServiceCardProps {
  service: Service;
  /** Se une al raíz: se transmite al Box `as="article"` (Box aplica la unión en su raíz, G-B). */
  className?: string;
}

// `service.icon: ServiceIcon` es subtipo de `IconName` (`UiIconName |
// ServiceIcon`, Icon.tsx): el Icon real acepta la prop sin conversión; el mapa
// ICON_MAP de Icon tiene una entrada por cada ServiceIcon (RF-5 de Icon).
export function ServiceCard({ service, className }: ServiceCardProps) {
  // RF-3: única derivación de la pieza — el id del título, fórmula fija sobre
  // `service.id` (id garantizado único por el esquema); el `aria-labelledby`
  // del article apunta exactamente ahí (Anatomía literal de la spec).
  const titleId = `service-${service.id}-title`;

  // T2 (G-B/#99, spec → API): la clase contenedora del módulo se UNE con la
  // `className` externa ANTES de llegar al Box (su firma acepta una sola
  // string; Box unirá el resultado a su variante `inner`). Mecanismo canónico
  // aprobado en Box/Icon/SkillList: array + filtro de undefined + join, base
  // primero; así no quedan clases vacías cuando `className` no se pasa. Bajo
  // `noUncheckedIndexedAccess` la clase del módulo es `string | undefined`.
  const rootClassName = [styles.card, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return (
    // Anatomía literal (spec → Anatomía): Box inner como <article> nombrada por
    // su h3 (Tests esperados 1/4). Cero nodos extra propios: gap, dirección y
    // altura los declara `.card` del módulo (RF-4/RF-5).
    <Box
      variant="inner"
      as="article"
      aria-labelledby={titleId}
      className={rootClassName}
    >
      {/* RF-2 (decisión 16): el Icon es hijo directo del flex, sin <span>
          wrapper; decorativo (sin `label` → aria-hidden). T2 le conecta
          `.glyph`: ahí se fija `--icon-size` (la variable no hereda, Icon
          RF-6; spec → No hacer: ni prop `size` ni variable en el
          contenedor). Icon une esta clase a su base `.icon` sin reemplazarla
          (asertado en el test de T2). */}
      <Icon name={service.icon} tone="gradient" className={styles.glyph} />
      {/* Título + descripción comparten el <div> (Anatomía; sin clase: ninguna
          tarea la nombra). RF-1: SectionTitle as="h3" fijo con el id derivado
          (RF-3); sin `decorated` ni `icon`: la Anatomía no los incluye. */}
      <div>
        <SectionTitle as="h3" id={titleId}>
          {service.title}
        </SectionTitle>
        <p>{service.description}</p>
      </div>
    </Box>
  );
}
