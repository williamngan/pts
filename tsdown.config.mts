import { defineConfig } from "tsdown";

const banner = `/*! Copyright © 2017-present William Ngan and contributors.
Licensed under Apache 2.0 License.
See https://github.com/williamngan/pts for details. */`;

export default defineConfig([
  {
    name: "modules",
    entry: { index: "src/_module.ts" },
    format: ["esm", "cjs"],
    platform: "neutral",
    target: "es2015",
    clean: true,
    // keep doc comments in the declarations: editors show them, and the
    // @deprecated tags the changelog relies on only reach consumers this way
    dts: { sourcemap: true, compilerOptions: { removeComments: false } },
    sourcemap: true,
    minify: false,
    outputOptions: {
      comments: { annotation: true, jsdoc: false, legal: false },
      postBanner: banner,
    },
  },
  {
    name: "browser",
    entry: { pts: "src/_script.ts" },
    format: "iife",
    platform: "browser",
    target: "es2015",
    clean: false,
    dts: false,
    sourcemap: true,
    minify: false,
    outputOptions: {
      comments: { annotation: true, jsdoc: false, legal: false },
      entryFileNames: "pts.js",
      postBanner: banner,
    },
  },
  {
    name: "browser-minified",
    entry: { pts: "src/_script.ts" },
    format: "iife",
    platform: "browser",
    target: "es2015",
    clean: false,
    dts: false,
    sourcemap: true,
    minify: true,
    outputOptions: {
      comments: { annotation: true, jsdoc: false, legal: false },
      entryFileNames: "pts.min.js",
      postBanner: banner,
    },
  },
]);
