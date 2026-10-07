// Función pura de la pieza Sidebar (RF-5; specs/layout/Sidebar/spec.md →
// API): deriva el `href` de un contacto. Sin React ni DOM (constitución C1);
// solo importa tipos de `@data/cv.types.generated`. Vive en la carpeta de
// la pieza porque solo la consume Sidebar (decision 11 del plan).

import type { ContactItem } from "@data/cv.types.generated";

/** Deja solo dígitos; conserva un `+` inicial si `keepLeadingPlus`. */
function digitsOnly(value: string, keepLeadingPlus: boolean): string {
  const digits = value.replace(/\D/g, "");
  return digits !== "" && keepLeadingPlus && value.startsWith("+")
    ? `+${digits}`
    : digits;
}

/**
 * href del contacto: el explícito si existe (se devuelve tal cual, sin
 * limpieza); si no, derivado por tipo según la tabla de la spec:
 * email → `mailto:` (con `trim()`), phone → `tel:` (un `+` solo si es el
 * primer carácter; el resto de no-dígitos se elimina), whatsapp →
 * `https://wa.me/` solo dígitos (sin `+`), location → `undefined`.
 * Si tras la limpieza phone/whatsapp no queda ningún dígito → `undefined`
 * (el valor se muestra como texto).
 */
export function getContactHref(item: ContactItem): string | undefined {
  if (item.href !== undefined) {
    return item.href;
  }
  switch (item.type) {
    case "email":
      return `mailto:${item.value.trim()}`;
    case "phone": {
      const cleaned = digitsOnly(item.value, true);
      return cleaned === "" ? undefined : `tel:${cleaned}`;
    }
    case "whatsapp": {
      const cleaned = digitsOnly(item.value, false);
      return cleaned === "" ? undefined : `https://wa.me/${cleaned}`;
    }
    case "location":
      return undefined;
  }
}
