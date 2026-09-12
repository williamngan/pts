/**
 * Frame-shaped macro workloads.
 *
 * Micro numbers guide optimization; these say whether users benefit. Each case
 * mirrors one frame of a realistic sketch, and each is more stable than any
 * single nanobenchmark because the timed region is milliseconds rather than
 * nanoseconds.
 *
 * `batch` is the number of items the frame processes, so `per item` stays
 * comparable with the micro suites.
 */

import { SIZES } from "../lib/fixtures.mjs";
import { sink } from "../lib/sink.mjs";
import { defineSuite } from "../lib/suite.mjs";

const DT = 16;
const PARTICLES = 300;
const MESH_POINTS = 500;
const PATH_POINTS = 200;
const CURVE_STEPS = 20;
const COLLIDERS = 100;
const GRADIENT_STOPS = 2000;
const FIELD_POINTS = SIZES.L;

export default defineSuite("scenarios", (b, { Pts, fx }) => {
  const { World, Particle, Create, Polygon, Curve, Color, Geom, Group, Pt } =
    Pts;

  b.case(`particle field frame (${PARTICLES} particles)`, {
    batch: PARTICLES,
    setup: () => {
      const world = new World(fx.bound(800, 600), 0.99, 1);
      for (const position of fx.ptLikes(
        "scenario:particles",
        PARTICLES,
        2,
        20,
        580,
      )) {
        const particle = new Particle(position);
        particle.radius = 5;
        world.add(particle);
      }
      return world;
    },
    run: (world) => {
      world.update(DT);
      sink(world.particle(0)[0]);
    },
  });

  b.case(`delaunay + voronoi (${MESH_POINTS} points)`, {
    batch: MESH_POINTS,
    setupOnce: () => fx.group("scenario:mesh", MESH_POINTS, 2, 0, 800),
    setup: (source) => Create.delaunay(source),
    run: (delaunay) => {
      delaunay.delaunay();
      sink(delaunay.voronoi().length);
    },
  });

  b.case(`curve smoothing (${PATH_POINTS} points x ${CURVE_STEPS} steps)`, {
    batch: PATH_POINTS * CURVE_STEPS,
    setupOnce: () => fx.group("scenario:path", PATH_POINTS, 2, 0, 800),
    run: (path) => {
      sink(Curve.catmullRom(path, CURVE_STEPS).length);
    },
  });

  b.case(`polygon collision sweep (${COLLIDERS} polygons)`, {
    batch: (COLLIDERS * (COLLIDERS - 1)) / 2,
    setupOnce: () => fx.polygons("scenario:colliders", COLLIDERS, 6, 60),
    run: (polys) => {
      let hits = 0;
      for (let i = 0; i < COLLIDERS; i++) {
        for (let k = i + 1; k < COLLIDERS; k++) {
          if (Polygon.hasIntersectPolygon(polys[i], polys[k])) hits += 1;
        }
      }
      sink(hits + 1);
    },
  });

  b.case(`colour gradient sweep (${GRADIENT_STOPS} stops)`, {
    batch: GRADIENT_STOPS,
    setupOnce: () => ({
      from: Color.lch(30, 60, 20),
      to: Color.lch(90, 40, 300),
    }),
    run: ({ from, to }) => {
      let acc = 0;
      for (let i = 0; i < GRADIENT_STOPS; i++) {
        const t = i / GRADIENT_STOPS;
        const stop = Color.lch(
          from[0] + (to[0] - from[0]) * t,
          from[1] + (to[1] - from[1]) * t,
          from[2] + (to[2] - from[2]) * t,
        );
        acc += Color.LCHtoRGB(stop).toString("hex").length;
      }
      sink(acc);
    },
  });

  b.case(`transform pipeline (${FIELD_POINTS} points)`, {
    batch: FIELD_POINTS,
    setupOnce: () =>
      fx.restorable(fx.group("scenario:field", FIELD_POINTS, 2, 0, 800)),
    setup: (shared) => shared.reset(),
    run: (field) => {
      field.rotate2D(0.01, [400, 300]);
      field.scale(1.001, [400, 300]);
      sink(Geom.boundingBox(field)[1][0]);
    },
  });

  b.case(`grid + noise field (${FIELD_POINTS} points)`, {
    batch: FIELD_POINTS,
    setupOnce: () => fx.bound(800, 600),
    run: (bound) => {
      const grid = Create.gridPts(bound, 64, 64);
      sink(Create.noisePts(grid, 0.02, 0.05).length);
    },
  });

  b.case(`nearest-point query (${SIZES.M} probes)`, {
    batch: SIZES.M,
    setupOnce: () => ({
      poly: fx.polygon("scenario:nearest:poly", 64, 300),
      probes: fx.pts("scenario:nearest:probes", SIZES.M, 2, -400, 400),
    }),
    run: ({ poly, probes }) => {
      let acc = 0;
      for (let i = 0; i < SIZES.M; i++)
        acc += Polygon.nearestPt(poly, probes[i]);
      sink(acc);
    },
  });

  // Keep unused imports honest.
  if (!Group || !Pt) throw new Error("Pts exports are missing");
});
