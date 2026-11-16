# Plan — useHashTab

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/lib/useHashTab.ts` | hook `useHashTab<T extends string>(ids, defaultId)` + a module helper that is NOT exported, `parseHash(raw, ids, defaultId)` (pure, no DOM: strips `#`, `ids.find(x => x === raw) ?? defaultId`) | RF-1..RF-4 |
| `src/lib/useHashTab.test.ts` | tests 1–9 of the spec with Testing Library's `renderHook`; control of `window.location.hash` and spies on `history.replaceState` / `addEventListener` / `removeEventListener` | all |

There is no `index.ts` for `src/lib` (it is imported by path, like `format.ts`).

## Pure functions and algorithm

- `parseHash(location.hash, ids, defaultId)`: read only on mount (lazy initial
  state of `useState(() => parseHash(...))`) and inside the `hashchange` handler.
  It covers RF-1 and the "do not read on every render" of RF-6 (inspection).
- `hashchange` handler: `const next = ids.find((x) => x === location.hash.slice(1))`;
  if `undefined` → it does nothing (keeps the current tab, RF-3 second clause);
  otherwise → `setActive(next)`. No casts: `find` returns `T | undefined`.
- `setActiveId` (`useCallback`): it compares against an `activeRef.current` (a ref
  mirroring the state, with no extra effect); if `id` is already the active one → return with no
  state change or `replaceState` (RF-2). Otherwise: `setActive(id)` +
  `history.replaceState(null, "", "#" + id)` — the relative URL preserves
  `pathname` and `search` (RF-2, test 9; discarded alternative: rebuilding
  `location.pathname + location.search + "#" + id`, more surface for reading
  `location` outside the moment RF-6 allows).
- Listener effect: it mounts `window.addEventListener("hashchange", handler)` and
  cleans up with `removeEventListener` using **the same** handler **reference**
  (the discriminator of test 8 with a spy; discarded alternative:
  `AbortController`, which does not make observable the `removeEventListener` the
  spec asks for). Deps `[ids]` — a constant of the consumer (API precondition).

## Interface

`useHashTab(ids, defaultId): [activeId, setActiveId]` exactly as in spec → API.
The setter's type is `(id: T) => void`; the boundary with NavTabs (`string`) is
resolved by AppLayout with its guard, not by this hook.

## Decisions

- **No runtime check of `defaultId ∈ ids` or of the format of `ids`**: caller's
  preconditions (spec → API; U3/U4 of the F4 Clarification). No validation is added.
- **`replaceState` with a relative hash** `"#" + id`: it does not fire `hashchange`
  (no loop, the spec's decision) and preserves pathname/search for free.
- **No scroll or focus** (RF-6): the hook does not touch `scrollIntoView`/`focus()`;
  verification by the reviewer's inspection (no jsdom test).
- **RF-5 generates no test here**: AppLayout test 9 + inspection verify it.

## Test strategy

`renderHook` + `window.history.replaceState(null, "", "#resume")` (or
`Object.defineProperty` on `location.hash` if the F1 setup requires it) for
the initial state; `vi.spyOn(window.history, "replaceState")`; `vi.spyOn(window,
"addEventListener")` / `"removeEventListener")`; `fireEvent(window,
new HashChangeEvent("hashchange"))` for RF-3. Tests 1–9 literal from the spec;
test 4 also a spy on `pushState` → not called. Each task: `test(useHashTab): Tn`
in red → `feat(useHashTab): Tn`.

Coverage: T1→RF-1 · T2→RF-2 · T3→RF-3, RF-4. (RF-5: precondition + AppLayout
test 9; RF-6: inspection — no task or test here, as the spec sets.)
