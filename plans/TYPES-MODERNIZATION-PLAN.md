# Types modernization plan (TS 6.0.3 upgrade + strict ratchet)

## Objective

Bring the type system to 2026 standards in two independently shippable
stages: (1) upgrade TypeScript 5.9.3 → 6.0.3 with zero behavior change,
(2) enable strict checking, modernize `Types.ts` and the loose typing
it anchors, and re-enable the disabled eslint safety rules. Types are
erased at build time, so the invariant throughout is: **the emitted JS
in `dist/` stays byte-identical except where a runtime fix is
deliberate, pinned, and documented.**

Facts established 2026-08-21 by trial compilation:

- Latest stable TypeScript is 7.0.2 (native compiler); typescript-eslint
  8.67.0 supports only `<6.1.0`, so **6.0.3 is this repo's ceiling**
  until typescript-eslint ships TS 7 support. tsdown supports `^7.0.0`
  already.
- TS 6.0.3 and 7.0.2 both compile this repo with zero code errors under
  today's laxness; the only config friction is `downlevelIteration`
  (deprecated in 6, removed in 7; a no-op for us since `noEmit` — tsdown
  does all transpilation).
- TS 6/7 default `strict: true`. Current distance: full strict = **342
  errors** (TS2322 ×131, TS2345 ×100, TS2564 ×45, TS18047/48 ×39, rest
  ×27); `noImplicitAny` alone = 176; `strictNullChecks` alone = 261.
  By file: Space 42, Op 35, Svg 34, Canvas 31, Play 27, Image 27,
  Dom 19, Pt 14, Util 12, remainder < 12 each (incl. specs).
  `noUncheckedIndexedAccess` = 1779 — rejected, impractical for an
  array-subclass math library.
- Loose-typing inventory in `src/`: 45 `: any`, 8 bare `Function`, 6
  `@ts-ignore`, 9 `as Group/Pt` casts (the remaining ones bridge TS's
  lib typings for `Array` species returns — legitimate).

## Stage 1 — TypeScript 6.0.3 (config-only, zero risk)

1. `package.json`: `typescript` 5.9.3 → 6.0.3; `typescript-eslint`
   8.66.0 → 8.67.0 (first version declaring TS 6.0 support).
2. `tsconfig.json`: delete `downlevelIteration` (deprecated; emit-only,
   we `noEmit`); add explicit `"strict": false` to pin today's
   semantics against the new default — Stage 2 flips it deliberately,
   not as an upgrade side effect.
3. Gates, in order:
   - `pnpm typecheck` — expect zero errors, as trialed.
   - `pnpm build`, then **byte-compare the JS artifacts** against
     pre-upgrade `dist/` (`index.mjs/cjs`, `pts.js`, `pts.min.js` +
     maps must be identical — tsdown's transpiler doesn't use tsc).
   - Diff `dist/*.d.ts`/`.d.mts` — tsdown's dts generation _does_ use
     the installed TypeScript; review any drift line by line and
     re-sync artifact budgets only if the drift is accepted.
   - `pnpm lint`, full vitest, `check:docs`, `check:artifacts`,
     `format:check`. Bench: not needed (no emitted-code change) beyond
     one smoke round to confirm the harness still runs.

## Stage 2 — strict ratchet + Types.ts modernization

Ordering principle: type-level fixes only (annotations, definite
assignment, narrowing, `satisfies`) — **never add a runtime guard to
silence the checker**. When strict analysis exposes a _real_ potential
null/undefined bug, stop and treat it like every other pass: red pin
first, fix, document in Results. Strict passes usually find a few.

### Phase 2a — `noImplicitAny` (176 errors)

Annotation-only; zero emitted-JS change (byte-compare gate applies).
Kills most of the 45 `: any` as a side effect. Where `any` is the
honest type (`Util.warn`'s `defaultReturn`, `iterToArray`'s input),
convert to generics or `unknown` where cheap, keep explicit `any` with
a comment where not — explicit is fine; implicit is what's banned.

### Phase 2b — full `strict` (342 errors, file-by-file)

Flip `strict: true` and burn down in one working session (the flag is
global; committing halfway would need per-file suppressions — not
worth it). Error-class playbook:

- TS2564 (×45, `strictPropertyInitialization`): definite-assignment
  `!` for fields set in `setup()`/lifecycle paths (Canvas `_offCanvas`
  etc.); initialize at declaration only where the initializer is free
  and cannot change observable state (no `Pt` allocations added to hot
  constructors — Bound/Pt are perf-sensitive, verified by the pt-suite
  A/B staying flat).
- TS2322/2345/18047/18048 (nullability): prefer narrowing and non-null
  assertions at call sites where the invariant is structural (e.g.
  `querySelector` results checked by `_ready`); widen the declared
  type to `| null` only where null genuinely flows (e.g.
  `_container: Element | null`).
- TS2454/2531/2769/2538/2740 (~23): case-by-case, same rules.
- `useUnknownInCatchVariables` comes with strict: audit the few catch
  blocks.

### Phase 2c — `Types.ts` + public-surface modernization

All are `.d.ts`-visible; each is judged against "breaks a downstream
consumer's compile?" — acceptable on the revamp major, but each gets a
line in Results:

1. `MultiTouchElement`: replace `evt: any, callback: Function` +
   missing return types with the DOM signature
   (`addEventListener(type: string, listener: EventListenerOrEventListenerObject): void`)
   — or retire the interface for `EventTarget` if all internal uses
   accept it (verify: Space/Dom/Canvas/Svg call sites).
2. `AnimateCallbackFn`: `currentSpace: any` → `Space` (already
   imported in Types.ts).
3. `UIHandler`: `type: string` → `UIPointerAction | (string & {})`;
   `evt: MouseEvent` → the union Space actually dispatches — verify at
   the dispatch sites (`_mouseAction`, touch/pointer paths) before
   choosing between `PointerEvent | MouseEvent | TouchEvent` and
   `Event`. Widening `evt` is source-compatible for handler _bodies_
   but narrows what a handler may declare — note in Results.
4. `DefaultFormStyle`: `lineJoin?/lineCap?: string` → `CanvasLineJoin`
   / `CanvasLineCap` (Form code assigns these straight to the canvas
   context; literal types also catch typos in user code).
5. `DOMFormContext.style: object` → `Record<string, string>` (verify
   against Dom.ts writes).
6. `IntersectContext.other?: any` → `unknown` (consumers must narrow —
   modern default; breaking only for consumers doing unchecked member
   access).
7. The 8 bare `Function` types (Dom/Canvas/Svg ready-callbacks,
   `Num.ts:938`): read each call site and write the real signature.
8. `@ts-ignore` ×6 → `@ts-expect-error` with description (Canvas.ts);
   verify each still errors — if one no longer does, delete it.
9. `DelaunayMesh`'s array-of-dictionaries shape: doc note only —
   changing the shape breaks consumers for zero type-safety gain.
10. Add `verbatimModuleSyntax: true` and convert type-only imports to
    `import type` (mechanical; tsc enumerates every site).
11. Comment `useDefineForClassFields: false` as load-bearing if the
    target ever moves to ES2022+ (`Pt extends Float32Array`).
    Out of scope: raising the dist `target` (a browser-support
    decision, not a types decision).

### Phase 2d — eslint ratchet

Re-enable, in this order, fixing stragglers as each becomes clean:
`@typescript-eslint/no-unsafe-function-type`, `ban-ts-comment` (with
`ts-expect-error: allow-with-description`), `prefer-const`,
`no-explicit-any` (last; explicit `any`s surviving 2a/2c get inline
disables with justification). Leave the stylistic disables
(`no-this-alias`, `prefer-spread`) as-is — `prefer-spread` in
particular would fight the deliberate `apply`-based perf patterns.

## Test and bench coverage

- Runtime behavior: existing 507 tests + the byte-identity gate on
  emitted JS cover phases 1/2a/2c/2d completely. Phase 2b edits that
  turn out to be real bug fixes get red pins first, per standing
  workflow.
- **Type-level regression pins (new)**: add `src/test/Types.test-d.ts`
  under vitest typecheck mode (`expectTypeOf`) pinning the public
  contract: `PtLike` accepts `Pt`/`Float32Array`/`number[]`;
  `PtLikeIterable` accepts `Group`/`Pt[][]`-style data/iterables;
  `UIHandler` assignability both directions; `AnimateCallbackFn`
  param types; `DefaultFormStyle` literal unions reject bad strings.
  These make future type refactors as pinned as runtime refactors.
  (Requires enabling `typecheck` in vitest config for `*.test-d.ts`.)
- Bench: types erase — no perf change is possible while the JS
  byte-identity gate holds. Run one 3-round `--against HEAD` smoke on
  the pt suite after Stage 2 as belt-and-braces (2b's initializer
  edits are the only place bytes may legitimately change).

## Regression analysis

- Stage 1: risk is confined to d.ts drift from tsdown's dts using the
  new TS; gated by explicit diff review. JS artifacts byte-identical
  or the stage fails.
- Phase 2b is the only phase allowed to change emitted JS, and only
  via pinned deliberate fixes; definite-assignment `!` and type
  annotations erase.
- Phase 2c narrows/widens public types: each is a compile-time-only
  break for downstream TS consumers, itemized in Results; JS behavior
  identical.
- typescript-eslint 8.67 may ship new default-on rules vs 8.66 — lint
  run in Stage 1 catches this before any code change lands.
- Docs: `docs/json` regenerates wherever doc comments or signatures
  changed (`pnpm run docs` + `check:docs` in every stage's gate).

## Second review (gaps found, decisions)

- **Do not bump `lib` to match**: `lib: ES2020` with `target: ES2015`
  is intentional here — lib describes what the runtime offers, target
  what tsc would emit; we don't emit. Leave both; note only.
- Stage 2b's "one session" claim checked against the file histogram:
  worst file is 42 errors — a session each for the top four files is
  realistic; the tail is small. If it must land incrementally, the
  fallback is enabling `strict` in tsconfig while temporarily listing
  unfinished files in a `// @ts-nocheck`-free exclude-list tsconfig
  used only by `pnpm typecheck` — rejected for now; revisit only if
  the burn-down stalls.
- `Group.from(list) as Group` (Pt.ts:670) and the species-return casts
  in Num/Op/Create stay: TS's `Array` lib types don't model species
  subclass returns; these are correct and documented by this plan.
- The vitest typecheck project must not slow the main suite: run
  `*.test-d.ts` in the node project's typecheck pass only, not as a
  fourth browser project.
- `UIHandler.evt` decision deferred to implementation-time evidence
  (dispatch-site grep), not guessed in the plan — both candidate
  unions are recorded above.
- Verified there is no `src/**` consumer of `MultiTouchElement`
  outside Space's touch binding — retirement is plausible; the
  verify-first step stands.

## Phases

Stage 1 (upgrade) → gates → commit-ready. Phase 2a (`noImplicitAny`)
→ 2b (`strict`) → 2c (`Types.ts` + `verbatimModuleSyntax`) → 2d
(eslint ratchet) → type-level pins land with 2c → full check chain +
JS byte-identity + one A/B smoke → Results appended here.

## Final review addendum (pre-implementation)

- The TS 6.0.3 trial ran without `strict: false`, so Stage 1's "zero
  errors" claim is unproven for the actual Stage-1 config — verify
  explicitly right after the config edit.
- Byte-identity mechanics: `sha256sum dist/*.js dist/*.mjs` captured
  pre-upgrade (dist is current — the baseline record rebuilds it);
  compare after each build. `index.d.mts` stashed for the dts diff.
- Vitest typecheck project: enable via `typecheck: { enabled: true,
include: ["src/test/**/*.test-d.ts"] }` on the existing node project
  (runs tsc, so it inherits TS 6). Keep `*.test-d.ts` out of the
  runtime glob (`*.spec.ts` include already excludes it).
- 2a and 2b overlap heavily (`noImplicitAny` 176 + `strictNullChecks`
  261 > 342 total) — implement as one `strict: true` burn-down; the
  phase split stays in the plan as an ordering of attention, not
  separate commits.

## Results (2026-08-21)

Both stages landed. **`strict: true` is on**, TypeScript is 6.0.3, and
all four JS artifacts (`index.js`, `index.mjs`, `pts.js`,
`pts.min.js`) are **byte-identical to the pre-upgrade build** —
verified by sha256 at every checkpoint. Since the emitted JS is
hash-identical, the planned bench smoke was redundant (hash identity
is strictly stronger); skipped with this note. 514/514 tests green
(507 runtime + 7 new type-level pins), typecheck/lint/docs/artifacts/
format all pass.

Stage 1: TS 6.0.3 + typescript-eslint 8.67.0; `downlevelIteration`
removed; d.ts output was byte-identical under the new compiler (no
drift to review).

Stage 2 (~420 strict errors fixed under TS 6, which counts stricter
than the 5.9-measured 342): all fixes type-level (annotations, `!`,
`| null`/`| undefined` widening, `as any` at dynamic-dispatch sites).
**No runtime bug fixes were needed** — every nullable flow found was
already guarded or deliberately preserved; two accidental emitted-code
changes (a `let done = undefined` initializer, an `= null` class-field
initializer) were caught by the hash gate and reworked to erase-only
forms. That gate earned its keep.

Public type-surface changes (compile-time only; JS identical):

- New exported type `UIActionEvent` = `MouseEvent | TouchEvent |
PointerEvent | KeyboardEvent` — dispatch-site evidence showed
  keyboard events also flow to `IPlayer.action` and UI handlers.
- `UIHandler`: typed action (`UIPointerAction | (string & {})`) and
  `evt: UIActionEvent` (was `MouseEvent`); handlers declaring a
  narrower `evt` param no longer assign.
- `AnimateCallbackFn.currentSpace`: `any` → `Space`.
- `IPlayer.action`/`resize`: event union / `Event | null` (the
  resize handler receives null from the internal resize path).
- `MultiTouchElement`: DOM-typed listener signatures with `: void`.
- `DefaultFormStyle.lineJoin/lineCap`: `CanvasLineJoin`/`CanvasLineCap`
  literals.
- `DOMFormContext`: `group` is honestly `Element | null | undefined`,
  `style` a `Record`.
- `IntersectContext.other`: `any` → `unknown`.
- Honest `| undefined` returns where bare `return;` paths exist:
  `Line.slope/intercept/perpendicularFromPt/intersectRay2D/
intersectLine2D/intersectLineWithRay2D/crop`,
  `Rectangle.intersectRay2D(polygon path)`, `Triangle.incircle/
circumcircle/incenter/orthocenter/circumcenter`, `Polygon.bisector`,
  `Circle.fromTriangle`, `CanvasForm._textAlign`, `SVGForm.lineElement/
rectElement`, `HTMLForm.rect`, `Img.getForm`, `Range.calc`,
  `Bound.x/y/z` (undefined for missing dimensions), `UIButton.onHover`
  (`(number | undefined)[]`). `Space.bindCanvas` remains
  `EventListener`-typed; `SVGSpace.svgElement`/`HTMLSpace.htmlElement`
  accept `Element | null | undefined` (they throw on invalid input).
- All ready-callbacks (`CanvasSpace`/`DOMSpace`/`SVGSpace`
  constructors, `_ready`): real signatures replacing bare `Function`;
  `Shaping.step.fn` typed.

Deviations from plan, with reasons:

- **`verbatimModuleSyntax` reverted after measurement**: tsdown/oxc
  honors the tsconfig flag, and with it on, previously-elided
  type-only value imports become real runtime edges — rolldown then
  emits lazy `__esm` init wrappers (+6.5 KB, lazy evaluation, and a
  hard MISSING_EXPORT error on one import). The `import type` syntax
  conversion stayed (source hygiene, same emitted JS); enforcement
  moved to eslint `@typescript-eslint/consistent-type-imports`
  (inline-type-imports style), which the bundler can't observe.
- **`prefer-const` deferred**: 344 auto-fixable sites, but `let` →
  `const` changes emitted bytes everywhere and would blind the hash
  gate that caught two real slips this session. Worth doing as its own
  mechanical commit with a fresh hash baseline after.
- **`no-explicit-any` left off**: after the pass, every `any` in src is
  explicit and intentional (polymorphic arg parsers, dynamic dispatch);
  annotating ~100 sites with inline disables adds noise without
  information. Revisit if the count should ratchet down further.
- `mash`-style note: `useUnknownInCatchVariables` surfaced no catch
  issues.

eslint ratchet landed: `ban-ts-comment` (expect-error with
description; all 6 `@ts-ignore` converted and verified still needed),
`no-unsafe-function-type` (rule un-disabled after the last bare
`Function` was typed), `consistent-type-imports` added.

New coverage: `src/test/Types.test-d.ts` (7 `expectTypeOf` pins on
PtLike/GroupLike/PtLikeIterable acceptance, the UIHandler contract,
AnimateCallbackFn/IPlayer params, DefaultFormStyle literals,
IntersectContext.other) running under vitest typecheck mode in the
node project — "Type Errors: no errors" is now part of every test run.

Still open (workflow): TS 7.0.2 upgrade blocked on typescript-eslint
shipping support for >= 6.1; when it does, the jump should be
config-trivial from here.
