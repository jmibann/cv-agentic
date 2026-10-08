# AboutPage
Estado: implementada

## Propósito

Contenido del panel **About**: presentación, servicios ("What I'm Doing") y
testimonios. Se renderiza dentro del tabpanel de AppLayout.

## Requisitos (EARS)

- RF-1: EL SISTEMA renderiza siempre el `h1` con `t.about.title`.
- RF-2: CUANDO `profile.about` tiene párrafos, ENTONCES EL SISTEMA renderiza `.intro` con un `<p>` por elemento; SI `services` está vacío, ENTONCES no renderiza su `<section>`; SI `testimonials` está vacío, ENTONCES no renderiza ni el `h2` ni el carrusel (decisión 20 de la Clarificación F3: el testimonio ya no vive en una `<section>` de la página — la región es la `<section>` propia del `TestimonialCarousel`, nombrada con `labelledBy`).
- RF-3: EL SISTEMA obtiene los datos con `useCv()` y los textos con `useLocale().t`, y pasa las plantillas crudas de `t.testimonials` en los labels del carrusel (quien interpola con `format` es el carrusel).
- RF-4: EL SISTEMA mantiene `.page` en flujo de bloque normal (sin flex ni grid ni `overflow` distinto de `visible`) para que el `h1` fluya junto a la solapa flotante de NavTabs. Verificación: inspección del CSS (jsdom no computa) + QA F5.
- RF-5: EL SISTEMA expone un único `h1`, nombra cada región con su `h2` (la de servicios, su `<section aria-labelledby>`; la de testimonios, la `<section>` del propio carrusel vía `labelledBy` — RF-1 de TestimonialCarousel) y renderiza los servicios como `<ul>`.
- RF-6: EL SISTEMA aplica solo layout: sin estilos visuales, con servicios en 1 columna que pasan a 2 a partir de lg. Verificación: inspección del CSS + QA F5.

## Anatomía

```html
<div class="page">
  <SectionTitle as="h1" decorated>About Me</SectionTitle>            <!-- t.about.title -->
  <div class="intro">
    <p>…</p>                                                        <!-- uno por profile.about -->
  </div>

  <section aria-labelledby="about-services-title">                   <!-- si hay services -->
    <SectionTitle as="h2" id="about-services-title">What I'm Doing</SectionTitle>
    <ul class="services">                                           <!-- grid -->
      <li><ServiceCard service={…} /></li>
    </ul>
  </section>

  <!-- si hay testimonials: hermanos directos en .page; la región es la <section> del carrusel (decisión 20) -->
  <SectionTitle as="h2" id="about-testimonials-title">Testimonials</SectionTitle>
  <TestimonialCarousel testimonials={cv.testimonials} labels={carouselLabels} labelledBy="about-testimonials-title" className={styles.testimonials} />
</div>
```

## API

```ts
export interface AboutPageProps {
  className?: string;
}
```

`className` se une a la clase `.page` del raíz (G-B). Que AppLayout no la pase
hoy no la elimina: es la superficie común de las piezas y tiene su test de
unión (test 8).

Datos con `useCv()` (`profile.about`, `services`, `testimonials`) y textos con
`useLocale().t` (`t.about.*`, `t.testimonials.*`). Es un componente de página:
**sí** puede usar esos hooks (excepción documentada en `specs/README.md`).

Los labels del carrusel son las plantillas crudas de `t.testimonials`:
`readMore` recibe `{author}`, `slide` recibe `{current}`/`{total}`, `goToSlide`
recibe `{n}` — **quien interpola con `format` es el carrusel, nunca la página**
(RF-3). Mapeo explícito:

```ts
const carouselLabels: TestimonialCarouselLabels = {
  carousel: t.testimonials.carouselLabel,
  slide: t.testimonials.slideLabel,   // "{current} of {total}"
  goToSlide: t.testimonials.goToSlide, // "Go to slide {n}"
  readMore: t.testimonials.readMore,   // "Read full testimonial from {author}"
  close: t.testimonials.close,
};
```

## Estilos y tokens

Solo layout (el aspecto es de los componentes):

| Parte | Valor |
|---|---|
| `.page` | **Flujo de bloque normal** (no flex ni grid): `.page > * + * { margin-top: var(--stack-gap); }`. El `h1` es el primer hijo. |
| `.intro` | `display: flex; flex-direction: column; gap: var(--space-4);` párrafos con `margin: 0` |
| `.services` | `display: grid; gap: var(--layout-gap); list-style: none; margin: 0; padding: 0;` → ≥ lg: `grid-template-columns: repeat(2, minmax(0, 1fr));` |
| `.testimonials` (se pasa como `className` al raíz del carrusel) | `margin-top: 0`: el `h2` "Testimonials" y el carrusel son hermanos directos de `.page` (decisión 20) y el par título→contenido lo resuelve el `margin-bottom` del `h2` (1.25rem, `foundations/layout.md` → "Espaciado vertical"), el mismo valor que h2→`ul` en servicios; sin este `0`, `* + *` lo inflaría a `--stack-gap` |

**Por qué bloque y no flex:** en ≥ lg la solapa de navegación flota a la
derecha (`CornerTab placement="float"`) y el `h1` tiene que fluir a su lado.
Un contenedor flex/grid (o con `overflow` ≠ `visible`) crea un contexto de
formato propio y se angostaría entero junto a la solapa en vez de fluir.
Los bloques internos que vienen después del `h1` (listas, grids, secciones)
sí pueden ser flex/grid: para cuando empiezan, la solapa ya terminó.

## Estados

- Sin `profile.about` (array vacío) → no renderiza `.intro`. (Sin test
  propio: no se inventa cobertura; verificación por inspección del código.)
- Sin `services` → no renderiza esa `<section>`.
- Sin `testimonials` → no renderiza esa `<section>`.
- El `h1` se renderiza siempre.

## Responsive

Servicios en 1 columna; 2 columnas ≥ lg (992). El carrusel resuelve su propio
responsive (1 / 2 por vista).

## Accesibilidad

- Un único `h1` (el del panel).
- Cada región nombrada por su `h2`: la de servicios, `<section>` de la página; la de testimonios, la `<section>` propia del carrusel (decisión 20) → ambas aparecen como región.
- La lista de servicios es `<ul>`: se anuncia la cantidad.
- `.services` lleva `list-style: none` sin `role="list"`, igual que SkillList:
  el quirk Safari/VoiceOver se resuelve de forma unificada en QA F5 (decisión
  de Clarificación F4); la página no lo decide acá.

## Tests esperados

(Envolviendo con `LocaleProvider` y el contenido de ejemplo del kit; las
variantes con colecciones vacías se obtienen mockeando el módulo de contenido
(`vi.mock` con delegación, precedente `LanguageSwitcher.test.tsx`); los tests
montan `AccentGradientDefs` y `HexAvatarDefs` de armazón por sus hijos con
`tone="gradient"`.)

El mapeo de `carouselLabels` se verifica en los tests del carrusel y en
AppLayout; la página no agrega test propio de labels.

1. Heading nivel 1 con `t.about.title`, único: `getAllByRole("heading", { level: 1 })` de longitud 1.
2. Un párrafo por cada elemento de `profile.about`.
3. Región con nombre `t.about.services` que contiene un `article` por servicio.
4. Región con nombre `t.about.testimonials` que contiene el carrusel (es la `<section>` del carrusel, no un wrapper de la página).
5. Con `services` vacío (mock del módulo de contenido) no existe la región de servicios; con `testimonials` vacío (mock) no existen ni el `h2` "Testimonials" ni la región (RF-2). En ambos escenarios el `h1` sigue siendo el único (longitud 1).
6. Con `locale = "es"` muestra los textos de `ui.es` y el contenido de `cv.es`.
7. `expectNoA11yViolations` sin violaciones.
8. Concatena `className` en el raíz `.page` (G-B).

## No hacer

- No agregar estilos visuales (colores, fondos, bordes): solo layout.
- No importar el contenido directamente: siempre `useCv()`.
