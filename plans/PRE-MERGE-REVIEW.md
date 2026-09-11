# Pre-merge review: `revamp` → `master` → Pts 1.0.0

Reviewed September 10, 2026 against local `revamp` at `ff275c4`
(`Document moving circle centers without changing their radii (#100)`).
`master` (`0f350d4`) is a direct ancestor, so the merge is a fast-forward
with no conflicts.

This is a review, not a fix pass. No tracked file other than this document
was changed. Every finding below was reproduced against the committed
`dist/` build or in headless Chromium; the earlier
[launch review](V1-LAUNCH-REVIEW.md) and [issue triage](OPEN-ISSUE-TRIAGE.md)
findings were re-checked rather than assumed fixed.

## Fix pass

A follow-up pass on September 10–11, 2026 addressed every finding below
except the external React wrapper, which the maintainer handles in a
separate repository, and the multi-touch limitation noted under "can
follow", which is pre-existing behavior rather than a defect introduced
here. Each fix is its own commit on `revamp`; the generated bundles,
declarations, documentation, and editor assets are refreshed in a final
artifact commit. The review text below is kept as written and describes
the state before those commits.

- Physics solves in substeps sized by elapsed time, and `hit`, drag
  deltas, `changed`, friction, and stiffness are expressed per 60 Hz
  frame; resting bodies stay at rest under every alternating pattern
  tested, and `hit(10)` moves 10 px per frame at any substep count.
- The guide drawer closes on Escape and the close button; the site check
  asserts it is no longer painted.
- SVGForm starts with CanvasForm's 14 px font, keeps fonts under blend
  modes, renders canvas patterns as none with a warning, mirrors styles
  into the legacy scope context, and warns instead of throwing on
  offscreen calls.
- `new SVGSpace()` and `new DOMSpace()` create the documented mount, and
  `dispose()` removes what a space created.
- The changelog names the right symbols and covers the omissions listed
  below; `Util.randomInt` carries its deprecation tag, and the published
  declarations keep their doc comments.
- The editor bundle is verified in the gate (`build-editor.mjs --check`),
  moved guide pages redirect, SKILL.md and the Ecosystem guide state the
  wrapper and CLI status, and vitest is 4.1.11.
- `Group.insert` into itself, `textBox` alignments, exact-fit word
  wrapping, the HTMLForm scope-id collision (#82) and late
  initialization, `untrack` mid-drag, synthetic pointer capture,
  `stop(t)` periods, `Sound.from` inputs without a stream,
  `Polygon.hasIntersectCircle` vertex-axis separation, `Polygon.area`'s
  type, and `Triangle.incircle` on collinear input are fixed with tests.

The Delaunator notice year was not changed: the upstream license file
itself reads 2026.

## Verdict

**Merging `revamp` into `master` is safe.** The complete `pnpm check` gate
passed from this tree, the committed `dist/` matches a rebuild, the package
packs and installs cleanly, and every earlier P1 finding is fixed.

**Do not tag or publish 1.0.0 from this commit.** Three verified regressions
against `master` and one ecosystem break should be resolved first. They are
small, but two of them change how existing sketches behave and one makes the
guide unusable on phones. The rest of this document is ordered by what to do
before the tag, then what can follow in 1.0.x.

| Gate step                | Result                                                |
| ------------------------ | ----------------------------------------------------- |
| Format, lint, typecheck  | Passed                                                |
| Vitest                   | 556 tests in 27 files; coverage 97.46 / 90.49 / 99.08 |
| Docs freshness + browser | Passed                                                |
| Build, artifacts         | 12 artifacts, 46 exports; `git diff -- dist` clean    |
| Benchmark correctness    | 385 cases, 0 failing                                  |
| Site                     | 29 checks incl. 80 authored demos                     |
| Packed consumers         | React, Vue, vanilla, skia-canvas                      |
| publint / attw           | Passed                                                |
| `pnpm pack`              | 1.14 MB; rebuild left `dist/` unchanged               |
| `pnpm audit`             | 2 moderate, both in vitest dev tooling (`< 4.1.11`)   |

## Fix before tagging 1.0.0

### 1. Physics: resting bodies blow up under alternating frame times

`src/Physics.ts:401-404` (commit `d220083`). The `dt / prevDt` correction in
`integrate` multiplies the _post-contact-correction_ previous position, so
every bound contact and edge correction is amplified on the next update.
Random jitter and single hitches are fine (better than master), but a
sustained ~3×+ alternation, which a loaded 120/240 Hz display delivers, is
unstable. Hexagon body resting on the floor, 600 frames, perimeter deviation
from 240:

| Pattern     | master | revamp | revamp, stiffness 1 |
| ----------- | ------ | ------ | ------------------- |
| alt 16/33ms | 21     | 1      | 0.5                 |
| alt 12/33ms | 19     | 293    | 1                   |
| alt 8/33ms  | 19     | 527    | 70                  |
| alt 4/16ms  | 5      | 495    | 0.8                 |
| alt 5/30ms  | 10     | 1081   | 206                 |

A control that passes `prevDt = dt` is stable in every pattern. Direction:
apply the ratio to the integrated velocity only, not to the corrected `prev`.
**Regression.**

### 2. Physics: `hit()` and drag impulses are 4× stronger by default

`src/Physics.ts:194-215`, `Particle.hit` at `:816`. An impulse is applied per
substep, and `World.substeps` defaults to 4. `p.hit(10, 0); world.update(16)`
moves 10 px on master and 40 px on revamp (10 px with `substeps = 1`). The
spec pins `expected * substeps`, so it is deliberate, but the plan listed
`Particle.hit` as must-not-change and the changelog does not mention it.
Every existing sketch that uses `hit()` or pointer drag changes feel. Either
scale impulses by `1 / substeps` in `World`, or document it as breaking.
**Regression.**

### 3. Guide chapter drawer cannot be closed on phones

`guide/js/guide.js:45-61` (commit `4b850e8`), `guide/assets/style.css:701`.
The drawer opens via `#menu:target`; the new close handler calls
`preventDefault()` and clears the hash with `history.replaceState`. Chromium
does not re-evaluate `:target` after `replaceState`, so both the × button and
Escape leave the drawer visibly open (rect still 351×844 at a 390 px
viewport) while `inert`/`aria-hidden` say it is closed. On master the ×
was a plain `href="#"` navigation and worked. `check-site.mjs:335-390` only
asserts ARIA state and focus, not visibility, so the gate passes. Fix by
toggling a class (keep `:target` as the no-JS fallback) or by navigating the
hash instead of replacing it, and add a visibility assertion. **Regression.**

### 4. SVGForm text defaults to 10 px while CanvasForm defaults to 14 px

`src/Svg.ts:988-1000`. The constructor bypasses `_setup`, so
`SVGContext2D.font` keeps its `10px sans-serif` default while `_font` is
`Font(14)`. Text drawn without an explicit `font()` is smaller on SVG, and
`textBox`/`paragraphBox` wrap by 10 px metrics but step lines by 14 px, so
layout diverges. The parity specs miss it because they call `.font(10)`
first. One-line fix: `this._set("font", this._font.value)` in the ctor.
**Regression against the "same sketch on canvas and SVG" contract.**

### 5. `react-pts-canvas` rejects 1.0.0 on the day it ships

`react-pts-canvas@0.5.2` (latest) declares `peerDependencies.pts: ^0.12.8`.
A user project with React 18, the wrapper, and a local 1.0.0 tarball fails
`npm install` with `ERESOLVE`; pnpm installs with a warning. `README.md:43`,
`guide/md/_0100_Get_started.md:29` and `_8000_Ecosystem.md:5-16` recommend the
wrapper with no caveat. The CI job (`ci.yml:72`) cannot catch this: installing
the tarball with `--no-package-lock` rewrites the wrapper's own peer range to
`file:…`, so it passes at any version. The maintainer excluded the wrapper
from the fix pass; this is a reminder that the decision has a user-visible
cost. Options: publish a wrapper release with `pts: ^0.12.8 || ^1.0.0` first,
or add an explicit "not yet 1.0-compatible" note. **Ecosystem, not code.**

### 6. Release mechanics

- `package.json` is still `0.12.9`. Bumping it requires `pnpm docs` because
  `docs.md:4` and `guide.md:4` embed the version and `check:docs` diffs them.
- There are no `v0.12.x` tags; `v1.0.0` must be created by hand.
- `plans/OPEN-ISSUE-TRIAGE.md` is untracked. Commit it or drop it before
  merging.
- `THIRD-PARTY-NOTICES.txt:10` reads `Copyright (c) 2026, Mapbox`; the
  Delaunator notice year is 2017. This text is embedded in every bundle
  banner.
- `SKILL.md:209-212` ends with a literal `# TODO` section listing
  `react-pts-canvas` and `pts-cli`. `pts-cli` is not on npm (404) but is
  documented in `_8000_Ecosystem.md:18-20`.
- `guide/Extensions-8000.html` and `guide/Technical-notes-9000.html` were
  deleted with no redirect stub; inbound links from the web will 404.
- `demo/edit/vs/monaco.js` and `demo/edit/js/edit.js` are committed build
  outputs that no gate step regenerates or compares against `demo/edit/src/`;
  `check-site.mjs:1507-1544` only verifies the cache-busting hashes.

## Changelog corrections

`CHANGELOG.md` is the migration contract. Wrong or missing entries, all
verified against the builds:

- `:95` cites `Rectangle.intersectRay2D`, which does not exist in either
  branch, and `Polygon.intersectPolygon2D` as returning `undefined`, which
  still returns `Group`. The method that actually became `Group | undefined`
  is `Line.intersectPolygon2D`.
- Says `SVGForm.log` "is no longer available". The instance method is
  inherited from `CanvasForm` and works; only the statics
  `SVGForm.styleTo`/`SVGForm.log` are gone.
- Says `Util.randomInt` is deprecated; `src/Util.ts:190-195` has no
  `@deprecated` tag (it warns at runtime only).
- Missing: `Num.mapToRange` / `Range.mapTo` now map reversed target ranges
  directionally and no longer clamp. `Num.mapToRange(2, 10, 0, 0, 100)` is
  20 on master and 80 on revamp. Anyone flipping an axis with
  `range.mapTo(height, 0)` gets inverted output. `Num.normalizeValue` still
  reorients, so the pair is now inconsistent.
- Missing: the Delaunay/Voronoi rewrite. `Delaunay.voronoi(bound?)` gained a
  parameter, triangulation order on cocircular inputs changed, and fewer than
  three or collinear sites now return empty cells instead of throwing.
- Missing: every `Sound` now shares one `AudioContext` (master created one
  per instance; closing one now silences all), `_createAudioContext` removed,
  `createBuffer` made public, `Sound.load` rejects with `Error` not a string.
- Missing: physics impulse scaling (item 2).
- Missing fixes that change numbers: `Line.collinear` (sine-of-angle
  threshold), `Circle.toRect(c, true)` half-side `r/√2`, `Geom.isPerpendicular`
  epsilon, `Mat.scale2D`/`shear2D` zero handling, `Bound.center` setter,
  `Group.moveTo` on empty groups.
- Missing type changes: `SVGForm extends CanvasForm<SVGSpace>`, `CanvasForm`
  generic, `Img.sync()` returns `Promise<Img>`, `Noise.seed(number)`,
  `Pts.quickStart` creates an `SVGSpace` when the mount is or contains
  `<svg>`, nullable returns on `Line.intercept` and `Polygon.hasIntersect*`,
  and the new `exports` map blocks deep imports such as `pts/src/Pt`.

## Should fix, can follow in 1.0.x

- `new SVGSpace()`, `new DOMSpace()`, `null`, and `""` still throw
  (`src/Dom.ts:64-81`) while their docstrings promise a default mount; #225
  was fixed only for `CanvasSpace`. The created ids are also
  `pts_container`/`pts_element`, not the documented ones.
- `DOMSpace.dispose()` (`src/Dom.ts:316-335`) leaves the container it
  created for a missing selector in the DOM and does not reset `_isReady`;
  `CanvasSpace` got both in `94b5269`.
- SVG blend modes overwrite the text `style` attribute, dropping the font
  (`src/Svg.ts:623-640`). `CanvasPattern` fills serialize as
  `fill="[object CanvasPattern]"` with no warning (`src/Svg.ts:611-620`) and
  patterns are absent from the documented unsupported list. The legacy
  `scope()` context never receives the form's fill/stroke, so
  `SVGForm.circle(form.scope(p), …)` draws invisibly.
- `SVGForm.useOffscreen()`/`renderOffscreen()` throw instead of the
  documented warn-and-no-op (`src/Canvas.ts:683-707`).
- `Group.insert(g)` where `g` is the group itself corrupts the result
  (`src/Pt.ts:720-736`): `[1,2,3].insert(self, 1)` → `1,1,1,1,2,3`.
  Regression; copy when `_pts === this`.
- `textBox(..., "center" | "start" | "end")` assigns an invalid
  `textBaseline` and is silently ignored (`src/Canvas.ts:1505`); the type
  now advertises those values.
- `HTMLForm` scope ids still collide across forms on one player (#82,
  `src/Dom.ts:659`), and an `HTMLForm` added after the space is ready throws
  on every draw. Neither fixed nor closed in the changelog; the triage asked
  for an explicit decision.
- `Space.untrack()` mid-drag leaves the dragger `dragging`
  (`src/Space.ts:618-630`); `setPointerCapture` is unguarded for synthetic
  pointerdowns (`:736`); a second finger's `touchend` ends the first finger's
  drag.
- `Sound.from(node, ctx, "input")` without a stream throws in `stop()` and
  `dispose()` (`src/Play.ts:816, 840-845`).
- `Polygon.hasIntersectCircle` still reports false positives (SAT skips the
  centre-to-vertex axis; 11 in 20k random pairs). `Polygon.area()` is typed
  `any`. `Triangle.incircle` on collinear input returns a zero circle or
  `undefined` depending on point order.
- `demo/ui.track.js:86` calls `UI.track` with three arguments while the
  declaration requires `evt`; TypeScript users copying it get a compile error.
- `dist/index.d.ts` ships with no JSDoc (`removeComments: true`, also on
  master), so the `@deprecated` tags the changelog relies on never reach an
  editor. Worth turning off for the `dts` build.
- Bump vitest to 4.1.11 to clear the two moderate audit advisories.

## Verified as sound

Real-mouse and synthetic-touch drags through `UIDragger` on Canvas, SVG,
`space.track`, and legacy `UI.track` paths, including movement and release
outside the element; #200 coordinates under scroll, transform, scale, and
overlay targets; the animation loop under zero, repeated, and resumed
timestamps; listener and abort-signal hygiene; Tempo timing; seeded RNG
bit-identical to master; Pt/Group/Bound arithmetic and iteration across ~300
A/B probes; Color round trips in all eight modes; Voronoi cell areas and
nearest-site invariants; noise range and determinism; all `Img.load` call
sites in guides and demos awaited; no removed public export in any module;
README CDN and install instructions; docs search and all 81 `?p=` links;
editor run and export; homepage and demos at 1280 px and 390 px.

Not exercised: Firefox and WebKit (system libraries unavailable in this
container), physical touch hardware, the live deployment, and the publish
itself.
