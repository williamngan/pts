# Color correctness plan

## Objective

Fix the verified conversion bugs in `src/Color.ts` without touching the core
color math, in a tests-first sequence: land a complete reference-value test
suite and benchmark coverage first, then apply the fixes against that safety
net. All findings below were verified on the `revamp` branch (2026-08-18) by
comparing every converter against independently computed CIE values (sRGB,
D65 white point, 2° observer) and by exercising every `normalizedInput` /
`normalizedOutput` flag combination.

## Verdict on the existing implementation

The core math is correct. Every non-normalized forward conversion
(RGB→XYZ/LAB/LCH/LUV) matches CIE reference values to 4 decimal places, and
round trips return to the original RGB. The sRGB matrices are Lindbloom's
D65 values; `XYZtoLAB`/`LABtoXYZ` use the exact ε/κ thresholds. No algorithm
replacement is needed. All confirmed bugs are in flag handling, hex parsing,
and degenerate inputs.

## Confirmed bugs

1. **`clone()` drops `_isNorm`** — the root defect. `$normalize(false)`
   clones first, so the copy always claims "not normalized" and the
   denormalize pass is a silent no-op. Every conversion called with
   `normalizedInput = true` on a LAB/LCH/LUV/XYZ color therefore treats
   0…1 values as full-range values (measured ~300× error on `LABtoXYZ`),
   and `toMode(mode, true)` on a normalized color corrupts values.
2. **`fromHex` 8-digit alpha** — `alpha = hex.substr(6) && 0xff / 255`
   always evaluates to `1`. `#ff000080` should give alpha ≈ 0.502.
3. **`RGBtoXYZ` / `XYZtoRGB` double-scale normalized output** — both
   pre-scale channel values when `normalizedOutput` is set _and_ then call
   `.normalize()` on the result, dividing by the range a second time
   (XYZ out by 100×, RGB by 255×).
4. **Normalized hue off by 10×** — `RGBtoHSL`/`RGBtoHSB` return `h / 60`
   for normalized output; hue in 0…6 units maps to 0…1 by `h / 6`.
5. **`HSLtoRGB` achromatic branch ignores `normalizedOutput`** — the
   `s == 0` early return always scales by 255.
6. **`HSBtoRGB` crashes on out-of-range hue** — a negative hue indexes
   `pick[-1]` and throws `TypeError`.
7. **`LABtoLCH`, `LCHtoLAB`, `XYZtoLUV`, `LUVtoXYZ` ignore
   `normalizedOutput` entirely** — the parameter is accepted and unused,
   so `RGBtoLCH(c, false, true)` returns full-range values.
8. **LUV is NaN at black** — `XYZtoLUV` divides 0/0 for chromaticity and
   `LUVtoXYZ` divides by `13 * L` with L = 0, so black round trips as NaN.

## Design decisions for the fix

- **The flag argument is authoritative when it asserts normalization.**
  `normalizedInput = true` wins over the color's own `_isNorm` state, so
  callers who construct 0…1 values directly (without ever calling
  `normalize()`) get correct results. Implemented as one private helper
  (`Color._denorm`) that clones, stamps the flag, and denormalizes; used by
  every converter that previously called `$normalize(false)`. The one
  deliberate asymmetry: a color whose own flag says "normalized" is never
  double-normalized by `normalizedInput = false` — actual state beats a
  defaulted argument, preventing corruption.
- **`normalizedOutput` uniformly means "the plain result mapped through
  `Color.ranges`",** and the returned color carries `normalized = true`.
  Converters whose values are already 0…1 set the flag directly instead of
  re-mapping.
- **Degenerate inputs get pinned, not propagated**: black pins LUV
  chromaticity to 0 in both directions; hue wraps into [0, 1) before use in
  **both** `HSBtoRGB` and `HSLtoRGB` (the HSL path only single-wraps today,
  so hues beyond ±360° silently distort).
- Replace magic constants with exact CIE fractions (`216 / 24389`,
  `24389 / 27`) in the LAB/LUV converters. Keep hand-rolled cubes
  (`y * y * y`), not `Math.pow(y, 3)` — the pow form measured +16% on
  `LUVtoXYZ` in the A/B run. Use `Math.cbrt(n)` rather than
  `Math.pow(n, 1/3)` for cube roots: same speed class, and correct (not
  NaN) for the tiny negative channel values Float32 storage can introduce.
- `fromHex` parses the 8-digit alpha byte and additionally accepts CSS
  4-digit `#RGBA` (expansion must capture the alpha nibble before
  reassigning the string).

## Gaps found on second review (added to phase 2 scope)

1. **`toMode(m, true)` throws when `m` is the current mode** — the
   dispatcher looks up `RGBtoRGB`. Same-mode conversion becomes a no-op.
2. **`toString()` on a normalized color emits broken CSS** — hex/rgb/rgba
   formats floor 0…1 values to `#000000` / `rgb(0,0,0)`. When `_isNorm` is
   set, denormalize through `Color.ranges` before formatting these three
   formats ("mode" format keeps raw values).
3. **`HSLtoRGB` hue wrapping** (see above) for parity with `HSBtoRGB`.
4. Each gap gets a pinning test alongside the phase 1 suite.

## Explicit non-goals

- **No change to `Color.ranges`.** LCH chroma is declared 0…100 although
  sRGB reaches ~134 (pure blue), so normalized chroma can exceed 1.
  Changing the range redefines `normalize()` for existing users — recorded
  here as a known limitation, pending a maintainer decision (CSS Color 4
  uses 150 as its 100% chroma reference).
- **No sRGB matrix swap.** CSS Color 4 / culori derive slightly different
  sRGB↔XYZ matrices (from x,y chromaticity coordinates) than the
  Lindbloom/ASTM pair used here; the difference is in the 4th decimal and
  both pairs are self-consistent. Swapping would change every LAB/LCH/LUV
  output slightly for no practical accuracy gain — rejected.
- No changes to conversion pair coverage: unsupported pairs such as
  `LUVtoHSB` continue to throw.

## Phase 2b — SoTA addition: Oklab / Oklch modes

CIELAB is the correct implementation of a 1976 standard, but it is no
longer the state of the art for perceptual work: its blue region shifts
hue under lightness/chroma changes and its chroma scale is uneven. Oklab
(Ottosson 2020) fixes both, is specified in CSS Color 4 (`oklab()` /
`oklch()`), and has become the default for gradients and palette work.
This is an _addition_ (new modes), not a change to any existing space.

- `ColorType` gains `"oklab" | "oklch"` (src/Types.ts).
- `Color.ranges` gains `oklab: (0…1, −0.4…0.4, −0.4…0.4)` and
  `oklch: (0…1, 0…0.4, 0…360)` — CSS Color 4 reference ranges. Because
  bench fixtures and the auto-enumerated tests both read `Color.ranges`,
  the new converters are covered by both the day they exist.
- Static constructors `Color.oklab(...)` / `Color.oklch(...)`.
- Six converters mirroring the lab/lch set: `RGBtoOKLAB`, `OKLABtoRGB`,
  `OKLABtoOKLCH`, `OKLCHtoOKLAB`, `RGBtoOKLCH`, `OKLCHtoRGB` — linear sRGB
  → LMS (M1) → cube root → Lab (M2), constants from Ottosson's reference
  implementation; inverse clamps and rounds exactly like `XYZtoRGB`.
- Channel accessors `l`/`a`/`b`/`c`/`h` extended to treat oklab/oklch like
  lab/lch.
- Reference tests: Ottosson's published sRGB anchor values (white →
  L≈1, a≈b≈0; red → 0.628, 0.225, 0.126; green → 0.866, −0.234, 0.180;
  blue → 0.452, −0.032, −0.312), verified against an independently
  computed implementation before hardcoding.

## Phase 1 — tests and benchmarks (land before any `Color.ts` change)

**Tests** (`src/test/Color.spec.ts`, 41 → 65 tests):

- CIE reference values for red, blue, teal, white across XYZ/LAB/LCH/LUV
  (precision 2). These pass today and pin the already-correct math.
- Auto-enumerated invariants over every `XtoY` static (mirroring the bench
  suite's enumeration, so future converters are covered automatically):
  - `X(c, false, true)` equals `X(c).normalize()` and carries the flag;
  - `X(c.$normalize(), true)` and `X(<unflagged 0…1 copy>, true)` equal
    `X(c)`.
- Edge cases: black through LUV both directions, hue wrapping in
  `HSBtoRGB`, achromatic `HSLtoRGB` with normalized output, hex alpha
  parsing (8- and 4-digit), `clone()` preserving `normalized`,
  `toMode(mode, true)` on a normalized color.
- Two existing expectations encode buggy behavior and are corrected:
  `fromHex("33669980")` alpha becomes 128/255, and the
  "covers normalized conversion inputs and outputs" test compares against
  the denormalized equivalent instead of only checking finiteness.
- **Expected state after phase 1: ~35 tests fail.** They are the bug
  inventory for phase 2 and turn green with the fix. `pnpm check` is red
  between the phases by design.

**Benchmarks** (`bench/suites/color.bench.mjs`):

- The suite already auto-enumerates every conversion's default path; add
  the same enumeration for the normalized path
  (`Color.XtoY(c, true, true)`) so the code paths phase 2 rewrites are
  measured, not just the untouched defaults.
- Validate via `pnpm bench:check` (dry run). Do not re-record the machine
  baseline until phase 2 lands; regression gating for the fix itself uses
  `scripts/bench.mjs --against HEAD --suite color` (5-round A/B).

## Phase 2 — apply the fixes

Apply the eight fixes plus the three second-review gaps per the design
above; the phase is complete when:

- all 65 Color tests pass, full suite green (`vitest`, typecheck, lint,
  prettier);
- `--against HEAD --suite color` shows the **default paths** unchanged
  beyond noise. The `(normalized)` variants are expected to read
  "slower" against HEAD: HEAD's normalized paths were broken
  short-circuits (the no-op denormalize skipped the work and returned
  wrong values), so their baseline times measure less work than
  correctness requires. With the range math inlined (`_denorm` /
  `_normOut`), the residual cost is ~10–18% on sub-µs converters —
  accepted as the price of correct results;
- docs regenerated (`pnpm run docs`);
- `dist/` rebuilt; machine bench baseline re-recorded after phase 2b so it
  includes the normalized and Oklab cases on fixed code.

Phase 2b (Oklab/Oklch) lands after the correctness fixes are green, so its
new converters are born under passing invariants.

## Phase 3 — separately reviewed, already-approved change to re-apply

Dropping TypeDoc's unstable numeric `id` from generated docs JSON
(4 lines in `scripts/generate-docs.mjs` + regeneration) was implemented and
validated earlier on 2026-08-18, then reverted together with the working
tree. It is independent of the Color work and can be re-applied in its own
commit; `pnpm run check:docs` and the docs smoke test passed with it.
