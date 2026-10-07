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
import { describe, expect, it } from "vitest";

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
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.getByRole("complementary", { name: LABELS.region })).toBeInTheDocument();
    expect(screen.getByText(PROFILE.name)).toBeInTheDocument();
  });
});
