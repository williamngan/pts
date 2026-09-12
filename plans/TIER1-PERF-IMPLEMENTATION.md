# Tier-1 performance implementation plan

## Objective

Remove the argument-parsing and allocation overhead that dominates the cost of
the core `Pt` / `Group` / `Bound` API, without changing the public API or its
flexible argument shapes (numbers, array, `Pt`, `{x,y,z,w}` object). The
benchmark harness (`scripts/bench.mjs --against <ref>`) is the acceptance
instrument.

## Measured baseline (quick run, this machine)

| Case                      | Now     | Floor / evidence                  |
| ------------------------- | ------- | --------------------------------- |
| `new Pt(pt)` / `Pt.clone` | ~700 ns | raw `Float32Array` alloc is 37 ns |
| `Pt.subtract(pt)`         | ~600 ns | `Vec.subtract` itself is 16 ns    |
| `Pt.dot(pt)`              | ~350 ns | `Vec.dot` itself is 13 ns         |
| `Util.getArgs(Pt)`        | ~500 ns | `[].slice.call` on a typed array  |
| `Pt.toArray`              | ~490 ns | same generic-slice problem        |
| `Pt.make(dim)`            | ~590 ns | double allocation + wrap          |
| `Bound.fromGroup / clone` | ~6.7 µs | dozens of intermediate `Pt`s      |
| `Group.boundingBox`       | ~2.5 µs | 2 fresh `Pt`s per input point     |

Root causes, in order of blast radius:

1. **`Util.getArgs` always copies**, and its typed-array path uses
   `[].slice.call(typedArray)`, which falls off V8's array fast path into the
   generic per-element protocol with boxing. Every variadic method pays this
   even when the argument is already directly consumable by `Vec`.
2. **The `Pt` constructor funnels everything through `getArgs`**, including the
   `Float32Array`/`Pt` case that `super(arg)` handles natively as a buffer copy.
   `clone()` sits under every `$`-method, `Group.clone`, and all of `Bound`.
3. **`Group.add/subtract/multiply/divide` re-parse the arguments once per
   member** via `forEachPt("add", ...args)` — string-keyed dynamic dispatch plus
   a spread per element, and N× the getArgs cost.
4. **`Bound` recomputes size/center through allocating getters and `$`-ops**
   (each `_updateSize` allocates ~6 intermediate `Pt`s).
5. **`Geom.boundingBox`** allocates two fresh `Pt`s per input point
   (`$min`/`$max` clone internally).

## Changes

### 1. `Util.ts`

- Add `Util.getPtLike(args: any[]): PtLike` — returns `args[0]` **uncopied**
  when `args.length === 1` and the argument is an `Array` or a typed array
  (`ArrayBuffer.isView`, which matches `getArgs`' own classification); otherwise
  falls back to `Util.getArgs(args)`. Documented as read-only: callers must not
  mutate the result. A static method rather than a module export, so the pinned
  export surface in `check-artifacts` is untouched.
- Inside `getArgs`, replace the typed-array `[].slice.call(args[0])` with a
  manual index loop into a fresh array. The contract (returns a fresh plain
  `number[]`) is unchanged for the remaining callers that rely on it
  (`$concat`, `Color`, object shapes).

### 2. `Pt` constructor and `clone`

Dispatch by shape before normalizing:

- `args.length === 1`:
  - `number` → typed-array length (existing behavior, required by species
    methods like `map`/`slice`/`filter`).
  - `Array` or typed array (incl. `Pt`) → pass directly to `super(...)`;
    the `Float32Array` constructor copies natively.
  - anything else (object, `undefined`) → existing `getArgs` path.
- `args.length > 1` and `args[0]` is a number → pass the rest-array itself to
  `super(args)`; it is already a fresh dense array, `getArgs` would only copy
  it.
- `args.length === 0` → `super(2)` (two zeros) instead of allocating `[0, 0]`.

`clone()` needs no change — it is `new Pt(this)` and rides the fast path.

### 3. `Pt` variadic methods

Replace `Util.getArgs(args)` with `Util.getPtLike(args)` at the read-only call
sites: `to`, `add`, `subtract`, `multiply`, `divide`, `dot`, `$cross2D`,
`$cross`, `$min`, `$max`. The existing scalar fast path (`typeof args[0] ==
"number"`) stays first. `$concat` keeps `getArgs` (it concatenates, needs a real
array).

### 4. `Pt.make`

Build the `Pt` directly (`new Pt(dimensions)` is the length constructor) and
fill in place, instead of building a `Float32Array` and wrapping it in a second
allocation + copy.

### 5. `Pt.toArray`

Replace `[].slice.call(this)` with a manual loop into a fresh `number[]`.

### 6. `Group.add/subtract/multiply/divide`

Parse the arguments **once per call** (scalar check, then `getPtLike`), then
loop the members invoking the `Vec` op directly. `forEachPt` itself stays for
its other users (`'unit'`, user code). `Group.moveTo` builds its delta via
`new Pt(...args)` (the constructor now handles every shape efficiently).

### 7. `Bound`

- `clone()`: `new Bound(this.topLeft, this.bottomRight)` — the getters already
  return fresh `Pt`s; the current extra `.clone()` on each is a third copy.
- `_updateSize` / `_updateCenter`: scalar in-place loops writing into the
  existing `_size` / `_center` buffers, reading `this[0]` / `this[1]` directly.
  Reallocate the buffers only when dimensionality changes. Public getters keep
  returning fresh `Pt`s, so no observable change.
- The setter-driven paths (`_updatePosFromTop`, etc.) are left structurally
  as-is; they ride the now-cheap constructor and `$`-ops.

### 8. `Geom.boundingBox`

Keep the two running `Pt`s but update them **in place** per point
(`minPt[i] = Math.min(minPt[i], p[i])` over the shared dimensions) instead of
cloning twice per point via `$min`/`$max`. Dimension-mismatch semantics are
identical to `$min`/`$max` (iterate `min(lenA, lenB)`, keep the running Pt's
extra dimensions).

## Semantics risks and why they are acceptable

- **Aliasing.** Today `pt.add(pt)` hands `Vec` a private snapshot; with
  `getPtLike` the same buffer is on both sides. For `add/subtract/multiply/
divide/dot/to`, each index is read before it is written, so same-object
  aliasing produces identical results. Pin with tests.
- **Group member aliasing** (`group.add(group[0])`): current behavior re-parses
  per member, taking a _fresh snapshot after each mutation_ — so member 0
  doubles first and later members add the doubled value. Passing the raw
  reference once preserves exactly that (mutations remain visible mid-loop).
  Snapshotting once up front would _change_ behavior. Pin with a test.
- **Species constructor.** `Float32Array.prototype.map/slice/filter` construct
  the result via `new Pt(length)`; the single-number-is-length branch is
  preserved untouched.
- **Exotic typed arrays.** `new Pt(uint8Array)` previously went through
  `getArgs` (values copied, coerced); `super(uint8Array)` performs the same
  per-element conversion. `DataView` degenerates to an empty/no-op result on
  both the old and new paths.
- **Precision.** `getArgs` widened f32 values to f64 before the op; reading the
  f32 source directly widens identically at access time. Results are
  bit-identical.
- **`Color extends Pt`** has its own constructor and `getArgs` call — verify it
  still constructs correctly through the new `super` dispatch before touching
  anything, and leave `Color.ts` itself unchanged this pass.

## Tests to add

- Constructor equivalence across all shapes, including `new Pt(float32Array)`,
  `new Pt(pt)`, `new Pt(uint8Array)`, and length-constructor semantics.
- Self-aliasing: `p.add(p)`, `p.subtract(p)`, `p.multiply(p)`, `p.dot(p)`.
- Group member aliasing (`group.add(group[0])`) pinning current order-dependent
  semantics.
- `Pt.toArray` returns a plain `Array`.
- `Bound` size/center/width invariants after in-place rewrite, including
  `topLeft`/`size` setters and `clone` independence (mutating the clone must
  not affect the original).
- `Geom.boundingBox` with mixed-dimension points.

## Validation

1. `pnpm test` — full unit suite.
2. `pnpm typecheck`, `pnpm lint`, `pnpm format:check`.
3. `pnpm bench:check` — every bench case still runs and feeds its sink.
4. `node --expose-gc scripts/bench.mjs --against HEAD` — the trustworthy A/B;
   gate is zero `slower` verdicts, and the wins should land in `pt`,
   `linear-algebra`, `util`, `op`, and the scenario suite.
5. Full quick table for the before/after report.

## Out of scope (follow-up tiers)

`Op.ts` hand-optimization (re-measure first — most of its cost is inherited
from these primitives), physics spatial hashing, Delaunay replacement,
rendering-side work, WASM/GPU experiments.

---

## Review findings (second pass)

Re-reading the plan against the code surfaced seven points; each is folded into
the implementation.

1. **`getPtLike` should short-circuit the multi-number path too.** `getArgs`'
   numbers path is an identity copy of the rest array, which is already fresh
   and private per call. Returning `args` itself when `args[0]` is a number is
   behaviorally identical (including for mixed junk like `add(1, [2,3])`, which
   produced NaN before and still does) and also covers `to(5)` / `dot(1,2)`
   call sites that have no scalar pre-check.
2. **Empty-group arithmetic currently throws.** `Group.add()` on an empty group
   hits `this[0][ptFn]` on `undefined` inside `forEachPt` — a `TypeError`. The
   direct loops make it a benign no-op. This is a deliberate, strictly-more-
   forgiving behavior change; noted rather than replicated.
3. **`Bound._updateSize` dimension semantics are subtler than "min length".**
   `bottomRight.$subtract(topLeft)` clones `this[1]`, so size dims follow
   `this[1].length` with `|| 0` fallback for missing/NaN `this[0]` values;
   `_updateCenter` follows `_size.length` the same way; a degenerate one-Pt
   bound yields empty size/center. The in-place loops replicate exactly this,
   including the `|| 0`.
4. **Degenerate `Bound.clone` relies on `new Pt(undefined)` → empty Pt.** The
   new constructor's fallback (`getArgs([undefined])` → `[]`) preserves it.
5. **`Color` is unaffected**: its constructor forwards straight to `super`, so
   it rides the new dispatch; `Color.from`'s own `getArgs` call benefits from
   the typed-array copy fix. `Color.ts` stays untouched.
6. **`forEachPt` reassignment is a no-op for arithmetic.** It assigns
   `this[i] = this[i].add(...)`, and `Pt.add` returns `this` — so replacing it
   with direct `Vec` loops is observably identical for add/subtract/multiply/
   divide.
7. **Validation should include the browser smoke test** (`pnpm test:browser`) —
   `CanvasSpace` leans on `Bound` for resize/pointer math, which unit tests
   exercise less.

---

## Results

Measured with `scripts/bench.mjs --against HEAD` (5 rounds, full timing, each
build in its own process): **106 faster, 1 slower, 121 unchanged, 106 too
noisy** — and every "too noisy" entry with a large delta moved in the fast
direction.

| Case                          |  Before |   After |  Delta |
| ----------------------------- | ------: | ------: | -----: |
| `Group.boundingBox`           | 2.41 µs | 20.5 ns | −99.1% |
| `Group.add(pt)`               |  515 ns | 12.1 ns | −97.6% |
| `Pt.subtract(pt)`             |  532 ns | 16.8 ns | −96.8% |
| `Pt.dot(pt)`                  |  359 ns | 17.9 ns | −95.0% |
| `Pt.clone` / `new Pt(pt)`     |  654 ns | 39.2 ns | −94.0% |
| `Bound.fromGroup`             | 5.53 µs |  380 ns | −93.1% |
| `Bound.clone`                 | 5.89 µs |  488 ns | −91.7% |
| particle field frame scenario |  195 µs | 13.9 µs | −92.9% |
| delaunay + voronoi scenario   |  786 µs | 73.5 µs | −90.6% |
| nearest-point query scenario  | 78.9 µs | 4.96 µs | −93.7% |
| polygon collision sweep       | 18.7 µs | 5.02 µs | −73.1% |

Allocation (deterministic, vs the recorded baseline): the eight scenario
workloads dropped between −18% and −51% bytes per item; `Geom.boundingBox`
−97%, `Bound.fromGroup` −78%, `Group.moveTo` −99%. A tail of tiny cases on
untouched code report byte _increases_ of ≤ a few hundred bytes; the pure-JS
calibration case itself shows 0 → 2 B, marking these as optimizer-decision
artifacts of cross-session comparison rather than real costs — their timings
are unchanged or faster.

### The one regression, and a fix found by the gate

The first full A/B failed with 4 regressions. Two were real and caused by the
first version of the `getArgs` copy-loop change: replacing `[].slice.call`
with a push loop fixed typed arrays but knocked _plain_ arrays off the native
`slice` fast path (+322%), and the larger function body appears to have crossed
an inlining threshold that also slowed the object path (+127%). Moving the copy
into a small `Util.toNumericArray` helper — native `slice()` for real arrays, a
manual loop for typed arrays — fixed both and left every `getArgs` shape faster
than or equal to HEAD.

The one remaining `slower` verdict is `Pt.op then call` at 8.2 → 9.0 ns
(+0.8 ns). The case measures closure creation on an untouched method; the
allocation profile shows V8 now actually allocates the closure it previously
escape-eliminated. This is a code-layout/optimizer-budget artifact with no
actionable fix, accepted.
