# Img performance plan

## Objective

Attack the five costs the browser baseline quantified, without changing any
contract established by the correctness pass. Recorded baseline
(256² image, Chromium):

| Case                     | Baseline | Mechanism to remove                 |
| ------------------------ | -------- | ----------------------------------- |
| `Img.sync` (full)        | ~1.57 ms | base64 encode + reload round-trip   |
| `Img.load` (editable)    | ~505 µs  | eager full-canvas `getImageData`    |
| `Img.filter`             | ~970 µs* | eager refresh added for correctness |
| blank + draw + crop      | ~230 µs* | eager refresh in `initCanvas`       |
| `Img.pixel` / `getPixel` | ~500 ns  | two `Pt` allocations per read       |

(*post-correctness numbers; the pass explicitly promised to reclaim these.)

## Changes

### 1. `sync()` — blit, not base64

The contract (awaitable; `_img` reflects the canvas; `_data` consistent)
stays; the mechanism changes entirely:

- Extract `_loadImageSrc(src): Promise<void>` from `load()`: only the
  handler dance (supersede-reject, onload/onerror, src assignment) — no
  editable pipeline. `load()` becomes `_loadImageSrc` + pipeline.
- `sync()` at scale 1: `toBlob()` (async encode, no base64 string) → object
  URL → `_loadImageSrc` → revoke. **No canvas redraw, no readback** — the
  canvas already is the source of truth, so round-tripping it through the
  image was pure waste.
- Retina: draw the canvas into a _temporary_ canvas at 1/scale and blob
  that — the working canvas is no longer downscaled and re-upscaled
  through a lossy encode (a quality improvement, documented).
- Guard `toBlob` returning null (spec allows it) → reject.
- Track the object URL in `_objectUrl` while pending so `dispose()` mid-sync
  still revokes.

### 2. Lazy `ImageData` with a dirty flag

`_dataDirty` replaces every eager `_refreshData()`:

- Set dirty: `_initCanvas`, editable `load` (after draw), `resize`,
  `filter`.
- Materialize (refresh + clear dirty) on demand: `pixel`, `setPixel`, and
  the public `data` getter.
- `loadPixels()` forces refresh (its documented job); `updatePixels()`
  leaves data clean (canvas now equals data); `sync()` no longer touches
  the canvas so it neither dirties nor refreshes.
- Non-editable guard order preserved: no context → warn path, never a
  crash from the lazy materializer.

This reclaims the correctness pass's eager-refresh costs (`filter`,
`blank`) and removes the ~250 µs readback from every editable load where
pixels are never read.

### 3. `willReadFrequently: true`

Passed at the single `getContext("2d", …)` site in `_initCanvas` — the
class's whole purpose is repeated readback, and a GPU-backed canvas pays a
GPU→CPU sync per `getImageData`. Context attributes only apply on first
`getContext` for a canvas; we own that first call.

### 4. Pixel-read fast path

The ~500 ns per read is dominated by **two** `Pt` constructions — the
preallocated zero-`Pt` (built even on the hit path) and the result, both
through the 4-number constructor path (array-iteration in the
`Float32Array` constructor). Fix:

- Build the zero-`Pt` only on the miss path.
- Construct results via the length constructor + element stores
  (`new Pt(4)` then four indexed writes) — the same trick that made
  `clone()` fast in Tier-1.
- Hoist `imgData.width/data` reads; keep the API returning a fresh `Pt`
  (callers may mutate it).
- **Measure variants in the browser before locking in** — the estimate is
  reasoned, not measured, and this file's history says estimates lose to
  measurements.

### 5. `crop()` scalarization

Read the bound's corners as scalars into one `getImageData` call instead of
building two intermediate scaled `Pt`s. `getImageData` dominates; this is
tidiness while passing through.

## Validation

1. All 287 tests must pass unchanged — the correctness contracts are the
   spec for this pass.
2. `bench:browser --suite image` vs the recorded baseline, via a small
   compare script (the browser bench has no A/B mode; report with the
   cross-run noise caveat). Expected: `sync` several-fold faster; `load`
   roughly halved; `filter`/`blank` back to pre-correctness numbers;
   `pixel`/`getPixel` under ~200 ns.
3. Full standard checks; docs regen (JSDoc updates on `sync`).

## Review findings (folded during design)

- **R1 — `sync` must respect the supersede discipline**: assigning
  `_img.src` directly would clobber a pending `load()` without rejecting
  it — the extracted `_loadImageSrc` carries the pending-reject logic, so
  `sync` and `load` share one code path for image-source swaps.
- **R2 — the dirty-flag matrix must match the correctness pass's
  consistency matrix exactly**, or last pass's tests fail: every operation
  that refreshed eagerly now marks dirty instead, and every read that
  assumed fresh data materializes first. The 287 existing tests are the
  regression net for this equivalence.
- **R3 — `sync` no longer resizes the working canvas** (retina path uses a
  temp). Old behavior round-tripped the canvas through a downscale +
  lossy reload; pixel values were approximately preserved, and no test or
  demo observes the transient canvas size. Documented as an improvement.
- **R4 — `data` getter materializes**: public code reading `img.data`
  repeatedly gets the cached object until an invalidating operation, same
  as before; the only observable change is _when_ the readback happens.
- **R5 — `toBlob` may deliver `null`** per spec (e.g., zero-size canvas) —
  reject with an `Error` rather than propagating a null URL.
- **R6 — context attributes are first-call-wins**: the redundant
  `_cv` creation in `load()` must not call `getContext` first (it doesn't —
  it only creates the element; `_initCanvas` performs the sole
  `getContext`).
- **R7 — the `Img.sync` bench case needs no change**: it already awaits
  the promise; before/after comparability is exact for this pass (both
  sides measure full completion).
- **R8 — profiling before committing to the pixel-path story**: if the
  browser measurement shows the cost is elsewhere (e.g., `ImageData.data`
  access patterns), follow the data, not the plan.

## Results

Measured against the recorded browser baseline (single-run comparison; the
browser bench has no A/B mode):

| Case                  | Baseline |  After |               Delta |
| --------------------- | -------: | -----: | ------------------: |
| `Img.pixel`           |   506 ns |  71 ns |                −86% |
| `Img.getPixel`        |   493 ns |  67 ns |                −86% |
| `Img.load` (editable) |   505 µs | 242 µs |                −52% |
| `Img.resize`          |   300 µs | 6.5 µs |                −98% |
| `Img.filter`          |     ~par |    −3% | reclaimed from +47% |
| blank + draw + crop   |      +8% |        | reclaimed from +30% |
| `Img.crop`            |          |   −13% |                     |

The pixel-path profiling (plan R8) confirmed the diagnosis empirically
before implementation: 578 ns current → 357 ns without the preallocated
zero-Pt → 70 ns with the sized-constructor variant → 39 ns raw-array floor.
The 4-argument `Pt` constructor costs ~250 ns per call — noted as a future
core optimization target.

Honest tradeoffs:

- **`Img.sync` wall time is flat** (~1.6 ms) versus the correctness pass:
  PNG encode + decode is the floor for updating a real `HTMLImageElement`,
  and both mechanisms pay it. What the blob-blit rewrite buys instead:
  the ~450 µs encode moved off the main thread (`toBlob` vs blocking
  `toDataURL`), the canvas redraw + readback are gone, and the retina
  canvas is no longer squashed through a lossy reload. Against the
  original baseline the case reads +235% because the old contract couldn't
  track completion at all.
- **`Img.bitmap` +~50% (to 3.3 µs, high variance)**: `willReadFrequently`
  keeps the canvas CPU-backed, so GPU-handle creation costs more while
  every `getImageData` costs less — the right default for a class whose
  purpose is pixel access. `toBase64` +6% for the same reason.

All 287 tests pass unchanged — the correctness contracts held through the
mechanism swap.
