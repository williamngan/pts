# Path polygon overlay

## Scope and public API

`Path` in `Op.ts` combines any iterable of polygon shapes. Each shape is
one ring or an iterable of rings combined by the nonzero winding rule. Inputs
are ordered back to front. Results contain fresh 2D `Group` rings, with each
outer followed by its oppositely oriented holes.

| Mode         | Kept region                                        | Result      |
| ------------ | -------------------------------------------------- | ----------- |
| `unite`      | Inside any shape                                   | `Group[]`   |
| `intersect`  | Inside every shape                                 | `Group[]`   |
| `exclude`    | Inside an odd number of shapes                     | `Group[]`   |
| `minusFront` | Inside the first shape and no other                | `Group[]`   |
| `minusBack`  | Inside the last shape and no other                 | `Group[]`   |
| `divide`     | Every face inside any shape                        | `Group[][]` |
| `crop`       | Every face inside the last shape and another shape | `Group[][]` |

`CanvasForm.compound`, inherited by `SVGForm`, draws all rings as one nonzero
winding path. Empty input does not repaint the preceding path. Each mode has
a study in `study/Path.*.js`.

## Implementation after the correctness review

The engine is a planar arrangement of straight edges. A face label records
the winding number of every shape covering it; all seven operations select
from the same labeled faces. This supports coincident edges, holes,
self-intersecting rings, and divided faces without separate clipping engines.

1. **Read and snap input vertices.** Materialize iterable rings without replacing
   the caller's array elements. Skip short and non-finite rings. Merge input
   vertices within `tol = 1e-6 * largest absolute coordinate`, then create
   directed edges. The spatial hash has cells of 64 tolerances.
2. **Find intersections.** Sort edge boxes on x and reject nonoverlapping y
   ranges. Exact `orient2d` predicates from `_triangulate.ts` distinguish
   crossings, collinearity, and endpoint contact. Only an endpoint exactly on
   an edge splits it. A nearby endpoint must not bend the edge: doing so can
   create crossings absent from the original arrangement.
3. **Compute crossing coordinates.** Evaluate the crossing parameter's
   determinants in exact binary integer arithmetic before dividing. Ordinary
   floating determinants lose significant digits for shallow crossings and
   can disagree across retraced edges. Coalesce computed intersections using
   double rounding precision (`8 * Number.EPSILON * maxAbs`), independently
   of the larger input tolerance.
4. **Merge split edges.** Sum nonzero per-shape deltas in sparse maps, dropping
   edges with no winding change. Empty shapes retain their stacking indices
   and still affect the semantics of intersection and subtraction.
5. **Trace and label faces.** Sort outgoing half-edges by angle and trace their
   left-face cycles. Flood winding labels from the unbounded cycle of each
   connected component. A single component starts with an empty label; multiple
   components need a westward ray to account for enclosing components. Labels
   are sparse maps with zero entries removed.
6. **Select and trace boundaries.** Merging modes trace selected/unselected
   boundaries; divide and crop emit selected face cycles separately. Internal
   overloads preserve the mode-dependent return type without public casts.
7. **Attach holes.** A westward ray identifies the enclosing boundary. Resolve
   chains of neighboring holes iteratively and cache their final owner. A
   horizontal row of holes can make this chain arbitrarily long even with no
   nesting, so recursion is inappropriate.
8. **Produce Float32 rings.** Keep the first vertex as an anchor until its final
   neighbors are known. Remove only truly collinear vertices, preserving small
   bends. Drop consecutive duplicates introduced by Float32 conversion and
   faces whose output area collapses or changes orientation.

### Ray-query index

Build a balanced bounding-box tree over nonhorizontal edges only when a seed
or hole query needs it. Westward rays reject nodes outside the query's y or x
range. Nearest-boundary queries search eastward nodes first and prune nodes
behind the best hit. If all edges in a node straddle a query's y and the node
is wholly west, its aggregated winding replaces individual edge visits.

This avoids an unconditional scan of every edge for every hole. Keeping the
index lazy avoids overhead for the common case of two overlapping polygons
with a connected boundary and no holes.

### Limits and complexity

The input tolerance is a deliberate geometry policy, not the precision of a
Float32 point. It depends on coordinate offset: a unit square at `(1e6, 1e6)`
can collapse even though its corners are representable. Use local coordinates
for small geometry at large offsets. Configurable tolerance is a separate API
proposal, not a silent change to the current policy.

Intersection decisions and determinants are exact; computed intersection
coordinates are doubles and output Pts are Float32. Tiny faces can collapse
at output precision. There is no claim that every numerical error is local,
or that bounded traversal alone establishes geometric correctness.

The x sweep can still inspect quadratically many candidate pairs when their
x ranges overlap, even if their y ranges do not. Sparse maps store actual
nonzero memberships instead of an edge-count by shape-count matrix; deeply
overlapping shapes can still require many memberships. The ray tree costs
`O(E log² E)` to build with recursive sorting and can still visit `O(E)` edges
for an unfavorable query. Its construction recursion is logarithmic, unlike
the removed hole-owner recursion.

## Regression and fuzz validation

`src/test/Path.spec.ts` covers all modes, area identities, iterable
inputs, immutability, holes, touching and coincident edges, self-intersections,
scaling, and the following review regressions:

- Closing-corner loss: union area about 45 instead of 145, depending on input
  order. Exercise ring-start rotations and winding reversal as well.
- Incorrect subtraction caused by bending edges through nearby endpoints.
- Shallow crossings of retraced edges whose floating determinants disagreed.
- 12,000 separate holes ordered right to left, formerly a stack overflow.
- 2,000 disjoint shapes, including sparse-storage counts and stacking semantics.
- Seeded near-coincident arrangements checked for consistent winding deltas,
  unsplit crossings above rounding precision, and all-mode coverage.

The point oracle excludes only a small multiple of the actual input tolerance
around boundaries. The previous margin was 0.2% of the geometry extent, which
could hide errors much larger than the snapping tolerance.

The standalone fuzz command checks the release bundle, with seed and complete
input geometry printed on failure. It covers all seven modes, compound inputs,
self-intersections, Float32 Groups, double arrays, and near-coincident vertices.
Divide/crop are checked for both coverage and disjointness. Example:

```sh
pnpm build
pnpm test:path:fuzz --seed 18311 --trials 30000
```

The `op` benchmark suite includes ordinary two-polygon operations, 512-gons,
2,000 disjoint shapes, and 1,000 holes. Keep shape count and hole count distinct
from vertex count when evaluating performance. Preliminary container timings
reduced the 2,000-square union from roughly 328 ms to 24 ms; two intersecting
64-gons stayed around 33–36 microseconds. These observations are workload and
machine dependent, not CI timing thresholds.

## Follow-up API opportunities

These need independent API design and are not prerequisites for correctness:

- A prepared arrangement that can evaluate several modes without rebuilding.
  It needs clear input-mutation and ownership semantics before becoming public.
- Optional source-shape membership on divided faces for picking, coloring, and
  editing. Specify how self-overlap and compound inputs affect membership.
- Explicit tolerance or local normalization, including how world-coordinate
  Float32 output limits interact with preserving small features.

Keep these proposals separate from regression repairs so existing calls and
return types remain stable.

## Follow-up after the second review

Three changes on top of the correctness review, each measured against the
two previous engine versions with the same inputs.

- **Splitting happens in two phases.** A fuzz over shifted copies of shapes
  found unions losing hundreds of area units on your commit: a pentagram
  built with `cos`/`sin` has a "vertical" edge whose endpoints differ in `x`
  by 1e-14, and a copy shifted along it runs parallel a femtometer away, below
  the crossing-coalescing precision but with no vertex in common, which is an
  inconsistency exact predicates cannot absorb. Now a vertex within `tol` of
  an edge's interior splits that edge first, for every vertex and edge, and
  the sub-edges are rebuilt before any crossing is computed; the exact
  crossing pass then runs on geometry that no later split will bend. This is
  the same discipline as the vertex merge, which already moves geometry by up
  to `tol` before the sweep. The pair list from the first sweep is reused for
  the second whenever the first registered nothing. Your regression tests
  (retraced shallow crossings, closing corner, no bending when subtracting,
  the seeded graph invariants) all still pass.
- **The ray tree is built only when its queries are known to pay for it.**
  Scanning costs about `E` per query and the tree about `E log E` to build,
  so break-even is a fixed number of queries times `log2(E)`, and the query
  count is known before any query runs (components for the seeds, holes for
  the owners). One hole or a second component no longer builds a tree.
- **Hairline rings are dropped on output.** A ring whose mean width (twice
  its area over its perimeter) is below `tol` is the trace of edges that
  coincide up to rounding; filled it is invisible, stroked it is a stray line.
  With the two-phase split most such cases never arise (a vertex touching an
  edge to float32 precision is now an exact touch), and the filter catches
  the rest. A one-pixel strip a thousand pixels long is kept.

Also: `crossingParameter` finds its shift with a BigInt comparison instead of
a binary string, and touch tests skip endpoints outside the other edge's box.

Per call, best of interleaved rounds (node):

| Case                        | My commit | Your commit | Now     |
| --------------------------- | --------- | ----------- | ------- |
| unite, two 64-gons          | 34 µs     | 38 µs       | 40 µs   |
| minusFront donut, one hole  | 26 µs     | 48 µs       | 32 µs   |
| divide, three 64-gons       | 54 µs     | 67 µs       | 72 µs   |
| unite, two 512-gons         | 270 µs    | 280 µs      | 291 µs  |
| unite, two disjoint 64-gons | 32 µs     | 49 µs       | 39 µs   |
| unite, 2000 squares         | 313 ms    | 11.0 ms     | 11.6 ms |
| unite, 1000 holes           | 17.6 ms   | 2.1 ms      | 2.3 ms  |

The remaining cost over my commit on the crossing-heavy rows is the second
pass and the sparse maps; the row that matters most for sketches, a shape
with one hole, is back near my commit. `pnpm test:path:fuzz` and the
400-configuration fuzz that found the pentagram case both pass on this tree.

The original plan, with the comparison of clipping algorithms and the two
pre-implementation review passes, is in git history at
`052f0d1:plans/PATHFINDER-PLAN.md`.
