// Compiles the schema with ajv in standalone mode at build time, so ajv itself
// never reaches the browser bundle.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import Ajv from "ajv";
import standaloneCode from "ajv/dist/standalone/index.js";
import type { AnySchemaObject, Schema } from "ajv";

const BANNER = "// GENERADO — no editar. Regenerar con: npm run build:validator";

const repoPath = (relativeFromRoot: string): string =>
  fileURLToPath(new URL(`../../${relativeFromRoot}`, import.meta.url));

// The exact form ajv's standalone output uses for its runtime helpers.
const AJV_RUNTIME_REQUIRE = /require\("(ajv\/dist\/runtime\/[a-z0-9-]+)"\)\.default/g;

function readSchema(): AnySchemaObject {
  const source = readFileSync(repoPath("data/cv.schema.json"), "utf8");
  const parsed: unknown = JSON.parse(source);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("data/cv.schema.json is not a JSON object");
  }
  return parsed as AnySchemaObject;
}

// ajv's runtime helpers are CommonJS with `__esModule` and `exports.default`.
// Node ESM hands over module.exports as the default import, while Vite unwraps
// `__esModule` and hands over the inner default. `raw.default ?? raw` works
// under both.
function toEsmRuntimeImports(moduleCode: string): string {
  const aliases = new Map<string, string>();
  const rewritten = moduleCode.replace(AJV_RUNTIME_REQUIRE, (_match, modulePath: string) => {
    let alias = aliases.get(modulePath);
    if (alias === undefined) {
      alias = `__ajvRuntime${aliases.size}`;
      aliases.set(modulePath, alias);
    }
    return `${alias}m.default`;
  });
  if (rewritten.includes("require(")) {
    throw new Error(
      "The ajv standalone code contains a require() that the ESM rewrite " +
        "does not cover; check AJV_RUNTIME_REQUIRE in this helper.",
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
    throw new Error("data/cv.schema.json must declare $id (the validator's root reference)");
  }

  // draft-07 needs the default Ajv class (not Ajv2019/Ajv2020), and
  // standaloneCode requires `source: true`.
  const ajv = new Ajv({ code: { source: true, esm: true } });
  ajv.compile(schema as Schema);
  // Key = export name, value = $id of the compiled root schema.
  const moduleCode = standaloneCode(ajv, { validateCv: schemaId });

  writeFileSync(
    repoPath("data/validate-cv.generated.js"),
    `${BANNER}\n${toEsmRuntimeImports(moduleCode)}\n`,
  );
  writeFileSync(repoPath("data/validate-cv.generated.d.ts"), DECLARATIONS);
}

main();
