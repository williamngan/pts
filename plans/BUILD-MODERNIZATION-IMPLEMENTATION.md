# Pts build modernization implementation

**Completed:** 2026-08-10  
**Starting package version:** 0.12.9  
**Scope:** Pts build, package, tests, and CI. The React wrapper and examples remain separate repositories and were used only as compatibility consumers.

## Result

Pts now has one current, reproducible build that publishes ESM as its primary modern format, retains uncomplicated CommonJS compatibility, and preserves the two classic browser artifacts. The package contract is checked from an actual tarball rather than inferred from source files.

No package version was changed and nothing was published. A prerelease remains a deliberate maintainer step.

## Build and package contract

One pinned `tsdown` configuration produces:

| Artifact           | Contract                                                 |
| ------------------ | -------------------------------------------------------- |
| `dist/index.mjs`   | Root ESM import                                          |
| `dist/index.js`    | Root CommonJS require                                    |
| `dist/index.d.mts` | Declarations selected by ESM consumers                   |
| `dist/index.d.ts`  | Declarations selected by CommonJS and legacy resolvers   |
| `dist/pts.js`      | Readable `globalThis.Pts` classic script                 |
| `dist/pts.min.js`  | Minified `globalThis.Pts` classic script and CDN default |
| `dist/*.map`       | JavaScript and declaration source maps                   |

All formats come from the existing `_module.ts` or `_script.ts` entry. There are no format-specific source trees, copied declarations, manifest rewrites, or post-build patch scripts.

The explicit package exports select ESM for `import` and CJS for `require`. A transitional `pts/dist/*` export preserves existing deep paths, including CDN/browser paths. Legacy `main`, `module`, and `types` fields remain for older resolvers.

Declaration maps do not embed source text, so the publish allowlist includes `src/*.ts`. This keeps every declaration-map target resolvable while excluding tests and repository-only files. JavaScript maps include their source content. The packed-file audit fixes the expected list so an accidental publish expansion fails CI.

## CommonJS decision

CommonJS remains supported. It is a small second output in the same configuration and passes all of the decision gates:

- ESM and CJS expose the same 45 named exports.
- Both formats pass runtime and TypeScript resolution fixtures.
- Are the Types Wrong reports green results for Node CJS, Node ESM, and bundlers.
- `publint` reports no package errors.
- CJS requires no compatibility source, declaration shim, or post-processing step.
- ESM tree-shaking remains effective.

There is therefore no build-system reason to make this release ESM-only. The normal dual-package caveat still applies: an application should not mix `import("pts")` and `require("pts")` in the same object graph if it depends on identical class instances.

## Quality gates

`npm run check` now runs, in order:

1. Prettier verification.
2. ESLint flat-config verification.
3. TypeScript 5.9 no-emit typechecking.
4. The migrated Vitest unit suite.
5. A clean tsdown build.
6. Artifact names, exports, behavior, source maps, banners, and size budgets.
7. Real Chromium smoke tests for both IIFE builds, including `CanvasSpace` setup, drawing, animation, stop, and disposal.
8. Reproducible `npm pack` output and an exact packed-file audit.
9. Clean ESM, CJS, TypeScript Bundler, TypeScript NodeNext, and Vite consumers installed from the tarball.
10. Tree-shaking, runtime dependency, `publint`, and Are the Types Wrong checks.

GitHub Actions adds the full validation job, packed-artifact runtime checks on Node 20, 22, and 24, and a build of a pinned `react-pts-canvas` revision against the exact Pts tarball. Actions and the downstream revision are pinned to immutable commits.

## Measured output

Executable output stayed within the 5% growth policy; most files became smaller:

| Artifact          |    Before |     After | Change |
| ----------------- | --------: | --------: | -----: |
| `index.js`        | 364,245 B | 171,880 B | -52.8% |
| `index.mjs`       | 362,155 B | 171,034 B | -52.8% |
| `pts.js`          | 387,460 B | 182,497 B | -52.9% |
| `pts.min.js`      | 110,735 B | 110,854 B |  +0.1% |
| Root declarations |  59,260 B |  55,163 B |  -6.9% |

The readable runtime files are substantially smaller because build-only JSDoc comments are omitted while tree-shaking annotations and the license banner are preserved.

The audited tarball is 808,879 bytes. It is larger than the old approximately 298 KB tarball because all JavaScript maps, declaration maps, and declaration-map source files are now intentionally published. This affects download/install size, not executable bundle size.

The Vite fixture produced these application chunks:

- `Pt` only: 68,484 bytes
- `CanvasSpace`: 85,177 bytes
- Full namespace: 109,143 bytes

The small-import fixture is 62.7% of the full namespace fixture, satisfying the tree-shaking gate.

## Verification performed

- `npm ci --ignore-scripts` from the new lockfile: passed.
- `npm run check`: passed.
- Unit tests: 167 passed across seven suites.
- `npm run test:coverage`: passed; baseline recorded without imposing an arbitrary threshold.
- `npm audit --omit=dev`: zero vulnerabilities and no runtime dependency tree.
- Packed ESM and CJS runtime checks: passed on Node 20, 22, and 24.
- Clean `react-pts-canvas` checkout installed from the local Pts tarball and built: passed.
- Clean examples checkout installed from the same tarball and built: passed.

The downstream repositories were not modified.

## Review and simplification decisions

The final review removed a separate reproducibility script and made the tarball checker own that assertion. It also kept all outputs in one tsdown configuration after rejecting a split declaration build that could race with and overwrite module output.

The public `Line.marker` parameter remains typed as `string`; only its always-truthy default expression was corrected. The Web Audio typed-array fix uses the platform method's parameter type rather than changing Pts' exported types. These keep compiler compatibility fixes from narrowing the public API.

No consumer `engines.node` field was added. Node 24 is the pinned maintainer build environment, while the published ES2015 artifacts have a broader runtime contract that is tested separately. Conflating those policies would unnecessarily reject consumers.

## Intentionally deferred

- The custom Python documentation transformer is not part of the build gate. Current TypeDoc JSON no longer matches its legacy schema, so documentation regeneration needs a focused compatibility change rather than being mixed into this build migration.
- Full TypeScript strict mode, class-field semantic changes, and a newer JavaScript output target remain separate source-quality projects.
- `react-pts-canvas` still needs its own modernization, most importantly externalizing Pts and adding its lifecycle/package tests.
- Registry publishing, provenance, version selection, and promotion from prerelease are maintainer release actions.

## Recommended release sequence

1. Review this implementation as isolated commits or pull requests matching the original staged plan.
2. Publish a `0.12.10` prerelease if all public paths are considered compatible.
3. Install that registry tarball into the same ESM, CJS, browser, and React fixtures.
4. Promote only after the prerelease and CDN files are verified.
5. Begin the incremental `react-pts-canvas` work after the Pts contract is stable.
