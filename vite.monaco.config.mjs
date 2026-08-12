import { defineConfig } from "vite";

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
  build: {
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
        assetFileNames: "pts.[ext]",
        entryFileNames: "monaco.js",
        chunkFileNames: "[name]-[hash].js",
        inlineDynamicImports: true,
      },
    },
  },
});
