import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./Badge";

import { expectNoA11yViolations } from "../../test/a11y";

import styles from "./Badge.module.css";

const badgeClass = styles.badge ?? "badge";

describe("Badge base render (T1: RF-1, RF-2)", () => {
  it("renders the children text in a <span> root by default", () => {
    const { getByText } = render(<Badge>Staff Engineer</Badge>);

    const root = getByText("Staff Engineer");

    expect(root).toBeInTheDocument();
    expect(root.tagName).toBe("SPAN");
  });

  it("renders an <li> inside the ul scaffold when as=\"li\"", () => {
    const { getByText } = render(
      <ul>
        <Badge as="li">React</Badge>
      </ul>,
    );

    const root = getByText("React");

    expect(root).toBeInTheDocument();
    expect(root.tagName).toBe("LI");
    expect(root.parentElement?.tagName).toBe("UL");
  });
});

describe("Badge className joining (T2: RF-3)", () => {
  it("joins an external className to the base class on the default span root", () => {
    const consumerClass = "sidebar-role";

    const { getByText } = render(
      <Badge className={consumerClass}>Staff Engineer</Badge>,
    );

    const root = getByText("Staff Engineer");

    expect(root.tagName).toBe("SPAN");
    expect(root).toHaveClass(badgeClass);
    expect(root).toHaveClass(consumerClass);
  });

  it("joins an external className to the base class on the li root when as=\"li\"", () => {
    const consumerClass = "skill-chip";

    const { getByText } = render(
      <ul>
        <Badge as="li" className={consumerClass}>
          React
        </Badge>
      </ul>,
    );

    const root = getByText("React");

    expect(root.tagName).toBe("LI");
    expect(root.parentElement?.tagName).toBe("UL");
    expect(root).toHaveClass(badgeClass);
    expect(root).toHaveClass(consumerClass);
  });
});

describe("Badge accessibility audit (T3: RF-4)", () => {
  it("has no accessibility violations rendering a loose span badge", async () => {
    const { container } = render(<Badge>Staff Engineer</Badge>);

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations rendering an li badge inside a ul", async () => {
    const { container } = render(
      <ul>
        <Badge as="li">React</Badge>
      </ul>,
    );

    await expectNoA11yViolations(container);
  });
});
