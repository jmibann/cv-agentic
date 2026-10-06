// Tests de T1 (specs/primitives/Overhead/tasks.md) — RF-1 (render con
// mayúsculas solo por CSS): el `children` queda en el DOM **tal cual**, con su
// capitalización normal ("Email"); las mayúsculas las pone `text-transform:
// uppercase` del módulo CSS (inspección; jsdom no computa estilos).
//
// Justificación de las queries (constitución T3): Overhead es texto plano sin
// roles añadidos (spec → Accesibilidad, RF-6), así que la query accesible que
// define la spec es `getByText` sobre el texto original de `children` ("Tests
// esperados": "Renderiza el texto tal cual (sin transformar en el DOM)";
// "Hecho cuando" de T1: `getByText("Email")` encuentra el texto sin transformar
// en el DOM), sin `data-testid`: la API de la spec no define ninguno. Si el
// componente transformara el string en JS ("EMAIL" en el DOM), `getByText` con
// el texto original fallaría: el test discrimina exactamente RF-1.
//
// Diferidos a su tarea según tasks.md: `as="dt"` con armazón `<dl>` y unión de
// `className` (T2); elipsis/muted/tamaño/bloque y cierre
// `expectNoA11yViolations` (T3).

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Overhead } from "./Overhead";

describe("Overhead base render (T1: RF-1)", () => {
  it("renders the children text untransformed in the DOM (uppercase comes from CSS)", () => {
    const { getByText } = render(<Overhead>Email</Overhead>);

    // RF-1 ("Hecho cuando" de T1): getByText encuentra "Email" sin transformar
    // (spec → Accesibilidad: el texto del DOM va en capitalización normal, no
    // en mayúsculas; la transformación es solo visual, por CSS).
    const root = getByText("Email");

    expect(root).toBeInTheDocument();
    expect(root.textContent).toBe("Email");
  });
});
