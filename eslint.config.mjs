import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "assets/**",
      "demo/**",
      "dist/**",
      "docs/**",
      "guide/**",
      "node_modules/**",
      "study/**",
      "test/integrations/*/dist/**",
      "demo/edit/vs/**",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts", "test/integrations/**/*.{ts,tsx}", "*.config.ts"],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "no-control-regex": "off",
      "no-loss-of-precision": "off",
      "no-prototype-builtins": "off",
      "no-useless-assignment": "off",
      "no-undef": "off",
      "no-unused-vars": "off",
      "prefer-const": "off",
      "prefer-spread": "off",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        { "ts-expect-error": "allow-with-description" },
      ],
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["test/visual/**/*.ts"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    files: ["scripts/check-site.mjs"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, monaco: "readonly" },
    },
  },
  {
    files: [
      "bench/**/*.mjs",
      "guide/js/guide.js",
      "demo/edit/js/edit.js",
      "demo/edit/src/*.js",
      "scripts/**/*.mjs",
      "test/integrations/**/*.mjs",
      "eslint.config.mjs",
    ],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
);
