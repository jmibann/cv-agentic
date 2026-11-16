import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import * as ts from "typescript";
import { describe, expect, it } from "vitest";

// Guards the comment policy: comments are written in English and carry no
// internal references. The traceability to requirements lives in specs/.

const repoRootPath = "../../";
const REPO_ROOT = fileURLToPath(new URL(repoRootPath, import.meta.url));

const ROOTS = [
  "src",
  "tokens",
  "data/constants.ts",
  "vite.config.ts",
  "eslint.config.js",
  "index.html",
];

const CHECKED = /\.(ts|tsx|js|css|html)$/;

function listFiles(path: string): string[] {
  const absolute = join(REPO_ROOT, path);
  if (statSync(absolute).isFile()) {
    return [path];
  }
  return readdirSync(absolute, { recursive: true, encoding: "utf8" })
    .map((entry) => join(path, entry))
    .filter((entry) => CHECKED.test(entry));
}

function scriptComments(file: string, text: string): string[] {
  const kind = file.endsWith(".tsx")
    ? ts.ScriptKind.TSX
    : file.endsWith(".js")
      ? ts.ScriptKind.JS
      : ts.ScriptKind.TS;
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  const seen = new Set<number>();
  const comments: string[] = [];
  const collect = (ranges: readonly ts.CommentRange[] | undefined): void => {
    for (const range of ranges ?? []) {
      if (!seen.has(range.pos)) {
        seen.add(range.pos);
        comments.push(text.slice(range.pos, range.end));
      }
    }
  };
  const visit = (node: ts.Node): void => {
    // JSX text is not code: a "//" inside it is not a comment.
    if (node.kind === ts.SyntaxKind.JsxText) {
      return;
    }
    collect(ts.getLeadingCommentRanges(text, node.getFullStart()));
    if (
      node.kind !== ts.SyntaxKind.JsxOpeningElement &&
      node.kind !== ts.SyntaxKind.JsxClosingElement
    ) {
      collect(ts.getTrailingCommentRanges(text, node.getEnd()));
    }
    node.getChildren(source).forEach(visit);
  };
  visit(source);
  return comments;
}

function commentsOf(file: string): string[] {
  const text = readFileSync(join(REPO_ROOT, file), "utf8");
  if (file.endsWith(".css")) {
    return text.match(/\/\*[\s\S]*?\*\//g) ?? [];
  }
  if (file.endsWith(".html")) {
    return text.match(/<!--[\s\S]*?-->/g) ?? [];
  }
  return scriptComments(file, text);
}

const FILES = ROOTS.flatMap(listFiles).map((file) =>
  relative(REPO_ROOT, join(REPO_ROOT, file)),
);

const SPANISH =
  /[áéíóúñ¿¡]|\b(que|para|porque|cuando|del|los|las|una|pero|esto|acá|según|también)\b/i;

const INTERNAL_REFERENCE =
  /\bRF-\d+|\bT\d+[a-c]?\b|\bdecisi[oó]n\s+#?\d+|\bdecision\s+#?\d+|#\d{2,3}\b|§\s?[IVX\d]/i;

function offenders(pattern: RegExp): string[] {
  return FILES.flatMap((file) =>
    commentsOf(file)
      .filter((comment) => pattern.test(comment))
      .map((comment) => `${file}: ${comment.replace(/\s+/g, " ").slice(0, 80)}`),
  );
}

describe("source comments policy", () => {
  it("finds source files to check", () => {
    expect(FILES.length).toBeGreaterThan(100);
  });

  it("has no comments written in Spanish", () => {
    expect(offenders(SPANISH)).toEqual([]);
  });

  it("has no internal references in comments (requirement, task or decision ids)", () => {
    expect(offenders(INTERNAL_REFERENCE)).toEqual([]);
  });
});

const DOC_ROOTS = [
  "AGENTS.md",
  "README.md",
  "docs",
  "specs",
  "foundations",
  ".opencode/agents",
  ".opencode/skills",
  ".opencode/commands",
];

function listMarkdown(path: string): string[] {
  const absolute = join(REPO_ROOT, path);
  if (statSync(absolute).isFile()) {
    return [path];
  }
  return readdirSync(absolute, { recursive: true, encoding: "utf8" })
    .map((entry) => join(path, entry))
    .filter((entry) => entry.endsWith(".md"));
}

const DOCS = DOC_ROOTS.flatMap(listMarkdown);

// Code, quoted interface strings and people's names are not prose: the site
// itself is bilingual and the records quote its Spanish texts literally.
const NOT_PROSE = [
  /```[\s\S]*?```/g,
  /`[^`\n]*`/g,
  /"[^"\n]*"|“[^”\n]*”/g,
  /\b(María|Angélica|Ibáñez|González|Español)\b/g,
];

function spanishProse(file: string): string[] {
  const text = readFileSync(join(REPO_ROOT, file), "utf8");
  // Blanking keeps the line numbers of the original file.
  const prose = NOT_PROSE.reduce(
    (current, pattern) =>
      current.replace(pattern, (match) => match.replace(/[^\n]/g, " ")),
    text,
  );
  return prose
    .split("\n")
    .map((line, index) => ({ line, number: index + 1 }))
    .filter(({ line }) => SPANISH.test(line))
    .map(({ line, number }) => `${file}:${number}: ${line.trim().slice(0, 80)}`);
}

describe("documentation language policy", () => {
  it("finds documents to check", () => {
    expect(DOCS.length).toBeGreaterThan(100);
  });

  it("has no documentation prose written in Spanish", () => {
    expect(DOCS.flatMap(spanishProse)).toEqual([]);
  });
});
