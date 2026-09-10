# Changelog

## 1.0.0 (unreleased)

Pts 1.0 is a full modernization of the library: the toolchain, the type
system, and every core module were reviewed line by line, with roughly
sixty verified bugs fixed and each fix pinned by a test. The public API
is intentionally familiar — most sketches written for 0.12 run
unchanged — but corrected behavior, stricter types, and a handful of
deprecations make this a major release. The detailed findings for every
review pass live in the `plans/` directory.

### Highlights

- Modern toolchain: pnpm, tsdown (rolldown/oxc) builds, vitest 4 with
  node, browser (Playwright), and visual-regression projects — 514
  tests including type-level pins, plus benchmark suites with recorded
  baselines for node and Chromium.
- TypeScript 6 with `strict: true` across the codebase, and an honest
  public type surface (see the TypeScript section below).
- Large performance gains in hot paths, with a benchmark A/B gate
  against the previous build for every change.
- New Oklab/Oklch color modes, modernized UI and Space event APIs, and
  a documented renderer contract for building custom renderers.

### Breaking changes — API migration

- `Img.load(url)` now returns `Promise<Img>`, not an immediately available
  `Img`. Use `const img = await Img.load(url)` or `.then(...)`. To retain an
  instance while loading, use `const img = new Img(); await img.load(url)`.
- The static helpers `SVGForm.styleTo` and `SVGForm.log` are no longer
  available. Use the form's `fill`, `stroke`, `alpha`, and `font` methods for
  styles, and `form.log(message)` or `form.text([10, 14], message)` for a
  debug label. Original static drawing names still accept legacy DOM
  contexts; the explicit `*Element` names are also available, for example
  `SVGForm.circleElement(ctx, pt, radius)`.
- `SVGForm` now extends `CanvasForm` (which became generic in its space
  type) and inherits its full drawing API. `SVGForm` fills accept the same
  values as `CanvasForm`, but SVG output supports only colors and
  gradients; a `CanvasPattern` fill warns once and renders as none.
- `Pts.quickStart(id)` creates an `SVGSpace` when the target is, or
  contains, an `<svg>` element; it still creates a `CanvasSpace` otherwise.
- `Img.sync()` returns `Promise<Img>` (was `void`).
- The package `exports` map exposes `pts`, `pts/dist/*`, and
  `pts/package.json` only. Deep imports of `pts/src/...` are no longer
  resolvable; import from `pts`.
- SVG supports a subset of Canvas drawing. Clipping, image-data writes,
  source-cropped image drawing, canvas offscreen buffers, and Porter-Duff
  composites require Canvas output. See the Space guide for details.

### Breaking changes — runtime behavior

These are places where the old result was a defect. Code that relied on
the buggy output will see different (correct) values:

- `Pt.equals` no longer reports a shorter Pt or a NaN dimension as
  equal; NaN never equals NaN (IEEE semantics).
- `Pt.angleBetween` returns a normalized signed angle in [−π, π)
  instead of raw differences that jumped at the 0°/360° wrap.
- `Group.split`, `Group.segments`, and `Group.lines` (and
  `Polygon.lines`, `Polygon.midpoints`) return real `Group` instances
  instead of plain arrays cast as Group — array-style access is
  unchanged, and Group methods now actually work on the results.
- `Group.forEachPt` on an empty Group is a silent no-op instead of a
  `TypeError`.
- `Bound.update()` recomputes from the existing corner Pts in place; it
  no longer replaces them with fresh Pt instances.
- `Num.mapToRange` and `Range.mapTo` map a reversed target range
  directionally instead of sorting it: `Num.mapToRange(2, 0, 10, 100, 0)`
  is now 80 (was 20), so `range.mapTo(height, 0)` flips an axis as
  written. Values outside the source range are no longer clamped.
  (`Num.normalizeValue` still reorients its range.)
- Geometry fixes that change numbers: `Line.collinear` uses a
  sine-of-angle threshold (a point 0.4 off a unit segment is no longer
  collinear); `Circle.toRect(c, true)` returns the inscribed square
  (half-side `r/√2`, was `r/2`); `Geom.isPerpendicular` uses a relative
  epsilon instead of exact zero; `Mat.scale2D([0, s])` and
  `Mat.shear2D([s, 0])` honor a zero component; the `Bound.center` setter
  no longer double-applies its offset; `Rectangle.boundingBox` returns
  real values; `Group.moveTo` on an empty group is a no-op.
- Delaunay triangulation is a port of Delaunator (see
  `THIRD-PARTY-NOTICES.txt`): triangle order and tie-breaking on
  cocircular inputs differ from 0.12. `Delaunay.voronoi(bound?)` accepts
  a bound and constructs complete hull cells; fewer than three or
  collinear sites yield empty cells instead of throwing.
- Sound: every `Sound` shares one `AudioContext` (0.12 created one per
  instance), so closing a sound's `ctx` silences all sounds — use
  `sound.stop()` / `sound.dispose()` instead. `Sound.load` rejects with
  an `Error` rather than a string. `Sound.createBuffer` is public.
- Perlin noise (`Create.noise2D`, `noisePts`) is fixed — the old
  gradient hash skipped the permutation table, producing exact
  period-12 repetition. Same API and seeding, different (correct)
  values. `Noise.seed` now covers the full table, and `noisePts` no
  longer scrambles non-square grids.
- `Num.randomRange(a, b)` with `a > b` no longer shifts the range;
  `Range` handles all-negative data correctly.
- Color conversions were overhauled: 8 defects fixed including
  normalized-flag handling across RGB/HSL/HSB/XYZ/LAB/LCH/LUV, 8-digit
  hex alpha, and negative hue. Core CIE math was verified against
  reference values; results differ only where the old code was wrong.
- Canvas/SVG rendering fixes: `paragraphBox` no longer crops one line
  early, `imageData` rect no longer double-offsets, `SVGSpace.removeAll`
  no longer wipes its own mount element, and the SVG reconciler removes
  stale attributes between frames.
- Physics: `Body.linkAll` no longer creates duplicate and self links on
  odd-sized bodies.
- Physics is now frame-rate independent. `World.update(ms)` solves in
  substeps of about `1 / (60 × substeps)` s, so a slow frame runs more
  substeps rather than larger ones, and velocity is preserved exactly when
  frame timing changes (a resting body no longer gains energy under
  alternating frame times). `Particle.hit`, drag deltas via the `position`
  setter, `Particle.changed`, `World.friction`, and body stiffness are all
  expressed per 60 Hz frame at any `substeps` setting — the same numbers a
  0.12 sketch used at 60 fps. Updates shorter than 2 ms are carried into
  the next call. `Particle.timeStep` exposes the time spanned by a
  particle's current displacement.
- Space: `play(t)` no longer stacks parallel animation-frame chains;
  first-frame and resume no longer produce a frame-time spike; touch
  `preventDefault` paths work as documented.
- UI: removing a handler no longer invalidates other handlers' ids;
  hover-leave delivers the current pointer position; built-in button
  and dragger behavior can no longer be destroyed by `off(type)`.
- Seeded randomness is **not** a breaking change: `Num.seed` sequences
  are bit-identical to 0.12 (pinned by golden-value tests), while
  seeding got ~60% faster.

### Breaking changes — TypeScript types (compile-time only)

The emitted JavaScript for the type-system modernization is
byte-identical to the previous build; these affect only TypeScript
consumers, who may see new compile errors that reflect what the runtime
always did:

- Functions that could always return `undefined` now say so. Affected:
  `Line.slope`, `Line.intercept`, `Line.perpendicularFromPt`,
  `Line.intersectRay2D`, `Line.intersectLine2D`,
  `Line.intersectLineWithRay2D`, `Line.intersectPolygon2D`, `Line.crop`,
  `Polygon.bisector`, `Triangle.incircle`, `Triangle.circumcircle`,
  `Triangle.incenter`, `Triangle.orthocenter`, `Triangle.circumcenter`,
  `Circle.fromTriangle`, `Img.getForm`, `Range.calc`, and
  `SVGForm.lineElement` / `SVGForm.rectElement` / `HTMLForm.rect`.
  Migration: narrow the result (`if (pt) …`) or assert (`pt!`) where
  your inputs guarantee a hit.
- `Bound.x` / `Bound.y` / `Bound.z` are `number | undefined` (undefined
  for missing dimensions, as at runtime).
- New exported type `UIActionEvent` =
  `MouseEvent | TouchEvent | PointerEvent | KeyboardEvent`.
  `UIHandler`'s `evt` parameter and `IPlayer.action` use it — keyboard
  events always flowed through this path. A handler that declares a
  narrower `evt: MouseEvent` parameter no longer type-checks; accept
  the union (or omit the parameter types) instead. `UIHandler`'s `type`
  parameter is now autocompleted via `UIPointerAction` while still
  accepting custom strings.
- `IntersectContext.other` is `unknown` (was `any`) — narrow before
  member access.
- `DefaultFormStyle.lineJoin` / `lineCap` use the DOM's
  `CanvasLineJoin` / `CanvasLineCap` literal types.
- `AnimateCallbackFn`'s third parameter is typed `Space` (was `any`);
  `IPlayer.resize` accepts `Event | null`; `MultiTouchElement` uses
  DOM-typed listener signatures; `DOMFormContext.group` is honestly
  nullable and `style` is a `Record`.
- `UIButton.onHover` returns `(number | undefined)[]` — an id is
  undefined when the corresponding handler was not provided.

### Deprecated

- `HTMLSpace` / `HTMLForm` — deprecated, removal in a future major.
  Use `SVGSpace` / `SVGForm`, which share the supported subset of the
  `CanvasForm` drawing API. `DOMSpace` remains public as the subclassing point.
- `Img.loadAsync` — use `Img.load`, which now returns a Promise.
- `Img.cleanup` — use `Img.dispose`.
- `SVGForm.updateScope` / `SVGForm.scope` — no longer needed; elements
  are reconciled automatically each frame.
- `Typography.fontSizeToBox` initial-box argument — it never affected
  the result; use `fontSizeToBox(ratio, byHeight)`.
- `Util.randomInt` — use `Num.randomRange`.

### New

- **Color**: Oklab and Oklch modes (`Color.oklab(...)`,
  `Color.oklch(...)`), with constants verified against published
  reference values.
- **Space**: `space.track(ui)` / `space.untrack(ui)` forward all
  pointer, touch, and keyboard actions to UI elements without
  hand-writing an `action` player; robust mount/unmount lifecycle
  (idempotent `dispose`, no leaked listeners) that survives React
  StrictMode double-mounting; SSR-safe imports are checked in CI.
- **UI**: `UI.registerShape(name, fn)` for custom hit tests; built-in
  `line` / `polyline` hit-testing with a `lineThreshold` state;
  `on(type, fn, { once, signal })`; `getState` / `setState`; typed
  action constants (`UIPointerActions`, `UIPointerAction`).
- **Rendering**: the renderer contract (context surface + frame
  lifecycle) is documented, with `SVGContext2D` as the reference
  implementation for building custom renderers.
- **Types**: `UIActionEvent`; type-level regression tests
  (`expectTypeOf`) run with the test suite.

### Performance

Highlights from the benchmark gates (5-round A/B against the prior
build; full numbers in `plans/*.md`):

- `Polygon.hasIntersectPoint` −97%, Curve step generation −90%
- `Bound.x/y/z` reads −92%, `Group.insert` −87% (and stack-safe for
  very large inserts), `Group.segments`/`lines` −45%
- Space pointer dispatch −84%, `UI.track` −67%
- `Mat.zipSlice`-based ops −72%, `Create.noisePts` −65%,
  `Create.distributeRandom` −30%, `Num.seed` −60%
- Perlin noise: lag-12 autocorrelation 0.95 → 0.009 (quality fix)

### Internal / tooling

- Build: tsdown with ESM + CJS + browser IIFE outputs, byte-exact
  artifact size budgets, and public-export smoke checks in CI.
- Tests: vitest 4 with browser (Chromium) and visual-regression
  projects; 514 tests. Benchmarks: node + Chromium suites with
  recorded baselines and an A/B mode against any git ref.
- TypeScript 6.0.3, `strict: true`, `import type` hygiene enforced via
  eslint (`consistent-type-imports`) — deliberately not via
  `verbatimModuleSyntax`, which the bundler also reads and which
  changes the emitted bundle (see note in `tsconfig.json`).
- Docs generator no longer emits unstable numeric ids, so regenerated
  docs diff minimally.

## 0.12.x and earlier

See the [release notes on GitHub](https://github.com/williamngan/pts/releases).
