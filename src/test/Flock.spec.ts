import { describe, expect, it } from "vitest";
import { Boid, Create, Flock } from "../Create";
import { Num } from "../Num";
import { Bound, Group, Pt } from "../Pt";
import type { FlockBoundary, FlockOptions } from "../Types";

function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a * 16807) % 2147483647;
    return a / 2147483647;
  };
}

function bound(x0: number, y0: number, x1: number, y1: number): Bound {
  return Bound.fromGroup(
    Group.fromArray([
      [x0, y0],
      [x1, y1],
    ]),
  );
}

/** A flock of `count` agents at seeded random positions and headings. */
function makeFlock(
  count: number,
  seed: number,
  area: [number, number, number, number],
  options: FlockOptions = {},
): Flock {
  const r = rng(seed);
  const pts = new Group();
  for (let i = 0; i < count; i++) {
    pts.push(
      new Pt(
        area[0] + r() * (area[2] - area[0]),
        area[1] + r() * (area[3] - area[1]),
      ),
    );
  }
  Num.seed(`flock-${seed}`);
  return Create.flock(pts, options);
}

/**
 * A plain O(n²) implementation of one step, written from the documented rules:
 * every pair within `perception` contributes to cohesion and alignment, pairs
 * within `separation` repel by inverse-square distance (coincident agents split
 * along x), the three behaviors are blended as unit directions, one steer toward
 * that direction is clamped to `maxForce`, the boundary turn is added, and
 * velocity and position are integrated and clamped. The Flock computes the same
 * thing through a spatial hash and per-pair symmetry, so the two must agree.
 */
function referenceStep(
  flock: Flock,
  ms: number,
): { pos: number[][]; vel: number[][] } {
  const n = flock.length;
  const dt = Math.min(ms, flock.maxTimeStep) / 1000;
  const pos = [...flock].map((b) => [b[0], b[1]]);
  const vel = [...flock].map((b) => {
    const v = (b as Boid).velocity;
    return v ? [v[0], v[1]] : [0, 0];
  });
  if (n === 0 || !(dt > 0)) return { pos, vel };

  const r2 = flock.perception * flock.perception;
  const sep = Math.min(flock.separation, flock.perception);
  const sep2 = sep * sep;
  const minSep2 = sep * 0.01 * (sep * 0.01);
  const sumPos = pos.map(() => [0, 0]);
  const sumVel = pos.map(() => [0, 0]);
  const sumSep = pos.map(() => [0, 0]);
  const count = new Array<number>(n).fill(0);
  if (n > 1 && flock.perception > 0) {
    for (let i = 0; i < n; i++) {
      if (!Number.isFinite(pos[i][0]) || !Number.isFinite(pos[i][1])) continue;
      for (let j = i + 1; j < n; j++) {
        const dx = pos[j][0] - pos[i][0];
        const dy = pos[j][1] - pos[i][1];
        const d2 = dx * dx + dy * dy;
        if (!(d2 < r2)) continue;
        sumPos[i][0] += pos[j][0];
        sumPos[i][1] += pos[j][1];
        sumPos[j][0] += pos[i][0];
        sumPos[j][1] += pos[i][1];
        sumVel[i][0] += vel[j][0];
        sumVel[i][1] += vel[j][1];
        sumVel[j][0] += vel[i][0];
        sumVel[j][1] += vel[i][1];
        count[i]++;
        count[j]++;
        if (d2 < sep2) {
          let ox = dx;
          let oy = dy;
          let dd = d2;
          if (dd === 0) {
            ox = 1;
            oy = 0;
            dd = minSep2;
          } else if (dd < minSep2) {
            dd = minSep2;
          }
          sumSep[i][0] -= ox / dd;
          sumSep[i][1] -= oy / dd;
          sumSep[j][0] += ox / dd;
          sumSep[j][1] += oy / dd;
        }
      }
    }
  }

  const unit = (out: number[], dx: number, dy: number, w: number) => {
    const m2 = dx * dx + dy * dy;
    if (m2 <= 0) return;
    const s = w / Math.sqrt(m2);
    out[0] += dx * s;
    out[1] += dy * s;
  };
  const maxSpeed = flock.maxSpeed;
  const maxForce = flock.maxForce;
  const minSpeed = Math.min(flock.minSpeed, maxSpeed);
  const b = flock.bound;
  const boundary: FlockBoundary = b ? flock.boundary : "none";
  const minX = b ? Math.min(b[0][0], b[1][0]) : 0;
  const minY = b ? Math.min(b[0][1], b[1][1]) : 0;
  const maxX = b ? Math.max(b[0][0], b[1][0]) : 0;
  const maxY = b ? Math.max(b[0][1], b[1][1]) : 0;
  const margin = flock.margin;

  for (let i = 0; i < n; i++) {
    let [px, py] = pos[i];
    let [vx, vy] = vel[i];
    const out = [0, 0];
    if (count[i] > 0) {
      if (flock.cohesionWeight !== 0) {
        unit(
          out,
          sumPos[i][0] / count[i] - px,
          sumPos[i][1] / count[i] - py,
          flock.cohesionWeight,
        );
      }
      if (flock.alignWeight !== 0) {
        unit(out, sumVel[i][0], sumVel[i][1], flock.alignWeight);
      }
      if (flock.separateWeight !== 0) {
        unit(out, sumSep[i][0], sumSep[i][1], flock.separateWeight);
      }
    }
    let ax = 0;
    let ay = 0;
    const dm2 = out[0] * out[0] + out[1] * out[1];
    if (dm2 > 0) {
      const sc = maxSpeed / Math.sqrt(dm2);
      ax = out[0] * sc - vx;
      ay = out[1] * sc - vy;
      const f2 = ax * ax + ay * ay;
      if (f2 > maxForce * maxForce) {
        const fs = maxForce / Math.sqrt(f2);
        ax *= fs;
        ay *= fs;
      }
    }
    if (boundary === "steer" && margin > 0) {
      const dl = px - minX;
      const dr = maxX - px;
      const dtp = py - minY;
      const db = maxY - py;
      if (dl < margin) ax += maxForce * (1 - Math.max(dl, 0) / margin);
      else if (dr < margin) ax -= maxForce * (1 - Math.max(dr, 0) / margin);
      if (dtp < margin) ay += maxForce * (1 - Math.max(dtp, 0) / margin);
      else if (db < margin) ay -= maxForce * (1 - Math.max(db, 0) / margin);
    }
    vx += ax * dt;
    vy += ay * dt;
    const sp2 = vx * vx + vy * vy;
    if (sp2 > maxSpeed * maxSpeed) {
      const sc = maxSpeed / Math.sqrt(sp2);
      vx *= sc;
      vy *= sc;
    } else if (minSpeed > 0 && sp2 < minSpeed * minSpeed) {
      if (sp2 > 0) {
        const sc = minSpeed / Math.sqrt(sp2);
        vx *= sc;
        vy *= sc;
      } else {
        vx = minSpeed;
        vy = 0;
      }
    }
    px += vx * dt;
    py += vy * dt;
    if (boundary === "wrap") {
      const w = maxX - minX;
      const h = maxY - minY;
      if (w > 0) {
        if (px < minX) px = maxX - ((minX - px) % w);
        else if (px > maxX) px = minX + ((px - maxX) % w);
      }
      if (h > 0) {
        if (py < minY) py = maxY - ((minY - py) % h);
        else if (py > maxY) py = minY + ((py - maxY) % h);
      }
    } else if (boundary === "bounce") {
      if (px <= minX) {
        px = minX;
        if (vx < 0) vx = -vx;
      } else if (px >= maxX) {
        px = maxX;
        if (vx > 0) vx = -vx;
      }
      if (py <= minY) {
        py = minY;
        if (vy < 0) vy = -vy;
      } else if (py >= maxY) {
        py = maxY;
        if (vy > 0) vy = -vy;
      }
    }
    pos[i] = [px, py];
    vel[i] = [vx, vy];
  }
  return { pos, vel };
}

/** Step the flock `steps` times, checking every step against the reference. */
function expectMatchesReference(flock: Flock, ms: number, steps: number) {
  for (let s = 0; s < steps; s++) {
    const expected = referenceStep(flock, ms);
    flock.step(ms);
    let worst = 0;
    for (let i = 0; i < flock.length; i++) {
      const b = flock[i] as Boid;
      if (!Number.isFinite(expected.pos[i][0])) continue;
      worst = Math.max(
        worst,
        Math.abs(b[0] - expected.pos[i][0]),
        Math.abs(b[1] - expected.pos[i][1]),
        Math.abs(b.velocity[0] - expected.vel[i][0]),
        Math.abs(b.velocity[1] - expected.vel[i][1]),
      );
    }
    // the Flock accumulates in Float32; a missed or doubled neighbor pair moves
    // a velocity by far more than this
    expect(worst).toBeLessThan(0.02);
  }
}

describe("Flock construction and options", () => {
  it("creates Boids from positions with seeded random headings", () => {
    const pts = Group.fromArray([
      [10, 10],
      [20, 20],
      [30, 30],
    ]);
    Num.seed("flock-headings");
    const a = Create.flock(pts, { maxSpeed: 80 });
    Num.seed("flock-headings");
    const b = Create.flock(pts, { maxSpeed: 80 });
    expect(a).toBeInstanceOf(Flock);
    expect(a).toHaveLength(3);
    for (let i = 0; i < 3; i++) {
      const boid = a[i] as Boid;
      expect(boid).toBeInstanceOf(Boid);
      expect(boid).not.toBe(pts[i]); // a new Pt, the input is untouched
      expect(boid.equals(pts[i])).toBe(true);
      expect(boid.speed).toBeCloseTo(40, 4); // initialSpeed defaults to half of maxSpeed
      expect(boid.velocity.equals((b[i] as Boid).velocity)).toBe(true);
    }
    expect((a[0] as Boid).velocity.equals((a[1] as Boid).velocity)).toBe(false);
  });

  it("adds agents with explicit velocities or as existing Boids", () => {
    const flock = new Flock();
    flock.addBoid([5, 5], [3, 4]);
    const own = new Boid(1, 1);
    own.velocity = new Pt(-1, 0);
    flock.addBoid(own);
    flock.setup({ initialSpeed: 7 });
    flock.addBoid(new Pt(2, 2));
    expect(flock).toHaveLength(3);
    expect((flock[0] as Boid).speed).toBe(5);
    expect(flock[1]).toBe(own);
    expect(own.velocity[0]).toBe(-1); // an added Boid keeps its velocity
    expect((flock[2] as Boid).speed).toBeCloseTo(7, 4);
    expect(flock.initialSpeed).toBe(7);
  });

  it("applies every option through setup and clamps radii to non-negative", () => {
    const b = bound(0, 0, 100, 50);
    const options: Required<FlockOptions> = {
      perception: 33,
      separation: 12,
      cohesionWeight: 0.5,
      alignWeight: 0.25,
      separateWeight: 2,
      maxSpeed: 77,
      minSpeed: 11,
      maxForce: 123,
      bound: b,
      boundary: "wrap",
      margin: 9,
      maxTimeStep: 40,
      initialSpeed: 3,
    };
    const flock = new Flock().setup(options);
    for (const key of Object.keys(options) as (keyof FlockOptions)[]) {
      expect(flock[key]).toBe(options[key]);
    }
    // partial setup keeps the rest
    flock.setup({ maxSpeed: 10 });
    expect(flock.maxSpeed).toBe(10);
    expect(flock.perception).toBe(33);

    flock.perception = -1;
    flock.separation = -1;
    flock.maxSpeed = -1;
    flock.minSpeed = -1;
    flock.margin = -1;
    flock.maxTimeStep = -1;
    expect([
      flock.perception,
      flock.separation,
      flock.maxSpeed,
      flock.minSpeed,
      flock.margin,
      flock.maxTimeStep,
    ]).toEqual([0, 0, 0, 0, 0, 0]);
    flock.cohesionWeight = 2;
    flock.alignWeight = 3;
    flock.separateWeight = 4;
    flock.maxForce = 5;
    flock.boundary = "bounce";
    flock.bound = null;
    flock.initialSpeed = 6;
    expect(flock.initialSpeed).toBe(6);
    expect([
      flock.cohesionWeight,
      flock.alignWeight,
      flock.separateWeight,
      flock.maxForce,
      flock.boundary,
      flock.bound,
    ]).toEqual([2, 3, 4, 5, "bounce", null]);
  });

  it("reports speed and heading, with a stationary heading of 0", () => {
    const b = new Boid(0, 0);
    expect(b.speed).toBe(0);
    expect(b.heading).toBe(0);
    b.velocity = new Pt(0, 2);
    expect(b.speed).toBe(2);
    expect(b.heading).toBeCloseTo(Math.PI / 2, 6);
  });
});

describe("Flock stepping", () => {
  it("ignores empty flocks and non-positive or NaN times, and clamps long steps", () => {
    const flock = new Flock();
    expect(flock.step(16)).toBe(flock);
    flock.addBoid([0, 0], [100, 0]);
    for (const ms of [0, -5, NaN]) {
      flock.step(ms);
      expect(flock[0][0]).toBe(0);
    }
    flock.step(1000); // clamped to maxTimeStep (50 ms)
    expect(flock[0][0]).toBeCloseTo(5, 4);
    flock.maxTimeStep = 0;
    flock.step(16);
    expect(flock[0][0]).toBeCloseTo(5, 4);
  });

  it("flies a lone agent straight and clamps its speed", () => {
    const flock = new Flock().setup({ maxSpeed: 100 });
    flock.addBoid([0, 0], [30, 40]);
    flock.step(100); // clamped to the 50 ms maxTimeStep
    expect(flock[0][0]).toBeCloseTo(1.5, 4);
    expect(flock[0][1]).toBeCloseTo(2, 4);
    expect((flock[0] as Boid).speed).toBeCloseTo(50, 4);

    flock.addBoid([500, 500], [300, 400]); // far away, not a neighbor
    flock.step(10);
    expect((flock[1] as Boid).speed).toBeCloseTo(100, 3);
    expect((flock[1] as Boid).heading).toBeCloseTo(Math.atan2(4, 3), 5);
  });

  it("enforces a minimum speed and gives a dead stop a heading", () => {
    const flock = new Flock().setup({ minSpeed: 10, maxSpeed: 100 });
    flock.addBoid([0, 0], [0.3, 0.4]);
    flock.addBoid([500, 500], [0, 0]);
    flock.step(16);
    expect((flock[0] as Boid).speed).toBeCloseTo(10, 4);
    expect((flock[0] as Boid).heading).toBeCloseTo(Math.atan2(0.4, 0.3), 5);
    expect((flock[1] as Boid).velocity.equals([10, 0])).toBe(true);
  });

  it("steers agents toward, away from, and along their neighbors", () => {
    const distance = (f: Flock) => f[0].$subtract(f[1]).magnitude();

    // cohesion only: two visible agents approach each other
    const cohere = new Flock().setup({
      perception: 40,
      alignWeight: 0,
      separateWeight: 0,
    });
    cohere.addBoid([0, 0], [0, 0]);
    cohere.addBoid([30, 0], [0, 0]);
    for (let i = 0; i < 20; i++) cohere.step(16);
    expect(distance(cohere)).toBeLessThan(30);

    // separation only: two close agents move apart
    const separate = new Flock().setup({
      cohesionWeight: 0,
      alignWeight: 0,
    });
    separate.addBoid([0, 0], [0, 0]);
    separate.addBoid([5, 0], [0, 0]);
    for (let i = 0; i < 20; i++) separate.step(16);
    expect(distance(separate)).toBeGreaterThan(5);
    expect((separate[0] as Boid).velocity[0]).toBeLessThan(0);
    expect((separate[1] as Boid).velocity[0]).toBeGreaterThan(0);

    // alignment only: headings converge
    const align = new Flock().setup({
      cohesionWeight: 0,
      separateWeight: 0,
      maxSpeed: 100,
    });
    align.addBoid([0, 0], [100, 0]);
    align.addBoid([0, 10], [0, 100]);
    const before = Math.abs(
      (align[0] as Boid).heading - (align[1] as Boid).heading,
    );
    for (let i = 0; i < 10; i++) align.step(16);
    const after = Math.abs(
      (align[0] as Boid).heading - (align[1] as Boid).heading,
    );
    expect(after).toBeLessThan(before);

    // coincident agents split along x instead of staying fused
    const fused = new Flock().setup({ cohesionWeight: 0, alignWeight: 0 });
    fused.addBoid([50, 50], [0, 0]);
    fused.addBoid([50, 50], [0, 0]);
    fused.step(16);
    expect(fused[0][0]).toBeLessThan(50);
    expect(fused[1][0]).toBeGreaterThan(50);
    expect(fused[0][1]).toBe(50);
  });

  it("does not interact through a zero perception or a zero force", () => {
    const blind = new Flock().setup({ perception: 0 });
    blind.addBoid([0, 0], [10, 0]);
    blind.addBoid([1, 0], [-10, 0]);
    blind.step(100); // clamped to 50 ms
    expect(blind[0][0]).toBeCloseTo(0.5, 4);
    expect(blind[1][0]).toBeCloseTo(0.5, 4);

    const stiff = new Flock().setup({ maxForce: 0 });
    stiff.addBoid([0, 0], [10, 0]);
    stiff.addBoid([1, 0], [-10, 0]);
    stiff.step(100);
    expect((stiff[0] as Boid).velocity.equals([10, 0])).toBe(true);
  });

  it("upgrades plain Pts pushed into the flock and skips non-finite agents", () => {
    const flock = new Flock().setup({ perception: 10 });
    flock.push(new Pt(5, 5));
    flock.addBoid([NaN, NaN], [1, 1]);
    flock.addBoid([1000, 1000], [10, 0]);
    expect(() => flock.step(16)).not.toThrow();
    expect(flock[0]).toBeInstanceOf(Boid);
    expect((flock[0] as Boid).velocity.equals([0, 0])).toBe(true);
    expect(Number.isNaN(flock[1][0])).toBe(true);
    expect(flock[2][0]).toBeCloseTo(1000.16, 3);

    // an agent with a non-finite position influences nobody
    const seeded = () => {
      const f = makeFlock(40, 12, [0, 0, 100, 100], { perception: 30 });
      return f;
    };
    const clean = seeded();
    const tainted = seeded();
    tainted.addBoid([Infinity, 0], [5, 5]);
    tainted.addBoid([50, NaN], [5, 5]);
    for (let i = 0; i < 5; i++) {
      clean.step(16);
      tainted.step(16);
    }
    for (let i = 0; i < clean.length; i++) {
      expect(tainted[i].equals(clean[i], 1e-4)).toBe(true);
    }
  });

  it("keeps a steering flock inside its bound", () => {
    const b = bound(0, 0, 400, 300);
    const flock = makeFlock(60, 3, [0, 0, 400, 300], {
      bound: b,
      boundary: "steer",
      margin: 40,
      maxSpeed: 120,
      minSpeed: 40,
    });
    for (let i = 0; i < 400; i++) flock.step(16);
    for (const boid of flock) {
      expect(boid[0]).toBeGreaterThan(-40);
      expect(boid[0]).toBeLessThan(440);
      expect(boid[1]).toBeGreaterThan(-40);
      expect(boid[1]).toBeLessThan(340);
      expect((boid as Boid).speed).toBeGreaterThanOrEqual(40 - 1e-3);
      expect((boid as Boid).speed).toBeLessThanOrEqual(120 + 1e-3);
    }
  });

  it("wraps, bounces, or leaves at the bound as configured", () => {
    const b = bound(0, 0, 100, 100);
    const wrap = new Flock().setup({
      bound: b,
      boundary: "wrap",
      maxSpeed: 1000,
      perception: 0,
    });
    wrap.addBoid([99, 50], [1000, 0]);
    wrap.addBoid([50, 1], [0, -1000]);
    wrap.step(10);
    expect(wrap[0][0]).toBeCloseTo(9, 3);
    expect(wrap[1][1]).toBeCloseTo(91, 3);

    const bounce = new Flock().setup({
      bound: b,
      boundary: "bounce",
      maxSpeed: 1000,
      perception: 0,
    });
    bounce.addBoid([99, 50], [1000, 0]);
    bounce.addBoid([50, 100], [0, 1000]); // exactly on the wall, heading out
    bounce.step(10);
    expect(bounce[0][0]).toBe(100);
    expect((bounce[0] as Boid).velocity[0]).toBe(-1000);
    expect(bounce[1][1]).toBe(100);
    expect((bounce[1] as Boid).velocity[1]).toBe(-1000);

    const none = new Flock().setup({
      bound: b,
      boundary: "none",
      maxSpeed: 1000,
      perception: 0,
    });
    none.addBoid([99, 50], [1000, 0]);
    none.step(10);
    expect(none[0][0]).toBeCloseTo(109, 3);

    const unbounded = new Flock().setup({
      boundary: "bounce",
      maxSpeed: 1000,
      perception: 0,
    });
    unbounded.addBoid([99, 50], [1000, 0]);
    unbounded.step(10);
    expect(unbounded[0][0]).toBeCloseTo(109, 3);
  });

  it("is deterministic for a seed", () => {
    const run = () => {
      const f = makeFlock(80, 21, [0, 0, 300, 300], {
        bound: bound(0, 0, 300, 300),
      });
      for (let i = 0; i < 30; i++) f.step(16);
      return [...f].map((b) => [b[0], b[1]]);
    };
    expect(run()).toEqual(run());
  });
});

describe("Flock neighbor search", () => {
  it("matches a brute-force step on a random flock", () => {
    const flock = makeFlock(250, 7, [0, 0, 600, 400], {
      bound: bound(0, 0, 600, 400),
      boundary: "steer",
      perception: 40,
      separation: 20,
      maxSpeed: 120,
    });
    expectMatchesReference(flock, 16, 4);
    expectMatchesReference(flock, 50, 3);
  });

  it("matches when many cells share hash buckets", () => {
    // 300 agents over a 120x120-cell area hash into 1024 buckets, so
    // neighboring cells collide constantly
    const flock = makeFlock(300, 8, [0, 0, 3000, 3000], {
      perception: 25,
      separation: 12,
      maxSpeed: 90,
    });
    expectMatchesReference(flock, 16, 4);
  });

  it("matches on a dense cluster with coincident agents and a bouncing bound", () => {
    const flock = makeFlock(200, 9, [40, 40, 70, 70], {
      bound: bound(0, 0, 110, 110),
      boundary: "bounce",
      perception: 30,
      separation: 25,
      separateWeight: 2,
      maxSpeed: 150,
      minSpeed: 20,
    });
    // five coincident pairs
    for (let i = 0; i < 5; i++) {
      const p = flock[i * 7];
      flock.addBoid([p[0], p[1]], [0, 0]);
    }
    expectMatchesReference(flock, 40, 5);
  });

  it("matches across a wrapping bound and after the flock grows", () => {
    const flock = makeFlock(30, 10, [0, 0, 200, 200], {
      bound: bound(0, 0, 200, 200),
      boundary: "wrap",
      perception: 50,
      maxSpeed: 400,
      minSpeed: 300,
    });
    expectMatchesReference(flock, 30, 3);
    // growth past the initial buffers
    const r = rng(99);
    for (let i = 0; i < 150; i++) {
      flock.addBoid([r() * 200, r() * 200], [r() * 100, r() * 100]);
    }
    expectMatchesReference(flock, 30, 3);
  });
});
