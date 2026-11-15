// Runs at import time on purpose: invalid content must break the import chain
// instead of falling back silently. JSON imports lose the schema's literal
// types, so the generated validator is what narrows them to CvData.

import en from "./cv.en.json";
import es from "./cv.es.json";

import type { CvData, Locale } from "@data/cv.types.generated";
import { validateCv } from "@data/validate-cv.generated";

function load(raw: unknown, file: string): CvData {
  if (!validateCv(raw)) {
    throw new Error(
      `Invalid content in ${file}: ${JSON.stringify(validateCv.errors)}`,
    );
  }
  return raw;
}

export const cvByLocale: Record<Locale, CvData> = {
  en: load(en, "cv.en.json"),
  es: load(es, "cv.es.json"),
};
