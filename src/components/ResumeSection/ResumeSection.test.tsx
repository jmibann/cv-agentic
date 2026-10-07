// Tests de T1 y T2 (specs/content/ResumeSection/tasks.md). T1 — RF-1, RF-2,
// RF-3, RF-5. T2 — RF-4 (columna flex del módulo, por inspección) y cierre
// a11y del archivo (Tests esperados 6, constitución T4).
// "Hecho cuando" de T1: `getByRole("region", { name: title })` (nombre vía
// `aria-labelledby="resume-${id}-title"`); la región contiene `heading` nivel 2
// con el título y su `IconBox` decorativo y un `list` con `listitem` × n; el
// heading de ítem queda nivel 3 dentro de la región (jerarquía); `entries=[]`
// → `container` vacío; dos secciones con `id` distintos no duplican ids de
// título (Tests esperados 5; RF-3) y el `timelineIdPrefix` recibido llega al
// Timeline (ids de ítems con la fórmula `${prefix}-${entry.id}-title`).
//
// Diferidos: ninguno — T2 cumple los dos declarados en T1: agrega el cierre
// `expectNoA11yViolations` del archivo (Tests esperados 6, constitución T4)
// y completa el módulo con la columna flex (RF-4).
// #101 VERDE ON-ARRIVAL DECLARADO: el cierre audita markup que ya era
// accesible desde T1 (región nombrada por su h2, jerarquía h2→h3, IconBox
// aria-hidden) y nada del alcance de T2 es discriminate-testable en jsdom
// (las hojas de estilo no se cargan; fabricar rojo leyendo el CSS como texto
// está descartado). El cierre cubre regresión futura; la verificación real
// de RF-4 es la inspección del reviewer: `.resumeSection` declara SOLO
// `display: flex; flex-direction: column;` — sin gap ni margen extra (el
// `margin-bottom` del h2 de SectionTitle es el único espacio) y cero `@media`
// propios (la disposición en columnas la decide ResumePage).
//
// Justificación de queries (constitución T3): región nombrada
// (`getByRole("region", { name })`, Tests 1), `heading` por nivel + nombre
// accesible (Tests 1, 2; el `name` del h2 además prueba que el IconBox
// aria-hidden no altera el nombre), `list`/`listitem`/`article` por rol
// (Tests 3). El IconBox decorativo es consultado estructuralmente
// (`firstElementChild` + `querySelector` sobre el glyph en gradiente): es
// `aria-hidden` (sin rol ni nombre accesible) y la API no define
// `data-testid`; precedente exacto SectionTitle.test T4 (mismas queries y
// mismo armazón). Sin alternativa accesible posible.
//
// Armazón `AccentGradientDefs` (regla del agente): ResumeSection monta
// SectionTitle con `icon` → `Icon tone="gradient"` necesita las defs
// compartidas (en la app las monta AppLayout una sola vez). La query del
// glyph está acotada al heading, igual que en SectionTitle.test. La render de
// `entries=[]` NO monta defs: con `null` del componente el `container` queda
// literalmente vacío ("Hecho cuando" textual) y sin ícono no hay gradiente
// que resolver.
//
// Personas e instituciones ficticias (constitución D4).

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Locale, TimelineEntry } from "@data/cv.types.generated";

import { AccentGradientDefs } from "../Icon";

import { ResumeSection } from "./ResumeSection";
import type { ResumeSectionProps } from "./ResumeSection";

// T2: helper de cierre a11y (constitución T4); import puro, no toca lo
// anterior (precedente Timeline T3 / Overhead T3).
import { expectNoA11yViolations } from "../../test/a11y";

// El test importa el módulo solo para fijar el nombre real de la clase base
// (`resumeSection`) del <section> raíz y asierte la coexistencia con la clase
// del consumidor (unión #99; precedente Timeline/ThemeToggle T1: el módulo
// nace con la clase base vacía y los estilos llegan en T2).
import styles from "./ResumeSection.module.css";

// --- Fixtures ---------------------------------------------------------------
const ENTRY_CS: TimelineEntry = {
  id: "cs-degree",
  title: "B.Sc. in Computer Science",
  organization: "Northlake State University",
  start: "2012",
  end: "2017",
  description: "Focus on software engineering.",
};

const ENTRY_LEAD: TimelineEntry = {
  id: "lead-fe",
  title: "Lead Frontend Developer",
  organization: "Example Digital Studio",
  start: "2018",
  // Rama end:null: el presentLabel (prop RF-2) se pinta como texto del
  // período vía el Timeline real (pieza cerrada; no se mockea — plan →
  // Estrategia de tests).
  end: null,
  description: "Design systems and accessibility work.",
};

const ENTRIES: readonly TimelineEntry[] = [ENTRY_CS, ENTRY_LEAD];

// Props de la sección Education (Anatomía literal de la spec: icon "book-open"
// y prefijo explícito "edu"; decisión 14: sin derivación interna).
const TITLE = "Education";
const SECTION_ID = "education";
const ICON = "book-open";
const ID_PREFIX = "edu";
const LOCALE: Locale = "en";
const PRESENT_LABEL = "Present";

// API completa (spec → API): `overrides` varía `id`/`title`/`timelineIdPrefix`
// (colisión de ids), `entries` (caso vacío) y `className` (unión).
const resumeSection = (
  overrides: Partial<
    Pick<
      ResumeSectionProps,
      "id" | "title" | "timelineIdPrefix" | "entries" | "className"
    >
  > = {},
) => (
  <>
    {/* Armazón de las defs del gradiente (patrón SectionTitle/IconBox.test). */}
    <AccentGradientDefs />
    <ResumeSection
      id={SECTION_ID}
      timelineIdPrefix={ID_PREFIX}
      title={TITLE}
      icon={ICON}
      entries={ENTRIES}
      locale={LOCALE}
      presentLabel={PRESENT_LABEL}
      {...overrides}
    />
  </>
);

// --- T1 · RF-1 + RF-5 + RF-3: región nombrada por su h2 ----------------------
describe("ResumeSection named region (T1: RF-1, RF-3, RF-5)", () => {
  it("renders a section region named by its h2 through the derived title id", () => {
    render(resumeSection());

    // Tests esperados 1 (RF-1, RF-5): `<section>` con `aria-labelledby` →
    // rol `region` con el nombre del título. "Hecho cuando": el nombre sale
    // de `aria-labelledby="resume-${id}-title"` (RF-3: fórmula fija).
    const region = screen.getByRole("region", { name: TITLE });
    expect(region.tagName).toBe("SECTION");
    expect(region).toHaveAttribute(
      "aria-labelledby",
      "resume-education-title",
    );

    // El h2 vive dentro de la región, lleva el id derivado y el
    // `aria-labelledby` apunta exactamente a él (Tests 1 y 2).
    const heading = within(region).getByRole("heading", {
      level: 2,
      name: TITLE,
    });
    expect(heading.getAttribute("id")).toBe("resume-education-title");
    expect(heading.getAttribute("id")).toBe(
      region.getAttribute("aria-labelledby"),
    );
  });
});

// --- T1 · RF-2 + Tests 2: SectionTitle con IconBox decorativo -----------------
describe("ResumeSection heading icon (T1: RF-2, spec → Tests esperados 2)", () => {
  it("renders the decorative IconBox glyph inside the h2 keeping its accessible name as only the text", () => {
    render(resumeSection());

    // Anatomía: `SectionTitle as="h2" id={titleId} icon={icon}`. El IconBox
    // es el primer hijo del heading y es decorativo (aria-hidden): el nombre
    // accesible del heading sigue siendo solo el título (ya asertado arriba
    // por `getByRole` con `name`). Queries estructurales justificadas
    // (encabezado; precedente SectionTitle.test T4).
    const region = screen.getByRole("region", { name: TITLE });
    const heading = within(region).getByRole("heading", { level: 2 });

    const iconBox = heading.firstElementChild;
    expect(iconBox?.tagName).toBe("SPAN");
    expect(iconBox).toHaveAttribute("aria-hidden", "true");
    expect(
      iconBox?.querySelector('svg[stroke="url(#accent-gradient)"]'),
    ).not.toBeNull();
    // El texto del heading es solo el children (el IconBox no aporta texto).
    expect(heading.textContent).toBe(TITLE);
  });
});

// --- T1 · RF-2: passthrough al Timeline (list + listitem × n) -----------------
describe("ResumeSection timeline delegation (T1: RF-2)", () => {
  it("renders a list with one listitem per entry in data order inside the region", () => {
    render(resumeSection());

    // Tests esperados 3: el `Timeline` real (pieza F3 cerrada, sin mock)
    // renderiza dentro de la región un `list` (`<ol role="list">`) con un
    // `listitem` por entrada, en el orden de los datos.
    const region = screen.getByRole("region", { name: TITLE });
    const list = within(region).getByRole("list");
    const listitems = within(list).getAllByRole("listitem");
    expect(listitems).toHaveLength(ENTRIES.length);

    const itemHeadings = listitems.map((listitem) =>
      within(listitem).getByRole("heading", { level: 3 }),
    );
    expect(itemHeadings.map((heading) => heading.textContent)).toEqual(
      ENTRIES.map((entry) => entry.title),
    );

    // "Hecho cuando": el `timelineIdPrefix` recibido llega al Timeline — los
    // ids de los ítems siguen la fórmula `${idPrefix}-${entry.id}-title` con
    // el prefijo explícito (RF-2/RF-5 de Timeline, canalizado por esta pieza).
    expect(itemHeadings.map((heading) => heading.getAttribute("id"))).toEqual([
      "edu-cs-degree-title",
      "edu-lead-fe-title",
    ]);
  });

  it("keeps the heading hierarchy: one h2 then the item h3s inside the region (RF-5)", () => {
    render(resumeSection());

    // RF-5 (parte verificable aquí; los h3 los fija Timeline RF-2): dentro de
    // la región la jerarquía es h2 (título) → h3 (ítems), sin otro nivel.
    const region = screen.getByRole("region", { name: TITLE });
    const levels = within(region)
      .getAllByRole("heading")
      .map((heading) => heading.tagName);
    expect(levels).toEqual(["H2", "H3", "H3"]);
  });

  // extra: el passthrough de `locale`/`presentLabel` (RF-2: "el `locale` y el
  // `presentLabel` recibidos") no tiene caso propio en "Tests esperados" y
  // "Hecho cuando" solo reclama la fórmula de ids; se cubre con UN assert
  // mínimo de texto (el presentLabel llega al período del ítem abierto a vía
  // el Timeline real), sin duplicar los tests de formateo de Timeline.
  it("renders the received presentLabel in the item period inside the region (T1: RF-2)", () => {
    render(resumeSection());

    const region = screen.getByRole("region", { name: TITLE });
    const openArticle = within(region).getByRole("article", {
      name: ENTRY_LEAD.title,
    });
    // Período construido por el Timeline real con las props recibidas:
    // "2018" (YYYY crudo) + separador fijo + presentLabel como texto.
    expect(openArticle.textContent).toContain("2018 — Present");
  });
});

// --- T1 · RF-1 (SI vacío): entries=[] → no renderiza ---------------------------
describe("ResumeSection empty entries (T1: RF-1)", () => {
  it("renders nothing when entries is empty", () => {
    // Tests esperados 4 / "No hacer": `entries=[]` → `null`, ni la <section>.
    // Render directo sin `AccentGradientDefs` (encabezado): container vacío
    // textual es exactamente el "Hecho cuando".
    const { container } = render(
      <ResumeSection
        id={SECTION_ID}
        timelineIdPrefix={ID_PREFIX}
        title={TITLE}
        icon={ICON}
        entries={[]}
        locale={LOCALE}
        presentLabel={PRESENT_LABEL}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

// --- T1 · RF-3: ids derivados sin duplicación (Tests esperados 5) --------------
describe("ResumeSection id derivation (T1: RF-3, spec → Tests esperados 5)", () => {
  it("derives distinct title ids per section and routes item ids through each explicit prefix", () => {
    // Dos ResumeSection con `id` distintos (education/experience): los ids de
    // título `resume-<id>-title` no se duplican (RF-3: SOLO el id del h2 se
    // deriva acá) y cada `timelineIdPrefix` produce ids de ítem distintos con
    // la fórmula (decisión 14: el prefijo llega explícito, sin mapa interno).
    render(
      <>
        <AccentGradientDefs />
        <ResumeSection
          id="education"
          timelineIdPrefix="edu"
          title="Education"
          icon="book-open"
          entries={[ENTRY_CS]}
          locale={LOCALE}
          presentLabel={PRESENT_LABEL}
        />
        <ResumeSection
          id="experience"
          timelineIdPrefix="exp"
          title="Experience"
          icon="briefcase"
          entries={[ENTRY_LEAD]}
          locale={LOCALE}
          presentLabel={PRESENT_LABEL}
        />
      </>,
    );

    const educationRegion = screen.getByRole("region", { name: "Education" });
    const experienceRegion = screen.getByRole("region", {
      name: "Experience",
    });
    expect(educationRegion).toHaveAttribute(
      "aria-labelledby",
      "resume-education-title",
    );
    expect(experienceRegion).toHaveAttribute(
      "aria-labelledby",
      "resume-experience-title",
    );

    const titleIds = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.getAttribute("id"));
    expect(titleIds).toEqual([
      "resume-education-title",
      "resume-experience-title",
    ]);
    expect(new Set(titleIds).size).toBe(2);

    // Ids de ítems por la fórmula con el prefijo de cada sección (mismas
    // formas de id, canales distintos: no colisionan en el documento).
    expect(
      within(educationRegion)
        .getByRole("heading", { level: 3, name: ENTRY_CS.title })
        .getAttribute("id"),
    ).toBe("edu-cs-degree-title");
    expect(
      within(experienceRegion)
        .getByRole("heading", { level: 3, name: ENTRY_LEAD.title })
        .getAttribute("id"),
    ).toBe("exp-lead-fe-title");
  });
});

// extra: unión de className al <section> raíz — contrato de spec → API (G-B)
// sin contrapartida en "Tests esperados"; el "Hecho cuando" de T2 no la
// reclama (declara el módulo flex, el cierre a11y e index.ts), así que se
// conecta y se testa en T1 (criterio Timeline/NavTabs/ControlsBar/
// ThemeToggle/LanguageSwitcher T1). La unión es el mecanismo canónico en la
// implementación (array + filtro de undefined + join, base primero, #99); el
// patrón #99 del ASSERT de test (`styles.name ?? "name"` + `toHaveClass(c)`,
// prohibidos `!` y `as`) es otra cosa: el `??` es solo el fallback de tipos
// bajo `noUncheckedIndexedAccess`, no parte de la unión (fix menor de la
// revisión de T1).
describe("ResumeSection className joining (T1: spec → API, G-B)", () => {
  it("joins an external className to the base class on the root section", () => {
    const consumerClass = "resume-panel";
    const baseClass = styles.resumeSection ?? "resumeSection";

    render(resumeSection({ className: consumerClass }));

    // La clase externa COEXISTE con la base en el raíz (no la reemplaza);
    // rige la hoja de estilos, no el orden del atributo.
    const region = screen.getByRole("region", { name: TITLE });
    expect(region).toHaveClass(baseClass);
    expect(region).toHaveClass(consumerClass);
  });
});

// ============================================================================
// T2 · cierre a11y (Tests esperados 6, constitución T4): axe sobre la sección
// completa — <section> nombrada por su h2 con IconBox decorativo en gradiente
// y el Timeline real con las dos entradas del fixture (rango + end:null,
// ambas ramas del período). #101 VERDE ON-ARRIVAL DECLARADO (encabezado): el
// markup ya era accesible desde T1 y el módulo de T2 no se carga en jsdom.
// UNA sola rama decisionada: con `entries=[]` la pieza renderiza `null`
// (RF-1) y auditar un container vacío no aporta cobertura axe; los Tests
// esperados 6 apuntan a la sección renderizada, no al caso vacío. Armazón
// `AccentGradientDefs` (encabezado): el IconBox de SectionTitle usa Icon
// `tone="gradient"` y necesita las defs compartidas.
// ============================================================================

describe("ResumeSection accessibility audit (T2: spec → Tests esperados 6)", () => {
  it("has no accessibility violations with the full section (title and timeline)", async () => {
    const { container } = render(resumeSection());

    await expectNoA11yViolations(container);
  });
});
