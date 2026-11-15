// Runtime lists that mirror the enums of data/cv.schema.json, which is the
// source of truth. A test keeps them in sync with the schema.

export const LOCALES = ["en", "es"] as const;
export const DEFAULT_LOCALE: (typeof LOCALES)[number] = "en";

export const CONTACT_TYPES = ["email", "phone", "whatsapp", "location"] as const;

export const SOCIAL_NETWORKS = [
  "github",
  "linkedin",
  "x",
  "instagram",
  "facebook",
  "dribbble",
  "behance",
] as const;

export const SERVICE_ICONS = [
  "code",
  "layout",
  "palette",
  "smartphone",
  "server",
  "database",
  "cloud",
  "pen-tool",
  "camera",
  "megaphone",
  "gauge",
  "shield",
] as const;
