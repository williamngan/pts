# SVG rendering redesign plan

## Objective

Make the canvas ↔ SVG swap real: any sketch written against `CanvasSpace` /
`CanvasForm` must run unchanged on `SVGSpace` — same drawing API, same
semantics, no `scope()` ritual, no leaks — and fast enough to animate.
Approach chosen after design review: **one Form over a synthetic context
(“C”), with a style-batched path compiler as SVG's engine (“B”)**, plus an
unbatched writer for semantic per-shape SVG export. The per-element live DOM
mode (“A”) was evaluated and dropped: CSS transitions fight immediate-mode
redraws, per-shape DOM events would be an SVG-only pattern that breaks
portability (Pts' `UI` hit-testing is the portable answer), and semantic
export — A's only strong card — is captured by the snapshot exporter.

## Why the current SVGForm cannot be fixed incrementally

1. `form.scope(this)` must be called in every `animate` or element IDs grow
   unboundedly — the swap already requires editing user code.
2. Every shape, every frame does a global `document.querySelector("#id")`
   (`SVGSpace.svgElement`) — the bulk of the measured 6–14 µs/shape.
3. Drawing fewer shapes than the previous frame leaves stale elements
   visible forever; nothing removes them.
4. Style strings are rebuilt and re-set per element per frame, changed or
   not.
5. Structural drift: `SVGForm` is a partial re-implementation of
   `CanvasForm` (no gradients, dash, composite, `textBox` family, images).
   Two hand-written forms diverge by construction.

## Architecture

### The seam already exists

`CanvasForm`'s constructor accepts a raw rendering context (documented as
“to support custom contexts via subclassing”), and every draw method goes
through `this._ctx`. The complete context surface `CanvasForm` touches is 32
members (verified by grep): path building (`beginPath/moveTo/lineTo/arc/
ellipse/closePath`), paint (`fill/stroke/fillRect/clearRect`), state
(`save/restore/clip/scale`), styles (`fillStyle/strokeStyle/lineWidth/
lineJoin/lineCap/globalAlpha/globalCompositeOperation/setLineDash/
lineDashOffset`), text (`font/textAlign/textBaseline/fillText/measureText`),
images (`drawImage/putImageData`), gradients (`createLinearGradient/
createRadialGradient`).

### New pieces (all in `Svg.ts`; public exports unchanged)

1. **`SVGContext2D`** — a class implementing that 32-member subset.
   - Path verbs append to a pending `d` string (`arc`/`ellipse` map to `A`
     segments, curves to `C`/`Q`, etc.).
   - `fill()` / `stroke()` / `fillRect` flush the pending path into the
     current **style run** (see below) with the current style state.
   - Style setters write plain fields; `save`/`restore` push/pop a small
     state stack (styles + transform scale), exactly like a real context.
   - `measureText` delegates to a hidden shared `<canvas>` context so text
     metrics (and therefore `textBox` truncation) are identical to canvas.
   - `createLinearGradient`/`createRadialGradient` return lightweight
     gradient handles that materialize into `<defs>` on first use and are
     referenced by `url(#id)`.
   - `drawImage` emits a pooled `<image>` element in paint order (an
     `<image>` breaks the current path run, preserving painter's ordering).
2. **The style-run compiler** — the engine behind the context.
   - Consecutive fills/strokes with identical paint state append their `d`
     segments to one run; a paint-state change starts a new run.
   - At frame end each run becomes one pooled `<path>` element: set `d`,
     set style attributes only when changed from that element's cached
     values, truncate unused pool tail. Text runs use pooled `<text>`
     elements the same way.
   - DOM cost per frame ≈ number of style changes, not number of shapes.
3. **Frame lifecycle** — owned by `SVGSpace`, invisible to users: the play
   cycle begins a frame before players run (reset run builder) and commits
   after they finish (pool flush/truncate). `space.clear()` maps to
   clearing runs + background rect. No `scope()`, no leaks, shrinking draw
   counts truncate naturally.
4. **`SVGForm extends CanvasForm`** — constructed with the `SVGContext2D`;
   inherits every drawing method, including everything SVG never had:
   gradients, dashes, composite (`mix-blend-mode` per run where mappable),
   `textBox`/`paragraphBox`, images. The class keeps its exported name so
   `check-artifacts` and existing imports are untouched.
5. **Legacy + export writer** — the old per-element static helpers
   (`SVGForm.circle(ctx, …)` etc.) and the deprecated `scope()`/
   `updateScope()`/`nextID()` remain as a thin, self-contained unbatched
   writer so existing user code still runs (now leak-free is the caller's
   concern as before). The same writer powers **`SVGSpace.toSVG({ expand:
true })`**: re-render the current frame one-element-per-shape for
   semantic export to Illustrator/Figma; default `toSVG()` serializes the
   live batched DOM.
6. **`quickStart` backend detection** — if the mount element is (or
   contains) an `<svg>`, create `SVGSpace`; otherwise `CanvasSpace` as
   today. The literal zero-JS-line swap: change the HTML mount, done.

### Capability table (documented in the class JSDoc)

| Canvas feature        | SVG mapping                                    |
| --------------------- | ---------------------------------------------- |
| paths, fills, strokes | `<path>` runs (exact)                          |
| alpha                 | run `opacity` (exact)                          |
| line dash/join/cap    | stroke attributes (exact)                      |
| gradients             | `<defs>` + `url()` (exact)                     |
| text + metrics        | `<text>` + hidden-canvas `measureText` (exact) |
| images                | `<image>` (exact; CORS same as canvas)         |
| composite ops         | `mix-blend-mode` for the blend subset; the     |
|                       | Porter-Duff subset (`source-in` etc.) warns    |
|                       | and no-ops                                     |
| `clip`                | `<clipPath>` applied to subsequent runs        |
| `putImageData`        | unsupported → `Util.warn`, no-op               |

## Validation

1. Unit tests for `SVGContext2D` (path string generation, style runs,
   save/restore, gradient defs) — pure DOM-light logic, runs in vitest.
2. **Golden-frame parity**: a browser script renders a set of
   representative sketches (shapes, gradients, text, dash, alpha) on both
   backends, rasterizes the SVG via `drawImage`, and pixel-diffs against
   the canvas output within an antialiasing tolerance. This is the test
   that enforces the swap promise mechanically.
3. `bench:browser` SVG cases — expect order-of-magnitude improvement from
   run batching; add a 500-shape single-style case to demonstrate.
4. Existing demos `svgform.scope` (legacy path) must still run;
   a new demo variant runs an unmodified canvas sketch on `SVGSpace`.
5. Full `pnpm check` (docs, artifacts, package) since public JSDoc changes.

## Out of scope

`HTMLSpace`/`HTMLForm` (same disease, separate patient — the surface
architecture will accept an HTML writer later); display-list core (“D”) —
the `SVGContext2D` boundary is deliberately its first step; WebGL/WebGPU.

---

## Review findings (second pass)

- **R1 — Frame hooks.** `Space.playItems(time)` is the per-frame dispatch and
  is protected; `SVGSpace` overrides it: begin frame (reset the run builder),
  `super.playItems(time)`, commit (flush pools, truncate). `DOMSpace` sets
  `refresh(false)` by default — `SVGSpace` must default `refresh(true)` so
  the immediate-mode cycle matches canvas semantics; a static scene drawn in
  `start` only is committed once, same as canvas paints once.
- **R2 — `space` getter typing.** `SVGForm extends CanvasForm` needs
  `get space(): SVGSpace`, which is not a subtype of `CanvasSpace`. Cleanest
  fix without touching runtime behavior: give `CanvasForm` a covariant space
  type via a protected `_space: CanvasSpace` and type the `SVGForm` getter
  through a generic parameter with default (`CanvasForm<S = CanvasSpace>`)
  — invisible to existing users, no `@ts-expect-error` in public code. If
  generics ripple too far, fall back to an internal cast confined to
  `SVGForm` with a comment.
- **R3 — The `RenderingContext2D` boundary.** The DOM type has ~70 members;
  `CanvasForm` uses 32 (enumerated in this plan). Structurally implementing
  the full DOM interface is busywork; instead `SVGContext2D` implements the
  32 with matching signatures and is passed through one documented internal
  cast at `SVGSpace.getForm()`. The cast is safe because the 32-member list
  is derived from grep and enforced by a unit test that walks `CanvasForm`'s
  source for `ctx.` member accesses and asserts they exist on `SVGContext2D`
  — the drift alarm for future `CanvasForm` features.
- **R4 — `ctx.scale` is retina-only.** The only `scale` call is
  `CanvasSpace`'s pixel-density setup; `CanvasForm` never transforms. So
  `SVGContext2D.scale` can record-and-ignore (SVG is vector; `pixelScale`
  is 1), and no transform stack is needed in v1 beyond save/restore of
  styles.
- **R5 — Canvas arc semantics are the hard 10%.** `arc(ccw, >π sweeps,
angle normalization)` and `ellipse(rotation)` must be mapped to `A`
  segments by splitting sweeps > π; quadrant-case unit tests pin this. This
  is where naive ports go wrong; budget it explicitly.
- **R6 — Text mapping is two-layer.** `textAlign`/`textBaseline` map to
  `text-anchor`/`dominant-baseline` approximately, but `CanvasForm`'s
  `textBox` family does its own layout via `measureText` — with the
  hidden-canvas measurer, box layout is pixel-identical and only raw
  `text()` anchoring depends on the approximate mapping. Golden frames
  use a tolerance band for text.
- **R7 — Per-shape boundaries must be recorded for expanded export.** The
  run builder stores segment offsets per shape (one int per shape) so
  `toSVG({ expand: true })` can split merged runs; without this the
  snapshot exporter can't exist later without re-architecting.
- **R8 — Background is an element, not a canvas fill**: a pooled first-child
  `<rect>` maintained by `clear(bg)`, sized on resize. `clear("transparent")`
  hides it.
- **R9 — Legacy surface stays intact and quarantined**: the old static
  helpers and `scope`/`updateScope`/`nextID` remain, powered by the old
  `svgElement` id-lookup path, marked deprecated; the new engine never
  calls into them. The `svgform.scope` demo keeps working as the legacy
  regression test.
- **R10 — Blend mapping is a lookup table**, not logic: the CSS
  `mix-blend-mode` names that coincide with canvas composite names
  (`multiply`, `screen`, `overlay`, …) pass through per run; Porter-Duff
  names (`source-in`, `destination-out`, …) `Util.warn` once and no-op.
- **R11 — Gradient handles must be usable across frames** (users often
  create gradients in `start` and use them per frame): the `<defs>` entry
  materializes on first paint and is kept; the handle's stop list is
  written once. `addColorStop` after first use updates the def.
- **R12 — Golden-frame tests need an antialiasing budget**: compare with
  per-channel tolerance and allow a small fraction of differing pixels
  (edges); exact-match would flake across browsers. Assert structure
  separately (run counts, element counts) where exactness is cheap.
