import { describe, expect, it } from "vitest";

import { SOCIAL_NETWORKS } from "@data/constants";

import { BRAND_PATHS } from "./paths";

import { render } from "@testing-library/react";

import { BrandIcon } from "./BrandIcon";

import { BRAND_NAMES } from "./BrandIcon";

import { expectNoA11yViolations } from "../../test/a11y";

import styles from "./BrandIcon.module.css";

import {
  BRAND_NAMES as BRAND_NAMES_INDEX,
  BrandIcon as BrandIconFromIndex,
} from "./index";

function toPathList(d: string | string[]): string[] {
  return Array.isArray(d) ? d : [d];
}

describe("BrandIcon paths structure", () => {
  // extra: runtime check of the full coverage the Record type enforces at
  // compile time.
  it("has exactly one entry per network in SOCIAL_NETWORKS", () => {
    const keys = Object.keys(BRAND_PATHS);

    expect(keys).toHaveLength(SOCIAL_NETWORKS.length);
    for (const network of SOCIAL_NETWORKS) {
      expect(keys).toContain(network);
    }
  });

  it.each([...SOCIAL_NETWORKS])(
    "\"%s\" has a non-empty viewBox string",
    (network) => {
      const entry = BRAND_PATHS[network];

      expect(typeof entry.viewBox).toBe("string");
      expect(entry.viewBox.trim()).not.toBe("");
    },
  );

  it.each([...SOCIAL_NETWORKS])(
    "\"%s\" has a `d` string or array with at least one non-empty path",
    (network) => {
      const entry = BRAND_PATHS[network];
      const paths = toPathList(entry.d);

      expect(paths.length).toBeGreaterThan(0);
      for (const d of paths) {
        expect(typeof d).toBe("string");
      }
      expect(paths.some((d) => d.trim() !== "")).toBe(true);
    },
  );
});

describe("BrandIcon render", () => {
  it.each([...SOCIAL_NETWORKS])(
    "\"%s\" renders an <svg> with the viewBox of its paths entry",
    (network) => {
      const { container } = render(<BrandIcon network={network} />);

      const svg = container.querySelector("svg");

      expect(svg).toBeInTheDocument();
      // Asserted against the entry, not a literal, so the test is not tied to data.
      expect(svg).toHaveAttribute("viewBox", BRAND_PATHS[network].viewBox);
    },
  );

  it.each([...SOCIAL_NETWORKS])(
    "\"%s\" renders one <path> with a non-empty d per `d` of its paths entry",
    (network) => {
      const { container } = render(<BrandIcon network={network} />);

      const rendered = [
        ...container.querySelectorAll("svg > path"),
      ].map((path) => path.getAttribute("d") ?? "");
      const expected = toPathList(BRAND_PATHS[network].d).filter(
        (d) => d.trim() !== "",
      );

      expect(rendered.length).toBeGreaterThanOrEqual(1);
      expect(rendered).toEqual(expected);
    },
  );
});

describe("BrandIcon decorative accessibility (RF-3)", () => {
  it.each([...SOCIAL_NETWORKS])(
    "\"%s\" renders a decorative svg: aria-hidden, focusable=\"false\", fill=\"currentColor\", absent from getByRole(\"img\")",
    (network) => {
      const { container, queryByRole } = render(
        <BrandIcon network={network} />,
      );

      const svg = container.querySelector("svg");

      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("aria-hidden", "true");
      expect(svg).toHaveAttribute("focusable", "false");
      expect(svg).toHaveAttribute("fill", "currentColor");
      expect(queryByRole("img")).toBeNull();
    },
  );
});

describe("BRAND_NAMES (RF-2)", () => {
  it.each([...SOCIAL_NETWORKS])(
    "\"%s\" has a non-empty visible name",
    (network) => {
      const name = BRAND_NAMES[network];

      expect(typeof name).toBe("string");
      expect(name).not.toBe("");
      expect(name.trim()).not.toBe("");
    },
  );
});

const brandIconClass = styles.brandIcon ?? "brandIcon";

describe("BrandIcon CSS sizing and className joining (RF-5, RF-6)", () => {
  it("applies the module base class on the svg by default", () => {
    const { container } = render(<BrandIcon network="github" />);
    const svg = container.querySelector("svg");

    expect(svg).not.toBeNull();
    expect(svg).toHaveClass(brandIconClass);
  });

  it("joins the received className to the base class on the svg, not replacing it", () => {
    const consumerClass = "sidebar-social-glyph";
    const { container } = render(
      <BrandIcon network="linkedin" className={consumerClass} />,
    );
    const svg = container.querySelector("svg");

    expect(svg).not.toBeNull();
    expect(svg).toHaveClass(brandIconClass);
    expect(svg).toHaveClass(consumerClass);
  });

  // extra: the index re-exports the same identities, not copies.
  it("exposes BrandIcon and BRAND_NAMES through the module index", () => {
    expect(BrandIconFromIndex).toBe(BrandIcon);
    expect(BRAND_NAMES_INDEX).toBe(BRAND_NAMES);

    const { container } = render(<BrandIconFromIndex network="x" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });
});

describe("BrandIcon accessibility audit", () => {
  it("has no accessibility violations rendering a decorative logo", async () => {
    const { container } = render(<BrandIcon network="github" />);

    await expectNoA11yViolations(container);
  });
});
