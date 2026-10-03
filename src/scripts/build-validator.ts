/**
 * Helper del script `build:validator` (T8; plan.md decisión 3: se ejecuta con
 * `node` directo vía type-stripping de Node 24 y vive en `src/scripts/` porque
 * es lo único que el agente foundation puede escribir; `data/` solo se toca a
 * través de los `*.generated.*` que generan estos scripts, nunca a mano).
 *
 * Compila `data/cv.schema.json` con ajv en modo *standalone* (build-time; la
 * librería ajv no entra en el bundle del navegador) y escribe:
 *
 *  - `data/validate-cv.generated.js`: función validadora precompilada, ESM,
 *    con export nombrado `validateCv`. Los `require("ajv/dist/runtime/…")`
 *    que emite ajv se reescriben a `import` estáticos porque `code.esm` solo
 *    cambia la forma del `export`, no las dependencias de runtime, y el repo
 *    es `"type": "module"`.
 *  - `data/validate-cv.generated.d.ts`: este helper lo escribe como texto
 *    fijo (ajv no genera tipos): `validateCv(data: unknown): data is CvData`
 *    y `validateCv.errors`, como exige `foundations/i18n.md` §Contenido.
 *
 * Determinismo: la entrada es el esquema; la reescritura es estable; no hay
 * marcas de tiempo. Reejecutar el script no produce `git diff`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import Ajv from "ajv";
import standaloneCode from "ajv/dist/standalone/index.js";
import type { AnySchemaObject, Schema } from "ajv";

const BANNER = "// GENERADO — no editar. Regenerar con: npm run build:validator";

/** Ruta absoluta desde este archivo (`src/scripts/`) hasta la raíz del repo. */
const repoPath = (relativeFromRoot: string): string =>
  fileURLToPath(new URL(`../../${relativeFromRoot}`, import.meta.url));

/**
 * `require("ajv/dist/runtime/<modulo>").default` tal como lo emite la
 * generación standalone de ajv (p. ej. `ucs2length` para `minLength`).
 */
const AJV_RUNTIME_REQUIRE = /require\("(ajv\/dist\/runtime\/[a-z0-9-]+)"\)\.default/g;

/** Lee el esquema y valida lo mínimo: sin `any` y con errores claros. */
function readSchema(): AnySchemaObject {
  const source = readFileSync(repoPath("data/cv.schema.json"), "utf8");
  const parsed: unknown = JSON.parse(source);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("data/cv.schema.json no es un objeto JSON");
  }
  return parsed as AnySchemaObject;
}

/**
 * Reescribe los `require(...).default` del módulo generado a imports ESM con
 * interop: `import __ajvRuntimeN from "ajv/dist/runtime/<modulo>.js"` + un
 * shim `const __ajvRuntimeNm = { default: __ajvRuntimeN.default ??
 * __ajvRuntimeN }`. Por qué el shim (surface en T9, primer consumo bajo
 * Vite/Vitest): los runtime de ajv son CJS con `__esModule` + `exports.default`.
 * En Node ESM el default import es `module.exports` (objeto con `.default`);
 * Vite (dev, tests y build de navegador) desenvuelve `__esModule` y entrega el
 * default interno (`ucs2length`, una función) y `fn.default` es `undefined`.
 * `raw.default ?? raw` tolera ambas formas (y también un namespace import).
 * Alias numerados por orden de aparición: determinista. Si quedara algún
 * `require(` sin cubrir, el script falla en vez de emitir código roto.
 */
function toEsmRuntimeImports(moduleCode: string): string {
  const aliases = new Map<string, string>();
  const rewritten = moduleCode.replace(AJV_RUNTIME_REQUIRE, (_match, modulePath: string) => {
    let alias = aliases.get(modulePath);
    if (alias === undefined) {
      alias = `__ajvRuntime${aliases.size}`;
      aliases.set(modulePath, alias);
    }
    // Uso a través del shim (`__ajvRuntimeNm.default`), no del import crudo.
    return `${alias}m.default`;
  });
  if (rewritten.includes("require(")) {
    throw new Error(
      "El código standalone de ajv trae un require() no cubierto por la " +
        "reescritura ESM; revisar AJV_RUNTIME_REQUIRE en este helper.",
    );
  }
  const imports = [...aliases]
    .map(
      ([modulePath, alias]) =>
        `import ${alias} from "${modulePath}.js";\n` +
        `const ${alias}m = { default: ${alias}.default ?? ${alias} };`,
    )
    .join("\n");
  return `${imports}\n${rewritten}`;
}

/** Declaraciones del validador (texto fijo, spec §API / foundations/i18n.md). */
const DECLARATIONS = `${BANNER}
// Declaraciones escritas por src/scripts/build-validator.ts (el código
// standalone de ajv no emite tipos).

import type { ErrorObject } from "ajv";

import type { CvData } from "./cv.types.generated";

/**
 * Type guard compilada por ajv (modo standalone) desde data/cv.schema.json.
 * Tras una llamada fallida, \`validateCv.errors\` lista los errores.
 */
export declare function validateCv(data: unknown): data is CvData;

export declare namespace validateCv {
  let errors: ErrorObject[] | null | undefined;
}
`;

function main(): void {
  const schema = readSchema();
  const schemaId = schema["$id"];
  if (typeof schemaId !== "string" || schemaId.length === 0) {
    throw new Error("data/cv.schema.json debe declarar $id (referencia raíz del validador)");
  }

  // draft-07: `Ajv` por defecto (no Ajv2019/Ajv2020). `source: true` es
  // requisito de standaloneCode; `esm: true` exporta en ESM.
  const ajv = new Ajv({ code: { source: true, esm: true } });
  ajv.compile(schema as Schema);
  // Clave = nombre del export (`validateCv`), valor = $id de la raíz compilada.
  const moduleCode = standaloneCode(ajv, { validateCv: schemaId });

  writeFileSync(
    repoPath("data/validate-cv.generated.js"),
    `${BANNER}\n${toEsmRuntimeImports(moduleCode)}\n`,
  );
  writeFileSync(repoPath("data/validate-cv.generated.d.ts"), DECLARATIONS);
}

main();
