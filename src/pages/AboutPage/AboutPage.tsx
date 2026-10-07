// AboutPage — panel About (specs/pages/AboutPage/spec.md). T1 (RF-1, RF-2
// intro): raíz `div.page` con el `h1` de `t.about.title` como PRIMER hijo
// (`SectionTitle as="h1" decorated`, spec → Anatomía) y `.intro` con un `<p>`
// por elemento de `profile.about`; con `profile.about` vacío no se renderiza
// `.intro` (spec → Estados). Datos con `useCv()` y textos con `useLocale().t`
// (RF-3): la página no importa contenido ni hardcodea textos (C2/C3).
// Diferidos a sus tareas: sección de servicios (T2), h2 "Testimonials" +
// `TestimonialCarousel` y locale `es` (T3), módulo CSS con el layout de la
// tabla "Estilos y tokens" y unión de `className` al raíz (T4) — por eso hoy
// las clases `page`/`intro` son literales del markup, sin módulo todavía
// ("Hecho cuando" de T1).
// `carouselLabels` tampoco aparece acá: llega con el carrusel en T3 (RF-3).

import type { ReactNode } from "react";

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
    </div>
  );
}
