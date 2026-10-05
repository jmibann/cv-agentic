// Tests de T1 (specs/primitives/Icon/tasks.md) — RF-1 y RF-5: el mapa
// explícito nombre → componente renderiza un <svg> por cada uno de los 24
// valores de IconName (12 UiIconName + 12 ServiceIcon).
//
// RF-5 ("quitar una clave del mapa rompe la compilación") no lleva unit
// test: el compilador es el test (plan.md → Decisiones; el pipeline
// prebuild gen:types → tsc lo sostiene).
//
// Justificación de la query (constitución T3): un Icon sin `label` es
// decorativo y no expone nombre accesible (RF-2/RF-3, tarea T2), así que no
// hay query por rol/nombre posible para T1; lo observable es que el raíz
// <svg> se monte. Se consulta desde `container.querySelector("svg")` en vez
// de un `data-testid` porque la spec no define ninguno en la API.

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SERVICE_ICONS } from "@data/constants";

import { expectNoA11yViolations } from "../../test/a11y";

import { Icon } from "./Icon";
import type { IconName, UiIconName } from "./Icon";

// T3: definiciones compartidas del gradiente de acento (export del mismo
// módulo, plan.md) y clases del CSS Module para los stops (criterio P2).
import { AccentGradientDefs } from "./Icon";
import styles from "./Icon.module.css";

// Anotado readonly UiIconName[]: si un literal no pertenece a la unión,
// `tsc` falla (la lista del test queda anclada al tipo de la spec).
const UI_ICON_NAMES: readonly UiIconName[] = [
  "mail",
  "phone",
  "message-circle",
  "map-pin",
  "download",
  "chevron-down",
  "sun",
  "moon",
  "book-open",
  "briefcase",
  "quote",
  "x",
];

// ServiceIcon llega del espejo runtime de SERVICE_ICONS (@data/constants,
// mismo enum de data/cv.schema.json); tipado contra IconName.
const ALL_ICON_NAMES: readonly IconName[] = [...UI_ICON_NAMES, ...SERVICE_ICONS];

describe("Icon map", () => {
  // extra: el "Hecho cuando" de T1 exige "cada uno de los 24 valores de
  // IconName"; esta aserción ancla que la lista parametrizada sea completa
  // (si la unión o SERVICE_ICONS cambiaran sin actualizar el test, falla).
  it("enumerates all 24 IconName values (12 UI + 12 service)", () => {
    expect(ALL_ICON_NAMES).toHaveLength(24);
  });

  it.each(ALL_ICON_NAMES)("renders an <svg> for name \"%s\"", (name) => {
    const { container } = render(<Icon name={name} />);

    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});

// Tests de T2 (specs/primitives/Icon/tasks.md) — RF-2, RF-3 y RF-7: sin
// `label` el ícono es decorativo (aria-hidden="true" y ausente del rol img);
// con `label` es informativo (role="img" + aria-label); `focusable="false"`
// en ambos casos.
//
// Justificación de las queries (constitución T3): con `label` el <svg> raíz
// expone rol y nombre accesibles, así que se consulta con getByRole("img",
// { name: label }) (RF-3). Sin `label` no hay nombre accesible posible
// (RF-2), y lo observable son los atributos del raíz: se consulta con
// container.querySelector("svg"), el mismo criterio justificado en T1
// (la spec no define data-testid en la API).
describe("Icon accessibility", () => {
  it("is decorative without a label: aria-hidden and absent from getByRole(\"img\")", () => {
    const { container, queryByRole } = render(<Icon name="mail" />);

    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(queryByRole("img")).toBeNull();
  });

  it("is informative with a label: role=\"img\" and accessible name", () => {
    const label = "Email address";
    const { getByRole } = render(<Icon name="mail" label={label} />);

    const glyph = getByRole("img", { name: label });
    expect(glyph).toHaveAttribute("role", "img");
    expect(glyph).toHaveAttribute("aria-label", label);
  });

  it("sets focusable=\"false\" on the svg without a label (RF-7)", () => {
    const { container } = render(<Icon name="download" />);

    expect(container.querySelector("svg")).toHaveAttribute(
      "focusable",
      "false",
    );
  });

  it("sets focusable=\"false\" on the svg with a label (RF-7)", () => {
    const label = "Download CV";
    const { getByRole } = render(<Icon name="download" label={label} />);

    expect(getByRole("img", { name: label })).toHaveAttribute(
      "focusable",
      "false",
    );
  });
});

// Tests de T3 (specs/primitives/Icon/tasks.md) — RF-4: AccentGradientDefs
// renderiza las definiciones compartidas que resuelve `stroke="url(#accent-gradient)"`.
//
// Justificación de las queries (constitución T3): `<linearGradient>` y `<stop>`
// son definiciones SVG sin rol ni nombre accesible posible, y la spec no
// define `data-testid` en la API; lo observable son sus atributos, así que se
// consultan con `container.querySelector`/`querySelectorAll`, el mismo criterio
// justificado en T1. Las aserciones de clases siguen el criterio P2 de la
// fase (`import styles` + `toHaveClass`).
//
// Nota de tipos: con `noUncheckedIndexedAccess` (tsconfig.json) cada clase del
// módulo llega como `string | undefined` y jest-dom exige `string`. El fallback
// es solo de tipos: el proxy de Vitest para CSS Modules y el build real siempre
// exponen la clase pedida, y el componente importa el mismo objeto `styles`,
// así que la aserción compara exactamente la clase aplicada (no se debilita
// ningún test: en runtime el fallback nunca se usa).
const stopStartClass = styles.stopStart ?? "stopStart";
const stopEndClass = styles.stopEnd ?? "stopEnd";
const defsClass = styles.defs ?? "defs";

describe("AccentGradientDefs", () => {
  it("renders the accent-gradient linearGradient with userSpaceOnUse geometry (RF-4)", () => {
    const { container } = render(<AccentGradientDefs />);
    const gradient = container.querySelector("linearGradient");

    expect(gradient).not.toBeNull();
    expect(gradient).toHaveAttribute("id", "accent-gradient");
    // userSpaceOnUse es obligatorio: con objectBoundingBox cada trazo toma
    // su propia caja y las líneas rectas no se dibujan (spec → Gradiente).
    expect(gradient).toHaveAttribute("gradientUnits", "userSpaceOnUse");
    // Extremos fijos al espacio 0–24 del viewBox de lucide: reproducen el
    // ángulo 137.84° de --gradient-accent (valores exactos de la spec).
    expect(gradient).toHaveAttribute("x1", "0.62");
    expect(gradient).toHaveAttribute("y1", "-0.56");
    expect(gradient).toHaveAttribute("x2", "23.38");
    expect(gradient).toHaveAttribute("y2", "24.56");
  });

  it("renders two stops at offsets 0.2631 and 0.9375 with colors by CSS class, no style attribute", () => {
    const { container } = render(<AccentGradientDefs />);
    const stops = container.querySelectorAll("stop");

    // Offsets = posiciones 26.31 % / 93.75 % de --gradient-accent (spec).
    expect(stops).toHaveLength(2);
    expect(stops[0]).toHaveAttribute("offset", "0.2631");
    expect(stops[0]).toHaveClass(stopStartClass);
    expect(stops[0]).not.toHaveAttribute("style");
    expect(stops[1]).toHaveAttribute("offset", "0.9375");
    expect(stops[1]).toHaveClass(stopEndClass);
    expect(stops[1]).not.toHaveAttribute("style");
  });

  it("is invisible by size (0×0), not with display:none, and out of the a11y tree", () => {
    const { container } = render(<AccentGradientDefs />);
    const defsSvg = container.querySelector("svg");

    // Invisible por tamaño: atributos 0×0 + posición absoluta dada por la
    // clase del módulo (inspección del CSS: `position: absolute`; nunca
    // `display: none`, porque algunos navegadores no resuelven `url(#…)` a
    // definiciones en un SVG no renderizado).
    expect(defsSvg).toHaveAttribute("width", "0");
    expect(defsSvg).toHaveAttribute("height", "0");
    expect(defsSvg).toHaveClass(defsClass);
    // Sin estilos inline (regla dura 3 de DESIGN.md): nada de display:none.
    expect(defsSvg).not.toHaveAttribute("style");
    // extra: la Anatomía de la spec fija también en el <svg> de las defs
    // aria-hidden="true" y focusable="false" (no aparece en "Tests
    // esperados", pero es parte del contrato de estructura).
    expect(defsSvg).toHaveAttribute("aria-hidden", "true");
    expect(defsSvg).toHaveAttribute("focusable", "false");
  });
});

// Tests de T4 (specs/primitives/Icon/tasks.md) — RF-4 y RF-6: conducto `tone`
// (current / accent / gradient).
//
// Justificación de las queries (constitución T3): un <svg> sin `label` es
// decorativo (RF-2) y no expone rol ni nombre accesible, y la spec no define
// `data-testid` en la API; lo observable son sus atributos y clases, así que se
// consulta con `container.querySelector`, el mismo criterio justificado en T1.
// Con `label` sí se usa getByRole("img", { name: label }). Las aserciones de
// clases siguen el criterio P2 de la fase (`import styles` + `toHaveClass`) y
// las de gradient montan `AccentGradientDefs` como armazón (criterio P4: la
// unicidad del montaje en la app es de AppLayout, no de estos tests).
//
// Nota de tipos: el fallback `?? "..."` es solo de tipos (noUncheckedIndexedAccess,
// ver el comentario de T3); el componente importa el mismo objeto `styles`.
const toneAccentClass = styles.toneAccent ?? "toneAccent";

describe("Icon tone", () => {
  it("applies stroke=\"url(#accent-gradient)\" with tone=\"gradient\" (RF-4)", () => {
    const { container } = render(
      <>
        <AccentGradientDefs />
        <Icon name="code" tone="gradient" />
      </>,
    );

    // Armazón: las definiciones compartidas que resuelve la url (spec →
    // Gradiente; si no están montadas, el trazo no se ve).
    expect(container.querySelector("linearGradient")).toHaveAttribute(
      "id",
      "accent-gradient",
    );

    // El raíz del Icon es el <svg> que no es el de las defs (clase .defs).
    const glyph = container.querySelector(`svg:not(.${defsClass})`);
    expect(glyph).not.toBeNull();
    // gradient no es un color: va por el atributo stroke (spec → Estilos y
    // tokens), nunca por style inline.
    expect(glyph).toHaveAttribute("stroke", "url(#accent-gradient)");
  });

  it("adds no inline style attribute anywhere with tone=\"gradient\"", () => {
    const { container } = render(
      <>
        <AccentGradientDefs />
        <Icon name="cloud" tone="gradient" />
      </>,
    );

    expect(container.querySelectorAll("[style]")).toHaveLength(0);
  });

  // extra: la spec (→ Accesibilidad) declara `tone="gradient"` + `label` una
  // combinación válida: el gradiente decora el trazo y el nombre accesible lo
  // da aria-label. No está en "Tests esperados", pero sostiene RF-3 y RF-4 a la
  // vez sobre el mismo nodo.
  it("keeps the accessible name when tone=\"gradient\" and label are combined", () => {
    const label = "Cloud infrastructure";
    const { container, getByRole } = render(
      <>
        <AccentGradientDefs />
        <Icon name="cloud" tone="gradient" label={label} />
      </>,
    );

    const glyph = getByRole("img", { name: label });
    expect(glyph).toHaveAttribute("stroke", "url(#accent-gradient)");
    expect(container.querySelectorAll("[style]")).toHaveLength(0);
  });

  it("applies the module accent class with tone=\"accent\" and no inline styles (RF-6)", () => {
    const { container } = render(<Icon name="sun" tone="accent" />);
    const glyph = container.querySelector("svg");

    expect(glyph).not.toBeNull();
    // tone se aplica por clases del CSS Module (.toneAccent { color:
    // var(--color-accent); }); el trazo hereda el color por currentColor.
    expect(glyph).toHaveClass(toneAccentClass);
    expect(glyph).not.toHaveAttribute("stroke", "url(#accent-gradient)");
    expect(container.querySelectorAll("[style]")).toHaveLength(0);
  });

  it("adds no color class by default (tone=\"current\" inherited)", () => {
    const { container } = render(<Icon name="mail" />);
    const glyph = container.querySelector("svg");

    expect(glyph).not.toBeNull();
    expect(glyph).not.toHaveClass(toneAccentClass);
    expect(glyph).not.toHaveAttribute("stroke", "url(#accent-gradient)");
    expect(container.querySelectorAll("[style]")).toHaveLength(0);
  });

  it("adds no color class with an explicit tone=\"current\"", () => {
    const { container } = render(<Icon name="download" tone="current" />);
    const glyph = container.querySelector("svg");

    expect(glyph).not.toBeNull();
    expect(glyph).not.toHaveClass(toneAccentClass);
    expect(glyph).not.toHaveAttribute("stroke", "url(#accent-gradient)");
    expect(container.querySelectorAll("[style]")).toHaveLength(0);
  });
});

// Tests de T5 (specs/primitives/Icon/tasks.md) — RF-6: tamaño solo por CSS y
// unión de `className`. `.icon` fija `width/height: var(--icon-size,
// var(--size-icon))` y `flex-shrink: 0` sin literales ni `@media` (inspección
// del revisor sobre Icon.module.css: jsdom no calcula estilos, el tamaño
// visual se verifica en QA visual — spec → Tests esperados).
//
// Justificación de las queries (constitución T3): un Icon sin `label` es
// decorativo (RF-2) y no expone rol ni nombre accesible, y la spec no define
// `data-testid` en la API; lo observable son las clases del raíz <svg>, así
// que se consulta con `container.querySelector`, el mismo criterio justificado
// en T1/T4. Las aserciones de clases siguen el criterio P2 de la fase con el
// patrón canónico de la decisión #99 (decisiones: fallback `?? "…"` solo de
// tipos bajo noUncheckedIndexedAccess; prohibidos `!` y `as string`; el
// componente importa el mismo objeto `styles`, en runtime el fallback nunca
// se usa y la aserción compara exactamente la clase aplicada).
const iconClass = styles.icon ?? "icon";

describe("Icon className and CSS sizing (RF-6)", () => {
  it("applies the base .icon class on the svg by default", () => {
    const { container } = render(<Icon name="mail" />);
    const glyph = container.querySelector("svg");

    expect(glyph).not.toBeNull();
    // RF-6: sin prop `size`; el tamaño lo fija la clase `.icon` por CSS.
    expect(glyph).toHaveClass(iconClass);
  });

  it("joins the received className to .icon on the svg itself, not replacing it", () => {
    // Clase de consumidor (p. ej. `.glyph { --icon-size: … }` de ServiceCard,
    // spec → Estilos y tokens): se UNE a `.icon` sobre el propio <svg>.
    const consumerClass = "service-card-glyph";
    const { container } = render(<Icon name="code" className={consumerClass} />);
    const glyph = container.querySelector("svg");

    expect(glyph).not.toBeNull();
    expect(glyph).toHaveClass(iconClass);
    expect(glyph).toHaveClass(consumerClass);
  });

  // extra: la API de la spec UNE `className` a `.icon` y T4 fija que
  // tone="accent" agrega `.toneAccent` sobre el mismo raíz; se verifica que
  // las tres coexisten (ninguna reemplaza a otra). Sin contraparte literal en
  // "Tests esperados", pero es el contrato de unión del raíz.
  it("keeps .icon, the tone=\"accent\" class and the received className together", () => {
    const consumerClass = "contact-row-icon";
    const { container } = render(
      <Icon name="mail" tone="accent" className={consumerClass} />,
    );
    const glyph = container.querySelector("svg");

    expect(glyph).not.toBeNull();
    expect(glyph).toHaveClass(iconClass);
    expect(glyph).toHaveClass(toneAccentClass);
    expect(glyph).toHaveClass(consumerClass);
  });
});

// Cierre del archivo (constitución T4, spec → Tests esperados): axe-core sobre
// el componente, con y sin `label` (decorativo e informativo: los dos marcos
// de RF-2/RF-3). Las dos combinaciones ya cubiertas por T2.
describe("Icon accessibility audit", () => {
  it("has no accessibility violations without a label", async () => {
    const { container } = render(<Icon name="mail" />);

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with a label", async () => {
    const { container } = render(<Icon name="mail" label="Email address" />);

    await expectNoA11yViolations(container);
  });
});
