# Unit-test modernization plan

## Objective

Replace the legacy, partial test suite with behavior-focused tests for every
runtime subsystem, make uncovered source files visible, and enforce the highest
stable coverage floor the suite can support. Coverage is a guardrail, not a
substitute for assertions: tests must validate public results, state changes,
errors, events, and browser side effects.

## Baseline

The original seven Node-only specs contain 167 tests. Their coverage report only
includes imported files and therefore reports 37.83% line coverage. Including
all runtime source files reveals the actual baseline:

| Metric     | Baseline |
| ---------- | -------: |
| Statements |   21.18% |
| Branches   |   15.83% |
| Functions  |   37.64% |
| Lines      |   19.66% |

`Canvas`, `Create`, `Dom`, `Form`, `Image`, `Play`, `Space`, `Svg`,
`Typography`, and `UI` have no direct tests. Existing specs also rely heavily on
compound assertions, do not isolate failures well, and often exercise only a
single happy path.

## Framework decision

Keep Vitest and use its two native execution strategies:

- A Node project for deterministic numeric, geometry, data-structure, physics,
  timing, and utility tests.
- A Playwright-backed Chromium project for browser APIs: canvas, DOM, SVG,
  pointer/keyboard input, images, animation, and audio.
- Vitest's V8 provider for source-mapped coverage. Explicitly include every
  runtime source file so an unimported module is reported as 0%, not omitted.

This reuses the repository's TypeScript/Vite pipeline, current Vitest assertions,
existing Playwright installation, and current V8 coverage package. It avoids a
second assertion/mocking ecosystem and tests browser-facing code in the runtime
it actually targets.

Coverage excludes only:

- `Types.ts`, which contains declarations and no runtime behavior.
- `_module.ts`, an export-only package entry already checked by package tests.
- `_script.ts`, global bundle wiring already checked by the IIFE browser smoke
  test.
- Test files themselves.

`uheprng.ts` remains in scope because it contains executable seeded-random logic.

## Test layout and responsibilities

| Subsystem                      | Environment    | Required behavior                                                                                          |
| ------------------------------ | -------------- | ---------------------------------------------------------------------------------------------------------- |
| `Pt`, `LinearAlgebra`          | Node           | construction, mutation/copy contracts, transforms, matrices, dimensions, invalid inputs                    |
| `Num`, `uheprng`, `Typography` | Node           | ranges, seeded randomness, geometry, shaping boundaries, text sizing/truncation                            |
| `Op`, `Create`                 | Node           | line/shape intersections, polygon SAT, curves, grids, noise, Delaunay/Voronoi                              |
| `Color`                        | Node           | constructors, modes, normalization, string output, every conversion pair and edge range                    |
| `Physics`                      | Node           | world indexing/removal/update, constraints, Verlet state, collisions, bodies and links                     |
| `Form`                         | Node           | shared fluent state and bulk dispatch through a concrete recording form                                    |
| `Space`, `UI`                  | Browser + Node | animation lifecycle, players, listeners, pointer/keyboard/touch translation, UI state and drag/click flows |
| `Canvas`                       | Browser        | setup/resize/clear, recording, style state, primitives, paths, images and text against a real 2D context   |
| `Dom`, `Svg`                   | Browser        | element lifecycle, attributes/styles/scopes, primitive output and cleanup                                  |
| `Image`                        | Browser        | loading, canvas scaling, pixels, crop/resize/filter, bitmap/blob/base64 and cleanup                        |
| `Play`                         | Node + Browser | deterministic tempo listeners/timing; Web Audio graph, domains, start/stop/toggle                          |
| Public entry                   | Node           | expected runtime exports are reachable                                                                     |

Shared helpers will compare points/groups with tolerances and create disposable
DOM fixtures. Each test owns and cleans up global state, DOM nodes, animation
frames, timers, and mocks.

## Implementation sequence

1. Add the official Vitest Playwright adapter and configure named `node` and
   `browser` projects with automatic mock/global restoration.
2. Replace all seven legacy specs with focused `expect`-based suites and add one
   spec per previously untested module.
3. Add explicit coverage inclusion and text/JSON/HTML reporters.
4. Run coverage, work from the per-file uncovered-line report, and add boundary,
   false-path, and error-path cases.
5. Set global thresholds to the final demonstrated values so coverage cannot
   silently regress. Make `pnpm check` enforce them through `test:coverage`,
   while retaining `pnpm test` and `test:watch` for faster local iteration.
6. Run formatting, lint, type-checking, unit/browser coverage, builds, package
   checks, integration tests, and existing browser smoke tests.

## Plan review: gaps and mitigations

### Browser availability

Vitest Browser Mode needs Chromium. CI and the documented development setup
already install Playwright Chromium. The browser project will be headless by
default, with no extra browser family added to the unit matrix.

### Canvas and rendering stability

Pixel snapshots are platform-sensitive. Tests will assert canvas dimensions,
context state, path behavior, generated elements, and a few tolerant pixel
samples rather than broad screenshots. The existing browser smoke test remains
the bundle-level rendering check.

### Audio, image, time, and randomness nondeterminism

Use seeded random inputs, fake timers for tempo logic, generated in-memory image
data, and small Web Audio graphs. Mock only APIs that Chromium cannot exercise
reliably in headless CI, and assert the contract at the mock boundary.

### Coverage inflation and unreachable code

Do not exclude difficult runtime modules, add blanket ignore comments, call
private methods solely to increment counters, or weaken assertions. Defensive
branches that require invalid platform states may keep branch coverage below
100%; they will be listed in the final result rather than hidden. Type-only and
package-entry exclusions are justified above and covered by type/package/smoke
checks elsewhere in `pnpm check`.

### Compatibility and legacy behavior

Tests should capture the current public contract, including unusual return
values and tolerated inputs. A suspected bug gets a regression test describing
current behavior unless fixing it is necessary for deterministic testing; any
production change must be called out separately.

### Threshold selection

Starting at 100% would make the suite unusable while it is being rebuilt. The
threshold will be set only after the completed report is reviewed, rounded down
to a stable whole-number floor for statements, branches, functions, and lines.
The long-term target remains 100%, especially for pure computation modules.

## Implementation result

The completed suite contains 221 tests in 16 spec files. Pure computation
modules generally finish between 97% and 100% line coverage, while real
Chromium tests cover canvas, DOM, SVG, image, animation/input, recording, and
Web Audio behavior. The final aggregate report is:

| Metric     | Result | Enforced floor |
| ---------- | -----: | -------------: |
| Statements | 97.26% |            97% |
| Branches   | 87.10% |            86% |
| Functions  | 99.14% |            99% |
| Lines      | 97.77% |            97% |

The remaining uncovered code is concentrated in defensive browser failure
states, deprecated/error paths, and platform-specific branches that cannot be
triggered reliably without distorting the production environment. No runtime
file was excluded to improve these totals. The main `pnpm check` workflow now
runs `test:coverage`, so these floors apply to local full validation and CI.
