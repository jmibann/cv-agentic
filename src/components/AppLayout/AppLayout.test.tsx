// Tests de T1 (specs/layout/AppLayout/tasks.md) — RF-1 y RF-6: landmarks
// `banner`/`complementary`/`main` con `getAllByRole("banner")` de longitud 1
// (test 1), exactamente un `linearGradient#accent-gradient`, un
// `clipPath#hex-avatar-outer` y un `clipPath#hex-avatar-inner` en el documento
// (test 7, RF-6: las defs compartidas se montan una sola vez) y ningún
// elemento con `id="about"` ni `id="resume"` (test 9, spec → No hacer /
// precondición de useHashTab).
// Diferidos a sus tareas: navegación por hash (tests 2/3/4 y tablist 11, T2),
// skip link y foco (test 8, T3), panel inactivo/stack de impresión e
// integración de providers (tests 5/6/12, T4), unión `className` del
// `div.container` con el módulo y cierre `expectNoA11yViolations` (test 10,
// T5) y el smoke de `App.tsx` (T6 — con aprobación pendiente del usuario; no
// se toca acá).
//
// Wrapper (plan → Estrategia de tests): `ThemeProvider` + `LocaleProvider`
// REALES (patrones F1/F3; los tests de AppLayout NOMBRA los landmarks por
// `t.sidebar.region` de `uiEn` — el Sidebar lo recibe por props desde la
// página—). El setup F1 ya mockea `matchMedia`, dialog, `scrollTo` y
// `ResizeObserver`, y el `afterEach` global limpia `data-theme`, `lang`,
// `localStorage` y el HASH de la URL: cada test arranca sin hash (→ tab
// inicial "about" por default de `useHashTab`, RF-2, que se verifica como
// test 2 en T2, no acá). Semilla default claro/en sin sembrar atributos
// (criterio ControlsBar T1).
//
// Justificación de las queries (constitución T3): landmarks por ROL
// (`banner`/`complementary`/`main` — semántica nativa de `<header>`/`<aside
// aria-label>`/`<main>`); el `complementary` además POR NOMBRE accesible
// (`t.sidebar.region`, único aside del documento). Para las defs compartidas
// (test 7): presencia por `document.getElementById` (el resto del documento
// las alcanza exactamente por id — criterio useHashTab/NavTabs de ids
// globales) y unicidad "exactamente una" por conteo del documento completo
// sobre la ETIQUETA SVG (`querySelectorAll("linearGradient"/"clipPath")`):
// solo `AccentGradientDefs` define un `<linearGradient>` y solo
// `HexAvatarDefs` dos `<clipPath>` (verificado en sus módulos — los avatares
// y glifos referencian por `url(#…)`/CSS, no duplican el elemento); un
// `querySelector("#…")` por id con id duplicado devolvería solo el primero y
// ocultaría la violación de RF-6, por eso el conteo va por etiqueta. Los
// `clipPath`/`linearGradient` de las defs están en el `document`, no en el
// `container` aislado: se consulta `document` directo (precedente de acceso
// global: HexAvatar.test.tsx con `container`, acá el árbol es multi-raíz por
// los providers y el `<svg>` de defs vive anywhere).
// El `id="about"`/`id="resume"` (test 9) se consulta con
// `document.getElementById(...) === null`: es el contrato de ausencia del
// spec → No hacer.

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import { LocaleProvider } from "../../providers/LocaleProvider";
import { ThemeProvider } from "../../providers/ThemeProvider";
import { cvByLocale } from "../../content";
import { uiEn } from "../../i18n/ui.en";
import { uiEs } from "../../i18n/ui.es";

import { AppLayout } from "./AppLayout";

// Cierre a11y de T5 (constitución T4; helper de src/test/a11y.ts).
import { expectNoA11yViolations } from "../../test/a11y";

// El test importa el módulo CSS solo para fijar el nombre REAL de la clase
// base del `div.container` (`container`, resuelto por CSS Modules en runtime)
// y asiértala con el canon #99 `styles.x ?? "x"` al coexistir con la clase
// externa (menor registrada en la aprobación de T1: "assert de unión
// `className` en `div.container`"; precedente AboutPage T4 / ResumePage T4 /
// LanguageSwitcher). El módulo no existe hasta `feat(AppLayout): T5`: el
// import canónico pone TODO el archivo en rojo en colecta — rojo declarado
// en el cuerpo del commit (precedente exacto AboutPage T4, aprobado por el
// reviewer: la unión ya existe en el `.tsx` desde T1, pero el nombre hasheado
// de la base solo se conoce con el módulo).
import styles from "./AppLayout.module.css";

// Nombre del landmark `complementary` desde la FUENTE del kit (C3): el
// AppLayout lo pasa por `labels.region` de `t.sidebar`.
const SIDEBAR_REGION = uiEn.sidebar.region;

// Clase base del `div.container` canon #99 (el módulo resuelve el nombre
// hasheado en runtime; el `?? "container"` cubre herramientas sin CSS
// Modules; precedente AboutPage T4 / LanguageSwitcher).
const CONTAINER_CLASS = styles.container ?? "container";

function renderWithProviders(ui: ReactNode) {
  return render(
    <ThemeProvider>
      <LocaleProvider>
        {ui}
      </LocaleProvider>
    </ThemeProvider>,
  );
}

describe("AppLayout landmarks (T1: RF-1, Tests 1)", () => {
  it("renders banner, complementary and main landmarks with exactly one banner", () => {
    renderWithProviders(<AppLayout />);

    // Test 1 de la spec: los tres landmarks presentes y `getAllByRole
    // ("banner")` de longitud 1 (la unicidad del header es delegada por
    // ControlsBar RF-2: su <header> es el único del documento — AppLayout no
    // agrega otro).
    expect(screen.getAllByRole("banner")).toHaveLength(1);

    // `complementary`: el `<aside aria-label={t.sidebar.region}>` del Sidebar
    // (Box as="aside"), nombrado por rol + nombre accesible.
    expect(
      screen.getByRole("complementary", { name: SIDEBAR_REGION }),
    ).toBeInTheDocument();

    // `main`: el landmark `<main>` que envuelve la card de contenido.
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});

describe("AppLayout shared defs exactly once (T1: RF-6, Tests 7)", () => {
  it("exposes exactly one accent-gradient linearGradient and the two hex-avatar clipPaths in the document", () => {
    renderWithProviders(<AppLayout />);

    // RF-6 / test 7 literal: UN `linearGradient#accent-gradient`, UN
    // `clipPath#hex-avatar-outer` y UN `clipPath#hex-avatar-inner`, pese a
    // que el árbol completo (Sidebar + AboutPage/ResumePage montadas, activa
    // e inactiva) tiene decenas de hijos con `tone="gradient"` y avatares
    // hexagonales — todos referencian las mismas defs por id, nadie las
    // duplica.
    // Presencia + tipo por id (getElementById: el contrato de acceso global;
    // tagName preserva el camelCase del SVG: precedente HexAvatar.test.tsx
    // con selectores de etiqueta "clipPath"), unicidad por conteo de etiquetas.
    const gradient = document.getElementById("accent-gradient");
    expect(gradient).not.toBeNull();
    expect(gradient?.tagName).toBe("linearGradient");
    expect(document.querySelectorAll("linearGradient")).toHaveLength(1);

    const clipOuter = document.getElementById("hex-avatar-outer");
    const clipInner = document.getElementById("hex-avatar-inner");
    expect(clipOuter).not.toBeNull();
    expect(clipOuter?.tagName).toBe("clipPath");
    expect(clipInner).not.toBeNull();
    expect(clipInner?.tagName).toBe("clipPath");
    // Los DOS clipPath del contrato y solo los dos: ningún otro nodo del
    // árbol define un `<clipPath>` (ver encabezado).
    expect(document.querySelectorAll("clipPath")).toHaveLength(2);
  });
});

describe("AppLayout does not squat the tab ids (T1: spec → No hacer, Tests 9)", () => {
  it("renders no element with id about or resume anywhere in the document", () => {
    renderWithProviders(<AppLayout />);

    // Test 9: ningún elemento con `id="about"` ni `id="resume"` — precondición
    // de useHashTab (su RF-5/No hacer: los ids de los tabs viven con el
    // prefijo `tab-` que fija NavTabs vía getTabId; si un elemento ocupara el
    // id pelado, el hash de la URL lo usaría de ancla de salto y el tabpanel
    // perdería su punto de foco). Cubre también el árbol de las páginas (los
    // ids de sección llevan prefijo `about-`/`resume-`, nunca pelados).
    expect(document.getElementById("about")).toBeNull();
    expect(document.getElementById("resume")).toBeNull();
  });
});

// ===========================================================================
// Tests de T2 (specs/layout/AppLayout/tasks.md) — RF-2, RF-3, RF-5: tests 2,
// 3, 4 y 11 de la spec. El cableado (`useHashTab(TAB_IDS, "about")`, el guard
// `isTabId`, la lista fija de 2 tabs y el `aria-labelledby={getTabId(active)}`
// del panel) EXISTE desde T1: esta tarea es de VERIFICACIÓN y los cuatro
// tests nacen VERDES on-arrival (decisión #101, declarado en el cuerpo del
// commit; NO hay commit `feat` si ningún assert revela bug). Discrimen por
// test si el cableado cambiara:
//  - test 2 (arranque): si el default de `useHashTab` dejara de ser "about"
//    o el panel montara la página equivocada, el `h1` buscado no existiría /
//    caería fuera del tabpanel y el `aria-selected="true"` cambiaría de tab.
//  - test 3 (hash pre-montaje): si AppLayout ignorara `location.hash` al
//    montar (p. ej. un `useState("about")` fijo), el panel seguiría en About
//    y el `h1` de Resume + `aria-labelledby="tab-resume"` fallarían.
//  - test 4 (click): si el `onChange` de NavTabs no estrechara con `isTabId`
//    y llamara `setActive` con un id inválido (o el guard de NavTabs
//    destino≠activo se perdiera y emitiera de más), fallan el contenido del
//    panel, el `toHaveBeenCalledTimes(1)` de `replaceState`, la URL terminada
//    en `#resume` o el `pushState` cero.
//  - test 11 (tablist invariante): si `tabs` dejara de ser la lista fija de
//    `TAB_IDS` (orden, tamaño o ids `tab-*` de getTabId), fallan la longitud,
//    el orden de ids/label y la coincidencia `aria-labelledby`↔tab activo
//    antes y después del cambio.
// Hash: se fija con el `history.replaceState` REAL ANTES de instalar el spy
// (precedente useHashTab T2 test 9 — el spy mide solo las llamadas del
// componente) y el `afterEach` de `src/test/setup.ts` limpia la URL entre
// tests. Spies con call-through (`vi.spyOn` sin implementación: la
// implementación original corre, así el hash CAMBIA de verdad y se asiértá
// observablemente) + `mockRestore` propio de cada test (precedente exacto).
// Clicks con `userEvent` sobre los tabs POR ROL + NOMBRE (`t.nav.*` de
// uiEn — NavTabs los nombra con su label). La "unicidad del h1 visible" al
// estilo RF-1/12 (`getAllByRole` longitud 1 con el inactivo bajo `hidden`)
// se asiértá también acá como refuerzo local del escenario, pero su test
// propio (12, simétrico) es de T4.
// ===========================================================================

describe("AppLayout starts on the About tab with no hash (T2: RF-2, Tests 2)", () => {
  it("mounts the About page in the tabpanel and marks the about tab selected with no URL hash", () => {
    // setup afterEach: el test arranca SIN hash (RF-2: hash ausente/inválido
    // → default "about").
    renderWithProviders(<AppLayout />);

    // "Hecho cuando" de T2 (test 2 literal): el tab inicial es `about` y el
    // panel muestra el `h1` de About — no el de Resume (la inactiva vive bajo
    // `hidden`, fuera del árbol accesible: su `h1` no es alcanzable).
    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveAttribute("id", "main-panel");
    expect(panel).toContainElement(
      screen.getByRole("heading", { level: 1, name: uiEn.about.title }),
    );
    expect(
      screen.queryByRole("heading", { level: 1, name: uiEn.resume.title }),
    ).not.toBeInTheDocument();

    // El tab about está seleccionado y el panel lo nombra (RF-5: el vínculo
    // apunta siempre a un tab existente).
    expect(screen.getByRole("tab", { name: uiEn.nav.about })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(panel).toHaveAttribute("aria-labelledby", "tab-about");

    // Sin hash en la URL (el default NO se escribe en la URL al montar:
    // useHashTab solo replaceState-a en setActiveId, RF-2 de su spec).
    expect(window.location.hash).toBe("");
  });
});

describe("AppLayout honors #resume before mounting (T2: RF-2, Tests 3)", () => {
  it("starts on Resume when location.hash is #resume prior to render", () => {
    // Hash fijado con el replaceState REAL antes del render (no hay spy
    // instalado; precedente useHashTab T2 "el hash se fija antes de crear el
    // spy"). El afterEach de setup.ts lo limpia después.
    window.history.replaceState(null, "", "#resume");

    renderWithProviders(<AppLayout />);

    // RF-2: `location.hash === "#resume"` antes de montar → arranca en Resume.
    const panel = screen.getByRole("tabpanel");
    expect(panel).toContainElement(
      screen.getByRole("heading", { level: 1, name: uiEn.resume.title }),
    );
    expect(
      screen.queryByRole("heading", { level: 1, name: uiEn.about.title }),
    ).not.toBeInTheDocument();
    expect(panel).toHaveAttribute("aria-labelledby", "tab-resume");
    expect(screen.getByRole("tab", { name: uiEn.nav.resume })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});

describe("AppLayout tab change swaps panel, labelledby and hash (T2: RF-3, Tests 4)", () => {
  it("clicking the Resume tab renders the Resume h1, relabels the panel and replaceState to #resume without pushState", async () => {
    const user = userEvent.setup();

    // URL base limpia con el replaceState REAL y DESPUÉS se instalan los
    // spies de call-through (el spy mide solo las llamadas del componente;
    // precedente useHashTab T2 test 9). pushState también se espía para
    // asiértar cero llamadas (RF-3: "sin agregar historial").
    window.history.replaceState(null, "", "/");
    const replaceState = vi.spyOn(window.history, "replaceState");
    const pushState = vi.spyOn(window.history, "pushState");

    try {
      renderWithProviders(<AppLayout />);
      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);

      await user.click(screen.getByRole("tab", { name: uiEn.nav.resume }));

      // RF-3: el panel muestra la página correspondiente al tab activado…
      const panel = screen.getByRole("tabpanel");
      expect(panel).toContainElement(
        screen.getByRole("heading", { level: 1, name: uiEn.resume.title }),
      );

      // …actualiza `aria-labelledby` al tab activo…
      expect(panel).toHaveAttribute("aria-labelledby", "tab-resume");

      // …y sincroniza la URL: UNA llamada a replaceState con URL terminada
      // en #resume (puede resolverse a absoluta en jsdom — criterio
      // useHashTab T2: mirar el tercer argumento con regex) y CERO pushState.
      expect(replaceState).toHaveBeenCalledTimes(1);
      const firstCall = replaceState.mock.calls[0];
      if (firstCall === undefined) {
        throw new Error(
          "replaceState sin llamadas registradas (no debería: toHaveBeenCalledTimes(1) ya pasó)",
        );
      }
      expect(firstCall[2]).toMatch(/#resume$/);
      expect(pushState).not.toHaveBeenCalled();
      // El call-through real dejó el hash observablemente cambiado.
      expect(window.location.hash).toBe("#resume");

      // Refuerzo del criterio RF-1 tras el cambio: sigue habiendo UN único
      // h1 accesible (la About pasó al bloque `hidden`).
      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    } finally {
      replaceState.mockRestore();
      pushState.mockRestore();
    }
  });
});

describe("AppLayout tablist invariant (T2: RF-5, Tests 11)", () => {
  it("keeps exactly two tabs in About→Resume order whose ids match the panel aria-labelledby before and after switching", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppLayout />);

    const tablist = screen.getByRole("tablist", { name: uiEn.nav.label });
    const tabs = within(tablist).getAllByRole("tab");

    // RF-5 / test 11: la lista es SIEMPRE la de `TAB_IDS`: exactamente 2,
    // ids con el prefijo `tab-` de getTabId y en orden About→Resume (labels
    // de `t.nav` en el mismo orden). Un `items=[]` (NavTabs RF-7 → null) o
    // un reorder romperían ambos asserts.
    expect(tabs).toHaveLength(2);
    const firstTab = tabs[0];
    const secondTab = tabs[1];
    if (firstTab === undefined || secondTab === undefined) {
      throw new Error("el tablist debe tener exactamente dos tabs (RF-5)");
    }
    expect(tabs.map((tab) => tab.id)).toEqual(["tab-about", "tab-resume"]);
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      uiEn.nav.about,
      uiEn.nav.resume,
    ]);

    const panel = screen.getByRole("tabpanel");

    // ANTES del cambio: el único `aria-selected="true"` es About y el panel
    // lo nombra con SU id exacto (coincidencia por referencia, no literal).
    expect(firstTab).toHaveAttribute("aria-selected", "true");
    expect(secondTab).toHaveAttribute("aria-selected", "false");
    expect(panel.getAttribute("aria-labelledby")).toBe(firstTab.id);
    // …y el id referenciado existe en el documento y ES ese tab (RF-5:
    // nunca apunta a un tab inexistente).
    expect(document.getElementById(firstTab.id)).toBe(firstTab);

    // Cambio de tab (click en el inactivo)…
    await user.click(secondTab);

    // …DESPUÉS: la invariante se mantiene con el otro activo.
    const tabsAfter = within(tablist).getAllByRole("tab");
    expect(tabsAfter).toHaveLength(2);
    expect(tabsAfter[0]).toHaveAttribute("aria-selected", "false");
    expect(tabsAfter[1]).toHaveAttribute("aria-selected", "true");
    expect(panel.getAttribute("aria-labelledby")).toBe(secondTab.id);
    expect(document.getElementById(secondTab.id)).toBe(secondTab);
  });
});

// ===========================================================================
// Test de T3 (specs/layout/AppLayout/tasks.md) — RF-4: test 8 de la spec. El
// skip link con `href="#main-panel"` + `onClick={focusPanel}`
// (preventDefault + panelRef.focus()) EXISTE desde T1: la verificación nace
// VERDE on-arrival (#101, declarado en el cuerpo del commit; sin commit
// `feat` salvo que el assert revele un bug). Discrimen: si `focusPanel`
// perdiera el `preventDefault`, el click nativo del `<a>` navegaría y
// escribiría `#main-panel` en la URL (y en jsdom el hash cambiaría o el foco
// no llegaría al panel); si perdiera el `.focus()`, `document.activeElement`
// seguiría siendo el skip link; si el link dejara de ser el primer elemento
// enfocable del documento (p. ej. un nodo enfocable antes, o quitarle el
// `href`), el `user.tab()` desde el body caería en otro lado; si el tabpanel
// perdiera `tabIndex={0}` (ya cableado en T1), jsdom/HTML no lo harían
// enfocable por programa y el foco no aterrizaría.
// Trampas jsdom conocidas: los `<svg>` de las defs preceden al skip link en
// el DOM pero son `focusable="false"` + `aria-hidden` (decorativos, contrato
// de Icon/HexAvatar T1) → no rompen el "primer enfocable"; `focus()` sobre el
// tabpanel exige el `tabIndex 0` nativo del div (cableado T1). Enter sobre
// `<a>`: user-event dispara el click por la activación nativa del keydown
// (behavior Enter sobre elementos con action) — se prueba; si la plataforma
// no lo simulase, la activación por teclado en navegador real pasa por el
// MISMO onClick ya cubierto por el click.
// ===========================================================================

describe("AppLayout skip link focuses the panel without touching the hash (T3: RF-4, Tests 8)", () => {
  it("is the first focusable element and on click moves focus to #main-panel leaving location.hash untouched", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppLayout />);

    // El skip link por ROL + NOMBRE accesible (`t.skipToContent` de la fuente
    // del kit, C3) y su respaldo sin JS: `href="#main-panel"` en el markup
    // (spec → Anatomía: el href queda pese al handler — sin JS el navegador
    // navega al panel; con JS el handler lo neutraliza para conservar el
    // hash del tab).
    const skipLink = screen.getByRole("link", { name: uiEn.skipToContent });
    expect(skipLink).toHaveAttribute("href", "#main-panel");
    // Contrato de impresión (spec → Impresión): se oculta con
    // `data-print-hide` en su raíz — el atributo viaja desde T1.
    expect(skipLink).toHaveAttribute("data-print-hide");

    // "El primer elemento enfocable del documento": Tab desde el body aterriza
    // en el skip link (las defs svg que lo preceden en el DOM son
    // focusable=false y no cuentan; ControlsBar y el resto vienen después).
    await user.tab();
    expect(skipLink).toHaveFocus();

    // El tabpanel aún NO tiene foco (el handler no corrió).
    const panel = screen.getByRole("tabpanel");
    expect(document.activeElement).not.toBe(panel);

    // Activación por click: RF-4 — el foco pasa al tabpanel `#main-panel` y
    // `location.hash` NO cambia (preventDefault neutraliza la navegación del
    // href; ni aparece #main-panel). Default del escenario: hash "" (el
    // afterEach de setup lo deja limpio).
    await user.click(skipLink);
    expect(document.activeElement).toBe(panel);
    expect(panel).toHaveAttribute("id", "main-panel");
    expect(window.location.hash).toBe("");

    // Activación por teclado (Enter sobre el link enfocado → mismo camino:
    // el click nativo dispara el onClick con preventDefault). Se re-enfoca
    // el skip link programáticamente (el foco está en el panel tras el
    // click; el contrato testeable es el HANDLER, no la navegación de Tab
    // completa).
    skipLink.focus();
    expect(skipLink).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(document.activeElement).toBe(panel);
    // El hash sigue sin tocar: ni "" → "#main-panel" en ninguna activación.
    expect(window.location.hash).toBe("");
  });
});

// ===========================================================================
// Tests de T4 (specs/layout/AppLayout/tasks.md) — RF-7 y RF-8 (capa DOM):
// tests 5, 6 y 12 de la spec.
//  - Test 5 (RF-7, camino INTEGRADO): el cambio de idioma se dispara con
//    `user.click` SOBRE EL LANGUAGE SWITCHER REAL del ControlsBar montado
//    (opción "Español", nombre fijo NO traducido — spec LanguageSwitcher →
//    "No hacer"), no por semilla de `lang`: el espíritu del RF es que la
//    UI completa reacciona sin recargar. AppLayout no implementa nada del
//    idioma (lo fijan los providers, que viven por encima); el test fija el
//    camino: tabs (roles + nombres de `ui.es`), título del panel activo
//    (`h1` con `uiEs.about.title`) y contenido (párrafo de `cv.es`) en un
//    mismo render vivo.
//  - Test 6 (RF-7 tema): click al ThemeToggle por rol+nombre del label en
//    tema claro (`t.controls.darkMode` de uiEn) → `data-theme="dark"` en
//    `<html>` (el setup mockea matchMedia con matches:false → arranca
//    "light"). La persistencia y el toggle son de ThemeProvider (F1/F3, ya
//    testeados); acá solo el camino integrado.
//  - Test 12 (RF-8, simétrico): DOS `it`, uno por tab activo (la spec pide
//    la simetría explícitamente). Con `about` en el tabpanel: la página
//    inactiva (Resume) vive en el bloque hermano `data-print-only` con
//    `hidden` (atributo presente y .hidden true), `data-print-page="resume"`,
//    FUERA del tabpanel y ambos cuelgan de la raíz común
//    `[data-print-stack]` (primero el panel, después el inactivo → el orden
//    About/Resume del print). `getAllByRole("heading", { level: 1 })`
//    longitud 1 (el `h1` de la inactiva existe en el DOM — se verifica por
//    texto estructural, accesibilidad excluida por `hidden`). Y cada página
//    montada UNA sola vez: escaneo GLOBAL de ids del documento sin
//    duplicados + presencia una vez de `#about-services-title` (activa) y
//    `#resume-skills-title` (inactiva). Simétrico sembrando `#resume` antes
//    de montar (criterio test 3).
// Todo el stack/inactivo está cableado desde T1: los cuatro `it` se espera
// que nazcan VERDES on-arrival (#101, declarado en el cuerpo del commit; sin
// commit `feat` salvo bug). Discrimen por test: test 5 rompe si AppLayout
// congelara `t`/`cv` (render una vez, p. ej. leyendo el módulo de contenido
// directo en vez de `useCv()`) o si el camino ControlsBar→provider no
// re-renderizara el árbol; test 6 rompe si el ThemeToggle perdiera conexión
// con su provider o si AppLayout montara un segundo provider de tema; test
// 12 rompe si la inactiva se montara DENTRO del tabpanel (aparecería como
// region/h1 accesible y duplicaría el h1 visible), si perdiera `hidden`
// (el `getAllByRole(h1)` pasaría a 2), si el `data-print-page` no espejara
// el tab inverso, o si alguna página se montara dos veces (el escaneo de
// ids y los querySelectorAll("#…") lo cazan). El escaneo anti-duplicado es
// la barrera que la decisión A4 de la spec puso contra el
// `duplicate-id-aria` de axe.
// ===========================================================================

// Escaneo GLOBAL de "no hay ids duplicados en el documento" (RF-8: cada
// página montada una sola vez): se recolecta el `id` de todo elemento que lo
// lleva y se compara la cantidad con la de valores distintos. Un Set sobre la
// lista de ids colapsa exactamente las duplicaciones.
const expectNoDuplicateIds = (): void => {
  const ids = Array.from(
    document.querySelectorAll<HTMLElement>("[id]"),
  ).map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
};

describe("AppLayout re-renders in Spanish through the real switcher (T4: RF-7, Tests 5)", () => {
  it("clicking the LanguageSwitcher Español option retabs, retitles and retexts the content in es without reloading", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppLayout />);

    // Camino integrado: el control vivo del ControlsBar (nombre fijo
    // "Español", NO traducido — spec LanguageSwitcher → "No hacer").
    await user.click(screen.getByRole("button", { name: "Español" }));

    // Sin recargar: el MISMO documento cambió (no hay remount — los roles
    // siguen presentes con nombres nuevos).
    // Tabs con textos de `ui.es` (t.nav).
    expect(
      screen.getByRole("tab", { name: uiEs.nav.about }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: uiEs.nav.resume }),
    ).toBeInTheDocument();
    // El tabpanel activo sigue siendo About, ahora con `h1` de `ui.es`.
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: uiEs.about.title }),
    ).toBeInTheDocument();
    // Un texto de `cv.es` (contenido, no interfaz): el primer párrafo del
    // perfil español, renderizado por el AboutPage activo vía `useCv()`.
    expect(
      screen.getByText(cvByLocale.es.profile.about[0] ?? ""),
    ).toBeInTheDocument();
    // …y ningún texto del inglés activo queda en el tabpanel accesible: el
    // `h1` inglés "About Me" ya no es alcanzable.
    expect(
      screen.queryByRole("heading", { level: 1, name: uiEn.about.title }),
    ).not.toBeInTheDocument();
    // Invariante de landmarks durante el cambio (RF-1 sigue vivo tras el
    // re-render): banner único y complementary renombrado por `ui.es`.
    expect(screen.getAllByRole("banner")).toHaveLength(1);
    expect(
      screen.getByRole("complementary", { name: uiEs.sidebar.region }),
    ).toBeInTheDocument();
  });
});

describe("AppLayout theme change reaches html data-theme (T4: RF-7, Tests 6)", () => {
  it("clicking the ThemeToggle sets data-theme=dark on <html> through the mounted provider path", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppLayout />);

    // Arranca claro (semilla default del provider: sin `data-theme` ni
    // preferencia del sistema — matchMedia mockeada matches:false → light).
    // El toggle en claro se nombra con el modo AL QUE VA (ThemeToggle RF-3):
    // `t.controls.darkMode` de uiEn ("Dark mode").
    expect(document.documentElement.dataset.theme).not.toBe("dark");
    await user.click(
      screen.getByRole("button", { name: uiEn.controls.darkMode }),
    );

    // El camino integrado: AppLayout no implementa nada del tema; el
    // ThemeProvider (por encima, montado por el helper) aplica `data-theme`
    // al <html> — spec → Tests 6 literal.
    expect(document.documentElement.dataset.theme).toBe("dark");
    // El documento sigue íntegro (no hubo recarga: el panel conserva su h1).
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});

describe("AppLayout inactive page lives hidden outside the tabpanel (T4: RF-8, Tests 12)", () => {
  // Escenario About activo (default, sin hash): la INACTIVA es Resume.
  it("with about active, mounts Resume hidden in the data-print-only sibling with data-print-page=resume and a single accessible h1, no duplicate ids", () => {
    renderWithProviders(<AppLayout />);

    const panel = screen.getByRole("tabpanel");
    // El tabpanel espeja el tab activo en el contrato de impresión.
    expect(panel).toHaveAttribute("data-print-page", "about");

    // El bloque hermano `data-print-only` con la página inactiva…
    const printOnly = document.querySelector("[data-print-only]");
    if (printOnly === null) {
      throw new Error(
        "debe existir el bloque hermano data-print-only con la página inactiva (RF-8)",
      );
    }
    expect(printOnly.tagName).toBe("DIV");
    expect(printOnly.hasAttribute("hidden")).toBe(true);
    expect(printOnly).toHaveAttribute("data-print-page", "resume");

    // …FUERA del tabpanel (no es su descendiente)…
    expect(panel.contains(printOnly)).toBe(false);
    // …y ambos cuelgan de la raíz común [data-print-stack], el panel PRIMERO
    // (el orden About→Resume del print sale de ahí + el order en global.css).
    const stack = printOnly.parentElement;
    expect(stack).not.toBeNull();
    expect(stack?.hasAttribute("data-print-stack")).toBe(true);
    expect(stack?.firstElementChild).toBe(panel);
    expect(stack?.lastElementChild).toBe(printOnly);

    // La página inactiva ESTÁ montada (una sola copia, en el bloque oculto):
    // su `h1` de Resume existe como nodo, aunque NO es accesible (hidden).
    const hiddenResumeH1 = printOnly.querySelector("h1");
    expect(hiddenResumeH1).not.toBeNull();
    expect(hiddenResumeH1?.textContent).toBe(uiEn.resume.title);

    // Accesibilidad: un único `h1` VISIBLE por vez (RF-1 criterio: RTL excluye
    // el subárbol oculto) y es el de About.
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: uiEn.about.title }),
    ).toBeInTheDocument();

    // Cada página montada UNA vez: presencia exacta de ids característicos de
    // la activa y de la inactiva (una sola copia en el documento)…
    expect(document.querySelectorAll("#about-services-title")).toHaveLength(1);
    expect(document.querySelectorAll("#resume-skills-title")).toHaveLength(1);
    // …y escaneo global anti-duplicación (la barrera del duplicate-id-aria
    // de la decisión A4).
    expectNoDuplicateIds();
  });

  // Escenario Resume activo (hash #resume sembrado ANTES de montar, criterio
  // test 3): la INACTIVA es About. Simétrico.
  it("with resume active, mounts About hidden in the data-print-only sibling with data-print-page=about and a single accessible h1, no duplicate ids", () => {
    window.history.replaceState(null, "", "#resume");
    renderWithProviders(<AppLayout />);

    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveAttribute("data-print-page", "resume");

    const printOnly = document.querySelector("[data-print-only]");
    if (printOnly === null) {
      throw new Error(
        "debe existir el bloque hermano data-print-only con la página inactiva (RF-8, simétrico)",
      );
    }
    expect(printOnly.hasAttribute("hidden")).toBe(true);
    expect(printOnly).toHaveAttribute("data-print-page", "about");
    expect(panel.contains(printOnly)).toBe(false);

    const stack = printOnly.parentElement;
    expect(stack?.hasAttribute("data-print-stack")).toBe(true);
    expect(stack?.firstElementChild).toBe(panel);
    expect(stack?.lastElementChild).toBe(printOnly);

    // La inactiva About montada una sola vez, oculta: su `h1` existe en el
    // DOM sin ser accesible.
    const hiddenAboutH1 = printOnly.querySelector("h1");
    expect(hiddenAboutH1?.textContent).toBe(uiEn.about.title);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: uiEn.resume.title }),
    ).toBeInTheDocument();

    // Ids característicos: los de Resume en el tabpanel y los de About en el
    // bloque oculto, cada uno exactamente una vez…
    expect(document.querySelectorAll("#resume-skills-title")).toHaveLength(1);
    expect(document.querySelectorAll("#about-services-title")).toHaveLength(1);
    // …y escaneo global.
    expectNoDuplicateIds();
  });
});

// ===========================================================================
// Tests de T5 (specs/layout/AppLayout/tasks.md) — cierre a11y y unión: test
// 10 de la spec (`expectNoA11yViolations` sin violaciones EN About Y EN
// Resume, EN ambos idiomas → cuatro combinaciones, un `it` cada una para
// localize la falla; los Seeds son los caminos ya usados en la pieza: hash
// `replaceState` real antes de montar (test 3) y `lang="es"` antes de montar
// (test 5 semilla anti-flash; el provider lo toma como idioma inicial)) y
// test de unión `className` en el `div.container` (G-B; la unión existe desde
// T1 y el `.tsx` de T5 solo cambia la BASE literal "container" por
// `styles.container`, así que este `it` es VERDE ON-ARRIVAL respecto de la
// lógica de unión (#101 — su rojo en el commit de tests viene únicamente del
// import del módulo inexistente en colecta; declarado en el cuerpo del
// commit). El container se localiza por el padre del `banner` (Anatomía: el
// `<header>` de ControlsBar es hijo directo del container).
// Los cuatro cierres axe corren sobre el documento COMPLETO (providers reales
// + armazón defs de la propia página): jsdom no carga el CSS del módulo ni el
// print de global.css (decisión #101: las reglas de layout/impresión se
// verifican por INSPECCIÓN del reviewer + QA F5); lo que axe audita acá es el
// árbol de accesibilidad completo ya ensamblado — landmarks, tablist/tab/
// panel con sus relaciones, regiones nombradas sin duplicados, el bloque
// `hidden` excluido. Si una forma nueva naciera violación, el `it` falla: no
// es decorativo.
// ===========================================================================

describe("AppLayout container className joining (T5: spec → API, G-B)", () => {
  it("joins an external className to the base .container class on the page container, coexisting", () => {
    const consumerClass = "app-shell-custom";

    renderWithProviders(<AppLayout className={consumerClass} />);

    // Unión #99 (spec → API: "className se aplica al div.container de la
    // Anatomía; la raíz es fragment y el lugar es deliberado, A7"): base del
    // módulo y clase externa COEXISTEN en el único container (precedente
    // Box/AboutPage/ResumePage: rige la hoja de estilos, no el orden del
    // atributo class). El container es el padre del banner (Anatomía: el
    // `<header>` de ControlsBar es hijo directo del container; el skip link y
    // las defs son HERMANOS del container bajo el fragment, no lo contienen).
    const banner = screen.getByRole("banner");
    const containerDiv = banner.parentElement;
    if (containerDiv === null) {
      throw new Error("el banner debe colgar del div.container (Anatomía)");
    }
    expect(containerDiv.tagName).toBe("DIV");
    expect(containerDiv).toHaveClass(CONTAINER_CLASS);
    expect(containerDiv).toHaveClass(consumerClass);
  });
});

// --- T5 · Cierre a11y (constitución T4) — test 10: 2 tabs × 2 idiomas -------
describe("AppLayout accessibility audit (T5: cierre, Tests 10)", () => {
  it("has no accessibility violations with About active in English", async () => {
    const { container } = renderWithProviders(<AppLayout />);

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with Resume active in English", async () => {
    // Tab Resume por hash real antes de montar (criterio test 3).
    window.history.replaceState(null, "", "#resume");

    const { container } = renderWithProviders(<AppLayout />);

    // Freno de la rama sembrada (criterio test 6 de LanguageSwitcher): sin
    // esto, un fallback silencioso a "about" auditaría dos veces el mismo
    // árbol.
    expect(
      screen.getByRole("heading", { level: 1, name: uiEn.resume.title }),
    ).toBeInTheDocument();

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with About active in Spanish", async () => {
    // Idioma por semilla anti-flash: `lang="es"` antes del render (criterio
    // test 5 del propio archivo… donde el cambio fue por click; acá la semilla
    // basta para el árbol axe y es el camino probado en ResumePage/AboutPage).
    document.documentElement.lang = "es";

    const { container } = renderWithProviders(<AppLayout />);

    expect(
      screen.getByRole("heading", { level: 1, name: uiEs.about.title }),
    ).toBeInTheDocument();

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with Resume active in Spanish", async () => {
    // Las dos semillas juntas: la combinación completa pedida por el test 10.
    document.documentElement.lang = "es";
    window.history.replaceState(null, "", "#resume");

    const { container } = renderWithProviders(<AppLayout />);

    expect(
      screen.getByRole("heading", { level: 1, name: uiEs.resume.title }),
    ).toBeInTheDocument();

    await expectNoA11yViolations(container);
  });
});
