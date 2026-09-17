# Poisson-disk sampling plan

## Objective

Add a high-quality, efficient point sampler to the `Create` package: a set of
points that are randomly placed yet never closer than a given radius (blue
noise). This is the sampler behind the old Pt landing-page demo
(`SamplePoints.poissonSampler`), and the most-requested generator missing from
Pts 1.0 next to `distributeRandom` (uniform random, clumpy) and `gridPts`
(regular).

Deliverables:

1. `Create.sampling(bound, radius, options?)` returning a `PoissonDisk`
   Group, with one-shot and progressive (per-frame) generation.
2. Tests pinning the invariants, and bench cases in the `create` suite.
3. A `create.sampling` demo in the spirit of the old Pt landing demo: the
   sampler visibly fills the space, then every point grows a "hair" that the
   pointer combs.

## Algorithm choice

The candidates, in order of practical relevance for a 2D creative-coding
library:

| Method                                                  | Time                             | Quality                                  | Progressive | Notes                                                                           |
| ------------------------------------------------------- | -------------------------------- | ---------------------------------------- | ----------- | ------------------------------------------------------------------------------- |
| Dart throwing                                           | O(n²) and never terminates       | true Poisson disk                        | yes         | Reference only                                                                  |
| Mitchell's best candidate                               | O(n · m) per point               | good blue noise, not maximal, no min gap | yes         | Needs a count, not a radius                                                     |
| Bridson 2007 (annulus r..2r, k=30)                      | O(n)                             | good blue noise, ~65% maximal            | yes         | The classic; wasteful candidates                                                |
| **Roberts 2019** (candidates on the circle at r+ε, k≈4) | O(n), ~5–20× fewer candidates    | denser and closer to maximal             | yes         | Bostock's "Poisson disk sampling II" implements it; the accepted modern default |
| Yuksel 2015 sample elimination                          | O(n log n), needs a k-d tree     | best spectrum, progressive ordering      | no          | Heavier machinery, needs an input point cloud; overkill here                    |
| Tiling / precomputed (Lagae–Dutré, Wang tiles)          | O(1) per point after a big table | excellent                                | no          | Data tables, not a generator                                                    |

**Decision: Bridson's grid-accelerated algorithm with Roberts' modification.**
It is linear time, needs only a small integer grid, produces the dense blue
noise people expect from "Poisson disk", and is naturally incremental (one
`step()` per accepted sample), which the demo requires. Sample elimination is
the only method with measurably better spectra, and it is not a fit: it cannot
grow a set progressively and needs a k-d tree plus a heap.

The mechanism, for reference (Bridson with Roberts' change in step 3):

1. Cell size `r/√2` so each grid cell holds at most one sample; the grid stores
   the sample index per cell (`-1` when empty).
2. Keep an _active_ list. Pick a random active sample `p`.
3. Generate `k` candidates on the circle of radius `r + ε` around `p`, at
   evenly spaced angles `θ₀ + 2πj/k` with a random `θ₀` (Roberts; Bridson used
   random points in the annulus `r..2r` and `k = 30`).
4. A candidate is accepted if it lies in the bound and no sample in the
   surrounding 5×5 grid cells is closer than `r`. Accept the first success:
   store it, push it on the active list, return it.
5. If all `k` candidates fail, retire `p` (swap-remove from the active list) and
   try another. When the active list is empty, sampling is done.

Why Roberts' placement is better: a candidate exactly at distance `r` is the
closest point that can still be accepted, so it packs tightly against `p`; the
evenly spaced angles cover the directions around `p` without wasting draws.
With `k = 4` it reaches a higher density than Bridson's `k = 30` in far fewer
rejection tests.

## Design

### Public API

```ts
// Create: a complete set, like every other Create generator
static sampling(bound: Bound, radius: number, options?: PoissonDiskOptions): PoissonDisk;

// Types
type PoissonDiskOptions = {
  /** Candidates tried around each active sample before it is retired. Default is 8. */
  candidates?: number;
  /** The first sample. Default is a random point inside the bound. */
  start?: PtLike;
};

// A Group of Pts that grows as you sample
class PoissonDisk extends Group {
  /** Reset and place the first sample. Re-callable: it clears the group and the grid. */
  setup(bound: Bound, radius: number, options?: PoissonDiskOptions): this;
  /** Add the next sample and return it, or undefined once the bound is full. */
  step(): Pt | undefined;
  /** Add up to `count` more samples (all remaining by default). */
  sample(count?: number): this;
  /** True once no more samples fit. */
  get done(): boolean;
  get radius(): number;
  get candidates(): number;
  get bound(): Bound;
}
```

One shot: `Create.sampling(space.innerBound, 12)`. Progressive, as in the
demo: `new PoissonDisk().setup(space.innerBound, 12)` then `pd.sample(40)`
per frame or `pd.step()` per point. This mirrors `new Delaunay()` versus
`Create.delaunay(pts)`.

Default `candidates` is 8, not Roberts' 4: measured on 800×600 / r=8 (see
Results), k=4 leaves holes up to 1.6r while k=8 keeps the largest hole at
about r (a practically maximal set) for 0.8 µs per point instead of 0.5.

Conventions followed:

- Same shape as `Create.delaunay` / `Create.flock`: a static factory returning
  a Group subclass with a no-argument constructor plus `setup` (a Group is an
  Array subclass, so its constructor must stay compatible with `map`,
  `filter`, and `slice` species calls).
- Randomness through `Num.random`, so `Num.seed` makes the set reproducible,
  as with `distributeRandom` and `Flock`.
- No `fill()` method: `Array.prototype.fill` already exists on a Group.
- 2D only, like `Delaunay` and `Flock`. Roberts' angle placement is a 2D
  trick; 3D would need random directions on a sphere and a 3D grid, and no
  Pts caller has asked for it. Documented in the doc comment.

### Internals

- `_grid: Int32Array(cols × rows)` of sample indices, `_active: number[]`
  with swap-remove, the bound as four numbers, `_cell = radius / √2`.
- Samples live in the Group itself (`this[i]` is the Pt). The neighbor test
  reads `this[j][0]`/`[1]` directly, so there is no parallel coordinate store
  to keep in sync.
- **Float32 consistency.** A Pt is a `Float32Array`. Candidates are rounded
  with `Math.fround` _before_ the distance test, so the coordinates that are
  tested are exactly the coordinates that are stored. The min-distance
  invariant then holds exactly on the returned Pts, and the test asserts it
  with no tolerance. ε is `radius · 1e-3`, comfortably above float32 rounding
  at pixel scales while costing nothing measurable in density.
- Rejection test is `dx² + dy² < r²` in doubles over the 5×5 cell window
  clamped to the grid (the four corner cells can only reach exactly `r`, and
  equality is accepted, so no special-casing is needed).
- Inside-bound test is half-open (`x0 <= x < x1`). Every stored point,
  including the start, goes through the same accept path (round, bound test,
  neighbor test), so a random start that rounds up onto the far edge is
  redrawn rather than stored.
- `step()` pulls a random active index, tries `k` candidates, and either
  returns the accepted Pt or retires the sample and loops. It never returns a
  sample outside the bound and never returns after `done`.
- `setup` validates everything up front and places the first sample: it
  throws on a non-finite radius or bound, on `radius <= 0`, on a `start`
  outside the bound, and on a grid above 2²⁶ cells (about `8·area/r²` bytes,
  so a radius far too small for the bound fails with a message instead of a
  bare typed-array RangeError). A bound with no area is simply `done` with no
  samples. `setup` resets: it empties the group, rebuilds the grid, and clears
  the active list, so the demo can restart on resize.
- Cell indices are clamped to the grid so a coordinate that divides to
  exactly `cols` (float rounding at the far edge) cannot index past it.
- Callers should treat the Group as read-only while sampling; pushing or
  moving Pts by hand breaks the grid (documented).
- Doc comment states the two properties of the method that users may notice:
  most samples sit at exactly `radius` from the sample that spawned them
  (denser packing, a sharper pair-correlation peak than classic Bridson), and
  ε assumes coordinates below roughly `8000·radius` in magnitude (beyond that
  float32 rounding rejects some candidates, costing density, never the
  minimum distance).

### Complexity

Per accepted sample: at most `k` candidates × 25 cell reads. Retiring a sample
costs the same `k × 25`. Total is `O(n · k)`; with `k = 4`, about a hundred
distance checks per output point, one `Pt` allocation per point, and one
`Int32Array` for the grid.

## Validation

### Tests (`src/test/PoissonDisk.spec.ts`)

1. **Min distance, exact**: pairwise over a seeded 800×600 / r=8 set, every
   pair satisfies `dx² + dy² >= r²` computed the same way the sampler does.
2. **In bound**: every Pt satisfies the half-open test; an offset bound
   (top-left not at the origin) is used so origin bugs show.
3. **Density and holes (seeded regression)**: the count is at least 60% of
   the hexagonal packing bound `area / (r² · √3 / 2)` (measured 0.68 at
   k=8), and 2,000 random probes each have a sample within `2r`. Neither is a
   theorem for finite `k`; under a fixed seed they pin the behavior.
4. **Determinism**: same `Num.seed` gives identical coordinates and order.
5. **Progressive contract**: `step()` returns a Pt that is the last element
   and increases `length` by one; `sample(n)` adds at most `n`; after `done`,
   `step()` returns `undefined` and `sample()` is a no-op; `done` flips once;
   `setup` again empties and restarts.
6. **Options**: `start` becomes the first sample (rounded to float32); a
   `start` outside the bound throws at `setup`; `candidates: 30` still
   satisfies invariants and is denser than `candidates: 1`.
7. **Edge cases**: `radius` of 0, negative, NaN, Infinity throw; a bound with
   NaN or infinite coordinates throws; zero-area bound gives an empty done
   set; a bound smaller than the radius in both dimensions gives exactly one
   sample; an absurdly small radius throws the friendly grid-size error; the
   random start is redrawn when it rounds onto the far edge (forced through a
   stubbed `Num.random`).
8. **Still a Group**: `.map` returns a `PoissonDisk` instance without calling
   `setup`; `Bound.fromGroup(pd)` fits inside the bound; `bound` and `radius`
   read back.
9. **Export pins**: `PoissonDisk` and `PoissonDiskOptions` in the module and
   type tests; the artifact and package export counts.

### Bench (`bench/suites/create.bench.mjs`)

- `PoissonDisk.sample (≈512 points)`: the 800×600 fixture bound with a radius
  that yields ~`SIZES.M` points, whole set per iteration, instance built per
  iteration in `setup` as the Delaunay cases do (a reused one is `done`).
- `PoissonDisk.sample (≈4096 points)`: the same at `SIZES.L`, to show linear
  scaling.
- `bench:check` dry run must pass; new cases without a baseline are reported
  as new, not as regressions.

The scratch comparison against classic Bridson lives only in the session
scratchpad; its numbers are recorded under Results and nothing from it is
committed.

### Demo (`demo/create.sampling.js`)

Keep the shape of the old demo, in the current demo style (quickStart, one
player object, short comments):

- **Fill phase**: each frame calls `sample(n)` for a small `n` so the packing
  is visible as it grows; new points are drawn brighter, older ones settle.
- **Comb phase**: once `done`, every sample gets a hair (a short vector
  pointing at the center). The pointer drags hairs within a comb radius along
  its movement; hairs relax back toward their rest direction when the pointer
  is released. Hair color follows its direction, as in the original.
- Resize restarts the sampler.

Target ~80 lines, no state beyond the sampler, the hair Group, and the pointer.

### Docs and site plumbing

- Doc comments on the class and factory (TypeDoc-safe links, absolute demo
  URL), a `PoissonDiskOptions` entry in `Types.ts`, a new `Unreleased`
  CHANGELOG section, a line in `SKILL.md`'s `Create` bullet.
- `demo/index.html` link; `demoLinks` count in `scripts/check-site.mjs`;
  `expectedExports` in `scripts/check-artifacts.mjs`; export count in
  `scripts/check-package.mjs`.
- Regenerate `dist/`, `docs/`, `docs.md`, `guide.md`, `llms.txt`, and the
  editor API with `pnpm build && pnpm run docs && pnpm run build:editor`,
  committed together as the artifact commit.

## Phases

1. Plan review (below), fold findings.
2. `PoissonDisk` + types + factory, unit tests green, commit.
3. Bench cases + scratch A/B versus classic Bridson, record numbers, commit.
4. Demo + site plumbing, browser smoke, commit.
5. Full gate (`pnpm check`), artifact refresh commit.

## Review findings (pre-implementation)

An independent review of the first draft, and what changed:

- **R1 — Validate the bound, not only the radius (must-fix).** `Bound.x` can
  be `undefined` and width/height can be NaN or infinite; a NaN grid is
  zero-length, typed-array writes are dropped, and `sample()` never
  terminates. Folded: `setup` throws on non-finite bound values and treats a
  zero-area bound as done.
- **R2 — The random start can round onto the far edge (must-fix).**
  `fround(x0 + random·width)` can equal `x1`. Folded: the start goes through
  the same accept path as every candidate and is redrawn on rejection.
- **R3 — The factory returned an empty set.** Every other `Create.*` returns
  points. Folded: `Create.sampling` fills; progressive use constructs the
  class, as with `new Delaunay()`.
- **R4 — `next()` next to a `done` getter looks like a broken iterator.**
  Folded: renamed to `step()`, matching `Flock.step`.
- **R5 — `setup` must reset** so resize can restart. Folded and tested.
- **R6 — Validate `start` at `setup`**, not on the first step. Folded.
- **R7 — "Maximal" is not a property of finite k.** Folded: the hole and
  density checks are seeded regressions, and the word is gone from the
  guarantees. The default `k` moved from 4 to 8 on the measurements.
- **R8 — Acknowledge the exact-`r` regularity.** Folded into the doc comment;
  no jitter option (agreed it would be over-engineering).
- **R9 — Grid memory is unbounded.** Folded: documented formula and a
  friendly throw above 2²⁶ cells.
- **R10 — Clamp the insertion cell index.** Folded.
- **R11 — State the ε assumption.** Folded into the doc comment.
- **R12 — Test wording and accessors.** "Smaller than the radius" now says in
  both dimensions; `candidates` getter added; `bound` returns a fresh Bound.
- **R13 — Plumbing.** Confirmed complete; CHANGELOG needs a new `Unreleased`
  section; `PoissonDiskOptions` is type-only and does not change the runtime
  export count (49 with `PoissonDisk`).
- **R14 — Don't commit the Bridson A/B.** It stays in the scratchpad; the
  bench cases build a fresh instance per iteration.

## Results (2026-09-16)

Implemented as planned on `master`: `Create.sampling`, the `PoissonDisk`
class (`setup`, `step`, `sample`, `done`, `radius`, `candidates`, `bound`),
`PoissonDiskOptions`, 19 tests in `src/test/PoissonDisk.spec.ts`, two bench
cases, and the `create.sampling` demo.

### Scratch comparison, classic Bridson versus Roberts' placement

Scratchpad script, 800×600, r=8, node 24, mean of 20 runs. Density is the
count divided by the hexagonal packing bound; hole is the largest distance
from 4,000 random probes to their nearest sample, in radii.

| Variant                    | ms per set | µs per point | density | largest hole |
| -------------------------- | ---------: | -----------: | ------: | -----------: |
| Bridson, annulus r..2r, 30 |       12.3 |          2.6 |   0.545 |         1.04 |
| Roberts, 4 candidates      |        3.0 |         0.53 |   0.650 |    1.1 – 1.6 |
| Roberts, 6 candidates      |        3.7 |         0.63 |   0.665 |         1.04 |
| Roberts, 8 candidates      |        4.9 |         0.82 |   0.685 |         1.00 |
| Roberts, 12 candidates     |        7.3 |          1.2 |   0.717 |         0.98 |
| Roberts, 30 candidates     |       17.7 |          2.7 |   0.771 |         0.97 |

Roberts' placement is five times faster per point than classic Bridson at
the same candidate count and 20% denser. With four candidates the largest
hole exceeded 1.5r in some runs, so the default is eight: the largest hole
sits at about one radius (a practically maximal set) for under 1 µs per
point. Every accepted point's nearest neighbor sits at 1.001r, the exact-`r`
regularity the review noted; classic Bridson spreads nearest neighbors over
1.0–1.5r at the cost of 20% fewer points.

### Bench (`create` suite, quick run, node 24)

| Case                             | per point |
| -------------------------------- | --------: |
| PoissonDisk.sample (~512 points) |    885 ns |
| PoissonDisk.sample (~4096 pts)   |    922 ns |

Linear in the point count; the library version (float32 rounding, `Pt`
allocation, `Num.random`) costs about 10% over the scratch loop.

### Tests

The min-distance test is exact (no tolerance) thanks to rounding candidates
to float32 before the distance test. The seeded density regression measures
0.68 of hexagonal packing against a 0.6 floor, and the seeded hole check
finds no probe farther than 2r.

### Demo

`demo/create.sampling.js` (85 lines): one `reset` shared by `start` and
`resize` (the space calls `resize` before `start` during init, so a resize
handler must not assume the sampler exists), forty samples per frame in the
fill phase, showing only the samples inside five circles (diameter 0.7 of
the shorter side, centered on poles placed at random in the middle area of
the frame, inset so the circles fit). Each of those samples then grows a
short hair resting toward its circle's center, pulled by the pointer's
movement up to twelve times its length. Combed hairs stay put; each click
eases every hair toward rest through `Geom.interpolate` for 120 frames, a
fixed run so combing during the settle cannot keep it going. About 20,000 samples pack the frame; hairs are batched into twelve
shades of a soft oklch rainbow at 80% opacity by the direction they point,
and drawn in one
`lines` pass per shade, which keeps 60 fps at that density.

## Follow-up review (2026-09-16, after the maintainer's speed commit)

The maintainer's commit "sampling speed improvement" was reviewed line by
line. Everything in it holds up:

- **Rotation instead of trig per candidate.** The candidate vector is rotated
  by a precomputed `(cos, sin)` of `2π/k`, so a visit costs two trig calls
  instead of `2k`. Confirmed by the official A/B against the original
  implementation: 30% faster per point at both 512 and 4096 points.
- **Occupied-cell early exit.** Correct, since a cell holds at most one
  sample; it also closes a latent hazard in the original, where a second
  sample landing in the clamped last cell would have overwritten the grid
  entry of the first. Superseded below by center-first scanning, which
  rejects on the occupying sample's distance first anyway.
- **Bound validation.** Catches a real bug: a size that vanishes when added
  to a far larger position (`1` at `1e20`) made every candidate fail the
  inside test, and the random-start loop in `setup` never terminated. Now it
  throws.
- **Thin strips.** A full circle of candidates misses a strip thinner than
  the radius almost every time, so parents retired early and strips came
  out sparse. Candidates now take a random position across the strip and
  alternate along it; the new test pins ≥95 points in a 1000-px strip at
  r=10 for three thicknesses, both orientations, ten seeds each.
- **`sample(count)` floors the count** and treats NaN and nonpositive values
  as zero, with a test.
- **Demo.** One `Path2D` per shade and a direct `ctx.stroke`, plus
  `Math.hypot` in place of a Pt allocation per hair. Verified that
  `strokeOnly` applies the style to the context immediately, so stroking
  the path directly picks up the right color.

Further changes made in this pass:

- **Center-first neighbor scan, corners skipped.** The 5×5 window is walked
  in the order `0, -1, +1, -2, +2` on both axes, and the four corner cells
  are skipped because a sample there is always at least `radius` away (a
  point in the center cell and one in a corner cell differ by more than one
  cell on both axes, and `cell·√2 = radius`). A rejected candidate almost
  always conflicts with a sample close to it, so the scan now ends after a
  few cells. Official A/B against the maintainer's commit: 9.3% faster per
  point at 512 points (620 → 563 ns) and 8.9% at 4096 (634 → 577 ns), with
  every other `create` case unchanged.
- **A flat float32 coordinate array was tried and dropped.** Scanning
  `this[s][0]` through the Pt objects measured the same as an interleaved
  `Float32Array` once the scan was center-first, so the parallel store was
  not worth its extra state.
- **Candidate loop tidied.** The strip case and the rotation now live in one
  branch that chooses the next offset, so the rotation no longer runs on
  offsets the strip case immediately overwrites.
- **Validation and docs tightened.** The finite check covers the four edges
  (the sizes follow), the vanishing-size case has its own comment, and the
  class doc lists the method's three traits in one paragraph.

Remaining gaps, judged acceptable: a bound thinner than the radius on both
axes is handled by the strip rule for its thinner axis, which can miss a
second point that would fit across the diagonal; and with one candidate the
strip rule grows in one direction per visit, so `candidates: 1` leaves half
of a strip empty (one candidate is a poor setting in any case).
