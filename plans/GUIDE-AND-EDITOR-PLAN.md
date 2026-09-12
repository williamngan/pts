# Guide demos and live editor — review and proposal

## Objective

Work out why the interactive canvases in `guide/` get stuck, why the live editor
in `demo/edit/` misbehaves, and propose a design for both that is correct by
construction rather than by timing luck. Monaco is upgraded and made lighter as
part of the same pass.

Every finding below was reproduced in headless Chromium against the actual site,
served from the repo root. Numbers are measured, not estimated.

## How it works today

**The guide.** `guide/md/*.md` are the sources and `guide/*.html` are the
rendered pages, with `guide/assets/header.html` and `footer.html` as templates.
No build step connects them in this repo — the generator was Python that lived
outside it, so the two copies are kept in sync by hand.

Each demo is authored as a markdown image whose alt text carries a marker:

```md
![js:getting_started](./assets/bg.png)
```

`guide/js/guide.js` scans every `<img>` on the page, keeps the ones whose alt
starts with `js:`, and for each one appends an absolutely-positioned
`div.demoOverlay` over the image, with `id` set to the marker. It then appends a
`<script src="./js/examples/<id>.js">` to the body. That script constructs a
`CanvasSpace` bound to `#<id>`, calls `playOnce(200)`, and calls the global
`registerDemo(id, space)` so hover can later call `space.replay()` and
`space.stop()`.

**The editor.** `demo/edit/index.html` hosts a Monaco editor and an
`<iframe src="./frame.html">`. `edit.js` waits for the iframe's `load`, fetches
the 42KB hand-written `js/autocomplete.d.ts`, AMD-loads Monaco 0.13.2 from the
vendored `demo/edit/vs/`, then fetches `../<name>.js` and runs it. "Run" calls
`frames[0].update(source)`; `frame.html`'s `update()` clears `#pt`, removes the
previous `<script id="ptscode">`, and appends a new one with the source as its
`innerHTML`.

---

## Findings — loading

### G1. Demos render blank whenever the placeholder image is slow

This is the "stuck" report, and it is a race, not a bug you can see locally.

The overlay is `position: absolute; top/left/bottom/right: 0` inside the
paragraph, so **its height comes entirely from the placeholder `<img>`**. The
image carries no `width`/`height` attributes, so until it loads the paragraph is
about zero pixels tall. Meanwhile the demo script has already run and built a
`CanvasSpace` against that zero-height box, and `playOnce(200)` ends the render
loop 200ms later. When the image finally lands, the ResizeObserver resizes the
canvas correctly — but nothing redraws, because the loop is already over.

The result is an opaque, correctly-sized, entirely empty canvas sitting on top of
the preview image it is hiding.

Reproduced by delaying only the images. Every demo on the page comes up blank,
and only recovers when hovered:

```
=== after load (images delayed 1200ms) ===
case                   overlay      canvas       blank
getting_started        640x433      640x434      YES
getting_started_1      640x433      640x434      YES
getting_started_2      640x433      640x434      YES
...
=== after hovering #getting_started_1 ===
getting_started_1      640x433      640x434      no      <- only the hovered one
```

The guide images are unoptimized PNGs between 91KB and 242KB, about 700KB across
the set, so on a real connection losing this race is the normal case rather than
the exceptional one.

### G2. Every demo on a page boots eagerly

The Image guide has 7 demos, Op has 6, Get-started has 6. All of them construct a
retina `CanvasSpace`, a ResizeObserver and a render loop during page load,
whether or not they are anywhere near the viewport. Nothing is deferred and
nothing is torn down when a demo scrolls away.

### G3. A demo that fails to load fails silently, forever

`loadDemo` sets no `onerror`, and its `try/catch` wraps an assignment to
`script.src`, which cannot throw for a bad path. A 404 leaves an overlay that
still invites the reader to "Touch to try demo" and does nothing when they do.

### G4. `registerDemo` is an unenforced convention

Hover control depends on the example remembering to call
`window.registerDemo(...)`. If it doesn't, hover silently does nothing — the same
symptom as G1 and G3, with a different cause. There is no way to tell the three
apart from the page.

### G5. The code you run is not the code you can edit

Each of the 41 guide examples exists twice: `guide/js/examples/X.js` runs on the
page, and `demo/guide.X.js` is what the "Edit live code" link opens. **All 41
pairs differ.** For `getting_started_1` the guide runs a `new CanvasSpace(...)`
with `playOnce(200)`, while the editor opens a `Pts.quickStart` one-liner with
four commented-out alternatives. Both are reasonable; they are just not the same
lesson.

Every link resolves, so nothing is broken — the content has simply drifted.

### G6. Root-absolute paths assume deployment at a domain root

`guide.js` links to `/demo/edit/?name=guide.`, `edit.js` navigates to
`origin + "/demo/?name="`, and the sound examples load `/assets/flute.mp3`. All
break under any subpath deployment, including a GitHub Pages project site and any
local preview that isn't served from the repo root.

### G7. No reproducible guide build

`guide/md/*.md` and `guide/*.html` are two hand-synced copies of the same content
with templates sitting beside them and no script to combine them. Any fix to the
demo-loading markup has to be applied to twelve HTML files by hand today.

### G8. Dead and deprecated third-party code

`hljs.initHighlightingOnLoad()` has been deprecated for years, and every guide
page still ships Google Universal Analytics (`analytics.js`, `UA-104913373-1`),
which stopped processing data in 2023.

---

## Findings — live editing

### E1. Every Run leaks another animation loop

`frame.html`'s `update()` stops the previous sketch only via `window.space` —
which is set by `Pts.quickStart`, but **not** by a sketch that keeps its space in
a local variable. That local-variable form is exactly what the Get-started guide
documents as "Option 4", and it is what anyone writing from scratch will type.

Instrumenting `requestAnimationFrame` inside the frame and pressing Run four
times on such a sketch:

```
run 1: ~61 rAF callbacks/sec, 1 canvas in #pt
run 2: ~120 rAF callbacks/sec, 1 canvas in #pt
run 3: ~180 rAF callbacks/sec, 1 canvas in #pt
run 4: ~240 rAF callbacks/sec, 1 canvas in #pt
```

Each orphaned loop keeps drawing into a canvas that has been detached from the
document. The editor gets progressively slower the longer you use it, which is
the classic shape of "it goes weird after a while".

### E2. Top-level `let` or `const` breaks Run permanently

`update()` removes the previous `<script>` element, but a removed script does not
give back its top-level lexical bindings — those live on in the global lexical
environment. So the second Run of any sketch that declares `const space = ...` at
top level throws, and the sketch is dead until the page is reloaded:

```
run 1: {"hasSpace":false,"animID":null,"canvases":1,"error":""}
run 2: {"hasSpace":false,"animID":null,"canvases":0,
        "error":"Uncaught SyntaxError: ... Identifier 'space' has already been declared"}
```

Note `canvases: 0` — the canvas has been cleared and nothing replaces it. The
existing demos dodge this only because every one of them uses `var` inside an
IIFE. A user writing modern JavaScript hits it on their second keystroke-to-Run
cycle.

### E3. Spaces are stopped but never disposed

`update()` calls `stop()` and `removeAll()`, never `dispose()`. The old space's
ResizeObserver goes on observing `#pt` (which survives, since only its
`innerHTML` is cleared), pointer listeners stay bound to the detached canvas, and
any `AudioContext` from a sound sketch is never closed. It also reaches into
`space._animID`, a protected member, to cancel the frame.

### E4. The editor can hang at "Loading Editor..."

The whole boot sequence is chained off `document.getElementById('demo').onload`,
assigned when `edit.js` executes — which is after two other synchronous scripts,
including the 28KB AMD loader. The HTML parser yields between scripts, so a
warm-cached iframe can fire `load` before the handler exists. Nothing else ever
starts the editor, so the loading overlay stays up forever. `_load` has no
`onerror` or timeout either, so a failed `autocomplete.d.ts` produces the same
dead end.

### E5. Monaco never relayouts

The editor is created without `automaticLayout`, and nothing calls
`editor.layout()`. Shrinking the window leaves Monaco rendering at its original
width inside a smaller container:

```
resize: container 700 -> 450
resize: monaco    632 -> 632      <- unchanged
```

### E6. IntelliSense has no standard library

`setCompilerOptions({ noLib: true })` removes every built-in definition, so
`Math`, `console`, `Array` and friends have no completions or hover docs. Only
the Pts definitions load.

### E7. The Pts definitions are stale

`autocomplete.d.ts` is 42KB, hand-maintained, and missing `Img`, `Sound`, `Tempo`
and `UIDragger` — entire subsystems that the guide has chapters for. The build
already emits an always-current `dist/index.d.ts` (56KB).

### E8. 4.16 MB and ~6 seconds to open the editor

Measured on a local server with no network latency at all:

```
editor loaded: true (after 6054ms)
total transferred: 4.16 MB
  2012KB  editor/editor.main.js
  1644KB  language/typescript/lib/typescriptServices.js
   172KB  editor/editor.main.css
   150KB  base/worker/workerMain.js#editorWorkerService
   150KB  base/worker/workerMain.js#javascript
    32KB  editor/editor.main.nls.js
    28KB  loader.js
```

The vendored `demo/edit/vs/` is 6.6MB in the repository, of which 4.2MB is
`language/` — and 850KB of that is the CSS, HTML and JSON language services,
which this editor never uses.

### E9. Monaco 0.13.2 is from 2018

The vendored copy predates the current API surface. `monaco.KeyCode.KEY_0` still
exists in it, but is `Digit0` in any modern release, and `editor.addCommand` is
being passed an array where it expects a single keybinding number. Both are
migration hazards the moment the version moves.

### E10. The sketch iframe is not sandboxed

`<iframe id="demo" allow-scripts="true">` — `allow-scripts` is not an attribute;
the intended one is `sandbox="allow-scripts"`. As written there is no sandbox at
all, so evaluated code has full same-origin access to the parent page. Today the
only code that runs is what the user typed, so the practical risk is low, but it
forecloses ever accepting a shared-source URL.

---

## Proposal — guide loading

The through-line: **never let a demo's correctness depend on when an image
finishes loading**, and **never leave a failed demo indistinguishable from a
working one**.

### 1. Reserve the demo's space before anything loads

Give the placeholder image explicit `width`/`height` attributes (or set
`aspect-ratio` on the container) so the paragraph has its final height from first
layout. This alone removes the zero-size window that G1 depends on.

### 2. Keep the preview image until the demo has actually drawn

Invert the current relationship. The canvas starts transparent and hidden; the
loader shows it only after the sketch reports its first drawn frame. If that
never happens, the reader keeps the static preview — a good outcome instead of a
flat rectangle. This makes G1, G3 and G4 all degrade to the same harmless state.

### 3. Boot on visibility, not on page load

Use an `IntersectionObserver` to construct a demo when it first approaches the
viewport, and to `stop()` it when it leaves. A twelve-demo page then costs one or
two live spaces instead of twelve.

### 4. Replace the registration convention with a contract

Have each example export a factory instead of self-registering:

```js
// guide/js/examples/getting_started_1.js
export default function (container) {
  const space = new CanvasSpace(container).setup({
    bgcolor: "#e2e6ef",
    retina: true,
    resize: true,
  });
  const form = space.getForm();
  space.add(() => form.point(space.pointer, 10));
  return space; // the loader owns play/stop/dispose from here
}
```

The loader then does `const space = (await import(url)).default(div)`, which
gives it a real handle, real error handling via `await`, and no globals. A demo
that throws or 404s is caught at one place and shown as a failed state.

### 5. Draw one frame when idle, animate on hover

Rather than `playOnce(200)` and hoping, the loader calls `space.playOnce(0)` for
a single static frame once the container has a real size, and switches to
`play()` on hover / `stop()` on leave. Because the loader owns the space, it can
also re-render on resize instead of going blank.

### 6. One copy of every example

Collapse `guide/js/examples/X.js` and `demo/guide.X.js` into a single directory
that both the guide and the editor read. If the editor genuinely needs a
different framing, generate it from the canonical file rather than maintaining a
second one.

### 7. Add the missing guide build

A small `scripts/generate-guide.mjs` — markdown plus `header.html`/`footer.html`
in, `guide/*.html` out — using the `marked` dependency already in the tree. That
makes the demo markup fixable in one place and puts the guide under
`pnpm check` like everything else.

### 8. Housekeeping

Drop the Universal Analytics snippet, replace `initHighlightingOnLoad`, make the
`/demo/edit/` and `/assets/` links relative, and compress the guide PNGs.

---

## Proposal — live editing

### The central change: run each execution in a fresh document

E1, E2 and E3 are three symptoms of one decision — reusing a single long-lived
document and trying to undo the previous sketch by hand. That is not winnable:
you cannot un-declare a `const`, and you cannot find a space the sketch never
handed you.

Replace `update(source)` with **replacing the iframe**:

```js
function run(source) {
  const next = document.createElement("iframe");
  next.setAttribute("sandbox", "allow-scripts allow-modals");
  next.srcdoc = frameTemplate(source);       // pts.min.js + the sketch, inline
  next.addEventListener("load", () => current.replace(next), { once: true });
  ...
}
```

A new document means: no leaked loops, no lexical collisions, no stale
observers, no accumulated `AudioContext`s, and no dependence on the sketch
exposing `window.space`. It is also less code than the teardown it replaces.
Build the replacement hidden and swap on its `load` event to avoid a flash.

With `srcdoc` the sketch is no longer same-origin with the editor, so the
`sandbox` attribute becomes meaningful and E10 is fixed by the same change.
Errors and "first frame drawn" come back over `postMessage`.

### Report errors where the user is looking

Listen for `error` and `unhandledrejection` in the frame, post them to the
parent, and surface them both as a panel and as Monaco markers via
`monaco.editor.setModelMarkers`, so the failing line is underlined in the editor
instead of described in a corner of the preview.

### Fix the boot sequence

Start the editor from an explicit check rather than a single event:

```js
const frameReady =
  iframe.contentDocument?.readyState === "complete"
    ? Promise.resolve()
    : new Promise((r) => iframe.addEventListener("load", r, { once: true }));
```

and give the fetches `try/catch` plus a timeout, so a failed asset shows a
message rather than an eternal "Loading Editor...".

### Worth adding while in here

- Debounced auto-run as an opt-in toggle, with explicit Run kept.
- Shareable sketches: source compressed into the URL hash, so `?name=` is no
  longer the only way to open code.
- `Cmd/Ctrl+Enter` as the Run shortcut alongside the existing one.

---

## Proposal — Monaco, current and lighter

Two independent wins are available, and they compose.

**Drop the languages that are never used.** `css`, `html` and `json` account for
850KB of the vendored bundle and nothing loads them deliberately.

**Reconsider the TypeScript worker.** `typescriptServices.js` is 1.6MB — the
single largest asset on the page — and it exists to provide completions for a
42KB definitions file that is missing four of the library's subsystems.

I recommend replacing it rather than upgrading it:

| Approach                                        | Transfer | IntelliSense                          |
| ----------------------------------------------- | -------: | ------------------------------------- |
| Today: Monaco 0.13.2 + full TS service          |  4.16 MB | stale, no standard library            |
| Upgrade in place, drop unused languages         |  ~3.3 MB | current, with standard library        |
| Modern Monaco, no TS worker, custom completions |  ~0.6 MB | Pts-specific, generated from the docs |

The third row is both the lightest and the most useful. Monaco tokenizes and
highlights JavaScript without the TypeScript worker; what the worker buys is
completion and hover. Those can be supplied by a small
`registerCompletionItemProvider` fed from **`docs/json/`, which this repo already
generates** — giving completions with real parameter lists and real doc strings
for the actual current API, rather than a hand-copied `.d.ts`.

If keeping full TypeScript IntelliSense is preferred, then at minimum feed it
`dist/index.d.ts` from the build instead of `autocomplete.d.ts`, so the
definitions can never drift again, and set `noLib: false` so the standard library
comes back.

Either way: pin `monaco-editor` as a devDependency and build the bundle rather
than committing 6.6MB of vendored 2018 output, set `automaticLayout: true`, and
move to the modern `KeyCode`/`addCommand` API.

---

## Suggested sequencing

1. **Stop the bleeding in the editor** — fresh-iframe execution (E1, E2, E3, E10)
   and the boot-sequence fix (E4). Small, self-contained, fixes the worst of it.
2. **Fix guide loading** — reserve image space, keep the preview until first
   frame, boot on visibility, handle failures (G1–G4).
3. **Monaco** — pin, slim, upgrade, wire completions to generated docs
   (E5–E9).
4. **Consolidate content** — one copy of each example, add the guide build
   (G5, G7), then the housekeeping in G6 and G8.

Steps 1 and 2 are independent and can go in either order; both are worth doing
before the Monaco work, since they are what readers actually hit.

## Non-goals

- Redesigning the guide's visual language or its prose.
- Changing the Pts library itself. Every issue here is in the site code, though
  G1 does suggest `Space` could helpfully re-render on resize while stopped.
- Replacing Monaco with a different editor.

## Reproductions

All findings were reproduced against the repo served statically on
`localhost:8899`, driven by Playwright Chromium:

- **G1** — `page.route` delaying `guide/assets/*.png` by 1200ms, then reading
  back each canvas's pixels and checking whether every pixel is identical.
- **E1** — wrapping `requestAnimationFrame` inside the sketch frame and counting
  callbacks per second after each Run.
- **E2** — setting the editor's value to a sketch with a top-level `const` and
  pressing Run twice.
- **E5** — comparing `#editor` width against Monaco's inner width across a
  viewport change.
- **E7/E8** — `performance.getEntriesByType("resource")` in the editor page.
