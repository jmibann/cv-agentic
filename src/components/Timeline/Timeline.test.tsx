// Tests de T1 (specs/content/Timeline/tasks.md) — RF-1, RF-2, RF-5
// (estructura). "Hecho cuando" de T1: `getByRole("list")` con un `listitem`
// por entrada en orden; cada `<article aria-labelledby>` apunta a su `<h3>`
// (nivel 3, nombrado por el título) con id por la fórmula fija
// `${idPrefix}-${entry.id}-title` (RF-5); muestra `organization` y
// `description` si existen; `entries=[]` → `container` vacío.
//
// Diferidos (esta tarea NO los testa; tasks.md los asigna):
// - T2 (RF-3/RF-4): el `<p class="period">` con `<time>` por extremo y
//   `presentLabel`. En T1 NO se renderiza un `<p>` de período vacío: su
//   contenido nace entero en T2 (`formatPeriodEndpoint` de Foundation T12) y
//   un `<p>` hueco hoy obligaría a tocar asserts de T1 mañana (los commits
//   test(Tn) solo agregan). Declarado también en `Timeline.tsx`.
// - T3 (RF-6/RF-7 + constitución T4): los estilos por tokens del módulo, las
//   clases internas y el cierre `expectNoA11yViolations` del archivo
//   (precedente exacto LanguageSwitcher/ThemeToggle: el cierre nace en el
//   último commit `test` de la pieza).
//
// Adaptación al tipo generado (RF-2, "si existen"): `organization` y
// `description` son REQUIRED en `data/cv.schema.json` (string minLength 1 →
// `TimelineEntry` en `data/cv.types.generated.ts`), así que el fixture de una
// entrada "sin org/description" no puede omitir los campos sin cast
// (prohibido). La existencia observable es el valor no vacío: con `""` el
// componente no debe pintar párrafos vacíos (tercera entrada del fixture).
//
// Justificación de queries (constitución T3): roles `list` / `listitem` /
// `article` / `heading` nivel 3 + nombres accesibles (spec → Tests esperados
// 1, 2 y 7); `getByText` para las strings de organización/descripción (test
// 3, contenido visible). La única query estructural es la ausencia de `<p>`
// vacíos en la entrada pelada: no existe query por rol para "párrafo vacío
// ausente" y `getByText("")` no discrimina (matchea todo con substring);
// precedente el propio plan, que admite `querySelectorAll("time")` para el
// test 6 de T2.
//
// Sin providers ni defs SVG: el componente no monta Icon `tone="gradient"`
// ni HexAvatar (plan → Estrategia: render aislado con props fixture).
// `locale`/`presentLabel` viajan en todas las renders (API completa de la
// spec) pero se consumen en T2.
//
// extra (constitución P3): la unión de `className` al `<ol>` raíz (spec →
// API, G-B) no figura en "Tests esperados" y ningún "Hecho cuando" de T2/T3
// la reclama; se testea acá con el mismo criterio de NavTabs T1 (marcado
// `// extra` abajo). Patrón canónico #99: `const c = styles.name ?? "name"`
// + `toHaveClass(c)` (prohibidos `!` y `as`).

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Locale, TimelineEntry } from "@data/cv.types.generated";

import { Timeline } from "./Timeline";
import type { TimelineProps } from "./Timeline";

// El test importa el módulo solo para fijar el nombre real de la clase base
// (`timeline`) del raíz y asierte la coexistencia con la clase del
// consumidor (unión #99; precedente LanguageSwitcher/ThemeToggle T1: el
// módulo nace con la clase base vacía y los estilos llegan después).
import styles from "./Timeline.module.css";

// --- Fixtures ---------------------------------------------------------------
// Personas e instituciones ficticias (constitución D4).
const ENTRY_CS: TimelineEntry = {
  id: "cs-degree",
  title: "B.Sc. in Computer Science",
  organization: "Northlake State University",
  start: "2012",
  end: "2017",
  description: "Focus on software engineering.",
};

const ENTRY_WAS: TimelineEntry = {
  id: "was-cert",
  title: "Web Accessibility Specialist",
  organization: "Example Accessibility Guild",
  start: "2018",
  // Rama end:null (RF-3 se conecta en T2; en T1 solo estructura).
  end: null,
  description: "Audits and remediation of public websites.",
};

// "Sin org/description": campos required del esquema con valor vacío (ver
// encabezado). start/end no afectan a T1 (el período se pinta en T2).
const ENTRY_BARE: TimelineEntry = {
  id: "bootcamp",
  title: "Frontend Bootcamp",
  organization: "",
  start: "2011",
  end: "2011",
  description: "",
};

const ENTRIES: readonly TimelineEntry[] = [ENTRY_CS, ENTRY_WAS, ENTRY_BARE];

// Props fijas de la spec → API: idPrefix de Education (fórmula RF-5) y las
// props que T2 consumirá, pasadas completas desde T1.
const ID_PREFIX = "edu";
const LOCALE: Locale = "en";
const PRESENT_LABEL = "Present";

const timelineClass = styles.timeline ?? "timeline";

// Render por defecto de la suite: los tres fixtures con la API completa;
// `overrides` permite variar `entries` (caso vacío) y `className` (unión).
const timeline = (
  overrides: Partial<Pick<TimelineProps, "entries" | "className">> = {},
) => (
  <Timeline
    entries={ENTRIES}
    locale={LOCALE}
    presentLabel={PRESENT_LABEL}
    idPrefix={ID_PREFIX}
    {...overrides}
  />
);

// --- T1 · RF-1: el <ol role="list"> ------------------------------------------
describe("Timeline list structure (T1: RF-1)", () => {
  it("renders an ol with an explicit role=list and one listitem per entry", () => {
    render(timeline());

    // RF-1: `<ol role="list">` — el `role` EXPLÍCITO se asiértá como
    // atributo (protege la semántica ante el quirk de `list-style: none` en
    // Safari/VoiceOver; no basta el rol implícito del <ol>). Un `listitem`
    // por entrada.
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(list).toHaveAttribute("role", "list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(ENTRIES.length);
  });
});

describe("Timeline item order (T1: RF-1)", () => {
  it("renders the items in data order with an h3 title per item", () => {
    render(timeline());

    // spec → Tests esperados 1 ("un listitem por entrada, en orden") +
    // "No hacer": el orden es el de los datos, el componente NO ordena.
    const listitems = screen.getAllByRole("listitem");
    const titles = listitems.map((listitem) =>
      within(listitem).getByRole("heading", { level: 3 }).textContent,
    );
    expect(titles).toEqual(ENTRIES.map((entry) => entry.title));
  });
});

// --- T1 · RF-2 + RF-5: article nombrado por su h3 con id por fórmula ---------
describe("Timeline article labelling (T1: RF-2, RF-5)", () => {
  it("wraps each item in an article labelled by its h3 carrying the fixed id formula", () => {
    render(timeline());

    // "Hecho cuando": cada `<article aria-labelledby>` apunta a SU `<h3>`
    // (nivel 3 fijo, spec → "No hacer": nunca h5) y el id sigue la fórmula
    // `${idPrefix}-${entry.id}-title` (RF-5). Se verifica por ítem:
    // aria-labelledby == fórmula, heading nivel 3 nombrado por el título
    // dentro del article, y el id del heading == el valor referenciado.
    screen.getAllByRole("listitem").forEach((listitem, index) => {
      const entry = ENTRIES[index];
      if (entry === undefined) {
        throw new Error(
          "listitem sin entrada correspondiente en el fixture (invariante)",
        );
      }

      const article = within(listitem).getByRole("article");
      const expectedId = `${ID_PREFIX}-${entry.id}-title`;
      expect(article).toHaveAttribute("aria-labelledby", expectedId);

      const heading = within(article).getByRole("heading", {
        level: 3,
        name: entry.title,
      });
      expect(heading.getAttribute("id")).toBe(
        article.getAttribute("aria-labelledby"),
      );
      expect(heading.getAttribute("id")).toBe(expectedId);
    });
  });
});

// --- T1 · RF-2: organization y description "si existen" -----------------------
describe("Timeline entry fields (T1: RF-2)", () => {
  it("shows organization and description when the entry has them", () => {
    render(timeline());

    // spec → Tests esperados 3 (parte sin período, que es de T2): el texto
    // de organización y descripción vive DENTRO del article de su ítem.
    const [firstItem, secondItem] = screen.getAllByRole("listitem");

    const firstArticle = within(firstItem).getByRole("article");
    expect(
      within(firstArticle).getByText(ENTRY_CS.organization),
    ).toBeInTheDocument();
    expect(
      within(firstArticle).getByText(ENTRY_CS.description),
    ).toBeInTheDocument();

    const secondArticle = within(secondItem).getByRole("article");
    expect(
      within(secondArticle).getByText(ENTRY_WAS.organization),
    ).toBeInTheDocument();
    expect(
      within(secondArticle).getByText(ENTRY_WAS.description),
    ).toBeInTheDocument();
  });

  it("does not render empty paragraphs for an entry without organization or description", () => {
    render(timeline());

    // RF-2 "si existen" adaptado al esquema (encabezado): campos required →
    // el fixture "sin org/description" usa valores vacíos; el componente no
    // pinta párrafos huecos. Query estructural justificada (T3): no hay
    // query por rol para la ausencia de <p> vacíos.
    const [, , bareItem] = screen.getAllByRole("listitem");
    const bareArticle = within(bareItem).getByRole("article");
    expect(bareArticle.querySelector("p:empty")).toBeNull();
    expect(
      within(bareArticle).getByRole("heading", {
        level: 3,
        name: ENTRY_BARE.title,
      }),
    ).toBeInTheDocument();
  });
});

// --- T1 · RF-1 (SI vacío): entries=[] → nada ----------------------------------
describe("Timeline empty entries (T1: RF-1)", () => {
  it("renders nothing when entries is empty", () => {
    // "Hecho cuando": container vacío; plan → Decisiones: `entries=[]` →
    // `null` (ni el <ol>: una lista vacía no aporta semántica).
    const { container } = render(timeline({ entries: [] }));
    expect(container).toBeEmptyDOMElement();
  });
});

// --- T1 · RF-5: ids sin colisión entre dos Timelines (Tests esperados 7) ------
describe("Timeline id prefixes (T1: RF-5, spec → Tests esperados 7)", () => {
  it("generates prefixed ids so two Timelines on the same page do not collide", () => {
    // MISMA entrada en dos listas con distinto idPrefix: la fórmula produce
    // ids diferentes (unicidad en el documento).
    render(
      <>
        <Timeline
          entries={[ENTRY_CS]}
          locale={LOCALE}
          presentLabel={PRESENT_LABEL}
          idPrefix="edu"
        />
        <Timeline
          entries={[ENTRY_CS]}
          locale={LOCALE}
          presentLabel={PRESENT_LABEL}
          idPrefix="exp"
        />
      </>,
    );

    expect(screen.getAllByRole("list")).toHaveLength(2);
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(2);
    const ids = headings.map((heading) => heading.getAttribute("id"));
    expect(ids).toEqual(["edu-cs-degree-title", "exp-cs-degree-title"]);
    expect(new Set(ids).size).toBe(2);
  });
});

// extra: unión de className al <ol> raíz — contrato de spec → API (G-B/#99)
// sin contrapartida en "Tests esperados"; ningún "Hecho cuando" de T2/T3 la
// reclama, así que se conecta y se testa en T1 (criterio NavTabs T1,
// ControlsBar/ThemeToggle/LanguageSwitcher T1).
describe("Timeline className joining (T1: spec → API, G-B)", () => {
  it("joins an external className to the base class on the root ol", () => {
    const consumerClass = "resume-education";

    render(timeline({ className: consumerClass }));

    // #99: la clase externa COEXISTE con la base (`timeline`) en el raíz
    // (no la reemplaza); rige la hoja de estilos, no el orden del atributo.
    const list = screen.getByRole("list");
    expect(list).toHaveClass(timelineClass);
    expect(list).toHaveClass(consumerClass);
  });
});

// El cierre `expectNoA11yViolations` del archivo (constitución T4) se agrega
// en `test(Timeline): T3` con la cobertura de RF-6/RF-7 (tasks.md;
// precedente LanguageSwitcher/ThemeToggle). Acá termina T1 a propósito.
