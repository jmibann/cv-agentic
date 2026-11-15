import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AccentGradientDefs } from "../Icon";

import { SectionTitle } from "./SectionTitle";

import { expectNoA11yViolations } from "../../test/a11y";

import styles from "./SectionTitle.module.css";

const h1Class = styles.h1 ?? "h1";
const h2Class = styles.h2 ?? "h2";
const h3Class = styles.h3 ?? "h3";
const decoratedClass = styles.decorated ?? "decorated";

describe("SectionTitle heading levels and id passthrough (T1: RF-1, RF-4)", () => {
  it("renders an h1 heading with the accessible name when as=\"h1\"", () => {
    const { getByRole } = render(<SectionTitle as="h1">About Me</SectionTitle>);

    const heading = getByRole("heading", { level: 1, name: "About Me" });

    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe("H1");
  });

  it("renders an h2 heading with the accessible name when as=\"h2\"", () => {
    const { getByRole } = render(<SectionTitle as="h2">Education</SectionTitle>);

    const heading = getByRole("heading", { level: 2, name: "Education" });

    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe("H2");
  });

  it("renders an h3 heading with the accessible name when as=\"h3\"", () => {
    const { getByRole } = render(<SectionTitle as="h3">University</SectionTitle>);

    const heading = getByRole("heading", { level: 3, name: "University" });

    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe("H3");
  });

  it("passes id to the heading element for aria-labelledby", () => {
    const { getByRole } = render(
      <SectionTitle as="h2" id="experience-title">
        Experience
      </SectionTitle>,
    );

    const heading = getByRole("heading", { level: 2, name: "Experience" });

    expect(heading).toHaveAttribute("id", "experience-title");
  });
});

describe("SectionTitle level size classes from the module (T2: RF-1)", () => {
  it("applies the module .h1 size class to the root heading when as=\"h1\"", () => {
    const { getByRole } = render(<SectionTitle as="h1">About Me</SectionTitle>);

    const heading = getByRole("heading", { level: 1, name: "About Me" });

    expect(heading).toHaveClass(h1Class);
  });

  it("applies the module .h2 size class to the root heading when as=\"h2\"", () => {
    const { getByRole } = render(<SectionTitle as="h2">Education</SectionTitle>);

    const heading = getByRole("heading", { level: 2, name: "Education" });

    expect(heading).toHaveClass(h2Class);
  });

  it("applies the module .h3 size class to the root heading when as=\"h3\"", () => {
    const { getByRole } = render(
      <SectionTitle as="h3">University</SectionTitle>,
    );

    const heading = getByRole("heading", { level: 3, name: "University" });

    expect(heading).toHaveClass(h3Class);
  });
});

describe("SectionTitle decorated gradient bar (T3: RF-2)", () => {
  it("applies the module decorated class to the root heading when decorated", () => {
    const { getByRole } = render(
      <SectionTitle as="h1" decorated>
        About Me
      </SectionTitle>,
    );

    const heading = getByRole("heading", { level: 1, name: "About Me" });

    expect(heading).toHaveClass(decoratedClass);
    expect(heading).toHaveClass(h1Class);
  });

  it("keeps the same accessible name and text content when decorated", () => {
    const { getByRole } = render(
      <SectionTitle as="h1" decorated>
        About Me
      </SectionTitle>,
    );

    const heading = getByRole("heading", { level: 1, name: "About Me" });

    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toBe("About Me");
  });
});

const withIconClass = styles.withIcon ?? "withIcon";

describe("SectionTitle with icon (T4: RF-3)", () => {
  it("renders an IconBox inside the heading keeping the accessible name as only the text", () => {
    const { getByRole } = render(
      <>
        <AccentGradientDefs />
        <SectionTitle as="h2" icon="book-open">
          Education
        </SectionTitle>
      </>,
    );

    // The accessible name is still only the text: the icon box is aria-hidden.
    const heading = getByRole("heading", { level: 2, name: "Education" });

    expect(
      heading.querySelector('svg[stroke="url(#accent-gradient)"]'),
    ).not.toBeNull();
    expect(heading).toHaveClass(withIconClass);
    expect(heading.textContent).toBe("Education");
  });

  it("keeps the decorated class and the IconBox when decorated and icon combine", () => {
    const { getByRole } = render(
      <>
        <AccentGradientDefs />
        <SectionTitle as="h2" decorated icon="book-open">
          Education
        </SectionTitle>
      </>,
    );

    const heading = getByRole("heading", { level: 2, name: "Education" });

    expect(heading).toHaveClass(decoratedClass);
    expect(heading).toHaveClass(withIconClass);
    expect(heading).toHaveClass(h2Class);
    expect(
      heading.querySelector('svg[stroke="url(#accent-gradient)"]'),
    ).not.toBeNull();
  });

  it("places the IconBox and the text as direct children of the heading, no wrapper", () => {
    const { getByRole } = render(
      <>
        <AccentGradientDefs />
        <SectionTitle as="h2" icon="book-open">
          Education
        </SectionTitle>
      </>,
    );

    const heading = getByRole("heading", { level: 2, name: "Education" });

    const iconBox = heading.firstElementChild;
    expect(iconBox?.tagName).toBe("SPAN");
    expect(iconBox).toHaveAttribute("aria-hidden", "true");
    expect(
      iconBox?.querySelector('svg[stroke="url(#accent-gradient)"]'),
    ).not.toBeNull();

    const textNode = heading.lastChild;
    expect(textNode?.nodeType).toBe(Node.TEXT_NODE);
    expect(textNode?.textContent).toBe("Education");
  });
});

describe("SectionTitle className joining (T5: spec → API)", () => {
  it("joins an external className to the base level class on the root heading", () => {
    const consumerClass = "about-title";

    const { getByRole } = render(
      <SectionTitle as="h1" className={consumerClass}>
        About Me
      </SectionTitle>,
    );

    const heading = getByRole("heading", { level: 1, name: "About Me" });

    expect(heading).toHaveClass(h1Class);
    expect(heading).toHaveClass(consumerClass);
  });

  it("joins an external className alongside decorated and withIcon when all combine", () => {
    const consumerClass = "section-heading";

    const { getByRole } = render(
      <>
        <AccentGradientDefs />
        <SectionTitle
          as="h2"
          decorated
          icon="book-open"
          className={consumerClass}
        >
          Education
        </SectionTitle>
      </>,
    );

    const heading = getByRole("heading", { level: 2, name: "Education" });

    expect(heading).toHaveClass(h2Class);
    expect(heading).toHaveClass(decoratedClass);
    expect(heading).toHaveClass(withIconClass);
    expect(heading).toHaveClass(consumerClass);
  });
});

describe("SectionTitle accessibility audit", () => {
  it("has no accessibility violations with a plain level-1 title", async () => {
    const { container } = render(
      <SectionTitle as="h1" id="about-me">
        About Me
      </SectionTitle>,
    );

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with the decorated + icon combination", async () => {
    const { container } = render(
      <>
        <AccentGradientDefs />
        <SectionTitle as="h2" id="education" decorated icon="book-open">
          Education
        </SectionTitle>
      </>,
    );

    await expectNoA11yViolations(container);
  });
});
