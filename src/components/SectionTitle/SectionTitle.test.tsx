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

// T4: armazón de las defs del gradiente que resuelve el glyph de IconBox
// (patrón de IconBox.test.tsx; en la app las monta AppLayout una sola vez).
import { AccentGradientDefs } from "../Icon";

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
// T3: misma regla #99 para la clase `decorated` (el módulo la recibe con su
// feat; en rojo, `styles.decorated` aún es undefined y el fallback
// "decorated" es justo el nombre que el componente aún no aplica).
const decoratedClass = styles.decorated ?? "decorated";

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

// Tests de T3 (specs/primitives/SectionTitle/tasks.md) — RF-2: `decorated`
// aplica su clase al heading raíz (P2, criterio #99) y el nombre accesible del
// heading NO cambia (spec → Accesibilidad: "la barra es `::after` (sin
// contenido textual): no se lee"). El `::after` en sí (`content: ""`,
// `--gradient-accent`, `--size-title-bar-*`, `bottom:
// calc(var(--title-bar-offset) * -1)`) se verifica por inspección del CSS, no
// leyendo el CSS como texto en un test (#101; jsdom no computa pseudo-elementos;
// precedente Button: pseudo-elementos decorativos por inspección).
//
// Justificación de las queries (constitución T3): las mismas queries de rol ya
// justificadas en T1 (`getByRole("heading", { level, name })`); el `name`
// exacto ("About Me") con `decorated` afirma que el nombre accesible es
// idéntico al de la versión sin decorar (T1/T2). La aserción de texto del
// heading descarta barras con contenido textual real (`<hr>`/`<span>`,
// prohibidos en spec → "No hacer").
describe("SectionTitle decorated gradient bar (T3: RF-2)", () => {
  it("applies the module decorated class to the root heading when decorated", () => {
    const { getByRole } = render(
      <SectionTitle as="h1" decorated>
        About Me
      </SectionTitle>,
    );

    // "Hecho cuando" de T3: la clase `decorated` del módulo se une a la clase
    // base del nivel en el heading raíz (sin wrapper).
    const heading = getByRole("heading", { level: 1, name: "About Me" });

    expect(heading).toHaveClass(decoratedClass);
    expect(heading).toHaveClass(h1Class);
  });

  it("keeps the same accessible name and text content when decorated", () => {
    const { getByRole } = render(
      <SectionTitle as="h1" decorated>
        About Me
      </SectionTitle>,
    );

    // RF-2 / spec → Accesibilidad: la barra es un `::after` sin contenido
    // textual: no se lee. `getByRole` con el MISMO `name` que sin decorar
    // (T1) discrimina por nombre accesible exacto; el texto del heading sigue
    // siendo solo el `children` (no hay `<hr>` ni `<span>` con texto).
    const heading = getByRole("heading", { level: 1, name: "About Me" });

    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toBe("About Me");
  });
});

// Tests de T4 (specs/primitives/SectionTitle/tasks.md) — RF-3: con `icon` el
// heading renderiza un `IconBox` a la izquierda (spec: "IconBox a la
// izquierda; texto a continuación") sin alterar el nombre accesible del
// heading (spec → Accesibilidad: "El IconBox es `aria-hidden`: el nombre
// accesible del heading es solo el texto"), y `decorated` + `icon` juntos
// conservan ambos tratamientos sobre el mismo heading (spec → Estilos y
// tokens "decorated + icon (combinación válida)"; "Tests esperados": la clase
// decorated **y** el IconBox presentes). El flex va en el propio heading sin
// wrapper (spec → Estilos y tokens "with icon"; plan → Interfaz): se verifica
// por inspección DOM, no leyendo el CSS como texto (#101).
//
// Justificación de las queries (constitución T3): el heading expone rol
// `heading` con `level` y nombre accesible, así que
// `getByRole("heading", { level, name })` afirma a la vez el heading y que el
// nombre NO cambió con el icon. El IconBox es decorativo (sin rol ni nombre
// accesible, criterio de IconBox.test.tsx) y la API de la spec no define
// `data-testid`: el glyph se consulta estructuralmente con
// `heading.querySelector` sobre `stroke="url(#accent-gradient)"` (mismo
// criterio justificado en IconBox T1). Como en IconBox.test.tsx se monta
// `AccentGradientDefs` como armazón (en la app la monta AppLayout una sola
// vez); su <svg> defs no lleva stroke y la query está acotada al heading.
//
// #101 (rojo on-arrival): en el escenario 1 la consulta `getByRole` con el
// name "Education" ya pasaría sobre el markup de T3 (el nombre accesible no
// cambia en ninguna versión); lo que nace ROJO y discrimina T4 es la presencia
// del glyph en el heading, la clase `withIcon` y la estructura sin wrapper
// (escenarios 1–3).
// Patrón P2 canónico #99 (`styles.name ?? "name"`; prohibidos `!` y
// `as string`): en rojo `styles.withIcon` es undefined y el fallback
// "withIcon" es justo el nombre que el componente aún no aplica.
const withIconClass = styles.withIcon ?? "withIcon";

describe("SectionTitle with icon (T4: RF-3)", () => {
  it("renders an IconBox inside the heading keeping the accessible name as only the text", () => {
    const { getByRole } = render(
      <>
        {/* Armazón: las defs compartidas que resuelve la url (patrón de
            IconBox.test.tsx); en la app las monta AppLayout una sola vez. */}
        <AccentGradientDefs />
        <SectionTitle as="h2" icon="book-open">
          Education
        </SectionTitle>
      </>,
    );

    // RF-3 ("Hecho cuando" de T4): el nombre accesible del heading sigue
    // siendo solo el texto —el mismo `name` que sin icon (T1/T2)— porque el
    // IconBox es aria-hidden.
    const heading = getByRole("heading", { level: 2, name: "Education" });

    // El heading renderiza el glyph de IconBox (trazo en gradiente) y aplica
    // la clase `withIcon` del módulo (el flex, en el propio heading).
    expect(
      heading.querySelector('svg[stroke="url(#accent-gradient)"]'),
    ).not.toBeNull();
    expect(heading).toHaveClass(withIconClass);
    // El texto del heading es solo el children (el IconBox no aporta texto).
    expect(heading.textContent).toBe("Education");
  });

  it("keeps the decorated class and the IconBox when decorated and icon combine", () => {
    const { getByRole } = render(
      <>
        <AccentGradientDefs />
        <SectionTitle as="h2" decorated icon="book-open">
          Education
        </SectionTitle>
      </>,
    );

    // Spec → "decorated + icon (combinación válida)": ambos tratamientos se
    // aplican sobre el mismo heading (no se anulan ni se excluyen): la clase
    // decorated del módulo sigue presente **y** el glyph del IconBox vive
    // dentro del heading. La barra `::after` (posicionada, excluida del flujo
    // flex) es verificación por inspección (T3, #101).
    const heading = getByRole("heading", { level: 2, name: "Education" });

    expect(heading).toHaveClass(decoratedClass);
    expect(heading).toHaveClass(withIconClass);
    expect(heading).toHaveClass(h2Class);
    expect(
      heading.querySelector('svg[stroke="url(#accent-gradient)"]'),
    ).not.toBeNull();
  });

  it("places the IconBox and the text as direct children of the heading, no wrapper", () => {
    const { getByRole } = render(
      <>
        <AccentGradientDefs />
        <SectionTitle as="h2" icon="book-open">
          Education
        </SectionTitle>
      </>,
    );

    // "Hecho cuando" de T4 (inspección DOM; #101: no se lee el CSS como
    // texto): el flex va en el propio heading sin wrapper. Si el componente
    // envolvió icon+texto en un contenedor, el primer hijo elemento del
    // heading sería ese wrapper (no cuelga un span aria-hidden directamente
    // del heading) y el último hijo sería un elemento, no el nodo de texto.
    const heading = getByRole("heading", { level: 2, name: "Education" });

    // IconBox primero en orden de DOM (spec → "IconBox a la izquierda; texto
    // a continuación"): su <span> decorativo es el primer hijo elemento del
    // heading y contiene el glyph.
    const iconBox = heading.firstElementChild;
    expect(iconBox?.tagName).toBe("SPAN");
    expect(iconBox).toHaveAttribute("aria-hidden", "true");
    expect(
      iconBox?.querySelector('svg[stroke="url(#accent-gradient)"]'),
    ).not.toBeNull();

    // El texto es un nodo de texto directo del heading (sin wrapper).
    const textNode = heading.lastChild;
    expect(textNode?.nodeType).toBe(Node.TEXT_NODE);
    expect(textNode?.textContent).toBe("Education");
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
