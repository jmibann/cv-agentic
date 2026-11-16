# TestimonialDialog
Status: implemented

## Purpose

It shows a full testimonial in a modal. It uses the native `<dialog>` (trapped
focus, Esc, top layer and `::backdrop` with no libraries).

## Requirements (EARS)

- RF-1: IF `testimonial` is `null`, THEN THE SYSTEM **renders nothing** (conditional mounting, decision 18=b: there is no `<dialog>` in the DOM — it matches Test 1); IF it receives a non-null value, THEN it mounts the `<dialog>` and opens it with `dialog.showModal()` in an effect after the mount.
- RF-2: THE SYSTEM closes the dialog with `dialog.close()` when the trigger is the Close button or the backdrop; closing by **Esc is native** (the browser does not call `close()` but fires the `close` event); in all cases the `close` event of the `<dialog>` is the **only place that calls `onClose()`** (only if the current testimonial is not `null`).
- RF-3: WHEN the user closes (Close button, backdrop or Esc), THEN THE SYSTEM invokes `onClose` exactly once; IF the parent sets `testimonial` to `null`, THEN it closes without invoking `onClose`. A click whose `target` is the dialog but that falls **inside the `padding` strip** of the dialog does NOT close (decision 19): closing by click requires `target === dialog` **and** a point outside the dialog's bounding rect (a real backdrop).
- RF-4: WHEN the dialog is open, THEN THE SYSTEM shows author, role and full text (`testimonial.text`), with an accessible name equal to the author (`aria-labelledby` to the `h2`) and closing with Esc. The initial focus on the Close button is **native to `showModal`**: no autofocus of its own; it is verified in QA F5 (jsdom does not implement it).
- RF-5: THE SYSTEM applies the backdrop with `::backdrop` and does not print the dialog. The background scroll lock (`html:has(dialog[open]) { overflow: hidden; }`) **already lives in `global.css` since F1**: no task in this piece, verify that it is enough. The `@media print { display: none }` lives in the **piece's module** (G-D-1, decision 19). Verification of `::backdrop` and print: CSS inspection.
- RF-6: THE SYSTEM renders two columns at 580px or more and a single one with the quote hidden below 580px, with maximum width and height based on the viewport and no new measures per breakpoint; the avatar comes from `HexAvatar` (decorative). IF the content exceeds the maximum height, `.layout` scrolls (`overflow-y: auto`, decision 19); the dialog keeps its maximums. Verification of the layout: inspection + QA F5.

## Anatomy

```
┌────────────────────────────────────────────────── [×] ┐
│  ⬡ av ⬡   María González                              │   ← h2
│    ❝      Product Manager, Acme Corp                  │
│           Alex consistently delivered high-quality…   │   ← full text
└───────────────────────────────────────────────────────┘
```

```html
<dialog aria-labelledby="testimonial-dialog-title" class="dialog">
  <button type="button" class="close" aria-label="Close"><Icon name="x" /></button>
  <div class="layout">
    <div class="aside">  hexagonal avatar + quote (quote hidden < 580) </div>
    <div class="body">
      <h2 id="testimonial-dialog-title">María González</h2>
      <p class="role">Product Manager, Acme Corp</p>
      <p>full text</p>
    </div>
  </div>
</dialog>
```

## API

```ts
import type { Testimonial } from "@data/cv.types.generated";

export interface TestimonialDialogProps {
  /** null = closed. */
  testimonial: Testimonial | null;
  onClose: () => void;
  closeLabel: string;  // "Close" / "Cerrar"
}
```

### Opening and closing cycle (single source of truth)

| Trigger | What the component does |
|---|---|
| `testimonial` goes from `null` to a value | It mounts the `<dialog>` (it did not exist) and opens it with `dialog.showModal()` in a mount effect (RF-1) |
| Close button | `dialog.close()` — it does **not** call `onClose` directly |
| Click on the backdrop (`target === dialog` **and** a point outside the dialog's bounding rect; the padding does NOT close, RF-3) | `dialog.close()` — it does **not** call `onClose` directly |
| Esc | native closing by the browser; it fires the `close` event |
| `close` event of the `<dialog>` | **the only place that calls `onClose()`**, and only if the current `testimonial` (read from a ref with the last value of the prop) is not `null` |
| `testimonial` goes to `null` from the parent | Cleanup of the mount effect: `dialog.close()` if `dialog.open` and unmount; the resulting `close` does **not** call `onClose` (the ref is already `null`) |
| Value → a different value without going through `null` | It cannot happen with the real parent (Carousel RF-6 forbids it): the piece defines no direct transition; the contract belongs to the consumer |

Result: every closing started by the user calls `onClose` **exactly
once**, and a closing started by the parent does not call it. Even so, the parent
must implement `onClose` idempotently (e.g. `setSelectedId(null)`).
The **return of focus** to the button that opened the dialog is native (`close()` before
the unmount); it is verified in QA F5.

## Styles and tokens

| Part | Value |
|---|---|
| Dialog | `background: var(--color-surface); color: var(--color-text); border: 0; border-radius: var(--radius-20); padding: var(--box-padding); width: min(40rem, calc(100vw - 2rem)); max-height: calc(100dvh - 2rem); box-shadow: var(--shadow-dialog);` |
| Backdrop | `::backdrop { background: var(--color-overlay); }` |
| Entrance | `opacity` 0→1 and `transform: scale(0.96)`→1 in `--duration-base var(--ease-enter)` **entrance only** (decision 19: no exit animation), with `@starting-style` as the only mechanism; the reduction stays in the duration tokens (no `@media (prefers-reduced-motion)` of its own) |
| Layout | Grid `auto 1fr`, `gap: var(--space-6)`; `overflow-y: auto` (inner scroll if the text exceeds the maximum height — RF-6/decision 19) |
| Role | `color: var(--color-text-muted); margin: 0;` (user's decision 2026-10-07: it completes the row that was missing for the `<p class="role">` of the Anatomy, the same convention as the role of TestimonialCard; pair 5.02/6.01 on `surface` recorded in `docs/tokens/contrast.md`) |
| Close | `position: absolute; top: var(--space-4); right: var(--space-4);` square `--size-control` button, radius `--radius-12`, background `--color-surface-muted`, color `--color-text`; icon `Icon name="x"` with the default size (`--size-icon`, no `--icon-size` of its own) |
| Quote | `Icon name="quote" tone="gradient"` with `.quote { --icon-size: 2rem; }` (the same convention as TestimonialCard), in the aside column **below the avatar** (anatomy); hidden < 580px (RF-6) |
| Avatar | `HexAvatar` (the same primitive as TestimonialCard; it is not reimplemented) |
| Background scroll | `html:has(dialog[open]) { overflow: hidden; }` **already exists in `global.css` (F1)**: no task of its own, verify that it is enough |
| Print | `@media print { display: none }` in the **piece's module** (G-D-1) |

## States

| State | Effect |
|---|---|
| Closed | **not mounted**: there is no `<dialog>` in the DOM (RF-1, decision 18=b) |
| Open | modal in the top layer with a backdrop |
| Close hover | color `--color-accent-text`; `color` transition `--duration-base var(--ease-standard)` (G-E) |
| Close focus-visible | `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset);` |

## Responsive

- ≥ 580px: two-column grid (avatar + quote | text).
- < 580px: one column and the quote hidden (only a layout/visibility change).
- Maximum width and height by `min()`/`calc()` on the viewport; no new measures per breakpoint.

## Print

The dialog is not printed (`display: none` in `@media print`).

## Accessibility

- Modal `<dialog>` with `aria-labelledby` to the h2 (the author's name).
- On opening, focus goes to the first focusable element (the Close button, native to `showModal`).
- On closing, focus returns to the button that opened it (native); verify in QA.
- Esc closes (native).
- Avatar `alt=""`; decorative quote.

## Expected tests

jsdom does not implement the full `showModal`/`close`: the minimal mock is **already
provided by F1** in `src/test/setup.ts` (`showModal` → `open` attribute; `close`
→ removes `open` + fires the `close` event, also on a closed dialog — the
cycle's `dialog.open` guard makes it compatible). The tests **verify that
the mock is enough**; no task of the piece touches `src/test/` (post-F1). The
renders with `HexAvatar`/gradient quote mount `HexAvatarDefs` and
`AccentGradientDefs` as a scaffold (contracts of HexAvatar → Shape and Icon).

1. With `testimonial = null` there is no dialog in the DOM (`queryByRole("dialog")` is null; RF-1 conditional mounting).
2. With a testimonial: `getByRole("dialog", { name: author })`, it shows role and full text (`testimonial.text`).
3. Click on Close → `onClose` **exactly once**.
4. `close` event of the dialog (simulates Esc) → `onClose` exactly once.
5. Click on the backdrop (`target = dialog` + a coordinate outside the bounding rect) → `onClose` once; a click inside the content **and a click on the padding strip** (target = dialog, inside the rect) do not close (RF-3).
6. The parent sets `testimonial` to `null` with the dialog open → it closes and `onClose` is **not** called.
7. `closeLabel` is the name of the close button.
8. `expectNoA11yViolations` with no violations with the dialog open (defs scaffold mounted).

## Do not

- Do not call `onClose` from the Close button or from the backdrop: only the `close` event of the `<dialog>` calls it.
- Do not replace the native `<dialog>` with a modal made with `div` or with a library: trapped focus, Esc and top layer are native.
- Do not reimplement the avatar: `HexAvatar` is used.
- Do not print the dialog: `display: none` in `@media print` of the **piece's module** (G-D-1; it does not go in global).
- Do not add measures per breakpoint: maximum width and height go through `min()`/`calc()` on the viewport.
- Do not touch `src/test/setup.ts` (the dialog mock already exists; post-F1 nobody writes there).
