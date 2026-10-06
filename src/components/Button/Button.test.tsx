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

import { render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "../../test/a11y";

import { Button } from "./Button";

import styles from "./Button.module.css";

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
// Las queries se resolvieron con `within(<render>.container)`: los dos
// renders del caso `download` conviven en el mismo `document.body`
// (baseElement por defecto de RTL) con idéntico rol+nombre, y cada aserción
// debe mirar su propio render. Las aserciones no cambian: mismas queries por
// rol+nombre.
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
      within(stringValue.container).getByRole("link", { name: "Download CV" }),
    ).toHaveAttribute("download", "cv-2026.pdf");

    // RF-8 (valor booleano): `download` sin valor → atributo presente.
    const boolValue = render(
      <Button href="/files/cv.pdf" download>
        Download CV
      </Button>,
    );
    expect(
      within(boolValue.container).getByRole("link", { name: "Download CV" }),
    ).toHaveAttribute("download");
  });
});

// Tests de T4 (specs/primitives/Button/tasks.md) — RF-4, RF-7 y "Tests
// esperados" de la spec: "icon renderiza un svg aria-hidden y el nombre
// accesible sigue siendo solo el texto; con iconPosition='end' el svg aparece
// después del texto en el DOM (RF-7)". El ícono es `Icon` SIN `label`
// (plan.md → Interfaz: decorativo por el aria-hidden que el propio Icon fija).
//
// Justificación de las queries (constitución T3): el raíz <button>/<a> se
// consulta por rol + nombre (getByRole) y el nombre accesible se verifica con
// toHaveAccessibleName (RF-4: sigue siendo SOLO el texto). El <svg>
// decorativo no tiene rol ni nombre accesible (está fuera del árbol
// accesible), así que no existe query RTL posible para él: se inspecciona con
// root.querySelector("svg") — el mismo criterio ya justificado en los tests
// de Icon (T1/T2, sin data-testid porque la API no define ninguno) — y el
// ORDEN de nodos se mide con compareDocumentPosition contra el nodo de texto
// del label: getByRole no expresa orden y el "Hecho cuando" de T4 exige orden
// real en el DOM, no `order: -1` de CSS (plan.md → Decisiones).
//
// `icon`/`iconPosition` viven en CommonProps (spec → API), así que RF-4 y
// RF-7 aplican a las dos ramas: se cubre también el caso link, no es un extra
// fuera de la spec sino la aplicación completa de RF-4 al <a>.
describe("Button decorative icon and iconPosition (T4: RF-4, RF-7)", () => {
  // Devuelve el <svg> decorativo y el nodo de texto del label con tipos
  // concretos para poder usarlos abajo; si falta alguno (el caso en rojo de
  // T4: el ícono aún no se renderiza) el test falla con mensaje claro sin
  // debilitar ninguna aserción.
  const getIconParts = (root: HTMLElement, labelText: string) => {
    const svg = root.querySelector("svg");
    const label = Array.from(root.childNodes).find(
      (node) =>
        node.nodeType === Node.TEXT_NODE &&
        (node.textContent?.trim() ?? "") === labelText,
    );
    if (svg === null || label === undefined) {
      throw new Error(
        `Falta ${svg === null ? "el <svg> decorativo" : "el nodo de texto del label"} en el raíz del Button`,
      );
    }
    return { svg, label };
  };

  it("renders the icon as a decorative aria-hidden svg keeping the accessible name as only the label text", () => {
    const { getByRole } = render(<Button icon="download">Download CV</Button>);

    // RF-4: el nombre accesible no se altera por el ícono (exacto, sin
    // contribución del svg).
    const button = getByRole("button", { name: "Download CV" });
    expect(button).toHaveAccessibleName("Download CV");

    const { svg } = getIconParts(button, "Download CV");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("places the svg before the label text by default (iconPosition start)", () => {
    const { getByRole } = render(<Button icon="download">Download CV</Button>);

    // RF-7 (default "start"): orden real de nodos en el DOM.
    const button = getByRole("button", { name: "Download CV" });
    const { svg, label } = getIconParts(button, "Download CV");
    expect(
      svg.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("places the svg after the label text when iconPosition=\"end\"", () => {
    const { getByRole } = render(
      <Button icon="download" iconPosition="end">
        Download CV
      </Button>,
    );

    // RF-7: con "end" el svg queda DESPUÉS del label en el DOM.
    const button = getByRole("button", { name: "Download CV" });
    const { svg, label } = getIconParts(button, "Download CV");
    expect(
      svg.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_PRECEDING,
    ).toBeTruthy();
  });

  it("renders the decorative icon on the link branch with the accessible name intact and the svg first", () => {
    const { getByRole } = render(
      <Button href="/files/cv.pdf" icon="download">
        Download CV
      </Button>,
    );

    // RF-4 + RF-7 en la rama link (CommonProps de la spec → API): ícono
    // decorativo, nombre solo el texto y posición default "start".
    const link = getByRole("link", { name: "Download CV" });
    expect(link).toHaveAccessibleName("Download CV");

    const { svg, label } = getIconParts(link, "Download CV");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(
      svg.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

// Tests de T5 (specs/primitives/Button/tasks.md) — RF-6 y "Tests esperados"
// de la spec: "size='small' y fullWidth aplican sus clases (aserción con el
// criterio de CSS Modules de la fase)". El "Hecho cuando" de T5 fija además
// que ambas clases del módulo se aplican SOBRE EL RAÍZ junto a la `className`
// externa (spec → API: "se une a la clase base del elemento raíz (<button> o
// <a>)"; `size`/`fullWidth`/`className` viven en CommonProps, así que rigen
// en las dos ramas — mismo criterio con el que T4 cubrió el ícono en el <a>).
// Los VALORES que la spec asigna a esas clases (padding small con
// var(--button-small-padding-block/inline) y `::before { content: none }`;
// `width: 100%`) se verifican por inspección del CSS (jsdom no calcula
// estilos; P1 en manos del reviewer), acá se verifica el contrato de clases.
//
// Justificación de las queries (constitución T3): el raíz <button>/<a> expone
// rol + nombre accesible (getByRole) y ES el elemento que lleva las clases,
// sin data-testid. Las aserciones de clases siguen el patrón P2 canónico #99
// (`styles.name ?? "name"` + `toHaveClass`; prohibidos `!` y `as string`): en
// runtime el objeto `styles` es el mismo que importa el componente y el
// fallback es solo de tipos bajo `noUncheckedIndexedAccess`.
//
// Defaults (`size` "default", `fullWidth` false; spec → API): la spec no
// asigna ninguna clase al default —la tabla de Estilos y tokens solo nombra
// `small` y `fullWidth`—, así que lo verificable es que omitidas las props el
// raíz NO lleve esas clases.
const smallClass = styles.small ?? "small";
const fullWidthClass = styles.fullWidth ?? "fullWidth";

describe("Button size, fullWidth classes and className join (T5: RF-6)", () => {
  it("applies the module .small class on the <button> root when size=\"small\"", () => {
    const { getByRole } = render(<Button size="small">Download CV</Button>);

    // T5 "Hecho cuando": size="small" aplica su clase del módulo en el raíz.
    expect(getByRole("button", { name: "Download CV" })).toHaveClass(
      smallClass,
    );
  });

  it("does not apply the size or fullWidth classes when the props are omitted (defaults)", () => {
    const { getByRole } = render(<Button>Download CV</Button>);
    const button = getByRole("button", { name: "Download CV" });

    // Spec → API: default `size="default"` y `fullWidth={false}`; ninguna
    // clase de la tabla les corresponde (solo `small` y `fullWidth`).
    expect(button).not.toHaveClass(smallClass);
    expect(button).not.toHaveClass(fullWidthClass);
  });

  it("applies the module .fullWidth class on the root when fullWidth is set", () => {
    const { getByRole } = render(<Button fullWidth>Download CV</Button>);

    // T5 "Hecho cuando": fullWidth → su clase del módulo (width: 100% en CSS).
    expect(getByRole("button", { name: "Download CV" })).toHaveClass(
      fullWidthClass,
    );
  });

  it("joins the external className together with .small and .fullWidth on the same root", () => {
    // Clase de consumidor (precedente Icon/Box: se UNE, no reemplaza; orden:
    // clases del módulo primero, externa después).
    const externalClass = "sidebar-download";
    const { getByRole } = render(
      <Button size="small" fullWidth className={externalClass}>
        Download CV
      </Button>,
    );
    const button = getByRole("button", { name: "Download CV" });

    // T5 "Hecho cuando": ambas clases del módulo conviven con la className
    // externa sobre el raíz.
    expect(button).toHaveClass(smallClass);
    expect(button).toHaveClass(fullWidthClass);
    expect(button).toHaveClass(externalClass);
  });

  it("applies the classes and the joined className on the link branch root", () => {
    const externalClass = "hero-download";
    const { getByRole } = render(
      <Button
        href="/files/cv.pdf"
        size="small"
        fullWidth
        className={externalClass}
      >
        Download CV
      </Button>,
    );
    const link = getByRole("link", { name: "Download CV" });

    // CommonProps (spec → API): size/fullWidth/className rigen también en el
    // <a>; el docstring de `className` lo dice explícito ("el elemento raíz
    // (<button> o <a>)"). No es un extra: es la aplicación completa de la API.
    expect(link).toHaveClass(smallClass);
    expect(link).toHaveClass(fullWidthClass);
    expect(link).toHaveClass(externalClass);
  });
});

// Cierre del archivo (constitución T4, tasks.md → T6 "Hecho cuando", spec →
// Tests esperados): axe-core sobre las dos formas del raíz — <button> con
// ícono y <a> (button y link). Los pseudo-estados de T6 (focus-visible,
// disabled, hover) NO son testeables en jsdom (spec → RF-5 y plan.md →
// Decisiones): se verifican por inspección del CSS + axe, que es lo que este
// cierre aporta junto con la inspección del reviewer. El ícono decorativo
// entra en el caso button porque RF-4 lo define sobre el raíz y axe debe
// confirmar que el aria-hidden del svg no genera violación (misma lógica de
// cierre que Box/Icon: un caso por forma del componente; BrandIcon uno solo).
// No se monta AccentGradientDefs: Button usa Icon con el tone default
// ("current"), sin referencia al gradiente compartido.
describe("Button accessibility audit (T6: RF-5, RF-6)", () => {
  it("has no accessibility violations on the button branch with a decorative icon", async () => {
    const { container } = render(<Button icon="download">Download CV</Button>);

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations on the link branch", async () => {
    // Forma real de uso (spec → Propósito): "Download CV" como <a> con
    // download e ícono al final; el nombre accesible sigue siendo el texto.
    const { container } = render(
      <Button href="/files/cv.pdf" download="cv-2026.pdf" icon="download" iconPosition="end">
        Download CV
      </Button>,
    );

    await expectNoA11yViolations(container);
  });
});
