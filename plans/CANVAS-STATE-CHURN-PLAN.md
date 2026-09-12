# Canvas state-churn reduction plan (Tier-3 #9)

## Objective

Stop re-writing canvas context state that hasn't changed. Every
`form.fill(c)` / `stroke(c, w, j, cap)` / `alpha(a)` / `font(...)` /
`composite(m)` / `dash(...)` call currently writes its context properties
unconditionally; browsers parse and apply these (color-string parsing in
particular) even when the value is identical. Typical sketches set styles
per shape per frame, so same-style runs pay full price.

## Design

A module-level `WeakMap<context, cache>` holds the last value written per
style property. A private `CanvasForm._set(key, value)` consults it and
writes only on change; all style setters route through it.

**Why the cache lives on the context, not the form (the critical decision):**
multiple forms can share one context — that's why `reset()` exists ("This
supports using multiple forms in the same space"). A per-form cache would
skip writes the _other_ form made stale. Keyed by the context, alternating
forms hit real value changes and write correctly; `useOffscreen()`'s context
switching is also automatically safe.

Covered properties: `fillStyle`, `strokeStyle`, `lineWidth`, `lineJoin`,
`lineCap`, `globalAlpha`, `font`, `globalCompositeOperation`, and dash state
(`setLineDash` + `lineDashOffset`, deduped via a compact segments key since
`getLineDash` allocates).

`reset()` force-writes every property and refreshes the cache — it is the
documented resync point, consistent with its existing purpose.

## Semantics and risks

- **Direct context writes desync the cache** (`form.ctx.fillStyle = …`).
  Contract: after mutating styles directly on the context, call
  `form.reset()` — the method that already exists for exactly this. Path
  operations via `form.ctx` (the documented `applyFillStroke` pattern) don't
  touch styles and are unaffected. Documented on `ctx`'s getter.
- Comparison is `===`: strings dedupe; gradient/pattern objects dedupe by
  reference (distinct objects always write — correct). Case-variant color
  strings ("#FFF" vs "#fff") simply don't dedupe — no correctness impact.
- `SVGForm` inherits the guarded setters; with the cache keyed on its
  `SVGContext2D`, a skipped write means the context already holds the value
  — behavior identical.
- `fill(false)` / `stroke(false)` only flip the form's flags today (no ctx
  write) — unchanged.

## Validation

1. **Multi-form correctness test** (browser): two forms alternating colors
   on one space render the same pixels as before the change — the test that
   guards the WeakMap-on-context decision.
2. Unit test with a spy context: repeated same-style calls write once;
   value changes write; `reset()` force-writes; two forms interleaved on
   one spy context write on every alternation.
3. New browser bench case: a 400-point field drawn `fillOnly(color).point()`
   per point, same-color vs alternating-color — quantifies the win and its
   bound.
4. `bench:browser` before/after (HEAD worktree build vs working tree, run
   sequentially on an idle machine — the browser bench has no A/B mode, so
   report with that caveat). SVG parity tests re-run (inherited setters).
5. Full standard checks; node-side A/B `--against HEAD` to confirm zero
   effect elsewhere (CanvasForm is browser-only, so expect all-unchanged).

## Review findings (folded during design)

- **R1 — Multi-form sharing is the make-or-break case**; per-form caching
  would be a silent correctness bug. Cache on the context (WeakMap; no
  leaks, contexts are GC'd with their canvases).
- **R2 — `reset()` must bypass the guard**, then update the cache, or a
  desynced context could never be repaired.
- **R3 — Dash needs a composite key** (`segments.join(",") + "/" + offset`)
  rather than reading `getLineDash()` (which allocates per call).
- **R4 — `font()` compares the built font string**, which also dedupes the
  `Font` object churn path.
- **R5 — `CanvasForm.rect` needs no work** — the allocating boundingBox
  version existed only in the legacy SVG writer; the canvas static is
  already scalar. Dropped from scope.
- **R6 — `textAlign`/`textBaseline` are only read, never routinely written**
  in hot paths — out of scope.
- **R7 — The win is bounded by style locality**: alternating-color sketches
  (like the physics demo's `i%4` palette) gain nothing; same-style runs
  (fields, particle clouds, monochrome sketches) skip one parse+apply per
  shape. The guard's cost on a miss is one `===` — the bench case reports
  both sides honestly.

## Results

The first implementation (WeakMap lookup per style write) was measured and
**rejected**: Chrome already fast-paths identical style-string assignment,
so the guard gained nothing on hits and the per-call `WeakMap.get` made
misses 2.2× slower. The shipped design caches the context's style-cache
reference on the form, revalidated only on context identity change — the
hot path is one property compare.

Measured per call in Chromium (1000-call loops, head → current):

| Pattern                       |  Before |   After | Delta |
| ----------------------------- | ------: | ------: | ----: |
| `fillOnly` same color (hits)  | 16.3 ns | 13.0 ns |  −20% |
| `fillOnly` alternating (miss) | 53.7 ns | 49.3 ns |   −8% |
| `dash([4,2], 1)` repeated     |  178 ns | 51.7 ns |  −71% |

No pattern regressed. Engines without Chrome's identical-string fast path
(Safari, Firefox — not testable in this sandbox) should gain more on the
hit path. The dash win (array allocation + two writes deduped) is the
largest and engine-independent. 277 tests pass, including the spy-context
suite: single-write dedup, dash keying, the multi-form alternation case
that forbids per-form caching, and the `reset()` desync-recovery contract.
The permanent browser-bench churn case is left as a follow-up; measurements
above used an ad-hoc dual-build harness.
