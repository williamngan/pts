# Mat, Vec, and Util correctness plan

## Objective

Fix verified bugs and consistency gaps in `src/LinearAlgebra.ts` (Vec, Mat)
and `src/Util.ts`, in the established tests-first sequence. All "confirmed"
findings were reproduced numerically against `dist/` on 2026-08-19.

## Verdict on the existing implementation

The core math is sound: `Mat.multiply` (plain, transposed, elementwise),
all static matrix builders, `transform2D`, `reflectAt2DMatrix` (including
vertical and offset lines), and the Vec arithmetic/dot/cross primitives all
verify against hand-computed values. The bugs are the same two families the
Color and Geom passes kept finding: **falsy-zero coercions** (`|| 1`,
`|| 0`, `|| defaultValue` treating a legitimate 0 as "absent") and
**`Number.MIN_VALUE` misused as "most negative"** — now its third
occurrence in the codebase.

## Confirmed bugs (numerically verified)

1. **`Vec.max` returns garbage for all-negative vectors** — initialized
   with `Number.MIN_VALUE` (the smallest _positive_ double):
   `Vec.max([-5, -2])` → `{value: 5e-324, index: 0}` instead of
   `{value: -2, index: 1}`. Propagates to `Pt.maxValue()`. Fix: track with
   `-Infinity` / plain comparisons (`Vec.min` gets `Infinity` for
   symmetry). Tie behavior becomes first-occurrence (was last).
2. **`Mat.prototype.shear2D` treats an explicit 0 y-shear as `tan(1)`** —
   `Math.tan(val[1] || 1)`: `new Mat().shear2D([0.5, 0])` produces a
   matrix identical to `shear2D([0.5, 1])`, silently injecting a ~1.56
   y-shear. Fix: `|| 0` (0 is the neutral shear).
3. **`Mat.prototype.scale2D` treats an explicit scale of 0 as 1** —
   `val[0] || 1`: `scale2D([0, 2])` yields x-scale 1 instead of the
   degenerate-but-legitimate 0. Fix: `??`-style undefined checks.
4. **`Mat.zipSlice` replaces legitimate 0 values with the default** —
   `z.push(g[i][index] || defaultValue)`:
   `Mat.zipSlice([[0,1],[2,3]], 0, 99)` → `[99, 2]`. Propagates to
   `Mat.zip`, `Mat.transpose`, `Group.zipSlice`, and `Group.$zip` whenever
   a non-zero default is passed. Fix: substitute only when the value is
   `undefined`.
5. **`Util.stepper` escapes its range when `stride > max - min`** — the
   wrap applies once: `stepper(3, 0, 5)` yields 2, then **4** (≥ max).
   Fix the wrap with an anchored modulo (`c = min + ((c - min) % (max -
min))`); the existing first-call behavior (`min + stride`, not `min`)
   is kept to avoid changing every caller's sequence, and documented.

## Robustness and consistency gaps

6. `Vec.unit` on a zero vector returns a _new_ zero Pt without touching
   `a`, while every other path mutates and returns `a`. Since a zero
   vector's values are already zeros, returning `a` restores the uniform
   mutate-and-return contract with no value-level change; `Pt.unit` then
   behaves consistently too.
7. `Util.uniqueId(true)` references the bare `crypto` identifier — a
   ReferenceError (not a graceful fallback) in environments without the
   global. Use a `typeof crypto !== "undefined"` guard falling back to the
   time-based ID.
8. `Util.performance(avgFrames)` push-then-shift keeps `avgFrames − 1`
   samples at steady state — averages one fewer frame than documented.
9. `Mat.zipSlice` throws a bare string (`throw \`Index...\``) — no stack
trace; wrap in `Error`.
10. `Util.flatten` spreads through `concat.apply`, which hits the
    JS argument-count limit (~65k) and throws `RangeError` for very large
    inputs (a Delaunay-scale array of groups). Replace with a loop-based
    concat; behavior otherwise identical (still species-aware for Group).
11. Doc fixes:
    - `Const.min`/`Const.max`: state explicitly that `MIN_VALUE` is the
      smallest **positive** double, unsuitable as a "most negative"
      initializer (this footgun has now caused three real bugs:
      `Rectangle.boundingBox` historically, `Range.calc`, `Vec.max`).
    - `Vec.add`/`subtract` tolerate shorter `b` (`b[i] || 0`, which also
      silently zeroes NaN) while `multiply`/`divide` throw on length
      mismatch — document the asymmetry as intended API behavior.
    - `Util.forRange(fn, range, start > 0)` returns an index-aligned
      array with holes below `start` — document rather than change.
    - `Util.stepper` first call returns `min + stride`, not `min`.

## Verified correct (no action)

`Mat.multiply` in all three modes; `reflectAt2DMatrix` (vertical line,
diagonal through origin, offset horizontal all check out);
`scaleAt2DMatrix` / `rotateAt2DMatrix` / `shearAt2DMatrix` /
`translate2DMatrix`; `transform2D`; `Vec` arithmetic, `dot`, `cross`,
`cross2D`, `magnitude`, `map` family; `Util.getArgs` / `getPtLike` /
`split` / `zip` / `combine` / `load` / `download`.

## Performance

No dedicated perf phase: Vec ops are already tight scalar loops, `Mat` is
not on any per-frame hot path since the Geom pass hoisted matrix
construction, and the `linear-algebra` + `util` bench suites already cover
the surface. The `flatten` loop rewrite (item 10) is measured to guard
against regression but is expected to be neutral.

## Regression analysis

- **`Vec.max`/`Pt.maxValue`**: internal callers (`Rectangle.toSquare`,
  `Circle.fromRect`) apply it to size vectors, which are non-negative —
  unaffected. External callers with negative data currently receive
  garbage, so the fix is strictly corrective. Tie-index change
  (last → first occurrence) is noted in the changelog-facing doc.
- **`Mat.zipSlice`**: internal callers (`Color.maxValues`, `Range.calc`
  via `Group.zipSlice`) pass no default (throw-mode) and index in-bounds —
  unaffected.
- **`Mat.prototype.scale2D`**: one internal caller (`Image.ts:705`) with
  a real scale factor — unaffected.
- **`Mat.prototype.shear2D`, `Util.stepper`, `Util.uniqueId`,
  `Util.performance`, `Vec.unit` zero-vector**: no internal callers /
  additive behavior only.
- **`Util.flatten`**: four internal call sites in `Op.ts`; loop concat is
  behavior-identical for their input shapes (verified by existing tests).

## Phase 1 — tests first

Pin every numbered finding in `src/test/LinearAlgebra.spec.ts` and
`src/test/Util.spec.ts`: all-negative `Vec.max`/`Pt.maxValue`, shear/scale
matrices with explicit zeros (compare against the neutral matrix),
`zipSlice`/`zip` with zeros + numeric defaults, stepper large-stride bounds
property (never leaves [min, max)), zero-vector `Vec.unit` identity,
`uniqueId` shape in both modes, `flatten` on a large synthetic input.
Existing expectations that encode the bugs get corrected, as in prior
passes. Expected red inventory before phase 2.

## Phase 2 — fixes

Apply 1–11, gated by: full checks green (tests, typecheck, lint, prettier,
docs chain, artifacts budgets); `--against HEAD --suite linear-algebra
--suite util` A/B with no case slower beyond noise; baseline re-record.

## Results (2026-08-19)

All 11 findings implemented. 426/426 tests green (7 new pins were red
pre-fix; the `Util.performance` expectation encoding the off-by-one was
corrected), typecheck/lint/prettier/docs chain/artifacts all pass, dist
rebuilt with budgets updated, full baseline re-recorded.

A/B vs pre-fix HEAD (linear-algebra + util suites): **9 faster, 0 slower,
40 unchanged, 12 noisy**. Removing the falsy-zero coercion from
`Mat.zipSlice` also removed a deopt: zipSlice −72%, `Mat.zip`/`transpose`
−73%, and `Mat.multiply` (which transposes internally) −21%.
`Util.flatten` loop −56%, `Vec.max`/`min` −11/−14%, `stepper` −13%.

Deviations from the original plan, discovered during implementation:

- `Vec.max`/`min` tie behavior kept as **last occurrence** (via `>=`/`<=`)
  because an existing test pins it — less churn than the planned
  first-occurrence change.
- `Util.flatten` needed an explicit `: any` return annotation to preserve
  the public type surface (`concat.apply` had inferred `any`; the typed
  loop broke `Circle.intersectRect2D`'s declared return).
- The real `concat.apply` argument limit on this Node is between 70k and
  130k — the pinning test uses 200k elements.
