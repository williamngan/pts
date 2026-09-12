# Img correctness and API plan

## Objective

Fix every item in the Img review's "Correctness bugs" and "API design"
sections. Performance items (blit-based sync mechanism, lazy `_data`,
`willReadFrequently`, pixel-read speed) are explicitly deferred to the next
pass — this pass may only change _contracts and correctness_, not
mechanisms, so the recorded browser baseline stays comparable except where
a fixed contract changes what is measured (noted below).

## Changes — correctness

1. **`load()` (instance)**: attach handlers before assigning `src`; guard
   DOM absence with `typeof document === "undefined"` and `return` after
   reject; reject with `Error` objects. **Superseded loads reject**: a
   monotonic token per call; when a newer `load()` starts, the older
   pending promise rejects with a "superseded" `Error` instead of dangling
   with clobbered handlers.
2. **`sync()` returns `Promise<Img>`** and refreshes `_data` in both paths
   (scale-1 path currently never updates it; retina path updates it only
   incidentally). Mechanism (base64 round-trip) is unchanged in this pass —
   only the contract: awaitable, consistent data. (Additive: `void` callers
   are unaffected.)
3. **`getPixel`**: accept the last pixel (`i > d.length - 4`), reject
   negative coordinates (currently produce a NaN `Pt`).
4. **`filter()` replaces instead of composites**: set
   `globalCompositeOperation = "copy"` around the self-`drawImage` (the
   source is snapshotted before compositing, so "copy" atomically replaces
   the canvas — no temp canvas needed), restore the prior op, then refresh
   `_data` (matching `resize`'s behavior).
5. **`resize()` on canvas-only images**: when `_img.naturalWidth` is 0,
   scale relative to the current canvas size and use a snapshot of the
   canvas as the draw source (a temp canvas — `initCanvas` clears the
   canvas before the draw, so drawing the canvas into itself would read
   nothing). Guard zero dimensions.
6. **`fromBlob` revokes its object URL** when the load settles.
7. **Non-editable/unloaded footguns**: `pixel()` warns (`Util.warn`) and
   returns `Pt(0,0,0,0)` when no data; `imageSize` returns `Pt(0,0)` when
   neither image nor canvas exists; `initCanvas` populates `_data`
   immediately so `Img.blank()` + `pixel()` no longer crashes.
8. **Error idioms normalized**: `Error` objects for throw/reject
   (`pattern`'s string throw disappears entirely — see API), `Util.warn`
   replaces `console.error`.

## Changes — API

1. **Merge the static loaders** (user directive): static `Img.load(src,
editable?, space?, ready?)` now returns `Promise<Img>` (the `loadAsync`
   behavior), still invoking the optional `ready` callback on success for
   compatibility; failures reject (and `ready` is not called — previously
   they vanished as unhandled rejections). `loadAsync` remains as a
   `@deprecated` alias delegating to `load`. **Breaking**: code that used
   the old synchronous return (`const img = Img.load(...)` then drawing
   immediately) must await; the repo's own `guide.image_load` demo and one
   spec case do this and are updated.
2. **Constructor options object**: `new Img({ editable, space, crossOrigin,
pixelScale })` accepted alongside the positional form. `pixelScale`
   directly addresses the observed misuse (`loadAsync(src, true,
space.pixelScale)` in two shipped examples silently degrades to scale 1
   because a number is not a `CanvasSpace`); those examples are fixed.
3. **Editable story completed** with the familiar creative-coding trio:
   `setPixel(p, rgba, rescale?)` writes into `_data`; `loadPixels()`
   refreshes `_data` from the canvas (needed after `getForm()` drawing);
   `updatePixels()` writes `_data` back to the canvas (`putImageData`).
4. **`pattern()` decoupled from `CanvasSpace`**: falls back to a lazily
   created internal 2D context when no space was given — the string throw
   is removed.
5. **`dispose()` replaces `cleanup()`** (which stays as a deprecated
   alias): nulls references, revokes a tracked object URL if any.
6. **Kept as-is, deliberately**: `resize(sizeOrScale, asScale)` and
   `pattern(repetition, dynamic)` boolean parameters — documented, small,
   and splitting them is churn without a correctness payoff. Veto welcome.

## Repo updates riding along

- `demo/guide.image_load.js` (awaits merged `load`),
  `demo/guide.image_pixel.js` + `guide/js/examples/image_pixel.js` (pass
  `space`, or the new `pixelScale` option, instead of a raw number).
- `CanvasImage.spec.ts`: update the static-load case; add coverage for
  every fix above.

## Validation

1. Browser spec additions: merged-load promise + `ready` + rejection;
   superseded-load rejection; `sync()` awaited with `_data` consistency at
   scale 1 and 2; `getPixel` last-pixel and negative cases; `filter`
   replacement semantics (opacity filter on a solid fill: "copy" yields
   50% alpha, the old bug yields 75% — a pixel-assertable difference);
   `resize` on `blank`; `blank`+`pixel` no-crash; `setPixel`/`updatePixels`
   round-trip; `pattern()` without space; options-object constructor;
   `dispose()`.
2. Full standard checks (tests, typecheck, lint, format, docs, artifacts).
3. `bench:browser --suite image` re-run against the recorded baseline:
   all cases expected within noise **except `Img.sync`**, which now awaits
   completion the old contract couldn't track — the case was written for
   this and its comment says the comparison direction; report it, don't
   hide it.

## Review findings (folded during design)

- **R1 — `filter` via `"copy"` composite** is the only alloc-free way to
  replace-in-place; a `clearRect` first would erase the source before
  `drawImage` reads it. The prior composite op must be restored (and the
  style cache in `CanvasForm` is not involved — `Img` owns a private ctx).
- **R2 — `resize` on blank needs a snapshot** because `_drawToScale` →
  `initCanvas` resizes (and thus clears) the canvas before drawing.
  A sync temp-canvas copy is the mechanism; `createImageBitmap` is async
  and `resize` is a sync API.
- **R3 — supersede semantics interact with `sync()`**: `sync()` awaits an
  internal `load()`; a user-initiated `load()` during a pending `sync()`
  correctly rejects the sync promise ("superseded") rather than leaving
  two writers racing on `_img`.
- **R4 — the `_data` consistency matrix** after this pass: populated by
  `initCanvas` (zeros), refreshed by editable `load`, `resize`, `filter`,
  `sync`, `loadPixels`; written by `setPixel`; flushed by `updatePixels`.
  `getForm()` drawing requires an explicit `loadPixels()` before reads —
  documented on both methods (automatic tracking is a perf-pass concern).
- **R5 — the `ready` callback in the merged `load` runs before the promise
  resolves** (inside the `then`), preserving the old callback's timing
  relative to the returned instance being complete.
- **R6 — `guide.image_pixel`'s misuse becomes a supported form**: the
  options-object `pixelScale` gives the author what they plainly intended.
- **R7 — the bench's `Img.sync` case anticipated this change** (its
  then-guard awaits when a promise appears); the baseline comparison will
  show the case _slower_ because it now measures the whole truth. That is
  the correct reading, stated in the report.
- **R8 — `Img.blank` keeps `_scale` coherent**: `blank(size, space, scale)`
  passes `scale` only to `initCanvas` while `_scale` stays at the
  constructor's value — fixed so the field follows the actual canvas scale
  (single-number case), which `pixel(rescale=true)` depends on.

## Results

All correctness and API items implemented; 287 tests pass (10 new browser
cases covering every fix). Docs regenerated (77 pages; `ImgOptions` added).

Bench comparison against the recorded browser baseline, with honest
attribution:

- Within noise: `load`, `toBase64`, `bitmap`, `crop`, `pixel`, `getPixel`,
  `resize` (after fixing a self-inflicted double `getImageData` the first
  implementation introduced via `initCanvas`'s new data population — caught
  by re-running the bench, split into `_initCanvas` without refresh for
  internal callers; resize returned to 4.5 vs 4.6 ns baseline).
- `Img.sync` +~220%: expected and pre-documented — the case now measures
  full completion, which the old fire-and-forget contract could not track.
- `Img.filter` +~47% and `blank + draw + crop` +~30%: the price of the
  correctness contract (filter now refreshes `_data`; blank images now
  carry readable data). Both are exactly what the deferred lazy-`_data`
  perf pass will reclaim.

Two spec expectations were updated because they pinned bugs: the
`blank([8,6], …, 2)` case asserted `pixelScale` 1 with `imageSize` 16×12
(the `_scale` incoherence), and the error-idiom case spied `console.error`.
