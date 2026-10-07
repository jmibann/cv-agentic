// Funciones puras de stops del carrusel (T1): posiciones alcanzables de
// scroll y stop activo. Sin React ni DOM (constitución C1): reciben los
// offsets ya medidos por el componente y devuelven números. La regla está
// fijada en spec → Comportamiento ("Bullets: uno por posición de scroll
// alcanzable"). RF-3, RF-5 (base).

// Tolerancia de deduplicado en px: dos valores a una distancia ≤ 1px son
// el mismo stop (lectura inclusiva de "tolerancia 1px" de la spec, fijada
// en los tests de T1).
const DEDUPE_TOLERANCE_PX = 1;

/**
 * Posiciones alcanzables: cada offset limitado a `maxScroll`
 * (`Math.min(offset, maxScroll)`), sin duplicados (a distancia ≤ 1px se
 * conserva el menor) y ordenadas ascendentes.
 */
export function getScrollStops(
  slideOffsets: readonly number[],
  maxScroll: number,
): number[] {
  // `map` crea un array nuevo: el `readonly` de la entrada no se muta.
  const clamped = slideOffsets
    .map((offset) => Math.min(offset, maxScroll))
    .sort((a, b) => a - b);
  const stops: number[] = [];
  for (const value of clamped) {
    const last = stops[stops.length - 1];
    // `last === undefined` solo ocurre en el primer valor. La distancia
    // se mide contra el último stop CONSERVADO (no contra el anterior del
    // input), para que una secuencia de deltas sub-píxel no "encadene" derivas.
    if (last === undefined || value - last > DEDUPE_TOLERANCE_PX) {
      stops.push(value);
    }
  }
  return stops;
}

/**
 * Índice del stop más cercano a `scrollLeft` por distancia absoluta;
 * en empate gana el índice menor (recorrido ascendente con `<` estricto:
 * el primer mínimo encontrado se conserva).
 */
export function getActiveStop(
  stops: readonly number[],
  scrollLeft: number,
): number {
  // Guard defensivo (plan → Funciones puras): con `stops` vacío no hay
  // bullet que marcar — el componente no renderiza bullets con ≤1 stop
  // (RF-3) —; la función devuelve 0 en vez de lanzar.
  let activeIndex = 0;
  let activeDistance = Number.POSITIVE_INFINITY;
  for (const [index, stop] of stops.entries()) {
    const distance = Math.abs(stop - scrollLeft);
    if (distance < activeDistance) {
      activeIndex = index;
      activeDistance = distance;
    }
  }
  return activeIndex;
}
