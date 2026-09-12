# uheprng cleanup plan

## Objective

Fix the flaws found in the 2026-08-21 review of `src/uheprng.ts` without
changing any seeded output sequence. Sequence identity is the hard
invariant: users rely on `Num.seed` for reproducible generative art, so
every change here must be provably output-neutral. All fixes verified
against the reference behavior in Node before planning.

## Confirmed flaws and fixes

1. **Dead startup entropy (perf + misleading comment)** — the
   constructor fills all 48 state slots from `Math.random()` + mash,
   then `initState()` immediately resets the mash hash and overwrites
   every slot (verified: exactly 48 discarded `Math.random` calls per
   seed). The original GRC code used that fill for its unseeded path,
   which this port removed. Fix: delete the fill and the
   browser-entropy comment. Output-neutral because `initState()`'s
   leading `mash()` call resets the hash state (`n = 0xefc8249d`)
   before any state slot is written.
2. **`hashString` re-stringifies per state slot** — the inner loop
   calls `mash(k.toString())` 48 times per seed character with the same
   `k`. Fix: hoist the string once per character. Output-neutral: same
   argument values in the same order.
3. **32-bit resolution undocumented** — every draw is an exact multiple
   of 2⁻³² (verified); the original combined two raw draws for 53-bit
   doubles, this port intentionally exposes the raw fraction. Fix: doc
   note on `Num.random` and in the module.
4. **Seed-collision semantics undocumented** — `cleanString` makes
   `" hello "`, `"hel\x01lo"`, and `"hello"` the same effective seed,
   and an empty/whitespace-only seed degenerates to the fixed
   `initState` sequence via `mash("")`'s falsy reset (all verified,
   inherited GRC behavior). Fix: document on `Num.seed`; keep behavior.
5. **"Cryptographically strong" header claim** — quoted GRC text; the
   generator is not a CSPRNG by modern standards (state recoverable
   from outputs). Fix: port note in the module header; keep the
   original license text intact.
6. **Cosmetic** — redundant `"use strict"` in an ES module; anonymous
   default export (stack traces/docs); untyped `s` array hides
   `mash()`'s `number | undefined` return; function-scoped `i, j, k`
   shared across closures; `cleanString`'s third replace (`/\n /`) can
   never match because the control-character pass already removed every
   `\n` (dead in the original too). Fix: name the export `uheprng`,
   type the state array and mash signature, localize loop variables,
   drop the dead replace and directive. All output-neutral.

Explicitly out of scope: swapping the algorithm (sfc32 etc.) — faster
seeding but silently breaks every user's seeded sequences; rejected.

## Test coverage

Existing (`Num.spec.ts`): seeded determinism (self-consistency),
`Math.random` fallback until seeded, empty-seed draws are finite.
Gap: nothing pins the _exact_ sequence, so an output-changing edit
would pass today's suite. New pins (green before the fixes, captured
from the pre-change dist — this is the identity gate, so red-first does
not apply):

- Golden sequence: seed `"hello"` → first five draws exactly
  `0.9439915572293103, 0.48723091022111475, 0.5987379888538271,
0.31852455413900316, 0.3260437978897244`; seed `""` →
  `0.5887344738002867`; seed `"pts"` → `0.03993775951676071`.
- Effective-seed collisions: `" hello "` and `"hel\x01lo"` reproduce
  `"hello"`'s first draw; `"  "` reproduces `""`'s.
- 32-bit lattice: first draws satisfy
  `Number.isInteger(v * 2**32)`.
- No `Math.random` consumption: stub `Math.random` to throw during
  `Num.seed` + first draws (pins fix 1; red before, green after — the
  one behavioral pin).

## Bench coverage

Already adequate, no new cases: `util/Num.seed then draw` gates seeding
cost (fixes 1–2 target this), `num/Num.random (seeded)` gates draw cost
(must stay flat — `random()` is untouched). Before/after protocol:

- Before: current dist predates any uheprng edit — run both cases with
  `--no-build` and record numbers here.
- After: rebuild, rerun the same filtered commands, then the formal
  5-round `--against HEAD --suite util --suite num` gate. HEAD's
  uheprng is also pre-change, so those two cases read cleanly; other
  cases in these suites may reflect the uncommitted Pt/Group/Bound pass
  and are interpreted accordingly.
- Full node baseline re-record at the end (it currently embeds pre-fix
  seeding cost in the two cases).

## Regression analysis

- Fixes 1, 2, 6 are output-neutral by construction (argument-identical
  mash call sequence after a full hash reset); the golden pins prove it
  end to end.
- Fix 1 changes one observable: `Num.seed` no longer consumes
  `Math.random`. Nothing can depend on that consumption except code
  stubbing `Math.random` (our own new pin does, deliberately).
- Docs-only fixes 3–5 regenerate `docs/json` for Num; docs chain +
  artifact budgets re-run.
- `check-package.mjs` lists `src/uheprng.ts` — filename unchanged.

## Second review (pre-implementation)

- Verified `initState()` fully masks the deleted fill: it resets mash
  _first_, then writes all 48 slots, `c`, and `p`; no other state
  exists. Deleting the fill cannot alter any later value.
- Verified the dead replace claim: `[\x00-\x1F]` includes `\n` (0x0A)
  and `\r` (0x0D), so line 3 of `cleanString` can never match.
- The `Math.random`-stub pin must restore the original in a
  `finally`/afterEach to avoid poisoning other tests.
- `mash` keeps its reset-on-falsy contract (needed by `initState` and
  relied on by empty-seed behavior) — type it as
  `(data?: string) => number | undefined` rather than "fixing" it.
- Keep `cleanString`'s odd first regex (`gi` flags and all) — it is
  behavior, not style.

## Phases

Phase 1: pins above + record before numbers for the two bench cases.
Phase 2: fixes, full check chain, filtered before/after + 5-round
`--against HEAD` for util+num, baseline re-record, results appended.

## Results (2026-08-21)

All fixes landed in `src/uheprng.ts` + doc notes in `src/Num.ts`. 57/57
Num pins (golden sequences bit-identical before and after — the
identity gate held), 507/507 overall, full check chain green.

One deviation from the plan: `mash` is typed `(data?: string) =>
number` with the reset path returning `0` instead of `undefined` — the
reset path's return value is consumed nowhere (verified), and this
keeps the newly typed `s: number[]` arithmetic clean without
assertions. The reset-on-falsy contract itself is unchanged.

Perf: seeding `Num.seed then draw` 70.75 µs → 28.54 µs (**−59.7%**,
"faster" verdict in the 5-round `--against HEAD` gate); draw cost
`Num.random (seeded)` unchanged (7.4 → 7.6 ns, within noise); 0 slower
across util+num. Dist shrank slightly (dead startup fill removed);
artifact budgets re-synced. Node baseline re-recorded post-fix.
