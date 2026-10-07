// Tests de T1 (specs/content/TestimonialCard/tasks.md) — RF-4, RF-7 (Tests
// esperados 1, 2 y 5 de la spec → Tests.expected). T1: el <article> (`Box
// variant="inner" as="article"`) se nombra por su h3 vía
// `aria-labelledby="testimonial-${testimonial.id}-name"` (fórmula fija, RF-7),
// muestra el `role` y el extracto con `testimonial.text` (RF-4/RF-7) y la
// comilla `Icon name="quote" tone="gradient"` decorativa, sin nombre accesible
// (RF-4). Todavía SIN el botón estirado (T2) y sin `onClick` en ningún nodo: se
// aserta la ausencia de controles interactivos ("Hecho cuando" de T1).
//
// Diferidos declarados (tasks.md): T2 agrega el botón estirado y `onOpen`; T3
// conecta las clases internas del módulo (`.header`/`.identity`/`.avatar`/
// `.excerpt`/`.quote`) y el cierre `expectNoA11yViolations` — el cierre NO se
// adelanta acá (patrón ServiceCard/HexAvatar: llega con su tarea). En T1 el
// módulo nace solo con `.card` (unión del raíz, spec → API / G-B; la alternativa
// de postergar el módulo a T3 quedó descartada por el encargo: la unión se
// conecta y se testa en T1). Ninguna aserción de T1 fija la AUSENCIA de clases
// internas (T3 las agrega) ni el nº de hijos del article (T2 le suma el botón).
//
// Rojo on-arrival (decisión #101): la pieza no existe; el rojo llega por
// "Failed to resolve import" de `./TestimonialCard` y
// `./TestimonialCard.module.css` (patrón HexAvatar T1 / ServiceCard T2).
//
// Justificación de queries (constitución T3): article nombrado por
// `getByRole("article", { name })` y heading por rol+nivel+nombre (Tests 1);
// los <p> de rol y extracto por texto (un <p> no tiene rol propio; Test 2). El
// avatar con `alt=""` y la comilla con `aria-hidden` son decorativos (sin rol
// ni nombre accesible posible) y la API de la spec no define `data-testid`:
// selección estructural sobre el article —precedente exacto ServiceCard.test
// T1 (glyph por `svg[stroke="url(#accent-gradient)"]`) y HexAvatar.test (nodos
// SVG/wrap). Las defs montadas se anclan por id (`clipPath#hex-avatar-outer`,
// `linearGradient#accent-gradient`). Las clases de módulos ajenos y propios se
// fijan por #99 (import del módulo, `styles.name ?? "name"`; prohibidos `!` y
// `as`), precedente SkillList.test / ServiceCard.test.
//
// Datos ficticios (constitución D4): fixture espejo de
// src/content/cv.en.json —testimonio "t-maria", "María González", autoría y
// textos de ejemplo del propio spec → Anatomía—, sin datos reales.

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Testimonial } from "@data/cv.types.generated";

import { HexAvatarDefs } from "../HexAvatar";
import { AccentGradientDefs } from "../Icon";

import { TestimonialCard } from "./TestimonialCard";
import type { TestimonialCardProps } from "./TestimonialCard";

// Clase de variante del Box raíz: la unión la aplica Box (spec → API, G-B); el
// nombre real resuelto (`inner`) se fija importando el módulo ajeno (#99;
// precedente ServiceCard.test).
import boxStyles from "../Box/Box.module.css";

// Clase propia del raíz (unión T1; el módulo nace en el `feat(TestimonialCard):
// T1` con `.card` — motivo del rojo on-arrival de todo el archivo, #101).
import styles from "./TestimonialCard.module.css";

// --- Fixture ------------------------------------------------------------------
// `Testimonial` del esquema, espejo de src/content/cv.en.json (id "t-maria";
// avatar.src PublicPath). Texto largo ficticio: la card lo muestra recortado a
// 4 líneas por CSS (RF-2, T3 — jsdom no computa el clamp).
const TESTIMONIAL: Testimonial = {
  id: "t-maria",
  author: "María González",
  role: "Product Manager, Acme Corp",
  avatar: { src: "/images/testimonials/maria.svg" },
  text: "Alex consistently delivered high-quality work and made complex features feel simple for our users.",
};

// Fórmula fija RF-7 sobre TESTIMONIAL.id, asertada como LITERAL (el test no la
// recalcula con un template sobre `testimonial.id`: no ser tautológico).
const NAME_ID = "testimonial-t-maria-name";

// "Read full testimonial from {author}" ya interpolado (spec → API; lo consume
// el botón de T2).
const OPEN_LABEL = "Read full testimonial from María González";

// Helper: armazones `HexAvatarDefs` (recorte del hexágono) +
// `AccentGradientDefs` (gradiente de la comilla; en la app los monta AppLayout
// una sola vez) + la card con la API COMPLETA por props (C2: sin providers).
// `overrides` es `Partial<TestimonialCardProps>`: T1 solo varía `className` y
// T2 podrá inyectar su `onOpen` espíado sin tocar estas líneas (test(T2) es
// puramente aditivo).
const testimonialCard = (overrides: Partial<TestimonialCardProps> = {}) => (
  <>
    <HexAvatarDefs />
    <AccentGradientDefs />
    <TestimonialCard
      testimonial={TESTIMONIAL}
      openLabel={OPEN_LABEL}
      onOpen={() => undefined}
      {...overrides}
    />
  </>
);

// --- T1 · RF-7: article nombrada por su h3 con el id de la fórmula (Test 1) ---
describe("TestimonialCard named article (T1: RF-7)", () => {
  it("renders an article named by its h3 through the fixed name id", () => {
    render(testimonialCard());

    // "Hecho cuando" de T1 / Tests esperados 1: getByRole("article", { name:
    // author }); el nombre sale del `aria-labelledby` hacia el id de la fórmula
    // y el elemento es <article> (Anatomía: Box `as="article"`).
    const article = screen.getByRole("article", { name: TESTIMONIAL.author });
    expect(article.tagName).toBe("ARTICLE");
    expect(article).toHaveAttribute("aria-labelledby", NAME_ID);

    // RF-7: el author vive en un <h3> con el id literal de la fórmula y el
    // `aria-labelledby` del article apunta exactamente a él (nivel h3 fijo, sin
    // prop; un único heading en la pieza).
    const heading = within(article).getByRole("heading", {
      level: 3,
      name: TESTIMONIAL.author,
    });
    expect(heading.getAttribute("id")).toBe(NAME_ID);
    expect(heading.getAttribute("id")).toBe(
      article.getAttribute("aria-labelledby"),
    );
    expect(heading.tagName).toBe("H3");
    expect(heading.textContent).toBe(TESTIMONIAL.author);
    expect(within(article).getAllByRole("heading")).toHaveLength(1);
  });
});

// --- T1 · RF-4/RF-7: rol y extracto (testimonial.text) (Test 2) ----------------
describe("TestimonialCard role and excerpt (T1: RF-4, RF-7)", () => {
  it("shows the role beside the name and the testimonial text as the excerpt", () => {
    render(testimonialCard());

    const article = screen.getByRole("article", { name: TESTIMONIAL.author });

    // Tests esperados 2: <p> con el role y <p> con el texto completo
    // (getByText devuelve el elemento más interno que contiene el texto: el
    // propio <p>; el recorte a 4 líneas es CSS, RF-2/T3).
    const roleParagraph = within(article).getByText(TESTIMONIAL.role);
    expect(roleParagraph.tagName).toBe("P");

    const excerpt = within(article).getByText(TESTIMONIAL.text);
    expect(excerpt.tagName).toBe("P");

    // Anatomía (spec → Anatomía): identity = <div> con <h3> + <p> de rol, en
    // la columna 2 del header; el extracto es hijo directo del article (no
    // vive dentro del header). Sin aserción de clases: las internas conectan
    // en T3.
    const heading = within(article).getByRole("heading", { level: 3 });
    expect(heading.parentElement).toBe(roleParagraph.parentElement);
    expect(heading.parentElement?.tagName).toBe("DIV");
    expect(excerpt.parentElement).toBe(article);
  });
});

// --- T1 · RF-4: HexAvatar decorativo en el header (Test 5) ----------------------
describe("TestimonialCard decorative avatar (T1: RF-4)", () => {
  it("renders the HexAvatar image with an empty alt as the first column of the header", () => {
    const { container } = render(testimonialCard());

    // Armazones (contrato de la primitiva; criterio HexAvatar → Forma): las
    // defs que resuelven las url() del clipPath del hexágono y del gradiente.
    expect(container.querySelector("clipPath#hex-avatar-outer")).not.toBeNull();
    expect(container.querySelector("linearGradient")).toHaveAttribute(
      "id",
      "accent-gradient",
    );

    const article = screen.getByRole("article", { name: TESTIMONIAL.author });

    // Anatomía: header = <div> (grilla auto | 1fr, estilos en T3) con el
    // HexAvatar como PRIMER hijo (columna 1) y el div identity en la 2. El
    // wrap del HexAvatar es un <span> (Anatomía de HexAvatar); la primitiva
    // no se reimplementa acá (RF-4 / No hacer).
    const header = article.firstElementChild;
    expect(header?.tagName).toBe("DIV");
    const avatarWrap = header?.firstElementChild;
    expect(avatarWrap?.tagName).toBe("SPAN");

    // RF-4 / Tests esperados 5: la imagen del avatar tiene `alt=""`
    // (decorativa: el nombre está al lado) y recibe el `src` del testimonio.
    const img = avatarWrap?.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute("src", TESTIMONIAL.avatar.src);

    // Decorativa de verdad: `alt=""` la saca del árbol accesible (ningún
    // `role="img"` en el documento con los armazones montados).
    expect(screen.queryByRole("img")).toBeNull();

    // identity (columna 2): contenedor del heading, segundo hijo del header.
    const heading = within(article).getByRole("heading", { level: 3 });
    expect(header?.lastElementChild).toBe(heading.parentElement);
    expect(heading.parentElement?.parentElement).toBe(header);
  });
});

// --- T1 · RF-4: comilla decorativa sin nombre accesible -------------------------
describe("TestimonialCard decorative quote glyph (T1: RF-4)", () => {
  it("renders the quote icon as a decorative gradient svg with no accessible name", () => {
    render(testimonialCard());

    const article = screen.getByRole("article", { name: TESTIMONIAL.author });

    // RF-4 ("Hecho cuando"): `Icon name="quote" tone="gradient"` decorativo.
    // Query estructural justificada (encabezado): svg aria-hidden, sin nombre
    // accesible posible; `lucide-quote` fija el glyph correcto (clase estable
    // de lucide propagada por Icon, no clase de módulo).
    const glyph = article.querySelector('svg[stroke="url(#accent-gradient)"]');
    expect(glyph).not.toBeNull();
    expect(glyph).toHaveClass("lucide-quote");
    expect(glyph).toHaveAttribute("aria-hidden", "true");

    // Sin nombre accesible: el nombre del article sigue siendo solo el author
    // (getByRole con name ya asertado) y ningún role="img" aparece.
    expect(within(article).queryByRole("img")).toBeNull();

    // Anatomía: el Icon es hijo directo del article (después del extracto);
    // la clase `.quote` (tamaño/posición) conecta en T3 — T1 solo presencia
    // decorativa.
    expect(glyph?.parentElement).toBe(article);
  });
});

// --- T1 · "Hecho cuando": todavía sin botón ni onClick en ningún nodo ------------
describe("TestimonialCard no interactive controls yet (T1: pre-T2)", () => {
  it("renders no button and no focusable control inside the card", () => {
    render(testimonialCard());

    const article = screen.getByRole("article", { name: TESTIMONIAL.author });

    // El botón estirado es T2: no existe ni dentro ni fuera de la card.
    expect(screen.queryByRole("button")).toBeNull();
    expect(within(article).queryByRole("button")).toBeNull();

    // El <article> no es clickeable (spec → No hacer / RF-1): sin `tabIndex`
    // propio y sin ningún nodo interactivo renderizado (button/a/input); los
    // handlers de React no son inspeccionables desde el DOM, así que la
    // ausencia de nodos interactivos es la comprobación observable (el foco y
    // `onOpen` los fija T2).
    expect(article).not.toHaveAttribute("tabindex");
    expect(article.querySelector("button, a, input")).toBeNull();
  });
});

// extra: unión de `className` al raíz — contrato de spec → API (G-B) y "Hecho
// cuando" de T1 ("unión igual ServiceCard"); sin contrapartida en "Tests
// esperados" de la spec (criterio exacto ServiceCard.test, describe extra T1).
// La unión la APLICA EL BOX raíz (la pieza une `.card` + externa antes de
// pasársela al Box): se comprueba la coexistencia de las tres clases en el único
// <article>.
describe("TestimonialCard className forwarding (T1: spec → API, G-B)", () => {
  it("joins an external className on the root article alongside .card and the Box inner class", () => {
    const consumerClass = "testimonial-carousel-item";
    const innerClass = boxStyles.inner ?? "inner";
    const cardClass = styles.card ?? "card";

    render(testimonialCard({ className: consumerClass }));

    const article = screen.getByRole("article", { name: TESTIMONIAL.author });
    expect(article).toHaveClass(innerClass);
    expect(article).toHaveClass(cardClass);
    expect(article).toHaveClass(consumerClass);
  });
});
