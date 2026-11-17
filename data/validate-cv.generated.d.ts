// GENERATED — do not edit. Regenerate with: npm run build:validator
// Declarations written by src/scripts/build-validator.ts (the ajv standalone
// code emits no types).

import type { ErrorObject } from "ajv";

import type { CvData } from "./cv.types.generated";

/**
 * Type guard compiled by ajv (standalone mode) from data/cv.schema.json.
 * After a failed call, `validateCv.errors` lists the errors.
 */
export declare function validateCv(data: unknown): data is CvData;

export declare namespace validateCv {
  let errors: ErrorObject[] | null | undefined;
}
