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
// Diferidos a sus tareas: h2 "Testimonials" + `TestimonialCarousel` y locale
// `es` (T3), módulo CSS con el layout de la tabla "Estilos y tokens" y unión
// de `className` al raíz (T4) — por eso hoy las clases `page`/`intro`/
// `services` son literales del markup, sin módulo todavía ("Hecho cuando" de
// T1/T2, y la unión se asierta con `styles.x ?? "x"` en T4, canon #99).
// `carouselLabels` tampoco aparece acá: llega con el carrusel en T3 (RF-3).

import type { ReactNode } from "react";

import { ServiceCard } from "../../components/ServiceCard";
import { SectionTitle } from "../../components/SectionTitle";
import { useCv, useLocale } from "../../providers/LocaleProvider";

// API (spec → API): `className` se une a la clase `.page` del raíz (G-B). Se
// declara ya porque es la superficie fija de la pieza; la unión se conecta en
// T4 junto con el módulo CSS (los tests de unión son el test 8, tarea T4).
export interface AboutPageProps {
  className?: string;
}

export function AboutPage(): ReactNode {
  // RF-3: único camino a los datos y a los textos (i18n.md → Hooks; la página
  // es componente de página y puede usar estos hooks — excepción de C2
  // documentada en specs/README.md).
  const { t } = useLocale();
  const cv = useCv();

  return (
    <div className="page">
      {/* RF-1: el h1 se renderiza siempre, primero en el raíz (RF-4: flujo de
          bloque para que fluya junto a la solapa flotante de NavTabs). */}
      <SectionTitle as="h1" decorated>
        {t.about.title}
      </SectionTitle>

      {/* RF-2 (intro) + spec → Estados: sin párrafos no se monta .intro. */}
      {cv.profile.about.length > 0 ? (
        <div className="intro">
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
          <ul className="services">
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
    </div>
  );
}
