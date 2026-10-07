// Tests de T2 (specs/content/TestimonialCarousel/tasks.md) — RF-1 y RF-6:
// región ÚNICA dueña del carrusel (decisión 20: la `<section>` raíz con
// `aria-roledescription="carousel"` es la región nombrada; AboutPage NO la
// envuelve en otra section — inspección DOM: exactamente un `<section>` en el
// render y ninguno anidado) con un `group` por testimonio
// (`aria-roledescription="slide"`, nombre "n of N" 1-based con `total =
// testimonials.length`, no de stops — spec → Comportamiento "Nombre del slide";
// `format` de i18n) y el dialog ÚNICO cableado (RF-6: click en el botón de la
// card → `TestimonialDialog` abierto con ese autor; cerrar → el nodo desaparece
// del DOM, que es la observable de que `selectedId` volvió a `null` con el
// montaje condicional 18=b de la primitiva).
//
// Escenarios (Tests esperados de la spec): 5 + decisión 20 (caso 1, región por
// `aria-label` default), 6 (caso 2, slides "n of N"), 5 rama `aria-labelledby`
// (caso 3, armazón `<h2 id>`, criterio SkillList.test T1), 11 rama 0 testimo-
// nios (caso 4, container vacío — render LISO sin armazón defs, criterio
// TestimonialDialog.test T1) y 10 (caso 5, ciclo del dialog con la card B).
//
// Rojo on-arrival (decisión #101, criterio exacto TestimonialDialog T1): este
// commit `test(TestimonialCarousel): T2` es rojo por "Failed to resolve
// import" de "./TestimonialCarousel" (el componente no existe aún; T1 solo
// creó las funciones puras) — todo el archivo falla en la resolución del
// módulo y el rojo desaparece solo con el `feat`.
//
// Diferidos declarados (tasks.md): bullets por stops y `aria-current` (T3; la
// label `goToSlide` del fixture NO se consume todavía), `scrollTo` con
// `behavior` (T4) y estilos/clases del track/slide/pagination + cierre
// `expectNoA11yViolations` + `index.ts` (T5 — el cierre axe LLEGA con la
// última tarea, patrón TestimonialCard/TestimonialDialog, no se adelanta). En
// T2 ningún test aserta clases de módulo ni mide layout (offsets/scrollTo no
// existen todavía; el fixture del carrusel se pasa con clases/mediciones
// mockeadas recién desde T3). La unión G-B de `className` sobre el `<section>`
// raíz se CONECTA en T2 (criterio IconBox T2: el módulo nace con la clase base
// vacía) pero no tiene contrapartida en "Tests esperados" de la spec ni en el
// "Hecho cuando" de T2: sin test propio.
//
// Justificación de queries (constitución T3): región por
// `getByRole("region", { name })` — la `<section>` con nombre accesible
// resuelve role region (precedente ResumeSection.test/Box.test) y
// `aria-roledescription` no cambia el rol, solo su descripción; slides por
// `getByRole("group", { name: "1 of 3" })` con el nombre LITERAL (el test no
// recalcula `format`: no ser tautológico sobre la implementación; la
// interpolación ya está testeada en i18n); la estructura `<ul>`/`<li>` por
// inspección DOM (Anatomía, sin clases hasta T5, criterio TestimonialDialog
// T1); dialog por `getByRole("dialog", { name: author })` y su desaparición
// además por `container.querySelector("dialog")` null: con un estado `null`
// mal vuelto, el nodo podría quedar montado CERRADO y `queryByRole` daría null
// igual (jsdom aplica el `display: none` UA del dialog cerrado) — el assert
// estructural es el que prueba la decisión 18=b y por tanto el `null` de
// RF-6. `data-testid`: no hace falta, la API expone roles y nombres.
//
// El click del caso 5 se hace sobre el botón estirado de la card B
// (`getByRole("button", { name: "Read full testimonial from Grace Hopper" })`):
// fija de paso la interpolación de `readMore` con el `author` de CADA card
// (los tres nombres son distintos, B es unique). El Close se busca por rol +
// `LABELS.close` ("Close", string ficticia del fixture; F1 mock de
// showModal/close del setup: `close()` quita `open` y despacha el evento
// `close` → onClose del carrusel → `setSelectedId(null)`).
//
// Datos ficticios (constitución D4): tres `Testimonial` de ejemplo (ids
// `t-a`/`t-b`/`t-c`, personas y empresas inventadas), sin datos reales.

import { render, screen, within } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { afterEach, vi } from "vitest";

import type { Testimonial } from "@data/cv.types.generated";

import { HexAvatarDefs } from "../HexAvatar";
import { AccentGradientDefs } from "../Icon";

import { TestimonialCarousel } from "./TestimonialCarousel";
import type {
  TestimonialCarouselLabels,
  TestimonialCarouselProps,
} from "./TestimonialCarousel";

// --- Fixtures -----------------------------------------------------------------
// `Testimonial` del esquema (D4: personas ficticias, espejo de la forma de
// src/content/cv.en.json). Autores DISTINTOS: los nombres interpolados de
// `readMore` y del dialog son únicos por testimonio.
const TESTIMONIAL_A: Testimonial = {
  id: "t-a",
  author: "Ada Lovelace",
  role: "Engineering Lead, Analytical Engines",
  avatar: { src: "/images/testimonials/ada.svg" },
  text: "Ada delivered exceptional results across every milestone of the program.",
};
const TESTIMONIAL_B: Testimonial = {
  id: "t-b",
  author: "Grace Hopper",
  role: "Product Director, Compiler Labs",
  avatar: { src: "/images/testimonials/grace.svg" },
  text: "Grace turned a chaotic roadmap into a predictable shipping machine.",
};
const TESTIMONIAL_C: Testimonial = {
  id: "t-c",
  author: "Alan Turing",
  role: "Chief Scientist, Enigma Works",
  avatar: { src: "/images/testimonials/alan.svg" },
  text: "Alan reasoned about the hardest problems better than anyone I worked with.",
};

const TESTIMONIALS: readonly Testimonial[] = [
  TESTIMONIAL_A,
  TESTIMONIAL_B,
  TESTIMONIAL_C,
];

// Textos de interfaz ficticios (D4): la pieza recibe `labels` crudas con
// placeholders y las interpola con `format` (spec → API; C2/C3: la string ya
// traducida llega de fuera). `goToSlide` no se consume hasta T3.
const LABELS: TestimonialCarouselLabels = {
  carousel: "Testimonials",
  slide: "{current} of {total}",
  goToSlide: "Go to slide {n}",
  readMore: "Read full testimonial from {author}",
  close: "Close",
};

// Helper: armazones `HexAvatarDefs` + `AccentGradientDefs` (contrato de las
// primitivas: las cards y el dialog montan `HexAvatar` y comilla/iconos
// `tone="gradient"`; en la app los monta AppLayout una sola vez) + el carrusel
// con la API completa por props (C2: sin providers). `overrides` varía
// `testimonials`/`labelledBy` por caso (el commit test(T2) es un solo archivo
// nuevo; el helper no se toca en tareas posteriores para agregar bullets).
const carousel = (overrides: Partial<TestimonialCarouselProps> = {}) => (
  <>
    <HexAvatarDefs />
    <AccentGradientDefs />
    <TestimonialCarousel testimonials={TESTIMONIALS} labels={LABELS} {...overrides} />
  </>
);

// --- T2 · RF-1 (decisión 20): región única nombrada por aria-label -----------
describe("TestimonialCarousel single named carousel region (T2: RF-1, Tests 5)", () => {
  it("renders exactly one carousel section as the named region without nesting another section", () => {
    const { container } = render(carousel());

    // "Hecho cuando": getByRole("region", { name }) sobre la <section> raíz
    // con aria-roledescription="carousel"; el nombre sale de
    // `aria-label={labels.carousel}` (sin `labelledBy`).
    const region = screen.getByRole("region", { name: LABELS.carousel });
    expect(region.tagName).toBe("SECTION");
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
    expect(region).toHaveAttribute("aria-label", LABELS.carousel);
    expect(region).not.toHaveAttribute("aria-labelledby");

    // Decisión 20 / RF-1: el carrusel es DUEÑO de la única <section> — ni una
    // segunda en el render (1 total) ni anidada dentro de la región (las defs
    // del armazón no aportan sections: el conteo es del fragmento completo).
    expect(container.querySelectorAll("section")).toHaveLength(1);
    expect(container.querySelectorAll("section")[0]).toBe(region);
    expect(region.querySelector("section")).toBeNull();

    // El dialog cableado nace CERRADO (RF-6: `selectedId = null` → 18=b: sin
    // <dialog> en el DOM).
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(container.querySelector("dialog")).toBeNull();
  });
});

// --- T2 · RF-1: un group "slide" por testimonio, "n of N" 1-based --------------
describe("TestimonialCarousel slide groups one-based n of total (T2: RF-1, Tests 6)", () => {
  it("renders one slide group per testimonial named one of three through three of three in order", () => {
    render(carousel());

    // "Hecho cuando" / Tests 6: un `group` por testimonio (3 = length, NO de
    // stops — spec → Comportamiento "Nombre del slide": `total =
    // testimonials.length`) con aria-roledescription="slide" y nombre
    // "n of N" 1-based. Nombres literales (no recalculados con `format`).
    const groupA = screen.getByRole("group", { name: "1 of 3" });
    const groupB = screen.getByRole("group", { name: "2 of 3" });
    const groupC = screen.getByRole("group", { name: "3 of 3" });
    expect(screen.getAllByRole("group")).toHaveLength(3);

    for (const group of [groupA, groupB, groupC]) {
      expect(group).toHaveAttribute("aria-roledescription", "slide");
    }

    // Anatomía (spec → Anatomía): <section> > <ul> track > <li role="group">
    // por slide, en orden del array — orden y estructura por inspección DOM
    // (las clases `.track`/`.slide` conectan en T5; acá el DOM nace sin ellas).
    expect(groupA.tagName).toBe("LI");
    expect(groupB.tagName).toBe("LI");
    expect(groupC.tagName).toBe("LI");
    const track = groupA.parentElement;
    expect(track?.tagName).toBe("UL");
    expect(track?.children).toHaveLength(3);
    expect(track?.parentElement).toBe(
      screen.getByRole("region", { name: LABELS.carousel }),
    );

    // Cada slide contiene su card en el orden correcto del array (indice →
    // "n of N" 1-based): el h3 de la card nombra la región article dentro del
    // group (TestimonialCard RF-7).
    expect(
      within(groupA).getByRole("heading", {
        level: 3,
        name: TESTIMONIAL_A.author,
      }),
    ).toBeInTheDocument();
    expect(
      within(groupB).getByRole("article", { name: TESTIMONIAL_B.author }),
    ).toBeInTheDocument();
    expect(
      within(groupC).getByRole("article", { name: TESTIMONIAL_C.author }),
    ).toBeInTheDocument();
  });
});

// --- T2 · RF-1: nombre por labelledBy (armazón <h2 id>) -------------------------
describe("TestimonialCarousel region named by labelledBy (T2: RF-1, Tests 5)", () => {
  it("takes the accessible name from the referenced heading when labelledBy is given", () => {
    // Armazón <h2 id> (criterio SkillList.test T1 / ResumeSection): cuando hay
    // heading visible encima se pasa `labelledBy` EN LUGAR de `aria-label`
    // (spec → Anatomía nota decisión 20).
    const HEADING_ID = "about-testimonials-title";
    const HEADING_TEXT = "What clients say";
    render(
      <>
        <h2 id={HEADING_ID}>{HEADING_TEXT}</h2>
        <TestimonialCarousel
          testimonials={TESTIMONIALS}
          labels={LABELS}
          labelledBy={HEADING_ID}
        />
      </>,
    );

    // "Hecho cuando": el nombre accesible de la región sale del heading y NO
    // hay aria-label (una u otra, no ambas).
    const region = screen.getByRole("region", { name: HEADING_TEXT });
    expect(region).toHaveAttribute("aria-labelledby", HEADING_ID);
    expect(region).not.toHaveAttribute("aria-label");
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
  });
});

// --- T2 · RF-1 (SI vacío): testimonials=[] → no renderiza ----------------------
describe("TestimonialCarousel empty testimonials (T2: RF-1, Tests 11)", () => {
  it("renders nothing when testimonials is empty", () => {
    // Render LISO (sin armazón defs; criterio TestimonialDialog.test T1): el
    // "Hecho cuando" exige `container` vacío.
    const { container } = render(
      <TestimonialCarousel testimonials={[]} labels={LABELS} />,
    );

    // RF-1 rama vacío: no renderiza nada — ni la <section> región.
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("region")).toBeNull();
  });
});

// --- T2 · RF-6: dialog único cableado — abrir con la card y cerrar ------------
describe("TestimonialCarousel wires the single dialog through card open and close (T2: RF-6, Tests 10)", () => {
  it("opens the dialog with that author from the card button and removes it on close", async () => {
    const user = userEvent.setup();
    const { container } = render(carousel());

    // Tests 10 / "Hecho cuando": click en el botón de una card (acá la B) →
    // el botón estirado nombrado por `readMore` interpolado con el author de
    // ESA card (fija de paso el cableado onOpen→selectedId por id).
    await user.click(
      screen.getByRole("button", {
        name: "Read full testimonial from Grace Hopper",
      }),
    );

    // `TestimonialDialog` abierto con ese autor (RF-6: `testimonial` derivado
    // del `selectedId` por `find` — el texto COMPLETO de B en el dialog
    // descarta que el find haya tomado otro testimonio; `open` = observable
    // del showModal en el mock de F1).
    const dialog = screen.getByRole("dialog", { name: TESTIMONIAL_B.author });
    expect(dialog).toHaveAttribute("open");
    expect(within(dialog).getByText(TESTIMONIAL_B.text)).toBeInTheDocument();

    // Cerrar (botón Close nombrado por `labels.close`; camino RF-2 de la
    // primitiva: close() → evento close → onClose → setSelectedId(null)).
    await user.click(within(dialog).getByRole("button", { name: "Close" }));

    // "desaparece y el estado vuelve a null" (RF-6): queryByRole null NO es
    // suficiente solo (un dialog montado-cerrado también da null; ver
    // justificación del encabezado) — el assert estructural prueba que el
    // nodo salió del DOM (18=b: con `testimonial = null` no hay <dialog>).
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(container.querySelector("dialog")).toBeNull();
  });
});

// ============================================================================
// T3 — RF-3 / RF-5: bullets por stops con aria-current (spec → Tests esperados
// 7 y 9, y la rama "≤1 stop → sin bullets" del 11; el caso 0-testimonios del
// 11 ya lo cubre T2 arriba). Escenarios del "Hecho cuando" de T3: layout
// mockeado [0,300,600] con maxScroll 300 → 2 bullets nombrados "Go to slide
// 1"/"Go to slide 2" (regla stop→n de spec → Comportamiento), el del stop
// activo inicial (scrollLeft 0) con aria-current="true"; fireEvent.scroll con
// scrollLeft 300 → aria-current pasa al bullet 2 y el 1 queda sin atributo;
// 1 stop o menos → sin bullets (1 testimonio; 2 testimonios con 2 por vista).
//
// Rojo on-arrival (decisión #101, declarado con la salida en el commit
// `test(TestimonialCarousel): T3`): FALLAN los 2 primeros describes nuevos por
// la razón correcta — la implementación de T2 no renderiza paginación:
// "Unable to find role=button … Go to slide N" — y PASAN ya los 2 casos de
// ausencia de bullets (rama ≤1 stop): la implementación vigente nunca dibujó
// bullets, así que su valor es de regresión FUTURA (fijan que la paginación
// aparece SOLO con >1 stop, no por el trivial "nunca hay bullets"). No es un
// rojo artificial: el alcance discriminatorio de T3 (bullets existentes,
// nombres por la regla stop→n, aria-current inicial y su móvil con scroll)
// vive íntegro en los describes que fallan.
//
// MECANISMO DE MEDICIÓN ELEGIDO (la tarea deja elegir; se declara con su
// justificación): jsdom 30 define `offsetLeft` como accessor-getter en
// `HTMLElement.prototype` y `scrollWidth`/`clientWidth` en
// `Element.prototype` (verificado en `node_modules/jsdom/lib/generated/idl`),
// todos retornando 0 sin layout. Los spies de accessores se instalan en el
// PROTOTIPO **antes** de `render`, con el offset indexado por la posición del
// slide entre los hijos de su padre: el mount-effect que mide (RF-3) lee
// valores ya mockeados en el primer commit, sin rerenders ni forceos.
// Alternativa descartada: `Object.defineProperty` por instancia post-render +
// rerender con nueva identidad de `testimonials` para re-disparar la
// medición — dependería de un detalle de implementación del effect (sus deps),
// duplicaría el armazón de defs en el rerender y dejaría la medición del mount
// real sin exercised. Aquí el mecanismo no toca la API: mocks sobre
// instancias/prototipo, sin `window` global accedido fuera de refs/efectos en
// el componente. `scrollLeft` SÍ se fija por instancia con
// `Object.defineProperty` en el momento del scroll (como sugiere spec → Tests
// esperados): es lo único que cambia post-mount, y el handler lo lee vivo del
// nodo (RF-5: el valor del frame, no del estado).
//
// rAF (RF-5, un cálculo por frame): stub SÍNCRONO (`callback(0)` en el acto),
// una de las dos opciones que ofrece tasks.md (la otra, `vi.waitFor` con rAF
// real, introduce timers de 16ms y updates fuera del flujo síncrono de act).
// Con callback síncrono el update cae dentro del `fireEvent.scroll` (envuelto
// en act) y el assert es inmediato y determinista. El stub no debilita el
// contrato: la implementación gatea con flag pending (no asume que el id se
// escribe antes del callback), y "un cálculo por frame" no tiene test propio
// en la spec.
//
// Limpieza: `afterEach` local con `restoreAllMocks` + `unstubAllGlobals` (los
// spies de prototipo viven en este archivo y filtrarían al test siguiente si
// no se restauran). No afecta a los tests de T2: no registran mocks ni stubs.
//
// Justificación de queries (constitución T3): bullets por rol `button` +
// nombre accesible LITERAL ("Go to slide 1"/"Go to slide 2" — el test no
// recalcula `format` ni la regla stop→n: no ser tautológico; el conteo con
// regex /Go to slide/ separa los bullets de los botones estirados de las
// cards, que no coinciden). `aria-current` por atributo literal "true" (RF-5
// lo fija con ese valor); ausencia = not.toHaveAttribute (la implementación
// pasa `undefined`, no "false"). La estructura (div paginación hermano
// del <ul> track dentro de la región única) por inspección DOM —Anatomía—,
// sin clases de módulo hasta T5 (criterio T2). Sin `data-testid`: la API
// expone roles y nombres.
// ============================================================================

// Helper de layout mockeado: offsets por índice del slide dentro de su padre
// (el componente solo lee `offsetLeft` de los hijos del track; ningún otro
// nodo del árbol lo consume) y `scrollWidth`/`clientWidth` constantes en el
// prototipo (el track es el único lector de ambos en la pieza).
const mockCarouselLayout = (
  slideOffsets: readonly number[],
  scrollWidth: number,
  clientWidth: number,
): void => {
  vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(
    function (this: HTMLElement): number {
      const parent = this.parentElement;
      if (parent === null) {
        return 0;
      }
      const index = Array.from(parent.children).indexOf(this);
      return slideOffsets[index] ?? 0;
    },
  );
  vi.spyOn(Element.prototype, "scrollWidth", "get").mockReturnValue(
    scrollWidth,
  );
  vi.spyOn(Element.prototype, "clientWidth", "get").mockReturnValue(clientWidth);
};

// rAF síncrono para el handler de scroll (flush inmediato dentro del fireEvent).
const stubSyncRaf = (): void => {
  vi.stubGlobal(
    "requestAnimationFrame",
    (callback: FrameRequestCallback): number => {
      callback(0);
      return 1;
    },
  );
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// --- T3 · RF-3 (Tests 7): un bullet por stop, regla stop→n, activo inicial ---
describe("TestimonialCarousel renders one bullet per reachable stop with the first aria-current (T3: RF-3, Tests 7)", () => {
  it("renders two bullets named go to slide 1 and 2 with the first carrying aria-current true", () => {
    // [0,300,600] con maxScroll = 900 − 600 = 300 → stops [0,300] (caso 1 de
    // las puras, aplicado): 3 slides → 2 bullets. Regla stop→n (decisión 21):
    // stop 0 → primer offset ≥ −1 → slide 1 → "Go to slide 1"; stop 300 (el
    // 600 recortado deduplica contra el 300 nativo) → primer offset ≥ 299 →
    // slide 2 → "Go to slide 2".
    mockCarouselLayout([0, 300, 600], 900, 600);
    render(carousel());

    const bullet1 = screen.getByRole("button", { name: "Go to slide 1" });
    const bullet2 = screen.getByRole("button", { name: "Go to slide 2" });
    expect(
      screen.getAllByRole("button", { name: /Go to slide/ }),
    ).toHaveLength(2);

    // RF-3 → decisión 21: bullet activo inicial una vez calculados los stops
    // (mount, scrollLeft 0) → getActiveStop → el primero, con aria-current
    // LITERAL "true"; el otro sin el atributo.
    expect(bullet1).toHaveAttribute("aria-current", "true");
    expect(bullet2).not.toHaveAttribute("aria-current");

    // Anatomía (spec → Anatomía): div de paginación con exactamente los 2
    // botones en orden, hermano del <ul> track y dentro de la región única
    // (sin clases de módulo hasta T5: inspección DOM, criterio T2).
    const pagination = bullet1.parentElement;
    expect(pagination?.tagName).toBe("DIV");
    expect(pagination?.children).toHaveLength(2);
    expect(pagination?.children.item(1)).toBe(bullet2);
    const region = screen.getByRole("region", { name: LABELS.carousel });
    expect(pagination?.parentElement).toBe(region);
    expect(pagination?.previousElementSibling?.tagName).toBe("UL");

    // Los bullets no reemplazan slides: la región sigue con sus 3 groups.
    expect(screen.getAllByRole("group")).toHaveLength(3);
  });
});

// --- T3 · RF-5 (Tests 9): scroll con rAF mueve el aria-current ----------------
describe("TestimonialCarousel moves aria-current to the bullet of the active stop on scroll (T3: RF-5, Tests 9)", () => {
  it("moves aria-current from bullet 1 to bullet 2 when the track scrolls to the second stop", () => {
    stubSyncRaf();
    mockCarouselLayout([0, 300, 600], 900, 600);
    render(carousel());

    const region = screen.getByRole("region", { name: LABELS.carousel });
    const track = region.querySelector("ul");
    if (track === null) {
      throw new Error("T3: la región del carrusel no contiene el <ul> track");
    }

    // Scroll real post-mount: `scrollLeft` se fija POR INSTANCIA
    // (Object.defineProperty, como fija spec → Tests esperados) y el handler
    // lo lee vivo del NODO en el callback rAF (RF-5).
    Object.defineProperty(track, "scrollLeft", {
      value: 300,
      configurable: true,
    });
    fireEvent.scroll(track);

    // getActiveStop([0,300], 300) → índice 1: el bullet 2 pasa a "true" y el
    // 1 queda SIN atributo (aria-current={... : undefined} → sin attr).
    const bullet1 = screen.getByRole("button", { name: "Go to slide 1" });
    const bullet2 = screen.getByRole("button", { name: "Go to slide 2" });
    expect(bullet2).toHaveAttribute("aria-current", "true");
    expect(bullet1).not.toHaveAttribute("aria-current");
  });
});

// --- T3 · RF-3 (Tests 11, rama ≤1 stop): sin bullets ---------------------------
describe("TestimonialCarousel renders no bullets when there is one stop or fewer (T3: RF-3, Tests 11)", () => {
  it("renders no bullets for a single testimonial but keeps the region and its card", () => {
    // [0] con maxScroll = 600 − 600 = 0 → stops [0] → ≤1 stop → la paginación
    // NO se renderiza (RF-3). No es la rama vacía (0 testimonios, ya cubierta
    // por T2): la región y la card siguen ahí — la ausencia de bullets no
    // puede lograrse con un "no render" trivial.
    mockCarouselLayout([0], 600, 600);
    render(carousel({ testimonials: [TESTIMONIAL_A] }));

    expect(
      screen.queryAllByRole("button", { name: /Go to slide/ }),
    ).toHaveLength(0);
    expect(screen.getByRole("group", { name: "1 of 1" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Read full testimonial from Ada Lovelace",
      }),
    ).toBeInTheDocument();
  });

  it("renders no bullets for two testimonials displayed two per view", () => {
    // [0,300] con maxScroll 0 (600 − 600): ambos offsets recortan a 0 y
    // deduplican → 1 stop → sin bullets (spec → Comportamiento: "2 testimonios
    // con 2 por vista"). El carrusel se renderiza completo: 2 slides.
    mockCarouselLayout([0, 300], 600, 600);
    render(carousel({ testimonials: [TESTIMONIAL_A, TESTIMONIAL_B] }));

    expect(
      screen.queryAllByRole("button", { name: /Go to slide/ }),
    ).toHaveLength(0);
    expect(screen.getAllByRole("group")).toHaveLength(2);
  });
});

// ============================================================================
// T4 — RF-4 (spec → Tests esperados 8): click de bullet → `track.scrollTo` con
// el `left` del stop y `behavior` según `prefers-reduced-motion` LEIDO EN EL
// CLICK (decisión 21 / plan → Decisiones: sin estado vivo; el setup F1 fija
// `matches=false` → "auto"; el caso "smooth" stubea `matchMedia` local).
// Escenarios del "Hecho cuando" de T4:
//   1. layout [0,300,600]/max 300 (stops [0,300], T3) + mock de `scrollTo` en
//      la instancia del track → click bullet 2 → `scrollTo` con
//      { left: 300, behavior: "auto" }, UNA llamada (matchMedia default del
//      setup: matches=false).
//   2. `matchMedia` stubeado a { matches: true } → { left: 300,
//      behavior: "smooth" }.
//   3. // extra: click en el bullet ACTIVO (1, `aria-current="true"` al medir
//      con scrollLeft 0) → también UNA llamada, al propio stop
//      { left: 0, behavior: "auto" }. Motivo del extra: RF-4 dice "un bullet"
//      sin excepción para el activo (spec → RF-4/Comportamiento no fija guard:
//      ir al stop vigente es válido) y el "Hecho cuando" exige "un click, una
//      llamada"; el caso 8 de Tests esperados solo lista el bullet 2. No se
//      inventa ni guard en código ni aserción de cero llamadas: es la
//      aplicación literal de RF-4 sobre el bullet activo.
//
// Rojo on-arrival (decisión #101, declarado con la salida en el commit
// `test(TestimonialCarousel): T4`): los 3 casos fallan por la razón correcta —
// la implementación de T3 renderiza bullets SIN onClick (comentario del `.tsx`
// de T3: "el click con scrollTo/behavior es T4") — `scrollTo` recibe 0 llamadas:
// "expected \"scrollTo\" to be called 1 time, but got 0 times". No es rojo
// artificial: el hecho observable discriminado (el onClick conectado con el
// behavior correcto) es exactamente el alcance de T4.
//
// `scrollTo` se mockea POR INSTANCIA post-render (`Object.defineProperty` en
// el <ul> track, configurable: true): el handler lo lee VIVO del nodo vía
// trackRef (mismo criterio del `scrollLeft` en T3 — la instancia mockeada es la
// que el handler usa, no hace falta rerender). Alternativa descartada: espiar
// `Element.prototype.scrollTo` — funcionaría, pero observaría TODOS los
// elementos del archivo (dialog/cards incluidos) en vez del contrato "el track".
//
// matchMedia: el caso "auto" usa el mock del setup F1 sin tocarlo (Map nuevo
// por test, `matches=false`; el afterEach global lo descarta). El caso "smooth"
// usa `vi.stubGlobal("matchMedia", ...)` LOCAL (plan → Decisiones: "el caso
// smooth con stub local del test"), acotado al propio caso: el `afterEach` de
// este archivo ya llama `vi.unstubAllGlobals()` (desde T3), así que el stub no
// filtra a ningún otro test del archivo ni de la suite. Alternativa descartada:
// `simulateMediaChange` del setup (precedente ThemeProvider) — es legítimo,
// pero exige llamar `window.matchMedia` antes de simular (el Map es perezoso)
// y el componente solo lo llama en el click: el stub es el camino que el plan
// fijó textualmente.
//
// Justificación de queries (constitución T3): bullets por rol `button` +
// nombre accesible LITERAL ("Go to slide 1"/"Go to slide 2", criterio T3); el
// track por inspección DOM de la región (`region.querySelector("ul")`,
// criterio T3 scroll — sin clases de módulo hasta T5). Click con userEvent
// (real, y no invoca `scrollTo` por su cuenta: la única llamada sale del
// handler). `aria-current="true"` del bullet 1 se re-verifica en el caso 3 como
// precondition leída (escenario "bullet activo"), no como assert de T3. Sin
// `data-testid`.
// ============================================================================
describe("TestimonialCarousel bullet click scrolls the track to its stop with behavior read at click time (T4: RF-4, Tests 8)", () => {
  // Fixture compartido: layout medido con 2 stops ([0,300,600]/maxScroll 300,
  // el mismo de T3) + spy de `scrollTo` fijado en la INSTANCIA del track
  // post-render. Devuelve el spy (el <ul> se re-encuentra por DOM si hace
  // falta); el stub de matchMedia se aplica en el propio caso, no acá.
  const renderWithTrackScrollSpy = () => {
    mockCarouselLayout([0, 300, 600], 900, 600);
    render(carousel());

    const region = screen.getByRole("region", { name: LABELS.carousel });
    const track = region.querySelector("ul");
    if (track === null) {
      throw new Error("T4: la región del carrusel no contiene el <ul> track");
    }
    const scrollTo = vi.fn();
    Object.defineProperty(track, "scrollTo", {
      value: scrollTo,
      configurable: true,
    });
    return { scrollTo };
  };

  it("calls scrollTo once with the second stop left and behavior auto when matchMedia defaults to matches false", async () => {
    const user = userEvent.setup();
    const { scrollTo } = renderWithTrackScrollSpy();

    // "Hecho cuando" 1: click bullet 2 → stop 300 (segundo de [0,300]).
    // matchMedia = mock del setup (matches=false, no hay preferencia de
    // movimiento reducido) → behavior "auto" (RF-4).
    await user.click(screen.getByRole("button", { name: "Go to slide 2" }));

    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ left: 300, behavior: "auto" });
  });

  it("calls scrollTo with behavior smooth when matchMedia reports no-preference matching", async () => {
    // Stub LOCAL acotado a este caso: `prefers-reduced-motion: no-preference`
    // matchea → "smooth". Lo restaura el afterEach del archivo
    // (vi.unstubAllGlobals). Se stubea antes del click; como el componente lo
    // lee EN el click (sin estado vivo), el orden render/stub es irrelevante
    // por contrato, pero se fixa acá para que el stub cubra todo el caso.
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const user = userEvent.setup();
    const { scrollTo } = renderWithTrackScrollSpy();

    await user.click(screen.getByRole("button", { name: "Go to slide 2" }));

    // "Hecho cuando" 2: mismo stop, behavior "smooth"; sigue siendo UNA
    // llamada por click (un solo scrollTo con ternaria de behavior).
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ left: 300, behavior: "smooth" });
  });

  // extra: ver encabezado — RF-4 "un bullet" sin excepción para el activo;
  // el caso 8 de Tests esperados solo lista el bullet 2.
  it("calls scrollTo once to the current stop when clicking the already active bullet", async () => {
    const user = userEvent.setup();
    const { scrollTo } = renderWithTrackScrollSpy();

    // Precondition leída: con scrollLeft 0 medido al mount, el bullet 1 es el
    // activo (T3/decisión 21) — el escenario "click en el bullet activo".
    const bullet1 = screen.getByRole("button", { name: "Go to slide 1" });
    expect(bullet1).toHaveAttribute("aria-current", "true");

    await user.click(bullet1);

    // "Hecho cuando" "un click, una llamada" aplicado al bullet activo: sin
    // guard, scrollTo al propio stop 0 con behavior "auto" (matchMedia del
    // setup). Exactamente UNA llamada: ni cero (guard inventado) ni dos.
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ left: 0, behavior: "auto" });
  });
});
