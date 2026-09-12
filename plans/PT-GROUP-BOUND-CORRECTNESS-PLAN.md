# Pt, Group, Bound correctness plan (+ Util/Const re-sweep)

## Objective

Fix verified defects in `src/Pt.ts` (Pt, Group, Bound), following the
established tests-first sequence. This is the final core-module pass of
the review series. A fresh re-sweep of `Util.ts` (Util, Const) found
**nothing new** beyond the 2026-08-19 fixes — `getArgs`/`getPtLike`,
`split`, `zip`, `combine`, and the warn machinery re-verify clean, and
`Group.$zip`'s explicit-`undefined` default safely triggers `Mat.zip`'s
own throw-mode default (a suspected bug that verification disproved).

Prior context: Pt/Group/Bound had the Tier-1 performance pass (argument
parsing, `Bound` update paths, `boundingBox`); this pass is the
correctness complement. All findings verified in Node against `dist/` on
2026-08-21.

## Confirmed defects (verified)

1. **`Pt.equals` treats a shorter Pt as equal** —
   `Pt(1,2,3).equals([1,2])` → true: the missing dimension produces
   `NaN > threshold`, which is false, so the mismatch passes. Fix: use
   `!(diff <= threshold)` so NaN fails the comparison — any missing or
   NaN dimension returns false. (A _longer_ other-Pt still compares only
   this Pt's dimensions — existing, kept.)
2. **`Group.split` / `segments` / `lines` return plain Arrays cast `as
Group`** — `instanceof Group` is false and Group methods are missing;
   the exact bug class fixed in `Polygon.lines` during the Geom pass,
   surviving here in its original home (`Util.split` builds arrays).
   Fix: build real Groups with the indexed-assignment pattern (the
   spread-constructor is 12× slower, per the Geom pass measurement);
   `Util.split` itself stays as-is (generic utility, other callers
   expect arrays).
3. **`Group.forEachPt` on an empty group throws `TypeError`** — it reads
   `this[0][ptFn]` before its own guard can warn. Fix: return early on
   empty.
4. **`Pt.angleBetween` returns unnormalized differences** — 350° vs 10°
   yields 6.08 rad (≈348°) instead of ±0.2: it subtracts two
   `boundRadian` values, giving a range of (−2π, 2π) with wild jumps at
   the wrap. Fix: normalize the difference to [−π, π) via
   `boundRadian(diff + π) − π`. No internal or demo callers (verified by
   grep), so the change only corrects external results.
5. **`$project` / `projectScalar` docs are backwards** — the math
   projects the _argument_ onto _this_ (verified:
   `Pt(10,0).$project([3,4])` → `[3,0]`), and the internal caller
   (`Line.perpendicularFromPt`) uses it that way, but both doc comments
   say "projection of this Pt on another Pt". Doc fix only — the math is
   load-bearing and correct.

## Performance

6. **`Bound.x`/`y`/`z` allocate a Pt per access** — each getter goes
   through `topLeft`, which clones. Measured: 50.3 ns vs 8.1 ns for a
   direct element read (6×). `Create.distributeRandom` reads `bound.x`
   (and `.y`, `.z`) once per generated point. Fix: read `this[0]`
   elements directly, preserving the exact undefined-for-missing-dims
   semantics of the current getters. The `size`/`center`/`topLeft`/
   `bottomRight` getters keep cloning — that's their documented safety
   contract.
7. **`Bound.update()` recomputes size three times** — both corner
   setters call `_updateSize`, then it calls `_updateSize` again.
   Collapse to a single recompute; behavior identical.

Noted, no action: `$take`'s `|| 0` maps NaN input to 0 (harmless in
practice; changing it buys nothing).

## Second-review findings and decisions (2026-08-21)

- **New defect 8: `Group.insert` overflows the call stack on large
  inputs** — `splice.apply(this, [index, 0, ...pts])` spreads every
  inserted Pt as an argument (verified: RangeError at 200k pts). Same
  class as the fixed `Util.flatten` bug. Fix: rebuild via chunked splice
  or index-shifting loop, preserving return/`this` semantics and negative
  index handling of the underlying splice.
- Coverage corrections: `Group.segments` and `Group.lines` **are**
  benched (they delegate to `split`), so fix 2's perf is directly gated
  and a dedicated `split` case is unnecessary. The "Bound accessors"
  case reads the cloning getters only — add a `Bound.x/y/z` case to gate
  fix 6, and a `Group.insert` case to gate fix 8.
- `forEachPt` on empty: **silent no-op returning `this`** (consistent
  with empty-group arithmetic), not a warn — the warn is for a bad
  function name, which can't even be checked without a first element.
- `equals` and NaN: `Pt(NaN).equals(Pt(NaN))` will be `false` under the
  new comparison — IEEE semantics, documented in the doc comment.
- `angleBetween` normalization computes `boundRadian(diff + π) − π`
  directly on the raw difference (no need to bound each operand first);
  result in [−π, π), sign preserved as `this` minus `p`.
- `Bound.update()` after the fix no longer re-wraps `this[0]`/`this[1]`
  in fresh Pts (the old corner-setter path did, incidentally). Size and
  center results are identical; the Pt identity change is noted in the
  doc comment.
- `$project` on a zero-vector `this` yields NaN (division by zero
  magnitude) — noted in the doc alongside the direction correction;
  internal callers already guard.
- Baseline: record the full node baseline **after** adding the two bench
  cases and **before** the fixes, so the new cases carry honest pre-fix
  numbers; the A/B against HEAD remains the regression gate.

## Test and bench coverage audit

- `Pt.spec.ts` (35) and `Util.spec.ts` (20) are broad, but the defect
  areas are unpinned — the `split`-family `instanceof` blind spot is the
  same one that hid the `Polygon.lines` bug; `equals` mismatch,
  `angleBetween` wrap behavior, and empty-group `forEachPt` have no
  pins.
- Phase 1 pins (node): `equals` against shorter/longer/NaN inputs;
  `split`/`segments`/`lines` returning real Groups (and `loopBack`
  segments too); `forEachPt` on empty groups warning instead of
  throwing; `angleBetween` across the wrap (350° vs 10° → ±20°) and the
  plain case; `Bound.x/y/z` values incl. missing-dimension semantics
  after the direct-read change; a value pin for `$project` (the correct
  direction, so the doc fix has an anchor).
- Bench: the `pt` suite (Tier-1) covers Pt/Group arithmetic and Bound
  update paths; `Create.distributeRandom` in the create suite gates the
  `Bound.x` fix at the caller level. `Group.split` has no bench case —
  add one (used per-frame by `segments`-based sketches), recording
  before numbers first since fix 2 changes its allocation profile.

## Regression analysis

- `equals` (1): strictly stricter — only results that were wrongly
  `true` change. Internal callers compare same-length Pts (verified:
  `Line.crop`, `perpendicularFromPt`, spec fixtures).
- Real Groups from `split` (2): all internal/demo consumers use array
  indexing and iteration (verified: six demos, all `segments(...)` into
  map/draw) — Groups are drop-in. Perf gated by the new bench case.
- `forEachPt` (3): throw → warn + no-op, matching its own intent.
- `angleBetween` (4): behavior change for external users only, from
  broken-at-the-wrap to normalized signed angle; documented in the
  results.
- `Bound` getters (6): value-identical reads, no allocation;
  missing-dimension access still yields `undefined` exactly as before.

## Phases

Phase 1: pins above (red for 1–4) + the `Group.split` bench case with
recorded before numbers. Phase 2: fixes, full check chain,
`--against HEAD` A/B for the pt and create suites, baseline re-record,
results appended here.

## Results (2026-08-21)

All eight fixes landed in `src/Pt.ts`; 39/39 Pt-spec pins and 504/504
overall, full check chain green (typecheck, lint, docs regen, build,
artifact budgets, docs smoke, format).

Implementation notes beyond the plan:

- **Fix 8 (`Group.insert`) went through two designs.** The planned
  chunked-splice was stack-safe but ~4× _slower_ than the original on
  the common small path (`slice` + argument-spread through the Group
  species machinery). Final design: manual shift-and-copy — normalize
  the index exactly like `Array.prototype.splice` (negative counts from
  end, clamped), grow `length` once, shift the tail down, copy the new
  Pts in. Stack-safe at 200k+ and **8.5× faster than the original**
  (2851 → 338 ns for the 64-pt bench workload, micro-measured incl.
  reset).
- The loopBack pin's expected wrap value was miscomputed when first
  written (`looped[1][2]` is `[0,0]`, matching `Util.split` semantics,
  verified against HEAD); the pin was corrected, not the code.
- The new `Group.insert` bench case cannot use `fx.restorable` (it
  restores values, not length, and `insert` grows the target — the
  stale-length reset crashed the recorder). It resets by truncating to
  the four original Pt refs in `setup` instead.

A/B `--against HEAD` (1c0256b), pt + create suites, 5 rounds:

| case                    |    HEAD | working tree |  delta | verdict   |
| ----------------------- | ------: | -----------: | -----: | --------- |
| Bound.x/y/z             | 87.0 ns |       7.1 ns | −91.9% | faster    |
| Group.insert            | 42.8 ns |       5.7 ns | −86.7% | too noisy |
| Group.lines             | 28.6 ns |      15.6 ns | −45.4% | faster    |
| Group.segments          | 28.5 ns |      15.7 ns | −45.0% | faster    |
| Create.distributeRandom |  278 ns |       195 ns | −30.0% | faster    |
| Pt.angleBetween(pt)     | 85.4 ns |      75.8 ns | −11.2% | too noisy |
| Group.forEachPt('unit') | 12.1 ns |      11.1 ns |  −8.3% | faster    |

5 faster, 0 slower, 47 unchanged, 19 too noisy (all noisy deltas ≤
+5.8% and non-reproducing). `Group.segments`/`lines` got _faster_ from
returning real Groups — indexed assignment beats `Util.split`'s
push-into-plain-arrays. Node baseline re-recorded post-fix (385 cases).

Behavior changes for external users, all documented in doc comments:
`equals` now returns false for shorter/NaN operands (incl.
NaN-vs-NaN, IEEE semantics); `angleBetween` returns a normalized
signed angle in [−π, π); `split`/`segments`/`lines` return real
`Group` instances; `forEachPt` on an empty group is a silent no-op;
`Bound.update()` no longer re-wraps corner Pts in fresh instances;
`$project`/`projectScalar` docs now state the true direction
(projects the argument onto this Pt).
