// Tests de T2 (specs/layout/Sidebar/tasks.md) — RF-1, RF-6 (redes), RF-8 y
// parte de RF-9: estructura base del landmark. Escenarios de spec → Tests
// esperados cubiertos acá: #1 (`getByRole("complementary", { name:
// labels.region })`, raíz `<aside>` que CONTIENE avatar/nombre/headline/redes
// — RF-1), #2 (nombre, headline en Badge y avatar con su alt; el nombre es
// `<p>`, NO heading — spec → Anatomía y "No hacer"), #3 (un link por red con
// `aria-label` de la marca, `href` correcto, `target="_blank"` y
// `rel="noopener noreferrer"` con `BrandIcon` dentro) y la mitad `social` del
// #8 / RF-9 (`social=[]` → no renderiza la lista de redes). Decisión 9
// (spec → Estilos y tokens, Avatar): el `<img>` NO lleva atributos HTML
// `width`/`height` ni `decoding` explícito — dimensiona solo el CSS (T6) — y
// se asertan los tres atributos ausentes.
//
// Marca del link (plan → Decisiones; spec → Accesibilidad): `BRAND_NAMES` de
// BrandIcon es un registro `Record<SocialNetwork, string>` (network → nombre
// visible). BrandIcon renderiza SU `<svg>` siempre `aria-hidden="true"` y sin
// nombre propio (su spec RF-3: "el nombre accesible lo aporta el link
// contenedor con `aria-label={BRAND_NAMES[network]}` (Sidebar, su spec)"), así
// que el `aria-label` va en el `<a>` y NO duplica nada: el logo queda
// decorativo y la marca la lee la tecnología de asistencia del link. Los
// literales del test ("GitHub"/"LinkedIn") son los valores que BRAND_NAMES
// fija por diseño (BrandIcon → RF-2), no se leen del registro para no volver
// el test tautológico.
//
// Diferidos por tasks.md (todavía no hay nada que asertar sobre ellos): contactos
// (T3), disclosure CornerTab (T4), CTA Download CV (T5) y `contact` por props
// queda sin uso observable hasta T3. RF-8 (la pieza no importa `useCv()` ni
// `useLocale()` — C2/plan → Interfaz) y las clases de Anatomía con el módulo
// CSS y `index.ts` se verifican por INSPECCIÓN del reviewer (jsdom no computa
// estilos; #101); el cierre `expectNoA11yViolations` llega con T6 junto al CSS
// y el barrel (tasks.md → T6; criterio NavTabs, donde el cierre vive en la
// última tarea). Las redes usan `BrandIcon` con `fill="currentColor"` (sin
// gradiente) y `Badge` no monta SVG: no hacen falta `AccentGradientDefs` ni
// `HexAvatarDefs` de armazón (plan → Estrategia de tests).
//
// Justificación de las queries (constitución T3): todo por rol y nombre
// accesible — `complementary`/`img` con el alt, `list` con `labels.social`,
// `listitem`, `link` con la marca — y `within(...)` para la contención del
// landmark y el orden de la lista. Las tres consultas estructurales justificadas:
// `tagName` del nombre (`P`, spec → Anatomía + "No usar nombre como h1") y del
// Badge (`SPAN`, su spec → API) y del raíz (`ASIDE`, Anatomía), y
// `link.querySelector("svg")` para el BrandIcon — un `aria-hidden` no tiene
// query por rol posible; mismo criterio justificado en BrandIcon T2. Sin
// `data-testid`.
//
// Armazón: render aislado con props fixture (plan → Estrategia de tests): sin
// providers (todo llega por props; RF-8). Fixture calcado de
// `src/content/cv.en.json` (D4: persona ficticia "Alex Rivera"); sin
// `downloadCvUrl` (la rama con CTA es T5).
//
// Rojo on-arrival: "Failed to resolve import ./Sidebar" — el componente no
// existe aún (patrón aprobado en NavTabs/CornerTab/ControlsBar T1).

import { render, screen, within } from "@testing-library/react";
// T4: interacción del disclosure (click / segundo click), mismo criterio que
// NavTabs/ControlsBar. Import puro: no toca lo anterior.
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

// T3: armazón de las defs del gradiente que resuelve el glyph de los IconBox
// de contactos (patrón IconBox.test.tsx/SectionTitle.test.tsx; en la app las
// monta AppLayout una sola vez). Import puro: no toca lo anterior.
import { AccentGradientDefs } from "../Icon";

// T4: clases del módulo de CornerTab para fijar que el botón vive en una tab
// `size="sm"` (criterio NavTabs T4: import del módulo del hijo + #99). Import
// puro.
import cornerTabStyles from "../CornerTab/CornerTab.module.css";

// T4: clases del módulo propio (nace en T4 con el colapso por clase; criterio
// #99 `styles.name ?? "name"`, patrón CornerTab/NavTabs/Button). Import puro.
import styles from "./Sidebar.module.css";

import { Sidebar } from "./Sidebar";
import type { SidebarLabels, SidebarProps } from "./Sidebar";

import type { ContactItem, Profile, SocialLink } from "@data/cv.types.generated";

// Fixture de perfil/redes según `src/content/cv.en.json` (D4: ficticia). El
// avatar SIN `width`/`height`: son del CSS (decisión 9), no del tipo.
const PROFILE: Profile = {
  name: "Alex Rivera",
  headline: "Frontend Developer",
  avatar: { src: "/images/avatar.svg", alt: "Portrait of Alex Rivera" },
  about: ["Example bio paragraph for the About panel."],
};

// `contact` llega por props (API completa de la spec) pero NO se renderiza
// hasta T3: el fixture existe para que el helper compile con `SidebarProps`.
const CONTACT: readonly ContactItem[] = [
  { id: "email", type: "email", value: "alex@example.com" },
];

const SOCIAL: readonly SocialLink[] = [
  { id: "github", network: "github", url: "https://github.com/example" },
  { id: "linkedin", network: "linkedin", url: "https://www.linkedin.com/in/example" },
];

// Labels de interfaz en inglés (valores de ejemplo de spec → API; C3: la
// pieza los recibe traducidos, no los produce).
const LABELS: SidebarLabels = {
  region: "Profile",
  social: "Social profiles",
  showContacts: "Show Contacts",
  hideContacts: "Hide Contacts",
  downloadCv: "Download CV",
  contact: {
    email: "Email",
    phone: "Phone",
    whatsapp: "WhatsApp",
    location: "Location",
  },
};

// Render de la pieza sola (plan → Estrategia de tests) con overrides para las
// variantes de lista (RF-9).
function renderSidebar(overrides: Partial<SidebarProps> = {}) {
  const props: SidebarProps = {
    profile: PROFILE,
    contact: CONTACT,
    social: SOCIAL,
    labels: LABELS,
    ...overrides,
  };
  return render(<Sidebar {...props} />);
}

describe("Sidebar landmark, identity and social structure (T2: RF-1, RF-6, RF-8, RF-9)", () => {
  it("renders a complementary <aside> named by labels.region containing identity and social", () => {
    renderSidebar();

    // RF-1 + spec → Accesibilidad / Tests 1: landmark `complementary` con el
    // `aria-label` traducido que LLEGA POR PROPS (la pieza no consume
    // useLocale — RF-8, inspección). Raíz `<aside>` (Anatomía: `Box
    // as="aside"`; el rol podría venir de `role=`, por eso el tagName fija el
    // elemento).
    const region = screen.getByRole("complementary", { name: LABELS.region });
    expect(region.tagName).toBe("ASIDE");

    // RF-1: el landmark CONTENIENE avatar, nombre, rol (Badge) y redes.
    within(region).getByRole("img", { name: PROFILE.avatar.alt });
    within(region).getByText(PROFILE.name);
    within(region).getByText(PROFILE.headline);
    within(region).getByRole("list", { name: LABELS.social });
  });

  it("shows the name in a <p> and the headline in a Badge, rendering no heading", () => {
    renderSidebar();

    // Tests 2 + "No hacer" (No usar el nombre como h1): ningún heading en la
    // pieza; el único h1 de la página es el del tabpanel (AppLayout).
    expect(screen.queryAllByRole("heading")).toHaveLength(0);

    // spec → Anatomía: nombre = `<p class="name">` (query por texto; el
    // tagName se aserta porque "que NO sea heading" solo con el rol ausente
    // no fijaría el elemento).
    const name = screen.getByText(PROFILE.name);
    expect(name.tagName).toBe("P");

    // Tests 2: headline en el Badge (`<span>` por default según su spec →
    // API/Anatomía).
    const headline = screen.getByText(PROFILE.headline);
    expect(headline.tagName).toBe("SPAN");
  });

  it("renders the avatar img with its alt and without width, height or decoding attributes", () => {
    renderSidebar();

    // Tests 2 + spec → Accesibilidad: alt desde `profile.avatar.alt`.
    const avatar = screen.getByRole("img", { name: PROFILE.avatar.alt });
    expect(avatar).toHaveAttribute("src", PROFILE.avatar.src);

    // Decisión 9 (spec → Estilos y tokens): el tamaño es del token
    // (`--size-avatar-sidebar`, CSS en T6) y escala por breakpoint — no hay un
    // único valor honesto para los atributos HTML — y SIN `decoding` explícito.
    expect(avatar).not.toHaveAttribute("width");
    expect(avatar).not.toHaveAttribute("height");
    expect(avatar).not.toHaveAttribute("decoding");
  });

  it("renders a named social list with one external link per network labeled by its brand", () => {
    renderSidebar();

    // spec → Accesibilidad / Anatomía: `ul` nombrada con `labels.social`, un
    // `li` por entrada en el orden recibido.
    const list = screen.getByRole("list", { name: LABELS.social });
    expect(within(list).getAllByRole("listitem")).toHaveLength(SOCIAL.length);

    // Tests 3: un link por red con `aria-label` de la marca y en orden.
    const links = within(list).getAllByRole("link");
    expect(links).toHaveLength(SOCIAL.length);
    expect(links.map((link) => link.getAttribute("aria-label"))).toEqual([
      "GitHub",
      "LinkedIn",
    ]);

    // RF-6 (redes) + D6: externos SIEMPRE con `target="_blank"` y
    // `rel="noopener noreferrer"`; `href` = `link.url` de la entrada.
    const github = within(list).getByRole("link", { name: "GitHub" });
    expect(github).toHaveAttribute("href", "https://github.com/example");
    expect(github).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("rel", "noopener noreferrer");

    const linkedin = within(list).getByRole("link", { name: "LinkedIn" });
    expect(linkedin).toHaveAttribute("href", "https://www.linkedin.com/in/example");
    expect(linkedin).toHaveAttribute("target", "_blank");
    expect(linkedin).toHaveAttribute("rel", "noopener noreferrer");

    // Anatomía: cada link contiene el `BrandIcon` de su red. El `<svg>` es
    // decorativo (`aria-hidden="true"`, su RF-3) → sin query por rol posible;
    // selección estructural justificada (criterio BrandIcon T2). El nombre lo
    // aporta el `aria-label` del link (lo de arriba): nada duplicado.
    for (const link of links) {
      const svg = link.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("does not render the social list when social is empty", () => {
    renderSidebar({ social: [] });

    // RF-9 (mitad `social`; Tests 8): sin entrada, sin `<ul>` — una lista
    // nombrada vacía no se monta. La identidad y el landmark siguen ahí.
    expect(screen.queryByRole("list", { name: LABELS.social })).toBeNull();
    // Fix T3 aprobado por el usuario: la aserción global de links de T2
    // sobreasertaba (era cierta solo porque los contactos aún no existían);
    // con T3 los links de contacto existen por spec (Test 4). El contrato de
    // este caso (Test 8 / RF-9 mitad `social`) es "sin links DE REDES": se
    // acota a las marcas del fixture SOCIAL sin debilitarlo.
    expect(screen.queryByRole("link", { name: "GitHub" })).toBeNull();
    expect(screen.queryByRole("link", { name: "LinkedIn" })).toBeNull();
    expect(screen.getByRole("complementary", { name: LABELS.region })).toBeInTheDocument();
    expect(screen.getByText(PROFILE.name)).toBeInTheDocument();
  });
});

// ============================================================================
// Tests de T3 (specs/layout/Sidebar/tasks.md) — RF-5 (uso de `getContactHref`
// en el render), RF-6 (contactos: `mailto:`/`tel:` sin target; whatsapp y
// `href` explícito de sitio externos con target/rel), RF-9 (lista de contactos
// y `Separator`) — Tests esperados #4 y la mitad `contact` del #8.
//
// Escenarios (spec → Tests esperados):
// - #4: un ítem por contacto con su label traducido (Overhead); email/phone/
//   whatsapp son links con el `href` derivado por `getContactHref` (valores
//   literales del Test 7); location NO es link; `mailto:`/`tel:` **sin**
//   `target`/`rel`; whatsapp y un `href` explícito de sitio con
//   `target="_blank"` + `rel="noopener noreferrer"` (RF-6, decisión 10, D6).
//   El `title` con el valor completo (spec → Estilos y tokens, tabla
//   Contactos: "el valor completo va en `title`") es comportamiento DOM
//   observable y se aserta acá, no en T6.
// - #8 (mitad `contact` + RF-9): `contact=[]` no renderiza la lista de
//   contactos; sin contactos **y** sin `downloadCvUrl` tampoco el `Separator`;
//   con `downloadCvUrl` (el CTA llega en T5) el Separator se mantiene.
// - extra: phone cuyo valor no conserva dígitos → texto, no link (RF-5: "el
//   resultado es `undefined` y el valor se muestra como texto"): edge
//   observable en el render que la derivación pura (test 7) no cubre.
//
// Justificación de las queries (constitución T3): los links de contacto por
// rol `link` + nombre accesible = valor visible (el Overhead es hermano del
// link en el DOM, no contenido suyo, así que no entra en el nombre). Los
// labels por texto exacto (Overhead RF-4: las mayúsculas son solo visuales;
// el DOM conserva "Email"/"WhatsApp"). El `IconBox` de cada fila es
// decorativo (su RF-2: `aria-hidden="true"`) → sin rol ni nombre posible y la
// API no define testid: selección **estructural justificada**, mismo criterio
// de IconBox T1 y SectionTitle T4 — primer hijo del `li` = `<span
// aria-hidden>` conteniendo el `<svg>` con `stroke="url(#accent-gradient)"`
// (el `<svg>` defs del armazón no lleva `stroke` y la query está acotada al
// `li`). El mapeo exacto tipo→glifo (mail/phone/message-circle/map-pin) lo
// ancla en compile el tipo exhaustivo `Record<ContactItem["type"], IconName>`
// (criterio ICON_MAP de Icon) + inspección del reviewer: en jsdom distinguir
// paths específicos sería acoplarse a internals de lucide. El `Separator` (un
// `<div aria-hidden>` sin nombre) se verifica por selección estructural
// acotada: `#sidebar-contacts > div[aria-hidden="true"]` — es el ÚNICO div
// aria-hidden directo del bloque (la lista es `ul` y los IconBox son `span`
// anidados en los `li`); criterio declarado, sin testid.
//
// Armazón: helper `renderSidebarWithDefs` propio de T3 (no se toca
// `renderSidebar` de T2, P4/T2) que monta `AccentGradientDefs` junto a la
// pieza. Fixtures: `CONTACT_FULL` calcado de `src/content/cv.en.json` (D4:
// persona ficticia) y `PROFILE_WITH_CV` con `downloadCvUrl` de placeholder
// ficticio (rama CV de RF-9).
//
// Rojo on-arrival: contra el estado T2 no existe el bloque `.additional` ni
// los links/valores de contactos — los 8 casos fallen por falta de
// implementación (la variante `contact=[]` sin CV falla además por el
// contenedor `#sidebar-contacts` ausente, no por la lista).

// Contactos de T3: los cuatro tipos con los valores de `cv.en.json` (D4).
const CONTACT_FULL: readonly ContactItem[] = [
  { id: "email", type: "email", value: "alex@example.com" },
  { id: "phone", type: "phone", value: "+54 11 5555-0100" },
  { id: "whatsapp", type: "whatsapp", value: "+54 9 11 5555-0100" },
  { id: "location", type: "location", value: "Buenos Aires, Argentina" },
];

// Profile con `downloadCvUrl` (rama CV de RF-9; el botón CTA en sí es T5).
const PROFILE_WITH_CV: Profile = {
  ...PROFILE,
  downloadCvUrl: "/cv/alex-rivera-cv.pdf",
};

// Selector estructural del Separator dentro del bloque (criterio arriba).
const SEPARATOR_IN_ADDITIONAL = '#sidebar-contacts > div[aria-hidden="true"]';

// Render de T3 con las defs del gradiente (armazón, patrón IconBox T1).
function renderSidebarWithDefs(overrides: Partial<SidebarProps> = {}) {
  const props: SidebarProps = {
    profile: PROFILE,
    contact: CONTACT_FULL,
    social: SOCIAL,
    labels: LABELS,
    ...overrides,
  };
  return render(
    <>
      <AccentGradientDefs />
      <Sidebar {...props} />
    </>,
  );
}

describe("Sidebar contacts: derived links, labels and separator (T3: RF-5, RF-6, RF-9)", () => {
  it("renders one contact list item per entry with its translated label and IconBox glyph", () => {
    const { container } = renderSidebarWithDefs();

    const region = screen.getByRole("complementary", { name: LABELS.region });

    // Anatomía: el bloque `.additional` existe con el id del disclosure
    // (RF-10). En T3 se monta siempre; la lógica de colapso llega en T4.
    expect(container.querySelector("#sidebar-contacts")).not.toBeNull();

    // Dos listas en el landmark: redes (nombrada, T2) y contactos (Anatomía:
    // `ul.contacts`, sin nombre propio; por eso se la cuenta, no se la
    // consulta por nombre). Una fila por contacto recibido.
    const lists = within(region).getAllByRole("list");
    expect(lists).toHaveLength(2);
    expect(within(region).getByRole("list", { name: LABELS.social })).toBeInTheDocument();

    for (const item of CONTACT_FULL) {
      // Label traducido por tipo, recibido por props (RF-8): Overhead =
      // `<span>` con el texto tal cual (su RF-4).
      const label = screen.getByText(LABELS.contact[item.type]);
      expect(label.tagName).toBe("SPAN");

      // Fila (Anatomía): el `li` que contiene el label; vive en una `ul`.
      const row = label.closest("li");
      if (row === null) {
        throw new Error(
          `expected the "${LABELS.contact[item.type]}" label to be inside a list item`,
        );
      }
      expect(row.parentElement?.tagName).toBe("UL");

      // IconBox (Anatomía: primer hijo del `li`, decorativo): criterio
      // estructural justificado en el encabezado — span aria-hidden cuyo
      // glyph trae el trazo del gradiente.
      const iconBox = row.firstElementChild;
      expect(iconBox?.tagName).toBe("SPAN");
      expect(iconBox).toHaveAttribute("aria-hidden", "true");
      expect(iconBox?.querySelector('svg[stroke="url(#accent-gradient)"]')).not.toBeNull();
    }

    // RF-9 (a contrario): con contactos hay Separator entre la info base y
    // la lista (Anatomía: Separator + `ul.contacts` en `.additional`).
    expect(container.querySelectorAll(SEPARATOR_IN_ADDITIONAL)).toHaveLength(1);
  });

  it("renders email and phone as mailto/tel links without target or rel", () => {
    renderSidebarWithDefs();

    // RF-5 (uso) + Tests 4: `href` derivado por `getContactHref` (valores
    // literales del Test 7). RF-6 + D6: `mailto:`/`tel:` se abren SIN
    // `target` ni `rel`.
    const email = screen.getByRole("link", { name: "alex@example.com" });
    expect(email).toHaveAttribute("href", "mailto:alex@example.com");
    expect(email).not.toHaveAttribute("target");
    expect(email).not.toHaveAttribute("rel");

    const phone = screen.getByRole("link", { name: "+54 11 5555-0100" });
    expect(phone).toHaveAttribute("href", "tel:+541155550100");
    expect(phone).not.toHaveAttribute("target");
    expect(phone).not.toHaveAttribute("rel");

    // Tabla Contactos (spec → Estilos y tokens): valor completo en `title`.
    expect(email).toHaveAttribute("title", "alex@example.com");
    expect(phone).toHaveAttribute("title", "+54 11 5555-0100");
  });

  it("opens the derived whatsapp link in a new tab with noopener noreferrer", () => {
    renderSidebarWithDefs();

    // RF-6 (decisión 10): el whatsapp derivado es `https://wa.me/…` → link
    // externo con target/rel (Tests 4).
    const whatsapp = screen.getByRole("link", { name: "+54 9 11 5555-0100" });
    expect(whatsapp).toHaveAttribute("href", "https://wa.me/5491155550100");
    expect(whatsapp).toHaveAttribute("target", "_blank");
    expect(whatsapp).toHaveAttribute("rel", "noopener noreferrer");
    expect(whatsapp).toHaveAttribute("title", "+54 9 11 5555-0100");
  });

  it("opens a contact with an explicit site href as an external link too", () => {
    // Tests 4: "un `href` explícito de sitio" — el explícito prioriza sobre
    // la derivación (tabla API, Test 7) y siendo http(s) es externo (RF-6).
    renderSidebarWithDefs({
      contact: [
        {
          id: "site",
          type: "location",
          value: "alexrivera.dev",
          href: "https://alexrivera.dev",
        },
      ],
    });

    const site = screen.getByRole("link", { name: "alexrivera.dev" });
    expect(site).toHaveAttribute("href", "https://alexrivera.dev");
    expect(site).toHaveAttribute("target", "_blank");
    expect(site).toHaveAttribute("rel", "noopener noreferrer");
    expect(site).toHaveAttribute("title", "alexrivera.dev");
  });

  it("renders location as plain text, not a link", () => {
    renderSidebarWithDefs();

    // RF-5/RF-6 + Tests 4: location → sin link (`getContactHref` devuelve
    // `undefined`); el valor se muestra como texto con su `title`.
    expect(screen.queryByRole("link", { name: "Buenos Aires, Argentina" })).toBeNull();
    const value = screen.getByText("Buenos Aires, Argentina");
    expect(value.tagName).toBe("P");
    expect(value).toHaveAttribute("title", "Buenos Aires, Argentina");
  });

  it("shows a phone value without digits as plain text", () => {
    // extra: RF-5 "SI tras la limpieza `phone` o `whatsapp` no conserva
    // dígitos, ENTONCES el resultado es `undefined` y el valor se muestra
    // como texto". La derivación la fija el Test 7 de `getContactHref`; acá
    // se verifica la rama de render (texto, no link) — edge evidente que la
    // lista de tests no discriminaba en el componente.
    renderSidebarWithDefs({
      contact: [{ id: "phone-bad", type: "phone", value: "N/D" }],
    });

    expect(screen.queryByRole("link", { name: "N/D" })).toBeNull();
    const value = screen.getByText("N/D");
    expect(value.tagName).toBe("P");
    expect(value).toHaveAttribute("title", "N/D");
  });

  it("renders no contacts list and no Separator when contact is empty and there is no downloadCvUrl", () => {
    const { container } = renderSidebarWithDefs({ contact: [] });

    // RF-9 + Tests 8: sin contactos → sin lista (queda solo la de redes),
    // sin labels; sin contactos **y** sin `downloadCvUrl` → sin Separator.
    // El contenedor `#sidebar-contacts` se monta igual en T3 (T4 lo vuelve
    // colapsable; RF-10).
    const region = screen.getByRole("complementary", { name: LABELS.region });
    expect(within(region).getAllByRole("list")).toHaveLength(1);
    for (const contactLabel of Object.values(LABELS.contact)) {
      expect(screen.queryByText(contactLabel)).toBeNull();
    }
    expect(container.querySelectorAll(SEPARATOR_IN_ADDITIONAL)).toHaveLength(0);
    expect(container.querySelector("#sidebar-contacts")).not.toBeNull();
  });

  it("keeps the Separator when contact is empty but downloadCvUrl exists", () => {
    // RF-9 omite el Separator solo sin contactos **y** sin CV; con CV el
    // Separator se mantiene (el CTA que lo acompaña llega en T5).
    const { container } = renderSidebarWithDefs({
      contact: [],
      profile: PROFILE_WITH_CV,
    });

    const region = screen.getByRole("complementary", { name: LABELS.region });
    expect(within(region).getAllByRole("list")).toHaveLength(1);
    expect(container.querySelectorAll(SEPARATOR_IN_ADDITIONAL)).toHaveLength(1);
  });
});

// ============================================================================
// Tests de T4 (specs/layout/Sidebar/tasks.md) — RF-3 (disclosure < xl: botón
// con `aria-expanded` + `aria-controls`, colapso por CLASE del módulo) y RF-4
// (texto alterna showContacts/hideContacts; chevron decorativo con clase de
// rotación). Tests esperados #5 (estado inicial, click → expandido,
// `aria-controls` apunta a un elemento existente) más la reversión al segundo
// click ("Hecho cuando" de la tarea) y la decoración del chevron (RF-4:
// `Icon name="chevron-down"` sin `label` → `aria-hidden`, spec → Accesibilidad:
// patrón disclosure).
//
// Colapso en jsdom = por clase (spec → plan → Decisión CSS-only 8=a; RF-10):
// la visibilidad ≥ xl la da el `@media (min-width: 1200px)` del módulo y NO es
// testeable acá (jsdom no aplica @media — nota de spec → Tests esperados;
// inspección en T6). El aserto "el colapso no usa `style` inline" se fija por
// el atributo `style` ausente en `#sidebar-contacts` (observable en el DOM;
// la prohibición general `style={{}}` es además inspección del reviewer).
// Criterio #99 para las clases (`styles.name ?? "name"`, prohibidos `!` y
// `as string`, patrón CornerTab/NavTabs).
//
// No se asierta la ROTACIÓN del chevron (transform/--duration-base: valores
// computados, jsdom no carga hojas de estilos — #101; inspección T6), solo su
// presencia decorativa dentro del botón. La rotación 180° es texto de spec
// (Estados/Colapsable) y el reviewer la verifica en T6.
//
// Orden DOM (spec → Anatomía, verificable en jsdom aunque sea "clase" de
// layout): la CornerTab va PRIMERA en el DOM dentro del `<aside>` (pegada a la
// esquina superior derecha por su propia base absoluta). Selección
// estructural justificada: el `<div>` de CornerTab no tiene rol ni nombre
// accesible (su RF-6), así que se lo toma vía `button.parentElement` y se lo
// compara con `region.firstElementChild`; las clases `sm`/base se asertan con
// el criterio #99 (patrón NavTabs T4 con `cornerTabBaseClass`).
//
// Rojo on-arrival: el botón disclosure no existe todavía (falta
// `getByRole("button", …)`) y `./Sidebar.module.css` no resuelve (el módulo
// nace en T4 con la clase de colapso) — falla también todo el archivo por el
// import, patrón de rojo por inexistencia ya aprobado en T1.
// ============================================================================

// Clase de colapso de `.additional` (clase del módulo; RF-3/RF-10: nunca
// `style` inline) y clases de CornerTab para la tab `size="sm"` (criterio #99).
const collapsedClass = styles.additionalCollapsed ?? "additionalCollapsed";
const cornerTabBaseClass = cornerTabStyles.cornerTab ?? "cornerTab";
const cornerTabSmClass = cornerTabStyles.sm ?? "sm";

// Id del contenedor del disclosure (literal de spec → RF-10 y Anatomía; mismo
// criterio del selector `SEPARATOR_IN_ADDITIONAL` de T3: el id es contrato
// público de la pieza, se aserta literal, no importado del TSX).
const CONTACTS_ID = "sidebar-contacts";

describe("Sidebar contacts disclosure with CornerTab (T4: RF-3, RF-4)", () => {
  it("mounts the sm CornerTab button collapsed, wired to the contacts block, before the identity", () => {
    const { container } = renderSidebarWithDefs();

    // Tests 5 + RF-3/RF-4: botón disclosure presente con estado inicial
    // colapsado. `type="button"`: no es un submit (patrón ThemeToggle/
    // LanguageSwitcher). El nombre accesible es el texto `showContacts` del
    // fixture (por props, no hardcodeado — RF-8).
    const button = screen.getByRole("button", { name: LABELS.showContacts });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-controls", CONTACTS_ID);

    // Tests 5: `aria-controls` apunta a un elemento EXISTENTE (el div de T3,
    // montado siempre — RF-10 id alcanzable).
    const contacts = container.querySelector(`#${CONTACTS_ID}`);
    expect(contacts).not.toBeNull();

    // "Hecho cuando" T4: en jsdom el estado colapsado es por CLASE del módulo
    // (la visibilidad ≥ xl la da el @media — inspección T6) y nunca por
    // `style` inline (RF-10: los estilos compartidos de impresión deben poder
    // forzar la expansión).
    expect(contacts).toHaveClass(collapsedClass);
    expect(contacts).not.toHaveAttribute("style");

    // Anatomía: el botón vive en una CornerTab `size="sm"` (su base + variante
    // sm; selección estructural justificada en el encabezado) y la tab va
    // PRIMERA en el DOM del landmark.
    const tab = button.parentElement;
    expect(tab).not.toBeNull();
    expect(tab).toHaveClass(cornerTabBaseClass);
    expect(tab).toHaveClass(cornerTabSmClass);
    const region = screen.getByRole("complementary", { name: LABELS.region });
    expect(region.firstElementChild).toBe(tab);
  });

  it("expands on click: aria-expanded true, hideContacts text and the collapsed class removed", async () => {
    const user = userEvent.setup();
    const { container } = renderSidebarWithDefs();

    await user.click(screen.getByRole("button", { name: LABELS.showContacts }));

    // RF-4: alterna el texto (el nombre accesible pasa a `hideContacts`; el de
    // colapsado ya no existe — un solo botón).
    const button = screen.getByRole("button", { name: LABELS.hideContacts });
    expect(screen.queryByRole("button", { name: LABELS.showContacts })).toBeNull();

    // RF-3/Tests 5: `aria-expanded` pasa a "true".
    expect(button).toHaveAttribute("aria-expanded", "true");

    // "Hecho cuando": `.additional` pasa de la clase de colapso a visible (en
    // jsdom: sin la clase; sigue sin `style` inline).
    const contacts = container.querySelector(`#${CONTACTS_ID}`);
    expect(contacts).not.toBeNull();
    expect(contacts).not.toHaveClass(collapsedClass);
    expect(contacts).not.toHaveAttribute("style");
  });

  it("reverts on the second click: collapsed class, aria-expanded false and showContacts text", async () => {
    const user = userEvent.setup();
    const { container } = renderSidebarWithDefs();

    await user.click(screen.getByRole("button", { name: LABELS.showContacts }));
    await user.click(screen.getByRole("button", { name: LABELS.hideContacts }));

    // "Hecho cuando" T4: el segundo click reviere todo (estado, texto y clase).
    const button = screen.getByRole("button", { name: LABELS.showContacts });
    expect(button).toHaveAttribute("aria-expanded", "false");

    const contacts = container.querySelector(`#${CONTACTS_ID}`);
    expect(contacts).not.toBeNull();
    expect(contacts).toHaveClass(collapsedClass);
  });

  it("renders the chevron inside the button as a decorative aria-hidden icon", () => {
    // RF-4: chevron = `Icon name="chevron-down"` sin `label` → decorativo
    // (Icon RF-3: `aria-hidden="true"`). El svg no tiene rol ni nombre
    // posibles: selección estructural justificada (criterio BrandIcon/T2 de
    // esta pieza). La rotación (transform + --duration-base en la clase del
    // módulo) NO se asiértan acá: jsdom no computa CSS (#101), inspección T6.
    const button = screen.getByRole("button", { name: LABELS.showContacts });
    const chevron = button.querySelector("svg");
    expect(chevron).toBeInTheDocument();
    expect(chevron).toHaveAttribute("aria-hidden", "true");
  });
});
