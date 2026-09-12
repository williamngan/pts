# Open issue triage

Reviewed September 8, 2026 against local `revamp` at `f7ba968`.

Scope: all **50 open issues** returned by GitHub's issues API, excluding pull
requests, and every available comment on those issues. The API returned no
additional pages. Closed issues were not audited. Issue age alone was not used
as evidence that a defect is fixed.

No production code or GitHub issue state was changed. This file is a review
deliverable, not an implementation plan already approved for execution.

## Recommendation

Fix **#221, #200, #225, and the concrete input-contract defect found while
investigating #179** before releasing v1.0. These reproduce against the current
local bundle. Then make small documentation corrections for #176 and #100.
Decide explicitly whether the surviving #82 HTML renderer defect merits a
compatibility fix or a deprecated-feature closure.

The most useful optional drawing additions are #222 (polygon holes), #201
(rounded rectangles), and #27 (native Bezier rendering). They are feature
requests, not reasons to keep delaying the release. None requires adding a
runtime package dependency.

Many other requests already have corresponding functionality in `revamp`.
Where that functionality is unreleased, close the issue with a release/version
reference after shipping, not merely because the local branch works. Framework
and browser-specific reports may still need confirmation from their reporters.

## Reproduced findings

### #221: UIDragger does not receive the mouse drag stream

This is no longer just a Firefox/Safari report. In Chromium, an actual mouse
press followed by four movements generated four `drag` callbacks on the UI,
but **zero `onDrag()` callbacks**. The rectangle did not move. Both manual
`UI.track(...)` forwarding and the new `space.track(...)` API behave this way.

`src/Space.ts:729` dispatches `drag` while pressed, whereas `src/UI.ts:662`
registers the dragger's internal motion handler for `move`. Its outside-shape
hold is also for `move`. A correction must cover movement outside the hit area,
release/cancel, and touch input without introducing duplicate callbacks.

The existing dragger unit test explicitly sends `down`, then `move`, then
`drop`, so it does not exercise the stream produced by Space. All 543 tests
still pass. This is a gap in the earlier launch validation, not proof that the
issue is stale. Add a real mouse-to-Space-to-UIDragger integration test.

### #200: Pointer coordinates become wrong after a layout shift

With a live, auto-resizing canvas, I inserted a 150px spacer above its
container without changing its dimensions. A pointer 20px from the canvas's
top-left was reported as **`(20,170)` instead of `(20,20)`**. The actual canvas
top was 150; the cached bound top was still zero.

`src/Space.ts:661` uses the cached `bound.topLeft`; `touchesToPoints` has the
same assumption. ResizeObserver does not make a position-only change into a
size change. Resolve the current position for input conversion while retaining
custom event targets, scrolling, and touch support. Simply switching to
`offsetX/offsetY` would be incorrect for some custom-target/overlay events.

### #225: Empty CanvasSpace input still contradicts the documented fallback

Current results:

| Input                           | Result                                     |
| ------------------------------- | ------------------------------------------ |
| `new CanvasSpace()`             | Throws while reading `undefined[0]`        |
| `new CanvasSpace(null)`         | Throws while reading `null[0]`             |
| `new CanvasSpace("")`           | Throws because `#` is not a valid selector |
| `new CanvasSpace("missing-id")` | Creates the missing canvas successfully    |

The fallback is therefore not completely unreachable, as the original report
suggested; it is the **empty-input case** that is broken. The constructor at
`src/Canvas.ts:54` requires an argument in TypeScript, while its documentation
promises a default when left empty. Make the runtime, declaration, and docs
agree, preferably by implementing the documented default.

### #179: Some accepted point input really does fail at runtime

The distinctions between `GroupLike`, `PtIterable`, and `PtLikeIterable` are
now documented in `src/Types.ts`. But this is not only a documentation issue:

```js
form.paragraphBox(
  [
    [0, 0],
    [100, 100],
  ],
  "text",
);
// TypeError: p[0].$max is not a function

form.paragraphBox(
  Group.fromArray([
    [0, 0],
    [100, 100],
  ]),
  "text",
);
// Works
```

Reproduced with both CanvasForm and SVGForm. `src/Canvas.ts:1521` accepts
`PtLikeIterable`, but passes unconverted numeric arrays to `Rectangle.size`,
which expects actual Pts. Normalize the declared accepted inputs and add
runtime cases corresponding to the type contract. This is a concrete current
example of #179's broader complaint, not the reporter's original Curve sample.

### #176 and #100: Two worthwhile documentation/API traps

- **#176, color output:** `Color.hsl(268, .37, .51)` retains the correct HSL
  numbers, but its default string is not valid CSS HSL. Its `.rgb` getter
  formats the channels as `rgb(268,0,0)`; it does not convert color spaces.
  `Color.HSLtoRGB(color).rgb` produces the expected purple. Add a clear
  rendering example and distinguish formatting from conversion. Do not label
  the underlying HSL conversion math broken based on this report.
- **#100, circle transforms:** a circle centered at `(10,10)` with radius 5,
  followed by `circle.moveTo(20,20)`, ends up with radius 15. Group correctly
  translates both Pts, but a circle's second Pt encodes a radius, not a
  position. Document moving `circle[0]` instead; consider explicit circle
  helpers later. Do not change generic Group transforms to guess shape type.

### #82: A real defect remains in deprecated HTML rendering

Two HTMLForms using `scope(theSamePlayer)` produce the same generated element
ID. Drawing a circle with one and text with the other leaves **one text div**,
not two separate objects. `HTMLForm.scopeID` at `src/Dom.ts:659` includes the
player ID but no form identity. New SVGForms have separate managed groups and
do not use this scheme.

A small compatibility fix is reasonable if HTMLForm remains supported through
v1.0. Otherwise close explicitly as a deprecated renderer limitation with an
SVG migration note; do not call it fixed.

## Every open issue

"Covered" below means the corresponding current implementation was inspected
and, where indicated, exercised. It is a closure candidate, not a claim that
every historical browser/framework configuration was reproduced.

| Issue                                                                                  | Assessment                                                                                                                                                                                                               | Suggested disposition                                                                                                                      |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| [#226](https://github.com/williamngan/pts/issues/226) Existing SVG objects             | Main preservation problem is addressed: an existing rectangle survived startup and subsequent frames in the browser probe. Existing-object interactions and drawing directly inside `action` are separate concerns.      | Reply with the current SVG lifecycle and a state-in-action/draw-in-animate example; confirm the remaining request before closing.          |
| [#225](https://github.com/williamngan/pts/issues/225) Empty CanvasSpace input          | Confirmed empty-input failures; missing nonempty IDs work.                                                                                                                                                               | Fix before launch.                                                                                                                         |
| [#224](https://github.com/williamngan/pts/issues/224) Draggable corner points          | Usage/example request, but the intended UIDragger solution is currently blocked by #221.                                                                                                                                 | After fixing dragging, provide a small four-handle example; no new geometry API needed.                                                    |
| [#222](https://github.com/williamngan/pts/issues/222) Polygon holes                    | No high-level compound-ring drawing API. The discussion correctly distinguishes path construction from the fill rule.                                                                                                    | Valuable enhancement: outer ring plus hole rings and a fill rule across Canvas/SVG. Not a launch blocker.                                  |
| [#221](https://github.com/williamngan/pts/issues/221) UIDragger in Firefox/Safari      | Confirmed with real mouse input in Chromium too.                                                                                                                                                                         | Fix before launch and add end-to-end drag tests.                                                                                           |
| [#217](https://github.com/williamngan/pts/issues/217) Rectangle.toCircle docs          | Covered: parameter is now `enclose`, with matching documentation. A 60×60 rectangle yields radius ≈42.426 when true, 30 when false.                                                                                      | Close with the corrected docs/release reference.                                                                                           |
| [#216](https://github.com/williamngan/pts/issues/216) OffscreenCanvas contexts         | Covered by `RenderingContext2D`, including OffscreenCanvasRenderingContext2D. Native offscreen drawing produced the expected opaque pixel.                                                                               | Close with the supported type/signature.                                                                                                   |
| [#211](https://github.com/williamngan/pts/issues/211) Variable-thickness lines         | Still a feature request; ordinary canvas line width is uniform.                                                                                                                                                          | Keep in the drawing-feature backlog, not the v1.0 defect list.                                                                             |
| [#210](https://github.com/williamngan/pts/issues/210) SVG export/text layout           | Substantially addressed by SVGForm parity, `toSVG(true)`, SVG paragraphs, and public `Typography.truncate`. Capturing arbitrary existing canvas commands or exposing full paragraph layout data is not the same feature. | Reply with the new APIs and narrow any remaining request.                                                                                  |
| [#209](https://github.com/williamngan/pts/issues/209) Brush library                    | Maintainer already explicitly declined this for core Pts in the discussion.                                                                                                                                              | Close as out of core scope, or move to an external project discussion.                                                                     |
| [#201](https://github.com/williamngan/pts/issues/201) roundRect                        | Still absent from the form API.                                                                                                                                                                                          | A useful small addition, with SVG parity and radius edge-case tests; optional for v1.0.                                                    |
| [#200](https://github.com/williamngan/pts/issues/200) Layout-shift coordinates         | Confirmed stale coordinates after a position-only change.                                                                                                                                                                | Fix before launch.                                                                                                                         |
| [#199](https://github.com/williamngan/pts/issues/199) HiDPI crisp lines                | Report does not distinguish a CSS pixel from a device pixel or supply a minimal current comparison.                                                                                                                      | Ask for DPR, line placement/width, screenshot, and expected pixel semantics. Do not change the coordinate system based on this alone.      |
| [#197](https://github.com/williamngan/pts/issues/197) Safari movement                  | Old Safari/remote-browser report mixes failed dragging and bad offsets; overlaps #221 and #200.                                                                                                                          | Retest after those fixes; consolidate if symptoms match, rather than assuming resolved.                                                    |
| [#194](https://github.com/williamngan/pts/issues/194) Unmount/dispose                  | Covered by synchronous frame cancellation, listener/observer cleanup, and lifecycle tests. The sample's effect should also dispose the instance created by that effect, not a stale state closure.                       | Reply with the corrected cleanup pattern and release reference.                                                                            |
| [#187](https://github.com/williamngan/pts/issues/187) Oklab                            | Implemented with Oklab/Oklch factories and conversion tests.                                                                                                                                                             | Close after release.                                                                                                                       |
| [#184](https://github.com/williamngan/pts/issues/184) canvas-sketch sizing             | CanvasSpace owns sizing; an externally managed canvas can use CanvasForm directly. The separate gradient defect was confirmed fixed in the issue discussion.                                                             | Answer with the ownership distinction. A non-owning Space mode would be a separate enhancement, not a silent behavior change.              |
| [#183](https://github.com/williamngan/pts/issues/183) Missing source maps              | Modern build ships checked matching maps and embedded sources; old `dist/es2015` layout is replaced.                                                                                                                     | Close with the new package/release reference.                                                                                              |
| [#181](https://github.com/williamngan/pts/issues/181) Sound demos                      | Maintainer confirmed a fix in 2022. Current sound code and native audio tests have also changed substantially.                                                                                                           | Close the historical report; ask for a specific new demo/browser if a current failure remains. No fresh listening test was performed here. |
| [#179](https://github.com/williamngan/pts/issues/179) Point input types                | Documentation improved, but a current `paragraphBox` declaration/runtime mismatch reproduces in both renderers.                                                                                                          | Fix the concrete accepted-input defect and add representative contract tests.                                                              |
| [#177](https://github.com/williamngan/pts/issues/177) Group.segments returns arrays    | Covered: split/segments now return real Groups, including loop-back segments; direct probe and tests pass.                                                                                                               | Close after release.                                                                                                                       |
| [#176](https://github.com/williamngan/pts/issues/176) HSL rendering                    | Correct HSL values, but formatting is not conversion and default output is not CSS-ready.                                                                                                                                | Add a small conversion/rendering example; consider a separately specified CSS-output helper.                                               |
| [#175](https://github.com/williamngan/pts/issues/175) Mobile 404                       | Old nonspecific report; maintainer could not reproduce it. No affected URL/device/version was established.                                                                                                               | Request a current URL/repro, then close if none. Do not infer deployment health from local responsive tests.                               |
| [#166](https://github.com/williamngan/pts/issues/166) Patterns                         | Canvas patterns are implemented and tested through Img. SVG patterns are not supported by the current SVG paint API.                                                                                                     | Close the Canvas part; keep a narrowly named SVG-pattern enhancement only if still wanted.                                                 |
| [#165](https://github.com/williamngan/pts/issues/165) Downloads                        | `Util.download` handles Canvas images; SVG serialization also exists. The reopened discussion concerns broader embedded DOM/foreignObject export.                                                                        | Separate the fulfilled basic download request from broader export work.                                                                    |
| [#163](https://github.com/williamngan/pts/issues/163) Transitions versus Tempo         | A scene-sequencing/tutorial question, not a reproduced Tempo defect.                                                                                                                                                     | Answer with explicit scene state and interpolation, or move to discussions.                                                                |
| [#160](https://github.com/williamngan/pts/issues/160) MediaRecorder types              | Current TypeScript DOM declarations include MediaRecorder; consumer/type tests pass without the old separate types package.                                                                                              | Close with the modern toolchain requirement.                                                                                               |
| [#158](https://github.com/williamngan/pts/issues/158) Keyboard tracking                | `bindKeyboard` and key actions are implemented and tested.                                                                                                                                                               | Close.                                                                                                                                     |
| [#156](https://github.com/williamngan/pts/issues/156) One-shot rendering API           | `playOnce` remains; there is no distinct convenient public one-shot render method.                                                                                                                                       | Valid small API enhancement, not a broken existing contract.                                                                               |
| [#155](https://github.com/williamngan/pts/issues/155) Unbinding mouse                  | Covered: tracked listeners are removed correctly. Native mouse movement after unbinding produced no action callbacks, including a custom target.                                                                         | Close with a release reference and ask for a fresh repro if needed.                                                                        |
| [#152](https://github.com/williamngan/pts/issues/152) Svelte hot reload                | Core readiness/disposal/remount paths are fixed and tested. The historical Svelte HMR environment itself was not recreated.                                                                                              | Ask the reporter to retest revamp/release; close if the lifecycle fixes resolve it.                                                        |
| [#145](https://github.com/williamngan/pts/issues/145) resize() error                   | Answered: enable `setup({resize:true})` and use the player resize callback; `resize()` itself requires a Bound. Guide now explains the setup flag.                                                                       | Close as answered, with a current example.                                                                                                 |
| [#141](https://github.com/williamngan/pts/issues/141) Mouse behind overlays            | Custom input targets solve the stated overlay problem. Native probe tracked the pointer over a button through its parent container.                                                                                      | Reply with `bindMouse(true, element)`; a new manual-coordinate API is not required for this use case.                                      |
| [#129](https://github.com/williamngan/pts/issues/129) Locomotive Scroll/Safari         | Old third-party/browser performance report without a runnable current reproduction.                                                                                                                                      | Request current versions and a profile, preferably after #200 is fixed. Not safe to label fixed.                                           |
| [#123](https://github.com/williamngan/pts/issues/123) Vue wrapper                      | Direct Vue integration is covered by a maintained consumer fixture; a separately published wrapper remains an ecosystem choice.                                                                                          | Move to ecosystem/discussions, consistent with the React/CLI scope.                                                                        |
| [#122](https://github.com/williamngan/pts/issues/122) Resize lag                       | Resize handling is substantially different now, but that alone does not prove the old timing/gradient report resolved.                                                                                                   | Retest the current branch with a minimal dynamic-resize example and current browser details.                                               |
| [#121](https://github.com/williamngan/pts/issues/121) Rounded polygon corners          | Still unimplemented; arbitrary per-vertex rounding is broader than #201's rectangles.                                                                                                                                    | Keep a separate lower-priority feature request; do not close it merely when roundRect is added.                                            |
| [#120](https://github.com/williamngan/pts/issues/120) Conditional SVG shapes           | Covered by frame reconciliation. A native probe switched polygon → rectangle → nothing without a stale shape.                                                                                                            | Close after release.                                                                                                                       |
| [#113](https://github.com/williamngan/pts/issues/113) Elliptical gradients             | Existing context transformations provide the approach discussed by the maintainer; no elliptical-gradient convenience API was added.                                                                                     | Answer with a small transform example or keep as an optional convenience request.                                                          |
| [#110](https://github.com/williamngan/pts/issues/110) SVG parsing                      | SVG import/path parsing is still absent; rendering/export is not import.                                                                                                                                                 | Keep outside the launch scope; use an explicit integration rather than adding a parser dependency to core.                                 |
| [#107](https://github.com/williamngan/pts/issues/107) Firefox CPU                      | Historical investigation pointed at browser Canvas2D operations, and the linked Mozilla issue is still open. No current Firefox profile was obtainable here.                                                             | Request fresh profiles before choosing a Pts optimization or closure.                                                                      |
| [#103](https://github.com/williamngan/pts/issues/103) Alternate event target           | Covered by custom target arguments on binding methods; native overlay test passed.                                                                                                                                       | Close with a current example.                                                                                                              |
| [#100](https://github.com/williamngan/pts/issues/100) Circle/Group transforms          | Reproduced radius mutation when translating the whole encoded circle Group.                                                                                                                                              | Clarify the representation and center-only movement; consider shape-aware helpers separately.                                              |
| [#82](https://github.com/williamngan/pts/issues/82) HTML form IDs                      | Same-player scopes still collide across HTMLForms.                                                                                                                                                                       | Small compatibility fix or explicit deprecated-renderer closure; not resolved.                                                             |
| [#41](https://github.com/williamngan/pts/issues/41) Safari physics                     | Safari 11-era report. Physics and input changed substantially, but Safari behavior was not retested.                                                                                                                     | Request current reproduction after input fixes; do not assert browser parity from Chromium tests.                                          |
| [#28](https://github.com/williamngan/pts/issues/28) Audio support                      | Core audio generation, loading, analysis, and visual mapping are implemented. The music-theory integration ideas are broader.                                                                                            | Close the basic audio request; separate any still-desired external music integration.                                                      |
| [#27](https://github.com/williamngan/pts/issues/27) Native curve rendering             | Curve.bezier still samples points for a polyline; there is no high-level native Bezier form method.                                                                                                                      | Worthwhile enhancement, especially for compact SVG output; optional for launch.                                                            |
| [#17](https://github.com/williamngan/pts/issues/17) Runtime version                    | No `Pts.version`; package.json is available to module consumers but is not the requested browser API.                                                                                                                    | Small useful enhancement, generated from package metadata to prevent drift.                                                                |
| [#13](https://github.com/williamngan/pts/issues/13) SVG text layout                    | SVGForm inherits both textBox and paragraphBox. Native Group-input probe produced four text lines and exported them as SVG. The numeric-array problem is tracked under #179 above.                                       | Close the missing-feature request after release.                                                                                           |
| [#12](https://github.com/williamngan/pts/issues/12) Context transformation convenience | Raw `form.ctx` transformations remain available; no new convenience wrapper was added.                                                                                                                                   | Optional API design request, not a launch defect.                                                                                          |

## Validation and limitations

- `pnpm test`: **543 passed in 26 files**, no type errors.
- Separate Chromium probes reproduced the defects described above against
  the committed readable browser bundle, with actual mouse input for dragging,
  layout shifts, overlay targets, and unbinding.
- Additional probes verified Group segments, native OffscreenCanvas drawing,
  SVG conditional-shape reconciliation, preservation of existing SVG content,
  and SVG paragraph rendering/export with valid Group input.
- Firefox and WebKit could not launch because the container lacks their system
  libraries. This review does not claim those engines, physical touch devices,
  Svelte HMR, or the live deployment were validated.
- Temporary probe source/results and the test log are in
  `/tmp/pts-issue-triage.q4oZbv/`; they are not shipped or committed and are
  disposable with this container.

Issue bodies/discussions were read from GitHub's public API. The current
upstream status referenced for #107 was checked at
[Mozilla bug 1651284](https://bugzilla.mozilla.org/show_bug.cgi?id=1651284).
The source references above refer to the reviewed local commit, not the
deployed website or an assumed future release.
