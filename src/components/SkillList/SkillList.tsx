// SkillList — skills como una sola lista de chips, sin porcentajes ni
// agrupación (specs/content/SkillList/spec.md). T1 hecha: un `<ul>` con nombre
// accesible SIEMPRE presente —por `aria-label` (`label`) o `aria-labelledby`
// (`labelledBy`), exactamente uno de los dos garantizado por el tipo
// `SkillListName` (RF-2)— con un `Badge as="li"` por skill en el orden de los
// datos (RF-1: map sin sort; RF-3: el chip lo pinta Badge íntegramente,
// decisión 15: cero props al Badge salvo `as="li"` + children; la `.chip` de
// la Anatomía es ilustrativa del `<li>` que renderiza Badge y NO se le pasa).
// Con `skills=[]` devuelve `null` (RF-1 SI-clause; plan → Decisiones). La
// `className` externa se UNE a la clase base del `<ul>` raíz (spec → API,
// G-B/#99) ya en T1 (criterio Timeline/ResumeSection T1); el módulo nace acá
// con la clase base vacía (criterio IconBox/LanguageSwitcher) y T2 le
// conectará la tabla "Estilos y tokens" completa (flex wrap, gap
// --space-2, list-style none, margen/padding 0; RF-5: cero `@media` propios).
// Keys: `skill-${index}-${value}` (RF-6: fórmula estable índice + valor,
// documentada en el map; tolera duplicadas; el test de duplicadas sin warning
// es de T2). Sin índice re-exportado todavía: `index.ts` llega con T2.

import { Badge } from "../Badge";

import styles from "./SkillList.module.css";

// API (spec → API): nombre accesible obligatorio, exactamente uno de los dos.
// Pasar ambos o ninguno es error de compilación (RF-2; los dos casos se
// verifican con // @ts-expect-error en SkillList.test.tsx).
type SkillListName =
  | { labelledBy: string; label?: never } // id del heading que nombra la lista
  | { label: string; labelledBy?: never }; // texto ya traducido (llega de fuera)

export type SkillListProps = SkillListName & {
  skills: readonly string[];
  /** Se une a la clase base del `<ul>` raíz (G-B). */
  className?: string;
};

export function SkillList({
  skills,
  className,
  label,
  labelledBy,
}: SkillListProps) {
  // RF-1 (SI-clause) / plan → Decisiones: con `skills` vacío no se renderiza
  // nada — ni el `<ul>`: una lista sin ítems no aporta contenido (mismo
  // criterio Timeline/ResumeSection).
  if (skills.length === 0) {
    return null;
  }

  // Unión #99 (G-B, spec → API) en el único raíz: array + filtro de undefined
  // + join, base primero (mecanismo canónico aprobado en Box/Icon/Badge/
  // Timeline/ResumeSection); así no quedan clases vacías cuando `className` no
  // se pasa. Bajo `noUncheckedIndexedAccess` la clase del módulo es
  // `string | undefined`.
  const rootClassName = [styles.skillList, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return (
    // RF-2: el tipo garantiza que SOLO una de `label`/`labelledBy` llega
    // definida (la otra es `never` opcional → undefined en runtime), y React
    // omite el atributo con valor undefined: en el DOM hay exactamente UNO de
    // aria-label / aria-labelledby (nunca ambos, nunca ninguno).
    // RF-4 (restricción de uso, el reviewer la verifica en el consumidor F4):
    // la lista va directamente sobre --color-surface, nunca dentro de un
    // Box variant="inner" (el chip compartiría fondo y desaparecería).
    <ul className={rootClassName} aria-label={label} aria-labelledby={labelledBy}>
      {skills.map((skill, index) => (
        // RF-6 (keys estables, fórmula documentada — inspección del plan):
        // `skill-${index}-${value}` es única y estable para el mismo array,
        // incluso con skills duplicadas (índice + valor). El chip lo pinta
        // Badge íntegramente (decisión 15): CERO props de estilo al Badge,
        // solo as="li" + children (la key es de React, no una prop de Badge).
        <Badge as="li" key={`skill-${index}-${skill}`}>
          {skill}
        </Badge>
      ))}
    </ul>
  );
}
