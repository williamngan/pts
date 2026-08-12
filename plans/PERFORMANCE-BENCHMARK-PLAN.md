# Pts performance benchmarking plan

## Objective

Establish a reproducible, statistically honest performance baseline for every
performance-relevant function in Pts, and ship the tooling that makes a
subsequent optimization campaign _verifiable_ rather than anecdotal.

A baseline is only useful if a later run can be trusted to mean the same thing.
That requirement — not raw benchmark count — drives every decision below.

## Codebase findings that shape the design

A review of all 21 runtime source files surfaced five facts that a naive
benchmark suite would get wrong.

1. **Pts is allocation-heavy.** `Pt extends Float32Array` and
   `Group extends Array<Pt>`. Nearly every operation returns a fresh `Pt` or
   `Group` (`Pt.unit`, `Pt.abs`, `Geom.interpolate`, `Line.intersectLine2D`,
   `Curve.catmullRom`, …). Wall-clock alone therefore hides half the story:
   allocation rate and GC pressure are first-class metrics, not a footnote.

2. **Pts is mutation-heavy.** `Vec.add/subtract/multiply/divide` mutate their
   first argument. `Pt.add/subtract/multiply/divide/scale/rotate2D`,
   `Group.moveBy/scale/rotate2D/shear2D/reflect2D`,
   `Geom.scale/rotate2D/shear2D/reflect2D`, `Particle.verlet`, `Body.processEdges`
   and `World.update` all mutate in place. A benchmark that calls these in a hot
   loop drifts its own fixture into unbounded or degenerate values, so fixture
   state must be restored between iterations — **outside** the timed region.

3. **Argument parsing is a shared hot path.** `Util.getArgs` runs on every
   variadic `Pt` constructor and every variadic op, and branches on
   number/array/object shapes. It is a prime optimization target and must be
   benchmarked directly as well as through its callers.

4. **The rendering forms are per-frame hot but need a real browser.**
   `CanvasForm`, `SVGForm` and `HTMLForm` dominate frame cost in real sketches
   (`SVGForm` in particular churns DOM elements), and cannot be measured in Node.

5. **`_module.ts` exports 45 symbols** and `scripts/check-artifacts.mjs` pins
   that list exactly. Benchmarks must not add to or perturb the public surface,
   and must not leak into the published tarball.

## Tooling decision

### Rejected: `vitest bench`

The obvious choice — the repo already runs Vitest 4.1.10 and ships tinybench
2.9.0 transitively — is not usable here. Vitest's benchmark runner constructs
its tinybench task as:

```js
const task = new Task(benchmarkInstance, benchmark.name, benchmarkFn);
```

(`node_modules/vitest/dist/chunks/test.DNmyFkvJ.js`). The fourth `Task`
parameter — tinybench's `FnOptions`, which carries
`beforeAll`/`beforeEach`/`afterEach`/`afterAll` — is never passed. Per-benchmark
hooks are silently dropped.

This was confirmed with a probe benchmark that reset a `Pt` in `beforeEach`. The
result:

```
"name": "Pt.add", "rank": 1, "rme": 0, "samples": []
```

No timing, no error, no non-zero exit — and the summary printed `NaNx faster`.
Given finding #2, most of this library's surface needs those hooks, and the
failure mode is a benchmark that _silently measures nothing_. That is
disqualifying for something whose entire job is to be trusted later.

Three secondary problems compound it: `--compare` is informational and cannot
gate; benchmark files run in parallel workers by default, so tasks contend for
CPU; and it measures Vite-transformed source rather than the artifact users
actually install.

### Chosen: a direct tinybench harness

`scripts/bench.mjs` driving tinybench directly, in the same plain-`.mjs` style as
the repo's existing `browser-smoke.mjs` and `check-artifacts.mjs`. This buys:

- Real `beforeEach`/`beforeAll` hooks, which tinybench runs **outside** the timed
  region (`node_modules/tinybench/dist/index.js`: the clock is read after
  `beforeEach` and before `afterEach`), so fixture resets are free.
- `throws: true`, so a broken benchmark fails loudly instead of reporting zero.
- Full control of warmup, minimum time, and minimum sample count.
- Sequential, single-process execution.
- The ability to load two builds of Pts into one process, which is what makes
  git-ref A/B possible.

### Measurement target: the built artifact

Benchmarks import `dist/index.mjs` (and load `dist/pts.js` in the browser), not
`src/`. That is what consumers get, it removes the dev-transform from the
measurement, and it makes A/B trivial because two builds are just two file
paths. `scripts/bench.mjs` runs `tsdown` first (~1.7s) unless `--no-build`.

## Layout

```
bench/
  lib/
    random.mjs      seeded PRNG (mulberry32), independent of Pts
    fixtures.mjs    deterministic fixture builders + workload sizes
    suite.mjs       suite/case definition DSL + registry
    runner.mjs      tinybench driver, env fingerprint, JSON emitter
    report.mjs      console table rendering
    compare.mjs     statistics, classification, regression gating
    memory.mjs      allocation + retained-heap profiling
  suites/
    pt.bench.mjs  linear-algebra.bench.mjs  num.bench.mjs  op.bench.mjs
    create.bench.mjs  color.bench.mjs  physics.bench.mjs  util.bench.mjs
    typography.bench.mjs  scenarios.bench.mjs
  browser/
    canvas.bench.mjs  svg.bench.mjs  dom.bench.mjs  image.bench.mjs
    space.bench.mjs
  baselines/
    <fingerprint>.json
scripts/
  bench.mjs         single CLI entry
```

`bench/` sits at the repo root rather than under `src/`, which keeps it out of
the coverage `include` glob, out of `tsconfig`'s `rootDir`, and out of the
`files` allowlist without any config gymnastics.

## Noise control

| Concern             | Measure                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------- |
| Input variation     | All fixtures come from a seeded mulberry32 in `bench/lib/random.mjs`, never from Pts' own RNG |
| Workload variation  | Named fixed sizes: `XS=8`, `S=64`, `M=512`, `L=4096`                                          |
| Fixture drift       | `beforeEach` restores mutated fixtures; tinybench runs it untimed                             |
| Dead-code removal   | Every case feeds a numeric result into a module-level sink, asserted non-zero after the run   |
| Timer resolution    | Every case is _batched_ over a workload — see the review section below                        |
| CPU contention      | Single process, sequential tasks, no parallel workers                                         |
| Cross-task GC       | Forced `global.gc()` between tasks when `--expose-gc` is available; recorded in the output    |
| Cross-machine noise | Environment fingerprint + a fixed calibration task recorded in every run                      |
| Ambient load        | Load average sampled before and after; a warning is emitted when it is high                   |

The **calibration task** is a fixed pure-JS workload with no Pts dependency. Its
result gives a machine speed factor, so a baseline recorded elsewhere can be
recognized as incomparable instead of silently believed.

The **fingerprint** records Node version, arch, CPU model, core count, OS
release, and a hash of `dist/index.mjs`. Baselines are stored per fingerprint;
`compare` refuses a mismatched pair unless `--force` is passed.

## Metrics

Per case: `hz`, `mean`, `median`, `p99`, `rme`, `sampleCount`, plus derived
per-item cost (`period / batchSize`). The allocation pass adds bytes-per-op and
retained-heap delta, which are deterministic and make excellent regression
gates precisely because they do not depend on timing.

## Gating statistics

Comparison is on **median**, which is far less sensitive to scheduler outliers
than mean. Each case is classified:

- **too-noisy** — either side has `rme > 5%`; reported, never gated.
- **unchanged** — the delta does not exceed both the relative threshold and the
  combined margin of error.
- **faster** / **slower** — the delta clears both bars.

Default thresholds: 8% for micro cases, 5% for scenarios. `compare` exits
non-zero on any `slower`. This two-bar rule is what stops a gate from crying
wolf on a noisy laptop while still catching real regressions.

## A/B against a git ref

`scripts/bench.mjs --against <ref>` builds `<ref>` in a temporary git worktree,
then loads both `dist/index.mjs` files into a single process and runs the suites
against each, alternating rounds. Same machine, same process, same thermal
state, interleaved — this is the measurement to trust when judging an
optimization. The committed baselines remain the record of absolute progress
over time.

## Suite inventory

| Suite            | Coverage                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pt`             | `Pt` construction across all arg shapes, `clone`, arithmetic (scalar/array/Pt), `magnitude`, `unit`, `dot`, `cross`, `angle`, `rotate2D`, `to`, `op`/`ops`; `Group` construction, `fromArray`, `fromPtArray`, `clone`, `boundingBox`, `centroid`, `interpolate`, `segments`, bulk transforms; `Bound`                                                                                                                                                                                |
| `linear-algebra` | `Vec` ops on plain arrays vs `Pt`, `dot`, `cross`, `unit`, `min`/`max`/`sum`, `map`; `Mat.multiply` (elementwise, transposed, matrix), `transpose`, `zip`, `zipSlice`, `transform2D`, and the 2D matrix builders                                                                                                                                                                                                                                                                     |
| `num`            | `Num.lerp/clamp/boundValue/within/mapToRange/cycle/sum/average`, seeded `random`; `Geom.boundingBox/centroid/interpolate/perpendicular/withinBound/sortEdges/scale/rotate2D/shear2D/reflect2D`, cos/sin tables; all `Shaping` curves; `Range`                                                                                                                                                                                                                                        |
| `op`             | `Line` intersections (ray, line, polygon, lines2D, grid, rect), `subpoints`, `crop`, `marker`; `Rectangle` construction/corners/sides/quadrants/intersection; `Circle` intersections and containment; `Triangle` circumcircle/incircle/medial/adjacent; `Polygon` `convexHull`, `area`, `perimeter`, `nearestPt`, `projectAxis`, `hasIntersectPoint/Circle/Polygon` (SAT), `intersectPolygon2D`, `network`; `Curve` `catmullRom`, `cardinal`, `bezier`, `bspline` across step counts |
| `create`         | `distributeRandom`, `distributeLinear`, `gridPts`, `gridCells`, `radialPts`, `noisePts` and `Noise.step`, `delaunay`, `voronoi`, `mesh`, `neighborPts`                                                                                                                                                                                                                                                                                                                               |
| `color`          | Every conversion pair (RGB/HSL/HSB/LAB/LCH/LUV/XYZ), `fromHex`, `toString` in each format, `normalize`, `toMode` with and without conversion                                                                                                                                                                                                                                                                                                                                         |
| `physics`        | `World.update` with N particles, with and without particle collisions; `Particle.verlet`, `collide`; `Body.fromGroup`, `processEdges`, `processBody`, `processParticle`; `edgeConstraint`, `boundConstraint`                                                                                                                                                                                                                                                                         |
| `util`           | `getArgs` across every accepted shape, `split`, `flatten`, `combine`, `zip`, `forRange`, `uniqueId`; `uheprng` seed and draw                                                                                                                                                                                                                                                                                                                                                         |
| `typography`     | `textWidthEstimator`, `truncate`, `fontSizeToBox`, `fontSizeToThreshold`                                                                                                                                                                                                                                                                                                                                                                                                             |
| `scenarios`      | Frame-shaped macro workloads — see below                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| browser suites   | `CanvasForm` primitives and batched draws against a real 2D context; `SVGForm` element churn; `HTMLForm`; `Img` scaling/pixel ops; `Space.playItems` dispatch and pointer-event translation                                                                                                                                                                                                                                                                                          |

### Scenario benchmarks

Micro numbers guide optimization; scenario numbers say whether users benefit.
Each mirrors a realistic per-frame workload and is more stable than any
nanobenchmark:

- 1,000-particle Verlet world with bound constraints, one frame.
- Delaunay + Voronoi over 500 seeded points.
- Catmull-Rom smoothing of a 200-point path at 20 steps.
- SAT collision sweep across a grid of 100 polygons.
- Color gradient sweep: 2,000 LCH→RGB conversions with string output.

## Phases

1. Harness core (`random`, `fixtures`, `suite`, `runner`, `report`) plus the
   `pt` suite, validated end to end.
2. Remaining Node suites.
3. Scenario suites.
4. Allocation/GC pass.
5. Browser suites via Playwright.
6. `compare`, gating, and `--against <ref>`.
7. Repo integration and baseline recording.

## Non-goals

- Gating performance in the standard CI job. GitHub's shared runners are too
  noisy for a trustworthy timing gate; CI runs the harness only as a smoke check
  with a tiny time budget, to prove it still works.
- Optimizing anything. This plan establishes the measurement; changes come after.
- Changing library behavior or the public API surface.

---

## Second review pass: gaps found

Re-reading the plan above surfaced eight problems. Each is folded into the
design.

### 1. Timer resolution invalidates single-call benchmarks — the big one

tinybench times **each individual iteration** with `performance.now()`. A call
like `Pt.add` takes on the order of tens of nanoseconds, while reading the clock
twice costs a comparable amount. Timing one such call measures the clock, not
the code, and no amount of sampling fixes a biased estimator.

**Resolution:** every case is _batched_ — the timed function performs the
operation across a whole workload (typically `M = 512` items), never once. The
harness records `batchSize` per case and derives per-item cost from
`period / batchSize`. This also amortizes the `beforeEach` reset and, conveniently,
matches how Pts is actually used: per frame, over many points. This is now a
core principle of the suite design, not an afterthought.

### 2. `throws: true` disables tinybench's event emission

The tinybench docs note events do not fire when `throws` is set. The runner must
therefore read results from the value returned by `bench.run()` rather than
subscribing to `cycle`/`complete`, and wrap each task so a failure names the case
that broke.

### 3. The sink can itself be optimized away

Accumulating into a variable that is never read is removable, and reading only
`.length` off a returned `Group` may not keep the computation alive. **Resolution:**
the sink accumulates a numeric component of the actual result (e.g. `p[0]`), is
exported, and is asserted to be finite and non-zero once the run ends. A case
whose sink never moves is a bug in the case.

### 4. Baseline JSON churn

Full tinybench results with raw samples produce enormous, unreviewable diffs on
every re-record. **Resolution:** drop `samples`, round to a fixed precision, and
emit with stable key ordering, one file per fingerprint.

### 5. Repo integration is not automatic

Three existing globs must be extended or the new directory silently escapes the
project's own quality gates:

- `lint` covers `src scripts test/integrations *.config.*` — add `bench`.
- `format` / `format:check` enumerate globs explicitly — add `bench/**/*.mjs`.
- `.gitignore` needs the temporary A/B worktree and scratch output directories.

`pnpm check:package` performs an exact packed-file audit, so it must be re-run to
confirm `bench/` stays out of the tarball.

### 6. Loading tinybench into the browser page

The Node harness imports tinybench from `node_modules`; a Playwright page cannot.
Adding a bundling step for the browser suites would be disproportionate.
**Resolution:** use `page.route` to fulfill requests for the harness, tinybench,
and `dist/pts.js` directly from disk. This is dependency-free and consistent with
the existing `browser-smoke.mjs` approach of driving a real page.

### 7. Stateful fixtures need per-iteration reconstruction, not just reset

Some targets carry internal state that a shallow reset will not clear:
`Delaunay` accumulates into `this._mesh`, `World` holds particle and body arrays,
and `Body` caches constraint lists. Copying values back is not enough — these
need a fresh instance per iteration, built in `beforeEach`. Since that hook is
untimed the cost is acceptable, but the case must be written to construct rather
than to reuse.

### 8. Physics needs a fixed timestep

`World.update(ms)` integrates with the elapsed time it is handed. Passing real
elapsed time would make the benchmark's own workload depend on how fast the
machine is — a feedback loop that corrupts the measurement. **Resolution:** all
physics cases pass a constant `dt` (16ms).

### Smaller points folded in

- Full run is roughly 200 cases at ~0.6s each, about two minutes; `--quick`
  shortens time-per-case for iteration during development.
- Scenario fixtures are built in `beforeAll` and only deep-copied in `beforeEach`,
  so setup does not dominate.
- The runner records whether `global.gc` was actually available, since a baseline
  taken without it is not comparable to one taken with it.

---

## What implementation changed

Two of the plan's design decisions turned out to be wrong, and both were caught
by benchmarking two byte-identical builds against each other. That check — "does
this harness report no change when nothing changed?" — is the one that matters,
because a perf gate that fires on noise gets ignored within a week.

### `rme` badly understates run-to-run variance

The plan gated on tinybench's reported margin of error. That number describes
the dispersion of samples _within a single run_; it says nothing about JIT state,
inline-cache shape, code layout or GC timing, all of which differ between runs.

A/B-ing two identical builds with the planned single-round design produced **ten
"significant" changes across 56 cases**, including one case at **+271% with a
reported `rme` under 1%**.

**Resolution:** measure in several independent rounds (`--rounds`, default 5 for
A/B). The point estimate is the median across rounds and the reported error is
the observed half-range across rounds — noise measured rather than assumed. On
top of that, a **paired sign test**: a difference must point the same way in at
least 80% of rounds before it is called a regression. Noise changes its mind
between rounds; a real regression does not.

### Loading two builds into one process is biased

The plan's A/B mode loaded both builds into a single process to get perfect
interleaving. Two copies of the same class in one heap make shape-sensitive call
sites polymorphic, and the build loaded _second_ consistently loses. After
multi-round aggregation removed the random noise, this systematic bias remained:
`Pt.equals` and `Bound.clone` reported about **8% slower, every round, with a low
spread** — indistinguishable from a real regression.

**Resolution:** each build is measured in its own child process, one per side per
round, alternating which side runs first. A process costs about 100ms and removes
the bias completely.

### Validation

With both fixes, on this machine:

| Check                                        | Result                                           |
| -------------------------------------------- | ------------------------------------------------ |
| A/B of two identical builds (56 micro cases) | 0 faster, 0 slower, 39 unchanged, 17 too noisy   |
| A/B with a deliberate slowdown injected      | detected at +527%, verdict `slower`, exit code 1 |
| Allocation measurement, repeated             | 779.7 B vs 778.1 B per op — 0.2% apart           |

`--against HEAD` on a clean tree is the way to re-measure this noise floor on any
other machine before trusting a threshold there.

### Allocation needed a different instrument

A `heapUsed` delta under-reports whenever a GC lands inside the measured window,
which in allocation-heavy code is most of the time. The pass uses V8's sampling
heap profiler instead (`HeapProfiler.startSampling` with
`includeObjectsCollectedByMajorGC` / `...MinorGC`), which counts allocations as
they happen and does not care when a collection runs. It repeats to within 0.2%,
against 2–5% for timing, which is why it gets a 2% threshold and no noise
allowance.

### The browser suites needed four corrections

- **The canvas has to be cleared between iterations**, untimed. Without it the
  context accumulates hundreds of thousands of shapes over a run and the margin
  of error reached **±186%**. Clearing brought it to ±2–4%.
- **An `SVGForm` must be constructed before its space becomes ready.** The form
  registers a player whose `start` hook hands it the element to draw into, and
  `start` only fires for players present at that moment. Creating the form
  afterwards throws on the first draw.
- **`Img.blank(...)` plus `sync()` never populates pixel data** — that only
  happens in `load`'s async callback. The image fixtures go through `Img.load`
  with a generated data URL instead.
- **A `UI` with no handler for an action returns from `listen` before hit
  testing.** Two cases were measuring that early return: `UI.track` read 54ns per
  probe and `UI.fromPolygon` read 2.8ns. With a handler registered they are
  2.84µs and 1.16µs — three orders of magnitude apart.

### A guard against benchmarks that measure nothing

`scripts/bench-dryrun.mjs` runs every case once and reports any that throw, that
never feed the sink, or that feed it a value of exactly zero. The zero check is
advisory rather than fatal, and it earned its place immediately: it caught four
predicate cases (`Pt.equals`, `Num.equals`, `Geom.isPerpendicular`,
`Line.collinear`) whose random fixtures never satisfied the predicate, so each
only ever measured its rejection path. Their fixtures now match half the time.

It also surfaced that `Delaunay.voronoi` and `Delaunay.mesh` quietly return
nothing unless `delaunay()` has been called first — those cases triangulate in
untimed setup and measure only the read.

## Bug found while benchmarking, and fixed

`Rectangle.boundingBox` returned `Pt(NaN, NaN)` for every input. It flattens its
rectangles to Pts, then iterated each Pt — which yields its individual numbers —
and indexed those numbers as if they were themselves Pts:

```ts
let merged = Util.flatten(_rects, false); // -> Pt[]
for (let m of merged[i]) {
  // m is a number
  min[k] = Math.min(min[k], m[k]); // m[k] is undefined -> NaN
}
```

A second defect sat two lines above. `Pt` is a `Float32Array`, so the sentinels
`Pt.make(2, Number.MAX_VALUE)` and `Pt.make(2, Number.MIN_VALUE)` do not survive
the narrowing: `MAX_VALUE` overflows to `Infinity` (harmless for a minimum) and
`MIN_VALUE` flushes to `0`. The running maximum therefore started at zero, which
would have clamped the result for any rectangle in negative space even once the
indexing was correct.

Both are fixed: the inner loop indexes the Pt rather than its numbers, and the
sentinels are `Infinity` / `-Infinity`. An empty input now returns an empty
`Group` instead of a Group of sentinel Pts.

The existing unit test had pinned the broken behaviour with
`expect(Number.isNaN(bounds[0].x)).toBe(true)`. It now asserts the bounding box,
alongside a case entirely in negative space — which is what covers the sentinel
defect, since the indexing fix alone still returns `[0, 0]` for it.

### Cross-session comparison cannot gate

The plan treated `--compare` against a stored baseline and `--against <ref>` as
two routes to the same judgement. They are not.

Re-recording a baseline and immediately comparing an unchanged working tree
against it produced **14 "slower" verdicts out of 334 cases, between 5% and
16%** — every one of them allocation-heavy (`Bound.clone`, `Mat.multiply`,
`Polygon.projectAxis`, the scenarios), and every one in the same direction. Both
calibration cases stayed flat over the same interval, so this is not the machine
getting slower; it is the heap and GC state a process starts from, which differs
between sessions and which a pure-compute calibration cannot see.

The paired sign test does not help here either: a systematic session-level
difference moves all rounds the same way, so the rounds agree and the test
passes.

**Resolution:** `--against <ref>` gates, because it measures both sides in one
session, alternating, in isolated processes — validated at zero false positives.
`--compare` reports and does not set a failing exit code unless `--gate` is
passed. It stays the right tool for tracking absolute progress over time, which
is what a committed baseline is for.

## Using this

```
pnpm bench                     # full run, prints per-item cost for every case
pnpm bench:quick               # short timings, no rebuild, for iterating
pnpm bench:memory              # allocation profile instead of timing
pnpm bench:browser             # CanvasForm / SVGForm / Img / Space in Chromium
pnpm bench:check               # run every case once; catches broken cases fast
pnpm bench:record              # store a baseline for this machine
pnpm bench:compare             # report against that baseline

node --expose-gc scripts/bench.mjs --against master   # the trustworthy gate
```

Before trusting a threshold on a new machine, run `--against HEAD` on a clean
tree. That measures the noise floor there; anything it reports as changed is
noise that machine produces on identical code.

## Baseline

Recorded on this machine (Intel i9-9820X, Node 24.19.0, 3 rounds), 334 cases
with timing and allocation. The numbers below are what the optimization work
starts from.

Slowest micro operations, per item:

| Case                            | Per item |
| ------------------------------- | -------: |
| `Create.delaunay` + triangulate |   251 µs |
| `World.update` (16 bodies)      |   243 µs |
| `World.update` (128 particles)  |    91 µs |
| `Body.processBody`              |    74 µs |
| `Num.seed` then draw            |    64 µs |

Per frame, for the scenario workloads:

| Scenario                           |   Time | Allocated |
| ---------------------------------- | -----: | --------: |
| delaunay + voronoi, 500 points     | 378 ms |    241 MB |
| polygon collision sweep, 100 polys |  91 ms |     82 MB |
| particle field, 300 particles      |  59 ms |     35 MB |
| nearest-point query, 512 probes    |  39 ms |     25 MB |
| grid + noise field, 4096 points    |  22 ms |     31 MB |
| transform pipeline, 4096 points    |  18 ms |     18 MB |
| curve smoothing, 200 x 20          |  11 ms |     15 MB |
| colour gradient sweep, 2000 stops  |   4 ms |      8 MB |

Some specific things the baseline makes visible:

- **`Util.getArgs` dominates the variadic API.** `Pt.add(1.5)` takes 7ns;
  `Pt.add([1.5, 2.5])` takes 160ns and `Pt.subtract(pt)` 547ns, for the same
  arithmetic. Even the scalar path allocates 56 bytes per call for its rest-args
  array.
- **`Bound` is unexpectedly expensive.** `Bound.fromGroup` costs ~4.2µs and
  `Bound.clone` ~5.7µs — roughly 25× a `Pt` construction. `CanvasForm.textBox`
  inherits this and costs 14× `text` as a result.
- **`World._updateParticles` is quadratic** and tests every particle pair for
  collision unconditionally, with no spatial index and no way to opt out.
- **SVG costs 20–30× canvas per shape**: 6–14µs against 0.2–0.6µs.
- **Allocation is the through-line.** A single 500-point Delaunay+Voronoi frame
  allocates 241 MB. At 60fps that is 14 GB/s, which is the real reason these
  scenarios cannot hold a frame budget.
