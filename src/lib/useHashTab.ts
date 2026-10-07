// Hook que sincroniza el tab activo con el hash de la URL
// (specs/hooks/useHashTab/spec.md). Lo usa AppLayout; NavTabs no lo conoce.
//
// T1: estado inicial desde location.hash (RF-1). T2: setActiveId con
// replaceState (RF-2). T3: listener de hashchange con cleanup estable
// (RF-3/RF-4).

import { useCallback, useEffect, useRef, useState } from "react";

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

  // Espejo del state (plan, sin effect extra): permite el corte "id ya activo"
  // fuera del updater de setActive, para no producir efectos dentro de él.
  const activeRef = useRef(activeId);

  // RF-2: actualiza el estado y llama history.replaceState (nunca pushState)
  // con una URL relativa "#" + id, que conserva pathname y search gratis.
  // (El handler de hashchange de abajo mantiene activeRef al día.)
  const setActiveId = useCallback(
    (id: T): void => {
      if (id === activeRef.current) {
        // Id ya activo: ni estado ni replaceState (comportamiento tabla spec).
        return;
      }
      activeRef.current = id;
      setActive(id);
      window.history.replaceState(null, "", "#" + id);
    },
    [],
  );

  // RF-3/RF-4: listener de hashchange. `location.hash` se lee solo acá dentro
  // (en el evento) y en el initializer de arriba (RF-6). Deps [ids]: constante
  // del consumidor (precondición de la API).
  useEffect(() => {
    const handleHashChange = (): void => {
      // Sin casts: `find` devuelve `T | undefined` (plan).
      const next = ids.find((id) => id === window.location.hash.slice(1));
      if (next === undefined) {
        // RF-3: hash inválido → no hace nada, mantiene el tab actual.
        return;
      }
      // activeRef al día: sin esto, el corte "id ya activo" de RF-2 se
      // desincronizaría tras un hashchange válido (setActiveId del nuevo id
      // llamaría replaceState de más). El plan descarta un effect espejo del
      // state, así que la ref se actualiza acá, junto a setActive.
      activeRef.current = next;
      setActive(next);
    };
    // El handler se captura una vez por efecto: el cleanup lo recibe por
    // closures y llama a removeEventListener con LA MISMA referencia (RF-4;
    // alternativa descartada en el plan: AbortController, que no hace
    // observable el removeEventListener que pide la spec).
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [ids]);

  return [activeId, setActiveId];
}
