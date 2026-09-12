# Tier-2 #6 and #7: polygon query optimization and Delaunay rewrite

## Objective

Two remaining algorithmic items from the performance campaign:

- **#6 — Polygon queries (`Op.ts`)**: remove the per-vertex allocation in
  `Polygon.nearestPt`, and add an AABB pre-reject to the SAT intersection
  tests so disjoint pairs exit before any axis projection.
- **#7 — Delaunay (`Create.ts`)**: replace the Bowyer-Watson sweep core with
  an incremental half-edge triangulation in the delaunator style. This is the
  slowest scenario left in the suite: the 500-point delaunay + voronoi frame
  costs ~73 µs/point (~36 ms/frame) — after two optimization passes already.

## Current state and evidence

| Case                         | Now          | Note                              |
| ---------------------------- | ------------ | --------------------------------- |
| `Polygon.nearestPt` (64-gon) | ~650 ns      | allocates a `Pt` per vertex       |
| nearest-point scenario       | ~5 µs/probe  | same, over a larger polygon       |
| `Create.delaunay` (128 pts)  | ~27 µs/pt    | O(n²)-ish sweep, allocation-heavy |
| delaunay + voronoi (500 pts) | ~73 µs/pt    | worst scenario in the suite       |
| polygon collision sweep      | ~180 ns/pair | SAT already scalarized            |

## #6 — Polygon queries

1. **`Polygon.nearestPt`**: `Util.iterToArray` once, then a scalar indexed
   loop tracking min squared distance — no allocation. The algorithm is
   already optimal (single pass); the cost is purely the per-vertex
   `$subtract().magnitudeSq()` chain.
2. **AABB pre-reject** in `hasIntersectPolygon` and `hasIntersectCircle`: one
   min/max pass over each polygon (for the circle: center ± radius) before
   the axis loop; disjoint boxes return `null` immediately. This must be a
   pure fast-path: identical return values in every intersecting case. It
   costs one extra O(n) pass for overlapping pairs and replaces axis
   projection + normalization for separated ones.

## #7 — Delaunay rewrite

### Why replace rather than optimize

The current core (Paul Bourke lineage) has structural problems beyond speed:

- Points are sorted **descending** by x, but the "safe to close" pruning test
  (`d[0] > 0 && d[0]² > r²`) is written for an **ascending** sweep: it retires
  circumcircles that lie to the _left_ of the sweep point while later points
  move _leftward into them_. Triangles can be finalized that a later point
  invalidates — the result is not reliably Delaunay.
- Early-closed triangles bypass both the super-triangle filter and the
  `_cache` call, so `mesh()` — and therefore `voronoi()` / `neighbors()` —
  see only the subset of triangles still open at the end. (To be verified
  empirically against the old build during review; if confirmed, the rewrite
  is a correctness fix for Voronoi output, not just a speedup.)
- Cost: `splice` in hot loops, a `Pt`/`Group`/circumcircle allocation per
  candidate triangle (including all discarded ones), and O(edges²) dedupe per
  insertion.

### New core

An incremental half-edge triangulation following mapbox/delaunator
(ISC-licensed; ported with attribution in the source header):

- Seed triangle near the centroid; remaining points sorted by distance from
  the seed circumcenter; advancing convex hull with an angular hash for O(1)
  hull entry lookup; edge legalization via in-circle flips.
- All core state in typed arrays: `_triangles: Uint32Array` (vertex indices,
  3 per triangle), `_halfedges: Int32Array`, hull arrays. No object or `Pt`
  allocation inside the core.
- Delaunator's pseudo-robust orientation predicate (error-bounded fast path
  with exact fallback) rather than a bare cross product.
- Coordinates read once from the group's `Pt`s (f32 → f64) into flat arrays.

### API adaptation — everything public stays

`delaunay(triangleOnly)` runs the core, then materializes the same structures
as today: per final triangle, a `DelaunayShape` `{i, j, k, triangle, circle}`
where `triangle` is a `Group` referencing this group's actual `Pt`s and
`circle` is `[center, radius]` — computed with **scalar circumcenter math**
in the adapter (`Triangle.circumcircle` costs ~1.8 µs/call and would dominate
the rebuilt pipeline). Every shape is `_cache`d, so `mesh()`, `neighbors()`,
`neighborPts()`, and `voronoi()` work unchanged — their code is not touched.

Kept for compatibility:

- `DelaunayShape` / `DelaunayMesh` types, `i/j/k` indexing into this group.
- The protected helpers `_superTriangle`, `_triangle`, `_circum`, `_dedupe` —
  pinned by a test subclass — remain as utilities even where the new core no
  longer calls them.
- `< 3` points returns `[]`; `voronoi()` still requires a prior `delaunay()`
  call.

Degenerate inputs, defined behavior: all-collinear points return `[]`
(no triangulation exists); duplicate points are skipped during insertion
(delaunator behavior) rather than producing degenerate triangles.

### Performance target

Core ≈ 1 µs/point; adapter ≈ 5 small allocations per triangle (~2n
triangles). Target ≤ 3 µs/pt on the 500-point scenario — a ~25× further
improvement — and ~60× counting from the original baseline (378 ms → sub-ms
per frame).

## Validation

1. Existing unit tests (fixture counts must hold — a correct triangulation of
   the small fixtures should reproduce them; verify rather than assume).
2. New tests: the **empty-circumcircle property** on a seeded random set
   (no input point strictly inside any output triangle's circumcircle — the
   definition of Delaunay, checked with tolerance); voronoi cell count on a
   larger set; duplicates; collinear input; a 1000-point smoke.
3. `pnpm bench:check`, full A/B `--against HEAD`; the create suite and both
   polygon scenarios are the cases to watch.
4. Visual check of the `create.delaunay` demo (Delaunay + Voronoi rendering).

## Out of scope

Constrained/weighted triangulations, 3D, incremental point insertion API,
`intersectPolygon2D` clipping rewrite.

---

## Review findings (second pass)

- **R1 — The plan's correctness claims about the old core were wrong, in an
  informative way.** Measured against the old build (60 seeded points): all
  108 triangles satisfy the empty-circumcircle property and all 108 are
  cached in the mesh. The inverted sort direction doesn't corrupt results —
  it makes the early-close pruning _never fire_ (circumcircle centers lie
  right of a leftward sweep), so every insertion scans every open triangle:
  the algorithm degenerates to O(n²) but stays correct. The rewrite is a
  performance fix, not a correctness fix; the plan text stands corrected
  here. Consequence: the old behavior gives us a strong shared invariant —
  the empty-circumcircle test must pass on the new core too.
- **R2 — Fixture verified.** The spec fixture (unit square + center) has a
  unique correct triangulation of 4 triangles with 4 shapes around the center
  point; any correct implementation reproduces the pinned counts.
- **R3 — Touch only the core and the adapter.** `mesh()`, `neighbors()`,
  `neighborPts()`, `voronoi()`, and `_cache` remain byte-identical; the
  adapter caches every final shape, so downstream code cannot notice the
  change except through triangle ordering (untested, unspecified).
- **R4 — The mesh array must be pre-initialized to `{}` for every index** so
  `mesh().length === points.length` even for points that end up in no
  triangle (duplicates); the old code initialized entries lazily per point.
- **R5 — `circle` must match `Circle.fromCenter`'s shape exactly**:
  `Group(new Pt(cx, cy), new Pt(r, r))`, with the radius duplicated in both
  components.
- **R6 — AABB pre-reject purity, argued case by case.** For polygon-polygon,
  edge-normal SAT is exact for convex shapes, so AABB-disjoint implies a
  separating edge normal exists — the pre-reject can only skip work, never
  change the answer. For polygon-circle, the current axis set omits
  vertex-to-center axes and _can_ report corner false-positives — but the
  existing `check` clause (perpendicular-foot test) already rejects exactly
  those, so the pre-reject agrees with the final answer there too. Verified
  additionally by a randomized equivalence test in the suite.
- **R7 — Triangle winding and ordering are unspecified.** delaunator emits a
  consistent winding; nothing downstream reads winding (fills and
  `sortEdges` are orientation-agnostic). Tests assert counts and properties,
  not order.
- **R8 — Duplicate points change behavior, deliberately**: the old core
  could emit degenerate triangles for coincident points; the new core skips
  near-duplicates (delaunator semantics), and a skipped point keeps an empty
  mesh entry (`neighborPts` returns `[]` for it). Documented and tested.
- **R9 — Port fidelity list** for the delaunator core: pseudo-angle hull
  hash of size ⌈√n⌉; custom quicksort on ids keyed by seed distance;
  fixed 512-entry legalization stack; `orient` fast path with
  error-bounded fallback; seed selection = closest to bbox center, then
  closest to seed, then minimal circumradius; collinear-input detection
  returns `[]`. License: ISC (Mapbox) — attribution comment at the core.
- **R10 — `nearestPt` keeps its `PtIterable` contract** (generators
  accepted) by converting through `Util.iterToArray` before the scalar loop.
- **R11 — Decide the AABB pre-reject by measurement**: if the collision-sweep
  scenario (mostly overlapping pairs) regresses beyond noise, drop the
  pre-reject from `hasIntersectPolygon` and keep it only in the physics
  broad phase, which already exists. Data over intuition.

---

## Results

Measured with `--against HEAD` (full timing, 5 rounds): **0 slower**.

| Case                                 |  Before |   After | Delta |
| ------------------------------------ | ------: | ------: | ----: |
| `Create.delaunay` + triangulate      | 28.6 µs | 2.46 µs |  −91% |
| delaunay + voronoi scenario (500 pt) | 77.3 µs | 7.75 µs |  −90% |
| `Polygon.nearestPt`                  |  668 ns | 40.1 ns |  −94% |
| nearest-point query scenario         | 5.28 µs |  206 ns |  −96% |
| `Polygon.hasIntersectCircle`         |  796 ns |  521 ns |  −35% |

The delaunay + voronoi frame is now ~3.9 ms for 500 points, from 378 ms at the
original baseline — roughly 97× over the whole campaign. The polygon collision
sweep (overlap-heavy fixture) is unchanged, so the AABB pre-reject stays per
review finding R11: it costs nothing where it doesn't help and −35% where it
does. The remaining per-point cost in the voronoi scenario is dominated by
cell assembly (`neighborPts` + `Geom.sortEdges`), untouched by design (R3);
a future pass could derive cell ordering from the half-edge structure
directly if it ever matters.

All 253 tests pass, including the new invariants: empty-circumcircle on
random sets, complete voronoi/mesh structures, duplicate-point skipping,
collinear degeneration, and a 1000-point triangle-count sanity check
(Euler bound). The `create.delaunay` demo renders correct Delaunay + Voronoi
tessellations.
