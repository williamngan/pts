# Third-party code and package audit

September 5, 2026. Baseline reviewed: `revamp` at `8f59499`, compared with
`master` and the earlier package/source history.

## What entered Pts, and when?

The Delaunator-derived triangulation entered in **`1617142` on August 14,
2026**, titled **“improve delaunay performance”**. It was not installed as an
npm dependency: the implementation was adapted into `src/Create.ts` and
therefore became part of the Pts bundles. The accompanying
`plans/TIER2-POLYGON-DELAUNAY-PLAN.md` explicitly describes the Mapbox port
and its ISC attribution. This was an intentional algorithm replacement in
that commit, not something pulled in by the new build tools.

The implementation before that commit was the earlier Pts implementation,
ported from William's `pt` project. Its comments credited Paul Bourke's
algorithm and referenced ironwallaby's JavaScript implementation. A reference
to an algorithm does not by itself prove that its code was copied.

**The published Pts package has no runtime, optional, or peer package
dependencies.** Production source imports are relative to Pts's own source.
The package test checks that ordinary consumers install no transitive Pts
dependencies, and artifact checks reject source-map inputs outside `src/`.
However, that is different from saying every implementation was independently
written: copied or adapted source does not appear in an npm dependency tree.

The Delaunator adaptation has not been silently replaced during this fix
pass. Its complete ISC notice is now included in the source distribution and
every JavaScript bundle, including the minified standalone file. Restoring
the pre-revamp algorithm is a separate implementation/performance choice
raised with the maintainer. No change was made to the external React or CLI
repositories.

## Attributed code inside the library

| Code                     | History                                                     | Current treatment                                                                                                                                                                                        |
| ------------------------ | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Delaunator triangulation | New in `1617142`, August 14, 2026                           | Adapted source, not a package import. ISC notice retained in `THIRD-PARTY-NOTICES.txt` and every browser/module bundle.                                                                                  |
| UHEPRNG                  | `c69b030`, May 16, 2021, “Seed the random generator (#146)” | Steve Gibson / Gibson Research Corporation implementation ported to TypeScript. Its public-domain declaration remains in `src/uheprng.ts`. Revamp optimized this existing port; it did not introduce it. |
| Perlin noise             | `c78b55e`, November 12, 2017                                | Existing `Noise` comment references banksean's gist. Revamp repairs indexing/seeding and optimizes the existing implementation. Not a newly installed library.                                           |
| Shaping/easing functions | Present since `e02c686`, July 15, 2017                      | Existing attributions to Robert Penner and Golan Levin. These are algorithm/formula references in the source, not npm dependencies introduced by revamp.                                                 |

This is an import, attribution, and Git-history audit, not a clean-room
authorship certification of every mathematical expression. No other newly
attributed third-party runtime implementation was found in the revamp source
changes. Do not remove existing attributions merely to describe the library
as dependency-free.

## Website packages are separate from the Pts runtime

The npm package allowlist excludes `docs/`, `guide/`, and `demo/`. The
following code is used by the website, not loaded by `import "pts"`:

| Package/asset | Introduction or revamp change                                                                                                                                       | Purpose                                                                                                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Monaco        | Editor files were already present in 2018 (`df2abfa` / `206dc22`). The reproducible `monaco-editor` development dependency was added in `91b3024`, August 12, 2026. | Live website code editor. Current package version: 0.56.0.                                                                                                                                                       |
| DOMPurify     | Supplied by the newer Monaco distribution, including an embedded copy of 3.4.8.                                                                                     | Sanitizes editor Markdown/HTML. Patched to 3.4.14 in this fix pass. Both the dependency resolution and Monaco's embedded import are replaced; a build assertion verifies the patched module is actually bundled. |
| Marked        | Monaco's own Markdown parser (14.0.0). The separate old documentation `marked.min.js` was removed in revamp.                                                        | Editor Markdown, not Pts geometry/rendering.                                                                                                                                                                     |
| Vue           | Website documentation already used Vue in `59ab153`, July 31, 2018. `8719a32`, September 3, 2026, upgraded the active runtime to a pinned Vue 3 package.            | API documentation application. Current production copy: Vue 3.5.41. The old, unreferenced `docs/js/vue.js` is still a Vue 2.5.16 asset; it is not the script loaded by the current docs page.                    |
| markdown-it   | Added in `89205a1`, August 16, 2026; also used for the safe documentation runtime in `8719a32`.                                                                     | Build-time guide Markdown and browser API-document rendering. Version 14.3.0.                                                                                                                                    |
| highlight.js  | Guide asset already present in `a5cf4c3`, July 9, 2017; the current vendored header identifies 9.12.0.                                                              | Existing guide syntax highlighting. Not introduced by revamp and not shipped in the Pts npm package.                                                                                                             |
| FileSaver     | Was an editor asset before revamp; deleted in `91b3024`.                                                                                                            | No longer needed by the editor's download implementation.                                                                                                                                                        |

Monaco's build now emits `demo/edit/vs/THIRD-PARTY-NOTICES.md`, including its
upstream distribution notices. Documentation dependency notices are generated
at `docs/js/THIRD-PARTY-NOTICES.txt` and checked for freshness. The latter
conservatively includes the packages' production dependency trees; some of
those build components are not included in the browser file. This notice list
must not be mistaken for Pts runtime dependencies.

After patching DOMPurify, `pnpm audit` reports **zero known advisories** for
the root lockfile. The shipped editor contains version 3.4.14 and its browser
checks pass. A clean audit is not a guarantee that an application is free
of vulnerabilities.

## Every direct development package added during revamp

These are installed for maintainers; none is a dependency of the published
Pts runtime. Versions below are pinned in the root manifest/lockfile.

| Added package                | Version | First manifest commit  | Role                                                          |
| ---------------------------- | ------- | ---------------------- | ------------------------------------------------------------- |
| `@arethetypeswrong/cli`      | 0.18.5  | `6f2de9b`, August 10   | Package/type export validation                                |
| `@eslint/js`                 | 10.0.1  | `6f2de9b`, August 10   | Lint configuration                                            |
| `@vitest/browser-playwright` | 4.1.10  | `94ed53a`, August 11   | Browser test provider                                         |
| `@vitest/coverage-v8`        | 4.1.10  | `6f2de9b`, August 10   | Test coverage                                                 |
| `chokidar-cli`               | 3.0.0   | `ce59e41`, August 11   | Formatting watcher                                            |
| `globals`                    | 17.9.0  | `6f2de9b`, August 10   | Lint environment definitions                                  |
| `markdown-it`                | 14.3.0  | `89205a1`, August 16   | Guide generation and website Markdown                         |
| `monaco-editor`              | 0.56.0  | `91b3024`, August 12   | Website editor build                                          |
| `playwright`                 | 1.62.1  | `6f2de9b`, August 10   | Browser automation                                            |
| `prettier`                   | 3.9.6   | `6f2de9b`, August 10   | Formatting                                                    |
| `publint`                    | 0.3.23  | `6f2de9b`, August 10   | Publication validation                                        |
| `tinybench`                  | 2.9.0   | `94ed53a`, August 11   | Benchmarks                                                    |
| `tsdown`                     | 0.22.14 | `6f2de9b`, August 10   | Library bundling/declarations                                 |
| `typescript-eslint`          | 8.67.0  | `6f2de9b`, August 10   | TypeScript linting; replaces the older parser/plugin packages |
| `vite`                       | 8.2.1   | `6f2de9b`, August 10   | Test/integration/editor builds                                |
| `vitest`                     | 4.1.10  | `6f2de9b`, August 10   | Replaces the Mocha/Chai test setup                            |
| `vue`                        | 3.5.41  | `8719a32`, September 3 | Reproducible website documentation build                      |

The three remaining direct development dependencies were already present:
`eslint` (now 10.8.1), `typedoc` (0.28.20), and `typescript` (6.0.3).
The old Mocha/Chai/testdeck/ts-node/tsup toolchain and several obsolete
`@types` packages were removed. Native Rolldown/TypeScript tooling and their
transitive dependencies stay in the development graph.

`test/integrations/` has its own consumer fixtures and lockfile, including
React, Vue, Vite, and skia-canvas. Those deliberately exercise integrations;
they are excluded from the published library package. They are not a reason
to add those frameworks to Pts's dependencies.

## Earlier package-history exceptions

For completeness, the Git history was not always empty of runtime entries:

- Brief 2017 development manifests declared `@types/vectorious`, `nblas`,
  `vectorious`, and `babel-core`. Those runtime entries were removed by
  `2187bed`, July 8, 2017. This audit does not claim those declarations prove
  what was shipped in every historical npm release.
- `b930c55`, September 25, 2022, added `@nrwl/cli@13.7.1` as an optional
  dependency. `6f2de9b`, August 10, 2026, removed it. Current consumers do
  not install it.

## Policy going forward

Keep Pts free of runtime, optional, and peer package dependencies. New
development or website packages should have a specific purpose, a pinned
version, and a maintained license/security check. Importing, vendoring, or
porting a third-party runtime implementation requires explicit maintainer
approval even when the code is copied into `src/` and npm still reports
zero dependencies. Never strip attribution as a substitute for removing an
implementation.

Sources: repository history and installed package manifests/licenses;
[Delaunator ISC license](https://github.com/mapbox/delaunator/blob/main/LICENSE),
[DOMPurify release history](https://github.com/cure53/DOMPurify/releases),
and [the DOMPurify 3.4.13 security fix](https://github.com/advisories/GHSA-55q2-fjhq-7xh7).
