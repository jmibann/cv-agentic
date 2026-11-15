import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SERVICE_ICONS } from "@data/constants";

import { expectNoA11yViolations } from "../../test/a11y";

import { Icon } from "./Icon";
import type { IconName, UiIconName } from "./Icon";

import { AccentGradientDefs } from "./Icon";
import styles from "./Icon.module.css";

// Typed as readonly UiIconName[]: a literal outside the union fails the type
// check.
const UI_ICON_NAMES: readonly UiIconName[] = [
  "mail",
  "phone",
  "message-circle",
  "map-pin",
  "download",
  "chevron-down",
  "sun",
  "moon",
  "book-open",
  "briefcase",
  "quote",
  "x",
];

const ALL_ICON_NAMES: readonly IconName[] = [...UI_ICON_NAMES, ...SERVICE_ICONS];

describe("Icon map", () => {
  // extra: fails if the union or SERVICE_ICONS change without updating the list.
  it("enumerates all 24 IconName values (12 UI + 12 service)", () => {
    expect(ALL_ICON_NAMES).toHaveLength(24);
  });

  it.each(ALL_ICON_NAMES)("renders an <svg> for name \"%s\"", (name) => {
    const { container } = render(<Icon name={name} />);

    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});

describe("Icon accessibility", () => {
  it("is decorative without a label: aria-hidden and absent from getByRole(\"img\")", () => {
    const { container, queryByRole } = render(<Icon name="mail" />);

    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(queryByRole("img")).toBeNull();
  });

  it("is informative with a label: role=\"img\" and accessible name", () => {
    const label = "Email address";
    const { getByRole } = render(<Icon name="mail" label={label} />);

    const glyph = getByRole("img", { name: label });
    expect(glyph).toHaveAttribute("role", "img");
    expect(glyph).toHaveAttribute("aria-label", label);
  });

  it("sets focusable=\"false\" on the svg without a label (RF-7)", () => {
    const { container } = render(<Icon name="download" />);

    expect(container.querySelector("svg")).toHaveAttribute(
      "focusable",
      "false",
    );
  });

  it("sets focusable=\"false\" on the svg with a label (RF-7)", () => {
    const label = "Download CV";
    const { getByRole } = render(<Icon name="download" label={label} />);

    expect(getByRole("img", { name: label })).toHaveAttribute(
      "focusable",
      "false",
    );
  });
});

const stopStartClass = styles.stopStart ?? "stopStart";
const stopEndClass = styles.stopEnd ?? "stopEnd";
const defsClass = styles.defs ?? "defs";

describe("AccentGradientDefs", () => {
  it("renders the accent-gradient linearGradient with userSpaceOnUse geometry (RF-4)", () => {
    const { container } = render(<AccentGradientDefs />);
    const gradient = container.querySelector("linearGradient");

    expect(gradient).not.toBeNull();
    expect(gradient).toHaveAttribute("id", "accent-gradient");
    // Required: with objectBoundingBox straight lines are not drawn.
    expect(gradient).toHaveAttribute("gradientUnits", "userSpaceOnUse");
    expect(gradient).toHaveAttribute("x1", "0.62");
    expect(gradient).toHaveAttribute("y1", "-0.56");
    expect(gradient).toHaveAttribute("x2", "23.38");
    expect(gradient).toHaveAttribute("y2", "24.56");
  });

  it("renders two stops at offsets 0.2631 and 0.9375 with colors by CSS class, no style attribute", () => {
    const { container } = render(<AccentGradientDefs />);
    const stops = container.querySelectorAll("stop");

    expect(stops).toHaveLength(2);
    expect(stops[0]).toHaveAttribute("offset", "0.2631");
    expect(stops[0]).toHaveClass(stopStartClass);
    expect(stops[0]).not.toHaveAttribute("style");
    expect(stops[1]).toHaveAttribute("offset", "0.9375");
    expect(stops[1]).toHaveClass(stopEndClass);
    expect(stops[1]).not.toHaveAttribute("style");
  });

  it("is invisible by size (0×0), not with display:none, and out of the a11y tree", () => {
    const { container } = render(<AccentGradientDefs />);
    const defsSvg = container.querySelector("svg");

    expect(defsSvg).toHaveAttribute("width", "0");
    expect(defsSvg).toHaveAttribute("height", "0");
    expect(defsSvg).toHaveClass(defsClass);
    expect(defsSvg).not.toHaveAttribute("style");
    // extra: structure contract of the defs <svg>.
    expect(defsSvg).toHaveAttribute("aria-hidden", "true");
    expect(defsSvg).toHaveAttribute("focusable", "false");
  });
});

const toneAccentClass = styles.toneAccent ?? "toneAccent";

describe("Icon tone", () => {
  it("applies stroke=\"url(#accent-gradient)\" with tone=\"gradient\" (RF-4)", () => {
    const { container } = render(
      <>
        <AccentGradientDefs />
        <Icon name="code" tone="gradient" />
      </>,
    );

    expect(container.querySelector("linearGradient")).toHaveAttribute(
      "id",
      "accent-gradient",
    );

    // The icon's root is the <svg> that is not the defs one.
    const glyph = container.querySelector(`svg:not(.${defsClass})`);
    expect(glyph).not.toBeNull();
    expect(glyph).toHaveAttribute("stroke", "url(#accent-gradient)");
  });

  it("adds no inline style attribute anywhere with tone=\"gradient\"", () => {
    const { container } = render(
      <>
        <AccentGradientDefs />
        <Icon name="cloud" tone="gradient" />
      </>,
    );

    expect(container.querySelectorAll("[style]")).toHaveLength(0);
  });

  // extra: gradient and label are a valid combination.
  it("keeps the accessible name when tone=\"gradient\" and label are combined", () => {
    const label = "Cloud infrastructure";
    const { container, getByRole } = render(
      <>
        <AccentGradientDefs />
        <Icon name="cloud" tone="gradient" label={label} />
      </>,
    );

    const glyph = getByRole("img", { name: label });
    expect(glyph).toHaveAttribute("stroke", "url(#accent-gradient)");
    expect(container.querySelectorAll("[style]")).toHaveLength(0);
  });

  it("applies the module accent class with tone=\"accent\" and no inline styles (RF-6)", () => {
    const { container } = render(<Icon name="sun" tone="accent" />);
    const glyph = container.querySelector("svg");

    expect(glyph).not.toBeNull();
    expect(glyph).toHaveClass(toneAccentClass);
    expect(glyph).not.toHaveAttribute("stroke", "url(#accent-gradient)");
    expect(container.querySelectorAll("[style]")).toHaveLength(0);
  });

  it("adds no color class by default (tone=\"current\" inherited)", () => {
    const { container } = render(<Icon name="mail" />);
    const glyph = container.querySelector("svg");

    expect(glyph).not.toBeNull();
    expect(glyph).not.toHaveClass(toneAccentClass);
    expect(glyph).not.toHaveAttribute("stroke", "url(#accent-gradient)");
    expect(container.querySelectorAll("[style]")).toHaveLength(0);
  });

  it("adds no color class with an explicit tone=\"current\"", () => {
    const { container } = render(<Icon name="download" tone="current" />);
    const glyph = container.querySelector("svg");

    expect(glyph).not.toBeNull();
    expect(glyph).not.toHaveClass(toneAccentClass);
    expect(glyph).not.toHaveAttribute("stroke", "url(#accent-gradient)");
    expect(container.querySelectorAll("[style]")).toHaveLength(0);
  });
});

const iconClass = styles.icon ?? "icon";

describe("Icon className and CSS sizing (RF-6)", () => {
  it("applies the base .icon class on the svg by default", () => {
    const { container } = render(<Icon name="mail" />);
    const glyph = container.querySelector("svg");

    expect(glyph).not.toBeNull();
    expect(glyph).toHaveClass(iconClass);
  });

  it("joins the received className to .icon on the svg itself, not replacing it", () => {
    const consumerClass = "service-card-glyph";
    const { container } = render(<Icon name="code" className={consumerClass} />);
    const glyph = container.querySelector("svg");

    expect(glyph).not.toBeNull();
    expect(glyph).toHaveClass(iconClass);
    expect(glyph).toHaveClass(consumerClass);
  });

  // extra: the three classes coexist; none replaces another.
  it("keeps .icon, the tone=\"accent\" class and the received className together", () => {
    const consumerClass = "contact-row-icon";
    const { container } = render(
      <Icon name="mail" tone="accent" className={consumerClass} />,
    );
    const glyph = container.querySelector("svg");

    expect(glyph).not.toBeNull();
    expect(glyph).toHaveClass(iconClass);
    expect(glyph).toHaveClass(toneAccentClass);
    expect(glyph).toHaveClass(consumerClass);
  });
});

describe("Icon accessibility audit", () => {
  it("has no accessibility violations without a label", async () => {
    const { container } = render(<Icon name="mail" />);

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with a label", async () => {
    const { container } = render(<Icon name="mail" label="Email address" />);

    await expectNoA11yViolations(container);
  });
});
