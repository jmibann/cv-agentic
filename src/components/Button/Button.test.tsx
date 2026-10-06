// Tests de T1 (specs/primitives/Button/tasks.md) — RF-1: sin `href` el
// componente renderiza un <button> cuyo nombre accesible sale de `children`
// (getByRole("button", { name })), con `type="button"` por defecto y un
// `type="submit"` explícito llegando al DOM.
//
// Justificación de las queries (constitución T3): el raíz <button> expone el
// rol "button" y el nombre computado desde el texto visible (spec →
// Accesibilidad), así que alcanza getByRole("button", { name }); `type` es un
// atributo observable del elemento devuelto por esa query. Sin data-testid:
// la API de la spec no define ninguno.
//
// Diferidos a su tarea según tasks.md: onClick/disabled (T2), render del <a>
// con href/rel/target/download (T3), ícono e iconPosition (T4), clases
// size/fullWidth y unión de className (T5), estilos por tokens y cierre
// expectNoA11yViolations (T6).

import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

describe("Button element branch (T1: RF-1)", () => {
  it("renders a <button> whose accessible name comes from children when no href is given", () => {
    const { getByRole } = render(<Button>Download CV</Button>);

    // RF-1 + spec → Accesibilidad: el texto visible es el nombre accesible.
    expect(getByRole("button", { name: "Download CV" })).toBeInTheDocument();
  });

  it("uses type=\"button\" by default when no type is given", () => {
    const { getByRole } = render(<Button>Download CV</Button>);

    // RF-1 ("Hecho cuando" de T1): default "button" llega al DOM.
    expect(getByRole("button", { name: "Download CV" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("passes an explicit type=\"submit\" to the <button>", () => {
    const { getByRole } = render(<Button type="submit">Send message</Button>);

    // RF-1: el `type` recibido llega al <button> (la unión solo admite
    // "button" | "submit" en la rama sin `href`; spec → API).
    expect(getByRole("button", { name: "Send message" })).toHaveAttribute(
      "type",
      "submit",
    );
  });
});

// Tests de T2 (specs/primitives/Button/tasks.md) — RF-3 y "Tests esperados"
// de la spec: "onClick se llama al hacer click; no se llama si disabled". El
// "Hecho cuando" agrega el criterio de que el <button> quede deshabilitado.
//
// Queries (constitución T3): la misma que en T1 — rol "button" con el nombre
// accesible; el handler se observa con vi.fn(). Sin data-testid.
//
// Click sobre el botón deshabilitado: se usa `user.click` SIN configuración
// extra (user-event ^14 simula al navegador: no despacha eventos en controles
// disabled y su pointerEventsCheck no dispara porque jsdom no aplica la hoja
// de estilos del componente). Si el check de pointer-events llegara a lanzar,
// la corrección sería setup({ pointerEventsCheck: 0 }) documentado acá, nunca
// .skip ni debilitar la aserción. Medido con el run en rojo/verde de la tarea.
describe("Button onClick and disabled (T2: RF-3)", () => {
  it("calls the onClick handler when the button is clicked", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <Button onClick={handleClick}>Download CV</Button>,
    );

    // RF-3: con onClick y sin disabled, user-event invoca el handler.
    await user.click(getByRole("button", { name: "Download CV" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call the onClick handler and renders the <button> disabled", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <Button disabled onClick={handleClick}>
        Download CV
      </Button>,
    );

    const button = getByRole("button", { name: "Download CV" });

    // "Hecho cuando" de T2: con `disabled` el <button> queda deshabilitado
    // (atributo nativo: RF-3 y spec → Estados).
    expect(button).toBeDisabled();

    // RF-3 (rama SI): el handler no se invoca cuando está disabled.
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});

// Tests de T3 (specs/primitives/Button/tasks.md) — RF-2, RF-8, RF-9 y "Tests
// esperados" de la spec: "Con href: getByRole('link', { name }) con ese href";
// "target='_blank' agrega rel='noopener noreferrer'; un rel explícito se usa
// tal cual (RF-9)"; "download se transmite al <a> con su valor (RF-8)".
//
// Queries (constitución T3): un <a> con `href` presente expone el rol "link"
// y el nombre accesible desde el texto visible (spec → Accesibilidad), así
// que alcanza getByRole("link", { name }); `href`/`target`/`rel`/`download`
// son atributos observables del elemento devuelto. Sin data-testid.
//
// `download` está tipado `boolean | string` en la rama link (spec → API): el
// escenario verifica ambos valores — string llega con su valor; `true` llega
// como atributo presente (en DOM/React `download=""` es el atributo presente).
// No se intercepta la navegación: solo se observa el markup renderizado.
describe("Button link branch (T3: RF-2, RF-8, RF-9)", () => {
  it("renders an <a> with the given href and accessible name from children", () => {
    const { getByRole } = render(<Button href="/files/cv.pdf">Download CV</Button>);

    // RF-2: con `href` definido el raíz es un <a> con ese destino.
    const link = getByRole("link", { name: "Download CV" });
    expect(link).toHaveAttribute("href", "/files/cv.pdf");
  });

  it("adds rel=\"noopener noreferrer\" when target=\"_blank\" is given without rel", () => {
    const { getByRole } = render(
      <Button href="https://example.com/cv.pdf" target="_blank">
        Download CV
      </Button>,
    );

    // RF-2 (rama SI): `target="_blank"` sin `rel` → default de seguridad
    // (constitución D6). `target` también llega al <a> (spec → API).
    const link = getByRole("link", { name: "Download CV" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("uses an explicit rel as-is without merging the default", () => {
    const { getByRole } = render(
      <Button
        href="https://example.com/cv.pdf"
        target="_blank"
        rel="nofollow"
      >
        Download CV
      </Button>,
    );

    // RF-9: con `rel` explícito el valor llega TAL CUAL (exacto, sin
    // fusionarse con el default de RF-2 que aquí habría sido disparable
    // por el `target="_blank"` presente).
    expect(getByRole("link", { name: "Download CV" })).toHaveAttribute(
      "rel",
      "nofollow",
    );
  });

  it("transmits download to the <a> with its value", () => {
    // RF-8 (valor string): el nombre de archivo llega tal cual.
    const stringValue = render(
      <Button href="/files/cv.pdf" download="cv-2026.pdf">
        Download CV
      </Button>,
    );
    expect(
      stringValue.getByRole("link", { name: "Download CV" }),
    ).toHaveAttribute("download", "cv-2026.pdf");

    // RF-8 (valor booleano): `download` sin valor → atributo presente.
    const boolValue = render(<Button href="/files/cv.pdf" download>Download CV</Button>);
    expect(boolValue.getByRole("link", { name: "Download CV" })).toHaveAttribute(
      "download",
    );
  });
});
