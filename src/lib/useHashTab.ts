// Hook que sincroniza el tab activo con el hash de la URL
// (specs/hooks/useHashTab/spec.md). Lo usa AppLayout; NavTabs no lo conoce.
//
// T1: estado inicial desde location.hash (RF-1). El comportamiento completo de
// setActiveId (RF-2) y el listener de hashchange (RF-3/RF-4) llegan en T2/T3.

import { useCallback, useState } from "react";

/**
 * Helper puro de módulo, NO exportado (plan): quita el `#` y devuelve el id de
 * `ids` que coincide con el hash, o `defaultId` si no coincide.
 */
function parseHash<T extends string>(
  rawHash: string,
  ids: readonly T[],
  defaultId: T,
): T {
  const candidate = rawHash.startsWith("#") ? rawHash.slice(1) : rawHash;
  // Sin casts: `find` devuelve `T | undefined` y `??` cierra en `T`
  // (precondición del llamador: defaultId ∈ ids).
  return ids.find((id) => id === candidate) ?? defaultId;
}

/**
 * Devuelve el tab activo y su setter. `ids` debe ser constante para el
 * consumidor (precondición de la API: p. ej. `["about", "resume"] as const`).
 */
export function useHashTab<T extends string>(
  ids: readonly T[],
  defaultId: T,
): [activeId: T, setActiveId: (id: T) => void] {
  // RF-6: location.hash se lee solo acá, en el initializer lazy de useState
  // (montaje), nunca en cada render.
  const [activeId, setActive] = useState<T>(() =>
    parseHash(window.location.hash, ids, defaultId),
  );

  // Mínimo para T1: solo actualiza el estado. En T2 se agrega el corte por id
  // ya activo y el history.replaceState (RF-2).
  const setActiveId = useCallback((id: T): void => {
    setActive(id);
  }, []);

  return [activeId, setActiveId];
}
