import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Separator } from "./Separator";

import styles from "./Separator.module.css";

import { expectNoA11yViolations } from "../../test/a11y";
import { Box } from "../Box";

describe("Separator decorative root (T1: RF-1, RF-2)", () => {
  it('renders a div root marked decorative with aria-hidden="true"', () => {
    const { container } = render(<Separator />);

    const root = container.querySelector("div");

    expect(root).not.toBeNull();
    expect(root?.tagName).toBe("DIV");
    expect(root).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes no separator role and no <hr> in the DOM", () => {
    const { container, queryByRole } = render(<Separator />);

    expect(queryByRole("separator")).toBeNull();
    expect(container.querySelector("hr")).toBeNull();

    const root = container.querySelector("div");
    expect(root).not.toHaveAttribute("role");
  });
});

const separatorClass = styles.separator ?? "separator";

describe("Separator className joining (T2)", () => {
  it("joins an external className to the base class on the root div", () => {
    const consumerClass = "sidebar-separator";

    const { container } = render(<Separator className={consumerClass} />);

    const root = container.querySelector("div");

    expect(root).not.toBeNull();
    expect(root).toHaveClass(separatorClass);
    expect(root).toHaveClass(consumerClass);
  });
});

describe("Separator accessibility audit (T3: RF-1, RF-2)", () => {
  it("has no accessibility violations rendering a loose decorative separator", async () => {
    const { container } = render(<Separator />);

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations rendering a separator inside a Box outer scaffold", async () => {
    const { container } = render(
      <Box variant="outer">
        <Separator />
      </Box>,
    );

    await expectNoA11yViolations(container);
  });
});
