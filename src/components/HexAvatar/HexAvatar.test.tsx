import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HexAvatarDefs } from "./HexAvatar";

import { HexAvatar } from "./HexAvatar";

import { expectNoA11yViolations } from "../../test/a11y";

import styles from "./HexAvatar.module.css";

const defsClass = styles.defs ?? "defs";

const arcCount = (d: string): number => (d.match(/A/g) ?? []).length;

describe("HexAvatarDefs clip paths (T1: RF-3)", () => {
  it("renders exactly two clipPath elements with the contract ids and objectBoundingBox units", () => {
    const { container } = render(<HexAvatarDefs />);

    expect(container.querySelectorAll("clipPath")).toHaveLength(2);

    const outer = container.querySelector("clipPath#hex-avatar-outer");
    const inner = container.querySelector("clipPath#hex-avatar-inner");
    expect(outer).not.toBeNull();
    expect(inner).not.toBeNull();
    expect(outer).toHaveAttribute("clipPathUnits", "objectBoundingBox");
    expect(inner).toHaveAttribute("clipPathUnits", "objectBoundingBox");
  });

  it("hex-avatar-outer has one path with 6 elliptical-arc corners (rx 0.075 / ry 0.068) closed with Z", () => {
    const { container } = render(<HexAvatarDefs />);

    const outer = container.querySelector("clipPath#hex-avatar-outer");
    const outerPath = outer?.querySelector("path");
    expect(outer).not.toBeNull();
    expect(outer?.querySelectorAll("path")).toHaveLength(1);
    expect(outerPath).not.toBeNull();

    const d = outerPath?.getAttribute("d") ?? "";
    expect(d.length).toBeGreaterThan(0);
    expect(arcCount(d)).toBe(6);
    expect(d).toContain("0.075 0.068 0 0 1");
    expect(d).toMatch(/Z$/);
  });

  it("hex-avatar-inner has one path with 6 elliptical-arc corners (rx 0.028 / ry 0.025) closed with Z", () => {
    const { container } = render(<HexAvatarDefs />);

    const inner = container.querySelector("clipPath#hex-avatar-inner");
    const innerPath = inner?.querySelector("path");
    expect(inner).not.toBeNull();
    expect(inner?.querySelectorAll("path")).toHaveLength(1);
    expect(innerPath).not.toBeNull();

    const d = innerPath?.getAttribute("d") ?? "";
    expect(d.length).toBeGreaterThan(0);
    expect(arcCount(d)).toBe(6);
    expect(d).toContain("0.028 0.025 0 0 1");
    expect(d).toMatch(/Z$/);
  });

  it("svg is invisible by size (0x0 attributes and the module class), never display:none, out of the a11y tree", () => {
    const { container } = render(<HexAvatarDefs />);
    const defsSvg = container.querySelector("svg");
    expect(defsSvg).not.toBeNull();

    expect(defsSvg).toHaveAttribute("width", "0");
    expect(defsSvg).toHaveAttribute("height", "0");
    expect(defsSvg).toHaveClass(defsClass);
    expect(defsSvg).not.toHaveAttribute("style");
    // extra: same contract as the gradient defs in Icon.
    expect(defsSvg).toHaveAttribute("aria-hidden", "true");
    expect(defsSvg).toHaveAttribute("focusable", "false");
  });
});

const wrapClass = styles.wrap ?? "wrap";
const borderClass = styles.border ?? "border";
const imageClass = styles.image ?? "image";

describe("HexAvatar structure and src (T2: RF-1)", () => {
  it("renders an img that receives the src prop", () => {
    const { container } = render(<HexAvatar src="/x.png" />);

    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("src", "/x.png");
  });

  it("renders the exact wrap > border > img structure with the module classes", () => {
    const { container } = render(<HexAvatar src="/x.png" />);

    expect(container.querySelectorAll("span")).toHaveLength(2);
    expect(container.querySelectorAll("img")).toHaveLength(1);

    const wrap = container.querySelector("span");
    expect(wrap).not.toBeNull();
    expect(wrap?.tagName).toBe("SPAN");
    expect(wrap).toHaveClass(wrapClass);

    const border = wrap?.querySelector("span");
    expect(border).not.toBeNull();
    expect(border?.tagName).toBe("SPAN");
    expect(border).toHaveClass(borderClass);

    const img = border?.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveClass(imageClass);

    // extra: seals the structure against stray attributes.
    expect(Array.from(wrap?.attributes ?? []).map((a) => a.name)).toEqual([
      "class",
    ]);
    expect(Array.from(border?.attributes ?? []).map((a) => a.name)).toEqual([
      "class",
    ]);
  });
});

describe("HexAvatar alt (T3: RF-2)", () => {
  it('defaults to a decorative image: alt="" and absent from getByRole("img")', () => {
    const { container, queryByRole } = render(<HexAvatar src="/x.png" />);

    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("alt", "");
    expect(queryByRole("img")).toBeNull();
  });

  it("exposes the alt prop as the accessible name", () => {
    const { getByRole } = render(<HexAvatar src="/x.png" alt="Foto de X" />);

    expect(getByRole("img", { name: "Foto de X" })).toBeInTheDocument();
  });
});

describe("HexAvatar className joining (T4: spec Tests #4)", () => {
  it("joins an external className to the base wrap class on the root span", () => {
    const consumerClass = "testimonial-avatar";

    const { container } = render(
      <HexAvatar src="/x.png" className={consumerClass} />,
    );

    const wrap = container.querySelector("span");
    expect(wrap).not.toBeNull();
    expect(wrap).toHaveClass(wrapClass);
    expect(wrap).toHaveClass(consumerClass);
  });
});

describe("HexAvatar accessibility audit (T4: RF-5; spec Tests #7)", () => {
  it("has no accessibility violations rendering a decorative avatar with the shared defs mounted", async () => {
    const { container } = render(
      <>
        <HexAvatarDefs />
        <HexAvatar src="/x.png" />
      </>,
    );

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations rendering a named avatar with the shared defs mounted", async () => {
    const { container } = render(
      <>
        <HexAvatarDefs />
        <HexAvatar src="/x.png" alt="Foto de X" />
      </>,
    );

    await expectNoA11yViolations(container);
  });
});
