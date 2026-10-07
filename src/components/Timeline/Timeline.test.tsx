// Tests de T1 (specs/content/Timeline/tasks.md) — RF-1, RF-2, RF-5
// (estructura). "Hecho cuando" de T1: `getByRole("list")` con un `listitem`
// por entrada en orden; cada `<article aria-labelledby>` apunta a su `<h3>`
// (nivel 3, nombrado por el título) con id por la fórmula fija
// `${idPrefix}-${entry.id}-title` (RF-5); muestra `organization` y
// `description` si existen; `entries=[]` → `container` vacío.
//
// Diferidos: ninguno — T3 AGREGA el cierre `expectNoA11yViolations` del
// archivo al final (RF-6/RF-7 + constitución T4), verde on-arrival declarado
// bajo #101 (los estilos del módulo y las clases internas van por inspección:
// jsdom no carga hojas de estilo; el fixture de período de T2 ya no depende de
// ningún `<p>` hueco diferido). Precedente exacto LanguageSwitcher/ThemeToggle:
// el cierre nace en el último commit `test` de la pieza. Los asserts de T1/T2
// no se tocan: este commit solo agrega líneas de test.
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

// T3: helper de cierre a11y (constitución T4); import puro, no toca lo anterior
// (precedente Overhead T3).
import { expectNoA11yViolations } from "../../test/a11y";

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

    // RF-1: `<ol role="list">` — el `role` EXPLÍCITO se aserta como
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
    // de organización y descripción vive DENTRO del article de su ítem. El
    // article se busca por rol + nombre accesible (aria-labelledby → título):
    // así el nombre del article también queda cubierto acá.
    const firstArticle = screen.getByRole("article", {
      name: ENTRY_CS.title,
    });
    expect(
      within(firstArticle).getByText(ENTRY_CS.organization),
    ).toBeInTheDocument();
    expect(
      within(firstArticle).getByText(ENTRY_CS.description),
    ).toBeInTheDocument();

    const secondArticle = screen.getByRole("article", {
      name: ENTRY_WAS.title,
    });
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
    const bareArticle = screen.getByRole("article", {
      name: ENTRY_BARE.title,
    });
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

// --- Fixtures de T2 -----------------------------------------------------------
// Entradas NUEVAS (las de T1 no sirven acá: hacen falta rangos "YYYY-MM" y un
// `end: null` con `start` "YYYY" para los textos formateados y el presente).
// Personas e instituciones ficticias (constitución D4).
const T2_RANGE: TimelineEntry = {
  id: "ms-ai",
  title: "M.Sc. in Applied Intelligence",
  organization: "Riverton Technical Institute",
  start: "2019-03",
  end: "2021-11",
  description: "Machine learning track.",
};

const T2_OPEN: TimelineEntry = {
  id: "lead-fe",
  title: "Lead Frontend Developer",
  organization: "Example Digital Studio",
  // Rama end:null (RF-3) con start "YYYY" → texto "2015 — Actualidad".
  start: "2015",
  end: null,
  description: "Design systems and accessibility work.",
};

const T2_YEARS: TimelineEntry = {
  id: "doc-course",
  title: "Doctoral Coursework",
  organization: "Lakeside Graduate School",
  start: "2012",
  end: "2014",
  description: "Evening programme.",
};

// Render aislado de T2: UNA entrada con la API completa; `locale` y
// `presentLabel` (props tipadas sin conectar en T1) se conectan acá (RF-3/4).
const timelineT2 = ({
  entry,
  locale = "en",
  presentLabel = "Present",
}: {
  entry: TimelineEntry;
  locale?: Locale;
  presentLabel?: string;
}) => (
  <Timeline
    entries={[entry]}
    locale={locale}
    presentLabel={presentLabel}
    idPrefix="edu"
  />
);

// Query estructural JUSTIFICADA (plan → Estrategia de tests, test 6): `<time>`
// no tiene rol ARIA, así que no existe query por rol para los extremos del
// período; `querySelectorAll("time")` dentro del `article` (sí obtenido por
// rol + nombre accesible, T3 de la constitución) es la única alternativa y el
// plan del componente la admite explícitamente. `noUncheckedIndexedAccess`
// obliga a verificar cada extremo con throw de invariante (precedente T1: sin
// `!` ni `as`).
const periodTimes = (article: HTMLElement): HTMLTimeElement[] =>
  Array.from(article.querySelectorAll("time"));

const requireTime = (time: HTMLTimeElement | undefined): HTMLTimeElement => {
  if (time === undefined) {
    throw new Error(
      "el período debe envolver cada fecha en <time dateTime> (RF-4)",
    );
  }
  return time;
};

// --- T2 · RF-3, RF-4: período con <time> por extremo --------------------------
// "Hecho cuando" de T2 (tasks.md): rango → DOS `<time>` con `dateTime` igual a
// cada VALOR CRUDO del dato y texto formateado por `formatPeriodEndpoint`
// según `locale` (en/es; spec → Tests esperados 5 y 6); `end: null` → UN
// `<time>` + `presentLabel` como TEXTO (RF-3; Accesibilidad: "Present es
// texto"); separador fijo `" — "` del contrato de `foundations/i18n.md`,
// visible en el `textContent` del `<p>`. La parte "sin strings compuestas
// parseadas" (RF-4) se verifica por INSPECCIÓN del `Timeline.tsx` (#101):
// importa `formatPeriodEndpoint` y nunca `formatPeriod` ni `Intl`; no es
// discriminate-testable desde el DOM y no se agrega test artificial.
describe("Timeline period with time per endpoint (T2: RF-3, RF-4)", () => {
  it("renders two time elements with raw datetime, en-formatted text and the fixed separator", () => {
    render(timelineT2({ entry: T2_RANGE }));

    const article = screen.getByRole("article", { name: T2_RANGE.title });
    const times = periodTimes(article);
    if (times.length !== 2) {
      throw new Error(
        `un rango debe renderizar exactamente dos <time> (RF-4, Tests esperados 6); se encontraron ${times.length}`,
      );
    }
    const start = requireTime(times[0]);
    const end = requireTime(times[1]);

    // RF-4: `dateTime` = valor CRUDO del dato (no el texto formateado).
    expect(start).toHaveAttribute("datetime", "2019-03");
    expect(end).toHaveAttribute("datetime", "2021-11");
    // Test 5: texto de cada extremo formateado con `formatPeriodEndpoint`
    // para `locale="en"`.
    expect(start.textContent).toBe("Mar 2019");
    expect(end.textContent).toBe("Nov 2021");

    // El separador `" — "` va ENTRE los dos `<time>` (Anatomía): es un nodo de
    // texto del `<p>` (sin rol), se verifica por su textContent completo.
    const period = start.parentElement;
    if (period === null) {
      throw new Error("cada <time> debe vivir en el <p class=period> (Anatomía)");
    }
    expect(period.tagName).toBe("P");
    expect(period.textContent).toBe("Mar 2019 — Nov 2021");
  });

  it("formats both endpoints for the es locale (spec → Tests esperados 5)", () => {
    render(
      timelineT2({ entry: T2_RANGE, locale: "es", presentLabel: "Actualidad" }),
    );

    const article = screen.getByRole("article", { name: T2_RANGE.title });
    const times = periodTimes(article);
    if (times.length !== 2) {
      throw new Error(
        `un rango debe renderizar exactamente dos <time> (RF-4, Tests esperados 6); se encontraron ${times.length}`,
      );
    }
    const start = requireTime(times[0]);
    const end = requireTime(times[1]);

    // El `locale` SOLO cambia el texto formateado; `dateTime` sigue crudo.
    expect(start).toHaveAttribute("datetime", "2019-03");
    expect(start.textContent).toBe("mar 2019");
    expect(end.textContent).toBe("nov 2021");
    expect(start.parentElement?.textContent).toBe("mar 2019 — nov 2021");
  });

  it("renders a single time and the present label as plain text when end is null (RF-3, spec → Tests esperados 4 y 6)", () => {
    render(
      timelineT2({ entry: T2_OPEN, locale: "es", presentLabel: "Actualidad" }),
    );

    const article = screen.getByRole("article", { name: T2_OPEN.title });
    const times = periodTimes(article);
    // Un solo `<time>`: el presente NO se envuelve en `<time>` (RF-3;
    // Accesibilidad: "Present es texto").
    expect(times).toHaveLength(1);
    const start = requireTime(times[0]);

    expect(start).toHaveAttribute("datetime", "2015");
    expect(start.textContent).toBe("2015");
    // "Actualidad" queda como texto del `<p>` (el único `<time>` solo
    // contiene "2015", así el resto del texto es necesariamente fuera de él).
    expect(start.parentElement?.textContent).toBe("2015 — Actualidad");
  });

  it("keeps bare YYYY values unchanged in datetime and text (RF-4)", () => {
    render(timelineT2({ entry: T2_YEARS }));

    const article = screen.getByRole("article", { name: T2_YEARS.title });
    const times = periodTimes(article);
    if (times.length !== 2) {
      throw new Error(
        `un rango debe renderizar exactamente dos <time> (RF-4, Tests esperados 6); se encontraron ${times.length}`,
      );
    }
    const start = requireTime(times[0]);
    const end = requireTime(times[1]);

    // "YYYY" sin mes: `formatPeriodEndpoint` lo devuelve tal cual (RF-8 de
    // foundations/i18n.md): dateTime Y texto son el año.
    expect(start).toHaveAttribute("datetime", "2012");
    expect(start.textContent).toBe("2012");
    expect(end).toHaveAttribute("datetime", "2014");
    expect(end.textContent).toBe("2014");
    expect(start.parentElement?.textContent).toBe("2012 — 2014");
  });
});

// ============================================================================
// Tests de T3 (specs/content/Timeline/tasks.md) — cierre a11y de la pieza
// (spec → Tests esperados 9; constitución T4: el archivo termina con este
// caso) y covering check de RF-6/RF-7.
//
// #101 VERDE ON-ARRIVAL DECLARADO (encargo de T3; criterio Sidebar T6 /
// NavTabs T4): T3 agrega al módulo la tabla "Estilos y tokens" completa (lista,
// ítem, punto `::before`, `:last-child`, título, organización, descripción),
// las clases de la Anatomía en el TSX y `index.ts` — nada de eso es
// discriminate-testable en jsdom: las hojas de estilo no se cargan y fabricar
// un rojo leyendo el CSS como texto está explícitamente descartado (#101). El
// markup ya era accesible desde T1/T2 (roles, nombres, ids y `aria-*`
// asertados allí); el valor de este cierre es la regresión futura sobre la
// lista completa. Se inspeccionan (reviewer + QA F5): lista con
// `list-style: none` + `margin: 0` + padding-left calc(--size-timeline-dot / 2
// + --timeline-dot-ring); ítem con `position: relative`, `border-left` con
// --timeline-line-width/--color-track y padding con --timeline-indent/--space-6
// (RF-7: sangría por token, cero `@media` propios); punto `::before` centrado
// sobre la línea (left calc, top --timeline-dot-top, --size-timeline-dot,
// --timeline-dot-ring, --color-accent, halo --color-track); `:last-child` con
// `border-left-color: transparent` + `padding-bottom: 0` (RF-6: corte
// posicional, no por contenido); título con --font-size-h4 y
// top calc(--timeline-title-shift * -1).
//
// Fixture: DOS entradas — un rango (`T2_RANGE`) y un `end: null` (`T2_OPEN`) —
// que cubren ambas ramas del período en la lista completa. Sin defs SVG: la
// pieza no monta Icon `tone="gradient"` ni HexAvatar (plan → Estrategia:
// render aislado con props fixture).
// ============================================================================

describe("Timeline accessibility audit (T3: spec → Tests esperados 9)", () => {
  it("has no accessibility violations with the full timeline (range and open end)", async () => {
    // Constitución T4: axe sobre el componente completo — <ol role="list"> con
    // <li><article aria-labelledby> por entrada, <time> por extremo y
    // presentLabel como texto (el último ítem, sin línea por :last-child).
    const { container } = render(
      <Timeline
        entries={[T2_RANGE, T2_OPEN]}
        locale={LOCALE}
        presentLabel={PRESENT_LABEL}
        idPrefix="edu"
      />,
    );

    await expectNoA11yViolations(container);
  });
});
