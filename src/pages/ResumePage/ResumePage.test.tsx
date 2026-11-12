// Tests de T1 (specs/pages/ResumePage/tasks.md) — RF-1, RF-2 (columns) y
// RF-5: un único `h1` con `t.resume.title` (spec → Tests esperados 1), las
// regiones `t.resume.education` y `t.resume.experience` con un `listitem` por
// entrada del kit (spec → Tests esperados 2) y el escenario `locale = "es"`
// con textos de `ui.es` y contenido de `cv.es` (spec → Tests esperados 7).
// Diferidos a sus tareas: skills (tests 3 y 6, T3), `presentLabel` con mock y
// columnas vacías (tests 4 y 5, T2), módulo CSS con el layout de la tabla
// "Estilos y tokens" + unión `className` (test 9) + cierre
// `expectNoA11yViolations` (test 8) (T4, constitución T4).
//
// Wrapper (plan → Estrategia de tests): `LocaleProvider` REAL con el contenido
// de ejemplo del kit y armazón `AccentGradientDefs` (los `SectionTitle` con
// `icon` de las ResumeSection montan IconBox→Icon `tone="gradient"`; spec →
// Tests esperados: "no necesitan HexAvatarDefs ni ThemeProvider"). El armazón
// va DESPUÉS del componente, mismo criterio de andamiaje que AboutPage (T4):
// `container.firstElementChild` sigue apuntando al raíz de la página si un
// test futuro lo usa como criterio estructural (ningún assert lo necesita hoy;
// el raíz se localiza por el padre del `h1`). Sin semilla de `lang`:
// `readInitialLocale` cae en DEFAULT_LOCALE "en" (i18n.md → "Resolución del
// idioma inicial"); el escenario `es` siembra `document.documentElement.lang`
// ANTES del render, patrón exacto de AboutPage test 6 / LanguageSwitcher T2, y
// el `afterEach` de `src/test/setup.ts` limpia `lang`/storage entre tests.
//
// Justificación de las queries (constitución T3): `h1` por rol + nivel +
// nombre con `getAllByRole("heading", { level: 1 })` longitud 1 (test 1
// literal); regiones por rol + nombre (`t.resume.*` de `uiEn`/`uiEs`, sin
// literales); `listitem` y `h3` con `within(region)` — los nombres de los `h3`
// salen de las entradas del MISMO `cvByLocale` que sirve el provider (C3) y su
// orden igualado al de los datos verifica RF-5 "sin ordenar" observablemente
// (la inspección del código la hace el reviewer; el assert de orden la
// refuerza). La hermandad región→`.columns`→raíz y el `h1` primero se
// verifican por estructura (el módulo CSS y sus clases hasheadas llegan en
// T4; los asserts de clases con el canon #99 `styles.x ?? "x"` también,
// precedente AboutPage T4).
//
// El mock de contenido (patrón AboutPage T2: `vi.mock` del módulo de providers
// con `importOriginal`) se conecta en T2 con los escenarios `end: null` y
// colecciones vacías; en T1 no hace falta: ninguna rama lo necesita.

import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AccentGradientDefs } from "../../components/Icon";
import { cvByLocale } from "../../content";
import { uiEn } from "../../i18n/ui.en";
import { uiEs } from "../../i18n/ui.es";
import { LocaleProvider } from "../../providers/LocaleProvider";

import { ResumePage } from "./ResumePage";

// Cierre a11y de T4 (constitución T4; helper de src/test/a11y.ts).
import { expectNoA11yViolations } from "../../test/a11y";

// El test importa el módulo CSS solo para fijar los nombres REALES de las
// clases base (`page`/`columns`, resueltas por CSS Modules en runtime) y
// asiértalas con el canon #99 `styles.x ?? "x"` (menor registrada en la
// aprobación de T1 de AboutPage, aplicada igual acá; precedente exacto
// AboutPage.test.tsx T4 y LanguageSwitcher.test.tsx). El módulo no existe
// hasta `feat(ResumePage): T4`: el import pone el archivo entero en rojo en
// colecta (rojo declarado en el commit de tests, ídem AboutPage T4).
import styles from "./ResumePage.module.css";

// Valores esperados desde las FUENTES del kit (C3): el contenido que la página
// debe mostrar sale de `useCv()` —el mismo `cvByLocale.en` que sirve el
// provider— y los títulos de `uiEn.resume.*` (el `t` del provider); el test
// los importa para no copiar literales del contenido.
const RESUME_TITLE = uiEn.resume.title;
const EDUCATION = cvByLocale.en.education;
const EXPERIENCE = cvByLocale.en.experience;

// Clases base canon #99 (el módulo resuelve nombres hasheados en runtime; el
// `?? "x"` cubre el escenario sin módulo en otras herramientas).
const PAGE_CLASS = styles.page ?? "page";
const COLUMNS_CLASS = styles.columns ?? "columns";

// Render del escenario por defecto. T4: `className` opcional — la pasa solo
// el test 9 (unión G-B en el raíz); los demás call-sites la dejan undefined
// (React omite el atributo) y el andamiaje no cambia nada más: el raíz de la
// página sigue siendo `container.firstElementChild` (los defs van DESPUÉS).
const renderResumePage = (className?: string) =>
  render(
    <LocaleProvider>
      <ResumePage className={className} />
      <AccentGradientDefs />
    </LocaleProvider>,
  );

describe("ResumePage unique h1 with t.resume.title (T1: RF-1, Tests 1)", () => {
  it("renders exactly one level-1 heading named with t.resume.title", () => {
    renderResumePage();

    // Test 1 de la spec / RF-1: `getAllByRole("heading", { level: 1 })` de
    // longitud 1 (un único h1 en el panel) y ese h1 lleva por nombre
    // accesible `t.resume.title` (la página pasa el texto de `t`, nunca lo
    // hardcodea).
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: RESUME_TITLE }),
    ).toBeInTheDocument();
  });
});

describe("ResumePage education and experience regions (T1: RF-2 columns, RF-5, Tests 2)", () => {
  // Secciones esperadas: nombre (t.resume.*), entradas (cv.education /
  // cv.experience) e id derivado por ResumeSection (fórmula fija
  // `resume-${id}-title`, RF-3 de su spec — la página fija el `id` por la
  // Anatomía: "education"/"experience").
  const SECTIONS = [
    {
      name: uiEn.resume.education,
      entries: EDUCATION,
      titleId: "resume-education-title",
    },
    {
      name: uiEn.resume.experience,
      entries: EXPERIENCE,
      titleId: "resume-experience-title",
    },
  ];

  it("renders a named region per timeline with one listitem per entry, in data order", () => {
    // Invariante del escenario (criterio AboutPage T1/T2): si el kit viniera
    // sin entradas, el test sería vacío y no discriminaría nada; se frena acá
    // y se reporta, no se relaja la aserción. (T1 monta ambas columnas; la
    // rama vacía es el test 5, tarea T2.)
    if (EDUCATION.length === 0 || EXPERIENCE.length === 0) {
      throw new Error(
        "el contenido de ejemplo del kit debe traer education y experience no vacías (test 2 de la spec no puede correr vacío)",
      );
    }

    renderResumePage();

    for (const section of SECTIONS) {
      // RF-2/RF-1 jerarquía: la región con nombre accesible `t.resume.*` es
      // la `<section>` de ResumeSection, nombrada por su `h2` vía
      // `aria-labelledby` ↔ id. Se asiértan ambos extremos del vínculo, no
      // solo el nombre computado (criterio AboutPage test 3).
      const region = screen.getByRole("region", { name: section.name });
      expect(region.tagName).toBe("SECTION");
      expect(region).toHaveAttribute("aria-labelledby", section.titleId);

      const heading = screen.getByRole("heading", {
        level: 2,
        name: section.name,
      });
      expect(heading).toHaveAttribute("id", section.titleId);
      expect(region).toContainElement(heading);

      // RF-2: un `listitem` por entrada dentro de la lista del Timeline
      // (anatomía Timeline: `<ol role="list">` con un `<li>` por entrada).
      const list = within(region).getByRole("list");
      const items = within(region).getAllByRole("listitem");
      expect(items).toHaveLength(section.entries.length);
      for (const item of items) {
        expect(item.parentElement).toBe(list);
        // Cada `<li>` lleva el `<article>` de su entrada (anatomía Timeline;
        // jerarquía RF-1: h1 → h2 → h3 dentro del article).
        expect(within(item).getByRole("article")).toBeInTheDocument();
      }

      // RF-5 "sin ordenar" (verificable en DOM): los `h3` de los ítems
      // aparecen con los títulos de las entradas y EN el orden de los datos.
      const itemHeadings = within(region).getAllByRole("heading", {
        level: 3,
      });
      expect(itemHeadings.map((headingEl) => headingEl.textContent)).toEqual(
        section.entries.map((entry) => entry.title),
      );
    }

    // Anatomía: ambas `<section>` son hermanas directas de UN único div
    // (`.columns`). T4 conecta el módulo y agrega los asserts de clase con el
    // canon #99 (menor registrada de T1): la estructura queda intacta.
    const educationRegion = screen.getByRole("region", {
      name: uiEn.resume.education,
    });
    const experienceRegion = screen.getByRole("region", {
      name: uiEn.resume.experience,
    });
    const columns = educationRegion.parentElement;
    if (columns === null) {
      throw new Error("las <section> deben colgar del bloque .columns (Anatomía)");
    }
    expect(columns.tagName).toBe("DIV");
    expect(columns).toHaveClass(COLUMNS_CLASS);
    expect(experienceRegion.parentElement).toBe(columns);
    expect(columns.children).toHaveLength(2);
    // T5 (#114, cambio de spec aprobado): una sola columna con Experience
    // primero; el orden es del DOM (lectura y foco = orden visual).
    expect(columns.firstElementChild).toBe(experienceRegion);
    expect(columns.lastElementChild).toBe(educationRegion);

    // El bloque .columns cuelga del raíz `div.page` y el `h1` sigue siendo su
    // PRIMER hijo (RF-1/RF-6: flujo de bloque para que el h1 fluya junto a la
    // solapa flotante de NavTabs).
    const pageRoot = columns.parentElement;
    if (pageRoot === null) {
      throw new Error(".columns debe ser hijo del raíz .page (Anatomía)");
    }
    expect(pageRoot.tagName).toBe("DIV");
    expect(pageRoot).toHaveClass(PAGE_CLASS);
    const h1 = screen.getByRole("heading", { level: 1, name: RESUME_TITLE });
    expect(h1.parentElement).toBe(pageRoot);
    expect(pageRoot.firstElementChild).toBe(h1);
  });
});

describe("ResumePage in Spanish locale (T1: Tests 7, real LocaleProvider seeded es)", () => {
  it("shows the ui.es interface strings and the cv.es content when the active locale is es", () => {
    // Invariante: el cv.es del kit trae ambas colecciones y al menos un
    // título de entrada DISTINTO del inglés; sin ese diff el assert de
    // contenido no discriminaría qué cv se renderizó.
    if (cvByLocale.es.education.length === 0 || cvByLocale.es.experience.length === 0) {
      throw new Error(
        "el contenido de ejemplo del kit debe traer education y experience en cv.es para el test 7",
      );
    }
    const esEntries = [...cvByLocale.es.education, ...cvByLocale.es.experience];
    const enTitles = new Set(
      [...EDUCATION, ...EXPERIENCE].map((entry) => entry.title),
    );
    if (!esEntries.some((entry) => !enTitles.has(entry.title))) {
      throw new Error(
        "los títulos de education/experience de cv.es deben diferir de los de cv.en al menos en uno para que el test 7 discrimine el contenido",
      );
    }

    // Semilla anti-flash (precedente AboutPage test 6 / LanguageSwitcher T2):
    // `lang="es"` en <html> ANTES del render; `readInitialLocale` lee solo
    // ese atributo y el provider resuelve `uiEs` + `cvByLocale.es`. El
    // afterEach de setup.ts limpia `lang`/storage.
    document.documentElement.lang = "es";
    renderResumePage();
    expect(document.documentElement).toHaveAttribute("lang", "es");

    // Textos de UI desde uiEs (sin literales): h1 `resume.title` único,
    // regiones `resume.education` y `resume.experience`.
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: uiEs.resume.title }),
    ).toBeInTheDocument();

    const sectionsEs = [
      { name: uiEs.resume.education, entries: cvByLocale.es.education },
      { name: uiEs.resume.experience, entries: cvByLocale.es.experience },
    ];
    for (const section of sectionsEs) {
      const region = screen.getByRole("region", { name: section.name });

      // Contenido desde cv.es: un `listitem` por entrada del cv en español…
      expect(within(region).getAllByRole("listitem")).toHaveLength(
        section.entries.length,
      );

      // …y los `h3` con los títulos españoles en el orden de los datos
      // (discrimina que `useCv()` devolvió el cv del locale activo, no el
      // inglés; los títulos difieren — invariante arriba).
      expect(
        within(region)
          .getAllByRole("heading", { level: 3 })
          .map((headingEl) => headingEl.textContent),
      ).toEqual(section.entries.map((entry) => entry.title));
    }
  });
});

// ===========================================================================
// Tests de T2 (specs/pages/ResumePage/tasks.md) — RF-7 y RF-2 (vacíos): test 4
// de la spec (contenido MOCKEADO con una entrada `"end": null`, sin depender
// del fixture: el panel muestra `t.timeline.present`) y test 5 en dos
// escenarios (con `education: []` no existe esa región y Experience sigue
// presente; con ambas colecciones vacías no existe ninguna de las dos regiones
// y el `h1` sigue presente — la ausencia de `.columns` por inspección del
// markup: se asiértá que el raíz NO tiene ningún `<div>` hijo directo, no que
// el h1 sea su único hijo, porque la sección de skills de T3 cuelga del raíz
// como `<section>` y un assert de "único hijo" sería inválido mañana
// — patrón T2b/T3b evitado a propósito).
// Mock: MISMO mecanismo que AboutPage T2/T3 (`vi.mock` del módulo de providers
// con `importOriginal` + `vi.hoisted` como estado mutable del escenario,
// delegando siempre en el `useCv` REAL y aplicando la variante solo con el
// escenario armado; `LocaleProvider`/`useLocale` conservados vía el spread de
// `actual`). Cada archivo de test usa su propio mock (no se comparte entre
// archivos): los tests de T1 de arriba corren con el escenario "real" por
// defecto (el outer `beforeEach` resetea) y su comportamiento no cambia: el
// override delega en el hook real.
// Entrada del test 4: construida en el propio override como COPIA MODIFICADA
// de una base del kit (`{ ...cv.education[0], end: null }`, tipo
// `TimelineEntry` del generated — sin literales del JSON a mano), con
// `experience: []` de acompañamiento para que la región asertada sea solo la
// de education.
// Verde on-arrival declarado en el cuerpo del commit (#101): el TEST 4 y el
// 5a — la página ya reenvía `presentLabel` y ya guarda cada columna por su
// colección desde T1; su discrimen es FUTURO: el 4 protege el reenvío de RF-7
// (una pérdida de `presentLabel` o un `cv.locale` en lugar de `locale` lo
// rompen) y prueba que el override rigió (el kit trae 2 entradas de education;
// la región con el mock tiene que traer EXACTAMENTE 1 `listitem`); el 5a
// protege la rama RF-2 de education vacía. El ROJO del commit lo pone el 5b:
// hoy la página monta `.columns` incluso con ambas colecciones vacías y el
// assert "raíz sin <div> hijo" falla hasta `feat(ResumePage): T2`.
// ===========================================================================

interface ResumeCvHarness {
  scenario:
    | "real"
    | "presentNull"
    | "educationEmpty"
    | "columnsEmpty"
    // T3 (test 6): mismo mecanismo para vaciar `skills`.
    | "skillsEmpty";
}

const cvHarness = vi.hoisted((): ResumeCvHarness => ({
  scenario: "real",
}));

vi.mock("../../providers/LocaleProvider", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../providers/LocaleProvider")>();
  return {
    ...actual,
    // "real" (default): delega en el `useCv` REAL del contexto del
    // LocaleProvider de verdad; los escenarios de T2 devuelven el cv real del
    // locale activo con las variantes fijadas en el propio override.
    useCv: () => {
      const cv = actual.useCv();
      if (cvHarness.scenario === "presentNull") {
        const base = cv.education[0];
        if (base === undefined) {
          throw new Error(
            "el cv del locale activo debe traer al menos una entrada de education para el escenario del test 4",
          );
        }
        // Copia modificada de la base del kit: única entrada con `end: null`
        // (RF-7 sin depender del fixture) y experience vacía.
        return { ...cv, education: [{ ...base, end: null }], experience: [] };
      }
      if (cvHarness.scenario === "educationEmpty") {
        return { ...cv, education: [] };
      }
      if (cvHarness.scenario === "columnsEmpty") {
        return { ...cv, education: [], experience: [] };
      }
      if (cvHarness.scenario === "skillsEmpty") {
        return { ...cv, skills: [] };
      }
      return cv;
    },
  };
});

// Escenario por defecto de cada test: "real" (cv completo del kit). Vitest
// corre el beforeEach outer ANTES del inner, así que los describes pueden
// armar su escenario tranquilo. Sin afterEach: este propio beforeEach
// re-setea el estado cada vez.
beforeEach(() => {
  cvHarness.scenario = "real";
});

describe("ResumePage presentLabel forwarded to an open-ended entry (T2: RF-7, Tests 4, mocked provider)", () => {
  beforeEach(() => {
    cvHarness.scenario = "presentNull";
  });

  it("shows t.timeline.present for the mocked end:null entry, proving the label travels through the page", () => {
    // Invariante: el kit trae education no vacía (la base modificada del
    // override sale de ahí) y trae MAS de una entrada: con una sola, el
    // assert de `listitem` longitud 1 no discriminaría el mock.
    if (EDUCATION.length < 2) {
      throw new Error(
        "el contenido de ejemplo del kit debe traer al menos DOS entradas de education para que el escenario mockeado (1 listitem) del test 4 discrimine",
      );
    }

    renderResumePage();

    // RF-7: la página reenvía `t.timeline.present` como `presentLabel` y el
    // Timeline de la sección lo muestra como TEXTO con `end: null` (su RF-3).
    // El nombre de la región sigue saliendo de `t.resume.education`.
    // `exact: false` justificado: el `<p>` del período arma el texto mixto
    // "2012 — Present" (nodo `<time>` + literales de texto hermanos;
    // precedente Timeline.test.tsx aserta el textContent compuesto), así que
    // el `getByText` exacto no matchea ningún elemento. Con substring el único
    // candidato es el `<p>` del período (el matcher de texto de RTL evalúa el
    // texto PROPIO de cada elemento, sin los de sus hijos).
    const region = screen.getByRole("region", {
      name: uiEn.resume.education,
    });
    expect(
      within(region).getByText(uiEn.timeline.present, { exact: false }),
    ).toBeInTheDocument();

    // El override rigió (no es el fixture): UNA sola entrada — la copia con
    // `end: null` — y Experience fue vaciada (su región no existe).
    expect(within(region).getAllByRole("listitem")).toHaveLength(1);
    expect(
      screen.queryByRole("region", { name: uiEn.resume.experience }),
    ).not.toBeInTheDocument();

    // El `h1` sigue presente y único en el escenario mockeado.
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});

describe("ResumePage with education empty (T2: RF-2, Tests 5, mocked provider)", () => {
  beforeEach(() => {
    cvHarness.scenario = "educationEmpty";
  });

  it("renders no education region while Experience stays present and the h1 remains the only one", () => {
    // Invariante (criterio T1/T2): el escenario solo discrimina si el kit trae
    // ambas colecciones llenas.
    if (EDUCATION.length === 0 || EXPERIENCE.length === 0) {
      throw new Error(
        "el contenido de ejemplo del kit debe traer education y experience no vacías para que el escenario 5a discrimine",
      );
    }

    renderResumePage();

    // RF-2: "SI un conjunto está vacío, ENTONCES no aparece su columna".
    expect(
      screen.queryByRole("region", { name: uiEn.resume.education }),
    ).not.toBeInTheDocument();
    const experienceRegion = screen.getByRole("region", {
      name: uiEn.resume.experience,
    });
    expect(experienceRegion).toBeInTheDocument();

    // .columns sigue montado con la ÚNICA columna presente (Anatomía; el
    // ancho completo en ≥ md es de inspección CSS, RF-3/T4).
    const columns = experienceRegion.parentElement;
    if (columns === null) {
      throw new Error(
        "la <section> de experience debe colgar del bloque .columns (Anatomía)",
      );
    }
    expect(columns.tagName).toBe("DIV");
    expect(columns.children).toHaveLength(1);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});

describe("ResumePage with education and experience both empty (T2: RF-2, Tests 5, mocked provider)", () => {
  beforeEach(() => {
    cvHarness.scenario = "columnsEmpty";
  });

  it("renders no timeline regions, no columns container, and keeps the unique h1", () => {
    // Invariante: ambas colecciones llenas en el kit (sin esto el escenario
    // vacío no discriminaría nada).
    if (EDUCATION.length === 0 || EXPERIENCE.length === 0) {
      throw new Error(
        "el contenido de ejemplo del kit debe traer education y experience no vacías para que el escenario 5b discrimine",
      );
    }

    renderResumePage();

    // RF-2: ninguna de las dos regiones existe…
    expect(
      screen.queryByRole("region", { name: uiEn.resume.education }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: uiEn.resume.experience }),
    ).not.toBeInTheDocument();

    // …y "SI ambos están vacíos, no renderiza `.columns`" — inspección del
    // markup generado: el raíz NO tiene ningún `<div>` hijo directo (no
    // asértamos "el h1 es el único hijo" porque la sección de skills de T3
    // cuelga del raíz como `<section>` y un assert de hijos totales sería
    // inválido mañana — patrón T2b/T3b evitado a propósito).
    const h1 = screen.getByRole("heading", { level: 1, name: RESUME_TITLE });
    const pageRoot = h1.parentElement;
    if (pageRoot === null) {
      throw new Error("el h1 debe ser hijo del raíz .page (Anatomía)");
    }
    expect(pageRoot.querySelectorAll(":scope > div")).toHaveLength(0);

    // El `h1` sigue presente y único.
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});

// ===========================================================================
// Tests de T3 (specs/pages/ResumePage/tasks.md) — RF-4: test 3 de la spec (la
// `<section aria-labelledby="resume-skills-title">` de skills es región
// nombrada por su `h2` (SectionTitle con ese id, Anatomía literal) y contiene
// el `SkillList` — un `list` nombrado vía `labelledBy` con un `listitem` por
// skill, en el orden de los datos (RF-5 de la página: sin ordenar)—) y test 6
// (con `skills: []` por mock la región no existe). El mock usa el HARNESS ya
// existente del archivo (escenario nuevo `skillsEmpty` = `{ ...cv real,
// skills: [] }`; reset en el outer `beforeEach`).
// Criterias de jsdom/RTL: el `<ul>` de SkillList expone el rol implícito
// `list` sin necesidad de `role` explícito (a diferencia de Timeline, que fija
// `role="list"` por el quirk de `list-style: none` — decisión 13 de esa pieza,
// consumidor: queries por rol canónicas); los chips son `Badge as="li"` →
// `listitem`. El `labelledBy` de SkillList queda asertado en el extremo de la
// LISTA (además del `<section>` y del `h2`): tres nodos apuntan al mismo id
// (Anatomía).
// Convive con el assert 5b de T2: la región de skills es `<section>` (no
// `<div>`) hija del raíz, así que "raíz sin <div> hijo directo" sigue siendo
// discriminatorio de `.columns` y se verifica al correr el suite completo.
// Verde on-arrival declarado en el cuerpo del commit (#101): el TEST 6 — antes
// del feat la página no renderiza skills, así que la ausencia ya se cumple;
// su discrimen es FUTURO: protege la rama RF-4 ("SI está vacío, ENTONCES no la
// renderiza") contra montar el `<section>`+`h2` con la colección vacía (el
// SkillList devolvería null pero la región nombrada existiría y este test la
// cazaría). El ROJO del commit lo pone el test 3 (la región no existe todavía).
// ===========================================================================

// Esperados desde las FUENTES del kit (C3): el título de `uiEn.resume.skills`
// y las skills del mismo `cvByLocale.en` que sirve el provider.
const SKILLS_TITLE = uiEn.resume.skills;
const SKILLS = cvByLocale.en.skills;

describe("ResumePage skills region (T3: RF-4, Tests 3)", () => {
  it("renders a region named by t.resume.skills with one labelled list and one listitem per skill in data order", () => {
    // Invariante del escenario (criterio T1/T2): sin skills en el kit el test
    // sería vacío y no discriminaría nada; se frena y se reporta.
    if (SKILLS.length === 0) {
      throw new Error(
        "el contenido de ejemplo del kit debe traer skills en cv.skills (test 3 de la spec no puede correr vacío)",
      );
    }

    renderResumePage();

    // Test 3 / RF-4: región nombrada por `t.resume.skills`. Anatomía literal:
    // `<section aria-labelledby="resume-skills-title">` + `SectionTitle
    // as="h2" id="resume-skills-title"` — se asiértan ambos extremos del
    // vínculo (criterio test 2/3 de AboutPage).
    const region = screen.getByRole("region", { name: SKILLS_TITLE });
    expect(region.tagName).toBe("SECTION");
    expect(region).toHaveAttribute("aria-labelledby", "resume-skills-title");

    const heading = screen.getByRole("heading", { level: 2, name: SKILLS_TITLE });
    expect(heading).toHaveAttribute("id", "resume-skills-title");
    expect(region).toContainElement(heading);

    // El SkillList dentro de la región: `<ul>` (rol implícito `list`) nombrado
    // por el MISMO id vía `labelledBy` (prop de su API) y un `listitem` por
    // skill, en el orden de los datos (RF-5: la página no ordena; RF-1 de
    // SkillList: su map sin sort).
    const list = within(region).getByRole("list");
    expect(list).toHaveAttribute("aria-labelledby", "resume-skills-title");

    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(SKILLS.length);
    expect(items.map((item) => item.textContent)).toEqual(SKILLS);

    // Anatomía: la región de skills es HIJA DIRECTA del raíz `.page` (no vive
    // dentro de `.columns`), debajo de las columnas.
    const pageRoot = region.parentElement;
    if (pageRoot === null) {
      throw new Error(
        "la <section> de skills debe ser hijo del raíz .page (Anatomía)",
      );
    }
    expect(pageRoot.tagName).toBe("DIV");
    const h1 = screen.getByRole("heading", { level: 1, name: RESUME_TITLE });
    expect(pageRoot.firstElementChild).toBe(h1);
    // Education/experience van ANTES que skills (spec → Responsive: "Skills
    // siempre a ancho completo, debajo"): el hijo previo a la región de skills
    // es el bloque .columns.
    const columns = pageRoot.querySelector(":scope > div");
    if (columns === null) {
      throw new Error(".columns debe seguir montado con el contenido real (Anatomía)");
    }
    expect(region.previousElementSibling).toBe(columns);
  });
});

describe("ResumePage with empty skills (T3: RF-4, Tests 6, mocked provider)", () => {
  beforeEach(() => {
    cvHarness.scenario = "skillsEmpty";
  });

  it("renders no skills region nor its h2 when skills is empty", () => {
    // Freno anti-test-vacío (criterio 5a/5b): con skills ya vacías en el kit
    // el escenario mockeado no discriminaría nada.
    if (SKILLS.length === 0) {
      throw new Error(
        "el contenido de ejemplo del kit debe traer skills para que el escenario vacío (test 6) discrimine",
      );
    }

    renderResumePage();

    // RF-4: "SI está vacío, ENTONCES no la renderiza" — ni la región ni el h2
    // (la <section> entera no se monta; no alcanza con que SkillList devuelva
    // null: sin el guard de la página quedaría una región nombrada vacía).
    expect(
      screen.queryByRole("region", { name: SKILLS_TITLE }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 2, name: SKILLS_TITLE }),
    ).not.toBeInTheDocument();

    // El mock es quirúrgico: solo vacía `skills` — las columnas de timelines
    // (contenido real del kit) siguen montadas y el h1 sigue único.
    expect(
      screen.getByRole("region", { name: uiEn.resume.education }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: uiEn.resume.experience }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});

// ===========================================================================
// Tests de T4 (specs/pages/ResumePage/tasks.md) — RF-3 y RF-6 por INSPECCIÓN
// del módulo (jsdom no computa estilos: el grid ≥ md, la cláusula
// `grid-column: 1 / -1` del hijo único y el flujo de bloque del raíz se
// verifican a mano + QA F5, lo declara la spec) y por tests: test 9 (unión
// `className` del consumidor en el raíz `.page`, G-B — canon #99: base y
// externa COEXISTEN, precedente AboutPage test 8 / LanguageSwitcher) y test 8
// (cierre `expectNoA11yViolations` en escenario completo; la spec dice "sin
// violaciones" a secas: un solo caso `en` basta — el escenario `es` no añade
// forma DOM propia, solo strings, y su jerarquía/regiones ya están cubiertas
// por los asserts de roles). Además T4 sumó los asserts de clases
// `.page`/`.columns` con el canon en el test 2 de T1 (adición pura, menor
// registrada) y el parámetro `className` del helper (andamiaje).
// Rojo del commit (#101, ídem AboutPage T4): el import canónico del módulo
// (`./ResumePage.module.css`) no resuelve hasta el feat — TODO el archivo
// queda rojo en colecta, incluido el cierre axe (no es verde on-arrival: el
// discrimen del cierre y de los asserts de clase llega junto con el módulo y
// la unión). El test 9 fallaría además por sí solo (la página aún ignora
// `className`).
// ===========================================================================

describe("ResumePage className joining (T4: spec → API, G-B, Tests 9)", () => {
  it("joins an external className to the base .page class on the page root, coexisting", () => {
    const consumerClass = "app-tabpanel-resume";

    const { container } = renderResumePage(consumerClass);

    // Test 9 de la spec / plan → Interfaz (#99): `className` se UNE a la clase
    // base `.page` del raíz — COEXISTEN (precedente Box/Icon/Badge/
    // AboutPage test 8; rige la hoja de estilos, no el orden del atributo
    // class). El raíz se localiza por `container.firstElementChild` (criterio
    // del andamiaje: los defs van después del componente, y el test 5b de T2 —
    // "raíz sin <div> hijo directo" en escenario mockeado — no se ve afectado
    // por nada de T4). Se refuerza que el nodo localizado es el raíz de la
    // página (padre del h1).
    const pageRoot = container.firstElementChild;
    if (pageRoot === null) {
      throw new Error("ResumePage debe renderizar el raíz .page (Anatomía)");
    }
    const h1 = screen.getByRole("heading", { level: 1, name: RESUME_TITLE });
    expect(h1.parentElement).toBe(pageRoot);
    expect(pageRoot).toHaveClass(PAGE_CLASS);
    expect(pageRoot).toHaveClass(consumerClass);
  });
});

// --- T4 · Cierre a11y (constitución T4) — test 8 ----------------------------
describe("ResumePage accessibility audit (T4: cierre, Tests 8)", () => {
  it("has no accessibility violations with the full content", async () => {
    // Escenario completo en `en` con el contenido real del kit: h1 + .columns
    // (dos regiones Education/Experience con ol/li/article/h3 y periods) +
    // región de skills con su lista de chips + armazón AccentGradientDefs del
    // helper. axe sobre el `container` completo (criterio AboutPage test 7).
    const { container } = renderResumePage();

    await expectNoA11yViolations(container);
  });
});
