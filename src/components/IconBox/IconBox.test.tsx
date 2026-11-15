import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AccentGradientDefs } from "../Icon";

import { expectNoA11yViolations } from "../../test/a11y";

import { IconBox } from "./IconBox";

import styles from "./IconBox.module.css";

describe("IconBox structure (RF-1)", () => {
  it("renders an svg with stroke=\"url(#accent-gradient)\" inside the square span", () => {
    const { container } = render(
      <>
        <AccentGradientDefs />
        <IconBox icon="mail" />
      </>,
    );

    const root = container.querySelector("span");
    expect(root).not.toBeNull();

    const glyph = container.querySelector('svg[stroke="url(#accent-gradient)"]');
    expect(glyph).not.toBeNull();
    expect(root?.contains(glyph)).toBe(true);
  });

  it("mounts no gradient defs of its own: a single #accent-gradient in the DOM", () => {
    const { container } = render(
      <>
        <AccentGradientDefs />
        <IconBox icon="code" />
      </>,
    );

    expect(container.querySelectorAll('[id="accent-gradient"]')).toHaveLength(1);
    expect(container.querySelectorAll("linearGradient")).toHaveLength(1);
  });
});

const iconBoxClass = styles.iconBox ?? "iconBox";

describe("IconBox decorative root and className joining (T2: RF-2)", () => {
  it("marks the root span as decorative with aria-hidden=\"true\"", () => {
    const { container } = render(
      <>
        <AccentGradientDefs />
        <IconBox icon="mail" />
      </>,
    );

    const root = container.querySelector("span");

    expect(root).not.toBeNull();
    expect(root).toHaveAttribute("aria-hidden", "true");
  });

  it("joins an external className to the base class on the root span", () => {
    const consumerClass = "contact-icon-box";

    const { container } = render(
      <>
        <AccentGradientDefs />
        <IconBox icon="mail" className={consumerClass} />
      </>,
    );

    const root = container.querySelector("span");

    expect(root).not.toBeNull();
    expect(root).toHaveClass(iconBoxClass);
    expect(root).toHaveClass(consumerClass);
  });
});

describe("IconBox accessibility audit", () => {
  it("has no accessibility violations with the gradient defs scaffold", async () => {
    const { container } = render(
      <>
        <AccentGradientDefs />
        <IconBox icon="mail" />
      </>,
    );

    await expectNoA11yViolations(container);
  });
});
