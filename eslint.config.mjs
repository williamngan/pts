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
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts", "*.config.ts"],
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
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["scripts/**/*.mjs", "eslint.config.mjs"],
    languageOptions: { globals: globals.node },
  },
);
