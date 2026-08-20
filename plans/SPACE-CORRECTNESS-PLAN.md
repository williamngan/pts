# Space correctness plan

## Objective

Fix verified defects in `src/Space.ts` (`Space`, `MultiTouchSpace`) — the
animation loop and the pointer/touch/keyboard dispatch layer — following
the established tests-first sequence. `Play.ts` (Tempo/timing) is a
separate surface and is not in scope for this pass.

Findings are from a line-by-line read on 2026-08-21; the loop findings are
additionally demonstrated by the existing playback test's own call
pattern. Most of this file is browser-bound, so pins land in the browser
test project rather than numerical audit scripts.

## Confirmed defects

1. **The single-loop guard only covers `play(0)`, so explicit `play(t)`
   calls stack parallel RAF chains** — `play` re-schedules itself every
   call, but the "only one play loop" guard is `time === 0 &&
this._animID !== -1`. Any manual `play(t≠0)` (as the existing
   playback test does with `play(10)`, `play(20)`, `play(30)`) starts an
   additional chain; all chains write the shared `_animID`, so
   `stop`/`dispose` can only ever cancel the most recently scheduled
   callback — the other chains keep re-scheduling forever (each tick
   clearing the canvas and running players). Fix without changing the
   documented "override `play()`" extension point: cancel the pending
   frame before scheduling a new one (`cancelAnimationFrame` on an
   already-fired id is a spec-defined no-op), which collapses any number
   of stacked chains into exactly one.
2. **`_touchStart` never prevents default — the call is unreachable dead
   code** (`return false; evt.preventDefault(); return false;`). With
   non-passive binding (the default), touch-start is expected to block
   scrolling/mouse-emulation like `_touchMove` does. Fix: remove the dead
   code and prevent default, guarded by the passive flag (below).
3. **`_touchMove` calls `preventDefault()` even when bound passive** —
   `bindTouch(true, true)` registers passive listeners, inside which
   `preventDefault` is ignored and logs a browser error on every touch
   move. Fix: only prevent default when `!this._touchPassive` (in both
   touch handlers).
4. **`play()` returns `undefined` when a loop is already active** — the
   guard's bare `return;` breaks chaining (`space.play().bindMouse()`
   throws if called while playing) and violates the declared `: this`.
5. **Frame-time spikes on first frame and on resume** — `_time.prev`
   starts at 0, so the first frame's `ftime` is the raw RAF timestamp
   (can be minutes); and while paused the early-return skips the
   `prev` update, so the first frame after `resume()` gets the entire
   pause duration as `ftime`. Players that integrate `ftime` (physics
   worlds clamp it now, but user code generally doesn't) jump. Fix: keep
   `_time.prev = time` up to date in the paused path, and treat the first
   frame after (re)starting the loop as `diff = 0`.

## Second-review decisions (2026-08-21)

- **Loop fix shape**: keep the existing `play(0)`-while-active no-op guard
  (external `play()` stays idempotent and now returns `this`), and add
  cancel-before-schedule so `play(t≠0)` calls reuse the single chain.
  The error path and `_cancelAnimation` are unchanged.
- **First frame bypasses `minFrameTime`**: the first frame after a fresh
  start renders immediately with `ftime = 0`; the min-frame gate applies
  from the second frame on (gating a first paint would only delay
  startup). A `_firstFrame` flag arms on construction and on every full
  stop (end-time stop, error, `_cancelAnimation`).
- **`ftime = 0` on the first frame is the honest value** — fabricating a
  nominal 16 ms would misreport elapsed time; integrators receive 0 (a
  no-op step: `World.update(0)` already skips). Pinned explicitly.
- **min-frame accumulation preserved**: `_time.prev` still only advances
  when a frame is accepted — except in the paused path, where it must
  track `time` so `resume()` doesn't spike (pause/resume and min-frame
  gating don't otherwise interact).
- **Deterministic pins without RAF races**: the loop/timing pins drive
  `play(t)` manually with chosen timestamps (calls run `playItems`
  synchronously), so first-frame and resume-spike assertions don't depend
  on real frame timing; RAF-based assertions are used only for the
  chain-count and dispose-silence pins, with slack.
- The dispatch hoist reads `bound.topLeft` (no clone) instead of the
  `outerBound` getter, matching `touchesToPoints`.

## Dispatch-layer findings

6. **`_mouseAction` recomputes `outerBound` (a Bound clone) and touch
   lookups once per player per event** — hoist the position math out of
   the player loop. Two behavioral edges fixed by the same change: with
   zero players the pointer is reset to (0,0) on every event (px/py never
   computed), and the pointer should track the event position regardless
   of player count.
7. `Space.add` passes the live `this.bound` to a late-added player's
   `resize` callback while `start` callbacks receive a clone — document
   the live reference (or clone for consistency; decide at
   implementation after checking subclass callers).
8. `minFrameTime` is the only fluent-style setter returning `void` —
   return `this`.
9. `bindDoc`/`bindKeyboard` reference the bare `document` identifier —
   ReferenceError rather than graceful no-op in non-DOM environments.
   Same low-priority class as previous passes; typeof-guard.

Reviewed and verified clean: bind/unbind symmetry for mouse, touch, and
keyboard (stable bound handlers, target/passive rebind checks, idempotent
unbind); pointer capture acquire/release pairing in `_mouseDown`/`_mouseUp`;
drag/drop state machine (`_pressed`/`_dragged` transitions incl. out-drop);
`touchesToPoints` offset math; `stop(-1)`/`stop(0)` semantics; the
`playItems` error path (cancels the frame, resets state, rethrows);
`_cancelAnimation` as the dispose-time hard stop.

## Test coverage audit

- No dedicated `Space.spec`; coverage lives in the browser specs.
  Playback control is exercised (`CanvasImage.spec` "controls playback
  timing...") but asserts little — it would not catch the stacked loops
  it creates, the resume spike, or the return-value break. Pointer/touch
  dispatch has 12 `dispatchEvent` usages across browser specs; keyboard
  and passive-touch paths are untested.
- Phase 1 pins (browser project): loop singleness (drive `play(t)`
  repeatedly, assert one advancing chain via a frame-counting player, and
  that `dispose` actually silences it); `play()` chaining; `ftime`
  sanity on first frame and across pause/resume (player records `ftime`,
  assert bounded); passive vs non-passive touch (spy on `preventDefault`);
  keyboard action args (shift/alt flags); pointer tracking with zero
  players and pointer id; `minFrameTime` gating (already partially
  covered).

## Bench coverage audit

- Browser `space` suite covers player dispatch, add/removeAll, and UI hit
  testing — adequate for the loop side. The pointer-dispatch path
  (`_mouseAction` with many players) is unmeasured; add one case
  (dispatch a synthetic pointer event to a space with N action players)
  to gate finding 6's hoist. Node bench: not applicable (DOM-bound file).

## Regression analysis

- Loop fix (1): RAF-continuation calls cancel their own already-fired id
  (no-op) then reschedule — single-chain behavior preserved. Manual
  `play(t)` calls now _reuse_ the chain instead of stacking — strictly
  less work; the existing playback test's semantics are unchanged (its
  calls become idempotent). Subclass overrides of `play()` are unaffected
  (same signature and self-scheduling shape).
- Touch fixes (2, 3): behavior change only in what was broken — passive
  mode stops erroring, non-passive touch-start now actually blocks
  scrolling (the documented intent of `passive: false`). Demos use
  default non-passive binding.
- Time fixes (5): `ftime` becomes 0 on the first frame and stays
  frame-sized across resume — strictly more correct for integrators;
  `Play.ts` Tempo consumers read absolute `time`, unaffected (verify in
  phase 2 with the Play spec).
- Dispatch hoist (6): same values delivered to actions; pointer now also
  updates with zero players (previously reset to 0,0 — nothing can
  depend on that meaningfully).
- 7–9: doc/consistency; no behavior change beyond documented.

## Phases

Phase 1: browser pins above (red for 1–5 where pinnable pre-fix) + the
pointer-dispatch bench case; `pnpm bench:check`-equivalent for the browser
runner. Phase 2: fixes, full check chain, browser bench before/after
comparison for the dispatch case, node baseline untouched (no node-benched
paths). Results appended here as in prior passes.

## Results (2026-08-21)

All 9 findings implemented. 486/486 tests green — 5 new browser pins in a
dedicated `Space.spec.ts` were all red pre-fix (loop singleness +
dispose-silence, play/minFrameTime chaining, first-frame and resume ftime
bounds, passive/non-passive preventDefault, pointer tracking + keyboard
flags). Full check chain green; docs regenerated; dist rebuilt with
budgets updated.

Performance (browser space suite, same-machine before/after on the
pre-fix vs post-fix dist):

- `Space pointer-action dispatch` (new case, 64 action players):
  **751 ns → 117 ns per event (−84%)** — the per-player `outerBound`
  clone was the dominant cost of every pointer event.
- `Space player dispatch`, `add/removeAll`, UI cases: within cross-run
  noise.
- Node bench: untouched (no node-benched paths); node baseline remains
  valid. The chromium baseline was regenerated on fixed code and now
  includes the new dispatch case (45 cases).

Implementation notes:

- The loop fix preserved the `play(0)`-no-op guard and added
  cancel-before-schedule; the `_firstFrame` flag re-arms on every full
  stop (end-time, error, `_cancelAnimation`), which also makes `replay()`
  start with `ftime = 0`.
- The timing pins drive `play(t)` with manual timestamps for
  determinism — `playItems` runs synchronously inside `play`, so
  first-frame/resume assertions don't race real RAF timing.
