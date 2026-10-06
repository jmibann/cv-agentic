// Button — acción principal con el gradiente de acento
// (specs/primitives/Button/spec.md). T1: rama botón de la unión discriminada
// por `href` (RF-1): sin `href` renderiza un <button> con el `type` recibido
// (default "button") y el nombre accesible desde `children`. T2: `onClick` y
// `disabled` de la rama botón llegan al <button> (RF-3). T3: con `href`
// renderiza un <a> con ese destino, `rel` default de seguridad con
// `target="_blank"` (RF-2), `rel` explícito tal cual (RF-9) y `download`
// transmitido con su valor (RF-8). T4: `icon` renderiza el ícono decorativo
// (`Icon` sin `label`, aria-hidden propio de Icon) y `iconPosition` resuelve
// el orden REAL de nodos en el DOM (RF-4, RF-7). T5: `size="small"` y
// `fullWidth` aplican su clase del módulo sobre el raíz de las dos ramas y se
// unen a la `className` externa (RF-6; spec → API y Estilos y tokens). T6: el
// módulo define la clase base del raíz (fondo/tipografía/radio/sombra, brillo
// ::before y pseudo-estados focus-visible/disabled, RF-5/RF-6) y esa clase
// base SIEMPRE se une primero en el join, antes de las variantes y de la
// externa; los estilos se aplican también al <a> (rama link sin `disabled`).

import type { ReactNode } from "react";

import { Icon } from "../Icon";
import type { IconName } from "../Icon";

import styles from "./Button.module.css";

// Props comunes a las dos ramas (spec → API). `icon`/`iconPosition` se
// consumen desde T4; `size`/`fullWidth`/`className` desde T5 (clases del
// módulo unidas a la externa sobre el raíz). No se agregan props extra.
interface CommonProps {
  children: ReactNode;
  /** Default "default". */
  size?: "default" | "small";
  icon?: IconName;
  /** Default "start". */
  iconPosition?: "start" | "end";
  /** Default false. */
  fullWidth?: boolean;
  /** Se une a la clase base del elemento raíz (<button> o <a>). */
  className?: string;
}

// Unión discriminada por `href` (spec → API; plan.md → Decisiones: se
// descarta la interfaz única porque permitiría `disabled` en un <a>).
export type ButtonProps =
  | (CommonProps & {
      href?: undefined;
      type?: "button" | "submit";
      onClick?: () => void;
      disabled?: boolean;
    })
  | (CommonProps & {
      href: string;
      download?: boolean | string;
      target?: "_blank";
      rel?: string;
    });

export function Button(props: ButtonProps) {
  // T4 (RF-4, RF-7): el ícono es `Icon` SIN `label` → decorativo
  // (aria-hidden="true" que el propio Icon fija; plan.md → Interfaz). La
  // posición resuelve el ORDEN REAL de nodos en el DOM — svg antes del label
  // con "start" (default de la spec → API) y después con "end" — no con
  // `order: -1` de CSS (plan.md → Decisiones). `icon`/`iconPosition` viven en
  // CommonProps (spec → API), así que el mismo contenido aplica a las dos
  // ramas (<button> y <a>). Sin `icon`, el contenido es solo el label.
  const { icon, iconPosition = "start" } = props;
  const content =
    icon === undefined ? (
      props.children
    ) : (
      <>
        {iconPosition === "start" && <Icon name={icon} />}
        {props.children}
        {iconPosition === "end" && <Icon name={icon} />}
      </>
    );

  // T5 (RF-6, spec → API y Estilos y tokens) + T6 (clase base del módulo):
  // `size="small"` y `fullWidth` aplican su clase del módulo sobre el raíz y
  // la `className` externa se UNE a ellas (spec → API: "se une a la clase
  // base del elemento raíz (<button> o <a>)"). Las tres props viven en
  // CommonProps, así que el mismo cálculo rige en las dos ramas. Mismo
  // mecanismo de join ya aprobado en Icon/Box: array + filtro de undefined +
  // join, sin librerías; clases del módulo primero y la externa después
  // (precedente). Las clases del módulo son `string | undefined` bajo
  // noUncheckedIndexedAccess. Con T6 el módulo define la clase base `.button`
  // (fondo, tipografía, radio, sombra, brillo ::before y pseudo-estados), así
  // que va SIEMPRE como primer elemento del array, antes de
  // `.small`/`.fullWidth`: en el CSS los overrides de small vienen después
  // (misma especificidad, gana por orden) y el atributo `class` ya no puede
  // quedar vacío — el caso `undefined` de T5, cuando la clase base aún no
  // existía, dejó de darse.
  const classParts = [
    styles.button,
    props.size === "small" ? styles.small : undefined,
    props.fullWidth ? styles.fullWidth : undefined,
    props.className,
  ].filter((cls): cls is string => cls !== undefined);
  const rootClassName = classParts.join(" ");

  // T3 (RF-2, RF-8, RF-9): rama link. Comparar `href` contra `undefined`
  // angosta `props` a la variante con `href` de la unión discriminada, así
  // que `rel`/`target`/`download` se leen con sus tipos y las props propias
  // del botón (`type`/`onClick`/`disabled`) quedan fuera sin código extra
  // (la unión no permite pasarlas con `href`; spec → API).
  if (props.href !== undefined) {
    // RF-2 + RF-9 (plan.md: expresión trivial): sin `rel` explícito el
    // default de seguridad (constitución D6) solo con `target` presente;
    // un `rel` recibido se usa TAL CUAL, sin fusionar.
    const rel = props.rel ?? (props.target ? "noopener noreferrer" : undefined);

    // Nombre accesible desde `children` (spec → Accesibilidad); `content` ya
    // trae el ícono decorativo en su posición (T4). T5: `rootClassName` rige
    // también en el <a> (props de CommonProps; spec → API).
    return (
      <a
        href={props.href}
        target={props.target}
        rel={rel}
        download={props.download}
        className={rootClassName}
      >
        {content}
      </a>
    );
  }

  // RF-1 (T1): tras el guard, TS angosta a la rama sin `href` donde existe
  // `type`; `props.type ?? "button"` aplica el default de la spec → API.
  // RF-3 (T2): el mismo angostado lee `onClick` y `disabled` con sus tipos.
  // T5: `rootClassName` lleva las clases del módulo y la `className` externa.
  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled}
      className={rootClassName}
    >
      {content}
    </button>
  );
}
