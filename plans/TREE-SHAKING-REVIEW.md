# Tree-shaking review

Reviewed commit `a7e2db2` against `5e46eea`.

## Findings

### P2: Public configuration can diverge from effective state

[Color.ts:186](../src/Color.ts#L186),
[Util.ts:127](../src/Util.ts#L127), and
[UI.ts:154](../src/UI.ts#L154) now bypass the public properties.
Replacing `Color.ranges` through `Object.defineProperty`, or assigning through
`new Proxy(Color, {})`, updates the visible property but leaves conversions
using the old ranges.

Reproduced: the public RGB maximum becomes `1`, while
`Color.maxValues("rgb")[0]` remains `255`. Similarly, redefining `_warnLevel`
to `"error"` leaves warnings muted, and redefining `UI._counter` to `100`
still produces `ui_0` for the first unnamed UI.

Preserve internal access through the public properties and cover these cases.

### P2: The new side-effect guard has reproducible false negatives

[check-artifacts.mjs:220](../scripts/check-artifacts.mjs#L220) excludes every
line starting with `/`. Injecting
`/x/.test(globalThis.sideEffect());` survives bundling, executes the side
effect, and passes the guard. The declaration whitelist also accepts effects
embedded inside `Const` initialization.

Parse the output structurally and add negative controls instead of relying on
indentation and line prefixes.

### P3: Existing Color.ranges documentation links break

[search.json:861](../docs/json/search.json#L861) changes the anchor to
`accessor_ranges`, and
[docs-smoke.mjs:294](../scripts/docs-smoke.mjs#L294) tests only that new link.
There is no compatibility alias. Browser verification confirms
`#property_ranges` leaves the page at the top instead of scrolling to the
member.

Preserve the old anchor and test both URLs.

## Additional risks and gaps

- Automated bundle checks cover Vite sizes but do not execute the generated
  tree-shaken bundles. Incorrect removal of required initialization could
  therefore pass. The other bundler measurements in the plan are also not
  automated.
- The documented changes to enumerability, runtime private fields, and
  monkey-patching behavior remain compatibility risks for a patch release.

## Validation

Targeted validation passed:

- 585 Node tests.
- 29 DOM/SVG browser tests.
- Artifact and packed-package checks.
- Documentation and editor freshness checks.
- Representative tree-shaken runtime probes.

Confirmed Vite bundle sizes:

| Import        | Minified bytes |
| ------------- | -------------: |
| `Pt`          |         25,571 |
| `CanvasSpace` |         80,377 |

The review did not modify tracked files. Its findings and validation results
refer to the reviewed commit; saving this document did not rerun the checks.

## Resolution

All three findings were reproduced and fixed; details and measurements are
in "Review fixes" in `TREE-SHAKING-PLAN.md`.

- **P2, public configuration:** internal code goes through `Color.ranges`,
  `Util._warnLevel` and `UI._counter` again; tests cover `defineProperty`
  and `Proxy` for each and fail without the fix.
- **P2, guard false negatives:** the check parses the bundle and accepts
  only inert declarations; five negative controls, including both cases
  above, must be caught.
- **P3, documentation links:** the docs runtime maps a missing member anchor
  to the member's current kind; the smoke test loads both URLs.
- **Executing tree-shaken bundles:** seven runtime probes compare bundled
  results with the whole library, with a control for a wrongly dropped
  initialization.
- **Other bundlers:** left as a one-time measurement, to avoid three new
  development dependencies.
- **Patch-release compatibility:** the remaining differences are listed in
  the changelog; the version is a release decision.

A second, fresh-context review of the result found no wrong results and six
smaller issues, all fixed or documented; see "Second review" in
`TREE-SHAKING-PLAN.md`.
