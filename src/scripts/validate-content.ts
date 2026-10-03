/**
 * Helper del script `validate:content` (RF-7; spec.md §Estados "Contenido
 * inválido"): valida `src/content/cv.en.json` y `src/content/cv.es.json`
 * contra el validador standalone generado (`data/validate-cv.generated.js`)
 * y lista `validateCv.errors` al fallar.
 *
 * Lee los JSON por sistema de archivos (no con `import`) porque el contenido
 * llega en T9: si un archivo falta, el script termina con un error claro —
 * nunca éxito silencioso ni fallback. Corre dentro de `prebuild`, así que un
 * JSON inválido o ausente rompe `npm run build` (decisión del kit: cadena
 * en seco).
 */
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { validateCv } from "../../data/validate-cv.generated.js";

const CONTENT_FILES = ["src/content/cv.en.json", "src/content/cv.es.json"] as const;

/** Devuelve el motivo del fallo o `null` si el archivo existe y valida. */
function checkContentFile(repoRelPath: string): string | null {
  const absolute = fileURLToPath(new URL(`../../${repoRelPath}`, import.meta.url));
  if (!existsSync(absolute)) {
    return `falta ${repoRelPath} (el contenido se crea en T9; este script no lo genera)`;
  }
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(absolute, "utf8"));
  } catch (error) {
    return `${repoRelPath} no es JSON válido: ${error instanceof Error ? error.message : String(error)}`;
  }
  if (!validateCv(raw)) {
    return `contenido inválido en ${repoRelPath}:\n${JSON.stringify(validateCv.errors, null, 2)}`;
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
