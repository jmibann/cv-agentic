# Plan — AboutPage

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/pages/AboutPage/AboutPage.tsx` | página: `.page` con `h1` siempre, `.intro`, `<section aria-labelledby>` de servicios con `<ul>`, h2 "Testimonials" + `TestimonialCarousel` (hermanos directos, decisión 20); `carouselLabels` = plantillas crudas de `t.testimonials`; datos `useCv()`, textos `useLocale().t` | RF-1..RF-3, RF-5 |
| `src/pages/AboutPage/AboutPage.module.css` | solo layout: `.page` flujo de bloque con `* + * { margin-top: var(--stack-gap) }`, `.intro` flex col gap `--space-4` + `p { margin: 0 }`, `.services` grid `--layout-gap` + `list-style: none` 1 col → ≥ lg (992) 2 cols, `.testimonials { margin-top: 0 }` (pasa como className al raíz del carrusel) | RF-4, RF-6 |
| `src/pages/AboutPage/AboutPage.test.tsx` | tests 1–8 de la spec; variante vacía con `vi.mock` del provider (precedente `LanguageSwitcher.test.tsx`: `vi.mock` + `importOriginal` overriding `useCv` con el cv del kit con `services: []` / `testimonials: []`); wrapper `LocaleProvider` real + armazones `AccentGradientDefs` y `HexAvatarDefs` | todas |
| `src/pages/AboutPage/index.ts` | re-export `AboutPage` + `AboutPageProps` | — |

## Funciones puras y algoritmo

Ninguna: la página es presentación pura; el único "mapeo" es el objeto literal
`carouselLabels` (5 claves, spec → API). Sin ordenamiento ni derivación de datos.

## Interfaz

`AboutPageProps { className?: string }` → unida a `.page` (G-B, canon #99:
`const rootClassName = [styles.page, className].filter(Boolean).join(" ")`,
estilo de las piezas F2/F3, sin `clsx`).

## Decisiones

- **`vi.mock` del módulo de providers para vaciar colecciones** (P1 de la
  Clarificación): alternativa descartada — prop de override en `LocaleProvider`
  (tocaría `src/providers/`, archivo cerrado desde F1). El precedente de
  mocking con `importOriginal` ya existe en `LanguageSwitcher.test.tsx`.
- **La página no llama a `format`** (P8): pasa plantillas crudas; el carrusel
  interpola. Si un test de la página pidiera "1 of 3", está mal ubicado: los
  nombres del carrusel se verifican en su pieza y en AppLayout.
- **`className` al raíz del carrusel para el espaciado** (`.testimonials` =
  `margin-top: 0`): alternativa descartada — envolver el carrusel en un div de
  layout (rompería la decisión 20: el carrusel es hermano directo del `h2`).
- **`.services` sin `role="list"`** (P4): el quirk se unifica en QA F5; la
  página no lo decide.
- **`profile.about` vacío no tiene test** (Estados → inspección): no se inventa
  cobertura (regla sdd).

## Estrategia de tests

Render con `LocaleProvider` real (contenido del kit, locale `en`) + armazones
defs. Queries por rol: `heading level 1` con `getAllByRole` longitud 1 (RF-1/RF-5),
`region` por nombre `t.about.services`/`t.about.testimonials` (la del carrusel
resuelve a su `<section>` vía `labelledBy`), `article` por servicio, párrafos
por `profile.about`. Variantes vacías con el mock. Test 6 (`es`): montar con
locale `es` (patrón de `LanguageSwitcher.test.tsx` / providers F1) y pedir un
texto de `ui.es` y uno de `cv.es`. Cierre `expectNoA11yViolations` en cada
escenario completo. Tareas en orden markup→estilos: `test` rojo → `feat`.

Cobertura: T1→RF-1,RF-2(intro) · T2→RF-2(servicios),RF-5 · T3→RF-2(testimonios),RF-3
(incl. test 6 es) · T4→RF-4,RF-6 (inspección) + unión `className` + cierre a11y.
