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

/**
 * Valor declarado de `--token` dentro de `source` (hasta el `;`, recortado);
 * lanza si la declaración no existe (rojo por ausencia, nunca `undefined`).
 * Con `noUncheckedIndexedAccess`, `capture` es el único acceso a grupos.
 */
function declaredValue(source: string, token: string): string {
  const value = capture(
    source,
    new RegExp(`${token}:\\s*([^;]+);`),
    `${token} declaration`,
  );
  return value.trim();
}

/**
 * T17 (RF-10, Cambio motion #106): test de contrato de la escala de motion de
 * `tokens/tokens.css` leída con `fs` (plan.md, decisión 4: se extiende este
 * archivo, que ya lee los tokens). Régimen #101: commit único de test, verde
 * al escribirse porque aserta el documento aprobado que T15 (`c2befd1`) ya
 * aplicó; cualquier edición de esos valores sin Cambio de spec rompe acá.
 * El test NO escribe `tokens.css` (kit, fuera del permiso de foundation).
 */
describe("motion tokens scale in tokens/tokens.css (RF-10, #106)", () => {
  const tokensCss = readRepoFile("../../tokens/tokens.css");

  // Las cinco duraciones se declaran dos veces en el archivo (alcance base y
  // override de reduced motion). Se separan las dos zonas para que cada
  // aserción lea la declaración que le corresponde, sin depender del orden
  // de `capture` sobre todo el archivo.
  const reducedBlock = capture(
    tokensCss,
    /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/,
    "@media (prefers-reduced-motion: reduce) block",
  );
  const baseScope = tokensCss.slice(0, tokensCss.indexOf(reducedBlock));

  // Valores textuales exactos de la escala aprobada (spec.md → RF-10 y
  // "Tests esperados" → "Motion tokens"): `--ease-standard` y
  // `--ease-emphasized` se asertan intactos junto con los tokens nuevos.
  const MOTION_SCALE: ReadonlyArray<readonly [token: string, value: string]> =
    [
      ["--duration-fast", "0.15s"],
      ["--duration-base", "0.2s"],
      ["--duration-slow", "0.3s"],
      ["--duration-exit", "0.22s"],
      ["--duration-stagger", "0.03s"],
      ["--ease-standard", "ease-in-out"],
      ["--ease-emphasized", "cubic-bezier(0.455, 0.03, 0.515, 0.955)"],
      ["--ease-enter", "cubic-bezier(0.22, 1, 0.36, 1)"],
      ["--ease-exit", "cubic-bezier(0.4, 0, 1, 1)"],
    ];

  const DURATION_TOKENS: ReadonlyArray<string> = [
    "--duration-fast",
    "--duration-base",
    "--duration-slow",
    "--duration-exit",
    "--duration-stagger",
  ];

  it("declares the approved motion scale (five durations, four easings) in the base scope", () => {
    for (const [token, value] of MOTION_SCALE) {
      expect(declaredValue(baseScope, token), token).toBe(value);
    }
  });

  it("collapses the five durations to 0.01ms under prefers-reduced-motion: reduce", () => {
    for (const token of DURATION_TOKENS) {
      expect(declaredValue(reducedBlock, token), token).toBe("0.01ms");
    }
  });
});

/**
 * Forma mínima de `src/content/cv.en.json` para el cruce con el JSON-LD
 * (T19, RF-12): solo las claves que usa el test. El JSON se lee con `node:fs`
 * como contrato entre documentos (plan de Foundation, decisión 7), sin
 * imports de React ni del módulo de contenido.
 */
interface CvEnDocument {
  profile: { name: string; headline: string };
  social: Array<{ url: string }>;
}

/**
 * T19 (RF-11…RF-14, Cambio #117): metadatos de compartir en `index.html`.
 * Los literales de la tabla "Metadatos de compartir" de spec.md (Anatomía)
 * los fijó el usuario y se copian carácter por carácter: no se editan.
 * Régimen #101 declarado en tasks.md: la aserción del PNG (grupo f) nace en
 * verde porque `public/og-image.png` ya existe en el working tree; el commit
 * `test(Foundation): T19` sigue rojo por (a)–(e), las etiquetas ausentes.
 */
describe("index.html sharing metadata (RF-11…RF-14, #117)", () => {
  const indexHtml = readRepoFile("../../index.html");

  // Grupo (a): ocho etiquetas de una línea con su literal exacto (el `·` y la
  // ó de "Ibáñez" incluidos). La novena de la tabla es el bloque JSON-LD, cuyo
  // contrato es el objeto parseado (grupo e, RF-12): acá se aserta solo su
  // etiqueta de apertura.
  const SHARING_TAGS: ReadonlyArray<string> = [
    '<meta name="description" content="Frontend Engineer with 7+ years in React and TypeScript: design systems, accessibility and AI-assisted development." />',
    '<meta property="og:type" content="profile" />',
    '<meta property="og:title" content="Juan Manuel Ibáñez · Frontend Engineer" />',
    '<meta property="og:description" content="React · TypeScript · Design Systems · Accessibility" />',
    '<meta property="og:url" content="https://jmibann.github.io/cv-agentic/" />',
    '<meta property="og:image" content="https://jmibann.github.io/cv-agentic/og-image.png" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    '<link rel="canonical" href="https://jmibann.github.io/cv-agentic/" />',
  ];

  it("includes the nine sharing metadata tags with their exact literals (RF-11)", () => {
    for (const tag of SHARING_TAGS) {
      expect(indexHtml).toContain(tag);
    }
    expect(indexHtml).toContain('<script type="application/ld+json">');
  });

  it("ships exactly five og: metas and one twitter: meta (RF-11)", () => {
    // Grupo (b): el conteo exacto cubre el "ninguna otra etiqueta fuera de la
    // lista" de RF-11 (plan #117, decisión 5; condición 1 de #117).
    const ogCount = [...indexHtml.matchAll(/<meta\s+property="og:/g)].length;
    const twitterCount = [
      ...indexHtml.matchAll(/<meta\s+name="twitter:/g),
    ].length;
    expect(ogCount).toBe(5);
    expect(twitterCount).toBe(1);
  });

  it("keeps og:title identical to the <title> text (RF-11)", () => {
    // Grupo (c).
    const titleText = capture(
      indexHtml,
      /<title>([\s\S]*?)<\/title>/,
      "<title> text",
    );
    const ogTitle = capture(
      indexHtml,
      /<meta property="og:title" content="([^"]*)"/,
      "og:title content",
    );
    expect(ogTitle).toBe(titleText);
  });

  it("places the canonical link and the JSON-LD block after the anti-flash script (RF-13)", () => {
    // Grupo (d): refuerzo explícito del contrato T4 ("runs before the bundle",
    // arriba). Sin la etiqueta, `indexOf` da -1 y el `toBeGreaterThan` falla:
    // rojo por ausencia, nunca `undefined`.
    const scriptIndex = indexHtml.indexOf("<script>");
    expect(scriptIndex).toBeGreaterThanOrEqual(0);
    expect(indexHtml.indexOf('<link rel="canonical"')).toBeGreaterThan(
      scriptIndex,
    );
    expect(
      indexHtml.indexOf('<script type="application/ld+json">'),
    ).toBeGreaterThan(scriptIndex);
  });

  it("embeds a parsed JSON-LD Person of six keys synced with cv.en.json (RF-12)", () => {
    // Grupo (e): comparación sobre el objeto parseado (`toEqual` contra las
    // seis claves exactas; el formato del bloque en el HTML no es contrato).
    const rawBlock = capture(
      indexHtml,
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
      '<script type="application/ld+json">…</script>',
    );
    const jsonLd = JSON.parse(rawBlock) as Record<string, unknown>;
    expect(jsonLd).toEqual({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Juan Manuel Ibáñez",
      jobTitle: "Frontend Engineer",
      url: "https://jmibann.github.io/cv-agentic/",
      sameAs: [
        "https://github.com/jmibann",
        "https://www.linkedin.com/in/juanmanuelibanez",
      ],
    });

    // Cruce con el contenido real leído con `fs` (decisión 3 del plan del
    // #117): si el CV cambia y el JSON-LD no lo sigue, el desfase rompe acá.
    const cvEn = JSON.parse(
      readRepoFile("../../src/content/cv.en.json"),
    ) as CvEnDocument;
    expect(jsonLd["name"]).toBe(cvEn.profile.name);
    expect(jsonLd["jobTitle"]).toBe(cvEn.profile.headline);
    expect(jsonLd["sameAs"]).toEqual(cvEn.social.map((entry) => entry.url));

    // Identidad url del JSON-LD ≡ href del canonical ≡ og:url, además del
    // literal: si algún día cambia el dominio, no queda una etiqueta desfasada.
    const canonicalHref = capture(
      indexHtml,
      /<link rel="canonical" href="([^"]*)"/,
      "canonical href",
    );
    const ogUrl = capture(
      indexHtml,
      /<meta property="og:url" content="([^"]*)"/,
      "og:url content",
    );
    expect(jsonLd["url"]).toBe("https://jmibann.github.io/cv-agentic/");
    expect(jsonLd["url"]).toBe(canonicalHref);
    expect(ogUrl).toBe(canonicalHref);
  });

  it("ships public/og-image.png as a real 1200×630 PNG (RF-14)", () => {
    // Grupo (f): firma PNG + IHDR, como el apple-touch de T14. La ruta va en
    // una variable: con un literal, Vite reescribe `new URL("….png",
    // import.meta.url)` como URL de asset y deja de ser `file:` (T14b).
    // Nace en verde: el PNG ya existe (régimen #101, declarado en tasks).
    const ogImagePath = "../../public/og-image.png";
    const png = readFileSync(
      fileURLToPath(new URL(ogImagePath, import.meta.url)),
    );
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });
});
