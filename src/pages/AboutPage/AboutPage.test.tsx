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

import { HexAvatarDefs } from "../../components/HexAvatar";
import { AccentGradientDefs } from "../../components/Icon";
import { cvByLocale } from "../../content";
import { uiEn } from "../../i18n/ui.en";
import { uiEs } from "../../i18n/ui.es";
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
  // T3 (test 5b): mismo mecanismo para vaciar `testimonials`.
  emptyTestimonials: boolean;
}

const cvHarness = vi.hoisted((): CvHarness => ({
  emptyServices: false,
  emptyTestimonials: false,
}));

vi.mock("../../providers/LocaleProvider", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../providers/LocaleProvider")>();
  return {
    ...actual,
    // Desarmado (default): delega en el `useCv` REAL del contexto del
    // LocaleProvider de verdad; armado: mismo cv real con la colección vacía
    // del flag activo. `useLocale`/`LocaleProvider` se conservan vía el spread
    // de `actual` (precedente LanguageSwitcher).
    useCv: () => {
      const cv = actual.useCv();
      if (cvHarness.emptyServices) {
        return { ...cv, services: [] };
      }
      if (cvHarness.emptyTestimonials) {
        return { ...cv, testimonials: [] };
      }
      return cv;
    },
  };
});

// Harness por defecto de cada test: desarmado (cv real del kit). Vitest corre
// el beforeEach outer ANTES del inner, así que los describes de 5a/5b pueden
// armarlo tranquilo. Sin afterEach: este propio beforeEach re-setea el estado
// cada vez.
beforeEach(() => {
  cvHarness.emptyServices = false;
  cvHarness.emptyTestimonials = false;
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
    // T3b (patrón T2b aprobado): sin assert global de `article` — desde T3
    // los `article` de las cards del carrusel son legítimos en este
    // escenario; la no-montada de la sección de servicios ya la cubren
    // region/h2/list de arriba.

    // Test 5 "en ambos escenarios": el `h1` sigue siendo el único y la página
    // sigue renderizando el resto (intro real: el mock solo vacía `services`).
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: ABOUT_TITLE }),
    ).toBeInTheDocument();
  });
});

// ===========================================================================
// Tests de T3 (specs/pages/AboutPage/tasks.md) — RF-2 (testimonios) y RF-3:
// test 4 de la spec (la `region` con nombre `t.about.testimonials` es la
// `<section>` PROPIA del `TestimonialCarousel` —dueña única de la región,
// decisión 20: hermana directa del `h2` en `.page`, sin wrapper de la página—,
// nombrada vía `labelledBy` y alimentada con las 5 plantillas CRUDAS de
// `t.testimonials`; la página NO llama `format`: se verifica observablemente,
// los nombres de slides/readMore salen interpolados del carrusel), test 5b
// (con `testimonials: []` por mock no existen el `h2` "Testimonials" ni la
// región y el `h1` sigue único) y test 6 (locale `es`: textos de `uiEs` y
// contenido de `cvByLocale.es`).
// Mock 5b: MISMO mecanismo hoisted/importOriginal del 5a, flag
// `emptyTestimonials`, reset en el `beforeEach` outer.
// Test 6: semilla del idioma por el camino del precedente LanguageSwitcher —
// `document.documentElement.lang = "es"` ANTES del render (lo lee
// `readInitialLocale`, ruta del anti-flash; el `afterEach` de `setup.ts` limpia
// `lang`/storage entre tests). Sin literales: todo lo esperado se importa de
// `uiEs`/`cvByLocale.es`.
// Armazones: `AccentGradientDefs` + `HexAvatarDefs` en los renders de T3 (las
// cards del carrusel montan `HexAvatar` con `clip-path` a `url(#hex-avatar-*)`
// e `Icon tone="gradient"` en la comilla; contracto de las primitivas,
// precedente TestimonialCard/TestimonialDialog.test.tsx).
// Verde on-arrival declarado en el commit test (decisión #101): el TEST 5B —
// antes del feat la página aún no renderiza nada de testimonios, así que las
// ausencias ya se cumplen; su discrimen es proteger la rama RF-2 contra una
// regresión que montara el h2/carrusel con la colección vacía. El rojo del
// commit lo ponen el test 4 (no hay h2 ni carrusel todavía) y el test 6 (la
// región de testimonios en `es` tampoco existe; sus asserts de servicios/h1
// ya pasan por T1/T2).
// `className` NO se pasa aún en el carrusel: `styles.testimonials` llega con
// el módulo en T4 (Anatomía → tabla "Estilos y tokens"); la hermandad
// h2↔section se verifica por estructura.
// ===========================================================================

// Esperados desde las FUENTES del kit (C3).
const TESTIMONIALS_TITLE = uiEn.about.testimonials;
const TESTIMONIALS = cvByLocale.en.testimonials;

// Render con los dos armazones de defs que requieren los hijos con gradient
// y hexágonos de la página completa.
const renderAboutPageWithAllDefs = () =>
  render(
    <LocaleProvider>
      <AccentGradientDefs />
      <HexAvatarDefs />
      <AboutPage />
    </LocaleProvider>,
  );

describe("AboutPage testimonials region is the carousel own section (T3: RF-2 testimonials, RF-3, Tests 4)", () => {
  it("renders the carousel section named by t.about.testimonials as direct sibling of its h2, fed with the raw t.testimonials templates", () => {
    // Invariante del escenario (criterio T1/T2): sin testimonios en el kit el
    // test sería vacío y no discriminaría nada; se frena y se reporta.
    if (TESTIMONIALS.length === 0) {
      throw new Error(
        "el contenido de ejemplo del kit debe traer testimonios en cv.testimonials (test 4 de la spec no puede correr vacío)",
      );
    }

    renderAboutPageWithAllDefs();

    // Test 4 / RF-2 (decisión 20): la región con nombre `t.about.testimonials`
    // es la `<section>` PROPIA del carrusel — no un wrapper de la página.
    // Discrimen de autoría: `aria-roledescription="carousel"` (RF-1 de
    // TestimonialCarousel) y NADA de wrapper intermedio (la hermandad se
    // asierta abajo por padre común).
    const region = screen.getByRole("region", { name: TESTIMONIALS_TITLE });
    expect(region.tagName).toBe("SECTION");
    expect(region).toHaveAttribute("aria-roledescription", "carousel");

    // La página le pasa `labelledBy="about-testimonials-title"`: el nombre
    // resuelve por `aria-labelledby` al h2 y el carrusel NO usa `aria-label`
    // (una u otra, nunca ambas — contrato de su spec). Así se discrimina que
    // el `labelledBy` llegó: `uiEn.about.testimonials` y
    // `uiEn.testimonials.carouselLabel` son el mismo literal "Testimonials",
    // el nombre por sí solo no distinguiría.
    expect(region).toHaveAttribute("aria-labelledby", "about-testimonials-title");
    expect(region).not.toHaveAttribute("aria-label");

    const heading = screen.getByRole("heading", {
      level: 2,
      name: TESTIMONIALS_TITLE,
    });
    expect(heading).toHaveAttribute("id", "about-testimonials-title");

    // Anatomía/decisión 20: `h2` y carrusel son HERMANOS DIRECTOS en `.page`,
    // sin wrapper de la página: comparten padre, el h2 va inmediatamente
    // antes de la section, y el raíz sigue abriendo con el h1 primero.
    const pageRoot = region.parentElement;
    if (pageRoot === null) {
      throw new Error(
        "la <section> del carrusel debe ser hijo del raíz .page (decisión 20: sin wrapper)",
      );
    }
    expect(pageRoot.tagName).toBe("DIV");
    expect(heading.parentElement).toBe(pageRoot);
    expect(region.previousElementSibling).toBe(heading);
    const h1 = screen.getByRole("heading", { level: 1, name: ABOUT_TITLE });
    expect(pageRoot.firstElementChild).toBe(h1);

    // RF-3: la página pasa las plantillas CRUDAS de `t.testimonials` y no
    // llama `format` — verificación observable: los nombres que produce el
    // CARRUSEL interpolando existen en el DOM (si la página hubiera
    // pre-interpolado o mandado cualquier otra cosa, estos nombres no
    // clavarían). Un `group` por testimonio con "{current} of {total}".
    for (let index = 0; index < TESTIMONIALS.length; index += 1) {
      const slideName = uiEn.testimonials.slideLabel
        .replace("{current}", String(index + 1))
        .replace("{total}", String(TESTIMONIALS.length));
      expect(within(region).getByRole("group", { name: slideName })).toBeInTheDocument();
    }

    // Y el botón "read more" de cada card nombrado con la plantilla `readMore`
    // interpolada por el carrusel con el author de `cvByLocale.en` (prueba de
    // que la plantilla viajó cruda y el contenido lo canaliza `useCv()`).
    for (const testimonial of TESTIMONIALS) {
      const openName = uiEn.testimonials.readMore.replace(
        "{author}",
        testimonial.author,
      );
      expect(
        within(region).getByRole("button", { name: openName }),
      ).toBeInTheDocument();
    }
  });
});

describe("AboutPage with empty testimonials (T3: RF-2, Tests 5b, mocked provider)", () => {
  // Arma el harness: el `useCv` mockeado devuelve el cv real del kit con
  // `testimonials: []` (mismo mecanismo del 5a; LocaleProvider sigue real).
  beforeEach(() => {
    cvHarness.emptyTestimonials = true;
  });

  it("renders no testimonials h2 nor carousel region and keeps the unique h1 when testimonials is empty", () => {
    // Freno anti-test-vacío (criterio 5a): si el kit no trajera testimonios,
    // la variante con [] no discriminaría nada.
    if (TESTIMONIALS.length === 0) {
      throw new Error(
        "el contenido de ejemplo del kit debe traer testimonios para que el escenario vacío (test 5b) discrimine",
      );
    }

    renderAboutPageWithAllDefs();

    // RF-2: "SI testimonials está vacío, ENTONCES no renderiza ni el h2 ni el
    // carrusel" (la región es la section del propio carrusel, que tampoco se
    // monta: con [] el carrusel devuelve null — RF-1 de su spec).
    expect(
      screen.queryByRole("heading", { level: 2, name: TESTIMONIALS_TITLE }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: TESTIMONIALS_TITLE }),
    ).not.toBeInTheDocument();
    // Sin slides (groups) ni cards de testimonio (articles nombradas por el
    // author); los articles de SERVICIOS quedan, no se cuentan acá.
    expect(screen.queryAllByRole("group")).toHaveLength(0);
    for (const testimonial of TESTIMONIALS) {
      expect(
        screen.queryByRole("article", { name: testimonial.author }),
      ).not.toBeInTheDocument();
    }

    // El mock es quirúrgico: solo vacía `testimonials` — la región de
    // servicios (T2) sigue montada con el cv real.
    expect(screen.getByRole("region", { name: SERVICES_TITLE })).toBeInTheDocument();

    // Test 5 "en ambos escenarios": el `h1` sigue siendo el único.
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});

describe("AboutPage in Spanish locale (T3: Tests 6, real LocaleProvider seeded es)", () => {
  it("shows the ui.es interface strings and the cv.es content when the active locale is es", () => {
    // Invariante: el cv.es del kit trae servicios y testimonios (los asserts
    // por array no pueden correr vacíos).
    if (
      cvByLocale.es.services.length === 0 ||
      cvByLocale.es.testimonials.length === 0 ||
      cvByLocale.es.profile.about.length === 0
    ) {
      throw new Error(
        "el contenido de ejemplo del kit debe traer about, services y testimonials en cv.es para el test 6",
      );
    }

    // Semilla anti-flash (precedente LanguageSwitcher T2/T3): `lang="es"` en
    // <html> ANTES del render; `readInitialLocale` lee solo ese atributo y el
    // provider resuelve `uiEs` + `cvByLocale.es`. El afterEach de setup.ts
    // limpia `lang`/storage.
    document.documentElement.lang = "es";
    renderAboutPageWithAllDefs();
    expect(document.documentElement).toHaveAttribute("lang", "es");

    // Textos de UI desde uiEs (sin literales): h1 `about.title`, región de
    // servicios `about.services`, región de testimonios `about.testimonials`
    // (la section del carrusel) y el h1 sigue único.
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: uiEs.about.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: uiEs.about.services }),
    ).toBeInTheDocument();
    const regionEs = screen.getByRole("region", {
      name: uiEs.about.testimonials,
    });
    expect(regionEs).toHaveAttribute("aria-roledescription", "carousel");

    // Contenido desde cv.es: los <p> de la intro (sin rol: query de texto,
    // criterio estructural de T1), las cards de servicio nombradas por sus
    // títulos en español (distintos de los ingleses: discrimina que `useCv()`
    // devolvió el cv del locale activo, no el inglés).
    for (const paragraph of cvByLocale.es.profile.about) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
    for (const service of cvByLocale.es.services) {
      expect(
        screen.getByRole("article", { name: service.title }),
      ).toBeInTheDocument();
    }

    // Y el carrusel arma sus nombres con las plantillas de `uiEs` y el
    // contenido de `cv.es` (todo el viaje pasó crudo por `carouselLabels`):
    // "1 de 3"-style por slide y readMore con el author.
    const esTestimonials = cvByLocale.es.testimonials;
    for (let index = 0; index < esTestimonials.length; index += 1) {
      const slideName = uiEs.testimonials.slideLabel
        .replace("{current}", String(index + 1))
        .replace("{total}", String(esTestimonials.length));
      expect(
        within(regionEs).getByRole("group", { name: slideName }),
      ).toBeInTheDocument();
    }
    for (const testimonial of esTestimonials) {
      const openName = uiEs.testimonials.readMore.replace(
        "{author}",
        testimonial.author,
      );
      expect(
        within(regionEs).getByRole("button", { name: openName }),
      ).toBeInTheDocument();
    }
  });
});
