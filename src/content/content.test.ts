// Tests de T9 (RF-7): contenido inicial validado. Fuente de los casos:
// spec.md §Tests esperados y foundations/i18n.md → "Tests esperados"
// (paridad en/es con la lista canónica de campos no traducibles, orden de
// fechas con los 3 casos fijados y rechazos del validador en memoria).
import { describe, expect, it } from "vitest";

import exampleEn from "@data/cv.example.en.json";
import exampleEs from "@data/cv.example.es.json";
import type { CvData } from "@data/cv.types.generated";
import { validateCv } from "@data/validate-cv.generated";

import enContent from "./cv.en.json";
import esContent from "./cv.es.json";
import { cvByLocale } from "./index";

/** Ruta relativa que declaran los JSON de `src/content` (Hecho cuando de T9). */
const SCHEMA_REF = "../../data/cv.schema.json";

type WithId = { id: string };

/** Ids de una colección, en el orden de los datos (identidad estable). */
function idsOf(entries: readonly WithId[]): string[] {
  return entries.map((entry) => entry.id);
}

/**
 * Instantánea de los campos no traducibles según la lista canónica de
 * foundations/i18n.md: todos los `id`, `profile.avatar.src`,
 * `profile.downloadCvUrl`, `contact[].type/href`, `social[].network/url`,
 * `services[].icon`, `education[].start/end`, `experience[].start/end` y
 * `testimonials[].avatar.src`. `locale` NO entra: difiere por definición.
 */
function nonTranslatable(cv: CvData): unknown {
  return {
    contactIds: idsOf(cv.contact),
    socialIds: idsOf(cv.social),
    serviceIds: idsOf(cv.services),
    educationIds: idsOf(cv.education),
    experienceIds: idsOf(cv.experience),
    testimonialIds: idsOf(cv.testimonials),
    avatarSrc: cv.profile.avatar.src,
    downloadCvUrl: cv.profile.downloadCvUrl,
    contact: cv.contact.map(({ type, href }) => ({ type, href })),
    social: cv.social.map(({ network, url }) => ({ network, url })),
    services: cv.services.map(({ icon }) => ({ icon })),
    education: cv.education.map(({ start, end }) => ({ start, end })),
    experience: cv.experience.map(({ start, end }) => ({ start, end })),
    testimonialAvatarSrc: cv.testimonials.map(({ avatar }) => avatar.src),
  };
}

// Normalización "solo para comparar" (plan.md, Funciones puras de T9):
// "YYYY" → "YYYY-01" en start y "YYYY-12" en end; con ambos en "YYYY-MM"
// la comparación de strings ya es cronológica (foundations/i18n.md).
function normalizeStart(value: string): string {
  return value.length === 4 ? `${value}-01` : value;
}

function normalizeEnd(value: string): string {
  return value.length === 4 ? `${value}-12` : value;
}

function isOrdered(start: string, end: string | null): boolean {
  // `end: null` es "present": entrada abierta, siempre válida.
  return end === null || normalizeStart(start) <= normalizeEnd(end);
}

// Copias mutadas en memoria para los rechazos (no se escribe ningún archivo
// en el repo): la base es el JSON de ejemplo, intacto.
const exampleBase = structuredClone(exampleEn) as unknown as CvData;

function withExperienceStart(cv: CvData, start: string): unknown {
  return {
    ...cv,
    experience: cv.experience.map((entry, index) =>
      index === 0 ? { ...entry, start } : entry,
    ),
  };
}

function withSocialNetwork(cv: CvData, network: string): unknown {
  return {
    ...cv,
    social: cv.social.map((item, index) =>
      index === 0 ? { ...item, network } : item,
    ),
  };
}

function withExtraField(cv: CvData): unknown {
  // La raíz del esquema fija `additionalProperties: false`.
  return { ...cv, uncampoquennadieniepide: true };
}

describe("cv.{en,es}.json (copias de los ejemplos de data/)", () => {
  it("declares the shared schema path in both locales", () => {
    expect(enContent.$schema).toBe(SCHEMA_REF);
    expect(esContent.$schema).toBe(SCHEMA_REF);
  });

  it("keeps every other field identical to data/cv.example.{en,es}.json", () => {
    // Copia fiel: única diferencia admitida es `$schema` (más profundo
    // porque el JSON vive ahora en src/content/).
    expect(enContent).toEqual({ ...exampleEn, $schema: SCHEMA_REF });
    expect(esContent).toEqual({ ...exampleEs, $schema: SCHEMA_REF });
  });
});

describe("cvByLocale exposes validated content (RF-7)", () => {
  it("provides one locale per key and the locale matches its file", () => {
    expect(Object.keys(cvByLocale)).toEqual(["en", "es"]);
    expect(cvByLocale.en.locale).toBe("en");
    expect(cvByLocale.es.locale).toBe("es");
  });
});

describe("content parity (foundations/i18n.md)", () => {
  it("keeps the same ids in the same order in every collection", () => {
    const en = cvByLocale.en;
    const es = cvByLocale.es;
    expect(idsOf(en.contact)).toEqual(idsOf(es.contact));
    expect(idsOf(en.social)).toEqual(idsOf(es.social));
    expect(idsOf(en.services)).toEqual(idsOf(es.services));
    expect(idsOf(en.education)).toEqual(idsOf(es.education));
    expect(idsOf(en.experience)).toEqual(idsOf(es.experience));
    expect(idsOf(en.testimonials)).toEqual(idsOf(es.testimonials));
  });

  it("keeps the canonical non-translatable fields identical across locales", () => {
    expect(nonTranslatable(cvByLocale.en)).toEqual(nonTranslatable(cvByLocale.es));
  });
});

describe("period ordering (start <= end)", () => {
  it("accepts a mid-year start with a year-only end", () => {
    expect(isOrdered("2017-06", "2017")).toBe(true);
  });

  it("rejects a year-only start after a year-only end", () => {
    expect(isOrdered("2018", "2017")).toBe(false);
  });

  it("rejects a start month after the end month", () => {
    expect(isOrdered("2017-06", "2017-05")).toBe(false);
  });

  it("accepts open-ended entries (end: null means present)", () => {
    expect(isOrdered("2021-02", null)).toBe(true);
  });

  it("orders every education and experience entry in both locales", () => {
    const unordered = (["en", "es"] as const).flatMap((locale) =>
      [...cvByLocale[locale].education, ...cvByLocale[locale].experience]
        .filter((entry) => !isOrdered(entry.start, entry.end))
        .map((entry) => `${locale}:${entry.id}`),
    );
    expect(unordered).toEqual([]);
  });
});

describe("validateCv rejects invalid content in memory (RF-7)", () => {
  it("accepts the untouched example content", () => {
    expect(validateCv(exampleBase)).toBe(true);
  });

  it("rejects an impossible month (99)", () => {
    expect(validateCv(withExperienceStart(exampleBase, "2021-99"))).toBe(false);
    expect(validateCv.errors?.[0]?.keyword).toBe("pattern");
  });

  it("rejects an unknown social network", () => {
    expect(validateCv(withSocialNetwork(exampleBase, "myspace"))).toBe(false);
    expect(validateCv.errors?.[0]?.keyword).toBe("enum");
  });

  it("rejects an extra field (additionalProperties: false)", () => {
    expect(validateCv(withExtraField(exampleBase))).toBe(false);
    expect(validateCv.errors?.[0]?.keyword).toBe("additionalProperties");
  });
});
