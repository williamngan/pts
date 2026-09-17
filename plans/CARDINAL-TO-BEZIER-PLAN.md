# Cardinal-to-Bezier conversion plan

## Objective

Let a Pts curve defined by anchor points (Catmull-Rom, cardinal with tension,
and their non-uniform variants) be expressed as cubic Bezier control points,
so it can be drawn as a native `bezierCurveTo` / SVG `C` path instead of a
sampled polyline. Today `Curve.cardinal(pts, steps)` returns `steps` points
per segment; the result is faceted at low step counts, heavy at high ones,
and an SVG export of a 10-point curve is 90 line commands where 9 curve
commands would be exact. This is issue
[#27](https://github.com/williamngan/pts/issues/27) (native curve rendering)
seen from the data side.

Deliverables:

1. `Curve.cardinalToBezier(pts, tension?, alpha?)` returning a Group of
   `3n + 1` Bezier anchors and controls that `Curve.bezier` accepts as is,
   with `alpha` selecting uniform, centripetal, or chordal parameterization.
2. `Curve.bsplineToBezier(pts, tension?)` by the same mechanism (small).
3. `form.bezier(pts)` on `CanvasForm` (so `SVGForm` too) drawing the chain
   natively.
4. Tests pinning exactness against the samplers, bench cases in the `op`
   suite, and a `curve.cardinalToBezier` demo.

## Algorithm choice

There is no approximation to choose here, and this is the main finding: a
uniform cardinal spline segment is a cubic polynomial, so it has an _exact_
cubic Bezier representation. Every method surveyed reduces to that identity;
the state of the art is in which parameterization to convert, not in how.

| Method                                                                    | Exact | Handles cusps | Notes                                                                                                                                                           |
| ------------------------------------------------------------------------- | ----- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hermite identity** (uniform cardinal, any tension)                      | yes   | no            | `B1 = P1 + T/3·(P2−P0)`, `B2 = P2 − T/3·(P3−P1)`. The classic; what every vector editor does for "smooth" points.                                               |
| **Non-uniform Catmull-Rom, Hermite form** (Yuksel, Schaefer, Keyser 2011) | yes   | yes (α = 0.5) | Knot spacing `Δt = ‖Pᵢ₊₁ − Pᵢ‖^α`; tangents from the Barry–Goldman pyramid. Centripetal (α = 0.5) provably has no cusps or self-intersections within a segment. |
| Böhm knot insertion (uniform cubic B-spline)                              | yes   | n/a           | `B1 = (2P1+P2)/3`, `B2 = (P1+2P2)/3`, anchors `(P0+4P1+P2)/6`. Same Hermite trick works for the tensioned variant.                                              |
| Sampling then Bezier fitting (Schneider 1990, Graphics Gems)              | no    | n/a           | Least-squares fit of a polyline. Only useful when the source is not already a cubic; here it would add error for nothing.                                       |
| Quadratic Bezier approximation                                            | no    | n/a           | Degree reduction for GPU tessellators and fonts. Not relevant for canvas / SVG, which take cubics natively.                                                     |

**Decision: the Hermite identity, generalized to non-uniform parameterization
with an `alpha` parameter (0 uniform, 0.5 centripetal, 1 chordal), default 0.** Default 0 keeps `cardinalToBezier(pts, t)` bit-for-bit equivalent (to
float32 noise) to `Curve.cardinal(pts, steps, t)`, including the endpoint
convention. Centripetal is opt-in because it is the one that behaves better
when anchors bunch up, which is the reason to offer anything beyond the
identity.

Why centripetal matters, measured on the anchors
`[0,0] [100,0] [102,5] [0,80]` (a short segment between two long ones):

| Parameterization | Segment 2 control points                   |
| ---------------- | ------------------------------------------ |
| uniform          | `(100,0) (117.0,0.8) (118.7,−8.3) (102,5)` |
| centripetal      | `(100,0) (102.0,1.4) (102.6,2.7) (102,5)`  |

The uniform tangents are sized by the long neighbors, so a 5-unit segment
gets control handles 17 units out and loops; the centripetal ones stay inside
the segment. This is the cusp / overshoot that Yuksel et al. prove away.

The mechanism, for reference. For a segment `P1 → P2` with neighbors `P0`,
`P3`, knots `t0 < t1 < t2 < t3`, and Pts' tension `T` (0.5 is Catmull-Rom,
tangent `T·(P2−P0)` in the uniform case):

1. Knots: `t0 = 0`, `tᵢ₊₁ = tᵢ + ‖Pᵢ₊₁ − Pᵢ‖^α`. With `α = 0` every interval
   is 1.
2. Tangents at the segment ends, already scaled to the unit parameter of the
   segment (the Wikipedia / Yuksel form; the factor `2T` makes `T = 0.5` the
   plain Catmull-Rom):
   ```
   m1 = 2T·(t2−t1)·[ (P1−P0)/(t1−t0) − (P2−P0)/(t2−t0) + (P2−P1)/(t2−t1) ]
   m2 = 2T·(t2−t1)·[ (P2−P1)/(t2−t1) − (P3−P1)/(t3−t1) + (P3−P2)/(t3−t2) ]
   ```
   At `α = 0` these collapse to `T·(P2−P0)` and `T·(P3−P1)`.
3. Bezier: `B0 = P1`, `B1 = P1 + m1/3`, `B2 = P2 − m2/3`, `B3 = P2`.

Verified against the built library (scratch script, float32 Pts, coordinates
in the hundreds):

| Check                                                                                                               | Max error |
| ------------------------------------------------------------------------------------------------------------------- | --------- |
| `Curve.bezier(cardinalToBezier(pts, T))` vs `Curve.cardinal(pts, 10, T)`, T ∈ {0.2, 0.5, 0.8, 1}, n ∈ {2, 3, 5, 12} | 6.1e-5    |
| Non-uniform segment vs Barry–Goldman recursion, α ∈ {0, 0.5, 1}                                                     | 3.4e-5    |
| α = 0 control points vs uniform closed form                                                                         | 0 (exact) |
| `Curve.bezier(bsplineToBezier(pts))` vs `Curve.bspline(pts, 10)`                                                    | 3.1e-5    |

All at the float32 rounding floor of a `Pt`, so the conversions are exact in
double precision.

## Design

### Public API

```ts
// Curve
/** Bezier controls for the curve that Curve.cardinal / Curve.catmullRom draw. */
static cardinalToBezier(pts: PtLikeIterable, tension = 0.5, alpha = 0): Group;
/** Bezier controls for the curve that Curve.bspline draws. */
static bsplineToBezier(pts: PtLikeIterable, tension = 1): Group;

// CanvasForm (static + instance, like line / polygon)
static bezier(ctx: RenderingContext2D, pts: PtLikeIterable): void;
bezier(pts: PtLikeIterable): this;
```

Usage:

```ts
const ctrls = Curve.cardinalToBezier(anchors, 0.5, 0.5); // centripetal
form.strokeOnly("#123", 3).bezier(ctrls); // native path
Curve.bezier(ctrls, 20); // still a polyline if wanted
```

`cardinalToBezier` returns `3(n−1) + 1` Pts for `n ≥ 2` anchors and an
empty Group otherwise, matching the `n < 2` guard of `Curve.cardinal`. The
output layout is exactly the input contract of `Curve.bezier`: anchor,
control, control, anchor, control, control, anchor, and so on, sharing anchors
between segments. `Curve.catmullRom` is covered by the default tension.

`bsplineToBezier` returns `3(n−3) + 1` Pts for `n ≥ 4` and an empty Group
otherwise (`Curve.bspline` needs 4 anchors for a segment). With `tension`
other than 1 the tensioned basis is still a cubic, so the same Hermite path
applies using its endpoint values and derivatives; `tension = 1` uses the
Böhm closed form.

Conventions followed:

- Naming: `XToBezier` is a conversion, distinct from `Curve.bezier` which
  samples. Argument order follows `cardinal(pts, steps, tension)` minus
  `steps`, with the new `alpha` last.
- Endpoints keep the sampler's convention. `Curve.cardinal` duplicates the
  first anchor and clamps the last, which gives one-sided end tangents
  `T·(P1−P0)` and `T·(Pₙ₋₁−Pₙ₋₂)`. `cardinalToBezier` uses those same
  tangents for every `alpha`, so the drawn curve does not shift when a user
  switches from the polyline to the native path. (Reflected phantom points,
  which Yuksel et al. suggest, would double the end tangents and change the
  curve; not done.)
- Degenerate knots: with `alpha > 0`, two coincident anchors give a zero
  interval. Both anchors receive zero tangents, producing a constant segment.
  Small nonzero intervals are retained; an absolute epsilon would change
  the geometry under scaling. The policy is symmetric under anchor reversal.
- Dimension: 2D or 3D like the samplers, decided by the first anchor's
  length, with the inner loop reading indices rather than calling `Pt`
  operators. One `Pt` allocation per output point, three per segment.
- `form.bezier` walks the Group in steps of 3 with `moveTo` on the first
  anchor and `bezierCurveTo` per segment, ignoring a trailing partial segment
  exactly as `Curve.bezier` does. It uses the same `_paint` as `line`, so
  fill and stroke styling apply unchanged. It is added to `CanvasForm` only
  and not as an abstract method on `VisualForm`, so third-party Form
  subclasses keep compiling. `SVGForm` gets it for free through the context
  contract, which already lists `bezierCurveTo` as a path verb.
- `Curve.cardinal` and `catmullRom` are unchanged. Giving the sampler an
  `alpha` parameter is a three-line follow-up (convert, then sample with
  `Curve.bezier`, which reuses the shared weight table) and can ride along if
  wanted; it is left out of this pass to keep the diff to one idea.

### Internals

- `cardinalToBezier`: build the knot array once (`Float64Array(n)`) when
  `alpha !== 0`, otherwise skip it and use the closed-form uniform tangents.
  The per-segment tangent is computed twice per interior anchor (once as
  `m2` of the segment ending there, once as `m1` of the segment starting
  there); compute each anchor's tangent once into a scratch array and reuse
  it, which is also what makes the shared-anchor layout consistent by
  construction.
- `bsplineToBezier`: for `tension = 1`, Böhm's closed form. Otherwise, the
  tensioned basis weights `w(0)`, `w(1)`, `w′(0)`, `w′(1)` (four constant
  4-vectors, derived from the existing `bspline` weight polynomials) give the
  Hermite data per segment, then the same `B1 = P(0) + P′(0)/3`,
  `B2 = P(1) − P′(1)/3`. The constants are derived at write time and pinned
  by the parity test.
- No new files: both functions live next to the samplers in `src/Op.ts`,
  the form method next to `line` in `src/Canvas.ts`.

### Complexity

`O(n)` with `3n` Pt allocations and one small typed array; no per-point
matrix products. `form.bezier` is one path verb per segment, so a 10-anchor
curve is 9 `bezierCurveTo` calls instead of 90 `lineTo` calls at 10 steps,
and the rasterizer picks the subdivision for the zoom level.

## Validation

### Tests (`src/test/Op.spec.ts`, `CanvasRender.spec.ts`, `Svg.spec.ts`)

1. **Parity with the sampler**: for the seeded paths already used by the
   curve tests, `Curve.bezier(cardinalToBezier(pts, T), steps)` matches
   `Curve.cardinal(pts, steps, T)` point for point (`expectClose`, 3
   decimals) for tensions 0.2, 0.5, 0.8, 1 and sizes 2, 3, 5, 12; default
   tension matches `Curve.catmullRom`.
2. **Layout**: length is `3(n−1)+1`; every third Pt is the corresponding
   anchor (by value); `n < 2` gives an empty Group; `n = 2` gives collinear
   controls.
3. **Non-uniform correctness**: a Barry–Goldman reference evaluator in the
   test (a dozen lines) matches the converted segment at 21 parameters for
   `alpha` 0, 0.5, 1; `alpha = 0` control points equal the uniform ones
   exactly.
4. **Cusp regression**: on the `[0,0] [100,0] [102,5] [0,80]` anchors, the
   centripetal controls of the short segment stay within the segment's
   bounding box grown by its length, and the uniform ones do not. Pins the
   reason `alpha` exists.
5. **Degenerate input**: repeated anchors with `alpha = 0.5` produce finite
   controls; all anchors identical produce a curve of that one point.
6. **3D**: a 3D anchor Group produces 3D controls whose `z` matches the
   `z` of `Curve.cardinal` on the same input.
7. **bsplineToBezier**: parity with `Curve.bspline` at tension 1 and 0.4;
   `n < 4` gives an empty Group.
8. **form.bezier**: the recording context in `CanvasRender.spec.ts` sees
   `moveTo` then one `bezierCurveTo` per segment and the fill/stroke calls
   the style implies; a trailing partial segment is ignored; fewer than 4
   points draws nothing. `Svg.spec.ts` sees a path `d` with one `C` command
   per segment.
9. **Export pins**: none needed for `Curve` (existing class), but the
   `CanvasForm` method count if a test pins it.

### Bench (`bench/suites/op.bench.mjs`)

- `Curve.cardinalToBezier` and `Curve.cardinalToBezier (centripetal)` on the
  `CURVE_POINTS` fixture, batch `CURVE_POINTS`.
- `Curve.bsplineToBezier`, same fixture.

Expected: well under the `Curve.cardinal` sampler cost since there are
`3` allocations per segment instead of `steps + 1`.

### Demo (`demo/curve.cardinalToBezier.js`)

Same interaction as `curve.cardinal` (anchors pushed away by the pointer),
drawn three ways on the same anchors: the uniform polyline at a deliberately
low step count (faceted, thin gray), the uniform native path, and the
centripetal native path. When the pointer bunches anchors together the
uniform path loops and the centripetal one does not, which is the whole
story in one picture. Register in `demo/index.html`, bump the `demoLinks`
count and its "N choices" message in `scripts/check-site.mjs`, and add the
guide snippet under the `Curve` block in `guide/md/_0400_Op.md`.

### Docs

- Doc comments on the three new methods, with the formula in one line and a
  link to the demo, so the generated `docs/` and `docs.md` pick them up.
- `CHANGELOG.md` Unreleased entry.
- `SKILL.md` / `llms.txt` if they enumerate Curve methods (check at
  implementation time).

## Out of scope

- **Bezier to cardinal** is lossy in general: a cubic Bezier has two free
  controls per segment, a cardinal spline one tangent per shared anchor, so
  only C¹ chains with tangents in the cardinal ratio round-trip. Not planned.
- **Closed curves** (`closed` flag wrapping the neighbors): useful, but
  `Curve.cardinal` has no such option either. A later pass can add it to
  both together.
- **Quadratic output**: canvas and SVG take cubics natively; there is no
  consumer for a degree-reduced form in Pts.

## References

- Yuksel, Schaefer, Keyser. "Parameterization and applications of
  Catmull-Rom curves." Computer-Aided Design 43 (2011). Centripetal
  parameterization; no cusps or self-intersections; the non-uniform
  Hermite/Bezier form.
- Barry, Goldman. "A recursive evaluation algorithm for a class of
  Catmull-Rom splines." SIGGRAPH 1988. The pyramid used as the test
  reference.
- Böhm. "Inserting new knots into B-spline curves." Computer-Aided Design 12
  (1980). Uniform B-spline to Bezier.
- three.js `CatmullRomCurve3`: the practical treatment of zero-length knot
  intervals adopted here.

## Results

Implemented on `master` (2026-09-17) as planned: `Curve.cardinalToBezier`,
`Curve.bsplineToBezier`, `CanvasForm.bezier` (static and instance), tests in
`Op.spec.ts`, `CanvasRender.spec.ts` and `Svg.spec.ts`, three `op` bench
cases, and the `curve.cardinalToBezier` demo.

Two simplifications from the design: `bsplineToBezier` needs no Böhm special
case, because the tensioned basis at `t = 0` and `t = 1` is exactly a cardinal
with half the tension (end points `(a, 1−2a, a)`, controls `(1−2a, 2a)` with
`a = tension/6`), so one blend covers every tension; and the end anchors of
`cardinalToBezier` reuse the interior tangent formula by standing in for
their missing neighbor, which reproduces the sampler's duplicated-endpoint
convention without a special case.

Quick bench on the 64-anchor fixture (node, `--quick`):

| Case                                   | Per item | Per segment |
| -------------------------------------- | -------- | ----------- |
| `Curve.cardinal` (20 steps)            | 86 ns    | ~1.8 µs     |
| `Curve.cardinalToBezier`               | 196 ns   | 0.2 µs      |
| `Curve.cardinalToBezier` (centripetal) | 199 ns   | 0.2 µs      |
| `Curve.bsplineToBezier`                | 207 ns   | 0.2 µs      |

The per-item unit is one output point for the sampler and one anchor for the
conversions. Drawing through `form.bezier` then costs one path verb per
segment instead of twenty line segments.

The declaration and bundle size budgets in `check-artifacts.mjs` and the
tarball budget in `check-package.mjs` were at their 2% headroom before this
change and were raised to 2% above the new measured build.

## Inverse conversions

Added the same day at the user's request: `Curve.bezierToCardinal(pts)` and
`Curve.bezierToBspline(pts)`, both taking a chain in the `Curve.bezier`
layout and ignoring an incomplete trailing segment.

Neither inverse can be exact for an arbitrary chain, because a cubic Bezier
has two free handles per segment while a cardinal curve has one anchor per
knot and a B-spline is smooth to the second derivative. The choice is which
information to keep:

| Approach                                            | Keeps anchors | Keeps handles | Cost              | Verdict                                                                                    |
| --------------------------------------------------- | ------------- | ------------- | ----------------- | ------------------------------------------------------------------------------------------ |
| **Anchors only** (cardinal)                         | yes           | no            | O(n), a copy      | What every vector editor does for "smooth" points; exact inverse of `cardinalToBezier`.    |
| Anchors plus a fitted global tension                | yes           | on average    | O(n)              | One scalar cannot honor per-segment handles; the tension is a style choice for the caller. |
| Least-squares anchors                               | no            | on average    | banded solve      | Moves the anchors, which is the one thing a user expects to stay put. Rejected.            |
| **Interpolating B-spline, clamped ends** (B-spline) | yes           | ends only     | O(n), tridiagonal | The textbook inverse of Böhm; exact for chains from `bsplineToBezier`; C² everywhere else. |
| Local inversion of each segment's inner handles     | no            | averaged      | O(n)              | Exact on C² input, but drifts off the anchors otherwise. Rejected.                         |

**bezierToCardinal** keeps every third point. The result is a cardinal curve
through the same anchors, with tension and alpha chosen by the caller.

**bezierToBspline** solves for anchors `P1..P(m+1)` from `m` segments: each
Bezier anchor `A_k` gives a row `P_k + 4·P(k+1) + P(k+2) = 6·A_k`, and the
end derivatives `(P2 − P0)/2` and `(P(m+2) − P_m)/2` are set to the Bezier's
`3·handle`, which eliminates `P0` and `P(m+2)`. The end rows collapse to
`2·P1 + P2 = 3·B1` and `P_m + 2·P(m+1) = 3·B(3m−1)`, so the system is the
tridiagonal `(2, 4, …, 4, 2)` with unit off-diagonals: strictly diagonally
dominant, so the Thomas algorithm is stable with no pivoting. `P0` and
`P(m+2)` follow from the tangents.

Verified on the built library: for chains from `bsplineToBezier`, anchors are
recovered to `6e-4` at 40 anchors (float32 Bezier points, amplified a little
by the solve) and the re-converted chain matches to `1e-4`; for an arbitrary
chain the B-spline passes through every anchor to float32 precision.
`bezierToCardinal(cardinalToBezier(P))` reproduces `P` bit for bit.

## Review follow-up

- Empty and incomplete `form.bezier` inputs skip painting, preserving the
  previous path on both Canvas and SVG. The regression includes a real canvas
  pixel check after changing the stroke color.
- Non-uniform knots use the distance without an absolute cutoff, with the
  repeated-anchor policy above. Tests cover scaling, reversal, consecutive
  duplicates, 2D/3D, and a double-precision Barry–Goldman reference.
- The no-cusp/no-local-loop guarantee applies to centripetal Catmull–Rom at
  tension 0.5 with distinct adjacent anchors, not arbitrary tangent scaling.
  Conversion identities are subject to float32 output rounding; a B-spline
  round trip requires tension 1, and a cardinal round trip requires reusing
  its original tension and alpha.
- Uniform conversion skips the knot array. Non-uniform tangents use two
  weighted adjacent differences with weights shared across coordinates.
  Generated points are allocated by dimension and filled directly; inverse
  output construction no longer allocates per-point accessor closures.
- Shared test helpers cover all four conversions, including generator input
  and input preservation. The inverse B-spline tests also verify first- and
  second-derivative continuity at interior joins.
- The separate `curve.cardinalToBezier` demo was folded into `curve.cardinal`
  (native paths for three cardinal curves, one of them centripetal with its
  handles shown), and `curve.bspline` now converts its closed B-spline to a
  Bezier path and shows the Bezier anchors and handles.
