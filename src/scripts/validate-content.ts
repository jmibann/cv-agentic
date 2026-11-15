// Reads the JSON files from disk instead of importing them, so a missing file
// fails with a clear error. Runs in `prebuild`: invalid content breaks the build.

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { validateCv } from "../../data/validate-cv.generated.js";

const CONTENT_FILES = ["src/content/cv.en.json", "src/content/cv.es.json"] as const;

function checkContentFile(repoRelPath: string): string | null {
  const absolute = fileURLToPath(new URL(`../../${repoRelPath}`, import.meta.url));
  if (!existsSync(absolute)) {
    return `${repoRelPath} is missing (this script does not create it)`;
  }
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(absolute, "utf8"));
  } catch (error) {
    return `${repoRelPath} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`;
  }
  if (!validateCv(raw)) {
    return `invalid content in ${repoRelPath}:\n${JSON.stringify(validateCv.errors, null, 2)}`;
  }
  return null;
}

const failures = CONTENT_FILES.map(checkContentFile).filter(
  (failure): failure is string => failure !== null,
);

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`validate:content: ${failure}`);
  }
  process.exit(1);
}

console.log(`validate:content: OK (${CONTENT_FILES.join(", ")})`);
