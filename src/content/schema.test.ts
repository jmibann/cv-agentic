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

// Contract test between repo files: the schema, data/constants.ts, the
// generated types and the gen:types script. No DOM and no bundle involved.
const repoUrl = (relativeFromThisFile: string): URL =>
  new URL(relativeFromThisFile, import.meta.url);

const repoPath = (relativeFromThisFile: string): string =>
  fileURLToPath(repoUrl(relativeFromThisFile));

const readRepoFile = (relativeFromThisFile: string): string =>
  readFileSync(repoPath(relativeFromThisFile), "utf8");

interface SchemaEnumDefinition {
  readonly enum?: readonly string[];
}

// If the schema gains a new enum, this fails until its constant is added to
// data/constants.ts.
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

describe("schema up to date (RF-7)", () => {
  it("keeps @data/constants lists equal to the schema enums", () => {
    const schemaEnums = extractSchemaEnums(readRepoFile("../../data/cv.schema.json"));
    expect(schemaEnums).toEqual({
      // `satisfies` also ties the generated type to the constant at type-check time.
      Locale: LOCALES satisfies readonly Locale[],
      ContactType: CONTACT_TYPES,
      SocialNetwork: SOCIAL_NETWORKS,
      ServiceIcon: SERVICE_ICONS,
    });
  });

  it("keeps data/cv.types.generated.ts in sync with the schema and the gen:types options", async () => {
    const committed = readRepoFile("../../data/cv.types.generated.ts");

    // Read from the script instead of duplicated here, so CLI and test cannot drift.
    const banner = /--bannerComment="([^"]*)"/.exec(readGenTypesScript())?.[1];
    if (banner === undefined) {
      throw new Error(
        'El script "gen:types" debe fijar --bannerComment (plan.md, decisión 4)',
      );
    }

    // Regenerates in memory with the options the CLI uses, without writing the file.
    const schemaSource = readRepoFile("../../data/cv.schema.json");
    const regenerated = await compile(
      JSON.parse(schemaSource) as unknown as CompileSchemaArg,
      "data/cv.schema.json",
      { bannerComment: banner, cwd: dirname(repoPath("../../data/cv.schema.json")) },
    );
    expect(regenerated).toBe(committed);
  });
});
