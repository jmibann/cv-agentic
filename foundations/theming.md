# Theming (light / dark)

## Model

- Two themes: `light` and `dark`. The theme is applied with `data-theme` on `<html>`.
- `tokens.css` defines the light one on `:root` and the dark one on `:root[data-theme="dark"]`.
- Components **do not know** which theme they are in: they only consume semantic
  tokens. No component reads the theme except `ThemeToggle`.

## Resolving the initial theme

Order of priority:

1. Stored preference: `localStorage["cv:theme"]` (`"light"` | `"dark"`).
2. System preference: `matchMedia("(prefers-color-scheme: dark)")`.
3. Default: `light`.

As long as the user has not chosen explicitly, the site **follows system
changes** live (a `matchMedia` listener). Once they choose with the toggle,
it is stored and the site stops following the system.

## Anti-flash script (mandatory)

Inline in the `<head>` of `index.html`, **before** any CSS/JS of the bundle,
so that the first frame already has the right theme and language:

```html
<script>
  (function () {
    var d = document.documentElement;
    try {
      var t = localStorage.getItem("cv:theme");
      if (t !== "light" && t !== "dark") {
        t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      d.dataset.theme = t;
      // Initial theme-color: tokens.css has not loaded yet, so these are the
      // values of --palette-light-bg / --palette-dark-bg (a test checks that
      // they match tokens.css)
      var m = document.querySelector('meta[name="theme-color"]');
      if (m) m.setAttribute("content", t === "dark" ? "#151517" : "#eceef4");
      var l = localStorage.getItem("cv:locale");
      if (l !== "en" && l !== "es") {
        var n = (navigator.languages && navigator.languages[0]) || navigator.language || "";
        l = /^es\b/i.test(n) ? "es" : "en";
      }
      d.lang = l;
    } catch (e) {
      d.dataset.theme = "light";
      d.lang = "en";
    }
  })();
</script>
```

- Every `localStorage` access goes inside `try/catch`: in private mode or with
  storage blocked it can throw.
- If a CSP is added, this script needs a hash or a nonce.
- `index.html` includes `<meta name="theme-color" content="#eceef4">`; the
  script adjusts it before the first frame and afterwards the provider keeps it
  in sync by reading `--color-bg`.

## `ThemeProvider`

```ts
type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;   // stores it; the effect applies data-theme and theme-color
  toggleTheme: () => void;
}
```

- Initial state: read `document.documentElement.dataset.theme` (already resolved
  by the script), do not compute it again.
- `setTheme`: updates the state and stores it in `localStorage` (try/catch).
- **A single effect applies the resolved theme**, whether it comes from the toggle or from a
  `prefers-color-scheme` change with no stored preference: it sets `data-theme` on
  `<html>` and updates `<meta name="theme-color">` with the value of `--color-bg`
  (read with `getComputedStyle` after applying `data-theme`). That way the meta
  never drifts out of sync.
- A `useTheme()` hook that throws if used outside the provider.

## `color-scheme`

`tokens.css` sets `color-scheme: light | dark` according to the theme, so that
scrollbars, `<dialog>` and native controls follow along.

## Expected tests (ThemeProvider)

- Takes the initial theme from `data-theme`.
- `toggleTheme` switches `data-theme` and persists in `localStorage`.
- If `localStorage` throws, it does not break (the theme still changes in memory).
- With no stored preference, it reacts to a `prefers-color-scheme` change
  (`matchMedia` mock); with a stored preference, it ignores it.
- `<meta name="theme-color">` is updated **both** with `toggleTheme` **and**
  with a `prefers-color-scheme` change with no stored preference.
- `useTheme` outside the provider throws a descriptive error.

## QA

Each component is reviewed visually in **light and dark**. Note: axe
runs in jsdom, which computes no styles, so it **does not verify color
contrast** (only roles, names, ARIA, structure). Contrast is covered
by the table in `docs/tokens/contrast.md` + the "semantic tokens only" rule +
the visual review (or axe in a real browser, if the reviewer has one).
