# Plan — NavTabs

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/NavTabs/NavTabs.tsx` | `CornerTab size="md" placement="float">` with `div role="tablist">` and one `button role="tab">` per item; roving tabindex; keyboard; exported `getTabId` | RF-1…RF-7 |
| `src/components/NavTabs/NavTabs.module.css` | stretched flex/gap-token tablist, full-height tab (typography/padding/nowrap/cursor), outer padding of first/last as hit area, inactive 80%, hover underline, active accent, focus-visible, transitions | RF-5, RF-6 |
| `src/components/NavTabs/NavTabs.test.tsx` | tests + a11y closing case (with a scaffold tabpanel) | all |
| `src/components/NavTabs/index.ts` | re-export (`NavTabs`, `getTabId`, types) | — |

## Pure functions and algorithm

- `getTabId(id) = "tab-" + id` (exported; AppLayout uses it — spec → API).
- Roving: active focus index = position of `activeId`; arrows with wrap `(i ± 1 + n) % n`; Home/End → 0/n-1. No extra functions.

## Interface

`NavTabsProps { items: readonly NavTabItem[]; activeId: string; onChange; panelId: string; label: string; className?: string }` (spec → API; `className` is passed on to the `CornerTab` — root of the piece, G-B). It does **not** expose `aria-orientation`/size: fixed horizontal/`md`/`float`.

## Decisions

- **Own focus, activation by the parent (decision 6):** on pressing an arrow, NavTabs focuses the resulting tab (ref to the buttons + `.focus()`) and emits `onChange` of the resulting one; if the resulting one **is the same tab** (1 item), it does not emit (RF-4). With a controlled `activeId`, the visual part (aria-selected) changes when the parent re-renders — the focus is already set.
- **Space:** `onKeyDown` with `e.code === "Space"` → `preventDefault()` and let the native click run… the `<button>` activates with native keyup; so as not to break RF-4/"Space activates" without a double emission: `preventDefault` on the `keydown` of Space cancels the click of the `<button>` (HTML: a button is activated on **keyup** if the Space keydown was not cancelled with preventDefault; preventDefault on keydown prevents it) → the handler calls `activate(tab)` explicitly. Enter: native (it activates by click). The plan sets: Space = preventDefault + manual activation through the same path as the click; Enter = native click only.
- ↑/↓ ignored (horizontal tablist, decision 6).
- `items.length === 0` → `return null` (RF-7). `activeId` outside `items` → invariant of AppLayout (decision 5): the piece does not validate; roving uses `items.findIndex ?? -1` with a guard for -1 → it takes 0 as focus without emitting (minimal defensive, with no RF).
- Print: no `@media print` of its own (G-D); hiding the corner tab/tablist belongs to the shared style (F4). The **no-BFC** dependency of the neighbor is documented in spec → Responsive (verification in AppLayout F4/F5).
- Transitions: `opacity` and `text-decoration-color` with `--duration-base var(--ease-standard)` (the spec's table; the row did not set an easing → standard G-E; a small decision of the plan). `color` is removed: the theme change must be instant and not drag the previous accent.
- **Hit area (Change 2026-11-10):** the tablist and the buttons stretch to the height of the `CornerTab` (60px ≥992 / 48px <992); the outer padding of `:first-child`/`:last-child` moves to the button with a negative margin, without moving the text. The gap is still not clickable. *Discarded:* padding on all the tabs (it would enlarge the visual gap) and a hit-area pseudo-element (extra surface and overlap with the gap).
- **Stacking (Change 2026-11-10):** `CornerTab .float` uses `z-index: var(--z-raised)` to stay above the panel's positioned `h1`; with `auto`, the `h1`'s box intercepts the lower half of the tab. *Discarded:* `pointer-events: none` on the `h1` (it breaks text selection).

## Test strategy

Render of the piece **alone** (it needs no providers: everything by props; `onChange` = `vi.fn()`). Queries: `getByRole("tablist", { name })`, tabs by role+name+level order (spec → Tests 1–12, including test 9 for 1 item and test 10 for empty). Keyboard with `user-event.tab`/`keyboard("{ArrowRight}")` etc. Focus asserted with `toHaveFocus`. The exported `getTabId` is tested directly. Closing `expectNoA11yViolations` rendering the piece together with a scaffold `div role="tabpanel"` with the `panelId` and the `aria-labelledby` of the active tab (F2 scaffold pattern) and the other branch `items=[]`. No `AccentGradientDefs` (there is no gradient in the tab; `CornerTab` mounts no icons).

Coverage: T1→RF-1,RF-2,RF-7 · T2→RF-3 · T3→RF-4 · T4→RF-5,RF-6 + closing ·
T5→RF-5,RF-6 (Change 2026-11-10: full hit area and theme transition).
