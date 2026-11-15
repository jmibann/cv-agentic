import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

// Same module instance that setupFiles registers, so simulateMediaChange finds
// the MediaQueryList the provider created.
import { simulateMediaChange } from "../test/setup";
import { ThemeProvider, useTheme, type Theme } from "./ThemeProvider";

const DARK_QUERY = "(prefers-color-scheme: dark)";

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

// Simulates what the anti-flash script leaves: data-theme already on <html>.
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
    // With no stored preference and matchMedia not matching, a provider that
    // recalculated the theme would end in "light".
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
    renderProbe("light");

    act(() => {
      simulateMediaChange(DARK_QUERY, true);
    });

    expect(screen.getByText("theme: dark")).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    // Following the system is not a user choice, so it is not persisted.
    expect(localStorage.getItem("cv:theme")).toBeNull();
  });

  it("ignores system changes once a preference is saved", () => {
    localStorage.setItem("cv:theme", "light");
    renderProbe("light");

    act(() => {
      simulateMediaChange(DARK_QUERY, true);
    });

    expect(screen.getByText("theme: light")).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });

  it("keeps <meta theme-color> on the spied --color-bg after toggleTheme and after a system change", async () => {
    // jsdom's getComputedStyle does not resolve the tokens' custom properties, so
    // it is spied to return a controlled value; otherwise the test would only
    // assert an empty string.
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
      renderProbe("light");
      expect(meta).toHaveAttribute("content", "bg-light-token");

      await user.click(screen.getByRole("button", { name: "toggle theme" }));
      expect(meta).toHaveAttribute("content", "bg-dark-token");

      // Remounted with clean storage: after the toggle above a preference exists.
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
    // React logs the uncaught render error; the spy keeps the output clean.
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

// Fake requestAnimationFrame that only advances with step(), which makes the
// provider's two frames deterministic.
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
    // A frame runs only the callbacks pending when it starts, as real rAF does;
    // that is what makes "two frames" mean two step() calls.
    step(): void {
      const running = queue;
      queue = [];
      for (const id of running) {
        const cb = callbacks.get(id);
        callbacks.delete(id);
        if (cb !== undefined) {
          cb(0);
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

// Records the order of attribute writes on <html>. It is the only way under
// jsdom to see that the switching attribute is added before data-theme, since
// both happen in the same synchronous commit.
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
    // MutationObserver delivers its records in microtasks; the awaits drain them.
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
  it("adds data-theme-switching before the new data-theme on toggleTheme and clears it after two frames", async () => {
    const user = userEvent.setup();
    renderProbe("light");
    const frames = createFrames();
    const mutations = observeHtmlAttributes();

    try {
      await user.click(screen.getByRole("button", { name: "toggle theme" }));
      await mutations.flush();

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
      expect(localStorage.getItem("cv:theme")).toBeNull();

      frames.step();
      frames.step();
      expect(document.documentElement).not.toHaveAttribute("data-theme-switching");
    } finally {
      mutations.stop();
      frames.restore();
    }
  });

  it("clears data-theme-switching when the provider unmounts before the frames run", async () => {
    const user = userEvent.setup();
    renderProbe("light");
    const frames = createFrames();

    try {
      await user.click(screen.getByRole("button", { name: "toggle theme" }));
      expect(document.documentElement).toHaveAttribute("data-theme-switching");

      cleanup();
      expect(document.documentElement).not.toHaveAttribute("data-theme-switching");
      expect(frames.cancelled).toHaveLength(1);

      frames.step();
      frames.step();
      expect(document.documentElement).not.toHaveAttribute("data-theme-switching");
    } finally {
      frames.restore();
    }
  });

  it("restarts the suppression on a second rapid change without leaving the attribute orphaned", async () => {
    const user = userEvent.setup();
    renderProbe("light");
    const frames = createFrames();

    try {
      await user.click(screen.getByRole("button", { name: "toggle theme" }));
      frames.step();
      expect(document.documentElement).toHaveAttribute("data-theme-switching");

      await user.click(screen.getByRole("button", { name: "toggle theme" }));
      expect(frames.cancelled).toHaveLength(1);
      expect(document.documentElement).toHaveAttribute("data-theme", "light");
      expect(document.documentElement).toHaveAttribute("data-theme-switching");

      frames.step();
      expect(document.documentElement).toHaveAttribute("data-theme-switching");
      frames.step();
      expect(document.documentElement).not.toHaveAttribute("data-theme-switching");

      frames.step();
      expect(document.documentElement).not.toHaveAttribute("data-theme-switching");
    } finally {
      frames.restore();
    }
  });

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
