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

// T2: el test importa el módulo solo para fijar el nombre real de la clase
// base (resuelto por CSS Modules en runtime). El módulo nace con la unión de
// `className` (feat(Badge): T2) con la clase base vacía; los estilos por
// tokens llegan en T3.
import styles from "./Badge.module.css";

// Patrón P2 canónico #99 (`styles.name ?? "name"`; prohibidos `!` y
// `as string`): el fallback es solo de tipos bajo `noUncheckedIndexedAccess`.
const badgeClass = styles.badge ?? "badge";

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

// Tests de T2 (specs/primitives/Badge/tasks.md) — RF-3 (unión de `className`):
// la clase externa del consumidor queda JUNTO a la clase base (`badge`, de
// Badge.module.css) en el único elemento raíz (spec → API: "Se une a la clase
// base del elemento raíz"; spec → Tests esperados: "Concatena `className`";
// "Hecho cuando" de T2: aserción P2 de coexistencia). El orden en el atributo
// `class` no resuelve conflictos de especificidad (precedente Box/Icon): rige
// la hoja de estilos, así que el test verifica coexistencia, no el orden.
//
// Justificación de las queries (constitución T3): Badge expone su texto en el
// raíz (spec → Accesibilidad: texto plano sin roles extra), así que el único
// elemento se obtiene con `getByText` —la misma query accesible ya justificada
// en T1— y se asierte `tagName` + clases sobre ese elemento; sin
// `data-testid` (la API de la spec no define ninguno). Casos: `span` default y
// `li` con `as="li"` (la spec define un único raíz: la unión debe ocurrir en
// ambos).
describe("Badge className joining (T2: RF-3)", () => {
  it("joins an external className to the base class on the default span root", () => {
    const consumerClass = "sidebar-role";

    const { getByText } = render(
      <Badge className={consumerClass}>Staff Engineer</Badge>,
    );

    // RF-3: la externa coexiste con la base en el único elemento (el raíz
    // `span` por defecto; spec → Anatomía).
    const root = getByText("Staff Engineer");

    expect(root.tagName).toBe("SPAN");
    expect(root).toHaveClass(badgeClass);
    expect(root).toHaveClass(consumerClass);
  });

  it("joins an external className to the base class on the li root when as=\"li\"", () => {
    const consumerClass = "skill-chip";

    const { getByText } = render(
      <ul>
        <Badge as="li" className={consumerClass}>
          React
        </Badge>
      </ul>,
    );

    // RF-2 + RF-3: la unión aplica al mismo raíz sea `span` o `li` (un único
    // elemento por spec: no hay un segundo nodo que reciba la clase).
    const root = getByText("React");

    expect(root.tagName).toBe("LI");
    expect(root.parentElement?.tagName).toBe("UL");
    expect(root).toHaveClass(badgeClass);
    expect(root).toHaveClass(consumerClass);
  });
});
