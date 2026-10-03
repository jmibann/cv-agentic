// Tests de ThemeProvider (T5): RF-2…RF-5 de specs/foundation/Foundation/spec.md
// y la sección "Tests esperados (ThemeProvider)" de foundations/theming.md.
// 7 tests, en el orden literal de tasks.md → T5.

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

// Mock de `matchMedia` con disparo controlado de `change` (T2): la misma
// instancia de módulo que registra `test.setupFiles` (Vite deduplica por
// ruta resuelta), así que `simulateMediaChange` encuentra la MediaQueryList
// que creó el provider al montarse.
import { simulateMediaChange } from "../test/setup";
import { ThemeProvider, useTheme, type Theme } from "./ThemeProvider";

const DARK_QUERY = "(prefers-color-scheme: dark)";

// Sonda de test: expone el tema del contexto como texto y un botón que
// llama `toggleTheme` (queries por rol y nombre accesible).
function Probe(): ReactNode {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <p>{`theme: ${theme}`}</p>
      <button type="button" onClick={toggleTheme}>
        toggle theme
      </button>
    </div>
  );
}

// Simula el estado que deja el script anti-flash: `data-theme` resuelto en
// <html> antes de montar el provider.
function renderProbe(initialTheme: Theme): void {
  document.documentElement.dataset.theme = initialTheme;
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );
}

describe("ThemeProvider", () => {
  it("takes the initial theme from data-theme without recomputing", () => {
    // data-theme="dark" sin preferencia guardada y con el mock de matchMedia
    // en matches=false: si el provider recalculera (storage → sistema →
    // light) terminaría en "light". Debe tomar el valor ya resuelto (theming.md).
    document.documentElement.dataset.theme = "dark";
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    expect(screen.getByText("theme: dark")).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("toggleTheme alternates data-theme and persists cv:theme", async () => {
    const user = userEvent.setup();
    renderProbe("light");

    await user.click(screen.getByRole("button", { name: "toggle theme" }));
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(localStorage.getItem("cv:theme")).toBe("dark");

    await user.click(screen.getByRole("button", { name: "toggle theme" }));
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(localStorage.getItem("cv:theme")).toBe("light");
  });

  it("changes the theme in memory when localStorage throws", async () => {
    // RF-5: modo privado / storage bloqueado. El spy lanza en setItem y el
    // provider sigue: el estado y data-theme cambian, sin error hacia afuera.
    const user = userEvent.setup();
    renderProbe("light");

    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("storage blocked");
      });

    let clickError: unknown;
    try {
      await user.click(screen.getByRole("button", { name: "toggle theme" }));
    } catch (error) {
      clickError = error;
    } finally {
      setItemSpy.mockRestore();
    }

    expect(clickError).toBeUndefined();
    expect(screen.getByText("theme: dark")).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("follows prefers-color-scheme changes while no preference is saved", () => {
    // RF-3: el listener de matchMedia aplica el nuevo tema en vivo.
    renderProbe("light");

    act(() => {
      simulateMediaChange(DARK_QUERY, true);
    });

    expect(screen.getByText("theme: dark")).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    // Seguir al sistema no es una elección del usuario: no persiste (theming.md).
    expect(localStorage.getItem("cv:theme")).toBeNull();
  });

  it("ignores system changes once a preference is saved", () => {
    // RF-3 (contracara): con cv:theme guardado, el cambio de sistema se ignora.
    localStorage.setItem("cv:theme", "light");
    renderProbe("light");

    act(() => {
      simulateMediaChange(DARK_QUERY, true);
    });

    expect(screen.getByText("theme: light")).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });

  it("keeps <meta theme-color> on the spied --color-bg after toggleTheme and after a system change", async () => {
    // RF-4, con la salvedad del plan ("T5 RF-4 en jsdom"): getComputedStyle
    // no resuelve variables de tokens.css, así que se spía para devolver un
    // valor controlado según el data-theme vigente; sin spy, el test solo
    // afirmaría "" y no verificaría nada.
    const user = userEvent.setup();
    const meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    meta.setAttribute("content", "stale");
    document.head.append(meta);

    const computedSpy = vi
      .spyOn(window, "getComputedStyle")
      .mockImplementation(
        (): CSSStyleDeclaration =>
          ({
            getPropertyValue: (property: string): string =>
              property === "--color-bg"
                ? document.documentElement.dataset.theme === "dark"
                  ? "bg-dark-token"
                  : "bg-light-token"
                : "",
          }) as CSSStyleDeclaration,
      );

    try {
      // Vía 1: toggleTheme.
      renderProbe("light");
      expect(meta).toHaveAttribute("content", "bg-light-token");

      await user.click(screen.getByRole("button", { name: "toggle theme" }));
      expect(meta).toHaveAttribute("content", "bg-dark-token");

      // Vía 2: cambio de sistema sin preferencia guardada (remontamos con
      // storage limpio: tras el toggle de la vía 1 existiría preferencia).
      cleanup();
      localStorage.clear();
      meta.setAttribute("content", "stale");
      renderProbe("light");
      expect(meta).toHaveAttribute("content", "bg-light-token");

      act(() => {
        simulateMediaChange(DARK_QUERY, true);
      });
      expect(meta).toHaveAttribute("content", "bg-dark-token");
    } finally {
      computedSpy.mockRestore();
      meta.remove();
    }
  });

  it("throws a descriptive error when useTheme is used outside the provider", () => {
    // Estados de la spec: "useTheme fuera de su provider lanza error descriptivo".
    // Spy de console.error: React registra el error no capturado del render;
    // el assert lo hace toThrowError.
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    try {
      function Orphan(): null {
        useTheme();
        return null;
      }
      expect(() => render(<Orphan />)).toThrowError(/useTheme.*ThemeProvider/);
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
