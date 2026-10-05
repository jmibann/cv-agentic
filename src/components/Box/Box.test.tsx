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

// Tests de T2 (specs/primitives/Box/tasks.md) — RF-2 y la parte de RF-3 de
// `id`/`aria-label`/`aria-labelledby`: `variant="inner"` aplica la clase
// `inner` y NO `outer` (P2); los atributos llegan al raíz y construyen el
// nombre accesible del elemento elegido con `as`.
//
// Justificación de las queries (constitución T3): el "Hecho cuando" de T2 exige
// el nombre accesible como query —`as="aside" aria-label="Profile"` →
// `getByRole("complementary", { name: "Profile" })` (spec → Tests esperados)—,
// y para `aria-labelledby` se ancla además el nombre COMPUTADO desde el
// elemento referenciado (`as="section"` + heading con `id` → `getByRole
// ("region", ...)`), el caso de ServiceCard de la spec → API. La variante
// `inner` no introduce nombre accesible (es un contenedor, Accesibilidad:
// neutral), así que su aserción es la clase del módulo con el patrón P2
// canónico #99 (`styles.name ?? "name"` + `toHaveClass`; prohibidos `!` y
// `as string`) sobre `container.querySelector`, el mismo criterio justificado
// en T1. `id` no aporta rol ni nombre: se verifica como atributo observable
// del raíz. Diferido a T4: el cierre `expectNoA11yViolations` (tasks.md).
const innerClass = styles.inner ?? "inner";

describe("Box inner variant and ARIA/id attributes (T2: RF-2, RF-3)", () => {
  it("applies the inner class and not the outer class when variant=\"inner\"", () => {
    const { container } = render(<Box variant="inner">content</Box>);

    // RF-2 ("Hecho cuando", P2): `inner` sí, `outer` NO. El raíz sigue siendo
    // el `div` por defecto (RF-3); se usa `div` en vez de `firstElementChild`
    // como en T1 para no depender del orden de render.
    const root = container.querySelector("div");

    expect(root).toBeInTheDocument();
    expect(root).toHaveClass(innerClass);
    expect(root).not.toHaveClass(outerClass);
  });

  it("reaches the accessible name via getByRole(\"complementary\") with as=\"aside\" aria-label=\"Profile\"", () => {
    // El ejemplo literal del "Hecho cuando" y de spec → Tests esperados:
    // el caso de Sidebar (`as="aside" aria-label`). <aside> aporta el rol
    // complementary y `aria-label` el nombre (RF-3).
    const { getByRole } = render(
      <Box as="aside" aria-label="Profile">
        content
      </Box>,
    );

    expect(
      getByRole("complementary", { name: "Profile" }),
    ).toBeInTheDocument();
  });

  it("passes id to the root element", () => {
    const { container } = render(<Box id="profile-card">content</Box>);

    const root = container.querySelector("div");

    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute("id", "profile-card");
  });

  it("passes aria-labelledby to the root, computed as the accessible name of a section (ServiceCard case)", () => {
    // RF-3: `aria-labelledby` llega al raíz y el nombre se COMPUTA desde el
    // elemento referenciado por su `id` (el caso `as="article"
    // aria-labelledby` de la spec → API; aquí `section` → rol region con
    // nombre, como en "Tests esperados": p. ej. `getByRole("region", ...)`).
    const { container, getByRole } = render(
      <Box as="section" aria-labelledby="section-heading">
        <h2 id="section-heading">Experience</h2>
      </Box>,
    );

    const root = container.querySelector("section");

    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute("aria-labelledby", "section-heading");
    expect(getByRole("region", { name: "Experience" })).toBe(root);
  });
});
