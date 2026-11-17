import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

// Contract test between raw repo files (index.html, tokens.css and
// foundations/theming.md), read from disk. The bundle is never loaded.
const readRepoFile = (relativeFromThisFile: string): string =>
  readFileSync(
    fileURLToPath(new URL(relativeFromThisFile, import.meta.url)),
    "utf8",
  );

function capture(source: string, pattern: RegExp, label: string): string {
  const value = pattern.exec(source)?.[1];
  if (value === undefined) {
    throw new Error(`Not found in source: ${label}`);
  }
  return value;
}

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

// A bare <script> with no attributes: the bundle's tag carries type/src and
// never matches.
function extractInlineScript(source: string, label: string): string {
  const value = /<script>[\s\S]*?<\/script>/.exec(source)?.[0];
  if (value === undefined) {
    throw new Error(`No inline <script> found in ${label}`);
  }
  return value;
}

// The first fenced html block of theming.md, reduced to its <script> element
// so both sides compare the same shape.
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
    // The browser used to request /favicon.ico and get a 404.
    const head = capture(
      indexHtml,
      /<head>([\s\S]*?)<\/head>/,
      "<head>…</head>",
    );
    expect(head).toMatch(
      /<link rel="icon" type="image\/svg\+xml" href="\/favicon\.svg" \/>/,
    );

    const faviconSvg = readRepoFile("../../public/favicon.svg");
    expect(faviconSvg.trimStart().startsWith("<svg")).toBe(true);
    expect(faviconSvg).toMatch(/<\/svg>\s*$/);
    expect(faviconSvg).toMatch(/viewBox="0 0 64 64"/);
    expect(faviconSvg).toContain('fill="#304cfd"');
    expect(faviconSvg).not.toMatch(/<text\b/);
  });

  it("ships the app-style favicon, a touch icon and a real page title", () => {
    const head = capture(
      indexHtml,
      /<head>([\s\S]*?)<\/head>/,
      "<head>…</head>",
    );
    expect(head).toMatch(
      /<title>Juan Manuel Ibañez · Frontend Engineer<\/title>/,
    );
    expect(head).toMatch(
      /<link rel="apple-touch-icon" href="\/apple-touch-icon\.png" \/>/,
    );

    const faviconSvg = readRepoFile("../../public/favicon.svg");
    expect(faviconSvg).toMatch(/<rect\b[^>]*\brx="14"[^>]*fill="#304cfd"/);
    expect(faviconSvg).toMatch(/stroke="#fff"/);

    // The path goes in a variable: with a literal, Vite rewrites
    // `new URL("….png", import.meta.url)` into an asset URL and it stops being a
    // file: URL.
    const touchIconPath = "../../public/apple-touch-icon.png";
    const png = readFileSync(
      fileURLToPath(new URL(touchIconPath, import.meta.url)),
    );
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(png.readUInt32BE(16)).toBe(180);
    expect(png.readUInt32BE(20)).toBe(180);
  });

  it("ships a well-formed favicon SVG that browsers can parse", () => {
    // A `--` inside an XML comment makes the SVG malformed: the server still
    // answers 200 but the browser cannot draw it. Parsed here as the browser does.
    const faviconSvg = readRepoFile("../../public/favicon.svg");
    const doc = new DOMParser().parseFromString(faviconSvg, "image/svg+xml");
    expect(doc.getElementsByTagName("parsererror")).toHaveLength(0);
    expect(doc.documentElement.tagName).toBe("svg");
  });
});

function declaredValue(source: string, token: string): string {
  const value = capture(
    source,
    new RegExp(`${token}:\\s*([^;]+);`),
    `${token} declaration`,
  );
  return value.trim();
}

describe("motion tokens scale in tokens/tokens.css (RF-10, #106)", () => {
  const tokensCss = readRepoFile("../../tokens/tokens.css");

  // The durations are declared twice (base scope and the reduced-motion
  // override). The two zones are split so each assertion reads its own.
  const reducedBlock = capture(
    tokensCss,
    /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/,
    "@media (prefers-reduced-motion: reduce) block",
  );
  const baseScope = tokensCss.slice(0, tokensCss.indexOf(reducedBlock));

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

interface CvEnDocument {
  profile: { name: string; headline: string };
  social: Array<{ url: string }>;
}

describe("index.html sharing metadata (RF-11…RF-14, #117)", () => {
  const indexHtml = readRepoFile("../../index.html");

  // These literals were fixed by the site owner and are copied character by
  // character.
  const SHARING_TAGS: ReadonlyArray<string> = [
    '<meta name="description" content="Frontend Engineer with 7+ years in React and TypeScript: design systems, accessibility and AI-assisted development." />',
    '<meta property="og:type" content="profile" />',
    '<meta property="og:title" content="Juan Manuel Ibañez · Frontend Engineer" />',
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
    // The exact count is what enforces "no other tags".
    const ogCount = [...indexHtml.matchAll(/<meta\s+property="og:/g)].length;
    const twitterCount = [
      ...indexHtml.matchAll(/<meta\s+name="twitter:/g),
    ].length;
    expect(ogCount).toBe(5);
    expect(twitterCount).toBe(1);
  });

  it("keeps og:title identical to the <title> text (RF-11)", () => {
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
    // Compared as a parsed object: how the block is formatted in the HTML is not
    // part of the contract.
    const rawBlock = capture(
      indexHtml,
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
      '<script type="application/ld+json">…</script>',
    );
    const jsonLd = JSON.parse(rawBlock) as Record<string, unknown>;
    expect(jsonLd).toEqual({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Juan Manuel Ibañez",
      jobTitle: "Frontend Engineer",
      url: "https://jmibann.github.io/cv-agentic/",
      sameAs: [
        "https://github.com/jmibann",
        "https://www.linkedin.com/in/juanmanuelibanez",
      ],
    });

    // Cross-checked with the real content: if the CV changes and the JSON-LD does
    // not follow, it breaks here.
    const cvEn = JSON.parse(
      readRepoFile("../../src/content/cv.en.json"),
    ) as CvEnDocument;
    expect(jsonLd["name"]).toBe(cvEn.profile.name);
    expect(jsonLd["jobTitle"]).toBe(cvEn.profile.headline);
    expect(jsonLd["sameAs"]).toEqual(cvEn.social.map((entry) => entry.url));

    // The JSON-LD url, the canonical href and og:url must be the same string, so
    // a domain change cannot leave one of them behind.
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
    // Path in a variable for the same reason as the touch icon above.
    const ogImagePath = "../../public/og-image.png";
    const png = readFileSync(
      fileURLToPath(new URL(ogImagePath, import.meta.url)),
    );
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });
});
