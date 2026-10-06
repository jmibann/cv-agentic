# Plan — TestimonialCard

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/TestimonialCard/TestimonialCard.tsx` | `Box variant="inner" as="article">` + `.card`: header grid (HexAvatar + identity h3/p), excerpt, comilla gradient, botón estirado | RF-1, RF-2, RF-4, RF-7 |
| `src/components/TestimonialCard/TestimonialCard.module.css` | ajustes de la card sobre el Box (relative/flex/`--radius-16`/`--testimonial-padding`/`height: 100%`), offset avatar, grid, clamp, comilla absolute, `::after` del botón, hover shadow + transición, `@media print` propio | RF-2, RF-5, RF-6 |
| `src/components/TestimonialCard/TestimonialCard.test.tsx` | tests + cierre a11y | todas |
| `src/components/TestimonialCard/index.ts` | re-export | — |

## Funciones puras y algoritmo

Ninguno.

## Interfaz

`TestimonialCardProps { testimonial; openLabel; onOpen; className? }` (spec → API; `className` al Box raíz vía Box, G-B). El h3 id: `testimonial-${testimonial.id}-name` (fórmula fija RF-7).

## Decisiones

- Superficie sobre `Box variant="inner" as="article">` + clase `.card` que ajusta (decisión 17): fondo del Box inner (`surface-muted`), radio/padding propios por tokens; la card no declara color literal.
- Botón estirado (RF-1): `<button type="button" aria-label={openLabel}>` sin hijos; `::after { inset: 0 }` cubre la card; `onOpen(testimonial.id)`; único enfocable; siempre visible (decisión 17). Enter/Espacio nativos.
- Avatar: `HexAvatar src=… className={styles.avatar}` (alt por defecto ""), `margin-top` negativo por token; headroom NO se reserva acá (RF-3: del track, carrusel).
- Comilla: `Icon name="quote" tone="gradient" className={styles.quote}` (`--icon-size: 2rem`, absolute con insets de tokens) — decorativa.
- Clamp 4 líneas (`-webkit-line-clamp`) + `@media print` propio (RF-2: quita clamp/oculta botón; sombra vía token en print, no se redeclara) — la única pieza de F3 con print propio junto con el dialog (G-D-1).
- Hover sobre la card: regla `.card:hover { box-shadow: var(--shadow-control) }` con transición `box-shadow var(--duration-base) var(--ease-standard)` (G-E; el `::after` del botón no necesita estado hover aparte).

## Estrategia de tests

Fixture `Testimonial` (id `t-maria`). Armazones: `HexAvatarDefs` + `AccentGradientDefs` (comilla y avatar gradient; criterio HexAvatar → Forma). Tests: `getByRole("article", { name: author })` con heading nivel 3 e id fórmula; rol y extracto visibles (`testimonial.text`); `getByRole("button", { name: openLabel })` único enfocable del article (`focus()` Tab-order: `queryAll...` de elements? asertar que el article no tiene tabIndex ni otro control — criterio NavTabs); click/Enter/Espacio → `onOpen("t-maria")` una vez (user-event); avatar `img` con `alt=""`; `expectNoA11yViolations`. P1 (clamp, hover, focus ring del ::after, print, offsets): inspección + QA F5 (#101). Rojo on-arrival probable en el caso "único enfocable" si T1 monta otro control — no: no debe existir.

Cobertura: T1→RF-4,RF-7 · T2→RF-1 · T3→RF-2,RF-3(doc),RF-5,RF-6 + cierre.
