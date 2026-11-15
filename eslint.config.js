// Flat config. No eslint-plugin-jsx-a11y (incompatible with ESLint 10):
// accessibility is checked with axe in the tests.

import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // Generated files are never hand-edited and cannot pass the strict rules.
    ignores: ["node_modules/", "dist/", "data/*.generated.*"],
  },

  ...tseslint.configs.strict,

  {
    files: ["**/*.{ts,tsx}"],
    // `configs.flat[...]` is the flat variant; the root "recommended-latest" is
    // an eslintrc config and breaks ESLint 10.
    extends: [
      reactHooks.configs.flat["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    // The rule only recognises components by their capital initial, so hooks
    // and pure exports that live next to a component are allowed by name.
    rules: {
      "react-refresh/only-export-components": [
        "error",
        {
          allowConstantExport: true,
          allowExportNames: [
            "useTheme",
            "useLocale",
            "useCv",
            "BRAND_NAMES",
            "getTabId",
          ],
        },
      ],
    },
  },

  {
    // No color literals in components, only tokens. The `\b` avoids false
    // positives on url(#accent-gradient).
    files: ["**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/(#[0-9a-fA-F]{3,8}\\b|rgb\\(|hsl\\()/]",
          message:
            "Colores literales prohibidos en .tsx: usá tokens CSS (--color-*, --gradient-*). Ver docs/DESIGN.md → regla dura 1.",
        },
      ],
    },
  },
);
