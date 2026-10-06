// HexAvatar — avatar con forma de hexágono vertical de esquinas redondeadas,
// con contorno del color de la superficie y sombra
// (specs/primitives/HexAvatar/spec.md). Es la ÚNICA implementación de esa
// forma (la usan TestimonialCard y TestimonialDialog; spec → "No hacer").
//
// T1: `HexAvatarDefs` (RF-3) — los dos `clipPath` de la geometría fija de
// spec → "Forma", exportados desde este módulo; el montaje único en la app lo
// garantiza AppLayout (RF-6 de su spec) y los tests de componentes que usan
// HexAvatar los montan como armazón (spec → Forma).
// T2: el componente `HexAvatar` (RF-1) con la estructura exacta de
// spec → Anatomía: `wrap > border > img` recibiendo el `src`.
// Diferidos a su tarea: el `alt` del prop (hoy `""` fijo, coincidente con el
// default de la API; T3, RF-2); `filter: drop-shadow` del wrap, tamaño fijo,
// `className` unida y cierre a11y (T4, RF-4/RF-5).

import styles from "./HexAvatar.module.css";

// API (spec → API), declarada COMPLETA en T1 con el diferido marcado
// (precedente Overhead/SectionTitle T1): `HexAvatar` la consume desde T2; la
// unión de `className` al `wrap` se conecta en T4.
export interface HexAvatarProps {
  src: string;
  /** Default "". En card y dialog el nombre está al lado: la imagen es decorativa. */
  alt?: string;
  /** Se une a la clase base del `wrap` (elemento raíz; unión en T4). */
  className?: string;
}

// HexAvatarDefs — definiciones compartidas de la forma hexagonal (RF-3).
// Dueña única de los ids "hex-avatar-outer" e "hex-avatar-inner" (mismo
// criterio aprobado para "accent-gradient" en Icon: las defs viven en el
// módulo del componente que define la forma).
export function HexAvatarDefs() {
  return (
    // Invisible por TAMAÑO, nunca por display:none: width/height="0" como
    // atributos y posición absoluta dada por la clase .defs del módulo
    // (spec → Forma; precedente exacto AccentGradientDefs en Icon.tsx).
    // display:none rompería la resolución de url(#…) en algunos navegadores
    // (no resuelven referencias a definiciones dentro de un SVG no
    // renderizado).
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      className={styles.defs}
    >
      {/* hex-avatar-outer — GEOMETRÍA FIJA transcrita de spec → "Forma"
          (resolución H-1=A: el builder transcribe, no inventa). Tabla de la
          spec: caja 80 × 88 px (= --size-testimonial-avatar-w/h en px),
          vértices (40,0) (80,22) (80,66) (40,88) (0,66) (0,22),
          normalizados (0.5,0) (1,0.25) (1,0.75) (0.5,1) (0,0.75) (0,0.25);
          radio de esquina 6 px → rx = 6/80 = 0.075, ry = 6/88 ≈ 0.068.

          Construcción del `d` (cada coordenada = vértice o punto de tangencia
          de la caja 80×88 dividida por 80/88, 4 decimales): en cada vértice
          el path llega por recta hasta el punto de tangencia —a distancia
          t = r / tan(θ/2) del vértice sobre cada lado, con θ el ángulo
          interior del hexágono vertical: puntas (0.5,0)/(0.5,1) θ ≈ 122,4°
          → t ≈ 3,30 px; lados θ ≈ 118,8° → t ≈ 3,55 px; r = 6 px—, simétrico
          respecto de la bisectriz, y sella la esquina con un arco elíptico
          `A rx ry 0 0 1 x y` (sweep 1: traza horaria del hexágono en coords
          y-down sobre esquinas convexas). 6 arcos + 5 rectas y `Z` cierra el
          sexto tramo recto. Todas las cuerdas de arco miden menos de
          2·min(rx,ry), así que el renderer NO escala los radios: los arcos
          usan exactamente los 6 px de la spec. */}
      <clipPath id="hex-avatar-outer" clipPathUnits="objectBoundingBox">
        <path d="M0.4639 0.0181 A0.075 0.068 0 0 1 0.5361 0.0181 L0.9611 0.2306 A0.075 0.068 0 0 1 1 0.2903 L1 0.7097 A0.075 0.068 0 0 1 0.9611 0.7694 L0.5361 0.982 A0.075 0.068 0 0 1 0.4639 0.982 L0.0389 0.7694 A0.075 0.068 0 0 1 0 0.7097 L0 0.2903 A0.075 0.068 0 0 1 0.0389 0.2306 Z" />
      </clipPath>

      {/* hex-avatar-inner — caja PROPIA 72 × 80 px: es el inset geométrico
          REAL de 4 px del outer (cada lado paralelo desplazado 4 px hacia
          adentro; vértices = intersecciones), NO un escalado (spec → Forma:
          con un único clipPath escalado el borde no quedaría uniforme; las
          proporciones 80:88 y 72:80 difieren). En la anatomía de T2 el <img>
          mide 72×80 y va offseteado 4 px respecto del border, así que
          objectBoundingBox mapea esta caja exactamente sobre la imagen.
          Vértices de la tabla: (36,0.57) (72,20.37) (72,59.63) (36,79.43)
          (0,59.63) (0,20.37), normalizados (0.5,0.0071) (1,0.2546)
          (1,0.7454) (0.5,0.9929) (0,0.7454) (0,0.2546); radio 2 px,
          resultante del inset (no un valor libre) → rx = 2/72 ≈ 0.028,
          ry = 2/80 = 0.025.

          Misma construcción que el outer con r = 2 px (t ≈ 1,10 px en las
          puntas y t ≈ 1,18 px en los lados; coordenadas divididas por
          72/80). El anillo del contorno queda en 4 px en los tramos rectos
          (x: 80 → 4+72; y: 88 → 4+80). Safari: sin prefijo
          -webkit-clip-path (resolución H-8; lo decide la QA visual de F5). */}
      <clipPath id="hex-avatar-inner" clipPathUnits="objectBoundingBox">
        <path d="M0.4866 0.0138 A0.028 0.025 0 0 1 0.5134 0.0138 L0.9856 0.2475 A0.028 0.025 0 0 1 1 0.2694 L1 0.7306 A0.028 0.025 0 0 1 0.9856 0.7525 L0.5134 0.9863 A0.028 0.025 0 0 1 0.4866 0.9863 L0.0144 0.7525 A0.028 0.025 0 0 1 0 0.7306 L0 0.2694 A0.028 0.025 0 0 1 0.0144 0.2475 Z" />
      </clipPath>
    </svg>
  );
}

// HexAvatar — avatar hexagonal (RF-1, T2). Anatomía EXACTA de spec → Anatomía:
// `<span class="wrap"> > <span class="border"> > <img class="image">`, sin
// atributos extra (el `alt=""` fijo es el del HTML de la Anatomía y coincide
// con el default de la API — RF-2 decorativo—; el prop `alt` se conecta en
// T3). `className` no se destruye todavía: su unión al `wrap` es T4 (spec →
// API; criterio Separator T1 / CornerTab, sin variables muertas). Las clases
// del módulo llevan la geometría por inspección: tamaños sobre
// `--size-testimonial-avatar-w/h`, offsets de 4 px del anillo y los
// `clip-path: url(#hex-avatar-outer/inner)` que resuelven las defs de arriba
// (RF-3; jsdom no los computa).
export function HexAvatar({ src }: HexAvatarProps) {
  return (
    <span className={styles.wrap}>
      <span className={styles.border}>
        <img className={styles.image} src={src} alt="" />
      </span>
    </span>
  );
}
