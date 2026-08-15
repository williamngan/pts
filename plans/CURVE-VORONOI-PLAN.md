# Curve subdivision and Voronoi assembly plan (Tier-2 #8 + residue)

## Objective

Close out Tier 2:

- **#8 Curve**: `catmullRom` / `cardinal` / `bezier` / `bspline` currently
  allocate a fresh 4×4 basis `Group` of `Pt`s, run `Mat.multiply`, and reduce
  with closures **per output point** (~2–3 µs and ~10 allocations per point).
  Precompute the per-step weight table once per call and evaluate segments
  with scalar loops — one `Pt` allocation per output point, nothing else.
- **Residue — Voronoi cell assembly**: `voronoi()` builds each cell with
  `neighborPts(i, true)`, whose `Geom.sortEdges` sort dominates the
  delaunay+voronoi scenario (7.75 µs/pt). The half-edge structure from the
  new core already knows the circumcenter ordering; walk it directly.

## Design

### Curve weight tables

For all four families the interpolated point is `P(t) = Σ wⱼ(t)·Cⱼ`. The
weight polynomials, derived from the exact matrices in the current code (so
output matches to floating-point noise):

- catmullRom: `w0=-.5t³+t²-.5t; w1=1.5t³-2.5t²+1; w2=-1.5t³+2t²+.5t; w3=.5t³-.5t²`
- cardinal (tension T): `wⱼ = T·hⱼ + bⱼ` with `h=[-t³+2t²-t, -t³+t², t³-2t²+t, t³-t²]`,
  `b1=2t³-3t²+1`, `b2=-2t³+3t²`, `b0=b3=0`
- bezier: `w0=-t³+3t²-3t+1; w1=3t³-6t²+3t; w2=-3t³+3t²; w3=t³`
- bspline: `w0=(-t³+3t²-3t+1)/6; w1=(3t³-6t²+4)/6; w2=(-3t³+3t²+3t+1)/6; w3=t³/6`
- bspline with tension: same `T·hⱼ + bⱼ` structure with
  `h=[w0_bspline, -1.5t³+2t²-⅓, 1.5t³-2.5t²+.5t+⅙, t³/6]` and the same b1/b2

Implementation: one private `_weights(steps, fill)` building a
`Float64Array((steps+1)*4)` once per call, and one private segment evaluator
shared by all four families, parameterized by the three iteration shapes
(catmullRom/cardinal: first segment repeated start, advance by 1;
bspline: advance by 1 from k=0; bezier: advance by 3). Control points still
come from the public `Curve.controlPoints` (cheap post-Tier-1, keeps the
index-clamping semantics identical). Inner loop reads control values by
index (`c[0]`,`c[1]`,`c[2]`), supports 2D/3D via the first control point's
length, and pushes one `Pt` per output point.

Unchanged public surface: `getSteps`, `controlPoints`, and all five `*Step`
functions keep their exact current implementations — they are the reference
the equivalence tests compare against.

### Voronoi half-edge walk

- `_triangulate` (module-private) returns `{ triangles, halfedges }`; the
  `Delaunay` instance stores them plus the built `DelaunayShape[]` during
  `delaunay()`.
- `voronoi()` builds an `inedges` table (one incoming half-edge per point,
  preferring hull edges so boundary fans start at their open end), then for
  each point walks `e → next-in-triangle → opposite` collecting each
  triangle's cached circumcenter (`shape.circle[0]`, the same shared `Pt`
  references `neighborPts` hands out) until it closes or reaches the hull.
- `neighborPts` / `neighbors` / `mesh` stay exactly as they are; only
  `voronoi()`'s internals change. If the half-edge data is absent (subclass
  calling patterns), fall back to the current `neighborPts(i, true)` path.

## Validation

1. **Value equivalence** (the key test): for a seeded path, each family's
   output matches a reference computed through the retained public `*Step`
   functions, within float32 tolerance — the old machinery pins the new.
2. **Voronoi equivalence**: for a seeded set, each cell's vertex _set_ equals
   `neighborPts(i)`'s set; interior cells are convex-ordered (consistent
   cross-product sign) — the property `sortEdges` provided.
3. Existing suites; full A/B `--against HEAD` (HEAD is clean); watch
   `op` curve cases, `create` suite, and the curve-smoothing and
   delaunay+voronoi scenarios. Expect ~5–10× on curves, ~2× on the voronoi
   scenario.

## Review findings (folded during design)

- **R1 — Indexed access is a quiet bugfix.** `_calcPt` reads `.x/.y/.z`,
  which are `undefined` on plain arrays, so array-of-array inputs produce
  NaN curves today despite the `PtLikeIterable` signature. The scalar loops
  read `c[0]/c[1]/c[2]`, which works for both. Behavior change: NaN → correct
  values; noted as a fix, covered by a test.
- **R2 — Float drift**: the old path rounds intermediates through f32 `Pt`s;
  the new tables are f64 until the final `Pt`. Differences are ~1e-6
  relative; equivalence tests use precision-3 closeness.
- **R3 — The `while (k < …)` guard structure is kept** (including the
  `cp.length > 0` checks and bezier's `k += 3` stride), so segment counts
  and edge cases (short inputs) are structurally identical.
- **R4 — Weight formulas are derived from the code's matrices, not the
  comments** (two of the matrix comments do not match their own code; the
  code is the behavior to preserve).
- **R5 — `inedges` must prefer hull edges** (`halfedges[e] === -1`),
  otherwise a boundary point's walk starts mid-fan and misses one side.
- **R6 — Cells keep sharing circumcenter `Pt` references** (old
  `neighborPts` behavior); duplicate/skipped points yield empty cells in
  both old and new paths.
- **R7 — Hull cells are open in both paths** (the walk stops at the hull;
  the old path only ever saw existing triangles' circumcenters), so the
  vertex sets match; only ordering semantics for boundary cells differ
  (walk order vs angle sort), which nothing downstream observes.

## Results

Measured with `--against HEAD` (op + create + scenarios, 5 rounds): **0
slower**.

| Case                                  |  Before |   After | Delta |
| ------------------------------------- | ------: | ------: | ----: |
| `Curve.catmullRom`                    | 2.14 µs |  224 ns |  −90% |
| `Curve.cardinal`                      | 2.14 µs |  225 ns |  −89% |
| `Curve.bspline` / with tension        | 2.00 µs |  220 ns |  −89% |
| `Curve.bezier`                        |  677 ns | 77.5 ns |  −89% |
| curve smoothing scenario (200×20)     | 2.12 µs |  237 ns |  −89% |
| `Delaunay.voronoi`                    | 3.12 µs |  486 ns |  −84% |
| delaunay + voronoi scenario (500 pts) | 7.10 µs | 3.74 µs |  −47% |

The delaunay + voronoi frame for 500 points now costs ~1.9 ms (from 378 ms
at the original baseline — ~200× across the campaign); the curve-smoothing
scenario frame costs ~0.9 ms for 4,000 interpolated points. All 271 tests
pass, including the new equivalence pins (curve values against the retained
step functions; voronoi cell sets against `neighborPts`, with convex
ordering verified); the `create.delaunay` demo renders identically.

## Follow-up: demo hitch root cause and fix

User-reported hitching during the demo's point-adding phase was reproduced
and root-caused to two compounding issues, neither a regression of the
optimization work (both present in the old engine, and the exact demo loop
measured faster at every percentile on the new build):

1. **Unbounded Voronoi cells.** Points added along a mouse path are locally
   near-collinear; their sliver triangles have circumcenters up to ~1.3e5 px
   away (measured), and the demo stroked those gigantic polygons every
   frame on a GPU-rasterized canvas — a known stall pattern that software
   rasterization (headless test runs) does not exhibit. Fixed at the
   library level: `Delaunay.voronoi(bound?)` now accepts an optional
   rectangular bound and clips cells to it (Sutherland–Hodgman, with a
   shared-reference fast path for fully-inside cells and vertex filtering
   for degenerate hull fragments). Additive API; no-bound behavior is
   byte-identical.
2. **Per-event re-triangulation.** The demo rebuilt delaunay + voronoi on
   every qualifying `mousemove` event; it now sets a dirty flag and rebuilds
   at most once per frame in `animate`, and passes `space.innerBound` to
   `voronoi()`.

Verified: 273 tests pass (clip bounds, identity preservation, no-bound
equivalence); the demo holds locked 60 fps under a fast near-straight sweep
(641 events / 4 s, zero frames over 40 ms) with cells terminating at the
canvas edge.
