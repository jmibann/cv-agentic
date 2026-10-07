// Tests 1–3 de specs/hooks/useHashTab/spec.md (T1, RF-1): estado inicial del
// tab a partir de location.hash en el momento del montaje.
//
// Control del hash: se fija con el `history.replaceState` real ANTES de crear
// el spy, de modo que el spy de `replaceState` (test 3) mida solo las llamadas
// del hook. El afterEach global de src/test/setup.ts ya limpia el hash entre
// tests; `setHash` lo deja determinista dentro del archivo.

import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useHashTab } from "./useHashTab";

const IDS = ["about", "resume"] as const;
const DEFAULT_ID = "about";

/** Fija el hash de la URL ("" lo quita) conservando pathname y search. */
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
    // RF-1: hash inválido → defaultId sin reescribir la URL.
    expect(replaceState).not.toHaveBeenCalled();
    replaceState.mockRestore();
  });
});

// Tests 4, 5 y 9 de la spec (T2, RF-2): setActiveId actualiza el estado con
// history.replaceState (nunca pushState), no hace nada si el id ya es el
// activo y conserva pathname y search de la URL.
describe("useHashTab setActiveId", () => {
  afterEach(() => {
    // Red de seguridad: si un test falla antes de sus mockRestore(), el spy
    // no puede quedar instalado y contaminar las llamadas del test siguiente.
    vi.restoreAllMocks();
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
    // Tercer argumento de replaceState: la URL terminada en #resume (puede ser
    // la relativa "#" + id del plan; ambas resuelven a #resume).
    expect(calls[0]?.[2] ?? "").toMatch(/#resume$/);
    expect(pushState).not.toHaveBeenCalled();
    replaceState.mockRestore();
    pushState.mockRestore();
  });

  it("setActiveId with the already active id does not call replaceState", () => {
    setHash("#about");
    const { result } = renderHook(() => useHashTab(IDS, DEFAULT_ID));
    // Spy creado después del montaje y de setHash: mide solo llamadas del hook.
    const replaceState = vi.spyOn(window.history, "replaceState");
    act(() => {
      result.current[1]("about");
    });
    expect(result.current[0]).toBe("about");
    // RF-2: id ya activo → ni estado ni replaceState.
    expect(replaceState).not.toHaveBeenCalled();
    replaceState.mockRestore();
  });

  it("setActiveId preserves pathname and search, changing only the hash", () => {
    // URL base con pathname y search no vacíos (replaceState real, antes del
    // spy, para que el spy mida solo las llamadas del hook).
    window.history.replaceState(null, "", "/cv/2026?lang=es#about");
    const pathname = window.location.pathname;
    const search = window.location.search;
    const replaceState = vi.spyOn(window.history, "replaceState");
    const { result } = renderHook(() => useHashTab(IDS, DEFAULT_ID));
    act(() => {
      result.current[1]("resume");
    });
    expect(replaceState).toHaveBeenCalledTimes(1);
    // El spy ejecuta la implementación real: la URL resultante debe conservar
    // pathname y search y cambiar solo el hash (RF-2, test 9 de la spec).
    expect(window.location.pathname).toBe(pathname);
    expect(window.location.search).toBe(search);
    expect(window.location.hash).toBe("#resume");
    replaceState.mockRestore();
    // Devuelve la URL base: el afterEach global solo limpia el hash, no el
    // pathname, y setHash() (T1) usa el pathname vigente.
    window.history.replaceState(null, "", "/");
  });
});
