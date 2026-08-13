/**
 * `World`, `Particle` and `Body`.
 *
 * All cases integrate with a constant 16ms timestep. Feeding real elapsed time
 * would make the workload depend on how fast the machine is, which corrupts the
 * measurement.
 *
 * The solver resolves particle collisions through a spatial hash, so update
 * cost scales near-linearly with particle count; the 1024-particle cases
 * exist to keep that property measured. The scenario suite measures a
 * realistic frame.
 */

import { SIZES } from "../lib/fixtures.mjs";
import { sink } from "../lib/sink.mjs";
import { defineSuite } from "../lib/suite.mjs";

const DT = 16;
const PARTICLES = 128;
const BODY_POINTS = 8;
const BODIES = 16;

export default defineSuite("physics", (b, { Pts, fx }) => {
  const { World, Particle, Body, Group, Pt } = Pts;

  const makeWorld = (label, particleCount, radius = 4) => {
    const world = new World(fx.bound(600, 400), 0.99, 1);
    const positions = fx.ptLikes(label, particleCount, 2, 20, 380);
    for (const position of positions) {
      const particle = new Particle(position);
      particle.radius = radius;
      world.add(particle);
    }
    return world;
  };

  b.case(`World.update (${PARTICLES} particles)`, {
    batch: PARTICLES,
    // a World accumulates particle state, so build a fresh one per iteration
    setup: () => makeWorld("physics:world", PARTICLES),
    run: (world) => {
      world.update(DT);
      sink(world.particle(0)[0]);
    },
  });

  b.case(`World.update (${PARTICLES} particles, no collision radius)`, {
    batch: PARTICLES,
    setup: () => makeWorld("physics:world:nr", PARTICLES, 0),
    run: (world) => {
      world.update(DT);
      sink(world.particle(0)[0]);
    },
  });

  b.case(`World.update (${BODIES} bodies)`, {
    batch: BODIES * BODY_POINTS,
    setup: () => {
      const world = new World(fx.bound(600, 400), 0.99, 1);
      for (let i = 0; i < BODIES; i++) {
        world.add(
          Body.fromGroup(fx.polygon(`physics:body:${i}`, BODY_POINTS, 20), 1),
        );
      }
      return world;
    },
    run: (world) => {
      world.update(DT);
      sink(world.body(0)[0][0]);
    },
  });

  b.case("World.update (1024 particles)", {
    batch: 1024,
    setup: () => makeWorld("physics:world:1k", 1024),
    run: (world) => {
      world.update(DT);
      sink(world.particle(0)[0]);
    },
  });

  b.case("World.update (1024 particles, no collision radius)", {
    batch: 1024,
    setup: () => makeWorld("physics:world:1k:nr", 1024, 0),
    run: (world) => {
      world.update(DT);
      sink(world.particle(0)[0]);
    },
  });

  b.case("World.add / removeParticle", {
    batch: SIZES.S,
    setupOnce: () => fx.ptLikes("physics:add", SIZES.S, 2, 0, 300),
    setup: (positions) => ({
      world: new World(fx.bound(600, 400), 1, 0),
      positions,
    }),
    run: ({ world, positions }) => {
      for (let i = 0; i < SIZES.S; i++) world.add(new Particle(positions[i]));
      const count = world.particleCount;
      world.removeParticle(0, SIZES.S);
      sink(count);
    },
  });

  // -------------------------------------------------------------- Particle

  b.case("Particle.verlet", {
    batch: SIZES.M,
    setup: () =>
      fx
        .ptLikes("physics:verlet", SIZES.M, 2, 0, 300)
        .map((p) => new Particle(p)),
    run: (particles) => {
      let acc = 0;
      for (let i = 0; i < SIZES.M; i++) {
        particles[i].addForce(0, 1);
        acc += particles[i].verlet(DT / 1000, 0.99)[0];
      }
      sink(acc);
    },
  });

  b.case("Particle.collide", {
    batch: SIZES.M,
    setup: () => {
      const particles = fx
        .ptLikes("physics:collide", SIZES.M + 1, 2, 0, 40)
        .map((p) => {
          const particle = new Particle(p);
          particle.radius = 6;
          return particle;
        });
      return particles;
    },
    run: (particles) => {
      let acc = 0;
      for (let i = 0; i < SIZES.M; i++) {
        particles[i].collide(particles[i + 1], 0.75);
        acc += particles[i][0];
      }
      sink(acc);
    },
  });

  b.case("Particle.hit", {
    batch: SIZES.M,
    setup: () =>
      fx.ptLikes("physics:hit", SIZES.M, 2, 0, 300).map((p) => new Particle(p)),
    run: (particles) => {
      let acc = 0;
      for (let i = 0; i < SIZES.M; i++) acc += particles[i].hit(0.5, 0.5)[0];
      sink(acc);
    },
  });

  b.case("World.edgeConstraint", {
    batch: SIZES.M,
    setup: () =>
      fx
        .ptLikes("physics:edge", SIZES.M + 1, 2, 0, 300)
        .map((p) => new Particle(p)),
    run: (particles) => {
      let acc = 0;
      for (let i = 0; i < SIZES.M; i++) {
        acc += World.edgeConstraint(particles[i], particles[i + 1], 20, 1)[0];
      }
      sink(acc);
    },
  });

  b.case("World.boundConstraint", {
    batch: SIZES.M,
    setupOnce: () =>
      Group.fromArray([
        [0, 0],
        [300, 300],
      ]),
    setup: (rect) => ({
      particles: fx
        .ptLikes("physics:bound", SIZES.M, 2, -50, 350)
        .map((p) => new Particle(p)),
      rect,
    }),
    run: ({ particles, rect }) => {
      let acc = 0;
      for (let i = 0; i < SIZES.M; i++) {
        World.boundConstraint(particles[i], rect, 0.75);
        acc += particles[i][0];
      }
      sink(acc);
    },
  });

  // ------------------------------------------------------------------ Body

  b.case("Body.fromGroup (auto-linked)", {
    batch: SIZES.S,
    setupOnce: () => fx.polygons("physics:fromGroup", SIZES.S, BODY_POINTS, 20),
    run: (polys) => {
      let acc = 0;
      for (let i = 0; i < SIZES.S; i++)
        acc += Body.fromGroup(polys[i], 1)[0][0];
      sink(acc);
    },
  });

  b.case("Body.processEdges", {
    batch: SIZES.S * BODY_POINTS,
    setup: () => {
      const bodies = new Array(SIZES.S);
      for (let i = 0; i < SIZES.S; i++) {
        bodies[i] = Body.fromGroup(
          fx.polygon(`physics:edges:${i}`, BODY_POINTS, 20),
          1,
        );
      }
      return bodies;
    },
    run: (bodies) => {
      let acc = 0;
      for (let i = 0; i < SIZES.S; i++) {
        bodies[i].processEdges();
        acc += bodies[i][0][0];
      }
      sink(acc);
    },
  });

  b.case("Body.processBody", {
    batch: SIZES.S,
    setup: () => {
      const pairs = new Array(SIZES.S);
      for (let i = 0; i < SIZES.S; i++) {
        pairs[i] = [
          Body.fromGroup(fx.polygon(`physics:pb:a:${i}`, 4, 20), 1),
          Body.fromGroup(fx.polygon(`physics:pb:b:${i}`, 4, 20), 1),
        ];
      }
      return pairs;
    },
    run: (pairs) => {
      let acc = 0;
      for (let i = 0; i < SIZES.S; i++) {
        pairs[i][0].processBody(pairs[i][1]);
        acc += pairs[i][0][0][0];
      }
      sink(acc);
    },
  });

  b.case("Body.processParticle", {
    batch: SIZES.S,
    setup: () => {
      const pairs = new Array(SIZES.S);
      for (let i = 0; i < SIZES.S; i++) {
        const particle = new Particle(new Pt(0, 0));
        particle.radius = 5;
        pairs[i] = [
          Body.fromGroup(fx.polygon(`physics:pp:${i}`, 4, 20), 1),
          particle,
        ];
      }
      return pairs;
    },
    run: (pairs) => {
      let acc = 0;
      for (let i = 0; i < SIZES.S; i++) {
        pairs[i][0].processParticle(pairs[i][1]);
        acc += pairs[i][0][0][0];
      }
      sink(acc);
    },
  });

  b.case("Body.linksToLines", {
    batch: SIZES.S * BODY_POINTS,
    setupOnce: () => {
      const bodies = new Array(SIZES.S);
      for (let i = 0; i < SIZES.S; i++) {
        bodies[i] = Body.fromGroup(
          fx.polygon(`physics:links:${i}`, BODY_POINTS, 20),
          1,
        );
      }
      return bodies;
    },
    run: (bodies) => {
      let acc = 0;
      for (let i = 0; i < SIZES.S; i++) acc += bodies[i].linksToLines().length;
      sink(acc);
    },
  });
});
