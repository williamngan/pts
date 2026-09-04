# Changelog

The revamp is a full modernization of Pts. Most existing sketches should continue to work, while the library is now faster, more predictable, easier to integrate, and better tested. This page summarizes the major changes made since work on the revamp began in August 2026.

### New capabilities

- **Modern color spaces.** `Color` now supports Oklab and Oklch, alongside corrected conversions for RGB, HSL, HSB, XYZ, LAB, LCH, and LUV. Hex colors now handle alpha correctly too.
- **A complete SVG renderer.** `SVGForm` now follows the Canvas drawing API and automatically keeps SVG elements in sync between frames. It can also serve as a reference for custom renderers.
- **Simpler UI interactions.** Spaces can track and untrack UI elements directly. UI also gains custom shape registration, line and polyline hit testing, typed actions, state helpers, and one-time or abortable handlers.
- **Improved image handling.** `Img.load` is now promise-based, images clean up through `dispose`, and loading, cropping, scaling, pixel access, and canvas drawing are more reliable.
- **Stronger sound controls.** Sound sources share audio contexts when appropriate, can be restarted safely, expose volume and cleanup controls, and report loading or input failures consistently.

### Correctness and reliability

Every core module received a detailed review. Around sixty confirmed bugs were fixed and covered by tests. The most visible fixes include:

- Points, Groups, and Bounds now handle equality, wrapped angles, empty collections, missing dimensions, and generated Groups correctly.
- Geometry operations now return accurate intersections, centers, curves, Voronoi cells, and Delaunay triangulations across edge cases.
- Perlin noise no longer repeats every twelve units, seeded noise covers the full table, and non-square noise grids keep their intended layout.
- Physics bodies no longer create duplicate or self-links, and collision and constraint behavior is more stable.
- Canvas text, image data, gradients, dashed strokes, style caching, and multiple forms sharing a context now render consistently.
- Space playback no longer starts parallel animation loops or produces large timing spikes after a pause. Mounting, resizing, input listeners, and disposal are safer in frameworks such as React.
- UI handlers keep stable identities, receive current pointer positions, and preserve built-in button and drag behavior.
- Seeded random-number sequences remain compatible with Pts 0.12 while becoming substantially faster.

### Faster everyday drawing

Hot paths throughout the library were measured and optimized. Major improvements include polygon hit testing, curve generation, Bound coordinate access, Group insertion and segmentation, pointer dispatch, UI tracking, matrix operations, noise generation, random distribution, Delaunay triangulation, image processing, typography, sound analysis, and canvas state updates.

Benchmarks now compare changes against the previous build in both Node.js and Chromium. Recorded baselines and correctness checks help prevent performance work from changing results accidentally.

### TypeScript and packages

- The codebase now uses TypeScript 6 in strict mode, with more accurate public types for optional geometry results, UI events, rendering contexts, form styles, and callbacks.
- Packages include explicit ESM and CommonJS entry points, matching type declarations, source maps, browser bundles, and checked export maps.
- Server-side imports are tested, package contents are validated before publishing, and artifact sizes have fixed budgets.
- Build scripts now use pnpm and tsdown, replacing the older collection of build tools and manual steps.

### Documentation, demos, and accessibility

- API docs and guides are generated reproducibly from source and are also available as machine-readable Markdown.
- Documentation links now point to exact classes and members, preserve deep links and browser history, and fail the build when a target is missing.
- The documentation app was upgraded to Vue 3 with safer Markdown rendering and more dependable search and navigation.
- Guide demos load only when needed, include keyboard playback controls and visible source links, and work reliably with touch input and slow-loading assets.
- The homepage, guides, documentation, demos, and editor now adapt better to narrow screens. Navigation, menus, zoom, focus, and keyboard behavior received a broad accessibility pass.
- The live editor was rebuilt around a reproducible Monaco bundle and can export a self-contained, responsive HTML file using the exact version of Pts shown in the preview.
- Google Analytics was removed, and obsolete demo assets and dependencies were cleaned up.

### Testing and project maintenance

The old test setup was replaced by a larger Vitest suite covering Node.js, real-browser behavior, type contracts, integrations, and visual regressions. CI now checks formatting, linting, types, tests, documentation, bundles, package publishing, benchmarks, browser behavior, and the generated website before a change is merged.

The repository also gained consistent formatting and line-ending rules, cleaner package metadata, documented implementation plans, and repeatable generation scripts for builds, docs, guides, and the editor.

### Compatibility notes

Most API changes are additive, but corrected bugs may produce different results when old code depended on incorrect behavior. TypeScript users may also see new compile errors where a function can legitimately return `undefined`; check the result before using it.

The following older APIs remain available but are deprecated:

- `HTMLSpace` and `HTMLForm`: use `SVGSpace` and `SVGForm`.
- `Img.loadAsync`: use `Img.load`.
- `Img.cleanup`: use `Img.dispose`.
- `SVGForm.scope` and `SVGForm.updateScope`: SVG elements are now reconciled automatically.
- The initial-box form of `Typography.fontSizeToBox`: use `fontSizeToBox(ratio, byHeight)`.
- `Util.randomInt`: use `Num.randomRange`.

For exact behavioral and TypeScript migration details, see the [full project changelog](../CHANGELOG.md).
