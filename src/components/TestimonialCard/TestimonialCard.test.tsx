// Tests de T1, T2 y el cierre de T3 (specs/content/TestimonialCard/tasks.md) —
// T1: RF-4, RF-7
// (Tests esperados 1, 2 y 5 de la spec). T1: el <article> (`Box
// variant="inner" as="article"`) se nombra por su h3 vía
// `aria-labelledby="testimonial-${testimonial.id}-name"` (fórmula fija, RF-7),
// muestra el `role` y el extracto con `testimonial.text` (RF-4/RF-7) y la
// comilla `Icon name="quote" tone="gradient"` decorativa, sin nombre accesible
// (RF-4). T2: RF-1 (Tests esperados 3 y 4) — el botón estirado
// `<button type="button" aria-label={openLabel}>` como ÚNICO enfocable del
// article (assert: único button/tabulable del subtree) y su activación: click,
// Enter y Espacio invocan `onOpen(testimonial.id)` exactamente una vez (teclado
// NATIVO del <button>, sin handlers propios ni preventDefault: plan →
// Decisiones; criterio NavTabs T2 de no duplicar el guard).
//
// Diferidos declarados (tasks.md): T3 conecta las clases internas del módulo
// (`.header`/`.identity`/`.avatar`/`.excerpt`/`.quote`/`.stretched` y el
// `::after` que cubre la card) y AGREGA el cierre `expectNoA11yViolations` de
// Tests esperados 6 como último describe del archivo (constitución T4; patrón
// ServiceCard/HexAvatar: llega con la última tarea, no se adelanta).
// VERDE on-arrival #101 (declarado en el cierre abajo): el markup ya era
// accesible desde T1/T2 (article nombrada por `aria-labelledby` al h3, botón
// único nombrado por `aria-label`, avatar `alt=""` y comilla `aria-hidden`
// decorativas) y T3 agrega solo CSS que jsdom no computa (clamp, hover, anillo
// del `::after`, print): el cierre no discrimina el estado de la
// implementación; su valor es la regresión futura sobre la card completa y la
// verificación real de los estilos es inspección + QA F5 (#101). En T1
// el módulo nace solo con `.card` (unión del raíz, spec → API / G-B; la
// alternativa de postergar el módulo a T3 quedó descartada por el encargo: la
// unión se conecta y se testa en T1). Ninguna aserción de T1 fija la AUSENCIA
// de clases internas (T3 las agrega) ni el nº de hijos del article (T2 le suma
// el botón, último hijo según Anatomía).
//
// AJUSTE PRE-APROBADO POR EL USUARIO (registrado en tasks.md T1; mecánica
// idéntica al ajuste de Sidebar `4ff4424`): este commit `test(TestimonialCard):
// T2` retira ÚNICAMENTE las 3 aserciones negativas del describe T1 "no
// interactive controls yet (pre-T2)" — global `queryByRole("button")` null,
// article-level `within(article).queryByRole("button")` null y
// `article.querySelector("button, a, input")` null —, que T2 vuelve falsas por
// contrato (el botón EXISTE), y las reemplaza por los asserts nuevos de T2
// (botón existe, único enfocable). El describe se retitula a T2 por coherencia
// de alcance; la aserción sobreviviente de T1 (`<article>` sin `tabindex`) NO
// se toca: sigue siendo "Hecho cuando" de T2. Ningún otro assert de T1 se
// modifica en el archivo (constitución T2).
//
// Rojo on-arrival (decisión #101): T1 fue "Failed to resolve import" (la pieza
// no existía). T2 es rojo real y por la razón correcta: el botón nace con la
// implementación, así que los tres escenarios nuevos (botón único enfocable,
// click, Enter/Espacio) fallan porque HOY no existe ningún `button` en el
// subtree — `getByRole("button")` lanza. Los tests de T1 quedan intactos y se
// re-verden con el `feat` sin haber sido tocados.
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
// Queries de T2 (constitución T3): el botón por rol + nombre accesible
// `getByRole("button", { name: OPEN_LABEL })` (spec → Tests esperados 3; el
// nombre lo expone el `aria-label={openLabel}`, string ficticia de este
// fixture, no derivada de `t.*`: la card recibe `openLabel` ya interpolado por
// prop, spec → API) y unicidad de enfocable con `getAllByRole("button")` = 1 +
// `queryAllByRole` de los demás roles interactivos + inspección estructural del
// subtree (`querySelectorAll` de tabulables nativos). Activación con
// `userEvent`: `user.click` y `user.tab()` + `user.keyboard("{Enter}")` /
// `user.keyboard(" ")` (carácter literal; ver bloque "ERROR DE AUTORÍA" del
// describe de activación: `{Space}` no existe en el keyboardMap de user-event
// v14 y no genera el evento del navegador) sobre el botón enfocado (teclado
// real, no `focus()` +
// `click()` programáticos; precedente NavTabs T3 / LanguageSwitcher T2), spy
// `vi.fn()` inyectado por `overrides` del helper con RENDER NUEVO por caso (sin
// acumular llamadas entre teclas) y call-count exacto 1 (precedente NavTabs
// T2). El "se muestra siempre" (RF-1) en jsdom solo admite la ausencia de
// ocultamiento declarativo (`toBeVisible` + sin `hidden`); la visibilidad real
// por CSS —y su ocultamiento en print, RF-2— es inspección + QA F5 (#101).
//
// Datos ficticios (constitución D4): fixture espejo de
// src/content/cv.en.json —testimonio "t-maria", "María González", autoría y
// textos de ejemplo del propio spec → Anatomía—, sin datos reales.

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Testimonial } from "@data/cv.types.generated";

import { expectNoA11yViolations } from "../../test/a11y";

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
// el botón de T2). Ficticio (D4): string propio de este fixture, NO una cita
// del i18n de la app (`t.testimonials.readMore` es responsabilidad del
// consumidor/carrusel, C2/C3: la card solo recibe la prop ya interpolada).
const OPEN_LABEL = "Read full testimonial from María González";

// Helper: armazones `HexAvatarDefs` (recorte del hexágono) +
// `AccentGradientDefs` (gradiente de la comilla; en la app los monta AppLayout
// una sola vez) + la card con la API COMPLETA por props (C2: sin providers).
// `overrides` es `Partial<TestimonialCardProps>`: T1 varía `className` y T2
// inyecta su `onOpen` espíado sin tocar estas líneas (el commit test(T2) es
// aditivo salvo el ajuste pre-aprobado del describe pre-T2, declarado arriba).
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

// --- T2 · RF-1: el botón estirado es el único enfocable (Tests 3, parte) --------
// Ver el bloque "AJUSTE PRE-APROBADO POR EL USUARIO" del encabezado: las 3
// aserciones negativas de T1 (botón global null, botón en el article null,
// `querySelector("button, a, input")` null) se RETIRAN acá —T2 las vuelve
// falsas por contrato— y se reemplazan por los asserts de T2; la aserción
// sobreviviente de T1 (`<article>` sin `tabindex`) queda intacta abajo.
describe("TestimonialCard stretched button is the only focusable (T2: RF-1)", () => {
  it("renders the named button as the only focusable control and keeps the article non-clickable", () => {
    render(testimonialCard());

    const article = screen.getByRole("article", { name: TESTIMONIAL.author });

    // RF-1 / Tests esperados 3: `getByRole("button", { name: openLabel })` —
    // el nombre accesible lo expone el `aria-label` (prop ya interpolada).
    const button = within(article).getByRole("button", { name: OPEN_LABEL });
    expect(button).toHaveAttribute("aria-label", OPEN_LABEL);

    // Anatomía: `<button type="button">` sin hijos textuales (el `::after` que
    // cubre la card es CSS, T3; el nombre sale solo del `aria-label`) y ÚLTIMO
    // hijo del article (orden del contrato).
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
    expect(button.childNodes).toHaveLength(0);
    expect(article.lastElementChild).toBe(button);

    // RF-1: único elemento enfocable. Unicidad por rol (documento y subtree) +
    // ningún otro rol interactivo + ningún otro nodo tabulable nativo en el
    // subtree (button/a/input/select/textarea/[tabindex]) — el assert "único
    // tabIndex >= 0 / único button del subtree" del "Hecho cuando" de T2.
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(screen.queryAllByRole("tab")).toHaveLength(0);
    expect(
      Array.from(
        article.querySelectorAll("button, a, input, select, textarea, [tabindex]"),
      ),
    ).toEqual([button]);

    // "Se muestra siempre" (RF-1, aunque el texto entre completo): en jsdom es
    // comprobable solo la ausencia de ocultamiento declarativo; el `display`
    // real (y su ocultamiento en print, RF-2) es inspección + QA F5 (#101).
    expect(button).toBeVisible();
    expect(button).not.toHaveAttribute("hidden");
    expect(button).not.toHaveAttribute("disabled");

    // El <article> no es clickeable (RF-1 / No hacer). T1 sobrevivente: sin
    // `tabIndex` propio (intacta). Los handlers de React no son inspeccionables
    // desde el DOM (nota T1), así que la comprobación observable es que el
    // article no declara `tabindex` ni `onclick` y que el único interactivo del
    // subtree es el botón de arriba.
    expect(article).not.toHaveAttribute("tabindex");
    expect(article).not.toHaveAttribute("onclick");
  });
});

// --- T2 · RF-1: activación — click, Enter y Espacio (Tests 3 y 4) ----------------
// Enter/Espacio: activación NATIVA del <button> (plan → Decisiones "Enter/
// Espacio nativos"; sin handlers de teclado propios ni preventDefault: T2 no
// lo exige y NavTabs T2 fija el criterio de no duplicar el guard). user-event
// v14 despacha el click nativo también por teclado (Enter en keydown, Espacio
// en keyup sin defaultPrevented), así que el call-count EXACTO 1 descarta
// doble emisión (manual + nativa).
// ERROR DE AUTORÍA corregido en un commit `test` separado (previo al `feat`;
// ningún assert cambia, ningún test de T1 se toca): el token `{Space}` NO es
// válido en el keyboardMap de user-event v14 —parseKeyDef lo resuelve por
// `def.key === descriptor` y la entrada es `{key: " ", code: "Space"}`—, así
// que generaba `key="Space"`/`code="Unknown"` (eventos que ningún navegador
// emite) y `keyupBehavior[" "]` nunca disparaba el click: 0 llamadas a `onOpen`
// con una implementación FIEL a la spec (addicionales verificados con probes
// de node sobre el propio user-event instalado). El carácter literal `" "` sí
// produce el keystroke real `key=" "`, `code="Space"` → click exactamente 1 —
// precedente NavTabs T3 (líneas 387/416: `user.keyboard(" ")`).
// Foco colocado con `user.tab()` (el botón es el único tabulable del
// documento, aserción de arriba; anclaje `toHaveFocus` para que el caso no sea
// vacío, precedente NavTabs T3). Spy + render NUEVO por caso: sin acumulación
// de llamadas entre teclas.
describe("TestimonialCard button activation (T2: RF-1)", () => {
  it("calls onOpen once with the testimonial id when the button is clicked", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(testimonialCard({ onOpen }));

    await user.click(screen.getByRole("button", { name: OPEN_LABEL }));

    // Tests esperados 3 / "Hecho cuando" de T2: click → onOpen("t-maria")
    // exactamente una vez (id literal: no tautológico sobre `testimonial.id`).
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith("t-maria");
  });

  it("calls onOpen once with the testimonial id when Enter activates the focused button", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(testimonialCard({ onOpen }));

    await user.tab();
    expect(screen.getByRole("button", { name: OPEN_LABEL })).toHaveFocus();

    await user.keyboard("{Enter}");

    // Tests esperados 4: Enter → onOpen una vez (ruta nativa del <button>).
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith("t-maria");
  });

  it("calls onOpen once with the testimonial id when Space activates the focused button", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(testimonialCard({ onOpen }));

    await user.tab();
    expect(screen.getByRole("button", { name: OPEN_LABEL })).toHaveFocus();

    // Carácter literal " ": key=" ", code="Space" (el keystroke real del
    // navegador; ver bloque ERROR DE AUTORÍA del describe — `{Space}` no existe
    // en el keyboardMap de user-event v14).
    await user.keyboard(" ");

    // Tests esperados 4: Espacio → onOpen una vez (click nativo en keyup; sin
    // handler propio que duplique la emisión).
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith("t-maria");
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

// ============================================================================
// CIERRE de accesibilidad (T3; constitución T4, Tests esperados 6; la última
// entrada del archivo; "Hecho cuando" de T3: "el archivo termina con
// expectNoA11yViolations").
//
// VERDE on-arrival #101 (declarado en el encabezado del archivo): el markup ya
// era accesible desde T1/T2 — article nombrada por `aria-labelledby` al h3
// (RF-7), botón único enfocado y nombrado por `aria-label` (RF-1), avatar con
// `alt=""` y comilla `aria-hidden` decorativas (RF-4) — y T3 conecta SOLO
// clases de un módulo CSS que jsdom no computa (clamp, hover, anillo del
// `::after`, print: inspección + QA F5). El cierre no puede discriminar el
// estado de la implementación de T3 (nada discriminate-testable acá; criterio
// Box T4/#101): su valor es la REGRESIÓN futura sobre la card completa.
//
// Fixture: la card default (`testimonialCard()`: armazones `HexAvatarDefs` +
// `AccentGradientDefs` — contrato de las primitivas para el recorte del
// hexágono y el gradiente de la comilla—, render sin overrides).
// ============================================================================
describe("TestimonialCard accessibility audit (T3: cierre, spec → Tests esperados 6)", () => {
  it("has no accessibility violations with the full card", async () => {
    const { container } = render(testimonialCard());

    // Fija lo auditado (criterio ServiceCard/SkillList/ControlsBar: sin assert
    // de anclaje el cierre no distingue qué rama recorre): la card completa —
    // article nombrada por su h3 (RF-7), botón estirado nombrado (RF-1),
    // extracto presente (RF-4) y las defs de los armazones montadas.
    const article = screen.getByRole("article", { name: TESTIMONIAL.author });
    expect(
      within(article).getByRole("heading", {
        level: 3,
        name: TESTIMONIAL.author,
      }),
    ).toBeInTheDocument();
    expect(
      within(article).getByRole("button", { name: OPEN_LABEL }),
    ).toBeInTheDocument();
    expect(within(article).getByText(TESTIMONIAL.text)).toBeInTheDocument();
    expect(container.querySelector("clipPath#hex-avatar-outer")).not.toBeNull();
    expect(container.querySelector("linearGradient")).toHaveAttribute(
      "id",
      "accent-gradient",
    );

    await expectNoA11yViolations(container);
  });
});
