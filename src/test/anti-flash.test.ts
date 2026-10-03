import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * T4 (RF-1): test de contrato entre archivos crudos del repo — `index.html` ↔
 * `tokens/tokens.css` ↔ `foundations/theming.md` — leídos con `node:fs`
 * (plan.md, decisión 7: documentar contratos, no el DOM). El bundle nunca se
 * carga: `/src/main.tsx` solo existe a partir de T11 (plan.md, decisión 6).
 */
const readRepoFile = (relativeFromThisFile: string): string =>
  readFileSync(
    fileURLToPath(new URL(relativeFromThisFile, import.meta.url)),
    "utf8",
  );

/** Grupo 1 de `pattern`; lanza si falta (test en rojo, nunca `undefined`). */
function capture(source: string, pattern: RegExp, label: string): string {
  const value = pattern.exec(source)?.[1];
  if (value === undefined) {
    throw new Error(`Not found in source: ${label}`);
  }
  return value;
}

/** Grupos 1 y 2 de `pattern`; lanza si faltan. */
function captures2(
  source: string,
  pattern: RegExp,
  label: string,
): [string, string] {
  const match = pattern.exec(source);
  const first = match?.[1];
  const second = match?.[2];
  if (first === undefined || second === undefined) {
    throw new Error(`Not found in source: ${label}`);
  }
  return [first, second];
}

/**
 * El `<script>` inline: una etiqueta `<script>` plana, sin atributos (la
 * etiqueta module del bundle lleva `type`/`src`, así que nunca matchea acá).
 */
function extractInlineScript(source: string, label: string): string {
  const value = /<script>[\s\S]*?<\/script>/.exec(source)?.[0];
  if (value === undefined) {
    throw new Error(`No inline <script> found in ${label}`);
  }
  return value;
}

/**
 * Extracción robusta del bloque anti-flash canónico de
 * `foundations/theming.md`: el primer bloque de código ```html cercado,
 * reducido a su elemento `<script>` (así ambos lados comparan la misma forma).
 */
function extractThemingScriptBlock(markdown: string): string {
  const block = /```html\n([\s\S]*?)```/.exec(markdown)?.[1];
  if (block === undefined) {
    throw new Error(
      "No ```html fenced block found in foundations/theming.md",
    );
  }
  return extractInlineScript(block, "foundations/theming.md fenced block");
}

describe("index.html anti-flash (RF-1)", () => {
  const indexHtml = readRepoFile("../../index.html");
  const tokensCss = readRepoFile("../../tokens/tokens.css");
  const themingDocs = readRepoFile("../../foundations/theming.md");
  const inlineScript = extractInlineScript(indexHtml, "index.html");

  it('declares <html lang="en"> as the default locale', () => {
    expect(indexHtml).toMatch(/<html\s+lang="en">/);
  });

  it("sets the default theme-color meta to --palette-light-bg, before the inline script", () => {
    const metaColor = capture(
      indexHtml,
      /<meta name="theme-color" content="(#[0-9a-fA-F]{3,8})"/,
      '<meta name="theme-color" content="…">',
    );
    const lightBg = capture(
      tokensCss,
      /--palette-light-bg:\s*(#[0-9a-fA-F]{3,8})/,
      "--palette-light-bg",
    );
    expect(metaColor).toBe(lightBg);

    const metaIndex = indexHtml.indexOf('<meta name="theme-color"');
    const scriptIndex = indexHtml.indexOf("<script>");
    expect(metaIndex).toBeGreaterThanOrEqual(0);
    expect(metaIndex).toBeLessThan(scriptIndex);
  });

  it("uses the palette token values as the two theme-color literals in the script", () => {
    // Literales del script: `m.setAttribute("content", t === "dark" ? "#151517" : "#eceef4");`
    const [darkLiteral, lightLiteral] = captures2(
      inlineScript,
      /t === "dark" \? "(#[0-9a-fA-F]{3,8})" : "(#[0-9a-fA-F]{3,8})"/,
      "theme-color literals in the anti-flash script",
    );
    const darkBg = capture(
      tokensCss,
      /--palette-dark-bg:\s*(#[0-9a-fA-F]{3,8})/,
      "--palette-dark-bg",
    );
    const lightBg = capture(
      tokensCss,
      /--palette-light-bg:\s*(#[0-9a-fA-F]{3,8})/,
      "--palette-light-bg",
    );
    expect(darkLiteral).toBe(darkBg);
    expect(lightLiteral).toBe(lightBg);
  });

  it("copies the inline script verbatim from foundations/theming.md", () => {
    expect(inlineScript).toBe(extractThemingScriptBlock(themingDocs));
  });

  it("runs before the bundle: no <link> and no <script src> precede it", () => {
    const scriptIndex = indexHtml.indexOf("<script>");
    expect(scriptIndex).toBeGreaterThanOrEqual(0);

    const linkIndex = indexHtml.indexOf("<link");
    if (linkIndex !== -1) {
      expect(linkIndex).toBeGreaterThan(scriptIndex);
    }

    const bundleScript = /<script[^>]*\ssrc=/.exec(indexHtml);
    if (!bundleScript) {
      throw new Error('No bundle <script src="…"> found in index.html');
    }
    expect(bundleScript.index).toBeGreaterThan(scriptIndex);
  });

  it("mounts #root and loads the bundle from /src/main.tsx", () => {
    expect(indexHtml).toMatch(/<div id="root"><\/div>/);
    expect(indexHtml).toMatch(
      /<script type="module" src="\/src\/main\.tsx"><\/script>/,
    );
  });
});
