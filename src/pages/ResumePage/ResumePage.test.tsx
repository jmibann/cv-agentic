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
import { describe, expect, it } from "vitest";

import { AccentGradientDefs } from "../../components/Icon";
import { cvByLocale } from "../../content";
import { uiEn } from "../../i18n/ui.en";
import { uiEs } from "../../i18n/ui.es";
import { LocaleProvider } from "../../providers/LocaleProvider";

import { ResumePage } from "./ResumePage";

// Valores esperados desde las FUENTES del kit (C3): el contenido que la página
// debe mostrar sale de `useCv()` —el mismo `cvByLocale.en` que sirve el
// provider— y los títulos de `uiEn.resume.*` (el `t` del provider); el test
// los importa para no copiar literales del contenido.
const RESUME_TITLE = uiEn.resume.title;
const EDUCATION = cvByLocale.en.education;
const EXPERIENCE = cvByLocale.en.experience;

const renderResumePage = () =>
  render(
    <LocaleProvider>
      <ResumePage />
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
    // (`.columns`) — verificación estructural sin clase (el módulo `.columns`
    // se conecta y asiértá con el canon #99 en T4).
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
    expect(experienceRegion.parentElement).toBe(columns);
    expect(columns.children).toHaveLength(2);
    expect(columns.firstElementChild).toBe(educationRegion);
    expect(columns.lastElementChild).toBe(experienceRegion);

    // El bloque .columns cuelga del raíz `div.page` y el `h1` sigue siendo su
    // PRIMER hijo (RF-1/RF-6: flujo de bloque para que el h1 fluya junto a la
    // solapa flotante de NavTabs).
    const pageRoot = columns.parentElement;
    if (pageRoot === null) {
      throw new Error(".columns debe ser hijo del raíz .page (Anatomía)");
    }
    expect(pageRoot.tagName).toBe("DIV");
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
