// Tests de T1 y T2 (specs/content/ServiceCard/tasks.md) — T1: RF-1, RF-2,
// RF-3 (Tests esperados 1-4 de la spec); T2: escenario DOM de `.glyph`
// (RF-2, conexión de la clase) y cierre a11y (Tests esperados 5). T1: el
// <article> se nombra por su h3 vía
// `aria-labelledby="service-${service.id}-title"` (fórmula fija, RF-3); el
// título es un `heading` nivel 3 (SectionTitle real, sin wrapper) y la
// descripción un <p>; el ícono es el glyph de `service.icon` con
// `stroke="url(#accent-gradient)"` (armazón `AccentGradientDefs`) e hijo
// DIRECTO del article (RF-2, decisión 16: sin <span> wrapper — inspección DOM).
//
// Diferidos a T2 según tasks.md → gestionados por este commit
// `test(ServiceCard): T2`: se AGREGA la aserción DOM de la clase `.glyph` en
// el svg (coexistiendo con la base `.icon` de Icon y la clase `lucide-*`; el
// scenario fija la CONEXIÓN de la clase, no el valor CSS de `--icon-size`,
// que queda por inspección del módulo). Siguen por INSPECCIÓN (jsdom no
// computa, plan → Estrategia de tests): la base columna centrada y el único
// `@media (min-width: 580px)` fila (RF-4/RF-5), el valor de `.glyph` (RF-2),
// cero pseudo-estados (RF-6) y cero `@media print`. El cierre
// `expectNoA11yViolations` (Tests esperados 5) se AGREGA acá como último
// describe del archivo; `ServiceCard.module.css` e `index.ts` llegan en el
// `feat(ServiceCard): T2`.
//
// Reparto T1/T2 del ícono (elección declarada): en T1 el `Icon` se renderiza
// SIN `className={styles.glyph}` —el módulo nace en T2, que declara `.glyph`, y
// ningún "Hecho cuando" de T1 reclama tamaño—, así que NINGÚN test de T1
// asierte la clase `.glyph` ni el tamaño del ícono: el glyph se identifica por
// la clase `lucide-code` que propaga Icon. El `<div>` de título+descripción se
// asierta como estructura (spec → Anatomía) pero sin clase propia: la Anatomía
// no le asigna ninguna y T2 tampoco la nombra.
//
// Justificación de queries (constitución T3): article nombrado por
// `getByRole("article", { name })` y heading por rol+nivel+nombre (Tests 1-2);
// la descripción por texto (`getByText`: un <p> no tiene rol propio). El glyph
// es decorativo (`aria-hidden`: sin rol ni nombre accesible) y la API no define
// `data-testid`: se consulta estructuralmente con `querySelector` sobre el
// article —precedente exacto ResumeSection.test T1 (IconBox decorativo) e
// Icon.test (mismo selector de stroke)—. `lucide-code` es una clase estable de
// lucide (verificada ya en ThemeToggle.test), no una clase de módulo: no aplica
// el patrón #99 ahí; la clase de módulo ajena (`inner` de Box) sí se lee con
// #99 (`styles.name ?? "name"` + `toHaveClass`; prohibidos `!` y `as`),
// precedente SkillList.test importando `Badge.module.css`.
//
// Rojo on-arrival (P4; mixto declarado, criterio #101): el scenario `.glyph`
// de T2 pone rojo porque `./ServiceCard.module.css` (nace en el `feat` de T2)
// todavía no resuelve y el `Icon` aún no recibe la clase —el fallo es por
// falta de implementación de T2, no del test (el rojo alcanza a TODO el
// archivo por el import del módulo inexistente; los tests de T1 se re-verden
// con el feat sin haber sido tocados). El cierre `expectNoA11yViolations` es
// VERDE on-arrival (#101 declarado): el markup ya era accesible desde T1 y T2
// no toca la estructura; su valor es la regresión futura (p. ej. perder el
// `aria-labelledby` o volver decorativo un glyph con nombre lo capturaría
// axe).
//
// Datos ficticios (constitución D4): fixture de servicio inventada, textos de
// ejemplo del propio spec (Anatomía), sin datos reales.

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Service } from "@data/cv.types.generated";

import { expectNoA11yViolations } from "../../test/a11y";

import { AccentGradientDefs } from "../Icon";

import { ServiceCard } from "./ServiceCard";
import type { ServiceCardProps } from "./ServiceCard";

// Clase de variante del Box raíz: la unión de `className` la aplica Box
// (spec → API), y el test importa el módulo de Box para fijar el nombre real
// resuelto (`inner`) y asierte la coexistencia con la clase del consumidor.
import boxStyles from "../Box/Box.module.css";

// Clases de módulo para el scenario `.glyph` de T2 (patrón #99: el nombre real
// resuelto se fija importando los módulos, con fallback solo de tipos; el
// propio nace en el `feat(ServiceCard): T2` — motivo del rojo, encabezado):
// `styles.glyph` es la clase que ServiceCard pasa al Icon; `iconStyles.icon`
// es la base de Icon que debe COEXISTIR con ella (Icon RF-6/T5).
import iconStyles from "../Icon/Icon.module.css";
import styles from "./ServiceCard.module.css";

// --- Fixture ------------------------------------------------------------------
// `Service` del esquema: id "web-apps", icon "code" (ServiceIcon válido; plan →
// Estrategia de tests).
const SERVICE: Service = {
  id: "web-apps",
  title: "Web Applications",
  description: "Single-page apps with a focus on performance.",
  icon: "code",
};

// Fórmula fija RF-3 sobre SERVICE.id, asertada como LITERAL (el test no la
// recalcula con un template sobre `service.id`: no ser tautológico).
const TITLE_ID = "service-web-apps-title";

// Helper: armazón `AccentGradientDefs` (contrato de Icon con `tone="gradient"`;
// en la app lo monta AppLayout una sola vez) + la card con `service` completo
// por props (C2: sin providers). `overrides` solo varía `className` (unión).
const serviceCard = (
  overrides: Partial<Pick<ServiceCardProps, "className">> = {},
) => (
  <>
    <AccentGradientDefs />
    <ServiceCard service={SERVICE} {...overrides} />
  </>
);

// --- T1 · RF-1 + RF-3: article nombrada por su h3 (Tests esperados 1 y 4) -----
describe("ServiceCard named article (T1: RF-1, RF-3)", () => {
  it("renders an article named by its h3 through the derived title id", () => {
    render(serviceCard());

    // Tests esperados 1 ("Hecho cuando"): getByRole("article", { name:
    // service.title }); el nombre sale del `aria-labelledby` hacia el id
    // derivado y el elemento es <article> (Anatomía: Box `as="article"`).
    const article = screen.getByRole("article", { name: SERVICE.title });
    expect(article.tagName).toBe("ARTICLE");
    expect(article).toHaveAttribute("aria-labelledby", TITLE_ID);

    // Tests esperados 4 (RF-3): el id del título es la fórmula fija y el
    // `aria-labelledby` del article apunta exactamente a él.
    const heading = within(article).getByRole("heading", {
      level: 3,
      name: SERVICE.title,
    });
    expect(heading.getAttribute("id")).toBe(TITLE_ID);
    expect(heading.getAttribute("id")).toBe(
      article.getAttribute("aria-labelledby"),
    );
    // RF-1: nivel fijo 3 (SectionTitle `as="h3"`); el nombre accesible del
    // heading es solo el título (decisión 16: el ícono NO vive en el heading).
    expect(heading.textContent).toBe(SERVICE.title);
  });
});

// --- T1 · RF-1: título h3 + descripción <p> en el bloque de texto ---------------
describe("ServiceCard content (T1: RF-1)", () => {
  it("renders the description in a paragraph sharing the text div with the heading", () => {
    render(serviceCard());

    const article = screen.getByRole("article", { name: SERVICE.title });

    // Tests esperados 2: <p> con la descripción exacta (getByText devuelve el
    // elemento más interno que contiene el texto: el propio <p>).
    const paragraph = within(article).getByText(SERVICE.description);
    expect(paragraph.tagName).toBe("P");

    // Anatomía (spec → Anatomía): <article> = <Icon/> + <div>{<h3/> + <p/>}.
    // Título y descripción comparten el <div>; el glyph queda afuera.
    const heading = within(article).getByRole("heading", { level: 3 });
    expect(heading.parentElement).toBe(paragraph.parentElement);
    expect(heading.parentElement?.tagName).toBe("DIV");

    // El article tiene exactamente DOS hijos: el svg del ícono y el div de
    // texto (sin nodos extra); y un único heading (Tests 2).
    expect(article.children).toHaveLength(2);
    expect(article.lastElementChild).toBe(heading.parentElement);
    expect(within(article).getAllByRole("heading")).toHaveLength(1);
  });
});

// --- T1 · RF-2: glyph de gradiente decorativo, hijo directo (Tests esperados 3) --
describe("ServiceCard gradient glyph (T1: RF-2)", () => {
  it("renders the service icon as a decorative gradient svg, direct child of the article", () => {
    const { container } = render(serviceCard());

    // Armazón: las defs que resuelve la url (contrato de Icon; precedente
    // Icon.test T4).
    expect(container.querySelector("linearGradient")).toHaveAttribute(
      "id",
      "accent-gradient",
    );

    const article = screen.getByRole("article", { name: SERVICE.title });

    // Tests esperados 3: svg con `stroke="url(#accent-gradient)"` cuyo glyph
    // corresponde a `service.icon` (clase `lucide-*` propagada por Icon).
    // Query estructural justificada (encabezado: svg aria-hidden, sin nombre).
    const glyph = article.querySelector('svg[stroke="url(#accent-gradient)"]');
    expect(glyph).not.toBeNull();
    expect(glyph).toHaveClass("lucide-code");
    // Decorativo (RF-2): sin `label` → `aria-hidden`; no altera el nombre de la
    // card (ya asertado por getByRole con name = título en T1, describe 1).
    expect(glyph).toHaveAttribute("aria-hidden", "true");

    // "Hecho cuando" de T1 / decisión 16 (RF-2): SIN wrapper `.icon` —el Icon
    // es HIJO DIRECTO del article y no existe ningún <span> intermediario.
    expect(article.firstElementChild).toBe(glyph);
    expect(glyph?.parentElement).toBe(article);
    expect(article.querySelector("span")).toBeNull();
  });
});

// extra: unión de `className` al raíz — contrato de spec → API (G-B) sin
// contrapartida en "Tests esperados"; el "Hecho cuando" de T2 no la reclama
// (declara el módulo, el cierre a11y e `index.ts`), así que se conecta y se
// testa en T1 (criterio ResumeSection/Timeline/NavTabs/ControlsBar/ThemeToggle
// T1). La unión la APLICA EL BOX raíz (spec → API: "se transmite al Box
// `as="article"`"): se comprueba que la clase del consumidor COEXISTE con la
// variante `inner` de Box en el único <article> (patrón Box.test T3; el nombre
// real de la clase se fija importando el módulo ajeno, #99 —precedente
// SkillList.test con `Badge.module.css`).
describe("ServiceCard className forwarding (T1: spec → API, G-B)", () => {
  it("joins an external className on the root article alongside the Box inner class", () => {
    const consumerClass = "about-grid-item";
    const innerClass = boxStyles.inner ?? "inner";

    render(serviceCard({ className: consumerClass }));

    const article = screen.getByRole("article", { name: SERVICE.title });
    expect(article).toHaveClass(innerClass);
    expect(article).toHaveClass(consumerClass);
  });
});

// --- T2 · RF-2: la clase `.glyph` conectada al svg (decisión 16) ----------------
// Escenario de T2: fija en el DOM la CONEXIÓN de la clase de módulo `.glyph`
// sobre el propio <svg> (la Anatomía la pasa directo al Icon, sin wrapper),
// coexistiendo con la base `.icon` de Icon (unión base-first del propio Icon,
// RF-6/T5) y la clase `lucide-*` de T1. NO aserta el VALOR CSS de
// `--icon-size` (jsdom no computa: la fila Ícono de la tabla se verifica por
// inspección del módulo; spec RF-4/plan → Estrategia de tests).
describe("ServiceCard glyph size class (T2: RF-2, conexión DOM de .glyph)", () => {
  it("applies the module glyph class on the svg alongside Icon's base icon class", () => {
    // #99: nombres reales resueltos leyendo los módulos (fallback solo de
    // tipos; prohibidos `!` y `as`).
    const glyphClass = styles.glyph ?? "glyph";
    const iconBaseClass = iconStyles.icon ?? "icon";

    render(serviceCard());

    const article = screen.getByRole("article", { name: SERVICE.title });
    const glyph = article.querySelector('svg[stroke="url(#accent-gradient)"]');
    expect(glyph).not.toBeNull();

    // `.glyph` va en el glifo mismo (RF-2: "la variable no se hereda, se fija
    // en la clase del propio ícono"; spec → No hacer: no en un contenedor).
    expect(glyph).toHaveClass(glyphClass);
    // Coexistencia con la base de Icon y la clase de lucide: la unión del
    // Icon no la reemplaza (Icon RF-6), y el glyph sigue identificado
    // (T1: `lucide-code`).
    expect(glyph).toHaveClass(iconBaseClass);
    expect(glyph).toHaveClass("lucide-code");
  });
});

// ============================================================================
// CIERRE de accesibilidad (T2; constitución T4, Tests esperados 5; la última
// entrada del archivo).
//
// VERDE on-arrival #101 (declarado arriba, en el encabezado): el markup ya era
// accesible desde T1 — article nombrada por `aria-labelledby` al h3, glyph
// decorativo (`aria-hidden`), texto plano — y T2 no toca la estructura. El
// valor del cierre es la REGRESIÓN futura sobre la card completa.
//
// Fixture: la card normal (`SERVICE`, armazón `AccentGradientDefs` por el
// `tone="gradient"`; contrato de Icon).
// ============================================================================
describe("ServiceCard accessibility audit (T2: cierre, spec → Tests esperados 5)", () => {
  it("has no accessibility violations with the full card", async () => {
    const { container } = render(serviceCard());

    // Fija lo auditado (criterio SkillList/ControlsBar: sin assert de anclaje
    // el cierre no distingue qué rama recorre): la card completa — article
    // nombrada, heading nivel 3 con el título, descripción y glyph
    // decorativo con defs montadas.
    const article = screen.getByRole("article", { name: SERVICE.title });
    expect(
      within(article).getByRole("heading", { level: 3, name: SERVICE.title }),
    ).toBeInTheDocument();
    expect(within(article).getByText(SERVICE.description)).toBeInTheDocument();
    expect(
      article.querySelector('svg[stroke="url(#accent-gradient)"]'),
    ).not.toBeNull();

    await expectNoA11yViolations(container);
  });
});
