// ServiceCard — tarjeta de "What I'm Doing" en el panel About
// (specs/content/ServiceCard/spec.md). T1 hecha: `<article>` nombrada por su h3
// vía `aria-labelledby` con el id derivado por la fórmula fija
// `service-${service.id}-title` (RF-1, RF-3): `Box variant="inner" as="article"`,
// un `Icon name={service.icon} tone="gradient"` decorativo como HIJO DIRECTO del
// article (RF-2, decisión 16: sin wrapper `.icon`; no se usa IconBox: su RF-5
// prohíbe Box inner, constancia en la spec) y un `<div>` con `SectionTitle
// as="h3" id={titleId}` más el `<p>` de la descripción (RF-1: nivel fijo h3, sin
// prop que lo cambie; tamaño y margen del título los aporta SectionTitle, la
// pieza no los duplica — decisión 16). La `className` externa se TRANSMITE al
// Box raíz y la UNIÓN la aplica Box en su único elemento (spec → API, G-B); se
// conecta desde T1 (criterio ResumeSection/Timeline/NavTabs/ControlsBar/
// ThemeToggle T1: ningún "Hecho cuando" posterior la reclama).
// Reparto con T2 (tasks.md): el módulo CSS nace en T2, que declara la base
// columna centrada, el `@media (min-width: 580px)` fila (RF-4/RF-5, inspección)
// y `.glyph { --icon-size: var(--size-service-icon); }` (RF-2). Por eso el Icon
// de T1 va SIN `className={styles.glyph}`: el tamaño queda en el default de Icon
// (`--size-icon`) hasta que T2 conecte la clase (los "Hecho cuando" de T1 no
// reclaman tamaño; elección declarada en el test). El `<div>` de título+descripción
// va sin clase: la Anatomía de la spec no le asigna ninguna y T2 tampoco la
// nombra (estructura pura). Sin `index.ts`: el re-export llega con T2.

import type { Service } from "@data/cv.types.generated";

import { Box } from "../Box";
import { Icon } from "../Icon";
import { SectionTitle } from "../SectionTitle";

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

  return (
    // Anatomía literal (spec → Anatomía): Box inner como <article> nombrada por
    // su h3 (Tests esperados 1/4). Cero espaciado/nodos extra propios: el gap
    // y la dirección los declara el módulo en T2 (RF-4/RF-5).
    <Box variant="inner" as="article" aria-labelledby={titleId} className={className}>
      {/* RF-2 (decisión 16): el Icon es hijo directo del flex, sin <span>
          wrapper; decorativo (sin `label` → aria-hidden). SIN `className` de
          módulo en T1: `.glyph` con `--icon-size` llega en T2 (encabezado). */}
      <Icon name={service.icon} tone="gradient" />
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
