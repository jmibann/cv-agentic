// Tests de T1 (specs/primitives/IconBox/tasks.md) — RF-1: IconBox renderiza
// un `Icon tone="gradient"` dentro de su `<span>` cuadrado, SIN montar defs
// propias: la unicidad del montaje de `AccentGradientDefs` es de AppLayout
// (plan.md → Decisiones); el test la monta como armazón, patrón de
// Icon.test.tsx (T4).
//
// Justificación de las queries (constitución T3): el `Icon` que monta IconBox
// va sin `label` (spec → Accesibilidad: el contenedor es decorativo y el
// significado lo da el texto acompañante), así que el <svg> no expone rol ni
// nombre accesible y la spec no define `data-testid` en la API; lo observable
// es el atributo `stroke` del raíz y la cantidad de defs en el DOM, por eso se
// consulta con `container.querySelector`/`querySelectorAll`, el mismo criterio
// justificado en Icon.test.tsx (T1/T3/T4).

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AccentGradientDefs } from "../Icon";

import { expectNoA11yViolations } from "../../test/a11y";

import { IconBox } from "./IconBox";

describe("IconBox structure (RF-1)", () => {
  it("renders an svg with stroke=\"url(#accent-gradient)\" inside the square span", () => {
    const { container } = render(
      <>
        {/* Armazón: las defs compartidas que resuelve la url (patrón de
            Icon.test.tsx); en la app las monta AppLayout una sola vez. */}
        <AccentGradientDefs />
        <IconBox icon="mail" />
      </>,
    );

    // extra (Anatomía de la spec, tarea de estructura T1): el raíz es un
    // <span> y el ícono vive dentro; "Tests esperados" solo lista el stroke,
    // pero esta tarea es justamente la estructura `<span>` + Icon.
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("SPAN");

    // El glyph es el único <svg> con el atributo stroke: el <svg> del armazón
    // (defs) no lleva stroke, así que la query no lo confunde.
    const glyph = container.querySelector('svg[stroke="url(#accent-gradient)"]');
    expect(glyph).not.toBeNull();
    expect(root?.contains(glyph)).toBe(true);
  });

  it("mounts no gradient defs of its own: a single #accent-gradient in the DOM", () => {
    const { container } = render(
      <>
        <AccentGradientDefs />
        <IconBox icon="code" />
      </>,
    );

    // "Hecho cuando" de T1: el IconBox no renderiza defs propias. Si las
    // montara, habría dos elementos con id="accent-gradient" (colisión de id
    // con el armazón) y dos <linearGradient> en el DOM.
    expect(container.querySelectorAll('[id="accent-gradient"]')).toHaveLength(1);
    expect(container.querySelectorAll("linearGradient")).toHaveLength(1);
  });
});

// Cierre del archivo (constitución T4, spec → Tests esperados): axe sobre el
// markup de T1. En T1 todavía no hay `aria-hidden` en el raíz (eso es T2),
// pero el <span> con un svg decorativo (aria-hidden por Icon) ya es
// accesible: el cierre a11y se agrega en la primera tarea (skill sdd).
describe("IconBox accessibility audit", () => {
  it("has no accessibility violations with the gradient defs scaffold", async () => {
    const { container } = render(
      <>
        <AccentGradientDefs />
        <IconBox icon="mail" />
      </>,
    );

    await expectNoA11yViolations(container);
  });
});
