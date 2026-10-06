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

// T2: el test importa el módulo solo para fijar el nombre real de la clase
// base (`iconBox`, resuelto por CSS Modules en runtime) y asierte la
// coexistencia con la clase del consumidor en el raíz (precedente Badge/Box:
// el módulo nace con la unión de `className` en feat(IconBox): T2, con la
// clase base vacía; los estilos por tokens llegan en T3).
import styles from "./IconBox.module.css";

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
    // pero esta tarea es justamente la estructura `<span>` + Icon. Se busca
    // el <span> (no firstElementChild): en el fragmento el primer hijo es el
    // <svg> de las defs del armazón.
    const root = container.querySelector("span");
    expect(root).not.toBeNull();

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

// Tests de T2 (specs/primitives/IconBox/tasks.md) — RF-2 (raíz decorativa:
// `aria-hidden="true"`; spec → Accesibilidad y "Tests esperados": "El
// contenedor tiene `aria-hidden=\"true\"`") y unión de `className` al único
// raíz (spec → API: "Se une a la clase base del `<span>` raíz"; plan →
// Estrategia de tests: "unión de `className` (P2)"; "Hecho cuando" de T2: la
// externa queda unida a la clase base).
//
// Justificación de las queries (constitución T3): IconBox es siempre
// decorativo (RF-2), así que su raíz <span> no expone rol ni nombre
// accesible —con `aria-hidden` el subtree queda fuera del árbol de
// accesibilidad y `getByRole` no lo vería— y la API de la spec no define
// `data-testid`: se reutiliza la misma query ya justificada en T1,
// `container.querySelector("span")` (el armazón de defs monta un <svg>, no un
// <span>, así que el único <span> del DOM es el raíz). La aserción de la
// clase sigue el patrón P2 canónico #99 (`styles.name ?? "name"` +
// `toHaveClass`; prohibidos `!` y `as string`): en runtime el objeto `styles`
// es el mismo que importa el componente y el fallback es solo de tipos bajo
// `noUncheckedIndexedAccess`. El orden en el atributo `class` no resuelve
// conflictos de especificidad (precedente Box/Icon/Badge): rige la hoja de
// estilos, así que el test verifica coexistencia, no el orden.
const iconBoxClass = styles.iconBox ?? "iconBox";

describe("IconBox decorative root and className joining (T2: RF-2)", () => {
  it("marks the root span as decorative with aria-hidden=\"true\"", () => {
    const { container } = render(
      <>
        {/* Armazón: las defs compartidas (patrón de T1); en la app las monta
            AppLayout una sola vez. */}
        <AccentGradientDefs />
        <IconBox icon="mail" />
      </>,
    );

    // "Hecho cuando" de T2: el <span> raíz lleva `aria-hidden="true"` (RF-2:
    // siempre decorativo; el significado lo da el texto que lo acompaña).
    const root = container.querySelector("span");

    expect(root).not.toBeNull();
    expect(root).toHaveAttribute("aria-hidden", "true");
  });

  it("joins an external className to the base class on the root span", () => {
    const consumerClass = "contact-icon-box";

    const { container } = render(
      <>
        <AccentGradientDefs />
        <IconBox icon="mail" className={consumerClass} />
      </>,
    );

    // Unión (spec → API, P2): la clase externa coexiste con la base
    // (`iconBox`) en el único elemento raíz (spec → Anatomía: un solo <span>).
    const root = container.querySelector("span");

    expect(root).not.toBeNull();
    expect(root).toHaveClass(iconBoxClass);
    expect(root).toHaveClass(consumerClass);
  });
});

// Cierre del archivo (constitución T4, spec → Tests esperados): axe sobre el
// markup de T1. En T1 todavía no hay `aria-hidden` en el raíz (eso es T2),
// pero el <span> con un svg decorativo (aria-hidden por Icon) ya es
// accesible: el cierre a11y se agrega en la primera tarea (constitución T4,
// docs/constitution.md).
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
