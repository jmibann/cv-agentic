import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CornerTab } from "./CornerTab";

import styles from "./CornerTab.module.css";

import { expectNoA11yViolations } from "../../test/a11y";
import { Box } from "../Box";

const cornerTabClass = styles.cornerTab ?? "cornerTab";

describe("CornerTab overlay base render (T1: RF-1, RF-6)", () => {
  it("renders its children inside the root div", () => {
    const { container, getByText } = render(<CornerTab>Experience</CornerTab>);

    const root = container.querySelector("div");
    expect(root).not.toBeNull();
    expect(root?.tagName).toBe("DIV");

    expect(getByText("Experience")).toBeInTheDocument();
    expect(root?.textContent).toBe("Experience");
  });

  it("applies the module base class to the root div", () => {
    const { container } = render(<CornerTab>Experience</CornerTab>);

    const root = container.querySelector("div");
    expect(root).not.toBeNull();
    expect(root).toHaveClass(cornerTabClass);
  });

  it("exposes no role and no aria-* attribute on the root", () => {
    const { container, getByRole } = render(
      <CornerTab>
        <button type="button">Show Contacts</button>
      </CornerTab>,
    );

    const root = container.querySelector("div");
    expect(root).not.toBeNull();
    expect(root).not.toHaveAttribute("role");

    const ariaAttributes = Array.from(root?.attributes ?? [])
      .map((attribute) => attribute.name)
      .filter((name) => name.startsWith("aria-"));
    expect(ariaAttributes).toEqual([]);

    expect(getByRole("button", { name: "Show Contacts" })).toBeInTheDocument();
  });

  it("joins an external className to the base class on the root div", () => {
    const consumerClass = "nav-tab";

    const { container } = render(
      <CornerTab className={consumerClass}>Experience</CornerTab>,
    );

    const root = container.querySelector("div");
    expect(root).not.toBeNull();
    expect(root).toHaveClass(cornerTabClass);
    expect(root).toHaveClass(consumerClass);
  });
});

const mdClass = styles.md ?? "md";
const smClass = styles.sm ?? "sm";

describe("CornerTab size variants (T2: RF-2)", () => {
  it("applies the .md class and not .sm when size is omitted (default md)", () => {
    const { container } = render(<CornerTab>Experience</CornerTab>);

    const root = container.querySelector("div");
    expect(root).not.toBeNull();
    expect(root).toHaveClass(mdClass);
    expect(root).not.toHaveClass(smClass);
  });

  it("applies the .sm class and not .md when size=\"sm\" (distinct classes)", () => {
    const { container } = render(<CornerTab size="sm">Show Contacts</CornerTab>);

    const root = container.querySelector("div");
    expect(root).not.toBeNull();
    expect(root).toHaveClass(smClass);
    expect(root).not.toHaveClass(mdClass);
  });

  it("applies the .md class and not .sm when size=\"md\" is passed explicitly", () => {
    const { container } = render(<CornerTab size="md">Experience</CornerTab>);

    const root = container.querySelector("div");
    expect(root).not.toBeNull();
    expect(root).toHaveClass(mdClass);
    expect(root).not.toHaveClass(smClass);
  });
});

const floatClass = styles.float ?? "float";

describe("CornerTab placement float class (T3: RF-3)", () => {
  it("applies the .float class when placement=\"float\"", () => {
    const { container } = render(
      <CornerTab placement="float">Experience</CornerTab>,
    );

    const root = container.querySelector("div");
    expect(root).not.toBeNull();
    expect(root).toHaveClass(floatClass);
    expect(root).toHaveClass(cornerTabClass);
  });

  it("does not apply the .float class when placement is omitted (default overlay)", () => {
    const { container } = render(<CornerTab>Experience</CornerTab>);

    const root = container.querySelector("div");
    expect(root).not.toBeNull();
    expect(root).not.toHaveClass(floatClass);
  });

  it("does not apply the .float class when placement=\"overlay\" is passed explicitly", () => {
    const { container } = render(
      <CornerTab placement="overlay">Experience</CornerTab>,
    );

    const root = container.querySelector("div");
    expect(root).not.toBeNull();
    expect(root).not.toHaveClass(floatClass);
  });
});

describe("CornerTab print hook on the root (T5: RF-7)", () => {
  it("renders data-print-hide alongside its classes on the root div in both placements", () => {
    const { container: overlayContainer } = render(
      <CornerTab>Experience</CornerTab>,
    );

    const overlayRoot = overlayContainer.querySelector("div");
    expect(overlayRoot).not.toBeNull();
    expect(overlayRoot).toHaveAttribute("data-print-hide");
    expect(overlayRoot).toHaveClass(cornerTabClass);

    const { container: floatContainer } = render(
      <CornerTab placement="float">Experience</CornerTab>,
    );

    const floatRoot = floatContainer.querySelector("div");
    expect(floatRoot).not.toBeNull();
    expect(floatRoot).toHaveAttribute("data-print-hide");
    expect(floatRoot).toHaveClass(cornerTabClass);
    expect(floatRoot).toHaveClass(floatClass);
  });
});

describe("CornerTab accessibility audit (T4: RF-6)", () => {
  it("has no accessibility violations rendering a loose corner tab with text children", async () => {
    const { container } = render(<CornerTab>Experience</CornerTab>);

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations rendering a corner tab inside a Box outer scaffold", async () => {
    const { container } = render(
      <Box variant="outer">
        <CornerTab size="sm">
          <button type="button">Show Contacts</button>
        </CornerTab>
      </Box>,
    );

    await expectNoA11yViolations(container);
  });
});
