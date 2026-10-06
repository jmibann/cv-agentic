// Tests de T1–T3 (specs/controls/LanguageSwitcher/tasks.md) — T1: RF-1,
// RF-4 · T2: RF-2, RF-3, RF-5 (estado activo, `setLocale` + guard, tab stops) ·
// T3: cierre a11y del archivo (RF-6 se verifica por INSPECCIÓN del CSS).
// Armazón (plan → Decisiones "Harness doble"): el archivo corre con el mock de
// módulo de `../../providers/LocaleProvider` ARMADO (`vi.mock` +
// `vi.hoisted`): `useLocale()` devuelve `{ locale, setLocale: espión, t }`
// controlable, así los call-count/guard (RF-2/RF-3) son exactos y los renders
// van sin provider. La integración con el `LocaleProvider` REAL (pressed,
// `<html lang>`, `localStorage["cv:locale"]`) DESARMA el harness en su propio
// `beforeEach` (va primero el outer y luego el inner): semilla del idioma vía
// `document.documentElement.lang = "es"` ANTES del render — `readInitialLocale`
// lee SOLO ese atributo resuelto, el camino del anti-flash (precedente exacto
// ThemeToggle T3 con `data-theme`); el `afterEach` global de
// `src/test/setup.ts` limpia `lang` y `localStorage` entre tests. La
// DELEGACIÓN del mock (`actual.useLocale()` cuando está desarmado) es
// necesaria porque `vi.mock` actúa a nivel de archivo: un mock absoluto
// rompería los describes de provider real del mismo archivo (desvío mínimo y
// documentado del mock ingenuo "con `useLocale: () => …`" del plan). Sin mock,
// los renders sueltos de T1 romperían en `feat(T2)` (el componente pasaría a
// exigir provider) — con el harness armado por defecto, las líneas de T1
// quedan intactas (agregado puro, skill sdd → "los test(Tn) solo agregan").
// G-A: el componente NO toca storage ni DOM global; lang/storage se asertan
// en integración y su lógica propia la cubre `LocaleProvider.test.tsx` (plan →
// Decisiones).
//
// Justificación de las queries (constitución T3): patrón del spec → Tests
// esperados, textual — `getByRole("group", { name: label })` (el nombre
// accesible sale del `aria-label` del grupo, RF-4), `getAllByRole("button")`
// en orden con su `textContent` (RF-1: el texto visible "EN"/"ES" NO es el
// nombre accesible: cada botón lo fija su `aria-label`, que gana sobre el
// texto) y `getByRole("button", { name: "English" | "Español" })` (RF-4). La
// clase base de la unión (#99) se fija con el patrón canónico
// `styles.name ?? "name"` (prohibidos `!` y `as`), precedente ThemeToggle T1.
//
// Diferidos: ninguno en los tests — T3 AGREGÓ el cierre `expectNoA11yViolations`
// al final del archivo (constitución T4, ídem ThemeToggle T3; los describes de
// T1/T2 quedan ANTES de ese cierre, asserts intactos: agrego puro). Los estilos
// por tokens del módulo y `index.ts` llegan en `feat(LanguageSwitcher): T3`: su
// verificación es la INSPECCIÓN del CSS (pseudo-estados y @media no son
// testeables en jsdom; decisión #101: el cierre nace VERDE on-arrival porque el
// markup de T1/T2 ya es accesible — se declara en el mensaje del commit test).

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

import { LocaleProvider } from "../../providers/LocaleProvider";
import type { LocaleContextValue } from "../../providers/LocaleProvider";
import type { Locale } from "@data/cv.types.generated";

import { LanguageSwitcher } from "./LanguageSwitcher";

// T3: helper de cierre a11y (constitución T4); import puro, no toca lo anterior
// (precedente Badge/Overhead/SectionTitle).
import { expectNoA11yViolations } from "../../test/a11y";

// El test importa el módulo solo para fijar el nombre real de la clase base
// (`languageSwitcher`, resuelto por CSS Modules en runtime) y asierte la
// coexistencia con la clase del consumidor en el raíz (precedente
// ThemeToggle/Badge/IconBox: el módulo nace con la unión de `className`, con
// la clase base vacía; los estilos por tokens llegan en T3).
import styles from "./LanguageSwitcher.module.css";

// --- Harness b (plan → "Harness doble"): mock de módulo del provider -------
// Estado mutable del espión: `vi.hoisted` corre antes que los imports
// (requisito de `vi.mock`, cuyo factory se evalúa durante la carga de los
// imports estáticos del archivo); por eso todo lo referenciable desde el
// factory vive acá o dentro del propio factory. `active: true` por defecto:
// el componente consume el valor falso SIN provider (el describe de
// integración lo desarma en su propio beforeEach; ver encabezado). Tipado
// honesto sin `as`: el objeto devuelto se anota `LocaleContextValue` — el
// completo (locale + setLocale + `t` real: `uiEn` importado dinámicamente en
// el factory, único `t` del tipo `UiStrings` del contexto).
type SetLocaleFn = LocaleContextValue["setLocale"];

interface LocaleHarness {
  active: boolean;
  locale: Locale;
  setLocale: Mock<SetLocaleFn>;
}

const localeHarness = vi.hoisted((): LocaleHarness => ({
  active: true,
  locale: "en",
  setLocale: vi.fn<SetLocaleFn>(),
}));

vi.mock("../../providers/LocaleProvider", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../providers/LocaleProvider")>();
  const { uiEn } = await import("../../i18n/ui.en");
  const harnessValue = (): LocaleContextValue => ({
    locale: localeHarness.locale,
    setLocale: localeHarness.setLocale,
    t: uiEn,
  });
  return {
    ...actual,
    // Desarmado: delega en el `useLocale` REAL (el contexto del
    // LocaleProvider de verdad); armado: valor falso con el espión
    // (call-count exacto de RF-2/RF-3). `LocaleProvider`/`useCv` se
    // conservan vía el spread de `actual`.
    useLocale: () =>
      localeHarness.active ? harnessValue() : actual.useLocale(),
  };
});

// Harness por defecto de cada test: mock armado con idioma falso "en" y
// contador del espión a cero. Vitest corre el beforeEach outer ANTES del
// inner, así que el describe de integración puede desarmar tranquilo. Sin
// afterEach: el propio beforeEach re-setea el estado completo cada vez.
beforeEach(() => {
  localeHarness.active = true;
  localeHarness.locale = "en";
  localeHarness.setLocale.mockReset();
});

// RF-4 / C3: el label del grupo llega traducido por prop (spec → API:
// "Ej: \"Language\" / \"Idioma\""); el valor replica controls.language de
// ui.en.ts.
const GROUP_LABEL = "Language";

// Nombres fijos, NO traducidos (spec → "No hacer"): se asertan literals.
const ENGLISH_LABEL = "English";
const SPANISH_LABEL = "Español";

const languageSwitcherClass = styles.languageSwitcher ?? "languageSwitcher";

describe("LanguageSwitcher group (T1: RF-4)", () => {
  it("renders a group named by the label prop containing two type=button options", () => {
    render(<LanguageSwitcher label={GROUP_LABEL} />);

    // "Hecho cuando" de T1: getByRole("group", { name: label }) con dos
    // botones. `within` fija además que las opciones viven DENTRO del grupo
    // (spec → Anatomía: grupo segmentado con dos botones). `type="button"` es
    // literal de RF-4 ("cada opción como <button type=\"button\">"): botón de
    // acción, nunca de submit.
    const group = screen.getByRole("group", { name: GROUP_LABEL });
    const buttons = within(group).getAllByRole("button");

    expect(buttons).toHaveLength(2);
    for (const button of buttons) {
      expect(button).toHaveAttribute("type", "button");
    }
  });
});

describe("LanguageSwitcher options order (T1: RF-1)", () => {
  it("shows one option per LOCALES entry, in order, with fixed visible text EN then ES", () => {
    render(<LanguageSwitcher label={GROUP_LABEL} />);

    // RF-1 / spec → Tests esperados, textual: getAllByRole("button") →
    // ["EN", "ES"] por textContent, en el orden de LOCALES de @data/constants
    // (["en", "es"]); la lista NO se hardcodea en el componente.
    const buttons = screen.getAllByRole("button");
    expect(buttons.map((button) => button.textContent)).toEqual(["EN", "ES"]);
  });
});

describe("LanguageSwitcher option names and lang (T1: RF-4)", () => {
  it("gives each button its fixed aria-label and its own lang attribute", () => {
    render(<LanguageSwitcher label={GROUP_LABEL} />);

    // RF-4 / spec → tabla "Nombres fijos": en → "English" + lang="en";
    // es → "Español" + lang="es" (el `lang` propio es para que el lector de
    // pantalla lo pronuncie bien, spec → Accesibilidad).
    expect(screen.getByRole("button", { name: ENGLISH_LABEL })).toHaveAttribute(
      "lang",
      "en",
    );
    expect(screen.getByRole("button", { name: SPANISH_LABEL })).toHaveAttribute(
      "lang",
      "es",
    );
  });
});

describe("LanguageSwitcher className joining (T1: spec → API, G-B)", () => {
  it("joins an external className to the base class on the root group", () => {
    const consumerClass = "controls-bar-language";

    render(<LanguageSwitcher label={GROUP_LABEL} className={consumerClass} />);

    // Unión #99: la clase externa COEXISTE con la base (`languageSwitcher`)
    // en el único raíz role="group" (spec → API: "Se une a la clase base del
    // role=\"group\" raíz"); rige la hoja de estilos, no el orden del
    // atributo class (precedente Box/Icon/Badge/ThemeToggle).
    const group = screen.getByRole("group", { name: GROUP_LABEL });
    expect(group).toHaveClass(languageSwitcherClass);
    expect(group).toHaveClass(consumerClass);
  });
});

// --- T2 · Harness a: LocaleProvider REAL (plan → "Harness doble") ----------
// RF-2 se lee acá en integración (G-A): el "Hecho cuando" de T2 siembra el
// idioma activo vía `document.documentElement.lang` ANTES del render —
// `readInitialLocale()` del provider lee solo ese atributo, el mismo camino
// que deja el script anti-flash de `index.html` (i18n.md → "Resolución del
// idioma inicial"; precedente ThemeToggle T3 con `data-theme`). El afterEach
// global de `src/test/setup.ts` limpia `lang` y `localStorage` entre tests.
describe("LanguageSwitcher active state (T2: RF-2, real LocaleProvider)", () => {
  // Desarma el mock de módulo: el `useLocale` del componente delega en el
  // contexto real del LocaleProvider que envuelve el render.
  beforeEach(() => {
    localeHarness.active = false;
  });

  it("marks the button of the seeded active locale as pressed and the other as not pressed", () => {
    // Semilla anti-flash: español activo. Sin esto el archivo entero nacería
    // en "en" (DEFAULT_LOCALE) y el pressed inicial sería inmutable.
    document.documentElement.lang = "es";

    render(
      <LocaleProvider>
        <LanguageSwitcher label={GROUP_LABEL} />
      </LocaleProvider>,
    );

    // spec → Tests esperados: "el del idioma activo tiene aria-pressed=true"
    // (y por diferencia, el inactivo "false"; spec → Estados: opción inactiva
    // sin fondo → el atributo lo refleja).
    expect(
      screen.getByRole("button", { name: SPANISH_LABEL }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: ENGLISH_LABEL }),
    ).toHaveAttribute("aria-pressed", "false");
  });
});

describe("LanguageSwitcher locale change integration (T2: RF-2, real LocaleProvider, G-A)", () => {
  beforeEach(() => {
    localeHarness.active = false;
  });

  it("clicking the other locale toggles aria-pressed and updates html lang and cv:locale via the provider", async () => {
    const user = userEvent.setup();
    // Sin semilla: `lang` ausente → readInitialLocale cae en DEFAULT_LOCALE
    // "en" (i18n.md) → el activo inicial es EN y el "otro" es ES.
    render(
      <LocaleProvider>
        <LanguageSwitcher label={GROUP_LABEL} />
      </LocaleProvider>,
    );

    await user.click(screen.getByRole("button", { name: SPANISH_LABEL }));

    // RF-2 + spec → Tests esperados: "Click en el otro → cambia
    // aria-pressed, document.documentElement.lang, y
    // localStorage['cv:locale'] (integración con el provider)". El
    // componente solo llamó setLocale("es"): el cambio de `<html lang>` y
    // la persistencia los aplica el provider (G-A — no se duplica acá la
    // lógica, ya cubierta por LocaleProvider.test.tsx; se asiértan como
    // efecto observable de la integración).
    expect(
      screen.getByRole("button", { name: SPANISH_LABEL }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: ENGLISH_LABEL }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement).toHaveAttribute("lang", "es");
    expect(localStorage.getItem("cv:locale")).toBe("es");
  });
});

// --- T2 · Harness b: mock de módulo con espión (call-count exacto) ---------
// plan → Decisiones: "tests de call-count/guard con vi.mock del provider
// exponiendo useLocale con setLocale: vi.fn()". Renders SIN provider: con el
// harness armado el `useLocale` mockeado no toca contexto. #96 no se roza:
// mock de módulo, no espía sobre el re-export del hook.
describe("LanguageSwitcher setLocale call (T2: RF-2, mocked provider)", () => {
  it("calls setLocale once with the inactive locale when it is clicked", async () => {
    const user = userEvent.setup();
    // localeHarness: "en" activo (beforeEach outer); ES es el inactivo.
    render(<LanguageSwitcher label={GROUP_LABEL} />);

    await user.click(screen.getByRole("button", { name: SPANISH_LABEL }));

    // RF-2: "CUANDO el usuario elige un idioma, EL SISTEMA invoca setLocale()
    // del contexto" — con el mock, la invocación se ve como call exacto.
    expect(localeHarness.setLocale).toHaveBeenCalledTimes(1);
    expect(localeHarness.setLocale).toHaveBeenCalledWith("es");
  });
});

describe("LanguageSwitcher guard on active locale (T2: RF-3, mocked provider)", () => {
  it("does not call setLocale when the already-active locale is clicked", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher label={GROUP_LABEL} />);

    // El guard (decisión 2=a) solo aplica sobre el ACTIVO: se fija primero
    // que EN lo está (aria-pressed="true"), para que el test no sea vacío —
    // sin este assert, un componente sin pressed contaría cero llamadas por
    // casualidad, no por el guard.
    const activeButton = screen.getByRole("button", { name: ENGLISH_LABEL });
    expect(activeButton).toHaveAttribute("aria-pressed", "true");

    await user.click(activeButton);

    // RF-3 + spec → "No hacer": "No invocar setLocale() cuando el idioma
    // elegido ya está activo".
    expect(localeHarness.setLocale).not.toHaveBeenCalled();
  });
});

// --- T2 · RF-5: tab stops ----------------------------------------------------
// Con el harness armado (más simple: render suelto, el orden de tabulación
// es propiedad del markup, no del contexto). Decisión #101 (VERDE on-arrival,
// declarado): en T1 ambos botones ya son <button> focusables nativos, así que
// este recorrido nace verde; el discrimen real de RF-5 es la INSPECCIÓN del
// reviewer: sin patrón radiogroup (ni role, ni aria-checked, ni un solo tab
// stop con onKeyDown de flechas — spec → "No hacer"); fabricar un rojo
// leyendo el .tsx como texto desde el test está descartado en #101
// (precedentes: ThemeToggle T2, Button T6, IconBox T3).
describe("LanguageSwitcher tab order (T2: RF-5)", () => {
  it("Tab focuses both buttons in LOCALES order (English then Español)", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher label={GROUP_LABEL} />);

    // RF-5 / spec → Accesibilidad: "Tab recorre ambos botones (no es un
    // radiogroup)": dos tab stops consecutivos, en el orden de LOCALES.
    await user.tab();
    expect(
      screen.getByRole("button", { name: ENGLISH_LABEL }),
    ).toHaveFocus();

    await user.tab();
    expect(
      screen.getByRole("button", { name: SPANISH_LABEL }),
    ).toHaveFocus();
  });
});

// --- T3 · Cierre a11y (constitución T4) --------------------------------------
// spec → Tests esperados, textual: "`expectNoA11yViolations` sin violaciones";
// plan → Estrategia: "cierre `expectNoA11yViolations` con cada idioma activo"
// (tasks T3 "Hecho cuando": "activo en en y en es"). Dos casos de axe, uno por
// rama de idioma activo: el DOM auditado difiere en cuál botón carga
// `aria-pressed="true"` (spec → Estados: la forma activa es gradiente +
// on-accent, la inactiva plana — con el `lang` fijo de cada botón en ambos
// casos). Criterio de cierre Button/Overhead/ThemeToggle: un caso por forma,
// axe sobre el `container`.
//
// Armazón: LocaleProvider REAL (camino probado en T2: semilla vía
// `document.documentElement.lang` ANTES del render, como el anti-flash; el
// mock de módulo se DESARMA en el beforeEach del describe). Sin AccentGradientDefs:
// el componente no pinta SVG con `tone="gradient"` (el gradiente activo es CSS
// por tokens, RF-6 — y `color-contrast` está deshabilitado en axe/jsdom de
// todos modos; ver src/test/a11y.ts).
//
// Decisión #101 (VERDE on-arrival, declarado en el commit test): el markup de
// T1/T2 ya es accesible (grupo nombrado, botones con aria-label y pressed, sin
// roles de radiogroup), así que el cierre nace verde; el discrimen real de T3
// es la INSPECCIÓN de los estilos por tokens del módulo (precedente exacto
// ThemeToggle T3). No es vacío: una regresión del patrón (p. ej. perder el
// aria-label del grupo en alguna rama) la capturaría axe.
describe("LanguageSwitcher accessibility audit (T3: cierre, spec → Tests)", () => {
  // Desarma el mock de módulo: el `useLocale` del componente delega en el
  // contexto real (las dos ramas de idioma solo se pueden sembrar así).
  beforeEach(() => {
    localeHarness.active = false;
  });

  it("has no accessibility violations with English active", async () => {
    // Sin semilla: `lang` ausente → readInitialLocale cae en DEFAULT_LOCALE
    // "en" (i18n.md). El assert de pressed FIJA la rama auditada (sin él el
    // caso no distinguiría qué idioma está activo).
    const { container } = render(
      <LocaleProvider>
        <LanguageSwitcher label={GROUP_LABEL} />
      </LocaleProvider>,
    );

    expect(
      screen.getByRole("button", { name: ENGLISH_LABEL }),
    ).toHaveAttribute("aria-pressed", "true");

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with Español active", async () => {
    // Semilla anti-flash: español ANTES del render (mismo camino que el
    // describe de integración de T2; el afterEach global de setup.ts limpia
    // `lang` y `localStorage` entre tests).
    document.documentElement.lang = "es";

    const { container } = render(
      <LocaleProvider>
        <LanguageSwitcher label={GROUP_LABEL} />
      </LocaleProvider>,
    );

    // Fija que la rama semilla de verdad: sin este assert el caso duplicaría
    // silenciosamente al de inglés y el cierre no cubriría "activo en es"
    // (criterio ThemeToggle T3 con data-theme).
    expect(document.documentElement).toHaveAttribute("lang", "es");
    expect(
      screen.getByRole("button", { name: SPANISH_LABEL }),
    ).toHaveAttribute("aria-pressed", "true");

    await expectNoA11yViolations(container);
  });
});
