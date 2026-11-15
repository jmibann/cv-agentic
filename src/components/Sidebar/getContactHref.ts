import type { ContactItem } from "@data/cv.types.generated";

function digitsOnly(value: string, keepLeadingPlus: boolean): string {
  const digits = value.replace(/\D/g, "");
  return digits !== "" && keepLeadingPlus && value.startsWith("+")
    ? `+${digits}`
    : digits;
}

/**
 * An explicit href is returned untouched. Otherwise it is derived from the
 * type; undefined means there is nothing to link to.
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
