# Plan — SkillList

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/SkillList/SkillList.tsx` | `<ul>` nombrada con un `Badge as="li"` por skill (orden datos), keys índice+valor, wrap, unión `className` | RF-1…RF-6 |
| `src/components/SkillList/SkillList.module.css` | lista flex wrap `gap: var(--space-2)`, `list-style: none`, margin/padding 0, cero `@media` | RF-5 |
| `src/components/SkillList/SkillList.test.tsx` | tests (incl. 2 casos `@ts-expect-error`) + cierre a11y | todas |
| `src/components/SkillList/index.ts` | re-export | — |

## Funciones puras y algoritmo

Ninguno. Type discriminado `SkillListName` (exactamente uno de `labelledBy`/`label`) directo de la spec → API; los dos casos inválidos se prueban con `// @ts-expect-error` (decisión 15: **ambos** casos).

## Interfaz

`SkillListProps = SkillListName & { skills: readonly string[]; className?: string }`; `className` al `<ul>` raíz (G-B).

## Decisiones

- El chip lo pinta Badge íntegramente: SkillList **no** le pasa `className` (`.chip` de la anatomía es ilustrativa; decisión 15).
- `skills=[]` → `null` (RF-1).
- Keys: `` `skill-${index}-${value}` `` (estables para el mismo array; fórmula documentada en el código — inspección RF-6; el test 5 cubre "duplicadas sin warning" spyando `console.error`).
- Vacío de nombre accesible: si `label` llega vacío en runtime no se contempla (el tipo y el consumidor lo evitan; "No inventar alcance").
- Superficie esperada `--color-surface` (card outer): restricción de uso, verificable en ResumePage (F4) — RF-4.
- Chip largo: desborda sin regla (decisión 15) — se constata en QA F5 con contenido real.

## Estrategia de tests

Render con fixture de skills; armazón `<h2 id="…">Skills</h2>` en el DOM del test para el caso `labelledBy` (criterio Badge-`ul`/Overhead-`dl`, decisión 15/nota). Tests: `getByRole("list", { name })` con `listitem` × n en orden; nombre por `label`; vacío → null; duplicadas → sin warning (spy `console.error`) y 3 items; unión `className` (#99); los dos casos `// @ts-expect-error` se escriben como `it` que construye la expresión tipada inválida (sin render), mismo criterio de "tests de tipos" de la fase. Cierre `expectNoA11yViolations`. P1: wrap/gap/cero media → inspección.

Cobertura: T1→RF-1,RF-2,RF-3 · T2→RF-6,RF-4/5 (inspección) + cierre. (RF-2 casos tipos van en T1 con el archivo.)
