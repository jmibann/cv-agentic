// Tests de T1 (specs/primitives/Badge/tasks.md) — RF-1 y RF-2 (render base):
// el `children` (texto) queda en el elemento raíz, que es `<span>` por defecto
// y `<li>` con `as="li"` (el test lo monta dentro de un `<ul>` de armazón; la
// validez del contexto de lista es responsabilidad del consumidor, RF-2).
//
// Justificación de las queries (constitución T3): Badge es texto plano sin
// roles añadidos (spec → Accesibilidad), así que la query accesible que define
// la spec es `getByText` sobre el string de `children` ("Tests esperados":
// "Renderiza el texto"). La estructura del raíz se verifica por `tagName` del
// elemento devuelto por esa query (plan → Estrategia de tests: "estructura por
// `tagName` + clases"), sin `data-testid`: la API de la spec no define ninguno.
// Las clases del módulo se difieren: el componente todavía no aplica clase
// base (el módulo CSS nace en T3; el "Hecho cuando" de T1 no exige aserción de
// clase, solo elemento + texto).
//
// Diferidos a su tarea según tasks.md: unión de `className` (T2), estilos por
// tokens y cierre `expectNoA11yViolations` (span suelto y li-en-`ul`) (T3).

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./Badge";

describe("Badge base render (T1: RF-1, RF-2)", () => {
  it("renders the children text in a <span> root by default", () => {
    const { getByText } = render(<Badge>Staff Engineer</Badge>);

    // RF-1 ("Hecho cuando" de T1): getByText encuentra el texto y el raíz por
    // defecto es <span> (spec → Anatomía y API: default "span").
    const root = getByText("Staff Engineer");

    expect(root).toBeInTheDocument();
    expect(root.tagName).toBe("SPAN");
  });

  it("renders an <li> inside the ul scaffold when as=\"li\"", () => {
    // RF-2: con `as="li"` el raíz es <li>; el <ul> de armazón lo arma el test
    // (la validez del contexto de lista es del consumidor: SkillList).
    const { getByText } = render(
      <ul>
        <Badge as="li">React</Badge>
      </ul>,
    );

    const root = getByText("React");

    expect(root).toBeInTheDocument();
    expect(root.tagName).toBe("LI");
    // El <li> queda como hijo directo del <ul> (un solo elemento, sin
    // wrappers: spec → Anatomía).
    expect(root.parentElement?.tagName).toBe("UL");
  });
});
