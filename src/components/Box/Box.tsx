// Box — superficie base del diseño (specs/primitives/Box/spec.md). T1: render
// base (RF-1, RF-3): raíz `div` por defecto y render de `children`; `as`
// cambia el elemento. T2: la clase se elige por `variant` (`inner`/`outer`,
// RF-1/RF-2) y `id`/`aria-label`/`aria-labelledby` llegan al raíz (RF-3).
// Falta: la unión de `className` (T3) y los estilos por tokens con
// `overflow` (T4).

import type { ReactNode } from "react";

import styles from "./Box.module.css";

// Elementos válidos para `as` (spec → API): div por defecto.
type BoxElement = "div" | "section" | "article" | "aside" | "header";

// API cerrada (RF-3/RF-4): solo estos atributos llegan al elemento; sin
// pass-through de `role`, `tabIndex` ni `...rest`.
export interface BoxProps {
  variant?: "outer" | "inner";
  as?: BoxElement;
  children: ReactNode;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
}

export function Box({
  as,
  variant,
  children,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
}: BoxProps) {
  // RF-1/RF-2: sin `variant` rige `outer` (default); con `variant="inner"`
  // se aplica SOLO `inner` (una única clase de variante, nunca ambas). Las
  // clases del módulo van tal cual (string | undefined bajo
  // noUncheckedIndexedAccess; React admite className undefined).
  const variantClass = variant === "inner" ? styles.inner : styles.outer;

  const El = as ?? "div";

  // RF-3: al elemento solo le llegan `children`, `id`, `aria-label`,
  // `aria-labelledby` y `className` (API cerrada, RF-4: sin `role`,
  // `tabIndex` ni `...rest`). El join con la `className` del consumidor
  // es T3: la prop sigue declarada en BoxProps y todavía no se transmite.
  return (
    <El
      className={variantClass}
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
    >
      {children}
    </El>
  );
}
