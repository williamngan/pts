# Sound and Tempo correctness and API plan

**Completed:** 2026-08-17

## Objective

Fix the eight prioritized items from the Sound/Tempo review. This pass
changes _contracts and correctness_ only — the performance items
(`Group`/`Pt` reuse in `*DomainTo`, per-listener params-array churn in
`Tempo.track`) are explicitly deferred to a follow-up pass so the recorded
`play` (node) and `sound` (browser) baselines stay comparable.
Prerequisite state: `Play.ts` is at 100% line/function coverage with both
baselines recorded (2026-08-16).

## 1. `start(timeAt)` seek + negative `progress`

- Buffer path: `AudioBufferSourceNode.start(timeAt)` schedules a _delay_,
  not a seek. Change to `start(0, timeAt)` and set
  `_timestamp = ctx.currentTime - timeAt` so
  `progress = (currentTime - timestamp) / duration` starts at
  `timeAt / duration` instead of going negative.
- Media path: set `currentTime` _before_ `play()` (currently after, a
  race). The `timeAt > 0` guard stays: `start()` with no argument resumes
  from the pause position.
- **Buffer replay works**: track a played flag on the buffer node;
  `start()` on a used node re-creates it via `createBuffer()`, and
  `createBuffer()` reconnects the analyser. `toggle()` and replay then
  just work for buffer sounds (today: `InvalidStateError`), and the Sound
  guide's manual `createBuffer().analyze(bins)` replay recipe becomes
  optional rather than required.
- **Behavioral fix, no signature change.** `Sound.spec.ts` currently
  asserts the bug (`starts` receives `1`; `progress` is `-0.1`) and is
  updated to assert seek semantics.

## 2. Total getters, safe `stop()`/`reset()`

- `playable`: gen → `true` once the node exists; input → node exists;
  file → buffer present or `_source.readyState === 4`, guarding a missing
  `_source`. Never throws.
- `progress`: return `0` when there is no duration source (gen/input),
  when the media `duration` is `NaN`/`0` (still loading), or when a buffer
  has not started; clamp to `[0, 1]` (a finished buffer currently reads
  past 1, which is what `stop()`'s Safari guard compares against). Never
  throws, never NaN.
- `binSize`: return `0` when no analyser has been added (currently
  throws).
- `stop()`: early-return when `!this._playing`, making it idempotent and
  fixing `reset()` on a never-started oscillator (currently
  `InvalidStateError`). **Behavioral**: an idle `stop()` no longer pauses
  the media element — the new browser spec case "pauses safely when idle"
  is updated to the new contract.
- `reset()` also disconnects `_outputNode` when set, and guards a missing
  `_node` (`new Sound("file")` before any load has no node).
- `analyze()` called again now disconnects and replaces the previous
  analyser instead of leaking it; declare `: this`.
- Delete the two dead fragments coverage proved unreachable: the
  post-throw ternary in `_createAudioContext` (Play.ts:246) and
  `if (!s) return undefined` in `input()` (Play.ts:377). `Play.ts` then
  reads 100% across every metric.

## 3. Generated-sound restart correctness

- Store the `PeriodicWave` on the instance in `_gen`; `start()` rebuilds a
  custom oscillator from the stored wave instead of calling
  `setPeriodicWave(frequencyValue)` (a TypeError in real browsers that
  also silently lost the wave).
- Track nodes passed to `connect()` in a private list and re-apply them
  when `start()` rebuilds the oscillator, so a filter chain built with
  `connect()`/`setOutputNode()` survives a gen restart (today only the
  analyser is reconnected).

## 4. CORS-safe file loading

- `load(url)`: create the element empty, set `crossOrigin`, _then_ assign
  `src`. `new Audio(url)` starts the fetch before `crossOrigin` applies,
  which can yield a CORS-tainted `MediaElementSource` — the analyser
  silently outputs zeros. For a caller-supplied element the attribute is
  still applied but the docs note it must be set before `src` (markup) to
  matter.

## 5. Volume and shared AudioContext — **API additions**

- **New `volume` getter/setter** (default `1`): a lazily created
  `GainNode` inserted at `start()` between `(_outputNode || _node)` and
  `destination`. Settable before `start()`; survives gen restarts.
- **Shared context**: a lazily created module-level `AudioContext` used by
  default; `constructor(type, ctx?)` gains an optional context param
  (additive) and `Sound.from` passes the caller's context through instead
  of constructing one per instance and leaking it. **Behavioral**:
  `soundA.ctx === soundB.ctx` for default-constructed sounds. Browsers cap
  live contexts, so this is also a correctness fix for sketches creating
  many Sounds.
- **New `dispose()`**: stops, disconnects everything (node, analyser,
  gain, output node), and drops stream/source/buffer references. It
  **never closes a context**: the shared one lives for the page, and a
  context passed via `ctx?`/`from` belongs to the caller (closing
  tone.js's context would break tone.js). The browser `sound` bench
  suite's teardown switches from `ctx.close()` (which would now kill the
  shared context for later cases) to `dispose()`.
- Constructor guarantees a context, so `start()`'s `!this._ctx` recreate
  branch is deleted (with its spec case) and the protected
  `_createAudioContext` is removed in favor of a static shared-context
  getter with an SSR-safe support check (`typeof window`).
- No `webkitAudioContext` prefix fallback — deliberate; every supported
  browser has unprefixed `AudioContext`.

## 6. Tempo semantics

- **First-period `start` fires**: on a listener's first `track()` tick it
  receives `start(0)` (and `progress(..., isStart = true)`), instead of
  the first callback arriving only after a full period. **Behavioral**:
  spec cases asserting the first call at count 1 move to count 0.
- **Monotonic `count`**: store an incrementing `count` on the listener
  (`ITempoListener` gains an optional `count` field — additive type
  change) instead of deriving it as
  `ceil(floor(duration/ms)/period)`, which skips values for rhythm arrays
  (`every([1,2])` today counts 0, 1, 3, …) and jumps when `bpm` changes
  mid-flight.
- **`ms` setter no longer floors**: `tempo.ms = 450` currently stores
  451.13ms because bpm is floored first. **Behavioral**: `ms` is now
  preserved exactly and `bpm` may be fractional, matching
  `Tempo.fromBeat`.
- **Offset sign is a docs fix, not a code fix**: implementation keeps
  `positive offset = fires sooner`; the Animation guide's
  `progress( fn, -100 ); // activate 100ms sooner` comment is corrected
  and the `every()` docstring documents the convention. Flipping the sign
  would silently break existing sketches.
- Type the untyped params: `track(time: number)`,
  `animate(time: number, ftime: number)`; `ITempoListener.fn` becomes
  `ITempoStartFn | ITempoProgressFn`, and `track()` invokes it as a typed
  `fn.call(li, ...)` instead of building a params array for `apply` —
  `this` binding is preserved; the per-tick array allocation disappears as
  a side effect (see validation note on the bench). Remove the unreachable
  non-function branch of `_createID` (and its subclass-shim spec case).
- Kept as-is, deliberately: `stop(name)` and `every().start()` names,
  `Tempo.fromBeat` — renames are churn for a stable public API. Veto
  welcome.

## 7. Promises that settle, errors that are `Error`s

- `load()`: resolve immediately when the element's
  `readyState >= HAVE_ENOUGH_DATA`; call `element.load()` when
  `readyState === 0` (covers `preload="none"` and inert elements); attach
  `canplaythrough`/`error` with `{ once: true }`.
- `loadAsBuffer()`: rewrite on `fetch` — non-OK responses and network
  failures reject (today a network error leaves the promise pending
  forever); decode failures reject with the underlying error as `cause`.
- **Breaking — rejection values**: all rejections become `Error` objects
  (today `load` rejects with the string `"Error loading sound"`,
  `loadAsBuffer` with `"Error decoding audio"`).
- **Breaking — `Sound.input()` rejects on failure** instead of
  `console.error` + resolve(`null`). Today's contract makes every caller
  crash later on `null.analyze(...)` anyway; rejecting lets a sketch
  distinguish denied microphone permission. `guide.sound_mic` demo and the
  Sound guide gain a `.catch`.

## 8. Docs, typos, `createBuffer` visibility

- `createBuffer` becomes **public** (API change, additive): the Sound
  guide's documented replay pattern `sound.createBuffer().analyze(bins)`
  and `demo/sound.analyze.js` currently call a `protected` method, which
  does not compile for TypeScript users.
- `Play.ts` doc fixes: "Not implementated" ×2, "usefull", "different that
  _node", "setOuputNode", broken `##unction_analyze` link, duplicated
  `@param constraint`.
- Sound guide: cheatsheet `s.analyzer(256)` → `s.analyze(256)`; "multiples
  of 2" → "powers of 2" (plus an `analyze()` docstring note that non-power-
  of-2 sizes throw); "Optionaly".
- Animation guide: the offset-sign comment (item 6); the Controls snippet
  `tempo.progress( walking, 0, "robot" )` is not the API — must be
  `tempo.every(n).progress(...)`.
- `demo/sound.play.js`: remove stray `console.log`s, the empty `animate`,
  and the commented pre-current-API line.
- Regenerate docs (`pnpm docs`) after source docstring edits.

## API-change summary

| Change                                          | Kind                      |
| ----------------------------------------------- | ------------------------- |
| `Sound.volume` get/set                          | New                       |
| `Sound.dispose()`                               | New                       |
| `constructor(type, ctx?)` optional context      | Additive                  |
| `createBuffer` public                           | Additive                  |
| `ITempoListener.count` field                    | Additive (type)           |
| Rejections are `Error` objects                  | **Breaking**              |
| `Sound.input()` rejects on failure              | **Breaking**              |
| `start(timeAt)` seeks (was: delayed)            | Behavioral fix            |
| Buffer sounds replay via `start()`/`toggle()`   | Behavioral fix            |
| `progress` starts at `timeAt/duration`, ≥ 0     | Behavioral fix            |
| Shared `AudioContext` by default                | Behavioral                |
| Idle `stop()` is a no-op                        | Behavioral                |
| Tempo `start` fires at count 0                  | Behavioral                |
| Tempo `count` monotonic for rhythm arrays       | Behavioral fix            |
| `tempo.ms` setter exact (bpm may be fractional) | Behavioral                |
| Offset sign                                     | Docs only, code unchanged |

## Validation

1. Spec updates ride with each item: seek semantics and non-negative
   progress; total getters for gen/input; idempotent stop and safe reset;
   custom-wave and filter-chain restart; crossOrigin-before-src ordering;
   volume through the gain node; shared vs owned context and `dispose()`;
   Tempo count-0 start, monotonic rhythm counts, exact `ms`; already-ready
   element resolution, fetch failure/decode rejection, `input()`
   rejection. Fakes extended as needed (`createGain`, promise-form
   `decodeAudioData`, `element.load`, a `fetch` stub replacing the
   XMLHttpRequest one), and each spec resets the private shared-context
   static so a cached fake context cannot leak across tests.
2. Coverage gate: `Play.ts` at 100% statements/branches/functions/lines
   once the two dead fragments are gone; overall thresholds untouched.
3. `node --expose-gc scripts/bench.mjs --against <pre-fix sha>` — the
   `Sound` cases must be within noise. `Tempo.track` is expected to
   _improve_ (simpler count bookkeeping, no per-tick params array — a
   natural consequence of the typed call, not a perf pass); report the
   numbers, don't hide them. Browser `sound` suite re-run after the bench
   teardown switch to `dispose()`.
4. Full `pnpm check` (format, lint, typecheck, tests + coverage, docs,
   build, artifacts, browser smoke, site, package).
5. Demos touched (`sound.play`, `sound.analyze`, `guide.sound_mic`)
   verified in the served demo pages via agent-browser.

## Performance pass — **Completed 2026-08-18**

- `Tempo.track` params reuse landed with the fix pass (typed direct calls;
  ~13% faster at 64 listeners).
- `timeDomainTo`/`freqDomainTo` gained an optional trailing
  **`out?: Group`** parameter (additive API): pass the `Group` from a
  previous call and its Pts are mutated in place — truncated when trimming
  shrinks the result, extended (and unusable entries replaced) when it
  grows. The no-`out` path is unchanged in behavior.
- Measured on the recorded rig, 256 bins: reuse path **14.2 ns/bin vs
  228.8 allocating (16×)** in Node, **27.5 vs 222.8 (8×)** in Chromium;
  allocation **3.85 KB/call vs ~101 KB (−96%)**. The allocating path
  itself also sped up 10–23% from the restructured loop. Guide documents
  the pattern; `play`/`sound` bench suites gained "(reuse)" cases and both
  baselines were re-recorded.

## Deferred (feature work, not performance)

- `pause()`/`stop()` split and mic re-acquisition on restart.
- `loop`, `playbackRate`, an `ended` promise, and async `start()` that
  awaits `ctx.resume()`.
