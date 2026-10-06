// Tests de T1 (specs/primitives/Button/tasks.md) — RF-1: sin `href` el
// componente renderiza un <button> cuyo nombre accesible sale de `children`
// (getByRole("button", { name })), con `type="button"` por defecto y un
// `type="submit"` explícito llegando al DOM.
//
// Justificación de las queries (constitución T3): el raíz <button> expone el
// rol "button" y el nombre computado desde el texto visible (spec →
// Accesibilidad), así que alcanza getByRole("button", { name }); `type` es un
// atributo observable del elemento devuelto por esa query. Sin data-testid:
// la API de la spec no define ninguno.
//
// Diferidos a su tarea según tasks.md: onClick/disabled (T2), render del <a>
// con href/rel/target/download (T3), ícono e iconPosition (T4), clases
// size/fullWidth y unión de className (T5), estilos por tokens y cierre
// expectNoA11yViolations (T6).

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./Button";

describe("Button element branch (T1: RF-1)", () => {
  it("renders a <button> whose accessible name comes from children when no href is given", () => {
    const { getByRole } = render(<Button>Download CV</Button>);

    // RF-1 + spec → Accesibilidad: el texto visible es el nombre accesible.
    expect(getByRole("button", { name: "Download CV" })).toBeInTheDocument();
  });

  it("uses type=\"button\" by default when no type is given", () => {
    const { getByRole } = render(<Button>Download CV</Button>);

    // RF-1 ("Hecho cuando" de T1): default "button" llega al DOM.
    expect(getByRole("button", { name: "Download CV" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("passes an explicit type=\"submit\" to the <button>", () => {
    const { getByRole } = render(<Button type="submit">Send message</Button>);

    // RF-1: el `type` recibido llega al <button> (la unión solo admite
    // "button" | "submit" en la rama sin `href`; spec → API).
    expect(getByRole("button", { name: "Send message" })).toHaveAttribute(
      "type",
      "submit",
    );
  });
});
