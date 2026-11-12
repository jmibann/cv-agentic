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

  it("ships an SVG favicon linked from the <head>", () => {
    // T13 (Cambio F5, hallazgo D4 de docs/qa-report.md): el navegador pedía
    // /favicon.ico → 404. El link debe vivir en el <head>; su posición exacta
    // (después del anti-flash) ya la garantiza el test "runs before the
    // bundle" de arriba, que no admite ningún <link> antes del script.
    const head = capture(
      indexHtml,
      /<head>([\s\S]*?)<\/head>/,
      "<head>…</head>",
    );
    expect(head).toMatch(
      /<link rel="icon" type="image\/svg\+xml" href="\/favicon\.svg" \/>/,
    );

    // `public/favicon.svg` debe existir (readFileSync lanza si no: rojo) y ser
    // XML simple válido sin parser nuevo: raíz <svg> abierta y cerrada.
    const faviconSvg = readRepoFile("../../public/favicon.svg");
    expect(faviconSvg.trimStart().startsWith("<svg")).toBe(true);
    expect(faviconSvg).toMatch(/<\/svg>\s*$/);
    // Contrato del asset con la spec (Anatomía → public/favicon.svg):
    // hexágono pointy-top sobre viewBox cuadrado 64×64 y fill #304cfd, el
    // valor de --color-accent (T13b: el original #ffb729 era un error del
    // brief, enmendado en spec/tasks).
    // El literal vive acá y en el SVG (asset público, no CSS de app).
    expect(faviconSvg).toMatch(/viewBox="0 0 64 64"/);
    expect(faviconSvg).toContain('fill="#304cfd"');
    expect(faviconSvg).not.toMatch(/<text\b/); // sin texto ni marcas
  });

  it("ships the app-style favicon, a touch icon and a real page title", () => {
    // T14 (#115): el título deja de ser el nombre del repo; el favicon pasa a
    // ícono tipo app (cuadrado redondeado + hexágono + monograma JM en
    // paths) y se agrega el apple-touch-icon para la pantalla de inicio.
    const head = capture(
      indexHtml,
      /<head>([\s\S]*?)<\/head>/,
      "<head>…</head>",
    );
    expect(head).toMatch(
      /<title>Juan Manuel Ibáñez · Frontend Engineer<\/title>/,
    );
    expect(head).toMatch(
      /<link rel="apple-touch-icon" href="\/apple-touch-icon\.png" \/>/,
    );

    const faviconSvg = readRepoFile("../../public/favicon.svg");
    expect(faviconSvg).toMatch(/<rect\b[^>]*\brx="14"[^>]*fill="#304cfd"/);
    expect(faviconSvg).toMatch(/stroke="#fff"/);

    // PNG real de 180×180: firma PNG + ancho/alto del chunk IHDR. La ruta va
    // en una variable: con un literal, Vite reescribe `new URL("….png",
    // import.meta.url)` como URL de asset y deja de ser `file:` (T14b).
    const touchIconPath = "../../public/apple-touch-icon.png";
    const png = readFileSync(
      fileURLToPath(new URL(touchIconPath, import.meta.url)),
    );
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(png.readUInt32BE(16)).toBe(180);
    expect(png.readUInt32BE(20)).toBe(180);
  });

  it("ships a well-formed favicon SVG that browsers can parse", () => {
    // T14c (#115): un `--` dentro de un comentario XML deja el SVG mal
    // formado; el servidor lo entrega con 200 pero el navegador no lo puede
    // dibujar y la pestaña cae al ícono cacheado. Se parsea como lo haría el
    // navegador (image/svg+xml) y no debe haber <parsererror>.
    const faviconSvg = readRepoFile("../../public/favicon.svg");
    const doc = new DOMParser().parseFromString(faviconSvg, "image/svg+xml");
    expect(doc.getElementsByTagName("parsererror")).toHaveLength(0);
    expect(doc.documentElement.tagName).toBe("svg");
  });
});
