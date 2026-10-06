// Tests de T1 (specs/primitives/Separator/tasks.md) — RF-1 y RF-2: el Separator
// renderiza un `<div>` decorativo con `aria-hidden="true"` y no expone rol
// `separator` ni usa `<hr>` (un `<hr>` anunciaría un cambio de tema del
// contenido; spec → Accesibilidad y "No hacer"). El grosor de 1px del RF-1 se
// verifica por **inspección del CSS** (jsdom no lo computa; spec → "Tests
// esperados"), y el módulo nace en T2 con la línea, el full-bleed y el margen
// (precedente IconBox/SectionTitle: el módulo llega con su `feat`).
//
// Justificación de las queries (constitución T3): el Separator es puramente
// decorativo (`aria-hidden="true"`), así que su raíz no expone rol ni nombre
// accesible —con `aria-hidden` el subtree queda fuera del árbol de
// accesibilidad y `getByRole` no lo vería— y la API de la spec no define
// `data-testid`; lo observable es la estructura del DOM (`tagName`, el
// atributo `aria-hidden`, la ausencia de `<hr>`), por eso se consulta con
// `container.querySelector`, el mismo criterio estructural justificado en
// IconBox/Overhead.
//
// Diferido a su tarea según tasks.md: cierre `expectNoA11yViolations` (T3;
// tasks.md lo asigna explícitamente a la última tarea, patrón de diferido de
// Overhead/Badge). Los valores del módulo de T2 (línea 1px `--color-track`,
// full-bleed y `margin-block: var(--separator-gap)`; RF-3/RF-4/RF-5) se
// verifican por **inspección del CSS** (jsdom no los computa; spec → "Tests
// esperados"; decisión #101: el `test(Separator): T2` solo discrimina la
// unión de `className`, que es la parte discriminate-testable de la tarea).

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Separator } from "./Separator";

// T2: el test importa el módulo solo para fijar el nombre real de la clase
// base (`separator`, resuelto por CSS Modules en runtime) y asierte la
// coexistencia con la clase del consumidor en el raíz (precedente IconBox/
// Badge: el módulo nace con el `feat` de T2; en el commit `test` este import
// queda rojo por "Failed to resolve import ./Separator.module.css", rojo
// legítimo del mismo patrón aprobado en IconBox T2).
import styles from "./Separator.module.css";

describe("Separator decorative root (T1: RF-1, RF-2)", () => {
  it('renders a div root marked decorative with aria-hidden="true"', () => {
    const { container } = render(<Separator />);

    // "Hecho cuando" de T1: el raíz es un <div> (spec → Anatomía: `<div>`
    // decorativo) con `aria-hidden="true"` (RF-1: línea decorativa).
    const root = container.querySelector("div");

    expect(root).not.toBeNull();
    // `?.` (no `!`): `querySelector` devuelve `Element | null` bajo strict y
    // `expect(...).not.toBeNull()` no narrowing el tipo (patrón IconBox T1).
    expect(root?.tagName).toBe("DIV");
    expect(root).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes no separator role and no <hr> in the DOM", () => {
    const { container, queryByRole } = render(<Separator />);

    // RF-2 ("Hecho cuando" de T1): `queryByRole("separator")` es `null` y no
    // hay <hr> en el DOM (spec → "Tests esperados": "No expone rol
    // `separator`"; "No hacer": "No usar `<hr>` ni `role=\"separator\"`").
    expect(queryByRole("separator")).toBeNull();
    expect(container.querySelector("hr")).toBeNull();

    // Refuerzo de RF-2 sobre el propio raíz: `queryByRole` no ve un subtree
    // con `aria-hidden`, así que un hipotético `<div role="separator"
    // aria-hidden="true">` pasaría la consulta anterior y violaría la spec;
    // el atributo se verifica directo sobre el único elemento (spec →
    // Anatomía: un solo <div>).
    const root = container.querySelector("div");
    expect(root).not.toHaveAttribute("role");
  });
});

// Tests de T2 (specs/primitives/Separator/tasks.md) — unión de `className` al
// único raíz (spec → API; plan → Interfaz: "`className` unida al raíz (P2)";
// "Hecho cuando" de T2: "`className` se une al raíz"). El resto del "Hecho
// cuando" (alto 1px, `--color-track`, full-bleed con `calc()` de
// `--box-padding`, `margin-block: var(--separator-gap)`, sin `@media` propios)
// es inspección del CSS (decisión #101).
//
// Justificación de las queries (constitución T3): como en T1, el Separator es
// puramente decorativo (`aria-hidden="true"`), su raíz no expone rol ni nombre
// accesible y la API de la spec no define `data-testid`; se reutiliza la query
// estructural ya justificada (`container.querySelector("div")`: el raíz es el
// único <div>; spec → Anatomía). La aserción de la clase sigue el patrón P2
// canónico #99 (`styles.name ?? "name"` + `toHaveClass`; prohibidos `!` y
// `as string`): en runtime el objeto `styles` es el mismo que importa el
// componente y el fallback es solo de tipos bajo `noUncheckedIndexedAccess`.
// El orden en el atributo `class` no se verifica (precedente Box/Icon/Badge/
// IconBox): la coexistencia es el contrato; ante conflictos rige la hoja de
// estilos.
const separatorClass = styles.separator ?? "separator";

describe("Separator className joining (T2)", () => {
  it("joins an external className to the base class on the root div", () => {
    const consumerClass = "sidebar-separator";

    const { container } = render(<Separator className={consumerClass} />);

    // Unión (spec → API, P2): la clase externa coexiste con la base
    // (`separator`) en el único elemento raíz (composición base primero +
    // externa después, canon de la fase: Badge/IconBox/Overhead).
    const root = container.querySelector("div");

    expect(root).not.toBeNull();
    expect(root).toHaveClass(separatorClass);
    expect(root).toHaveClass(consumerClass);
  });
});

// El cierre del archivo (constitución T4, spec → "Tests esperados":
// `expectNoA11yViolations`) se agrega en T3 (tasks.md lo asigna a la última
// tarea): ese describe final irá aquí.
