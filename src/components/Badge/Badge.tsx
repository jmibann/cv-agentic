// Badge — etiqueta compacta sobre fondo tintado
// (specs/primitives/Badge/spec.md). T1: render base (RF-1, RF-2): el raíz es
// `<span>` por defecto y `<li>` con `as="li"`, con `children` como texto.
// T2: la `className` del consumidor se unirá a la clase base del raíz (RF-3);
// en T1 queda declarada en la API pero inerte (todavía no se aplica). T3:
// clase base y estilos por tokens en Badge.module.css (RF-4, RF-5) y cierre
// a11y; aquí aún no se importa el módulo (el "Hecho cuando" de T1 solo exige
// elemento + texto).

// Elementos válidos para `as` (spec → API): span por defecto; `li` para los
// chips de SkillList (RF-2: la validez del contexto de lista es del
// consumidor).
type BadgeElement = "span" | "li";

// API (spec → API): `children: string` a propósito (plan → Decisiones: el tipo
// fuerza "solo texto"; Nada de íconos ni elementos anidados, spec → No hacer).
export interface BadgeProps {
  /** Solo texto: los chips no anidan elementos ni íconos. */
  children: string;
  as?: BadgeElement;
  /** Se une a la clase base del elemento raíz (unión: T2; inerte en T1). */
  className?: string;
}

export function Badge({ as, children }: BadgeProps) {
  // RF-1/RF-2: default `span`; `as` cambia el elemento raíz. Mismo patrón que
  // Box (`const El = as ?? "div"`).
  const El = as ?? "span";

  // RF-1: un solo elemento, el texto directo en el raíz (spec → Anatomía). Sin
  // `className` en el raíz todavía (T2/T3) y sin roles añadidos (RF-4).
  return <El>{children}</El>;
}
