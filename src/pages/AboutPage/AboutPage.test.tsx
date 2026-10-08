// Tests de T1 (specs/pages/AboutPage/tasks.md) — RF-1 y RF-2 (parte intro):
// un único `h1` con `t.about.title` (spec → Tests esperados 1) y un `<p>` por
// cada elemento de `profile.about` dentro de `.intro` (spec → Tests esperados
// 2). Diferidos a sus tareas: servicios (T2), testimonios/carrusel y locale
// `es` (T3), módulo CSS, unión `className` y cierre `expectNoA11yViolations`
// (T4, constitución T4). Los armazones `AccentGradientDefs`/`HexAvatarDefs`
// llegan con T2/T3: en T1 el árbol (SectionTitle + párrafos) no monta SVG con
// `tone="gradient"` (SectionTitle lo hace solo con `icon`, que la página no
// usa en el `h1`).
//
// Wrapper (plan → Estrategia de tests): `LocaleProvider` REAL con el contenido
// de ejemplo del kit. Sin semilla de `lang`: `readInitialLocale` cae en
// DEFAULT_LOCALE "en" (i18n.md → "Resolución del idioma inicial"; precedente
// LanguageSwitcher T2 "sin semilla"), así que la página ve `uiEn` y
// `cvByLocale.en`. El `afterEach` de `src/test/setup.ts` limpia `lang` y
// storage entre tests.
//
// Justificación de las queries (constitución T3): el `h1` se busca por rol +
// nivel + nombre accesible (`getByRole("heading", { level: 1, name })`), el
// patrón literal del test 1 de la spec, y la unicidad con `getAllByRole`
// longitud 1. Los `<p>` y el `div` de `.intro` no tienen rol ni nombre
// accesible, así que se consultan estructuralmente y se asierta la pertenencia
// por el padre común — criterio de selección estructural ya justificado en
// Timeline (`<time>`/`<p>`) e Icon/Box/CornerTab (`container.querySelector`).
// T2b (ajuste APROBADO por el usuario tras la revisión de T1): la consulta de
// párrafos del test 2 se ACOTA al bloque `.intro` (ya no es global al
// `container`): desde T2 la página tiene otros `<p>` fuera de `.intro` (la
// descripción de cada `ServiceCard`, `<p>` por spec aprobada) y el contrato
// literal de T1 es "un `<p>` por cada elemento de `profile.about` DENTRO de
// `.intro`" — cantidad, textos, orden, padre común único y raíz/h1 primer hijo
// siguen asertados; no se debilita, se re-ubica al scope que la spec describe.
// Las clases `.page`/`.intro`
// del raíz y del bloque se verifican en T4 con el módulo (`styles.x ?? "x"`,
// canon #99): en T1 el markup aún no tiene módulo y el contrato testeable es
// la ESTRUCTURA (h1 primer hijo del raíz, párrafos agrupados en un único div
// hijo de ese raíz), que sobrevive intacto a la llegada de las clases CSS.

import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AccentGradientDefs } from "../../components/Icon";
import { cvByLocale } from "../../content";
import { uiEn } from "../../i18n/ui.en";
import { LocaleProvider } from "../../providers/LocaleProvider";

import { AboutPage } from "./AboutPage";

// Valores esperados desde las FUENTES del kit (C3): el contenido que la página
// debe mostrar sale de `useCv()` —el mismo `cvByLocale.en` que sirve el
// provider— y el título de `uiEn.about.title` (el `t` del provider); el test
// los importa para no copiar literales del contenido.
const ABOUT_TITLE = uiEn.about.title;
const ABOUT_PARAGRAPHS = cvByLocale.en.profile.about;

const renderAboutPage = () =>
  render(
    <LocaleProvider>
      <AboutPage />
    </LocaleProvider>,
  );

describe("AboutPage unique h1 with t.about.title (T1: RF-1, Tests 1)", () => {
  it("renders exactly one level-1 heading named with t.about.title", () => {
    renderAboutPage();

    // Test 1 de la spec / RF-1 + RF-5: `getAllByRole("heading", { level: 1 })`
    // de longitud 1 (un único h1 en el panel) y ese h1 lleva por nombre
    // accesible `t.about.title` (la página pasa el texto de `t`, nunca lo
    // hardcodea).
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: ABOUT_TITLE }),
    ).toBeInTheDocument();
  });
});

describe("AboutPage intro paragraphs (T1: RF-2 intro, Tests 2)", () => {
  it("renders one paragraph per profile.about entry, all inside a single intro block under the page root", () => {
    const { container } = renderAboutPage();

    // Invariante del escenario (criterio Timeline T2): si el kit viniera sin
    // párrafos, el test sería vacío y no discriminaría nada; se frena acá y se
    // reporta, no se relaja la aserción.
    if (ABOUT_PARAGRAPHS.length === 0) {
      throw new Error(
        "el contenido de ejemplo del kit debe traer párrafos en profile.about (test 2 de la spec no puede correr vacío)",
      );
    }

    // El bloque intro cuelga del raíz `div.page` (Anatomía: el ÚNICO `<div>`
    // hijo directo del raíz). T2b: el raíz y el bloque se identifican primero,
    // de forma estructural y sin clase (el módulo CSS llega en T4), y recién
    // ahí se consultan los `<p>` DENTRO de `.intro` (ver encabezado del
    // archivo: el contrato de T1 es "un <p> por elemento de profile.about
    // dentro de .intro"; desde T2 hay otros <p> en la página — ServiceCard —
    // y la consulta global del container los contaría).
    const pageRoot = container.firstElementChild;
    if (pageRoot === null) {
      throw new Error("AboutPage debe renderizar el raíz div.page (Anatomía)");
    }
    expect(pageRoot.tagName).toBe("DIV");
    const introBlocks = pageRoot.querySelectorAll(":scope > div");
    expect(introBlocks).toHaveLength(1);
    const intro = introBlocks[0];
    if (intro === undefined) {
      throw new Error("el raíz .page debe tener el bloque .intro como único div hijo directo (Anatomía)");
    }

    // Test 2 de la spec / RF-2: un `<p>` por elemento de `profile.about`, con
    // su texto y en orden, dentro de `.intro`.
    const paragraphs = Array.from(intro.querySelectorAll("p"));
    expect(paragraphs).toHaveLength(ABOUT_PARAGRAPHS.length);
    expect(paragraphs.map((paragraph) => paragraph.textContent)).toEqual(
      ABOUT_PARAGRAPHS,
    );

    // "dentro de .intro" (Anatomía): todos los párrafos comparten ese único
    // div padre (el bloque intro).
    for (const paragraph of paragraphs) {
      expect(paragraph.parentElement).toBe(intro);
    }

    // El `h1` es el PRIMER hijo del raíz
    // (spec → Estilos y tokens: "El h1 es el primer hijo"; RF-1/RF-4: el h1
    // fluye junto a la solapa porque abre el raíz, no dentro de intro).
    const heading = screen.getByRole("heading", { level: 1, name: ABOUT_TITLE });
    expect(heading.parentElement).toBe(pageRoot);
    expect(pageRoot.firstElementChild).toBe(heading);
  });
});

// ===========================================================================
// Tests de T2 (specs/pages/AboutPage/tasks.md) — RF-2 (servicios) y RF-5:
// test 3 de la spec (región nombrada por `t.about.services` vía
// `<section aria-labelledby="about-services-title">` + su `SectionTitle as="h2"`
// con ese `id`, conteniendo un `article` por servicio) y test 5a (con
// `services: []` la región no existe y el `h1` sigue siendo el único). El
// markup `.services` como `<ul>` con un `<li>` por card (RF-5: "renderiza los
// servicios como <ul>") se verifica estructuralmente: un `list` con tantas
// `listitem` como servicios, cada `article` hijo directo de su `li` y cada `li`
// hijo directo de la lista — criterio estructural ya justificado en T1 (las
// clases `.services` llegan con el módulo en T4 y se asertan allá, canon #99).
//
// Mock (plan → Decisiones): `vi.mock` del MÓDULO DE PROVIDERS
// (`../../providers/LocaleProvider`, donde vive `useCv`) con delegación en
// `importOriginal`, overriding solo `useCv` con `{ ...cv real, services: [] }`.
// Es el mecanismo que el precedente `LanguageSwitcher.test.tsx` ya valida en
// este repo (mock de módulo + `vi.hoisted` como flag mutable on/off por
// describe): como `vi.mock` actúa a nivel de archivo, un mock absoluto rompería
// los describes de T1 y del test 3; por eso el wrapper `LocaleProvider` queda
// REAL (se conserva vía spread de `actual`) y el override de `useCv` delega
// siempre en el hook real, vaciando `services` solo con el harness armado.
// Nota: la spec habla de "mock del módulo de contenido" y el plan/tasks dicen
// "del provider"; `useCv` vive en el módulo de providers (que a su vez importa
// `cvByLocale`) — se sigue el plan con el mecanismo exacto del precedente, sin
// tocar nada fuera de `src/pages/AboutPage/`.
//
// T2 es agregado puro: los describes y aserciones de T1 quedan intactos arriba.
// Test 5a nace VERDE on-arrival (declarado, decisión #101): hoy la página aún
// no renderiza servicios; su discrimen es futuro — protege la ausencia de la
// región una vez implementado `feat(AboutPage): T2` (RF-2). El rojo de este
// commit lo pone el test 3 (exige la sección que todavía no existe).
//
// Armazón (spec → Tests esperados): `AccentGradientDefs` se monta por los
// `Icon tone="gradient"` de las `ServiceCard` del test 3 (contrato de Icon,
// RF-4; precedente ServiceCard.test.tsx) — hexágonos/`HexAvatarDefs` recién
// hacen falta con el carrusel (T3).
// ===========================================================================

interface CvHarness {
  emptyServices: boolean;
}

const cvHarness = vi.hoisted((): CvHarness => ({ emptyServices: false }));

vi.mock("../../providers/LocaleProvider", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../providers/LocaleProvider")>();
  return {
    ...actual,
    // Desarmado (default): delega en el `useCv` REAL del contexto del
    // LocaleProvider de verdad; armado: mismo cv real con `services: []`.
    // `useLocale`/`LocaleProvider` se conservan vía el spread de `actual`
    // (precedente LanguageSwitcher).
    useCv: () => {
      const cv = actual.useCv();
      return cvHarness.emptyServices ? { ...cv, services: [] } : cv;
    },
  };
});

// Harness por defecto de cada test: desarmado (cv real del kit). Vitest corre
// el beforeEach outer ANTES del inner, así que el describe de 5a puede armarlo
// tranquilo. Sin afterEach: este propio beforeEach re-setea el estado cada vez.
beforeEach(() => {
  cvHarness.emptyServices = false;
});

// Esperados desde las FUENTES del kit (C3): el título de `uiEn.about.services`
// y los servicios del mismo `cvByLocale.en` que sirve el provider.
const SERVICES_TITLE = uiEn.about.services;
const SERVICES = cvByLocale.en.services;

// Render con el armazón de gradiente (no toca `renderAboutPage` de T1: ahí no
// hay hijos con `tone="gradient"`).
const renderAboutPageWithDefs = () =>
  render(
    <LocaleProvider>
      <AccentGradientDefs />
      <AboutPage />
    </LocaleProvider>,
  );

describe("AboutPage services region (T2: RF-2 services, RF-5, Tests 3)", () => {
  it("renders a region named by t.about.services with one li-wrapped article per service inside a ul", () => {
    // Invariante del escenario (criterio T1): sin servicios en el kit el test
    // sería vacío y no discriminaría nada; se frena y se reporta.
    if (SERVICES.length === 0) {
      throw new Error(
        "el contenido de ejemplo del kit debe traer servicios en cv.services (test 3 de la spec no puede correr vacío)",
      );
    }

    renderAboutPageWithDefs();

    // Test 3 / RF-5: `region` con nombre accesible `t.about.services`. El
    // nombre sale del `aria-labelledby` de la `<section>` hacia el `h2` con el
    // `id` fijo de la Anatomía ("about-services-title"): se asiértan ambos
    // extremos del vínculo, no solo el nombre computado.
    const region = screen.getByRole("region", { name: SERVICES_TITLE });
    expect(region).toHaveAttribute("aria-labelledby", "about-services-title");
    expect(region.tagName).toBe("SECTION");

    const heading = screen.getByRole("heading", {
      level: 2,
      name: SERVICES_TITLE,
    });
    expect(heading).toHaveAttribute("id", "about-services-title");
    expect(region).toContainElement(heading);

    // RF-5: los servicios como `<ul>` (rol implícito `list`) con un `<li>`
    // (`listitem`) por card.
    const list = within(region).getByRole("list");
    const items = within(region).getAllByRole("listitem");
    expect(items).toHaveLength(SERVICES.length);
    for (const item of items) {
      expect(item.parentElement).toBe(list);
    }

    // Un `article` (ServiceCard) POR servicio, nombrado por su título (RF-3
    // de ServiceCard: `aria-labelledby` a su `h3`), como hijo directo del `li`
    // (Anatomía: `<li><ServiceCard service={…} /></li>`).
    for (const service of SERVICES) {
      const article = within(region).getByRole("article", {
        name: service.title,
      });
      const parent = article.parentElement;
      if (parent === null) {
        throw new Error(
          `la ServiceCard de "${service.title}" debe vivir dentro de un <li> (Anatomía)`,
        );
      }
      expect(parent.tagName).toBe("LI");
      expect(within(parent).getAllByRole("article")).toHaveLength(1);
    }

    // La región cuelga del raíz `.page` y el `h1` sigue siendo su primer hijo
    // (Anatomía: section hermana de .intro bajo el raíz; RF-4/RF-1).
    // Verificación estructural sin clase (el módulo `.services`/.page llega en
    // T4 con el canon #99).
    const pageRoot = region.parentElement;
    if (pageRoot === null) {
      throw new Error(
        "la <section> de servicios debe ser hijo del raíz .page (Anatomía)",
      );
    }
    expect(pageRoot.tagName).toBe("DIV");
    const h1 = screen.getByRole("heading", { level: 1, name: ABOUT_TITLE });
    expect(pageRoot.firstElementChild).toBe(h1);
  });
});

describe("AboutPage with empty services (T2: RF-2, Tests 5a, mocked provider)", () => {
  // Arma el harness: el `useCv` mockeado devuelve el cv real del kit con
  // `services: []` (LocaleProvider sigue real).
  beforeEach(() => {
    cvHarness.emptyServices = true;
  });

  it("renders no services region nor its h2 and keeps the unique h1 when services is empty", () => {
    // Freno anti-test-vacío: si el kit no trajera servicios, la variante con
    // [] no discriminaría nada (el escenario real tampoco tendría región).
    if (SERVICES.length === 0) {
      throw new Error(
        "el contenido de ejemplo del kit debe traer servicios para que el escenario vacío (test 5a) discrimine",
      );
    }

    render(
      <LocaleProvider>
        <AccentGradientDefs />
        <AboutPage />
      </LocaleProvider>,
    );

    // RF-2: "SI services está vacío, ENTONCES no renderiza su <section>" — ni
    // la región, ni el h2, ni el <ul> con <li> (la sección entera no se monta).
    expect(
      screen.queryByRole("region", { name: SERVICES_TITLE }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 2, name: SERVICES_TITLE }),
    ).not.toBeInTheDocument();
    expect(screen.queryAllByRole("list")).toHaveLength(0);
    expect(screen.queryAllByRole("article")).toHaveLength(0);

    // Test 5 "en ambos escenarios": el `h1` sigue siendo el único y la página
    // sigue renderizando el resto (intro real: el mock solo vacía `services`).
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: ABOUT_TITLE }),
    ).toBeInTheDocument();
  });
});
