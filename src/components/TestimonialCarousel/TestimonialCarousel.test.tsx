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
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

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
