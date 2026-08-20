# Create and Physics correctness plan

## Objective

Fix verified bugs and close coverage gaps in `src/Create.ts` (Create,
Noise, Delaunay) and `src/Physics.ts` (World, Particle, Body), following
the established tests-first sequence. Confirmed findings were reproduced
numerically against `dist/` on 2026-08-20.

Prior passes already validated the two big rewrites in these files: the
Delaunator-based triangulation (empty-circumcircle property tests, −91%)
and the substepped XPBD physics solver. Both cores verify clean in this
review; the findings are at the edges.

## Confirmed bugs — Noise (verified numerically)

1. **`Create.noisePts` grid indexing is inconsistent** — for a rows ×
   columns grid it computes the row as `floor(i / rows)` but the column as
   `i % columns`; these only agree when rows == columns. Verified with a
   2×3 grid: half the indices get the wrong row. Fix: row =
   `floor(i / columns)` (row-major, `columns` points per row), matching
   the column formula and the documented intent.
2. **`Noise.seed` never seeds index 255** — the loop runs `i < 255`, so
   `perm[255]` and `perm[511]` keep the base-table value for every seed
   (verified: identical across seeds while `perm[254]` differs). Fix:
   `i < 256`.
3. **Perlin noise repeats exactly every 12 integer units** — the gradient
   is chosen by `(i + perm[j]) % 12`, so for a fixed y-cell the gradient
   pattern is periodic in the x-cell with period 12. Verified: noise at
   x-cells 3, 15, 27, 39 (same fractional part) returns identical values.
   Standard Perlin hashes through the permutation table first:
   `perm[(i + perm[j]) & 255] % 12`. The same fix set covers two adjacent
   defects: the `% 255` cell-index bias (index 255 aliases 0; standard is
   `& 255`) and the negative-coordinate discontinuity (`Math.max(0,
floor)` clamps the cell; standard wraps with a floor-based modulo).
4. **`Create.distributeLinear` returns 2 points for count 0 or 1** — the
   endpoint unshift/push happens regardless of count. Clamp to the
   requested count (0 → empty, 1 → start point).

**Visual-change consequence, and how it's gated**: fixes 2–3 change every
noise output — sketches using `noisePts`/`noise2D` will render differently
(better: no 12-cell repetition, all 256 permutation entries live). Unlike
canvas rendering, noise is pure computation, so the new PNG visual harness
_can_ rasterize it: phase 1 adds a `Noise.visual.spec.ts` that plots noise
fields (positive and negative coordinate ranges, multiple seeds) and
records baselines before the fix; the fix then re-records them as an
explicit, reviewable pixel diff — the repetition should be visibly gone in
the before/after.

## Findings — Delaunay (no bugs)

- The triangulation core matches Delaunator's algorithm; property tests
  from the rewrite pass hold. No action.
- Doc note: `voronoi()` cells and `delaunay(false)` shapes share `Pt`
  references with the cached mesh (cells push `circle[0]` by reference,
  and the unclipped fast path returns shared vertices) — mutating
  returned groups mutates the cache. Document rather than clone (cloning
  would cost the −91% win back on large meshes).
- The legacy protected helpers (`_superTriangle`, `_circum`, `_dedupe`)
  are unused by the new core and kept for subclass compatibility —
  document that status in their comments.

## Findings — Physics (minor; the rewrite is solid)

5. **`Body.linkAll` creates duplicate and self links for odd sizes**
   (second review, verified per size): 2 points → 3 links with 2
   duplicates; 3 points → 1 duplicate edge; 5 points → 2 duplicates
   _plus 2 self-links_ (the cross-link branch computes `n2 = i % len`,
   which equals `i` near the wrap, storing distance-0 constraints that
   `solveEdges` then skips every pass). Even sizes are clean. A
   duplicated constraint is solved twice per pass, making that edge
   effectively stiffer than its neighbors. Fix: track linked pairs and
   skip self-pairs and duplicates.
6. **Dead code**: `Body.init` accumulates a centroid into `c` and never
   uses it; `processParticle` carries a commented-out response block.
   Remove both.
7. **Doc fixes**: `edgeConstraint`'s `@param p2` says "particle 1";
   `Particle.hit` divides the impulse by √mass — document that scaling
   (it is long-standing intended behavior, not a bug); in
   `processParticle`, `hit.vertex` is the circle's center Pt (never a
   Particle), so `(hit.vertex as Particle).mass` always falls through to
   `b2.mass` — simplify to `b2.mass || 1` and drop the misleading cast.

Reviewed and verified clean: the substep loop and per-substep contact
resolution, friction compounding (`friction^(1/n)`), the counting-sort
spatial hash (bucket spans, duplicate-key dedupe via the visited list,
pair de-duplication with `j > i`), `_boundParticle` reflection,
`solveEdges`' XPBD compliance mapping (pass-count-independent stiffness,
lock handling, zero-length guard), the AABB broad phase with scratch-buffer
reuse, `Particle.collide`'s coincident-point guard, and the lock/unlock
`previous` reset semantics.

## Test coverage audit

- `Create.spec.ts` (18 tests): every public function is touched, but the
  bug areas prove the pins are shallow where it matters: `noisePts`'s
  grid indexing, `seed`'s full-table coverage, and noise periodicity are
  unpinned; `distributeLinear` has one incidental reference. Phase 1 adds
  pins for each fix plus: seed determinism (same seed → same sequence),
  cross-seed variation at every index, and a no-12-periodicity check.
- `Physics.spec.ts` (28 tests): all public methods and accessors covered,
  including substeps/maxTimeStep clamping. Additions: a triangle
  `linkAll` link-count pin (currently would encode the duplicate), and a
  determinism pin for a small body world (same inputs → same state after
  N updates) to guard future solver changes.
- Visual: new `Noise.visual.spec.ts` as described above.

## Bench coverage audit

- `create.bench.mjs`: complete — all `Create` statics, `Noise.noise2D` /
  `seed`, `Create.delaunay + triangulate`, `Delaunay.voronoi` /
  `neighborPts` / `neighbors`. The scenarios suite adds the composed
  delaunay+voronoi case. No gaps.
- `physics.bench.mjs`: strong on particles (`World.update` ×2 variants)
  and on Body micro-ops, but **no composed body-world update case** — the
  full body loop (integrate + AABB broad phase + SAT + solveEdges over
  substeps) is never measured end-to-end. Add `World.update (64 bodies)`
  and a mixed bodies+particles case.

## Performance

Both files were optimized in their rewrite passes; one worthwhile item:

8. **`Noise.noise2D` allocates four 3-element arrays per sample** and
   dispatches through `Vec.dot`. Inlining the 2D dot products (the z term
   is always 0) removes all allocation from the per-sample path — this
   lands together with the hash fix since it rewrites the same lines, and
   the existing `Noise.noise2D` bench case gates it.
9. **Every `Noise` instance copies the 512-entry permutation table** in
   its constructor, and `Create.noisePts` seeds each point with the
   _same_ seed — n points allocate n identical tables. Fix: instances
   share the base table until seeded (copy-on-seed), and `noisePts`
   computes one seeded table and assigns it to all its points. Gated by
   the `Create.noisePts` and `Noise.seed` bench cases.

Second-review notes: the only demo passing a grid to `noisePts` uses a
square 20×20 (`demo/create.noisePts.js`), so the row-divisor fix changes
no existing demo; the `test/visual` README's "specs live in
`src/test/visual/`" line is stale (they live in `test/visual/`) and gets
corrected alongside the new spec; `& 255` handles negative cells via
two's complement, giving seamless negative-coordinate noise with the
standard hash.

## Regression analysis

- `noisePts` grid fix: only callers passing both `rows` and `columns`
  with unequal values are affected — currently they get scrambled rows,
  so the fix is strictly corrective. Internal callers: none.
- Noise hash/seed fixes: visual change by design, gated by the new visual
  baselines; no internal callers beyond `noisePts`.
- `distributeLinear` clamp: count ≥ 2 behavior unchanged.
- `linkAll` dedupe: triangle bodies become slightly less stiff on one
  edge (now uniform); squares and larger are unchanged. The physics
  determinism pin is recorded _after_ this fix.
- Physics doc/dead-code items: no behavior change.

## Phases

Phase 1: pins + visual baselines (pre-fix) + the two bench cases; red
inventory for fixes 1–5. Phase 2: fixes, visual baselines re-recorded and
diffed, full check chain, `--against HEAD --suite create --suite physics`
A/B (expect: noise2D faster from item 8, physics unchanged), baseline
re-record.

## Results (2026-08-20)

All findings implemented. 481/481 tests (5 new pins red pre-fix; 2 legacy
pins encoding bugs corrected: exact pre-fix noise values, the 4-link
triangle). New coverage: 7 unit pins, a 4-image noise visual spec with
recorded baselines, and 3 bench cases (`World.update` 64-bodies and mixed,
`Noise.seed` repeated-seed path) — 383 node cases total. Full check chain
green; node baseline re-recorded.

Noise quality, quantified: lag-12 autocorrelation of per-cell samples fell
from **0.95** (near-perfect repetition) to **0.009** (properly
uncorrelated). Visual baselines re-recorded post-fix show the banding gone.

Final A/B vs pre-fix HEAD (create + physics):

| Case                        |    Delta | Note                              |
| --------------------------- | -------: | --------------------------------- |
| Noise.seed (repeated seed)  |     −92% | memoized table, the noisePts path |
| Create.noisePts             |     −65% | shared seeded table               |
| Noise.noise2D               |     −50% | scalar inline, zero alloc         |
| Body.processEdges           |     −17% | fewer duplicate links             |
| Body.linksToLines           |     −16% | fewer duplicate links             |
| World.update (all variants) |    noise | solver unchanged                  |
| Body.fromGroup              | +4.6% ns | dedupe scan, within noise         |
| Noise.seed (unique seeds)   |     +59% | accepted, see below               |

The one accepted cost: seeding with a _unique_ value now allocates a fresh
512-entry table (~800 ns) instead of mutating in place — the price of
copy-on-seed sharing, which is what removed the 512-entry copy from every
Noise constructor and made the same-seed path (how `noisePts` and real
sketches use it) 13× faster. Both patterns are now benched separately.

Implementation notes:

- A first dedupe attempt with string-keyed Sets put +37% on
  `Body.fromGroup`; numeric keys cut it to +12%; a linear scan of the
  small existing link list (allocation-free) landed at +4.6% noise.
- `Uint8Array(512)` measured 2× slower than `Array(512)` for the seeded
  table build — typed-array store coercion dominates at this size.
- Test-authoring reminder: a "corrupted memo" chase ended at a stale
  constant in the test itself (seed 0.5 left behind after an edit).
  Also, seed 0.5 maps to s=32768 with a zero low byte, which legitimately
  leaves odd permutation indices unchanged — seed pins need seeds with
  nonzero low bytes.
