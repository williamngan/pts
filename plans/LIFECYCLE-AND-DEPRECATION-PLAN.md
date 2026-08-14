# Lifecycle, deprecation, and renderer-contract plan

## Objective

Three small, connected changes that settle the framework-integration story
without new architecture (per design discussion — the display-list core was
considered and rejected: it taxes the canvas hot path to benefit only
renderers, and the context seam already gives third parties the recording
pattern opt-in):

1. **Deprecate `HTMLSpace` / `HTMLForm`** (docs-level; removal at next major).
   `DOMSpace` stays public — it is the legitimate subclassing point and costs
   nothing to keep.
2. **Fix the mount/unmount lifecycle** so Spaces survive framework usage
   (React `useEffect` + StrictMode double-mounting) without leaks.
3. **Document the renderer contract**: the context surface + frame lifecycle
   that `SVGContext2D` implements, as the official way to build a renderer.

## Findings that scope the work

- `CanvasSpace.dispose()` is already correct: `_disposed` guard, ready-timer
  clear, `ResizeObserver` disconnects, `_unbindAll()`, `_cancelAnimation()`,
  `removeAll()`. `MultiTouchSpace` uses pre-bound readonly handlers. The
  modern pattern exists in the codebase; `DOMSpace` predates it.
- **`DOMSpace` bugs** (inherited by `SVGSpace` and `HTMLSpace`):
  - `autoResize` setter and `dispose()` both call
    `window.removeEventListener("resize", this._resizeHandler.bind(this))` —
    `.bind()` returns a fresh function, so the original listener is never
    removed. Every mount/unmount cycle leaks one resize listener.
  - `dispose()` has no `_disposed` guard (not idempotent), calls `stop()`
    (which waits for the next frame) instead of `_cancelAnimation()`
    (immediate — the `Space` comment explicitly prescribes it), and never
    calls `_unbindAll()` for mouse/touch listeners bound on the element.
- **SSR**: import-time safety is already enforced — `check-artifacts`
  `require`s the CJS build in plain Node with no DOM and executes smoke
  calls. No module-level `window`/`document` access exists. Nothing to fix;
  document the guarantee.
- Guide infrastructure exists (`guide/` pages); the React pattern and the
  renderer contract get JSDoc-level documentation in source (which feeds the
  API docs) — full guide chapters are follow-up content work, out of scope
  here beyond what JSDoc covers.

## Changes

### 1. Deprecations (`src/Dom.ts`)

- `@deprecated` JSDoc on `HTMLSpace` and `HTMLForm`: "HTML rendering is
  deprecated and will be removed in a future major version. Use `SVGSpace` /
  `SVGForm` for DOM-based output — it shares the complete `CanvasForm` API."
  Exports stay (no `check-artifacts` change); demos stay until removal.

### 2. `DOMSpace` lifecycle repair

- Store one pre-bound handler: `private readonly _resizeHandlerBound =
this._resizeHandler.bind(this)` — used by both `addEventListener` and
  `removeEventListener` in the `autoResize` setter and `dispose`.
- `dispose()` brought to the `CanvasSpace` standard: `_disposed` guard →
  `autoResize = false` (removes the window listener via the stored bound
  ref) → `_unbindAll()` → `_cancelAnimation()` → `removeAll()`.
- `SVGSpace.dispose()` override: call `super.dispose()`, then drop its DOM
  caches (`_bgElem = null`, `resetDom()` on registered contexts, clear the
  context list) so a disposed space holds no element references.
- No signature changes anywhere; `dispose(): this` already exists publicly.

### 3. Renderer contract documentation (JSDoc)

- `SVGContext2D` class doc gains a "writing your own renderer" section: the
  32-member context surface (grouped: path verbs, paint, state, styles,
  text, images, gradients), the `beginFrame`/`commitFrame` lifecycle, and
  the statement that any object implementing this surface can be handed to
  `CanvasForm` — with `SVGContext2D` as the reference implementation and the
  drift-alarm test as the compatibility check.
- `CanvasForm` constructor doc updated to state the contract explicitly
  (it already accepts a rendering context; now it says what that enables).
- `DOMSpace` doc updated: subclassing entry point, lifecycle expectations
  (`dispose` on unmount), and a `useEffect` mount/unmount example.

## Tests

1. **Listener-leak regression** (browser spec): create an `SVGSpace` with
   `autoResize` on, spy on `resize`, dispatch a window `resize` event →
   spy fires; `dispose()`, dispatch again → spy does not fire again.
2. **Idempotent + re-mountable** (StrictMode simulation): `dispose()` twice
   without error; create → setup → dispose → create again on the same
   element → draws still render (the StrictMode double-mount sequence).
3. **`SVGSpace.dispose` releases DOM state**: after dispose, registered
   contexts are cleared and a fresh space on the same element works.
4. Existing suites stay green; docs regenerate (deprecation notices appear).

## Out of scope

Removing HTML classes or demos (next major); guide chapter content beyond
JSDoc; `react-pts-canvas` companion updates (separate repo); any Form/render
changes.

---

## Review findings (second pass)

- **R1 — The stored bound handler fixes a second latent bug for free**: with
  `.bind(this)` per call, setting `autoResize = true` twice stacked duplicate
  window listeners; with one stored reference, `addEventListener` dedupes.
- **R2 — `_unbindAll` is `protected` on `Space` (line 506)** — accessible
  from `DOMSpace.dispose` directly; no lifting needed.
- **R3 — `DOMSpace` needs its own `_disposed` field** (`CanvasSpace`'s is
  private to it). `HTMLSpace` inherits the repaired dispose for free.
- **R4 — StrictMode reuses the host element, so dispose must remove managed
  children.** React unmount usually destroys the host, but StrictMode's
  mount→unmount→mount reuses it: a dispose that leaves the background rect
  and run groups in the DOM makes the second mount create duplicates
  (two `<rect>`s, orphaned `<g>`s). `SVGSpace.dispose` therefore removes its
  managed elements (`_bgElem`, each context's group and defs) before
  dropping the references. The re-mount test pins exactly this: after
  dispose + re-create on the same element, there is exactly one background
  rect and one run group.
- **R5 — Dispose ordering**: guard → `autoResize = false` (window listener)
  → `_unbindAll()` (element listeners) → `_cancelAnimation()` (immediate,
  per the `Space` comment; `stop()` alone waits a frame) → `removeAll()`.
  Cancel before removal so no frame runs against a half-torn space.
- **R6 — The resize spy test works with a pre-bound handler** because
  `_resizeHandler` looks up `this.resize` dynamically, so `vi.spyOn(space,
"resize")` still intercepts.
- **R7 — Field-initializer order is safe**: prototype methods exist before
  class-field initializers run; `MultiTouchSpace`'s `_mouseDownBind` fields
  are the in-repo precedent.

## Results

Implemented as planned, with one significant finding beyond the review:

- **R8 (found by the re-mount test) — dispose must not call the subclass's
  `removeAll`.** `SVGSpace.removeAll` clears the container with
  `innerHTML = ""`; when the user passes their own `<svg>` element as host,
  the container is that element's _parent_, so dispose would destroy the
  user's element (and its siblings) — fatal for `<svg ref={ref}>` usage.
  `DOMSpace.dispose` now removes players via the base
  `Space.prototype.removeAll` and leaves DOM ownership to the subclass:
  `SVGSpace.dispose` removes exactly the elements it created (background
  rect, run groups, defs) and nothing else.

Validation: 264 tests pass (4 new lifecycle tests: resize-listener removal
on dispose, double-dispose idempotency, managed-element cleanup, StrictMode
re-mount with no duplicates); docs regenerated with both deprecation
notices; artifacts, lint, format, bench dry-run all green.
