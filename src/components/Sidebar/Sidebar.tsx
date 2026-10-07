// Sidebar — tarjeta de identidad: avatar, nombre, rol, redes, contactos y
// descarga del CV (specs/layout/Sidebar/spec.md). T2: estructura base del
// landmark (RF-1, RF-6 redes, RF-8): raíz `Box variant="outer" as="aside"`
// con `aria-label={labels.region}` (Box aplica la unión de `className` en su
// raíz, G-B — spec → API) y la `baseInfo` de la Anatomía: `figure > img`,
// `div > p + Badge`, `ul` de redes nombrada con un `li` por entrada — link
// externo (`target="_blank"` + `rel="noopener noreferrer"`, D6) con
// `aria-label` de la marca y `BrandIcon` decorativo dentro. RF-9 (mitad
// `social`): `social=[]` → no se monta el `ul` (una lista nombrada vacía no
// renderiza).
//
// Diferidos por tasks.md (API completa desde acá, spec → plan → Interfaz):
// `contact` NO se destructura hasta T3 (contactos: IconBox/Overhead/links
// derivados con getContactHref); el disclosure en `CornerTab` es T4 (usa
// `labels.showContacts`/`hideContacts`); el CTA `Button` con `downloadCvUrl`
// es T5; el `Separator` y el contenedor `.additional` `id="sidebar-contacts"`
// llegan con T3/T4 (RF-9 completo y RF-10). RF-8 (C2): la pieza no importa
// `useCv()` ni `useLocale()` — todos los datos y textos entran por props.
//
// Clases de la Anatomía (`baseInfo`/`avatar`/`identity`/`name`/`social`): las
// conecta T6 junto con `Sidebar.module.css` (tasks.md → T2/T6: en T2 no hay
// estilos ni clases propias observables por tests; jsdom no computa CSS,
// #101). Por eso acá los contenedores se renderizan sin `className`.
//
// Marca de las redes (plan → Decisiones; spec → Accesibilidad): `BRAND_NAMES`
// de BrandIcon es el registro `Record<SocialNetwork, string>` (network →
// nombre visible, su RF-2). BrandIcon renderiza su `<svg>` siempre
// `aria-hidden="true"` y SIN nombre propio (su RF-3: "el nombre accesible lo
// aporta el link contenedor con `aria-label={BRAND_NAMES[network]}` (Sidebar,
// su spec)"), así que el `aria-label` va en el `<a>` y no duplica nada: el
// logo queda decorativo y la tecnología de asistencia lee la marca del link.

import { Badge } from "../Badge";
import { Box } from "../Box";
import { BRAND_NAMES, BrandIcon } from "../BrandIcon";

import type { ContactItem, Profile, SocialLink } from "@data/cv.types.generated";

// API exacta de spec → API. `SidebarLabels`: textos de interfaz ya
// traducidos (C3: los produce LocaleProvider/AppLayout; la pieza no consume
// useLocale — RF-8).
export interface SidebarLabels {
  /** Nombre del landmark `complementary` ("Profile"). */
  region: string;
  /** Nombre de la `ul` de redes ("Social profiles"). */
  social: string;
  /** Texto del botón disclosure colapsado ("Show Contacts") — lo usa T4. */
  showContacts: string;
  /** Texto del botón disclosure expandido ("Hide Contacts") — lo usa T4. */
  hideContacts: string;
  /** Texto del CTA de descarga ("Download CV") — lo usa T5. */
  downloadCv: string;
  /** Label traducido por tipo de contacto (lo usa T3). */
  contact: Record<ContactItem["type"], string>;
}

// Datos SOLO por props (RF-8, C2 sin excepción acá — plan → Interfaz). El
// orden de `contact`/`social` de entrada es el orden de render (CvData).
export interface SidebarProps {
  profile: Profile;
  /** Contactos en el orden de `src/content/cv.*.json` — se renderizan en T3. */
  contact: readonly ContactItem[];
  social: readonly SocialLink[];
  labels: SidebarLabels;
  /** Se une al raíz: se transmite al Box `as="aside"` (Box aplica la unión en su raíz, G-B). */
  className?: string;
}

export function Sidebar({ profile, social, labels, className }: SidebarProps) {
  // `contact` queda fuera de la destructuración hasta T3 (nada lo consume
  // todavía; la interfaz ya es la de la spec — criterio F2 de destructuración
  // parcial con comentario L1).
  return (
    // RF-1 + spec → Accesibilidad: landmark `<aside>` nombrado con
    // `labels.region` (por props, no hardcodeado — C3). `variant="outer"` es
    // el default del Box pero se explicita por la Anatomía (spec → plan).
    <Box variant="outer" as="aside" aria-label={labels.region} className={className}>
      {/* baseInfo (Anatomía): avatar + identidad + redes. Sus clases llegan
          con el módulo en T6. */}
      <div>
        {/* Avatar (Anatomía: `figure.avatar > img`). Decisión 9 (spec →
            Estilos y tokens): SIN atributos HTML `width`/`height` ni
            `decoding` explícito — el tamaño es del token
            `--size-avatar-sidebar` (CSS, T6) y escala por breakpoint. El alt
            llega desde `profile.avatar.alt` (spec → Accesibilidad). */}
        <figure>
          <img src={profile.avatar.src} alt={profile.avatar.alt} />
        </figure>

        {/* Identidad (Anatomía): el nombre es `<p>` con estilo propio — el
            único h1 de la página es el del tabpanel (spec → No hacer: "No
            usar el nombre como h1"). El headline va en el Badge. */}
        <div>
          <p>{profile.name}</p>
          <Badge>{profile.headline}</Badge>
        </div>

        {/* RF-9 (mitad `social`; Tests 8): sin entradas no se monta la lista
            (una `ul` nombrada vacía no renderiza). */}
        {social.length > 0 && (
          // spec → Accesibilidad: la lista de redes lleva el nombre
          // `labels.social` traducido.
          <ul aria-label={labels.social}>
            {social.map((link) => (
              // RF-6 (redes) + D6: links externos SIEMPRE con
              // `target="_blank"` + `rel="noopener noreferrer"`; el `href` es
              // el `url` de la entrada (no se deriva — la derivación
              // getContactHref es de los contactos, T3). `aria-label` =
              // BRAND_NAMES[network] (marca; encabezado: no duplica al svg
              // decorativo). Key: `link.id` (identificador estable del
              // esquema; únicos por entrada).
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={BRAND_NAMES[link.network]}
                >
                  <BrandIcon network={link.network} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Box>
  );
}
