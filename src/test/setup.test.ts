// Tests del setup global de Vitest (T2): cleanup de Testing Library entre
// tests, mock de `window.matchMedia` (con disparo de `change`, la puerta que
// usa T5) y limpieza global de `localStorage`, `data-theme`, `lang` y
// `location.hash`. Los nombres de scenario remiten a "Hecho cuando" de T2.
import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { simulateMediaChange } from "./setup";

describe("DOM cleanup between tests (afterEach(cleanup) in setup.ts)", () => {
  // Sin el cleanup explícito (globals: false desactiva el automático de RTL),
  // el botón del test A quedaría en document.body y el test B vería dos.
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
    // Default controlado del mock: sin hoja de estilos real, nada matchea.
    expect(mql.matches).toBe(false);

    mql.addEventListener("change", listener);
    // Puerta abierta para T5: el test simula el cambio del sistema.
    simulateMediaChange(query, true);
    expect(mql.matches).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);

    mql.removeEventListener("change", listener);
    simulateMediaChange(query, false);
    expect(mql.matches).toBe(false);
    // Tras removeEventListener el listener ya no escucha nada.
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
