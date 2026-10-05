// Icon — único punto de entrada a lucide-react (specs/primitives/Icon/spec.md).
// T1: mapa explícito nombre → componente y render de todos los IconName
// (RF-1). T2: accesibilidad del conducto `label` (RF-2, RF-3, RF-7). `tone`
// (T3), AccentGradientDefs (T4) y tamaño por CSS con `className` (T5) se
// agregan en las tareas siguientes.

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

export function Icon({ name, label }: IconProps) {
  const Glyph = ICON_MAP[name];

  // RF-7: focusable="false" siempre, con y sin label.
  // Accesibilidad (RF-2/RF-3): el marcado se fija explícitamente en el
  // componente, sin depender del default interno de lucide (pasar cualquier
  // prop aria-* o role desactiva su aria-hidden automático, y un valor
  // undefined dejaría el <svg> sin marcar).
  // `label === ""` no es un nombre accesible válido: se trata como decorativo
  // (RF-2); la spec no define el comportamiento con label vacío.
  if (label) {
    return <Glyph role="img" aria-label={label} focusable="false" />;
  }

  return <Glyph aria-hidden focusable="false" />;
}
