import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

const ptsGlobals = Object.fromEntries(
  [
    "Body",
    "Bound",
    "CanvasForm",
    "CanvasSpace",
    "Circle",
    "Color",
    "Const",
    "Create",
    "Curve",
    "Delaunay",
    "DOMSpace",
    "Font",
    "Form",
    "Geom",
    "Group",
    "HTMLForm",
    "HTMLSpace",
    "Img",
    "Line",
    "Mat",
    "MultiTouchSpace",
    "Noise",
    "Num",
    "Particle",
    "Polygon",
    "Pt",
    "Pts",
    "Range",
    "Rectangle",
    "Shaping",
    "Sound",
    "Space",
    "SVGContext2D",
    "SVGForm",
    "SVGSpace",
    "Tempo",
    "Triangle",
    "Typography",
    "UI",
    "UIButton",
    "UIDragger",
    "UIPointerActions",
    "UIShape",
    "Util",
    "Vec",
    "VisualForm",
    "World",
    "form",
    "space",
  ].map((name) => [name, "readonly"]),
);

export default tseslint.config(
  {
    ignores: [
      "demo/edit/js/pts-api.js",
      "demo/edit/vs/**",
      "demo/more/**",
      "dist/**",
      "docs/**",
      "guide/js/highlight.pack.js",
      "node_modules/**",
      "study/**",
      "test/integrations/*/dist/**",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["assets/cover.js", "demo/*.js", "guide/js/examples/*.js"],
    languageOptions: {
      globals: { ...globals.browser, ...ptsGlobals },
      sourceType: "script",
    },
    rules: {
      "array-callback-return": "error",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["demo/edit/js/edit.js"],
    languageOptions: {
      globals: { ...globals.browser, monaco: "readonly" },
      sourceType: "script",
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["guide/js/guide.js"],
    languageOptions: {
      globals: { ...globals.browser, Pts: "readonly" },
      sourceType: "script",
    },
  },
  {
    files: ["demo/edit/src/*.js"],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
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
