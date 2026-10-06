// Tests de T1 y T2 (specs/controls/ThemeToggle/tasks.md) — T1: RF-1, RF-2,
// RF-3, RF-6 · T2: RF-4 (teclado nativo; ver describe final).
// Armazón: ThemeProvider REAL (spec → Tests esperados: "los tests envuelven
// ThemeProvider"; plan → Estrategia de tests): RF-1/RF-2 se verifican en
// integración — tras el click cambian `aria-pressed`, el label, `dataset.theme`
// y `localStorage["cv:theme"]`; la lógica del provider ya la cubre
// ThemeProvider.test.tsx y no se duplica acá. Semilla: tema claro default —
// el afterEach global de src/test/setup.ts limpia `localStorage` y el atributo
// `data-theme`, así que sin valor resuelto el provider arranca en "light".
//
// Justificación de las queries (constitución T3): patrón toggle button
// (spec → Accesibilidad): un único <button> cuyo nombre accesible sale del
// `aria-label` que nombra el modo al que se va (RF-3) →
// `getByRole("button", { name })`. El ícono es decorativo (Icon sin `label`,
// aria-hidden propio), no expone rol ni nombre: se verifica por la clase de
// lucide del <svg> (`lucide-moon`/`lucide-sun`) con `container.querySelector`
// (spec → Tests esperados: "verificar por el atributo/clase del svg de lucide,
// p. ej. lucide-moon"; mismo criterio justificado en Icon/IconBox.test.tsx).
// La clase base de la unión (#99) se fija con el patrón canónico
// `styles.name ?? "name"` (prohibidos `!` y `as`).
//
// Diferidos: NINGUNO. T2 (teclado nativo, RF-4) se agregó al final del
// archivo; T3 agrega el cierre `expectNoA11yViolations` en las dos ramas de
// tema (este describe final) y su feat trae los estilos por tokens del módulo
// y `index.ts` (tasks.md): el archivo queda completo (constitución T4).

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ThemeProvider } from "../../providers/ThemeProvider";
import { expectNoA11yViolations } from "../../test/a11y";

import { ThemeToggle } from "./ThemeToggle";

// El test importa el módulo solo para fijar el nombre real de la clase base
// (`themeToggle`, resuelto por CSS Modules en runtime) y asierte la
// coexistencia con la clase del consumidor en el raíz (precedente Badge/IconBox:
// el módulo nace con la unión de `className`, con la clase base vacía; los
// estilos por tokens llegan en T3).
import styles from "./ThemeToggle.module.css";

// RF-3 / C3: los labels llegan traducidos por props (spec → API); los valores
// del test replican controls.darkMode / controls.lightMode de ui.en.ts.
const DARK_LABEL = "Dark mode";
const LIGHT_LABEL = "Light mode";

const themeToggleClass = styles.themeToggle ?? "themeToggle";

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle darkModeLabel={DARK_LABEL} lightModeLabel={LIGHT_LABEL} />
    </ThemeProvider>,
  );
}

describe("ThemeToggle light render (T1: RF-2, RF-3)", () => {
  it("shows an unpressed icon-only button labelled Dark mode with the moon glyph in light theme", () => {
    const { container } = renderToggle();

    // "Hecho cuando" de T1: <button> con aria-pressed según theme (claro →
    // "false", RF-2) y label darkModeLabel en claro (RF-3). `type="button"`
    // viene de la convención real del repo (`Button` lo trae como atributo
    // explícito de la API del <button>; spec → Anatomía: "un único <button>"
    // — NO de "plan → Interfaz", que solo fija las props): botón dentro de la
    // futura ControlsBar, nunca de submit.
    const button = screen.getByRole("button", { name: DARK_LABEL });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("aria-pressed", "false");

    // RF-3: luna en claro. El <svg> es el único del DOM (Icon tone="current"
    // no monta defs de gradiente).
    expect(container.querySelector("svg")).toHaveClass("lucide-moon");
  });
});

describe("ThemeToggle toggle integration (T1: RF-1, RF-6)", () => {
  it("click calls toggleTheme: pressed true, label Light mode, sun glyph, data-theme and storage updated", async () => {
    const user = userEvent.setup();
    const { container } = renderToggle();

    await user.click(screen.getByRole("button", { name: DARK_LABEL }));

    // RF-1/RF-6: el click invoca toggleTheme() del contexto y EL PROVIDOR
    // aplica data-theme y persiste (G-A); el componente no los toca.
    const button = screen.getByRole("button", { name: LIGHT_LABEL });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(localStorage.getItem("cv:theme")).toBe("dark");

    // RF-3: sol en oscuro.
    expect(container.querySelector("svg")).toHaveClass("lucide-sun");
  });

  it("second click returns to light: label, pressed, sun→moon, data-theme and storage back to light", async () => {
    const user = userEvent.setup();
    const { container } = renderToggle();

    await user.click(screen.getByRole("button", { name: DARK_LABEL }));
    await user.click(screen.getByRole("button", { name: LIGHT_LABEL }));

    const button = screen.getByRole("button", { name: DARK_LABEL });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(localStorage.getItem("cv:theme")).toBe("light");
    expect(container.querySelector("svg")).toHaveClass("lucide-moon");
  });
});

describe("ThemeToggle className joining (T1: spec → API, G-B)", () => {
  it("joins an external className to the base class on the root button", () => {
    const consumerClass = "controls-bar-toggle";

    render(
      <ThemeProvider>
        <ThemeToggle
          darkModeLabel={DARK_LABEL}
          lightModeLabel={LIGHT_LABEL}
          className={consumerClass}
        />
      </ThemeProvider>,
    );

    // Unión #99: la clase externa COEXISTE con la base (`themeToggle`) en el
    // único raíz <button> (spec → API: "se une a la clase base del <button>
    // raíz"); rige la hoja de estilos, no el orden del atributo class
    // (precedente Box/Icon/Badge/IconBox).
    const button = screen.getByRole("button", { name: DARK_LABEL });
    expect(button).toHaveClass(themeToggleClass);
    expect(button).toHaveClass(consumerClass);
  });
});

describe("ThemeToggle keyboard operation (T2: RF-4)", () => {
  // Decisión #101 (VERDE on-arrival, declarado): este escenario nace verde con
  // el código de T1 porque la operatividad por teclado es NATIVA del <button>
  // raíz (spec → Accesibilidad: "Opera con Enter/Espacio (nativo del
  // <button>)"; spec → Tests esperados: "Teclado: foco con Tab y Espacio
  // alterna"). El discrimen real de T2 es la INSPECCIÓN del reviewer: el
  // componente NO declara handlers propios de teclado (onKeyDown/onKeyUp) —
  // ThemeToggle.tsx solo tiene `onClick`—; fabricar un rojo leyendo el .tsx
  // como texto desde el test está explícitamente descartado en #101
  // (precedentes: Button T6 / Badge T3 / Overhead T3 / IconBox T3). Enter no
  // se teste aparte: en un <button> comparte el activation behavior con
  // Espacio y la spec no lo lista como escenario separado (no se inventa
  // alcance). El anillo `focus-visible` de RF-4 es inspección del CSS en T3.
  it("focuses with Tab and toggles with Space via native button activation", async () => {
    const user = userEvent.setup();
    renderToggle();

    // Foco con Tab: el <button> es focusable nativo y único elemento del
    // armazón.
    await user.tab();
    const button = screen.getByRole("button", { name: DARK_LABEL });
    expect(button).toHaveFocus();

    // Espacio alterna (RF-4 sobre la integración de RF-1/RF-2 ya fijada en
    // T1): aria-pressed true, label pasa a lightModeLabel (RF-3), y el
    // provider aplica data-theme/storage (G-A: el componente no los toca).
    await user.keyboard(" ");
    const pressedButton = screen.getByRole("button", { name: LIGHT_LABEL });
    expect(pressedButton).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(localStorage.getItem("cv:theme")).toBe("dark");

    // "alterna": un segundo Espacio vuelve a claro (toggle, no one-shot).
    await user.keyboard(" ");
    const releasedButton = screen.getByRole("button", { name: DARK_LABEL });
    expect(releasedButton).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(localStorage.getItem("cv:theme")).toBe("light");
  });
});

// Tests de T3 (specs/controls/ThemeToggle/tasks.md) — RF-4 (anillo por
// inspección) y RF-5 (tamaño fijo, cero @media: inspección del CSS; jsdom no
// computa estilos), y cierre del archivo (constitución T4, spec → Tests
// esperados: "expectNoA11yViolations sin violaciones"; plan → Estrategia:
// "cierre expectNoA11yViolations en las dos ramas de tema"). Dos casos de axe,
// uno por rama de tema (spec → Estados: claro con luna / oscuro con sol: el
// markup del raíz difiere — label, aria-pressed y glifo —, así que axe corre
// sobre las dos formas reales del toggle button; criterio de cierre
// Button/Overhead: un caso por forma del raíz, axe sobre el `container`).
//
// Semilla oscura: `document.documentElement.dataset.theme = "dark"` ANTES del
// render — el camino limpio y el que usan los tests del propio provider
// (ThemeProvider.test.tsx: "simula el estado que deja el script anti-flash").
// `readInitialTheme()` lee SOLO ese atributo resuelto (no recalcula: ni lee
// `localStorage` al iniciar — la storage leída es del flujo RF-3 de cambios
// del sistema en vivo —, así que sembrar `cv:theme` a secas nacería en "light"
// con el mock de matchMedia en matches=false; y `simulateMediaChange` exige
// provider ya montado y suscrito, más indirecto para un render inicial). El
// useEffect del provider re-aplica "dark" y el afterEach global de
// src/test/setup.ts limpia el atributo entre tests.
//
// Decisión #101 (VERDE on-arrival, declarado en el mensaje del commit test):
// este cierre nace verde con el markup de T1/T2 — botón nombrado por
// aria-label, aria-pressed, ícono decorativo aria-hidden (el discrimination
// real de T3 es la INSPECCIÓN de los estilos por tokens del módulo, no
// testeable en jsdom; leer el CSS como texto sería un rojo artificial
// descartado en #101; precedentes: Badge T3 / Overhead T3 / IconBox T3). No es
// vacío: una regresión del patrón toggle button (p. ej. label dinámico
// faltante en la rama oscura) la capturaría axe.
describe("ThemeToggle accessibility audit (T3: RF-4, RF-5)", () => {
  it("has no accessibility violations in the light branch (moon, Dark mode label)", async () => {
    const { container } = renderToggle();

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations in the dark branch (sun, Light mode label)", async () => {
    // Semilla anti-flash descripta arriba; el assert de data-theme fija que
    // la rama semilla de verdad (sin esto el caso duplicaría silenciosamente
    // al claro y el cierre no cubriría las dos ramas que pide el plan).
    document.documentElement.dataset.theme = "dark";
    const { container } = renderToggle();

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    await expectNoA11yViolations(container);
  });
});
