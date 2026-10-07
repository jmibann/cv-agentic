// Tests de T1 y T2 (specs/content/TestimonialDialog/tasks.md) — RF-1, RF-4 y el
// tramo de RF-2 que toca T1 (Close → close → evento `close` → onClose una vez;
// Tests esperados 1, 2, 3 —parcial— y 7 de la spec).
//
// Alcance T1 (tasks → Hecho cuando): `testimonial=null` → container vacío y
// sin dialog en el DOM (RF-1, decisión 18=b); con valor → dialog abierto por
// el mount-effect (`showModal`, observable como atributo `open` del mock de
// F1), nombrado por el autor vía `aria-labelledby` al `<h2>` con el id fijo
// `testimonial-dialog-title` (Anatomía literal; RF-4), rol y texto completo
// (Test 2), HexAvatar decorativo (`alt=""`) y comilla gradient con el armazón
// de defs montado, y botón Close nombrado por `closeLabel` (Test 7) cuyo click
// invoca `onClose` exactamente una vez VÍA el evento `close` (no directa: el
// assert de `open` ausente prueba que pasó por `dialog.close()`; RF-2/Test 3).
//
// Diferidos declarados (tasks.md): T2 conecta el resto del ciclo (evento
// `close` sintético de Esc, backdrop/padding, cleanup con null desde el
// padre); T3 agrega el módulo CSS (clases `.dialog`/`.close`/`.layout`/
// `.aside`/`.body`/`.quote`: NINGUNA aserción de T1 fija clases del módulo —
// el módulo nace en T3, tasks lo asigna ahí —), el `index.ts` y el cierre
// `expectNoA11yViolations` de Tests esperados 8 como último describe del
// archivo (constitución T4; patrón TestimonialCard/ServiceCard: llega con la
// última tarea, no se adelanta). Las queries de T1 asertan solo estructura
// DOM (tags, orden, relaciones de padre) y atributos accesibles.
//
// Rojo on-arrival (decisión #101, criterio exacto TestimonialCard T1): este
// commit `test(TestimonialDialog): T1` es rojo por "Failed to resolve import"
// de "./TestimonialDialog" (la pieza no existe aún) — no hay nada que
// discriminar antes del `feat`: todo el archivo falla en la resolución del
// módulo. No es un rojo artificial: la importación del componente bajo prueba
// es legítima y el rojo desaparece solo con la implementación.
//
// Rojo on-arrival T2 (decisión #101, declarado con la salida en el commit
// `test(TestimonialDialog): T2`): de los 6 escenarios nuevos FALLAN contra el
// código de T1 dos, por la razón correcta — backdrop real (no existe handler
// de click sobre el dialog: `onClose` 0 llamadas y `open` intacto) y cierre
// iniciado por el padre (no existe cleanup del effect de apertura: el spy de
// `close` sobre la instancia ve 0 llamadas) — y PASAN ya con T1 cuatro, porque
// documentan contratos que la implementación vigente cumple: el evento `close`
// sintético (handleClose existe desde T1 y es el único call site), la franja
// de padding y el click en el layout (hoy no hay handler que pueda cerrar de
// más) y la reapertura sin duplicados (un handler por prop de React). Su valor
// es de regresión futura: fijan el ciclo completo de RF-2/RF-3 sobre el handler
// de click y el cleanup que T2 agrega. El ORDEN del guard del ref
// (useLayoutEffect antes del cleanup de apertura) lo fija la IMPLEMENTACIÓN
// por invariant de la spec → ciclo; medido en esta tarea, ese assert no
// discrimina contra la variante useEffect (detalle: ver el describe de cierre
// por el padre, matiz declarado).
//
// Justificación T2 (constitución T3): sin roles nuevos — los clicks de
// backdrop/padding se disparan con `MouseEvent` nativo (clientX/clientY,
// `bubbles: true`) sobre el propio dialog o sobre el layout (el `target` lo fija
// el nodo del dispatch: es exactamente el criterio de decisión 19, "target ===
// dialog y punto dentro/fuera del bounding rect", y `userEvent` no modela el
// ::backdrop). El rect se spy-mockea sobre la instancia con un `DOMRect` real de
// jsdom (10,10,490,390 → left/top 10, right 500, bottom 400): sin layout,
// `getBoundingClientRect` devuelve todo ceros y el criterio sería indecidible
// (patrón de medición mockeada del plan de Carousel, acá sobre el rect; sin
// `as`: DOMRect existe en el env jsdom, medido). El "cleanup llamó close()" del
// "Hecho cuando" no tiene superficie accesible observable (el nodo ya está
// desprendido por return null): se spy-mockea `close` sobre la instancia, que
// conserva la implementación del mock de F1 (spy por defecto no reemplaza).
//
// Justificación de queries (constitución T3): dialog por
// `getByRole("dialog", { name: author })` (Test 2). Funciona con el mock de
// F1 (src/test/setup.ts): `showModal` setea el atributo `open`, y jsdom 30
// aplica la hoja de estilos UA del `<dialog>` (medido: `display: none` sin
// `open`, `block` con él) → el dialog montado por el effect existe y es
// visible para byRole, y su nombre accesible lo calcula aria-labelledby
// hacia el h2 (el mock no implementa top layer, solo el atributo:
// suficiente para el query).
// heading por rol+nivel+nombre; los <p> de rol y texto por texto (un <p> no
// tiene rol propio); el botón Close por rol + nombre `closeLabel` (Test 7;
// string propia del fixture, la prop llega ya resuelta por el padre — C2/C3);
// el avatar con `alt=""` y las comillas/x `aria-hidden` son decorativos (sin
// nombre accesible posible) y la API de la spec no define `data-testid`:
// selección estructural (`querySelector` sobre el dialog) con el mismo
// precedente exacto de TestimonialCard.test T1 (glyph por
// `svg[stroke="url(#accent-gradient)"]`; defs ancladas por id;
// `img.closest` NO se usa porque el wrap del avatar es el span ABUELO del
// img: span.wrap > span.border > img, Anatomía de HexAvatar). Las clases
// estables de lucide (`lucide-quote`, `lucide-x`) fijan el glyph correcto
// (no son clases de módulo; #99 no aplica).
//
// Datos ficticios (constitución D4): fixture espejo de src/content/cv.en.json
// — testimonio "t-maria", "María González", textos de ejemplo de la propia
// spec → Anatomía —, sin datos reales.

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Testimonial } from "@data/cv.types.generated";

import { HexAvatarDefs } from "../HexAvatar";
import { AccentGradientDefs } from "../Icon";

import { TestimonialDialog } from "./TestimonialDialog";
import type { TestimonialDialogProps } from "./TestimonialDialog";

// --- Fixture ------------------------------------------------------------------
// `Testimonial` del esquema, espejo de src/content/cv.en.json (id "t-maria";
// avatar.src PublicPath). Texto largo ficticio: el dialog muestra el texto
// COMPLETO (RF-4; a diferencia del extracto recortado de la card).
const TESTIMONIAL: Testimonial = {
  id: "t-maria",
  author: "María González",
  role: "Product Manager, Acme Corp",
  avatar: { src: "/images/testimonials/maria.svg" },
  text: "Alex consistently delivered high-quality work and made complex features feel simple for our users.",
};

// Id literal de Anatomía (spec → Anatomía: `aria-labelledby="testimonial-
// dialog-title"` y el mismo id en el <h2>); se aserta como LITERAL (el test
// no lo recalcula desde la constante del componente: no ser tautológico).
const TITLE_ID = "testimonial-dialog-title";

// Textos de interfaz ficticios (D4): la pieza recibe `closeLabel` ya
// resuelto por el padre desde ui.{en,es}.ts (C2/C3); el valor que ve el test
// es propio del fixture, no una cita del i18n de la app.
const CLOSE_LABEL = "Close";

// Helper: armazones `HexAvatarDefs` (recorte del hexágono) +
// `AccentGradientDefs` (gradiente de la comilla; en la app los monta
// AppLayout una sola vez) + el dialog con la API completa por props (C2: sin
// providers). `overrides` permite variar `testimonial`, `closeLabel` e
// inyectar el `onClose` espíado por caso (spy `vi.fn()` fresco por render;
// cleanup global de setup.ts).
const testimonialDialog = (overrides: Partial<TestimonialDialogProps> = {}) => (
  <>
    <HexAvatarDefs />
    <AccentGradientDefs />
    <TestimonialDialog
      testimonial={TESTIMONIAL}
      onClose={() => undefined}
      closeLabel={CLOSE_LABEL}
      {...overrides}
    />
  </>
);

// --- T1 · RF-1: montaje condicional (Tests esperados 1) -------------------------
describe("TestimonialDialog conditional mount (T1: RF-1)", () => {
  it("renders nothing and mounts no dialog when testimonial is null", () => {
    // Render LISO (sin armazón defs): el "Hecho cuando" de T1 exige `container`
    // vacío; las defs son del harness, no de la pieza — si algo se renderiza
    // con null, la culpa es del componente igual, y con defs el assert de
    // vacío sería imposible de leer.
    const { container } = render(
      <TestimonialDialog
        testimonial={null}
        onClose={() => undefined}
        closeLabel={CLOSE_LABEL}
      />,
    );

    // RF-1 (decisión 18=b): no hay <dialog> en el DOM — el container queda
    // vacío y queryByRole("dialog") es null.
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens the dialog when testimonial appears on a permanent tree (null to value, consumer contract)", () => {
    // RF-1 / revisión T1 ronda 1 (bloqueante): "SI recibe un valor no nulo,
    // ENTONCES monta el <dialog> y lo abre con dialog.showModal()". El
    // consumidor real (Carousel, spec → ciclo: Valor→valor no puede ocurrir
    // con el padre real; el padre mantiene <TestimonialDialog> MONTADO y
    // alterna `testimonial` null ↔ valor) — así que la apertura debe atarse a
    // la APARICIÓN del dialog, no solo al mount del componente. Mismo árbol
    // (rerender de RTL sobre el mismo fragmento: defs + dialog, estado
    // conservado): null → sin dialog; valor → dialog nombrado y CON el
    // atributo `open` (observable del showModal en el mock de F1; sin él,
    // jsdom aplica el display:none UA del dialog cerrado y el getByRole de
    // abajo lanza — el query es doblemente discriminante: role visible +
    // atributo).
    const onClose = vi.fn();
    const { rerender } = render(
      testimonialDialog({ testimonial: null, onClose }),
    );

    expect(screen.queryByRole("dialog")).toBeNull();

    rerender(testimonialDialog({ testimonial: TESTIMONIAL, onClose }));

    // Se abre al aparecer: dialog nombrado por el autor + open post-showModal.
    const dialog = screen.getByRole("dialog", { name: TESTIMONIAL.author });
    expect(dialog).toHaveAttribute("open");

    // Y abrir NO emite onClose (RF-2/RF-3: onClose solo sale del evento
    // close; un guard mal puesto que disparara close() en la transición
    // null→valor lo delataría acá).
    expect(onClose).not.toHaveBeenCalled();
  });
});

// --- T1 · RF-1/RF-4: dialog montado, abierto y nombrado por el autor -----------
describe("TestimonialDialog open dialog named by the author (T1: RF-1, RF-4)", () => {
  it("mounts the dialog open via showModal and names it by its h2 through the fixed title id", () => {
    const { container } = render(testimonialDialog());

    // Armazones (contrato de las primitivas; spec → Tests esperados: "los
    // renders con HexAvatar/comilla gradient montan HexAvatarDefs y
    // AccentGradientDefs como armazón"): defs ancladas por id.
    expect(container.querySelector("clipPath#hex-avatar-outer")).not.toBeNull();
    expect(container.querySelector("linearGradient")).toHaveAttribute(
      "id",
      "accent-gradient",
    );

    // "Hecho cuando" de T1 / Tests esperados 2: getByRole("dialog", { name:
    // author }). El nombre sale del aria-labelledby → h2 (justificación del
    // mock open en el encabezado).
    const dialog = screen.getByRole("dialog", { name: TESTIMONIAL.author });
    expect(dialog.tagName).toBe("DIALOG");
    expect(dialog).toHaveAttribute("aria-labelledby", TITLE_ID);

    // RF-1 / "Hecho cuando": el mount-effect invocó `showModal()` — en el
    // mock de F1 es observable como atributo `open` presente tras el render.
    expect(dialog).toHaveAttribute("open");

    // RF-4 / Anatomía: el autor vive en un <h2> con el id literal de
    // Anatomía y el aria-labelledby del dialog apunta exactamente a él
    // (aserción cruzada no tautológica: ambos leídos del DOM).
    const heading = within(dialog).getByRole("heading", {
      level: 2,
      name: TESTIMONIAL.author,
    });
    expect(heading.tagName).toBe("H2");
    expect(heading.getAttribute("id")).toBe(TITLE_ID);
    expect(heading.getAttribute("id")).toBe(
      dialog.getAttribute("aria-labelledby"),
    );
    expect(heading.textContent).toBe(TESTIMONIAL.author);
    // Un único heading en la pieza (Anatomía: solo el h2 del autor).
    expect(within(dialog).getAllByRole("heading")).toHaveLength(1);
  });
});

// --- T1 · RF-4: rol y texto completo en la columna body (Test 2) ---------------
describe("TestimonialDialog role and full text (T1: RF-4)", () => {
  it("shows the role and the complete testimonial text in the body column", () => {
    render(testimonialDialog());
    const dialog = screen.getByRole("dialog", { name: TESTIMONIAL.author });

    // Tests esperados 2 / "Hecho cuando": muestra `role` y el texto COMPLETO
    // (`testimonial.text`) — getByText devuelve el <p> más interno con el
    // texto; a diferencia de la card, acá no hay recorte (RF-4).
    const roleParagraph = within(dialog).getByText(TESTIMONIAL.role);
    expect(roleParagraph.tagName).toBe("P");
    const textParagraph = within(dialog).getByText(TESTIMONIAL.text);
    expect(textParagraph.tagName).toBe("P");

    // Anatomía literal (spec → Anatomía): dialog > [button.close,
    // div.layout]; layout > [div.aside, div.body]; body = h2 + p(role) +
    // p(texto), en ese orden. Se aserta DOM (tags y relaciones), NO clases:
    // las clases del módulo conectan en T3.
    expect(dialog.firstElementChild?.tagName).toBe("BUTTON");
    const layout = dialog.lastElementChild;
    expect(layout?.tagName).toBe("DIV");
    expect(dialog.children).toHaveLength(2);

    const aside = layout?.firstElementChild;
    const body = layout?.lastElementChild;
    expect(aside?.tagName).toBe("DIV");
    expect(body?.tagName).toBe("DIV");
    expect(layout?.children).toHaveLength(2);

    // Columna body: h2, p de rol y p de texto, hijos directos y en orden.
    const heading = within(dialog).getByRole("heading", { level: 2 });
    expect(body?.firstElementChild).toBe(heading);
    expect(roleParagraph.parentElement).toBe(body);
    expect(textParagraph.parentElement).toBe(body);
    expect(body?.children).toHaveLength(3);
  });
});

// --- T1 · RF-4: HexAvatar decorativo y comilla gradient en el aside ------------
describe("TestimonialDialog decorative avatar and quote (T1: RF-4)", () => {
  it("renders the HexAvatar with empty alt and the gradient quote below it in the aside", () => {
    render(testimonialDialog());
    const dialog = screen.getByRole("dialog", { name: TESTIMONIAL.author });

    // "Hecho cuando" de T1: HexAvatar `alt=""` (decorativa: el nombre está al
    // lado; default de la primitiva, RF-4 / No hacer: no se reimplementa).
    // Selección estructural justificada (encabezado): `alt=""` la saca del
    // árbol accesible.
    const img = dialog.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute("src", TESTIMONIAL.avatar.src);
    expect(screen.queryByRole("img")).toBeNull();

    // Comilla decorativa `Icon name="quote" tone="gradient"` (Anatomía /
    // tabla → Comilla; en T1 solo presencia —el `--icon-size: 2rem` de
    // `.quote` es del módulo, T3—): resuelve url(#accent-gradient) de las
    // defs del armazón y sale aria-hidden (sin `label` → decorativa).
    const quote = dialog.querySelector('svg[stroke="url(#accent-gradient)"]');
    expect(quote).not.toBeNull();
    expect(quote).toHaveClass("lucide-quote");
    expect(quote).toHaveAttribute("aria-hidden", "true");

    // Anatomía: aside = columna 1 del layout con el avatar ARRIBA y la
    // comilla DEBAJO (orden DOM; spec → tabla Comilla: "debajo del avatar").
    // El wrap del HexAvatar es el <span> abuelo del img (span.wrap >
    // span.border > img; Anatomía de HexAvatar), por eso no se usa closest.
    const layout = dialog.lastElementChild;
    const aside = layout?.firstElementChild;
    expect(aside?.firstElementChild?.tagName).toBe("SPAN");
    expect(aside?.querySelector("img")).toBe(img);
    expect(aside?.lastElementChild).toBe(quote);
    expect(quote?.parentElement).toBe(aside);
  });
});

// --- T1 · RF-2/Test 7: botón Close nombrado por closeLabel ----------------------
describe("TestimonialDialog close button named by closeLabel (T1: RF-2, Test 7)", () => {
  it("renders the Close button with type=button, aria-label from closeLabel and the x glyph", () => {
    render(testimonialDialog());
    const dialog = screen.getByRole("dialog", { name: TESTIMONIAL.author });

    // Tests esperados 7 / "Hecho cuando": `getByRole("button", { name:
    // closeLabel })` con `aria-label={closeLabel}` (el nombre lo expone el
    // aria-label; Anatomía: `<button type="button" class="close">`).
    const button = within(dialog).getByRole("button", { name: CLOSE_LABEL });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("aria-label", CLOSE_LABEL);

    // Anatomía: el botón es el PRIMER hijo del dialog (antes del layout) y
    // el ícono x es decorativo (sin `label` → aria-hidden; el nombre del
    // botón sale solo del aria-label).
    expect(dialog.firstElementChild).toBe(button);
    const glyph = button.querySelector("svg");
    expect(glyph).not.toBeNull();
    expect(glyph).toHaveClass("lucide-x");
    expect(glyph).toHaveAttribute("aria-hidden", "true");
  });

  it("names the close button with whatever closeLabel arrives (prop wiring, no hardcoded)", () => {
    // Test 7 completo: el nombre viene de la prop — con otra `closeLabel`
    // ("Cerrar", valor ES documentado en spec → API) el botón se nombra con
    // ella y el nombre anterior desaparece (no hay texto hardcodeado).
    render(testimonialDialog({ closeLabel: "Cerrar" }));
    const dialog = screen.getByRole("dialog", { name: TESTIMONIAL.author });

    expect(within(dialog).queryByRole("button", { name: CLOSE_LABEL })).toBeNull();
    expect(
      within(dialog).getByRole("button", { name: "Cerrar" }),
    ).toHaveAttribute("aria-label", "Cerrar");
  });
});

// --- T1 · RF-2 (tramo): click en Close → onClose una vez vía close -------------
describe("TestimonialDialog close button emits through the close event (T1: RF-2)", () => {
  it("calls onClose exactly once via the close event when the Close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(testimonialDialog({ onClose }));

    const dialog = screen.getByRole("dialog", { name: TESTIMONIAL.author });
    await user.click(within(dialog).getByRole("button", { name: CLOSE_LABEL }));

    // Tests esperados 3 (tramo T1) / "Hecho cuando": onClose EXACTAMENTE una
    // vez. Que el camino pasa por `dialog.close()` (y NO es una llamada
    // directa desde onClick) es observable: el mock de F1 quita el atributo
    // `open` y despacha el evento `close` solo dentro de `close()` — con
    // `open` ausente y 1 sola llamada queda fijado Close → close() → close
    // → onClose (spec → No hacer: el botón no llama onClose directo).
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(dialog).not.toHaveAttribute("open");
  });
});

// --- T2 · RF-2: evento `close` sintético — camino Esc (Tests esperados 4) -------
describe("TestimonialDialog native close event emits onClose once (T2: RF-2)", () => {
  it("calls onClose exactly once when a synthetic close event fires (Esc path)", () => {
    // Tabla → ciclo (RF-2): el Esc nativo NO llama `close()`; el navegador
    // cierra y DISPARA el evento `close`. Se simula ese disparo sobre el
    // dialog abierto con dispatch directo (el atributo `open` queda puesto a
    // propósito: quitarlo es trabajo del navegador —jsdom no lo implementa—,
    // no de la pieza; el botón Close ya probó el camino close() en T1). Que
    // React entregue el evento al prop `onClose` está garantizado por el
    // propio T1: `close` es evento no-delegated (listener directo en el
    // elemento), y el mock de F1 lo despachaba ya sobre el elemento.
    const onClose = vi.fn();
    render(testimonialDialog({ onClose }));
    const dialog = screen.getByRole<HTMLDialogElement>("dialog", {
      name: TESTIMONIAL.author,
    });

    dialog.dispatchEvent(new Event("close"));

    // Test 4 / "Hecho cuando": onClose EXACTAMENTE una vez (handleClose es el
    // único call site; un guard mal que lo saltara o un doble wiring daría 2).
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// --- T2 · RF-3: backdrop real vs franja de padding vs contenido (Test 5) --------
// Rect finito del dialog para los clicks de decisión 19: jsdom no hace layout y
// `getBoundingClientRect` devolvería todo ceros (criterio indecidible). Spy sobre
// la instancia con DOMRect real de jsdom (medido: existe en el entorno):
// (x=10, y=10, w=490, h=390) → left/top 10, right/bottom 500/400. Dentro:
// padding (15,15) y contenido (250,200); fuera: backdrop (5,5). Patrón de
// medición mockeada del plan (strategy de tests de Carousel: Object.defineProperty
// /mock de rects y offsets; acá sobre getBoundingClientRect, sin tocar setup.ts).
const mockDialogRect = (dialog: HTMLDialogElement) =>
  vi
    .spyOn(dialog, "getBoundingClientRect")
    .mockReturnValue(new DOMRect(10, 10, 490, 390));

// Click con coords sobre el nodo que fija el `target` (justificación en el
// encabezado): MouseEvent nativo burbujeante, como el click real del navegador.
const clickAt = (el: Element | null | undefined, clientX: number, clientY: number) => {
  el?.dispatchEvent(new MouseEvent("click", { clientX, clientY, bubbles: true }));
};

describe("TestimonialDialog backdrop closes, padding and content do not (T2: RF-3)", () => {
  it("closes via close() when the click targets the dialog outside its rect (real backdrop)", () => {
    const onClose = vi.fn();
    render(testimonialDialog({ onClose }));
    const dialog = screen.getByRole<HTMLDialogElement>("dialog", {
      name: TESTIMONIAL.author,
    });
    mockDialogRect(dialog);

    // (5,5): target === dialog y punto FUERA del rect (10..500 × 10..400) →
    // ::backdrop real (decisión 19) → `dialog.close()` (tabla → ciclo: el
    // backdrop NO llama onClose directo).
    clickAt(dialog, 5, 5);

    // Observable: onClose EXACTAMENTE una vez vía el evento `close` del mock
    // (si el handler llamara onClose directo, `open` quedaría; si llamara
    // ambos, serían 2 llamadas) y el atributo `open` ausente.
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(dialog).not.toHaveAttribute("open");
  });

  it("keeps the dialog open when the click targets the dialog inside its rect (padding strip)", () => {
    const onClose = vi.fn();
    render(testimonialDialog({ onClose }));
    const dialog = screen.getByRole<HTMLDialogElement>("dialog", {
      name: TESTIMONIAL.author,
    });
    mockDialogRect(dialog);

    // (15,15): target === dialog PERO dentro del rect = franja de padding →
    // NO cierra (RF-3 / decisión 19: el cierre por click exige AMBAS
    // condiciones). Con el rect todo-ceros de jsdom sin mock este caso sería
    // indecidible — de ahí el spy.
    clickAt(dialog, 15, 15);

    expect(onClose).not.toHaveBeenCalled();
    expect(dialog).toHaveAttribute("open");
  });

  it("keeps the dialog open when the click bubbles up from the layout content", () => {
    const onClose = vi.fn();
    render(testimonialDialog({ onClose }));
    const dialog = screen.getByRole<HTMLDialogElement>("dialog", {
      name: TESTIMONIAL.author,
    });
    mockDialogRect(dialog);

    // Anatomía (dialog > [button, div.layout]; la clase `.layout` llega en
    // T3 — selección estructural, mismo criterio de T1): el click desde el
    // layout burbujea hasta el handler del dialog con target ≠ dialog → el
    // guard de target corta el cierre (Tests esperados 5: "click dentro del
    // contenido no cierra"; coords dentro del rect, como un click real).
    const layout = dialog.lastElementChild;
    expect(layout?.tagName).toBe("DIV");
    clickAt(layout, 250, 200);

    expect(onClose).not.toHaveBeenCalled();
    expect(dialog).toHaveAttribute("open");
  });
});

// --- T2 · RF-3: cierre iniciado por el padre y ciclo null↔valor (Tests 5–6) -----
describe("TestimonialDialog parent-driven close and reopen cycle (T2: RF-3)", () => {
  it("cleanup calls dialog.close() without emitting onClose when the parent sets testimonial to null", () => {
    // Test 6 / "Hecho cuando": valor→null con el dialog abierto. El cleanup
    // del effect de apertura (dep [open]) corre con el nodo YA desprendido
    // (return null: React suelta `dialogRef` en la fase de mutación, antes
    // del cleanup passive), por eso la implementación debe capturar
    // `const el = dialogRef.current` en el CUERPO del effect (guía del
    // review de T1). Se espía `close` sobre la instancia para observar la
    // llamada en el nodo ya fuera del DOM (sin superficie accesible para eso:
    // justificación de selección directa, constitución T3; el spy conserva la
    // implementación original del mock de F1).
    const onClose = vi.fn();
    const { rerender } = render(testimonialDialog({ onClose }));
    const dialog = screen.getByRole<HTMLDialogElement>("dialog", {
      name: TESTIMONIAL.author,
    });
    const closeSpy = vi.spyOn(dialog, "close");

    rerender(testimonialDialog({ testimonial: null, onClose }));

    // El cleanup llamó close()…
    expect(closeSpy).toHaveBeenCalledTimes(1);
    // …18=b: sin dialog en el DOM tras el valor→null…
    expect(screen.queryByRole("dialog")).toBeNull();
    // …y el cierre iniciado por el padre NO emite onClose (tabla → ciclo: "el
    // ref ya es null"). ORDEN del guard: la sincronización del ref `latest` se
    // fija como useLayoutEffect — la fase de layout (create) corre en el
    // commit, ANTES del cleanup passive — para que al dispararse `close()` el
    // ref ya sea null. Matiz medido en esta tarea (no debilita nada; lo
    // reporta al reviewer): el assert NO discrimina hoy contra la variante
    // useEffect (verde también con el sync en passive) porque React 19 borra
    // la instancia interna del nodo retirado en la fase de mutación y el
    // evento `close` despachado sobre el nodo desprendido no llega al handler;
    // la invariant de la tabla queda garantizada por el orden de fases
    // independientemente de ese detalle interno de React (prueba directa de
    // que el evento SÍ llega al handler mientras el nodo está montado: el
    // describe Esc sintético de T2).
    expect(onClose).not.toHaveBeenCalled();
  });

  it("survives value null value without duplicated listeners: one onClose after reopening", async () => {
    // "Hecho cuando": valor→null→valor sin listeners duplicados — un click
    // Close tras reabrir emite onClose UNA sola vez en total (mismo spy en el
    // mismo árbol: los ciclos de cleanup/montaje del effect [open] no dejan
    // handlers hueros ni cierres de más).
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender } = render(testimonialDialog({ onClose }));
    expect(screen.getByRole("dialog", { name: TESTIMONIAL.author })).toHaveAttribute("open");

    // Cierre del padre: sin emisión (cubre de paso el orden del guard en el
    // primer tramo del ciclo).
    rerender(testimonialDialog({ testimonial: null, onClose }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(onClose).not.toHaveBeenCalled();

    // Reapertura: el nodo aparece de nuevo y el effect lo abre (T1) con el
    // guard del ref fresco (latest ya es el valor otra vez).
    rerender(testimonialDialog({ testimonial: TESTIMONIAL, onClose }));
    const dialog = screen.getByRole("dialog", { name: TESTIMONIAL.author });
    expect(dialog).toHaveAttribute("open");

    await user.click(within(dialog).getByRole("button", { name: CLOSE_LABEL }));

    // 1 sola llamada tras reabrir (Close → close() → close → onClose; sin
    // duplicados del ciclo anterior).
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
