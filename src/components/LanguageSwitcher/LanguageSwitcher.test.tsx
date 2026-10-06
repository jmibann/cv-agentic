// Tests de T1 (specs/controls/LanguageSwitcher/tasks.md) — RF-1, RF-4.
// Armazón: SIN LocaleProvider en T1 — el componente todavía no consume
// contexto (la lectura de `useLocale()`, `aria-pressed`, `onClick`/guard y la
// semilla del idioma vía `document.documentElement.lang` son de T2, plan →
// Decisiones "Harness doble"; G-A: el provider es del consumidor). Aquí el
// render es directo: `label` llega por prop (spec → API) y todo lo verificable
// en T1 es markup estático del grupo y sus botones.
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
// Diferidos: T2 agrega activo/guard/setLocale (aria-pressed, Tab RF-5,
// harness doble del plan); T3 agrega el cierre `expectNoA11yViolations`
// (constitución T4: el archivo termina con ese caso en T3, ídem ThemeToggle),
// los estilos por tokens del módulo y `index.ts`.

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LanguageSwitcher } from "./LanguageSwitcher";

// El test importa el módulo solo para fijar el nombre real de la clase base
// (`languageSwitcher`, resuelto por CSS Modules en runtime) y asierte la
// coexistencia con la clase del consumidor en el raíz (precedente
// ThemeToggle/Badge/IconBox: el módulo nace con la unión de `className`, con
// la clase base vacía; los estilos por tokens llegan en T3).
import styles from "./LanguageSwitcher.module.css";

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
