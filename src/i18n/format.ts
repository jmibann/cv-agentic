// Interpolación mínima de textos de interfaz (foundations/i18n.md →
// "Textos de interfaz"). Función pura, sin React ni DOM (constitución C1).

/**
 * Reemplaza en `template` cada placeholder `{clave}` por el valor
 * correspondiente de `values`. Si `values` no tiene la clave (propia del
 * objeto), el placeholder queda literal.
 */
export function format(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match: string, key: string) => {
    // hasOwn: solo claves propias del objeto (evita heredar p. ej.
    // "constructor" desde el prototipo)
    if (!Object.hasOwn(values, key)) {
      return match;
    }
    return String(values[key]);
  });
}
