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

import { Icon } from "./Icon";
import type { IconName, UiIconName } from "./Icon";

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
