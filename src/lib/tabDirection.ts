// Dirección de entrada del tabpanel al cambiar de tab (RF-9 y test 15 de
// specs/layout/AppLayout/spec.md, decisión P7 del plan). Función pura: sin
// React, sin DOM. La usa AppLayout para fijar `data-motion-direction` solo
// cuando hay un cambio real de tab (devuelve `null` en el primer render y
// cuando el índice no cambia, y el atributo no se renderiza).

/** Dirección de la animación de entrada: el panel llega de izquierda o derecha. */
export type MotionDirection = "from-left" | "from-right";

/**
 * Devuelve la dirección de entrada entre dos índices de tab (`TAB_IDS`):
 * avanzar → `"from-right"`; retroceder → `"from-left"`; sin índice previo
 * (primer render) o mismo índice → `null` (no hay animación).
 */
export function getTabDirection(
  prev: number | null,
  next: number,
): MotionDirection | null {
  if (prev === null || prev === next) {
    // Sin dirección: primer render o cambio que no mueve el tab.
    return null;
  }
  return next > prev ? "from-right" : "from-left";
}
