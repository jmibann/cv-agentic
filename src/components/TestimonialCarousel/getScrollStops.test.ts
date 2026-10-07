// Tests de las funciones puras de stops (T1): los 4 casos exactos de
// spec → "Tests esperados" (1–3 para `getScrollStops`, 4 para
// `getActiveStop`) más los bordes que se derivan literalmente de la regla
// de Comportamiento ("clamp + dedup con tolerancia 1px conservando el
// menor"; "índice del más cercano, empate → el menor"). RF-3, RF-5 (base).
import { describe, expect, it } from "vitest";

import { getActiveStop, getScrollStops } from "./getScrollStops";

describe("getScrollStops", () => {
  // Caso 1 de spec: 3 testimonios, 2 por vista → 2 stops (el 600 se
  // recorta a maxScroll 300 y deduplica contra el 300 nativo).
  it("clamps offsets to maxScroll and drops the duplicate stop", () => {
    expect(getScrollStops([0, 300, 600], 300)).toEqual([0, 300]);
  });

  // Caso 2 de spec: 1 por vista → ningún offset supera maxScroll.
  it("keeps every offset when none exceeds maxScroll", () => {
    expect(getScrollStops([0, 300, 600], 600)).toEqual([0, 300, 600]);
  });

  // Caso 3 de spec: maxScroll 0 → todos se recortan a 0 → un único stop.
  it("collapses every offset to a single stop when maxScroll is 0", () => {
    expect(getScrollStops([0, 300], 0)).toEqual([0]);
  });

  // extra: la regla textual fija "tolerancia 1px" sin decir si 1px exacto
  // es duplicado. Lectura aplicada: INCLUSIVA (distancia ≤ 1px → mismo
  // stop, se conserva el menor). Motivo: una tolerancia de medición admite
  // su valor límite — dos posiciones a 1px no son visualmente
  // distinguibles y un bullet extra sería fantasma — y es coherente con la
  // regla stop→n de Comportamiento, que trata "offsetLeft ≥ stop − 1px"
  // como coincidencia en los stops recortados a maxScroll.
  it("treats a 1px distance as a duplicate under the inclusive tolerance", () => {
    expect(getScrollStops([0, 1, 600], 600)).toEqual([0, 600]);
  });

  // extra: deriva literal de la regla de clamp: si todos los offsets son
  // mayores que maxScroll, todos se recortan a maxScroll y deduplican en
  // un único stop en esa posición.
  it("returns a single stop at maxScroll when every offset exceeds it", () => {
    expect(getScrollStops([300, 600], 200)).toEqual([200]);
  });
});

describe("getActiveStop", () => {
  // Caso 4 de spec: más cercano por distancia absoluta.
  it("returns the index of the nearest stop", () => {
    expect(getActiveStop([0, 300], 140)).toBe(0);
    expect(getActiveStop([0, 300], 160)).toBe(1);
  });

  // Caso 4 de spec: distancia 150 a ambos stops → empate → el menor índice.
  it("resolves a tie toward the lower index", () => {
    expect(getActiveStop([0, 300], 150)).toBe(0);
  });

  // extra: guard defensivo de la función total (plan → Funciones puras):
  // con stops vacíos no hay bullet que marcar — el componente no
  // renderiza bullets con ≤1 stop (RF-3) —; devuelve 0 en vez de lanzar.
  it("returns 0 for an empty stops array (defensive guard)", () => {
    expect(getActiveStop([], 0)).toBe(0);
  });
});
