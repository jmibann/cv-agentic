// AboutPage — panel About (specs/pages/AboutPage/spec.md). T1 (RF-1, RF-2
// intro): raíz `div.page` con el `h1` de `t.about.title` como PRIMER hijo
// (`SectionTitle as="h1" decorated`, spec → Anatomía) y `.intro` con un `<p>`
// por elemento de `profile.about`; con `profile.about` vacío no se renderiza
// `.intro` (spec → Estados). Datos con `useCv()` y textos con `useLocale().t`
// (RF-3): la página no importa contenido ni hardcodea textos (C2/C3).
// T2 hecha: sección de servicios (RF-2/RF-5) — `<section aria-labelledby>`
// nombrada por su `SectionTitle as="h2"` con `id="about-services-title"`
// (Anatomía literal), que SOLO se monta si `cv.services` no está vacío (RF-2:
// "SI services está vacío, ENTONCES no renderiza su <section>") y renderiza los
// servicios como `<ul>` con un `<li>` por `ServiceCard` (RF-5: "renderiza los
// servicios como <ul>"; sin `role="list"`: el quirk Safari/VoiceOver se unifica
// en QA F5, decisión de Clarificación F4). Clave por `service.id` (único por
// esquema, `data/cv.schema.json`), no por el texto.
// T3 hecha: testimonios (RF-2/RF-3) — `h2` "Testimonials" (`SectionTitle
// as="h2" id="about-testimonials-title"`) y `TestimonialCarousel` como
// HERMANOS DIRECTOS del raíz (decisión 20: la región es la `<section>` propia
// del carrusel, sin wrapper de la página), montados solo si
// `cv.testimonials` no está vacío (RF-2: "SI testimonials está vacío,
// ENTONCES no renderiza ni el h2 ni el carrusel"). El carrusel recibe
// `labelledBy="about-testimonials-title"` (su `<section>` se nombra por el h2;
// nunca `aria-label` propio) y `labels={carouselLabels}`: objeto literal con
// las 5 claves CRUDAS de `t.testimonials` — la página NO importa ni llama
// `format` (RF-3: quien interpola es el carrusel).
// T4 hecha: `AboutPage.module.css` declara la tabla "Estilos y tokens" AL
// PIE (RF-4/RF-6, por inspección: `.page` flujo de bloque con
// `* + * { margin-top: var(--stack-gap) }` sin flex/grid/overflow; `.intro`
// flex col gap --space-4 + `p { margin: 0 }`; `.services` grid --layout-gap
// 1 col → 2 col en el ÚNICO @media (992, lg); `.testimonials { margin-top: 0 }`
// pasado como `className` al raíz del carrusel) y las clases del raíz/bloques
// se conectan vía `styles.x` (los tests las afirman con el canon #99
// `styles.x ?? "x"`). La unión de `className` del consumidor al raíz
// (G-B/test 8) usa el mecanismo canónico: array + filtro de undefined + join,
// base primero (precedente ServiceCard/Icon/Box). `index.ts` re-exporta la
// superficie pública (AboutPage + AboutPageProps).
// Nota registrada (menor de T1, inspección al cerrar la pieza): `key={paragraph}`
// en `.intro` usa el texto como clave — con duplicados reales React daría
// warning de claves repetidas; la spec no habla de keys y no se cambia sin
// indicación del reviewer (las claves de servicios/testimonios sí salen del
// `id` garantizado por esquema).

import type { ReactNode } from "react";

import { TestimonialCarousel } from "../../components/TestimonialCarousel";
import type { TestimonialCarouselLabels } from "../../components/TestimonialCarousel";
import { ServiceCard } from "../../components/ServiceCard";
import { SectionTitle } from "../../components/SectionTitle";
import { useCv, useLocale } from "../../providers/LocaleProvider";

import styles from "./AboutPage.module.css";

// API (spec → API): `className` se une a la clase `.page` del raíz (G-B);
// la unión se conecta en T4 (test 8: base y externa COEXISTEN).
export interface AboutPageProps {
  className?: string;
}

export function AboutPage({ className }: AboutPageProps): ReactNode {
  // RF-3: único camino a los datos y a los textos (i18n.md → Hooks; la página
  // es componente de página y puede usar estos hooks — excepción de C2
  // documentada en specs/README.md).
  const { t } = useLocale();
  const cv = useCv();

  // RF-3 / plan P8: plantillas CRUDAS de `t.testimonials` (mapeo explícito de
  // la spec → API, 5 claves). La página NO llama `format`: quien interpola
  // `{current}`/`{total}`/`{n}`/`{author}` es el carrusel.
  const carouselLabels: TestimonialCarouselLabels = {
    carousel: t.testimonials.carouselLabel,
    slide: t.testimonials.slideLabel,
    goToSlide: t.testimonials.goToSlide,
    readMore: t.testimonials.readMore,
    close: t.testimonials.close,
  };

  // T4 (G-B/#99, spec → API): unión canónica del raíz — array + filtro de
  // undefined + join, base primero (precedente ServiceCard/Icon/Box); sin
  // `className` externa queda solo la base del módulo, con ella ambas
  // COEXISTEN (test 8). Bajo `noUncheckedIndexedAccess` la clase del módulo es
  // `string | undefined`.
  const rootClassName = [styles.page, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return (
    <div className={rootClassName}>
      {/* RF-1: el h1 se renderiza siempre, primero en el raíz (RF-4: flujo de
          bloque para que fluya junto a la solapa flotante de NavTabs). */}
      <SectionTitle as="h1" decorated>
        {t.about.title}
      </SectionTitle>

      {/* RF-2 (intro) + spec → Estados: sin párrafos no se monta .intro. */}
      {cv.profile.about.length > 0 ? (
        <div className={styles.intro}>
          {cv.profile.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : null}

      {/* T2 · RF-2 (servicios): la <section> entera no se monta si
          cv.services está vacío (spec → Estados). RF-5: región nombrada por
          su h2 vía aria-labelledby↔id (Anatomía literal) y servicios como
          <ul> con un <li> por card; sin role="list" (quirk unificado en
          QA F5). El texto del título sale de t.about.services, el array de
          useCv() (RF-3, C2/C3). */}
      {cv.services.length > 0 ? (
        <section aria-labelledby="about-services-title">
          <SectionTitle as="h2" id="about-services-title">
            {t.about.services}
          </SectionTitle>
          <ul className={styles.services}>
            {cv.services.map((service) => (
              // Clave por service.id: único por esquema (data/cv.schema.json),
              // a diferencia del texto de los párrafos de .intro.
              <li key={service.id}>
                <ServiceCard service={service} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* T3 · RF-2 (testimonios): h2 del título y carrusel como hermanos
          DIRECTOS del raíz (decisión 20: la región es la <section> propia del
          TestimonialCarousel, nombrada vía labelledBy; la página NO la
          envuelve). Nada se monta con cv.testimonials vacío (spec → Estados).
          Fragment: sin nodo wrapper intermedio, el DOM hijo del raíz es h2 y
          section. T4 conecta `styles.testimonials` (margin-top: 0) como
          `className` del carrusel: el TestimonialCarousel la UNE a su clase
          base del <section> raíz (G-B de su spec). */}
      {cv.testimonials.length > 0 ? (
        <>
          <SectionTitle as="h2" id="about-testimonials-title">
            {t.about.testimonials}
          </SectionTitle>
          <TestimonialCarousel
            testimonials={cv.testimonials}
            labels={carouselLabels}
            labelledBy="about-testimonials-title"
            className={styles.testimonials}
          />
        </>
      ) : null}
    </div>
  );
}
