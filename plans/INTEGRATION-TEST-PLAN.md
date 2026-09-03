# Pts consumer integration-test plan

**Date:** 2026-08-10\
**Scope:** Durable consumer fixtures for React with Vite, Vue with Vite, Node with `skia-canvas`, and a single-file vanilla browser page.

## Objective

Prove that the package produced by Pts works in representative framework, browser-global, bundler, TypeScript, and server-side canvas environments. Keep each fixture small enough to diagnose failures and structured so another environment can be added without expanding one central test script with framework-specific application code.

These are compatibility fixtures, not product examples. Each must verify real Pts behavior after installation from an npm tarball, not merely prove that its framework can render a heading.

## Package-manager decision

Use pnpm for the root Pts development workflow and a nested, private npm workspace under `test/integrations`.

The nested workspace deliberately remains on npm: it is an isolated consumer fixture with its own manifest and lockfile, so framework-only dependencies do not enter the root pnpm graph or alter the published package. This also exercises the npm installation path used by package consumers.

The root Pts package will not become a workspace or monorepo. The fixture workspace is test infrastructure only.

## Planned structure

```text
test/integrations/
├── README.md
├── package.json
├── package-lock.json
├── react-vite/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig files
│   ├── vite.config.ts
│   └── src/
├── vue-vite/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
├── skia-canvas/
│   ├── package.json
│   └── render.mjs
└── vanilla/
    └── index.html
```

The vanilla fixture must remain one HTML file: inline CSS, inline JavaScript, and a classic script reference to the installed `pts.min.js`. It will not be transformed by Vite.

## Package isolation model

Committed workspace manifests use `file:../../..` for Pts so a maintainer can install and run a fixture directly against the current repository.

The automated integration runner will use a stricter path:

1. Produce a fresh tarball with `npm pack`.
2. Extract that tarball into a temporary Pts package root. This directory contains only files npm would publish.
3. Copy the integration workspace beneath that root at `test/integrations`, preserving the committed `file:../../..` relationship.
4. Run `npm ci` against the committed nested lockfile. Its local Pts link now targets the extracted package, not the source checkout.
5. Assert that the installed Pts path resolves inside the temporary package root and that Node ESM selects `dist/index.mjs`.
6. Build and run all fixtures from that temporary, locked installation.
7. Remove the temporary workspace, servers, and browser even when a test fails.

The existing package audit remains responsible for the exact published-file allowlist, CJS, NodeNext, and ATTW/publint. These integration tests add consumer breadth rather than duplicating every package test.

## Environment matrix

| Fixture                   | Consumer surface                                   | Required assertions                                                                                                                                                                                                            |
| ------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| React + Vite + TypeScript | ESM conditional export and declarations            | Production build succeeds; real Chromium mounts React; `CanvasSpace` reaches ready state, draws pixels, animates, and disposes on deliberate component unmount; `Pt` behavior is visible in page state; no browser/page errors |
| Vue + Vite + TypeScript   | ESM conditional export and declarations            | Production build succeeds; real Chromium mounts Vue Composition API component; the same Pts pixel and deliberate unmount/disposal lifecycle passes; no browser/page errors                                                     |
| `skia-canvas` + Node ESM  | ESM import in a non-DOM Node canvas implementation | `CanvasForm` accepts the Skia 2D context; geometry and drawing calls complete; PNG bytes have a valid signature and nontrivial size; no output image is committed                                                              |
| Vanilla single HTML       | Published minified IIFE and `globalThis.Pts`       | A static server serves the untouched HTML and installed `pts.min.js`; Chromium observes the global, creates/draws/animates/disposes `CanvasSpace`, and exposes deterministic pass state                                        |

React and Vue should use current create-vite-style TypeScript scaffolds and official Vite plugins. The fixtures intentionally use production builds: this tests optimized ESM consumption instead of only development-server transforms.

## Runner design

Add one root script, `scripts/check-integrations.mjs`, responsible only for orchestration:

- pack, extract, and prepare the isolated workspace;
- install exact fixture dependencies with the committed lockfile;
- assert tarball module resolution;
- invoke each fixture's own build or test script;
- serve built/static files with an in-process HTTP server on ephemeral ports;
- use the existing root Playwright installation for browser assertions;
- collect page errors and failed network responses;
- guarantee cleanup with `try`/`finally`.

Application logic remains in each fixture. Adding another environment should normally require a new fixture directory and one matrix entry in the runner, not embedding its source as a generated string.

The root commands will expose:

- `test:integrations` for the complete packed-package matrix;
- the existing `check` command including integration tests after the normal build/package gates.

The runner itself will install the temporary nested workspace from its lockfile, so `pnpm test:integrations` is self-contained after the root install. CI will run it on the pinned primary Node version. The existing Node 20/22/24 runtime matrix remains focused on the lightweight published ESM/CJS runtime checks; framework toolchains do not need to be duplicated across all three jobs.

## Plan gap review

Before implementation, verify and address these likely gaps:

1. **A workspace symlink can hide publish failures.** Automated tests must replace it with a packed installation in a temporary workspace.
2. **A successful Vite build does not prove runtime behavior.** React and Vue builds must run in Chromium and exercise `CanvasSpace` lifecycle and drawing.
3. **Framework code can accidentally test only Pts geometry.** Both components must construct a real Pts canvas and use a Pts form.
4. **A Vite-served vanilla file is not truly vanilla.** Serve the single HTML file without transforms and map its classic script URL directly to the installed package.
5. **Skia is not a DOM implementation.** Test `CanvasForm` with its standards-compatible 2D context instead of trying to construct `CanvasSpace`, which correctly requires DOM elements.
6. **Native dependencies can fail differently from JavaScript dependencies.** Pin `skia-canvas`, allow its supported install mechanism, and make its fixture failure explicit. Do not silently skip it in CI.
7. **Animation timing can make browser tests flaky.** Poll for an application-owned ready marker with a bounded timeout; assert at least one frame rather than an exact count.
8. **React cleanup can be hidden by production-only behavior.** Expose cleanup/disposal state from the application and test a deliberate unmount/remount lifecycle.
9. **Browser console errors are easy to miss.** Fail on `pageerror`, unexpected console errors, and failed local resource requests.
10. **Nested fixture dependencies must not leak into npm publication.** Keep them outside the root dependency graph and retain the exact packed-file allowlist check.
11. **Fixture outputs can dirty the repository.** Build only in the temporary copy and extend ignores defensively for local direct use.
12. **Ports and browser processes can leak after failure.** Use ephemeral ports and close every server/page/browser in `finally` blocks.
13. **The test can accidentally use a registry or source-checkout Pts version.** Extract the tarball at the local dependency target, compare the installed real path with that extraction, inspect `pts/package.json`, and assert the resolved module path.
14. **Future fixtures can become copy-paste-only examples.** Document the minimum package, build, runtime, and cleanup assertions required for additions.
15. **A dependency update can silently change the matrix.** Pin fixture tool/framework versions exactly and commit the nested lockfile.
16. **A temporary install can bypass the lock while changing Pts paths.** Preserve the local dependency spec and directory relationship, extract the tarball at that target, and use `npm ci` unchanged.
17. **A canvas API can run without visibly drawing.** Inspect a known canvas pixel after animation in React, Vue, and vanilla, in addition to checking frame counts.
18. **Cleanup assertions can pass without framework lifecycle involvement.** Trigger conditional component removal from the browser test and expose disposal state from the React and Vue cleanup hooks.

## Exit criteria

- The four fixtures are committed, readable, and runnable through one root command.
- React and Vue typecheck, build, and pass real-browser Pts lifecycle tests from the tarball.
- `skia-canvas` renders Pts output and validates the resulting PNG in Node.
- Vanilla remains one untransformed HTML file and passes in Chromium using the IIFE artifact.
- The temporary install resolves the exact packed Pts package and its ESM entry.
- The full root check and CI include the new suite.
- Repeated runs leave all three repositories clean except for the intended Pts modernization changes.

## Implementation outcome

Implemented on 2026-08-10 with these pinned consumer versions:

- React 19.2.8, React DOM 19.2.8, and `@vitejs/plugin-react` 6.0.5.
- Vue 3.5.41, `@vitejs/plugin-vue` 6.0.8, and `vue-tsc` 3.3.9.
- Vite 8.2.1 and TypeScript 5.9.3 for both framework fixtures. TypeScript 6/7 was not forced into the Vue fixture because the current `vue-tsc` release still resolves the legacy compiler subpath that those TypeScript releases seal.
- `skia-canvas` 3.0.8, with its install script and Vite's optional `fsevents` script explicitly reviewed and version-pinned in npm's `allowScripts` policy.

All exit criteria pass. React and Vue additionally complete a second mount/draw/unmount cycle, which catches leaked animation or DOM state. The suite found one real Pts defect: `CanvasSpace.dispose()` assumed that a `ResizeObserver` existed even when `resize: false`. The implementation now guards that optional resource, and all three browser fixtures exercise the fixed path.
