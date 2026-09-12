# Form and rendering correctness plan

## Objective

Fix verified bugs and close gaps in the rendering stack — `Form.ts` (Form,
VisualForm, Font), `CanvasForm`/`CanvasSpace` (Canvas.ts), `SVGForm`/
`SVGSpace`/`SVGContext2D` (Svg.ts), and `DOMSpace`/`HTMLForm` (Dom.ts) — in
the established tests-first sequence. Findings marked "confirmed" were
reproduced on 2026-08-20 by driving `CanvasForm` with a recording stub
context (the renderer extension point makes the drawing surface fully
testable in Node); the audit script is preserved in the session scratchpad
(`render-audit.mjs`).

Context from prior passes: the SVG stale-attribute reconciler bug found in
the 2026-08-15 review **is already fixed** (commit 8173282, 2026-08-16 —
`commitFrame` now removes cached attributes absent from the new run);
canvas state churn was addressed by the style-cache pass; `HTMLSpace`/
`HTMLForm` are deprecated, so findings there get safety-level fixes only.

## Confirmed bugs

1. `CanvasForm.imageData` **misuses dirty-rect parameters** — for a
   target rect from (10,10) to (110,110) it calls putImageData(img, 10,
   10, 10, 10, 110, 110). Per spec the image paints at (dx + dirtyX,
   dy + dirtyY), so the position is doubled to (20,20), and the last two
   arguments receive the bottom-right corner coordinates instead of the
   dirty width/height. The doc claims the rect "specifies a bounding box
   for resizing", which putImageData cannot do at all. Fix: treat the
   rect as placement plus clip, ie putImageData(img, x, y, 0, 0, w, h),
   and correct the doc (no resizing).
2. **`CanvasForm.paragraphBox` crops one line too early** — the crop
   condition `lines.length * lstep > size[1] - lstep * 2` reserves two
   line-heights of slack: a box exactly 5 lines tall renders only 4 lines
   (confirmed with a stub measurer). Correct condition for "next line must
   still fit" is `(lines.length + 1) * lstep > size[1]`. Note this changes
   rendered output for cropped paragraphs (one more line appears) — the
   browser visual tests pin the corrected behavior.
3. **`CanvasForm.gradient` mutates the caller's stops array** — with
   fewer than 2 stops it `push`es filler entries into the caller's array
   (confirmed: `["#f00"]` grows to 3 entries), so reusing the array
   compounds. Fix: copy before normalizing.
4. **`CanvasForm.dash` silently truncates dash patterns to 2 segments** —
   `dash([5,10,2,4])` calls `setLineDash([5,10])`. The cache key and the
   write both assume a pair. Fix: support arbitrary segment arrays
   (`join(",")` as the cache key, pass the full array through), matching
   canvas semantics.
5. **`VisualForm.points(null)` returns `undefined`** — the only drawing
   method that breaks chaining (`return;` instead of `return this`).
6. **`CanvasForm.reset()` restores a 12px font while a fresh form starts
   at 14px** — `reset()` builds `new Font()` (12px default) but
   `VisualForm._font` initializes to `new Font(14, "sans-serif")`. After
   `reset()`, text renders smaller than on a fresh form. Fix: reset to the
   same 14px sans-serif default.
7. **`SVGSpace.removeAll` destroys the space's own mount (and possibly
   user DOM)** — it sets `this._container.innerHTML = ""`. When the space
   was created on a `<div>`, the container holds the managed `<svg>`
   itself, so the svg is detached and every subsequent `commitFrame`
   renders into a detached element (blank output forever). When the user
   passed an `<svg>` directly, the container is its _parent_, so sibling
   user-owned elements are destroyed too. `DOMSpace.dispose` already
   deliberately avoids this method for exactly this reason. Fix: remove
   only managed children (each context's `disposeDom()` plus the
   background rect), never touch the container. Same treatment for the
   deprecated `HTMLSpace.removeAll`.
8. **`Font.value` emits leading spaces** for default weight/style
   (`"  14px/1.5 sans-serif"`). Browsers parse it leniently, but it lands
   verbatim in SVG export output (`style="font: ..."`). Fix: join the
   non-empty parts.

## Second-review confirmations (2026-08-20)

- All 8 bugs re-verified against a fresh build of current HEAD (which
  includes the "typography improvements" and "Fix svg bug" commits).
- The `paragraphBox` crop slack **predates the typography pass**: commit
  f90c3c5 preserved the legacy recursive `nextLine`'s exact condition
  (`cc * lstep > size[1] - lstep * 2`) when converting to a loop — an
  inherited bug faithfully carried over, not a recent regression. The
  corrected condition `(lines.length + 1) * lstep > size[1]` is validated
  for lineHeight ≥ 1 (glyph extent fits within the final line box).
- Existing pins that encode bugs, to be corrected: `Form.spec.ts` pins
  `Font().value` **with** the leading spaces; `DomSvg.spec.ts` pins
  `removeAll` leaving the container/element empty (the destructive
  behavior). Both updated alongside the fixes.
- `removeAll` fix concretized: clear the **space's own element's**
  children (`svg`/`div` drawing surface) — never the container — plus
  `resetDom()` and forgetting the background element. Keeps the mount
  alive and satisfies the intent of the existing assertions with updated
  targets.
- Item 10 (`setup()` bgcolor default) **downgraded to doc-only**: the
  transparent-when-absent behavior is long-standing; changing it would
  visibly alter every existing sketch that calls `setup()` without
  `bgcolor`. The inconsistency with `DOMSpace.setup` is documented
  instead.
- Item 14 (`points()` batching) **deferred**: the new PNG visual harness
  computes pixels directly and cannot rasterize canvas rendering, so
  there is no visual-equivalence infrastructure to gate a default change,
  and an opt-in parameter isn't worth the API surface yet. Recorded as a
  follow-up candidate once browser screenshot comparison exists.

## Gaps and inconsistencies

9. `SVGContext2D.fillText` silently drops the canvas `maxWidth` argument
   (`CanvasForm.text(pt, txt, maxWidth)` passes it through). SVG has a
   native equivalent: set `textLength` (+ `lengthAdjust`) when the
   measured text exceeds `maxWidth`, matching canvas's compress-to-fit
   behavior. At minimum, warn once.
10. `CanvasSpace.setup()` without `bgcolor` silently resets the default
    background (`#e1e9f0`) to `"transparent"`, while `DOMSpace.setup()`
    keeps the current value when the option is absent. Align on the
    DOMSpace behavior (absent option = keep current) and document.
11. `CanvasSpace.recorder()` never revokes the object URL it creates for
    the download path — a small leak per recording. Revoke after the
    click (callback consumers own the URL and are documented as such).
12. `SVGSpace.svgElement` / `HTMLSpace.htmlElement` look elements up with
    a global `document.querySelector("#id")` rather than scoping to the
    parent — an unrelated element with the same id anywhere in the page
    is silently adopted. Scope the lookup to `parent.querySelector`.
    (Legacy helpers; low priority.)
13. Deprecated `HTMLForm`: `point()`/`square()` never reset
    `border-radius`, so any square drawn after a circle renders rounded.
    One-line fix despite deprecation (visible wrongness).

## Verified correct (no action)

The SVG reconciler (stale-attribute removal, element pooling, tag-change
replacement, tail truncation); `SVGContext2D.ellipse`'s canvas sweep
semantics including full-circle and multi-segment arcs; gradient
materialization (linear + radial focal mapping); `save`/`restore` state
snapshot including dash arrays; the style-cache write-dedupe protocol
including the resize/restore resync points; `clear()`'s transparent and
semi-transparent handling; `textBox`/`_textAlign` alignment logic;
`alignText`'s legacy value mapping; blend-mode mapping with once-only
warnings for unsupported Porter-Duff composites.

## Performance improvements

14. **`points()` draws each point as its own path + fill + stroke** — for
    large point clouds (particles), a batched mode that accumulates
    same-style points into one path and paints once would cut per-point
    overhead several-fold. Semantics differ for translucent overlapping
    points (one composite instead of N), so this lands as the default
    only if visually identical in the browser bench scenes; otherwise as
    an opt-in. Measured via the browser bench canvas suite.
15. **`CanvasForm.line`/`polygon` iterate with `for..of`** over inputs
    that are nearly always arrays — indexed fast path with iterator
    fallback, consistent with the library's other hot paths.
16. Micro: `dash()` builds a template-string key per call even on cache
    hits (fine at current sizes; revisit only if the browser bench
    flags it).

## Regression analysis

- `imageData`: no internal callers; demos don't use the rect form. The
  fix changes output only for the rect form, which is currently
  nonsensical (double-offset).
- `paragraphBox`: used by textbox demos and the typography browser
  tests — expectations there pin the corrected line count; visual diff
  expected (one more line in cropped boxes).
- `gradient`: internal demos pass fresh arrays; fix removes a side
  effect only.
- `dash`: the SVG path (`SVGContext2D.setLineDash`) already accepts
  arbitrary arrays — only the canvas-form cache/write path truncates, so
  the fix also makes canvas and SVG output consistent for >2-segment
  patterns.
- `reset()` font: only affects multi-form usage after reset; aligns with
  documented default.
- `SVGSpace.removeAll`: no internal callers outside tests; `dispose`
  already bypasses it. Fix makes it strictly less destructive.
- `points` return: additive.
- `Font.value`: string output changes byte-wise (trimmed) — SVG export
  snapshots in tests must be updated; canvas rendering identical.

## Phase 1 — tests first

- Extend the stub-context unit tests (pattern proven by the audit
  script): pin `imageData` args, `gradient` non-mutation, full dash
  arrays reaching `setLineDash`, `points` chaining, `Font.value` string,
  `reset()` font size, `paragraphBox` line count at exact-fit heights.
- Browser tests (`test:browser`): pin `SVGSpace.removeAll` keeping the
  svg mounted and rendering after re-add; pin SVG `maxWidth` handling;
  visual check on paragraph cropping.
- Bench: browser bench canvas/form suites already cover the hot paths;
  record the before numbers for `points` batching if pursued.

## Phase 2 — fixes

Apply 1–13 (correctness), then 14–15 (perf, gated on browser bench
results). Gates as established: full check chain green, browser tests
green, docs regenerated, artifact budgets updated, baseline re-recorded
where node-bench cases are affected (none expected — these are
browser-rendered paths).

## Results (2026-08-20)

Implemented: bugs 1-8, gaps 9 and 11-13, perf item 15 (indexed line/polygon
loop). Item 10 landed as documentation only and item 14 stays deferred, per
the second review.

Validation: 470/470 tests across all vitest projects (node, browser,
visual) — 7 new stub-context pins were red pre-fix; 3 existing pins that
encoded bugs were corrected (Font.value leading spaces, two destructive
removeAll assertions). New browser pins: SVG maxWidth → textLength mapping,
and removeAll keeping the mount alive and rendering after re-adding items.
Typecheck, lint, prettier, docs chain (browser smoke included), and
artifact budgets green; dist rebuilt.

Node bench: no benched paths changed (the typography suite replicates the
wrap loop inline without the crop condition), so no A/B was needed and the
recorded baseline stays valid. Browser bench run to confirm the rendering
suites execute cleanly on the fixed paths.

Implementation notes:

- The browser test that re-renders after `removeAll` must call
  `beginFrame()` first: the suite drives `commitFrame()` manually, so runs
  from earlier draws in the same "frame" would otherwise accumulate.
- Prettier's markdown printer is non-idempotent on list items containing
  `[[...],[...]]` at the start of a wrapped line (parsed as a link
  reference, indent grows each pass) — the trigger for the formatting
  churn in this file's item 1, now reworded.

### Post-implementation perf check (browser bench vs pre-fix baseline)

One regression found and fixed: the parent-scoped `querySelector("#id")`
in the legacy element helpers walks the subtree (+48% on
`SVGForm.point (new id each call)`), while the old global lookup used the
document's O(1) id map. Final form: `document.getElementById(id)` plus a
`parent.contains` check — O(1) and still never adopts a same-id element
outside the parent (−0.1% vs baseline after the fix). Everything else is
within the browser bench's single-run error bars; `canvas/line` and
`polygon` trend −14% from the indexed loop, and `paragraphBox` +5–11% is
the honest cost of rendering the extra line that now correctly fits.
