# Plan — ResumePage

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/pages/ResumePage/ResumePage.tsx` | página: `.page` con `h1` siempre; `.columns` con `ResumeSection` education/experience (con `locale={locale}` de `useLocale()` y `timelineIdPrefix="edu"/"exp"` fijados acá, decisión 14) `<section aria-labelledby>` de skills con `SkillList labelledBy`; sin ordenar nada | RF-1,RF-2,RF-4,RF-5,RF-7 |
| `src/pages/ResumePage/ResumePage.module.css` | solo layout: `.page` flujo de bloque `* + * { margin-top: var(--stack-gap) }`; `.columns` grid `row-gap --stack-gap / column-gap --layout-gap`, **único `@media (min-width: 768px)`** con 2 columnas y cláusula `grid-column: 1 / -1` para hijo único | RF-3, RF-6 |
| `src/pages/ResumePage/ResumePage.test.tsx` | tests 1–9; variantes (vacíos, `end: null`) con `vi.mock` del módulo de providers (`importOriginal` + `useCv` override, precedente `LanguageSwitcher.test.tsx`); wrapper `LocaleProvider`; armazón `AccentGradientDefs` (no `HexAvatarDefs`, no ThemeProvider) | todas |
| `src/pages/ResumePage/index.ts` | re-export `ResumePage` + `ResumePageProps` | — |

## Funciones puras y algoritmo

Ninguna. La página solo lee colecciones del `cv` en el orden dado (RF-5) y
mapea textos. Los ids derivados (`resume-education-title`, ítems `${prefix}-…`)
los generan las piezas hijas; acá solo se fijan los prefijos `"edu"`/`"exp"`.

## Interfaz

`ResumePageProps { className?: string }` → unida a `.page` (G-B, mismo patrón
AboutPage). Datos `useCv()`; `const { t, locale } = useLocale()` — `locale` es
el **idioma activo del provider**, no `cv.locale` (especificación aclarada en
la Clarificación F4, P7).

## Decisiones

- **`timelineIdPrefix` fijos por la página** (`"edu"`, `"exp"`): son el contrato
  que ResumeSection delega explícitamente (su decisión 14); alternativa
  descartada — derivación interna (prohibida por esa spec).
- **Reenvío de `presentLabel` como RF propio con test mockeado** (P6): el
  renderizado de "Present" es de Timeline (pieza implementada, testada ahí);
  esta página solo garantiza pasar la etiqueta; el test no depende de que el
  fixture del kit conserve una `end: null`.
- **`vi.mock` con `importOriginal` para vaciar/inyectar** (P1, compartido con
  AboutPage): alternativa descartada — abrir una prop de contenido en
  `LocaleProvider` (archivos de F1 cerrados).
- **Caso "ambas colecciones vacías"** absorbe el estado de RF-2 en el test 5
  ampliado (mock); la ausencia de `.columns` se verifica por inspección del
  markup generado (no hay hook de testeo de clase hasheada).
- **Sin `role="list"`** en skills (viene de SkillList): quirk unificado en F5.

## Estrategia de tests

Igual patrón AboutPage: `region` por nombre (`t.resume.education`,
`t.resume.experience`, `t.resume.skills`), `listitem` por entrada/skill,
`getAllByRole heading level 1` longitud 1, test `es` con locale `es`, cierre
`expectNoA11yViolations`. Mock de contenido para `end: null` y vacíos. Las
cláusulas de layout (grid ≥ md, `grid-column: 1 / -1`, no-BFC) por inspección
del CSS + QA F5 (la spec lo declara); "sin ordenar" por inspección del código.

Cobertura: T1→RF-1,RF-2(columns),RF-5(incl. test 7 es) · T2→RF-7,RF-2(vacíos) ·
T3→RF-4 · T4→RF-3,RF-6 (inspección) + unión `className` + cierre a11y.
