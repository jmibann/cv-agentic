import { readFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { compile } from "json-schema-to-typescript";
import { describe, expect, it } from "vitest";

import {
  CONTACT_TYPES,
  LOCALES,
  SERVICE_ICONS,
  SOCIAL_NETWORKS,
} from "@data/constants";
import type { Locale } from "@data/cv.types.generated";

/**
 * T8 (RF-7): test de contrato entre documentos del repo (plan.md, decisión 7,
 * igual que `src/test/anti-flash.test.ts`): `data/cv.schema.json` ↔
 * `data/constants.ts` ↔ `data/cv.types.generated.ts` ↔ el script `gen:types`
 * de `package.json`. No se toca el DOM ni se importa el bundle.
 *
 * El import type de `@data/cv.types.generated` además ejercita el alias
 * `@data/*` (spec.md §API: "debe resolver también en Vitest") tanto en el
 * typecheck como en la resolución de módulos de Vitest.
 */
const readRepoFile = (relativeFromThisFile: string): string =>
  readFileSync(
    fileURLToPath(new URL(relativeFromThisFile, import.meta.url)),
    "utf8",
  );

/** Definición del esquema que nos interesa: solo puede traer `enum`. */
interface SchemaEnumDefinition {
  readonly enum?: readonly string[];
}

/**
 * Extrae `{ nombreDeDefinition: enum }` de TODAS las definiciones del esquema
 * que tengan `enum` (Locale, ContactType, SocialNetwork, ServiceIcon). Si el
 * esquema agrega un `enum` nuevo, este test lo reclama hasta agregar su
 * constante en `data/constants.ts` (o justificar que no necesita lista).
 */
function extractSchemaEnums(schemaSource: string): Record<string, readonly string[]> {
  const parsed: unknown = JSON.parse(schemaSource);
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("data/cv.schema.json no es un objeto JSON");
  }
  const definitions = (
    parsed as { definitions?: Record<string, SchemaEnumDefinition | undefined> }
  ).definitions;
  if (definitions === undefined) {
    throw new Error("data/cv.schema.json no tiene `definitions`");
  }
  const enums: Record<string, readonly string[]> = {};
  for (const [name, definition] of Object.entries(definitions)) {
    if (definition?.enum !== undefined) {
      enums[name] = definition.enum;
    }
  }
  return enums;
}

/** Lee el script `gen:types` de `package.json` (fuente del `bannerComment`). */
function readGenTypesScript(): string {
  const parsed: unknown = JSON.parse(readRepoFile("../../package.json"));
  const script = (parsed as { scripts?: Record<string, string | undefined> })
    .scripts?.["gen:types"];
  if (script === undefined) {
    throw new Error('package.json no define el script "gen:types"');
  }
  return script;
}

type CompileSchemaArg = Parameters<typeof compile>[0];

describe("Esquema al día (RF-7)", () => {
  it("keeps @data/constants lists equal to the schema enums", () => {
    const schemaEnums = extractSchemaEnums(readRepoFile("../../data/cv.schema.json"));
    expect(schemaEnums).toEqual({
      // `satisfies` amarra además el tipo generado (`Locale`) a la constante
      // en el typecheck: si `gen:types` y `constants.ts` divergen, rompe aquí.
      Locale: LOCALES satisfies readonly Locale[],
      ContactType: CONTACT_TYPES,
      SocialNetwork: SOCIAL_NETWORKS,
      ServiceIcon: SERVICE_ICONS,
    });
  });

  it("keeps data/cv.types.generated.ts in sync with the schema and the gen:types options", async () => {
    const committed = readRepoFile("../../data/cv.types.generated.ts");

    // El banner vive en una sola parte: el script `gen:types` de
    // `package.json` (decisión 4 del plan, enmendada con aprobación del
    // usuario). El test lo lee del script en vez de duplicar la cadena, así
    // CLI y test nunca pueden divergir por copia.
    const banner = /--bannerComment="([^"]*)"/.exec(readGenTypesScript())?.[1];
    if (banner === undefined) {
      throw new Error(
        'El script "gen:types" debe fijar --bannerComment (plan.md, decisión 4)',
      );
    }

    // Regeneración en memoria espejo de la CLI (sin escribir el archivo):
    // mismos `name` (el CLI pasa `argIn`, cli.js:141) y `cwd` (el CLI pasa
    // dirname del archivo de entrada, cli.js:140) y solo `bannerComment`
    // como opción propia; el resto lo aporta DEFAULT_OPTIONS, idéntico en
    // CLI y API (index.js:30). Sin marcas de tiempo: es determinista.
    const schemaSource = readRepoFile("../../data/cv.schema.json");
    const schemaPath = fileURLToPath(new URL("../../data/cv.schema.json", import.meta.url));
    const regenerated = await compile(
      JSON.parse(schemaSource) as unknown as CompileSchemaArg,
      "data/cv.schema.json",
      { bannerComment: banner, cwd: dirname(schemaPath) },
    );
    expect(regenerated).toBe(committed);
  });
});
