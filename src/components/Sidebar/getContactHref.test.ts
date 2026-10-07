// Tests de `getContactHref` (T1, RF-5): la tabla exacta de
// specs/layout/Sidebar/spec.md → API y su Test esperado #7. Función pura:
// sin render, sin DOM (C1). Los valores son persona ficticia (D4).
import { describe, expect, it } from "vitest";

import { getContactHref } from "./getContactHref";

import type { ContactItem } from "@data/cv.types.generated";

/** Fixture mínimo de un `ContactItem` según el tipo y su valor visible. */
function makeItem(type: ContactItem["type"], value: string, href?: string): ContactItem {
  return href === undefined ? { id: "contact-1", type, value } : { id: "contact-1", type, value, href };
}

describe("getContactHref", () => {
  it("returns an explicit href unchanged, without any cleanup of value", () => {
    // Tabla: "si hay `item.href`, se devuelve tal cual y no se aplica nada de esto"
    const item = makeItem("phone", "no-es-un-telefono!!!", "https://example.com/hola");
    expect(getContactHref(item)).toBe("https://example.com/hola");
  });

  it("derives a mailto href from an email value", () => {
    expect(getContactHref(makeItem("email", "alex@example.com"))).toBe(
      "mailto:alex@example.com",
    );
  });

  it("trims surrounding whitespace from an email value before building mailto", () => {
    // Tabla email: "trim(); sin otros cambios"
    expect(getContactHref(makeItem("email", "  alex@example.com  "))).toBe(
      "mailto:alex@example.com",
    );
  });

  it("derives a tel href keeping a leading + and dropping separators", () => {
    // Test 7 literal: "+54 11 5555-0100" → "tel:+541155550100"
    expect(getContactHref(makeItem("phone", "+54 11 5555-0100"))).toBe(
      "tel:+541155550100",
    );
  });

  it("derives a tel href without + when the value has no leading plus", () => {
    // Test 7 literal: "(011) 5555.0100" → "tel:01155550100"
    // (paréntesis, punto y espacios se eliminan por ser no-dígitos)
    expect(getContactHref(makeItem("phone", "(011) 5555.0100"))).toBe(
      "tel:01155550100",
    );
  });

  it("drops a + that is not the first character of a phone value", () => {
    // Tabla phone: "se conserva un + SOLO si es el primer carácter;
    // se eliminan todos los demás caracteres que no sean dígitos"
    expect(getContactHref(makeItem("phone", "011+5555.0100"))).toBe(
      "tel:01155550100",
    );
  });

  it("derives a wa.me href with digits only, stripping the leading +", () => {
    // Test 7 literal: whatsapp "+54 9 11 5555-0100" → "https://wa.me/5491155550100"
    expect(getContactHref(makeItem("whatsapp", "+54 9 11 5555-0100"))).toBe(
      "https://wa.me/5491155550100",
    );
  });

  it("returns undefined for a location item", () => {
    // Test 7 literal: location → undefined (texto plano, sin link)
    expect(getContactHref(makeItem("location", "Buenos Aires, Argentina"))).toBeUndefined();
  });

  it("returns undefined for a phone with no digits after cleaning", () => {
    // Test 7 literal: phone sin dígitos → undefined
    expect(getContactHref(makeItem("phone", "N/D"))).toBeUndefined();
  });

  it("returns undefined for an empty phone value", () => {
    // Tabla: "si tras la limpieza phone/whatsapp no queda ningún dígito → undefined"
    expect(getContactHref(makeItem("phone", ""))).toBeUndefined();
  });

  it("returns undefined for an empty whatsapp value", () => {
    expect(getContactHref(makeItem("whatsapp", ""))).toBeUndefined();
  });
});
