// Tests de T1 (specs/controls/ThemeToggle/tasks.md) — RF-1, RF-2, RF-3, RF-6.
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
// Teclado (T2) y el cierre `expectNoA11yViolations` (T3, en las dos ramas de
// tema) no van acá: tasks.md los asigna a las tareas siguientes (criterio
// Separator/Sidebar de la fase); no se adelantan.

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ThemeProvider } from "../../providers/ThemeProvider";

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
    // (spec → plan → Interfaz): botón dentro de la futura ControlsBar, nunca
    // de submit.
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
