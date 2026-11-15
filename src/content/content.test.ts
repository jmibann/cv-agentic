import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import exampleEn from "@data/cv.example.en.json";
import exampleEs from "@data/cv.example.es.json";
import type { CvData } from "@data/cv.types.generated";
import { validateCv } from "@data/validate-cv.generated";

import enContent from "./cv.en.json";
import esContent from "./cv.es.json";
import { cvByLocale } from "./index";

import { uiEn } from "../i18n/ui.en";
import { uiEs } from "../i18n/ui.es";

const SCHEMA_REF = "../../data/cv.schema.json";

type WithId = { id: string };

function idsOf(entries: readonly WithId[]): string[] {
  return entries.map((entry) => entry.id);
}

/** `locale` is left out on purpose: it differs by definition. */
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

// For comparison only: "YYYY" becomes "YYYY-01" as a start and "YYYY-12" as an
// end, so a plain string comparison is chronological.
function normalizeStart(value: string): string {
  return value.length === 4 ? `${value}-01` : value;
}

function normalizeEnd(value: string): string {
  return value.length === 4 ? `${value}-12` : value;
}

function isOrdered(start: string, end: string | null): boolean {
  return end === null || normalizeStart(start) <= normalizeEnd(end);
}

// Mutated copies kept in memory; nothing is written to the repo.
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
  return { ...cv, uncampoquennadieniepide: true };
}

describe("cv.{en,es}.json content files (RF-7)", () => {
  it("declares the shared schema path in both locales", () => {
    expect(enContent.$schema).toBe(SCHEMA_REF);
    expect(esContent.$schema).toBe(SCHEMA_REF);
  });

  it("validates both kit examples against the shared schema", () => {
    // The site content is no longer a copy of the examples, but the examples
    // remain the source of valid fixtures.
    expect(validateCv(exampleEn)).toBe(true);
    expect(validateCv(exampleEs)).toBe(true);
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

function withoutProjects(cv: CvData): unknown {
  const copy: Record<string, unknown> = { ...cv };
  delete copy.projects;
  return copy;
}

function withProjectEntry(cv: CvData): unknown {
  return { ...cv, projects: cv.experience.slice(0, 1) };
}

describe("projects collection (T20, #118)", () => {
  it("requires the projects collection in the schema", () => {
    expect(validateCv(withoutProjects(exampleBase))).toBe(false);
    expect(validateCv.errors?.[0]?.keyword).toBe("required");
  });

  it("accepts projects entries shaped as TimelineEntry", () => {
    if (exampleBase.experience.length === 0) {
      throw new Error(
        "el ejemplo del kit debe traer al menos una entrada de experience para armar la entrada de projects",
      );
    }
    expect(validateCv(withProjectEntry(exampleBase))).toBe(true);
  });

  it("keeps the same project ids and periods in both locales", () => {
    const en = cvByLocale.en.projects;
    const es = cvByLocale.es.projects;
    expect(idsOf(en)).toEqual(idsOf(es));
    expect(en.map(({ start, end }) => ({ start, end }))).toEqual(
      es.map(({ start, end }) => ({ start, end })),
    );
  });

  it("orders every projects entry in both locales", () => {
    const unordered = (["en", "es"] as const).flatMap((locale) =>
      cvByLocale[locale].projects
        .filter((entry) => !isOrdered(entry.start, entry.end))
        .map((entry) => `${locale}:${entry.id}`),
    );
    expect(unordered).toEqual([]);
  });

  it("declares the Projects section title in both interface locales", () => {
    expect(uiEn.resume.projects.length).toBeGreaterThan(0);
    expect(uiEs.resume.projects.length).toBeGreaterThan(0);
  });
});

describe("site avatar ships as WebP (T21, #119)", () => {
  // Paths go in variables: with a literal, Vite rewrites
  // `new URL("…", import.meta.url)` into an asset URL.
  const avatarWebpPath = "../../public/images/avatar.webp";
  const avatarPngPath = "../../public/images/avatar.png";

  it("points profile.avatar.src to the WebP file in both locales", () => {
    expect(cvByLocale.en.profile.avatar.src).toBe("/images/avatar.webp");
    expect(cvByLocale.es.profile.avatar.src).toBe("/images/avatar.webp");
  });

  it("ships public/images/avatar.webp as a real WebP", () => {
    const file = fileURLToPath(new URL(avatarWebpPath, import.meta.url));
    expect(existsSync(file)).toBe(true);
    const webp = readFileSync(file);
    expect(webp.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(webp.subarray(8, 12).toString("ascii")).toBe("WEBP");
  });

  it("no longer ships the PNG avatar", () => {
    const file = fileURLToPath(new URL(avatarPngPath, import.meta.url));
    expect(existsSync(file)).toBe(false);
  });
});
