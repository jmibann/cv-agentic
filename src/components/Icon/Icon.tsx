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
  /** Defaults to "current", which inherits the color. */
  tone?: "current" | "accent" | "gradient";
  /** With a label the icon is informative (role="img"); without it, decorative. */
  label?: string;
  /** Added to the base class on the <svg>; the parent sets --icon-size there. */
  className?: string;
}

// Single owner of the gradient id: AccentGradientDefs defines it and
// tone="gradient" references it.
const ACCENT_GRADIENT_ID = "accent-gradient";
const ACCENT_GRADIENT_STROKE = `url(#${ACCENT_GRADIENT_ID})`;

// Built as an object and spread instead of passing stroke={undefined}, which
// would override lucide's default stroke="currentColor".
type ToneProps = { className?: string; stroke?: string };

// Explicit map (no `import * as`, for tree-shaking). Record<IconName, …>
// requires one key per name: a new icon in the schema without an entry here
// fails the type check.
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

export function Icon({ name, tone = "current", label, className }: IconProps) {
  const Glyph = ICON_MAP[name];

  const toneProps: ToneProps =
    tone === "gradient"
      ? { stroke: ACCENT_GRADIENT_STROKE }
      : tone === "accent"
        ? { className: styles.toneAccent }
        : {};

  // The consumer's class is added to the base one and never replaces it: that
  // is where the parent sets --icon-size.
  const svgClassName = [styles.icon, toneProps.className, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  // className goes after the spread so it overrides the one tone="accent"
  // brings, which is already included in svgClassName.
  if (label) {
    return (
      <Glyph
        {...toneProps}
        className={svgClassName}
        role="img"
        aria-label={label}
        focusable="false"
      />
    );
  }

  return (
    <Glyph {...toneProps} className={svgClassName} aria-hidden focusable="false" />
  );
}

/** Mounted once by AppLayout; tests that use tone="gradient" mount it too. */
export function AccentGradientDefs() {
  return (
    // Hidden by size, never with display: none: some browsers do not resolve
    // url(#…) references into an SVG that is not rendered.
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      className={styles.defs}
    >
      {/* userSpaceOnUse is required: with objectBoundingBox each stroke uses its
          own box, and straight lines (zero width or height) are not drawn. The
          end points map the angle of --gradient-accent onto lucide's 0–24
          viewBox. */}
      <linearGradient
        id={ACCENT_GRADIENT_ID}
        gradientUnits="userSpaceOnUse"
        x1="0.62"
        y1="-0.56"
        x2="23.38"
        y2="24.56"
      >
        {/* Stop colors come from tokens through classes, so the gradient follows
            the theme. */}
        <stop offset="0.2631" className={styles.stopStart} />
        <stop offset="0.9375" className={styles.stopEnd} />
      </linearGradient>
    </svg>
  );
}
