# UI correctness plan

## Objective

Fix verified defects in `src/UI.ts` (UI, UIButton, UIDragger) following
the established tests-first sequence. UI is pure logic over the Op hit
tests (no DOM), so everything here was verified in Node against `dist/`
on 2026-08-21 and pins land in the node test project.

## Confirmed defects (verified)

1. **`off()` invalidates every later handler id** — `on()` returns the
   array index and `_removeHandler` splices, shifting all subsequent
   handlers down. Verified: register A then B, `off(A)`, then `off(B)`
   with B's id — B still fires (its id now pointed at A's old slot).
   This also silently corrupts the built-in machinery: `UIButton`'s
   `_hoverID` and `UIDragger`'s `_draggingID` go stale the moment a user
   removes any earlier handler of the same type. Fix: null the slot
   instead of splicing — `_trigger` already guards `if (fns[i])`,
   strongly suggesting null-slot semantics were the original intent; ids
   stay stable forever.
2. **`"all"` handlers never fire on their own** — `listen()` requires
   `_actions[type]` to exist before it ever reaches the `"all"` branch,
   so a UI with only an `"all"` handler triggers nothing (verified: 0
   fires where the doc — "listen for all regardless of trigger" —
   promises 2). Even when the specific type is registered, `"all"` fires
   only in the not-within fallback. Fix: trigger `"all"` handlers for
   every listened event, in addition to (not instead of) the type's own
   handlers; return true if either fired.
3. **Hover `leave` events deliver the stale enter position** — the
   leave-watcher closure passes the `pt`/`evt` captured at enter time,
   not the current move's point (verified: leave at (500,500) reports
   (10,10)). Fix: the inner watcher receives `(t, p, type, evt)` — pass
   the current values through.
4. **`toString()` prints function source** — `` `UI ${this.group.toString}` ``
   is missing its call: emits `"UI toString() {...}"`. Fix: call it.
5. **`UI.fromUI` shares the states object** when `states` is omitted —
   `states || ui._states` passes the same reference, so setting a state
   on the copy mutates the original (verified). The group is _not_
   shared (the constructor copies via `Group.fromArray`). Fix: shallow-
   copy the source states (`{ ...ui._states }`) — sharing state between
   "a new UI based on another" is never what the doc implies.

## Robustness and documentation gaps

6. **`UIShape.line` / `polyline` are silently dead** — `_within` returns
   false for them, so such UIs never trigger anything. Either implement a
   distance-threshold hit test (`Line.distanceFromPt < threshold`) or
   warn-once + document; decide at implementation (lean: implement, with
   a `threshold` state read from `_states.lineThreshold ?? 5`, keeping
   the shape constants honest).
7. **`off(type)` with no id removes built-in machinery** — e.g.
   `off("up")` deletes `UIButton`'s internal click counter and
   `UIDragger`'s end-drag handling along with user handlers. Document
   the hazard on `off`/`offClick`-family (removing "all handlers of a
   type" includes internal ones by design).
8. **Double-enter can stack leave-watchers** — if `state("hover")` is
   externally reset while inside, the next move adds a second watcher
   and orphans the first's id. With null-slot ids (fix 1) this becomes
   benign (both watchers fire once, then remove themselves); note it in
   the hover test.

Reviewed and verified clean: hold/unhold bookkeeping and its use for
drag-outside tracking; `UIDragger`'s down→uidrag→uidrop state machine
(including click-without-move firing no `uidrop`, and `moved`/`dragging`
state resets); `endDrag` on up/drop/out with hold-gating preventing
spurious end events; offset computation against `group[0]`; the
`UIButton` click counter; `state()` getter/setter semantics for falsy
values; `fromRectangle`/`fromCircle`/`fromPolygon` shape dispatch into
the (previously hardened) Op hit tests.

## Performance

9. **`listen()` allocates on every call** —
   `Array.from(this._holds.values()).indexOf(type)` builds an array per
   tracked UI per pointer event; `UI.track` multiplies it by the UI
   count. Fix: iterate the Map's values directly (no allocation), or
   keep a small held-type count map. Gated by the existing browser
   `UI.track (hit testing)` bench case (512 probes over widget sets) and
   the space suite's hover-dispatch case.
10. `hold()`'s `Math.max(0, ...Array.from(keys))` allocation is
    fine (infrequent, only on down/enter) — no change.

## Test and bench coverage audit

- `UI.spec.ts` (8 tests) covers construction, state, on/off basics, and
  shape hit dispatch — but **none of** `"all"`, `enter`/`leave`,
  `uidrag`/`uidrop`: the entire hover and drag machinery is unpinned
  (which is how defects 1–3 survived). Browser specs exercise
  `UI.track` via space dispatch only incidentally.
- Phase 1 pins (node): handler-id stability across removals (defect 1);
  `"all"`-only and `"all"`-plus-type dispatch (2); enter/leave sequence
  with correct leave position (3); `toString` (4); `fromUI` state
  isolation (5); a full dragger scenario driven by `listen()` calls
  (down → moves inside and outside → drop: uidrag count, uidrop once,
  click-without-move fires no uidrop); line-shape behavior per the
  decision in 6.
- Bench: browser `UI.track (hit testing)`, `UIButton hover dispatch`,
  and `UI.fromPolygon hit testing` already measure the hot paths —
  adequate; before/after comparison for fix 9 uses the dist-swap
  technique from the Space pass. Node bench: not applicable today (UI
  cases live in the browser suite, where pointer events are real).

## Regression analysis

- Null-slot handler removal (1): `off` semantics for valid ids are
  unchanged; arrays no longer shrink, but handler counts per UI are
  small and slots are reused only by never — acceptable (a UI's handler
  array grows by total registrations over its life; hover/drag internals
  add and remove the same one repeatedly, so cap growth by reusing the
  first null slot in `_addHandler`).
- `"all"` fix (2): UIs registering both a type and `"all"` now receive
  both calls where before they received one or none — matches the
  documented contract; the existing 8 tests don't pin the old behavior
  (verified by the coverage grep).
- Leave-position fix (3): strictly corrective; enter behavior unchanged.
- `fromUI` copy (5): mutation no longer leaks to the source — only
  breaks callers depending on the leak.
- `listen` de-allocation (9): behavior identical; measured.

## API modernization (approved 2026-08-21)

All additive; the module is still marked experimental, so this is the
window to land them. Items 7–8 from the API discussion (composition over
inheritance, auto-drag) are explicitly deferred as future directions.

- **`space.track(ui)` / `space.untrack(ui)`** on `MultiTouchSpace`: a
  lazily-created hidden player that forwards every `action` dispatch to
  `UI.track` over the tracked list — removes the per-sketch wiring
  boilerplate. No import cycle: `Space.ts` already imports from `UI.ts`.
- **`on(type, fn, options?)`** accepts `{ once, signal }` — `once`
  self-removes after the first call; an `AbortSignal` unsubscribes on
  abort (already-aborted signals register nothing), matching DOM
  `addEventListener` and composing with framework cleanup.
- **Shape registry**: `UI.registerShape(name, fn)` with
  `fn(group, pt, states)`; the built-in rectangle/circle/polygon tests
  move into the registry, and line/polyline get a real hit test
  (`Line.distanceFromPt <= states.lineThreshold ?? 5`, polyline over
  consecutive segments) — closing gap 6 via the extension point.
- **Typed events**: `on`/`off`/`listen` take
  `UIPointerAction | (string & {})` — completion for built-ins, custom
  strings still allowed.
- **System handler channel** (gap 7 resolved as code, not docs): the
  built-in UIButton/UIDragger machinery registers on an internal channel
  with its own ids; public `off(type)` can no longer lobotomize a button.
- **`getState<T>(key)` / `setState(key, value): this`** — typed, and
  `setState` can store `undefined`; `state()` kept as-is for compat.

Implementation decisions:

- Handler ids: null-slot removal **with first-null reuse** in
  `_addHandler` — hover/drag internals register and remove the same
  handler every cycle, so no-reuse would grow the array unboundedly in
  normal use. The tradeoff (a double-`off` with a stale id could hit a
  reused slot) is documented on `off`.
- `"all"` semantics: fires for **every** event delivered to `listen`,
  regardless of position and independent of other handlers — the literal
  reading of its doc.
- `space.track` forwards keyboard actions too (x/y carry the shift/alt
  flags, as `Space` dispatches them) — documented.

## Phases

Phase 1: node pins above (red for 1–5) + any line-shape pins per the
decision. Phase 2: fixes, full check chain, browser bench before/after
(UI cases) via dist-swap, chromium baseline regenerated if any UI case
moves beyond noise, results appended here.

## Results (2026-08-21)

All correctness fixes (1–5), gaps 6–8, perf item 9, and the six approved
API modernization items implemented. 497/497 tests green — 9 new node
pins and 1 browser pin were red pre-fix; 3 existing pins that encoded
bugs or superseded behavior were corrected ("all"-only-when-outside, the
dead line shape, and the type-vs-all dispatch ordering, now pinned as
type-first-then-observers).

New API surface: `MultiTouchSpace.track`/`untrack`; `UI.on(type, fn,
{ once, signal })`; `UI.registerShape`; typed `UIPointerAction` unions on
`on`/`off`/`listen`; the internal system handler channel (public
`off(type)` can no longer remove built-in machinery); `getState<T>` /
`setState`. Line and polyline shapes hit-test via `Line.distanceFromPt`
with `states.lineThreshold ?? 5`.

Performance (browser bench, dist-swap before/after, same machine):

| Case                    | Before  | After  | Delta |
| ----------------------- | ------- | ------ | ----- |
| UI.track (hit testing)  | 2.96 µs | 964 ns | −67%  |
| UIButton hover dispatch | 105 ns  | 68 ns  | −35%  |
| UI.fromPolygon hit test | 88 ns   | 81 ns  | noise |
| Space dispatch cases    | —       | —      | noise |

The `listen()` allocation removal (`Array.from` per call → allocation-free
Map iteration) accounts for the wins. Chromium baseline regenerated on
fixed code. Node bench: no node-benched paths changed.

Implementation notes:

- Dispatch order pinned as: system handlers, then user type handlers,
  then `"all"` observers.
- The dragger's `uidrag` events now carry the current move event rather
  than the captured down event (same fix family as hover leave).
- The `space.track` forwarding player is created lazily once and stays
  registered; `untrack()` with no arguments clears the tracked list.
