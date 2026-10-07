// Tests de T1 (specs/content/ServiceCard/tasks.md) — RF-1, RF-2, RF-3
// (Tests esperados 1-4 de la spec): el <article> se nombra por su h3 vía
// `aria-labelledby="service-${service.id}-title"` (fórmula fija, RF-3); el
// título es un `heading` nivel 3 (SectionTitle real, sin wrapper) y la
// descripción un <p>; el ícono es el glyph de `service.icon` con
// `stroke="url(#accent-gradient)"` (armazón `AccentGradientDefs`) e hijo
// DIRECTO del article (RF-2, decisión 16: sin <span> wrapper — inspección DOM).
//
// Diferidos a T2 según tasks.md: el módulo mobile-first (RF-4/RF-5, por
// inspección), la clase `.glyph { --icon-size: var(--size-service-icon); }`
// (RF-2), cero pseudo-estados (RF-6, inspección), el cierre
// `expectNoA11yViolations` (Tests esperados 5) e `index.ts`.
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
// Rojo on-arrival (P4): falta la implementación —los imports `./ServiceCard`
// (componente y tipo) no resuelven.
//
// Datos ficticios (constitución D4): fixture de servicio inventada, textos de
// ejemplo del propio spec (Anatomía), sin datos reales.

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Service } from "@data/cv.types.generated";

import { AccentGradientDefs } from "../Icon";

import { ServiceCard } from "./ServiceCard";
import type { ServiceCardProps } from "./ServiceCard";

// Clase de variante del Box raíz: la unión de `className` la aplica Box
// (spec → API), y el test importa el módulo de Box para fijar el nombre real
// resuelto (`inner`) y asierte la coexistencia con la clase del consumidor.
import boxStyles from "../Box/Box.module.css";

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
