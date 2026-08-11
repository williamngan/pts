# Documentation Generation Modernization Plan

## Status

This plan was written and gap-reviewed before implementation. The migration was
implemented and validated on 2026-08-11; the reviewed results are recorded
below.

## Goal

Replace the obsolete Python `parse.py` step with a maintained JavaScript
documentation generator while preserving the existing Pts documentation site's
content contract, URLs, layout, styling, and browser behavior.

The migration must make documentation generation deterministic and testable. It
must not silently drop public API entries, retain stale generated files, or use
package-output auto-discovery that documents the same API more than once.

## Current State Audit

### Pipeline

The current command is:

```text
typedoc --json docs/json/docs.json && python3 parse.py
```

It has two stages:

1. TypeDoc writes one large intermediate JSON file.
2. `parse.py` converts that legacy TypeDoc schema into the small JSON files used
   by the custom browser application.

The checked-in browser application does not consume TypeDoc HTML. It loads:

- `docs/json/modules.json`
- `docs/json/search.json`
- one `docs/json/class/<module>_<name>.json` file per API entry

The existing output contains 19 modules, 75 navigable class/interface/type
pages, and 1,740 search records. Its class directory also contains one stale
`Util_Tempo.json` page which is no longer in navigation. The navigable files and
their URL keys are the compatibility baseline; the stale file must be removed.

### Why the current command is broken

The checked-in output was last rebuilt in 2022 with TypeDoc 0.17-era data. The
project now pins TypeDoc 0.28.20. Its JSON model uses numeric reflection kinds,
structured comment display parts, singular accessor signatures, and a newer
type model. `parse.py` expects fields such as `kindString`, `shortText`, and
array-shaped accessor signatures, so it cannot correctly process current
TypeDoc output.

TypeDoc auto-discovery is also wrong for this site. It follows the package's
conditional exports and sees generated declaration entry points, which creates
duplicate modules and misses most source modules. Documentation generation must
therefore specify the source entry points explicitly.

### `parse.py` review

Useful behavior that must be preserved:

- Source files form the visible module list.
- Files and declarations beginning with `_` are hidden.
- Stable keys use `<module>_<declaration>` and stable anchors use the existing
  `constructor_`, `accessor_`, `function_`, and `property_` prefixes.
- Types appear last in the navigation.
- Class files retain constructors, accessors, methods, variables, properties,
  type aliases, flags, inheritance, implementations, comments, parameters,
  return documentation, tags, and source references.
- Search records retain their existing four-element tuple and weights.

Problems to remove:

- Global mutable dictionaries and arrays make repeated use unsafe.
- The script mutates TypeDoc input while reading flags.
- A broad `BaseException` catch turns unsupported types into empty strings.
- The type formatter handles only a small subset of TypeScript types and has
  dead/unreachable branches.
- Input paths and TypeDoc entry points are implicit.
- Output directories are assumed to exist.
- Files are written one at a time, so a failure can leave a partially updated
  site.
- Stale class JSON files are never removed.
- Unsupported reflection kinds are silently accumulated but never reported.
- There is no schema validation, output validation, parity check, idempotence
  check, or browser test.
- The intermediate `docs/json/docs.json` is large, ignored, and unnecessary.
- Python and `.pylintrc` exist only for this legacy step.

### Browser/output review

The custom site and its static URLs are still valuable and will be retained for
this migration. Changing the renderer would create a large unrelated visual and
navigation change.

The frontend itself has follow-up work that is deliberately outside this
compatibility migration:

- It vendors Vue 2.5.16 and an old Marked build.
- `doc.js` assigns `data.variables` to `contents.properties`, so actual property
  data is not rendered correctly.
- Only the first overload is displayed even though the generated JSON retains
  all overloads.
- Several small history, search, error-handling, accessibility, and HTML-validity
  issues remain.
- The Google Analytics snippet is obsolete.

Those items should be addressed in a separate frontend modernization after the
generator migration has established durable data and visual regression gates.
Fixing them now would knowingly violate the visual-identity requirement.

## Selected Approach

Use the official TypeDoc Node API already provided by the pinned `typedoc`
dependency.

The generator will call `Application.bootstrap`/`convert` with a sorted,
explicit list of public `src/*.ts` entry points. It will traverse TypeDoc's
current reflection model using `ReflectionKind` and TypeDoc's type objects,
then produce the existing custom JSON contract directly.

This is preferable to the alternatives:

- **TypeDoc's default HTML theme:** maintained, but it replaces the existing
  site and cannot be visually identical.
- **A third-party TypeDoc theme/plugin:** adds another compatibility dependency
  while still replacing the frontend.
- **A literal JavaScript port of the Python parser:** preserves assumptions
  about an obsolete TypeDoc JSON schema instead of fixing the integration.
- **TypeDoc CLI JSON followed by a JavaScript parser:** workable, but retains a
  large intermediate file and an avoidable serialization boundary.
- **The TypeScript compiler API alone:** lower level and would duplicate
  TypeDoc's comment, inheritance, reflection, and type handling.

## Compatibility Contract

### Must remain stable

- `docs/index.html`, `docs/css/**`, and `docs/js/**` in this migration.
- The module order and Types-last behavior.
- Every existing page key and query URL.
- Existing member anchors and search-result destinations.
- Visible headings, sections, descriptions, parameter names, return text, tags,
  inheritance labels, and source filenames unless the current source itself has
  changed.
- Desktop and mobile geometry, typography, color, spacing, and responsive menu
  behavior.
- The ability to serve the `docs` directory as static files without a build
  server.

### Allowed non-visual differences

- TypeDoc reflection IDs.
- Source line and character numbers when current source has moved.
- JSON whitespace and a final newline.
- Correctly refreshed documentation for source changes made after the 2022
  output, provided each difference is reviewed and recorded.

No difference is allowed merely because the new transformer failed to represent
a TypeDoc reflection or type. Unsupported input must fail loudly.

## Implementation Steps

### 1. Build a current TypeDoc model explicitly

- Enumerate and sort top-level TypeScript files in `src`.
- Exclude files whose basename begins with `_`.
- Pass the resulting files as explicit TypeDoc entry points.
- Disable automatic README/output rendering because only the reflection model is
  needed.
- Keep TypeScript error checking enabled.
- Report TypeDoc errors as fatal and surface warnings with a summary.

### 2. Convert reflections with small pure helpers

Create `scripts/generate-docs.mjs` with helpers for:

- reflection kinds and flags;
- source references;
- structured TypeDoc comments and block tags;
- constructors, methods, parameters, accessors, variables, properties, enums,
  interfaces, function declarations, object literals, and type aliases;
- inheritance and implementation references;
- Legacy-compatible TypeDoc type display formatting, including arrays, unions,
  intersections, tuples, concise reference names, literals, reflection/object
  types, function types, optional/rest types, indexed access, mapped types,
  operators, queries, predicates, conditional types, and template literals;
- search records and stable anchors.

The transformer must never use an empty string as an error fallback. A type or
reflection variant that is not deliberately supported must identify its page
and fail generation.

### 3. Stage, validate, and replace generated output safely

- Generate all JSON in a temporary sibling directory.
- Validate filenames and page keys before touching checked-in output.
- Assert unique page keys and valid anchors. Preserve a duplicate search target
  only when it represents distinct static and instance methods with the same
  visible name.
- Assert every navigation entry has a class file and every search destination
  resolves to a page and member anchor.
- Assert that source paths are repository-relative and do not escape the repo.
- Replace `modules.json`, `search.json`, and the complete `class` directory only
  after generation succeeds.
- Remove stale class files by replacing the generated directory as a unit.
- Produce deterministic ordering and formatting so a second run is byte-for-byte
  identical.

### 4. Add documentation checks

Add a non-mutating `check:docs` command that generates into a temporary
directory and compares it with checked-in output. It must fail on missing,
stale, or changed files and print a useful file-level diff summary.

Add browser checks that serve the static documentation and exercise:

- landing-page navigation;
- a large class page with inherited members and overloads;
- a CanvasSpace method anchor;
- a type-alias page;
- search and clear-search behavior;
- history/back navigation;
- desktop and mobile layouts;
- failed network requests, page errors, and console errors.

The browser check should use the existing Playwright dependency and the same
Chromium availability policy as the other browser tests.

### 5. Remove the Python boundary

- Change the `docs` package script to the JavaScript generator (invoked with
  `pnpm run docs`, because `pnpm docs` is a pnpm built-in command).
- Delete `parse.py`.
- Delete `.pylintrc` if no other Python remains.
- Remove the obsolete `docs/json/docs.json` ignore entry.
- Update README and implementation notes.
- Include the new scripts and plan in Prettier and ESLint coverage.
- Add `check:docs` to the main `pnpm check` gate after normal source/type tests.

## Migration Validation

### Data parity

Compare the new output against the pre-migration snapshot using a semantic
normalizer that ignores only reflection IDs, source positions, and JSON
formatting. Review every remaining difference.

At minimum, compare:

- module and page key sets;
- member names, kinds, static/inherited flags, and anchors;
- comments and tags;
- overload counts;
- parameter names, defaults, and types;
- return types and return comments;
- extends/implements values;
- source filenames;
- search destinations and weights.

Any source-freshness differences from the 2022 output must be listed explicitly
rather than hidden by a broad allowlist.

### Visual parity

Serve the untouched baseline and new output simultaneously and capture both with
the same Chromium build, viewport, device scale, and font environment.

Compare:

- landing page at desktop width;
- `Pt_Pt` at desktop width;
- a CanvasSpace anchored method page;
- `Types_CanvasSpaceOptions`;
- `Pt_Pt` at a mobile width;
- search results for a representative query.

The expected result is pixel-identical screenshots. If current source content
causes a text-only change, first verify that it is intentional, then compare
computed styles and geometry separately and record the exact changed region.
No CSS, template, or client JavaScript difference is permitted in this migration.

### Full repository validation

Run:

```text
pnpm install --frozen-lockfile
pnpm run docs
pnpm check:docs
pnpm check
pnpm test:coverage
git diff --check
```

Run documentation generation twice and prove that the second run creates no
diff.

## Gap Review

The initial plan was tightened for the following gaps:

1. **Auto-discovered entry points would duplicate or omit modules.** The final
   plan requires an explicit sorted source-file list.
2. **Writing directly into `docs/json` could leave partial output.** The final
   plan stages and validates the complete output before replacement.
3. **A successful generator could leave stale pages.** The class directory is
   replaced as a unit and checked for exact file parity.
4. **Byte comparison alone would flag meaningless TypeDoc IDs and source-line
   movement.** Both semantic and exact generated-output comparisons are used.
5. **DOM/content equality would not prove visual identity.** The final plan adds
   same-browser desktop/mobile screenshot comparison.
6. **Screenshot equality alone would miss broken links and search/history
   behavior.** Browser interaction and destination checks are also required.
7. **Updating Vue/Marked now would confound the migration.** Frontend dependency
   and rendering changes are explicitly deferred.
8. **Silently unsupported modern TypeScript types could make the output appear
   stable while losing information.** Unsupported types and reflections are
   fatal with contextual diagnostics.
9. **A one-time comparison would regress later.** A non-mutating `check:docs`
   gate and browser smoke test become part of normal validation.
10. **The legacy output contains intentional static/instance anchor collisions.**
    The final validation preserves them for visual compatibility but rejects
    duplicate search targets that do not map to a distinct static/instance
    pair.

## Implementation Results

### Generator and checks

- `scripts/generate-docs.mjs` now uses the pinned TypeDoc Node API directly,
  without a serialized intermediate model or Python runtime.
- It fixes entry points and the documentation library surface explicitly,
  adapts TypeDoc's current reflection/comment/inheritance model to the existing
  browser contract, validates paths/pages/anchors, replaces the output as a
  staged unit, and rejects stale or extra files in `--check` mode.
- `scripts/docs-smoke.mjs` serves the static site and verifies navigation,
  history, a CanvasSpace member anchor, search/clear behavior, a type-alias
  page, desktop/mobile geometry, responsive-menu behavior, local request
  failures, page errors, and console errors in Chromium.
- `parse.py`, its Python-only `.pylintrc`, and the ignored intermediate
  `docs/json/docs.json` were removed. Documentation validation is part of
  `pnpm check`.

### Reviewed data parity

The 2022 baseline had 19 modules, 75 navigable pages, 1,740 search entries, and
one stale unlinked class file. The regenerated current-source output has 19
modules, 74 pages, and 1,672 search entries.

All page/member differences were compared by stable page and member keys while
ignoring reflection IDs and source positions. The reviewed differences are:

- `Types_PtsCanvasRenderingContext2D` and its 70 search entries were removed
  because that interface was removed from `src/Types.ts`; the current
  `Types_RenderingContext2D` alias and search entry were added.
- The non-exported helper page/search entry `uheprng_Mash` was removed.
- Current source additions are present: `World.iterations`,
  `UIPointerActions.pointerdown`, `UIPointerActions.pointerup`, and
  `Util.uniqueId`.
- The current model correctly exposes the public `Color.ranges` member and no
  longer exposes the private `Color.D65` member that the legacy parser leaked.
- The legacy TypeDoc artifacts `Group.Array` and `Pt.Float32Array` were removed;
  they represented inherited standard-library constructor objects rather than
  Pts members.
- The stale `Util_Tempo.json` file was removed.

For the 73 page keys shared by both outputs, these are the only member-set
changes. Current source type/comment changes and current TypeScript library
declarations were retained only after review. TypeDoc reports 86 existing
warnings: 70 stale/missing parameter tags, 15 relative links that its unused
HTML copier cannot resolve, and one misspelled `@exmaple` tag. Generation
exposes that count but does not mix a broad source-comment cleanup into this
visual-compatibility migration.

### Reviewed visual parity

The baseline and regenerated site were served simultaneously and captured in
the same Playwright Chromium process. The renderer files (`index.html`, CSS,
`doc.js`, Vue, and Marked) are byte-for-byte identical.

- Landing page: pixel-identical.
- `Canvas_CanvasSpace#function_setup`: pixel-identical.
- `Types_CanvasSpaceOptions`: pixel-identical.
- Search result pane for `Circle.fromCenter`: pixel-identical; its underlying
  Pt detail has the same source-driven difference described below.
- `Pt_Pt` desktop: 1,212 pixels differ (0.0842%), confined to the constructor
  parameter type. The source changed from untyped `...args` to
  `Array<number | number[] | IPt | Float32Array>` after the baseline.
- `Pt_Pt` mobile: the same intentional type text wraps and moves the content
  below it; layout geometry and computed responsive behavior are unchanged.

No template, style, font, color, spacing, or JavaScript-renderer difference was
introduced.

### Validation evidence

- `pnpm install --frozen-lockfile`: passed with pnpm 11.21.0.
- Two consecutive `pnpm run docs` runs produced the same aggregate SHA-256
  (`fde6557949342738af2ce45419ec655bd2f6421b595b64cd8ff0edbb7cbdc831`).
- `pnpm check:docs`: passed.
- `pnpm check`: passed, including 167 unit tests and all build, browser,
  artifact, package, integration, publint, and type-package gates.
- `pnpm test:coverage`: passed (39.69% statements, 30.26% branches, 68.88%
  functions, and 38.16% lines).
- `git diff --check`: passed.

## Completion Criteria

The migration is complete only when:

- Python is no longer needed to generate documentation.
- Current pinned TypeDoc generates all checked-in JSON successfully.
- Generation is deterministic and stale-safe.
- All existing page and search URLs resolve.
- Every semantic difference from the baseline is reviewed.
- Representative desktop and mobile pages are visually identical.
- Documentation browser checks and the full repository suite pass.
- A final diff review finds no unnecessary compatibility layer or duplicated
  transformation logic.
