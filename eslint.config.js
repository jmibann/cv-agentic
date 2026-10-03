// ESLint 10, flat config (decisión #35). Sin eslint-plugin-jsx-a11y
// (incompatible con ESLint 10; la accesibilidad se verifica con axe en los
// tests y en la revisión). Sin eslint:recommended explícito para no importar
// `@eslint/js` ni `globals` (fuera de la tabla de dependencias aprobadas):
// la cobertura viene de typescript-eslint strict + react-hooks + react-refresh.
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // node_modules ya se ignora por default; se explicita igual.
    // Los `data/*.generated.*` no se retocan y no pueden pasar `strict`
    // (decisión 2 del plan de Foundation).
    ignores: ["node_modules/", "dist/", "data/*.generated.*"],
  },

  ...tseslint.configs.strict,

  {
    files: ["**/*.{ts,tsx}"],
    // `configs.flat[...]`: la variante flat (plugins como objeto); la raíz
    // `configs["recommended-latest"]` es eslintrc y rompe ESLint 10.
    extends: [
      reactHooks.configs.flat["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    // Excepción aprobada por el usuario (Cambio T5b, plan §decisión 2 enmendada):
    // los providers spíados exportan su hook junto al componente (spec.md §API:
    // ThemeProvider + useTheme; LocaleProvider + useLocale + useCv). La regla
    // identifica componentes por mayúscula inicial y no tiene caso para hooks;
    // allowExportNames evita dividir los providers (alternativa descartada:
    // hooks en .ts aparte, viola la Anatomía).
    rules: {
      "react-refresh/only-export-components": [
        "error",
        {
          allowConstantExport: true,
          allowExportNames: ["useTheme", "useLocale", "useCv"],
        },
      ],
    },
  },

  {
    // Regla dura 1 de docs/DESIGN.md: cero colores literales en componentes;
    // solo tokens. El `\b` evita falsos positivos en `url(#accent-gradient)`.
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
