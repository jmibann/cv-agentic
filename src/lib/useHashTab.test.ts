// Tests 1–3 de specs/hooks/useHashTab/spec.md (T1, RF-1): estado inicial del
// tab a partir de location.hash en el momento del montaje.
//
// Control del hash: se fija con el `history.replaceState` real ANTES de crear
// el spy, de modo que el spy de `replaceState` (test 3) mida solo las llamadas
// del hook. El afterEach global de src/test/setup.ts ya limpia el hash entre
// tests; `setHash` lo deja determinista dentro del archivo.

import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

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
