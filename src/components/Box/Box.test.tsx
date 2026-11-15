import { describe, expect, it } from "vitest";

import { render } from "@testing-library/react";

import { expectNoA11yViolations } from "../../test/a11y";

import { Box } from "./Box";

import styles from "./Box.module.css";

const outerClass = styles.outer ?? "outer";

describe("Box base render (T1: RF-1, RF-3)", () => {
  it("renders its children", () => {
    const { getByText } = render(<Box>surface content</Box>);

    expect(getByText("surface content")).toBeInTheDocument();
  });

  it("renders a div with the outer class when no variant is given", () => {
    const { container } = render(<Box>content</Box>);

    const root = container.querySelector("div");

    expect(root).toBeInTheDocument();
    expect(root).toHaveClass(outerClass);
  });

  it("renders a <section> when as=\"section\"", () => {
    const { container } = render(<Box as="section">content</Box>);

    const root = container.querySelector("section");

    expect(root).toBeInTheDocument();
    expect(container.querySelector("div")).toBeNull();
    expect(root).toHaveTextContent("content");
  });
});

const innerClass = styles.inner ?? "inner";

describe("Box inner variant and ARIA/id attributes (T2: RF-2, RF-3)", () => {
  it("applies the inner class and not the outer class when variant=\"inner\"", () => {
    const { container } = render(<Box variant="inner">content</Box>);

    const root = container.querySelector("div");

    expect(root).toBeInTheDocument();
    expect(root).toHaveClass(innerClass);
    expect(root).not.toHaveClass(outerClass);
  });

  it("reaches the accessible name via getByRole(\"complementary\") with as=\"aside\" aria-label=\"Profile\"", () => {
    const { getByRole } = render(
      <Box as="aside" aria-label="Profile">
        content
      </Box>,
    );

    expect(
      getByRole("complementary", { name: "Profile" }),
    ).toBeInTheDocument();
  });

  it("passes id to the root element", () => {
    const { container } = render(<Box id="profile-card">content</Box>);

    const root = container.querySelector("div");

    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute("id", "profile-card");
  });

  it("passes aria-labelledby to the root, computed as the accessible name of a section (ServiceCard case)", () => {
    const { container, getByRole } = render(
      <Box as="section" aria-labelledby="section-heading">
        <h2 id="section-heading">Experience</h2>
      </Box>,
    );

    const root = container.querySelector("section");

    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute("aria-labelledby", "section-heading");
    expect(getByRole("region", { name: "Experience" })).toBe(root);
  });
});

describe("Box className joining (T3: RF-3)", () => {
  it("joins an external className to the default outer class on the root div", () => {
    const consumerClass = "sidebar-panel";

    const { container } = render(<Box className={consumerClass}>content</Box>);

    const root = container.querySelector("div");

    expect(root).toBeInTheDocument();
    expect(root).toHaveClass(outerClass);
    expect(root).toHaveClass(consumerClass);
  });

  it("joins an external className to the inner class and not the outer class when variant=\"inner\"", () => {
    const consumerClass = "experience-block";

    const { container } = render(
      <Box variant="inner" className={consumerClass}>
        content
      </Box>,
    );

    const root = container.querySelector("div");

    expect(root).toBeInTheDocument();
    expect(root).toHaveClass(innerClass);
    expect(root).toHaveClass(consumerClass);
    expect(root).not.toHaveClass(outerClass);
  });
});

describe("Box accessibility audit", () => {
  it("has no accessibility violations rendering the default outer variant", async () => {
    const { container } = render(<Box>surface content</Box>);

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations rendering the inner variant", async () => {
    const { container } = render(<Box variant="inner">inner content</Box>);

    await expectNoA11yViolations(container);
  });
});
