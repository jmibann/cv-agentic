# Tipografía

## Fuente

- **Poppins**, servida desde el propio sitio (sin Google Fonts en runtime).
- Implementación recomendada: paquete `@fontsource/poppins`, importando solo
  los pesos usados en el entry de la app:

  ```ts
  import "@fontsource/poppins/300.css";
  import "@fontsource/poppins/400.css";
  import "@fontsource/poppins/500.css";
  import "@fontsource/poppins/600.css";
  ```

  Alternativa sin dependencia: `.woff2` en `public/fonts/` con `@font-face`
  propio (`font-display: swap`, subset latin, que cubre á é í ó ú ñ ¿ ¡).
- Sin itálicas: el diseño no las usa.
- Stack de respaldo: `--font-family` (system-ui…).

## Estilos base (globales, en el CSS global de la app)

```css
body {
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-light);
  line-height: var(--line-height-body);
  color: var(--color-text);
  background-color: var(--color-bg);
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3, h4, h5, h6 {
  color: var(--color-heading);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-heading);
  margin: 0;
}
h4 { font-weight: var(--font-weight-medium); }
strong, b { font-weight: var(--font-weight-semibold); color: var(--color-heading); }
```

El cuerpo en **peso 300** es parte de la identidad visual (texto liviano,
títulos firmes). No subirlo "para que se lea mejor" sin consultarlo.

## Escala

| Token | < 580px | ≥ 580px | Peso | Uso |
|---|---|---|---|---|
| `--font-size-h1` | 24px | 32px | 600 | Título de página ("About Me", "Resume") |
| `--font-size-h2` | 18px | 24px | 600 | Títulos de sección (Education, Testimonials, dialog) |
| `--font-size-h3` | 16px | 18px | 600 | ServiceCard, nombre en TestimonialCard |
| `--font-size-h4` | 14px | 16px | 500 | Título de TimelineItem |
| `--font-size-h5` | 12px | 14px | 600 | Reservado |
| `--font-size-h6` | 10px | 12px | 600 | Reservado |
| `--font-size-body` | 14px | 15px | 300 | Párrafos |
| `--font-size-name` | 17px | 27px (≥768) | 500 | Nombre en el sidebar |
| `--font-size-button` | 14px | 16px | 400 | Button |
| `--font-size-small` | 12px | 12px | 400 | Button `size="small"` |
| `--font-size-badge` | 11px | 13px (≥768) | 400 | Badge del rol, chips de skills |
| `--font-size-overhead` | 11px | 12px | 400, MAYÚSCULAS | Etiquetas de contacto |
| `--font-size-nav` | 14px | 16px (≥992) | 500 | NavTabs |

## Nivel visual vs. nivel semántico

El **tamaño visual no define el nivel del heading**. La jerarquía del
documento es:

```
h1  título de página (uno por tabpanel)
└─ h2  sección (Services, Testimonials, Education, Experience, Skills)
   └─ h3  ítem (ServiceCard, TimelineItem, TestimonialCard)
```

El título de un TimelineItem es `<h3>` con estilo de h4 (clase del módulo,
no el tag). El tema original usaba `<h5>`; eso rompe la jerarquía y **no** se
replica. El nombre del sidebar no es heading: es un `<p>` con estilo propio
(decisión fijada en `specs/layout/Sidebar.md`; el único `h1` es el del
panel activo).

## Márgenes de títulos

| Elemento | Margin-bottom |
|---|---|
| h1 con barra (SectionTitle `decorated`) | `var(--title-decorated-gap)` (24px < 580 → 37px) — incluye la barra; la distancia texto→barra es `--title-bar-offset` |
| h2 | 1.25rem |
| h3 | 0.5rem |
| h4 (TimelineItem) | 0 (el período va inmediatamente debajo) |
