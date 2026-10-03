// Tests del setup global de Vitest (T2): cleanup de Testing Library entre
// tests, mock de `window.matchMedia` (con disparo de `change`, la puerta que
// usa T5) y limpieza global de `localStorage`, `data-theme`, `lang` y
// `location.hash`. Los nombres de scenario remiten a "Hecho cuando" de T2.
import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { simulateMediaChange } from "./setup";

describe("cleanup del DOM entre tests (afterEach(cleanup) de setup.ts)", () => {
  // Sin el cleanup explícito (globals: false desactiva el automático de RTL),
  // el botón del test A quedaría en document.body y el test B vería dos.
  it("test A: renderiza un botón y hay uno en el DOM (jest-dom extendido)", () => {
    render(createElement("button", null, "x"));
    expect(screen.getByRole("button", { name: "x" })).toBeInTheDocument();
  });

  it("test B: el DOM no acumula — sigue habiendo un solo botón 'x'", () => {
    render(createElement("button", null, "x"));
    expect(screen.getAllByRole("button", { name: "x" })).toHaveLength(1);
  });
});

describe("mock de window.matchMedia", () => {
  it("responde con matches booleano y listeners funcionales; change dispara", () => {
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

describe("limpieza de localStorage entre tests", () => {
  it("test A: escribe una clave", () => {
    localStorage.setItem("k", "v");
    expect(localStorage.getItem("k")).toBe("v");
  });

  it("test B: localStorage llega vacío (el afterEach global limpió 'k')", () => {
    expect(localStorage.getItem("k")).toBeNull();
  });
});

describe("limpieza de data-theme, lang y location.hash entre tests", () => {
  it("test A: muta el documento y la URL como harían los providers", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.lang = "es";
    window.location.hash = "#resume";

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.lang).toBe("es");
    expect(window.location.hash).toBe("#resume");
  });

  it("test B: el documento arranca limpio de nuevo", () => {
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
    expect(document.documentElement.hasAttribute("lang")).toBe(false);
    expect(window.location.hash).toBe("");
  });
});
