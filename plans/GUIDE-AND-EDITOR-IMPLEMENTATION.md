# Guide loading and live editor — implementation plan

Companion to `GUIDE-AND-EDITOR-PLAN.md`, which records the review and the
reproductions. This is the plan for the fixes themselves.

## Root causes, restated as the things to change

| #   | Symptom                                | Cause                                                                              |
| --- | -------------------------------------- | ---------------------------------------------------------------------------------- |
| G1  | Guide demos come up blank              | Space is built against a zero-height box, and the later resize never repaints it   |
| G2  | Slow, hot guide pages                  | Every demo boots at page load regardless of viewport                               |
| G3  | A broken demo looks like a working one | No `onerror`, no timeout, no failure state                                         |
| E1  | Editor slows down as you use it        | Each Run leaks a render loop, because teardown depends on `window.space`           |
| E2  | Second Run dies permanently            | Top-level `let`/`const` bindings survive removal of their `<script>`               |
| E4  | "Loading Editor..." forever            | Boot chained off an `iframe.onload` handler attached after the load may have fired |
| E5  | Editor misrendered after resize        | No `automaticLayout`                                                               |
| E7  | Wrong/missing completions              | Hand-maintained `autocomplete.d.ts`, four subsystems out of date                   |
| E8  | 4.16 MB, ~6s to open                   | Monaco 0.13.2 with the full TypeScript language service                            |

### The library-level contributor to G1

`CanvasSpace.resize` ends with:

```ts
// if it's a valid resize event and space is not playing, repaint the canvas once
if (evt && !this.isPlaying) this.playOnce(0);
```

but the ResizeObserver path calls `this._resizeHandler(null)` (`src/Canvas.ts:213`),
so `evt` is `null` and the repaint is skipped. Resizing a canvas clears it, so an
idle space that gets resized by the observer is left blank until something else
redraws it. That is precisely what happens when the guide's placeholder image
finally loads.

This looks like a genuine bug in Pts — the guard predates the ResizeObserver
change and was written when the only resize path was a real window event. The
one-line fix is to drop the `evt &&`. **It is out of scope here** (the ask is the
guide and editor), so the guide loader will repaint idle demos itself and work
correctly either way. Flagging it as a recommended follow-up.

---

## Part A — Guide demo loading

### A1. Rewrite `guide/js/guide.js` as a per-demo state machine

States: `pending → loading → ready → playing`, plus a terminal `failed`.

The rules that make it correct by construction:

1. **Never construct a space against a zero-sized box.** A `ResizeObserver` on
   the container gates everything: the example script is not injected until the
   container has a real width and height.
2. **Boot on visibility.** An `IntersectionObserver` (with a generous
   `rootMargin`) triggers loading, so a twelve-demo page pays for what the reader
   actually reaches. Leaving the viewport stops the demo.
3. **Keep the preview image until there is something better to show.** The canvas
   fades in only once the demo has drawn. Until then — and forever, if the demo
   fails — the reader sees the static preview, which is the correct fallback
   rather than a flat colour rectangle.
4. **Every failure is visible.** `script.onerror`, plus a timeout for a script
   that loads but never calls `registerDemo`, both land in `failed`, which shows
   a real message instead of an invitation to interact.
5. **Repaint idle demos on resize.** Debounced; calls `space.playOnce(0)` when
   the space exists and is not playing. This is the loader-side workaround for
   the library issue above.

### A2. Loading spinner

A CSS-only spinner centred in the demo container, shown during `loading` and
removed on `ready`/`failed`. No image, no extra request: a single element with a
`border` and a `rotate` keyframe, sized in `em` so it scales with the page.

It must respect `prefers-reduced-motion` (fade a static ring instead of
spinning), and it must not appear for demos that are already cached and instant —
so it fades in after a short delay rather than flashing on every scroll.

### A3. Keep the `registerDemo` contract, but verify it

Rewriting all 41 examples to export factories is the better long-term shape, but
it is a large, separate change and it would break the `demo/guide.*.js` copies
that the editor opens. For now the loader keeps accepting `registerDemo` and
treats its absence as a failure it can report.

### A4. Reserve the image's space

Add `width`/`height` attributes to the demo `<img>` tags from the real PNG
dimensions, so the paragraph has its final height at first layout. This removes
the layout shift; it is not what makes the demos correct (A1 does that), so it is
a separate, mechanical step.

---

## Part B — Editor execution model

### B1. A fresh document per Run

Replace `frame.html`'s `update(source)` — which tries and fails to undo the
previous sketch — with **replacing the iframe element**. A new document cannot
leak a render loop, cannot collide on a top-level `const`, cannot keep a stale
ResizeObserver, and cannot accumulate `AudioContext`s. It is also less code than
the teardown it removes.

The new iframe is created hidden with the same geometry, swapped in on `load`,
and the old one removed — so there is no flash, and a load that never completes
leaves the previous sketch on screen instead of a blank frame.

**The frame stays same-origin.** A sandboxed `srcdoc` frame gets an opaque
origin, which would turn `Sound.loadAsBuffer("/assets/flute.mp3")` and `Img.load`
into cross-origin requests and break every sound and image demo. Isolation via
sandboxing is worth revisiting only alongside CORS headers for `/assets`, and is
not required for the bugs being fixed here.

### B2. Errors the user can act on

`frame.html` reports `error` and `unhandledrejection` to the parent via
`postMessage`. The injected source gets a `//# sourceURL=sketch.js` trailer so
line numbers are relative to the sketch instead of the host document. The parent
shows the message and sets a Monaco marker on the offending line.

### B3. Boot without the race

Resolve frame readiness from `contentDocument.readyState` as well as the `load`
event, so a cached frame cannot slip through. Give the asset fetches error
handling and a timeout, so any failure produces a message rather than a permanent
"Loading Editor...".

### B4. Smaller fixes

`automaticLayout: true`; `Cmd/Ctrl+Enter` to run alongside the existing chord;
`Run` disabled until the frame is ready.

---

## Part C — Monaco

Pin `monaco-editor` (0.56.0) as a devDependency and vendor **only the editor
core** into `demo/edit/vs/`, dropping `language/` entirely:

| Kept                                 | Why                                 |
| ------------------------------------ | ----------------------------------- |
| `loader.js`                          | AMD loader, same mechanism as today |
| `editor/editor.main.{js,css,nls.js}` | editor + JS syntax highlighting     |
| `base/worker/workerMain.js`          | editor worker (search, diff)        |

Dropped: `language/typescript` (3.4MB), `language/css`, `language/html`,
`language/json` (850KB) — none are used by a JavaScript sketch editor.

Losing `language/typescript` loses TypeScript-powered IntelliSense, which today
is driven by a hand-written 42KB `autocomplete.d.ts` that is missing `Img`,
`Sound`, `Tempo` and `UIDragger`. It is replaced by a **generated** completion
provider: a build step reads the API the library actually exports and emits a
compact JSON of classes, members and signatures, which a small
`registerCompletionItemProvider` serves. Lighter than the TS service and current
by construction.

Vendoring stays (the site is served statically straight from the repo), but the
committed payload drops from 6.6MB to roughly 2.5MB, and the page from 4.16MB to
about 1MB.

---

## Part D — Regression checks

`scripts/check-site.mjs`, in the style of the existing `browser-smoke.mjs`,
serving the repo statically and driving Chromium to replay the four
reproductions:

1. Guide page with images delayed — assert no demo canvas is a single flat colour.
2. Editor boots within a timeout and the loading overlay goes away.
3. Four Runs of a local-variable sketch — assert the rAF rate stays near one loop.
4. Two Runs of a top-level-`const` sketch — assert no error and a live canvas.

Wired in as `pnpm test:site` and added to `pnpm check`.

---

## Sequence

1. Guide loader + spinner + CSS (A1–A3)
2. Editor execution model + boot + errors (B1–B4)
3. Regression checks (D) — so 1 and 2 are locked in before touching Monaco
4. Monaco (C)
5. Image dimensions (A4)

---

# Plan review

Re-reading the above before starting, six things need to change or be pinned
down.

### 1. "Reveal the canvas on first frame" has no reliable signal

The plan says to fade the canvas in once the demo has drawn, but the loader does
not own the example's players and cannot hook its render. Waiting a fixed number
of frames after `registerDemo` is a guess, and a guess is what caused G1.

**Resolution:** the loader owns the reveal because it owns the _size gate_. Once
the container is sized and the script has registered its space, the loader calls
`space.playOnce(0)` itself and reveals on the following animation frame. If the
example already started its own loop, that is harmless — the canvas has been
painted either way, which is the actual precondition for revealing.

### 2. `IntersectionObserver` and `ResizeObserver` can deadlock each other

A demo that is visible but zero-sized (image still loading) fires intersection
but not size; a demo that is sized but off-screen fires size but not
intersection. Waiting for both in the wrong order means waiting forever.

**Resolution:** treat them as two independent latches on one state object, and
attempt the transition whenever either fires. Neither observer drives the
sequence; both just set a flag and call `maybeLoad()`.

### 3. Stopping on scroll-away will break the sound demos

The plan stops a demo when it leaves the viewport. The sound examples hold an
`AudioContext` and a playing buffer; stopping the _space_ leaves audio playing
with nothing drawing it, and the existing `stopCallback` is only wired to
mouse-leave.

**Resolution:** call the registered `stopCallback` on viewport exit too, not just
on pointer leave. That is what it is for, and the sound examples already provide
it.

### 4. Zero-size gating must have an escape hatch

If a demo's container legitimately never gets a size — a CSS change, a display
context nobody anticipated — the loader would sit in `pending` forever and show a
spinner that never resolves. That is a worse failure than today's.

**Resolution:** a timeout on the `pending → loading` transition. If the container
has no size after a few seconds, fail visibly and keep the preview image. The
spinner must never be able to outlive its own state.

### 5. Replacing the iframe re-parses `pts.min.js` on every Run

Roughly 100KB of parse per keystroke-to-Run cycle. Cached, so no network, but not
free — and it makes Run feel heavier than the current in-place injection.

**Resolution:** accept it, and measure it in the regression check so it stays
honest. Correctness first: the alternative is the current design, which is wrong
in three ways. If Run latency turns out to be objectionable, the follow-up is a
module-worker or a reusable about:blank document, not a return to in-place
injection.

### 6. The generated completion data needs a real source

Part C says "reads the API the library actually exports" without saying from
where. Two candidates exist: `dist/index.d.ts` (produced by the build, always
current, but requires parsing TypeScript) and `docs/json/` (already structured,
already generated by `scripts/generate-docs.mjs`, and carries doc comments and
parameter lists).

**Resolution:** use `docs/json/`. It is already JSON, already has the prose that
makes a completion useful, and is regenerated by a script that is already part of
`pnpm check`. No TypeScript parsing needed.

### Smaller points folded in

- The spinner delay (A2) and the pending timeout (review #4) are the same timer
  budget; define both as named constants in one place.
- `demo/**` is excluded from ESLint and neither `guide/` nor `demo/` is in the
  Prettier globs, so the files being rewritten here are not covered by the repo's
  own gates. Add just the two authored files to the Prettier glob rather than
  the whole directories, which contain vendored code.
- The editor's `Back` link and the guide's edit links use root-absolute paths
  (`/demo/...`). Make them relative while the files are open, since it costs
  nothing and unbreaks subpath deployments.

---

# What implementation changed

Six things differed from the plan. Each was found by reproducing in Chromium
rather than by reasoning, and three of them were only visible because the fixes
made previously-hidden failures loud.

### 1. The blank canvases had a second, deeper cause

The plan blamed the zero-height container, and that was real — but fixing it was
not enough. Demos still rendered blank.

Instrumenting `canvas.width` assignments showed two resizes (161ms, 175ms), the
last of which cleared the canvas and never repainted. Resizing a canvas clears
it, and `CanvasSpace.resize` only repaints an idle space when handed a resize
_event_ — while its own ResizeObserver calls `_resizeHandler(null)`.

The plan proposed dropping that `evt &&` guard in the library. **That fix is
wrong**, and the test suite caught it: `playOnce(0)` ends with `stop(0)`, which
leaves `_time.end = 0`, and `_mouseAction` early-returns whenever
`!isPlaying`. Repainting on every resize therefore poisoned the end-time and
silently killed pointer input — two existing browser tests failed on exactly
that.

So the library is untouched and the loader observes the _canvas_ element itself,
repainting when the space resizes it. That works whichever path did the resizing.
The library issue is still real and still worth fixing, but it needs `playOnce`
to stop mutating `_time.end` — a wider change than this work should carry.

### 2. A `Bound` bug, surfaced by lazy loading

With demos booting on scroll rather than at load, canvas heights came out as
1961, 2000, 2600 — tracking the scroll offset.

`CanvasSpace._resizeHandler` offsets a measured bound by the window scroll via
`box.center = box.center.add(...)`. `Bound`'s `_updatePosFromCenter` assigned
through the `topLeft` and `bottomRight` setters, each of which calls
`_updateSize` → `_updateCenter`, so the second assignment read a `_center` that
the first had already overwritten. A 640×433 bound moved down 1600px became
640×800.

Fixed by assigning the corner Pts directly. This affects any Pts canvas resized
while the page is scrolled, not just the guide. An existing test had pinned the
wrong value (`[25, 32.5, 40]`); it now asserts the correct one, with a
regression test named for the real-world path.

### 3. The preview image needed its own latch

Gating on "container has non-zero size" was not sufficient: between "no height"
and "final height" the container passes through a single text line, and the
first demo booted at 640×24. The loader now waits on the preview image's `load`
as a third independent latch.

### 4. Sketches depended on leaked global state

Giving each Run a fresh document broke every sketch using bare `CanvasSpace`,
because they had been relying on a _previous_ run's `Pts.quickStart` leaving
`Pts.namespace()` behind in the shared document. The frame now calls
`Pts.namespace(window)` deliberately, so a sketch behaves the same whatever ran
before it.

### 5. Adding a doctype changed layout

The old `frame.html` had no doctype, so it ran in quirks mode where `<body>`
fills the viewport. Adding one — correct in itself — put it in standards mode
where body height collapses to zero, and `HTMLSpace` measures the body. Fixed
with `html, body { height: 100% }`.

### 6. Monaco could not simply be "core only"

The plan assumed dropping `language/` would leave a working editor. It does not:
`editor.api` is the API surface with **no editor contributions**, so there is no
suggest widget, no find, no hover — `editor.action.triggerSuggest` does not even
exist. Importing `editor.main` instead pulls every language service, including a
6.9MB TypeScript worker, for 15MB total.

The bundle is therefore assembled explicitly: the API, the JavaScript tokenizer,
and 23 curated editor contributions. Importing all 59 costs another ~1.4MB for
features a sketch editor has no use for (rename, codelens, sticky scroll).

Two build details were found by testing, not by reading docs: an IIFE output
breaks the worker's `import.meta.url` (ESM output required), and the default
base emits a root-absolute worker URL that 404s from `/demo/edit/` (`base: "./"`
required).

## Results

|                                    |                                  Before |                                After |
| ---------------------------------- | --------------------------------------: | -----------------------------------: |
| Guide demos blank on slow network  |                                     all |                                 none |
| Demos booted on a 7-demo page load |                                       7 |                                    1 |
| rAF callbacks/sec after 4 Runs     |                                     240 |                                   59 |
| Second Run with top-level `const`  |                       fails permanently |                                works |
| Editor boot                        |                                 ~6000ms |                               ~350ms |
| Monaco vendored                    |                                  6.6 MB |                               4.7 MB |
| Monaco version                     |                           0.13.2 (2018) |                               0.56.0 |
| Completions                        | 42KB hand-written, 4 subsystems missing | generated, 42 classes / 1503 members |

## Pre-existing bugs found and fixed

- `guide/js/examples/image_pixel.js` threw on every frame from a leftover
  `console.log(de, de.length)` that dereferenced an unguarded value — the line
  below it already guards with `if (de && ...)`. The old loader hid this as a
  silent blank canvas.
- `demo/htmlform.scope.js` called `play(5000)`. `play()` takes the current
  animation timestamp, not a duration, so the sketch sat idle until the page
  clock passed five seconds.

## Not done

- **A4, image dimensions.** The loader no longer depends on them, so this is now
  cosmetic (layout shift) rather than correctness.
- **G5/G7**, the duplicated examples and the missing guide build, and **G6/G8**,
  the root-absolute paths outside the two files touched here and the dead
  analytics snippet. All still worth doing; none block the reported bugs.

---

# Follow-up round: three bugs found in real use

Reported after the first round, from a browser at `localhost:3000`. Two were mine;
the third was pre-existing and became visible because failures are now loud.

### 1. "This demo could not be sized" on first load

**Mine.** The size watchdog started when the demo was _created_, so any demo the
reader had not scrolled to yet — correctly sitting in `pending` — was declared
failed after six seconds. It looked intermittent because a second visit loads
images from cache and the reader usually scrolls before the timer fires.

The watchdog now starts when a demo enters the viewport and is cancelled when it
leaves, so it only measures what it was meant to: a demo that is on screen and
cannot get a size.

### 2. The editor going blank

**Mine, two independent causes.**

The replacement iframe was created without `id="demo"`. That id is not
decoration — the stylesheet hides `#demo` below 768px, so after the first Run the
preview escaped every rule targeting it and rendered over the editor on narrow
windows. Replacements now carry the id (moved off the outgoing frame first, so it
is never duplicated) and are inserted in the outgoing frame's position rather
than appended to the end of the body.

Separately, vite emits ES chunks as `.mjs`, and many static file servers have no
MIME mapping for that extension. They send `application/octet-stream`, browsers
refuse to execute it as a module, and the editor hangs at "Loading Editor…"
forever. Verified by forcing that MIME type in the browser. Chunks are now `.js`.

### 3. `demo/` — not caused by these changes

Every one of the 81 demo pages was checked against the pre-change `dist`, and the
four that fail there fail identically before and after:

- `template` and `guide.template` draw nothing — they are templates with empty
  `animate` bodies.
- `curve.bezier` renders blank.
- `sound.play` calls `new Sound().generate(...)`, which no longer exists.

What the browser testing _did_ find is a real editor bug at phone width. The
sketch frame is hidden below 768px but was still being run, into a 0×0 space, and
`Create.delaunay` then reached `Geom.sortEdges` with an empty group and threw
`Cannot read properties of undefined (reading 'add')` — an error banner over the
code, for a preview that is deliberately not shown. The editor now skips running
while the preview is hidden, which is what the "run this in a larger window" hint
already promised.

That crash points at a genuine library weakness worth fixing separately:
`Geom.boundingBox` returns `new Group(undefined, undefined)` for empty input, and
`Geom.sortEdges` dereferences it without checking.

## End-to-end coverage added

`scripts/check-site.mjs` grew two cases, each verified to fail against the code
that had the bug:

- off-screen demos must still be `pending`, not `failed`, after nine idle seconds
- at 390px the code must render, the preview must stay hidden, and no error may
  appear

Also checked by hand this round, with screenshots reviewed at 1400px and 390px:
the home page, `demo/`, `demo/edit/`, and all twelve guide pages; the editor at
five viewport widths from 1600px to 390px; and all 81 demo pages.

---

# Third round: stale-cache blanking, and the study pages

### The editor going blank — the actual mechanism

Earlier rounds fixed two real causes but not this one. The editor entry has a
stable filename, `monaco.js`, while its split chunks are content-hashed. Every
rebuild renames the chunks. A browser holding a cached `monaco.js` therefore
imports a chunk that no longer exists, gets a 404, and the editor never
initialises — the page loads, then stays blank. Nothing recovers it except a
hard refresh, which is exactly the reported symptom.

Reproduced by serving 404 for the hashed chunk: the loader sat at
"Loading Editor…" and `window.monaco` stayed undefined.

Two changes, so this cannot recur:

- The bundle is now emitted as **one self-contained file** (`inlineDynamicImports`,
  and the editor worker inlined). There are no cross-file references left to
  desync, so a cached entry is always internally consistent.
- If the bundle genuinely fails to load, the editor now says so and suggests a
  hard refresh, rather than sitting on "Loading Editor…" indefinitely.

`demo/edit/vs/` is now two files — `monaco.js` and `pts.css` — instead of a tree
of hashed chunks.

### The study pages

Swept all 25 the way the demos were swept. Two were genuinely broken, both from
API drift rather than anything in this work — verified identical against the
pre-change `dist`:

- `study/CanvasForm.image.js` called `form.image(img, rect)`. The signature is
  `image(ptOrRect, img, orig)` — the arguments had been transposed by an earlier
  API change, so every call threw "it is not iterable".
- `study/Img.load.js` called `new Img(true, space.pixelScale)` and
  `Img.fromBlob(b, true, img.pixelScale)`, passing a number where both expect a
  `CanvasSpace`. It also called `img.crop(...)` every frame without waiting for
  the image to load, which threw on the first frame.

Both fixed; all 25 study pages now render.

### Coverage

`scripts/check-site.mjs` is up to nine cases. The two added this round:

- the editor bundle must be a single file — verified to fail when chunk
  splitting is re-enabled
- `?name=guide.getting_started` must render both the code and a non-blank
  preview

Swept this round: all 25 study pages, all 81 demo pages, all 12 guide pages.
