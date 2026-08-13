# Physics engine rewrite implementation plan

## Objective

Rewrite the internals of `src/Physics.ts` — integration, constraint solving,
and collision detection — to a modern substepped XPBD-style solver with a
spatial-hash broad phase, while keeping the `World` / `Particle` / `Body`
public API, the shipped demos, and the pinned behavior of the static utility
functions intact. This subsumes Tier-2 #5 (spatial hashing) and fixes the
correctness defects found in review.

## Why this shape (recap of the design discussion)

The current engine is Jakobsen-style position-based Verlet (2001). The modern
state of the art for this class — XPBD (2016) with "Small Steps" substepping
(2019) — is a direct descendant: same data model (positions + previous
positions + distance constraints), corrected math. So the smallest rewrite that
reaches the state of the art keeps the classes and replaces the solver loop.
Rigid-body-grade sequential impulses (Box2D v3) is out of scope: creative
coding needs stable, tunable, fast — not stacking fidelity. WASM/GPU are out of
scope (JS + broad phase is the 10–50×; WASM would add ~2× for a toolchain;
GPU only pays with GPU-side rendering).

## Defects in the current code this rewrite fixes

1. Body particles are bound-constrained _before_ integration
   (`_updateBodies`), so they end each frame outside the bound.
2. Corner hits in `boundConstraint` reflect only one axis (`else if`).
3. Locked particles never update `_prev`, accumulating phantom velocity
   released on unlock.
4. `_lastTime` is written after the particle pass, so bodies always integrate
   with `prevDt === dt`; the time-corrected term is dead code for them.
5. Raw frame time feeds the solver: stiffness and damping are
   framerate-dependent, and a hitch (large `ms`) explodes the simulation.
6. O(n²) particle pairs, O(b²) SAT with no broad phase, O(b·n) circle-SAT with
   no broad phase.
7. `Particle.collide` divides by zero for exactly coincident particles
   (`(dist - dr) / dist` with `dist = 0` → NaN positions).
8. ~8 `Pt` allocations per particle pair _test_ (even non-colliding), ~10 per
   edge constraint.

## Compatibility contract

What MUST NOT change (pinned by unit tests, bench cases, and demos):

- All public classes, methods, accessors, and signatures of `World`,
  `Particle`, `Body`.
- Static utility math, exactly: `World.edgeConstraint` (both precise and
  approximate forms; spec pins `x ≈ 3.3333`), `World.boundConstraint`
  single-wall reflection values (spec pins `x = 2`, `previous.x > x`),
  `Particle.verlet` time-corrected formula (spec pins `[13.575, 12.35]`),
  `Particle.hit` (impulse / √mass), `Particle.collide` direction of response.
- `update(ms)` advances the simulation by `ms` (no fixed-step accumulator —
  see review finding R1), draw callbacks fire once per `update` call with
  `(item, index)`.
- `Body.fromGroup` / `init` / `link` / `linkAll` / `linksToLines` /
  `processEdges` / `processBody` / `processParticle` behavior when called
  directly.
- `iterations` remains "constraint iterations" (now per substep), default 1.

What MAY change (documented, not pinned):

- The trajectory produced by `World.update` — a different integrator produces
  different (better) trajectories. Tests assert invariants, not paths.
- Draw callbacks now fire after the whole step completes rather than
  interleaved mid-solve (they see final, consistent positions).
- An empty or single-particle world does no pair work at all.
- Locked particles act as infinite-mass anchors inside the World solver
  (inverse mass 0) instead of being dragged and teleported back.

New public surface (additive only, no new module exports, so
`check-artifacts` stays green):

- `World.substeps` get/set — solver substeps per `update` call, default 4.
- `World.maxTimeStep` get/set — clamp on `ms` per update, default 50 (ms),
  guarding against hitch explosions.
- `Body.solveEdges(dt, iterations)` — the XPBD edge pass used by the World's
  solver (see review finding R10).

## Architecture

### Step structure

```
update(ms):
  ms = clamp(ms, 0, maxTimeStep); if ms <= 0: draw and return
  h = (ms / 1000) / substeps
  repeat substeps times:
    integrate particles (gravity, drag, Verlet with h)          — skip locked
    integrate body particles (same, fixing defect #1 ordering)
    solve bound constraint for all particles + body particles
    broad phase: rebuild spatial hash over particles
    narrow phase: particle-particle contacts from hash buckets
    for each body: iterations × XPBD edge constraints
    body-body: AABB reject, then SAT + positional response
    body-particle: AABB reject, then circle-SAT + positional response
  draw callbacks (particles, then bodies), once per update call
```

Substepping replaces solver iterations as the quality dial ("Small Steps":
many cheap substeps beat many iterations at one step, for both stability and
convergence). `iterations` stays as a within-substep knob, default 1.

Per-substep Verlet with equal steps needs no time-corrected term; the public
`Particle.verlet(dt, friction, lastDt)` keeps the corrected formula for direct
callers, and the internal integrator calls it with equal steps (the formula
degrades to plain Verlet when `lastDt === dt`).

### Spatial hash (particle broad phase)

Compact counting-sort grid, the standard Müller-style spatial hashing:

- `cellSize = 2 × rmax` where `rmax` = max particle radius, scanned O(n) per
  substep. If `rmax === 0`, skip the entire pair phase (nothing can collide).
- Table size `m` = next power of two ≥ 2n; hash
  `(cx * 0x9E3779B1) ^ (cy * 0x85EBCA77)`, masked to `m − 1`.
- Two passes over particles: count per cell into `Uint32Array(m + 1)`, prefix
  sum, then scatter particle indices into `Uint32Array(n)`. Query = for each
  particle, visit its 3×3 cell neighborhood, test candidates with `j > i` to
  process each pair once.
- All buffers live on the `World`, grown geometrically, reused every substep —
  zero steady-state allocation.
- Body particles are not hashed (bodies use AABB pre-pass; body vertex counts
  are small).

Complexity: O(n + pairs) per substep instead of O(n²).

### Contacts (particle-particle)

Scalarized version of the current `collide` math — same response model
(positional separation split equally, velocity exchange along the normal
scaled by `damping` and mass ratio, applied via `previous`) — with the
coincident-particle guard: `dist < ε` separates along a fixed axis
deterministically. `Particle.collide` remains public with identical semantics,
rewritten allocation-free; the internal pair loop calls it directly, so there
is exactly one implementation.

### Edge constraints (XPBD)

Internal solver path per substep, per iteration:

```
C  = |p2 − p1| − restLength
w  = w1 + w2            (inverse masses; locked → 0)
α̃  = compliance / h²
Δλ = −C / (w + α̃)
p1 −= Δλ · w1 · n ;  p2 += Δλ · w2 · n
```

`stiff ∈ (0, 1]` maps to `compliance = COMPLIANCE_SCALE × (1 − stiff) / stiff`
with `COMPLIANCE_SCALE = 1e-4`; `stiff = 1` → compliance 0 → rigid projection,
independent of timestep — the XPBD property the old relaxation lacked. With
`iterations > 1`, λ accumulates within the substep (stored in a per-body
`Float32Array` parallel to `_cs`, reset each substep).

`World.edgeConstraint` (static) keeps the old Jakobsen math verbatim — it is a
pinned public utility. The World's internal solver does not call it. This is a
deliberate two-path split: the static is a leaf utility with frozen semantics;
the solver path is where correctness and speed matter.

### Bodies

- `processEdges` keeps its current public behavior (Jakobsen over `_cs`).
- Internal body-body/body-particle response keeps the vertex-vs-edge positional
  split (it is the standard PBD point-edge contact), with the AABB pre-pass
  added in the World loop: per substep, compute each body's AABB (O(vertices)),
  test rectangle overlap inflated by `rmax` for particles, and only then run
  SAT. `processBody` / `processParticle` remain public and unchanged in
  behavior for direct calls.
- Body AABBs are stored in a flat `Float32Array(4 × bodies)` scratch buffer on
  the World.

### Allocation discipline

The per-substep hot paths (integrate, bound, hash, contacts, edges) perform no
allocation: scalar locals, reused typed-array buffers, in-place `Pt` writes.
`Pt`-returning conveniences remain only in public utilities. Target: World
update allocation dominated by nothing — bytes/item in the allocation profile
should drop by >90% for the particle cases.

## Files

- `src/Physics.ts` — the rewrite (single file, as today).
- `src/test/Physics.spec.ts` — keep pinned utility tests; convert trajectory
  assertions to invariants; add new tests (below).
- `bench/suites/physics.bench.mjs` — keep all existing cases untouched (A/B
  comparability); add `World.update (1024 particles)` and
  `World.update (1024 particles, no collision radius)` cases to expose the
  broad-phase win.

## New tests

1. **Hash correctness**: 200 seeded random particles; the set of colliding
   pairs found via the hash equals the brute-force O(n²) set.
2. **Bound containment**: after 120 updates with gravity, every particle and
   body vertex lies within the bound (± radius tolerance) — catches defect #1.
3. **Corner reflection**: a particle aimed at a corner reflects both axes.
4. **Lock integrity**: lock, run 60 updates, unlock, run 1 update — the
   particle must not jump (catches defect #3).
5. **Determinism**: two identical worlds stepped identically produce identical
   positions.
6. **Timestep independence**: a stiff=1 edge pair reaches the same rest length
   whether stepped 1×16ms or 4×4ms (XPBD property; tolerance-based).
7. **Coincident particles**: two particles at the same point separate to
   non-NaN positions.
8. **Hitch clamp**: `update(5000)` does not explode positions beyond the
   bound.
9. **Empty world / single particle / radius-0**: update runs, no pair work,
   no crash.
10. **substeps/maxTimeStep accessors** round-trip.

## Validation

1. `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm format:check`.
2. `pnpm bench:check` (dry-run) — all cases still feed non-zero sinks.
3. `pnpm test:browser`; load the `physics.particles` and `physics.shapes`
   demos in Chromium via agent-browser and verify motion continues without
   NaN/explosion after ~5 seconds.
4. `node --expose-gc scripts/bench.mjs --against HEAD` — gate: no regressions
   outside the physics suite; physics `World.update` cases expected to improve
   substantially; allocation profile for physics cases expected to drop >90%.
5. `pnpm check:docs` — JSDoc changes regenerate cleanly.

## Out of scope

Sleeping/islands, restitution materials, joints/motors, continuous collision
(speculative contacts), WASM backend, GPU compute, 3D. The internal layout
keeps the door open for WASM later (flat buffers, single-entry step).

## Results

Measured with `scripts/bench.mjs --against HEAD` (HEAD = post-Tier-1
`779051b`, so these deltas isolate the physics rewrite), full timing, 5
rounds: **0 slower** in the final physics suite run.

| Case                                    |  Before |   After |  Delta |
| --------------------------------------- | ------: | ------: | -----: |
| `World.update` (128 particles)          | 5.54 µs |  720 ns |   −87% |
| `World.update` (1024 particles)         | 38.1 µs | 1.28 µs |   −97% |
| `World.update` (128, radius 0)          | 5.12 µs |  100 ns |   −98% |
| `World.update` (1024, radius 0)         | 34.4 µs |  141 ns | −99.6% |
| `World.boundConstraint`                 |  594 ns |  205 ns |   −65% |
| `Particle.collide`                      |  333 ns | 24.4 ns |   −93% |
| particle field scenario (300, per item) | 14.3 µs |  705 ns |   −95% |
| `World.update` (16 bodies)              |   62 µs |  parity |      — |

Against the _original_ engine (two days ago, before Tier-1): the 128-particle
world went 94.5 µs → 0.72 µs per particle (~130×), and the 300-particle
scenario frame went 59 ms → ~0.2 ms (~280×). A 1024-particle colliding world
now steps in ~1.3 ms per frame including 4 substeps.

Allocation per item (vs the recorded baseline): 128-particle update
26.4 KB → 516 B (−98%); radius-0 update effectively zero; `Particle.verlet`
−90%; `Particle.collide` −76%. The 16-bodies case improves only 6% because its
allocation lives in `Polygon.hasIntersectPolygon` (Op.ts SAT) — a follow-up
target, untouched here for behavior compatibility.

### Regression found by the gate, and the fix

The first full A/B flagged `World.update (16 bodies)` at +214%: an overlapping
body pair stays overlapped across substeps (the response is a partial
correction), so the expensive full SAT re-ran every substep — 4× the old
engine's narrow-phase work by construction. Fix: body _contacts_ resolve once
per update (final substep, matching the old engine's contact frequency), while
integration, bound, and XPBD edges stay per-substep. The case returned to
parity; particle contacts remain per-substep (they are nearly free through the
hash and separate fully in one response).

Validation beyond the suites: `physics.particles` and `physics.shapes` demos
run stable in Chromium (shapes hold form, contacts rest, no NaN); docs
regenerated; artifact size pins updated for the intentional +1.7 KB
(source) / +439 B (minified) growth.

---

## Review findings (second pass)

Working the design through the pinned tests and the substep math surfaced
twelve issues; each is folded into the implementation.

- **R1 — No fixed-step accumulator, and that is deliberate.** An accumulator
  changes `update(ms)` semantics (a 16 ms call against a 16.67 ms step would
  advance zero steps — breaking the bench fixtures and every demo's feel).
  Substeps of `ms / n` + the `maxTimeStep` clamp + XPBD's h²-normalized
  compliance give hitch-safety and timestep-independent stiffness without
  changing what `update(ms)` means. Strict determinism remains available by
  calling `update` with a constant `ms`.
- **R2 — Full SoA is impossible here, and the plan should not pretend
  otherwise.** `Particle extends Pt extends Float32Array`: the particle IS its
  own position storage, and `p[0]` cannot be redirected to a World-owned
  buffer. Flat typed arrays are used where they can be — hash tables, body
  AABBs, λ accumulators — and every hot loop is scalarized; particle state
  stays in the objects.
- **R3 — Friction must be substep-adjusted.** Applying `friction` per substep
  compounds it (`f⁴` per frame at 4 substeps). The World computes
  `friction^(1/substeps)` once per update; per-frame drag matches the old
  engine.
- **R4 — Force lifecycle is the subtle one.** `verlet()` clears `_force` after
  integrating. If the internal integrator called it per substep, a user's
  `addForce` before `update` would act for 1/n of the frame; and gravity would
  need re-adding every substep anyway. Resolution: the internal integrator
  reads `force + gravity` as the substep acceleration _without clearing_, and
  the World clears all forces once at the end of `update`. Constant forces
  integrate correctly across substeps; per-frame `addForce` patterns behave as
  before; `Particle.verlet` itself is untouched (its clearing behavior is
  public, pinned semantics).
- **R5 — The static `boundConstraint` can be generalized, not forked.**
  Rewriting its wall response per-axis (compute the clamp per axis, reflect
  the damped velocity on each axis that hit) reproduces the spec-pinned
  single-wall values exactly while fixing the corner bug — so the static and
  the internal fast path keep one behavior, and the internal path just skips
  `Geom.boundingBox` by reading the world bound directly.
- **R6 — `Particle.collide` rewrite must be algebraically identical.**
  Reformulating with a normalized normal (`f·dp` → `(f·dist)·n`) gives the
  same response to floating-point reassociation and makes the coincident-
  particle guard natural: substitute a unit x-axis normal and `−dr/2`
  separation. One further observable nuance: the old code _replaced_ the
  `previous` Pt; the rewrite mutates it in place. No API or test observes the
  identity.
- **R7 — Hash-collision dedup.** Two of the nine neighbor cells can hash to
  the same bucket, which would fire `collide` twice for one pair in one
  substep (double impulse). The query loop must skip buckets whose key already
  appeared among that particle's visited keys (≤ 9 comparisons, cheap).
- **R8 — `Math.imul` for the hash**, since `cx * 0x9E3779B1` overflows the
  53-bit integer range for large coordinates, and `Math.floor` (not `| 0`) for
  cell coordinates, since truncation rounds toward zero and would merge cells
  −1 and 0. NaN positions degrade to cell 0 without crashing.
- **R9 — Protected hooks survive.** `integrate(p, dt, prevDt?)`,
  `_updateParticles(dt)`, `_updateBodies(dt)` keep their names and signatures
  and are called per substep, so subclass overrides still hook the solver.
  `prevDt` becomes vestigial (equal substeps) and is documented as such.
  A subclass that calls `addForce` inside `integrate` now accumulates across
  substeps within one update (documented; rare pattern).
- **R10 — Body solve order stays collisions-then-edges** (matching the old
  engine): integrate + bound all bodies, resolve body-body and body-particle
  contacts, then run the XPBD edge pass so the shape is restored last. The
  XPBD edge solve is a new public `Body.solveEdges(dt, iterations)` — Body's
  `_cs` is protected, so the World cannot reach it otherwise; `processEdges`
  keeps the old Jakobsen behavior for direct callers.
- **R11 — Per-substep SAT is self-limiting.** Body SAT now runs up to
  `substeps` times per update, but only for AABB-overlapping pairs, and a
  resolved overlap stops passing the AABB test in later substeps. The old
  engine ran full SAT on _every_ pair and circle-SAT on every body×particle
  combination unconditionally, so this still nets far fewer narrow-phase
  calls.
- **R12 — First-step gravity kick halves; steady state is identical.** The
  old single-step Verlet gives `a·dt²` on the first frame from rest (double
  the physical ½·a·dt²); substepping converges to the correct value. Per-frame
  velocity gain is `a·dt` in both, so trajectories beyond the first frames
  match. Noted as an accepted feel change, invisible in practice.
