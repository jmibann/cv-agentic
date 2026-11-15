import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Service } from "@data/cv.types.generated";

import { expectNoA11yViolations } from "../../test/a11y";

import { AccentGradientDefs } from "../Icon";

import { ServiceCard } from "./ServiceCard";
import type { ServiceCardProps } from "./ServiceCard";

import boxStyles from "../Box/Box.module.css";

import iconStyles from "../Icon/Icon.module.css";
import styles from "./ServiceCard.module.css";

const SERVICE: Service = {
  id: "web-apps",
  title: "Web Applications",
  description: "Single-page apps with a focus on performance.",
  icon: "code",
};

// Asserted as a literal instead of rebuilding the formula, so the test is not
// a tautology.
const TITLE_ID = "service-web-apps-title";

const serviceCard = (
  overrides: Partial<Pick<ServiceCardProps, "className">> = {},
) => (
  <>
    <AccentGradientDefs />
    <ServiceCard service={SERVICE} {...overrides} />
  </>
);

describe("ServiceCard named article (T1: RF-1, RF-3)", () => {
  it("renders an article named by its h3 through the derived title id", () => {
    render(serviceCard());

    const article = screen.getByRole("article", { name: SERVICE.title });
    expect(article.tagName).toBe("ARTICLE");
    expect(article).toHaveAttribute("aria-labelledby", TITLE_ID);

    const heading = within(article).getByRole("heading", {
      level: 3,
      name: SERVICE.title,
    });
    expect(heading.getAttribute("id")).toBe(TITLE_ID);
    expect(heading.getAttribute("id")).toBe(
      article.getAttribute("aria-labelledby"),
    );
    expect(heading.textContent).toBe(SERVICE.title);
  });
});

describe("ServiceCard content (T1: RF-1)", () => {
  it("renders the description in a paragraph sharing the text div with the heading", () => {
    render(serviceCard());

    const article = screen.getByRole("article", { name: SERVICE.title });

    const paragraph = within(article).getByText(SERVICE.description);
    expect(paragraph.tagName).toBe("P");

    const heading = within(article).getByRole("heading", { level: 3 });
    expect(heading.parentElement).toBe(paragraph.parentElement);
    expect(heading.parentElement?.tagName).toBe("DIV");

    expect(article.children).toHaveLength(2);
    expect(article.lastElementChild).toBe(heading.parentElement);
    expect(within(article).getAllByRole("heading")).toHaveLength(1);
  });
});

describe("ServiceCard gradient glyph (T1: RF-2)", () => {
  it("renders the service icon as a decorative gradient svg, direct child of the article", () => {
    const { container } = render(serviceCard());

    expect(container.querySelector("linearGradient")).toHaveAttribute(
      "id",
      "accent-gradient",
    );

    const article = screen.getByRole("article", { name: SERVICE.title });

    const glyph = article.querySelector('svg[stroke="url(#accent-gradient)"]');
    expect(glyph).not.toBeNull();
    expect(glyph).toHaveClass("lucide-code");
    expect(glyph).toHaveAttribute("aria-hidden", "true");

    expect(article.firstElementChild).toBe(glyph);
    expect(glyph?.parentElement).toBe(article);
    expect(article.querySelector("span")).toBeNull();
  });
});

// extra: className forwarding is part of the API.
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

describe("ServiceCard glyph size class (T2: RF-2, conexión DOM de .glyph)", () => {
  it("applies the module glyph class on the svg alongside Icon's base icon class", () => {
    const glyphClass = styles.glyph ?? "glyph";
    const iconBaseClass = iconStyles.icon ?? "icon";

    render(serviceCard());

    const article = screen.getByRole("article", { name: SERVICE.title });
    const glyph = article.querySelector('svg[stroke="url(#accent-gradient)"]');
    expect(glyph).not.toBeNull();

    expect(glyph).toHaveClass(glyphClass);
    expect(glyph).toHaveClass(iconBaseClass);
    expect(glyph).toHaveClass("lucide-code");
  });
});

describe("ServiceCard accessibility audit (T2: cierre, spec → Tests esperados 5)", () => {
  it("has no accessibility violations with the full card", async () => {
    const { container } = render(serviceCard());

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
