# Backlog

Site **delivered** (F1–F5 closed 2026-10-08; see `docs/qa-report.md` and §XII
of `docs/diagnostics.md`). These are the **topics identified and deliberately
postponed** for the maintenance loop. None blocks the site. Each item
needs a decision from the user before it is implemented (flow per type of task:
"Maintenance mode" in `docs/agent-system.md`).

## Pending content items

- **Download CV / PDF.** ✅ Integrated: `profile.downloadCvUrl` points to
  `public/cv/Juan-Manuel-Ibanez-CV.pdf` and the Sidebar's button downloads it.
  Still open: one PDF per language? (a different `downloadCvUrl` in each
  `cv.<locale>.json`, which would become a translatable field).
- **Images.** The site's avatar is already WebP (#119). Still open: AVIF,
  sizes for the avatar's `srcset` and the format of the testimonials.

## Pending technical items

- **LinkedIn icon.** Confirmed (2026-09-30): it is not in
  `simple-icons` 16.33.0 (removed in v14 at the brand's request); the other
  networks of `SOCIAL_NETWORKS` are. Resolved in BrandIcon T1 (`9f0cc0b`):
  `BrandIcon/paths.ts` uses the canonical path of the monochrome "in" logo (the one
  `simple-icons` distributed up to v14; 24×24 geometry validated by the
  reviewer), with a comment on its origin. **Pending:** verify the exact
  equivalence against the current SVG of LinkedIn's press kit
  (`https://brand.linkedin.com/downloads` — the agents' environment has no
  network) and review its logo usage guidelines for linking to one's own profile.
- **SEO per language.** (**Open**, 2026-11-14.) Today the language is not in the
  URL (`/es/…`) and the metadata —a single `<title>`/description, #117— exist
  only in English. If SEO in Spanish matters: routes per language,
  `hreflang`, metadata per language and possibly prerender.
- **Metadata and Open Graph.** ✅ **Resolved (2026-11-14, decision #117,
  Foundation T19):** `meta description`, canonical, Open Graph (5 tags),
  `twitter:card`, JSON-LD `Person` (cross-checked with `cv.en.json`) and
  `public/og-image.png` 1200×630 in `index.html`, in English and with absolute
  URLs fixed to the GitHub Pages deploy (detail: row #117 of
  `docs/README.md` and §XXVIII of `docs/diagnostics.md`). The favicon was already
  resolved in F5: `public/favicon.svg` + `<link rel="icon">` (`b93c510`,
  decision #105a).
- **Deploy.** ✅ Resolved: GitHub Pages with CI (`lint` → `test` → `build`,
  Node 26; #107, #110, #111). Only a custom domain stays open.
- **Automated contrast test.** axe in jsdom does not measure
  contrast; evaluate Playwright + axe in a real browser for automatic QA
  in both themes.
- **Loading of languages.** Today both content JSON files go in the bundle (static
  import). If languages are added or the content grows: a dynamic `import()` per
  language in `content/index.ts`.
- **Internal documentation in English.** (**Open**, 2026-11-15, #121.) The
  code is already in English; `docs/`, `specs/`, `foundations/`, `AGENTS.md` and
  `.opencode/` are still in Spanish (L1). Translating them is a separate stage: ~90
  documents, including the agents' prompts, which would have to be tested
  again.
- **Learnings between tasks.** Today the learnings live in
  `docs/memory.md` ("Non-negotiable rules for any future task", at most ~50 lines, only
  the orchestrator edits it when closing each F gate). If it is seen that errors
  are repeated and it is not enough, design a mechanism of its own (for example, a
  `LEARNINGS.md` that the orchestrator curates with the findings of the reviewer, which
  has no write permission).

## Out of scope (do not reopen without an explicit decision)

Portfolio, Blog, Contact page, skills with a percentage, clients, preloader,
triangles background, date on testimonials, hamburger/drawer.
