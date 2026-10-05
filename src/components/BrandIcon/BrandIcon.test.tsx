// Tests de T1 (specs/primitives/BrandIcon/tasks.md) — RF-1 y RF-4: estructura
// de `paths.ts`. Por cada red de SOCIAL_NETWORKS (@data/constants): `viewBox`
// string no vacío y `d` string o array con al menos un `d` no vacío.
//
// Justificación de las queries (constitución T3): T1 es un módulo de datos
// puro (`paths.ts`), sin render ni roles accesibles que consultar; lo
// observable es la forma de cada entrada, así que el test importa el módulo y
// verifica sus campos (el patrón de tests puros de C1). La cobertura total la
// garantiza en compilación el tipo `Record<SocialNetwork, BrandPath>` del
// módulo (si `SOCIAL_NETWORKS` creciera sin entrada, `tsc` falla: lo sostiene
// el pipeline typecheck, igual que RF-5 en Icon); el test la ancla además en
// runtime contra la lista.
//
// El cierre `expectNoA11yViolations` de la spec (Tests esperados) llega con
// T4 junto al render del componente (tasks.md → T4); en T1 no hay <svg> que
// auditar.

import { describe, expect, it } from "vitest";

import { SOCIAL_NETWORKS } from "@data/constants";

import { BRAND_PATHS } from "./paths";

// Helper del test: normaliza `d` (string | string[]) a lista para recorrerla.
function toPathList(d: string | string[]): string[] {
  return Array.isArray(d) ? d : [d];
}

describe("BrandIcon paths structure", () => {
  // extra: ancla en runtime la cobertura total que el tipo Record sostiene en
  // compilación (RF-1: "una entrada por red"); sin contraparte literal en
  // "Tests esperados" pero deriva directo de la tarea T1 ("el módulo
  // typechequea contra SocialNetwork").
  it("has exactly one entry per network in SOCIAL_NETWORKS", () => {
    const keys = Object.keys(BRAND_PATHS);

    expect(keys).toHaveLength(SOCIAL_NETWORKS.length);
    for (const network of SOCIAL_NETWORKS) {
      expect(keys).toContain(network);
    }
  });

  it.each([...SOCIAL_NETWORKS])(
    "\"%s\" has a non-empty viewBox string",
    (network) => {
      const entry = BRAND_PATHS[network];

      expect(typeof entry.viewBox).toBe("string");
      expect(entry.viewBox.trim()).not.toBe("");
    },
  );

  it.each([...SOCIAL_NETWORKS])(
    "\"%s\" has a `d` string or array with at least one non-empty path",
    (network) => {
      const entry = BRAND_PATHS[network];
      const paths = toPathList(entry.d);

      // `d` es string (lista de un elemento) o array no vacío de strings.
      expect(paths.length).toBeGreaterThan(0);
      for (const d of paths) {
        expect(typeof d).toBe("string");
      }
      expect(paths.some((d) => d.trim() !== "")).toBe(true);
    },
  );
});
