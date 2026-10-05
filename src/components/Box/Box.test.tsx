// Tests de T1 (specs/primitives/Box/tasks.md) — RF-1 y RF-3 (render base):
// sin `variant` el raíz `div` lleva la clase `outer` y renderiza `children`;
// `as="section"` renderiza un `<section>`.
//
// Justificación de las queries (constitución T3): Box es un contenedor neutro
// por spec (→ Accesibilidad): sin `variant` ni nombre no expone rol ni nombre
// accesible propio, así que no hay query por rol/nombre posible para el
// render base; lo observable es el elemento y sus clases, se consulta con
// `container.querySelector(...)`, el mismo criterio justificado en Icon T1 y
// BrandIcon T2 (la API de la spec no define `data-testid`). La aserción de la
// clase sigue el patrón P2 canónico #99 (`styles.name ?? "name"` +
// `toHaveClass`; prohibidos `!` y `as string`): en runtime el objeto `styles`
// es el mismo que importa el componente y el fallback es solo de tipos bajo
// `noUncheckedIndexedAccess`.
//
// Diferidos a su tarea según tasks.md: variante `inner` y `id`/ARIA (T2),
// unión de `className` (T3), estilos por tokens y cierre
// `expectNoA11yViolations` (T4).

import { describe, expect, it } from "vitest";

import { render } from "@testing-library/react";

import { Box } from "./Box";

import styles from "./Box.module.css";

const outerClass = styles.outer ?? "outer";

describe("Box base render (T1: RF-1, RF-3)", () => {
  it("renders its children", () => {
    const { getByText } = render(<Box>surface content</Box>);

    expect(getByText("surface content")).toBeInTheDocument();
  });

  it("renders a div with the outer class when no variant is given", () => {
    const { container } = render(<Box>content</Box>);

    // RF-1: default `outer`. El raíz es un <div> (RF-3: `div` por defecto)
    // con la clase `outer` del módulo (P2).
    const root = container.querySelector("div");

    expect(root).toBeInTheDocument();
    expect(root).toHaveClass(outerClass);
  });

  it("renders a <section> when as=\"section\"", () => {
    const { container } = render(<Box as="section">content</Box>);

    // RF-3: `as` cambia el elemento raíz; no queda un <div>.
    const root = container.querySelector("section");

    expect(root).toBeInTheDocument();
    expect(container.querySelector("div")).toBeNull();
    expect(root).toHaveTextContent("content");
  });
});
