# AboutPage

## Propósito

Contenido del panel **About**: presentación, servicios ("What I'm Doing") y
testimonios. Se renderiza dentro del tabpanel de AppLayout.

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

  <section aria-labelledby="about-testimonials-title">               <!-- si hay testimonials -->
    <SectionTitle as="h2" id="about-testimonials-title">Testimonials</SectionTitle>
    <TestimonialCarousel testimonials={cv.testimonials} labels={carouselLabels} labelledBy="about-testimonials-title" />
  </section>
</div>
```

## API

```ts
export interface AboutPageProps {
  className?: string;
}
```

Datos con `useCv()` (`profile.about`, `services`, `testimonials`) y textos con
`useLocale().t` (`t.about.*`, `t.testimonials.*`). Es un componente de página:
**sí** puede usar esos hooks (excepción documentada en `specs/README.md`).

Los labels del carrusel se arman con `format` de i18n:
`readMore` recibe `{author}`, `slide` recibe `{current}`/`{total}`, `goToSlide` recibe `{n}`
(el carrusel interpola; la página pasa las plantillas de `t.testimonials`).
Mapeo explícito:

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

**Por qué bloque y no flex:** en ≥ lg la solapa de navegación flota a la
derecha (`CornerTab placement="float"`) y el `h1` tiene que fluir a su lado.
Un contenedor flex/grid (o con `overflow` ≠ `visible`) crea un contexto de
formato propio y se angostaría entero junto a la solapa en vez de fluir.
Los bloques internos que vienen después del `h1` (listas, grids, secciones)
sí pueden ser flex/grid: para cuando empiezan, la solapa ya terminó.

## Estados

- Sin `profile.about` (array vacío) → no renderiza `.intro`.
- Sin `services` → no renderiza esa `<section>`.
- Sin `testimonials` → no renderiza esa `<section>`.
- El `h1` se renderiza siempre.

## Responsive

Servicios en 1 columna; 2 columnas ≥ lg (992). El carrusel resuelve su propio
responsive (1 / 2 por vista).

## Accesibilidad

- Un único `h1` (el del panel).
- Cada `<section>` nombrada por su `h2` → aparece como región.
- La lista de servicios es `<ul>`: se anuncia la cantidad.

## Tests esperados

(Envolviendo con `LocaleProvider` y el contenido de ejemplo del kit.)

1. Heading nivel 1 con `t.about.title`.
2. Un párrafo por cada elemento de `profile.about`.
3. Región con nombre `t.about.services` que contiene un `article` por servicio.
4. Región con nombre `t.about.testimonials` que contiene el carrusel.
5. Con `services` vacío no existe la región de servicios; ídem testimonios.
6. Con `locale = "es"` muestra los textos de `ui.es` y el contenido de `cv.es`.
7. `expectNoA11yViolations` sin violaciones.

## No hacer

- No agregar estilos visuales (colores, fondos, bordes): solo layout.
- No importar el contenido directamente: siempre `useCv()`.
