# Pts integration fixtures

These small applications verify the published Pts package in environments that exercise different parts of its package contract:

- `react-vite`: React, TypeScript, the official React Vite plugin, and a production browser build.
- `vue-vite`: Vue Composition API, TypeScript, the official Vue Vite plugin, and a production browser build.
- `skia-canvas`: Node ESM and a non-DOM Canvas 2D implementation.
- `vanilla`: one untransformed HTML file using the minified classic-script build.

Run the complete, packed-package test from the Pts repository root:

```bash
npm run test:integrations
```

The runner packs Pts, extracts only its published contents into a temporary package root, installs this workspace with `npm ci`, builds the framework applications, and exercises all four fixtures. It does not use the registry's Pts version or the source checkout.

For local fixture development, install from this directory. The committed `file:../../..` dependencies link the fixtures to the current Pts checkout:

```bash
npm ci
npm run build
npm run test:node
```

## Adding an environment

A new fixture should:

1. Pin its dependencies exactly and depend on Pts through `file:../../..`.
2. Exercise a distinct package/runtime surface rather than only importing `Pt`.
3. Provide a deterministic build or Node test command.
4. For browser fixtures, expose a ready marker, frame count, rendered pixels, and disposal state that Playwright can assert.
5. Produce output only in ignored `dist` or temporary paths.
6. Be added to the packed-package runner and this README.

Regenerate this directory's lockfile with the npm version pinned in `package.json` whenever a fixture dependency changes.
