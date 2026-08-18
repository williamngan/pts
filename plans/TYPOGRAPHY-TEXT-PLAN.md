# Typography and text-layout fix plan

## Objective

Fix the correctness gaps, API problems, and performance cliffs found in the
August 2026 review of `src/Typography.ts` and its consumers in `src/Canvas.ts`
(`getTextWidth`, `_textTruncate`, `textBox`, `paragraphBox`), without silently
changing what existing sketches render.

The guiding constraint: **text layout is visible output.** A "fix" that makes
`truncate` more correct also moves glyphs on every canvas that uses
`textBox`/`paragraphBox`. Every phase below therefore separates changes that
cannot alter rendered output (Phase 1) from changes that intentionally do
(Phases 2–4), and names the decision owner where behavior is a judgment call.

## Baseline (already landed)

The review's findings are pinned down by characterization tests and benchmark
cases committed ahead of this plan, so each fix flips a named test or moves a
named number rather than being taken on faith.

Characterization tests in `src/test/Typography.spec.ts`:

- mismatched `samples`/`distribution` throws `"Array lengths don't match"`
- `truncate` overflows its width budget under a non-uniform measure
  (`"WWWWWii"` measures 104 against a budget of 60)
- `truncate` splits surrogate pairs (`"😀😀😀"` → `"😀\ud83d"`)
- `fontSizeToBox` output is independent of the initial box (the cancellation)
- `fontSizeToBox` with a zero-height initial box returns `NaN`
- `fontSizeToThreshold(0)` returns `Infinity`/`NaN`

Benchmark baselines recorded on the i9-9820X (full-length runs):

| Case                                                 |          Per item |
| ---------------------------------------------------- | ----------------: |
| node: `truncate` (short words, flat measure)         |           24.3 ns |
| node: `truncate` (2048 chars, per-char measure)      |           5.75 µs |
| node: paragraph wrap loop (2048 chars, per-char)     |          154.5 µs |
| browser: `textBox` / `textBox` (estimated)           | 2.82 µs / 1.74 µs |
| browser: `paragraphBox` / `paragraphBox` (estimated) | 24.8 µs / 12.2 µs |

The wrap loop costing ~27× a single truncate of the same text is the quadratic
re-measuring; `paragraphBox` in measureText mode costing 2× estimator mode is
the same cost seen from the browser. Phases 2–3 exist to shrink those ratios;
`bench --compare` and the recorded chromium baseline gate the result.

## Phase 1 — hygiene, no behavior change

Safe to land immediately, in one commit. Rendered output stays untouched; the
only test that moves is the error-message expectation in 1.4's
characterization test, updated in the same commit.

### 1.1 A real type for measure functions

`fn: (string) => number` declares a parameter _named_ `string` of type `any` —
it only compiles because `noImplicitAny` is off. The same phantom type appears
in `textWidthEstimator` (parameter and return), `truncate`,
`CanvasForm._estimateTextWidth`, and `fontSizeToBox`'s return type.

Add to `src/Types.ts` (types are erased at runtime, so the pinned 45-symbol
export surface in `scripts/check-artifacts.mjs` is unaffected):

```ts
/** A function that returns the rendered width of a string of text. */
export type TextMeasure = (text: string) => number;
```

Use it at every site above, and give the returned closures real signatures:
`(text: string) => number`, `(box: PtLikeIterable) => number`. Type
`textBox`/`paragraphBox`'s `verticalAlign` as
`"top" | "start" | "middle" | "center" | "bottom" | "end"` (accepting the
superset both call sites already handle) instead of bare `string`.

### 1.2 Documentation fixes

- `fontSizeToThreshold`: delete the stale `@param defaultSize` line — it
  documents a parameter of the _returned_ function, left over from an older
  signature. Describe it under `@returns` instead.
- `fontSizeToBox`: add the missing `@param byHeight`.
- `getTextWidth`: the docstring claims "an actual measurement", but the
  measured path returns `measureText(c + " .").width` — measurement plus a
  padding fudge. Document the padding until 3.2 resolves it.

### 1.3 `substr` → `slice`

`String.prototype.substr` is deprecated. Replace in `Typography.truncate` and
in `CanvasForm.paragraphBox`'s `nextLine`. With non-negative arguments (the
only ones used) `slice` is behavior-identical.

### 1.4 Actionable validation in `textWidthEstimator`

Passing custom `samples` without a matching `distribution` currently throws
`"Array lengths don't match"` from `Vec.dot` — true, but useless at 2 a.m.
Guard at the top:

```ts
if (samples.length !== distribution.length)
  throw new Error(
    `textWidthEstimator: samples (${samples.length}) and distribution (${distribution.length}) must have the same length`,
  );
```

Keep throwing (the characterization test updates its expected message); do not
silently renormalize a distribution that doesn't sum to 1 — a warning in the
docstring is enough, since scaling the distribution is occasionally a
legitimate way to bias the estimate.

## Phase 2 — make `truncate` fit its budget

This is the review's core correctness fix and it **changes rendered output**:
text that previously overflowed its box now ends a few characters earlier.
That is the point, but it lands as its own commit with demo screenshots
checked.

### 2.1 Fit-guaranteed cut via binary search

Keep the proportional estimate as the starting point — it is exact for the
linear estimator and a good first guess otherwise — then refine:

1. If `fn(str) <= width`, return the whole string (unchanged fast path).
2. Otherwise binary-search the largest prefix `p` such that
   `fn(p) + fn(tail) <= width`, seeding the search bracket with the
   proportional guess.

Cost is O(log n) probes. Each probe measures a prefix, so with a real
`measureText` the worst case is O(n log n) characters measured per call — more
than today's single measure, but bounded, and 3.3 keeps `paragraphBox` from
multiplying it. The linear-measure fast path in step 1 means the estimator
mode pays one extra comparison and nothing else.

Acceptance: the `"WWWWWii"` characterization test flips to assert
`measure(result) <= 60`; the node bench case
`Typography.truncate (long text, per-char measure)` may rise but must stay
within the same order of magnitude; `Typography.truncate` (flat measure) must
not regress beyond the compare threshold.

### 2.2 Measure the tail, don't count it

Today the tail is handled by subtracting `tail.length` _characters_ from the
cut, assuming tail glyphs have the same width as content glyphs. 2.1's search
condition (`fn(p) + fn(tail) <= width`) replaces that assumption with a
measurement. One `fn(tail)` call per truncate, computed once before the
search.

### 2.3 Don't split surrogate pairs

After computing the cut index, if `str.charCodeAt(cut - 1)` is a high
surrogate (0xd800–0xdbff), retreat one unit. This is two lines, allocates
nothing, and fixes broken emoji at the cut point. Full grapheme-cluster
correctness (`Intl.Segmenter`) is **out of scope**: the tsconfig targets
ES2015/lib ES2020, Segmenter would need feature detection plus type
workarounds, and truncation mid-ZWJ-sequence degrades to a valid (if plainer)
emoji rather than a broken glyph — not worth the machinery here.

Acceptance: the surrogate characterization test flips to expect `"😀"`
(count 2) instead of `"😀\ud83d"` (count 3).

### 2.4 Decide the `width <= 0` + tail contract

Current behavior, locked in by an existing test: `truncate(fn, "abc", 0,
"....")` returns `["....", 0]` — a tail that itself cannot fit. Under 2.1's
condition the natural result becomes `["", 0]` (nothing fits, including the
tail). Recommendation: adopt `["", 0]` — drawing an ellipsis wider than the
box is never what a sketch wants. **Decision (2026-08-17): agreed — adopt
`["", 0]`.** The invariant becomes: the returned string always measures within
`width`.

## Phase 3 — measurement consistency and the quadratic wrap

### 3.1 Per-character width cache

Add a third measuring mode between "3 samples × average" and "measureText
every call": memoize each distinct character's width in a `Map<string,
number>`, sum on demand. Near-measureText accuracy for most Latin text
(kerning and ligatures excepted), estimator-class speed after warmup, and it
makes 2.1's proportional first guess land almost exactly, so the binary search
typically terminates in one or two probes.

Implementation: a `Typography.charWidthCache(fn: TextMeasure): TextMeasure`
static, plus a `CanvasForm.fontWidthEstimate` extension to select it. The
cache must be invalidated when the font changes — `CanvasForm.font()` already
re-derives the estimator on font change (`Canvas.ts:934`), so the same hook
applies. Keep the existing boolean argument working; accept
`"sample" | "char" | boolean` where `true` keeps meaning the current sampled
estimator, so no existing call site changes meaning. The form must remember
which mode is active (not just that _an_ estimator is set) so the re-derivation
in `font()` rebuilds the same mode with the new metrics.

Acceptance: new node bench case for the cached mode; browser
`paragraphBox (estimated width)` must not regress; a new spec test asserts
cached results equal direct measurement for repeated characters.

### 3.2 Resolve the `" ."` padding inconsistency

`getTextWidth` pads the measured path (`measureText(c + " .")`) but not the
estimator path, so toggling `fontWidthEstimate` changes layout beyond
accuracy. The padding exists to keep the proportional guess from overflowing —
which 2.1 makes obsolete, since fit is now guaranteed by search rather than by
slack.

Recommendation: remove the padding when 2.1 lands (they ship in the same
release), making both modes return honest widths. Consequence: measured-mode
truncation keeps roughly one more character than before — the visual diff
rides along with Phase 2's screenshot check. **Decision (2026-08-17): agreed —
remove the padding together with 2.1.**

### 3.3 `paragraphBox`: iterative wrap without whole-remainder re-measuring

Two independent problems in `nextLine` (`Canvas.ts:1492`):

1. **Recursion.** Depth grows with line count up to a hard
   `throw new Error("max recursion reached (10000)")`. Convert to a loop —
   mechanical, since the recursion is tail-shaped. The guard disappears
   instead of firing.
2. **Quadratic measuring.** Each line's truncate measures the _entire
   remaining text_. Fix inside `paragraphBox`: before truncating, slice the
   remainder to a generous window — `3 × width / (average char width)` code
   units, the average taken from one `getTextWidth` sample — so each line
   measures O(window) instead of O(remaining). Correctness rule: if the
   truncate consumes the _whole_ window while more text remains, the window
   was too narrow to prove where the line ends — double it and retry. With
   that rule the cut decisions are provably identical to truncating the full
   remainder (a fitting prefix strictly inside the window cannot change when
   text is appended after the window), so the window is purely a cost bound,
   and pathological inputs (all-narrow glyphs) degrade to a couple of retries
   rather than wrong output.

Acceptance: the node `paragraph wrap loop (per-char measure)` case (154.5 µs
baseline) drops substantially — the target is growth roughly linear in text
length, verified by a temporary 2×-text sanity check during development;
browser `paragraphBox` (24.8 µs baseline) improves or holds; wrapped output
for the demo sketches is byte-identical to before this sub-phase (3.3 is a
pure performance change — any wrap difference is a bug).

### 3.4 Guard the degenerate scale inputs

- `fontSizeToBox` with a zero-height (or zero-width, `byHeight: false`)
  initial box: return `0` from the scale function instead of `NaN` — a
  degenerate box has no readable text either way, but `NaN` poisons
  downstream arithmetic. (Superseded by option B in Phase 4, which removes
  the division entirely.)
- `fontSizeToThreshold(0)`: throw at build time with a clear message —
  a zero threshold is a caller bug, not a runtime condition.

Both flip their characterization tests.

## Phase 4 — `fontSizeToBox` semantics (breaking; decision required)

The recorded fact: `f * (h2 / h)` reduces to `ratio * h2`, so the initial box
parameter has **no effect on output** — it is dead weight that can only
introduce `NaN`. Two coherent designs:

- **Option A — make the initial box matter.** Reinterpret `ratio` as the
  initial _font size_: the returned function computes
  `ratio * (h2 / h)`, i.e. "this font size at that box, scaled
  proportionally." Mathematically what the current shape of the code implies
  the author intended. **But it changes the numeric output of every existing
  call**, so every sketch using it re-renders differently.
- **Option B — make the honesty explicit.** Keep today's numeric behavior
  (`ratio * h2`), drop the initial-box parameter:
  `fontSizeToBox(ratio: number, byHeight = true)`. Every existing sketch
  renders identically; call sites just delete an argument. The old signature
  can be tolerated for one release by detecting an iterable first argument
  and ignoring it with a deprecation warning, per the conventions in
  `plans/LIFECYCLE-AND-DEPRECATION-PLAN.md`.

**Recommendation: Option B.** The cancellation has been shipping for years,
which means every real-world call was written (or at least tuned) against
`ratio * h2`. Option A would "fix" the API by breaking all of them visually;
Option B makes the API tell the truth about what it already does. The revamp
branch allows the signature break. **Decision (2026-08-17): agreed — Option
B.** Shim detection: a `number` first argument is the new signature; anything
iterable is the old one (warn via `Util.warn`, ignore the box, shift the
remaining arguments).

Whichever option lands, the cancellation characterization test is replaced by
a direct test of the chosen contract, and the docs get an honest description
("returns a font size proportional to the box's height/width").

## Call-site migrations

Repo call sites that must move with the API, found by grep — anything missed
here would silently measure or exercise the deprecation shim:

- `bench/suites/typography.bench.mjs`: both `fontSizeToBox` cases use the old
  `(box, ratio)` signature. Update to the new signature so the bench measures
  the API, not the shim (and doesn't spam warnings). Add a node case for the
  char-cache measure and a browser `paragraphBox (char-cached width)` case so
  3.1 has numbers.
- `demo/canvasform.textBox.js:26`: `Typography.fontSizeToBox(grid[0], 0.8)` →
  `Typography.fontSizeToBox(0.8)`. This demo also exercises
  `fontWidthEstimate(true/false)` and is the visual smoke test for Phases 2–3.
- `src/test/browser/CanvasImage.spec.ts` covers `fontWidthEstimate`,
  `getTextWidth`, `textBox`, `paragraphBox` — assertions are existence-level
  (`> 0`) and should survive, but verify.

## Sequencing and verification

Land order: 1 → 2 (+3.2 in the same release) → 3 → 4. All three judgment
calls (2.4 contract, 3.2 padding, Phase 4 option) were decided 2026-08-17;
everything below is mechanical.

Per-phase gates, on top of `pnpm check`:

- `node --expose-gc scripts/bench.mjs --compare --suite typography` against
  the recorded baseline; browser cases via
  `node scripts/bench-browser.mjs --suite canvas --filter Box` compared to
  the chromium baseline by hand (the browser runner has no compare mode).
- Characterization tests may only change in the phase that claims them, and
  each flip is called out in the commit message.
- Phases 2–4: eyeball the text demos (`canvasform.textBox` and the paragraph
  demos) before/after via `pnpm test:browser` screenshots, since these phases
  intentionally move rendered glyphs.
- After the final phase, re-record both baselines (`--record` and the
  `--json` chromium run) so the improved wrap-loop number becomes the new
  reference.

## Implementation outcome (2026-08-17)

All four phases landed together on `revamp`. Final numbers on the i9-9820X,
against the pre-fix baselines:

| Case                                                  | Before             | After                 |
| ----------------------------------------------------- | ------------------ | --------------------- |
| node: `truncate` (short words, flat)                  | 24.3 ns            | ~50 ns                |
| node: wrap loop (2048 chars, per-char)                | 154.5 µs           | ~50 µs                |
| node: `charWidthCache` (call, per word)               | —                  | ~72 ns                |
| node: `fontSizeToBox` (build)                         | 914.7 ns           | ~412 ns               |
| browser: `textBox` (measured / estimated)             | 2.82 / 1.74 µs     | 4.39 / 1.74 µs        |
| browser: `paragraphBox` (measured / char / estimated) | 24.8 / — / 12.2 µs | 35.8 / 23.2 / 12.3 µs |

Linearity of the windowed wrap was verified directly: 2048 → 16384 chars
scales 79 → 416 µs, a constant ~2.1 µs per line, where the old algorithm was
quadratic.

Two acceptance notes where reality sharpened the plan:

- **Measured-mode calls got slower on short texts, by design.** The fit
  guarantee costs ~4–6 `measureText` probes where the old code spent exactly
  one unguarded measure, so measured-mode `textBox`/`paragraphBox` run ~1.5×
  slower on paragraph-sized inputs (the asymptotic win only shows on long
  texts). The plan's "improves or holds" criterion for measured-mode
  `paragraphBox` was wrong to promise both correctness and the old probe
  count. Sketches that need the old speed switch to
  `fontWidthEstimate("char")` (near-measureText accuracy, 1.5× faster than
  measured) or `"sample"` (fastest). Estimated modes were unaffected.
- **`charWidthCache` needed a typed-array fast path.** A `Map` lookup per
  character costs about as much as the `measureText` it replaces; the shipped
  version uses a `Float64Array(256)` table for Latin-1 (a `charCodeAt` loop,
  surrogate pairs handled explicitly) with the `Map` as fallback, taking it
  from 487 ns to 72 ns per word.

The `dist` size budgets in `scripts/check-artifacts.mjs` were re-pinned for
the added API surface (+1.2 KB minified).

### Follow-up (2026-08-18): hint-seeded wrap

`Typography.truncate` gained an optional `hint` parameter — the expected
number of characters to keep. It is a pure performance hint (any value yields
the same result, property-tested across hints), and with an empty tail it
widens the search domain to include the whole string, so the upfront
full-string measure disappears entirely. `paragraphBox` seeds each line with
the previous line's fitted length (first line estimated from one character
sample), which also made the 3.3 window-and-retry machinery unnecessary —
gallop probes self-bound near the line boundary, so the hint replaces the
window as the cost bound.

Measured effect: the node wrap loop dropped 45 → ~39 µs (−12%). Browser
`paragraphBox` moved within run-to-run noise on paragraph-sized texts —
`measureText` cost there is per-call overhead and the hint eliminates only
about one of five calls per line, diluted further by shared drawing cost;
char-cached mode ticked down (~23 → ~21 µs). The win grows with text length
(the deleted measure was the longest string measured per line). Remaining
speed-up options for measured mode are recorded in the discussion of
2026-08-18: a per-form truncation memo keyed by font/width/text, a
char-cache-guided search with measure-verified repair, and a
`TextMetrics.advances` feature detect.

## Out of scope

- Grapheme-cluster segmentation (`Intl.Segmenter`) — see 2.3.
- Kerning/ligature-aware estimation, RTL/bidi layout — inherent limits of
  per-character width models; document, don't attempt.
- The `docs.md`/`guide.md` generator churn currently in flight on this branch
  — regenerating docs after the JSDoc fixes in 1.2 happens through whatever
  pipeline wins there.
