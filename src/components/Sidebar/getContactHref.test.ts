import { describe, expect, it } from "vitest";

import { getContactHref } from "./getContactHref";

import type { ContactItem } from "@data/cv.types.generated";

function makeItem(type: ContactItem["type"], value: string, href?: string): ContactItem {
  return href === undefined ? { id: "contact-1", type, value } : { id: "contact-1", type, value, href };
}

describe("getContactHref", () => {
  it("returns an explicit href unchanged, without any cleanup of value", () => {
    const item = makeItem("phone", "no-es-un-telefono!!!", "https://example.com/hola");
    expect(getContactHref(item)).toBe("https://example.com/hola");
  });

  it("derives a mailto href from an email value", () => {
    expect(getContactHref(makeItem("email", "alex@example.com"))).toBe(
      "mailto:alex@example.com",
    );
  });

  it("trims surrounding whitespace from an email value before building mailto", () => {
    expect(getContactHref(makeItem("email", "  alex@example.com  "))).toBe(
      "mailto:alex@example.com",
    );
  });

  it("derives a tel href keeping a leading + and dropping separators", () => {
    expect(getContactHref(makeItem("phone", "+54 11 5555-0100"))).toBe(
      "tel:+541155550100",
    );
  });

  it("derives a tel href without + when the value has no leading plus", () => {
    expect(getContactHref(makeItem("phone", "(011) 5555.0100"))).toBe(
      "tel:01155550100",
    );
  });

  it("drops a + that is not the first character of a phone value", () => {
    expect(getContactHref(makeItem("phone", "011+5555.0100"))).toBe(
      "tel:01155550100",
    );
  });

  it("derives a wa.me href with digits only, stripping the leading +", () => {
    expect(getContactHref(makeItem("whatsapp", "+54 9 11 5555-0100"))).toBe(
      "https://wa.me/5491155550100",
    );
  });

  it("returns undefined for a location item", () => {
    expect(getContactHref(makeItem("location", "Buenos Aires, Argentina"))).toBeUndefined();
  });

  it("returns undefined for a phone with no digits after cleaning", () => {
    expect(getContactHref(makeItem("phone", "N/D"))).toBeUndefined();
  });

  it("returns undefined for an empty phone value", () => {
    expect(getContactHref(makeItem("phone", ""))).toBeUndefined();
  });

  it("returns undefined for an empty whatsapp value", () => {
    expect(getContactHref(makeItem("whatsapp", ""))).toBeUndefined();
  });
});
