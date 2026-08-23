---
name: pts
description: Use the Pts library (pts on npm) to build canvas/SVG visualizations, generative art, and interactive sketches in TypeScript or JavaScript.
---

# Using Pts

Pts is a TypeScript/JavaScript library for visualization and creative
coding. Mental model: **Space** is the paper (a canvas or SVG), **Form** is the pencil (the drawing API), and **Pt/Group** are
the ideas (points/vectors/matrices every operation consumes and produces).

## Setup

```js
import { CanvasSpace, Pt, Group, Line, Circle, Num } from "pts"; // ESM (also has CJS entry)
```

Browser script (no bundler — prefer this in sandboxed pages):

```html
<div id="pt"></div>
<script src="https://unpkg.com/pts/dist/pts.min.js"></script>
<script>
  // quickStart puts all Pts classes plus `space` and `form` on globalThis,
  // and returns a run() helper. If #pt is an <svg> (or has one as a direct
  // child), it renders SVG; otherwise canvas — same sketch code either way.
  var run = Pts.quickStart("#pt", "#fe3");

  run((time, ftime) => {
    var pts = Create.distributeRandom(space.innerBound, 50);
    form.fillOnly("#123").points(pts, 2, "circle");
    form.strokeOnly("#f03", 2).line([space.center, space.pointer]);
  });
</script>
```

`run(animate, start?, action?, resize?)` wires the callbacks, binds
mouse/touch, and starts playing.

## Minimal sketch

```js
const space = new CanvasSpace("#container").setup({
  bgcolor: "#fff",
  retina: true,
  resize: true,
});
const form = space.getForm();

space.add((time, ftime) => {
  // this runs every frame: compute Pts, then draw them with form
  const pts = Create.distributeRandom(space.innerBound, 100);
  form.fillOnly("#123").points(pts, 3, "circle");
});

space.bindMouse().bindTouch().play();
```

A player can also be an object: `space.add({ start, animate, action, resize })`.
`animate(time, ftime, space)` draws each frame; `action(type, px, py, evt)`
receives pointer/touch/keyboard events; `space.pointer` always has the
current pointer position. Call `space.dispose()` when unmounting (safe in
React StrictMode; listeners and frames are fully cleaned up).

## Packages

Core data and math:

- `Pt`, `Group`, `Bound` — a Pt subclasses Float32Array; a Group
  subclasses Array<Pt>; Bound is a Group with size/center accessors.
- `Num`, `Geom`, `Shaping`, `Range` — numbers, angles, easing curves,
  and mapping a dataset's domain onto a drawing area.
- `Line`, `Rectangle`, `Circle`, `Triangle`, `Polygon`, `Curve` —
  geometry as static functions that take Groups: intersections,
  hit-tests, subdivisions, convex hulls, and curves (Catmull-Rom,
  cardinal, B-spline, bezier) from control points.
- `Vec`, `Mat` — the lower-level vector/matrix helpers behind Pt ops.

Generators and media:

- `Create` — point generators: `distributeRandom`, `gridPts`/`gridCells`,
  `radialPts`, plus `noisePts` for Perlin noise fields
  (each Pt gets a `noise2D()` you can step per frame).
- `Create.delaunay(group)` — Delaunay triangulation: call `.delaunay()`
  for triangles, `.voronoi()` for the dual Voronoi cells, `.mesh()` for
  the neighbor structure. Good for organic cell patterns from any point
  set.
- `Color` — color as a Pt subclass, in rgb/hsl/hsb/lab/lch/luv/xyz/
  oklab/oklch modes with conversions between them (`toMode("oklch")`)
  and hex/css output. Oklab/Oklch give perceptually-even gradients.
- `Physics` — a small verlet engine: `World` holds `Particle`s (points
  with mass/impulse) and `Body`s (particles linked by constraints into
  soft shapes), with gravity, friction, and particle/body collisions.
  Call `world.update(ftime)` each frame and draw the results yourself.
- `Sound` — audio in three ways: `Sound.load(url)` for files,
  `Sound.generate(type, freq)` for oscillators, `Sound.input()` for the
  microphone (Promise). Attach `analyze(size)` and read
  `freqDomainTo(area)` / `timeDomainTo(area)` as Groups — mapping sound
  to drawable points is one line.
- `Tempo` — beat-based animation instead of milliseconds:
  `new Tempo(120)`, `space.add(tempo)`, then `tempo.every(4).start(fn)`
  fires on the beat and `.progress(fn)` gives a 0→1 `t` within each
  period. Keeps animation in musical time.
- `Img` — image loading and pixel access: `Img.load(url)` (Promise),
  `Img.blank(size)`, read `pixel(pt)`, `crop(bound)`, resize, and use an
  image as a canvas fill pattern. Editable Imgs are backed by their own
  canvas.
- `Typography` — text fitting helpers (`textWidthEstimator`,
  `fontSizeToBox`) used with `form.textBox` / `paragraphBox` for
  truncation and alignment inside shapes.
- `UI`, `UIButton`, `UIDragger` — hit-tested interactive elements
  (rectangle/circle/polygon/line/polyline, or custom via
  `UI.registerShape`); register with `space.track(ui)`.

References: full API at https://ptsjs.org/docs.md (single markdown
file, agent-friendly); guides + demo catalog at https://ptsjs.org/guide.md;
source at https://github.com/williamngan/pts. The repo's `demo/` folder
has 80 runnable single-file examples, each named after the API it
demonstrates (eg, `circle.intersectCircle2D.js`, `create.delaunay.js`,
`sound.freqDomain.js`) — read one before writing a sketch in an
unfamiliar area.

## Conventions that matter

- **Mutating vs `$`-prefixed**: `p.add(q)` mutates and returns `this`;
  `p.$add(q)` returns a new Pt. Same for `$subtract`, `$multiply`, etc.
  Geometry statics (`Line.*`, `Circle.*`) return new objects.
- **Everything accepts loose point data** (`PtLike` = Pt | Float32Array |
  number[]; iterables of these for groups): `form.point([50, 50], 10)` works.
- **Pt is Float32**: ~7 significant digits. Don't expect double precision;
  compare with `p.equals(q, threshold)` or `Num.equals`.
- **`new Pt(3)` is a length-3 zero Pt** (TypedArray semantics), not the
  value 3. Use `new Pt([3])` for a 1-D value.
- **Chaining is idiomatic**: `form.strokeOnly("#f03", 2).line(ln)`;
  `space.bindMouse().bindTouch().play()`.
- **"No result" is expressed as `undefined`, not an error.** Functions
  that compute something that may not exist return the value when it
  exists and `undefined` when it doesn't — so check before using the
  result. Examples: `Line.intersectLine2D(a, b)` returns the
  intersection Pt, or `undefined` when the segments don't cross;
  `Triangle.circumcircle` returns `undefined` for collinear points;
  `Line.slope` for a vertical line; `Bound.z` on a 2-D bound.
  `const hit = Line.intersectLine2D(a, b); if (hit) form.point(hit);`
- `Pt.angleBetween` returns a normalized signed angle in [−π, π).
- `Group.segments`/`lines`/`split` return real `Group`s; iterate or index
  them like arrays.

## Reproducibility

`Num.seed("any string")` makes `Num.random()` (and everything built on
it: `randomRange`, `randomPt`, `Create.distributeRandom`, noise seeding)
deterministic. Sequences are stable across versions (pinned by tests).
Seeds are hashed by _effective_ key — surrounding whitespace and control
characters are stripped. Perlin noise follows the same rule:
`Create.noisePts` takes no seed parameter — it seeds itself from
`Num.random()`, so call `Num.seed(...)` beforehand for a deterministic
field. Individual `Noise` points can also be reseeded with
`noise.seed(n)`.

## Rendering targets

- `CanvasSpace` is the default. `setup({ retina: true, resize: true })`
  for crisp, responsive output; `offscreen: true` for a second buffer.
- `SVGSpace` mirrors the full `CanvasForm` drawing API and reconciles
  DOM elements per frame — use it for DOM output (`HTMLSpace` is
  deprecated). To build a custom renderer, implement the documented
  context contract (`SVGContext2D` is the reference).
- Text: `form.textBox`, `form.paragraphBox`, `form.alignText` with
  `Typography` helpers for fitting.

## Interaction

For simple cases, read `space.pointer` in `animate`. For hit-tested
elements use UI:

```js
const btn = new UIButton([[20, 20], [120, 60]], UIShape.rectangle);
btn.onClick((target, pt, type, evt) => { ... });
space.track(btn); // forwards this space's events to it; untrack to remove
```

(The `UI.fromRectangle`/`fromCircle`/`fromPolygon` factories also work
but are typed as returning `UI`, so in TypeScript prefer the constructor
for subclasses.) Handler `evt` may be mouse, touch, pointer, or
keyboard. `on()` supports `{ once, signal }`. Custom shapes:
`UI.registerShape(name, testFn)`. For rhythm-driven animation, create
`new Tempo(120)` (bpm), `space.add(tempo)`, then
`tempo.every(2).start(fn)` / `.progress(fn)`.

## Working on this repository

- Plan-first workflow: significant changes get a plan in `plans/*.md`
  (review one for the house style: verified findings → pinned tests →
  fixes → benchmark A/B → results).
- Check chain: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`,
  then `pnpm check:artifacts` (byte-exact size ceilings on dist —
  regenerate budgets when dist legitimately changes), `pnpm check:docs`
  (docs must be regenerated via `pnpm run docs` after signature/doc
  edits), `pnpm format:check`.
- Benchmarks: `node --expose-gc scripts/bench.mjs --against HEAD --suite <name>`
  is the authoritative perf gate; cross-session `--compare` drifts ±8%.
- TypeScript is strict; keep fixes type-level unless behavior change is
  intended and pinned. Do not add `verbatimModuleSyntax` to tsconfig
  (tsdown reads it and the bundle changes — see comment there).
- Tests: vitest projects `node`, `browser` (Playwright Chromium),
  `visual` (PNG baselines; update with `pnpm test:visual:update`).
  Type-level pins live in `src/test/Types.test-d.ts`.

# TODO

- react-pts-canvas
- pts-cli
