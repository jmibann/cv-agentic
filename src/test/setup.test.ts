import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { simulateMediaChange } from "./setup";

describe("DOM cleanup between tests (afterEach(cleanup) in setup.ts)", () => {
  // Without the explicit cleanup, test A's button would still be in the body
  // and test B would find two.
  it("test A: renders a button and it is in the DOM (jest-dom extended)", () => {
    render(createElement("button", null, "x"));
    expect(screen.getByRole("button", { name: "x" })).toBeInTheDocument();
  });

  it("test B: the DOM does not accumulate — there is still only one 'x' button", () => {
    render(createElement("button", null, "x"));
    expect(screen.getAllByRole("button", { name: "x" })).toHaveLength(1);
  });
});

describe("window.matchMedia mock", () => {
  it("returns boolean matches and functional listeners; change fires", () => {
    const listener = vi.fn();
    const query = "(prefers-color-scheme: dark)";
    const mql = window.matchMedia(query);

    expect(typeof mql.matches).toBe("boolean");
    expect(mql.matches).toBe(false);

    mql.addEventListener("change", listener);
    simulateMediaChange(query, true);
    expect(mql.matches).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);

    mql.removeEventListener("change", listener);
    simulateMediaChange(query, false);
    expect(mql.matches).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe("localStorage cleanup between tests", () => {
  it("test A: writes a key", () => {
    localStorage.setItem("k", "v");
    expect(localStorage.getItem("k")).toBe("v");
  });

  it("test B: localStorage arrives empty (the global afterEach cleared 'k')", () => {
    expect(localStorage.getItem("k")).toBeNull();
  });
});

describe("data-theme, lang and location.hash cleanup between tests", () => {
  it("test A: mutates the document and the URL as providers would", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.lang = "es";
    window.location.hash = "#resume";

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.lang).toBe("es");
    expect(window.location.hash).toBe("#resume");
  });

  it("test B: the document starts clean again", () => {
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
    expect(document.documentElement.hasAttribute("lang")).toBe(false);
    expect(window.location.hash).toBe("");
  });
});
