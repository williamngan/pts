# Pts

![Pts examples](https://raw.githubusercontent.com/williamngan/pts/master/assets/pts-gif-10.gif)

Pts is a TypeScript and JavaScript library for visualization and creative coding.

**Get started at [ptsjs.org](https://ptsjs.org).** Please try it, [file issues](https://github.com/williamngan/pts/issues), and send feedback to [@williamngan](https://twitter.com/williamngan).

## Usage

### Browser script

Download `pts.js` or `pts.min.js` from the [dist directory](https://github.com/williamngan/pts/tree/master/dist), or use a CDN such as [cdnjs](https://cdnjs.com/libraries/pts), [jsDelivr](https://cdn.jsdelivr.net/npm/pts/dist/pts.min.js), or [unpkg](https://unpkg.com/pts/dist/pts.min.js).

```html
<script src="path/to/pts.min.js"></script>
```

The classic script exposes the library as `globalThis.Pts`.

### Package

Install the package:

```bash
npm install pts
```

Pts is ESM-first and also provides a CommonJS compatibility entry.

```js
import { CanvasSpace, Group, Line, Pt } from "pts";
```

```js
const { CanvasSpace, Group, Line, Pt } = require("pts");
```

Starter projects and integrations:

- [pts-starter-kit](https://github.com/williamngan/pts-starter-kit)
- [pts-react-example](https://github.com/williamngan/pts-react-example)
- [react-pts-canvas](https://www.npmjs.com/package/react-pts-canvas)

Read the [guides](https://ptsjs.org/guide/get-started-0100) and explore the [demos](https://ptsjs.org/demo/?name=circle.intersectCircle2D).

## Development

The maintained build environment is Node 24.18 or newer in the Node 24 line. The published library is also exercised on current Node 20 and 22 releases.

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm check
```

Useful individual commands include:

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm test:browser
pnpm test:integrations
pnpm check:package
pnpm format
pnpm format:watch
```

`pnpm check` validates formatting, linting, types, unit tests, deterministic documentation, documentation and bundle behavior in a real browser, reproducible artifacts, the packed package, ESM and CommonJS resolution, declarations, and tree-shaking. Its packed-package integration suite also builds and runs the maintained React, Vue, `skia-canvas`, and single-file vanilla fixtures in [`test/integrations`](./test/integrations).

Prettier defines the repository's formatting rules. Run `pnpm format` once or keep `pnpm format:watch` running to reformat maintained source files as they change. The recommended VS Code extension and workspace settings also enable Prettier on save, while `pnpm check` rejects unformatted changes in CI.

### Generate documentation

The documentation generator uses TypeDoc's Node API to rebuild the custom static documentation JSON from explicit source entry points:

```bash
pnpm run docs
```

Generated documentation is checked in. `pnpm check:docs` regenerates it in memory, reports stale or extra files, and exercises navigation, search, anchors, and responsive layouts in Chromium.

## Contributing

Issues and small pull requests are welcome. For larger changes, please start a discussion with [@williamngan](https://twitter.com/williamngan).

## License

Apache License 2.0. See [LICENSE](./LICENSE).

Copyright © 2017-present William Ngan and contributors.
