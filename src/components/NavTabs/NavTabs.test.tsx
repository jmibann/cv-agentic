// Tests de T1–T2 (specs/layout/NavTabs/tasks.md) — T1: RF-1, RF-2, RF-7: un tablist
// nombrado (`getByRole("tablist", { name: LABEL })`) con
// `aria-orientation="horizontal"` y un `role="tab"` por item en el orden
// recibido (RF-1), cada tab con `id = getTabId(item.id)` y `aria-controls` al
// MISMO `panelId` (RF-2: un único tabpanel; su existencia y contenido son de
// AppLayout, no verificables en esta pieza), roving tabindex — activo 0, resto
// -1 — junto a `aria-selected` (RF-1; la distinción visual es RF-5, su parte
// CSS se inspecciona en T4); y RF-7: `items=[]` no renderiza nada (container
// vacío, sin tablist: un tablist sin tabs es inválido para axe). Se testea
// directo además `getTabId` exportada ("Hecho cuando" de T1; la consume
// AppLayout para el `aria-labelledby` del panel — spec → API). T2: RF-3: click
// en un tab inactivo → `onChange(id)` UNA vez; click en el activo → CERO
// llamadas (guard; spec → Tests esperados 4 y 5). El foco tras click es nativo
// del `<button>` (spec → Comportamiento, plan → Decisiones): NavTabs no
// re-gestiona el foco, no hay assert de foco en click (inspección).
//
// Diferidos por tasks.md: teclado ←/→ circular,
// Home/End y Espacio (T3: RF-4), `NavTabs.module.css` + `index.ts` + cierre
// `expectNoA11yViolations` del archivo (T4: RF-5, RF-6) — criterio Separator
// T1–T2 y CornerTab T1–T3, que agregaron el cierre en la última tarea. RF-6
// (visible en todos los breakpoints, sin hamburguesa) no es verificable en
// jsdom por tests: inspección del CSS y QA F5 (#101).
//
// extra (P3, con su motivo): el caso de `className` (G-B) — la API de la spec
// lo exige ("Se une al raíz de la pieza — se transmite a la clase base de
// CornerTab") y T1 lo conecta porque ningún "Hecho cuando" de T2/T3/T4 lo
// reclama (T4: módulo, index y cierre) y la transmisión no depende del módulo
// CSS de la pieza (su raíz YA es CornerTab). No está en la lista de "Tests
// esperados" de la spec, así que se agrega marcado con este comentario,
// replicando el patrón aprobado en ControlsBar/ThemeToggle/LanguageSwitcher T1.
//
// Justificación de las queries (constitución T3): todo por rol y nombre
// accesible — `getByRole("tablist", { name })`, `within(tablist)` +
// `getAllByRole("tab")` (orden, RF-1) y `getByRole("tab", { name })` con los
// atributos (`id`, `aria-controls`, `aria-selected`, `tabindex`) asertados
// sobre esos nodos. Sin `data-testid`. Para el raíz de la pieza (extra) no hay
// query estructural `container.querySelector`: se toma el `parentElement` del
// tablist (el raíz de la pieza es la CornerTab que lo envuelve — spec →
// Anatomía).
//
// Armazón: la pieza se renderiza SOLA (plan → Estrategia de tests): no
// necesita providers (todo llega por props; C2: no consume useCv/useLocale),
// `onChange` es `vi.fn()` y los renders de T1 quedan sin aserción de conteos
// (sin interacciones); los casos de T2 pasan su spy propio por `overrides` de
// `renderNavTabs` (agregado puro: el default del helper no cambia). Sin
// `AccentGradientDefs` ni `HexAvatarDefs`: ni la pieza ni CornerTab
// montan íconos de gradiente ni SVG (plan → Estrategia de tests).
//
// Rojo on-arrival: el de T1 fue "Failed to resolve import ./NavTabs" (patrón
// aprobado en CornerTab T1 y ControlsBar T1). El de T2 es real y por la razón
// correcta: el click hoy no hace nada — `onChange` está tipado en la interfaz
// (spec → API) pero SIN conectar (T1 fue solo markup, así declarado en sus
// diferidos): el caso del inactivo falla por 0 llamadas esperadas 1. El caso
// del ACTIVO nace verde (contaría cero por casualidad, no por el guard), por
// eso FIJA primero que ese tab está activo (`aria-selected="true"`): guard
// "no vacío", precedente LanguageSwitcher T2 (decisión 2=a).

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { getTabId, NavTabs } from "./NavTabs";
import type { NavTabItem, NavTabsProps } from "./NavTabs";

// El extra de la unión G-B asierte coexistencia con la clase base del raíz,
// que es la de CornerTab (spec → API: la className "se transmite a la clase
// base de CornerTab"). Patrón canónico #99 (`styles.name ?? "name"`;
// prohibidos `!` y `as string`): el fallback es solo de tipos bajo
// noUncheckedIndexedAccess.
import cornerTabStyles from "../CornerTab/CornerTab.module.css";

const cornerTabBaseClass = cornerTabStyles.cornerTab ?? "cornerTab";

// Fixture de la spec → Anatomía (ítems About/Resume, panel `main-panel`,
// tablist "Sections"; D4: nombres de interfaz de ejemplo, sin datos reales).
const TAB_ITEMS: readonly NavTabItem[] = [
  { id: "about", label: "About" },
  { id: "resume", label: "Resume" },
];
const PANEL_ID = "main-panel";
const LABEL = "Sections";

// Render de la pieza sola (plan → Estrategia de tests): props de la spec →
// API con `activeId` en el primer item y `onChange` espía (sin asserts de
// llamadas en T1). T2 pasa su propio spy por `overrides` y lo asiértan los
// casos de click; el teclado (T3) volverá a medir llamadas.
function renderNavTabs(overrides: Partial<NavTabsProps> = {}) {
  const props: NavTabsProps = {
    items: TAB_ITEMS,
    activeId: "about",
    onChange: vi.fn(),
    panelId: PANEL_ID,
    label: LABEL,
    ...overrides,
  };
  return render(<NavTabs {...props} />);
}

describe("NavTabs tablist, roving tabindex and empty state (T1: RF-1, RF-2, RF-7)", () => {
  it("renders a named horizontal tablist with one tab per item in order", () => {
    renderNavTabs();

    // RF-1 + spec → Accesibilidad: el tablist se nombra con la prop `label`.
    // `aria-orientation="horizontal"` ("Hecho cuando" de T1): fijo, no es
    // prop expuesta (plan → Interfaz).
    const tablist = screen.getByRole("tablist", { name: LABEL });
    expect(tablist).toHaveAttribute("aria-orientation", "horizontal");

    // RF-1: un tab por item, DENTRO del tablist y en el orden recibido
    // (spec → Anatomía: dos `<button role="tab">` hermanos).
    const tabs = within(tablist).getAllByRole("tab");
    expect(tabs).toHaveLength(TAB_ITEMS.length);
    expect(tabs.map((tab) => tab.textContent)).toEqual(["About", "Resume"]);

    // Cada tab accesible por rol + nombre ("Hecho cuando" de T1).
    expect(screen.getByRole("tab", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Resume" })).toBeInTheDocument();
  });

  it("gives each tab its getTabId id and points every tab to the same panelId", () => {
    renderNavTabs();

    // "Hecho cuando" de T1 + RF-2: `id = getTabId(item.id)` y
    // `aria-controls = panelId` en TODOS los tabs (un único tabpanel; la
    // existencia y el contenido del panel son de AppLayout — spec → RF-2).
    for (const item of TAB_ITEMS) {
      const tab = screen.getByRole("tab", { name: item.label });
      expect(tab).toHaveAttribute("id", getTabId(item.id));
      expect(tab).toHaveAttribute("aria-controls", PANEL_ID);
    }
  });

  it("sets aria-selected and roving tabIndex only on the active tab", () => {
    renderNavTabs();

    // RF-1 (roving tabindex: solo el tab activo tabulable) y `aria-selected`
    // (la parte testeable de RF-5; el color/opacidad/subrayado son inspección
    // del CSS en T4, #101). Activo: "true" / "0"; resto: "false" / "-1".
    const activeTab = screen.getByRole("tab", { name: "About" });
    const inactiveTab = screen.getByRole("tab", { name: "Resume" });
    expect(activeTab).toHaveAttribute("aria-selected", "true");
    expect(activeTab).toHaveAttribute("tabindex", "0");
    expect(inactiveTab).toHaveAttribute("aria-selected", "false");
    expect(inactiveTab).toHaveAttribute("tabindex", "-1");
  });

  it("renders nothing when items is empty", () => {
    const { container } = renderNavTabs({ items: [] });

    // RF-7 ("Hecho cuando" de T1): container vacío — ni CornerTab ni tablist
    // (un tablist sin tabs es inválido para axe).
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.queryAllByRole("tab")).toHaveLength(0);
  });

  it("maps item ids to tab element ids with the tab- prefix", () => {
    // `getTabId` exportada se testea directo (plan → Estrategia de tests;
    // "Hecho cuando" de T1: getTabId("about") === "tab-about"). Consumidor:
    // AppLayout, para el `aria-labelledby` del tabpanel (spec → API).
    expect(getTabId("about")).toBe("tab-about");
    expect(getTabId("resume")).toBe("tab-resume");
  });

  // extra: unión G-B de la `className` externa (motivo en el comentario del
  // encabezado; P3). La coexistencia con la clase base se asierte — no el
  // orden del atributo `class` (criterio de la fase: resuelve la hoja de
  // estilos, no el orden).
  it("transmits an external className to the piece root, joined with the CornerTab base class", () => {
    const consumerClass = "nav-tabs-external";

    renderNavTabs({ className: consumerClass });

    // El raíz de la pieza es el `<div>` de CornerTab que envuelve el tablist
    // (spec → Anatomía): seleccionado desde el tablist por rol accesible, sin
    // query estructural sobre el container.
    const root = screen.getByRole("tablist").parentElement;
    expect(root).not.toBeNull();
    expect(root).toHaveClass(consumerClass);
    // Transmitida a la clase base de CornerTab (spec → API): la unión NO la
    // reemplaza (la unión en CornerTab ya la asierte su propio archivo).
    expect(root).toHaveClass(cornerTabBaseClass);
  });
});

// --- T2 · Click: activación controlada y guard del activo (RF-3) ------------
// spec → Tests esperados 4 y 5 / "Hecho cuando" de T2: click en inactivo →
// `onChange(id)` una vez; click en el activo → cero llamadas. El spy se pasa
// por `overrides` (el default `vi.fn()` de renderNavTabs queda intacto:
// agregado puro). queries: `getByRole("tab", { name })` (rol + nombre
// accesible, constitución T3). Sin assert de foco: tras click el foco queda
// en el tab pulsado por vía NATIVA del `<button>` (spec → Comportamiento,
// plan → Decisiones "foco propio solo en teclado"); NavTabs no re-gestiona el
// foco en click — nada que asiértar en jsdom (inspección de la ausencia de
// `.focus()` en el handler, T2). `onChange` del inactivo se espera con el id
// del item ("resume"), no con el id DOM del tab (`getTabId` es solo de
// elementos — spec → API).
describe("NavTabs click activation and active-tab guard (T2: RF-3)", () => {
  it("calls onChange once with the item id when an inactive tab is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // activeId="about" (default del helper): "Resume" es el inactivo.
    renderNavTabs({ onChange });

    await user.click(screen.getByRole("tab", { name: "Resume" }));

    // RF-3 (CUANDO): "click en un tab inactivo → invoca onChange(id) una
    // vez" — call-count exacto sobre el spy (precedente LS T2).
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("resume");
  });

  it("does not call onChange when the already-active tab is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderNavTabs({ onChange });

    // El guard (RF-3, SI-clause) solo aplica sobre el ACTIVO: se fija primero
    // que About lo está (aria-selected="true"), para que el test no sea vacío
    // — sin este assert contaría cero llamadas por casualidad, no por el
    // guard (guard "no vacío", precedente LanguageSwitcher T2, decisión 2=a).
    const activeTab = screen.getByRole("tab", { name: "About" });
    expect(activeTab).toHaveAttribute("aria-selected", "true");

    await user.click(activeTab);

    // RF-3 (SI): "click en el tab activo → no lo invoca" (spec → Comportamiento:
    // "Click en el tab ya activo: No llama onChange").
    expect(onChange).not.toHaveBeenCalled();
  });
});
