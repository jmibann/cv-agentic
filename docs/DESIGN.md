# Design — principios y reglas

## Lenguaje visual

- **Cards flotando sobre un fondo tintado.** Todo el contenido vive en cards
  blancas (claro) o grafito (oscuro) con radio generoso (20px), un borde
  inferior grueso y sutil (5px `box-edge`) y una sombra larga y difusa.
- **Acento escaso y con intención.** Nunca en fondos grandes. Se usa de
  dos formas, y cada uso tiene **una sola** forma permitida:
  - **Gradiente** (`--gradient-accent`, o `url(#accent-gradient)` en SVG):
    barra bajo el `h1`, Button, íconos de IconBox y ServiceCard, comilla de
    testimonios, bullet activo del carrusel, idioma activo del LanguageSwitcher.
  - **Sólido** (`--color-accent` / `--color-accent-text`): punto del
    Timeline, tab activo de NavTabs, texto y links de acento, hover de
    controles y redes, anillo de foco.
  - Claro: azul `#304cfd → #2640eb` (sólido `#304cfd`).
  - Oscuro: dorado `#fadd7f → #f6c16f` (sólido `#fadd7f`).
- **Tipografía liviana con títulos firmes.** Poppins 300 en el cuerpo,
  600 en títulos, 500 en tabs, nombre e ítems de Timeline.
- **Solapas en las esquinas.** La navegación es una pestaña (`CornerTab`)
  pegada a la esquina superior derecha de su card: fondo apenas elevado,
  borde fino y radio asimétrico (0 / 20 / 0 / 32). El "Show Contacts" del
  Sidebar **no** es solapa: es un chevron dorado (`--color-accent-text`)
  sin fondo, pegado a la esquina (Cambio F5 #104b — la solapa con fondo
  solapaba el nombre a 375px; la identidad y la jerarquía tipográfica
  quedan intactas).
- **Tintes, no líneas.** Los bloques internos se separan por fondo
  (`surface-muted`) antes que por bordes. Las líneas (Timeline, Separator)
  son de 1px y decorativas.

## Reglas duras (el reviewer las verifica)

1. **Cero colores literales fuera de `tokens/tokens.css`.** Ni `#hex`, ni
   `rgb()`, ni `hsl()`, ni nombres (`white`, `black`), ni en CSS ni en TSX.
   Excepciones: las palabras clave `transparent` y `currentColor` (no son
   colores de marca); los dos valores iniciales de `theme-color` en el script
   anti-flash de `index.html` (corre antes de que cargue `tokens.css`; un test
   verifica que sean iguales a `--palette-light-bg` / `--palette-dark-bg`); y
   las imágenes de contenido en `public/` (placeholders), que no son estilos. La paleta clara para imprimir la fuerza `tokens.css`
   en su bloque `@media print`; los componentes no la tocan.
2. **Solo tokens semánticos en componentes** (`--color-*`, `--gradient-*`,
   `--shadow-*`, `--filter-*`, `--space-*`, `--radius-*`, `--size-*`,
   `--font-*`, `--duration-*`, `--ease-*`, `--z-*`, `--focus-*` y las medidas
   internas de componentes). Las `--palette-*` no se usan fuera de
   `tokens.css`. `z-index` siempre con un token `--z-*` (también el negativo:
   `--z-below`).
3. **Solo CSS Modules.** Nada de styled-components, CSS-in-JS, Tailwind,
   `style={{…}}` para estilos estáticos (sí para valores dinámicos
   imposibles en CSS, justificado en un comentario). El único CSS global
   permitido es `src/styles/global.css`, con exactamente: reset,
   base tipográfica (`foundations/typography.md`), estilos de impresión
   compartidos y el bloqueo de scroll del dialog
   (`html:has(dialog[open]) { overflow: hidden; }`).
4. **Mobile-first** con los 4 breakpoints de `docs/tokens/breakpoints.md`.
5. **Contraste AA** en ambos temas: solo pares de `docs/tokens/contrast.md`.
   Texto sobre acento → `--color-on-accent`.
6. **Contenido como datos.** Ningún texto de CV en componentes: el
   contenido vive en `src/content/cv.{en,es}.json` (formato definido por
   `data/cv.schema.json`). Ningún texto de interfaz hardcodeado (todo por
   `ui.{en,es}.ts`).
7. **Accesibilidad no negociable**: roles y nombres correctos, teclado
   completo, foco visible, sin violaciones de axe (`expectNoA11yViolations`) en cada componente.
   El anillo de foco es siempre el mismo:
   `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset);`
   (solo `:focus-visible`).
8. **Sin dependencias nuevas** fuera de las aprobadas (ver README).

## Do / Don't

| ✅ Hacer | ❌ No hacer |
|---|---|
| `color: var(--color-accent-text)` para texto de acento | `color: var(--color-accent)` para texto (en el futuro pueden diferir) |
| `color: var(--color-on-accent)` sobre el gradiente | `color: #fff` sobre el gradiente (en oscuro no se lee) |
| Chips sobre `surface` | Chips dentro de `Box variant="inner"` (mismo fondo) |
| `CornerTab` con borde 1px | CornerTab sin borde o con sombra |
| `h3` con estilo de h4 en Timeline | `h5` en Timeline (rompe la jerarquía) |
| `<dialog>` nativo | Librerías de modal |
| scroll-snap + bullets | Swiper / autoplay |
| Transiciones de propiedades concretas | `transition: all` |
| Ícono informativo con `label` | Ícono como único contenido de un botón sin `aria-label` |
| `gap` del padre para espaciar | `margin` externo en componentes |

## Procedencia

Tokens, medidas y patrones de layout se extrajeron del tema comercial
"vCard 2" (claro y oscuro) y de capturas de referencia para la navegación.
**No se copió código ni assets del tema**: todo el CSS y los SVG se escriben
desde cero a partir de estas specs. No incluir imágenes, logos ni avatares de
la demo del tema.

## Fuera de alcance (decisiones cerradas)

Portfolio, Blog, página Contact (formulario), skills con porcentaje/barras,
agrupación de skills, carrusel de clientes, preloader, fondo de triángulos,
fecha en testimonios, menú hamburguesa/drawer. Reabrir cualquiera es un
cambio de alcance que decide el usuario.
