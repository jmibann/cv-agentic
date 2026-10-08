# ResumePage
Estado: implementada

## Propósito

Contenido del panel **Resume**: Education y Experience (timelines) y Skills
(chips). Se renderiza dentro del tabpanel de AppLayout.

## Requisitos (EARS)

- RF-1: EL SISTEMA renderiza siempre un único `h1` con `t.resume.title`, con jerarquía h1 → h2 (sección) → h3 (ítem del Timeline).
- RF-2: CUANDO `education` o `experience` tienen entradas, ENTONCES EL SISTEMA renderiza esa `<section>` nombrada por su `h2`; SI un conjunto está vacío, ENTONCES no aparece su columna, y SI ambos están vacíos, no renderiza `.columns`.
- RF-3: CUANDO en ≥ md queda una sola columna, ENTONCES EL SISTEMA la hace ocupar el ancho completo (sin dejar hueco en la grilla). Verificación: inspección del CSS (`grid-column: 1 / -1` en ≥ md) + QA F5.
- RF-4: CUANDO `skills` no está vacío, ENTONCES EL SISTEMA renderiza la `<section>` de skills con su lista; SI está vacío, ENTONCES no la renderiza.
- RF-5: EL SISTEMA obtiene los datos con `useCv()` y los textos con `useLocale().t`, sin ordenar las entradas (el orden es el de los datos). Verificación de "sin ordenar": inspección del código (el reviewer).
- RF-6: EL SISTEMA mantiene `.page` en flujo de bloque normal (para que el `h1` fluya junto a la solapa flotante), resuelve las columnas con grid a partir de md y aplica solo layout, sin estilos visuales. Verificación: inspección del CSS + QA F5.
- RF-7: EL SISTEMA reenvía `t.timeline.present` como `presentLabel` a cada `ResumeSection`. Verificación: test 4 con contenido mockeado (no depende del fixture del kit).

## Anatomía

```html
<div class="page">
  <SectionTitle as="h1" decorated>Resume</SectionTitle>              <!-- t.resume.title -->

  <div class="columns">
    <ResumeSection id="education"  title={t.resume.education}  icon="book-open"
                   entries={cv.education}  locale={locale} timelineIdPrefix="edu"
                   presentLabel={t.timeline.present} />
    <ResumeSection id="experience" title={t.resume.experience} icon="briefcase"
                   entries={cv.experience} locale={locale} timelineIdPrefix="exp"
                   presentLabel={t.timeline.present} />
  </div>

  <section aria-labelledby="resume-skills-title">                    <!-- si hay skills -->
    <SectionTitle as="h2" id="resume-skills-title">Skills</SectionTitle>
    <SkillList skills={cv.skills} labelledBy="resume-skills-title" />
  </section>
</div>
```

`ResumeSection` genera sus propios ids (`resume-education-title`,
`resume-experience-title`) y no se renderiza si su colección está vacía. La
página **fija los prefijos de ids de Timeline** (decisión 14 de ResumeSection,
prop obligatoria `timelineIdPrefix`): `"edu"` y `"exp"`; no hay derivación
interna.

## API

```ts
export interface ResumePageProps {
  className?: string;
}
```

`className` se une a la clase `.page` del raíz (G-B); tiene su test de unión
(test 9) aunque AppLayout no la pase hoy.

Datos con `useCv()` (`education`, `experience`, `skills`) y textos e idioma con
`useLocale()` (`const { t, locale } = useLocale()`: `t.resume.*`,
`t.timeline.present`; `locale` es el **idioma activo** del provider, no
`cv.locale`, que es el idioma del archivo). Componente de página: **sí** puede
usar esos hooks.

## Estilos y tokens

Solo layout:

| Parte | Valor |
|---|---|
| `.page` | **Flujo de bloque normal** (no flex ni grid): `.page > * + * { margin-top: var(--stack-gap); }`. El `h1` es el primer hijo. |
| `.columns` | `display: grid; row-gap: var(--stack-gap); column-gap: var(--layout-gap);` → ≥ md (solo layout): `grid-template-columns: repeat(2, minmax(0, 1fr));`; con un único hijo en ≥ md, `grid-column: 1 / -1` (ancho completo, sin hueco — RF-3) |

**Por qué bloque y no flex:** en ≥ lg la solapa de navegación flota a la
derecha (`CornerTab placement="float"`) y el `h1` tiene que fluir a su lado.
Un contenedor flex/grid (o con `overflow` ≠ `visible`) crea un contexto de
formato propio y se angostaría entero junto a la solapa en vez de fluir.
Los bloques internos que vienen después del `h1` (listas, grids, secciones)
sí pueden ser flex/grid: para cuando empiezan, la solapa ya terminó.

## Estados

- Sin `education` o sin `experience` → esa columna no aparece; si queda una
  sola, ocupa el ancho completo (la grilla no deja un hueco: con un único hijo,
  usar `grid-column: 1 / -1` en ≥ md).
- Sin ninguna de las dos → no renderiza `.columns`.
- Sin `skills` → no renderiza la `<section>` de skills.
- El `h1` se renderiza siempre.

## Responsive

Education y Experience apiladas en < md; lado a lado en ≥ md (768). Skills
siempre a ancho completo, debajo.

## Accesibilidad

- Un único `h1`.
- Education, Experience y Skills son regiones nombradas por su `h2`.
- Jerarquía: h1 → h2 (sección) → h3 (ítem del Timeline).

## Tests esperados

(Envolviendo con `LocaleProvider` y el contenido de ejemplo del kit; las
variantes con colecciones vacías o con `end: null` se obtienen mockeando el
módulo de contenido (`vi.mock` con delegación, precedente
`LanguageSwitcher.test.tsx`); los tests montan `AccentGradientDefs` de armazón
(SectionTitle→IconBox→Icon `tone="gradient"`); no necesitan `HexAvatarDefs` ni
ThemeProvider.)

1. Heading nivel 1 con `t.resume.title`, único: `getAllByRole("heading", { level: 1 })` de longitud 1.
2. Regiones con nombre `t.resume.education` y `t.resume.experience`, cada una con un `listitem` por entrada.
3. Región con nombre `t.resume.skills` con una lista que tiene un `listitem` por skill.
4. Con el contenido mockeado con una entrada `"end": null` (sin depender del fixture del kit), el panel muestra `t.timeline.present` (RF-7).
5. Con `education` vacío (mock) no existe esa región y Experience sigue presente; con `education` y `experience` ambas vacías (mock) no existe ninguna de las dos regiones y el `h1` sigue presente (RF-2; la ausencia de `.columns` se verifica por inspección del markup).
6. Con `skills` vacío (mock) no existe la región de skills.
7. Con `locale = "es"` muestra textos de `ui.es` y contenido de `cv.es`.
8. `expectNoA11yViolations` sin violaciones.
9. Concatena `className` en el raíz `.page` (G-B).

## No hacer

- No agregar estilos visuales: solo layout.
- No ordenar las entradas (el orden es el de los datos).
