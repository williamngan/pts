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
npm ci
npx playwright install chromium
npm run check
```

Useful individual commands include:

```bash
npm run build
npm run typecheck
npm test
npm run test:browser
npm run check:package
```

`npm run check` validates formatting, linting, types, unit tests, reproducible artifacts, real-browser behavior, the packed package, ESM and CommonJS resolution, declarations, and tree-shaking.

### Generate documentation

The legacy documentation pipeline still requires Python 3. Its Python transformer needs separate compatibility work with the current TypeDoc JSON format, so documentation regeneration is intentionally not part of the build-system checks yet:

```bash
npm run docs
```

## Contributing

Issues and small pull requests are welcome. For larger changes, please start a discussion with [@williamngan](https://twitter.com/williamngan).

## License

Apache License 2.0. See [LICENSE](./LICENSE).

Copyright © 2017-present William Ngan and contributors.
