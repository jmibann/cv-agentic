// Contenido inicial validado (T9, RF-7). Contrato: foundations/i18n.md →
// "Contenido: un JSON por idioma, validado con JSON Schema" (snippet `load` +
// `cvByLocale` tal cual) y spec.md §API (`cvByLocale: Record<Locale, CvData>`;
// `load()` lanza si `validateCv` falla).
//
// Módulo de datos puro: sin React ni DOM (C1). Se ejecuta al importar
// (inicializador del const exportado, como fija la spec): un JSON inválido
// rompe la cadena de imports — no hay fallback silencioso (spec §Estados,
// "Contenido inválido"). Los JSON se importan estáticamente (`resolveJsonModule`):
// TypeScript pierde los literales del esquema, por eso manda el type guard
// generado por ajv (`data/validate-cv.generated`), nunca el tipo por import.
import en from "./cv.en.json";
import es from "./cv.es.json";

import type { CvData, Locale } from "@data/cv.types.generated";
import { validateCv } from "@data/validate-cv.generated";

/** Devuelve el JSON validado como `CvData` o lanza con los errores del validador. */
function load(raw: unknown, file: string): CvData {
  if (!validateCv(raw)) {
    throw new Error(
      `Contenido inválido en ${file}: ${JSON.stringify(validateCv.errors)}`,
    );
  }
  return raw;
}

export const cvByLocale: Record<Locale, CvData> = {
  en: load(en, "cv.en.json"),
  es: load(es, "cv.es.json"),
};
