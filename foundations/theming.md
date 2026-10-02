# Theming (claro / oscuro)

## Modelo

- Dos temas: `light` y `dark`. El tema se aplica con `data-theme` en `<html>`.
- `tokens.css` define el claro en `:root` y el oscuro en `:root[data-theme="dark"]`.
- Los componentes **no saben** en qué tema están: solo consumen tokens
  semánticos. Ningún componente lee el tema salvo `ThemeToggle`.

## Resolución del tema inicial

Orden de prioridad:

1. Preferencia guardada: `localStorage["cv:theme"]` (`"light"` | `"dark"`).
2. Preferencia del sistema: `matchMedia("(prefers-color-scheme: dark)")`.
3. Default: `light`.

Mientras el usuario no elija explícitamente, el sitio **sigue los cambios del
sistema** en vivo (listener de `matchMedia`). Una vez que elige con el toggle,
se guarda y deja de seguir al sistema.

## Script anti-flash (obligatorio)

Inline en `<head>` de `index.html`, **antes** de cualquier CSS/JS del bundle,
para que el primer frame ya tenga el tema y el idioma correctos:

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
      // theme-color inicial: tokens.css todavía no cargó, así que van los
      // valores de --palette-light-bg / --palette-dark-bg (un test verifica
      // que coincidan con tokens.css; ver regla dura 1 de docs/DESIGN.md)
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

- Todo `localStorage` va en `try/catch`: en modo privado o con storage
  bloqueado puede lanzar.
- Si se agrega una CSP, este script necesita hash o nonce.
- `index.html` incluye `<meta name="theme-color" content="#eceef4">`; el
  script lo ajusta antes del primer frame y después el provider lo mantiene
  sincronizado leyendo `--color-bg`.

## `ThemeProvider`

```ts
type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;   // guarda en storage; el efecto aplica data-theme y theme-color
  toggleTheme: () => void;
}
```

- Estado inicial: leer `document.documentElement.dataset.theme` (ya resuelto
  por el script), no volver a calcular.
- `setTheme`: actualiza el estado y guarda en `localStorage` (try/catch).
- **Un único efecto aplica el tema resuelto**, venga del toggle o de un cambio
  de `prefers-color-scheme` sin preferencia guardada: fija `data-theme` en
  `<html>` y actualiza `<meta name="theme-color">` con el valor de `--color-bg`
  (leído con `getComputedStyle` después de aplicar `data-theme`). Así el meta
  nunca queda desincronizado.
- Hook `useTheme()` que lanza error si se usa fuera del provider.

## `color-scheme`

`tokens.css` fija `color-scheme: light | dark` según el tema, para que
scrollbars, `<dialog>` y controles nativos acompañen.

## Tests esperados (ThemeProvider)

- Toma el tema inicial de `data-theme`.
- `toggleTheme` alterna `data-theme` y persiste en `localStorage`.
- Si `localStorage` lanza, no rompe (el tema cambia igual en memoria).
- Sin preferencia guardada, reacciona al cambio de `prefers-color-scheme`
  (mock de `matchMedia`); con preferencia guardada, lo ignora.
- `<meta name="theme-color">` se actualiza **tanto** con `toggleTheme` **como**
  con un cambio de `prefers-color-scheme` sin preferencia guardada.
- `useTheme` fuera del provider lanza un error descriptivo.

## QA

Cada componente se revisa visualmente en **claro y oscuro**. Ojo: axe
corre en jsdom, que no calcula estilos, así que **no verifica contraste de
color** (solo roles, nombres, ARIA, estructura). El contraste queda cubierto
por la tabla de `docs/tokens/contrast.md` + la regla de "solo tokens semánticos" +
la revisión visual (o axe en navegador real, si el reviewer tiene uno).
