// Tests de T1 (specs/primitives/HexAvatar/tasks.md) — RF-3: `HexAvatarDefs`
// renderiza los dos `clipPath` de la geometría fija (spec → "Forma"): ids
// exactos `hex-avatar-outer` e `hex-avatar-inner`,
// `clipPathUnits="objectBoundingBox"`, un único `<path>` por `clipPath` cuyo
// `d` no está vacío, sella las 6 esquinas con arcos elípticos de los radios
// normalizados de la spec (outer 0.075/0.068, inner 0.028/0.025) y cierra el
// path con `Z`. El `<svg>` es invisible por tamaño (atributos 0×0 + posición
// absoluta dada por la clase del módulo), nunca `display: none`
// (spec → Forma).
//
// Rojo esperado (decisión #101): en el commit `test(HexAvatar): T1` nada de
// la pieza existe; el rojo llega por "Failed to resolve import" de
// `./HexAvatar` y `./HexAvatar.module.css` (patrón aprobado IconBox T2 /
// Separator T2).
//
// Justificación de las queries (constitución T3): `<clipPath>` y `<path>`
// son definiciones SVG sin rol ni nombre accesible posible y la API de la
// spec no define ningún `data-testid`; lo observable son sus ids, atributos
// y el string `d`, por eso se usa selección estructural
// (`container.querySelector("clipPath#…")`), el mismo criterio justificado
// en Icon.test T3 para `AccentGradientDefs`. La geometría EXACTA del `d`
// (cada vértice de la tabla "Forma" contra el path) la verifica el reviewer
// por lectura contra la spec; el test la ancla estructuralmente (6 arcos `A`
// + `Z`, radios, no vacío).
//
// Diferidos a su tarea según tasks.md: estructura `wrap > border > img` con
// `src` (T2), `alt` decorativo/nombre (T3), `className`, inspección de
// `filter: drop-shadow` y cierre `expectNoA11yViolations` (T4 — NO se
// adelanta; patrón Separator/CornerTab).

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HexAvatarDefs } from "./HexAvatar";

// T1: el módulo nace con el feat de esta tarea solo con `.defs` (el patrón
// #99 fija el nombre real de la clase resuelta por CSS Modules en runtime).
import styles from "./HexAvatar.module.css";

// Patrón P2 canónico #99 (`styles.name ?? "name"`; prohibidos `!` y
// `as string`): el fallback es solo de tipos bajo `noUncheckedIndexedAccess`.
const defsClass = styles.defs ?? "defs";

// Nº de arcos elípticos del path (comando `A`): las 6 esquinas redondeadas.
// El fallback `?? []` no debilita nada: si `d` no tuviera arcos la longitud
// sería 0 y la aserción falla igual.
const arcCount = (d: string): number => (d.match(/A/g) ?? []).length;

describe("HexAvatarDefs clip paths (T1: RF-3)", () => {
  it("renders exactly two clipPath elements with the contract ids and objectBoundingBox units", () => {
    const { container } = render(<HexAvatarDefs />);

    // RF-3: dos clipPath DISTINTOS, dueños únicos de estos ids (spec →
    // Forma); nada más en las defs.
    expect(container.querySelectorAll("clipPath")).toHaveLength(2);

    const outer = container.querySelector("clipPath#hex-avatar-outer");
    const inner = container.querySelector("clipPath#hex-avatar-inner");
    expect(outer).not.toBeNull();
    expect(inner).not.toBeNull();
    // objectBoundingBox: las coordenadas del path son normalizadas a la caja
    // de cada elemento recortado (outer 80×88; inner 72×80, caja propia del
    // inset geométrico real de 4 px; spec → Forma).
    expect(outer).toHaveAttribute("clipPathUnits", "objectBoundingBox");
    expect(inner).toHaveAttribute("clipPathUnits", "objectBoundingBox");
  });

  it("hex-avatar-outer has one path with 6 elliptical-arc corners (rx 0.075 / ry 0.068) closed with Z", () => {
    const { container } = render(<HexAvatarDefs />);

    const outer = container.querySelector("clipPath#hex-avatar-outer");
    const outerPath = outer?.querySelector("path");
    expect(outer).not.toBeNull();
    // Un único path por clipPath (hexágono vertical punta arriba/abajo).
    expect(outer?.querySelectorAll("path")).toHaveLength(1);
    expect(outerPath).not.toBeNull();

    const d = outerPath?.getAttribute("d") ?? "";
    expect(d.length).toBeGreaterThan(0);
    // 6 vértices sellados con arco elíptico de los radios de la spec
    // (6 px normalizados: 6/80 = 0.075; 6/88 ≈ 0.068), sweep 1.
    expect(arcCount(d)).toBe(6);
    expect(d).toContain("0.075 0.068 0 0 1");
    // Cada tramo es recta + arco y el path cierra con Z.
    expect(d).toMatch(/Z$/);
  });

  it("hex-avatar-inner has one path with 6 elliptical-arc corners (rx 0.028 / ry 0.025) closed with Z", () => {
    const { container } = render(<HexAvatarDefs />);

    const inner = container.querySelector("clipPath#hex-avatar-inner");
    const innerPath = inner?.querySelector("path");
    expect(inner).not.toBeNull();
    expect(inner?.querySelectorAll("path")).toHaveLength(1);
    expect(innerPath).not.toBeNull();

    const d = innerPath?.getAttribute("d") ?? "";
    expect(d.length).toBeGreaterThan(0);
    // Radio 2 px resultante del inset (no un valor libre): 2/72 ≈ 0.028;
    // 2/80 = 0.025 (spec → Forma).
    expect(arcCount(d)).toBe(6);
    expect(d).toContain("0.028 0.025 0 0 1");
    expect(d).toMatch(/Z$/);
  });

  it("svg is invisible by size (0x0 attributes and the module class), never display:none, out of the a11y tree", () => {
    const { container } = render(<HexAvatarDefs />);
    const defsSvg = container.querySelector("svg");
    expect(defsSvg).not.toBeNull();

    // Invisible por tamaño (spec → Forma): width/height="0" como atributos y
    // posición absoluta dada por la clase del módulo (inspección del CSS:
    // .defs { position: absolute }). Nunca display:none: algunos navegadores
    // no resuelven url(#…) a definiciones dentro de un SVG no renderizado.
    expect(defsSvg).toHaveAttribute("width", "0");
    expect(defsSvg).toHaveAttribute("height", "0");
    expect(defsSvg).toHaveClass(defsClass);
    // Sin estilos inline (regla dura 3 de DESIGN.md): ningún display:none.
    expect(defsSvg).not.toHaveAttribute("style");
    // extra: precedente exacto AccentGradientDefs (Icon.tsx) — el encargo de
    // T1 manda replicar aria-hidden="true" y focusable="false" en el <svg>
    // de defs; la Anatomía de la spec no lo repite, pero sostiene su marco
    // de estructura (mismo contrato de defs invisibles).
    expect(defsSvg).toHaveAttribute("aria-hidden", "true");
    expect(defsSvg).toHaveAttribute("focusable", "false");
  });
});

// Cierre `expectNoA11yViolations`: diferido a T4 por tasks.md ("archivo
// termina con expectNoA11yViolations" en T4; patrón Separator/CornerTab).
// No se adelanta: los commits `test` solo agregan tests de su tarea.
