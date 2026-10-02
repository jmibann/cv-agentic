/**
 * cv-agentic — constantes del contrato de datos (en la app: `@data/constants`).
 *
 * El formato de los datos lo define `data/cv.schema.json` (fuente de verdad);
 * los tipos (`CvData`, `Locale`, `SocialNetwork`…) se GENERAN desde ahí en
 * `data/cv.types.generated.ts` (script `gen:types`, Fase 1).
 *
 * Estas listas existen porque el código necesita recorrerlas en runtime
 * (tests de BrandIcon e Icon, LanguageSwitcher, etc.). Deben coincidir con
 * los `enum` del esquema: lo verifica `src/content/schema.test.ts` (Fase 1).
 */

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
