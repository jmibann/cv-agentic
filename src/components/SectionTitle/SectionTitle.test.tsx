// Tests de T1 (specs/primitives/SectionTitle/tasks.md) — RF-1 y RF-4: `as`
// renderiza ese nivel de heading (`h1`, `h2` o `h3`) con el nombre accesible
// del `children`, y `id` se transmite al heading para `aria-labelledby` de la
// sección (spec → Accesibilidad y "Tests esperados": "`as=\"h1\"` →
// `getByRole(\"heading\", { level: 1, name })`; ídem h2/h3; \"`id` llega al
// heading\").
//
// Justificación de las queries (constitución T3): el heading expone rol
// `heading` con `level` y nombre accesible (el texto del `children`), así que
// `getByRole` cubre ambos RF sin `data-testid` (la API de la spec no define
// ninguno). Para `id` se asierte el atributo sobre el mismo elemento
// obtenido por rol: es lo observable que distingue "llega al heading" de
// "queda en un wrapper" (spec → Anatomía/plan: el heading es el único raíz,
// sin wrapper).
//
// Diferidos a su tarea según tasks.md: clases de nivel del módulo (T2),
// `decorated` (T3), `icon` y combinación decorated+icon (T4), unión de
// `className` y márgenes (T5).

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SectionTitle } from "./SectionTitle";

// Cierre a11y (constitución T4); import puro, no toca lo anterior.
import { expectNoA11yViolations } from "../../test/a11y";

describe("SectionTitle heading levels and id passthrough (T1: RF-1, RF-4)", () => {
  it("renders an h1 heading with the accessible name when as=\"h1\"", () => {
    const { getByRole } = render(<SectionTitle as="h1">About Me</SectionTitle>);

    // "Hecho cuando" de T1: getByRole("heading", { level: 1, name }) encuentra
    // el heading (RF-1: el nivel lo fija `as`, no el tamaño ni el contexto).
    const heading = getByRole("heading", { level: 1, name: "About Me" });

    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe("H1");
  });

  it("renders an h2 heading with the accessible name when as=\"h2\"", () => {
    const { getByRole } = render(<SectionTitle as="h2">Education</SectionTitle>);

    // Ídem h2 (spec → "Tests esperados": "ídem h2/h3").
    const heading = getByRole("heading", { level: 2, name: "Education" });

    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe("H2");
  });

  it("renders an h3 heading with the accessible name when as=\"h3\"", () => {
    const { getByRole } = render(<SectionTitle as="h3">University</SectionTitle>);

    // Ídem h3 (spec → "Tests esperados": "ídem h2/h3").
    const heading = getByRole("heading", { level: 3, name: "University" });

    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe("H3");
  });

  it("passes id to the heading element for aria-labelledby", () => {
    const { getByRole } = render(
      <SectionTitle as="h2" id="experience-title">
        Experience
      </SectionTitle>,
    );

    // RF-4 ("Hecho cuando" de T1): el `id` llega AL heading (la sección lo
    // usará en `aria-labelledby`), no a un wrapper: el elemento encontrado por
    // rol es el que lleva el atributo.
    const heading = getByRole("heading", { level: 2, name: "Experience" });

    expect(heading).toHaveAttribute("id", "experience-title");
  });
});

// Cierre del archivo (constitución T4, spec → Tests esperados): axe sobre el
// markup de T1. Un heading con texto ya es accesible en T1 (la barra `::after`
// decorativa llega en T3 y el IconBox `aria-hidden` en T4, ninguno afecta
// este cierre), igual que el criterio aplicado en IconBox.
describe("SectionTitle accessibility audit", () => {
  it("has no accessibility violations with a plain level-1 title", async () => {
    const { container } = render(
      <SectionTitle as="h1" id="about-me">
        About Me
      </SectionTitle>,
    );

    await expectNoA11yViolations(container);
  });
});
