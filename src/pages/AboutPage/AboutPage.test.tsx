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
// accesible, así que se consultan estructuralmente desde `container`
// (`querySelectorAll("p")`) y se asierta la pertenencia por el padre común —
// criterio de selección estructural ya justificado en Timeline (`<time>`/`<p>`)
// e Icon/Box/CornerTab (`container.querySelector`). Las clases `.page`/`.intro`
// del raíz y del bloque se verifican en T4 con el módulo (`styles.x ?? "x"`,
// canon #99): en T1 el markup aún no tiene módulo y el contrato testeable es
// la ESTRUCTURA (h1 primer hijo del raíz, párrafos agrupados en un único div
// hijo de ese raíz), que sobrevive intacto a la llegada de las clases CSS.

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

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

    // Test 2 de la spec / RF-2: un `<p>` por elemento de `profile.about`, con
    // su texto y en orden.
    const paragraphs = Array.from(container.querySelectorAll("p"));
    expect(paragraphs).toHaveLength(ABOUT_PARAGRAPHS.length);
    expect(paragraphs.map((paragraph) => paragraph.textContent)).toEqual(
      ABOUT_PARAGRAPHS,
    );

    // "dentro de .intro" (Anatomía): todos los párrafos comparten UN único
    // div padre (el bloque intro) — verificación estructural, sin depender de
    // la clase (el módulo CSS llega en T4).
    const firstParagraph = paragraphs[0];
    if (firstParagraph === undefined) {
      throw new Error("falta el primer <p> de .intro (Tests esperados 2)");
    }
    const intro = firstParagraph.parentElement;
    if (intro === null) {
      throw new Error("cada <p> de profile.about debe vivir dentro del bloque .intro (Anatomía)");
    }
    expect(intro.tagName).toBe("DIV");
    for (const paragraph of paragraphs) {
      expect(paragraph.parentElement).toBe(intro);
    }

    // El bloque intro cuelga del raíz `div.page` y el `h1` es su PRIMER hijo
    // (spec → Estilos y tokens: "El h1 es el primer hijo"; RF-1/RF-4: el h1
    // fluye junto a la solapa porque abre el raíz, no dentro de intro).
    const pageRoot = intro.parentElement;
    if (pageRoot === null) {
      throw new Error(".intro debe ser hijo del raíz .page (Anatomía)");
    }
    expect(pageRoot.tagName).toBe("DIV");
    const heading = screen.getByRole("heading", { level: 1, name: ABOUT_TITLE });
    expect(heading.parentElement).toBe(pageRoot);
    expect(pageRoot.firstElementChild).toBe(heading);
  });
});
