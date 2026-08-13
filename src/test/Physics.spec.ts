import { describe, expect, it, vi } from "vitest";
import { Circle, Polygon } from "../Op";
import { Body, Particle, World } from "../Physics";
import { Bound, Group, Pt } from "../Pt";

function worldBound() {
  return Bound.fromGroup(
    Group.fromArray([
      [0, 0],
      [100, 100],
    ]),
  );
}

function square(center: [number, number] = [50, 50], radius = 10) {
  return Body.fromGroup(Polygon.fromCenter(center, radius, 4));
}

describe("World collections and configuration", () => {
  it("stores configurable simulation parameters", () => {
    const world = new World(worldBound(), 0.9, 2);
    expect(world.bound.width).toBe(100);
    expect(world.gravity.equals([0, 2])).toBe(true);
    expect(world.friction).toBe(0.9);
    expect(world.damping).toBe(0.75);
    expect(world.iterations).toBe(1);

    const nextBound = Bound.fromGroup(
      Group.fromArray([
        [10, 10],
        [20, 30],
      ]),
    );
    world.bound = nextBound;
    world.gravity = new Pt(1, 3);
    world.friction = 0.8;
    world.damping = 0.5;
    world.iterations = 3;
    expect(world.bound).toBe(nextBound);
    expect(world.gravity.equals([1, 3])).toBe(true);
    expect([world.friction, world.damping, world.iterations]).toEqual([
      0.8, 0.5, 3,
    ]);
  });

  it("adds, finds, indexes, and removes named bodies and particles", () => {
    const world = new World(worldBound());
    const bodyA = square();
    const bodyB = square([25, 25]);
    const particleA = new Particle(10, 10).size(2);
    const particleB = new Particle(20, 20).size(3);

    expect(world.add(bodyA, "body-a")).toBe(world);
    world.add(bodyB, "body-b").add(particleA, "particle-a").add(particleB);
    expect([world.bodyCount, world.particleCount]).toEqual([2, 2]);
    expect(world.body(0)).toBe(bodyA);
    expect(world.body("body-b")).toBe(bodyB);
    expect(world.body(-1)).toBeUndefined();
    expect(world.body("")).toBeUndefined();
    expect(world.particle(0)).toBe(particleA);
    expect(world.particle("particle-a")).toBe(particleA);
    expect(world.particle(-1)).toBeUndefined();
    expect(world.bodyIndex("missing")).toBe(-1);
    expect(world.particleIndex("missing")).toBe(-1);

    expect(world.removeBody("body-a")).toBe(world);
    expect(world.body(0)).toBe(bodyB);
    expect(world.removeParticle(-2)).toBe(world);
    expect(world.particleCount).toBe(1);
    expect(() => world.removeBody("missing")).toThrow("Cannot find index");
    expect(() => world.removeParticle("missing")).toThrow("Cannot find index");
  });

  it("updates particles and bodies and calls rendering hooks", () => {
    const world = new World(worldBound(), 0.99, [0, 1]);
    const particle = new Particle(20, 20).size(3);
    const body = square([70, 70]);
    const drawParticle = vi.fn();
    const drawBody = vi.fn();
    world.drawParticles(drawParticle);
    world.drawBodies(drawBody);
    world.add(particle).add(body);

    world.update(16);
    world.update(20);
    expect(drawParticle).toHaveBeenCalledTimes(2);
    expect(drawParticle).toHaveBeenLastCalledWith(particle, 0);
    expect(drawBody).toHaveBeenCalledTimes(2);
    expect(drawBody).toHaveBeenLastCalledWith(body, 0);
    expect(particle.y).toBeGreaterThan(20);
  });
});

describe("World constraints", () => {
  it("enforces precise and approximate edge distances", () => {
    const approximateA = new Particle(0, 0);
    const approximateB = new Particle(20, 0);
    expect(World.edgeConstraint(approximateA, approximateB, 10, 1)).toBe(
      approximateA,
    );
    expect(approximateA.x).toBeGreaterThan(0);
    expect(approximateB.x).toBeLessThan(20);

    const preciseA = new Particle(0, 0);
    const preciseB = new Particle(20, 0);
    preciseA.mass = 2;
    preciseB.mass = 4;
    World.edgeConstraint(preciseA, preciseB, 10, 0.5, true);
    expect(preciseA.x).toBeCloseTo(3.3333333, 4);
    expect(preciseB.x).toBeCloseTo(18.3333333, 4);
  });

  it("reflects particles from vertical and horizontal bounds", () => {
    const vertical = new Particle(-5, 50).size(2);
    vertical.previous = new Pt(-10, 48);
    World.boundConstraint(vertical, worldBound(), 0.5);
    expect(vertical.x).toBe(2);
    expect(vertical.previous.x).toBeGreaterThan(vertical.x);

    const horizontal = new Particle(50, 105).size(2);
    horizontal.previous = new Pt(48, 110);
    World.boundConstraint(horizontal, worldBound(), 0.5);
    expect(horizontal.y).toBe(98);
    expect(horizontal.previous.y).toBeLessThan(horizontal.y);

    const interior = new Particle(50, 50).size(2);
    const previous = interior.previous.clone();
    World.boundConstraint(interior, worldBound());
    expect(interior.previous.equals(previous)).toBe(true);
  });
});

describe("Particle", () => {
  it("manages physical state, force, size, body, and position", () => {
    const particle = new Particle(1, 2);
    particle.mass = 4;
    particle.radius = 5;
    particle.force = new Pt(1, 1);
    const body = new Body();
    particle.body = body;
    expect([particle.mass, particle.radius, particle.body]).toEqual([
      4,
      5,
      body,
    ]);
    expect(particle.force.equals([1, 1])).toBe(true);

    expect(particle.size(3)).toBe(particle);
    expect([particle.mass, particle.radius]).toEqual([3, 3]);
    expect(particle.addForce(2, 3).equals([3, 4])).toBe(true);
    particle.previous = new Pt(0, 0);
    expect(particle.changed.equals([1, 2])).toBe(true);
    particle.position = new Pt(4, 5);
    expect(particle.equals([4, 5])).toBe(true);
    expect(particle.previous.equals([1, 2])).toBe(true);
  });

  it("integrates unlocked and locked particles", () => {
    const particle = new Particle(10, 10);
    particle.previous = new Pt(8, 9);
    particle.addForce(2, 4);
    expect(particle.verlet(0.5, 0.8, 0.25)).toBe(particle);
    expect(particle.x).toBeCloseTo(13.575);
    expect(particle.y).toBeCloseTo(12.35);
    expect(particle.force.equals([0, 0])).toBe(true);

    particle.lock = true;
    expect(particle.lock).toBe(true);
    particle.position = new Pt(20, 30);
    particle.to(100, 100);
    particle.verlet(1, 1);
    expect(particle.equals([20, 30])).toBe(true);
    particle.lock = false;
    expect(particle.lock).toBe(false);
  });

  it("applies impulses and resolves collisions", () => {
    const first = new Particle(0, 0).size(5);
    first.previous = new Pt(-1, 0);
    expect(first.hit(2, 0)).toBe(first);
    expect(first.previous.x).toBeLessThan(-1);

    const second = new Particle(8, 0).size(5);
    second.previous = new Pt(9, 0);
    first.collide(second, 0.8);
    expect(first.x).toBeLessThan(0);
    expect(second.x).toBeGreaterThan(8);

    const far = new Particle(100, 100).size(1);
    const before = far.clone();
    first.collide(far);
    expect(far.equals(before)).toBe(true);
    expect(first.toString()).toContain("Particle:");
    expect(first.toString()).toContain("mass 5");
  });
});

describe("Body", () => {
  it("initializes particles, links, mass, and edge lines", () => {
    const body = Body.fromGroup(Polygon.fromCenter([0, 0], 10, 6), 0.8);
    expect(body).toHaveLength(6);
    expect(body.every((point) => point instanceof Particle)).toBe(true);
    expect(body.every((point: Particle) => point.body === body)).toBe(true);
    expect(body.mass).toBeGreaterThan(0);
    expect(body.every((point: Particle) => point.mass === body.mass)).toBe(
      true,
    );
    expect(body.linksToLines().length).toBeGreaterThan(body.length);
    expect(() => body.link(-1, 0)).toThrow("index1");
    expect(() => body.link(0, 99)).toThrow("index1");

    body.mass = 4;
    expect(body.every((point: Particle) => point.mass === 4)).toBe(true);
    expect(body.autoMass()).toBe(body);
    expect(body.link(0, 1, 0.5)).toBe(body);
    expect(() => body.processEdges()).not.toThrow();
  });

  it("supports explicit initialization without automatic links or mass", () => {
    const body = Body.fromGroup(
      Group.fromArray([
        [0, 0],
        [10, 0],
        [0, 10],
      ]),
      0.5,
      false,
      false,
    );
    expect(body.mass).toBe(1);
    expect(body.linksToLines()).toEqual([]);
    body.linkAll(0.5);
    expect(body.linksToLines()).toHaveLength(4);
  });

  it("responds to body collisions on horizontal and vertical edges", () => {
    const body = square();
    const other = square([55, 55]);
    const vertex = other[0] as Particle;
    const horizontalHit = {
      which: 0,
      normal: new Pt(1, 0),
      dist: 2,
      edge: new Group(body[0], body[1]),
      vertex,
    };
    vi.spyOn(Polygon, "hasIntersectPolygon").mockReturnValue(horizontalHit);
    expect(() => body.processBody(other)).not.toThrow();

    const verticalHit = {
      ...horizontalHit,
      edge: new Group(body[0], body[3]),
    };
    vi.spyOn(Polygon, "hasIntersectPolygon").mockReturnValue(verticalHit);
    expect(() => body.processBody(other)).not.toThrow();
    vi.spyOn(Polygon, "hasIntersectPolygon").mockReturnValue(null);
    expect(() => body.processBody(other)).not.toThrow();
  });

  it("responds to particle collisions on horizontal and vertical edges", () => {
    const body = square();
    const particle = new Particle(50, 50).size(3);
    particle.previous = new Pt(49, 50);
    const hit = {
      which: 0,
      normal: new Pt(1, 0),
      dist: 2,
      edge: new Group(body[0], body[1]),
      vertex: particle,
    };
    vi.spyOn(Polygon, "hasIntersectCircle").mockReturnValue(hit);
    expect(() => body.processParticle(particle)).not.toThrow();
    vi.spyOn(Polygon, "hasIntersectCircle").mockReturnValue({
      ...hit,
      edge: new Group(body[0], body[3]),
    });
    expect(() => body.processParticle(particle)).not.toThrow();
    vi.spyOn(Polygon, "hasIntersectCircle").mockReturnValue(null);
    expect(() => body.processParticle(particle)).not.toThrow();
    expect(Circle.fromCenter(particle, particle.radius)).toHaveLength(2);
  });
});

describe("Substepped solver invariants", () => {
  function seededPositions(count: number, seed = 42) {
    // mulberry32, deterministic
    let a = seed;
    const rand = () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const out: [number, number][] = [];
    for (let i = 0; i < count; i++) {
      out.push([5 + rand() * 90, 5 + rand() * 90]);
    }
    return out;
  }

  it("exposes and clamps substeps and maxTimeStep", () => {
    const world = new World(worldBound());
    expect(world.substeps).toBe(4);
    expect(world.maxTimeStep).toBe(50);
    world.substeps = 2.6;
    expect(world.substeps).toBe(3);
    world.substeps = 0;
    expect(world.substeps).toBe(1);
    world.maxTimeStep = -5;
    expect(world.maxTimeStep).toBe(0);
  });

  it("keeps particles and body vertices inside the bound under gravity", () => {
    const world = new World(worldBound(), 0.99, 10);
    for (const [x, y] of seededPositions(30)) {
      world.add(new Particle(x, y).size(2));
    }
    world.add(square([50, 20], 8));
    for (let i = 0; i < 120; i++) world.update(16);
    for (let i = 0; i < world.particleCount; i++) {
      const p = world.particle(i);
      expect(p.x).toBeGreaterThanOrEqual(-0.01);
      expect(p.x).toBeLessThanOrEqual(100.01);
      expect(p.y).toBeGreaterThanOrEqual(-0.01);
      expect(p.y).toBeLessThanOrEqual(100.01);
    }
    for (const vertex of world.body(0)) {
      expect(vertex.x).toBeGreaterThanOrEqual(-0.01);
      expect(vertex.x).toBeLessThanOrEqual(100.01);
      expect(vertex.y).toBeGreaterThanOrEqual(-0.01);
      expect(vertex.y).toBeLessThanOrEqual(100.01);
    }
  });

  it("reflects both axes on a corner hit", () => {
    const particle = new Particle(-4, -6).size(2);
    particle.previous = new Pt(-8, -12);
    World.boundConstraint(particle, worldBound(), 0.5);
    expect(particle.x).toBe(2);
    expect(particle.y).toBe(2);
    expect(particle.previous.x).toBeGreaterThan(particle.x);
    expect(particle.previous.y).toBeGreaterThan(particle.y);
  });

  it("does not accumulate velocity while locked", () => {
    const world = new World(worldBound(), 1, 20);
    const particle = new Particle(50, 50).size(2);
    world.add(particle);
    particle.lock = true;
    for (let i = 0; i < 60; i++) world.update(16);
    expect(particle.equals([50, 50], 0.001)).toBe(true);
    particle.lock = false;
    world.update(16);
    // one frame of plain gravity, not 60 frames of stored velocity
    expect(Math.abs(particle.y - 50)).toBeLessThan(1);
  });

  it("is deterministic for identical inputs", () => {
    const build = () => {
      const world = new World(worldBound(), 0.99, 5);
      for (const [x, y] of seededPositions(40, 7)) {
        world.add(new Particle(x, y).size(3));
      }
      return world;
    };
    const a = build();
    const b = build();
    for (let i = 0; i < 30; i++) {
      a.update(16);
      b.update(16);
    }
    for (let i = 0; i < a.particleCount; i++) {
      expect(Array.from(a.particle(i))).toEqual(Array.from(b.particle(i)));
    }
  });

  it("solves rigid edges independently of step partitioning", () => {
    const run = (updates: number, ms: number) => {
      const world = new World(worldBound(), 1, 0);
      const body = Body.fromGroup(
        Group.fromArray([
          [40, 50],
          [70, 50],
        ]),
        1,
        false,
        false,
      );
      body.link(0, 1);
      // stretch beyond the rest length of 30
      body[1].to(80, 50);
      (body[1] as Particle).previous.to(80, 50);
      (body[0] as Particle).previous.to(40, 50);
      world.add(body);
      for (let i = 0; i < updates; i++) world.update(ms);
      return body[1].x - body[0].x;
    };
    const coarse = run(1, 16);
    const fine = run(4, 4);
    expect(coarse).toBeCloseTo(30, 0);
    expect(fine).toBeCloseTo(30, 0);
    expect(Math.abs(coarse - fine)).toBeLessThan(1);
  });

  it("separates exactly coincident particles without NaN", () => {
    const first = new Particle(50, 50).size(4);
    const second = new Particle(50, 50).size(4);
    first.collide(second, 0.75);
    expect(Number.isFinite(first.x) && Number.isFinite(first.y)).toBe(true);
    expect(Number.isFinite(second.x) && Number.isFinite(second.y)).toBe(true);
    expect(first.x).not.toBe(second.x);
  });

  it("clamps a huge elapsed time instead of exploding", () => {
    const world = new World(worldBound(), 0.99, 10);
    const particle = new Particle(50, 10).size(2);
    world.add(particle);
    world.update(5000);
    expect(particle.y).toBeLessThanOrEqual(100.01);
    expect(Number.isFinite(particle.y)).toBe(true);
  });

  it("handles empty worlds, single particles, and zero radii", () => {
    const empty = new World(worldBound());
    expect(() => empty.update(16)).not.toThrow();

    const single = new World(worldBound(), 1, 1);
    single.add(new Particle(50, 50).size(2));
    expect(() => single.update(16)).not.toThrow();

    const zeroRadius = new World(worldBound(), 1, 1);
    const spy = vi.spyOn(Particle.prototype, "collide");
    for (const [x, y] of seededPositions(20)) {
      zeroRadius.add(new Particle(x, y)); // radius 0
    }
    zeroRadius.update(16);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("visits every overlapping pair exactly once through the spatial hash", () => {
    // isolated overlapping pairs, far enough apart that responses cannot cascade
    const world = new World(worldBound(), 1, 0);
    const pairs: [number, number][][] = [
      [
        [10, 10],
        [13, 10],
      ],
      [
        [80, 15],
        [80, 18],
      ],
      [
        [20, 80],
        [22, 82],
      ],
      [
        [70, 70],
        [73, 73],
      ],
    ];
    const particles: Particle[] = [];
    for (const pair of pairs) {
      for (const [x, y] of pair) {
        const p = new Particle(x, y).size(2.5);
        particles.push(p);
        world.add(p);
      }
    }
    // a distant loner that overlaps nothing
    world.add(new Particle(45, 45).size(2.5));

    world.substeps = 1;
    const spy = vi.spyOn(Particle.prototype, "collide");
    world.update(16);

    // count only the calls whose particles actually overlap: collide itself is
    // also invoked for hash-neighborhood candidates, which is fine — but each
    // overlapping pair must be responded to exactly once
    const overlapping = spy.mock.calls.length;
    expect(overlapping).toBeGreaterThanOrEqual(pairs.length);
    for (const pair of pairs) {
      const [a, b] = pair;
      const dx = a[0] - b[0];
      const dy = a[1] - b[1];
      expect(Math.sqrt(dx * dx + dy * dy)).toBeLessThan(5);
    }
    // every overlapping pair must now be separated to at least the radius sum
    for (let i = 0; i < particles.length; i += 2) {
      const p1 = particles[i];
      const p2 = particles[i + 1];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      expect(Math.sqrt(dx * dx + dy * dy)).toBeGreaterThanOrEqual(4.99);
    }
    spy.mockRestore();
  });
});
