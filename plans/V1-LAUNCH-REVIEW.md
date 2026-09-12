# Pts v1.0 launch review

Historical review of the baseline below. A follow-up fix pass addresses the
in-repository findings in separate commits; the external React wrapper is
excluded at the maintainer's request. See `THIRD-PARTY-AUDIT.md` for the
dependency/provenance findings and the distinction between package dependencies
and adapted source. The original observations and source line numbers below
refer to the reviewed baseline, not the subsequently fixed code.

Reviewed on September 5, 2026. Branch: `revamp`, commit
`8f594997f5e9cf30f10b10a2d11345640bc88753` (`Update guide`). Comparison:
`master...revamp`, 81 commits and 483 changed files.

## Follow-up fixes

The in-repository findings have been addressed in individual fix commits.
Generated release bundles, source maps, API documentation, guide HTML, and
editor API data are refreshed in a separate artifact commit. The external
React wrapper and CLI repositories are unchanged, as requested.

- Physics preserves velocity across changing frame/substep durations.
- SVG captures per-shape stroke settings, reconciles gradient definitions,
  preserves its refresh policy, and applies blend modes through CSS. Legacy
  static drawing calls work again. Bounded Voronoi diagrams now construct
  complete hull cells, including small/collinear inputs.
- Space disposal cancels pending DOM readiness and removes owned canvases.
  UI removal resets tracking and detaches obsolete abort listeners; line hit
  tests use finite segments.
- Pending image work cannot revive disposed instances. Idle sound input
  disposal stops its tracks, and custom oscillators use the native
  periodic-wave API. Representative Web Audio tests now run in Chromium.
- `Bound.fromGroup` accepts the array-like inputs in its declared contract.
  Guide touch controls no longer restart playback on synthetic mouseleave.
- Default animation timing starts from the first real frame. The final gate
  also exposed a distinct startup bug: an actual RAF timestamp of exactly
  zero was mistaken for a duplicate manual `play()` call, permanently
  abandoning the scheduled loop. A failing deterministic regression test
  reproduced it; the fix preserves nested/manual-call protection. The hero
  check also waits for a painted scene and reports useful failure details.
- Documentation changes are limited to factual SVG support restrictions and
  image/SVG migration notes, without rewriting the guides' voice.
- The website editor bundles patched DOMPurify 3.4.14. Full third-party
  notices ship with the library and relevant website assets. The Delaunator
  adaptation is retained, not rewritten or removed; see the separate
  [third-party audit](THIRD-PARTY-AUDIT.md) for its introduction and the
  distinction between runtime dependencies and adapted source.

Remaining release coordination is outside this fix pass: choose/bump the
release version, coordinate the external ecosystem packages, and verify CI
and deployment. No package was published or branch pushed. Browser execution
remains Chromium-only: Firefox/WebKit binaries were available, but this
container lacks their required system libraries and could not install them.
Physical touch hardware was not exercised.

The host's original native dependency installation was preserved at
`.wt/launch-fixes-host/node_modules`; the working Linux installation was
created from the frozen pnpm lockfile.

### Follow-up validation

The complete `pnpm check` passed after the fixes, including formatting,
lint, TypeScript, coverage, generated documentation freshness/browser checks,
build artifacts, benchmark correctness, site checks, packed consumers, and
publishing checks.

| Check                 | Final local result                                                           |
| --------------------- | ---------------------------------------------------------------------------- |
| Vitest                | 543 tests passed in 26 files; no type errors                                 |
| Coverage              | 97.46% statements, 90.70% branches, 99.08% functions, 98.15% lines           |
| Site                  | All 29 checks passed, including all 80 authored demos                        |
| Homepage startup      | Zero-timestamp regression passed; five consecutive isolated hero runs passed |
| Benchmark correctness | 385 cases, zero failures or suspicious results                               |
| Packed consumers      | React, Vue, vanilla, and skia-canvas passed                                  |
| Publication           | publint and Are the Types Wrong passed                                       |
| Archive               | 1,118,040 bytes; no runtime dependency installation                          |
| Root dependency audit | Zero known advisories                                                        |
| Committed artifacts   | `git diff --exit-code -- dist` passed after the gate rebuilt them            |

Logs for this sandbox run are in `/tmp/pts-launch-fixes-check-final.log` and
`/tmp/pts-launch-fixes-audit-final.json`. These temporary logs do not persist
with the repository. The original review below remains as historical evidence,
not a statement that its fixed defects are still present.

## Decision

Do not launch this commit as v1.0 yet. The build, package exports, documentation
generation, and maintained integration fixtures are in good shape. However,
targeted runtime checks reproduce several correctness defects outside the
existing suite, the advertised React wrapper does not accept a v1.0 package,
and the release validation is not green.

This is a review, not an implementation pass. No library, guide, or test fixes
were made in the working repository. Experiments ran in an isolated checkout.
The findings below describe observed behavior; they are not a claim that every
possible defect has been found.

Priority: P1 means resolve before launch; P2 means a confirmed issue to fix or
explicitly account for in the v1.0 support and migration contract.

## Validation performed

| Check                                                | Result                                                                               |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Clean installation from the frozen pnpm lockfile     | Passed                                                                               |
| Formatting, lint, TypeScript                         | Passed                                                                               |
| Vitest including browser, visual, and type tests     | 515 tests passed in 25 files                                                         |
| Coverage                                             | 97.25% statements, 90.20% branches, 99.07% functions, 97.91% lines                   |
| Documentation generation/freshness                   | Passed: 81 API pages, 11 guides, 38 live guide demos, no TypeDoc warnings            |
| Documentation browser checks                         | Passed                                                                               |
| Build and artifact/export/size checks                | Passed: 12 artifacts, 46 module exports                                              |
| Benchmark correctness dry run                        | Passed: 385 cases, no failures or suspicious sinks                                   |
| Readable/minified browser bundles                    | Passed Chromium smoke tests                                                          |
| Full site checks                                     | 27 passed, 2 failed                                                                  |
| Packed-package checks                                | Passed exports, declaration resolution, allowlist, reproducibility, and tree-shaking |
| Packed React/Vue/vanilla/skia-canvas fixtures        | Passed                                                                               |
| publint and Are the Types Wrong                      | Passed                                                                               |
| Locally packed 1.0.0 ESM/CJS runtime smoke           | Passed Node 20.20.2, 22.23.2, and 24.20.0                                            |
| Published react-pts-canvas with locally packed 1.0.0 | Failed: npm ERESOLVE                                                                 |
| Rebuild versus committed dist files                  | Failed: four stale JavaScript source maps                                            |
| Dependency audit                                     | Four DOMPurify advisories: two moderate, two low; no high/critical advisories        |

The existing `/app/node_modules` initially lacked a native Rolldown binding.
A clean installation in the isolated checkout resolved that environment issue.
The results above use that clean installation. Package/integration/publishing
checks were run separately after the full gate stopped at the site failures.

## P1 findings

### 1. The advertised React integration rejects Pts 1.0.0

The published `react-pts-canvas@0.5.2` declares `pts: ^0.12.8` as a peer.
A clean consumer using React 18.3.1, React DOM 18.3.1, that wrapper, and the
locally packed Pts 1.0.0 fails `npm install --dry-run` with `ERESOLVE`.
This is a package compatibility issue even if the wrapper's rendering code
works with the new library.

The current Pts package is still `0.12.9` (`package.json:3`). CI's wrapper
source-build job (`.github/workflows/ci.yml:53`) does not establish that the
published wrapper can be installed with the intended release version.

Before launch, release a compatible wrapper and test an ordinary consumer
installation using its published package and the Pts release candidate.
Do not use forced peer resolution as the compatibility test.

Source: [wrapper manifest at the pinned CI revision](https://github.com/williamngan/react-pts-canvas/blob/4a34c2327c2041011ab75de5d8f4d1811b574dc7/package.json).

### 2. The adapted Delaunator code lacks its ISC permission notice

`src/Create.ts:328` explicitly identifies its triangulation implementation as
adapted from Delaunator. The source has a short attribution, but the repository
has only the Apache `LICENSE`, and the shipped files lack Delaunator's ISC
permission notice. `tsdown.config.mts:19` also disables legal comments, and
the standalone bundles retain only the Pts banner.

The [upstream ISC license](https://github.com/mapbox/delaunator/blob/main/LICENSE)
requires retention of both the copyright and permission notices. Include the
upstream notice with distributed code, including standalone browser artifacts,
and update the package allowlist checks accordingly. Check the other bundled
third-party website assets during the same packaging pass.

### 3. Physics lost time correction between updates

`src/Physics.ts:388` ignores the previous timestep. Equal substeps within one
update do not imply equal timesteps across consecutive updates.

Reproduction: a free particle with `hit(10, 0)`, no gravity or friction, a
large enclosing bound, and `world.substeps = 1`. Apply updates of
`16, 16, 1, 32` milliseconds:

| Branch | Particle displacement per update |
| ------ | -------------------------------- |
| master | 10, 10, 0.625, 20                |
| revamp | 10, 10, 10, 10                   |

Velocity therefore changes with frame timing. Restore timestep-aware velocity
integration and cover changing frame times, not only fixed-step trajectories
or constraint rest lengths.

### 4. SVG applies later stroke settings to earlier shapes

`src/Svg.ts:415` captures only part of the paint state. `_flushShape` reads
line width, caps, joins, and dashes from the current context at
`src/Svg.ts:634`, after the next shape's style setters have already run.

Reproduction through the public form API:

```js
form.strokeOnly("#f00", 2).line([
  [0, 10],
  [100, 10],
]);
form.strokeOnly("#00f", 10).line([
  [0, 20],
  [100, 20],
]);
form.svgContext.commitFrame();
```

Both SVG paths have `stroke-width="10"`. The first should remain 2.
Capture the complete stroke state when the paint call occurs.

### 5. Animated SVG gradients accumulate indefinitely

`src/Svg.ts:68` appends a definition for each new gradient, but frame
reconciliation never retires unused definitions. A probe that draws one
rectangle with one newly positioned gradient each frame leaves 100 gradient
definitions after 100 frames, although only one path remains.

This is the same usage pattern as `demo/canvasform.gradient.js`, where
gradient geometry is recalculated while animating. Reconcile gradient
resources as well as paths so DOM size stays bounded.

There is a related resource-lifecycle defect: after removing the SVG contents
and resetting the context (as `SVGSpace.removeAll` does), reusing an existing
gradient produces a `url(#...)` paint but no corresponding definition.
`materialize` must handle a cached gradient whose DOM node was detached.

### 6. Disposed SVG spaces can recreate DOM after cleanup

`src/Dom.ts:89` schedules `_ready` after 50 ms. `dispose` neither cancels that
timer nor makes `_ready` check the disposed flag.

Reproduction: create an SVGSpace on an existing SVG element, immediately
dispose it, then wait. The host starts empty after disposal but gains a
background rectangle; the ready callback also fires. This can interfere with
a replacement component during rapid unmount/remount or React StrictMode.

Cancel pending readiness and guard the callback against disposed instances.

### 7. Sound disposal can leave microphone capture running

`src/Play.ts:804` returns immediately from `stop` when `_playing` is false.
`dispose` delegates to this path and then clears its stream reference.

Reproduction using Chromium's fake microphone device and real Web Audio:

```js
const sound = await Sound.input();
const track = sound.stream.getAudioTracks()[0];
sound.dispose(); // no preceding start()
console.log(track.readyState); // "live"
```

Input acquisition starts capture independently of connecting audio to the
speakers. Disposal must stop owned media tracks regardless of playback state.

### 8. Guide Pause controls fail on touch

`guide/js/guide.js:387` handles `mouseleave` unconditionally, while only
`mouseenter` is restricted to hover-capable devices.

The existing touch test fails repeatedly. Event instrumentation shows that
the second tap emits a synthetic `mouseleave`, which calls `stop`; the
subsequent button click then sees an inactive demo and starts it again.
The button remains pressed instead of pausing.

Apply consistent hover/pointer handling to both entry and exit. Keep the
existing touch regression test.

### 9. The committed release gate is not green

The full `pnpm check` stops at the two site failures. The touch failure above
is reproducible. The homepage hero check failed twice with
`the initial divider did not receive connectors`, then passed during an
instrumented rerun. Treat the hero failure as intermittent until its timing
or behavior is isolated; this review does not establish a permanent hero
rendering failure.

A clean build also changes:

- `dist/index.js.map`
- `dist/index.mjs.map`
- `dist/pts.js.map`
- `dist/pts.min.js.map`

Only embedded source text for `Space.ts`, `Image.ts`, and `Play.ts` differs;
the executable bundles and mapping coordinates are unchanged. This is a
freshness failure, not a nondeterministic compiler result. The separate
`git diff --exit-code -- dist` CI step will fail even after site checks pass.
Regenerate and commit those artifacts as part of the release preparation.

## Additional confirmed P2 findings

| Area and source                               | Reproduction and observed behavior                                                                                                                | Required correction or decision                                                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| SVG default refresh, `src/Dom.ts:132`         | Ready handling overrides SVGSpace's `refresh(true)` with `false`. Draw one frame, then draw nothing: the old path remains.                        | Preserve the renderer's refresh policy during readiness.                                                                               |
| Canvas remount, `src/Canvas.ts:472`           | `new CanvasSpace(div).dispose(); new CanvasSpace(div)` leaves two canvases in the same container.                                                 | Clean up canvases owned by the space while preserving user-supplied canvas elements.                                                   |
| Default animation startup, `src/Space.ts:125` | `play()` consumes the first-frame flag at synthetic time 0; a first RAF timestamp of 50000 yields an elapsed time of 50000.                       | Initialize timing from the first real animation timestamp; test default `play()` as well as explicit timestamps.                       |
| UI AbortSignal, `src/UI.ts:256`               | A once-only handler fires, another handler reuses its slot, and aborting the old signal removes the replacement.                                  | Remove obsolete abort listeners or bind removal to registration identity rather than the reused slot.                                  |
| UI retracking, `src/Space.ts:579`             | `track(ui)`, `removeAll()`, then `track(ui)` no longer forwards actions. The internal forwarding player was removed, but `_uiPlayer` remains set. | Keep internal tracking state consistent with player removal.                                                                           |
| Line/polyline hit tests, `src/UI.ts:25`       | A line from `[0,0]` to `[10,0]` accepts a hit at `[100000,0]` with threshold 1.                                                                   | Use distance to the finite segment, not its infinite supporting line.                                                                  |
| SVG blend modes, `src/Svg.ts:649`             | The path gets a `mix-blend-mode="multiply"` attribute, but computed CSS remains `normal`.                                                         | Set the actual CSS property and verify rendered/computed behavior, not just attribute presence.                                        |
| Pending image disposal, `src/Image.ts:527`    | Start a noneditable image load, dispose immediately, then await the load: it resolves with `loaded === true` and `current === null`.              | Settle/cancel pending loads during disposal and prevent later callbacks from reviving state.                                           |
| Custom sound waves, `src/Play.ts:412`         | `Sound.generate("custom", periodicWave)` throws a real browser InvalidStateError when setting `osc.type = "custom"`.                              | Use `setPeriodicWave` without assigning that forbidden type value. This defect also exists on master.                                  |
| Bound input contract, `src/Pt.ts:1090`        | `Bound.fromGroup([[0,0],[10,20]])` is accepted by `PtLikeIterable` but throws `this.p1.clone is not a function`.                                  | Convert array-like input to Pts or narrow the public input contract.                                                                   |
| Legacy SVG static API, `src/Svg.ts:1109`      | Former `SVGForm.circle(legacyContext, pt, radius)` now resolves to the inherited canvas helper and throws `ctx.beginPath is not a function`.      | Provide compatible dispatch or document migration to the renamed `*Element` helpers. The class comment currently claims compatibility. |

## Compatibility and documentation decisions

The release notes need a precise migration section. Static `Img.load` now
returns a Promise instead of an immediately available Img; mentioning this
only under `Img.loadAsync` deprecation understates the change. The renamed
SVG static helpers and removed SVG-only helpers also need explicit treatment.
These changes may be reasonable in a major release, but users need correct
before/after examples.

The broad promise that any canvas sketch runs unchanged on SVG should be
narrowed to the supported subset. The source itself identifies unsupported
clipping, image-data writes, and certain composites; other unsupported paths
include source-cropped image drawing. This requires factual edits, not a
rewrite of the guides' tone.

The bounded Voronoi API has an additional existing geometric limitation:
four square-corner sites produce cells containing only the repeated center
point, even when the same square is supplied as the bound. Clipping existing
circumcenter polygons does not construct the unbounded hull cells. Decide
whether complete bounded diagrams are supported, implement the missing hull
handling if so, and otherwise document that limitation.

`pts-cli` is not currently published under that npm name, but the Ecosystem
guide explicitly says installation details will follow its public release.
That is not a blocker if it remains clearly presented as forthcoming.

## Security and remaining validation limits

The package has no runtime dependency tree. However, the website bundles
Monaco and DOMPurify: `demo/edit/vs/monaco.js:55097` identifies DOMPurify 3.4.8.
The dependency audit reports four advisories against it. This review did not
demonstrate an exploitable path through the editor's current configuration;
the advisories involve specific hooks/configuration. Update the sanitizer
dependency and regenerate the shipped editor bundle, then rerun its checks.

References: [DOMPurify IN_PLACE advisory](https://github.com/advisories/GHSA-55q2-fjhq-7xh7)
and [DOMPurify configuration advisory](https://github.com/advisories/GHSA-cmwh-pvxp-8882).

Browser execution in this review was Chromium only. Firefox/WebKit and
physical touch devices were not exercised. The sound suite uses a fake
AudioContext, which is why the custom-wave platform error can coexist with
100% coverage for Play.ts. Add representative real Web Audio tests.

GitHub Actions run status and deployment settings were not verified because
the GitHub CLI is unauthenticated. No registry publish, deployed CDN test, or
live website deployment was performed. The benchmark run checked correctness;
it was not a new performance A/B study.

## Proposed launch gate

Resolve the P1 findings, fix or explicitly account for P2 behavior, and test
the public ecosystem install with the intended v1.0 version. Regenerate the
library/docs/editor artifacts, run the entire gate from a clean checkout,
and require a clean tracked-artifact diff. Then prepare a v1.0 release
candidate with complete migration notes and validate the actual published
candidate, CDN URLs, and supported browsers before promoting it.

## Local evidence

Temporary evidence from this review is retained at:

- `/tmp/pts-launch-review.xjosJE/`: isolated checkout and `review-probes.mjs`.
- `/tmp/pts-launch-review.xjosJE-probes.json`: targeted browser results.
- `/tmp/pts-launch-review.xjosJE-check-clean.log`: full original validation run.
- `/tmp/pts-launch-review.xjosJE-touch-debug.log`: touch event order.
- `/tmp/pts-launch-review.xjosJE-package.log`: packed-package checks.
- `/tmp/pts-launch-review.xjosJE-integrations.log`: integration fixtures.
- `/tmp/pts-launch-review.xjosJE-publishing.log`: publishing checks.
- `/tmp/pts-release-consumers.XAsJJT/`: local-only 1.0.0 tarball, peer-install
  fixture, rejection log, and Node runtime checks.

These temporary paths are supporting evidence, not maintained project tests.
