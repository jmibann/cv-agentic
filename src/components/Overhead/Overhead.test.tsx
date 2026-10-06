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
// Diferidos a su tarea según tasks.md: elipsis/muted/tamaño/bloque y cierre
// `expectNoA11yViolations` (T3).

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Overhead } from "./Overhead";

// T3: helper de cierre a11y (constitución T4); import puro, no toca lo anterior.
import { expectNoA11yViolations } from "../../test/a11y";

// T2: el test importa el módulo solo para fijar el nombre real de la clase
// base (`overhead`, resuelto por CSS Modules en runtime) y asierte la coexistencia
// con la clase del consumidor en el raíz (precedente Badge).
import styles from "./Overhead.module.css";

// Patrón P2 canónico #99 (`styles.name ?? "name"`; prohibidos `!` y
// `as string`): el fallback es solo de tipos bajo `noUncheckedIndexedAccess`.
const overheadClass = styles.overhead ?? "overhead";

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

// Tests de T2 (specs/primitives/Overhead/tasks.md) — RF-2 (`as="dt"` renderiza
// un `<dt>`; la validez del contexto de la `<dl>` es del consumidor, así que
// el test lo envuelve en un `<dl>` de armazón) y unión de `className` al único
// raíz (spec → API: "Se une a la clase base del elemento raíz"; spec → Tests
// esperados: "Concatena `className`"; "Hecho cuando" de T2: default `span`,
// `<dt>` con `as="dt"` y `className` unida al raíz (P2)).
//
// Justificación de las queries (constitución T3): Overhead expone su texto en
// el raíz sin roles añadidos (spec → Accesibilidad, RF-6), así que el único
// elemento se obtiene con `getByText` —la misma query accesible ya justificada
// en T1— y se asierte `tagName` + clases sobre ese elemento; sin `data-testid`
// (la API de la spec no define ninguno). El orden en el atributo `class` no
// resuelve conflictos de especificidad (precedente Box/Icon/Badge): rige la
// hoja de estilos, así que el test verifica coexistencia, no el orden.
describe("Overhead as prop and className joining (T2: RF-2)", () => {
  // extra: el "Hecho cuando" de T2 exige "default `span`"; "Tests esperados"
  // de la spec no lo lista explícitamente (solo cubre `as="dt"` y la unión de
  // `className`), pero sale directo de spec → Anatomía y API (default "span").
  it("renders a <span> root by default", () => {
    const { getByText } = render(<Overhead>Email</Overhead>);

    // "Hecho cuando" de T2: sin `as`, el raíz sigue siendo <span> (spec →
    // Anatomía: `<span>` en bloque, o `<dt>` según `as`).
    const root = getByText("Email");

    expect(root.tagName).toBe("SPAN");
  });

  it("renders a <dt> inside the dl scaffold when as=\"dt\"", () => {
    // RF-2: con `as="dt"` el raíz es <dt>; el <dl> de armazón lo arma el test
    // (la validez del contexto es del consumidor, no del componente).
    const { getByText } = render(
      <dl>
        <Overhead as="dt">Email</Overhead>
      </dl>,
    );

    const root = getByText("Email");

    expect(root.tagName).toBe("DT");
    // El <dt> queda como hijo directo del <dl> (un solo elemento, sin
    // wrappers: spec → Anatomía).
    expect(root.parentElement?.tagName).toBe("DL");
  });

  it("joins an external className to the base class on the default span root", () => {
    const consumerClass = "contact-overhead";

    const { getByText } = render(
      <Overhead className={consumerClass}>Email</Overhead>,
    );

    // Unión (spec → API): la clase externa coexiste con la base (`overhead`)
    // en el único elemento raíz (el `span` por defecto).
    const root = getByText("Email");

    expect(root.tagName).toBe("SPAN");
    expect(root).toHaveClass(overheadClass);
    expect(root).toHaveClass(consumerClass);
  });

  it("joins an external className to the base class on the dt root when as=\"dt\"", () => {
    const consumerClass = "contact-overhead";

    const { getByText } = render(
      <dl>
        <Overhead as="dt" className={consumerClass}>
          Email
        </Overhead>
      </dl>,
    );

    // RF-2 + unión: la unión aplica al mismo raíz sea `span` o `dt` (la spec
    // define un único raíz: no hay un segundo nodo que reciba la clase).
    const root = getByText("Email");

    expect(root.tagName).toBe("DT");
    expect(root.parentElement?.tagName).toBe("DL");
    expect(root).toHaveClass(overheadClass);
    expect(root).toHaveClass(consumerClass);
  });
});

// Tests de T3 (specs/primitives/Overhead/tasks.md) — RF-3, RF-4, RF-5 y RF-6,
// y cierre del archivo (constitución T4, spec → Tests esperados:
// "expectNoA11yViolations sin violaciones"). Dos casos de axe, uno por forma
// del raíz (spec → Anatomía): el `span` suelto y el `dt` dentro de un `<dl>` de
// armazón (RF-2: el contexto de la lista de definición lo arma el consumidor).
// El armazón válido exige un `<dd>` tras el `<dt>`: axe viola `definition-list`
// con un `<dl>` que solo contiene `<dt>` (la validez del contexto es del
// consumidor, no del componente; análogo al "li válido solo si hay un ul" de
// Badge T3). Mismo criterio de cierre que Badge/Box: axe sobre el `container`
// del render.
//
// Qué cubre cada RF y cómo se verifica (plan → Estrategia de tests):
// - RF-6 (no interactivo, sin roles añadidos): el axe de abajo sobre las dos
//   formas del raíz (spec → Accesibilidad: texto plano; "No hacer": "No hacerlo
//   interactivo ni agregarle roles").
// - RF-3 (elipsis) y RF-5 (--font-size-overhead, cero @media propios):
//   inspección del CSS por el reviewer; jsdom no computa el truncamiento ni
//   los estilos (spec → RF-3: "Verificación: inspección del CSS").
// - RF-4 (contraste sobre --color-bg): restricción de USO del consumidor
//   (spec → RF-4: "la verifica el reviewer en el consumidor (el componente no
//   conoce el fondo)"); no hay test posible dentro de la pieza, como declaró
//   el plan (Decisiones) — no se inventa alcance.
//
// Decisión #101 (tarea 100 % inspección + axe sobre markup ya accesible): este
// cierre nace VERDE on-arrival con el markup de T1/T2 (Overhead es texto plano
// sin roles); lo que discrimina T3 —display block, elipsis sin max-width,
// --color-text-muted, --font-size-overhead, peso regular, cero @media en
// Overhead.module.css— se verifica por inspección del reviewer, no por test.
// Nota: con el armazón ingenuo `<dl>` + solo `<dt>` el caso dt nacía ROJO, pero
// por un error del test (axe `definition-list` exige `<dd>` tras el `<dt>`;
// contexto válido = del consumidor, RF-2), no por falta de implementación → se
// corrige el armazón antes del commit en rojo. Las aserciones de clase de T2 ya
// pasan (`.overhead` existe desde T1) y leer el CSS como texto sería un rojo
// artificial explícitamente descartado en #101.
describe("Overhead accessibility audit (T3: RF-6)", () => {
  it("has no accessibility violations rendering a loose span overhead", async () => {
    const { container } = render(<Overhead>Email</Overhead>);

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations rendering a dt overhead inside a dl", async () => {
    const { container } = render(
      <dl>
        <Overhead as="dt">Email</Overhead>
        <dd>alex@example.com</dd>
      </dl>,
    );

    await expectNoA11yViolations(container);
  });
});
