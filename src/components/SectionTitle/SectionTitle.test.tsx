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

// T2: el test importa el módulo solo para fijar el nombre real de la clase de
// nivel (`.h1/.h2/.h3`, resueltos por CSS Modules en runtime) y asierte que el
// heading raíz la aplica (precedente Overhead/IconBox; el módulo nace con su
// feat, como en IconBox T2).
import styles from "./SectionTitle.module.css";

// Patrón P2 canónico #99 (`styles.name ?? "name"`; prohibidos `!` y
// `as string`): el fallback es solo de tipos bajo `noUncheckedIndexedAccess`.
const h1Class = styles.h1 ?? "h1";
const h2Class = styles.h2 ?? "h2";
const h3Class = styles.h3 ?? "h3";

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

// Tests de T2 (specs/primitives/SectionTitle/tasks.md) — RF-1 (segunda parte):
// cada nivel aplica su clase de tamaño desde el módulo (`.h1/.h2/.h3` con
// `font-size: var(--font-size-h1/2/3)`; spec → Estilos y tokens: "el tamaño
// sigue al nivel, no a la tipografía global por etiqueta"). La verificación es
// por clase aplicada al heading raíz (P2); el `font-size` con tokens y la
// ausencia de literales px se verifican por inspección del CSS (jsdom no
// computa estilos; constitución P1, spec → RF-6).
//
// Justificación de las queries (constitución T3): las mismas queries de rol ya
// justificadas en T1 (`getByRole("heading", { level, name })`); la aserción
// `toHaveClass` usa el nombre real de la clase resuelto por CSS Modules con el
// criterio #99 (constantes arriba), sin `data-testid`.
describe("SectionTitle level size classes from the module (T2: RF-1)", () => {
  it("applies the module .h1 size class to the root heading when as=\"h1\"", () => {
    const { getByRole } = render(<SectionTitle as="h1">About Me</SectionTitle>);

    // "Hecho cuando" de T2: el nivel h1 aplica la clase .h1 del módulo al
    // heading raíz (sin wrapper; RF-1: el tamaño sigue al nivel).
    const heading = getByRole("heading", { level: 1, name: "About Me" });

    expect(heading).toHaveClass(h1Class);
  });

  it("applies the module .h2 size class to the root heading when as=\"h2\"", () => {
    const { getByRole } = render(<SectionTitle as="h2">Education</SectionTitle>);

    // Ídem para h2 (spec → "Tests esperados": ídem h2/h3).
    const heading = getByRole("heading", { level: 2, name: "Education" });

    expect(heading).toHaveClass(h2Class);
  });

  it("applies the module .h3 size class to the root heading when as=\"h3\"", () => {
    const { getByRole } = render(
      <SectionTitle as="h3">University</SectionTitle>,
    );

    // Ídem para h3. En T2 solo la clase base de nivel; la unión de la
    // `className` externa se conecta en T5 (P2 completo).
    const heading = getByRole("heading", { level: 3, name: "University" });

    expect(heading).toHaveClass(h3Class);
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
