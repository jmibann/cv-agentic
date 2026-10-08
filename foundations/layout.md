# Layout

## Estructura del documento

```html
<body>
  <a class="skip-link" href="#main-panel">Skip to content</a>
  <div class="container">                     <!-- AppLayout -->
    <ControlsBar />                       <!-- renderiza su propio <header> (banner) -->
    <div class="grid">
      <Sidebar />                         <!-- renderiza su propio <aside aria-label> -->
      <main>
        <Box variant="outer">                 <!-- card de contenido -->
          CornerTab > NavTabs (role="tablist")
          <div role="tabpanel" id="main-panel">  AboutPage | ResumePage  </div>
        </Box>
      </main>
    </div>
  </div>
</body>
```

## Contenedor

- `max-width: var(--container-max)` (1290px), centrado, `padding-inline: var(--container-padding-inline)`.
- `padding-bottom: var(--gutter-bottom)`.
- Arriba: el espacio `--gutter-top` (5rem; 10rem en xl) aloja la **ControlsBar**.
  La barra ocupa la parte inferior de ese espacio, alineada a la derecha:

  ```
  padding-top: calc(var(--gutter-top) - var(--size-control) - var(--space-4));
  ControlsBar (height: var(--size-control))
  margin-bottom: var(--space-4)
  ```

  En xl el avatar del sidebar sobresale hacia arriba dentro de ese espacio,
  pero solo en la columna izquierda; la ControlsBar está en la derecha, no chocan.

## Grilla por breakpoint

### base → lg (< 1200px): una columna

```
┌──────────────────────────────────── ControlsBar ─ [☀] [EN|ES] ┐
┌───────────────────────────────────────────────────╭──────────────┐
│ ┌──────┐  Nombre                                        ⌄         │  ← botón (chevron, Cambio F5 #104b)
│ │avatar│  [Rol]                                             ╰─────┤
│ └──────┘  (redes centradas)                                        │
│ ─────────────────────── (colapsable) ─────────────────────────── │
│ ✉ EMAIL        ☎ PHONE          ← 2 columnas ≥768, 1 columna <768 │
│ [ Download CV ] (solo si existe downloadCvUrl)                   │
└──────────────────────────────────────────────────────────────────┘
  gap: var(--stack-gap)
┌──────────────────────────────────────────╭───────────────────────┐
│ About Me                                 │  About   Resume       │  ← CornerTab > NavTabs
│ ▬▬▬                                      ╰───────────────────────┤
│ …tabpanel…                                                       │
└──────────────────────────────────────────────────────────────────┘
```

- **< lg**: el `h1` del panel va **debajo** de la CornerTab para no
  superponerse. Fórmula única (definida en `specs/layout/AppLayout/spec.md`),
  aplicada en el tabpanel (`.panel`):
  `padding-top: calc(var(--size-nav-tab-height) - var(--box-padding) + var(--space-4))`.
  Descuenta el `--box-padding` del Box porque la tab está posicionada desde el
  borde de la card, no desde su contenido.
- **≥ lg**: la tab **flota** a la derecha (`CornerTab placement="float"`) y
  el `h1` fluye a su izquierda en la misma franja, usando el ancho real de la
  tab (sin reservas fijas). `.panel` vuelve a `padding-top: 0`. Detalle en
  `specs/layout/AppLayout/spec.md` y `specs/primitives/CornerTab/spec.md`.

### xl (≥ 1200px): sidebar + contenido

```
                ┌──────┐                    ControlsBar ─ [☀] [EN|ES]
┌───────────────│avatar│┐  ┌─────────────────────────╭──────────────────┐
│               └──────┘│  │ About Me                │  About   Resume  │
│        Nombre         │  │ ▬▬▬                     ╰──────────────────┤
│        [Rol]          │  │                                            │
│      (redes)          │  │ …tabpanel…                                 │
│ ───────────────────── │  │                                            │
│ ✉ EMAIL               │  │                                            │
│ ☎ PHONE               │  │                                            │
│ ⌖ LOCATION            │  │                                            │
│ [   Download CV   ]   │  │                                            │
└───────────────────────┘  └────────────────────────────────────────────┘
      3 / 12                              9 / 12
```

```css
@media (min-width: 1200px) {
  .grid {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 9fr);
    gap: var(--layout-gap);
    align-items: start;
  }
}

/* Sticky solo si el Sidebar entra entero en la pantalla mientras está fijo.
   Sidebar ≈ 665px + top ≈ 158px ≈ 823px; 900px deja margen para contenido
   variable (cada contacto extra suma ≈ 72px). Única media query de altura
   permitida (ver docs/tokens/breakpoints.md). */
@media (min-width: 1200px) and (min-height: 900px) {
  .aside {
    position: sticky;
    /* el avatar sobresale ≈ 0.71 × su tamaño por encima de la card: el top lo
       incluye para que no quede cortado al fijarse */
    top: calc(var(--size-avatar-sidebar) * 0.71 + var(--space-7));
    z-index: var(--z-sticky);
  }
}
```

- Sidebar **sticky** con CSS (`position: sticky`), sin librerías. El `top`
  suma la protrusión del avatar (≈ 128px) y `--space-7`: con `top: 30px` el
  avatar quedaría cortado contra el borde superior al hacer scroll.
  Además, el sticky se activa **solo con `min-height: 900px`**: en pantallas
  más bajas el Sidebar fijo (≈ 823px con el `top`) no entraría entero y el
  botón Download CV quedaría fuera de vista. Debajo de ese alto, el Sidebar
  scrollea con la página.
- El avatar sobresale: `margin-top: calc(var(--size-avatar-sidebar) * -0.71)` (≈ −8rem
  con 11.25rem), centrado. Por eso el `aside` necesita `padding-top` equivalente
  dentro de `--gutter-top`; está contemplado en los 10rem.

## Contenido de los paneles

Resumen visual. **La spec normativa de cada panel está en
[specs/pages/AboutPage/spec.md](../specs/pages/AboutPage/spec.md) y
[specs/pages/ResumePage/spec.md](../specs/pages/ResumePage/spec.md)**; si este
resumen y esas specs difieren, ganan las specs.

### AboutPage

```
h1 About Me (SectionTitle decorated)
párrafos (profile.about)
h2 Services  → grid ServiceCard: 1 col; 2 cols ≥ lg
h2 Testimonials → TestimonialCarousel (1 por vista; 2 ≥ md)
```

### ResumePage

```
h1 Resume (SectionTitle decorated)
┌ ResumeSection Education ┐ ┌ ResumeSection Experience ┐   lado a lado ≥ md (gap --layout-gap)
└─────────────────────────┘ └──────────────────────────┘   apiladas < md
h2 Skills → SkillList (chips) a ancho completo
```

## Espaciado vertical

- Entre bloques de un panel: `var(--stack-gap)` (1rem → 1.875rem).
- Entre h2 de sección y su contenido: margin del h2 (1.25rem).
- Sin márgenes "sueltos" en componentes: el componente no se da margen
  externo; lo posiciona el padre (flex/grid con `gap`).

## Impresión (`@media print`)

El CV debe imprimirse limpio en A4/Letter:

- Ocultar: ControlsBar, CornerTab/NavTabs, el chevron de contactos del Sidebar, Download CV,
  skip link, bullets del carrusel y el dialog.
- Testimonios: **todos apilados, con el texto completo** (detalle en
  `specs/content/TestimonialCarousel/spec.md` → "Impresión").
- **Imprimir ambos paneles** (About y Resume) uno detrás del otro, sin importar
  el tab activo: los tabpanels ocultos se muestran en print.
- Sidebar arriba en una columna, contactos siempre expandidos.
- Paleta clara siempre (también si el tema activo es oscuro), fondo blanco y
  sin sombras: lo resuelve **`tokens/tokens.css`** en su bloque `@media print`,
  que reasigna los tokens semánticos. Los componentes no hacen nada especial
  de color para imprimir.
- `break-inside: avoid` en TimelineItem y ServiceCard.
- Links de contacto: mostrar el valor en texto (ya lo es), no la URL.
