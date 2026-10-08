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

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
