// GENERADO — no editar. Regenerar con: npm run build:validator
// Declaraciones escritas por src/scripts/build-validator.ts (el código
// standalone de ajv no emite tipos).

import type { ErrorObject } from "ajv";

import type { CvData } from "./cv.types.generated";

/**
 * Type guard compilada por ajv (modo standalone) desde data/cv.schema.json.
 * Tras una llamada fallida, `validateCv.errors` lista los errores.
 */
export declare function validateCv(data: unknown): data is CvData;

export declare namespace validateCv {
  let errors: ErrorObject[] | null | undefined;
}
