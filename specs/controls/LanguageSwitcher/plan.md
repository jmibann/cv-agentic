# Plan — LanguageSwitcher

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/LanguageSwitcher/LanguageSwitcher.tsx` | `div role="group">` with one `<button>` per `LOCALES`, active state and guard | RF-1…RF-5 |
| `src/components/LanguageSwitcher/LanguageSwitcher.module.css` | segmented group, active button with gradient, hover, press + transition, focus | RF-6 |
| `src/components/LanguageSwitcher/LanguageSwitcher.test.tsx` | tests + a11y closing case | all |
| `src/components/LanguageSwitcher/index.ts` | re-export | — |

## Pure functions and algorithm

None: a `LOCALES → button` map. Fixed names: `en` → text "EN", label "English", `lang="en"`; `es` → "ES", "Español", `lang="es"` (local constants of the `.tsx`; if the plan moves them to a constant object exported next to the component, apply #100 to `allowExportNames` — by default they stay **unexported**).

## Interface

`LanguageSwitcherProps { label: string; className?: string }`. It consumes `useLocale()` (`{ locale, setLocale }`; C2 exception, the same as ThemeToggle). `className` on the root group (G-B).

## Decisions

- **Guard (decision 2=a):** click on the active one → **it does not invoke `setLocale`** (comparison `next === locale`). A dedicated test with a spied `setLocale`.
- **Double harness** (declared so the builder does not invent it): tests of order/names/lang/active with the real `LocaleProvider` (seed: `document.documentElement.lang = "es"` before the render, like the anti-flash; reset in `afterEach`); **call-count/guard** tests with `vi.mock("../providers/LocaleProvider")` exposing `useLocale` with `setLocale: vi.fn()` (a module mock, not a re-export of the hook; #96 is not touched).
- RF-2 (lang/storage) belongs to the provider: the piece verifies it **only in integration** (already covered by `LocaleProvider.test.tsx`; here `aria-pressed` + the call are enough) — G-A.
- No divider (decision 3): the separation is `gap: 0.125rem`; *discarded:* a border between segments (no property in the spec paints it).
- `aria-pressed` on normal buttons (not a radiogroup, RF-5/"Do not").
- Press transition as in ThemeToggle (G-E).

## Test strategy

`getByRole("group", { name })`; `getAllByRole("button")` in order + `textContent` (RF-1, decision 3); `getByRole("button", { name: "English"|"Español" })` + `aria-pressed`; click on the other → `aria-pressed` switches (real) / `setLocale` called with the locale (mock); click on the active one → `setLocale` **not called** (mock); `lang` attribute per button; Tab goes through both (decision 3); closing `expectNoA11yViolations` with each language active.

Coverage: T1→RF-1,RF-4 · T2→RF-2,RF-3,RF-5 · T3→RF-6 + closing.
