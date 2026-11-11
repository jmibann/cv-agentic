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
// T3 hecha: bloque de contactos (Anatomía `.additional`): contenedor
// `id="sidebar-contacts"` montado siempre (RF-10: id alcanzable para el
// disclosure; la lógica de colapso es T4), `Separator` condicional (RF-9: sin
// contactos **y** sin `downloadCvUrl` no se renderiza; la condición evalúa
// `profile.downloadCvUrl` según la spec — el CTA de T5 es hoy real)
// y una fila `<li>` por contacto: `IconBox` del mapa tipo→ícono (spec → API;
// decorativo por su RF-2), `Overhead` con el label traducido y el valor en
// `<a>` (si `getContactHref` produce href — RF-5) o `<p>` (location, phone/
// whatsapp sin dígitos: "se muestra como texto"), siempre con `title` = valor
// completo (tabla Contactos). RF-6/decisión 10/D6: `target`/`rel` SOLO en
// links externos (criterio abajo, en `external`).
//
// T4 hecha (luego rediseñada por T7): disclosure (RF-3/RF-4) — nació como
// `CornerTab size="sm"` con botón de texto; T7 lo reemplazó (ver abajo).
// Permanecen de T4: el botón como PRIMER hijo del landmark, `aria-expanded`
// (estado local `expanded`, default `false` en todo < xl — decisión 11),
// `aria-controls` al `id` de `.additional` y el nombre alterno
// `showContacts`/`hideContacts` (RF-4, por props — RF-8). El colapso es por
// CLASE del módulo (`styles.additionalCollapsed` aplicada SOLO cuando
// `!expanded`, nunca `style` inline — RF-10: la expansión forzada de impresión
// y el `@media` ≥ xl de T6 deben poder sobrescribirla). El chevron es `Icon
// name="chevron-down"` sin `label` → decorativo (aria-hidden, Icon RF-3) con
// las clases `.chevron`/`.chevronRotated` del módulo unidas en su `<svg>`
// (Icon RF-6); la rotación (`transform` + `--duration-base`) es CSS: en jsdom
// solo se observa la clase.
//
// T5 hecha: CTA de descarga (RF-2; Anatomía) — `Button href={downloadCvUrl}
// download icon="download" fullWidth` con el label `labels.downloadCv`,
// renderizado SOLO si `profile.downloadCvUrl` existe, al final de
// `.additional` después de la lista de contactos. Sin clases nuevas (el margen
// `--sidebar-cta-gap` es T6; `fullWidth` del Button ya da el ancho) y sin
// `target`/`rel`: es una descarga mismo-origen, no un externo de RF-6 (Button
// omite esos atributos si no se pasan).
//
// T6 hecha: el módulo se completó (specs/layout/Sidebar/tasks.md → T6;
// RF-7/RF-10 y cierre RF-3 por CSS): grilla `auto 1fr` con avatar/identidad/
// redes por tokens, `--sidebar-*`, hover/foco de redes y contactos, botón
// Show/Hide sin fondo en `--color-accent-text`, avatar sobresaliente en xl
// (`calc(var(--size-avatar-sidebar) * -0.71)`, fórmula compartida con
// `foundations/layout.md`) y el ÚNICO `@media (min-width: 1200px)` de
// comportamiento xl (decisión 8=a): oculta el botón de disclosure (en T7 la
// clase `.disclosure` propia del módulo; antes la CornerTab `.disclosureTab`) y
// fuerza visible `.additional` pisando `.additionalCollapsed` por
// especificidad (selector compuesto, sin `!important` ni orden de hoja);
// cero `@media print` propio (RF-10). Las clases de la Anatomía
// (`baseInfo`/`avatar`/`identity`/`name`/`social`/`additional`/`contacts`) se
// conectaron acá; el CTA recibe `.cta` (`margin-top: var(--sidebar-cta-gap)`,
// tabla "Download CV") unida a su raíz por la prop `className` del Button.
// jsdom no computa CSS (#101): los estilos se verifican por inspección + QA
// F5; las clases unidas a hijos (Button) y el colapso por clase sí
// son observables (tests T4/T5 siguen verdes).
//
// T7 hecha (Cambio F5 2026-10-08, decisión del usuario #104b ante D1/B-3 de
// `docs/qa-report.md`; RF-3/RF-4/RF-10): rediseño del disclosure a botón
// icon-only SIN CornerTab (la tab con fondo `surface-raised` solapaba el
// nombre a 375px). Cambios en este archivo: eliminado el import/uso de
// `CornerTab`; el `<button>` queda directo como primer hijo del `<aside>`, con
// `data-print-hide` en su raíz (hook del contrato de impresión #103/#104a —
// RF-10) y `aria-label` alterno `showContacts`/`hideContacts` (RF-4: el nombre
// accesible reemplaza al texto visible; el único contenido es el chevron
// decorativo). La posición y el estilo viven en `.disclosure` del módulo
// (absoluto arriba-derecha; el anclaje lo da Box `.outer`, que ya es
// `position: relative` — verificado en Box.module.css, sin clase extra en el
// raíz). El token `--size-avatar-sidebar` base (−15% por el Cambio) LO APLICA
// EL USUARIO en `tokens.css`: este archivo no lo toca ni lo hardcodea (el
// layout no depende del valor). `index.ts` sin cambios.
//
// RF-8 (C2): la pieza no importa `useCv()` ni `useLocale()` — todos los datos
// y textos entran por props.
//
// Marca de las redes (plan → Decisiones; spec → Accesibilidad): `BRAND_NAMES`
// de BrandIcon es el registro `Record<SocialNetwork, string>` (network →
// nombre visible, su RF-2). BrandIcon renderiza su `<svg>` siempre
// `aria-hidden="true"` y SIN nombre propio (su RF-3: "el nombre accesible lo
// aporta el link contenedor con `aria-label={BRAND_NAMES[network]}` (Sidebar,
// su spec)"), así que el `aria-label` va en el `<a>` y no duplica nada: el
// logo queda decorativo y la tecnología de asistencia lee la marca del link.

import { useState } from "react";

import { Badge } from "../Badge";
import { Box } from "../Box";
import { BRAND_NAMES, BrandIcon } from "../BrandIcon";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { IconBox } from "../IconBox";
import { Overhead } from "../Overhead";
import { Separator } from "../Separator";

import type { IconName } from "../Icon";

import type { ContactItem, Profile, SocialLink } from "@data/cv.types.generated";

import styles from "./Sidebar.module.css";

import { getContactHref } from "./getContactHref";
import { assetUrl } from "../../utils/assetUrl";

// API exacta de spec → API. `SidebarLabels`: textos de interfaz ya
// traducidos (C3: los produce LocaleProvider/AppLayout; la pieza no consume
// useLocale — RF-8).
export interface SidebarLabels {
  /** Nombre del landmark `complementary` ("Profile"). */
  region: string;
  /** Nombre de la `ul` de redes ("Social profiles"). */
  social: string;
  /** Nombre accesible (`aria-label`) del botón disclosure colapsado ("Show Contacts") — lo usa T4; desde T7 es icon-only y el label ES el nombre (RF-4). */
  showContacts: string;
  /** Nombre accesible (`aria-label`) del botón disclosure expandido ("Hide Contacts") — ídem T7. */
  hideContacts: string;
  /** Texto del CTA de descarga ("Download CV") — lo usa el `Button` de T5. */
  downloadCv: string;
  /** Alt del avatar ("Portrait of Alex Rivera"): derivado de `profile.name` por AppLayout con la plantilla i18n (la pieza no compone textos — RF-8). */
  avatarAlt: string;
  /** Label traducido por tipo de contacto (lo usa T3). */
  contact: Record<ContactItem["type"], string>;
}

// Datos SOLO por props (RF-8, C2 sin excepción acá — plan → Interfaz). El
// orden de `contact`/`social` de entrada es el orden de render (CvData).
export interface SidebarProps {
  profile: Profile;
  /** Contactos en el orden de `src/content/cv.*.json` (render T3). */
  contact: readonly ContactItem[];
  social: readonly SocialLink[];
  labels: SidebarLabels;
  /** Se une al raíz: se transmite al Box `as="aside"` (Box aplica la unión en su raíz, G-B). */
  className?: string;
}

// Mapa tipo→ícono del `IconBox` de cada contacto (spec → API, plan → Funciones
// puras y algoritmo): constante local sin exportar (la API pública es Sidebar
// + tipos + `getContactHref`). El tipo `Record<ContactItem["type"], IconName>`
// es exhaustivo: si `data/cv.schema.json` agrega un `ContactType` sin entrada
// acá, `tsc` falla (mismo criterio que `ICON_MAP` de Icon).
const CONTACT_ICONS: Record<ContactItem["type"], IconName> = {
  email: "mail",
  phone: "phone",
  whatsapp: "message-circle",
  location: "map-pin",
};

// Contenedor del disclosure (plan → Interfaz; RF-10): id fijo, coincidente con
// el `aria-controls` del botón (T4) y con el selector de `foundations/layout.md`
// → Impresión. Constante local: no es parte de la API pública.
const CONTACTS_CONTAINER_ID = "sidebar-contacts";

export function Sidebar({ profile, contact, social, labels, className }: SidebarProps) {
  // T4 (RF-3; plan → Decisiones, decisión 11): estado local `expanded`,
  // default `false` en TODOS los < xl (la visibilidad ≥ xl la da el @media del
  // módulo en T6, no el estado). Sin `matchMedia` en JS (prohibido sin mandato
  // explícito).
  const [expanded, setExpanded] = useState(false);

  // T4 (RF-4): clases del chevron sobre el `<svg>` del Icon (la unión la aplica
  // Icon en su raíz, su RF-6): base `.chevron` SIEMPRE (ahí vive la transición
  // de `transform` con `--duration-base`, para animar también el cierre —
  // criterio LanguageSwitcher) y `.chevronRotated` solo expandido. Criterio
  // canónico de join de la fase: array + filtro de `undefined` + `join` (sin
  // clases vacías).
  const chevronClassName = [
    styles.chevron,
    expanded ? styles.chevronRotated : undefined,
  ]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  // T6 (RF-3/RF-10; spec → Responsive, Colapsable): `.additional` SIEMPRE
  // lleva su clase base del módulo (la pila sin acumulación y el selector
  // compuesto del @media 1200 la necesitan) y la de colapso SOLO cuando
  // `!expanded` — nunca `style` inline (RF-10: los estilos compartidos de
  // impresión y el media ≥ xl deben poder sobrescribirla; el media gana por
  // especificidad, ver comentario del módulo). Mismo join canónico (array +
  // filtro de `undefined` + join, base primero).
  const additionalClassName = [
    styles.additional,
    expanded ? undefined : styles.additionalCollapsed,
  ]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return (
    // RF-1 + spec → Accesibilidad: landmark `<aside>` nombrado con
    // `labels.region` (por props, no hardcodeado — C3). `variant="outer"` es
    // el default del Box pero se explicita por la Anatomía (spec → plan).
    <Box variant="outer" as="aside" aria-label={labels.region} className={className}>
      {/* T7 (RF-3/RF-4/RF-10; Anatomía del Cambio F5 2026-10-08, decisión
          #104b): el disclosure es un botón icon-only DIRECTO como PRIMER hijo
          del landmark — sin CornerTab (su fondo `surface-raised` solapaba el
          nombre a 375px, hallazgo D1 de qa-report). El módulo lo posiciona
          absoluto en la esquina superior derecha del raíz: el anclaje lo da el
          propio `<aside>`, porque Box `.outer` ya declara `position: relative`
          (verificado en Box.module.css T4 — su comentario lo fija como "ancla
          de CornerTab"; acá cumple la misma función sin clase extra). Se monta
          SIEMPRE: en ≥ xl lo oculta solo el @media 1200 del módulo (decisión
          8=a: CSS-only, sin render condicional por ancho). `type="button"`: no
          es un submit (criterio ThemeToggle/LanguageSwitcher). `data-print-hide`
          en la raíz: hook del contrato de impresión #103/#104a (RF-10;
          global.css lo alcanza con la variante compuesta elemento+atributo
          (0,1,1), que gana a la clase del módulo). Patrón disclosure (spec →
          Accesibilidad): `aria-expanded` (estado local `expanded`, default
          `false` en todo < xl — decisión 11) + `aria-controls` al id de
          `.additional` (existente siempre — Tests 5/RF-10) + `aria-label`
          alterno showContacts/hideContacts (RF-4: el nombre accesible
          reemplaza al texto visible; textos por props — RF-8). El chevron es
          `Icon name="chevron-down"` sin `label` → decorativo (`aria-hidden`,
          Icon RF-3) con las clases `.chevron`/`.chevronRotated` del módulo
          unidas en su `<svg>` (Icon RF-6); la rotación (`transform` +
          `--duration-base`) es CSS: en jsdom solo se observa la clase.
          `.disclosure` — estilo de la fila "Botón de disclosure" de spec →
          Colapsable/Estados (sin fondo ni border, --color-accent-text, anillo
          estándar en foco; T6/QA F5: pseudo-estados no asertables en jsdom). */}
      <button
        type="button"
        className={styles.disclosure}
        data-print-hide
        aria-label={expanded ? labels.hideContacts : labels.showContacts}
        aria-expanded={expanded}
        aria-controls={CONTACTS_CONTAINER_ID}
        onClick={() => {
          setExpanded((current) => !current);
        }}
      >
        <Icon name="chevron-down" className={chevronClassName} />
      </button>

      {/* baseInfo (Anatomía): avatar + identidad + redes; T6 conecta las
          clases del módulo (grilla `auto 1fr` < md y md–lg, columna centrada
          con avatar sobresaliente en xl — spec → Responsive). */}
      <div className={styles.baseInfo}>
        {/* Avatar (Anatomía: `figure.avatar > img`). Decisión 9 (spec →
            Estilos y tokens): SIN atributos HTML `width`/`height` ni
            `decoding` explícito — el tamaño es del token
            `--size-avatar-sidebar` (CSS, T6: `.avatar` lo dimensiona y escala
             por breakpoint vía el token; el valor base del tramo < md lo fija
             el usuario en `tokens.css` — Cambio F5, T7) y en xl sobresale de la card. El
             alt llega desde `labels.avatarAlt` (spec → Accesibilidad; AppLayout
             lo deriva de `profile.name` con `format`). */}
        <figure className={styles.avatar}>
          <img src={assetUrl(profile.avatar.src)} alt={labels.avatarAlt} />
        </figure>

        {/* Identidad (Anatomía): el nombre es `<p>` con estilo propio — el
            único h1 de la página es el del tabpanel (spec → No hacer: "No
            usar el nombre como h1"). El headline va en el Badge. */}
        <div className={styles.identity}>
          <p className={styles.name}>{profile.name}</p>
          <Badge>{profile.headline}</Badge>
        </div>

        {/* RF-9 (mitad `social`; Tests 8): sin entradas no se monta la lista
            (una `ul` nombrada vacía no renderiza). */}
        {social.length > 0 && (
          // spec → Accesibilidad: la lista de redes lleva el nombre
          // `labels.social` traducido.
          <ul className={styles.social} aria-label={labels.social}>
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

      {/* .additional (Anatomía): Separator + lista de contactos (+ CTA, T5).
          T3: el contenedor se monta siempre. T4 (RF-3/RF-10): cuando
          `!expanded` recibe la CLASE de colapso del módulo (nunca `style`
          inline: la expansión forzada de impresión y el `@media` ≥ xl de T6
          deben poder sobrescribirla); T6 une además la clase base
          `.additional` — pila sin `gap` cuyo tramo del Separator aporta solo
          el `margin-block` del separador y el del CTA su `margin-top` (
          `.cta`) — y el @media 1200 pisa la de colapso por especificidad
          (selector compuesto; decisión 8=a/RF-10). El id sigue alcanzable
          para el `aria-controls` y para print (RF-10). */}
      <div id={CONTACTS_CONTAINER_ID} className={additionalClassName}>
        {/* RF-9: sin contactos **y** sin `downloadCvUrl` no se renderiza el
            Separator (un `.additional` sin contenido no deja huérfano el
            separador). La condición evalúa `profile.downloadCvUrl` según la
            spec; desde T5 el CTA de descarga real acompaña esta regla (test
            T3 "keeps the Separator…" sigue vigente con el botón montado). */}
        {(contact.length > 0 || profile.downloadCvUrl !== undefined) && <Separator />}

        {/* RF-9 (mitad `contact`; Tests 8): `contact=[]` → no se monta la
            lista. Orden de render = orden recibido (CvData). */}
        {contact.length > 0 && (
          <ul className={styles.contacts}>
            {contact.map((item) => {
              // RF-5: href explícito con prioridad, o derivado por tipo
              // (`getContactHref`, función pura testeada en T1). `undefined`
              // (location, phone/whatsapp sin dígitos) → texto plano.
              const href = getContactHref(item);

              // Criterio de externidad (RF-6, decisión 10; plan →
              // Decisiones: "por tipo/campo explícito, no heurística de
              // dominio"): es externo un contacto con `href` explícito que
              // sea URL http(s) (p. ej. sitio web) y, entre los derivados,
              // SOLO whatsapp — `getContactHref` produce para él siempre
              // `https://wa.me/…`; los derivados email/phone son
              // `mailto:`/`tel:`, que se abren sin `target` ni `rel` (RF-6).
              // Links externos siempre con `rel="noopener noreferrer"` (D6).
              const external =
                item.href !== undefined ? /^https?:/i.test(item.href) : item.type === "whatsapp";

              return (
                // Key: `item.id` (identificador estable del esquema, únicos
                // por entrada — mismo criterio que redes).
                <li key={item.id}>
                  {/* Anatomía: IconBox (decorativo por su RF-2: el
                      significado lo da el texto acompañante) y bloque de
                      texto Overhead + valor. */}
                  <IconBox icon={CONTACT_ICONS[item.type]} />
                  <div>
                    {/* Label traducido por tipo, recibido por props (RF-8;
                        spec → Accesibilidad: label y valor en el mismo `li`). */}
                    <Overhead>{labels.contact[item.type]}</Overhead>

                    {/* Valor completo en `title` (tabla Contactos; el
                        ellipsis lo aplica el módulo en T6). Con href → `<a>`;
                        `target`/`rel` solo si es externo (undefined omite el
                        atributo en el DOM). Sin href → `<p>` (RF-5: "el
                        valor se muestra como texto"). */}
                    {href !== undefined ? (
                      <a
                        href={href}
                        title={item.value}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p title={item.value}>{item.value}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* T5 (RF-2; Anatomía): CTA de descarga SOLO si existe
            `profile.downloadCvUrl` (SI no existe, ENTONCES no se renderiza el
            botón). Primitiva F2 exacta de la Anatomía: `Button href
            download icon="download" fullWidth` — `download={true}` transmite
            el atributo `download` (Button RF-8), `icon` es `Icon` sin `label`
            → decorativo con su tone default `current` (Button.tsx T4/Icon
            RF-4: sin gradiente, no requieren defs), y `fullWidth` da el ancho
            (regla 13 del marco: el link mide el ancho del contenedor). El
            texto viene de `labels.downloadCv` por props (RF-8/C3). Link de
            descarga mismo-origen: NO es externo de RF-6 — sin `target`/`rel`
            (Button los omite cuando no se pasan). T6: `className={styles.cta}`
            — la clase se UNE al raíz del Button (su API) y aporta el
            `margin-top: var(--sidebar-cta-gap)` de la tabla "Download CV";
            en la pila de `.additional` (sin `gap` propio) ese margen es todo
            lo que separa contactos↔CTA. */}
        {profile.downloadCvUrl !== undefined && (
          <Button
            href={profile.downloadCvUrl}
            download
            icon="download"
            fullWidth
            className={styles.cta}
          >
            {labels.downloadCv}
          </Button>
        )}
      </div>
    </Box>
  );
}
