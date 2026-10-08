// Tests de T1–T2 (specs/controls/ControlsBar/tasks.md) — T1: RF-2, RF-3 ·
// T2: cierre a11y del archivo (RF-1/RF-5/RF-6 se verifican por INSPECCIÓN del
// CSS de ControlsBar.module.css, no testeable en jsdom; decisión #101).
// Armazón (plan → Estrategia de tests): ThemeProvider + LocaleProvider REALES
// (spec → Tests esperados, textual: "los tests envuelven ThemeProvider y
// LocaleProvider — los hijos consumen ambos contextos"). Semilla default
// claro/en: sin `data-theme` ni `lang` sembrados, `readInitialTheme()` cae en
// "light" y `readInitialLocale()` en DEFAULT_LOCALE "en" (i18n.md/theming.md),
// y el `afterEach` global de `src/test/setup.ts` limpia `data-theme`, `lang` y
// `localStorage` entre tests (precedente ThemeToggle T1 / LanguageSwitcher T2,
// que usan el mismo camino anti-flash sin mock de módulos: acá no hay
// call-count que medir — la integración de `setLocale` ya la cubre
// LanguageSwitcher.test.tsx y LocaleProvider.test.tsx y no se duplica).
//
// Justificación de las queries (constitución T3): `getByRole("banner")` (el
// `<header>` raíz toma el rol banner de su semántica nativa, spec → RF-2,
// sin `aria-label` propio: los nombres van al group),
// `getByRole("group", { name: t.controls.label })` (spec → Accesibilidad:
// "Grupo con nombre"), y dentro del grupo los controles POR ROL + NOMBRE:
// `getByRole("button", { name: "Dark mode" })` (ThemeToggle: el label nombra
// el modo al que se va, spec hermana RF-3) y el grupo anidado del
// LanguageSwitcher con sus dos botones de nombres fijos "English"/"Español"
// (NO traducidos, spec hermana → "No hacer"). `within` fija la CONTENCIÓN del
// "Hecho cuando" (el banner CONTIENE el group y el group CONTIENE ambos
// controles; spec → Anatomía). Los strings replican los valores REALES de
// ui.en.ts / ui.es.ts (C3: llegan del provider, no se hardcodean en el
// componente). La clase base de la unión (#99) se fija con el patrón canónico
// `styles.name ?? "name"` (prohibidos `!` y `as`; precedente ThemeToggle/LS).
//
// Diferidos: ninguno en los tests — T2 AGREGÓ el cierre `expectNoA11yViolations`
// al final del archivo (constitución T4; tasks.md → T2 "el archivo termina con
// expectNoA11yViolations"; ídem LS/ThemeToggle T3, asserts de T1 intactos:
// agregado puro). Los asserts de layout (RF-1/RF-5/RF-6: flex-end,
// --size-control, --z-controls, --controls-gap) son INSPECCIÓN del CSS en T2
// (#101, no testeable en jsdom) y se verifican contra la tabla "Estilos y
// tokens" de la spec. RF-4 (orden tras el skip link) y la unicidad del banner
// son invariantes de AppLayout/F4 (plan → Decisiones): sin tarea ni test acá.
// extra: el describe de unión G-B del raíz no está en la lista de "Tests
// esperados" de la spec, pero la API la exige (spec → API: "Se une a la clase
// base del <header> raíz") y T1 la implementa; se agrega como rojo discrimin-
// testeable replicando el patrón aprobado en ThemeToggle T1 y LanguageSwitcher
// T1 (P3: marcado con su motivo).

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LocaleProvider } from "../../providers/LocaleProvider";
import { ThemeProvider } from "../../providers/ThemeProvider";

import { ControlsBar } from "./ControlsBar";

// T2: helper de cierre a11y (constitución T4); import puro, no toca lo anterior
// (precedente Badge/Overhead/LanguageSwitcher).
import { expectNoA11yViolations } from "../../test/a11y";

// El test importa el módulo solo para fijar el nombre real de la clase base
// (`controlsBar`, resuelto por CSS Modules en runtime) y asierte la
// coexistencia con la clase del consumidor en el raíz (precedente
// ThemeToggle/LanguageSwitcher: el módulo nace con la unión de `className`,
// con la clase base vacía; los estilos por tokens llegan en T2).
import styles from "./ControlsBar.module.css";

// Valores REALES de t.controls en ui.en.ts / ui.es.ts (C3: el componente los
// lee de useLocale().t; el test los replica para nombrar roles).
const GROUP_LABEL_EN = "Display settings";
const GROUP_LABEL_ES = "Ajustes de visualización";
const DARK_MODE_LABEL_EN = "Dark mode";
const DARK_MODE_LABEL_ES = "Modo oscuro";
const LS_GROUP_LABEL_EN = "Language";
const LS_GROUP_LABEL_ES = "Idioma";

// Nombres fijos, NO traducidos (spec LanguageSwitcher → "No hacer"): se
// asertan literales en ambos idiomas.
const ENGLISH_LABEL = "English";
const SPANISH_LABEL = "Español";

const controlsBarClass = styles.controlsBar ?? "controlsBar";

function renderBar() {
  return render(
    <ThemeProvider>
      <LocaleProvider>
        <ControlsBar />
      </LocaleProvider>
    </ThemeProvider>,
  );
}

describe("ControlsBar banner with named group (T1: RF-2)", () => {
  it("renders a banner containing a Display settings group with both controls inside", () => {
    renderBar();

    // "Hecho cuando" de T1: getByRole("banner") CONTIENE un group con
    // aria-label={t.controls.label} y AMBOS controles por rol+nombre (RF-2 +
    // spec → Accesibilidad "Grupo con nombre"; semántica del <header> → rol
    // banner nativo, sin aria-label propio: los nombres van al group).
    const banner = screen.getByRole("banner");
    const group = within(banner).getByRole("group", { name: GROUP_LABEL_EN });

    // ThemeToggle en tema claro (semilla default): nombre = darkModeLabel
    // traducido ("Dark mode"), un botón.
    within(group).getByRole("button", { name: DARK_MODE_LABEL_EN });

    // LanguageSwitcher: grupo anidado nombrado por t.controls.language con
    // sus dos botones de nombres fijos (spec → Anatomía: vive DENTRO del
    // group de la barra).
    const switcher = within(group).getByRole("group", {
      name: LS_GROUP_LABEL_EN,
    });
    within(switcher).getByRole("button", { name: ENGLISH_LABEL });
    within(switcher).getByRole("button", { name: SPANISH_LABEL });
  });
});

describe("ControlsBar translated child labels on locale change (T1: RF-3)", () => {
  it("switching to Español renames the group and the ThemeToggle label while option names stay fixed", async () => {
    const user = userEvent.setup();
    renderBar();

    await user.click(screen.getByRole("button", { name: SPANISH_LABEL }));

    // RF-3 + "Hecho cuando": al elegir español el group pasa a
    // "Ajustes de visualización" (t.controls.label de ui.es.ts, leído vía el
    // LocaleProvider REAL).
    expect(
      screen.getByRole("group", { name: GROUP_LABEL_ES }),
    ).toBeInTheDocument();
    // El nombre en inglés ya no existe: el rename es completo, no duplicado.
    expect(
      screen.queryByRole("group", { name: GROUP_LABEL_EN }),
    ).not.toBeInTheDocument();

    // ThemeToggle expone sus labels en español: en claro el activo nombra el
    // modo al que se va → "Modo oscuro" (t.controls.darkMode de ui.es.ts).
    expect(
      screen.getByRole("button", { name: DARK_MODE_LABEL_ES }),
    ).toBeInTheDocument();

    // El grupo del LanguageSwitcher también se renombra (su prop `label`
    // sale de t.controls.language) y los nombres de botón NO se traducen.
    expect(
      screen.getByRole("group", { name: LS_GROUP_LABEL_ES }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("group", { name: LS_GROUP_LABEL_ES })).getByRole(
        "button",
        { name: ENGLISH_LABEL },
      ),
    ).toBeInTheDocument();
  });
});

describe("ControlsBar className joining (T1: spec → API, G-B)", () => {
  // extra: unión G-B del raíz <header> — la exige la API de la spec y T1 la
  // implementa; la lista de "Tests esperados" no la trae (motivo en el
  // encabezado; patrón aprobado en ThemeToggle/LS T1).
  it("joins an external className to the base class on the root banner header", () => {
    const consumerClass = "app-layout-controls";

    render(
      <ThemeProvider>
        <LocaleProvider>
          <ControlsBar className={consumerClass} />
        </LocaleProvider>
      </ThemeProvider>,
    );

    // Unión #99: la clase externa COEXISTE con la base (`controlsBar`) en el
    // único raíz <header> (spec → API: "Se une a la clase base del <header>
    // raíz"); rige la hoja de estilos, no el orden del atributo class.
    const banner = screen.getByRole("banner");
    expect(banner).toHaveClass(controlsBarClass);
    expect(banner).toHaveClass(consumerClass);
  });
});

// Test de T3 (specs/controls/ControlsBar/tasks.md) — RF-6 (Cambio F5
// 2026-10-08, hallazgo B-2 de `docs/qa-report.md`, decisión #104): el `<header>`
// raíz renderiza el hook `data-print-hide` del contrato de impresión.
// `global.css` lo oculta con la variante compuesta `header[data-print-hide]`
// (0,1,1), que GANA por especificidad a la clase hasheada del módulo (0,1,0):
// en impresión la barra desaparece (spec → RF-6; "No hacer": la pieza no
// declara `@media print`, lo ocultan los estilos compartidos). TEST
// ESTRUCTURAL SIMPLE, literal del "Hecho cuando": `expect(banner).toHave-
// Attribute("data-print-hide")` sobre el banner (query por rol, constitución
// T3: el `<header>` expone el rol banner por semántica nativa, RF-2). El
// atributo NO es `aria-*` ni cambia estructura/estilos: los asserts de T1/T2
// (contención, rename por idioma, unión G-B, cierre axe) siguen fijando el
// resto del contrato y quedan intactos. Rojo on-arrival legítimo: el atributo
// aún no está en el markup del raíz (patrón aprobado en CornerTab T5, hermana
// del mismo paquete de correcciones #104).
describe("ControlsBar print hook on the root banner (T3: RF-6)", () => {
  it("renders data-print-hide on the root banner header", () => {
    renderBar();

    // "Hecho cuando" de T3 (literal): el <header> raíz expone el hook para
    // que header[data-print-hide] de global.css gane a la clase del módulo.
    expect(screen.getByRole("banner")).toHaveAttribute("data-print-hide");
  });
});

// Test de T2 (specs/controls/ControlsBar/tasks.md) — cierre del archivo
// (constitución T4; spec → Tests esperados: "expectNoA11yViolations sin
// violaciones").
//
// UNA SOLA RAMA auditada, la default (en + claro, la misma semilla de
// renderBar): la spec lista UN solo caso de axe, a diferencia de las hermanas
// (ThemeToggle → Tests "cierre en las dos ramas de tema" según su plan;
// LanguageSwitcher → "con cada idioma activo") y la spec manda: no se inventa
// alcance (skill sdd → EARS/Tests esperados). Refuerzo: la única diferencia
// entre las ramas en/es del DOM auditado es el TEXTO de los labels (roles,
// estructura header > group > controles y atributos idénticos — el rename ya
// lo fijan los describes de T1), y la diferencia de tema vive DENTRO de
// ThemeToggle (su label/aria-pressed/glifo), ya auditada en las dos ramas del
// cierre T3 de su propio archivo. La rama se FIJA con el assert del group en
// inglés (criterio TT/LS T3: sin un assert de rama el caso no distingue lo
// que audita).
//
// Sin AccentGradientDefs ni HexAvatarDefs (regla del agente): los hijos no
// usan `Icon tone="gradient"` (ThemeToggle monta `tone="current"`;
// LanguageSwitcher no usa Icon) y la barra no pinta SVG propio.
//
// Decisión #101 (VERDE on-arrival, declarado en el commit test): el markup de
// T1 ya es accesible (banner semántico, group nombrado, toggle button con
// aria-pressed y botones del switcher nombrados), así que el cierre nace
// verde; lo que discrimina T2 es la INSPECCIÓN de los estilos por tokens del
// módulo (RF-1/RF-5/RF-6: pseudo-clases y @media no son testeables en jsdom;
// leer el CSS como texto sería un rojo artificial descartado en #101;
// precedente exacto ThemeToggle/LS T3). No es vacío: una regresión del patrón
// (p. ej. perder el aria-label del group o del switcher) la capturaría axe.
describe("ControlsBar accessibility audit (T2: cierre, spec → Tests)", () => {
  it("has no accessibility violations with the default English/light branch", async () => {
    const { container } = renderBar();

    // Fija la rama auditada (en + claro por defecto, sin data-theme ni lang
    // sembrados: readInitialTheme → "light", readInitialLocale → "en").
    expect(
      screen.getByRole("group", { name: GROUP_LABEL_EN }),
    ).toBeInTheDocument();

    await expectNoA11yViolations(container);
  });
});
