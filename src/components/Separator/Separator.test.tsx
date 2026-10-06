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
// Diferidos a su tarea según tasks.md: línea 1px `--color-track`, full-bleed,
// `margin-block: var(--separator-gap)` y unión de `className` al raíz (T2) y
// cierre `expectNoA11yViolations` (T3; tasks.md lo asigna explícitamente a la
// última tarea, patrón de diferido de Overhead/Badge).

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Separator } from "./Separator";

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
