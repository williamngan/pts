import { defineConfig } from "vite";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const monacoRequire = createRequire(import.meta.resolve("monaco-editor"));
const sanitizer = join(
  dirname(monacoRequire.resolve("dompurify")),
  "purify.es.mjs",
);

/**
 * Builds the editor's Monaco bundle. Run via `scripts/build-editor.mjs`.
 *
 * Three output decisions here are load-bearing, and each was arrived at by
 * something breaking:
 *
 *  - **ES module, not IIFE.** Monaco's worker bootstrap uses `import.meta.url`,
 *    which an IIFE bundle cannot represent — rolldown substitutes an empty
 *    object and the editor worker silently fails to start.
 *
 *  - **One self-contained file.** The entry has a stable name but split chunks
 *    are content-hashed, so every rebuild renames them. A browser holding a
 *    cached `monaco.js` would then import a chunk that no longer exists, get a
 *    404, and leave the editor permanently blank — the page loads, then nothing
 *    appears. Inlining removes the possibility: a cached entry is always
 *    internally consistent.
 *
 *  - **`.js`, never `.mjs`.** Plenty of static file servers have no MIME
 *    mapping for `.mjs` and serve it as application/octet-stream, which
 *    browsers refuse to execute as a module.
 */
export default defineConfig({
  // Relative, so any emitted asset URL resolves next to the bundle rather than
  // at the site root — the editor lives at /demo/edit/, not /.
  base: "./",
  // Monaco also vendors an older copy internally: a lockfile override alone
  // does not replace that code. Bundle the patched package instead.
  resolve: {
    alias: [
      { find: /^(?:.*\/)?dompurify\/dompurify\.js$/, replacement: sanitizer },
    ],
  },
  plugins: [
    {
      name: "verify-editor-sanitizer",
      generateBundle() {
        const modules = [...this.getModuleIds()];
        if (
          !modules.includes(sanitizer) ||
          modules.some((id) =>
            /\/monaco-editor\/esm\/.*\/dompurify\.js$/.test(id),
          )
        ) {
          throw new Error(
            "Editor must bundle the patched DOMPurify package, not Monaco's vendored copy",
          );
        }
      },
    },
  ],
  build: {
    license: { fileName: "THIRD-PARTY-NOTICES.md" },
    lib: {
      entry: "demo/edit/src/editor.entry.js",
      formats: ["es"],
      fileName: () => "monaco.js",
    },
    outDir: "demo/edit/vs",
    emptyOutDir: true,
    minify: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        banner: "/*! Third-party licenses: ./THIRD-PARTY-NOTICES.md */",
        assetFileNames: "pts.[ext]",
        entryFileNames: "monaco.js",
        chunkFileNames: "[name]-[hash].js",
        codeSplitting: false,
      },
    },
  },
});
