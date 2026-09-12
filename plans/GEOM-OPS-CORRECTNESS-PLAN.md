# Geometry and Num correctness plan

## Objective

Fix verified bugs and close robustness, documentation, and performance gaps
in `src/Op.ts` (Line, Rectangle, Circle, Triangle, Polygon, Curve) and
`src/Num.ts` (Num, Geom, Shaping, Range), in the same tests-first sequence
used for the Color pass. All "confirmed" findings below were reproduced
numerically against `dist/` on 2026-08-19; the audit script is preserved in
the session scratchpad (`geom-audit.mjs`).

Prior revamp passes already covered Pt/Group/Util argument parsing, Bound,
`Geom.boundingBox`, `Polygon.nearestPt` + SAT pre-rejects, the Delaunay
rewrite, and curve batch evaluation — none of that is re-opened here.

## Confirmed bugs (numerically verified)

1. **`Num.randomRange(a, b = 0)` is wrong whenever `a > b`** — it returns
   `a + random * |a-b|`, so `randomRange(10)` yields 10…20 (expected 0…10)
   and `randomRange(10, 5)` yields 10…15 (expected 5…10). Fix: start from
   `Math.min(a, b)`. Aggravating factor: the `Util.randomInt` deprecation
   warning tells users to switch to this broken function.
2. **`Num.boundValue(val, min, max)` is wrong for nonzero `min`** —
   `boundValue(-5, 10, 20)` returns 5 (out of range). The modulo is not
   anchored at `min` and only one correction is applied. Fix:
   `min + (((val - min) % len) + len) % len`. (`boundAngle`/`boundRadian`
   use `min = 0` and are unaffected — which is why this never surfaced.)
3. **`Range.calc()` initializes max to `Const.min`** (= `Number.MIN_VALUE`,
   the smallest _positive_ double, which flushes to 0 in the Float32 Pt) —
   all-negative data reports max ≈ 0. `Rectangle.boundingBox` fixed this
   exact bug with an explanatory comment; `Range` still has it. Fix: use
   ±Infinity.
4. **`Circle.toRect(circle, within = true)` returns half the wrong square**
   — `Math.sqrt(r * r) / 2` is just `r / 2`; the maximal inscribed square
   has half-side `r / √2`. The no-op `sqrt(r*r)` betrays the intent
   `sqrt(r*r/2)`.
5. **`Circle.intersectCircle2D` on concentric equal circles returns NaN
   points** (division by `dr = 0`). Should return an empty Group (no
   discrete intersection points).
6. **`Line.crop` cannot circle-crop a vertical line** — the
   `ls[0] === 0 || size[0] === 0` guard bails to the endpoint, but that
   division-safety guard only applies to the rectangle branch. Circle
   cropping a vertical line is perfectly well-defined.
7. **`Line.intersectGridWithRay2D` drops intersections at the grid point**
   — `if (t && t.xi)` treats a zero intercept as "no intercept", so a ray
   passing exactly through `gridPt` returns an empty Group. Use
   `!== undefined` (and mind `xi` being `undefined` for horizontal lines).
8. **`Polygon.lines` and `Polygon.midpoints` return plain Arrays cast `as
Group`** — at runtime `instanceof Group` is false and Group methods are
   missing (`Util.split` builds arrays; `Array.map` returns an Array).
   `Triangle.medial` inherits the lie. Fix: construct real Groups.
9. **`Line.collinear` is scale-dependent and wrong at small scales** — the
   cross product is divided by a magic 1000 before comparing to the 0.01
   threshold, so the clearly non-degenerate triangle (0,0), (1,0),
   (0.5, 0.4) is judged "collinear" while the same shape ×1000 is not.
   Fix: compare the cross-product magnitude normalized by the segment
   lengths (a sine of the angle), making the threshold scale-free;
   document the changed threshold semantics.
10. **`Rectangle.fromTopLeft` / `fromCenter` treat height 0 as "absent"**
    (`height || widthOrSize`) — a zero-height rectangle silently becomes a
    square. Use an `undefined` check.

## Robustness and documentation gaps

11. Degenerate (collinear) triangles: `circumcenter`/`orthocenter` return
    `undefined` from ray intersection, and `circumcircle` then builds a
    garbage circle around an empty Pt. Return `undefined` consistently and
    document it.
12. `Circle.intersectRay2D` with a degenerate ray (two identical points)
    divides by `a = 0` and fabricates duplicate "intersection" points.
    Return an empty Group.
13. `Geom.isPerpendicular` uses exact `=== 0` on a Float32-backed dot
    product; rotated-but-perpendicular vectors fail. Compare with an
    epsilon (reuse `Num.equals`).
14. `Num.mapToRange` silently refuses inverted target ranges —
    `mapToRange(0.2, 0, 1, 1, 0)` returns 0.2, not 0.8, because both
    ranges are min/max-normalized. Fix with the lerp form
    `targetA + norm * (targetB - targetA)` (also removes two min/max
    calls); verify `Color.normalize` and `Range.mapTo` callers, which use
    ascending ranges and are unaffected.
15. `Range.ticks(0)` returns NaN points; return the min point (or clamp
    count to ≥ 1).
16. `Line.intersectRay2D` uses slope/intercept math: exact-vertical works
    via sentinel `undefined`s, but near-vertical Float32 lines amplify
    error, coincident lines arbitrarily return `la`'s start point, and two
    object allocations happen per call. Replace internals with the
    standard parametric cross-product form (uniform vertical handling, no
    slope blowup, fewer allocations); public behavior otherwise identical.
17. Doc fixes: `Polygon.bisector` claims a "normalized unit vector" but
    returns `(a+b)/2`; `Polygon.area` claims convex-only but the shoelace
    formula is valid for all simple polygons; `Shaping.quadraticBezier`
    doc default `(0.95, 0.95)` disagrees with code `[0.05, 0.95]`;
    `Shaping.cubicBezier` evaluates y at _parameter_ t (not at x = t as
    CSS `cubic-bezier` does) — document this semantic clearly.

## Performance improvements

18. **`Geom.rotate2D` / `Geom.shear2D` rebuild the transform matrix once
    per point** inside the loop (`fn(cos, sin, anchor)`); hoist it like
    `reflect2D` already does. This compounds through `Pt.rotate2D` and
    `Group.rotate2D`.
19. **`Geom.sortEdges`'s comparator allocates two Pts per comparison**
    (O(n log n) allocations). Precompute per-point angle/distance keys
    once, sort by key. Caller: `Create` (line 1069).
20. **Curve `*Step` single-point functions** (`catmullRomStep`,
    `cardinalStep`, `bezierStep`, `bsplineStep`, `bsplineTensionStep`)
    rebuild a 4×4 basis Group and run `Mat.multiply` per call. Hoist the
    matrices to static constants (scalar math), which also speeds
    `Shaping.cubicBezier` (one Group + matrix product per easing call).
21. **`Polygon.hasIntersectPoint`** allocates a Group per edge via
    `lineAt`; inline indexed access (the `_axisOverlap2D` pattern).
22. **`Polygon.perimeter`** allocates a Group per edge plus a Pt per
    magnitude; single-pass scalar loop.

## Regression analysis (second review)

Caller sweep across `src/` for every function slated to change:

- **`randomRange`, `collinear`, `Line.crop`, `Circle.toRect`,
  `intersectCircle2D`, `isPerpendicular`**: no internal callers — risk is
  external users only, and current behavior is demonstrably wrong.
- **`boundValue`**: only `boundAngle`/`boundRadian` call it, both with
  `min = 0`, where the anchored-modulo formula is value-identical
  (pinned by tests: 361→1, −1→359, 16→16 unchanged).
- **`mapToRange`**: internal callers are `Color.normalize` and
  `Range.mapTo`, both strictly ascending ranges where the lerp form is
  algebraically identical. The existing test `mapToRange(5, 0, 10, 100,

0. === 50`uses the midpoint, which is invariant under inversion — it
  passes before and after; a non-midpoint inverted case is added to pin
  the new behavior.`normalizeValue`keeps its current min/max semantics;
 `mapToRange` computes its own signed normalization inline.

- **`Line.intersectRay2D`** (parametric rewrite): 6 internal call sites
  (`intersectLine2D`, `intersectLineWithRay2D`, `crop` rect branch,
  `orthocenter`, `incenter`, `circumcenter`). Contract preserved exactly:
  `undefined` for parallel non-coincident; a copy of `la[0]` for
  coincident lines (current behavior, kept for compatibility); same point
  otherwise, with less float error near vertical.
- **`Polygon.lines`/`midpoints` → real Groups**: internal callers
  (`perimeter`, `intersectPolygon2D`, `Triangle.medial`) only use array
  indexing/iteration, which Groups (Array subclass) satisfy — strictly
  additive capability.
- **`Polygon.hasIntersectPoint`**: backs **UI hit-testing**
  (`UI.ts:277`). The scalar rewrite keeps the identical ray-cast
  algorithm and edge indexing (wrap last→0); pinned by existing UI and
  polygon tests plus new boundary cases.
- **`Geom.sortEdges`**: caller `Create.ts:1069`. Ordering semantics must
  not change, so the fix keeps the exact comparator logic and only
  removes the two Pt allocations per comparison (scalar dx/dy math) — a
  keyed re-sort is explicitly rejected as riskier than the win justifies.
- **`Geom.rotate2D`/`shear2D` matrix hoist**: the anchor may alias one of
  the transformed points (e.g. `Group.rotate2D` uses `this[0]`), but an
  anchor is a fixed point of its own rotation/shear, so hoisting the
  matrix is behavior-identical up to float noise.
- **Curve `*Step`**: rewritten to compute the four scalar weights with
  the same polynomial formulas the batch `_weights` tables use (already
  validated against the matrix path in the curve pass), so single-point
  and batch evaluation stay consistent by construction. Caller:
  `Shaping.cubicBezier`.
- **`Triangle` degenerate returns**: `Circle.fromTriangle` propagates
  `undefined` — acceptable; nothing internal consumes a garbage circle
  today.
- **Existing tests that encode bugs** (to be corrected in phase 1, like
  the Color pass): `Num.spec.ts:33` `randomRange(10) === 12.5` (seeded
  0.25 → correct value 2.5) and `Op.spec.ts:141` vertical `Line.crop`
  expecting the uncropped endpoint.
- **Demos/studies**: only visual output shifts where behavior was wrong
  (`randomRange` distributions); no demo drives the fixed edge cases.

Refined fix designs from this review:

- `collinear`: threshold compares `|cross(p2−p1, p3−p1)| / (|p2−p1| ·
|p3−p1|)` (sine of the angle, scale-free); coincident points are
  collinear by definition (avoid 0/0).
- `isPerpendicular`: `|a·b| <= eps·|a|·|b|` — relative, and preserves the
  current `true` for zero vectors... it does not: zero vectors give
  `0 <= 0` → `true`, matching current `dot === 0` behavior exactly.
- `Line.crop`: guard `ls.magnitudeSq() === 0` (zero-length line) for both
  branches; keep `size[0] === 0` bail only for the rectangle branch. The
  rectangle branch's `ls[1]/ls[0]` handles vertical via Infinity
  comparison, so no vertical special-case is needed there.
- `intersectCircle2D`: only the `dr === 0 && ar === br` (coincident
  circles) case changes, returning an empty Group; the enclosed-circle
  center-point return (legacy quirk) is untouched.

## Explicit non-goals

- No algorithm replacements where the standard form is already in place:
  SAT intersection, Melkman convex hull (verified OK including duplicate
  points), shoelace area, curve weight tables.
- No API/signature changes; all fixes preserve shapes of returns except
  where the current value is garbage (NaN points, fake Groups).
- Pt remaining Float32-backed is a framework-level constraint, not
  addressed here.

## Phase 1 — tests and benchmarks first

- Extend `src/test/Op.spec.ts` (34 tests) and `src/test/Num.spec.ts` (20
  tests) with pinning tests for every numbered finding: reference values
  for the confirmed bugs (the audit script's cases), edge cases
  (degenerate rays/triangles/circles, zero intercepts, inverted ranges,
  all-negative Range data), and `instanceof Group` contract checks for
  every Op function documented to return Group(s).
- Bench coverage correction (second review): `op.bench.mjs` is already
  comprehensive — a `perItem` helper registers ~60 cases covering every
  function this plan touches, and `num.bench.mjs` measures
  `Geom.rotate2D`/`shear2D`/`sortEdges` on N-point groups (exactly what
  fixes 18–19 target). The only true gap is the five Curve `*Step`
  single-point functions — added. The recorded baseline (2026-08-18)
  already covers pre-fix op/num timings.
- Expected: the new correctness tests fail on current code (bug
  inventory), like the Color pass.

## Phase 2 — fixes

Apply fixes 1–17 (correctness/robustness/docs), then 18–22 (performance),
gated by:

- all tests green; typecheck/lint/prettier/docs/artifacts checks pass;
- `--against HEAD` A/B for `op`, `num`, and `scenarios` suites: fixed
  default paths unchanged beyond noise; the perf items (18–22) should show
  measured wins, not regressions;
- re-record baseline after landing.

## Results (2026-08-19)

All 22 findings implemented. Validation: 419/419 tests (99 in Op/Num,
15 new pins were red pre-fix), typecheck/lint/prettier green, docs
regenerated + smoke test passed, dist rebuilt with size budgets updated,
full bench baseline re-recorded (380 cases).

Final 5-round A/B vs pre-fix HEAD (op + num suites): **24 faster, 0
slower, 110 unchanged, 16 noisy**. Highlights: `Polygon.hasIntersectPoint`
−97%, Curve `*Step` −90%, `Polygon.perimeter` −88%, `Polygon.lines` −83%,
`Geom.rotate2D`/`shear2D`/`sortEdges` −77–79%, `Geom.isPerpendicular`
−77%, `Shaping.cubicBezier` −57%, `Line.intersectRay2D` family −13–27%.

Implementation notes discovered en route (kept for future passes):

- `new Group(a, b)` spreads through the Array-subclass constructor —
  ~230 ns vs ~19 ns for `new Group()` + indexed assignment. The first fix
  pass regressed `Polygon.lines`/`midpoints` 3–5× this way before
  switching to indexed writes.
- `Line.intersectRay2D`'s parametric form needs an explicit zero-length
  input guard: a degenerate "ray" of two identical points otherwise
  passes the collinearity test (0 cross 0) and fabricates an
  intersection; the old slope code happened to treat it as a vertical
  line. Caught by the degenerate-orthocenter pin.
- One more existing test encoded a bug: coincident circles were asserted
  to return 2 (NaN) intersection points.
