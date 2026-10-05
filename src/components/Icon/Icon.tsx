// Icon — único punto de entrada a lucide-react (specs/primitives/Icon/spec.md).
// T1: mapa explícito nombre → componente y render de todos los IconName
// (RF-1). T2: accesibilidad del conducto `label` (RF-2, RF-3, RF-7). T3:
// AccentGradientDefs (RF-4). T4: conducto `tone` (RF-4). El tamaño por CSS con
// `className` de consumidor (T5) se agrega en la tarea siguiente.

import {
  BookOpen,
  Briefcase,
  Camera,
  ChevronDown,
  Cloud,
  Code,
  Database,
  Download,
  Gauge,
  LayoutTemplate,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  Moon,
  Palette,
  PenTool,
  Phone,
  Quote,
  Server,
  Shield,
  Smartphone,
  Sun,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ServiceIcon } from "@data/cv.types.generated";

import styles from "./Icon.module.css";

export type UiIconName =
  | "mail"
  | "phone"
  | "message-circle"
  | "map-pin"
  | "download"
  | "chevron-down"
  | "sun"
  | "moon"
  | "book-open"
  | "briefcase"
  | "quote"
  | "x";

export type IconName = UiIconName | ServiceIcon;

export interface IconProps {
  name: IconName;
  /** current = hereda color; accent = --color-accent; gradient = trazo con gradiente. Default: "current". */
  tone?: "current" | "accent" | "gradient";
  /** Si se pasa, el ícono es informativo: role="img" + aria-label. Si no, aria-hidden. */
  label?: string;
  /** Se UNE a la clase base `.icon` sobre el `<svg>` raíz; ahí el padre fija `--icon-size`. */
  className?: string;
}

// Dueña única del id del gradiente (plan.md): AccentGradientDefs lo monta y
// `tone="gradient"` lo referencia desde el atributo stroke (spec → Gradiente).
const ACCENT_GRADIENT_ID = "accent-gradient";
const ACCENT_GRADIENT_STROKE = `url(#${ACCENT_GRADIENT_ID})`;

// Props que aplica cada tone. `current` no agrega ninguna (hereda el color del
// control); `accent` usa la clase del CSS Module; `gradient`, el atributo
// stroke (no es un color: spec → Estilos y tokens). Se arma un objeto y se
// propaga en el JSX en vez de pasar `stroke={undefined}`: undefined pisaría el
// stroke="currentColor" que lucide trae por defecto y el trazo no se dibuja.
type ToneProps = { className?: string; stroke?: string };

// Mapa explícito (sin `import * as`, para tree-shaking). El tipo
// Record<IconName, LucideIcon> exige una clave por cada valor de la unión:
// si data/cv.schema.json agrega un ServiceIcon (y SERVICE_ICONS) sin entrada
// acá, `tsc` falla (RF-5; el tipo generado es unión de literales). No se
// exporta: la API pública es Icon + tipos (plan.md).
const ICON_MAP: Record<IconName, LucideIcon> = {
  mail: Mail,
  phone: Phone,
  "message-circle": MessageCircle,
  "map-pin": MapPin,
  download: Download,
  "chevron-down": ChevronDown,
  sun: Sun,
  moon: Moon,
  "book-open": BookOpen,
  briefcase: Briefcase,
  quote: Quote,
  x: X,
  code: Code,
  layout: LayoutTemplate,
  palette: Palette,
  smartphone: Smartphone,
  server: Server,
  database: Database,
  cloud: Cloud,
  "pen-tool": PenTool,
  camera: Camera,
  megaphone: Megaphone,
  gauge: Gauge,
  shield: Shield,
};

export function Icon({ name, tone = "current", label }: IconProps) {
  const Glyph = ICON_MAP[name];

  const toneProps: ToneProps =
    tone === "gradient"
      ? { stroke: ACCENT_GRADIENT_STROKE }
      : tone === "accent"
        ? { className: styles.toneAccent }
        : {};

  // RF-7: focusable="false" siempre, con y sin label.
  // Accesibilidad (RF-2/RF-3): el marcado se fija explícitamente en el
  // componente, sin depender del default interno de lucide (pasar cualquier
  // prop aria-* o role desactiva su aria-hidden automático, y un valor
  // undefined dejaría el <svg> sin marcar).
  // `label === ""` no es un nombre accesible válido: se trata como decorativo
  // (RF-2); la spec no define el comportamiento con label vacío.
  if (label) {
    return (
      <Glyph {...toneProps} role="img" aria-label={label} focusable="false" />
    );
  }

  return <Glyph {...toneProps} aria-hidden focusable="false" />;
}

// AccentGradientDefs — definiciones compartidas del gradiente de acento
// (RF-4). Se monta una sola vez en AppLayout (RF-6 de su spec); los tests de
// componentes con tone="gradient" lo montan como armazón. Dueña única del id
// "accent-gradient" (plan.md: mismo módulo de Icon; descartado módulo defs
// aparte).
export function AccentGradientDefs() {
  return (
    // Invisible por tamaño (0×0 + posicionamiento por clase .defs): nunca
    // display:none, porque algunos navegadores no resuelven referencias
    // url(#…) a definiciones dentro de un SVG no renderizado (spec →
    // Gradiente).
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      className={styles.defs}
    >
      {/* gradientUnits="userSpaceOnUse" es obligatorio: con el default
          (objectBoundingBox) cada trazo toma su propia caja y las líneas
          rectas (caja de ancho o alto 0) no se dibujan. Los extremos
          reproducen el ángulo 137.84° de --gradient-accent mapeados al
          espacio 0–24 del viewBox de lucide; los offsets, las posiciones
          26.31 % / 93.75 % (spec → Gradiente). */}
      <linearGradient
        id={ACCENT_GRADIENT_ID}
        gradientUnits="userSpaceOnUse"
        x1="0.62"
        y1="-0.56"
        x2="23.38"
        y2="24.56"
      >
        {/* Sin style inline (regla dura 3 de DESIGN.md): el color de cada
            stop sale de los tokens por clase del CSS Module, así que el
            gradiente cambia solo con el tema. */}
        <stop offset="0.2631" className={styles.stopStart} />
        <stop offset="0.9375" className={styles.stopEnd} />
      </linearGradient>
    </svg>
  );
}
