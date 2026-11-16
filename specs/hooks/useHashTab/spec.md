# useHashTab
Status: implemented

## Purpose

It syncs the active tab of `NavTabs` with the URL hash (`#about`,
`#resume`), so that a direct link to a panel can be shared. It lives in the
app (`src/lib/useHashTab.ts`) and **AppLayout** uses it; NavTabs does not know it
(NavTabs is controlled: it receives `activeId` and emits `onChange`).

## Requirements (EARS)

- RF-1: WHEN the URL hash is one of `ids`, THEN THE SYSTEM returns that id as the active tab; IF there is no hash or the hash is invalid, it returns `defaultId` without rewriting the URL.
- RF-2: WHEN the consumer calls `setActiveId(id)`, THEN THE SYSTEM updates the state and calls `history.replaceState` (never `pushState`) with the new hash, preserving `pathname` and `search`; IF `id` is already the active one, it does nothing.
- RF-3: WHEN `hashchange` happens with a valid hash, THEN THE SYSTEM updates the active tab; IF the hash is invalid, it ignores it and keeps the current tab.
- RF-4: WHEN the hook unmounts, THEN THE SYSTEM removes the `hashchange` listener.
- RF-5: THE SYSTEM takes as a precondition of the consumer that no DOM element has an `id` equal to a value of `ids`: the hook does not check it or rewrite it at runtime. AppLayout's test 9 and the reviewer's inspection verify it.
- RF-6: THE SYSTEM uses no router, does not move scroll or focus, and only reads `location.hash` on mount and on `hashchange`. Verification: code inspection (the reviewer); there is no jsdom test for these clauses.

## API

```ts
export function useHashTab<T extends string>(
  ids: readonly T[],
  defaultId: T,
): [activeId: T, setActiveId: (id: T) => void];
```

- `ids`: valid tabs (`["about", "resume"]`).
- `defaultId`: the tab if the hash is invalid or missing (`"about"`).
- Caller's preconditions, with no runtime check: `defaultId ∈ ids`; the
  values of `ids` contain no spaces or characters that need encoding
  in the URL (the hook does not encode or normalize; it is the format invariant
  NavTabs attributes to it in its spec).

## Behavior

| Situation | Result |
|---|---|
| Mount with `location.hash` = `#resume` (and `resume` ∈ `ids`) | `activeId = "resume"` |
| Mount with no hash or with an invalid hash (`#foo`) | `activeId = defaultId`; it does **not** rewrite the URL |
| `setActiveId(id)` | Updates the state and calls `history.replaceState(null, "", "#" + id)` |
| `setActiveId(id)` with the id already active | Does nothing (neither state nor `replaceState`) |
| `hashchange` event with a valid hash | Updates `activeId` |
| `hashchange` event with an invalid hash | Ignored; the current tab stays |
| Unmount | Removes the `hashchange` listener |

Decisions:

- **`replaceState`, not `pushState`**: the back button does not change tabs (what
  is expected of a tablist) and no history entries pile up.
  `replaceState` does not fire `hashchange`, so there are no loops.
- Changing tabs does **not** move scroll or focus (that belongs to NavTabs/AppLayout).
- `setActiveId` preserves the URL's `pathname` and `search`; it only changes the hash.

## DOM restriction

**No element may have `id="about"` or `id="resume"`** (or any id
that matches a value of `ids`): the browser would jump to it when loading with
that hash. It is a precondition of the consumer (RF-5); the hook does not check it at
runtime. The panel is `main-panel`; the tabs, `tab-about` / `tab-resume`
(see `specs/layout/NavTabs/spec.md`). AppLayout verifies it in its test 9.

## Anatomy

Not applicable: it is a hook with no UI.

## Styles and tokens

Not applicable.

## Responsive

Not applicable.

## States

See the "Behavior" table (state = active tab; transitions through
`setActiveId` and `hashchange`).

## Accessibility

Not directly applicable. It imposes the id restriction described above; the
tablist semantics belong to `NavTabs`.

## Expected tests

(With `window.location.hash` and `history.replaceState` controlled in the test;
`renderHook` from Testing Library.)

1. No hash → returns `defaultId`.
2. With `#resume` before mounting → returns `"resume"`.
3. With `#foo` → returns `defaultId` and does not call `replaceState`.
4. `setActiveId("resume")` → returns `"resume"` and calls `replaceState` with a URL that ends in `#resume` (spy: `pushState` is **not** called).
5. `setActiveId` with the active id → does not call `replaceState`.
6. Firing `hashchange` after changing `location.hash` to `#resume` → returns `"resume"`.
7. `hashchange` with an invalid hash → keeps the previous value.
8. On unmount the listener is removed: with a spy on `addEventListener`/`removeEventListener` of `window`, on mount `hashchange` is registered and on unmount the same handler is removed; a later `hashchange` causes no updates.
9. `setActiveId` preserves `pathname` and `search`.

## Do not

- Do not use `pushState` or a router.
- Do not read `location.hash` on every render: only on mount and on `hashchange`.
