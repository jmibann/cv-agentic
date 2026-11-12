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

/* ------------------------------------------------------------------ *
 * T16 — RF-9: supresión de transiciones al cambiar de tema
 * (Cambio motion #106). Casos (a)–(e) de tasks.md → T16.
 * ------------------------------------------------------------------ */

// Stub explícito de frames: `requestAnimationFrame`/`cancelAnimationFrame`
// falsos que solo avanzan con `step()`. El doble rAF del provider se
// convierte así en dos frames deterministas (spec → Tests esperados:
// "mock requestAnimationFrame/timers"). Sin stub, los frames reales de
// jsdom correrían con timers fuera de los asserts y la supresión no sería
// observable a tiempo.
interface FramesStub {
  step: () => void;
  scheduledCount: () => number;
  cancelled: number[];
  restore: () => void;
}

function createFrames(): FramesStub {
  let queue: number[] = [];
  let scheduled = 0;
  let nextId = 1;
  const callbacks = new Map<number, FrameRequestCallback>();
  const cancelled: number[] = [];

  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback): number => {
    const id = nextId;
    nextId += 1;
    scheduled += 1;
    callbacks.set(id, cb);
    queue.push(id);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number): void => {
    cancelled.push(id);
    callbacks.delete(id);
  });

  return {
    // Un frame corre SOLO los callbacks pendientes al empezar: los que se
    // agenden durante el callback esperan al siguiente (semántica real de
    // rAF, necesaria para que "dos frames" signifiquen dos `step()`).
    step(): void {
      const running = queue;
      queue = [];
      for (const id of running) {
        const cb = callbacks.get(id);
        callbacks.delete(id);
        if (cb !== undefined) {
          cb(0); // timestamp del frame: el provider nunca lo lee
        }
      }
    },
    scheduledCount: (): number => scheduled,
    cancelled,
    restore: (): void => {
      vi.unstubAllGlobals();
    },
  };
}

// Orden de escritura de atributos en <html>. Es la única forma de observar
// bajo jsdom que `data-theme-switching` se agrega ANTES de `data-theme`:
// ambas escrituras caen en el mismo commit síncrono del useLayoutEffect.
function observeHtmlAttributes(): {
  names: string[];
  flush: () => Promise<void>;
  stop: () => void;
} {
  const names: string[] = [];
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.attributeName !== null) {
        names.push(record.attributeName);
      }
    }
  });
  observer.observe(document.documentElement, { attributes: true });
  return {
    names,
    // MutationObserver entrega sus registros en microtasks: los awaits las
    // drenan antes del assert.
    flush: async (): Promise<void> => {
      await Promise.resolve();
      await Promise.resolve();
    },
    stop: (): void => {
      observer.disconnect();
    },
  };
}

describe("ThemeProvider suppresses transitions while switching themes (RF-9)", () => {
  // Caso (a): toggleTheme — atributo presente antes del nuevo data-theme y
  // removido tras dos frames.
  it("adds data-theme-switching before the new data-theme on toggleTheme and clears it after two frames", async () => {
    const user = userEvent.setup();
    renderProbe("light");
    const frames = createFrames();
    const mutations = observeHtmlAttributes();

    try {
      await user.click(screen.getByRole("button", { name: "toggle theme" }));
      await mutations.flush();

      // El orden grabado es el de escritura en <html>: supresión primero.
      expect(mutations.names.slice(0, 2)).toEqual([
        "data-theme-switching",
        "data-theme",
      ]);
      expect(document.documentElement).toHaveAttribute("data-theme", "dark");
      expect(document.documentElement).toHaveAttribute("data-theme-switching");

      frames.step();
      expect(document.documentElement).toHaveAttribute("data-theme-switching");

      frames.step();
      expect(document.documentElement).not.toHaveAttribute("data-theme-switching");
    } finally {
      mutations.stop();
      frames.restore();
    }
  });

  // Caso (b): la misma supresión por la vía del sistema sin preferencia
  // guardada (RF-9 cubre RF-3 además del toggle).
  it("applies the same suppression on a system change with no saved preference", async () => {
    renderProbe("light");
    const frames = createFrames();
    const mutations = observeHtmlAttributes();

    try {
      act(() => {
        simulateMediaChange(DARK_QUERY, true);
      });
      await mutations.flush();

      expect(mutations.names.slice(0, 2)).toEqual([
        "data-theme-switching",
        "data-theme",
      ]);
      expect(document.documentElement).toHaveAttribute("data-theme", "dark");
      // Seguir al sistema no persiste (contrato RF-3, intacto).
      expect(localStorage.getItem("cv:theme")).toBeNull();

      frames.step();
      frames.step();
      expect(document.documentElement).not.toHaveAttribute("data-theme-switching");
    } finally {
      mutations.stop();
      frames.restore();
    }
  });

  // Caso (c): desmontar el provider limpia el atributo (cleanup
  // incondicional con cancelAnimationFrame).
  it("clears data-theme-switching when the provider unmounts before the frames run", async () => {
    const user = userEvent.setup();
    renderProbe("light");
    const frames = createFrames();

    try {
      await user.click(screen.getByRole("button", { name: "toggle theme" }));
      expect(document.documentElement).toHaveAttribute("data-theme-switching");

      cleanup(); // desmonte con el primer frame aún pendiente
      expect(document.documentElement).not.toHaveAttribute("data-theme-switching");
      // El cleanup canceló el rAF pendiente: ningún callback queda vivo.
      expect(frames.cancelled).toHaveLength(1);

      frames.step();
      frames.step();
      expect(document.documentElement).not.toHaveAttribute("data-theme-switching");
    } finally {
      frames.restore();
    }
  });

  // Caso (d): un segundo cambio rápido reinicia la supresión sin dejar
  // atributo huérfano (la re-entrada del efecto cancela y vuelve a aplicar).
  it("restarts the suppression on a second rapid change without leaving the attribute orphaned", async () => {
    const user = userEvent.setup();
    renderProbe("light");
    const frames = createFrames();

    try {
      await user.click(screen.getByRole("button", { name: "toggle theme" }));
      frames.step(); // corre el primer frame del cambio 1: queda pendiente el segundo
      expect(document.documentElement).toHaveAttribute("data-theme-switching");

      await user.click(screen.getByRole("button", { name: "toggle theme" }));
      // Re-entrada: cleanup del cambio 1 (cancela el frame pendiente + remueve)
      // y el efecto del cambio 2 vuelve a poner la supresión.
      expect(frames.cancelled).toHaveLength(1);
      expect(document.documentElement).toHaveAttribute("data-theme", "light");
      expect(document.documentElement).toHaveAttribute("data-theme-switching");

      frames.step();
      expect(document.documentElement).toHaveAttribute("data-theme-switching");
      frames.step();
      expect(document.documentElement).not.toHaveAttribute("data-theme-switching");

      frames.step(); // sin callbacks restantes: nada que huérfano
      expect(document.documentElement).not.toHaveAttribute("data-theme-switching");
    } finally {
      frames.restore();
    }
  });

  // Caso (e): el montaje inicial NO aplica el atributo ni gasta frames
  // (ref de primer montaje; la supresión es solo de cambios interactivos).
  it("does not apply data-theme-switching on the initial mount", () => {
    const frames = createFrames();

    try {
      renderProbe("light");
      expect(document.documentElement).not.toHaveAttribute("data-theme-switching");
      expect(frames.scheduledCount()).toBe(0);
    } finally {
      frames.restore();
    }
  });
});
