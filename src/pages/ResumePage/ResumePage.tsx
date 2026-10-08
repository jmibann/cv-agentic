// ResumePage — panel Resume (specs/pages/ResumePage/spec.md). T1 (RF-1,
// RF-2 columns, RF-5): raíz `div.page` con el `h1` de `t.resume.title` como
// PRIMER hijo (`SectionTitle as="h1" decorated`, spec → Anatomía) y `.columns`
// con dos `ResumeSection` (education/experience), cada una montada SOLO si su
// colección no está vacía (RF-2: "SI un conjunto está vacío, ENTONCES no
// aparece su columna"; la rama vacía se testa en T2 con mock). La página FIXA
// los `timelineIdPrefix` ("edu"/"exp", decisión 14 de ResumeSection: sin
// derivación interna) y reenvía `locale` —el **idioma activo** de
// `useLocale()`, NO `cv.locale` (Clarificación F4 P7)— y
// `presentLabel={t.timeline.present}` (RF-7). Datos con `useCv()` y textos con
// `useLocale().t` (RF-5): la página no importa contenido, no hardcodea textos
// (C2/C3) y NO ordena las entradas (el orden es el de los datos; el test 2
// refuerza el orden observablemente).
// Diferidos a sus tareas: módulo CSS con la tabla "Estilos y tokens"
// (`.page`/`.columns`), unión de `className` al raíz y cierre
// `expectNoA11yViolations` (T4) — por eso hoy las clases `page`/`columns` son
// literales del markup, sin módulo todavía ("Hecho cuando" de T1; los asserts
// de clases con el canon #99 llegan con T4, precedente AboutPage). `index.ts`
// también llega en T4 (criterio AboutPage).
// T2 hecha: el bloque `.columns` se monta solo si AL MENOS UNA de las dos
// colecciones tiene entradas (RF-2: "SI ambos están vacíos, no renderiza
// .columns"; los guards por columna de T1 siguen, cada sección no aparece con
// su conjunto vacío). `presentLabel` ya viajaba desde T1 (RF-7) y su test 4
// con mock lo fija.
// T3 hecha: sección de skills (RF-4) — `<section aria-labelledby=
// "resume-skills-title">` con su `SectionTitle as="h2"` con ese id y
// `SkillList skills={cv.skills} labelledBy="resume-skills-title"` (la API de
// SkillList exige nombre: `labelledBy` al h2 visible, spec → Anatomía),
// montada SOLO si `cv.skills` no está vacío ("SI está vacío, ENTONCES no la
// renderiza"; no alcanza con el null interno de SkillList: sin el guard la
// región nombrada quedaría vacía). Es hija directa del raíz, DESPUÉS de
// .columns (spec → Responsive), como `<section>` — no `<div>` —, por eso el
// assert 5b de T2 (raíz sin `<div>` hijo) sigue siendo válido.

import type { ReactNode } from "react";

import { ResumeSection } from "../../components/ResumeSection";
import { SectionTitle } from "../../components/SectionTitle";
import { SkillList } from "../../components/SkillList";
import { useCv, useLocale } from "../../providers/LocaleProvider";

// API (spec → API): `className` se une a la clase `.page` del raíz (G-B). Se
// declara ya porque es la superficie fija de la pieza; la unión se conecta en
// T4 junto con el módulo CSS (la unión es el test 9, tarea T4).
export interface ResumePageProps {
  className?: string;
}

export function ResumePage(): ReactNode {
  // RF-5: único camino a los datos, los textos y el idioma (i18n.md → Hooks).
  // `locale` es el idioma activo del provider (NO `cv.locale`: ese es el
  // idioma del archivo JSON, spec → API).
  const { t, locale } = useLocale();
  const cv = useCv();

  return (
    <div className="page">
      {/* RF-1: el h1 se renderiza siempre, primero en el raíz (RF-6: flujo de
          bloque para que fluya junto a la solapa flotante de NavTabs). */}
      <SectionTitle as="h1" decorated>
        {t.resume.title}
      </SectionTitle>

      {/* Anatomía: .columns con las dos secciones. RF-2 en sus dos ramas:
          cada columna no aparece si SU conjunto está vacío (guards por
          sección, T1) y el contenedor .columns tampoco se monta si AMBOS están
          vacíos (T2: "SI ambos están vacíos, no renderiza .columns"). El test
          5 verifica las ausencias por rol; la no-montada del contenedor, por
          inspección del markup (raíz sin <div> hijo directo). */}
      {cv.education.length > 0 || cv.experience.length > 0 ? (
        <div className="columns">
          {cv.education.length > 0 ? (
            <ResumeSection
              id="education"
              title={t.resume.education}
              icon="book-open"
              entries={cv.education}
              locale={locale}
              timelineIdPrefix="edu"
              presentLabel={t.timeline.present}
            />
          ) : null}
          {cv.experience.length > 0 ? (
            <ResumeSection
              id="experience"
              title={t.resume.experience}
              icon="briefcase"
              entries={cv.experience}
              locale={locale}
              timelineIdPrefix="exp"
              presentLabel={t.timeline.present}
            />
          ) : null}
        </div>
      ) : null}

      {/* T3 · RF-4: skills — <section aria-labelledby> + SectionTitle as="h2"
          con ese id (Anatomía literal) + SkillList con `labelledBy` al mismo
          id (su API exige nombre accesible). Guard por colección: con
          cv.skills vacío no se monta NI la región ni el h2 (la región
          nombraría igual por su labelledby aunque SkillList devolviera null).
          RF-5: las skills viajan en el orden de los datos (el map sin sort es
          de SkillList, RF-1 suya). RF-4 de SkillList (superficie): la lista
          va directa sobre la superficie del panel, nunca dentro de un Box
          inner — la página la cuelga del raíz, cumplido. */}
      {cv.skills.length > 0 ? (
        <section aria-labelledby="resume-skills-title">
          <SectionTitle as="h2" id="resume-skills-title">
            {t.resume.skills}
          </SectionTitle>
          <SkillList skills={cv.skills} labelledBy="resume-skills-title" />
        </section>
      ) : null}
    </div>
  );
}
