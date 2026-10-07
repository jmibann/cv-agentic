# Plan — useHashTab

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/lib/useHashTab.ts` | hook `useHashTab<T extends string>(ids, defaultId)` + helper de módulo NO exportado `parseHash(raw, ids, defaultId)` (puro, sin DOM: quita `#`, `ids.find(x => x === raw) ?? defaultId`) | RF-1..RF-4 |
| `src/lib/useHashTab.test.ts` | tests 1–9 de la spec con `renderHook` de Testing Library; control de `window.location.hash` y spies de `history.replaceState` / `addEventListener` / `removeEventListener` | todas |

No hay `index.ts` de `src/lib` (se importa por ruta, como `format.ts`).

## Funciones puras y algoritmo

- `parseHash(location.hash, ids, defaultId)`: lectura solo al montar (lazy initial
  state de `useState(() => parseHash(...))`) y dentro del handler de `hashchange`.
  Cubre RF-1 y el "no leer en cada render" de RF-6 (inspección).
- Handler `hashchange`: `const next = ids.find((x) => x === location.hash.slice(1))`;
  si `undefined` → no hace nada (mantiene el tab actual, RF-3 segunda cláusula);
  si no → `setActive(next)`. Sin casts: `find` devuelve `T | undefined`.
- `setActiveId` (`useCallback`): compara contra un `activeRef.current` (ref
  espejo del state, sin effect extra); si `id` ya es el activo → return sin
  estado ni `replaceState` (RF-2). Si no: `setActive(id)` +
  `history.replaceState(null, "", "#" + id)` — la URL relativa preserva
  `pathname` y `search` (RF-2, test 9; alternativa descartada: reconstruir
  `location.pathname + location.search + "#" + id`, más superficie para leer
  `location` fuera del momento permitido por RF-6).
- Effect de listener: monta `window.addEventListener("hashchange", handler)` y
  cleanup `removeEventListener` con **la misma referencia** de handler
  (discriminante del test 8 con spy; alternativa descartada:
  `AbortController`, que no hace observable el `removeEventListener` pedido en
  la spec). Deps `[ids]` — constante del consumidor (precondición de API).

## Interfaz

`useHashTab(ids, defaultId): [activeId, setActiveId]` exactamente como spec → API.
El tipo del setter es `(id: T) => void`; la frontera con NavTabs (`string`) la
resuelve AppLayout con su guard, no este hook.

## Decisiones

- **Sin runtime check de `defaultId ∈ ids` ni de formato de `ids`**: precondiciones
  del llamador (spec → API; U3/U4 de la Clarificación F4). No se agrega validación.
- **`replaceState` con hash relativo** `"#" + id`: no dispara `hashchange`
  (no hay bucle, decisión de la spec) y preserva pathname/search gratis.
- **Sin scroll ni foco** (RF-6): el hook no toca `scrollIntoView`/`focus()`;
  verificación por inspección del reviewer (sin test jsdom).
- **RF-5 no genera test acá**: la verifican AppLayout test 9 + inspección.

## Estrategia de tests

`renderHook` + `window.history.replaceState(null, "", "#resume")` (o
`Object.defineProperty` sobre `location.hash` si el setup F1 lo exige) para
estado inicial; `vi.spyOn(window.history, "replaceState")`; `vi.spyOn(window,
"addEventListener")` / `"removeEventListener")`; `fireEvent(window,
new HashChangeEvent("hashchange"))` para RF-3. Tests 1–9 literales de la spec;
test 4 además spy de `pushState` → no llamado. Cada tarea: `test(useHashTab): Tn`
en rojo → `feat(useHashTab): Tn`.

Cobertura: T1→RF-1 · T2→RF-2 · T3→RF-3, RF-4. (RF-5: precondición + AppLayout
test 9; RF-6: inspección — sin tarea ni test acá, como fija la spec.)
