// Separator — línea horizontal de 1px que separa bloques dentro de un
// `Box variant="outer"`, full-bleed hasta los bordes de la card
// (specs/primitives/Separator/spec.md). T1: raíz decorativa (RF-1, RF-2): un
// `<div>` con `aria-hidden="true"`, sin `role` y sin `<hr>` (un `<hr>`
// anunciaría un cambio de tema del contenido; spec → Accesibilidad y
// "No hacer"). Sin hijos: es decoración pura (spec → Anatomía).
// Diferidos según tasks.md: la línea 1px `--color-track`, el full-bleed
// calculado desde `--box-padding` y el `margin-block: var(--separator-gap)`
// (T2 — el módulo `Separator.module.css` nace ahí con su `feat`, precedente
// IconBox/SectionTitle; en T1 no hay nada que estilizar), la unión de
// `className` al raíz (T2) y el cierre `expectNoA11yViolations` (T3).

// API (spec → API): `SeparatorProps { className?: string }`, tipada desde T1
// pero **sin conectar**: `className` queda declarada sin comportamiento (su
// unión a la clase base del `<div>` raíz se conecta en T2, plan → Interfaz;
// P2), igual que `decorated`/`icon`/`className` en T1 de SectionTitle. En T1
// la función no recibe parámetros: ninguna prop tiene efecto en el render
// todavía (alternativa descartada: `(_props: SeparatorProps)`, que viola
// `@typescript-eslint/no-unused-vars` con `args: "after-used"` — el prefijo
// `_` del convenio solo funciona delante de un argumento usado).
export interface SeparatorProps {
  /** Se une a la clase base del `<div>` raíz (comportamiento en T2). */
  className?: string;
}

export function Separator() {
  // RF-1 (T1): el raíz es un `<div>` decorativo con `aria-hidden="true"` (la
  // línea de 1px la dibuja el módulo desde T2; spec → Estilos y tokens:
  // grosor por inspección del CSS, jsdom no lo computa).
  // RF-2 (T1): sin `role="separator"` y sin `<hr>` (spec → "No hacer"): el
  // separador es decoración dentro del Box outer. Sin hijos requeridos.
  // La unión de `className` NO se conecta todavía (T2): la firma recibirá
  // `SeparatorProps` al conectarla.
  return <div aria-hidden="true" />;
}
