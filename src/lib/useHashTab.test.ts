import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, renderHook } from "@testing-library/react";

import { useHashTab } from "./useHashTab";

const IDS = ["about", "resume"] as const;
const DEFAULT_ID = "about";

function setHash(hash: string): void {
  const { pathname, search } = window.location;
  const url = hash ? `${pathname}${search}${hash}` : `${pathname}${search}`;
  window.history.replaceState(null, "", url);
}

describe("useHashTab initial state from location.hash", () => {
  it("returns defaultId when there is no hash", () => {
    setHash("");
    const { result } = renderHook(() => useHashTab(IDS, DEFAULT_ID));
    expect(result.current[0]).toBe(DEFAULT_ID);
  });

  it("returns 'resume' when the URL has #resume before mount", () => {
    setHash("#resume");
    const { result } = renderHook(() => useHashTab(IDS, DEFAULT_ID));
    expect(result.current[0]).toBe("resume");
  });

  it("returns defaultId for an invalid hash and does not rewrite the URL", () => {
    setHash("#foo");
    const replaceState = vi.spyOn(window.history, "replaceState");
    const { result } = renderHook(() => useHashTab(IDS, DEFAULT_ID));
    expect(result.current[0]).toBe(DEFAULT_ID);
    expect(replaceState).not.toHaveBeenCalled();
    replaceState.mockRestore();
  });
});

describe("useHashTab setActiveId", () => {
  afterEach(() => {
    // Safety net: a test that fails before its mockRestore() must not leave a
    // spy installed for the next one.
    vi.restoreAllMocks();
    // The global afterEach only clears the hash, not the pathname.
    window.history.replaceState(null, "", "/");
  });

  it("setActiveId('resume') sets the state and calls replaceState with a URL ending in #resume, never pushState", () => {
    setHash("");
    const replaceState = vi.spyOn(window.history, "replaceState");
    const pushState = vi.spyOn(window.history, "pushState");
    const { result } = renderHook(() => useHashTab(IDS, DEFAULT_ID));
    act(() => {
      result.current[1]("resume");
    });
    expect(result.current[0]).toBe("resume");
    expect(replaceState).toHaveBeenCalledTimes(1);
    const calls = replaceState.mock.calls;
    expect(calls[0]?.[2] ?? "").toMatch(/#resume$/);
    expect(pushState).not.toHaveBeenCalled();
    replaceState.mockRestore();
    pushState.mockRestore();
  });

  it("setActiveId with the already active id does not call replaceState", () => {
    setHash("#about");
    const { result } = renderHook(() => useHashTab(IDS, DEFAULT_ID));
    // Created after mounting and setHash, so it only counts the hook's own calls.
    const replaceState = vi.spyOn(window.history, "replaceState");
    act(() => {
      result.current[1]("about");
    });
    expect(result.current[0]).toBe("about");
    expect(replaceState).not.toHaveBeenCalled();
    replaceState.mockRestore();
  });

  it("setActiveId preserves pathname and search, changing only the hash", () => {
    window.history.replaceState(null, "", "/cv/2026?lang=es#about");
    const pathname = window.location.pathname;
    const search = window.location.search;
    const replaceState = vi.spyOn(window.history, "replaceState");
    const { result } = renderHook(() => useHashTab(IDS, DEFAULT_ID));
    act(() => {
      result.current[1]("resume");
    });
    expect(replaceState).toHaveBeenCalledTimes(1);
    expect(window.location.pathname).toBe(pathname);
    expect(window.location.search).toBe(search);
    expect(window.location.hash).toBe("#resume");
    replaceState.mockRestore();
  });
});

describe("useHashTab hashchange listener", () => {
  afterEach(() => {
    // Same safety net as above.
    vi.restoreAllMocks();
  });

  it("updates the active tab on hashchange with a valid hash", () => {
    setHash("");
    const { result } = renderHook(() => useHashTab(IDS, DEFAULT_ID));
    expect(result.current[0]).toBe("about");
    act(() => {
      setHash("#resume");
      fireEvent(window, new HashChangeEvent("hashchange"));
    });
    expect(result.current[0]).toBe("resume");
  });

  it("keeps the previous value on hashchange with an invalid hash", () => {
    setHash("");
    const { result } = renderHook(() => useHashTab(IDS, DEFAULT_ID));
    act(() => {
      setHash("#resume");
      fireEvent(window, new HashChangeEvent("hashchange"));
    });
    expect(result.current[0]).toBe("resume");
    act(() => {
      setHash("#foo");
      fireEvent(window, new HashChangeEvent("hashchange"));
    });
    expect(result.current[0]).toBe("resume");
  });

  it("registers hashchange on mount, removes the same handler on unmount and stops updating after unmount", () => {
    setHash("");
    const addEventListener = vi.spyOn(window, "addEventListener");
    const removeEventListener = vi.spyOn(window, "removeEventListener");
    const { result, unmount } = renderHook(() => useHashTab(IDS, DEFAULT_ID));

    // The captured reference is what proves that add and remove use the same
    // handler.
    const registration = addEventListener.mock.calls.find(
      (call) => call[0] === "hashchange",
    );
    expect(registration).toBeDefined();
    const handler = registration?.[1] ?? null;
    expect(handler).not.toBeNull();

    unmount();
    expect(removeEventListener).toHaveBeenCalledWith("hashchange", handler);

    act(() => {
      setHash("#resume");
      fireEvent(window, new HashChangeEvent("hashchange"));
    });
    expect(result.current[0]).toBe("about");
    addEventListener.mockRestore();
    removeEventListener.mockRestore();
  });
});
