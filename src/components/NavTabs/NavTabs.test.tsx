// Tests de T1–T4 (specs/layout/NavTabs/tasks.md) — T1: RF-1, RF-2, RF-7: un tablist
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
// Diferidos por tasks.md: ya no hay — `NavTabs.module.css`, `index.ts` y el
// cierre `expectNoA11yViolations` llegaron con esta tarea T4 (RF-5, RF-6;
// criterio Separator T1–T2 y CornerTab T1–T3, que agregaron el cierre en la
// última tarea). Los visuales de RF-5 (color/opacidad/subrayado) y de RF-6
// (visible en todos los breakpoints, sin hamburguesa) no son verificables en
// jsdom por tests: inspección del CSS y QA F5 (#101). Los escenarios de
// teclado de T3 (RF-4) viven en su describe final; el cierre axe de T4 va
// todavía más abajo, al cierre del archivo (constitución T4).
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

// T4: helper de cierre a11y (constitución T4). Import puro: no toca los casos
// de T1–T3 (precedente CornerTab T4).
import { expectNoA11yViolations } from "../../test/a11y";

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

// --- T3 · Teclado: ←/→ circular, Home/End, Espacio, single-item (RF-4) -------
// spec → Tests esperados 6–9 y "Hecho cuando" de T3 (RF-4 post-Clarificación 6:
// activación automática = mover foco + emitir `onChange`). Posicionamiento del
// foco: `user.tab()` (roving de T1: el único tabulable es el activo; precedente
// LanguageSwitcher T2) y `.focus()` DIRECTO cuando hay que posar el foco en un
// INACTIVO sin pasar por su click (el click es RF-3, ya testeado en T2; acá
// interesa la ruta teclado pura; jsdom permite focus() programático sobre
// `tabindex="-1"`). Emisión con call-counts EXACTOS (precedente LS T2) y foco
// con `toHaveFocus` (plan → Estrategia de tests).
// Discrimen del Espacio sobre la simulación NATIVA: user-event v14 dispara el
// click del `<button>` en el keyup de Espacio SOLO si el keydown NO fue
// defaultPrevented (event/behavior/keyup.js + pressed.isUnprevented en
// system/keyboard.js). Por eso el call-count de Espacio NACERÍA verde
// (ruta nativa: 1 llamada en el inactivo; 0 en el activo por el guard de T2):
// el discriminator honesto es `defaultPrevented === true` del keydown,
// capturado con un listener DOM NATIVO en el tab (addEventListener por fuera
// de React: se guarda el evento y se lee su `defaultPrevented` FINAL, tras
// todos los handlers; la invariante del listener nativo es legítima porque lo
// que se prueba es un efecto DOM de RF-4, no un detalle de implementación).
// El call-count exacto 1 sigue asiértado: sin el preventDefault habría 2
// llamadas (manual + click nativo de keyup) — doble activación, exactamente lo
// que la decisión "Espacio" del plan evita.
// Declarados #101 (VERDE on-arrival): (a) single-item: hoy no hay handler y
// nace verde; su honestidad es el anclaje `toHaveFocus` EN EL PROPIO tab más el
// guard no vacío de aria-selected; el discrimen real es la inspección del
// reviewer: onKeyDown existe y el wrap `(i±1+n)%n` con n=1 enfoca el propio tab
// sin emitir (destino===activo); (b) ↑/↓: nace verde por ausencia de handler y
// debe seguir verde con T3 fiel (RF-4: "↑/↓ no mueven el foco"; la spec NO pide
// preventDefault para ellas → no se inventa). Su valor fija los casos negativos
// de RF-4 contra regresiones. Enter no se teste aparte: comparte el activation
// behavior nativo del `<button>` con Espacio (precedente ThemeToggle T2; la
// spec no lo lista como escenario separado).
describe("NavTabs keyboard roving and Space activation (T3: RF-4)", () => {
  it("wraps ArrowRight from the last focused tab to the first, focusing and emitting", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // activeId="resume": el último tab es además el activo y el único
    // tabulable — así `user.tab()` cumple el "Hecho cuando" de partida "con
    // foco en el último" sin pasar por un click (RF-3 es de T2).
    renderNavTabs({ activeId: "resume", onChange });

    await user.tab();
    expect(screen.getByRole("tab", { name: "Resume" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");

    // RF-4: vuelta circular al primero + foco + emisión de su `onChange`
    // (activación automática; About es inactivo → guard destino≠activo).
    expect(screen.getByRole("tab", { name: "About" })).toHaveFocus();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("about");
  });

  it("wraps ArrowLeft from the first focused tab to the last, focusing and emitting", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // activeId="about" (default): foco inicial en el primero (tabulable por
    // roving), ArrowLeft → último (Resume, inactivo).
    renderNavTabs({ onChange });

    await user.tab();
    expect(screen.getByRole("tab", { name: "About" })).toHaveFocus();

    await user.keyboard("{ArrowLeft}");

    // spec → Tests 7 / RF-4: desde el primero va al último con vuelta.
    expect(screen.getByRole("tab", { name: "Resume" })).toHaveFocus();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("resume");
  });

  it("Home from the focused last tab moves focus to the first and emits its onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderNavTabs({ activeId: "resume", onChange });

    await user.tab();
    expect(screen.getByRole("tab", { name: "Resume" })).toHaveFocus();

    await user.keyboard("{Home}");

    // spec → Tests 8 / "Hecho cuando" de T3: Home enfoca y emite el primero.
    expect(screen.getByRole("tab", { name: "About" })).toHaveFocus();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("about");
  });

  it("End from the focused first tab moves focus to the last and emits its onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderNavTabs({ onChange });

    await user.tab();
    expect(screen.getByRole("tab", { name: "About" })).toHaveFocus();

    await user.keyboard("{End}");

    // spec → Tests 8 / "Hecho cuando" de T3: End enfoca y emite el último.
    // Render independiente del de Home: como la pieza es CONTROLADA,
    // encadenar Home+End en el mismo render dejaría `activeId` en "resume" y
    // el End golpearía el guard destino===activo (no emitiría) — cada RF-4
    // emisión se mide fresca.
    expect(screen.getByRole("tab", { name: "Resume" })).toHaveFocus();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("resume");
  });

  // #101 VERDE on-arrival (motivo en el bloque de encabezado de T3).
  it("keeps focus on the only tab and emits nothing when arrows are pressed with a single item", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderNavTabs({ items: [{ id: "about", label: "About" }], onChange });

    await user.tab();
    const onlyTab = screen.getByRole("tab", { name: "About" });
    // Guard "no vacío": el único item es el activo (el wrap destino≠activo es
    // lo que corta la emisión, no un activeId cualquiera).
    expect(onlyTab).toHaveAttribute("aria-selected", "true");
    expect(onlyTab).toHaveFocus();

    // spec → Tests 9 / RF-4 SI-clause: "SI el tab resultante es el mismo (un
    // solo item), ENTONCES no emite onChange" — y "Hecho cuando": las flechas
    // enfocan el propio tab (no fallan).
    await user.keyboard("{ArrowRight}");
    expect(onlyTab).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(onlyTab).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("prevents the default on Space over a focused inactive tab and emits exactly once", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderNavTabs({ onChange }); // activo About; Resume inactivo

    const inactiveTab = screen.getByRole("tab", { name: "Resume" });
    // Foco directo en el INACTIVO: la ruta teclado pura sin click (el click ya
    // cubre RF-3 en T2); jsdom permite focus() programático sobre tabindex="-1".
    inactiveTab.focus();
    expect(inactiveTab).toHaveFocus();

    // Spy del evento NATIVO (encabezado T3): se guarda el keydown y se lee su
    // `defaultPrevented` final, después de todos los handlers.
    const keydownEvents: KeyboardEvent[] = [];
    inactiveTab.addEventListener("keydown", (event) => {
      keydownEvents.push(event);
    });

    await user.keyboard(" ");

    // RF-4 / plan → Decisiones "Espacio": preventDefault en keydown (no scrollea
    // la página) cancela el click nativo de keyup y la activación es MANUAL por
    // el mismo camino del click → UNA sola emisión (sin preventDefault serían
    // 2: manual + nativa — doble activación prohibida por "Hecho cuando").
    expect(keydownEvents).toHaveLength(1);
    expect(keydownEvents[0]?.defaultPrevented).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("resume");
    expect(inactiveTab).toHaveFocus(); // Espacio no mueve el foco
  });

  it("prevents the default on Space over the already-active tab without emitting", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderNavTabs({ onChange });

    const activeTab = screen.getByRole("tab", { name: "About" });
    // Guard "no vacío" (precedente LS T2): first se fija que es el ACTIVO.
    expect(activeTab).toHaveAttribute("aria-selected", "true");
    await user.tab();
    expect(activeTab).toHaveFocus();

    const keydownEvents: KeyboardEvent[] = [];
    activeTab.addEventListener("keydown", (event) => {
      keydownEvents.push(event);
    });

    await user.keyboard(" ");

    // RF-4: Espacio SIEMPRE hace preventDefault; la activación va por el mismo
    // camino que el click y el guard del activo (RF-3, compartido) → 0 emisiones.
    // Nacería verde SOLO con el count (hoy: click simulado de keyup + guard → 0);
    // el assert de `defaultPrevented` es el discriminator rojo-on-arrival (hoy
    // no hay handler: false).
    expect(keydownEvents).toHaveLength(1);
    expect(keydownEvents[0]?.defaultPrevented).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
    expect(activeTab).toHaveFocus();
  });

  // #101 VERDE on-arrival (motivo en el bloque de encabezado de T3).
  it("leaves ArrowUp and ArrowDown without effect on a focused tab (horizontal tablist)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderNavTabs({ activeId: "resume", onChange });

    await user.tab();
    const focusedTab = screen.getByRole("tab", { name: "Resume" });
    expect(focusedTab).toHaveFocus();

    // RF-4: "↑/↓ no mueven el foco (tablist horizontal)" y "las demás teclas
    // quedan al comportamiento nativo sin efecto adicional" → no se les hace
    // preventDefault (no se inventa más; plan → Decisiones: ↑/↓ ignoradas).
    await user.keyboard("{ArrowUp}");
    expect(focusedTab).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();

    await user.keyboard("{ArrowDown}");
    expect(focusedTab).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
  });
});

// --- T4 · Cierre a11y con armazón tabpanel (RF-5, RF-6) ----------------------
// spec → Tests esperados 12 y "Hecho cuando" de T4: el archivo termina con
// `expectNoA11yViolations` "renderizado junto a un tabpanel con el id
// correcto" (spec → Accesibilidad). El armazón NO es decorativo: sin él el
// `aria-controls={panelId}` de todos los tabs (RF-2) apunta a un id inexistente
// y axe lo reporta (`aria-valid-attr-value`); en el escenario real el panel lo
// renderiza AppLayout (RF-2: "la existencia y el contenido de ese panel son
// responsabilidad de AppLayout"), acá se replica el patrón de spec → Anatomía:
// `div role="tabpanel"` con `id={panelId}`, `aria-labelledby={getTabId(
// activeId)}` — el contrato exacto que consume AppLayout vía `getTabId`
// exportada (spec → API)— y `tabIndex={0}` (spec → Accesibilidad: el panel
// empieza con texto, no con un control). Sin proveedores (la pieza es
// controlled: todo por props; plan → Estrategia de tests) y sin
// `AccentGradientDefs`/`HexAvatarDefs`: ni la pieza ni CornerTab montan
// gradientes ni SVG (plan → Estrategia de tests).
// La rama `items=[]` no va en este cierre: no renderiza nada (RF-7, ya
// asierteado en T1 con `toBeEmptyDOMElement`) — no hay DOM que auditar
// ("Hecho cuando" de T4: "con `items=[]` no aplica render").
// #101 VERDE on-arrival DECLARADO (encargo de T4; criterio CornerTab T4): el
// markup ya era accesible desde T1 (roles, nombres, ids, `aria-*` y roving
// asierteados allí) y T4 no agrega nada discriminate-testable en jsdom: el
// módulo CSS (RF-5: color de acento/opacidad 0.8/subrayado hover; RF-6: cero
// `@media` propios, visibilidad en todos los breakpoints) no lo carga jsdom —
// inspección del CSS + QA F5 — y el `index.ts` no es observable por tests.
// Fabricar un rojo leyendo el CSS como texto está explícitamente descartado
// (#101); el valor del cierre es la regresión futura sobre el patrón completo
// tablist+tabpanel.
describe("NavTabs accessibility audit with tabpanel scaffold (T4: RF-5, RF-6)", () => {
  it("has no accessibility violations rendering the tablist together with its controlled tabpanel", async () => {
    const { container } = render(
      <>
        <NavTabs
          items={TAB_ITEMS}
          activeId="about"
          onChange={vi.fn()}
          panelId={PANEL_ID}
          label={LABEL}
        />
        <div
          role="tabpanel"
          id={PANEL_ID}
          aria-labelledby={getTabId("about")}
          tabIndex={0}
        >
          Panel content.
        </div>
      </>,
    );

    await expectNoA11yViolations(container);
  });
});
