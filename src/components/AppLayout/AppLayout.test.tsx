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
import { uiEn } from "../../i18n/ui.en";

import { AppLayout } from "./AppLayout";

// Nombre del landmark `complementary` desde la FUENTE del kit (C3): el
// AppLayout lo pasa por `labels.region` de `t.sidebar`.
const SIDEBAR_REGION = uiEn.sidebar.region;

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
