# Changelog

## 1.0.1 (2026-09-19)

### New

- **Path**: `Path` is a new class with polygon boolean operations:
  `unite`, `intersect`, `exclude`, `minusFront`, `minusBack`, `divide` and
  `crop`. Each takes a list of shapes in stacking order (back to front) and
  returns a polygon with holes as a `Group[]` of rings, an outer ring
  followed by its holes in the opposite orientation (`divide` and `crop`
  return one such polygon per face). A shape is any polygon Pts already
  understands, or a list of rings such as a previous result. Rings use the
  nonzero winding rule like `form.polygon`, so orientation does not matter
  and a self-intersecting star is filled the way it is drawn. Shapes that
  share edges, touch at a vertex or coincide are handled as exact
  coincidences (input vertices within a millionth of the largest absolute
  coordinate are merged before intersections). The new
  `form.compound(rings)` on `CanvasForm` and `SVGForm` draws such a polygon
  as one path with its holes, and the static
  `CanvasForm.compound(ctx, rings)` does the same on a raw context for
  renderer authors. See the `Path.*` studies.
- **Curve conversions**: `Curve.cardinalToBezier(pts, tension?, alpha?)`
  and `Curve.bsplineToBezier(pts, tension?)` convert curve anchors (2D or
  3D) into cubic Bezier control points (each segment is a cubic, with
  results rounded to float32). The result is in the layout `Curve.bezier`
  takes, and the new `form.bezier(pts)` on `CanvasForm` and `SVGForm` draws
  such a chain as one native path, so a curve stays smooth at any zoom and
  exports as a few `C` commands instead of a long polyline; the static
  `CanvasForm.bezier(ctx, pts)` draws it on a raw context for renderer
  authors. `alpha` selects the knot parameterization: 0 (default, uniform,
  matching `Curve.cardinal`), 0.5 (centripetal), or 1 (chordal).
  Centripetal segments have no internal loops or cusps at tension 0.5 with
  distinct adjacent anchors. Non-uniform curves preserve small nonzero knot
  intervals; repeated anchors yield constant segments with zero end
  tangents. See the `curve.cardinal` and `curve.bspline` demos. The
  inverses `Curve.bezierToCardinal` and `Curve.bezierToBspline` take a
  Bezier chain back to anchors: the cardinal one keeps the Bezier anchors
  (a cardinal curve's tangents come from its neighbors), and the B-spline
  one solves for the B-spline through every anchor with the chain's end
  tangents. Round trips require the original cardinal parameters or
  B-spline tension 1, and are subject to float32 rounding. Empty or
  incomplete `form.bezier` chains leave the previous drawing untouched, and
  `cardinalToBezier` warns and returns an empty Group for a negative or NaN
  `alpha`.
- **Sampling**: `Create.sampling(bound, radius, options?)` returns a
  `PoissonDisk` Group of points that are randomly placed but never closer
  than `radius` (Poisson-disk sampling, or blue noise). It uses Bridson's
  linear-time grid sampler with Roberts' candidate placement, seeded
  through `Num.random`. For a set that grows over frames, construct
  `new PoissonDisk().setup(bound, radius)` and call `step()` per point or
  `sample(count)` per frame; see the `create.sampling` demo. Options:
  `candidates` (default 8) and `start`. A `PoissonDisk` exposes `radius`,
  `candidates`, `bound` and `done` getters. `setup` resets the set and
  throws on a non-positive or non-finite radius, a non-finite bound,
  `candidates` below 1, a `start` outside the bound, or a grid over 2^26
  cells.
- **Types**: `PolygonLike` (a shape accepted by `Path`) and
  `PoissonDiskOptions` are exported.

### Fixed

- `Num.equals` treats its threshold as inclusive, like `Pt.equals`: a value
  equals itself at threshold 0 (infinities included) and a difference of
  exactly the threshold counts as equal. Contributed in #228.
- `form.line` and `form.polygon` with fewer than 2 points no longer repaint
  the previous path in the current style; they warn (as before) and draw
  nothing.

- `Path` no longer keeps a winding vector per face, so shapes that overlap
  deeply (hundreds of bars through one point, hundreds of overlapping discs)
  run in a fraction of the memory and time; candidate edge pairs are visited
  as they are found, so shapes that all share a vertex no longer overflow an
  array; and the ray index is built with a median partition instead of a
  sort per level.
- `Path` results are simple rings: a hole that touches its outer ring, two
  holes that meet, or two regions that meet at a corner come back as
  separate rings instead of one ring through the shared vertex, and the
  merging modes agree with `divide` on the shape of such faces.
- `Path` accepts a single ring of points as one shape (`Path.unite( square )`)
  instead of throwing, and warns when a ring's points all merge within the
  tolerance instead of dropping it silently. `form.compound` warns when given
  a list of polygons (a `divide` or `crop` result) instead of rings.
- `Curve.cardinalToBezier` rejects an infinite `alpha` and treats an
  overflowing knot interval like a repeated anchor, instead of returning NaN
  points. `form.bezier` now warns like `form.line` when given fewer than 4
  points. `SVGForm.bezier` and `SVGForm.compound` gain the legacy DOM-context
  overloads that `line` and `polygon` have.
- A `Bound` given its corners in the other order (`new Bound( [10, 10], [0, 0] )`)
  now keeps top-left as the smaller corner, so `Create.sampling` and
  `Create.distributeRandom` fill the intended region.

### Internal / tooling

- Path preserves closing corners during simplification and uses exact
  intersection predicates for near-coincident and shallow crossings, so a
  vertex that touches an edge to float32 precision and shapes whose edges
  coincide up to rounding (such as shifted copies) behave like exact
  touches. Output drops vertices and faces that collapse in float32 and
  rings thinner than the tolerance. Hole ownership uses an iterative
  traversal, and sparse winding vectors with a ray index built only for
  many shapes or holes keep the common case fast.
- Demos: `htmlform.scope` removed and `svgform.scope` renamed to
  `svgspace.getForm`.

## 1.0.0 (2026-09-12)

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
- Delaunay triangulation is a new implementation: incremental insertion
  in Hilbert-curve order with exact orientation and in-circle tests, so
  cocircular grids, collinear runs, points on edges, and duplicate points
  never produce degenerate triangles. It is faster than 0.12 at every
  size, and triangle order and tie-breaking on cocircular inputs differ.
  The mesh cache behind `mesh()`, `neighbors()`, and `neighborPts()` is
  built on first use instead of inside `delaunay()`.
  `Delaunay.voronoi(bound?)` accepts a bound and constructs complete hull
  cells; fewer than three or collinear sites yield empty cells instead of
  throwing. Pts contains no third-party code and ships no third-party
  notices.
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
- `CanvasSpace`, `SVGSpace`, and `DOMSpace` honor their documented empty
  mount: `new SVGSpace()`, or an empty or missing id, creates
  `<div id="pt_container"><svg id="pt">` (a `<canvas>` or `<div>` for the
  other spaces; a missing id names the created element). `dispose()`
  removes the elements a space created and resets `ready`.
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

- **Flocking**: `Create.flock(pts, options)` builds a `Flock` of `Boid`
  agents that steer by separation, alignment, and cohesion over a spatial
  hash, with `"steer"`, `"wrap"`, `"bounce"`, or `"none"` boundaries.
  Advance it with `flock.step(ftime)`; see the `create.flock` demo.
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

#### Measured against 0.12.9

A direct A/B of the published `pts@0.12.9` artifact against the 1.0.0
build through the same benchmark suites: 5 rounds, each build in its
own process, order alternated per round, medians across rounds, on
Node 24 and headless Chromium 151 (arm64 VM; the same-build noise
floor peaked at 9%). Across the 371 Node cases both versions can run,
1.0.0 is **3.2× faster by geometric mean and 1.8× at the median**. The
gains are uneven by design: scalar primitives are unchanged, calls
that used to allocate a `Pt` or `Group` per call are 5–20× faster,
and the rewritten algorithms (physics, Delaunay, polygon queries) are
100–1000× faster. Six cases 0.12.9 cannot run are excluded, and
`World.update` in 1.0 solves 4 substeps per update by default, so the
physics rows compare four solver steps against one Verlet step.

Frame-shaped scenarios, per item for one frame:

| scenario                                |  0.12.9 |   1.0.0 | speedup |
| --------------------------------------- | ------: | ------: | ------: |
| nearest-point query (512 probes)        | 25.1 µs |   69 ns |    362× |
| delaunay + voronoi (500 points)         |  242 µs | 0.91 µs |    268× |
| particle field frame (300 particles)    | 63.1 µs | 0.38 µs |    167× |
| polygon collision sweep (100 polygons)  | 5.99 µs |   59 ns |    101× |
| curve smoothing (200 points × 20 steps) | 1.01 µs |   77 ns |     13× |
| grid + noise field (4096 points)        | 1.94 µs | 0.30 µs |    6.4× |
| transform pipeline (4096 points)        | 1.49 µs | 0.34 µs |    4.4× |
| colour gradient sweep (2000 stops)      |  775 ns |  428 ns |    1.8× |

Node suites, geometric mean of per-case speedup:

| suite          | cases | geomean | standouts                                                                              |
| -------------- | ----: | ------: | -------------------------------------------------------------------------------------- |
| physics        |    18 |     31× | `World.update` 114–1036× (100–3400× at 1 substep), `Particle.collide` 124×             |
| create         |    15 |     12× | Delaunay 126× at 500 pts and 800–1050× at 1600–2000 pts, voronoi 88×, `noisePts` 6.9×  |
| op             |    86 |    5.4× | `Polygon.nearestPt` 209×, SAT intersection 120×, `perimeter` 77×, all Curve 12–15×     |
| pt             |    58 |    3.9× | Pt ops with Pt/array args 10–20×, `Bound.fromGroup`/`clone` 13–17×, `Bound.x/y/z` 134× |
| color          |    48 |    2.0× | LAB/LCH/LUV/XYZ conversions 2–4.6×, `clone` 14×, `toString` unchanged                  |
| num            |    63 |    1.6× | `Geom.boundingBox` 105×, `sortEdges` 83×, `isPerpendicular` 80×; scalar math unchanged |
| play           |     6 |    1.6× | `freqDomainTo`/`timeDomainTo` 1.2× (11.6× with the new `out` parameter)                |
| util           |    17 |    1.3× | `getArgs(Pt)` 9×, `flatten` 2×, `Num.seed` 2.3×                                        |
| linear-algebra |    44 |   1.25× | `Mat.zip`/`zipSlice` 3.6–3.9×, `Mat.multiply` 1.9–3.9×; Vec unchanged                  |
| typography     |     6 |   1.15× | paragraph wrap 4.2×; `truncate` on short strings 0.46×                                 |
| all            |   371 |    3.2× | median 1.8×; 179 cases ≥ 2×, 161 within noise, 2 slower                                |

Browser, headless Chromium:

| case                                          |     0.12.9 |        1.0.0 |  speedup |
| --------------------------------------------- | ---------: | -----------: | -------: |
| Space pointer-action dispatch (per event)     |    3.85 µs |        46 ns |      83× |
| `UI.fromPolygon` hit test                     |     460 ns |        36 ns |    12.7× |
| `UI.track` hit test                           |     985 ns |       535 ns |     1.8× |
| SVG frame of 64 shapes (per shape)            | 1.0–3.1 µs | 0.25–0.59 µs | 2.1–7.9× |
| `Img.pixel` / `getPixel`                      |     165 ns |        29 ns |     5.6× |
| `CanvasForm.textBox`                          |    2.77 µs |      1.35 µs |     2.1× |
| `CanvasForm` point/circle/rect/arc/text draws |          — |            — |     1.0× |
| `Sound.freqDomainTo`/`timeDomainTo` (per bin) |   76–80 ns |     64–68 ns |     1.2× |

Canvas shape draws are bound by the rasterizer, not by Pts. Slower in
1.0.0, beyond the noise floor: `Noise.seed` with a fresh seed +32%
(a per-seed table; repeated seeds are 30× faster), and the
fit-guarantee measure probes in `Typography.truncate` on short strings
(+117%) and measured-mode `CanvasForm.paragraphBox` (+22%).

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
