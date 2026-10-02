# Breakpoints

Mobile-first. Los estilos base son para el viewport más chico y cada `@media`
**agrega** hacia arriba con `min-width`. No se usa `max-width` salvo en
`@media print` o para casos documentados en la spec de un componente.

| Nombre | Query | Viewport típico | Qué cambia (resumen) |
|---|---|---|---|
| base | — | < 580px (teléfonos) | Una columna, tipografía mobile, `--box-padding` 0.9375rem |
| `sm` | `(min-width: 580px)` | teléfonos grandes | Tipografía desktop, `--box-padding` 1.5rem |
| `md` | `(min-width: 768px)` | tablet vertical | `--box-padding` 1.875rem, Education/Experience lado a lado, 2 testimonios por vista, contactos del sidebar en 2 columnas |
| `lg` | `(min-width: 992px)` | tablet horizontal / laptop chica | NavTabs tamaño completo con el `h1` en la misma franja, ServiceCards en 2 columnas |
| `xl` | `(min-width: 1200px)` | desktop | Sidebar vertical fijo a la izquierda (3/12), contenido 9/12, avatar sobresale, contactos siempre visibles, `--gutter-top` 10rem |

## Reglas

- **Excepción única de altura:** `(min-height: 900px)`, combinada con
  `(min-width: 1200px)`, y solo para activar el sticky del Sidebar en
  AppLayout (ver `foundations/layout.md`). Ningún otro componente usa media
  queries de altura.
- **Solo estos cuatro valores** de ancho pueden aparecer en `@media`. Los `@media` no
  aceptan custom properties, así que se escriben literales:

  ```css
  .grid { display: grid; gap: var(--stack-gap); }

  @media (min-width: 768px) {
    .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  ```

- **Toda medida que cambia por breakpoint es un token.** Tipografía,
  paddings, alturas, gaps, radios y offsets que varían con el viewport viven
  en `tokens.css` (sección "Medidas internas de componentes"), con su escala
  en los `@media` de ese archivo.
- Un componente **solo** agrega `@media` para cambios de *layout*
  (dirección, columnas, orden, visibilidad, `position`/`float`). Dentro de
  ese `@media`, cualquier medida que acompañe al cambio de layout solo puede
  ser un **token**, un **`calc()` de tokens** o **`0`** (p. ej. los márgenes
  negativos de `CornerTab placement="float"` o el `padding-top: 0` del panel).
  **Nunca** un literal nuevo: si hace falta, se agrega un token (y se
  documenta en la spec).
- Las medidas **fijas** (que no cambian por breakpoint) pueden ser literales
  en el CSS del componente si su spec las define; si se repiten en más de un
  componente, pasan a token.
- `prefers-reduced-motion` y `print` también son `@media` válidos.
- En tests (jsdom) no hay layout real: el comportamiento responsive se
  verifica en la fase de QA visual (375 / 768 / 1024 / 1440), no en unit tests.
  Los componentes **no** deben ramificar lógica en JS según el ancho, salvo
  que la spec lo pida explícitamente.

## Correspondencia con el tema de referencia

El tema original es desktop-first (`max-width`). La traducción es:

| Tema (max-width) | Kit (min-width) |
|---|---|
| `≤ 580px` | base (< 580) |
| `≤ 767/768px` | < `md` |
| `≤ 991/992px` | < `lg` |
| `≤ 1199/1200px` | < `xl` |
