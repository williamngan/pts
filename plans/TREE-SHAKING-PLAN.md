# Tree-shaking repair plan

## Objective

Make the ESM build tree-shake by class, so a bundler keeps only the classes a
sketch uses and the ones they reference. No change to the public API, to
import statements, or to runtime results. This is item 5.1's first step in
`FEATURE-ROADMAP.md`.

Out of scope: subpath entries and add-on scripts (the rest of 5.1), the
CommonJS and classic-script builds (they have no tree-shaking and are
unchanged), mutual references among the `Op` classes (section "Limits"), and
raising the build target.

## Verified findings

Measured at `5e46eea` by bundling `import { X } from "dist/index.mjs"` for
each export with rolldown 1.2.3 (the engine inside the repository's Vite 8),
minified. A Vite production build of `import { Pt }` gives the same result
(115,968 bytes; rolldown alone 115,421).

1. **Every export costs at least 115 KB (35 KB gzipped) and 31 classes.**
   `import { Const }`, `{ Form }`, `{ Pt }`, `{ Color }`, `{ CanvasSpace }`
   and `{ SVGSpace }` all produce the same 115 KB bundle. The whole library is
   184 KB.
2. **Cause A: five static fields become side-effect statements.** At the
   ES2015 target with `useDefineForClassFields: false`, a static field with
   an initializer is emitted as an assignment after the class:

   | Line in `dist/index.mjs` | Statement                                      | Visibility |
   | ------------------------ | ---------------------------------------------- | ---------- |
   | 3730                     | `Util._warnLevel = "mute";`                    | public     |
   | 4583                     | `UI._counter = 0;`                             | protected  |
   | 8356                     | `Color.D65 = new Pt(95.047, 100, 108.883, 1);` | private    |
   | 8357                     | `Color.ranges = { rgb: new Group(...), ... };` | public     |
   | 9672                     | `SVGForm._offscreenWarned = false;`            | private    |

   A property write on a class could run a setter, so bundlers keep each
   statement, the class it writes to, and everything that class references.
   Deleting only these five statements from a copy of the build takes the
   `Pt`-only bundle from 115 KB to 46 KB: the Spaces, Forms, UI, Color, Img,
   Typography and SVG classes drop out.

3. **Cause B: two method references tie the core to the geometry classes.**
   `Mat.reflectAt2DMatrix` calls `Line.intercept` (`LinearAlgebra.ts:509`),
   and `Shaping.cubicBezier` calls `Curve.bezierStep` and
   `Curve.controlPoints` (`Num.ts:905-911`). `Pt` references `Mat` and `Num`,
   and `Num.cycle` defaults to `Shaping.sineInOut`, so every `Pt` also keeps
   `Line`, `Rectangle`, `Circle`, `Triangle`, `Polygon` and `Curve`, which
   reference each other. Inlining the two calls in the patched copy takes the
   `Pt`-only bundle to 26 KB (8.6 KB gzipped), keeping `Vec`, `Mat`, `Num`,
   `Geom`, `Shaping`, `Util`, `Pt`, `Group` and `Bound`, which is what `Pt`
   really uses. `Shaping.quadraticBezier` is plain arithmetic and needs no
   change.
4. **Cause C: module-level computations that every bundle keeps.** They pull
   in no classes, but every bundle carries and runs them, about 1 KB in
   total:
   - `_triangulate.ts:47-48`: `(3 + 16 * EPS) * EPS` and
     `(10 + 96 * EPS) * EPS`. Vite's build turns top-level `const` into
     `var`, and then cannot prove the products free of side effects (plain
     rolldown folds them).
   - `_triangulate.ts:325-329`: the byte-order probe (`_bits[0] = 1` and a
     read through `new Uint32Array(_bits.buffer)`).
   - `_triangulate.ts:363-364`: `BigInt(1) << BigInt(1023)` and `BigInt(64)`.
     These also contradict the comment above them ("loading this module never
     requires [BigInt]"): today every import of Pts evaluates BigInt at load.
   - `Create.ts:264`: `__noise_permTable.concat(__noise_permTable)`, which
     keeps the 256-entry Perlin table in every bundle.
5. **The fix follows an existing pattern.** `SVGForm.groupID`, `domID` and
   the module-level `_gradientCount` in `Svg.ts` already keep mutable statics
   in module state behind accessors, with a comment explaining why. The five
   fields above predate or missed that pattern.
6. **The current check cannot see this.** `check-package.mjs` asserts only
   that the `Pt`-only Vite bundle is under 75% of the full one; today it is
   62%.
7. **The prototype holds in other bundlers.** Measured on a patched copy
   with esbuild 0.28, rollup 4 with terser, and webpack 5 (installed in a
   scratch directory for this check only, not added to the repository):

   | Import        | Before: esbuild / rollup / webpack | Prototype: esbuild / rollup / webpack |
   | ------------- | ---------------------------------- | ------------------------------------- |
   | `Pt`          | 117 KB / 55 KB / 117 KB            | 26 KB / 25 KB / 26 KB                 |
   | `Color`       | 117 KB / 55 KB / 117 KB            | 35 KB / 34 KB / 35 KB                 |
   | `CanvasSpace` | 117 KB / 116 KB / 117 KB           | 82 KB / 80 KB / 81 KB                 |
   | everything    | 187 KB / 188 KB / 188 KB           | 186 KB / 187 KB / 187 KB              |

8. **`pts-render` does not depend on anything that changes.** It uses
   `CanvasForm.resetStyleCache`, `CanvasForm.prototype._set`, `Num.seed` and
   Space internals (`_time`, `players`, `render`), none of which this plan
   touches.

Per-export results from the prototype (causes A and B only), rolldown,
minified (gzipped in parentheses):

| Import        | Before         | Prototype       | Classes kept (before → prototype) |
| ------------- | -------------- | --------------- | --------------------------------- |
| `Const`       | 115 KB (35 KB) | 1.7 KB (1.0 KB) | 31 → 0                            |
| `Form`        | 115 KB (35 KB) | 1.3 KB (0.8 KB) | 31 → 1                            |
| `Pt`, `Num`   | 115 KB (35 KB) | 26 KB (8.6 KB)  | 31 → 9                            |
| `Curve`       | 115 KB (35 KB) | 31 KB (10 KB)   | 31 → 10                           |
| `Color`       | 115 KB (35 KB) | 35 KB (11 KB)   | 31 → 10                           |
| `Line`        | 115 KB (35 KB) | 41 KB (13 KB)   | 31 → 14                           |
| `Path`        | 132 KB (42 KB) | 43 KB (15 KB)   | 33 → 11                           |
| `UI`          | 115 KB (35 KB) | 45 KB (15 KB)   | 31 → 15                           |
| `World`       | 127 KB (39 KB) | 52 KB (17 KB)   | 34 → 17                           |
| `Delaunay`    | 128 KB (40 KB) | 53 KB (18 KB)   | 32 → 15                           |
| `Create`      | 140 KB (45 KB) | 65 KB (22 KB)   | 37 → 20                           |
| `CanvasSpace` | 115 KB (35 KB) | 80 KB (24 KB)   | 31 → 24                           |
| `SVGSpace`    | 115 KB (35 KB) | 100 KB (30 KB)  | 31 → 29                           |
| everything    | 184 KB (59 KB) | 184 KB (59 KB)  | 49 → 49                           |

## Changes

### 1. Static fields move to module state

| Member                     | Today                  | After                                                                           |
| -------------------------- | ---------------------- | ------------------------------------------------------------------------------- |
| `Util._warnLevel`          | public static field    | module `let`; public `static get` and `set _warnLevel`                          |
| `UI._counter`              | protected static field | module `let`; protected `static get` and `set _counter`                         |
| `Color.ranges`             | public static field    | module `let` initialized by a `/* @__PURE__ */` call; public `static get`/`set` |
| `Color.D65`                | private static field   | module `const D65 = /* @__PURE__ */ new Pt(95.047, 100, 108.883, 1)`            |
| `SVGForm._offscreenWarned` | private static field   | module `let`                                                                    |

- Class accessors are part of the class body, so nothing is emitted after
  the class. Module-level initializers that call constructors carry
  `/* @__PURE__ */`, which rolldown, esbuild, rollup and terser honor.
  tsdown keeps the annotations (checked: a source annotation survives into
  `index.mjs`, `index.js` and `pts.js`, and Vite then drops the statement).
- **Placement.** Module state goes above the class's doc comment, as in
  `Svg.ts` for `_svgFormGroupID`. Placed between the comment and
  `export class`, the comment attaches to the variable and the class loses
  its documentation without any check failing.
- `Color.D65` stays the same float32 `Pt`, so color conversions compute
  exactly as before. Internal code reads `D65` and `_offscreenWarned` from
  module state, but goes through the public static for `ranges`,
  `_warnLevel` and `_counter`, as before, so redefining one
  (`Object.defineProperty`, an assignment through a `Proxy`) still reaches
  conversions, warnings and ids (changed after review; see "Review fixes").
- **Assignment semantics are kept, including on subclasses.** Assigning
  `Color.ranges = x` (or `Util._warnLevel`, `UI._counter`) on the class
  itself replaces the shared value, as today. Assigning on a subclass today
  creates the subclass's own property and leaves the shared value alone;
  TypeScript even compiles `protected static _counter = 100` in a `UI`
  subclass to such an assignment. Each setter therefore writes the shared
  value only when `this` is the declaring class, and otherwise defines an own
  data property with `{ value, writable: true, enumerable: true,
configurable: true }`, the attributes an assignment would create.
- The two private fields are removed rather than wrapped: they are private
  in TypeScript and not documented.

### 2. The two geometry calls are inlined, with the exact expressions

- **`Mat.reflectAt2DMatrix`** keeps the vertical-line test verbatim as
  `p2[0] - p1[0] === 0` (not `p1[0] === p2[0]`, which differs for infinite
  x), then computes `slope = (p2[1] - p1[1]) / (p2[0] - p1[0])` and
  `yi = p1[1] - slope * p1[0]`, as `Line.intercept` does. `LinearAlgebra.ts`
  no longer imports `Op`.
- **`Shaping.cubicBezier`** copies the weights verbatim from
  `Curve.bezierStep` (`-t3 + 3 * t2 - 3 * t + 1`, `3 * t3 - 6 * t2 + 3 * t`,
  `-3 * t3 + 3 * t2`, `t3`; rewriting the first as `(1 - t)³` differs in
  almost every sample) and reproduces the float32 rounding of today's `Pt`
  path: `t³`, `t²` and `t` are rounded with `Math.fround` (they were stored
  in a `Pt`), the control y values come from `new Pt(p1)[1]` and
  `new Pt(p2)[1]` (same rounding and the same handling of unusual inputs),
  the sum keeps the same terms in the same order (including `w0 * 0` and
  `w3 * 1`, so NaN and infinity propagate identically), and the sum is
  rounded before `c *`. `Num.ts` no longer imports `Op`. The doc comment that
  says it "reuses the bezier functions in Curve class" is corrected. It now
  allocates two Pts per call instead of six Pts and two Groups.

### 3. Module-level computations become removable

- `ORIENT_BOUND` and `INCIRCLE_BOUND` come from a small annotated helper,
  `/* @__PURE__ */ errorBound(3, 16)`, which evaluates the same
  `(a + b * EPS) * EPS`.
- The byte-order probe moves into an annotated function that uses its own
  scratch arrays, and `HI` and `LO` each come from their own annotated call
  (`wordIndex(true)`, `wordIndex(false)`): `LO = HI ^ 1` would keep the probe,
  because a bundler cannot prove `^` free of side effects on a value it did
  not fold. The shared `_bits` and `_words` views are built over one
  `ArrayBuffer` with annotated constructors.
- The BigInt constants of `crossingParameter` are created on its first call,
  so loading the module no longer evaluates BigInt, as its comment already
  says.
- `__noise_permDoubled` gets `/* @__PURE__ */` on its `concat` call.

All values are unchanged; the triangulation, `Path` and noise tests, and the
`Path` fuzz command, cover them.

### 4. Guards against regression

- **`check-artifacts.mjs`** bundles `import { Const, Form }` from
  `dist/index.mjs` with the repository's Vite (in memory, unminified),
  parses the result with Vite's `parseAst`, and fails if any top-level
  statement other than an inert declaration or the entry's own line
  remains, listing each offender. Any side effect at module level, in any
  source file, appears in every bundle, so this one small bundle catches all
  of them. Negative controls inject side effects into copies of the build,
  and runtime probes execute tree-shaken bundles (see "Review fixes").
- **`check-package.mjs`** keeps the 75% ratio as a second assertion and adds
  absolute ceilings for the packed package's Vite bundles, 2% above the
  measured sizes: `Pt` only, `CanvasSpace` only, and the whole library. Vite
  is pinned (8.2.1), so the sizes are deterministic; a Vite upgrade needs a
  re-baseline. The success message keeps reporting all three.
- **`docs-smoke.mjs`** follows `Color.ranges` to `#accessor_ranges`, the
  anchor the docs generator gives accessors, and loads both that anchor and
  the old `#property_ranges` directly.
- **`docs/js/doc.js`** maps a missing member anchor to the same member under
  another kind, so old links keep working.

## What users see

- Import statements, class and method names, signatures and results do not
  change.
- Bundles made with rolldown or Vite, esbuild, rollup or webpack from the ESM
  build get smaller. CommonJS and classic-script users load the whole
  library, as before.
- Loading Pts no longer evaluates BigInt. It is still used by `Path`
  operations whose edges cross (`crossingParameter`) and by the exact
  fallback of the geometric predicates.
- Observable differences, all at the edges:
  - `ranges`, `D65`, `_warnLevel` and `_counter` are no longer enumerable
    own data properties, so `Object.keys`, `for…in`, object spread,
    `Object.assign` and `util.inspect` on `Color`, `Util` or `UI` no longer
    show them, and `Object.getOwnPropertyDescriptor(Color, "ranges")`
    describes an accessor.
  - Freezing `Color`, `Util` or `UI` (`Object.freeze`, `harden`) no longer
    stops these values from changing, because an accessor still runs on a
    frozen object: assigning `Color.ranges`, `Util.warnLevel(lv)` and
    `new UI()` work instead of throwing a `TypeError`, and an assignment on
    a frozen subclass throws in sloppy mode instead of being ignored
    (`Object.defineProperty` on a non-extensible object). Matching the old
    errors would take a check in every setter only to keep `new UI()`
    failing on a hardened class, so this is documented instead.
  - `Color.D65` and `SVGForm._offscreenWarned`, private in TypeScript, no
    longer exist at runtime, so writing the latter can no longer re-enable
    the SVG offscreen warning.
  - Replacing, at runtime, the internals the old code went through
    (`Line.intercept`; `Curve.bezierStep`, `controlPoints` and `_stepPt`;
    `Util.iterToArray`; the `Pt` `y` getter) no longer affects
    `Mat.reflectAt2DMatrix`, `Shaping.cubicBezier` or the `reflect2D`
    functions.
  - `Shaping.cubicBezier` given a BigInt `t` now throws instead of returning
    NaN (a `Pt` coerced it), and `Mat.reflectAt2DMatrix` given BigInt points
    on a horizontal line throws a `TypeError` instead of a `RangeError`.
  - In the declarations, `ranges`, `_warnLevel` and `_counter` become
    accessors of the same types, and the two private declarations disappear.
    Subclasses that redeclare them as static properties still compile.
  - In the API docs, `ranges` moves from properties to accessors; links to
    `Color_Color#property_ranges` still land on it and show
    `#accessor_ranges` (the docs runtime maps a missing anchor between
    property and accessor, and between static and instance function), and
    search ranks it higher, as it does accessors. Removing the two imports also changes how TypeScript orders some union
    types in the docs (`PtLikeIterable | PtLike` for `PtLike |
PtLikeIterable` in `CanvasForm` and `SVGForm`); the declaration files are
    unaffected.
- Two import edges disappear (`Num` → `Op`, `LinearAlgebra` → `Op`), so the
  order of modules inside the bundles changes (`LinearAlgebra`, `Num`,
  `Util` and `Pt` now come before `_triangulate`, `_path` and `Op`). That is
  safe because no module runs another module's code at load time except
  `extends` clauses and Color's two annotated initializers, and each imports
  what it needs directly. The full test suite, the CommonJS smoke test in
  `check-artifacts`, and the browser smoke test load all three builds.

## Tests to pin first

Tests 1 to 5 are written before the change and pass on the unchanged code.

1. `Shaping.cubicBezier` equals the `Curve.bezierStep` path bit for bit over
   a grid of `t` in [-0.5, 1.5] and control y values in [-1, 2], plus edge
   cases: `t` of 0, 1, -0, NaN and ±Infinity; `c` of 0, -0, -2.5 and 1e20;
   default controls; `Pt`, `Float32Array`, `{ x, y }`, one-value and
   three-value controls; NaN, infinite and huge control values.
2. `Mat.reflectAt2DMatrix` equals a reference built from `Line.intercept`
   bit for bit, over a grid of points plus vertical, horizontal, repeated,
   NaN and infinite-x points.
3. `Color.ranges`: the same object on every read; mutating it changes
   `Color.maxValues` and normalization; assigning on `Color` replaces what
   conversions use (restored after the test); assigning on a subclass
   creates the subclass's own value and leaves `Color.ranges` unchanged. A
   type pin in `Types.test-d.ts` keeps `Color.ranges` typed as
   `{ [name: string]: Group }` and assignable.
4. `Util._warnLevel` reads the level set by `Util.warnLevel(lv)`, writing it
   directly still changes `Util.warn`, and assigning it on a subclass leaves
   `Util` alone.
5. `UI` ids count up as `ui_0`, `ui_1`, … across `UI`, `UIButton` and
   `UIDragger`, and assigning `_counter` on a subclass does not change them.
6. `SVGForm.useOffscreen` and `renderOffscreen` warn once: already pinned by
   "ignores offscreen buffers with one warning" in
   `src/test/browser/DomSvg.spec.ts`.
7. Existing color conversion tests against CIE reference values pass
   unchanged. In addition, a script compares the old and new builds on 190
   seeded checks (every static conversion in `Color` with and without
   normalization, `toMode` between all nine modes, `normalize`,
   `maxValues`, hex output, every `Shaping` function, `cubicBezier` with
   random controls, `Mat.reflectAt2DMatrix`, `Geom.reflect2D` and
   `Pt.reflect2D`) and requires bit-identical results. A negative control
   against a deliberately broken build reports mismatches, so the script can
   fail.
8. The guards in section 4, and a rerun of the per-export and cross-bundler
   measurements on the real build.

## Benchmark

`node --expose-gc scripts/bench.mjs --against HEAD` on every Node suite
(five alternating rounds per side, nothing else running). Expected: flat
within noise, and `Shaping.cubicBezier` faster (fewer allocations). The cases
that run changed code: the `Color.XtoY (normalized)` conversions (they read
`ranges`), the XYZ↔LAB and XYZ↔LUV conversions (they read `D65`),
`Color.maxValues`, `Color.normalize`, the `toMode` cases,
`Shaping.cubicBezier`, `Mat.reflectAt2DMatrix`, `Geom.reflect2D`,
`Group.reflect2D`, and the `Path` cases (the lazily created BigInt
constants).

## Gate and delivery

- Full `pnpm check`, run as `pnpm check; echo EXIT=$?`, after
  `pnpm build`, `pnpm run docs` and `node scripts/build-editor.mjs` (in that
  order), plus `pnpm test:path:fuzz` on several seeds. The artifact size
  budgets in `check-artifacts.mjs` are checked against the new sizes and
  raised only if the headroom falls below the usual 2%.
- `CHANGELOG.md` gets an "Unreleased" entry: smaller bundles as a
  performance note, and the edge differences above as changed behavior.
- One commit on a branch (`tree-shaking`) with source, tests, guards, this
  plan with its results, the changelog, and regenerated artifacts (`dist/`,
  `docs/`, `docs.md`, `guide.md`, `llms.txt`, editor bundle), staged by
  explicit paths.

## Limits

- Any one of `Line`, `Rectangle`, `Circle`, `Triangle` or `Polygon` keeps
  all five (about 41 KB), because their methods call each other. Splitting
  them would move methods between classes, which is an API change.
- `CanvasSpace` keeps `UI`, `Img`, `Typography` and several `Op` classes
  through real references (80 KB). Reducing that is a design question for
  later, not a side-effect repair.
- webpack 5 with terser keeps about 26 KB for any import, even `Const`: it
  keeps the core classes as a group, apparently because one of them extends
  an unknown global (`Float32Array`) and they reference each other. The 1 to
  2 KB figures hold for rolldown and Vite, esbuild and rollup.

## Review

An independent review built the plan in a scratch copy before
implementation, ran the gate's main checks and about 1.4 million randomized
old-versus-new comparisons, and confirmed the approach, the sizes, the
bit-identical inlines and the load order. Its findings, all adopted above:
the docs smoke test follows `#property_ranges` and would fail; `_counter`
and `_warnLevel` need the same subclass-assignment handling as `ranges`;
module state placed between a doc comment and its class silently moves the
docs; cause C; the webpack floor; the regex guard was too narrow; the exact
expressions to copy; more edge cases for tests 1 and 2; more user-visible
edges; the expected union reordering in the docs; and this file's own
formatting.

## Risks

- **A bundler that ignores `/* @__PURE__ */`.** It would keep Color's two
  initializers and the four cause-C statements, and with them the core
  classes they reference (about 26 KB), but still drop everything the
  static-field assignments used to keep. All four bundlers measured honor
  the annotation.
- **Hidden reliance on enumerability or on the private fields.** Listed in
  "What users see" and the changelog.
- **Float32 rounding in the inlined Bezier.** Pinned by test 1 and the
  comparison script in test 7.

## Results

Implemented on branch `tree-shaking` from `5e46eea`.

### Bundle sizes

Per-export bundles from the real build, rolldown 1.2.3, minified (gzipped
in parentheses):

| Import                  | Before          | After           | Classes kept |
| ----------------------- | --------------- | --------------- | ------------ |
| `Form`                  | 115.4 KB (35.2) | 0.27 KB (0.23)  | 31 → 1       |
| `Const`                 | 115.4 KB (35.2) | 0.62 KB (0.45)  | 31 → 0       |
| `Pt`, `Num`, `Util`, …  | 115.4 KB (35.2) | 25.1 KB (8.1)   | 31 → 9       |
| `Noise`                 | 116.3 KB (35.6) | 26.9 KB (9.1)   | 32 → 10      |
| `PoissonDisk`           | 118.6 KB (36.5) | 28.2 KB (9.3)   | 32 → 10      |
| `Curve`                 | 115.4 KB (35.2) | 30.4 KB (9.9)   | 31 → 10      |
| `Color`                 | 115.4 KB (35.2) | 34.4 KB (11.2)  | 31 → 10      |
| `Line` and its siblings | 115.4 KB (35.2) | 40.0 KB (12.5)  | 31 → 14      |
| `Path`                  | 132.3 KB (41.5) | 42.1 KB (14.6)  | 33 → 11      |
| `UI`                    | 115.4 KB (35.2) | 44.8 KB (14.1)  | 31 → 15      |
| `World`                 | 126.8 KB (39.0) | 51.4 KB (16.1)  | 34 → 17      |
| `Delaunay`              | 127.7 KB (40.0) | 52.4 KB (17.3)  | 32 → 15      |
| `Create`                | 140.0 KB (44.9) | 65.6 KB (22.2)  | 37 → 20      |
| `CanvasSpace`           | 115.4 KB (35.2) | 79.9 KB (24.1)  | 31 → 24      |
| `SVGSpace`              | 115.4 KB (35.2) | 99.9 KB (29.5)  | 31 → 29      |
| everything              | 184.3 KB (59.1) | 184.8 KB (59.5) | 49 → 49      |

The whole library grows by 482 bytes (the accessors and their subclass
handling); `dist` files grow by about 0.5 KB each and stay within their
existing budgets with at least 1.5% headroom, so the budgets are unchanged.

`check-package` on the packed tarball (Vite 8.2.1): `Pt` only 25,571 bytes,
`CanvasSpace` only 80,377, full 185,209; the new ceilings are 26,100,
82,000 and 189,000.

Other bundlers on the real build (minified bytes):

| Import        | esbuild | rollup + terser | webpack |
| ------------- | ------- | --------------- | ------- |
| `Const`       | 669     | 620             | 25,544  |
| `Form`        | 743     | 232             | 25,609  |
| `Pt`          | 25,468  | 25,301          | 25,541  |
| `Color`       | 34,902  | 34,795          | 35,030  |
| `CanvasSpace` | 81,070  | 80,783          | 80,988  |
| everything    | 186,979 | 187,903         | 188,325 |

### Correctness

- The pinned tests passed before the change and after it (220 in the five
  touched spec files, with the type pin); the node project passes (585
  tests).
- The old-versus-new comparison script: 201 checks, 0 mismatches. It covers
  the 190 color, shaping and reflection checks listed in test 7 plus
  Delaunay, Voronoi, all seven `Path` modes, `Noise.noise2D` and
  `Create.noisePts`. Its negative control against a deliberately broken
  build reported 139 of 190 checks mismatched.
- `Path` fuzz: 2,000 trials on each of seeds 1, 7, 42 and 2026, all seven
  modes, passed.
- The guard caught a leftover during implementation: with `LO = HI ^ 1`,
  Vite kept `highWordIndex() ^ 1` and the probe function in every bundle.
  That led to the two `wordIndex` calls, and to a fix in the guard itself
  (stripping a `/* @__PURE__ */` comment had left the line indented, so the
  first version skipped it). The guard fails on the old build, listing all
  the leftovers, and passes on the new one.
- The declaration diff is exactly the expected one: `_counter`,
  `_warnLevel` and `ranges` become accessors, `D65` and `_offscreenWarned`
  disappear, and the `cubicBezier` doc comment changes. The docs diff is the
  `ranges` move, the union reordering, and source line numbers.

### Benchmark

`node --expose-gc scripts/bench.mjs --against HEAD` on every Node suite
(406 cases, five rounds) could not resolve small differences on this
machine: other containers kept the VM loaded, and every case but one read
"too noisy", including the two calibration cases, which run no Pts code
(-14% and +19%). The exception is `Shaping.cubicBezier`, 735 to 137 ns.
Three narrower runs followed:

1. Eight paired rounds in alternating order, through `bench.mjs --dist`,
   over the `calibration`, `color`, `num` and `linear-algebra` suites and
   the `Path` and `reflect2D` cases. The 54 cases that run changed code
   spread like the 126 that do not (controls: median +1.8%, p10 -6%, p90
   +13%). Unchanged code moved as much as changed code (`Color.RGBtoXYZ`
   +24%, `Color.clone` +18%), so the spread is machine load and code
   placement in a process that runs many cases.
2. The cases flagged in run 1, and three controls, one case per process,
   twelve rounds: `RGBtoXYZ` fell back into the noise, and most flagged
   cases straddled zero.
3. Both builds loaded in one process, each operation timed in 31
   alternating batches of about 20 ms, run twice. Differences under about
   2% change sign between the runs, which sets the noise floor.

| Operation                                                                 | Before   | After    | Change (two runs) |
| ------------------------------------------------------------------------- | -------- | -------- | ----------------- |
| `Shaping.cubicBezier`                                                     | 465 ns   | 82 ns    | -82.3%, -82.5%    |
| `Color.normalize` (both directions)                                       | 17.1 ns  | 16.0 ns  | -6.2%, -4.8%      |
| `Mat.reflectAt2DMatrix`                                                   | 149.8 ns | 149.3 ns | -0.4%, -1.8%      |
| `Color.maxValues`                                                         | 98 ns    | 99 ns    | +1.0%, -0.6%      |
| `RGBtoLCH`, and `RGBtoLCH`, `LUVtoRGB`, `XYZtoLUV`, `LABtoXYZ` normalized |          |          | -2.1% to +1.3%    |
| `Path.unite`, `intersect`, `divide`                                       |          |          | -1.9% to +2.8%    |
| Controls: `Color.clone`, `Color.RGBtoXYZ`, `Pt.$add`                      |          |          | -1.8% to +1.3%    |

As expected, the change is flat within noise, except `Shaping.cubicBezier`,
which is 5.4 to 5.7 times faster (fewer allocations). `Color.normalize` was
about 5% faster here because it read module state; after the review fixes
it reads the static again and matches 1.0.1.

### Gate

`CI=true pnpm check` passes (exit 0): format, lint, typecheck, 746 tests
with coverage, docs freshness and the docs smoke test, build, artifacts
with the new side-effect guard, bench dry run, the browser smoke test, site
checks, the package check with the new ceilings (`Pt` 25,571, `CanvasSpace`
80,377, full 185,209 bytes), the consumer integrations, and publint and
attw. A first run was killed during ESLint for lack of memory on the VM (other
containers), not by a failure.

## Review fixes

`plans/TREE-SHAKING-REVIEW.md` reviewed `a7e2db2`. All three findings were
reproduced and fixed; each fix has a test that fails without it.

- **Redefined statics reached nothing.** Internal code read the module
  variables, so `Object.defineProperty(Color, "ranges", …)` or
  `new Proxy(Color, {}).ranges = …` changed the visible property but not the
  conversions; likewise `_warnLevel` and warnings, and `_counter` and UI
  ids. Internal code now goes through the public statics, as in 1.0.1, and
  the accessors only hold the storage. Six tests cover `defineProperty` and
  `Proxy` for each of the three; they fail on `a7e2db2` and pass on
  `5e46eea`.
- **The guard had false negatives.** The line scan skipped any line
  starting with `/` and accepted the `Const` and `Form` declarations by
  name, so `/x/.test(effect())`, or a call inside `Const`, passed.
  `check-artifacts` now parses the bundle and accepts only inert
  declarations: no call, `new`, assignment, spread, or property read other
  than constants of `Math` and `Number`, anywhere in an initializer or a
  class definition. Five negative controls inject an effect into a copy of
  the build and must be caught: the two above, a static field assignment, a
  getter read at load, and an immediately invoked function. Run against the
  1.0.1 build, the check lists all of that build's leftovers.
- **Old `#property_ranges` links stopped scrolling.** The docs runtime now
  maps a missing member anchor to the same name under another kind
  (constructor, property, accessor, static or instance function), scrolls
  to it, and replaces the address with the current anchor without adding a
  history entry. The smoke test loads `#accessor_ranges` and
  `#property_ranges` from a fresh page; with the previous runtime the second
  times out.

The review's other points:

- **Tree-shaken bundles are now executed.** `check-artifacts` bundles seven
  entries (`Pt`; `Color`; `Shaping` and `Mat`; `UI`, `Group` and `Util`;
  `Create` with Delaunay; `Path`; `Noise`), runs each, and requires the same
  serialized results as the whole library. A control copy of the build
  wraps Util's warning-level initialization in a call wrongly marked pure,
  so the bundler drops it, and the probe must notice. The whole check takes
  under a second.
- **Other bundlers stay a one-time measurement.** Automating esbuild, rollup
  and webpack would add three bundlers as development dependencies to
  re-measure what this plan records; Vite is the bundler the package check
  pins.
- **Compatibility for a patch release.** With the first fix, assignment,
  redefinition, `Proxy` and subclass semantics match 1.0.1. What remains is
  listed in "What users see": enumerability, the two private fields, and
  replacing `Line` or `Curve` methods at runtime. Whether that fits 1.0.2 or
  calls for 1.1 is a release decision.

After the fixes, the Vite bundles are `Pt` 25,593 bytes (+22: `Util` writes
through its accessor again), `CanvasSpace` 80,408 and full 185,263, all
under the ceilings. In-process A/B against 1.0.1, run twice: every `Color`
operation measured (`clone`, `maxValues`, `normalize`, `RGBtoXYZ`,
`RGBtoLCH`, and the normalized `RGBtoLCH`, `LUVtoRGB`, `XYZtoLUV` and
`LABtoXYZ`) is within 2% of 1.0.1 except one case in one run (`XYZtoLUV`
normalized, -3.4%, and +0.7% in the other run); the signs change between
runs.

## Second review

A fresh-context review of the whole change (`5e46eea` to the working tree
after the review fixes) found no wrong results: 690,046 old-versus-new
checks of the inlined math on the ESM and CommonJS builds, 120,000 `Color`
checks on each of the four builds, all seven `Path` modes, Delaunay,
Voronoi and noise all match 1.0.1. A scratch rebuild of `dist` is byte-identical,
and the bundle sizes match this plan. Its findings, all reproduced, and what
was done:

- **Freezing behaves differently (P2).** Documented in "What users see" and
  the changelog; see the reason there.
- **An old in-page link lost a history entry (P3).** On an alias, the docs
  runtime replaced the current entry even after a click, so Back skipped
  the member the reader came from. It now replaces the entry only when that
  entry is the old address (a page load or a history step) and otherwise
  adds one, as any link does.
- **An alias could land on another member (P3).** The fallback tried every
  kind, so a pre-1.0 link to `Color_Color#function_rgb` (the static `rgb()`)
  reached the `rgb` accessor. Aliases now stay within a pair, property and
  accessor, or static and instance function. An aliased page load also
  skipped the reset of the member list, because the 100 ms timer compared
  the anchor before the alias was applied; it now accepts the alias.
- **A pinned term was untested (P3).** Deleting the `w0 * 0` term from
  `Shaping.cubicBezier` passed every test. The edge cases now include
  `cubicBezier(1e15, 1, [0.1, 0.7], [0.9, -0.2])`: `t³` overflows float32,
  and only that term turns the sum into NaN, as in 1.0.1.
- **The guard rejected harmless code (P3).** `-Infinity`, `Math.PI * 2` and
  well-known `Symbol` keys on a class failed the check. Operators on
  primitives (literals, `Infinity`, `NaN`, `undefined`, and constants of
  `Math`, `Number` and `Symbol`) now count as inert, a positive control
  injects those four forms and must pass, and the failure message says to
  extend the check when a listed statement is harmless.
- **Inaccurate claims (P3).** `Path` evaluates BigInt at every proper
  crossing, not only in an exact fallback (corrected here, in the changelog
  and in the `_triangulate.ts` comment). The changelog's sizes are Vite's:
  `Color` 35 KB, `Const` or `Form` about 1 KB (Vite adds a small preload
  helper), and 26 KB is webpack's floor, not its size for every import. The
  list of patchable internals and the BigInt error types are completed
  above.

Each new smoke test fails on a runtime with its bug: replacing the history
entry fails at Back, the old fallback fails at `#function_static_rgb`, and
the old timer leaves the member list scrolled.
