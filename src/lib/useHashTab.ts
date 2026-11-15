import { useCallback, useEffect, useRef, useState } from "react";

function parseHash<T extends string>(
  rawHash: string,
  ids: readonly T[],
  defaultId: T,
): T {
  const candidate = rawHash.startsWith("#") ? rawHash.slice(1) : rawHash;
  return ids.find((id) => id === candidate) ?? defaultId;
}

/** `ids` must be a stable constant, e.g. `["about", "resume"] as const`. */
export function useHashTab<T extends string>(
  ids: readonly T[],
  defaultId: T,
): [activeId: T, setActiveId: (id: T) => void] {
  // location.hash is read only here and in the hashchange handler, never on
  // every render.
  const [activeId, setActive] = useState<T>(() =>
    parseHash(window.location.hash, ids, defaultId),
  );

  // Mirror of the state, so the "already active" check can run outside the
  // setActive updater, which must stay free of side effects.
  const activeRef = useRef(activeId);

  // replaceState keeps tab changes out of the browser history; the relative
  // "#id" URL preserves pathname and search.
  const setActiveId = useCallback(
    (id: T): void => {
      if (id === activeRef.current) {
        return;
      }
      activeRef.current = id;
      setActive(id);
      window.history.replaceState(null, "", "#" + id);
    },
    [],
  );

  useEffect(() => {
    const handleHashChange = (): void => {
      const next = ids.find((id) => id === window.location.hash.slice(1));
      if (next === undefined) {
        // Unknown hash: keep the current tab.
        return;
      }
      // Keep the ref in sync here too; otherwise the "already active" check would
      // be stale after a valid hashchange.
      activeRef.current = next;
      setActive(next);
    };
    // The same function reference is used to add and remove the listener.
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [ids]);

  return [activeId, setActiveId];
}
